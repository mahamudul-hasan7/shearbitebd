"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bike,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartHandshake,
  MapPin,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Sparkles,
  Thermometer,
  UsersRound,
  Utensils,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function PlatformTour() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Interactive Simulator Step State
  const [simStep, setSimStep] = useState<1 | 2 | 3>(1);

  const simulationSteps = [
    {
      step: 1 as const,
      roleEn: "Donor Posts Surplus",
      roleBn: "দাতা খাবার আপলোড",
      titleEn: "UIU Cafeteria posts 85 Kacchi Biryani Foil Trays",
      titleBn: "UIU ক্যাফেটেরিয়া ৮৫ প্যাক কাচ্চি বিরিয়ানি আপলোড করল",
      descEn: "Sealed foil packing with 10:45 PM safe consumption window. Direct notification dispatched to nearby squads.",
      descBn: "ট্যাম্পার-প্রুফ ফয়েল প্যাকেজিং এবং রাত ১০:৪৫ পর্যন্ত সেফ উইন্ডো নির্ধারণ। নিকটবর্তী স্কোয়াডে তাৎক্ষণিক বার্তা।",
      badgeEn: "Food Available",
      badgeBn: "খাবার প্রস্তুত",
      badgeTone: "success" as const,
      location: "Madani Avenue, Badda",
      icon: Utensils,
    },
    {
      step: 2 as const,
      roleEn: "Volunteer Dispatched",
      roleBn: "রাইডার ট্রানজিট শুরু",
      titleEn: "Rider Tanvir dispatched via Hatirjheel Loop",
      titleBn: "রাইডার তানভীর হাতিরঝিল লিংক দিয়ে পিকআপের পথে",
      descEn: "Equipped with BFSA certified insulated thermal delivery box. Live GPS telemetry tracked by Central Command.",
      descBn: "BFSA মানসম্মত থার্মাল বক্সে খাবার সংগ্রহ। সেন্ট্রাল কমান্ডের মাধ্যমে লাইভ জিপিএস ট্র্যাকিং চলমান।",
      badgeEn: "In Transit (28 km/h)",
      badgeBn: "ট্রানজিটে (২৮ কিমি/ঘণ্টা)",
      badgeTone: "warning" as const,
      location: "Hatirjheel Expressway ➔ Dhanmondi",
      icon: Bike,
    },
    {
      step: 3 as const,
      roleEn: "Verified Shelter Handover",
      roleBn: "শেল্টারে নিরাপদ হস্তান্তর",
      titleEn: "Mastul Foundation verifies OTP 7429",
      titleBn: "মাস্তুল ফাউন্ডেশন ওটিপি ৭৪২৯ দিয়ে খাবার গ্রহণ করল",
      descEn: "110 vulnerable children and shelter residents receive hot, hygienic meals with zero waste.",
      descBn: "১১০ জন সুবিধাবঞ্চিত শিশু ও এতিমদের মাঝে উষ্ণ ও স্বাস্থ্যসম্মত খাবার নিরাপদে বিতরণ সম্পন্ন।",
      badgeEn: "Delivered & Verified",
      badgeBn: "হস্তান্তর সম্পন্ন ও ভেরিফাইড",
      badgeTone: "info" as const,
      location: "Road 32, Dhanmondi",
      icon: HeartHandshake,
    },
  ];

  const currentSim = simulationSteps.find((s) => s.step === simStep) ?? simulationSteps[0];

  const pillars = [
    {
      role: isBn ? "কর্পোরেট ও ক্যাটারার দাতা" : "Food Donors & Caterers",
      subtitle: isBn ? "হোটেল, রেস্তোরাঁ ও বিশ্ববিদ্যালয় ক্যাফেটেরিয়া" : "Hotels, Conventions & UIU/BRACU Cafes",
      description: isBn
        ? "অনুষ্ঠান শেষে উদ্বৃত্ত গরম বিরিয়ানি ও খাবার ২ মিনিটের মধ্যে ছবি ও সংখ্যা সহ আপলোড করুন।"
        : "Upload freshly packed catering trays in under 2 minutes with safe consumption deadlines.",
      icon: Utensils,
      color: "from-emerald-500 to-teal-700",
      pill: isBn ? "পিকআপ রেডি" : "Step 1 · Post Food",
      href: ROUTES.auth.registerDonor,
      cta: isBn ? "দাতা হিসেবে যুক্ত হোন" : "Register as Donor",
    },
    {
      role: isBn ? "স্বেচ্ছাসেবক উদ্ধার স্কোয়াড" : "Volunteer Squads",
      subtitle: isBn ? "ঢাকা মেট্রো বাইক ও সিএনজি রাইডার" : "Rapid Bike & CNG Transport across Dhaka",
      description: isBn
        ? "থার্মাল ইনসুলেটেড ব্যাগে খাবার সুরক্ষিত রেখে ডিজিটাল পিন বা কিউআর কোডের মাধ্যমে হ্যান্ডওভার সম্পন্ন করুন।"
        : "Dispatch rapidly via Hatirjheel & Pragati Sarani with insulated boxes and OTP/QR signoff.",
      icon: Bike,
      color: "from-amber-500 to-orange-600",
      pill: isBn ? "দ্রুত পরিবহন" : "Step 2 · Transport",
      href: ROUTES.auth.registerVolunteer,
      cta: isBn ? "স্বেচ্ছাসেবক হিসেবে যোগ দিন" : "Join Squad",
    },
    {
      role: isBn ? "স্বীকৃত এনজিও ও শেল্টার" : "Verified NGO Shelters",
      subtitle: isBn ? "মাস্তুল, বিদ্যানন্দ ও জাগো ফাউন্ডেশন" : "Mastul, Bidyanondo, JAAGO & Local Shelters",
      description: isBn
        ? "স্মার্ট ম্যাচিংয়ের মাধ্যমে নিকটবর্তী এলাকা থেকে খাবার গ্রহণ করে এতিম ও দরিদ্রদের মাঝে বিতরণ করুন।"
        : "Claim matching hot food allocations directly to feed vulnerable children and families.",
      icon: HeartHandshake,
      color: "from-indigo-500 to-blue-700",
      pill: isBn ? "খাদ্য পৌঁছানো" : "Step 3 · Distribute",
      href: ROUTES.auth.registerNgo,
      cta: isBn ? "এনজিও নিবন্ধন" : "Register NGO",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-black text-brand-800 shadow-2xs">
          <Sparkles className="size-3.5 text-accent-600" />
          <span>
            {isBn
              ? "বাংলাদেশের প্রথম প্রযুক্তিভিত্তিক উদ্বৃত্ত খাদ্য পুনরুদ্ধার নেটওয়ার্ক"
              : "Bangladesh's Premier Tech-Enabled Surplus Food Rescue Grid"}
          </span>
        </div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink-900 sm:text-5xl">
          {isBn
            ? "খাবার অপচয় বন্ধ করুন, প্রতিটি প্লেটে হাসি ফোটান"
            : "Rescue Safe Surplus Food. Zero Waste, Zero Hunger."}
        </h1>
        <p className="text-sm font-medium leading-relaxed text-muted-600 sm:text-base">
          {isBn
            ? "শেয়ারবাইট বিডি ঢাকা শহরের খাবার দাতা, স্বেচ্ছাসেবক রাইডার এবং নিবন্ধিত এনজিওদের একটি নিরাপদ ডিজিটাল প্ল্যাটফর্মে সংযুক্ত করে।"
            : "ShareBite BD bridges corporate kitchens, rapid bike couriers, and verified shelters to deliver hot meals before safe deadlines elapse."}
        </p>
      </div>

      {/* Interactive Workflow Simulator */}
      <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-surface shadow-xl">
        <div className="border-b border-line bg-slate-50/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-sm font-black uppercase tracking-wider text-ink-900 sm:text-base">
              {isBn ? "লাইভ রেসকিউ সিমুলেটর (ইন্টারেক্টিভ)" : "Interactive Live Rescue Simulator"}
            </h3>
            <p className="text-xs text-muted-600">
              {isBn
                ? "বাটনগুলোতে ক্লিক করে দেখুন কীভাবে শেয়ারবাইট বিডিতে খাদ্য উদ্ধার সম্পন্ন হয়"
                : "Click through the steps below to experience the end-to-end food rescue workflow"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-canvas p-1 border border-line">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSimStep(s as 1 | 2 | 3)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition-all",
                  simStep === s
                    ? "bg-brand-600 text-white shadow-xs font-black"
                    : "text-muted-600 hover:text-ink-900"
                )}
              >
                {isBn ? `ধাপ ০${s}` : `Step 0${s}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center gap-2">
              <Badge tone={currentSim.badgeTone}>
                {isBn ? currentSim.badgeBn : currentSim.badgeEn}
              </Badge>
              <span className="flex items-center gap-1 text-xs font-bold text-ink-600">
                <MapPin className="size-3.5 text-accent-600" />
                {currentSim.location}
              </span>
            </div>

            <h4 className="font-heading text-xl font-black text-ink-900 sm:text-2xl">
              {isBn ? currentSim.titleBn : currentSim.titleEn}
            </h4>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-muted-600">
              {isBn ? currentSim.descBn : currentSim.descEn}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setSimStep((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)))
                }
                rightIcon={<ChevronRight className="size-4" />}
              >
                {simStep === 3
                  ? isBn
                    ? "পুনরায় শুরু করুন"
                    : "Restart Demo"
                  : isBn
                  ? "পরবর্তী ধাপ দেখুন"
                  : "Next Step"}
              </Button>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-slate-900 lg:col-span-5">
            <Image
              src="/images/surplus-food-containers.jpg"
              alt="Bangladesh Surplus Food Packaging"
              fill
              className="object-cover opacity-90 transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 450px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>BFSA Tamper-Proof</span>
              </div>
              <span className="font-mono text-amber-300 font-bold">OTP: 7429</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars of ShareBite BD */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <Card
              key={idx}
              className="flex flex-col justify-between overflow-hidden border border-slate-200/90 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                      pillar.color
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <Badge tone="neutral" className="font-heading font-black">
                    {pillar.pill}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-black text-ink-900">
                    {pillar.role}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-brand-700">
                    {pillar.subtitle}
                  </p>
                </div>

                <p className="text-xs font-medium leading-relaxed text-muted-600 sm:text-sm">
                  {pillar.description}
                </p>
              </div>

              <div className="border-t border-line bg-slate-50/60 p-5">
                <ButtonLink
                  href={pillar.href}
                  variant="outline"
                  fullWidth
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  {pillar.cta}
                </ButtonLink>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verified Partner NGOs & Ecosystem Strip */}
      <section className="rounded-2xl border border-line bg-canvas p-6 sm:p-8">
        <p className="text-center font-heading text-xs font-black uppercase tracking-widest text-muted-500">
          {isBn
            ? "বিশ্বস্ত কমিউনিটি পার্টনার ও খাদ্য উদ্ধার নেটওয়ার্ক"
            : "Trusted by Leading NGOs & University Caterers across Bangladesh"}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-ink-700">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Mastul Foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Bidyanondo Foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>JAAGO Foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>UIU Cafeteria & Food Court</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>BRAC University Food Club</span>
          </div>
        </div>
      </section>

      {/* Real Bangladesh Context Showcase (UIU, Hatirjheel, BFSA Standards) */}
      <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7">
            <Badge tone="warning">
              {isBn ? "নিরাপত্তা ও হাইজিন নিশ্চয়তা" : "BFSA Certified Food Safety"}
            </Badge>
            <h2 className="font-heading text-2xl font-black text-white sm:text-3xl">
              {isBn
                ? "খাদ্যের গুণগত মান ও নিরাপদ হ্যান্ডওভার"
                : "Tamper-Proof Packaging & Thermal Assurance"}
            </h2>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              {isBn
                ? "আমাদের প্ল্যাটফর্মের মাধ্যমে উদ্ধারকৃত প্রতিটি খাবার স্বাস্থ্যসম্মত ফয়েল প্যাকেজিং এবং থার্মাল ব্যাগে পরিবাহিত হয়। দাতা ও গ্রহীতা উভয় পক্ষের ডিজিটাল ওটিপি নিশ্চিতের মাধ্যমে স্বচ্ছতা বজায় থাকে।"
                : "Every meal rescued on ShareBite BD complies with Bangladesh Food Safety Authority (BFSA) temperature controls, tamper-evident seals, and instant 4-digit OTP handover verification."}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  {isBn ? "থার্মাল ধারণ" : "Thermal Retention"}
                </p>
                <p className="font-heading mt-1 text-lg font-black text-white">&gt; 60°C Hot</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {isBn ? "গড় ডেলিভারি সময়" : "Avg Dispatch Time"}
                </p>
                <p className="font-heading mt-1 text-lg font-black text-white">28 mins</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  {isBn ? "ডিজিটাল ভেরিফিকেশন" : "Verification"}
                </p>
                <p className="font-heading mt-1 text-lg font-black text-white">100% OTP</p>
              </div>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl lg:col-span-5">
            <Image
              src="/images/bangladesh-food-rescue-hero.jpg"
              alt="Bangladesh Food Rescue Volunteers"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 450px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
              <p className="font-bold">Community Kitchen Packaging</p>
              <p className="text-[11px] text-slate-300">Volunteers preparing hot meal distributions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection & Get Started Buttons */}
      <div className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-8 space-y-4">
        <h3 className="font-heading text-xl font-black text-ink-900 sm:text-2xl">
          {isBn ? "আপনি কীভাবে অংশগ্রহণ করতে চান?" : "Ready to join the rescue mission?"}
        </h3>
        <p className="text-xs text-muted-600 max-w-xl mx-auto sm:text-sm">
          {isBn
            ? "আপনার প্রতিষ্ঠানের ভূমিকা অনুযায়ী সাইন আপ করুন অথবা আমাদের ডেমো পোর্টাল সরাসরি পরীক্ষা করুন।"
            : "Select your role below to explore the dedicated desktop workspace or preview live operations."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <ButtonLink
            href={ROUTES.auth.roleSelection}
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="size-4" />}
          >
            {isBn ? "রোল নির্বাচন করুন ও শুরু করুন" : "Choose Your Role & Get Started"}
          </ButtonLink>
          <ButtonLink
            href={ROUTES.auth.login}
            variant="outline"
            size="lg"
          >
            {isBn ? "সরাসরি ডেমো লগইন করুন" : "Sign in with Demo Account"}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}