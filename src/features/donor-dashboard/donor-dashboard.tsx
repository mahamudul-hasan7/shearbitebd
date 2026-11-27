"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  HandHeart,
  History,
  PackageOpen,
  Plus,
} from "lucide-react";
import { ActiveDonationCard } from "@/components/donor/active-donation-card";
import {
  DonorDashboardError,
  DonorDashboardLoading,
} from "@/components/donor/donor-dashboard-states";
import { DonorImpactGrid } from "@/components/donor/donor-impact-grid";
import { DonorImpactSummaryCard } from "@/components/donor/donor-impact-summary-card";
import { RecentActivityCard } from "@/components/donor/recent-activity-card";
import { SupportedNgosCard } from "@/components/donor/supported-ngos-card";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { formatDonationQuantity } from "@/features/donations/donation-presentation";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import {
  DashboardDisclosure,
  DashboardFeedback,
  DashboardSectionHeading,
} from "@/components/dashboard/dashboard-ui";
import ui from "@/components/dashboard/dashboard.module.css";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDonorDashboard } from "@/features/donor-dashboard/use-donor-dashboard";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { DonationStatus } from "@/lib/constants/statuses";
import { buildRescueProgress } from "@/lib/rescue-progress";
import { ROUTES } from "@/lib/routes";
import styles from "@/components/donor/donor-mobile.module.css";

