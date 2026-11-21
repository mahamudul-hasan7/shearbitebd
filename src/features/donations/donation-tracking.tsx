"use client";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RescueProgress } from "@/components/progress/rescue-progress";
import { RescueLocationMap } from "@/components/maps/rescue-location-map";
import { HandoverCodePanel } from "@/components/donation/handover-code-panel";
import { RescueNextAction } from "@/components/rescue/rescue-next-action";
import { RescueContactCard } from "@/components/rescue/rescue-contact-card";
import { rescueNextStep } from "@/lib/rescue-next-step";
import { ROUTES } from "@/lib/routes";
import { useDonationTracking } from "./use-donation-tracking";
import { formatAddress } from "@/features/claims/claim-presentation";
import styles from "@/components/rescue/rescue-coordination.module.css";
export function DonationTracking({ donationId }: { donationId: string }) {
  const {session} = useMockAuth();
  const tx = useUiText(),
    { language } = useLanguage(),
    { state, refresh } = useDonationTracking(donationId);
  const data = state.data,
    donation = data?.donation,
    claim = data?.claim;
  const model = rescueNextStep({
    role: "donor",
    status: claim?.status || donation?.status || "AVAILABLE",
    routeStage: claim?.routeStage,
  });
  return (
    <PortalShell
      role="donor"
      profileName={session?.displayName || "Donor"}
      activeHref={ROUTES.donor.donations}
      title={tx("Rescue tracking")}
      description={tx(
        "Saved checkpoints show the same food journey across donor, NGO and volunteer accounts.",
      )}
      backHref={ROUTES.donor.donation(donationId)}
      backLabel={tx("Donation details")}
      notificationHref={ROUTES.donor.notifications}
      compactHeader
      actions={
        <Button
          variant="outline"
          onClick={refresh}
          leftIcon={<RefreshCw size={16} />}
        >
          {tx("Refresh")}
        </Button>
      }
    >
      <div className={styles.workspace}>
        {!data && !state.error && (
          <LoadingSpinner label={tx("Loading rescue tracking…")} />
        )}
        {state.error && (
          <div role="alert" data-error="true" className={styles.notice}>
            <p>
              {tx(
                data
                  ? "Showing saved tracking details. Refresh to reconnect."
                  : "Rescue tracking could not load. Try again.",
              )}
            </p>
            <Button variant="outline" onClick={refresh}>
              {tx("Try again")}
            </Button>
          </div>
        )}
        {data && donation && (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryInfo}>
                <span className={styles.reference}>
                  {tx("Donation reference")} · {donation.id}
                </span>
                <h2>{donation.title}</h2>
                <p>
                  {tx(
                    "{0} estimated meals",
                    donation.quantity.estimatedMeals.toLocaleString(
                      language === "bn" ? "bn-BD" : "en-BD",
                    ),
                  )}
                </p>
              </div>
            </div>
            <RescueNextAction model={model} stale={state.status === "error"} />
            {claim && claim.status === "ASSIGNED" && (
              <HandoverCodePanel
                key={claim.id}
                claimId={claim.id}
                kind="PICKUP"
              />
            )}
            <RescueProgress
              status={claim?.status || donation.status}
              routeStage={claim?.routeStage}
              publishedAt={donation.publishedAt}
              reservedAt={claim?.reservedAt}
              assignedAt={claim?.assignedAt}
              pickedUpAt={claim?.pickedUpAt}
              deliveredAt={claim?.deliveredAt}
              distributedAt={claim?.distributedAt}
              updatedAt={claim?.updatedAt || donation.updatedAt}
              stale={state.status === "error"}
            />
            <div className={styles.contacts}>
              {data.volunteer && (
                <RescueContactCard
                  title="Assigned volunteer"
                  name={data.volunteer.name}
                  phone={data.volunteer.phone}
                  contact={tx(
                    data.volunteer.transportMethod
                      .toLowerCase()
                      .replaceAll("_", " "),
                  )}
                />
              )}
              {data.receiverNgo && (
                <RescueContactCard
                  title="Receiving NGO"
                  name={data.receiverNgo.name}
                  address={
                    data.deliveryAddress
                      ? formatAddress(data.deliveryAddress)
                      : data.receiverNgo.serviceAreas.join(", ")
                  }
                  contact={data.receiverNgo.contactName}
                  phone={data.receiverNgo.contactPhone}
                />
              )}
            </div>
            <details className={styles.disclosure}>
              <summary>
                {tx("Map & saved handover locations")}
                <ChevronDown size={17} />
              </summary>
              <div>
                <RescueLocationMap
                  pickup={donation.pickup.exactAddress?.coordinates}
                  delivery={data.deliveryAddress?.coordinates}
                  pickupLabel={
                    donation.pickup.exactAddress
                      ? formatAddress(donation.pickup.exactAddress)
                      : donation.pickup.approximateArea
                  }
                  deliveryLabel={
                    data.deliveryAddress
                      ? formatAddress(data.deliveryAddress)
                      : data.receiverNgo?.name
                  }
                />
              </div>
            </details>
            <p className={styles.status}>
              {tx(
                "Route checkpoints are reported by the volunteer. Live GPS and arrival estimates are not measured.",
              )}
            </p>
          </>
        )}
      </div>
    </PortalShell>
  );
}
