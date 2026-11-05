"use client";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Timer,
  Truck,
  Utensils,
  Sparkles,
} from "lucide-react";
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
import {
  CATEGORY_LABELS_BN,
  DIETARY_LABELS_BN,
  PRIORITY_LABELS_BN,
  STORAGE_LABELS_BN,
  STATUS_TEXT_BN,
  donationImageUrl,
  formatDonationDateTimeBn,
  formatDonationQuantityBn,
} from "@/features/donations/donation-presentation";
import { useDonationTracking } from "@/features/donations/use-donation-tracking";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { canTransitionClaim, canTransitionDonation } from "@/lib/status-transitions";
import { ROUTES } from "@/lib/routes";
import { donationService, incidentService, type CreateDonationIncidentInput, type UpdateDonationInput } from "@/services";

function DonationDetailLoading() {
  return (
    <SkeletonGroup label="অনুদানের বিস্তারিত লোড হচ্ছে..." className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="overflow-hidden border-line">
        <Skeleton className="h-80 rounded-none" />
        <div className="grid gap-4 p-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Card>
      <Card className="p-6 border-line">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="mt-5 h-36 w-full" />
        <Skeleton className="mt-4 h-24 w-full" />
      </Card>
    </SkeletonGroup>
  );
}

export function DonationDetailSummary({ donationId }: { donationId: string }) {
  const { state, refresh, viewer } = useDonationTracking(donationId);
  const [notice, setNotice] = useState<{ tone: AlertTone; title: string; description: string }>();
  const [copiedId, setCopiedId] = useState(false);
  const data = state.data;
  const donation = data?.donation;

  async function editDonation(input: UpdateDonationInput) {
    await donationService.update(donationId, input, viewer);
    setNotice({
      tone: "success",
      title: "অনুদানের তথ্য সফলভাবে আপডেট হয়েছে",
      description: "সংশোধিত তথ্যাদি লাইভ সিস্টেমে ও এনজিও পোর্টালে সিঙ্ক করা হয়েছে।",
    });
    refresh();
  }

  async function cancelDonation(reason: string) {
    await donationService.cancel(donationId, reason, viewer);
    setNotice({
      tone: "warning",
      title: "অনুদান বাতিল করা হয়েছে",
      description: "বাতিলের কারণটি ড্যাশবোর্ডে সংরক্ষিত হয়েছে এবং সক্রিয় ক্লেইম থাকলে তা অবমুক্ত করা হয়েছে।",
    });
    refresh();
  }

  async function reportIssue(input: CreateDonationIncidentInput) {
    await incidentService.createForDonation(donationId, input, viewer);
    setNotice({
      tone: "warning",
      title: "সমস্যা রিপোর্ট সফলভাবে জমা হয়েছে",
      description: "অভিযোগটি শেয়ারবাইট বিডি সহায়তা দল পর্যালোচনায় নিয়েছে। সমাধান না হওয়া পর্যন্ত ট্রানজিশন সাময়িকভাবে স্থগিত থাকবে।",
    });
    refresh();
  }

  async function shareDonation() {
    const shareData = {
      title: donation?.title ?? "শেয়ারবাইট বিডি উদ্বৃত্ত খাদ্য অনুদান",
      text: "ঢাকা সিটির সারপ্লাস ফুড রেসকিউ অনুদানের লাইভ আপডেট দেখুন।",
      url: window.location.href,
    };
    const shareApi = Reflect.get(navigator, "share") as ((data: ShareData) => Promise<void>) | undefined;
    const usedNativeShare = typeof shareApi === "function";
    try {
      if (shareApi) await shareApi.call(navigator, shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setNotice({
        tone: "success",
        title: "শেয়ার লিঙ্ক প্রস্তুত",
        description: usedNativeShare ? "ডিভাইস শেয়ার মেনু খোলা হয়েছে।" : "অনুদানের সরাসরি লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে।",
      });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice({
        tone: "danger",
        title: "শেয়ার করা সম্ভব হয়নি",
        description: "ব্রাউজার এড্রেস বার থেকে সরাসরি লিঙ্কটি কপি করে নিন।",
      });
    }
  }

  function copyDonationId() {
    if (!donation) return;
    navigator.clipboard.writeText(donation.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  }

  const canReport = Boolean(
    data?.claim &&
      donation &&
      canTransitionDonation(donation.status, DonationStatus.DISPUTED) &&
      canTransitionClaim(data.claim.status, ClaimStatus.DISPUTED)
  );

  const isUrgent = donation?.priority === "URGENT" || donation?.priority === "HIGH";

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.donations}
      title={donation?.title ?? "অনুদানের বিস্তারিত বিবরণ"}
      description="উদ্বৃত্ত খাবার, পিকআপ লোকেশন, ভেরিফাইড এনজিও গ্রহীতা এবং লাইফসাইকেল ট্র্যাকিংয়ের সমন্বিত কন্ট্রোল।"
      backHref={ROUTES.donor.donations}
      backLabel="সকল অনুদান তালিকা"
      actions={
        donation && (
          <div className="flex items-center gap-2.5">
            <ButtonLink
              href={ROUTES.donor.donationTracking(donation.id)}
              variant="primary"
              leftIcon={<Navigation className="size-4" />}
              className="font-bold shadow-md shadow-emerald-700/20"
            >
              লাইভ ট্র্যাকিং 🛵
            </ButtonLink>
          </div>
        )
      }
      profileName="ইউআইইউ ক্যাফেটেরিয়া"
      profileDescription="ভেরিফাইড ফুড ডোনার · ঢাকা"
      avatarInitials="UC"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !data && <DonationDetailLoading />}

      {state.status === "error" && !data && (
        <Alert
          tone="danger"
          title="অনুদানের তথ্য লোড করা যায়নি"
          description={state.error.message}
          action={
            <Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={refresh}>
              পুনরায় চেষ্টা করুন
            </Button>
          }
        />
      )}

      {data && donation && (
        <div className="grid gap-6">
          {/* Action notices */}
          {notice && <Alert tone={notice.tone} title={notice.title} description={notice.description} />}
          {state.status === "loading" && (
            <Alert tone="info" title="তথ্য রিফ্রেশ হচ্ছে..." description="সর্বশেষ ডাটাবেজ স্টেট সিঙ্ক করা হচ্ছে।" />
          )}
          {donation.status === DonationStatus.CANCELLED && donation.cancellationReason && (
            <Alert
              tone="warning"
              title="অনুদান বাতিলের কারণ"
              description={donation.cancellationReason}
            />
          )}
          {data.incidents[0] && (
            <Alert
              tone="danger"
              title={`সমস্যা পর্যালোচনাধীন · ${data.incidents[0].status}`}
              description={data.incidents[0].description}
            />
          )}

          {/* Main Grid: Details (Left) + Actions/Status (Right) */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="grid gap-6">
              {/* Food Hero Card */}
              <Card className="overflow-hidden border-line shadow-sm">
                <div className="relative h-64 bg-slate-900 sm:h-96">
                  <Image
                    src={donationImageUrl(donation)}
                    alt={donation.title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 70vw"
                    className="object-cover"
                  />
                  {/* Top Badges */}
                  <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 bg-gradient-to-b from-brand-950/80 via-brand-950/40 to-transparent p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={donation.status} />
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-black text-white shadow-sm backdrop-blur-sm">
                          <Flame className="size-3.5" />
                          {PRIORITY_LABELS_BN[donation.priority]}
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-brand-950/70 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur-sm border border-white/20">
                      📸 {donation.photoUrls.length || 1}টি ছবি সংরক্ষিত
                    </span>
                  </div>

                  {/* Bottom Title Bar */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/95 via-brand-950/70 to-transparent p-5 pt-20 text-white sm:p-7">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                        {CATEGORY_LABELS_BN[donation.category] || donation.category}
                      </span>
                    </div>
                    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                      {donation.title}
                    </h1>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <p className="text-sm leading-relaxed text-muted-600 sm:text-base">
                    {donation.description}
                  </p>

                  {/* 4 Quick KPI Boxes */}
                  <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition-all">
                      <dt className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <Utensils className="size-4 text-emerald-600" />
                        পরিমাণ ও সুবিধাভোগী
                      </dt>
                      <dd className="mt-2 text-lg font-black text-ink-900">
                        {formatDonationQuantityBn(donation)}
                      </dd>
                      <dd className="mt-0.5 text-xs font-medium text-emerald-700">
                        আনুমানিক {donation.quantity.estimatedMeals} জনের আহার
                      </dd>
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 transition-all">
                      <dt className="flex items-center gap-2 text-xs font-bold text-teal-800">
                        <ShieldCheck className="size-4 text-teal-600" />
                        সংরক্ষণ শর্ত
                      </dt>
                      <dd className="mt-2 text-base font-black text-ink-900 truncate">
                        {STORAGE_LABELS_BN[donation.storageCondition]}
                      </dd>
                      <dd className="mt-0.5 text-xs font-medium text-teal-700 capitalize">
                        {donation.foodCondition === "PACKAGED" ? "সিল্ড কন্টেইনার" : "তাজা সুরক্ষিত খাবার"}
                      </dd>
                    </div>

                    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 transition-all">
                      <dt className="flex items-center gap-2 text-xs font-bold text-sky-800">
                        <CalendarClock className="size-4 text-sky-600" />
                        প্রস্তুতির সময়
                      </dt>
                      <dd className="mt-2 text-sm font-black text-ink-900">
                        {formatDonationDateTimeBn(donation.preparationTime)}
                      </dd>
                      <dd className="mt-0.5 text-xs font-medium text-sky-700">
                        ক্যাফেটেরিয়া কিচেন
                      </dd>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 transition-all">
                      <dt className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <Timer className="size-4 text-amber-600" />
                        নিরাপদ পিকআপ ডেডলাইন
                      </dt>
                      <dd className="mt-2 text-sm font-black text-ink-900">
                        {formatDonationDateTimeBn(donation.safePickupDeadline)}
                      </dd>
                      <dd className="mt-0.5 text-xs font-medium text-amber-700">
                        বিএফএসএ সর্বোচ্চ সীমা
                      </dd>
                    </div>
                  </dl>

                  {/* Dietary & Allergens + Pickup Window Bento */}
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <section className="rounded-2xl border border-line bg-canvas/40 p-5">
                      <h3 className="flex items-center gap-2 font-black text-ink-900 text-sm">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        খাদ্য বৈশিষ্ট্য ও অ্যালার্জেন ঘোষণা
                      </h3>
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {donation.dietaryTypes.map((item) => (
                          <Badge key={item} tone="brand">
                            {DIETARY_LABELS_BN[item] || item}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl border border-line bg-white p-3 text-xs leading-5">
                        <p className="font-bold text-ink-800">পরিচিত অ্যালার্জেন উপাদান:</p>
                        <p className="mt-0.5 text-muted-600">
                          {donation.allergens.length ? donation.allergens.join(", ") : "কোনো অ্যালার্জেন নেই (ঘোষিত)"}
                        </p>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-line bg-canvas/40 p-5">
                      <h3 className="flex items-center gap-2 font-black text-ink-900 text-sm">
                        <CalendarClock className="size-4 text-emerald-600" />
                        পিকআপের অনুমোদিত সময়সীমা
                      </h3>
                      <div className="mt-3.5 rounded-xl border border-line bg-white p-3 text-xs leading-5">
                        <p className="font-bold text-ink-800">পিকআপ উইন্ডো:</p>
                        <p className="mt-0.5 text-ink-900 font-medium">
                          {formatDonationDateTimeBn(donation.pickup.windowStart)} হতে {formatDonationDateTimeBn(donation.pickup.windowEnd)}
                        </p>
                      </div>
                      {donation.specialInstructions && (
                        <div className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-xs leading-5">
                          <p className="font-bold text-amber-900">রাইডারের জন্য নির্দেশনা:</p>
                          <p className="mt-0.5 text-amber-800">{donation.specialInstructions}</p>
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              </Card>

              {/* Status Timeline Card */}
              <Card className="p-5 sm:p-7 border-line">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
                      <Sparkles className="size-3.5" />
                      লাইফসাইকেল প্রগ্রেস
                    </span>
                    <h2 className="mt-1 text-xl font-black text-ink-900">
                      অনুদানের বর্তমান ধাপ ও ট্র্যাকিং হিস্ট্রি
                    </h2>
                  </div>
                  <StatusBadge status={donation.status} />
                </div>
                <DonationStatusTimeline status={donation.status} />
              </Card>

              {/* Pickup Information & Receiver NGO */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pickup Details Card */}
                <Card className="p-5 sm:p-6 border-line">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        ডোনার অনুমোদিত
                      </p>
                      <h2 className="mt-1 text-lg font-black text-ink-900">
                        পিকআপ লোকেশন ও কন্টাক্ট
                      </h2>
                    </div>
                    <Badge tone={donation.pickup.sensitiveDetailsVisible ? "success" : "warning"}>
                      {donation.pickup.sensitiveDetailsVisible ? "সম্পূর্ণ ঠিকানা দৃশ্যমান" : "পাবলিক এলাকা মাত্র"}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm leading-relaxed text-muted-600">
                    <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <div>
                        <strong className="text-ink-900">সাধারণ এলাকা:</strong>
                        <p className="text-ink-800 font-medium">{donation.pickup.approximateArea}</p>
                      </div>
                    </div>

                    {donation.pickup.exactAddress && (
                      <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <div>
                          <strong className="text-ink-900">পূর্ণাঙ্গ পিকআপ ঠিকানা:</strong>
                          <p className="text-ink-800 font-medium">
                            {donation.pickup.exactAddress.addressLine}, {donation.pickup.exactAddress.area},{" "}
                            {donation.pickup.exactAddress.city}
                          </p>
                        </div>
                      </div>
                    )}

                    {donation.pickup.contact && (
                      <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                        <Phone className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <div>
                          <strong className="text-ink-900">পিকআপ দায়িত্বশীল ব্যক্তি:</strong>
                          <p className="text-ink-800 font-medium">
                            {donation.pickup.contact.name} ({donation.pickup.contact.phone})
                          </p>
                        </div>
                      </div>
                    )}

                    {donation.pickup.directions && (
                      <p className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-900">
                        💡 <strong>রাস্তার দিকনির্দেশনা:</strong> {donation.pickup.directions}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Receiver NGO Card */}
                <Card className="p-5 sm:p-6 border-line">
                  {data.receiverNgo ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                            অনুমোদিত উদ্ধারকারী সংস্থা
                          </p>
                          <h2 className="mt-1 text-lg font-black text-ink-900">
                            {data.receiverNgo.name}
                          </h2>
                        </div>
                        <Badge tone="success">ভেরিফাইড এনজিও ✓</Badge>
                      </div>

                      <div className="mt-5 grid gap-3 text-sm text-muted-600">
                        <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas/60 p-3 text-xs">
                          <Star className="size-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-ink-900">{data.receiverNgo.rating ?? "৫.০"}</span>
                          <span>স্টার রেটিং · {data.receiverNgo.completedRescues}টি সফল রেসকিউ সম্পন্ন</span>
                        </div>

                        <div className="flex items-start gap-2 rounded-xl border border-line bg-canvas/60 p-3 text-xs">
                          <Building2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          <div>
                            <p className="font-bold text-ink-900">কার্যক্রমের আওতাভুক্ত এলাকা:</p>
                            <p className="mt-0.5 text-muted-600">{data.receiverNgo.serviceAreas.join(", ")}</p>
                          </div>
                        </div>

                        {data.receiverNgo.contactName && (
                          <div className="flex items-start gap-2 rounded-xl border border-line bg-canvas/60 p-3 text-xs">
                            <Phone className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                            <div>
                              <p className="font-bold text-ink-900">যোগাযোগের ফোকাল পার্সন:</p>
                              <p className="mt-0.5 text-muted-600">
                                {data.receiverNgo.contactName}
                                {data.receiverNgo.contactPhone ? ` (${data.receiverNgo.contactPhone})` : ""}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="grid place-items-center py-10 text-center">
                      <div className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Building2 className="size-7" />
                      </div>
                      <h2 className="mt-4 text-lg font-black text-ink-900">
                        ভেরিফাইড এনজিও ক্লেইমের অপেক্ষায়
                      </h2>
                      <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted-600">
                        নিকটস্থ অনুমোদিত এনজিও অনুদানটি গ্রহণ করার পর দায়িত্বশীল ব্যক্তি ও প্রতিষ্ঠানের তথ্য এখানে প্রদর্শিত হবে।
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Sticky Sidebar: Countdown, Actions & ID */}
            <aside className="grid gap-5 xl:sticky xl:top-24" aria-label="Donation controls and rescue clock">
              {/* Countdown Card */}
              <Card className="p-5 border-line shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      লাইভ স্ট্যাটাস
                    </p>
                    <p className="mt-1 text-lg font-black text-ink-900">
                      {STATUS_TEXT_BN[donation.status] || donation.status}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ClipboardCheck className="size-5" />
                  </span>
                </div>

                <div className="mt-4">
                  <RescueClock deadline={donation.safePickupDeadline} />
                </div>
                <p className="mt-3 text-[11px] leading-4 text-muted-500">
                  নির্ধারিত ডেডলাইন অনুদানের খাদ্যমান অক্ষুণ্ন রাখার জন্য নির্ধারিত।
                </p>
              </Card>

              {/* Action Buttons */}
              <div className="grid gap-2.5">
                <ButtonLink
                  href={ROUTES.donor.donationTracking(donation.id)}
                  variant="primary"
                  leftIcon={<Navigation className="size-4" />}
                  className="w-full justify-center font-black shadow-lg shadow-emerald-700/20 py-3"
                >
                  লাইভ ট্র্যাকিং ম্যাপ খুলুন 🛵
                </ButtonLink>
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Share2 className="size-4" />}
                  onClick={shareDonation}
                  className="w-full justify-center font-bold border-line hover:bg-emerald-50/50"
                >
                  শেয়ার লিঙ্ক কপি করুন
                </Button>
              </div>

              {/* Management Controls */}
              <Card className="p-5 border-line shadow-sm">
                <p className="font-black text-ink-900 text-sm">অনুদানের অ্যাকশন কন্ট্রোল</p>
                <p className="mt-1 text-xs leading-5 text-muted-500">
                  রাইডার পিকআপ শুরু করার পূর্ব পর্যন্ত তথ্য সংশোধন করা যাবে।
                </p>
                <div className="mt-4">
                  <DonationActions
                    donation={donation}
                    canEdit={canEditDonation(donation.status)}
                    canCancel={canCancelDonation(donation.status)}
                    canReport={canReport}
                    onEdit={editDonation}
                    onCancel={cancelDonation}
                    onReport={reportIssue}
                  />
                </div>
              </Card>

              {/* Unique ID Card */}
              <Card className="p-5 border-line">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-500">অনুদান রেফারেন্স আইডি</p>
                  <button
                    type="button"
                    onClick={copyDonationId}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Copy className="size-3" />
                    {copiedId ? "কপি হয়েছে!" : "কপি করুন"}
                  </button>
                </div>
                <p className="mt-2 break-all font-mono text-xs font-black text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/50">
                  {donation.id}
                </p>
                <p className="mt-2.5 text-[11px] text-muted-500">
                  সর্বশেষ আপডেট: {formatDonationDateTimeBn(donation.updatedAt)}
                </p>
              </Card>

              {/* BFSA Safety Declaration badge */}
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/80 p-4 text-xs text-emerald-950 backdrop-blur-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <p className="leading-relaxed">
                  <strong>বিএফএসএ মান অনুযায়ী ঘোষণা সংরক্ষিত।</strong> খাবারটির স্বচ্ছতা, ট্র্যাকিং ও খাদ্য সুরক্ষার তথ্য সিস্টেমে ডিজিটাল অডিট ট্রেইলে যুক্ত আছে।
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
