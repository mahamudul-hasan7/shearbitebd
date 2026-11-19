import { randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { loadDatabaseEnv } from "./database-env.mjs";

async function main() {
  loadDatabaseEnv();
  let local: { user: string; password: string };
  try {
    local = JSON.parse(
      await readFile(".local-postgres/credentials.json", "utf8"),
    );
  } catch {
    return;
  }
  const url = new URL(process.env.DATABASE_URL || "postgresql://invalid");
  if (
    url.hostname !== "127.0.0.1" ||
    decodeURIComponent(url.username) !== local.user ||
    decodeURIComponent(url.password) !== local.password ||
    url.pathname !== "/sharebite_bd"
  )
    return;
  const { prisma } = await import("../src/lib/prisma");
  try {
    const access = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(183040218)`;
      if (
        await tx.user.findFirst({
          where: { role: "ADMIN", isActive: true },
          select: { id: true },
        })
      )
        return null;
      let email = "admin@sharebite.local";
      if (await tx.user.findUnique({ where: { email }, select: { id: true } }))
        email = `admin-${randomBytes(4).toString("hex")}@sharebite.local`;
      const password = `Admin1-${randomBytes(12).toString("hex")}`;
      await tx.user.create({
        data: {
          email,
          password,
          displayName: "ShareBite Admin",
          role: "ADMIN",
        },
      });
      await mkdir(".local-postgres", { recursive: true });
      await writeFile(
        ".local-postgres/admin-access.json",
        JSON.stringify({ email, password }, null, 2) + "\n",
        { mode: 0o600 },
      );
      return { email, password };
    });
    if (access)
      console.log(
        `Local admin created.\nEmail: ${access.email}\nPassword: ${access.password}\nSaved privately in .local-postgres/admin-access.json`,
      );
    else console.log("Local admin is already configured.");
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Local admin setup failed.",
  );
  process.exitCode = 1;
});
