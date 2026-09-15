import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock";

let _provider: PaymentProvider | undefined;

export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider;

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const razorpayKey = process.env.RAZORPAY_KEY_ID;

  if (stripeKey && stripeKey !== "" && !process.env.DEMO_MODE) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { StripePaymentProvider } = require("./stripe");
      const provider = new StripePaymentProvider() as PaymentProvider;
      _provider = provider;
      return _provider;
    } catch {
      console.log("[Veyra] Stripe init failed, using mock payment");
    }
  }

  if (razorpayKey && razorpayKey !== "" && !process.env.DEMO_MODE) {
    console.log("[Veyra] Razorpay not yet implemented, using mock payment");
  }

  const provider = new MockPaymentProvider();
  _provider = provider;
  return _provider;
}

export type { PaymentProvider, WebhookResult } from "./types";
export { MockPaymentProvider } from "./mock";
