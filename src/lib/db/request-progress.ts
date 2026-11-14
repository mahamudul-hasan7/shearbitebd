import type { Prisma, FoodRequest } from "@prisma/client";

export const ACTIVE_REQUEST_CLAIMS = ["RESERVED", "ASSIGNED", "PICKED_UP", "DELIVERED", "DISPUTED"] as const;
export function requestProgress(row: FoodRequest & { claims: Array<{ status: string; requestMealsAllocated: number; distributionRecord: { mealsDistributed: number } | null }> }) {
  const fulfilled = Math.min(row.mealsNeeded, row.claims.reduce((sum, claim) => sum + (claim.distributionRecord ? Math.min(claim.requestMealsAllocated, claim.distributionRecord.mealsDistributed) : 0), 0));
  const reserved = row.claims.reduce((sum, claim) => sum + ((ACTIVE_REQUEST_CLAIMS as readonly string[]).includes(claim.status) ? claim.requestMealsAllocated : 0), 0);
  return { mealsFulfilled: fulfilled, mealsReserved: reserved, remainingMeals: Math.max(0, row.mealsNeeded - fulfilled - reserved) };
}
export async function refreshRequestProgress(tx: Prisma.TransactionClient, id: string) {
  // All rescue mutations lock donation first, then its linked request.
  await tx.$queryRaw`SELECT id FROM food_requests WHERE id = ${id} FOR UPDATE`;
  const row = await tx.foodRequest.findUnique({ where: { id }, include: { claims: { select: { status: true, requestMealsAllocated: true, distributionRecord: { select: { mealsDistributed: true } } } } } });
  if (!row) return null;
  const progress = requestProgress(row);
  const status: FoodRequest["status"] = row.status === "CANCELLED" ? "CANCELLED" : progress.mealsFulfilled >= row.mealsNeeded ? "FULFILLED"
    : progress.mealsReserved > 0 ? "MATCHED" : row.neededBy.getTime() <= Date.now() ? "EXPIRED" : "FINDING_MATCH";
  if (row.status !== status || row.mealsFulfilled !== progress.mealsFulfilled) {
    await tx.foodRequest.update({ where: { id }, data: { status, mealsFulfilled: progress.mealsFulfilled } });
    if (row.status !== status) {
      const ngo = await tx.nGOProfile.findUniqueOrThrow({ where: { id: row.ngoProfileId }, select: { userId: true } });
      await tx.notification.create({ data: { userId: ngo.userId, type: "SYSTEM", title: `Food request: ${status.toLowerCase().replaceAll("_", " ")}`, message: `${row.title}: ${progress.mealsFulfilled}/${row.mealsNeeded} meals distributed.`, href: `/ngo/requests/${id}` } });
    }
  }
  return { ...row, ...progress, status };
}
