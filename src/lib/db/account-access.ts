import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api";
// Account access changes and new operational work share this owner lock.
export async function lockActiveAccount(
  tx: Prisma.TransactionClient,
  id: string,
) {
  await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR NO KEY UPDATE`;
  const row = await tx.user.findUnique({
    where: { id },
    select: { isActive: true, deletedAt: true },
  });
  if (!row?.isActive || row.deletedAt)
    throw new ApiError(
      401,
      "This account no longer has access. Sign in with an active account.",
    );
}
