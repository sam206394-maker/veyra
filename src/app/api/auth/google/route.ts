import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { googleAuthSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getGoogleAuthProvider, isMockGoogleToken, isDemoMode } from "@/providers/auth";

const FREE_CREDITS = 100;

export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = googleAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid Google credential" }, { status: 400 });
    }

    const { credential } = parsed.data;
    const provider = getGoogleAuthProvider();
    const mockToken = isMockGoogleToken(credential);

    if (mockToken && !isDemoMode()) {
      return NextResponse.json({ error: "Invalid Google credential" }, { status: 401 });
    }
    if (!mockToken && provider.name === "mock-google") {
      return NextResponse.json(
        { error: "Google sign-in is not configured on this server" },
        { status: 501 }
      );
    }

    const payload = await provider.verifyIdToken(credential);

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];

    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: { OR: [{ googleId: payload.sub }, { email }] },
      });

      if (existing) {
        if (existing.role === "disabled") {
          throw new Error("ACCOUNT_DISABLED");
        }
        return tx.user.update({
          where: { id: existing.id },
          data: {
            googleId: existing.googleId ?? payload.sub,
            email,
            name: existing.name ?? name,
            avatar: existing.avatar ?? payload.picture ?? null,
            emailVerified: existing.emailVerified ?? new Date(),
          },
        });
      }

      const created = await tx.user.create({
        data: {
          email,
          name,
          passwordHash: null,
          googleId: payload.sub,
          avatar: payload.picture ?? null,
          emailVerified: payload.email_verified ? new Date() : null,
          credits: FREE_CREDITS,
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: created.id,
          amount: FREE_CREDITS,
          type: "signup_bonus",
          description: "Welcome credits",
        },
      });

      return created;
    });

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ACCOUNT_DISABLED") {
      return NextResponse.json({ error: "This account has been disabled" }, { status: 403 });
    }
    console.error("[auth/google] error:", error);
    return NextResponse.json({ error: "Google sign-in failed" }, { status: 401 });
  }
}
