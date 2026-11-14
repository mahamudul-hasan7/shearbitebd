"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import {
  Bike,
  Building2,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { RescueLocationMap } from "@/components/maps/rescue-location-map";
import { HandoverCodePanel } from "@/components/donation/handover-code-panel";
import { DonationStatusTimeline } from "@/components/donation/donation-status-timeline";
import { RescueClock } from "@/components/donor/rescue-clock";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClassNames } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  STATUS_TEXT_BN,
  formatDonationDateTimeBn,
} from "@/features/donations/donation-presentation";
import { useDonationTracking } from "@/features/donations/use-donation-tracking";
import { TransportMethod } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";

const TRANSPORT_LABELS_BN: Record<TransportMethod, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  [TransportMethod.BICYCLE]: { label: "বাইসাইকেল", icon: Bike },
  [TransportMethod.MOTORCYCLE]: { label: "মোটরসাইকেল (দ্রুতগামী)", icon: Bike },
  [TransportMethod.CAR]: { label: "মাইক্রোবাস / কার", icon: Car },
  [TransportMethod.WALKING_OR_TRANSIT]: { label: "পায়ে হেঁটে / গণপরিবহন", icon: Truck },
};

function TrackingLoading() {
  const tx = useUiText();
  return (
    <LoadingSpinner label={tx("রেসকিউ ট্র্যাকিং লোড হচ্ছে...")} />
  );
}

