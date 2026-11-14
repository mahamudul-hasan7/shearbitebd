import { loadDatabaseEnv } from "./database-env.mjs";

async function main() {
  loadDatabaseEnv();
  const { prisma } = await import("../src/lib/prisma");
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Usage: npm run db:verify -- account@example.com");
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    if (user.role === "NGO") await prisma.nGOProfile.update({ where: { userId: user.id }, data: { verificationStatus: "VERIFIED" } });
    else if (user.role === "VOLUNTEER") await prisma.volunteerProfile.update({ where: { userId: user.id }, data: { verificationStatus: "VERIFIED" } });
    else if (user.role === "DONOR") await prisma.donorProfile.update({ where: { userId: user.id }, data: { verificationStatus: "VERIFIED" } });
    else throw new Error("This role does not have a verification profile.");
    console.log("The selected account profile is verified. Refresh its portal to continue.");
  } finally { await prisma.$disconnect(); }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Verification failed."); process.exitCode = 1; });
