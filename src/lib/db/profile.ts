import { coordinates } from "@/lib/locations";
import { prisma } from "@/lib/prisma";
import { accountInclude, type AccountRow } from "@/lib/db/accounts";
import type { ProfileBundle } from "@/services/profile.service";
import type { Address } from "@/types/domain";
import type { Address as AddressRow } from "@prisma/client";

export function addressDto(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    division: row.division,
    district: row.district,
    city: row.city,
    area: row.area,
    addressLine: row.addressLine,
    postalCode: row.postalCode ?? undefined,
    landmark: row.landmark ?? undefined,
    coordinates: coordinates(row.latitude, row.longitude),
    isPrimary: row.isPrimary,
  };
}

export function profileDto(row: AccountRow): ProfileBundle {
  // JSON serialization converts Prisma timestamps to the existing domain's ISO strings.
  // Explicit user fields prevent password and registration-private data from leaking.
  const addresses = row.addresses.map(addressDto);
  const result = {
    user: {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      phone: row.phone ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
      role: row.role,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    donorProfile: row.donorProfile
      ? { ...row.donorProfile, addressIds: addresses.map((a) => a.id) }
      : undefined,
    ngoProfile: row.ngoProfile
      ? {
          ...row.ngoProfile,
          verificationDocumentId: undefined,
          addressIds: addresses.map((a) => a.id),
          verificationDocumentName:
            row.ngoProfile.verificationDocName ?? undefined,
        }
      : undefined,
    volunteerProfile: row.volunteerProfile
      ? { ...row.volunteerProfile, verificationDocumentId: undefined }
      : undefined,
    addresses,
  };
  return JSON.parse(JSON.stringify(result)) as ProfileBundle;
}

export async function getProfile(userId: string) {
  return profileDto(
    await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: accountInclude,
    }),
  );
}
