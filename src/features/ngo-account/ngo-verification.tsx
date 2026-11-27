"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronRight,
  Clock3,
  FileCheck2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMockAuth } from "@/features/auth/mock-auth";
import { VerificationDocumentPanel } from "@/features/verification/document-panel";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";

const VERIFICATION_STEPS = [
  {
    icon: FileCheck2,
    title: "1. Submit official NGO registration",
    desc: "Upload Social Services or NGO Affairs Bureau registration certificate (PDF, PNG, or JPG).",
  },
  {
    icon: Clock3,
    title: "2. Operator review & audit",
    desc: "ShareBite BD administrators verify organization legitimacy and active service areas.",
  },
  {
    icon: BadgeCheck,
    title: "3. Claim food batches",
    desc: "Verified NGOs unlock instant surplus meal claims, volunteer dispatch, and impact tracking.",
  },
];

export function NGOVerification() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const name = session?.displayName || "NGO account";
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NG";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.verification}
      title={tx("Account verification")}
      description={tx(
        "Upload official NGO documents to unlock surplus food reservations and rider dispatch.",
      )}
      profileName={name}
      avatarInitials={initials}
      notificationHref={ROUTES.ngo.notifications}
      actions={
        <ButtonLink
          href={ROUTES.ngo.profile}
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="size-4" />}
        >
          {tx("Back to profile")}
        </ButtonLink>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <VerificationDocumentPanel />

        <div className="space-y-4">
          <Card className="border-slate-200/90">
            <CardHeader
              title={tx("Verification steps")}
              description={tx("How NGO approval works on ShareBite BD.")}
            />
            <CardContent className="grid gap-4 pt-0">
              {VERIFICATION_STEPS.map((step) => (
                <div
                  key={step.title}
                  className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-3.5"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-800 ring-1 ring-sky-300/50">
                    <step.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-900">
                      {tx(step.title)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-600">
                      {tx(step.desc)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="divide-y divide-white/55 overflow-hidden">
            <Link
              href={ROUTES.ngo.profile}
              className="icon-interactive flex items-center gap-3 p-4 transition-colors hover:bg-white/45"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-[#2c4869]">
                <Building2 className="size-4" />
              </span>
              <span className="flex-1 text-sm font-semibold text-ink-900">
                {tx("Organization profile")}
              </span>
              <ChevronRight className="size-4 text-muted-400" />
            </Link>
            <Link
              href={ROUTES.ngo.team}
              className="icon-interactive flex items-center gap-3 p-4 transition-colors hover:bg-white/45"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/75 text-[#2c4869] ring-1 ring-white/90">
                <UsersRound className="size-4" />
              </span>
              <span className="flex-1 text-sm font-semibold text-ink-900">
                {tx("Team & permissions")}
              </span>
              <ChevronRight className="size-4 text-muted-400" />
            </Link>
            <div className="flex items-center gap-2.5 bg-emerald-50/60 p-4 text-xs font-medium text-emerald-900">
              <ShieldCheck className="size-4 shrink-0 text-emerald-700" />
              <span>
                {tx("Documents are stored securely for platform verification review.")}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}