export function DonorDashboard() {
  const tx = useUiText();
  const { language } = useLanguage();
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  const { session } = useMockAuth();
  const { state, retry } = useDonorDashboard();
  const data = state.data;
  const [activeTab, setActiveTab] = useState<"recent" | "distributed">(
    "recent",
  );
  const donorName =
    session?.displayName || data?.profile.name || tx("Food donor");
  const donorInitials =
    donorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "FD";
  const completed =
    data?.donations.filter(
      (donation) => donation.status === DonationStatus.DISTRIBUTED,
    ) ?? [];
  const listings = (
    activeTab === "recent" ? (data?.donations ?? []) : completed
  ).slice(0, 3);
  const hasDonations = Boolean(data?.donations.length);
  const introduction = [
    {
      title: "Post your food",
      detail: "Add the food details and pickup address.",
    },
    {
      title: "An NGO claims it",
      detail: "The NGO and rider coordinate collection.",
    },
    {
      title: "Follow the progress",
      detail: "See pickup, delivery and distribution updates here.",
    },
  ];

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.dashboard}
      compactHeader
      titleClassName={ui.pageTitle}
      title={tx("Welcome, {0}", donorName)}
      description={tx("Your food donations, all in one place.")}
      profileName={donorName}
      profileDescription={data?.profile.description || tx("Donor account")}
      avatarInitials={donorInitials}
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={data?.unreadNotifications}
      actionsClassName={ui.desktopActions}
      actions={
        <div className={ui.headerActions}>
          <ButtonLink
            href={ROUTES.donor.newDonation}
            leftIcon={<Plus size={18} />}
            className={ui.primaryAction}
            data-testid="donor-post-action"
          >
            {tx("Post extra food")}
          </ButtonLink>
        </div>
      }
    >
      {state.status === "loading" && !data && <DonorDashboardLoading />}
      {state.status === "error" &&
        (!data ? (
          <DonorDashboardError
            message={tx(state.error.message)}
            onRetry={retry}
          />
        ) : (
          <DashboardFeedback
            stale
            onRetry={retry}
            data-testid="donor-dashboard-error"
          />
        ))}
      {data && (
        <div
          className={`${ui.stack} ${styles.dashboard}`}
          data-testid="donor-mobile-dashboard"
        >
          {data.activeDonation && (
            <section
              className={styles.section}
              aria-labelledby="donor-active-heading"
            >
              <DashboardSectionHeading
                id="donor-active-heading"
                title="Your active rescue"
                linkLabel="View status"
                href={ROUTES.donor.donationTracking(data.activeDonation.id)}
              />
              <ActiveDonationCard donation={data.activeDonation} />
            </section>
          )}

          {hasDonations && (
            <section
              className={styles.section}
              aria-label={tx("Your contribution")}
              data-testid="donor-contribution"
            >
              <DashboardSectionHeading title="Your contribution" />
              <DonorImpactGrid stats={data.stats} />
            </section>
          )}

          {hasDonations ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
              <section
                className={styles.listSection}
                aria-labelledby="donor-posts-heading"
              >
                <DashboardSectionHeading
                  id="donor-posts-heading"
                  title="Your donations"
                  href={ROUTES.donor.donations}
                />
                <div
                  className={styles.filters}
                  role="group"
                  aria-label={tx("Donation list filters")}
                >
                  <button
                    type="button"
                    aria-pressed={activeTab === "recent"}
                    onClick={() => setActiveTab("recent")}
                  >
                    {tx("Recent posts")}
                    <span>{number(data.donations.length)}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeTab === "distributed"}
                    onClick={() => setActiveTab("distributed")}
                  >
                    {tx("Distributed")}
                    <span>{number(completed.length)}</span>
                  </button>
                </div>
                {listings.length ? (
                  <ul className={styles.list}>
                    {listings.map((donation) => {
                      const currentClaim =
                        donation.status === DonationStatus.AVAILABLE &&
                        donation.latestClaim?.status === "CANCELLED"
                          ? undefined
                          : donation.latestClaim;
                      const claimIsNewer =
                        currentClaim &&
                        (!donation.updatedAt ||
                          Date.parse(currentClaim.updatedAt) >=
                            Date.parse(donation.updatedAt));
                      const progress = buildRescueProgress({
                        scope: "donation",
                        status: claimIsNewer
                          ? currentClaim.status
                          : donation.status,
                        routeStage: currentClaim?.routeStage,
                        publishedAt: donation.publishedAt,
                        reservedAt: currentClaim?.reservedAt,
                        assignedAt: currentClaim?.assignedAt,
                        pickedUpAt: currentClaim?.pickedUpAt,
                        deliveredAt: currentClaim?.deliveredAt,
                        distributedAt: currentClaim?.distributedAt,
                        updatedAt: claimIsNewer
                          ? currentClaim.updatedAt
                          : donation.updatedAt,
                        cancellationReason: donation.cancellationReason,
                      });
                      const isStopped = progress.state !== "complete" && progress.state !== "active" && progress.state !== "draft";

                      return (
                        <li key={donation.id}>
                          <Link
                            href={ROUTES.donor.donation(donation.id)}
                            className={styles.listRow}
                          >
                            <span className={styles.listPhoto}>
                              <DonationPhoto
                                donation={donation}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </span>
                            <span className={styles.listCopy}>
                              <strong>{donation.title}</strong>
                              <span>
                                {formatDonationQuantity(donation)} ·{" "}
                                {donation.pickup.approximateArea}
                              </span>
                              <span className="flex flex-wrap items-center gap-2 pt-0.5">
                                <StatusBadge status={donation.status} />
                                <span
                                  className="inline-grid w-20 grid-cols-6 gap-0.5"
                                  aria-hidden="true"
                                >
                                  {progress.steps.map((step) => {
                                    const stoppedHere = isStopped && step.current;
                                    return (
                                      <span
                                        key={step.id}
                                        className={`h-1 rounded-full ${
                                          stoppedHere
                                            ? progress.state === "cancelled"
                                              ? "bg-rose-600"
                                              : "bg-amber-500"
                                            : step.done
                                              ? "bg-emerald-500"
                                              : step.current
                                                ? "bg-emerald-400"
                                                : "bg-slate-200"
                                        }`}
                                      />
                                    );
                                  })}
                                </span>
                                <span className="text-[11px] font-bold text-slate-600 tabular-nums">
                                  {tx(
                                    "Step {0}/{1}",
                                    progress.completedSteps,
                                    progress.steps.length,
                                  )}
                                </span>
                              </span>
                            </span>
                            <ArrowRight
                              className={styles.rowArrow}
                              size={17}
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className={styles.empty}>
                    <HandHeart size={28} aria-hidden="true" />
                    <p>
                      {tx(
                        activeTab === "recent"
                          ? "Your first food post starts here."
                          : "Your completed distributions will appear here.",
                      )}
                    </p>
                    <span>
                      {tx(
                        activeTab === "recent"
                          ? "Use Post extra food above when you are ready."
                          : "Meals count after the NGO records distribution.",
                      )}
                    </span>
                  </div>
                )}
              </section>

              {data.supportedNgos.length > 0 ? (
                <SupportedNgosCard ngos={data.supportedNgos} />
              ) : (
                <DonorImpactSummaryCard
                  stats={data.stats}
                  records={data.impactRecords}
                />
              )}
            </div>
          ) : (
            <section
              className={styles.emptyOverview}
              aria-labelledby="donor-empty-heading"
              data-testid="donor-empty-posts"
            >
              <PackageOpen size={25} aria-hidden="true" />
              <div>
                <h2 id="donor-empty-heading">{tx("No food posts yet")}</h2>
                <p className={styles.mobileHint}>
                  {tx("Use + below to add your first food post.")}
                </p>
                <p className={styles.desktopHint}>
                  {tx("Your posts and progress will appear here.")}
                </p>
              </div>
            </section>
          )}

          <div
            className={
              hasDonations
                ? "grid gap-4 lg:grid-cols-2 lg:items-start"
                : "grid gap-4"
            }
          >
            {hasDonations && (
              <DashboardDisclosure
                title="Recent activity"
                icon={History}
                data-testid="donor-activity"
              >
                <RecentActivityCard activities={data.activities} />
              </DashboardDisclosure>
            )}
            <DashboardDisclosure
              title="How does it work?"
              icon={CircleHelp}
              data-testid="donor-getting-started"
            >
              <div className={styles.gettingStarted}>
                <ol>
                  {introduction.map((step, index) => (
                    <li key={step.title}>
                      <span className={styles.stepNumber} aria-hidden="true">
                        {number(index + 1)}
                      </span>
                      <div>
                        <h3>{tx(step.title)}</h3>
                        <p>{tx(step.detail)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </DashboardDisclosure>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
