"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Bookmark, CheckCircle2, Clock3, MapPin, PackageCheck, PackageOpen, RefreshCw, Refrigerator, ShieldCheck, UserRoundCheck, XCircle } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { PortalShell } from "@/components/layout/portal-shell";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { donationImageUrl, formatDonationDateTime, formatDonationQuantity } from "@/features/donations/donation-presentation";
import { useSavedDonations } from "@/features/ngo-discovery/use-saved-donations";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { DIETARY_TYPE_LABELS, FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { asyncState, claimService, discoveryService, toServiceError, type AsyncState, type NGODiscoveryItem } from "@/services";

const SAFETY_CHECKS = [
  { key: "freshlyPrepared", label: "Preparation declared" },
  { key: "properlyCovered", label: "Food properly covered" },
  { key: "noVisibleSpoilage", label: "No visible spoilage reported" },
  { key: "storedAccordingToDeclaration", label: "Storage condition declared" },
  { key: "allergensDisclosed", label: "Allergens disclosed" },
  { key: "pickupDeadlineConfirmed", label: "Pickup deadline confirmed" },
  { key: "donorAccuracyConfirmed", label: "Donor accuracy confirmed" },
] as const;

function packagingLabel(condition: NGODiscoveryItem["donation"]["foodCondition"]) {
  if (condition === "PACKAGED") return "Factory or donor packaged";
  if (condition === "SAME_DAY") return "Same-day covered food";
  return "Freshly prepared and covered";
}

export function NGODonationDetail({ donationId }: { donationId: string }) {
  const [state, setState] = useState<AsyncState<NGODiscoveryItem>>(() => asyncState.loading());
  const [retryKey, setRetryKey] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimId, setClaimId] = useState<string>();
  const [claimError, setClaimError] = useState<string>();
  const { savedIds, toggleSaved } = useSavedDonations();

  useEffect(() => {
    const controller = new AbortController();
    discoveryService.getById(donationId, NGO_PROFILE_ID, NGO_VIEWER, { signal: controller.signal }).then((item) => setState(asyncState.success(item))).catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [donationId, retryKey]);

  async function claimDonation() {
    const item = state.data;
    if (!item || !item.eligibility.eligible) return;
    setClaiming(true); setClaimError(undefined);
    try {
      const claim = await claimService.create({ donationId, ngoProfileId: NGO_PROFILE_ID, matchScore: item.matchScore }, NGO_VIEWER);
      setClaimId(claim.id);
    } catch (error: unknown) { setClaimError(toServiceError(error).message); }
    finally { setClaiming(false); }
  }

  const item = state.data;
  const donation = item?.donation;
  const saved = savedIds.includes(donationId);
  const canClaim = item?.eligibility.eligible && donation?.status === DonationStatus.AVAILABLE && !claimId;
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.discover} title={donation?.title ?? "Donation details"} description="Review safety declarations, operational fit, and privacy-protected pickup information before claiming." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.discover} variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>Back to discovery</ButtonLink>}>
    {state.status === "loading" && !item && <SkeletonGroup label="Loading donation details" className="grid gap-5"><Skeleton className="h-96" /><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></SkeletonGroup>}
    {state.status === "error" && !item && <EmptyState icon={RefreshCw} title="Donation could not load" description={state.error.message} action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button><ButtonLink href={ROUTES.ngo.discover} variant="outline">Browse available food</ButtonLink></div>} />}
    {item && donation && <div className="grid gap-6">
      <Card className="overflow-hidden"><div className="grid lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)]"><div className="relative min-h-80 bg-brand-100 lg:min-h-full"><Image src={donationImageUrl(donation)} alt="Prepared surplus food packaged and ready for rescue" fill sizes="(max-width: 1024px) 100vw, 44vw" className="object-cover" priority /><div className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-4"><StatusBadge status={donation.status} /><Badge tone="success">{item.matchScore}% match</Badge></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/90 to-transparent p-5 pt-20 text-white"><p className="text-lg font-black">{item.donorOrganization}</p><p className="mt-1 text-sm text-white/75">Verified food donor</p></div></div><div className="p-5 sm:p-7"><div className="flex flex-wrap items-center gap-2"><Badge>{FOOD_CATEGORY_LABELS[donation.category]}</Badge><Badge tone={item.eligibility.eligible ? "success" : "warning"}>{item.eligibility.eligible ? "Eligible to claim" : "Review eligibility"}</Badge></div><h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">{donation.title}</h2><p className="mt-3 text-sm leading-7 text-muted-600">{donation.description}</p><div className="mt-6"><RescueClock deadline={donation.safePickupDeadline} /></div><div className="mt-6 grid gap-3 xs:grid-cols-2"><div className="rounded-2xl bg-brand-50 p-4"><MapPin className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Approximate pickup</p><p className="mt-1 font-black text-ink-900">{donation.pickup.approximateArea} · {donation.pickup.distanceKm?.toFixed(1)} km</p></div><div className="rounded-2xl bg-brand-50 p-4"><PackageOpen className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Quantity</p><p className="mt-1 font-black text-ink-900">{formatDonationQuantity(donation)} · ~{donation.quantity.estimatedMeals} meals</p></div><div className="rounded-2xl bg-brand-50 p-4"><Clock3 className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Prepared</p><p className="mt-1 font-black text-ink-900">{formatDonationDateTime(donation.preparationTime)}</p></div><div className="rounded-2xl bg-brand-50 p-4"><Refrigerator className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Storage</p><p className="mt-1 font-black text-ink-900">{STORAGE_CONDITION_LABELS[donation.storageCondition]}</p></div></div></div></div></Card>
      <Alert tone="info" title="Pickup privacy is protected" description="Only an approximate area and distance are shown before claim acceptance. Exact address, coordinates, directions, and donor contact are not displayed on this discovery page." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader title="Dietary & packaging information" description="Review fit with your recipients and transport plan." /><CardContent className="grid gap-5"><div><p className="text-sm font-black text-ink-900">Dietary labels</p><div className="mt-2 flex flex-wrap gap-2">{donation.dietaryTypes.map((value) => <Badge key={value} tone="accent">{DIETARY_TYPE_LABELS[value]}</Badge>)}</div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-line p-4"><PackageCheck className="size-5 text-brand-700" /><p className="mt-2 text-sm font-black text-ink-900">{packagingLabel(donation.foodCondition)}</p><p className="mt-1 text-xs text-muted-600">Condition declared by the donor.</p></div><div className="rounded-2xl border border-line p-4"><Refrigerator className="size-5 text-brand-700" /><p className="mt-2 text-sm font-black text-ink-900">{STORAGE_CONDITION_LABELS[donation.storageCondition]}</p><p className="mt-1 text-xs text-muted-600">Maintain during collection and transport.</p></div></div>{donation.allergens.length > 0 ? <Alert tone="warning" title={`Allergens: ${donation.allergens.join(", ")}`} description="Confirm suitability and preserve donor labels during distribution." /> : <Alert tone="success" title="No allergens declared" description="This is a donor declaration, not a clinical allergen-free guarantee." />}{donation.specialInstructions && <div><p className="text-sm font-black text-ink-900">Handling instructions</p><p className="mt-2 rounded-2xl bg-canvas p-4 text-sm leading-6 text-muted-600">{donation.specialInstructions}</p></div>}</CardContent></Card>
        <Card><CardHeader title="Donor safety declaration" description={`Declared ${formatDonationDateTime(donation.safetyDeclaration.declaredAt)}. These statements support traceability and are not a freshness certification.`} /><CardContent className="grid gap-2">{SAFETY_CHECKS.map((check) => { const passed = donation.safetyDeclaration[check.key]; return <div key={check.key} className="flex items-center gap-3 rounded-2xl border border-line p-3"><span className={`grid size-9 place-items-center rounded-xl ${passed ? "bg-success-soft text-success-strong" : "bg-danger-soft text-danger-strong"}`}>{passed ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}</span><p className="text-sm font-bold text-ink-900">{check.label}</p></div>; })}</CardContent></Card>
      </div>
      <Card><CardHeader title="Eligibility summary" description="Every check is evaluated from the verified NGO profile and the current listing." /><CardContent className="grid gap-3 md:grid-cols-2">{item.eligibility.checks.map((check) => <div key={check.label} className={`flex items-start gap-3 rounded-2xl border p-4 ${check.passed ? "border-success/20 bg-success-soft" : "border-warning/25 bg-warning-soft"}`}><span className="mt-0.5">{check.passed ? <UserRoundCheck className="size-5 text-success-strong" /> : <AlertTriangle className="size-5 text-warning-strong" />}</span><div><p className="font-black text-ink-900">{check.label}</p><p className="mt-1 text-xs leading-5 text-muted-600">{check.description}</p></div></div>)}</CardContent></Card>
      {claimError && <Alert tone="danger" title="Claim could not be completed" description={claimError} />}{claimId && <Alert tone="success" title="Donation reserved for Hope Foundation" description="A mock claim was created. Continue in My Claims for the authorized rescue workflow." action={<ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline" size="sm">Open claim</ButtonLink>} />}
      <StickyActionBar><Button variant="outline" leftIcon={<Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />} onClick={() => toggleSaved(donationId)}>{saved ? "Saved for later" : "Save for later"}</Button><Button disabled={!canClaim || claiming} leftIcon={<ShieldCheck className="size-4" />} onClick={claimDonation}>{claiming ? "Claiming…" : claimId ? "Claimed" : item.eligibility.eligible ? "Claim donation" : "Not eligible to claim"}</Button></StickyActionBar>
    </div>}
  </PortalShell>;
}
