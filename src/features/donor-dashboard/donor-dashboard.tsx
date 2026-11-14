"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, CircleHelp, HandHeart, PackageOpen, Plus } from "lucide-react";
import { ActiveDonationCard } from "@/components/donor/active-donation-card";
import { DonorDashboardError, DonorDashboardLoading } from "@/components/donor/donor-dashboard-states";
import { DonorImpactGrid } from "@/components/donor/donor-impact-grid";
import { RecentActivityCard } from "@/components/donor/recent-activity-card";
import { SupportedNgosCard } from "@/components/donor/supported-ngos-card";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { PortalShell } from "@/components/layout/portal-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDonorDashboard } from "@/features/donor-dashboard/use-donor-dashboard";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import styles from "@/components/donor/donor-mobile.module.css";

export function DonorDashboard() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const { state, retry } = useDonorDashboard();
  const data = state.data;
  const [activeTab, setActiveTab] = useState<"recent" | "distributed">("recent");
  const donorName = session?.displayName || data?.profile.name || tx("Food donor");
  const donorInitials = donorName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FD";
  const completed = data?.donations.filter((donation) => donation.status === DonationStatus.DISTRIBUTED) ?? [];
  const listings = (activeTab === "recent" ? data?.donations ?? [] : completed).slice(0, 3);
  const hasDonations = Boolean(data?.donations.length);
  const introduction = [
    { title: "Post your food", detail: "Add the food details and pickup address." },
    { title: "An NGO claims it", detail: "The NGO and rider coordinate collection." },
    { title: "Follow the progress", detail: "See pickup, delivery and distribution updates here." },
  ];

  return <PortalShell role="donor" activeHref={ROUTES.donor.dashboard} compactHeader
    titleClassName={styles.welcome}
    title={tx("Welcome, {0}", donorName)} description={tx("Your food donations, all in one place.")}
    profileName={donorName} profileDescription={data?.profile.description || tx("Donor account")} avatarInitials={donorInitials}
    notificationHref={ROUTES.donor.notifications} unreadNotifications={data?.unreadNotifications}>
    {state.status === "loading" && !data && <DonorDashboardLoading />}
    {state.status === "error" && (!data ? <DonorDashboardError message={tx(state.error.message)} onRetry={retry} /> :
      <div role="status" data-testid="donor-dashboard-error" className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        <p className="min-w-0 flex-1">{tx("Showing the last saved dashboard. Trying again shortly.")}</p>
        <button type="button" onClick={retry} className="min-h-11 rounded-lg px-3 font-semibold underline">{tx("Retry")}</button>
      </div>)}
    {data && <div className={styles.dashboard} data-testid="donor-mobile-dashboard">
      <section className={styles.hero} aria-label={tx("Share extra food")} data-active={Boolean(data.activeDonation)}>
        <div className={styles.heroCopy}>
          <span className={styles.heroLabel}><HandHeart size={15} aria-hidden="true" />{tx("A little food. A big difference.")}</span>
          <h2>{tx("Extra food? Share it today.")}</h2>
          <p className={styles.mobileHint}>{tx("Tap the + button below to post your food.")}</p>
          <p className={styles.desktopHint}>{tx("Post your food. An NGO and rider will take it from there.")}</p>
        </div>
        <Link href={ROUTES.donor.newDonation} className={styles.primary} data-testid="donor-post-action">
          <Plus size={19} aria-hidden="true" /><span>{tx("Post extra food")}</span><ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      {data.activeDonation && <section className={`${styles.section} ${styles.activeSection}`} aria-labelledby="donor-active-heading">
        <div className={styles.sectionHeading}><h2 id="donor-active-heading">{tx("Your active rescue")}</h2>
          <Link href={ROUTES.donor.donationTracking(data.activeDonation.id)}>{tx("View status")}<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <ActiveDonationCard donation={data.activeDonation} />
      </section>}

      {hasDonations && <section className={styles.section} aria-label={tx("Your contribution")} data-testid="donor-contribution"><DonorImpactGrid stats={data.stats} /></section>}

      {hasDonations ? <section className={styles.listSection} aria-labelledby="donor-posts-heading">
        <div className={styles.sectionHeading}><h2 id="donor-posts-heading">{tx("Your donations")}</h2>
          <Link href={ROUTES.donor.donations}>{tx("View all")}<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className={styles.filters} role="group" aria-label={tx("Donation list filters")}>
          <button type="button" aria-pressed={activeTab === "recent"} onClick={() => setActiveTab("recent")}>{tx("Recent posts")}<span>{data.donations.length}</span></button>
          <button type="button" aria-pressed={activeTab === "distributed"} onClick={() => setActiveTab("distributed")}>{tx("Distributed")}<span>{completed.length}</span></button>
        </div>
        {listings.length ? <ul className={styles.list}>{listings.map((donation) => <li key={donation.id}>
          <Link href={ROUTES.donor.donation(donation.id)} className={styles.listRow}>
            <span className={styles.listPhoto}><DonationPhoto donation={donation} fill sizes="56px" className="object-cover" /></span>
            <span className={styles.listCopy}><strong>{donation.title}</strong><span>{donation.quantity.value} {tx(donation.quantity.unit)} · {donation.pickup.approximateArea}</span><StatusBadge status={donation.status} /></span>
            <ArrowRight className={styles.rowArrow} size={17} aria-hidden="true" />
          </Link>
        </li>)}</ul> : <div className={styles.empty}>
          <HandHeart size={28} aria-hidden="true" /><p>{tx(activeTab === "recent" ? "Your first food post starts here." : "Your completed distributions will appear here.")}</p>
          <span>{tx(activeTab === "recent" ? "Use Post extra food above when you are ready." : "Meals count after the NGO records distribution.")}</span>
        </div>}
      </section> : <section className={styles.emptyOverview} aria-labelledby="donor-empty-heading" data-testid="donor-empty-posts">
        <PackageOpen size={25} aria-hidden="true" />
        <div><h2 id="donor-empty-heading">{tx("No food posts yet")}</h2>
          <p className={styles.mobileHint}>{tx("Use + below to add your first food post.")}</p>
          <p className={styles.desktopHint}>{tx("Your posts and progress will appear here.")}</p>
        </div>
      </section>}

      {hasDonations && <details className={styles.more} data-testid="donor-activity">
        <summary>{tx("Activity and supported NGOs")}<ChevronDown size={17} aria-hidden="true" /></summary>
        <div className={styles.moreContent}><RecentActivityCard activities={data.activities} /><SupportedNgosCard ngos={data.supportedNgos} /></div>
      </details>}
      <details className={styles.guide} data-testid="donor-getting-started">
        <summary><CircleHelp size={17} aria-hidden="true" /><span>{tx("How does it work?")}</span><ChevronDown size={16} aria-hidden="true" /></summary>
        <div className={styles.gettingStarted}>
          <ol>{introduction.map((step, index) => <li key={step.title}>
            <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
            <div><h3>{tx(step.title)}</h3><p>{tx(step.detail)}</p></div>
          </li>)}</ol>
        </div>
      </details>
    </div>}
  </PortalShell>;
}
