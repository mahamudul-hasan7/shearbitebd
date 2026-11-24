import type { VerificationStatus } from "@prisma/client";
import { loadDatabaseEnv } from "./database-env.mjs";

async function main() {
  loadDatabaseEnv();
  const { prisma } = await import("../src/lib/prisma");
  try {
    const count = await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { donorProfile: { verificationStatus: { in: ["PENDING", "NOT_SUBMITTED"] } } },
            { ngoProfile: { verificationStatus: { in: ["PENDING", "NOT_SUBMITTED"] } } },
            { volunteerProfile: { verificationStatus: { in: ["PENDING", "NOT_SUBMITTED"] } } },
          ],
        },
        orderBy: { id: "asc" },
      });
      let approved = 0;
      for (const user of users) {
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
        const update = {
          where: { userId: user.id, user: { isActive: true, deletedAt: null }, verificationStatus: { in: ["PENDING", "NOT_SUBMITTED"] as VerificationStatus[] } },
          data: { verificationStatus: "VERIFIED" as const },
        };
        const result = user.role === "DONOR" ? await tx.donorProfile.updateMany(update)
          : user.role === "NGO" ? await tx.nGOProfile.updateMany(update)
          : await tx.volunteerProfile.updateMany(update);
        if (!result.count) continue;
        await tx.notification.create({ data: {
          userId: user.id, type: "SYSTEM", title: "Account approved",
          message: "Your account has been approved automatically. You can start using it now.",
          href: `/${user.role.toLowerCase()}/dashboard`,
        } });
        approved += result.count;
      }
      return approved;
    }, { timeout: 30_000 });
    console.log(`Approved ${count} registered accounts.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error("Account approval could not finish. Run database setup again.");
  process.exitCode = 1;
});
