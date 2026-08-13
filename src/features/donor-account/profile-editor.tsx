"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, RefreshCw, Save } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";
import { asyncState, profileService, toServiceError, type AsyncState, type ProfileBundle } from "@/services";
import type { DonorProfile } from "@/types/domain";

interface FormData { displayName: string; organizationName: string; email: string; phone: string; donorType: DonorProfile["donorType"] }
const EMPTY_FORM: FormData = { displayName: "", organizationName: "", email: "", phone: "", donorType: "CAFETERIA" };

export function ProfileEditor() {
  const [state, setState] = useState<AsyncState<ProfileBundle>>(() => asyncState.loading());
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, { signal: controller.signal }).then((profile) => {
      setState(asyncState.success(profile));
      setForm({ displayName: profile.user.displayName, organizationName: profile.donorProfile?.organizationName ?? "", email: profile.user.email, phone: profile.user.phone ?? "", donorType: profile.donorProfile?.donorType ?? "INDIVIDUAL" });
    }).catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setSaved(false); setErrors({});
    try {
      const updated = await profileService.updateDonorProfile(DONOR_USER_ID, form, DONOR_VIEWER);
      setState(asyncState.success(updated)); setSaved(true);
    } catch (error: unknown) {
      const serviceError = toServiceError(error);
      setErrors(serviceError.fieldErrors ?? { form: serviceError.message });
    } finally { setSaving(false); }
  }

  const profile = state.data;
  const name = profile?.user.displayName ?? "UIU Cafeteria";
  return <PortalShell role="donor" activeHref={ROUTES.donor.profile} title="Edit profile" description="Keep public identity and private rescue contact details accurate." profileName={name} profileDescription="Verified food donor" avatarInitials={getInitials(name)} notificationHref={ROUTES.donor.notifications} actions={<ButtonLink href={ROUTES.donor.profile} variant="ghost" size="sm">Cancel</ButtonLink>}>
    {state.status === "loading" && !profile && <Skeleton className="h-[34rem]" />}
    {state.status === "error" && !profile && <EmptyState icon={RefreshCw} title="Profile could not load" description={state.error.message} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
    {profile && <form onSubmit={submit} className="grid gap-5"><Card><CardHeader title="Donor details" description="Contact information remains private until a verified rescue needs coordination." /><CardContent className="grid gap-5 sm:grid-cols-2"><Input label="Display name" value={form.displayName} error={errors.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /><Input label="Organization name" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} /><Select label="Donor type" value={form.donorType} onChange={(event) => setForm({ ...form, donorType: event.target.value as DonorProfile["donorType"] })}><option value="INDIVIDUAL">Individual</option><option value="CAFETERIA">Cafeteria</option><option value="RESTAURANT">Restaurant</option><option value="BAKERY">Bakery</option><option value="EVENT_ORGANIZER">Event organizer</option></Select><span /><Input label="Email address" type="email" value={form.email} error={errors.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Input label="Phone number" value={form.phone} error={errors.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></CardContent></Card>{errors.form && <Alert tone="danger" title="Profile could not be saved" description={errors.form} />}{saved && <Alert tone="success" title="Profile updated" description="Your changes are now reflected in the frontend mock state." />}<div className="flex justify-end"><Button type="submit" disabled={saving} leftIcon={saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}>{saving ? "Saving…" : "Save changes"}</Button></div></form>}
  </PortalShell>;
}
