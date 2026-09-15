import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generationCreateSchema } from "@/lib/validations";
import { calculateCreditCost, deductCredits } from "@/lib/credits";
import { getAIProvider } from "@/providers/ai";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await requireAuth().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const type = url.searchParams.get("type");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = { userId: session.id };
  if (type && type !== "all") where.type = type;
  if (search) where.prompt = { contains: search };

  const [generations, total] = await Promise.all([
    prisma.generation.findMany({
      where,
      include: { assets: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.generation.count({ where }),
  ]);

  return NextResponse.json({ generations, total });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(request);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = generationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const cost = calculateCreditCost(data.type, data.quality || "standard", data.count || 1, data.duration);

  const balance = await prisma.user.findUnique({
    where: { id: session.id },
    select: { credits: true },
  });
  if (!balance || balance.credits < cost) {
    return NextResponse.json(
      { error: "Insufficient credits", required: cost, available: balance?.credits ?? 0 },
      { status: 402 }
    );
  }

  // Verify project ownership if provided
  if (data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId: session.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  // Create generation record
  const generation = await prisma.generation.create({
    data: {
      type: data.type,
      prompt: data.prompt,
      negativePrompt: data.negativePrompt,
      aspectRatio: data.aspectRatio,
      quality: data.quality || "standard",
      duration: data.duration,
      stylePreset: data.stylePreset,
      status: "processing",
      userId: session.id,
      projectId: data.projectId || null,
      creditsUsed: cost,
    },
  });

  // Deduct credits
  const deduction = await deductCredits(
    session.id,
    cost,
    "generation",
    generation.id,
    `Generated ${data.type}`
  );

  if (!deduction.success) {
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "failed", errorMessage: deduction.error },
    });
    return NextResponse.json({ error: deduction.error }, { status: 500 });
  }

  // Run AI generation
  try {
    const provider = getAIProvider();
    let assets: Array<{ url: string; width?: number; height?: number }> = [];

    switch (data.type) {
      case "text-to-image": {
        const result = await provider.generateImage({
          prompt: data.prompt,
          negativePrompt: data.negativePrompt || undefined,
          aspectRatio: data.aspectRatio || undefined,
          quality: data.quality || undefined,
          stylePreset: data.stylePreset || undefined,
          count: data.count || 1,
        });
        assets = result.images;
        break;
      }
      case "image-to-image": {
        const result = await provider.generateImage({
          prompt: data.prompt,
          negativePrompt: data.negativePrompt || undefined,
          aspectRatio: data.aspectRatio || undefined,
          quality: data.quality || undefined,
          stylePreset: data.stylePreset || undefined,
          count: data.count || 1,
        });
        assets = result.images;
        break;
      }
      case "text-to-video": {
        const result = await provider.generateVideo({
          prompt: data.prompt,
          negativePrompt: data.negativePrompt || undefined,
          duration: data.duration,
          quality: data.quality || undefined,
          stylePreset: data.stylePreset || undefined,
          count: data.count || 1,
        });
        assets = result.videos.map((v) => ({ url: v.url, width: v.width, height: v.height }));
        break;
      }
      case "image-to-video": {
        const result = await provider.imageToVideo({
          imageUrl: data.prompt, // mock accepts prompt as image ref
          prompt: data.prompt,
          duration: data.duration,
          quality: data.quality || undefined,
        });
        assets = result.videos.map((v) => ({ url: v.url, width: v.width, height: v.height }));
        break;
      }
    }

    // Create asset records
    if (assets.length > 0) {
      await prisma.asset.createMany({
        data: assets.map((a) => ({
          generationId: generation.id,
          userId: session.id,
          url: a.url,
          type: data.type.includes("video") ? "video" : "image",
          width: a.width,
          height: a.height,
        })),
      });
    }

    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "completed" },
    });

    const updatedGeneration = await prisma.generation.findUnique({
      where: { id: generation.id },
      include: { assets: true },
    });

    const userCredits = await prisma.user.findUnique({
      where: { id: session.id },
      select: { credits: true },
    });

    return NextResponse.json({
      generation: updatedGeneration,
      remainingCredits: userCredits?.credits ?? 0,
    });
  } catch (error) {
    console.error("[generation] error:", error);
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "failed", errorMessage: "Generation failed" },
    });
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
