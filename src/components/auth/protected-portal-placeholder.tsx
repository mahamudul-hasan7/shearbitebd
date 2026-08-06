"use client";

import { ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockAuth } from "@/features/auth/mock-auth";
import { USER_ROLE_META, UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";

const PHASE_LABELS: Record<UserRole, string> = {
  [UserRole.DONOR]: "The complete donor dashboard will be implemented in Phase 4.",
  [UserRole.NGO]: "The complete NGO dashboard will be implemented in Phase 9.",
  [UserRole.VOLUNTEER]: "Volunteer operations are outside the current frontend MVP focus.",
  [UserRole.ADMIN]: "Administrator access is invite-only and backend-created.",
};

export function ProtectedPortalPlaceholder({ role }: { role: UserRole }) {
  const { session, signOut } = useMockAuth();
  const router = useRouter();
  const roleMeta = USER_ROLE_META[role];
  const previewRoute = role === UserRole.DONOR ? ROUTES.preview.donor : role === UserRole.NGO ? ROUTES.preview.ngo : ROUTES.designSystem;

  function handleSignOut() {
    signOut();
    router.replace(ROUTES.auth.login);
  }

  return (
    <main className="min-h-screen py-5 sm:py-8">
      <PageContainer>
        <div className="flex flex-wrap items-center justify-between gap-4"><BrandLogo /><Badge tone="info">Protected mock route</Badge></div>
        <Card className="surface-grid mx-auto mt-12 max-w-3xl overflow-hidden p-6 text-center sm:p-10">
          <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand-600 text-white shadow-float"><ShieldCheck className="size-10" /></span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-accent-600">{roleMeta.label}</p>
          <h1 className="mt-3 text-3xl font-black text-brand-900 sm:text-5xl">Mock access confirmed</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-600 sm:text-base">
            Signed in as <span className="font-bold text-ink-900">{session?.displayName}</span> ({session?.email}). {PHASE_LABELS[role]}
          </p>
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-info/20 bg-info-soft p-4 text-left text-sm leading-6 text-info-strong">
            This guard demonstrates frontend navigation only. Real authorization must be enforced by the backend.
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={previewRoute} variant="outline" rightIcon={<ArrowRight className="size-4" />}>View UI preview</ButtonLink>
            <Button variant="ghost" leftIcon={<LogOut className="size-4" />} onClick={handleSignOut}>Log out</Button>
          </div>
        </Card>
      </PageContainer>
    </main>
  );
}
