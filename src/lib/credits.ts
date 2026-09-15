import prisma from "./prisma";

export const CREDIT_COSTS: Record<string, Record<string, number>> = {
  "text-to-image": { draft: 1, standard: 2, high: 5 },
  "image-to-image": { draft: 2, standard: 4, high: 8 },
  "text-to-video": { draft: 10, standard: 20, high: 50 },
  "image-to-video": { draft: 15, standard: 30, high: 75 },
};

export function calculateCreditCost(
  type: string,
  quality: string,
  count: number = 1,
  duration?: number
): number {
  const baseCost = CREDIT_COSTS[type]?.[quality] ?? 2;
  let cost = baseCost * count;
  if (duration && (type.includes("video"))) {
    cost *= duration;
  }
  return cost;
}

export async function deductCredits(
  userId: string,
  amount: number,
  type: string,
  referenceId: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  if (amount <= 0) return { success: false, error: "Invalid deduction amount" };

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User not found" };
    if (user.credits < amount)
      return { success: false, error: "Insufficient credits" };

    await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount: -amount,
        type,
        description: description ?? `Used ${amount} credits for ${type}`,
        referenceId,
      },
    });

    return { success: true };
  });

  return result;
}

export async function addCredits(
  userId: string,
  amount: number,
  type: string,
  referenceId: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  if (amount <= 0) return { success: false, error: "Invalid credit amount" };

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        description: description ?? `Added ${amount} credits via ${type}`,
        referenceId,
      },
    });

    return { success: true };
  });

  return result;
}

export async function getCreditBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}
