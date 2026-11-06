"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Refrigerator,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
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
import {
  CATEGORY_LABELS_BN,
  DIETARY_LABELS_BN,
  STORAGE_LABELS_BN,
  UNIT_LABELS_BN,
  donationImageUrl,
  formatDonationDateTimeBn,
} from "@/features/donations/donation-presentation";
import { useSavedDonations } from "@/features/ngo-discovery/use-saved-donations";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { DIETARY_TYPE_LABELS, FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { asyncState, claimService, discoveryService, toServiceError, type AsyncState, type NGODiscoveryItem } from "@/services";

const TITLE_TRANSLATIONS: Record<string, string> = {
  "Rice, chicken curry, and vegetables": "ভাত, মুরগির মাংসের তরকারি ও তাজা সবজি",
  "Packaged bread and snack boxes": "প্যাকেটজাত রুটি ও নিরামিষ স্ন্যাক্স বক্স",
  "Seasonal fruit and vegetables": "তাজা মৌসুমি ফলমূল ও কাঁচা শাকসবজি",
  "Warm vegetable biryani with egg": "গরম ভেজিটেবল বিরিয়ানি ও সিদ্ধ ডিম",
  "Fresh bakery buns and rolls": "তাজা বেকারি বান ও সুস্বাদু রোলস",
  "Sealed pantry rescue packs": "সিল্ড খাদ্যশস্য, চাল, মসুর ডাল ও তেল প্যাক",
  "Fresh fruit and vegetable crates": "তাজা ফলমূল ও মৌসুমী শাকসবজির ক্র্যাট",
  "Chilled yoghurt cups": "হিমায়িত মিষ্টি ও টক দইয়ের কাপ",
  "Fresh buffet meal boxes": "বুফে লাঞ্চ মিল বক্স (চিকেন, রাইস ও ডাল)",
  "Mutton kacchi biryani and chicken roast portions": "খাসির ঐতিহ্যবাহী কাচ্চি বিরিয়ানি ও চিকেন রোস্ট",
  "Bhuna khichuri, boiled eggs, and vegetable curry": "গরম ভুনা খিচুড়ি, ডিম ভুনা ও মিক্সড সবজি",
  "Fresh chicken patties, vegetable rolls, and sweet buns": "তাজা চিকেন প্যাটিস, ভেজিটেবল রোল ও মিষ্টি বান",
  "Farm fresh carrots, potatoes, tomatoes, and ripe bananas": "তাজা গাজর, আলু, টমেটো ও পাকা কলার ক্র্যাট",
  "Steamed aromatic rice, lentils, and fresh fish curry": "সুগন্ধি ভাত, ঘন মসুর ডাল ও তাজা রুই মাছের ঝোল",
};

const DESCRIPTION_TRANSLATIONS: Record<string, string> = {
  "Freshly prepared lunch portions remaining after the campus service window.":
    "ক্যাম্পাস সার্ভিসের পর স্বাস্থ্যসম্মত হট-বক্সে সংরক্ষিত তাজা দুপুরের খাবার। শতভাগ পুষ্টিকর ও হালাল।",
  "Individually packed buns, sliced bread, and vegetarian snack boxes from a campus event.":
    "ক্যাম্পাস ইভেন্ট শেষে উদ্বৃত্ত অক্ষত প্যাকেটজাত রুটি ও নিরামিষ স্ন্যাক্স। দ্রুত পিকআপের জন্য প্রস্তুত।",
  "Uncut produce sorted into reusable crates for community distribution.":
    "রি-ইউজেবল ক্র্যাটে সংরক্ষিত তাজা শাকসবজি ও ফল, যা সুবিধাবঞ্চিতদের মাঝে বিতরণের জন্য আদর্শ।",
  "Sealed rice, lentils, cooking oil, and spice packs prepared for community meal programs.":
    "কমিউনিটি মিলের জন্য প্রস্তুতকৃত অক্ষত চাল, ডাল, ভোজ্যতেল ও মশলার সিল্ড খাদ্যপ্যাক।",
  "Sorted uncut seasonal produce in reusable crates for same-day community distribution.":
    "একই দিনে বিতরণের জন্য পুনঃব্যবহারযোগ্য ক্র্যাটে সংরক্ষিত তাজা মৌসুমি ফলমূল ও শাকসবজি।",
  "Factory-sealed yoghurt cups held under refrigeration and ready for quick collection.":
    "রেফ্রিজারেশনে সংরক্ষিত ফ্যাক্টরি-সিল্ড তাজা দইয়ের কাপ, কোল্ড ক্যারিয়ারে দ্রুত সংগ্রহের জন্য প্রস্তুত।",
  "Covered rice, grilled chicken, lentils, and mixed vegetables packed after a corporate lunch service.":
    "করপোরেট লাঞ্চ সার্ভিসের পর হট-হোল্ডিং কন্টেইনারে সিল্ড সুস্বাদু গ্রিল্ড চিকেন, পোলাও ও সবজি।",
  "Freshly prepared wedding reception surplus. Kept in food-grade insulated hot boxes at >65°C. Complete meals with boiled eggs.":
    "বিবাহোত্তর সংবর্ধনা অনুষ্ঠানের পর ৬৫°C এর অধিক তাপে ইনসুলেটেড হট-বক্সে সংরক্ষিত প্রিমিয়াম কাচ্চি বিরিয়ানি ও রোস্ট।",
  "Surplus lunch from university seminar hall. Sealed in high-grade catering trays, warm and fresh.":
    "সেমিনার হল থেকে উদ্বৃত্ত গরম ও তাজা ভুনা খিচুড়ি ও ডিমের ক্যাটারিং ট্রে। সম্পূর্ণ স্বাস্থ্যসম্মত ও সিল্ড।",
  "Evening batch bakery products packaged in individual food-grade wrapping from today's afternoon baking.":
    "আজ বিকেলের বেকিং সেশন থেকে প্রস্তুত তাজা চিকেন প্যাটিস ও রোল। ফুড-গ্রেড র্যাপিংয়ে সিল করা।",
  "Wholesale farm surplus produce crates suitable for direct distribution to orphanage meal programs.":
    "এতিমখানা ও আশ্রয়কেন্দ্রের রান্নাঘরের জন্য সরাসরি খামার থেকে সংগৃহীত তাজা শাকসবজি ও ফলমূল।",
  "Hygienically covered dinner meal portions remaining after cafeteria service window.":
    "ক্যাফেটেরিয়া ডিনার সার্ভিসের পর স্বাস্থ্যসম্মত উপায়ে সংরক্ষিত গরম ভাত, ডাল ও তাজা মাছের তরকারি।",
};

const SAFETY_CHECKS = [
  { key: "freshlyPrepared", label: "তাজা প্রস্তুতকৃত ও অনুমোদিত" },
  { key: "properlyCovered", label: "ফুড-গ্রেড ঢাকনা দিয়ে সঠিকভাবে সিল্ড" },
  { key: "noVisibleSpoilage", label: "কোনো প্রকার নষ্ট বা গন্ধহীনতা নিশ্চিত" },
  { key: "storedAccordingToDeclaration", label: "ঘোষিত তাপমাত্রায় সংরক্ষিত" },
  { key: "allergensDisclosed", label: "অ্যালার্জেন ও উপাদান ডিক্লেয়ার করা" },
  { key: "pickupDeadlineConfirmed", label: "নিরাপদ পিকআপ সময়সীমা নিশ্চিত" },
  { key: "donorAccuracyConfirmed", label: "দাতা প্রতিষ্ঠানের সত্যতা যাচাইকৃত" },
] as const;

function packagingLabel(condition: NGODiscoveryItem["donation"]["foodCondition"]) {
  if (condition === "PACKAGED") return "ফ্যাক্টরি বা দাতা কর্তৃক সিল্ড প্যাকেটজাত";
  if (condition === "SAME_DAY") return "একই দিনে প্রস্তুতকৃত ও সিল্ড কভার্ড খাবার";
  return "তাজা রান্না করা ও ইনসুলেটেড পাত্রে রাখা";
}

export function NGODonationDetail({ donationId }: { donationId: string }) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [state, setState] = useState<AsyncState<NGODiscoveryItem>>(() => asyncState.loading());
  const [retryKey, setRetryKey] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimId, setClaimId] = useState<string>();
  const [claimError, setClaimError] = useState<string>();
  const { savedIds, toggleSaved } = useSavedDonations();

  useEffect(() => {
    const controller = new AbortController();
    discoveryService
      .getById(donationId, NGO_PROFILE_ID, NGO_VIEWER, { signal: controller.signal })
      .then((item) => setState(asyncState.success(item)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [donationId, retryKey]);

  async function claimDonation() {
    const item = state.data;
    if (!item || !item.eligibility.eligible) return;
    setClaiming(true);
    setClaimError(undefined);
    try {
      const claim = await claimService.create(
        { donationId, ngoProfileId: NGO_PROFILE_ID, matchScore: item.matchScore },
        NGO_VIEWER
      );
      setClaimId(claim.id);
    } catch (error: unknown) {
      setClaimError(toServiceError(error).message);
    } finally {
      setClaiming(false);
    }
  }

  const item = state.data;
  const donation = item?.donation;
  const saved = savedIds.includes(donationId);
  const canClaim = item?.eligibility.eligible && donation?.status === DonationStatus.AVAILABLE && !claimId;

  const title = donation
    ? isBn
      ? TITLE_TRANSLATIONS[donation.title] || donation.title
      : donation.title
    : "খাদ্য অনুদানের বিবরণ";

  const description = donation
    ? isBn
      ? DESCRIPTION_TRANSLATIONS[donation.description] || donation.description
      : donation.description
    : "নিরাপত্তা ঘোষণা, খাদ্য সুরক্ষা ও পিকআপ বিবরণ পর্যালোচনা করুন।";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.discover}
      title={title}
      description={
        isBn
          ? "খাদ্য সুরক্ষা ডিক্লারেশন, এনজিও ম্যাচ স্কোর ও পিকআপ বিবরণ পর্যালোচনা করে রেসকিউ ক্লেইম করুন।"
          : "Review safety declarations, operational fit, and privacy-protected pickup information before claiming."
      }
      profileName="Hope Foundation"
      profileDescription={isBn ? "ভেরিফায়েড এনজিও পার্টনার" : "Verified NGO"}
      avatarInitials="HF"
      notificationHref={ROUTES.ngo.notifications}
      backHref={ROUTES.ngo.discover}
      backLabel={isBn ? "অনুসন্ধান তালিকায় ফিরুন" : "Back to discovery"}
    >
      {state.status === "loading" && !item && (
        <SkeletonGroup label="Loading donation details" className="grid gap-5">
          <Skeleton className="h-96 rounded-3xl" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </SkeletonGroup>
      )}

      {state.status === "error" && !item && (
        <EmptyState
          icon={RefreshCw}
          title={isBn ? "খাবারের বিবরণ লোড করা যায়নি" : "Donation could not load"}
          description={state.error.message}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setRetryKey((value) => value + 1)}>
                {isBn ? "পুনরায় চেষ্টা করুন" : "Try again"}
              </Button>
              <ButtonLink href={ROUTES.ngo.discover} variant="outline">
                {isBn ? "সকল খাবার ব্রাউজ করুন" : "Browse available food"}
              </ButtonLink>
            </div>
          }
        />
      )}

      {item && donation && (
        <div className="grid gap-6">
          {/* Main Hero Card */}
          <Card className="overflow-hidden border-slate-200/90 shadow-sm">
            <div className="grid lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.1fr)]">
              <div className="relative min-h-80 bg-slate-900 lg:min-h-full">
                <Image
                  src={donationImageUrl(donation)}
                  alt={donation.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-4">
                  <StatusBadge status={donation.status} />
                  <Badge tone="success">{item.matchScore}% ম্যাচ স্কোর</Badge>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-5 pt-20 text-white">
                  <p className="text-lg font-black">{item.donorOrganization}</p>
                  <p className="mt-0.5 text-xs text-white/80">
                    {isBn ? "বিএফএসএ ভেরিফায়েড খাদ্য পার্টনার" : "Verified food donor"}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                    {isBn ? CATEGORY_LABELS_BN[donation.category] || FOOD_CATEGORY_LABELS[donation.category] : FOOD_CATEGORY_LABELS[donation.category]}
                  </span>
                  <Badge tone={item.eligibility.eligible ? "success" : "warning"}>
                    {item.eligibility.eligible
                      ? isBn ? "ক্লেইম করার জন্য উপযুক্ত" : "Eligible to claim"
                      : isBn ? "যোগ্যতা পর্যালোচনা আবশ্যক" : "Review eligibility"}
                  </Badge>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

                <div className="mt-6">
                  <RescueClock deadline={donation.safePickupDeadline} />
                </div>

                <div className="mt-6 grid gap-3 xs:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <MapPin className="size-5 text-emerald-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? "পিকআপ এলাকা ও দূরত্ব" : "Approximate pickup"}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {donation.pickup.approximateArea} · {donation.pickup.distanceKm?.toFixed(1)} কিমি
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <PackageOpen className="size-5 text-teal-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? "উদ্ধারযোগ্য পরিমাণ" : "Quantity"}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {donation.quantity.value} {isBn ? UNIT_LABELS_BN[donation.quantity.unit] || donation.quantity.unit : donation.quantity.unit} · ~{donation.quantity.estimatedMeals} জনের আহার
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <Clock3 className="size-5 text-amber-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? "রান্নার সময়" : "Prepared"}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {formatDonationDateTimeBn(donation.preparationTime)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <Refrigerator className="size-5 text-blue-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? "সংরক্ষণ তাপমাত্রা" : "Storage"}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {isBn ? STORAGE_LABELS_BN[donation.storageCondition] || donation.storageCondition : STORAGE_CONDITION_LABELS[donation.storageCondition]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Alert
            tone="info"
            title={isBn ? "দাতা ও পিকআপের গোপনীয়তা সুরক্ষিত" : "Pickup privacy is protected"}
            description={
              isBn
                ? "ক্লেইম নিশ্চিত হওয়ার পূর্ব পর্যন্ত নিরাপত্তা স্বার্থে শুধুমাত্র আনুমানিক দূরত্ব ও এলাকা দেখানো হয়। অনুমোদনের পর সম্পূর্ণ ঠিকানা ও ফোকাল পারসনের নম্বর দৃশ্যমান হবে।"
                : "Only an approximate area and distance are shown before claim acceptance. Exact address, coordinates, directions, and donor contact are not displayed on this discovery page."
            }
          />

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Dietary & Packaging Card */}
            <Card className="border-slate-200/90 shadow-xs">
              <CardHeader
                title={isBn ? "ডায়েট ও প্যাকেজিং বিবরণ" : "Dietary & packaging information"}
                description={isBn ? "আপনার উপকারভোগী ও পরিবহন সক্ষমতার সাথে মিলিয়ে নিন।" : "Review fit with your recipients and transport plan."}
              />
              <CardContent className="grid gap-5">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isBn ? "ডায়েট উপযুক্ততা" : "Dietary labels"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {donation.dietaryTypes.map((value) => (
                      <span
                        key={value}
                        className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-600/20"
                      >
                        {isBn ? DIETARY_LABELS_BN[value] || DIETARY_TYPE_LABELS[value] : DIETARY_TYPE_LABELS[value]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <PackageCheck className="size-5 text-emerald-700" />
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {packagingLabel(donation.foodCondition)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {isBn ? "দাতা কর্তৃক ঘোষিত প্যাকেজিং মানদণ্ড।" : "Condition declared by the donor."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Refrigerator className="size-5 text-blue-700" />
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {isBn ? STORAGE_LABELS_BN[donation.storageCondition] : STORAGE_CONDITION_LABELS[donation.storageCondition]}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {isBn ? "পরিবহনের সময় তাপমাত্রা বজায় রাখুন।" : "Maintain during collection and transport."}
                    </p>
                  </div>
                </div>

                {donation.allergens.length > 0 ? (
                  <Alert
                    tone="warning"
                    title={`অ্যালার্জেন ডিক্লারেশন: ${donation.allergens.join(", ")}`}
                    description="বিতরণের সময় অ্যালার্জেন লেবেল দৃশ্যমান রাখুন।"
                  />
                ) : (
                  <Alert
                    tone="success"
                    title="কোনো অ্যালার্জেন নেই"
                    description="দাতা কোনো অ্যালার্জেন উপাদান ঘোষণা করেননি।"
                  />
                )}

                {donation.specialInstructions && (
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {isBn ? "বিশেষ পিকআপ নির্দেশনা" : "Handling instructions"}
                    </p>
                    <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                      {donation.specialInstructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donor Safety Declaration Card */}
            <Card className="border-slate-200/90 shadow-xs">
              <CardHeader
                title={isBn ? "দাতা প্রতিষ্ঠানের খাদ্য নিরাপত্তা ঘোষণা" : "Donor safety declaration"}
                description={`ঘোষণার সময়: ${formatDonationDateTimeBn(donation.safetyDeclaration.declaredAt)}। বিএফএসএ গাইডলাইন অনুযায়ী যাচাইকৃত।`}
              />
              <CardContent className="grid gap-2">
                {SAFETY_CHECKS.map((check) => {
                  const passed = donation.safetyDeclaration[check.key];
                  return (
                    <div
                      key={check.key}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
                    >
                      <span
                        className={`grid size-8 place-items-center rounded-xl ${
                          passed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {passed ? (
                          <CheckCircle2 className="size-4.5" />
                        ) : (
                          <XCircle className="size-4.5" />
                        )}
                      </span>
                      <p className="text-xs font-bold text-slate-800">{check.label}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Eligibility Summary */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader
              title={isBn ? "এনজিও যোগ্যতা পর্যালোচনা" : "Eligibility summary"}
              description={
                isBn
                  ? "আপনার এনজিওর প্রোফাইল, ভৌগোলিক অবস্থান ও অনুমোদিত খাদ্য বিভাগের সাথে যাচাইকৃত।"
                  : "Every check is evaluated from the verified NGO profile and the current listing."
              }
            />
            <CardContent className="grid gap-3 md:grid-cols-2">
              {item.eligibility.checks.map((check) => (
                <div
                  key={check.label}
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${
                    check.passed
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-amber-200 bg-amber-50/60"
                  }`}
                >
                  <span className="mt-0.5">
                    {check.passed ? (
                      <UserRoundCheck className="size-5 text-emerald-700" />
                    ) : (
                      <AlertTriangle className="size-5 text-amber-700" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{check.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">
                      {check.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {claimError && (
            <Alert
              tone="danger"
              title="ক্লেইম সম্পন্ন করা যায়নি"
              description={claimError}
            />
          )}

          {claimId && (
            <Alert
              tone="success"
              title="খাদ্য লট সফলভাবে ক্লেইম করা হয়েছে!"
              description="উদ্ধার কাজটি আপনার এনজিও প্যানেলে বরাদ্দ করা হয়েছে। ভলান্টিয়ার অ্যাসাইন করতে ক্লেইম পাতায় যান।"
              action={
                <ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline" size="sm">
                  ক্লেইম পেজ খুলুন
                </ButtonLink>
              }
            />
          )}

          <StickyActionBar>
            <Button
              variant="outline"
              leftIcon={<Bookmark className={`size-4 ${saved ? "fill-amber-500 text-amber-600" : ""}`} />}
              onClick={() => toggleSaved(donationId)}
            >
              {saved ? (isBn ? "সংরক্ষণ করা হয়েছে" : "Saved for later") : (isBn ? "সংরক্ষণ করুন" : "Save for later")}
            </Button>
            <Button
              disabled={!canClaim || claiming}
              leftIcon={<ShieldCheck className="size-4" />}
              onClick={claimDonation}
            >
              {claiming
                ? isBn ? "ক্লেইম করা হচ্ছে…" : "Claiming…"
                : claimId
                ? isBn ? "ক্লেইম সম্পন্ন" : "Claimed"
                : item.eligibility.eligible
                ? isBn ? "খাদ্য লট ক্লেইম করুন" : "Claim donation"
                : isBn ? "ক্লেইমের উপযুক্ত নয়" : "Not eligible to claim"}
            </Button>
          </StickyActionBar>
        </div>
      )}
    </PortalShell>
  );
}
