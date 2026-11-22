"use client";
import { RescueMapDisclosure } from "@/components/rescue/rescue-map-disclosure";
import { ChevronDown, RefreshCw, ShieldCheck } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { useMockAuth } from "@/features/auth/mock-auth";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { RescueNextAction } from "@/components/rescue/rescue-next-action";
import { RescueContactCard } from "@/components/rescue/rescue-contact-card";
import { rescueNextStep } from "@/lib/rescue-next-step";
import { STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { useNgoClaim } from "./use-ngo-claims";
import { ClaimStatusTimeline } from "./claim-status-timeline";
import { ClaimRoutePreview } from "./claim-route-preview";
import { ClaimVerificationPanel } from "./claim-verification-panel";
import { ClaimActionPanel } from "./claim-action-panel";
import { formatAddress } from "./claim-presentation";
import { IncidentPanel } from "@/features/incidents/incident-panel";
import styles from "@/components/rescue/rescue-coordination.module.css";
export function NGOClaimDetail({ claimId }: { claimId: string }) {
  const tx = useUiText(),
    { language } = useLanguage(),
    { session } = useMockAuth();
  const { state, busy, actionError, actionMessage, retry, releaseClaim } =
    useNgoClaim(claimId);
  const details = state.data,
    claim = details?.claim;
  const model = rescueNextStep({
    role: "ngo",
    status: claim?.status || "RESERVED",
    routeStage: claim?.routeStage,
    receiptRecorded: details?.receiptRecorded,
  });
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.claims}
      title={tx("Claim coordination")}
      description={tx(
        "Follow the saved rescue progress and arrange the next handover.",
      )}
      profileName={session?.displayName || "NGO"}
      notificationHref={ROUTES.ngo.notifications}
      backHref={ROUTES.ngo.claims}
      backLabel={tx("Back to claims")}
      compactHeader
      actions={
        <Button
          variant="outline"
          onClick={retry}
          leftIcon={<RefreshCw size={16} />}
        >
          {tx("Refresh")}
        </Button>
      }
    >
      <div className={styles.workspace}>
        {!details && !state.error && (
          <LoadingSpinner label={tx("Loading claim details")} />
        )}
        {state.error && (
          <div role="alert" className={styles.notice} data-error="true">
            <p>
              {tx(
                details
                  ? "Showing saved claim details. Refresh to reconnect before taking action."
                  : "Claim details could not load. Try again.",
              )}
            </p>
            <Button variant="outline" onClick={retry}>
              {tx("Try again")}
            </Button>
          </div>
        )}
        {details && claim && (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryPhoto}>
                <DonationPhoto
                  donation={details.donation}
                  fill
                  sizes="94px"
                  className="object-cover"
                />
              </div>
              <div className={styles.summaryInfo}>
                <span className={styles.reference}>
                  {tx("Claim reference")} · {claim.id}
                </span>
                <h2>{details.donation.title}</h2>
                <p>{details.donorOrganization}</p>
              </div>
            </div>
            <RescueNextAction
              key={`${claim.status}-${claim.routeStage}-${details.receiptRecorded}`}
              model={model}
              stale={state.status === "error"}
            >
              {model.action === "DELIVERY_CODE" && (
                <a className={styles.jump} href="#handover">
                  {tx("Open delivery code")}
                </a>
              )}
              {model.action === "RECEIPT" && (
                <ButtonLink href={ROUTES.ngo.confirmDelivery(claim.id)}>
                  {tx("Record delivery receipt")}
                </ButtonLink>
              )}
              {model.action === "DISTRIBUTION" && (
                <ButtonLink href={ROUTES.ngo.distribution(claim.id)}>
                  {tx("Record distribution")}
                </ButtonLink>
              )}
              {details.volunteer?.phone &&
                ["ASSIGNED", "PICKED_UP"].includes(claim.status) && (
                  <a
                    className={styles.jump}
                    href={`tel:${details.volunteer.phone}`}
                  >
                    {tx("Call volunteer")}
                  </a>
                )}
              {claim.status === "DISTRIBUTED" && (
                <ButtonLink href={ROUTES.ngo.impact}>
                  {tx("View impact")}
                </ButtonLink>
              )}
            </RescueNextAction>
            {actionError && (
              <p role="alert" className={styles.notice} data-error="true">
                {tx(actionError)}
              </p>
            )}
            {actionMessage && (
              <p role="status" className={styles.notice}>
                {tx(actionMessage)}
              </p>
            )}
            {claim.status === "PICKED_UP" && (
              <ClaimVerificationPanel claim={claim} />
            )}
            <div className={styles.grid}>
              <div className={styles.column}>
                <ClaimStatusTimeline
                  claim={claim}
                  stale={state.status === "error"}
                />
                <div className={styles.contacts}>
                  <RescueContactCard
                    title="Pickup from donor"
                    name={details.donorOrganization}
                    address={
                      details.donation.pickup.sensitiveDetailsVisible
                        ? formatAddress(details.donation.pickup.exactAddress)
                        : details.donation.pickup.approximateArea
                    }
                    contact={details.donation.pickup.contact?.name}
                    phone={details.donation.pickup.contact?.phone}
                    note={details.donation.pickup.directions}
                  />
                  <RescueContactCard
                    title="Delivery destination"
                    name={
                      details.receiverNgo?.name || session?.displayName || "NGO"
                    }
                    phone={details.receiverNgo?.contactPhone}
                    contact={details.receiverNgo?.contactName}
                    address={
                      details.deliveryAddress
                        ? formatAddress(details.deliveryAddress)
                        : undefined
                    }
                  />
                </div>
              </div>
              <div className={styles.column}>
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>{tx("Rescue essentials")}</h2>
                  </div>
                  <div className={styles.panelBody}>
                    <dl className={styles.facts}>
                      <div>
                        <dt>{tx("Estimated meals")}</dt>
                        <dd>
                          {details.donation.quantity.estimatedMeals.toLocaleString(
                            locale,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>{tx("Storage condition")}</dt>
                        <dd>
                          {tx(
                            STORAGE_CONDITION_LABELS[
                              details.donation.storageCondition
                            ],
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>{tx("Collection closes")}</dt>
                        <dd>
                          {new Date(
                            Math.min(
                              Date.parse(details.donation.safePickupDeadline),
                              Date.parse(details.donation.pickup.windowEnd),
                            ),
                          ).toLocaleString(locale)}
                        </dd>
                      </div>
                    </dl>
                    {details.claim.foodRequestId && (
                      <ButtonLink
                        href={ROUTES.ngo.request(details.claim.foodRequestId)}
                        variant="outline"
                      >
                        {tx("View linked food request")}
                      </ButtonLink>
                    )}
                  </div>
                </section>
                {details.volunteer ? (
                  <RescueContactCard
                    title="Assigned volunteer"
                    name={details.volunteer.displayName}
                    contact={tx(
                      details.volunteer.transportMethod
                        .toLowerCase()
                        .replaceAll("_", " "),
                    )}
                    phone={details.volunteer.phone}
                    note={tx(
                      "Route checkpoints are reported by the volunteer. Live GPS and arrival estimates are not measured.",
                    )}
                  />
                ) : (
                  <section className={styles.panel}>
                    <div className={styles.panelBody}>
                      <p className={styles.contactTitle}>
                        <ShieldCheck size={17} />
                        {tx("Volunteer assignment")}
                      </p>
                      <h3>{tx("Waiting for a volunteer")}</h3>
                      <p className={styles.status}>
                        {tx(
                          "A verified volunteer must accept this rescue from the dispatch list.",
                        )}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>
            <RescueMapDisclosure>
              <ClaimRoutePreview details={details} />
            </RescueMapDisclosure>
            <details className={styles.disclosure}>
              <summary>
                {tx("Issues & rescue history")}
                <ChevronDown size={17} />
              </summary>
              <div>
                <IncidentPanel claimId={claim.id} />
              </div>
            </details>
            <ClaimActionPanel
              claim={claim}
              busy={busy || state.status === "error"}
              onRelease={releaseClaim}
            />
          </>
        )}
      </div>
    </PortalShell>
  );
}