export function DonationTracking({ donationId }: { donationId: string }) {
  const tx = useUiText();
  const { state, refresh } = useDonationTracking(donationId);
  const data = state.data;
  const donation = data?.donation;
  const claim = data?.claim;
  const exactAddress = donation?.pickup.exactAddress;

  const transportInfo = data?.volunteer
    ? TRANSPORT_LABELS_BN[data.volunteer.transportMethod] || {
        label: data.volunteer.transportMethod,
        icon: Bike,
      }
    : null;

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.donations}
      title={tx("রেসকিউ লাইভ ট্র্যাকিং 🛵")}
      description={tx("উদ্বৃত্ত খাবার সংগ্রহ হতে আশ্রয়কেন্দ্রে পৌঁছানো পর্যন্ত ভলান্টিয়ারের রিয়েল-টাইম অবস্থান ও হ্যান্ডওভার।")}
      backHref={ROUTES.donor.donation(donationId)}
      backLabel={tx("অনুদানের বিবরণ")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-4" />}
            onClick={refresh}
            className="text-muted-600 hover:text-emerald-700"
          ><UiText source={"রিফ্রেশ"} /></Button>
        </div>
      }
      profileName="ইউআইইউ ক্যাফেটেরিয়া"
      profileDescription={tx("ভেরিফাইড ফুড ডোনার · ঢাকা")}
      avatarInitials="UC"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !data && <TrackingLoading />}

      {state.status === "error" && !data && (
        <Alert
          tone="danger"
          title={tx("ট্র্যাকিং তথ্য লোড করা যায়নি")}
          description={tx(state.error.message)}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={refresh}
            ><UiText source={"পুনরায় চেষ্টা করুন"} /></Button>
          }
        />
      )}

      {data && donation && (
        <div className="grid gap-6">
          {state.status === "loading" && (
            <Alert
              tone="info"
              title={tx("তথ্য সিঙ্ক হচ্ছে...")}
              description={tx("রাইডার লোকেশন ও ট্রানজিশন হিস্ট্রি আপডেট করা হচ্ছে।")}
            />
          )}
          {data.incidents[0] && (
            <Alert
              tone="danger"
              title={tx("রেসকিউ সাময়িকভাবে স্থগিত")}
              description={tx("একটি উন্মুক্ত সমস্যা রিপোর্ট পর্যালোচনায় রয়েছে: {0}", data.incidents[0].description)}
            />
          )}

          {/* Top Status & Lifecycle Bar */}
          <Card className="p-5 sm:p-7 border-line shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={donation.status} />
                  {claim && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      {tx("ক্লেইম স্ট্যাটাস:")}{STATUS_TEXT_BN[donation.status] || claim.status}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-black text-ink-900 sm:text-3xl">
                  {donation.title}
                </h1>
                <p className="mt-1.5 text-xs text-muted-600">
                  {tx("অনুদান ট্র্যাকিং রেফারেন্স:")}{" "}
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {donation.id}
                  </span>
                </p>
              </div>
              <RescueClock deadline={donation.safePickupDeadline} compact />
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <DonationStatusTimeline status={donation.status} claim={claim} publishedAt={donation.publishedAt} updatedAt={donation.updatedAt} stale={state.status === "error"} compact />
            </div>
          </Card>

          {/* Main Grid: Interactive Radar Map (Left) + Handover/Driver controls (Right) */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="grid gap-6">
              <Card className="p-5 sm:p-6"><h2 className="mb-4 text-lg font-bold">{tx("Rescue locations & navigation")}</h2><RescueLocationMap pickup={exactAddress?.coordinates} delivery={data.deliveryAddress?.coordinates} pickupLabel={exactAddress ? `${exactAddress.addressLine}, ${exactAddress.area}` : donation.pickup.approximateArea} deliveryLabel={data.deliveryAddress ? `${data.deliveryAddress.addressLine}, ${data.deliveryAddress.area}` : data.receiverNgo?.name} /></Card>

              {/* Timing Schedule Bento */}
              <Card className="p-5 sm:p-6 border-line shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Clock3 className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      {tx("আনুমানিক সময়সূচি")}</p>
                    <h2 className="text-lg font-black text-ink-900">{tx("রেসকিউ শিডিউল ও ইটিএ")}</h2>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-line bg-canvas/60 p-4">
                    <dt className="text-xs font-bold text-muted-600">{tx("পিকআপ সময়সীমা শুরু")}</dt>
                    <dd className="mt-1.5 text-sm font-black text-ink-900">
                      {formatDonationDateTimeBn(donation.pickup.windowStart)}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                    <dt className="text-xs font-bold text-amber-800">{tx("ভলান্টিয়ার পৌঁছানোর ইটিএ")}</dt>
                    <dd className="mt-1.5 text-sm font-black text-ink-900">
                      {claim?.estimatedPickupAt ? formatDonationDateTimeBn(claim.estimatedPickupAt) : tx("নির্ধারিত হচ্ছে")}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4">
                    <dt className="text-xs font-bold text-teal-800">{tx("শেল্টারে বিতরণের সময়")}</dt>
                    <dd className="mt-1.5 text-sm font-black text-ink-900">
                      {claim?.estimatedDeliveryAt ? formatDonationDateTimeBn(claim.estimatedDeliveryAt) : tx("পিকআপের পর নির্ধারিত হবে")}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Volunteer Rider & Receiver NGO Profiles */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Volunteer Card */}
                <Card className="p-5 sm:p-6 border-line shadow-sm">
                  {data.volunteer ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <UserRound className="size-6" />
                          </span>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                              {tx("নিযুক্ত ভলান্টিয়ার রাইডার")}</p>
                            <h2 className="mt-0.5 text-lg font-black text-ink-900">
                              {data.volunteer.name}
                            </h2>
                          </div>
                        </div>
                        <Badge tone="success">{tx("ভেরিফাইড রাইডার ✓")}</Badge>
                      </div>

                      <div className="mt-5 grid gap-2.5 text-xs text-muted-600">
                        <div className="flex items-center gap-2 rounded-xl bg-canvas/60 p-2.5 border border-line">
                          {transportInfo && <transportInfo.icon className="size-4 text-emerald-600" />}
                          <span className="font-bold text-ink-800">{tx("বাহন:")}{" "}{transportInfo?.label}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-canvas/60 p-2.5 border border-line">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span className="font-bold text-ink-800">
                            {data.volunteer.completedRescues}{tx("টি সফল রেসকিউ সম্পন্ন করেছেন")}</span>
                        </div>
                      </div>

                      {data.volunteer.phone && (
                        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                          <a
                            href={`tel:${data.volunteer.phone}`}
                            className={buttonClassNames({
                              variant: "primary",
                              size: "sm",
                              className: "flex-1 justify-center font-bold shadow-md shadow-emerald-700/20",
                            })}
                          >
                            <Phone className="size-4 mr-1.5" />
                            {tx("সরাসরি কল")}</a>
                          <a
                            href={`sms:${data.volunteer.phone}`}
                            className={buttonClassNames({
                              variant: "outline",
                              size: "sm",
                              className: "flex-1 justify-center font-bold border-line hover:bg-emerald-50/50",
                            })}
                          >
                            <MessageCircle className="size-4 mr-1.5" />
                            {tx("মেসেজ পাঠান")}</a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid place-items-center py-10 text-center">
                      <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Truck className="size-6" />
                      </div>
                      <h2 className="mt-4 text-base font-black text-ink-900">
                        {tx("ভলান্টিয়ার বরাদ্দের অপেক্ষায়")}</h2>
                      <p className="mt-1 text-xs text-muted-600">
                        {tx("এনজিও ক্লেইম অনুমোদনের পর নিকটবর্তী ভলান্টিয়ার অ্যাসাইন হবে।")}</p>
                    </div>
                  )}
                </Card>

                {/* Receiver NGO Card */}
                <Card className="p-5 sm:p-6 border-line shadow-sm">
                  {data.receiverNgo ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-700">
                          <Building2 className="size-6" />
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-teal-700">
                            {tx("বিতরণকারী এনজিও")}</p>
                          <h2 className="mt-0.5 text-lg font-black text-ink-900">
                            {data.receiverNgo.name}
                          </h2>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-2.5 text-xs text-muted-600">
                        <p className="rounded-xl bg-canvas/60 p-2.5 border border-line">
                          🏆 {data.receiverNgo.completedRescues}{tx("টি সফল উদ্ধার ·")}{" "}{data.receiverNgo.rating ?? "৫.০"} {tx("স্টার রেটিং")}</p>
                        {data.receiverNgo.contactName && (
                          <p className="flex items-center gap-2 rounded-xl bg-canvas/60 p-2.5 border border-line">
                            <Phone className="size-4 text-emerald-600" />
                            <span>
                              {data.receiverNgo.contactName}
                              {data.receiverNgo.contactPhone ? ` · ${data.receiverNgo.contactPhone}` : ""}
                            </span>
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="grid place-items-center py-10 text-center">
                      <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <Building2 className="size-6" />
                      </div>
                      <h2 className="mt-4 text-base font-black text-ink-900">{tx("কোনো গ্রহীতা এখনও যুক্ত হয়নি")}</h2>
                      <p className="mt-1 text-xs text-muted-600">
                        {tx("অনুমোদিত এনজিও ক্লেইম করার সাথে সাথে তথ্য এখানে যুক্ত হবে।")}</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Safety banner */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/70 p-4 text-xs text-amber-950">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="leading-relaxed">
                  <strong>{tx("খাদ্য সুরক্ষা ও ট্র্যাকিং সতর্কতা:")}</strong> {tx("পিকআপ হওয়ার পূর্ব মুহূর্ত পর্যন্ত খাবার নির্ধারিত তাপমাত্রায় ও সিল করা পাত্রে ঢেকে রাখুন।")}</p>
              </div>
            </div>

            {/* Right Sticky Sidebar: QR Handover & Privacy */}
            <aside className="grid gap-5 xl:sticky xl:top-24" aria-label={tx("হ্যান্ডওভার ও ট্র্যাকিং কন্ট্রোল")}>
              {claim && <HandoverCodePanel claimId={claim.id} kind="PICKUP" />}

              <Card className="p-5 border-line shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="font-black text-ink-900 text-sm">{tx("গোপনীয়তা ও নিরাপত্তা স্ট্যাটাস")}</p>
                    <p className="text-[11px] text-muted-600">{tx("এনক্রিপ্টেড ট্র্যাকিং তথ্য")}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-600">
                  {tx("আপনার সুনির্দিষ্ট ঠিকানা এবং ফোন নম্বর কেবল খাবার সংগ্রহের দায়িত্বে থাকা ভলান্টিয়ারের কাছেই দৃশ্যমান। অন্য কারো কাছে এটি প্রকাশ করা হয় না।")}</p>
              </Card>

              <ButtonLink
                href={ROUTES.donor.donation(donation.id)}
                variant="outline"
                leftIcon={<CalendarClock className="size-4" />}
                className="w-full justify-center font-bold border-line hover:bg-emerald-50/50"
              >
                {tx("অনুদানের মূল বিবরণী দেখুন")}</ButtonLink>
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
