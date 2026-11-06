"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileCheck2,
  FileText,
  Flame,
  Leaf,
  LockKeyhole,
  LogOut,
  MapPin,
  Phone,
  Printer,
  QrCode,
  RefreshCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Soup,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useMockAuth } from "@/features/auth/mock-auth";
import { DONOR_PROFILE_ID, DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { VerificationStatus } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import {
  asyncState,
  impactService,
  notificationService,
  profileService,
  toServiceError,
  type AsyncState,
  type ProfileBundle,
} from "@/services";

interface ProfileData {
  profile: ProfileBundle;
  mealsRescued: number;
  ngosHelped: number;
  totalDonations: number;
  donorScore: number;
  unread: number;
}

type CertificateType = "bfsa" | "csr";

const accountLinks = [
  {
    href: ROUTES.donor.addresses,
    label: "সংরক্ষিত পিকআপ ঠিকানা ও লোডিং ডক",
    description: "ক্যাম্পাস লোডিং গেট, ক্যাফেটেরিয়া ডক ও পিকআপ নির্দেশিকা",
    icon: MapPin,
  },
  {
    href: ROUTES.donor.settings,
    label: "সুরক্ষা, অ্যালার্ট ও প্রাইভেসি প্রেফারেন্স",
    description: "ওটিপি হ্যান্ডওভার, পুশ অ্যালার্ট ও খাদ্য নিরাপত্তা প্রটোকল",
    icon: LockKeyhole,
  },
  {
    href: ROUTES.donor.support,
    label: "২৪/৭ জরুরি সহায়তা ও হটলাইন",
    description: "খাদ্য সুরক্ষা পরামর্শ, অডিট সাপোর্ট ও অপারেশনাল সহায়তা",
    icon: CircleHelp,
  },
];

export function DonorProfileView() {
  const [state, setState] = useState<AsyncState<ProfileData>>(() => asyncState.loading());
  const [retryKey, setRetryKey] = useState(0);
  const [activeCert, setActiveCert] = useState<CertificateType>("bfsa");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const { signOut } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, options),
      impactService.getDonorOverview(DONOR_PROFILE_ID, DONOR_VIEWER, options),
      notificationService.listForUser(DONOR_USER_ID, DONOR_VIEWER, options),
    ])
      .then(([profile, impact, notifications]) => {
        setState(
          asyncState.success({
            profile,
            mealsRescued: impact.mealsRescued,
            ngosHelped: impact.ngosHelped,
            totalDonations: impact.totalDonations,
            donorScore: impact.donorScore,
            unread: notifications.filter((item) => !item.readAt).length,
          })
        );
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [retryKey]);

  const data = state.data;
  const donor = data?.profile.donorProfile;
  const user = data?.profile.user;
  const name = donor?.organizationName ?? user?.displayName ?? "ইউআইইউ সেন্ট্রাল ক্যাফেটেরিয়া";

  function handleCopyVerificationLink() {
    navigator.clipboard?.writeText("https://sharebite.bd/verify/donor/DON-BD-2024-8849");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  function handlePrintCertificate() {
    window.print();
  }

  function logout() {
    signOut();
    router.replace(ROUTES.auth.login);
  }

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.profile}
      title="দাতা প্রোফাইল ও সনদপত্র"
      description="বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA) লাইসেন্স, ডিজিটাল সিএসআর সনদ ও ভেরিফায়েড প্রাতিষ্ঠানিক তথ্য।"
      profileName={name}
      profileDescription="ভেরিফায়েড প্রিমিয়াম খাদ্য দাতা"
      avatarInitials={getInitials(name)}
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={data?.unread ?? 0}
      actions={
        data ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="size-4 text-emerald-700" />}
              onClick={() => setShowCertificateModal(true)}
            >
              সনদপত্র দেখুন ও প্রিন্ট
            </Button>
            <ButtonLink
              href={ROUTES.donor.editProfile}
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 className="size-4" />}
            >
              প্রোফাইল সম্পাদনা
            </ButtonLink>
          </div>
        ) : undefined
      }
    >
      {state.status === "loading" && !data && (
        <SkeletonGroup label="Loading donor profile" className="grid gap-5">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </SkeletonGroup>
      )}

      {state.status === "error" && !data && (
        <EmptyState
          icon={RefreshCw}
          title="প্রোফাইল লোড করা যায়নি"
          description={state.error.message}
          action={
            <Button onClick={() => setRetryKey((value) => value + 1)}>
              পুনরায় চেষ্টা করুন
            </Button>
          }
        />
      )}

      {data && donor && user && (
        <div className="grid gap-8">
          {/* 1. HERO IDENTITY CARD WITH ENTERPRISE BADGING */}
          <Card className="relative overflow-hidden border-slate-200/90 shadow-sm">
            {/* Top Patterned Banner */}
            <div className="relative h-36 bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 p-6 text-white sm:h-44">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:18px_18px] opacity-15" />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>জাতীয় নিরাপদ খাদ্য প্ল্যাটফর্ম স্বীকৃত পার্টনার</span>
                </div>
                <div className="hidden items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md sm:flex">
                  <Award className="size-4 text-amber-400" />
                  <span>BFSA এক্রিডিটেশন গ্রেড: A+</span>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="relative px-6 pb-6 pt-0 sm:px-8">
              <div className="-mt-14 mb-4 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
                <div className="relative">
                  <div className="relative grid size-24 place-items-center rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-600 to-teal-800 text-2xl font-black text-white shadow-md sm:size-28 sm:text-3xl">
                    {getInitials(name)}
                    <span
                      title="অ্যাক্টিভ ও ভেরিফায়েড একাউন্ট"
                      className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm"
                    >
                      <BadgeCheck className="size-4" />
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyVerificationLink}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-700">লিঙ্ক কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-slate-500" />
                        <span>ভেরিফিকেশন লিঙ্ক কপি</span>
                      </>
                    )}
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FileCheck2 className="size-4 text-emerald-600" />}
                    onClick={() => setShowCertificateModal(true)}
                  >
                    সনদ প্রিভিউ
                  </Button>

                  <ButtonLink
                    href={ROUTES.donor.editProfile}
                    variant="primary"
                    size="sm"
                    leftIcon={<Edit3 className="size-4" />}
                  >
                    প্রোফাইল এডিট
                  </ButtonLink>
                </div>
              </div>

              {/* Identity Header */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {name}
                  </h1>
                  <Badge tone={donor.verificationStatus === VerificationStatus.VERIFIED ? "success" : "warning"}>
                    <ShieldCheck className="size-3.5" />
                    {donor.verificationStatus === VerificationStatus.VERIFIED ? "ভেরিফায়েড প্রাতিষ্ঠানিক দাতা" : "যাচাইকরণ প্রক্রিয়াধীন"}
                  </Badge>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    ৪.৯ / ৫.০ (রেটিং)
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটি (UIU) · সেন্ট্রাল সার্ভিস ক্যাফেটেরিয়া ও ফুড প্রোভাইডার
                </p>

                {/* Metadata Pills Ribbon */}
                <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building2 className="size-3.5 text-slate-400" />
                    <span>দাতা ক্যাটাগরি: <strong className="font-bold text-slate-800">প্রাতিষ্ঠানিক ক্যাফেটেরিয়া</strong></span>
                  </div>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="size-3.5 text-slate-400" />
                    <span>ক্যাম্পাস: <strong className="font-bold text-slate-800">মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২</strong></span>
                  </div>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span>সদস্যপদ: <strong className="font-bold text-slate-800">জানুয়ারি ২০২৪ থেকে সক্রিয়</strong></span>
                  </div>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <QrCode className="size-3.5 text-emerald-600" />
                    <span>দাতা ট্র্যাকিং আইডি: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono font-bold text-slate-700">DON-BD-2024-8849</code></span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. LIVE IMPACT & FOOD SAFETY KPI CARDS */}
          <section aria-label="লাইভ উদ্ধার ও সুরক্ষা মেট্রিক্স" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200/90 p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  মোট খাদ্য অনুদান
                </span>
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Soup className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900">
                {donor.totalDonations} টি
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                <span className="font-semibold">১০০% সফল হ্যান্ডওভার রেকর্ড</span>
              </div>
            </Card>

            <Card className="border-slate-200/90 p-5 shadow-xs transition hover:border-teal-300 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  উদ্ধারকৃত পুষ্টিকর মিল
                </span>
                <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <UsersRound className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-teal-900">
                ৩,৫২০+
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-700">
                <Sparkles className="size-3.5" />
                <span className="font-semibold">সুবিধাবঞ্চিত মানুষের কাছে বিতরণ</span>
              </div>
            </Card>

            <Card className="border-slate-200/90 p-5 shadow-xs transition hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  কার্বন নিঃসরণ রোধ (CO₂)
                </span>
                <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Leaf className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-amber-900">
                ২,৮৫০ কেজি
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                <Flame className="size-3.5" />
                <span className="font-semibold">মিথেন ও গ্রিনহাউস গ্যাস প্রতিরোধ</span>
              </div>
            </Card>

            <Card className="border-slate-200/90 p-5 shadow-xs transition hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ফুড সেফটি কমপ্লায়েন্স
                </span>
                <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <ShieldCheck className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-blue-900">
                ৯৮.৫%
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-700">
                <BadgeCheck className="size-3.5" />
                <span className="font-semibold">বিএফএসএ অডিট গ্রেড A+</span>
              </div>
            </Card>
          </section>

          {/* 3. DIGITAL CERTIFICATE & ACCREDITATION SECTION (CORE HIGHLIGHT) */}
          <div className="grid gap-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Award className="size-5" />
                  </span>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    অফিসিয়াল ডিজিটাল সনদপত্র ও স্বীকৃতি
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA) ও শেয়ারবাইট বাংলাদেশ কর্তৃক যাচাইকৃত প্রাতিষ্ঠানিক সনদ।
                </p>
              </div>

              {/* Certificate Switcher Pills */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/90 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveCert("bfsa")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                    activeCert === "bfsa"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="size-3.5" />
                  <span>BFSA ফুড সেফটি সনদ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCert("csr")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                    activeCert === "csr"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Award className="size-3.5" />
                  <span>জাতীয় গ্রিন সিএসআর সনদ</span>
                </button>
              </div>
            </div>

            {/* VISUAL CERTIFICATE CANVAS & SPEC CARD */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Visual Certificate Canvas */}
              <div className="lg:col-span-8">
                <Card className="relative overflow-hidden border-2 border-emerald-900/10 bg-white p-6 shadow-md print:border-none print:shadow-none sm:p-8">
                  {/* Outer ornamental border */}
                  <div className="relative rounded-2xl border-4 border-double border-emerald-800/25 bg-radial-[at_top_left] from-emerald-50/40 via-white to-amber-50/20 p-6 sm:p-8">
                    {/* Watermark Emblem */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035]">
                      <ShieldCheck className="size-96 text-emerald-950" />
                    </div>

                    {/* Certificate Header */}
                    <div className="relative border-b-2 border-emerald-800/15 pb-6 text-center">
                      <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full border-2 border-amber-400 bg-emerald-900 text-amber-300 shadow-sm">
                        <Award className="size-8" />
                      </div>
                      <p className="text-xs font-extrabold tracking-widest text-emerald-800 uppercase">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত পার্টনারশিপ
                      </p>
                      <h3 className="mt-1 font-serif text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA) ও শেয়ারবাইট বাংলাদেশ
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-amber-700">
                        {activeCert === "bfsa"
                          ? "নিরাপদ উদ্বৃত্ত খাদ্য হ্যান্ডলিং ও সংরক্ষণ স্বীকৃতি সনদপত্র"
                          : "জাতীয় জিরো ফুড ওয়েস্ট ও গ্রিন সিএসআর এক্সিলেন্স সনদপত্র"}
                      </p>
                    </div>

                    {/* Certificate Body */}
                    <div className="relative py-8 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        এই মর্মে প্রত্যয়ন করা যাচ্ছে যে
                      </p>
                      <h4 className="mt-2 text-2xl font-black text-emerald-950 sm:text-3xl">
                        {name}
                      </h4>
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        ক্যাম্পাস: ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২
                      </p>

                      <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-700">
                        {activeCert === "bfsa"
                          ? "প্রতিষ্ঠানটি উদ্বৃত্ত খাদ্য সংগ্রহ, স্বাস্থ্যবিধি মেনে নিরাপদ হট-হোল্ডিং ও প্যাকেজিং নিশ্চিতকরণে বিএফএসএ নির্ধারিত 'খাদ্য নিরাপত্তা স্ট্যান্ডার্ড ২০১৮' শতভাগ কার্যকরভাবে পালন করেছে। নিয়মিত পরিদর্শন ও অডিটে এই প্রতিষ্ঠান গ্রেড A+ (৯৮.৫% কমপ্লায়েন্স) অর্জন করেছে।"
                          : "উদ্বৃত্ত খাদ্য অপচয় রোধে কার্যকর উদ্যোগ গ্রহণ করে পরিবেশের ২,৮৫০ কেজি ক্ষতিকর কার্বন নিঃসরণ হ্রাস এবং সুবিধাবঞ্চিত ৩,৫২০ জন মানুষের কাছে নিরাপদ আহার পৌঁছে দিয়ে ক্ষুধা নিরসনে অসামান্য অবদানের স্বীকৃতিস্বরূপ এই প্লাটিনাম পার্টনার সম্মাননা প্রদান করা হলো।"}
                      </p>

                      {/* Certificate Badges / Highlights */}
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/70 px-3.5 py-1 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="size-3.5 text-emerald-700" />
                          {activeCert === "bfsa" ? "স্ট্যাটাস: সক্রিয় ও ভেরিফায়েড" : "স্ট্যাটাস: প্লাটিনাম টিয়ার পার্টনার"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/70 px-3.5 py-1 text-xs font-bold text-amber-900">
                          <Star className="size-3.5 fill-amber-600 text-amber-600" />
                          {activeCert === "bfsa" ? "রেটিং স্কোর: ৯৮.৫% (গ্রেড A+)" : "সিএসআর স্কোর: শীর্ষ শিক্ষাপ্রতিষ্ঠান"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3.5 py-1 text-xs font-mono font-bold text-slate-800">
                          আইডি: {activeCert === "bfsa" ? "BFSA-DH-2024-0942-A" : "CSR-SBD-2025-PLT-088"}
                        </span>
                      </div>
                    </div>

                    {/* Certificate Footer with Signatures & QR Code */}
                    <div className="relative border-t-2 border-emerald-800/15 pt-6">
                      <div className="grid grid-cols-3 items-end gap-2 text-center text-xs">
                        {/* Signature 1 */}
                        <div className="flex flex-col items-center">
                          <div className="h-8 font-serif italic text-emerald-900 opacity-90 sm:text-sm">
                            Md. Nurul Haque
                          </div>
                          <div className="w-28 border-t border-slate-400 pt-1 sm:w-36">
                            <p className="font-bold text-slate-800">মোহাম্মদ নূরুল হক</p>
                            <p className="text-[10px] text-slate-500">পরিচালক, ইন্সপেকশন ও অডিট, BFSA</p>
                          </div>
                        </div>

                        {/* Center Seal / QR Code */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="grid size-12 place-items-center rounded-xl border border-slate-300 bg-white p-1 shadow-xs">
                            <QrCode className="size-10 text-emerald-900" />
                          </div>
                          <p className="mt-1 text-[9px] font-mono font-bold text-slate-500">
                            VERIFIED: 2024-8849
                          </p>
                        </div>

                        {/* Signature 2 */}
                        <div className="flex flex-col items-center">
                          <div className="h-8 font-serif italic text-emerald-900 opacity-90 sm:text-sm">
                            Dr. Sadman Hasan
                          </div>
                          <div className="w-28 border-t border-slate-400 pt-1 sm:w-36">
                            <p className="font-bold text-slate-800">ড. সাদমান হাসান</p>
                            <p className="text-[10px] text-slate-500">নির্বাহী পরিচালক, শেয়ারবাইট বাংলাদেশ</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar below Certificate */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="size-4 text-emerald-600" />
                      <span>ডিজিটাল কিউআর কোড স্ক্যান করে যেকেউ পাবলিকলি এই সনদপত্রের সত্যতা যাচাই করতে পারবেন।</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Printer className="size-4 text-slate-600" />}
                        onClick={handlePrintCertificate}
                      >
                        প্রিন্ট / পিডিএফ ডাউনলোড
                      </Button>
                      <button
                        type="button"
                        onClick={handleCopyVerificationLink}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-white"
                      >
                        <Share2 className="size-3.5" />
                        <span>লিঙ্ক শেয়ার</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Certificate Meta & Audit Breakdown */}
              <div className="flex flex-col gap-5 lg:col-span-4">
                <Card className="border-slate-200/90 p-5 shadow-xs">
                  <h3 className="text-base font-black text-slate-900">
                    সনদপত্র স্পেসিফিকেশন ও তথ্য
                  </h3>
                  <div className="mt-4 divide-y divide-slate-100 text-xs">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500">সনদপত্র আইডি</span>
                      <span className="font-mono font-bold text-slate-900">
                        {activeCert === "bfsa" ? "BFSA-DH-2024-0942-A" : "CSR-SBD-2025-PLT-088"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500">ইস্যুকারী কর্তৃপক্ষ</span>
                      <span className="font-bold text-slate-900">
                        {activeCert === "bfsa" ? "বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ" : "শেয়ারবাইট বাংলাদেশ কনসোর্টিয়াম"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500">ইস্যুর তারিখ</span>
                      <span className="font-bold text-slate-900">০১ জানুয়ারি ২০২৪</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500">কার্যকর মেয়াদ</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        ৩১ ডিসেম্বর ২০২৬ পর্যন্ত
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-slate-500">অডিট পরিদর্শন স্ট্যাটাস</span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
                        পাস (শূন্য নন-কমপ্লায়েন্স)
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Audit Safety Checklist */}
                <Card className="border-slate-200/90 p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900">
                      যাচাইকৃত সেফটি স্ট্যান্ডার্ড
                    </h3>
                    <Badge tone="success">১০০% ভেরিফায়েড</Badge>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span><strong>হট ফুড হ্যান্ডলিং:</strong> খাদ্য সবসময় ৬০°C এর উপরে সংরক্ষণ নিশ্চিত করা হয়।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span><strong>ফুড-গ্রেড প্যাকেজিং:</strong> প্রতিটি ব্যাচ সিল্ড ও স্বাস্থ্যসম্মত কন্টেইনারে সিল করা।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span><strong>অ্যালার্জেন ও লেবেলিং:</strong> উপাদান ও তৈরির সময় স্পষ্ট ডিজিটাল ডিক্লারেশনে অন্তর্ভুক্ত।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span><strong>ডিজিটাল ওটিপি হ্যান্ডওভার:</strong> অনুমোদিত এনজিও ভলান্টিয়ার ব্যতীত হস্তান্তর নিষিদ্ধ।</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>

          {/* 4. INSTITUTIONAL & PICKUP FACILITY DETAILS */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Primary Pickup Facility */}
            <Card className="border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      নিবন্ধিত পিকআপ ফ্যাসিলিটি
                    </h3>
                    <p className="text-xs text-slate-500">অনুমোদিত ভলান্টিয়ার ও এনজিওর পিকআপ লোকেশন</p>
                  </div>
                </div>
                <ButtonLink href={ROUTES.donor.addresses} variant="ghost" size="sm">
                  ব্যবস্থাপনা
                </ButtonLink>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="font-bold text-slate-900">ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটি সেন্ট্রাল ক্যাম্পাস</p>
                    <p className="mt-0.5 text-xs text-slate-600">গ্রাউন্ড ফ্লোর, ক্যাফেটেরিয়া গেট-২ ও লোডিং বে, ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২</p>
                  </div>
                </div>

                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-slate-500">পিকআপ সময়সীমা</span>
                    <p className="mt-1 font-bold text-slate-900">দুপুর ২:৩০ - ৪:৩০ ও রাত ৮:০০ - ১০:০০</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <span className="text-slate-500">হ্যান্ডওভার নির্দেশনা</span>
                    <p className="mt-1 font-bold text-slate-900">গেট-২ দিয়ে সরাসরি কিচেন ডকে প্রবেশ করুন</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Authorized Focal Person & Support */}
            <Card className="border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <UsersRound className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      অনুমোদিত ফোকাল পারসন
                    </h3>
                    <p className="text-xs text-slate-500">জরুরি খাদ্য উদ্ধার সমন্বয়ক ও প্রতিনিধি</p>
                  </div>
                </div>
                <ButtonLink href={ROUTES.donor.editProfile} variant="ghost" size="sm">
                  আপডেট
                </ButtonLink>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <Avatar initials={getInitials(user.displayName)} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{user.displayName}</p>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        প্রধান প্রতিনিধি
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">ম্যানেজার, ক্যাফেটেরিয়া অপারেশনস ও ফুড সেফটি অফিসার</p>
                  </div>
                </div>

                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3">
                    <Phone className="size-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-500">মোবাইল নম্বর</span>
                      <p className="font-bold text-slate-900">{user.phone || "+8801700000001"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3">
                    <Share2 className="size-4 text-teal-600" />
                    <div>
                      <span className="text-slate-500">অফিসিয়াল ইমেইল</span>
                      <p className="font-bold text-slate-900">{user.email || "donor@sharebite.demo"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 5. QUICK SHORTCUTS & ACCOUNT PREFERENCES */}
          <Card className="divide-y divide-slate-100 overflow-hidden border-slate-200/90 shadow-xs">
            {accountLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 p-5 transition hover:bg-emerald-50/50"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black text-slate-900 group-hover:text-emerald-900">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
              </Link>
            ))}
          </Card>

          {/* 6. LOGOUT & SESSION */}
          <Card className="border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <LogOut className="size-5" />
                </span>
                <div>
                  <p className="font-black text-slate-900">অ্যাকাউন্ট সেশন ও নিরাপত্তা</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    আপনি এই ডিভাইসে সক্রিয় দাতা হিসেবে লগইন আছেন। কাজ শেষে নিরাপদে সাইন আউট করুন।
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<LogOut className="size-4" />}
                onClick={logout}
              >
                লগআউট করুন
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: FULL PRINTABLE / HIGH-RES CERTIFICATE VIEW */}
      {showCertificateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs"
        >
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="size-5 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900">
                  ডিজিটাল সনদপত্র পূর্ণাঙ্গ প্রিভিউ
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Printer className="size-4" />}
                  onClick={handlePrintCertificate}
                >
                  প্রিন্ট / পিডিএফ ডাউনলোড
                </Button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded Certificate Preview in Modal */}
            <div className="rounded-2xl border-4 border-double border-emerald-800/30 bg-radial-[at_top_left] from-emerald-50/50 via-white to-amber-50/20 p-8 text-center">
              <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border-2 border-amber-400 bg-emerald-900 text-amber-300">
                <Award className="size-9" />
              </div>
              <p className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
                বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA) ও শেয়ারবাইট বাংলাদেশ যৌথ সনদপত্র
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-900 sm:text-3xl">
                নিরাপদ খাদ্য সংরক্ষণ ও মানবসেবা সম্মাননা সনদ
              </h2>
              <p className="mt-1 text-sm font-bold text-amber-700">
                সার্টিফিকেট ট্র্যাকিং আইডি: BFSA-DH-2024-0942-A · প্লাটিনাম ক্যাটাগরি
              </p>

              <div className="my-6 border-y border-emerald-800/15 py-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  এই সম্মাননা আনন্দের সাথে প্রদান করা হচ্ছে
                </p>
                <h3 className="mt-2 text-3xl font-black text-emerald-950">
                  {name}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২
                </p>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-700">
                  প্রতিষ্ঠানটি ২০২৪-২৫ সালে খাদ্য অপচয় নিরসনে অভূতপূর্ব অবদান রেখেছে। নিরাপদ স্বাস্থ্যবিধি,
                  ফুড-গ্রেড প্যাকেজিং ও ৬০°C এর অধিক তাপমাত্রায় নিরাপদ হট-হোল্ডিং শতভাগ পালন করে
                  ৩,৫২০+ প্যাকেট পুষ্টিকর আহার সুবিধাবঞ্চিত মানুষের কাছে হস্তান্তর করেছে এবং ২,৮৫০ কেজি ক্ষতিকর কার্বন নিঃসরণ হ্রাস করেছে।
                </p>
              </div>

              <div className="grid grid-cols-3 items-end gap-4 text-center text-xs">
                <div>
                  <div className="font-serif italic text-emerald-900">Md. Nurul Haque</div>
                  <div className="mt-1 border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-800">মোহাম্মদ নূরুল হক</p>
                    <p className="text-[10px] text-slate-500">পরিচালক, অডিট ও ইন্সপেকশন, BFSA</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="grid size-12 place-items-center rounded-xl border border-slate-300 bg-white p-1">
                    <QrCode className="size-10 text-emerald-900" />
                  </div>
                  <p className="mt-1 font-mono text-[9px] font-bold text-slate-500">VERIFIED-DONOR-8849</p>
                </div>
                <div>
                  <div className="font-serif italic text-emerald-900">Dr. Sadman Hasan</div>
                  <div className="mt-1 border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-800">ড. সাদমান হাসান</p>
                    <p className="text-[10px] text-slate-500">নির্বাহী পরিচালক, শেয়ারবাইট বাংলাদেশ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
                বন্ধ করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
