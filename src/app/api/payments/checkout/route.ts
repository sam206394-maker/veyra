import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/providers/payment";

const PLAN_CREDITS: Record<string, number> = {
  starter: parseInt(process.env.CREDITS_STARTER || "500"),
  creator: parseInt(process.env.CREDITS_CREATOR || "2000"),
  pro: parseInt(process.env.CREDITS_PRO || "10000"),
};

const PLAN_PRICES: Record<string, number> = {
  starter: parseInt(process.env.PRICE_STARTER_CENTS || "999"),
  creator: parseInt(process.env.PRICE_CREATOR_CENTS || "1999"),
  pro: parseInt(process.env.PRICE_PRO_CENTS || "4999"),
};

export async function POST(request: NextRequest) {
  const session = await requireAuth().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planName } = await request.json();
  if (!planName || !PLAN_CREDITS[planName]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const provider = getPaymentProvider();

  try {
    const checkout = await provider.createCheckout({
      userId: session.id,
      email: session.email,
      planName,
      amountCents: PLAN_PRICES[planName],
    });

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: session.id,
        amountCents: PLAN_PRICES[planName],
        description: `${planName} plan subscription`,
        status: "pending",
        providerMetadata: JSON.stringify({
          provider: provider.name,
          referenceId: checkout.providerReferenceId,
        }),
      },
    });

    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      referenceId: checkout.providerReferenceId,
    });
  } catch (error) {
    console.error("[checkout] error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
