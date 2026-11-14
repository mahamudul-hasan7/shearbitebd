import fs from "node:fs";
import path from "node:path";
import { loadDatabaseEnv } from "./database-env.mjs";
import type { DBDocuments } from "../src/lib/db/database";
import { UserRole } from "../src/lib/constants/roles";
import { FoodCategory, QuantityUnit, DonationStatus, ClaimStatus, NotificationType, Prisma } from "@prisma/client";

async function main() {
  loadDatabaseEnv();
  const { prisma } = await import("../src/lib/prisma");
  const { createAccount, accountInclude, normalizePhone } = await import("../src/lib/db/accounts");
  const sourceFile = path.resolve(process.argv[2] || "data/db.json");
  const source = JSON.parse(fs.readFileSync(sourceFile, "utf8")) as DBDocuments;
  if (![source.users, source.donations, source.claims, source.notifications].every(Array.isArray)) throw new Error("Invalid source data.");
  const report = { imported: { users: 0, donations: 0, claims: 0, notifications: 0 }, skipped: [] as Array<{ collection: string; id: string; reason: string }> };
  const date = (value: string) => { const d = new Date(value); if (!Number.isFinite(d.getTime())) throw new Error("Invalid timestamp."); return d; };
  const reason = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError ? `Database constraint: ${error.code}` : error instanceof Error ? error.message : "Invalid record";
  try {
    await prisma.$connect();
    for (const user of source.users) {
      try {
        if (!Object.values(UserRole).includes(user.role) || !user.email?.includes("@") || !user.id) throw new Error("Invalid account identity.");
        if (await prisma.user.findUnique({ where: { email: user.email.trim().toLowerCase() } })) continue;
        if (user.phone && await prisma.user.findUnique({ where: { normalizedPhone: normalizePhone(user.phone) } })) throw new Error("Duplicate phone. Confirm a unique phone number before importing this account.");
        await createAccount({ ...user, createdAt: date(user.createdAt).toISOString(), verified: ["donor@sharebite.demo", "ngo@sharebite.demo", "volunteer@sharebite.demo"].includes(user.email.toLowerCase()) });
        report.imported.users++;
      } catch (error) { report.skipped.push({ collection: "users", id: user.id, reason: reason(error) }); }
    }
    const accounts = await prisma.user.findMany({ include: accountInclude });
    const findUser = (id?: string, email?: string) => accounts.find((u) => u.id === id || (email && u.email === email.toLowerCase()));
    for (const donation of source.donations) {
      try {
        if (await prisma.donation.findUnique({ where: { id: donation.id } })) continue;
        const donor = findUser(donation.donorId, donation.donorEmail);
        if (!donor?.donorProfile || !donor.addresses[0]) throw new Error("Donor or pickup address does not exist.");
        if (!(donation.quantity > 0) || !Object.values(FoodCategory).includes(donation.category as FoodCategory) || !Object.values(QuantityUnit).includes(donation.quantityUnit as QuantityUnit) || !Object.values(DonationStatus).includes(donation.status as DonationStatus)) throw new Error("Invalid donation values.");
        await prisma.donation.create({ data: {
          id: donation.id, donorProfileId: donor.donorProfile.id, pickupAddressId: donor.addresses[0].id,
          title: donation.title, description: donation.description || "", category: donation.category as FoodCategory,
          quantityValue: donation.quantity, quantityUnit: donation.quantityUnit as QuantityUnit, estimatedMeals: donation.estimatedMeals,
          status: donation.status as DonationStatus, preparationTime: date(donation.preparationTime), safePickupDeadline: date(donation.safePickupDeadline),
          windowStart: date(donation.pickupWindowStart), windowEnd: date(donation.pickupWindowEnd), approximateArea: donation.approximateArea || donor.addresses[0].area,
          contactName: donation.contactPerson || donor.displayName, contactPhone: donation.contactPhone || donor.phone || "", contactEmail: donor.email,
          specialInstructions: donation.specialInstructions, createdAt: date(donation.createdAt), updatedAt: date(donation.updatedAt),
        } });
        report.imported.donations++;
      } catch (error) { report.skipped.push({ collection: "donations", id: donation.id, reason: reason(error) }); }
    }
    for (const claim of source.claims) {
      try {
        if (await prisma.claim.findUnique({ where: { id: claim.id } })) continue;
        const ngo = findUser(claim.ngoId, claim.ngoEmail);
        const volunteer = findUser(claim.volunteerId);
        if (!ngo?.ngoProfile || !await prisma.donation.findUnique({ where: { id: claim.donationId } })) throw new Error("Referenced NGO or donation does not exist.");
        if (!Object.values(ClaimStatus).includes(claim.status as ClaimStatus)) throw new Error("Invalid claim status.");
        await prisma.claim.create({ data: { id: claim.id, donationId: claim.donationId, ngoProfileId: ngo.ngoProfile.id, volunteerProfileId: volunteer?.volunteerProfile?.id, status: claim.status as ClaimStatus, matchScore: claim.matchScore, reservedAt: date(claim.claimedAt), updatedAt: date(claim.updatedAt), assignedAt: claim.assignedAt ? date(claim.assignedAt) : undefined, pickedUpAt: claim.pickedUpAt ? date(claim.pickedUpAt) : undefined, deliveredAt: claim.deliveredAt ? date(claim.deliveredAt) : undefined } });
        report.imported.claims++;
      } catch (error) { report.skipped.push({ collection: "claims", id: claim.id, reason: reason(error) }); }
    }
    for (const notification of source.notifications) {
      const recipients = notification.userId ? accounts.filter((u) => u.id === notification.userId || u.email.toLowerCase() === notification.userId?.toLowerCase()) : accounts.filter((u) => !notification.role || notification.role === "ALL" || u.role === notification.role);
      for (const user of recipients) {
        const id = `${notification.id}:${user.id}`;
        if (await prisma.notification.findUnique({ where: { id } })) continue;
        await prisma.notification.create({ data: { id, userId: user.id, title: notification.title, message: notification.message, href: notification.href.startsWith("/") && !notification.href.startsWith("//") ? notification.href : undefined, type: Object.values(NotificationType).includes(notification.type as NotificationType) ? notification.type as NotificationType : "SYSTEM", readAt: notification.read ? date(notification.createdAt) : null, createdAt: date(notification.createdAt) } });
        report.imported.notifications++;
      }
    }
    const reportDir = path.resolve("data/migration-reports");
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(path.join(reportDir, `import-${Date.now()}.json`), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    console.log("Import finished. The source JSON was not modified. Existing database rows were not overwritten.");
  } finally { await prisma.$disconnect(); }
}

main().catch(() => { console.error("Import failed. Check source data and database availability; source files were preserved."); process.exitCode = 1; });
