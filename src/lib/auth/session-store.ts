import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { accountInclude, toAuthAccount, type AuthAccount } from "@/lib/db/accounts";
import type { MockAuthSession } from "@/features/auth/types";

export const SESSION_COOKIE = "sharebite.session";
const SESSION_LIFETIME = 12 * 60 * 60;
const REMEMBER_LIFETIME = 30 * 24 * 60 * 60;

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function publicUser(user: AuthAccount) {
  return {
    id: user.id, email: user.email, displayName: user.displayName, role: user.role,
    phone: user.phone, profile: user.profile, createdAt: user.createdAt,
    donorProfileId: user.donorProfileId, ngoProfileId: user.ngoProfileId, volunteerProfileId: user.volunteerProfileId,
  };
}

export async function createSession(userId: string, remember: boolean, previousToken?: string) {
  const token = randomBytes(32).toString("hex");
  const maxAge = remember ? REMEMBER_LIFETIME : SESSION_LIFETIME;
  const createdAt = new Date();
  const allowed = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR NO KEY UPDATE`;
    const owner = await tx.user.findUnique({where:{id:userId},select:{isActive:true,deletedAt:true}});
    if (!owner?.isActive || owner.deletedAt) return false;
    if (previousToken) await tx.authSession.deleteMany({ where: { tokenHash: tokenHash(previousToken) } });
    await tx.authSession.deleteMany({ where: { expiresAt: { lte: createdAt } } });
    await tx.authSession.create({ data: { tokenHash: tokenHash(token), userId, createdAt, expiresAt: new Date(createdAt.getTime() + maxAge * 1000) } });
    return true;
  });
  if (!allowed) return undefined;
  return { token, maxAge, createdAt: createdAt.toISOString() };
}

export async function resolveSession(token: string | undefined): Promise<{ user: AuthAccount; session: MockAuthSession } | undefined> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return undefined;
  const stored = await prisma.authSession.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: { include: accountInclude } } });
  if (!stored || stored.expiresAt.getTime() <= Date.now() || !stored.user.isActive || stored.user.deletedAt) return undefined;
  const user = toAuthAccount(stored.user);
  return { user, session: {
    id: user.id, email: user.email, displayName: user.displayName, role: user.role, signedInAt: stored.createdAt.toISOString(),
    donorProfileId: user.donorProfileId, ngoProfileId: user.ngoProfileId, volunteerProfileId: user.volunteerProfileId,
  } };
}

export async function revokeSession(token: string | undefined) {
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
}
