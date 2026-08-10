"use client";

import { ArrowLeft, Building2, CalendarClock, Car, CheckCircle2, Clock3, MapPin, MessageCircle, Navigation, Phone, QrCode, RefreshCw, ShieldAlert, Truck, UserRound } from "lucide-react";
import { DonationStatusTimeline } from "@/components/donation/donation-status-timeline";
import { RescueClock } from "@/components/donor/rescue-clock";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClassNames } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDonationDateTime } from "@/features/donations/donation-presentation";
import { useDonationTracking } from "@/features/donations/use-donation-tracking";
import { TransportMethod } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";

const transportMethodLabels: Record<TransportMethod, string> = {
  [TransportMethod.BICYCLE]: "Bicycle",
  [TransportMethod.MOTORCYCLE]: "Motorcycle",
  [TransportMethod.CAR]: "Car",
  [TransportMethod.WALKING_OR_TRANSIT]: "Walking or public transit",
};

function TrackingLoading() {
  return <SkeletonGroup label="Loading rescue tracking" className="grid gap-6"><Card className="p-6"><Skeleton className="h-8 w-1/2" /><Skeleton className="mt-5 h-28 w-full" /></Card><div className="grid gap-6 xl:grid-cols-[1fr_22rem]"><Skeleton className="h-[28rem] w-full" /><Skeleton className="h-[28rem] w-full" /></div></SkeletonGroup>;
}

