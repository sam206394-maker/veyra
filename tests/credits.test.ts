import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateCreditCost,
  deductCredits,
  addCredits,
} from "@/lib/credits";

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    creditTransaction: {
      create: vi.fn(),
    },
  };
  return { prisma: mockPrisma, default: mockPrisma };
});

import { prisma } from "@/lib/prisma";

// Typed reference so TS sees the mock API ($transaction is overloaded in the real client)
const mockTransaction = prisma.$transaction as unknown as ReturnType<typeof vi.fn>;

describe("calculateCreditCost", () => {
  it("returns correct cost for text-to-image standard quality", () => {
    expect(calculateCreditCost("text-to-image", "standard")).toBe(2);
  });

  it("scales cost by count", () => {
    expect(calculateCreditCost("text-to-image", "standard", 3)).toBe(6);
  });

  it("return higher cost for high quality", () => {
    expect(calculateCreditCost("text-to-image", "high", 1)).toBe(5);
  });

  it("scales video cost by duration", () => {
    expect(calculateCreditCost("text-to-video", "standard", 1, 5)).toBe(100);
  });

  it("falls back to default cost for unknown type", () => {
    expect(calculateCreditCost("unknown", "standard")).toBe(2);
  });
});

describe("deductCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid deduction amounts", async () => {
    const result = await deductCredits("user1", 0, "generation", "gen1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid deduction amount");
  });

  it("fails when user has insufficient credits", async () => {
    mockTransaction.mockImplementationOnce(async (cb) => {
      const fakeTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: "user1", credits: 5 }),
        },
      };
      return cb(fakeTx);
    });

    const result = await deductCredits("user1", 10, "generation", "gen1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Insufficient credits");
  });

  it("deducts credits successfully when balance is sufficient", async () => {
    mockTransaction.mockImplementationOnce(async (cb) => {
      const fakeTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: "user1", credits: 50 }),
          update: vi.fn().mockResolvedValue({}),
        },
        creditTransaction: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      return cb(fakeTx);
    });

    const result = await deductCredits("user1", 10, "generation", "gen1");
    expect(result.success).toBe(true);
  });
});

describe("addCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects negative amounts", async () => {
    const result = await addCredits("user1", -10, "topup", "pay1");
    expect(result.success).toBe(false);
  });

  it("adds credits successfully", async () => {
    mockTransaction.mockImplementationOnce(async (cb) => {
      const fakeTx = {
        user: {
          update: vi.fn().mockResolvedValue({}),
        },
        creditTransaction: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      return cb(fakeTx);
    });

    const result = await addCredits("user1", 50, "topup", "pay1");
    expect(result.success).toBe(true);
  });
});
