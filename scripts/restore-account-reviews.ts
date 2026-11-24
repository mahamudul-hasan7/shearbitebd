import type { VerificationStatus } from "@prisma/client";
import { loadDatabaseEnv } from "./database-env.mjs";

async function main() {
  loadDatabaseEnv();
  const { prisma } = await import("../src/lib/prisma");
  try {
    const count = await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: {
          role: { in: ["DONOR", "NGO", "VOLUNTEER"] },
          isActive: true,
          deletedAt: null,
          email: { notIn: ["donor@sharebite.demo", "ngo@sharebite.demo", "volunteer@sharebite.demo"] },
          notifications: { some: { title: "Account approved", message: { in: [
            "Your account was approved automatically at registration.",
            "Your account has been approved automatically. You can start using it now.",
          ] } } },
        },
        orderBy: { id: "asc" },
      });
      let restored = 0;
      for (const user of users) {
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
        if (await tx.accountReview.count({ where: { targetUserId: user.id, status: "VERIFIED" } })) continue;
        if (await tx.notification.count({ where: { userId: user.id, title: "Account review required" } })) continue;
        const update = {
          where: { userId: user.id, user: { isActive: true, deletedAt: null }, verificationStatus: "VERIFIED" as VerificationStatus },
          data: { verificationStatus: "PENDING" as const },
        };
        const result = user.role === "DONOR" ? await tx.donorProfile.updateMany(update)
          : user.role === "NGO" ? await tx.nGOProfile.updateMany(update)
          : await tx.volunteerProfile.updateMany({
            ...update, data: { ...update.data, isOnDuty: false, dutyStartedAt: null, dutyVersion: { increment: 1 } },
          });
        if (!result.count) continue;
        await tx.notification.create({ data: {
          userId: user.id, type: "SYSTEM", title: "Account review required",
          message: "Your account needs administrator verification before you can continue.",
          href: user.role === "VOLUNTEER" ? "/volunteer/id-card" : user.role === "NGO" ? "/ngo/verification" : "/donor/profile",
        } });
        restored += result.count;
      }
      return restored;
    }, { timeout: 30_000 });
    console.log(`Restored administrator review for ${count} automatically approved accounts.`);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(() => {
  console.error("Account review setup could not finish. Run database setup again.");
  process.exitCode = 1;
});
