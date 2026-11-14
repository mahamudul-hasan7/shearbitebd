"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { DeliveryClaimSummary } from "@/features/delivery/delivery-claim-summary";
import { IncidentPanel } from "@/features/incidents/incident-panel";
import { useMockAuth } from "@/features/auth/mock-auth";
import { ROUTES } from "@/lib/routes";
import { claimService, toServiceError, type ClaimCoordinationDetails } from "@/services";

export function IncidentReportScreen({ claimId, donationId, role = "ngo" }: { claimId?: string; donationId?: string; role?: "donor" | "ngo" | "volunteer" }) {
  const tx = useUiText();
  const { session } = useMockAuth();
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      let id = claimId;
      if (!id && donationId) id = (await claimService.list({ donationId }))[0]?.id;
      if (!id) throw new Error("An NGO claim is required before you can report a rescue issue.");
      const data = await claimService.getCoordinationDetails(id, {});
      if (donationId && data.donation.id !== donationId) throw new Error("This claim belongs to a different donation.");
      setDetails(data); setError("");
    } catch (caught) { setError(toServiceError(caught).message); }
    finally { setLoading(false); }
  }, [claimId, donationId]);
  useEffect(() => {
    const initial = window.setTimeout(() => { void load(); }, 0);
    const timer = window.setInterval(() => { void load(); }, 10_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [load]);
  const back = role === "donor" ? ROUTES.donor.donation(donationId || details?.donation.id || "")
    : role === "volunteer" ? ROUTES.volunteer.mission(`mission-${claimId || details?.claim.id || ""}`) : ROUTES.ngo.claim(claimId || "");
  return <PortalShell role={role} activeHref={role === "donor" ? ROUTES.donor.donations : role === "volunteer" ? ROUTES.volunteer.dispatches : ROUTES.ngo.claims} title={tx("Rescue incident report")} description={tx("সমস্যা, evidence এবং review history এখানে সংরক্ষিত থাকবে।")} profileName={session?.displayName} avatarInitials={session?.displayName.slice(0, 2).toUpperCase()} backHref={back} backLabel={tx("Return to rescue")}>
    <div className="mx-auto grid max-w-4xl gap-6">
      {loading && <p>{tx("Loading rescue…")}</p>}
      {error && <div role="alert"><p>{tx(error)}</p><Button onClick={() => void load()}>{tx("Try again")}</Button></div>}
      {details && <>
        <DeliveryClaimSummary details={details} />
        {details.claim.status === "DISPUTED" && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 font-semibold">{tx("Incident hold: pickup, delivery ও distribution থামানো আছে। Admin/operator review প্রয়োজন।")}</p>}
        <IncidentPanel key={details.claim.id} claimId={details.claim.id} showForm canReport={["RESERVED", "ASSIGNED", "PICKED_UP", "DELIVERED", "DISPUTED", "DISTRIBUTED"].includes(details.claim.status)} onSubmitted={() => void load()} />
      </>}
      <div><ButtonLink href={back} variant="outline">{tx("Return to rescue")}</ButtonLink></div>
    </div>
  </PortalShell>;
}
