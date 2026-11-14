import { loadDatabaseEnv } from "./database-env.mjs";
loadDatabaseEnv();

async function main() {
  const [id, action, ...words] = process.argv.slice(2);
  if (!id || !action || !words.length) throw new Error('Usage: npm run db:incident -- REPORT_ID UNDER_REVIEW|RESUME|REJECT_FOOD|CLOSE "Review note of at least 12 characters"');
  const { reviewIncident } = await import("../src/lib/db/incidents");
  const { prisma } = await import("../src/lib/prisma");
  try {
    const incident = await reviewIncident(id, { action, note: words.join(" ") }, { label: "Local project operator" });
    console.log(JSON.stringify({ id: incident.id, claimId: incident.claimId, status: incident.status, decision: incident.decision }));
  } finally { await prisma.$disconnect(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Review failed."); process.exitCode = 1; });
