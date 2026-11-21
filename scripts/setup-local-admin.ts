import { randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { loadDatabaseEnv } from "./database-env.mjs";

const username = "admin";
const password = "admin123";
const accessFile = ".local-postgres/admin-access.json";

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

  let previousEmail: string | undefined;
  try {
    const previous = JSON.parse(await readFile(accessFile, "utf8"));
    if (typeof previous.email === "string") previousEmail = previous.email;
  } catch {
    /* Older installations may not have an access file. */
  }
  const { prisma } = await import("../src/lib/prisma");
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(183040218)`;
      const named = await tx.user.findUnique({ where: { username } });
      if (named && named.role !== "ADMIN")
        throw new Error(
          "The admin username belongs to another account. No account roles were changed.",
        );
      if (named && !process.argv.includes("--reset")) return null;

      // Adopt only the previous setup's account or its canonical local email.
      // Custom admin accounts and ordinary user accounts remain unchanged.
      const previous =
        !named && previousEmail
          ? await tx.user.findFirst({
              where: { email: previousEmail, role: "ADMIN" },
            })
          : null;
      const canonical =
        !named && !previous
          ? await tx.user.findFirst({
              where: { email: "admin@sharebite.local", role: "ADMIN" },
            })
          : null;
      const existing = named || previous || canonical;
      let email = existing?.email || "admin@sharebite.local";
      if (
        !existing &&
        (await tx.user.findUnique({ where: { email }, select: { id: true } }))
      )
        email = `admin-${randomBytes(4).toString("hex")}@sharebite.local`;
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: { username, password, isActive: true },
          })
        : await tx.user.create({
            data: {
              email,
              username,
              password,
              displayName: "ShareBite Admin",
              role: "ADMIN",
            },
          });
      if (existing)
        await tx.authSession.deleteMany({ where: { userId: user.id } });
      const access = { username, email: user.email, password };
      await mkdir(".local-postgres", { recursive: true });
      await writeFile(accessFile, JSON.stringify(access, null, 2) + "\n", {
        mode: 0o600,
      });
      return { ...access, changed: Boolean(existing) };
    });
    if (result)
      console.log(
        `Local admin ${result.changed ? "updated" : "created"}.\nUsername: ${result.username}\nPassword: ${result.password}\nLogin: /login\nSaved in ${accessFile}`,
      );
    else
      console.log(
        "Local admin is already configured. Username: admin. Use --reset to restore the local login password.",
      );
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
