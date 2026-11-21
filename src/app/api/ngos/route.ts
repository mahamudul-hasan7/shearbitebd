import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountInclude } from "@/lib/db/accounts";
import { profileDto } from "@/lib/db/profile";
import { apiError, ApiError, requireAuth } from "@/lib/api";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const id = new URL(request.url).searchParams.get("id");
    const rows = await prisma.nGOProfile.findMany({ where: { verificationStatus: "VERIFIED", user: { isActive: true, deletedAt: null }, ...(id ? { id } : {}) }, include: { user: { include: accountInclude }, impactRecords: true } });
    const ngos = rows.map((row) => {
      const profile = profileDto(row.user);
      return { profile: profile.ngoProfile, addresses: profile.addresses, impact: { peopleHelped: row.peopleHelped, completedRescues: row.completedRescues,
        recentMealsDistributed: row.impactRecords.reduce((n, r) => n + r.mealsRescued, 0), recentFoodRescuedKg: row.impactRecords.reduce((n, r) => n + r.foodWeightKg, 0), estimatedCo2PreventedKg: row.impactRecords.reduce((n, r) => n + r.estimatedCo2PreventedKg, 0) }, recentActivities: [] };
    });
    if (id && !ngos[0]) throw new ApiError(404, "Verified NGO not found.");
    return NextResponse.json(id ? { ngo: ngos[0] } : { ngos });
  } catch (error) { return apiError(error); }
}
