"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Bike,
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PackageOpen,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserRoundCheck,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClassNames } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClaimActionPanel } from "@/features/claims/claim-action-panel";
import {
  claimEtaLabel,
  claimEtaLabelBn,
  claimProgressMessage,
  claimProgressMessageBn,
  formatAddress,
  formatClaimDateTime,
  formatClaimDateTimeBn,
} from "@/features/claims/claim-presentation";
import { ClaimRoutePreview } from "@/features/claims/claim-route-preview";
import { ClaimStatusTimeline } from "@/features/claims/claim-status-timeline";
import { ClaimVerificationPanel } from "@/features/claims/claim-verification-panel";
import { useNgoClaim } from "@/features/claims/use-ngo-claims";
import {
  donationImageUrl,
  formatDonationDateTime,
  formatDonationDateTimeBn,
  formatDonationQuantity,
  formatDonationQuantityBn,
  getDonationTitleBn,
  getDonorOrganizationBn,
  STORAGE_LABELS_BN,
} from "@/features/donations/donation-presentation";
import { STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { ClaimStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";

export function NGOClaimDetail({ claimId }: { claimId: string }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const claimState = useNgoClaim(claimId);
  const { state, busy, actionError, actionMessage } = claimState;
  const details = state.data;

  const titleBn = details ? getDonationTitleBn(details.donation.title) : "";
  const donorBn = details ? getDonorOrganizationBn(details.donorOrganization) : "";

  const displayTitle = details ? (isBn ? titleBn || details.donation.title : details.donation.title) : "";
  const displayDonor = details ? (isBn ? donorBn || details.donorOrganization : details.donorOrganization) : "";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.claims}
      title={isBn ? "ক্লেইম বিবরণ ও ট্র্যাকিং" : "Claim details"}
      description={
        isBn
          ? "পিকআপ সমন্বয়, ডিজিটাল ওটিপি, ভলান্টিয়ার ট্র্যাকিং এবং ডেলিভারি পর্যবেক্ষণ করুন।"
          : "Coordinate pickup, verification, volunteer tracking, and delivery for this rescue."
      }
      profileName={isBn ? "মাস্তুল ফাউন্ডেশন" : "Hope Foundation"}
      profileDescription={isBn ? "অনুমোদিত ও ভেরিফায়েড এনজিও" : "Verified NGO"}
      avatarInitials="HF"
      notificationHref={ROUTES.ngo.notifications}
      backHref={ROUTES.ngo.claims}
      backLabel={isBn ? "ক্লেইম তালিকায় ফিরে যান" : "Back to claims"}
    >
      {state.status === "loading" && !details && (
        <SkeletonGroup label="Loading claim details" className="grid gap-5">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
          <div className="grid gap-5 xl:grid-cols-2">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        </SkeletonGroup>
      )}

      {state.status === "error" && !details && (
        <EmptyState
          icon={RefreshCw}
          title={isBn ? "ক্লেইম লোড করা সম্ভব হয়নি" : "Claim could not load"}
          description={state.error.message}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={claimState.retry}>{isBn ? "পুনরায় চেষ্টা করুন" : "Try again"}</Button>
              <ButtonLink href={ROUTES.ngo.claims} variant="outline">
                {isBn ? "ক্লেইম তালিকায় ফিরুন" : "Back to claims"}
              </ButtonLink>
            </div>
          }
        />
      )}

      {details && (
        <div className="grid gap-6">
          {/* Main Top Overview Card */}
          <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <div className="grid lg:grid-cols-[minmax(19rem,0.85fr)_minmax(0,1.15fr)]">
              <div className="relative min-h-72 bg-emerald-50 lg:min-h-full">
                <Image
                  src={donationImageUrl(details.donation)}
                  alt={displayTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4">
                  <StatusBadge status={details.claim.status} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-black text-white shadow-md backdrop-blur-xs">
                    {isBn ? `${details.claim.matchScore}% ম্যাচ` : `${details.claim.matchScore}% match`}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
                    #{details.claim.id.replace("claim-", "")}
                  </span>
                  {details.donorVerified && (
                    <Badge tone="success">
                      <CheckCircle2 className="size-3.5" />
                      {isBn ? "ভেরিফায়েড খাদ্যদাতা" : "Verified donor"}
                    </Badge>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {displayTitle}
                </h2>
                {isBn && titleBn !== details.donation.title && (
                  <p className="mt-1 text-sm text-slate-500">{details.donation.title}</p>
                )}
                <p className="mt-2 font-bold text-emerald-800">{displayDonor}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <PackageOpen className="size-5 text-emerald-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">{isBn ? "পরিমাণ" : "Quantity"}</p>
                    <p className="mt-1 font-black text-slate-900">
                      {isBn ? formatDonationQuantityBn(details.donation) : formatDonationQuantity(details.donation)} · ~{details.donation.quantity.estimatedMeals} {isBn ? "জনের খাবার" : "meals"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <Clock3 className="size-5 text-emerald-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">{isBn ? "রান্নার সময়" : "Prepared"}</p>
                    <p className="mt-1 font-black text-slate-900">
                      {isBn ? formatDonationDateTimeBn(details.donation.preparationTime) : formatDonationDateTime(details.donation.preparationTime)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <MapPin className="size-5 text-emerald-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">{isBn ? "পিকআপ এলাকা" : "Pickup"}</p>
                    <p className="mt-1 font-black text-slate-900 truncate">
                      {details.donation.pickup.sensitiveDetailsVisible
                        ? formatAddress(details.donation.pickup.exactAddress)
                        : details.donation.pickup.approximateArea}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <Truck className="size-5 text-emerald-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">{isBn ? "সংরক্ষণ ও পরিবহন" : "Storage & timing"}</p>
                    <p className="mt-1 font-black text-slate-900">
                      {isBn
                        ? STORAGE_LABELS_BN[details.donation.storageCondition] || details.donation.storageCondition
                        : STORAGE_CONDITION_LABELS[details.donation.storageCondition]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Rescue Progress Status Timeline */}
          <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <CardHeader
              title={isBn ? "রেসকিউ অগ্রগতি ও পর্যায়ক্রম" : "Rescue progress"}
              description={
                isBn
                  ? "সংরক্ষিত → ভলান্টিয়ার নির্ধারিত → সংগ্রহ সম্পন্ন → শেল্টারে পৌঁছেছে → বিতরণ সম্পন্ন"
                  : "Reserved → Assigned → Picked up → Delivered → Distributed"
              }
            />
            <CardContent>
              <ClaimStatusTimeline claim={details.claim} />
            </CardContent>
          </Card>

          {actionError && (
            <Alert tone="danger" title={isBn ? "অ্যাকশন সম্পন্ন করা যায়নি" : "Action could not be completed"} description={actionError} />
          )}
          {actionMessage && (
            <Alert tone="success" title={isBn ? "ক্লেইম সফলভাবে আপডেট হয়েছে" : "Claim updated"} description={actionMessage} />
          )}

          {/* Digital Verification & OTP Panel */}
          <ClaimVerificationPanel claim={details.claim} />

          {/* Two Columns: Pickup Coordination & Assigned Volunteer */}
          <div className="grid gap-5 xl:grid-cols-2">
            {/* Left: Pickup Coordination */}
            <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xs">
              <CardHeader
                title={isBn ? "পিকআপ সমন্বয় ও খাদ্যদাতার ঠিকানা" : "Pickup coordination"}
                description={
                  isBn
                    ? "ক্লেইম নিশ্চিত হওয়ায় খাদ্যদাতার অভ্যন্তরীণ যোগাযোগের বিবরণী উন্মুক্ত রয়েছে।"
                    : "Sensitive donor fields are visible only because this claim belongs to the signed-in NGO."
                }
                action={<ShieldCheck className="size-5 text-emerald-600" />}
              />
              <CardContent className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Building2 className="size-4" />
                    <p className="font-black">{displayDonor}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {formatAddress(details.donation.pickup.exactAddress)}
                  </p>
                  {details.donation.pickup.directions && (
                    <p className="mt-2 rounded-xl bg-white p-3 text-xs leading-5 text-slate-600 border border-slate-200/80">
                      <span className="font-bold text-slate-900">{isBn ? "বিশেষ নির্দেশনা: " : "Directions: "}</span>
                      {details.donation.pickup.directions}
                    </p>
                  )}
                </div>

                {details.donation.pickup.contact ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      className={buttonClassNames({ variant: "outline", size: "sm" })}
                      href={`tel:${details.donation.pickup.contact.phone}`}
                    >
                      <Phone className="size-4 text-emerald-600" />
                      {isBn ? "খাদ্যদাতাকে ফোন করুন" : "Call donor"}
                    </a>
                    {details.donation.pickup.contact.email ? (
                      <a
                        className={buttonClassNames({ variant: "outline", size: "sm" })}
                        href={`mailto:${details.donation.pickup.contact.email}`}
                      >
                        <Mail className="size-4 text-emerald-600" />
                        {isBn ? "ইমেইল পাঠান" : "Email donor"}
                      </a>
                    ) : (
                      <a
                        className={buttonClassNames({ variant: "outline", size: "sm" })}
                        href={`sms:${details.donation.pickup.contact.phone}`}
                      >
                        <MessageCircle className="size-4 text-emerald-600" />
                        {isBn ? "মেসেজ দিন" : "Message donor"}
                      </a>
                    )}
                  </div>
                ) : (
                  <Alert
                    tone="warning"
                    title={isBn ? "যোগাযোগের তথ্য অপ্রতুল" : "Contact details unavailable"}
                    description={isBn ? "ব্যক্তিগত যোগাযোগের তথ্য অনুমোদিত এনজিও ভিউয়ারদের ছাড়া প্রকাশ করা হয় না।" : "Private contact information is withheld."}
                  />
                )}
              </CardContent>
            </Card>

            {/* Right: Assigned Volunteer */}
            <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-xs">
              <CardHeader
                title={isBn ? "নির্ধারিত ভলান্টিয়ার রাইডার" : "Assigned volunteer"}
                description={
                  details.volunteer
                    ? isBn
                      ? "ভেরিফায়েড রেসকিউ পার্টনার এবং আনুমানিক পৌঁছানোর সময়।"
                      : "Verified rescue partner and current ETA."
                    : isBn
                      ? "এখনও কোনো ভলান্টিয়ার নির্ধারিত হয়নি।"
                      : "A volunteer has not been assigned yet."
                }
                action={
                  details.volunteer ? (
                    <Badge tone="success">
                      <UserRoundCheck className="size-3.5" />
                      {isBn ? "ভেরিফায়েড" : "Verified"}
                    </Badge>
                  ) : (
                    <Badge tone="warning">{isBn ? "অপেক্ষমাণ" : "Waiting"}</Badge>
                  )
                }
              />
              <CardContent>
                {details.volunteer ? (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
                      <span className="grid size-14 place-items-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-xs">
                        {details.volunteer.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </span>
                      <div>
                        <p className="text-lg font-black text-slate-900">{details.volunteer.displayName}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          <span className="capitalize font-bold text-blue-900">
                            {details.volunteer.transportMethod.toLowerCase().replaceAll("_", " ")}
                          </span>{" "}
                          · {details.volunteer.completedRescues} {isBn ? "টি সফল রেসকিউ সম্পন্ন" : "completed rescues"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {isBn ? "বর্তমান পৌঁছানোর সময়" : "Current ETA"}
                        </p>
                        <p className="mt-2 text-2xl font-black text-blue-700">
                          {isBn ? claimEtaLabelBn(details.claim) : claimEtaLabel(details.claim)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {details.claim.status === ClaimStatus.PICKED_UP
                            ? isBn
                              ? "শেল্টারে পৌঁছানোর সম্ভাব্য সময়: "
                              : "Estimated delivery: "
                            : isBn
                              ? "পিকআপে পৌঁছানোর সম্ভাব্য সময়: "
                              : "Estimated pickup: "}
                          {isBn
                            ? formatClaimDateTimeBn(
                                details.claim.status === ClaimStatus.PICKED_UP
                                  ? details.claim.estimatedDeliveryAt
                                  : details.claim.estimatedPickupAt,
                              )
                            : formatClaimDateTime(
                                details.claim.status === ClaimStatus.PICKED_UP
                                  ? details.claim.estimatedDeliveryAt
                                  : details.claim.estimatedPickupAt,
                              )}
                        </p>
                      </div>

                      <div className="grid content-center gap-2">
                        {details.volunteer.phone && (
                          <>
                            <a
                              className={buttonClassNames({ variant: "primary", size: "sm" })}
                              href={`tel:${details.volunteer.phone}`}
                            >
                              <Phone className="size-4" />
                              {isBn ? "ভলান্টিয়ারকে কল করুন" : "Call volunteer"}
                            </a>
                            <a
                              className={buttonClassNames({ variant: "outline", size: "sm" })}
                              href={`sms:${details.volunteer.phone}`}
                            >
                              <MessageCircle className="size-4" />
                              {isBn ? "মেসেজ পাঠান" : "Message"}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                    <UserRoundCheck className="size-10 text-slate-400" />
                    <p className="mt-3 font-black text-slate-900">
                      {isBn ? "ভলান্টিয়ার বরাদ্দের অপেক্ষায়" : "Waiting for assignment"}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      {isBn
                        ? "নিচের অ্যাকশন প্যানেল থেকে ভেরিফায়েড ডেমো ভলান্টিয়ার বরাদ্দ করুন এবং পিকআপ ও ডেলিভারির ওটিপি সক্রিয় করুন।"
                        : "Use the action below to assign a verified volunteer and issue tokens."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Route Preview */}
          <ClaimRoutePreview details={details} />

          {/* Action Panel */}
          <ClaimActionPanel
            claim={details.claim}
            busy={busy}
            onAssignVolunteer={claimState.assignVolunteer}
            onRelease={claimState.releaseClaim}
            onMarkPickedUp={claimState.markPickedUp}
          />

          <p className="text-center text-xs text-slate-400">
            {isBn ? "সর্বশেষ আপডেট: " : "Latest claim update: "}
            {isBn ? formatClaimDateTimeBn(details.claim.updatedAt) : formatClaimDateTime(details.claim.updatedAt)} ·{" "}
            {isBn ? claimProgressMessageBn(details.claim) : claimProgressMessage(details.claim)}
          </p>
        </div>
      )}
    </PortalShell>
  );
}
