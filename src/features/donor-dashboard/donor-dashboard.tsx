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
import { RecentActivityCard } from "@/components/donor/recent-activity-card";
import { SupportedNgosCard } from "@/components/donor/supported-ngos-card";
import { DonationPhoto } from "@/components/donation/donation-photo";
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
                  {listings.map((donation) => (
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
                            {number(donation.quantity.value)}{" "}
                            {tx(donation.quantity.unit)} ·{" "}
                            {donation.pickup.approximateArea}
                          </span>
                          <StatusBadge status={donation.status} />
                        </span>
                        <ArrowRight
                          className={styles.rowArrow}
                          size={17}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
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

          {hasDonations && (
            <DashboardDisclosure
              title="Recent activity"
              icon={History}
              data-testid="donor-activity"
            >
              <RecentActivityCard activities={data.activities} />
              {data.supportedNgos.length > 0 && (
                <SupportedNgosCard ngos={data.supportedNgos} />
              )}
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
      )}
    </PortalShell>
  );
}
