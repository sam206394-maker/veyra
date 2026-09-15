import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const generation = await prisma.generation.findFirst({
    where: { id, userId: session.id },
    include: { assets: true },
  });
  if (!generation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ generation });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const generation = await prisma.generation.findFirst({
    where: { id, userId: session.id },
  });
  if (!generation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.asset.deleteMany({ where: { generationId: id } });
  await prisma.generation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
