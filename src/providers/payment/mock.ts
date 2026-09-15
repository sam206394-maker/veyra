import type {
  PaymentProvider,
  CheckoutInput,
  CheckoutOutput,
  WebhookResult,
  SubscriptionInfo,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  name = "mock";

  async createCheckout(input: CheckoutInput): Promise<CheckoutOutput> {
    return {
      checkoutUrl: `/dashboard?mock_checkout=true&plan=${input.planName}`,
      providerReferenceId: `mock_${input.planName}_${Date.now()}`,
    };
  }

  async handleWebhook(): Promise<WebhookResult> {
    return { event: "ignore", status: "ignore", provider: "mock" };
  }

  async getSubscription(): Promise<SubscriptionInfo> {
    return { status: "active" };
  }

  async cancelSubscription(): Promise<{ success: boolean }> {
    return { success: true };
  }
}
