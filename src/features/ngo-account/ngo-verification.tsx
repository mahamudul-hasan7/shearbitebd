"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { profileService, type ProfileBundle } from "@/services/profile.service";
import { NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER } from "@/features/ngo-account/shared";
import { ROUTES } from "@/lib/routes";
export function NGOVerification() {
  const tx = useUiText();
  const [profile, setProfile] = useState<ProfileBundle>();
  const [error, setError] = useState("");
  useEffect(() => { const controller = new AbortController(); profileService.getOwnProfile(NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER, { signal: controller.signal }).then(setProfile).catch(() => { if (!controller.signal.aborted) setError("Verification details could not load. Reload to retry."); }); return () => controller.abort(); }, []);
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.verification} title={tx("Account verification")} description={tx("Current verification record for your organization.")} notificationHref={ROUTES.ngo.notifications}><Card><CardHeader title={tx("Organization verification")} /><CardContent className="grid gap-3 text-sm">
    {error && <p role="alert">{tx(error)}</p>}{!profile && !error && <p role="status">{tx("Loading verification…")}</p>}{profile && <><p>{tx("Status:")}{" "}{tx(profile.ngoProfile?.verificationStatus.toLowerCase().replaceAll("_", " "))}</p><p>{tx("Registration number:")}{" "}{profile.ngoProfile?.registrationNumber || "Not provided"}</p><p>{tx("Account contact:")}{" "}{profile.user.email}</p></>}
    <p className="text-xs text-muted-600">{tx("An administrator reviews your account details. Original documents must be checked separately. Account verification does not certify the safety of an individual food batch.")}</p>
  </CardContent></Card></PortalShell>;
}
