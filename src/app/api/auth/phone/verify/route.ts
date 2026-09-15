import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { phoneVerifySchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import {
  isValidPhone,
  normalizePhone,
  verifyOtpCode,
  OTP_MAX_ATTEMPTS,
} from "@/lib/otp";

const FREE_CREDITS = 100;

export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = phoneVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid phone number and 6-digit code" }, { status: 400 });
    }

    const phone = normalizePhone(parsed.data.phone);
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number with country code" }, { status: 400 });
    }

    const otp = await prisma.otpCode.findFirst({
      where: { identifier: phone, purpose: "phone_verify" },
      orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Code expired. Request a new one." },
        { status: 401 }
      );
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.otpCode.delete({ where: { id: otp.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Too many attempts. Request a new code." },
        { status: 429 }
      );
    }

    if (!verifyOtpCode(parsed.data.code, otp.codeHash)) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Invalid code. Try again." },
        { status: 401 }
      );
    }

    await prisma.otpCode.deleteMany({
      where: { identifier: phone, purpose: "phone_verify" },
    });

    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { phone } });
      if (existing) {
        if (existing.role === "disabled") {
          throw new Error("ACCOUNT_DISABLED");
        }
        if (!existing.email && !existing.name) {
          existing.name = `User ${phone.slice(-4)}`;
        }
        return tx.user.update({
          where: { id: existing.id },
          data: { phoneVerified: true, name: existing.name ?? `User ${phone.slice(-4)}` },
        });
      }

      const created = await tx.user.create({
        data: {
          phone,
          phoneVerified: true,
          name: `User ${phone.slice(-4)}`,
          passwordHash: null,
          email: `user${phone.replace(/\D/g, "")}@phone.veyra.app`,
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
    console.error("[auth/phone/verify] error:", error);
    return NextResponse.json({ error: "Could not verify the code" }, { status: 500 });
  }
}
