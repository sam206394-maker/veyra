import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { phoneSendOtpSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { getSmsProvider, isDemoMode } from "@/providers/auth";
import {
  generateOtpCode,
  hashOtpCode,
  isValidPhone,
  normalizePhone,
  OTP_TTL_MS,
} from "@/lib/otp";

export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = phoneSendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
    }

    const phone = normalizePhone(parsed.data.phone);
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number with country code" }, { status: 400 });
    }

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);
    const provider = getSmsProvider();

    const delivery = await provider.sendOtp({ phone, code });

    await prisma.$transaction([
      prisma.otpCode.deleteMany({ where: { identifier: phone, purpose: "phone_verify" } }),
      prisma.otpCode.create({
        data: {
          identifier: phone,
          purpose: "phone_verify",
          codeHash,
          expiresAt: new Date(Date.now() + OTP_TTL_MS),
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      // Demo only: surface the mock code so the flow can be tested for free.
      ...(isDemoMode() && delivery.deliveredInBand
        ? { demoCode: code, demo: true }
        : {}),
    });
  } catch (error) {
    console.error("[auth/phone/send-otp] error:", error);
    return NextResponse.json({ error: "Could not send the code. Try again." }, { status: 500 });
  }
}
