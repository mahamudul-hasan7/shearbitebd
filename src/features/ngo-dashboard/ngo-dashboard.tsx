"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Compass, MapPin, PackageSearch, Plus, ShieldCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import { claimService, toServiceError } from "@/services";
import { ActiveClaimOverview } from "./active-claim-overview";
import { NGODashboardError, NGODashboardLoading, NoRecommendedDonation } from "./ngo-dashboard-states";
import { NGOQuickActions } from "./ngo-quick-actions";
import { NGORecentActivity } from "./ngo-recent-activity";
import { RecommendedDonationCard } from "./recommended-donation-card";
import { useNgoDashboard } from "./use-ngo-dashboard";
import { NEARBY_RADIUS_KM } from "./dashboard-presentation";
import { LiveIconGroup, FoodBoxIcon, PeopleGreetingIcon, ServingMealIcon, WorkChecklistIcon } from "@/components/motion/live-icon";
import styles from "./ngo-dashboard.module.css";

export function NGODashboard() {
  const tx = useUiText();
  const {language} = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const number = (value:number) => value.toLocaleString(locale);
  const {session} = useMockAuth();
  const {state,retry} = useNgoDashboard();
  const [claimingId,setClaimingId] = useState<string>();
  const [claimedId,setClaimedId] = useState<string>();
  const [claimError,setClaimError] = useState<{id:string;message:string}>();
  const claimLock = useRef(false);
  const data = state.data;
  const ngo = data?.profile.ngoProfile;
  const name = session?.displayName || ngo?.organizationName || tx("NGO account");
  const verified = ngo?.verificationStatus === "VERIFIED";
  async function claimRecommended() {
    const donation = data?.recommendedDonation;
    if (!donation || !ngo || !verified || state.status === "error" || claimLock.current) return;
    claimLock.current = true; setClaimingId(donation.id); setClaimError(undefined);
    try {
      await claimService.create({donationId:donation.id,ngoProfileId:ngo.id,matchScore:0},{});
      setClaimedId(donation.id); retry();
    } catch(error) {setClaimError({id:donation.id,message:toServiceError(error).message});}
    finally {claimLock.current = false;setClaimingId(undefined);}
  }
  const nearbyHelper = data ? !data.stats.hasLocation ? tx("Add a map pin to your saved NGO address.") : data.stats.unmappedDonations > 0 ? tx("{0} available posts have no location pin.",number(data.stats.unmappedDonations)) : tx("Approximate straight-line distance within {0} km.",number(NEARBY_RADIUS_KM)) : "";

  return <PortalShell role="ngo" activeHref={ROUTES.ngo.dashboard} title={data ? tx("Welcome, {0}",name) : tx("NGO Dashboard")} description={tx("Manage food collection, receipt and distribution from here.")} compactHeader titleClassName={styles.pageTitle}
    profileName={name} profileDescription={tx(verified ? "Verified NGO" : "Approval pending")} avatarInitials={name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("") || "NG"} notificationHref={ROUTES.ngo.notifications}
    actions={<div className={styles.headerActions}><ButtonLink href={ROUTES.ngo.discover} leftIcon={<PackageSearch size={17} />} className={styles.headerButton}>{tx("Browse Food")}</ButtonLink><ButtonLink href={ROUTES.ngo.newRequest} variant="outline" leftIcon={<Plus size={17} />} className={styles.headerButton}>{tx("Create Request")}</ButtonLink></div>}>
    {!data && state.status === "loading" && <NGODashboardLoading />}
    {!data && state.status === "error" && <NGODashboardError message={tx(state.error.message)} onRetry={retry} />}
    {data && ngo && <div className={styles.root} data-testid="ngo-dashboard">
      {state.status === "error" && <div role="alert" className={styles.stale}><p>{tx("New updates could not load. Your last saved dashboard is still shown.")}</p><button type="button" onClick={retry}>{tx("Retry")}</button></div>}
      <section aria-labelledby="ngo-stats-title" data-testid="ngo-stats-section"><div className={styles.sectionHeading}><h2 id="ngo-stats-title">{tx("Your collection and distribution overview")}</h2></div>
        <LiveIconGroup className={styles.statsGrid} data-testid="ngo-stats">
          <StatCard motion="ambient" className={styles.metric} data-stat="nearby" label={tx("Nearby available food")} value={data.stats.availableNearby === null ? "—" : number(data.stats.availableNearby)} icon={FoodBoxIcon} helper={nearbyHelper} />
          <StatCard motion="ambient" className={styles.metric} data-stat="active" label={tx("Active NGO work")} value={number(data.stats.activeClaims)} icon={WorkChecklistIcon} tone="info" badge={tx("Current")} helper={tx("Follow each job's actual stage below.")} />
          <StatCard motion="ambient" className={styles.metric} data-stat="meals" label={tx("Meals distributed")} value={number(data.stats.mealsDistributed)} icon={ServingMealIcon} tone="accent" badge={tx("All time")} helper={tx("From saved distribution records.")} />
          <StatCard motion="ambient" className={styles.metric} data-stat="people" label={tx("People served")} value={number(data.stats.beneficiariesServed)} icon={PeopleGreetingIcon} tone="success" badge={tx("All time")} helper={tx("Total recorded recipients, including repeat visits.")} />
        </LiveIconGroup>
        {!data.stats.hasLocation && <div className={styles.locationNotice} data-testid="ngo-location-needed"><MapPin size={20} aria-hidden="true" /><p>{tx("Set your saved NGO location to check nearby food.")}</p><Link href={ROUTES.ngo.addresses}>{tx("Set location")}</Link></div>}
      </section>

      <ActiveClaimOverview items={data.activeClaims} />

      <div className={styles.lowerGrid}><section aria-labelledby="recommended-heading"><div className={styles.sectionHeading}><div><h2 id="recommended-heading">{tx("Food you can collect")}</h2><p>{tx("Matching food categories, ordered by the earliest pickup deadline.")}</p></div></div>
        {data.recommendedDonation ? <RecommendedDonationCard donation={data.recommendedDonation} matchScore={0} claiming={claimingId === data.recommendedDonation.id} claimed={claimedId === data.recommendedDonation.id} canClaim={verified} disabled={state.status === "error"} error={claimError?.id === data.recommendedDonation.id ? tx(claimError.message) : undefined} onClaim={() => {void claimRecommended();}} /> : <NoRecommendedDonation />}
      </section><NGOQuickActions /></div>

      <details className={styles.accountDetails}><summary><ShieldCheck size={18} aria-hidden="true" /><span>{tx("NGO account details")}</span><Badge tone={verified ? "success" : "warning"}>{tx(verified ? "Verified" : "Approval pending")}</Badge><ChevronDown size={17} aria-hidden="true" /></summary><div className={styles.accountBody}><h3>{ngo.organizationName}</h3><dl><div><dt>{tx("Registration number")}</dt><dd>{ngo.registrationNumber || tx("Not provided")}</dd></div><div><dt>{tx("Service areas")}</dt><dd>{ngo.serviceAreas.join(", ") || tx("Not provided")}</dd></div><div><dt>{tx("Declared daily capacity")}</dt><dd data-testid="ngo-capacity">{tx("{0} meals per day",number(ngo.capacityMealsPerDay))}</dd></div></dl><Link href={ROUTES.ngo.verification}>{tx("View NGO profile and verification")}</Link></div></details>
      <NGORecentActivity activities={data.activities} />
      <details className={styles.safety}><summary><Compass size={17} aria-hidden="true" /><span>{tx("Before collecting food")}</span><ChevronDown size={17} aria-hidden="true" /></summary><p>{tx("Review the donor's preparation, storage, allergen and pickup details. Check the food before accepting it; the app does not test food quality or temperature.")}</p></details>
    </div>}
  </PortalShell>;
}
