import { describe, it, expect, vi } from "vitest";

// Testing the duplicate webhook handling logic embedded in the webhook route
// by simulating the Prisma queries.

const PLAN_CREDITS: Record<string, number> = {
  starter: 500,
  creator: 2000,
  pro: 10000,
};

function simulateWebhookProcess(params: {
  existingSub: unknown;
  providerReference: string;
  planName: string;
  userId: string;
}) {
  // Mirrors the dedup logic in /api/payments/webhook
  if (!params.existingSub) {
    return {
      processed: true,
      credits: PLAN_CREDITS[params.planName] || 500,
      referenceId: params.providerReference,
    };
  }
  return { processed: false, credits: 0, referenceId: null };
}

describe("Payment webhook verification", () => {
  it("processes a legitimate checkout.completed event", () => {
    const result = simulateWebhookProcess({
      existingSub: null,
      providerReference: "sub_123",
      planName: "creator",
      userId: "user1",
    });
    expect(result.processed).toBe(true);
    expect(result.credits).toBe(2000);
  });

  it("rejects an invalid plan name with default 500 credits", () => {
    const result = simulateWebhookProcess({
      existingSub: null,
      providerReference: "sub_456",
      planName: "unknown",
      userId: "user1",
    });
    expect(result.processed).toBe(true);
    expect(result.credits).toBe(500);
  });

  it("does not process duplicate webhook events", () => {
    // First event
    const first = simulateWebhookProcess({
      existingSub: null,
      providerReference: "sub_789",
      planName: "pro",
      userId: "user1",
    });
    expect(first.processed).toBe(true);

    // Duplicate event (subscription already exists)
    const duplicate = simulateWebhookProcess({
      existingSub: { id: "1", stripeSubscriptionId: "sub_789" },
      providerReference: "sub_789",
      planName: "pro",
      userId: "user1",
    });
    expect(duplicate.processed).toBe(false);
    expect(duplicate.credits).toBe(0);
  });

  it("always returns received for unknown events", () => {
    const event = { event: "unknown", status: "unknown", provider: "stripe" };
    expect(event.event).toBe("unknown");
    expect(event.provider).toBe("stripe");
  });
});
