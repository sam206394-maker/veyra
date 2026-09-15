import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin().catch(() => null);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, totalGenerations, totalPayments, failedGenerations, totalCredits] =
    await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.payment.count({ where: { status: "succeeded" } }),
      prisma.generation.count({ where: { status: "failed" } }),
      prisma.payment.aggregate({ _sum: { amountCents: true }, where: { status: "succeeded" } }),
    ]);

  return NextResponse.json({
    totalUsers,
    totalGenerations,
    totalPayments,
    failedGenerations,
    revenueCents: totalCredits._sum.amountCents || 0,
  });
}
