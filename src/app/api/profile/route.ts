import { lockActiveAccount } from "@/lib/db/account-access";
import { isCoordinates } from "@/lib/locations";
import { NextResponse } from "next/server";
import { DonorType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/db/profile";
import { normalizePhone } from "@/lib/db/accounts";
import { ApiError, apiError, object, requireAuth, textField } from "@/lib/api";
import { validateBangladeshPhone, validateEmail } from "@/features/auth/validation";

export async function GET() {
  try { const { user } = await requireAuth(); return NextResponse.json(await getProfile(user.id)); }
  catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth();
    const body = object(await request.json());
    const input = object(body.input);
    if (body.action === "displayName") {
      await prisma.user.update({ where: { id: user.id }, data: { displayName: textField(input.displayName, "displayName", 120) } });
    } else if (body.action === "donor" && user.role === "DONOR") {
      const email = textField(input.email, "email", 254).toLowerCase();
      const phone = textField(input.phone, "phone", 30);
      const issue = validateEmail(email) || validateBangladeshPhone(phone);
      if (issue || !Object.values(DonorType).includes(input.donorType as DonorType)) throw new ApiError(422, issue || "Invalid donor type.");
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { displayName: textField(input.displayName, "displayName", 120), email, phone, normalizedPhone: normalizePhone(phone) } }),
        prisma.donorProfile.update({ where: { userId: user.id }, data: { organizationName: textField(input.organizationName, "organizationName", 160, true), donorType: input.donorType as DonorType } }),
      ]);
    } else if (body.action === "ngo" && user.role === "NGO") {
      const publicEmail = textField(input.publicEmail, "publicEmail", 254).toLowerCase();
      const publicPhone = textField(input.publicPhone, "publicPhone", 30);
      const issue = validateEmail(publicEmail) || validateBangladeshPhone(publicPhone);
      const serviceAreas = Array.isArray(input.serviceAreas) ? input.serviceAreas.map((value) => textField(value, "serviceAreas", 100)).filter(Boolean) : [];
      const beneficiaryTypes = Array.isArray(input.beneficiaryTypes) ? input.beneficiaryTypes.map((value) => textField(value, "beneficiaryTypes", 100)).filter(Boolean) : [];
      if (issue || !serviceAreas.length || typeof input.capacityMealsPerDay !== "number" || !Number.isInteger(input.capacityMealsPerDay) || input.capacityMealsPerDay < 1) throw new ApiError(422, issue || "Check capacity and service areas.");
      const organizationName = textField(input.organizationName, "organizationName", 160);
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { displayName: organizationName } }),
        prisma.nGOProfile.update({ where: { userId: user.id }, data: { organizationName, summary: textField(input.summary, "summary", 2000), mission: textField(input.mission, "mission", 2000, true), vision: textField(input.vision, "vision", 2000, true), publicEmail, publicPhone, serviceAreas, beneficiaryTypes, capacityMealsPerDay: input.capacityMealsPerDay } }),
      ]);
    } else throw new ApiError(403, "You cannot perform this profile operation.");
    return NextResponse.json(await getProfile(user.id));
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    const body = object(await request.json());
    const input = body.input ? object(body.input) : {};
    const id = typeof body.id === "string" ? body.id : "";
    const addressData: Prisma.AddressUncheckedCreateInput = {
      ownerId: user.id, label: "", area: "", addressLine: "",
    };
    if (body.action === "addAddress" || body.action === "updateAddress") {
      for (const key of ["label", "division", "district", "city", "area", "addressLine"] as const) addressData[key] = textField(input[key], key);
      addressData.postalCode = textField(input.postalCode, "postalCode", 30, true);
      addressData.landmark = textField(input.landmark, "landmark", 200, true);
    }
    if (["addAddress", "updateAddress", "setCoordinates"].includes(String(body.action))) {
      if (body.action === "setCoordinates" && input.coordinates === undefined) throw new ApiError(422, "Choose or clear the location pin.");
      if (input.coordinates !== undefined) {
        if (input.coordinates !== null && !isCoordinates(input.coordinates)) throw new ApiError(422, "Enter a valid latitude and longitude.", { coordinates: "Latitude must be -90 to 90 and longitude -180 to 180." });
        addressData.latitude = input.coordinates?.latitude ?? null;
        addressData.longitude = input.coordinates?.longitude ?? null;
      }
    }
    await prisma.$transaction(async (tx) => {
      // Serialize primary-address changes for this owner, including first-address creation.
      await lockActiveAccount(tx, user.id);
      if (body.action === "addAddress") {
        addressData.isPrimary = await tx.address.count({ where: { ownerId: user.id } }) === 0;
        await tx.address.create({ data: addressData });
      } else {
        const address = await tx.address.findFirst({ where: { id, ownerId: user.id } });
        if (!address) throw new ApiError(404, "Address not found for your account.");
        if (body.action === "updateAddress") {
          if (await tx.donation.count({ where: { pickupAddressId: id } })) throw new ApiError(409, "This address is used by a donation. Add a new address to keep pickup history accurate.");
          await tx.address.update({ where: { id }, data: addressData });
        }
        else if (body.action === "setCoordinates") {
          await tx.address.update({ where: { id }, data: { latitude: addressData.latitude, longitude: addressData.longitude } });
        }
        else if (body.action === "setPrimaryAddress") {
          await tx.address.updateMany({ where: { ownerId: user.id }, data: { isPrimary: false } });
          await tx.address.update({ where: { id }, data: { isPrimary: true } });
        } else if (body.action === "removeAddress") {
          if (await tx.donation.count({ where: { pickupAddressId: id } })) throw new ApiError(409, "This address is used by a donation and cannot be removed.");
          if (await tx.foodRequest.count({ where: { deliveryAddressId: id } })) throw new ApiError(409, "This address is used by a food request and cannot be removed.");
          if (await tx.address.count({ where: { ownerId: user.id } }) <= 1) throw new ApiError(409, "Keep at least one address on your profile.");
          await tx.address.delete({ where: { id } });
          if (address.isPrimary) {
            const next = await tx.address.findFirst({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" } });
            if (next) await tx.address.update({ where: { id: next.id }, data: { isPrimary: true } });
          }
        } else throw new ApiError(422, "Unknown address operation.");
      }
    });
    return NextResponse.json(await getProfile(user.id));
  } catch (error) { return apiError(error); }
}
