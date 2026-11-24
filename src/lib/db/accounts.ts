import { Prisma, FoodCategory } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { DBUser } from "@/lib/db/database";
import { UserRole } from "@/lib/constants/roles";

export const accountInclude = { donorProfile: true, ngoProfile: true, volunteerProfile: true, addresses: true } satisfies Prisma.UserInclude;
export type AccountRow = Prisma.UserGetPayload<{ include: typeof accountInclude }>;
export interface AuthAccount extends DBUser {
  donorProfileId?: string;
  ngoProfileId?: string;
  volunteerProfileId?: string;
}

export function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "").replace(/^(?:\+?880)/, "0");
}

export function toAuthAccount(row: AccountRow): AuthAccount {
  return {
    id: row.id, email: row.email, password: row.password ?? undefined, displayName: row.displayName,
    role: row.role as UserRole, phone: row.phone ?? undefined, createdAt: row.createdAt.toISOString(),
    profile: row.registrationDetails as DBUser["profile"],
    donorProfileId: row.donorProfile?.id, ngoProfileId: row.ngoProfile?.id, volunteerProfileId: row.volunteerProfile?.id,
  };
}

export async function findAccount(identifier: string) {
  const login = identifier.trim().toLowerCase();
  const normalized = normalizePhone(login);
  const lookup: Prisma.UserWhereInput = login === "admin"
    ? { username: "admin", role: "ADMIN" }
    : { OR: [{ email: login }, ...(/^01[3-9]\d{8}$/.test(normalized) ? [{ normalizedPhone: normalized }] : [])] };
  const row = await prisma.user.findFirst({
    where: { isActive: true, deletedAt: null, ...lookup },
    include: accountInclude,
  });
  return row ? toAuthAccount(row) : undefined;
}

export async function createAccount(input: Omit<DBUser, "id" | "createdAt"> & { id?: string; createdAt?: string; verified?: boolean }, { approveRegistration = false } = {}) {
  const details = input.profile ?? {};
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: {
      id: input.id, email: input.email.trim().toLowerCase(), password: input.password,
      displayName: input.displayName.trim(), role: input.role, phone: input.phone,
      normalizedPhone: input.phone ? normalizePhone(input.phone) : null,
      registrationDetails: details as Prisma.InputJsonValue,
      createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
    } });
    const address = await tx.address.create({ data: {
      id: `address-${randomUUID()}`, ownerId: user.id, label: "Primary address", isPrimary: true,
      addressLine: details.address || "", area: details.serviceAreas?.[0] || details.city || "Dhaka", city: details.city || "Dhaka",
    } });
    const verificationStatus = approveRegistration || input.verified ? "VERIFIED" : "PENDING";
    if (user.role === "DONOR") {
      const donorTypes = ["INDIVIDUAL", "CAFETERIA", "RESTAURANT", "BAKERY", "EVENT_ORGANIZER"] as const;
      const type = details.donorType?.toUpperCase();
      await tx.donorProfile.create({ data: { userId: user.id, organizationName: details.organizationName || user.displayName, donorType: donorTypes.find((item) => item === type) || "INDIVIDUAL", bfsaCertNumber: details.bfsaCertNumber, verificationStatus } });
    } else if (user.role === "NGO") {
      await tx.nGOProfile.create({ data: {
        userId: user.id, organizationName: details.organizationName || user.displayName,
        registrationNumber: details.registrationNumber || "", summary: details.notes || "", mission: "", vision: "",
        publicEmail: user.email, publicPhone: user.phone || "", authorizedContactUserId: user.id,
        serviceAreas: details.serviceAreas || [address.area], beneficiaryTypes: details.beneficiaryType ? [details.beneficiaryType] : [],
        capacityMealsPerDay: details.capacityMealsPerDay || 100, acceptedFoodCategories: Object.values(FoodCategory), verificationStatus,
      } });
    } else if (user.role === "VOLUNTEER") {
      const methods = ["WALKING", "BICYCLE", "MOTORCYCLE", "VAN", "CAR"] as const;
      await tx.volunteerProfile.create({ data: {
        userId: user.id, addressId: address.id, serviceAreas: details.serviceAreas || [address.area],
        availability: details.availability ? [details.availability] : [],
        transportMethod: methods.find((item) => item === details.transportMethod?.toUpperCase()) || "BICYCLE", verificationStatus,
      } });
    }
    await tx.userPreference.create({ data: { userId: user.id } });
    if (approveRegistration) {
      await tx.notification.create({ data: {
        userId: user.id,
        type: "SYSTEM",
        title: "Account approved",
        message: "Your account was approved automatically at registration.",
        href: `/${user.role.toLowerCase()}/dashboard`,
      } });
    }
    return toAuthAccount(await tx.user.findUniqueOrThrow({ where: { id: user.id }, include: accountInclude }));
  });
}
