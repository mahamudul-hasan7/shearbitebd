"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { profileService, type ProfileBundle } from "@/services/profile.service";
import { useMockAuth } from "@/features/auth/mock-auth";
import { ROUTES } from "@/lib/routes";

export function VolunteerIdCardView() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const [data, setData] = useState<ProfileBundle>();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    profileService.getOwnProfile("", { userId: session.id, role: session.role }, { signal: controller.signal }).then(setData).catch(() => { if (!controller.signal.aborted) setError("Volunteer profile could not load. Reload to retry."); });
    return () => controller.abort();
  }, [session]);
  return <PortalShell role="volunteer" activeHref={ROUTES.volunteer.idCard} title={tx("Volunteer profile")} description={tx("Saved identity for this project account.")} notificationHref={ROUTES.volunteer.notifications}>
    <Card><CardHeader title={data?.user.displayName || "Volunteer account"} /><CardContent className="grid gap-3 text-sm">
      {!data && !error && <p role="status">{tx("Loading profile…")}</p>}{error && <p role="alert">{tx(error)}</p>}
      {data && <><p>{tx("Project profile ID:")}{" "}{data.volunteerProfile?.id}</p><p>{tx("Email:")}{" "}{data.user.email}</p><p>{tx("Phone:")}{" "}{data.user.phone || "Not provided"}</p><p>{tx("Account verification:")}{" "}{tx(data.volunteerProfile?.verificationStatus.toLowerCase().replaceAll("_", " "))}</p><p>{tx("Transport:")}{" "}{tx(data.volunteerProfile?.transportMethod.toLowerCase().replaceAll("_", " "))}</p><p>{tx("Completed handovers:")}{" "}{data.volunteerProfile?.completedRescues || 0}</p></>}
      <p className="rounded-xl bg-slate-50 p-3 text-xs text-muted-600">{tx("This is a project account profile. A government ID, BFSA certificate and independently verifiable QR credential are not issued by this app.")}</p>
    </CardContent></Card>
  </PortalShell>;
}
