import type { SmsProvider } from "./types";

export const isDemoMode = (): boolean => process.env.DEMO_MODE === "true";

/**
 * Demo SMS provider.
 * Never sends anything. In demo mode the code is returned to the UI so the
 * whole flow can be tested for free. It is always labelled as demo-only.
 */
export class MockSmsProvider implements SmsProvider {
  name = "mock-sms";

  async sendOtp(): Promise<{ deliveredInBand: boolean }> {
    return { deliveredInBand: true };
  }
}

/**
 * Console SMS provider for local development without a real SMS gateway.
 * Logs the code to the server console; the code is NOT returned to the API
 * response (out-of-band), matching real SMS behaviour.
 */
export class ConsoleSmsProvider implements SmsProvider {
  name = "console-sms";

  async sendOtp(input: { phone: string; code: string }): Promise<{ deliveredInBand: boolean }> {
    console.log(`[sms] OTP for ${input.phone}: ${input.code}`);
    return { deliveredInBand: false };
  }
}
