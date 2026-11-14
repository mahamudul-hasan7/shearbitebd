import { prisma } from "@/lib/prisma";
import { apiError, ApiError, requireAuth } from "@/lib/api";
import { photoSelect } from "@/lib/db/photos";
import { visibleDonations, claimVisibility } from "@/lib/db/rescue";

export const runtime = "nodejs";
type Context = { params: Promise<{ photoId: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { user } = await requireAuth();
    const { photoId } = await context.params;
    const photo = await prisma.photoAsset.findUnique({ where: { id: photoId }, select: photoSelect });
    if (!photo) throw new ApiError(404, "Photo not found.");
    if (photo.ownerId !== user.id) {
      const allowed = photo.attachedAt && (photo.purpose === "DONATION" && photo.donationId
        ? await prisma.donation.findFirst({ where: { AND: [{ id: photo.donationId }, visibleDonations(user)] }, select: { id: true } })
        : photo.claimId ? await prisma.claim.findFirst({ where: { AND: [{ id: photo.claimId }, claimVisibility(user)] }, select: { id: true } }) : null);
      if (!allowed) throw new ApiError(404, "Photo not found for your account.");
    }
    const stored = await prisma.photoAsset.findUnique({ where: { id: photoId }, select: { data: true } });
    if (!stored) throw new ApiError(404, "Photo not found.");
    return new Response(new Uint8Array(stored.data), { headers: { "Content-Type": "image/webp", "Content-Length": String(stored.data.length), "Content-Disposition": `inline; filename="${photoId}.webp"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Vary": "Cookie", "Cross-Origin-Resource-Policy": "same-origin" } });
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { user } = await requireAuth();
    const { photoId } = await context.params;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM photo_assets WHERE id = ${photoId} FOR UPDATE`;
      const photo = await tx.photoAsset.findFirst({ where: { id: photoId, ownerId: user.id }, select: photoSelect });
      if (!photo) throw new ApiError(404, "Photo not found for your account.");
      if (photo.attachedAt) throw new ApiError(409, "Photos saved with a rescue record cannot be removed here.");
      await tx.photoAsset.delete({ where: { id: photoId } });
    });
    return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
