"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, ChevronRight, CircleHelp, Edit3, FileCheck2, LogOut, MapPin, RefreshCw, Settings, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockAuth } from "@/features/auth/mock-auth";
import { NGO_ACCOUNT_PROFILE_ID, NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER } from "@/features/ngo-account/shared";
import { ROUTES } from "@/lib/routes";
import { impactService, notificationService, profileService, toServiceError, type NGOImpactOverview, type ProfileBundle } from "@/services";

const links = [{ href: ROUTES.ngo.team, label: "Team & permissions", icon: UsersRound }, { href: ROUTES.ngo.verification, label: "Verification", icon: FileCheck2 }, { href: ROUTES.ngo.settings, label: "Privacy & settings", icon: Settings }, { href: ROUTES.ngo.support, label: "Help & support", icon: CircleHelp }];

export function NGOProfileView() {
  const [data, setData] = useState<{ profile: ProfileBundle; impact: NGOImpactOverview; unread: number }>();
  const [error, setError] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);
  const { signOut } = useMockAuth(); const router = useRouter();
  useEffect(() => { const controller = new AbortController(); const options = { signal: controller.signal }; Promise.all([profileService.getOwnProfile(NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER, options), impactService.getNgoOverview(NGO_ACCOUNT_PROFILE_ID, NGO_ACCOUNT_VIEWER, options), notificationService.listForUser(NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER, options)]).then(([profile, impact, notices]) => setData({ profile, impact, unread: notices.filter((item) => !item.readAt).length })).catch((caught) => { if (!controller.signal.aborted) setError(toServiceError(caught).message); }); return () => controller.abort(); }, [retryKey]);
  const ngo = data?.profile.ngoProfile;
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.profile} title="Organization profile" description="Manage public identity, service capacity, team access, verification, and account preferences." profileName={ngo?.organizationName ?? "Hope Foundation"} profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.notifications} unreadNotifications={data?.unread} actions={<ButtonLink href={ROUTES.ngo.editProfile} variant="outline" size="sm" leftIcon={<Edit3 className="size-4" />}>Edit profile</ButtonLink>}>
    {!data && !error && <div className="grid gap-5"><Skeleton className="h-60" /><Skeleton className="h-72" /></div>}
    {error && !data && <EmptyState icon={RefreshCw} title="Profile could not load" description={error} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
    {data && ngo && <div className="grid gap-6"><Card><CardContent><div className="flex flex-wrap items-start gap-5"><Avatar initials="HF" size="lg" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold text-ink-900">{ngo.organizationName}</h2><Badge tone="success"><BadgeCheck className="size-3.5" />Verified NGO</Badge></div><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-600">{ngo.summary}</p><div className="mt-4 flex flex-wrap gap-2">{ngo.serviceAreas.map((area) => <Badge key={area} tone="neutral"><MapPin className="size-3" />{area}</Badge>)}</div></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Completed rescues" value={ngo.completedRescues} /><Metric label="Meals distributed" value={data.impact.mealsDistributed} /><Metric label="People served" value={data.impact.beneficiariesServed} /></div></CardContent></Card><div className="grid gap-6 xl:grid-cols-[1fr_22rem]"><Card><CardContent className="grid gap-5"><section><p className="text-xs font-semibold uppercase tracking-wide text-muted-500">Mission</p><p className="mt-2 text-sm leading-6 text-ink-700">{ngo.mission}</p></section><section><p className="text-xs font-semibold uppercase tracking-wide text-muted-500">Vision</p><p className="mt-2 text-sm leading-6 text-ink-700">{ngo.vision}</p></section><section><p className="text-xs font-semibold uppercase tracking-wide text-muted-500">Public contact</p><p className="mt-2 text-sm text-ink-700">{ngo.publicEmail} · {ngo.publicPhone}</p></section></CardContent></Card><Card className="divide-y divide-line">{links.map((item) => <Link key={item.href} href={item.href} className="icon-interactive flex items-center gap-3 p-4 hover:bg-canvas"><item.icon className="size-5 text-brand-700" /><span className="flex-1 text-sm font-semibold text-ink-900">{item.label}</span><ChevronRight className="size-4 text-muted-400" /></Link>)}</Card></div><div className="flex justify-end"><Button variant="danger" size="sm" leftIcon={<LogOut className="size-4" />} onClick={() => { signOut(); router.replace(ROUTES.auth.login); }}>Log out</Button></div></div>}
  </PortalShell>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-card border border-line bg-canvas p-4"><p className="text-2xl font-bold text-ink-900">{value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-600">{label}</p></div>; }
