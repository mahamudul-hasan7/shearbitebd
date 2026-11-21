"use client";
import { LiveIcon } from "@/components/motion/live-icon";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMockAuth } from "@/features/auth/mock-auth";
import { ClaimConfirmation } from "./claim-confirmation";
import {
  availableForDiscovery,
  pickupDeadline,
  parseDiscoveryFilters,
  discoveryQuery,
} from "./discovery-model";
import { useDiscoveryClock } from "./use-discovery-clock";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import {
  AlertTriangle,
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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  CATEGORY_LABELS_BN,
  DIETARY_LABELS_BN,
  STORAGE_LABELS_BN,
  UNIT_LABELS_BN,
  formatDonationDateTimeBn,
} from "@/features/donations/donation-presentation";
import { useSavedDonations } from "@/features/ngo-discovery/use-saved-donations";
import {
  NGO_PROFILE_ID,
  NGO_VIEWER,
} from "@/features/ngo-dashboard/use-ngo-dashboard";
import {
  DIETARY_TYPE_LABELS,
  FOOD_CATEGORY_LABELS,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import {
  asyncState,
  claimService,
  discoveryService,
  toServiceError,
  type AsyncState,
  type NGODiscoveryItem,
} from "@/services";

const SAFETY_CHECKS = [
  { key: "freshlyPrepared", label: "Food declared freshly prepared" },
  { key: "properlyCovered", label: "Covered for collection" },
  { key: "noVisibleSpoilage", label: "No visible spoilage declared" },
  { key: "storedAccordingToDeclaration", label: "Stored as declared" },
  { key: "allergensDisclosed", label: "Allergens disclosed" },
  { key: "pickupDeadlineConfirmed", label: "Collection deadline confirmed" },
  { key: "donorAccuracyConfirmed", label: "Donor confirmed these details" },
] as const;

function packagingLabel(
  condition: NGODiscoveryItem["donation"]["foodCondition"],
) {
  if (condition === "PACKAGED") return "Packaged food";
  if (condition === "SAME_DAY") return "Prepared the same day";
  return "Freshly prepared food";
}

export function NGODonationDetail({ donationId }: { donationId: string }) {
  const tx = useUiText();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const now = useDiscoveryClock();
  const { session } = useMockAuth();
  const searchParams = useSearchParams();
  const query = discoveryQuery(
    parseDiscoveryFilters(new URLSearchParams(searchParams.toString())),
  );
  const backHref = ROUTES.ngo.discover + (query ? `?${query}` : "");
  const [confirming, setConfirming] = useState(false);
  const claimLock = useRef(false);
  const [state, setState] = useState<AsyncState<NGODiscoveryItem>>(() =>
    asyncState.loading(),
  );
  const [retryKey, setRetryKey] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimId, setClaimId] = useState<string>();
  const [claimError, setClaimError] = useState<string>();
  const { savedIds, toggleSaved } = useSavedDonations();

  useEffect(() => {
    const controller = new AbortController();
    discoveryService
      .getById(donationId, NGO_PROFILE_ID, NGO_VIEWER, {
        signal: controller.signal,
      })
      .then((item) => setState(asyncState.success(item)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [donationId, retryKey]);

  async function claimDonation() {
    const item = state.data;
    if (
      claimLock.current ||
      !item ||
      !item.eligibility.eligible ||
      !availableForDiscovery(item.donation, Date.now())
    )
      return;
    claimLock.current = true;
    setClaiming(true);
    setClaimError(undefined);
    try {
      const claim = await claimService.create(
        {
          donationId,
          ngoProfileId: NGO_PROFILE_ID,
          matchScore: item.matchScore,
        },
        NGO_VIEWER,
      );
      setClaimId(claim.id);
      setConfirming(false);
    } catch (error: unknown) {
      // The reservation may have committed before its response was lost.
      // Reconcile with the authenticated owner's records before offering a retry.
      try {
        const existing = (await claimService.list({ donationId })).find(
          (claim) =>
            [
              "RESERVED",
              "ASSIGNED",
              "PICKED_UP",
              "DELIVERED",
              "DISPUTED",
            ].includes(claim.status),
        );
        if (existing) {
          setClaimId(existing.id);
          setConfirming(false);
          return;
        }
      } catch {
        /* Preserve the original claim error when recovery is unavailable. */
      }
      setClaimError(toServiceError(error).message);
    } finally {
      claimLock.current = false;
      setClaiming(false);
    }
  }

  const item = state.data;
  const donation = item?.donation;
  const saved = savedIds.includes(donationId);
  const canClaim = !!(
    item?.eligibility.eligible &&
    donation &&
    now &&
    availableForDiscovery(donation, now) &&
    !claimId
  );

  const title = donation?.title || tx("Donation details");
  const description = donation?.description || "";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.discover}
      title={title}
      description={
        isBn
          ? tx(
              "খাদ্য সুরক্ষা ডিক্লারেশন, এনজিও claim eligibility ও পিকআপ বিবরণ পর্যালোচনা করে রেসকিউ ক্লেইম করুন।",
            )
          : tx(
              "Review safety declarations, operational fit, and privacy-protected pickup information before claiming.",
            )
      }
      profileName={session?.displayName || "NGO account"}
      profileDescription={tx("Food rescue partner")}
      avatarInitials="HF"
      notificationHref={ROUTES.ngo.notifications}
      backHref={backHref}
      backLabel={isBn ? tx("অনুসন্ধান তালিকায় ফিরুন") : tx("Back to discovery")}
    >
      {state.status === "loading" && !item && (
        <LoadingSpinner label={tx("Loading donation details")} />
      )}

      {state.status === "error" && !item && (
        <EmptyState
          icon={RefreshCw}
          title={
            isBn
              ? tx("খাবারের বিবরণ লোড করা যায়নি")
              : tx("Donation could not load")
          }
          description={tx(state.error.message)}
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
                <DonationPhoto
                  donation={donation}

                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-4">
                  <StatusBadge status={donation.status} />
                  <Badge
                    tone={item.eligibility.eligible ? "success" : "warning"}
                  >
                    {item.eligibility.eligible
                      ? tx("Eligible to claim")
                      : tx("Check eligibility")}
                  </Badge>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-5 pt-20 text-white">
                  <p className="text-lg font-black">{item.donorOrganization}</p>
                  <p className="mt-0.5 text-xs text-white/80">
                    {isBn
                      ? tx("খাদ্যদাতার ঘোষিত তথ্য")
                      : tx("Donor-declared details")}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                    {isBn
                      ? CATEGORY_LABELS_BN[donation.category] ||
                        FOOD_CATEGORY_LABELS[donation.category]
                      : FOOD_CATEGORY_LABELS[donation.category]}
                  </span>
                  <Badge
                    tone={item.eligibility.eligible ? "success" : "warning"}
                  >
                    {item.eligibility.eligible
                      ? isBn
                        ? tx("ক্লেইম করার জন্য উপযুক্ত")
                        : tx("Eligible to claim")
                      : isBn
                        ? tx("যোগ্যতা পর্যালোচনা আবশ্যক")
                        : tx("Review eligibility")}
                  </Badge>
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>

                <div className="mt-6">
                  <RescueClock
                    deadline={new Date(pickupDeadline(donation)).toISOString()}
                    compact
                  />
                </div>

                <div className="mt-6 grid gap-3 xs:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <LiveIcon
                      icon={MapPin}
                      motion="interaction"
                      className="size-5 text-emerald-700"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn
                        ? tx("পিকআপ এলাকা ও দূরত্ব")
                        : tx("Approximate pickup")}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {donation.pickup.approximateArea} ·{" "}
                      {donation.pickup.distanceKm === undefined
                        ? tx("দূরত্ব পাওয়া যায়নি")
                        : tx(
                            "~{0} km straight line",
                            donation.pickup.distanceKm.toFixed(1),
                          )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <LiveIcon
                      icon={PackageOpen}
                      motion="interaction"
                      className="size-5 text-teal-700"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? tx("উদ্ধারযোগ্য পরিমাণ") : tx("Quantity")}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {donation.quantity.value}{" "}
                      {isBn
                        ? UNIT_LABELS_BN[donation.quantity.unit] ||
                          donation.quantity.unit
                        : donation.quantity.unit}{" "}
                      · ~{donation.quantity.estimatedMeals} {tx("জনের আহার")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <Clock3 className="size-5 text-amber-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? tx("রান্নার সময়") : tx("Prepared")}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {formatDonationDateTimeBn(donation.preparationTime)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <Refrigerator className="size-5 text-blue-700" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isBn ? tx("সংরক্ষণ তাপমাত্রা") : tx("Storage")}
                    </p>
                    <p className="mt-1 font-black text-slate-900">
                      {isBn
                        ? STORAGE_LABELS_BN[donation.storageCondition] ||
                          donation.storageCondition
                        : STORAGE_CONDITION_LABELS[donation.storageCondition]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Alert
            tone="info"
            title={
              isBn
                ? tx("দাতা ও পিকআপের গোপনীয়তা সুরক্ষিত")
                : tx("Pickup privacy is protected")
            }
            description={
              isBn
                ? tx(
                    "ক্লেইম নিশ্চিত হওয়ার পূর্ব পর্যন্ত নিরাপত্তা স্বার্থে শুধুমাত্র আনুমানিক দূরত্ব ও এলাকা দেখানো হয়। অনুমোদনের পর সম্পূর্ণ ঠিকানা ও ফোকাল পারসনের নম্বর দৃশ্যমান হবে।",
                  )
                : tx(
                    "Only an approximate area and distance are shown before claim acceptance. Exact address, coordinates, directions, and donor contact are not displayed on this discovery page.",
                  )
            }
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <PhotoGallery
              urls={donation.photoUrls}
              label={tx("Donor food photos")}
            />
            {/* Dietary & Packaging Card */}
            <Card className="border-slate-200/90 shadow-xs">
              <CardHeader
                title={
                  isBn
                    ? tx("ডায়েট ও প্যাকেজিং বিবরণ")
                    : tx("Dietary & packaging information")
                }
                description={
                  isBn
                    ? tx("আপনার উপকারভোগী ও পরিবহন সক্ষমতার সাথে মিলিয়ে নিন।")
                    : tx("Review fit with your recipients and transport plan.")
                }
              />
              <CardContent className="grid gap-5">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isBn ? tx("ডায়েট উপযুক্ততা") : tx("Dietary labels")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {donation.dietaryTypes.map((value) => (
                      <span
                        key={value}
                        className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-600/20"
                      >
                        {isBn
                          ? DIETARY_LABELS_BN[value] ||
                            DIETARY_TYPE_LABELS[value]
                          : DIETARY_TYPE_LABELS[value]}
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
                      {isBn
                        ? tx("দাতা কর্তৃক ঘোষিত প্যাকেজিং মানদণ্ড।")
                        : tx("Condition declared by the donor.")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Refrigerator className="size-5 text-blue-700" />
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {isBn
                        ? STORAGE_LABELS_BN[donation.storageCondition]
                        : STORAGE_CONDITION_LABELS[donation.storageCondition]}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {isBn
                        ? tx("পরিবহনের সময় তাপমাত্রা বজায় রাখুন।")
                        : tx("Maintain during collection and transport.")}
                    </p>
                  </div>
                </div>

                {donation.allergens.length > 0 ? (
                  <Alert
                    tone="warning"
                    title={tx(
                      "অ্যালার্জেন ডিক্লারেশন: {0}",
                      donation.allergens.join(", "),
                    )}
                    description={tx("বিতরণের সময় অ্যালার্জেন লেবেল দৃশ্যমান রাখুন।")}
                  />
                ) : (
                  <Alert
                    tone="info"
                    title={tx("No allergens declared")}
                    description={tx("দাতা কোনো অ্যালার্জেন উপাদান ঘোষণা করেননি।")}
                  />
                )}

                {donation.specialInstructions && (
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {isBn
                        ? tx("বিশেষ পিকআপ নির্দেশনা")
                        : tx("Handling instructions")}
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
                title={
                  isBn
                    ? tx("দাতা প্রতিষ্ঠানের খাদ্য নিরাপত্তা ঘোষণা")
                    : tx("Donor safety declaration")
                }
                description={tx(
                  "Declared {0}. These are donor statements, not an inspection certificate.",
                  formatDonationDateTimeBn(
                    donation.safetyDeclaration.declaredAt,
                  ),
                )}
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
                      <p className="text-xs font-bold text-slate-800">
                        {tx(check.label)}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Eligibility Summary */}
          <Card className="border-slate-200/90 shadow-xs">
            <CardHeader
              title={
                isBn ? tx("এনজিও যোগ্যতা পর্যালোচনা") : tx("Eligibility summary")
              }
              description={tx(
                "Checks use your NGO verification, accepted food categories and the current collection deadline.",
              )}
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
                    <p className="text-sm font-black text-slate-900">
                      {tx(check.label)}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">
                      {tx(check.description)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {claimError && (
            <Alert
              tone="danger"
              title={tx("ক্লেইম সম্পন্ন করা যায়নি")}
              description={tx(claimError)}
            />
          )}

          {claimId && (
            <Alert
              tone="success"
              title={tx("খাদ্য লট সফলভাবে ক্লেইম করা হয়েছে!")}
              description={tx(
                "উদ্ধার কাজটি আপনার এনজিও প্যানেলে বরাদ্দ করা হয়েছে। ভলান্টিয়ার অ্যাসাইন করতে ক্লেইম পাতায় যান।",
              )}
              action={
                <ButtonLink
                  href={ROUTES.ngo.claim(claimId)}
                  variant="outline"
                  size="md"
                >
                  <UiText source={"ক্লেইম পেজ খুলুন"} />
                </ButtonLink>
              }
            />
          )}

          <StickyActionBar className="flex flex-wrap items-center justify-end gap-3 !bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:!bottom-0">
            <Button
              variant="outline"
              leftIcon={
                <Bookmark
                  className={`size-4 ${saved ? "fill-amber-500 text-amber-600" : ""}`}
                />
              }
              onClick={() => toggleSaved(donationId)}
            >
              {saved
                ? isBn
                  ? "সংরক্ষণ করা হয়েছে"
                  : "Saved for later"
                : isBn
                  ? "সংরক্ষণ করুন"
                  : "Save for later"}
            </Button>
            <Button
              disabled={!canClaim || claiming}
              leftIcon={<ShieldCheck className="size-4" />}
              onClick={() => {
                setClaimError(undefined);
                setConfirming(true);
              }}
            >
              {claiming
                ? isBn
                  ? tx("ক্লেইম করা হচ্ছে…")
                  : tx("Claiming…")
                : claimId
                  ? isBn
                    ? tx("ক্লেইম সম্পন্ন")
                    : tx("Claimed")
                  : item.eligibility.eligible
                    ? isBn
                      ? tx("খাদ্য লট ক্লেইম করুন")
                      : tx("Claim donation")
                    : isBn
                      ? tx("ক্লেইমের উপযুক্ত নয়")
                      : tx("Not eligible to claim")}
            </Button>
          </StickyActionBar>
          {confirming && (
            <ClaimConfirmation
              donation={donation}
              busy={claiming}
              error={claimError}
              available={canClaim}
              onClose={() => setConfirming(false)}
              onConfirm={() => void claimDonation()}
            />
          )}
        </div>
      )}
    </PortalShell>
  );
}
