import { loadDatabaseEnv } from "../scripts/database-env.mjs";
import { DEMO_ACCOUNTS } from "../src/features/auth/demo-accounts";

async function main() {
  loadDatabaseEnv();
  const { prisma } = await import("../src/lib/prisma");
  const { createAccount } = await import("../src/lib/db/accounts");
  try {
    for (const [index, account] of DEMO_ACCOUNTS.entries()) {
      if (await prisma.user.findUnique({ where: { email: account.email } })) continue;
      await createAccount({ ...account, phone: `0171100000${index + 1}`, verified: true,
        profile: { address: "United City, Badda, Dhaka", city: "Dhaka", organizationName: account.displayName, registrationNumber: "DEMO-NGO-001", donorType: "CAFETERIA", transportMethod: "BICYCLE", serviceAreas: ["Badda"] } });
    }
    console.log("Demo accounts are ready. No existing accounts, donations or claims were deleted or overwritten.");
  } finally { await prisma.$disconnect(); }
}

main().catch(() => { console.error("Demo seeding failed. Check database availability and conflicting phone numbers."); process.exitCode = 1; });
