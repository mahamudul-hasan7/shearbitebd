"use client";

import { ArrowLeft, Building2, CalendarClock, CheckCircle2, ClipboardCheck, MapPin, Navigation, Phone, RefreshCw, Share2, ShieldCheck, Star, Utensils } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DonationActions } from "@/components/donation/donation-actions";
import { DonationStatusTimeline } from "@/components/donation/donation-status-timeline";
import { RescueClock } from "@/components/donor/rescue-clock";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert, type AlertTone } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { canCancelDonation, canEditDonation } from "@/features/donations/donation-management";
import { donationImageUrl, formatDonationDateTime, formatDonationQuantity } from "@/features/donations/donation-presentation";
import { useDonationTracking } from "@/features/donations/use-donation-tracking";
import { DIETARY_TYPE_LABELS, FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { ClaimStatus, DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { canTransitionClaim, canTransitionDonation } from "@/lib/status-transitions";
import { ROUTES } from "@/lib/routes";
import { donationService, incidentService, type CreateDonationIncidentInput, type UpdateDonationInput } from "@/services";

function DonationDetailLoading() {
  return <SkeletonGroup label="Loading donation details" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"><Card className="overflow-hidden"><Skeleton className="h-72 rounded-none" /><div className="grid gap-4 p-6"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /></div></Card><Card className="p-6"><Skeleton className="h-7 w-3/4" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-4 h-24 w-full" /></Card></SkeletonGroup>;
}

export function DonationDetailSummary({ donationId }: { donationId: string }) {
  const { state, refresh, viewer } = useDonationTracking(donationId);
  const [notice, setNotice] = useState<{ tone: AlertTone; title: string; description: string }>();
  const data = state.data;
  const donation = data?.donation;

  async function editDonation(input: UpdateDonationInput) {
    await donationService.update(donationId, input, viewer);
    setNotice({ tone: "success", title: "Donation updated", description: "The service-backed listing now contains your changes." });
    refresh();
  }

  async function cancelDonation(reason: string) {
    await donationService.cancel(donationId, reason, viewer);
    setNotice({ tone: "warning", title: "Donation cancelled", description: "The reason was recorded and any active pre-pickup claim was released." });
    refresh();
  }

  async function reportIssue(input: CreateDonationIncidentInput) {
    await incidentService.createForDonation(donationId, input, viewer);
    setNotice({ tone: "warning", title: "Issue report submitted", description: "This mock rescue is now disputed and normal progression is paused for review." });
    refresh();
  }

  async function shareDonation() {
    const shareData = { title: donation?.title ?? "ShareBite BD donation", text: "View this ShareBite BD food rescue update.", url: window.location.href };
    const shareApi = Reflect.get(navigator, "share") as ((data: ShareData) => Promise<void>) | undefined;
    const usedNativeShare = typeof shareApi === "function";
    try {
      if (shareApi) await shareApi.call(navigator, shareData);
      else await navigator.clipboard.writeText(window.location.href);
      setNotice({ tone: "success", title: "Share link ready", description: usedNativeShare ? "The device share sheet was opened." : "The donation link was copied to the clipboard." });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice({ tone: "danger", title: "Could not share", description: "Copy the page address from your browser and share it manually." });
    }
  }

  const canReport = Boolean(data?.claim && donation && canTransitionDonation(donation.status, DonationStatus.DISPUTED) && canTransitionClaim(data.claim.status, ClaimStatus.DISPUTED));

  return (
    <PortalShell role="donor" activeHref={ROUTES.donor.donations} title={donation?.title ?? "Donation details"} description="Review food, pickup, receiver, lifecycle, and donor actions from one permission-aware record." actions={<ButtonLink href={ROUTES.donor.donations} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>My Donations</ButtonLink>} profileName="UIU Cafeteria" profileDescription="Mock verified food donor" avatarInitials="UC" notificationHref={ROUTES.donor.notifications} unreadNotifications={1}>
      {state.status === "loading" && !data && <DonationDetailLoading />}
      {state.status === "error" && !data && <Alert tone="danger" title="Donation details could not be loaded" description={state.error.message} action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={refresh}>Retry</Button>} />}

      {data && donation && (
        <div className="grid gap-6">
          {notice && <Alert tone={notice.tone} title={notice.title} description={notice.description} />}
          {state.status === "loading" && <Alert tone="info" title="Refreshing donation" description="The latest in-memory service state is being loaded." />}
          {donation.status === DonationStatus.CANCELLED && donation.cancellationReason && <Alert tone="warning" title="Cancellation reason" description={donation.cancellationReason} />}
          {data.incidents[0] && <Alert tone="danger" title={`Issue under review · ${data.incidents[0].status.toLowerCase().replaceAll("_", " ")}`} description={data.incidents[0].description} />}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="grid gap-6">
              <Card className="overflow-hidden">
                <div className="relative h-64 bg-brand-100 sm:h-96">
                  <Image src={donationImageUrl(donation)} alt="Prepared food donation ready for pickup" fill priority sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
                  <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 bg-gradient-to-b from-brand-950/70 to-transparent p-5 pb-16 sm:p-7"><div className="flex flex-wrap gap-2"><StatusBadge status={donation.status} /><Badge tone={donation.priority === "URGENT" || donation.priority === "HIGH" ? "danger" : "accent"}>{donation.priority.toLowerCase()} priority</Badge></div><Badge tone="neutral">{donation.photoUrls.length || 1} photo preview</Badge></div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/90 to-transparent p-5 pt-20 text-white sm:p-7"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">{FOOD_CATEGORY_LABELS[donation.category]}</p><h2 className="mt-2 text-2xl font-black sm:text-4xl">{donation.title}</h2></div>
                </div>
                <div className="p-5 sm:p-7">
                  <p className="text-sm leading-7 text-muted-600 sm:text-base">{donation.description}</p>
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><Utensils className="size-4 text-brand-600" />Quantity</dt><dd className="mt-2 font-black text-ink-900">{formatDonationQuantity(donation)}</dd><dd className="mt-1 text-xs text-muted-600">Approx. {donation.quantity.estimatedMeals} meals</dd></div>
                    <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><ShieldCheck className="size-4 text-brand-600" />Storage</dt><dd className="mt-2 font-black text-ink-900">{STORAGE_CONDITION_LABELS[donation.storageCondition]}</dd><dd className="mt-1 text-xs capitalize text-muted-600">{donation.foodCondition.toLowerCase().replaceAll("_", " ")}</dd></div>
                    <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><CalendarClock className="size-4 text-brand-600" />Prepared</dt><dd className="mt-2 font-black text-ink-900">{formatDonationDateTime(donation.preparationTime)}</dd></div>
                    <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><CalendarClock className="size-4 text-brand-600" />Safe pickup deadline</dt><dd className="mt-2 font-black text-ink-900">{formatDonationDateTime(donation.safePickupDeadline)}</dd></div>
                  </dl>

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <section className="rounded-2xl border border-line p-5"><h3 className="font-black text-ink-900">Dietary and allergen details</h3><div className="mt-3 flex flex-wrap gap-2">{donation.dietaryTypes.map((item) => <Badge key={item} tone="brand">{DIETARY_TYPE_LABELS[item]}</Badge>)}</div><p className="mt-4 text-sm leading-6 text-muted-600"><strong className="text-ink-900">Known allergens:</strong> {donation.allergens.length ? donation.allergens.join(", ") : "None known declared"}</p></section>
                    <section className="rounded-2xl border border-line p-5"><h3 className="font-black text-ink-900">Pickup window</h3><p className="mt-3 text-sm leading-6 text-muted-600">{formatDonationDateTime(donation.pickup.windowStart)} – {formatDonationDateTime(donation.pickup.windowEnd)}</p>{donation.specialInstructions && <p className="mt-3 text-sm leading-6 text-muted-600"><strong className="text-ink-900">Instructions:</strong> {donation.specialInstructions}</p>}</section>
                  </div>
                </div>
              </Card>

              <Card className="p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Status history</p><h2 className="mt-2 text-2xl font-black text-ink-900">Donation lifecycle</h2></div><StatusBadge status={donation.status} /></div><DonationStatusTimeline status={donation.status} /></Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Owner-authorized</p><h2 className="mt-2 text-xl font-black text-ink-900">Pickup information</h2></div><Badge tone={donation.pickup.sensitiveDetailsVisible ? "success" : "warning"}>{donation.pickup.sensitiveDetailsVisible ? "Private details visible" : "Approximate only"}</Badge></div><div className="mt-5 grid gap-3 text-sm leading-6 text-muted-600"><p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><strong className="text-ink-900">Public area:</strong> {donation.pickup.approximateArea}</span></p>{donation.pickup.exactAddress && <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><strong className="text-ink-900">Exact address:</strong> {donation.pickup.exactAddress.addressLine}, {donation.pickup.exactAddress.area}, {donation.pickup.exactAddress.city}</span></p>}{donation.pickup.contact && <p className="flex items-start gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><strong className="text-ink-900">Pickup contact:</strong> {donation.pickup.contact.name}, {donation.pickup.contact.phone}</span></p>}{donation.pickup.directions && <p className="rounded-2xl bg-brand-50 p-3">{donation.pickup.directions}</p>}</div></Card>

                <Card className="p-5 sm:p-6">{data.receiverNgo ? <><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Authorized receiver</p><h2 className="mt-2 text-xl font-black text-ink-900">{data.receiverNgo.name}</h2></div><Badge tone="success">Verified NGO</Badge></div><div className="mt-5 grid gap-3 text-sm text-muted-600"><p className="flex items-center gap-2"><Star className="size-4 text-accent-500" />{data.receiverNgo.rating ?? "New"} rating · {data.receiverNgo.completedRescues} rescues</p><p className="flex items-start gap-2"><Building2 className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>{data.receiverNgo.serviceAreas.join(", ")}</span></p>{data.receiverNgo.contactName && <p className="flex items-start gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>{data.receiverNgo.contactName}{data.receiverNgo.contactPhone ? ` · ${data.receiverNgo.contactPhone}` : ""}</span></p>}</div></> : <div className="grid place-items-center py-8 text-center"><Building2 className="size-10 text-brand-300" /><h2 className="mt-4 text-xl font-black text-ink-900">Waiting for an NGO match</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-600">Receiver details appear here only after an authorized claim exists.</p></div>}</Card>
              </div>
            </div>

            <aside className="grid gap-5 xl:sticky xl:top-24" aria-label="Donation actions and rescue summary">
              <Card className="p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Current state</p><p className="mt-2 text-xl font-black text-ink-900">{STATUS_META[donation.status].label}</p></div><ClipboardCheck className="size-7 text-brand-600" /></div><div className="mt-4"><RescueClock deadline={donation.safePickupDeadline} /></div><p className="mt-4 text-xs leading-5 text-muted-600">This clock uses the declared deadline and does not medically guarantee freshness.</p></Card>
              <ButtonLink href={ROUTES.donor.donationTracking(donation.id)} leftIcon={<Navigation className="size-4" />}>Open live tracking</ButtonLink>
              <Button type="button" variant="outline" leftIcon={<Share2 className="size-4" />} onClick={shareDonation}>Share donation</Button>
              <Card className="p-5"><p className="font-black text-ink-900">Manage donation</p><p className="mt-2 text-xs leading-5 text-muted-600">Edit and cancellation lock when pickup begins. Closed donations remain read-only.</p><div className="mt-4"><DonationActions donation={donation} canEdit={canEditDonation(donation.status)} canCancel={canCancelDonation(donation.status)} canReport={canReport} onEdit={editDonation} onCancel={cancelDonation} onReport={reportIssue} /></div></Card>
              <Card className="p-5"><p className="text-xs font-bold text-muted-400">Donation ID</p><p className="mt-2 break-all font-mono text-sm font-black text-brand-800">{donation.id}</p><p className="mt-3 text-xs text-muted-600">Last updated {formatDonationDateTime(donation.updatedAt)}</p></Card>
              <div className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success-soft p-4 text-sm text-success-strong"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><p><strong>Safety declaration recorded.</strong> It supports traceability but is not a certification or medical guarantee.</p></div>
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
