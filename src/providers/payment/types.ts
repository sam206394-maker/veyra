export interface CheckoutInput {
  userId: string;
  email: string;
  planName: string; // starter | creator | pro
  amountCents: number;
}

export interface CheckoutOutput {
  checkoutUrl: string;
  providerReferenceId: string;
}

export interface SubscriptionInfo {
  status: string;
  planName?: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentProvider {
  name: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutOutput>;
  handleWebhook(
    body: unknown,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookResult>;
  getSubscription(providerSubscriptionId: string): Promise<SubscriptionInfo>;
  cancelSubscription(
    providerSubscriptionId: string
  ): Promise<{ success: boolean }>;
}

export type WebhookResult =
  | {
      event: "checkout.completed" | "subscription.updated" | "subscription.canceled";
      status: "succeeded" | "failed" | "canceled";
      provider: string;
      referenceId?: string;
      customerId?: string;
      metadata?: {
        userId?: string;
        planName?: string;
        credits?: number;
        [key: string]: unknown;
      };
    }
  | { event: "ignore"; status: "ignore"; provider: string }
  | { event: "unknown"; status: "unknown"; provider: string };
