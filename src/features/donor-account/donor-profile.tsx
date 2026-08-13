"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronRight, CircleHelp, Edit3, LockKeyhole, LogOut, MapPin, RefreshCw, ShieldCheck, Soup, UsersRound } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useMockAuth } from "@/features/auth/mock-auth";
import { DONOR_PROFILE_ID, DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { VerificationStatus } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { asyncState, impactService, notificationService, profileService, toServiceError, type AsyncState, type ProfileBundle } from "@/services";

interface ProfileData { profile: ProfileBundle; mealsRescued: number; ngosHelped: number; unread: number }

const accountLinks = [
  { href: ROUTES.donor.addresses, label: "Saved addresses", description: "Manage pickup locations", icon: MapPin },
  { href: ROUTES.donor.settings, label: "Privacy & security", description: "Notification and account preferences", icon: LockKeyhole },
  { href: ROUTES.donor.support, label: "Help & support", description: "FAQs and contact support", icon: CircleHelp },
];

export function DonorProfileView() {
  const [state, setState] = useState<AsyncState<ProfileData>>(() => asyncState.loading());
  const [retryKey, setRetryKey] = useState(0);
  const { signOut } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, options),
      impactService.getDonorOverview(DONOR_PROFILE_ID, DONOR_VIEWER, options),
      notificationService.listForUser(DONOR_USER_ID, DONOR_VIEWER, options),
    ]).then(([profile, impact, notifications]) => setState(asyncState.success({ profile, mealsRescued: impact.mealsRescued, ngosHelped: impact.ngosHelped, unread: notifications.filter((item) => !item.readAt).length }))).catch((error: unknown) => {
      if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [retryKey]);

  const data = state.data;
  const donor = data?.profile.donorProfile;
  const name = data?.profile.user.displayName ?? "UIU Cafeteria";

  function logout() {
    signOut();
    router.replace(ROUTES.auth.login);
  }

  return <PortalShell role="donor" activeHref={ROUTES.donor.profile} title="Your profile" description="Manage your donor identity, pickup locations, privacy, and support." profileName={name} profileDescription="Verified food donor" avatarInitials={getInitials(name)} notificationHref={ROUTES.donor.notifications} unreadNotifications={data?.unread ?? 0} actions={data ? <ButtonLink href={ROUTES.donor.editProfile} variant="outline" size="sm" leftIcon={<Edit3 className="size-4" />}>Edit profile</ButtonLink> : undefined}>
    {state.status === "loading" && !data && <SkeletonGroup label="Loading donor profile" className="grid gap-5"><Skeleton className="h-52" /><div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-36" /><Skeleton className="h-36" /><Skeleton className="h-36" /></div></SkeletonGroup>}
    {state.status === "error" && !data && <EmptyState icon={RefreshCw} title="Profile could not load" description={state.error.message} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
    {data && donor && <div className="grid gap-6">
      <Card className="overflow-hidden"><div className="h-24 bg-gradient-to-r from-brand-700 via-brand-600 to-accent-500" /><div className="px-5 pb-6 sm:px-7"><div className="-mt-10 flex flex-wrap items-end justify-between gap-4"><Avatar initials={getInitials(name)} size="lg" className="ring-4 ring-white" /><Badge tone={donor.verificationStatus === VerificationStatus.VERIFIED ? "success" : "warning"}><ShieldCheck className="size-3.5" />{donor.verificationStatus === VerificationStatus.VERIFIED ? "Verified donor" : "Verification pending"}</Badge></div><h2 className="mt-4 text-2xl font-black text-ink-900">{donor.organizationName ?? name}</h2><p className="mt-1 text-sm font-bold text-brand-700">{donor.donorType.replaceAll("_", " ").toLowerCase()}</p><div className="mt-5 grid gap-3 text-sm text-muted-600 sm:grid-cols-2"><p><span className="font-bold text-ink-700">Contact:</span> {data.profile.user.phone}</p><p><span className="font-bold text-ink-700">Email:</span> {data.profile.user.email}</p></div></div></Card>
      <section aria-label="Donor impact summary" className="grid gap-4 sm:grid-cols-3"><StatCard label="Total donations" value={String(donor.totalDonations)} icon={Soup} helper="All-time mock history" /><StatCard label="Meals rescued" value={data.mealsRescued.toLocaleString()} icon={UsersRound} tone="accent" helper="Recorded estimates" /><StatCard label="NGOs supported" value={String(data.ngosHelped)} icon={ShieldCheck} tone="success" helper="Verified organizations" /></section>
      <Card className="divide-y divide-line">{accountLinks.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-4 p-5 transition hover:bg-brand-50"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><item.icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block font-black text-ink-900">{item.label}</span><span className="mt-1 block text-sm text-muted-600">{item.description}</span></span><ChevronRight className="size-5 text-muted-400" /></Link>)}</Card>
      <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3"><Bell className="mt-0.5 size-5 text-brand-700" /><div><p className="font-black text-ink-900">Account session</p><p className="mt-1 text-sm text-muted-600">Signing out removes only this browser&apos;s mock session.</p></div></div><Button variant="danger" size="sm" leftIcon={<LogOut className="size-4" />} onClick={logout}>Log out</Button></div></Card>
    </div>}
  </PortalShell>;
}
