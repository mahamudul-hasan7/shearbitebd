"use client";

import {
  ArrowLeft,
  Bike,
  Building2,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Flame,
  Gauge,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  QrCode,
  Radio,
  RefreshCw,
  Route,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserRound,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { DonationStatusTimeline } from "@/components/donation/donation-status-timeline";
import { RescueClock } from "@/components/donor/rescue-clock";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClassNames } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
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
  return (
    <SkeletonGroup label="রেসকিউ ট্র্যাকিং লোড হচ্ছে..." className="grid gap-6">
      <Card className="p-6 border-line">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-5 h-28 w-full" />
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Skeleton className="h-[30rem] w-full" />
        <Skeleton className="h-[30rem] w-full" />
      </div>
    </SkeletonGroup>
  );
}

function MockQrHandover({ token, code }: { token?: string; code?: string }) {
  const [copied, setCopied] = useState(false);
  const patternSeed = (token?.length ?? 7) + (code?.length ?? 4);
  const cells = Array.from({ length: 121 }, (_, index) => ((index * 7 + patternSeed * 3 + Math.floor(index / 11)) % 5) < 2);
  const rawDigits = (code || token || "").replace(/\D/g, "");
  const fallbackCode = code || (rawDigits.length >= 4 ? rawDigits.slice(-4) : "7429");

  function copyCode() {
    navigator.clipboard.writeText(fallbackCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card id="handover" className="overflow-hidden border-line shadow-sm">
      <div className="border-b border-line bg-gradient-to-r from-emerald-50 via-teal-50 to-transparent p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-700/20">
            <QrCode className="size-5" />
          </span>
          <div>
            <p className="font-black text-ink-900 text-sm">পিকআপ কিউআর ও ওটিপি ভেরিফিকেশন</p>
            <p className="text-xs text-muted-600">রাইডারকে খাবার হস্তান্তরের ডিজিটাল স্বীকৃতি</p>
          </div>
        </div>
      </div>

      <div className="p-5 text-center">
        {token || code ? (
          <>
            {/* Target Scanner QR Container */}
            <div className="relative mx-auto inline-block p-4">
              <div className="absolute top-1 left-1 size-5 border-t-2 border-l-2 border-emerald-600" />
              <div className="absolute top-1 right-1 size-5 border-t-2 border-r-2 border-emerald-600" />
              <div className="absolute bottom-1 left-1 size-5 border-b-2 border-l-2 border-emerald-600" />
              <div className="absolute bottom-1 right-1 size-5 border-b-2 border-r-2 border-emerald-600" />

              <div
                aria-label="Secure OTP Handover QR"
                className="grid size-44 grid-cols-[repeat(11,minmax(0,1fr))] gap-0.5 rounded-2xl border-4 border-white bg-white p-2 shadow-inner ring-1 ring-emerald-200"
              >
                {cells.map((filled, index) => (
                  <span
                    key={index}
                    className={filled ? "bg-emerald-950 rounded-[1px]" : "bg-white"}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                ৪-ডিজিট পিকআপ ওটিপি (OTP)
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5 font-mono text-2xl font-black text-emerald-950">
                  {fallbackCode.split("").map((digit, i) => (
                    <span
                      key={i}
                      className="inline-grid size-10 place-items-center rounded-xl border border-emerald-300 bg-white shadow-xs"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition-all"
                  title="ওটিপি কপি করুন"
                >
                  <Copy className="size-3.5 inline mr-1" />
                  {copied ? "কপি হয়েছে!" : "কপি"}
                </button>
              </div>
            </div>

            <div className="mt-4 text-left text-xs leading-relaxed text-muted-600 bg-canvas/60 p-3 rounded-xl border border-line">
              <p className="font-bold text-ink-900 mb-1">হস্তান্তর নির্দেশিকা:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>রাইডারের পরিচয় ও ব্যাজ যাচাই করুন।</li>
                <li>রাইডার আসলে খাবার তুলে দিয়ে এই ৪-ডিজিটের কোডটি প্রদান করুন বা কিউআর কোড স্ক্যান করতে দিন।</li>
                <li>রাইডার ককপিটে কোড যাচাই করার সাথে সাথে খাবার ট্রানজিটে নথিভুক্ত হবে।</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="grid place-items-center py-10">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <QrCode className="size-7" />
            </div>
            <p className="mt-4 font-black text-ink-900 text-sm">টোকেন এখনও ইস্যু হয়নি</p>
            <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted-600">
              ভলান্টিয়ার রাইডার নির্ধারিত হওয়ার পর এখানে স্বয়ংক্রিয়ভাবে কিউআর কোড এবং ওটিপি জেনারেট হবে।
            </p>
          </div>
        )}
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
      title="রেসকিউ লাইভ ট্র্যাকিং 🛵"
      description="উদ্বৃত্ত খাবার সংগ্রহ হতে আশ্রয়কেন্দ্রে পৌঁছানো পর্যন্ত ভলান্টিয়ারের রিয়েল-টাইম অবস্থান ও হ্যান্ডওভার।"
      backHref={ROUTES.donor.donation(donationId)}
      backLabel="অনুদানের বিবরণ"
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-4" />}
            onClick={refresh}
            className="text-muted-600 hover:text-emerald-700"
          >
            রিফ্রেশ
          </Button>
        </div>
      }
      profileName="ইউআইইউ ক্যাফেটেরিয়া"
      profileDescription="ভেরিফাইড ফুড ডোনার · ঢাকা"
      avatarInitials="UC"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !data && <TrackingLoading />}

      {state.status === "error" && !data && (
        <Alert
          tone="danger"
          title="ট্র্যাকিং তথ্য লোড করা যায়নি"
          description={state.error.message}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={refresh}
            >
              পুনরায় চেষ্টা করুন
            </Button>
          }
        />
      )}

      {data && donation && (
        <div className="grid gap-6">
          {state.status === "loading" && (
            <Alert
              tone="info"
              title="তথ্য সিঙ্ক হচ্ছে..."
              description="রাইডার লোকেশন ও ট্রানজিশন হিস্ট্রি আপডেট করা হচ্ছে।"
            />
          )}
          {data.incidents[0] && (
            <Alert
              tone="danger"
              title="রেসকিউ সাময়িকভাবে স্থগিত"
              description={`একটি উন্মুক্ত সমস্যা রিপোর্ট পর্যালোচনায় রয়েছে: ${data.incidents[0].description}`}
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
                      ক্লেইম স্ট্যাটাস: {STATUS_TEXT_BN[donation.status] || claim.status}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-black text-ink-900 sm:text-3xl">
                  {donation.title}
                </h1>
                <p className="mt-1.5 text-xs text-muted-600">
                  অনুদান ট্র্যাকিং রেফারেন্স:{" "}
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {donation.id}
                  </span>
                </p>
              </div>
              <RescueClock deadline={donation.safePickupDeadline} compact />
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <DonationStatusTimeline status={donation.status} compact />
            </div>
          </Card>

          {/* Main Grid: Interactive Radar Map (Left) + Handover/Driver controls (Right) */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="grid gap-6">
              {/* Live GPS Radar Map Card */}
              <Card className="overflow-hidden border-line shadow-sm">
                <div className="border-b border-line bg-gradient-to-r from-emerald-900 to-[#02241b] p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        লাইভ রেসকিউ রাডার · ঢাকা সিটি
                      </p>
                    </div>
                    <h2 className="mt-1 text-xl font-black text-white">
                      পিকআপ পয়েন্ট হতে আশ্রয়কেন্দ্রে সরাসরি রুট
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-sm border border-white/15">
                    <Radio className="size-3.5 text-emerald-400 animate-pulse" />
                    <span>জিপিএস সিগন্যাল সক্রিয়</span>
                  </div>
                </div>

                {/* Radar HUD Screen */}
                <div className="relative min-h-[30rem] overflow-hidden bg-gradient-to-b from-[#021f18] via-[#022b21] to-[#011712] p-5">
                  {/* Subtle Radar grid background */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, #10b981 1px, transparent 1px), linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
                      backgroundSize: `40px 40px`,
                    }}
                  />

                  {/* Concentric radar rings centered on rider */}
                  <div className="absolute left-[45%] top-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="size-48 rounded-full border border-emerald-500/20 animate-ping opacity-25" />
                    <div className="absolute inset-0 m-auto size-32 rounded-full border border-emerald-400/30" />
                    <div className="absolute inset-0 m-auto size-16 rounded-full border border-emerald-400/40" />
                  </div>

                  {/* Checkpoint 1: Pickup Donor Point */}
                  <div className="absolute left-[12%] top-[30%] z-10 flex flex-col items-center">
                    <div className="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/60 ring-4 ring-emerald-400/30">
                      <MapPin className="size-6" />
                    </div>
                    <span className="mt-2 rounded-md bg-brand-950/90 px-2 py-0.5 text-[11px] font-black text-emerald-300 border border-emerald-500/30 shadow-md">
                      পিকআপ পয়েন্ট (ইউআইইউ)
                    </span>
                  </div>

                  {/* Checkpoint 2: Moving Volunteer Rider */}
                  <div className="absolute left-[48%] top-[46%] z-10 flex flex-col items-center">
                    <div className="relative grid size-14 place-items-center rounded-2xl bg-amber-500 text-brand-950 shadow-2xl shadow-amber-500/50 ring-4 ring-amber-300/40 animate-bounce">
                      <Navigation className="size-7 rotate-45" />
                    </div>
                    <span className="mt-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-black text-brand-950 shadow-md">
                      🛵 হোসেন আহমেদ (অন-রুট)
                    </span>
                  </div>

                  {/* Checkpoint 3: Destination Shelter */}
                  <div className="absolute right-[12%] bottom-[28%] z-10 flex flex-col items-center">
                    <div className="grid size-12 place-items-center rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-900/60 ring-4 ring-teal-400/30">
                      <Building2 className="size-6" />
                    </div>
                    <span className="mt-2 rounded-md bg-brand-950/90 px-2 py-0.5 text-[11px] font-black text-teal-300 border border-teal-500/30 shadow-md">
                      মাস্তুল শেল্টার হোম
                    </span>
                  </div>

                  {/* Connecting Dotted Route */}
                  <svg
                    className="absolute inset-0 h-full w-full pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 150 180 Q 280 140 420 250 T 700 340"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="8 6"
                      className="opacity-60"
                    />
                  </svg>

                  {/* Telemetry Floating Bar at bottom */}
                  <div className="absolute inset-x-4 bottom-4 z-20 grid gap-3 rounded-2xl border border-white/15 bg-brand-950/85 p-4 shadow-2xl backdrop-blur-md sm:grid-cols-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                        <MapPin className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          পিকআপ এলাকা
                        </p>
                        <p className="font-black text-xs sm:text-sm truncate">
                          {exactAddress ? `${exactAddress.addressLine}, ${exactAddress.area}` : donation.pickup.approximateArea}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                        <Gauge className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          রাইডার গতি ও দূরত্ব
                        </p>
                        <p className="font-black text-xs sm:text-sm">
                          ৩৫ কিমি/ঘণ্টা · ১.২ কিমি বাকি
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-teal-500/20 text-teal-400">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                          গন্তব্য এনজিও
                        </p>
                        <p className="font-black text-xs sm:text-sm truncate">
                          {data.receiverNgo?.name ?? "এনজিও অনুমোদনের অপেক্ষায়"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Timing Schedule Bento */}
              <Card className="p-5 sm:p-6 border-line shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Clock3 className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      আনুমানিক সময়সূচি
                    </p>
                    <h2 className="text-lg font-black text-ink-900">রেসকিউ শিডিউল ও ইটিএ</h2>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-line bg-canvas/60 p-4">
                    <dt className="text-xs font-bold text-muted-600">পিকআপ সময়সীমা শুরু</dt>
                    <dd className="mt-1.5 text-sm font-black text-ink-900">
                      {formatDonationDateTimeBn(donation.pickup.windowStart)}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                    <dt className="text-xs font-bold text-amber-800">ভলান্টিয়ার পৌঁছানোর ইটিএ</dt>
                    <dd className="mt-1.5 text-sm font-black text-ink-900">
                      {claim?.estimatedPickupAt ? formatDonationDateTimeBn(claim.estimatedPickupAt) : "নির্ধারিত হচ্ছে"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4">
                    <dt className="text-xs font-bold text-teal-800">শেল্টারে বিতরণের সময়</dt>
                    <dd className="mt-1.5 text-sm font-black text-ink-900">
                      {claim?.estimatedDeliveryAt ? formatDonationDateTimeBn(claim.estimatedDeliveryAt) : "পিকআপের পর নির্ধারিত হবে"}
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
                              নিযুক্ত ভলান্টিয়ার রাইডার
                            </p>
                            <h2 className="mt-0.5 text-lg font-black text-ink-900">
                              {data.volunteer.name}
                            </h2>
                          </div>
                        </div>
                        <Badge tone="success">ভেরিফাইড রাইডার ✓</Badge>
                      </div>

                      <div className="mt-5 grid gap-2.5 text-xs text-muted-600">
                        <div className="flex items-center gap-2 rounded-xl bg-canvas/60 p-2.5 border border-line">
                          {transportInfo && <transportInfo.icon className="size-4 text-emerald-600" />}
                          <span className="font-bold text-ink-800">বাহন: {transportInfo?.label}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-canvas/60 p-2.5 border border-line">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span className="font-bold text-ink-800">
                            {data.volunteer.completedRescues}টি সফল রেসকিউ সম্পন্ন করেছেন
                          </span>
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
                            সরাসরি কল
                          </a>
                          <a
                            href={`sms:${data.volunteer.phone}`}
                            className={buttonClassNames({
                              variant: "outline",
                              size: "sm",
                              className: "flex-1 justify-center font-bold border-line hover:bg-emerald-50/50",
                            })}
                          >
                            <MessageCircle className="size-4 mr-1.5" />
                            মেসেজ পাঠান
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid place-items-center py-10 text-center">
                      <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Truck className="size-6" />
                      </div>
                      <h2 className="mt-4 text-base font-black text-ink-900">
                        ভলান্টিয়ার বরাদ্দের অপেক্ষায়
                      </h2>
                      <p className="mt-1 text-xs text-muted-600">
                        এনজিও ক্লেইম অনুমোদনের পর নিকটবর্তী ভলান্টিয়ার অ্যাসাইন হবে।
                      </p>
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
                            বিতরণকারী এনজিও
                          </p>
                          <h2 className="mt-0.5 text-lg font-black text-ink-900">
                            {data.receiverNgo.name}
                          </h2>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-2.5 text-xs text-muted-600">
                        <p className="rounded-xl bg-canvas/60 p-2.5 border border-line">
                          🏆 {data.receiverNgo.completedRescues}টি সফল উদ্ধার · {data.receiverNgo.rating ?? "৫.০"} স্টার রেটিং
                        </p>
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
                      <h2 className="mt-4 text-base font-black text-ink-900">কোনো গ্রহীতা এখনও যুক্ত হয়নি</h2>
                      <p className="mt-1 text-xs text-muted-600">
                        অনুমোদিত এনজিও ক্লেইম করার সাথে সাথে তথ্য এখানে যুক্ত হবে।
                      </p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Safety banner */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/70 p-4 text-xs text-amber-950">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="leading-relaxed">
                  <strong>খাদ্য সুরক্ষা ও ট্র্যাকিং সতর্কতা:</strong> পিকআপ হওয়ার পূর্ব মুহূর্ত পর্যন্ত খাবার নির্ধারিত তাপমাত্রায় ও সিল করা পাত্রে ঢেকে রাখুন।
                </p>
              </div>
            </div>

            {/* Right Sticky Sidebar: QR Handover & Privacy */}
            <aside className="grid gap-5 xl:sticky xl:top-24" aria-label="হ্যান্ডওভার ও ট্র্যাকিং কন্ট্রোল">
              <MockQrHandover
                token={claim?.pickupVerificationToken}
                code={(claim as unknown as { pickupOtp?: string })?.pickupOtp}
              />

              <Card className="p-5 border-line shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="font-black text-ink-900 text-sm">গোপনীয়তা ও নিরাপত্তা স্ট্যাটাস</p>
                    <p className="text-[11px] text-muted-600">এনক্রিপ্টেড ট্র্যাকিং তথ্য</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-600">
                  আপনার সুনির্দিষ্ট ঠিকানা এবং ফোন নম্বর কেবল খাবার সংগ্রহের দায়িত্বে থাকা ভলান্টিয়ারের কাছেই দৃশ্যমান। অন্য কারো কাছে এটি প্রকাশ করা হয় না।
                </p>
              </Card>

              <ButtonLink
                href={ROUTES.donor.donation(donation.id)}
                variant="outline"
                leftIcon={<CalendarClock className="size-4" />}
                className="w-full justify-center font-bold border-line hover:bg-emerald-50/50"
              >
                অনুদানের মূল বিবরণী দেখুন
              </ButtonLink>
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
