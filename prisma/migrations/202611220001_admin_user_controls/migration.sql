ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "accessVersion" INTEGER NOT NULL DEFAULT 0;
CREATE TYPE "UserAccessAction" AS ENUM ('BAN', 'UNBAN', 'DELETE');
CREATE TABLE "user_access_audits" (
 "id" TEXT NOT NULL, "targetUserId" TEXT NOT NULL, "actorUserId" TEXT NOT NULL,
 "actorLabel" TEXT NOT NULL, "action" "UserAccessAction" NOT NULL, "note" TEXT NOT NULL,
 "submissionKey" TEXT NOT NULL, "previousVersion" INTEGER NOT NULL, "previousActive" BOOLEAN NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "user_access_audits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_access_audits_submissionKey_key" ON "user_access_audits"("submissionKey");
CREATE INDEX "user_access_audits_targetUserId_createdAt_idx" ON "user_access_audits"("targetUserId", "createdAt");
ALTER TABLE "user_access_audits" ADD CONSTRAINT "user_access_audits_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_access_audits" ADD CONSTRAINT "user_access_audits_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
