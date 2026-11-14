"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { profileService, impactService, type ProfileBundle, type DonorImpactOverview } from "@/services";
import { DONOR_USER_ID, DONOR_PROFILE_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";

export function DonorProfileView() {
  const tx = useUiText();
  const [data, setData] = useState<{ profile: ProfileBundle; impact: DonorImpactOverview }>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, { signal: controller.signal }), impactService.getDonorOverview(DONOR_PROFILE_ID, DONOR_VIEWER, { signal: controller.signal })])
      .then(([profile, impact]) => { setData({ profile, impact }); setError(""); })
      .catch(() => { if (!controller.signal.aborted) setError("Profile could not load. Please retry."); });
    return () => controller.abort();
  }, [retry]);
  const profile = data?.profile;
  const name = profile?.donorProfile?.organizationName || profile?.user.displayName || "Donor account";
  return <PortalShell role="donor" activeHref={ROUTES.donor.profile} title={tx("Donor profile")} description={tx("Your saved account details and recorded food rescue impact.")} profileName={name} avatarInitials={getInitials(name)} notificationHref={ROUTES.donor.notifications} actions={<ButtonLink href={ROUTES.donor.editProfile} size="sm" variant="outline"><UiText source={"Edit profile"} /></ButtonLink>}>
    <div className="grid gap-5">
      {!data && !error && <p role="status">{tx("Loading profile…")}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4">{tx(error)} <Button size="sm" onClick={() => setRetry(retry + 1)}>{tx("Retry")}</Button></p>}
      {profile && data && <>
        <Card><CardHeader title={name} description={tx(profile.donorProfile?.donorType.toLowerCase().replaceAll("_", " "))} /><CardContent className="grid gap-3 text-sm">
          <p>{tx("Account name:")}{" "}{profile.user.displayName}</p><p>{tx("Email:")}{" "}{profile.user.email}</p><p>{tx("Phone:")}{" "}{profile.user.phone || "Not provided"}</p>
          <p>{tx("Account verification:")}{" "}{tx(profile.donorProfile?.verificationStatus.toLowerCase().replaceAll("_", " ") || "Not available")}</p>
          <p className="text-xs text-muted-600">{tx("Account verification records platform approval. Food safety certification and independent food inspection are not connected.")}</p>
        </CardContent></Card>
        <div className="grid gap-4 sm:grid-cols-3">{[["Donations published", data.impact.totalDonations], ["Meals distributed", data.impact.mealsRescued], ["NGOs supported", data.impact.ngosHelped]].map(([label, value]) => <Card key={label}><CardContent><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-600">{tx(String(label))}</p></CardContent></Card>)}</div>
        <Card><CardHeader title={tx("Pickup addresses")} description={tx("Saved locations used for new donations.")} /><CardContent className="grid gap-3">{profile.addresses.map((address) => <div key={address.id} className="rounded-xl border p-3"><p className="font-bold">{address.label}{address.isPrimary ? tx("· Primary") : ""}</p><p className="mt-1 text-sm">{address.addressLine}, {address.area}, {address.city}</p><p className="mt-1 text-xs text-muted-600">{address.coordinates ? tx("Location pin saved") : tx("Location pin not set")}</p></div>)}<ButtonLink href={ROUTES.donor.addresses} variant="outline">{tx("Manage saved addresses & pins")}</ButtonLink></CardContent></Card>
      </>}
    </div>
  </PortalShell>;
}
