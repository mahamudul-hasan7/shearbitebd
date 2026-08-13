"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Eye, FileText, Info, LockKeyhole, MapPin, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";
import { accountService, asyncState, profileService, toServiceError, type AsyncState } from "@/services";
import type { AppLanguage, TextSizePreference, UserPreferences } from "@/types/domain";

interface SettingsData { preferences: UserPreferences; name: string }

export function DonorSettings() {
  const [state, setState] = useState<AsyncState<SettingsData>>(() => asyncState.loading());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([accountService.getPreferences(DONOR_USER_ID, DONOR_VIEWER, options), profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, options)]).then(([preferences, profile]) => setState(asyncState.success({ preferences, name: profile.user.displayName }))).catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  async function update(input: Partial<Omit<UserPreferences, "userId" | "updatedAt">>) {
    if (!state.data) return;
    setSaving(true); setSaved(false);
    try {
      const preferences = await accountService.updatePreferences(DONOR_USER_ID, input, DONOR_VIEWER);
      setState(asyncState.success({ ...state.data, preferences })); setSaved(true);
    } finally { setSaving(false); }
  }

  const data = state.data;
  const name = data?.name ?? "UIU Cafeteria";
  return <PortalShell role="donor" activeHref={ROUTES.donor.profile} title="Settings" description="Control rescue alerts, accessibility, language, and privacy information." profileName={name} profileDescription="Verified food donor" avatarInitials={getInitials(name)} notificationHref={ROUTES.donor.notifications}>
    {state.status === "loading" && !data && <div className="grid gap-5"><Skeleton className="h-64" /><Skeleton className="h-52" /></div>}
    {state.status === "error" && !data && <EmptyState icon={RefreshCw} title="Settings could not load" description={state.error.message} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
    {data && <div className="grid gap-5 lg:grid-cols-2">
      {saved && <Alert className="lg:col-span-2" tone="success" title="Preference saved" description="The active frontend mock state now uses your updated choice." />}
      <Card><CardHeader title="Notification preferences" description="Choose how ShareBite BD sends rescue updates." /><CardContent className="grid gap-3"><Switch label="Push notifications" description="Urgent, pickup, delivery, NGO match, and volunteer updates." checked={data.preferences.pushNotifications} disabled={saving} onCheckedChange={(pushNotifications) => update({ pushNotifications })} /><Switch label="Email notifications" description="Receive important rescue and system summaries by email." checked={data.preferences.emailNotifications} disabled={saving} onCheckedChange={(emailNotifications) => update({ emailNotifications })} /></CardContent></Card>
      <Card><CardHeader title="Location permission" description="Location improves nearby NGO suggestions; exact pickup details remain protected." /><CardContent><div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"><span className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success-strong"><MapPin className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-black text-ink-900">Browser location</p><p className="mt-1 text-xs text-muted-600">Current frontend permission display</p></div><Badge tone={data.preferences.locationPermission === "GRANTED" ? "success" : "warning"}>{data.preferences.locationPermission.toLowerCase().replace("_", " ")}</Badge></div><p className="mt-4 text-xs leading-5 text-muted-600">Permission is shown for transparency. Browser permission changes must be made in your browser settings.</p></CardContent></Card>
      <Card><CardHeader title="Language & text" description="Accessibility preferences for the account interface." /><CardContent className="grid gap-4"><Select label="Language" value={data.preferences.language} disabled={saving} onChange={(event) => update({ language: event.target.value as AppLanguage })}><option value="EN">English</option><option value="BN">বাংলা</option></Select><Select label="Text size" value={data.preferences.textSize} disabled={saving} onChange={(event) => update({ textSize: event.target.value as TextSizePreference })}><option value="SMALL">Small</option><option value="MEDIUM">Medium</option><option value="LARGE">Large</option></Select><div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900"><Eye className="mt-0.5 size-5 shrink-0" /><p>Theme controls follow the current design system. Dark mode is not offered until full theme support is available.</p></div></CardContent></Card>
      <Card><CardHeader title="Information & policies" description="Review how the frontend demo handles data and service terms." /><div className="divide-y divide-line">{[{label:"Privacy policy",icon:LockKeyhole},{label:"Terms of service",icon:FileText},{label:"About ShareBite BD",icon:Info}].map((item) => <Link key={item.label} href={`${ROUTES.donor.support}#${item.label.toLowerCase().replaceAll(" ", "-")}`} className="flex items-center gap-3 p-5 transition hover:bg-brand-50"><item.icon className="size-5 text-brand-700" /><span className="flex-1 font-bold text-ink-900">{item.label}</span><ChevronRight className="size-5 text-muted-400" /></Link>)}</div></Card>
      <Alert className="lg:col-span-2" tone="info" title="Privacy-first account controls" description="ShareBite BD coordinates food rescue only. There are no payment methods, card details, donation funds, or fundraising options in this portal." />
    </div>}
  </PortalShell>;
}
