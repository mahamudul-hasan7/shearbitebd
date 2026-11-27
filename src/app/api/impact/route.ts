import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ApiError, requireAuth } from "@/lib/api";
import { expireOpenDonations } from "@/lib/db/rescue";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();
    await expireOpenDonations();
    if (user.role === "DONOR") {
      if (!user.donorProfileId) throw new ApiError(403, "A donor profile is required.");
      const [donations, records] = await Promise.all([
        prisma.donation.findMany({ where: { donorProfileId: user.donorProfileId } }),
        prisma.impactRecord.findMany({ where: { donorProfileId: user.donorProfileId }, orderBy: { recordedAt: "desc" } }),
      ]);
      return NextResponse.json({ totalDonations: donations.length, activeDonations: donations.filter((d) => ["AVAILABLE", "RESERVED", "ASSIGNED", "PICKED_UP", "DELIVERED"].includes(d.status)).length,
        mealsRescued: records.reduce((n, r) => n + r.mealsRescued, 0), ngosHelped: new Set(records.map((r) => r.ngoProfileId).filter(Boolean)).size,
        donorScore: 0, donorScoreDescription: "A reliability score is not available yet. This is not a food safety certification.", recentRecords: records });
    }
    if (user.role !== "NGO") throw new ApiError(403, "An NGO or donor account is required.");
    if (!user.ngoProfileId) throw new ApiError(403, "An NGO profile is required.");
    const period = new URL(request.url).searchParams.get("period");
    const days = period === "WEEK" ? 7 : period === "YEAR" ? 365 : 30;
    const periodStart = new Date(Date.now() - days * 86_400_000);
    const records = await prisma.impactRecord.findMany({ where: { ngoProfileId: user.ngoProfileId, ...(period ? { recordedAt: { gte: periodStart } } : {}) }, orderBy: { recordedAt: "desc" } });
    const trend = new Map<string, { label: string; meals: number; beneficiaries: number }>();
    for (const record of records.toReversed()) {
      const label = new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", month: "short", day: "numeric" }).format(record.recordedAt);
      const entry = trend.get(label) || { label, meals: 0, beneficiaries: 0 };
      entry.meals += record.mealsRescued; entry.beneficiaries += record.beneficiariesServed; trend.set(label, entry);
    }
    return NextResponse.json({ mealsDistributed: records.reduce((n, r) => n + r.mealsRescued, 0), beneficiariesServed: records.reduce((n, r) => n + r.beneficiariesServed, 0), foodWeightKg: records.reduce((n, r) => n + r.foodWeightKg, 0), completedRescues: records.length, recentRecords: records,
      period: period || "MONTH", periodStart: periodStart.toISOString(), estimatedCo2PreventedKg: records.reduce((n, r) => n + r.estimatedCo2PreventedKg, 0), estimatedWaterSavedLitres: records.reduce((n, r) => n + (r.estimatedWaterSavedLitres || 0), 0), trend: [...trend.values()], topAreas: [] });
  } catch (error) { return apiError(error); }
}
