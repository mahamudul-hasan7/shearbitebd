import { Prisma, PhotoPurpose } from "@prisma/client";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import type { AuthAccount } from "@/lib/db/accounts";
import { claimVisibility, REPORTABLE_CLAIM_STATUSES } from "@/lib/db/rescue-access";

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_STORED_BYTES = 2 * 1024 * 1024;
const MAX_ACCOUNT_BYTES = 100 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_PHOTOS * MAX_PHOTO_BYTES + 1024 * 1024;
export const photoSelect = { id: true, ownerId: true, purpose: true, originalName: true, mimeType: true, byteSize: true, width: true, height: true, donationId: true, claimId: true, attachedAt: true } satisfies Prisma.PhotoAssetSelect;
type PhotoMetadata = Prisma.PhotoAssetGetPayload<{ select: typeof photoSelect }>;
export function photoDto(photo: PhotoMetadata) {
  return { id: photo.id, url: `/api/photos/${photo.id}`, name: photo.originalName, width: photo.width, height: photo.height, byteSize: photo.byteSize };
}

// Bound the stream even when Content-Length is absent or untrusted.
export async function photoFormData(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new ApiError(400, "Use a multipart photo upload.");
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_REQUEST_BYTES) throw new ApiError(413, "Upload up to five photos, each at most 5 MB.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Choose at least one photo.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_REQUEST_BYTES) { await reader.cancel(); throw new ApiError(413, "The upload is too large."); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  try {
    return await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch { throw new ApiError(400, "The photo upload could not be read."); }
}

async function normalizePhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new ApiError(415, "Choose JPEG, PNG or WebP photos.");
  if (!file.size || file.size > MAX_PHOTO_BYTES) throw new ApiError(413, "Each photo must be between 1 byte and 5 MB.");
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const format = input.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? "jpeg"
      : input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png"
      : input.subarray(0, 4).toString() === "RIFF" && input.subarray(8, 12).toString() === "WEBP" ? "webp" : "";
    if (!format || file.type !== `image/${format}`) throw new Error("Invalid image signature");
    const image = sharp(input, { limitInputPixels: 20_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) !== 1) throw new Error("Unsupported image");
    // Re-encode decoded pixels, auto-orient and strip EXIF/GPS and other metadata.
    const result = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    if (result.data.length > MAX_STORED_BYTES) throw new ApiError(413, "This photo is too complex. Choose a smaller image.");
    return { originalName: file.name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").slice(0, 150) || "photo",
      mimeType: "image/webp", data: result.data, byteSize: result.data.length, width: result.info.width, height: result.info.height };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(415, "This file is not a valid, supported photo (maximum 20 megapixels).");
  }
}

export async function uploadPhotos(files: File[], purpose: PhotoPurpose, claimId: string | undefined, user: AuthAccount) {
  const allowed = purpose === "INCIDENT" ? ["DONOR", "NGO", "VOLUNTEER"].includes(user.role) : purpose === "DONATION" ? user.role === "DONOR" : user.role === "NGO";
  if (!allowed) throw new ApiError(403, "Your role cannot upload this kind of photo.");
  if (!files.length || files.length > MAX_PHOTOS) throw new ApiError(422, "Choose one to five photos.");
  if (purpose === "DONATION" && claimId) throw new ApiError(422, "Donation photos are attached when you save the donation.");
  if (purpose !== "DONATION" && !claimId) throw new ApiError(422, "Choose a claim for these evidence photos.");
  // Check ownership before decoding potentially expensive images.
  const contextWhere = purpose === "INCIDENT" ? claimVisibility(user) : { ngoProfileId: user.ngoProfileId || "__none__" };
  const context = claimId ? await prisma.claim.findFirst({ where: { AND: [{ id: claimId }, contextWhere] } }) : null;
  if (claimId && !context) throw new ApiError(404, "Claim not found for your NGO.");
  const images: Awaited<ReturnType<typeof normalizePhoto>>[] = [];
  for (const file of files) images.push(await normalizePhoto(file));
  return prisma.$transaction(async (tx) => {
    if (context) {
      await tx.$queryRaw`SELECT id FROM donations WHERE id = ${context.donationId} FOR UPDATE`;
      const claim = await tx.claim.findFirst({ where: { AND: [{ id: claimId }, contextWhere] }, include: { donation: true, deliveryReceipt: true, distributionRecord: true } });
      if (!claim) throw new ApiError(404, "Claim not found for your NGO.");
      if (purpose === "INCIDENT") {
        if (!(REPORTABLE_CLAIM_STATUSES as readonly string[]).includes(claim.status)) throw new ApiError(409, "This rescue is closed to new operational reports.");
      } else if (claim.status !== "DELIVERED" || claim.donation.status !== "DELIVERED") throw new ApiError(409, "Evidence upload requires verified delivery.");
      if (purpose === "RECEIPT" && claim.deliveryReceipt) throw new ApiError(409, "The receipt has already been saved.");
      if (purpose === "DISTRIBUTION" && (!claim.deliveryReceipt || claim.deliveryReceipt.distributionBlocked || claim.distributionRecord)) throw new ApiError(409, "A safe, undistributed receipt is required.");
    }
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
    const quota = await tx.photoAsset.aggregate({ where: { ownerId: user.id }, _sum: { byteSize: true }, _count: true });
    if ((quota._sum.byteSize || 0) + images.reduce((sum, img) => sum + img.byteSize, 0) > MAX_ACCOUNT_BYTES || quota._count + images.length > 200) throw new ApiError(413, "Your photo storage limit has been reached. Remove unused photos or contact the project operator.");
    const saved = [];
    for (const image of images) saved.push(await tx.photoAsset.create({ data: { ...image, ownerId: user.id, purpose, claimId }, select: photoSelect }));
    return saved.map(photoDto);
  });
}

export async function attachPhotos(tx: Prisma.TransactionClient, value: unknown, user: AuthAccount, purpose: PhotoPurpose, target: { donationId?: string; claimId?: string }) {
  if (value === undefined) return { urls: [] as string[], names: [] as string[] };
  if (!Array.isArray(value) || value.length > MAX_PHOTOS) throw new ApiError(422, "Attach up to five uploaded photos.");
  const ids = value.map((url) => {
    if (typeof url !== "string" || !/^\/api\/photos\/[a-f0-9-]{36}$/.test(url)) throw new ApiError(422, "Use photos uploaded through this application.");
    return url.slice("/api/photos/".length);
  });
  if (new Set(ids).size !== ids.length) throw new ApiError(422, "Do not attach the same photo twice.");
  if (!ids.length) return { urls: [], names: [] };
  await tx.$queryRaw`SELECT id FROM photo_assets WHERE id IN (${Prisma.join([...ids].sort())}) ORDER BY id FOR UPDATE`;
  const photos = await tx.photoAsset.findMany({ where: { id: { in: ids }, ownerId: user.id }, select: photoSelect });
  if (photos.length !== ids.length) throw new ApiError(403, "You can attach only your own uploaded photos.");
  for (const photo of photos) {
    if (photo.purpose !== purpose || photo.attachedAt || photo.donationId || (purpose === "DONATION" ? photo.claimId : photo.claimId !== target.claimId)) throw new ApiError(409, "A photo belongs to a different purpose, record or claim.");
  }
  await tx.photoAsset.updateMany({ where: { id: { in: ids } }, data: { ...target, attachedAt: new Date() } });
  return { urls: ids.map((id) => `/api/photos/${id}`), names: ids.map((id) => photos.find((p) => p.id === id)!.originalName) };
}