function MockQrHandover({ token }: { token?: string }) {
  const patternSeed = token?.length ?? 5;
  const cells = Array.from({ length: 121 }, (_, index) => ((index * 7 + patternSeed * 3 + Math.floor(index / 11)) % 5) < 2);
  const fallbackCode = token?.match(/(\d{6})$/)?.[1];

  return (
    <Card id="handover" className="overflow-hidden">
      <div className="border-b border-line bg-brand-50 p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-600 text-white"><QrCode className="size-5" /></span><div><p className="font-black text-ink-900">Pickup QR handover</p><p className="text-xs text-muted-600">Frontend entry point · mock token only</p></div></div></div>
      <div className="grid place-items-center p-5 text-center">
        {token ? <><div aria-label="Decorative mock QR placeholder" className="grid size-44 grid-cols-[repeat(11,minmax(0,1fr))] gap-0.5 rounded-2xl border-8 border-white bg-white p-1 shadow-card ring-1 ring-line">{cells.map((filled, index) => <span key={index} className={filled ? "bg-brand-950" : "bg-white"} />)}</div><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted-600">Fallback pickup code</p><p className="mt-2 font-mono text-3xl font-black tracking-[0.24em] text-brand-800">{fallbackCode ?? "------"}</p></> : <div className="grid place-items-center py-8"><QrCode className="size-12 text-brand-300" /><p className="mt-3 font-black text-ink-900">Token not assigned yet</p><p className="mt-2 text-sm text-muted-600">The mock pickup token appears after volunteer assignment.</p></div>}
        <p className="mt-4 text-xs leading-5 text-muted-600">This visual is not a production-secure QR code. A backend must generate one-time, expiring pickup and delivery credentials.</p>
      </div>
    </Card>
  );
}

export function DonationTracking({ donationId }: { donationId: string }) {
  const { state, refresh } = useDonationTracking(donationId);
  const data = state.data;
  const donation = data?.donation;
  const claim = data?.claim;
  const exactAddress = donation?.pickup.exactAddress;

  return (
    <PortalShell role="donor" activeHref={ROUTES.donor.donations} title="Rescue tracking" description="Follow the permission-aware pickup and delivery journey for this donation." actions={<ButtonLink href={ROUTES.donor.donation(donationId)} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>Donation details</ButtonLink>} profileName="UIU Cafeteria" profileDescription="Mock verified food donor" avatarInitials="UC" notificationHref={ROUTES.donor.notifications} unreadNotifications={1}>
      {state.status === "loading" && !data && <TrackingLoading />}
      {state.status === "error" && !data && <Alert tone="danger" title="Tracking could not be loaded" description={state.error.message} action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={refresh}>Retry</Button>} />}

      {data && donation && (
        <div className="grid gap-6">
          {state.status === "loading" && <Alert tone="info" title="Refreshing tracking" description="Loading the latest mock claim and assignment state." />}
          {data.incidents[0] && <Alert tone="danger" title="Rescue progression paused" description={`An open issue report is under review: ${data.incidents[0].description}`} />}

          <Card className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={donation.status} />{claim && <Badge tone="brand">Claim {claim.status.toLowerCase().replaceAll("_", " ")}</Badge>}</div><h2 className="mt-4 text-2xl font-black text-ink-900 sm:text-3xl">{donation.title}</h2><p className="mt-2 text-sm text-muted-600">Donation ID: <span className="font-mono font-bold text-ink-700">{donation.id}</span></p></div><RescueClock deadline={donation.safePickupDeadline} compact /></div>
            <div className="mt-6 border-t border-line pt-6"><DonationStatusTimeline status={donation.status} compact /></div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="grid gap-6">
              <Card className="overflow-hidden">
                <div className="border-b border-line p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Mock route</p><h2 className="mt-2 text-2xl font-black text-ink-900">Pickup to receiver journey</h2></div>
                <div className="surface-grid relative min-h-[28rem] overflow-hidden bg-brand-50 p-5">
                  <div className="absolute left-[18%] top-[28%] grid size-14 place-items-center rounded-full bg-brand-700 text-white shadow-float ring-8 ring-white/70"><MapPin className="size-7" /></div>
                  <div className="absolute right-[18%] top-[62%] grid size-14 place-items-center rounded-full bg-accent-500 text-white shadow-float ring-8 ring-white/70"><Building2 className="size-7" /></div>
                  <div className="absolute left-[25%] right-[25%] top-1/2 border-t-4 border-dashed border-brand-500/60 [transform:rotate(20deg)]"><span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-700 shadow-card"><Navigation className="size-5 rotate-45" /></span></div>
                  <div className="absolute inset-x-5 bottom-5 grid gap-3 rounded-3xl border border-white/80 bg-white/95 p-5 shadow-card backdrop-blur sm:grid-cols-2">
                    <div><p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Pickup</p><p className="mt-2 font-black text-ink-900">{exactAddress ? `${exactAddress.addressLine}, ${exactAddress.area}` : donation.pickup.approximateArea}</p><p className="mt-1 text-xs text-muted-600">Exact address is visible because you own this donation.</p></div>
                    <div><p className="text-xs font-black uppercase tracking-[0.14em] text-accent-600">Receiver</p><p className="mt-2 font-black text-ink-900">{data.receiverNgo?.name ?? "Awaiting NGO match"}</p><p className="mt-1 text-xs text-muted-600">{data.receiverNgo ? data.receiverNgo.serviceAreas.join(", ") : "Route destination appears after an authorized claim."}</p></div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-info-strong"><Clock3 className="size-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Timing</p><h2 className="text-xl font-black text-ink-900">Estimated rescue schedule</h2></div></div><dl className="mt-5 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-brand-50 p-4"><dt className="text-xs font-bold text-muted-600">Pickup window</dt><dd className="mt-2 font-black text-ink-900">{formatDonationDateTime(donation.pickup.windowStart)}</dd></div><div className="rounded-2xl bg-brand-50 p-4"><dt className="text-xs font-bold text-muted-600">Volunteer ETA</dt><dd className="mt-2 font-black text-ink-900">{claim?.estimatedPickupAt ? formatDonationDateTime(claim.estimatedPickupAt) : "Not assigned"}</dd></div><div className="rounded-2xl bg-brand-50 p-4"><dt className="text-xs font-bold text-muted-600">Estimated delivery</dt><dd className="mt-2 font-black text-ink-900">{claim?.estimatedDeliveryAt ? formatDonationDateTime(claim.estimatedDeliveryAt) : "Not available"}</dd></div></dl><p className="mt-4 text-xs leading-5 text-muted-600">ETAs are frontend mock estimates, not live GPS or guaranteed arrival times.</p></Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-5 sm:p-6">{data.volunteer ? <><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><UserRound className="size-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Assigned volunteer</p><h2 className="mt-1 text-xl font-black text-ink-900">{data.volunteer.name}</h2></div></div><Badge tone="success">Verified mock</Badge></div><div className="mt-5 grid gap-3 text-sm text-muted-600"><p className="flex items-center gap-2"><Car className="size-4 text-brand-600" />{transportMethodLabels[data.volunteer.transportMethod]}</p><p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-600" />{data.volunteer.completedRescues} completed rescues</p></div>{data.volunteer.phone && <div className="mt-5 flex flex-col gap-3 sm:flex-row"><a href={`tel:${data.volunteer.phone}`} className={buttonClassNames({ variant: "outline", size: "sm", className: "flex-1" })}><Phone className="size-4" />Call</a><a href={`sms:${data.volunteer.phone}`} className={buttonClassNames({ variant: "ghost", size: "sm", className: "flex-1" })}><MessageCircle className="size-4" />Message</a></div>}</> : <div className="grid place-items-center py-8 text-center"><Truck className="size-11 text-brand-300" /><h2 className="mt-4 text-xl font-black text-ink-900">Volunteer not assigned</h2><p className="mt-2 text-sm leading-6 text-muted-600">Assignment and contact controls appear only after the claim reaches the authorized stage.</p></div>}</Card>

                <Card className="p-5 sm:p-6">{data.receiverNgo ? <><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-accent-100 text-accent-600"><Building2 className="size-6" /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Receiver NGO</p><h2 className="mt-1 text-xl font-black text-ink-900">{data.receiverNgo.name}</h2></div></div><div className="mt-5 grid gap-3 text-sm text-muted-600"><p>{data.receiverNgo.completedRescues} completed rescues · {data.receiverNgo.rating ?? "New"} rating</p>{data.receiverNgo.contactName && <p className="flex items-center gap-2"><Phone className="size-4 text-brand-600" />{data.receiverNgo.contactName}{data.receiverNgo.contactPhone ? ` · ${data.receiverNgo.contactPhone}` : ""}</p>}</div></> : <div className="grid place-items-center py-8 text-center"><Building2 className="size-11 text-brand-300" /><h2 className="mt-4 text-xl font-black text-ink-900">No receiver yet</h2><p className="mt-2 text-sm text-muted-600">Verified NGO information appears after a claim.</p></div>}</Card>
              </div>

              <Alert tone="warning" title="Food safety and timing notice" description="Keep food covered and stored according to the donor declaration until pickup. The safe pickup deadline supports traceability but is not a medical freshness guarantee." />
            </div>

            <aside className="grid gap-5 xl:sticky xl:top-24" aria-label="Handover and tracking controls">
              <MockQrHandover token={claim?.pickupVerificationToken} />
              <Card className="p-5"><div className="flex items-center gap-3"><ShieldAlert className="size-6 text-brand-600" /><div><p className="font-black text-ink-900">Privacy status</p><p className="text-xs text-muted-600">Permission-aware tracking</p></div></div><p className="mt-4 text-xs leading-5 text-muted-600">Exact pickup and contact details are visible here because this is the owner donor view. Global discovery continues to receive approximate area only.</p></Card>
              <ButtonLink href={ROUTES.donor.donation(donation.id)} variant="outline" leftIcon={<CalendarClock className="size-4" />}>Review donation details</ButtonLink>
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
