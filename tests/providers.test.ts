import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/providers/ai/mock";
import { MockPaymentProvider } from "@/providers/payment/mock";
import { LocalStorageProvider } from "@/providers/storage/local";

describe("AI Provider abstraction", () => {
  it("mock provider generates images", async () => {
    const provider = new MockAIProvider();
    const result = await provider.generateImage({
      prompt: "a cat",
      count: 2,
    });
    expect(result.images.length).toBe(2);
    expect(result.images[0].url).toContain("http");
  });

  it("mock provider generates videos", async () => {
    const provider = new MockAIProvider();
    const result = await provider.generateVideo({
      prompt: "a running dog",
      duration: 4,
    });
    expect(result.videos.length).toBe(1);
    expect(result.videos[0].durationMs).toBe(4000);
  });

  it("mock provider converts image to video", async () => {
    const provider = new MockAIProvider();
    const result = await provider.imageToVideo({
      imageUrl: "https://example.com/img.jpg",
    });
    expect(result.videos.length).toBe(1);
  });
});

describe("Payment Provider abstraction", () => {
  it("mock provider creates checkout", async () => {
    const provider = new MockPaymentProvider();
    const result = await provider.createCheckout({
      userId: "u1",
      email: "test@example.com",
      planName: "creator",
      amountCents: 1999,
    });
    expect(result.checkoutUrl).toContain("/dashboard");
    expect(result.providerReferenceId).toContain("mock_creator");
  });

  it("mock provider returns active subscription", async () => {
    const provider = new MockPaymentProvider();
    const sub = await provider.getSubscription("sub_1");
    expect(sub.status).toBe("active");
  });
});

describe("Storage Provider abstraction", () => {
  it("local provider uploads and serves files", async () => {
    const provider = new LocalStorageProvider();
    const result = await provider.upload({
      buffer: Buffer.from("test image data"),
      filename: "test.png",
      contentType: "image/png",
      userId: "user1",
    });
    expect(result.url).toContain("/api/assets/file/user1/");
    expect(result.sizeBytes).toBeGreaterThan(0);
  });

  it("local provider deletes files", async () => {
    const provider = new LocalStorageProvider();
    const result = await provider.upload({
      buffer: Buffer.from("to be deleted"),
      filename: "delete.png",
      contentType: "image/png",
      userId: "user2",
    });
    await provider.delete(result.url);
  });
});
