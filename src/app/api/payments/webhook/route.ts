import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/providers/payment";
import { addCredits } from "@/lib/credits";

const PLAN_CREDITS: Record<string, number> = {
  starter: parseInt(process.env.CREDITS_STARTER || "500"),
  creator: parseInt(process.env.CREDITS_CREATOR || "2000"),
  pro: parseInt(process.env.CREDITS_PRO || "10000"),
};

export async function POST(request: NextRequest) {
  try {
    const provider = getPaymentProvider();
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });

    const body = await request.text();
    const result = await provider.handleWebhook(body, headers);

    if (result.event === "ignore" || result.event === "unknown") {
      return NextResponse.json({ received: true });
    }

    if (result.event === "checkout.completed" && result.metadata?.userId) {
      // Deduplicate
      const existingSub = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: result.referenceId || "",
        },
      });

      if (!existingSub) {
        const planName = result.metadata.planName || "starter";

        await prisma.subscription.create({
          data: {
            userId: result.metadata.userId,
            planName,
            status: "active",
            stripeCustomerId: result.customerId || null,
            stripeSubscriptionId: result.referenceId || null,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        await addCredits(
          result.metadata.userId,
          PLAN_CREDITS[planName] || 500,
          "subscription_topup",
          result.referenceId || "",
          `${planName} plan credits`
        );

        await prisma.payment.updateMany({
          where: {
            userId: result.metadata.userId,
            status: "pending",
          },
          data: { status: "succeeded" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
