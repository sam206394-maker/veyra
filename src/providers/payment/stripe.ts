import Stripe from "stripe";
import type {
  PaymentProvider,
  CheckoutInput,
  CheckoutOutput,
  WebhookResult,
  SubscriptionInfo,
} from "./types";

const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  creator: process.env.STRIPE_PRICE_CREATOR,
  pro: process.env.STRIPE_PRICE_PRO,
};

export class StripePaymentProvider implements PaymentProvider {
  name = "stripe";
  private client: Stripe;
  private webhookSecret: string;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    this.client = new Stripe(key);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutOutput> {
    const priceId = PLAN_PRICE_MAP[input.planName];
    if (!priceId)
      throw new Error(`No Stripe price configured for plan: ${input.planName}`);

    const session = await this.client.checkout.sessions.create({
      mode: "subscription",
      customer_email: input.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: input.userId, planName: input.planName },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    });

    return {
      checkoutUrl: session.url!,
      providerReferenceId: session.id,
    };
  }

  async handleWebhook(
    body: unknown,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookResult> {
    if (!this.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not set");
    }

    const sig = Array.isArray(headers["stripe-signature"])
      ? headers["stripe-signature"][0]
      : headers["stripe-signature"];
    if (!sig) throw new Error("Missing stripe-signature header");

    const event = this.client.webhooks.constructEvent(
      body as string | Buffer,
      sig,
      this.webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          event: "checkout.completed",
          status: "succeeded",
          provider: "stripe",
          referenceId: session.subscription as string,
          customerId: session.customer as string,
          metadata: {
            userId: session.metadata?.userId,
            planName: session.metadata?.planName,
          },
        };
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          event: "subscription.updated",
          status: sub.status === "active" ? "succeeded" : "failed",
          provider: "stripe",
          referenceId: sub.id,
          customerId: sub.customer as string,
          metadata: { planName: sub.metadata?.planName },
        };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return {
          event: "subscription.canceled",
          status: "canceled",
          provider: "stripe",
          referenceId: sub.id,
        };
      }
      default:
        return { event: "unknown", status: "unknown", provider: "stripe" };
    }
  }

  async getSubscription(
    providerSubscriptionId: string
  ): Promise<SubscriptionInfo> {
    const sub = await this.client.subscriptions.retrieve(
      providerSubscriptionId
    );
    return {
      status: sub.status,
      currentPeriodEnd: new Date((sub as unknown as Record<string, number>).current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  }

  async cancelSubscription(
    providerSubscriptionId: string
  ): Promise<{ success: boolean }> {
    await this.client.subscriptions.cancel(providerSubscriptionId);
    return { success: true };
  }
}
