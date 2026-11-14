import { NextResponse } from "next/server";
import { PhotoPurpose } from "@prisma/client";
import { apiError, ApiError, requireAuth, textField } from "@/lib/api";
import { enumField } from "@/lib/db/rescue";
import { photoFormData, uploadPhotos, photoSelect, photoDto } from "@/lib/db/photos";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();
    const params = new URL(request.url).searchParams;
    const purpose = enumField(params.get("purpose"), Object.values(PhotoPurpose), "photo purpose");
    const claimId = textField(params.get("claimId"), "claimId", 160, true) || null;
    const photos = await prisma.photoAsset.findMany({ where: { ownerId: user.id, attachedAt: null, purpose, claimId }, select: photoSelect, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ photos: photos.map(photoDto) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    if (!["DONOR", "NGO", "VOLUNTEER"].includes(user.role)) throw new ApiError(403, "Only rescue participants can upload photos.");
    const form = await photoFormData(request);
    const purpose = enumField(form.get("purpose"), Object.values(PhotoPurpose), "photo purpose");
    const claimId = textField(form.get("claimId"), "claimId", 160, true) || undefined;
    const files = form.getAll("files");
    if (files.some((file) => typeof file === "string")) throw new ApiError(422, "Choose image files.");
    return NextResponse.json({ photos: await uploadPhotos(files as File[], purpose, claimId, user) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
