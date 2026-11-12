"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Award,
  Bike,
  Building2,
  CheckCircle2,
  Download,
  FileCheck2,
  Heart,
  MapPin,
  Phone,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function VolunteerIdCardView() {
  const { session } = useMockAuth();
  const { profile, syncWithUserSession } = useVolunteerStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"pass" | "certificate">("pass");

  useEffect(() => {
    if (session?.email) {
      syncWithUserSession(session.email, session.displayName);
    }
  }, [session?.email, session?.displayName, syncWithUserSession]);

  const isRakib =
    session?.email === "rider@gmail.com" ||
    Boolean(session?.displayName && session.displayName.toLowerCase().includes("rakib"));

  const displayName = session?.displayName || profile.fullName;
  const displayPhone = isRakib ? "01810394869" : profile.phone;
  const displayId = isRakib ? "VOL-BD-0181" : profile.id;
  const displayInitials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "RR";
  const displayVehicle = isRakib
    ? "মোটরসাইকেল (ব্যক্তিগত রেসকিউ বাহন)"
    : profile.vehicleType;
  const displayAffiliation = isRakib
    ? "বাড্ডা মেট্রো ভলান্টিয়ার উইং (Club Service)"
    : profile.universityAffiliation;

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} - ShareBite BD ভলান্টিয়ার আইডি`,
          text: `ShareBite BD অনুমোদিত খাদ্য উদ্ধার ভলান্টিয়ার আইডি: ${displayId}`,
          url: `https://sharebite.org.bd/verify/${displayId}`,
        });
        return;
      } catch {}
    }
    handleCopyVerifyLink();
  }

  function handleCopyVerifyLink() {
    navigator.clipboard.writeText(`https://sharebite.org.bd/verify/${displayId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.idCard}
      title="ভলান্টিয়ার ডিজিটাল আইডি ও সম্মাননা সনদ"
      description="পুলিশ চেকপোস্ট, রেস্তোরাঁ সিকিউরিটি ভেরিফিকেশন এবং বিশ্ববিদ্যালয় সোশাল ক্রেডিট সনদ।"
      profileName={displayName}
      profileDescription={`${profile.squadRank} · ${displayAffiliation}`}
      avatarInitials={displayInitials}
      backHref={ROUTES.volunteer.dashboard}
      backLabel="কমান্ড হাবে ফিরুন"
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            leftIcon={<Share2 className="size-4" />}
            onClick={handleShare}
            className="font-bold border-line bg-white shadow-xs"
          >
            শেয়ার
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<Printer className="size-4" />}
            onClick={handlePrint}
            className="font-bold shadow-md shadow-emerald-700/20"
          >
            আইডি প্রিন্ট
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Notice for Traffic/Checkpoint Security */}
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/90 p-4 text-xs text-emerald-950 shadow-sm">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <p className="font-bold">
              জরুরি খাদ্য উদ্ধার কার্যক্রম পরিচালনাকারী অনুমোদিত পরিচয়পত্র
            </p>
            <p className="text-muted-600 leading-relaxed">
              রাস্তায় আইন-শৃঙ্খলা রক্ষাকারী বাহিনী, ট্রাফিক পুলিশ বা হোটেল/ক্যাফেটেরিয়ার সিকিউরিটিতে এই ডিজিটাল আইডি কার্ড প্রদর্শন করুন। পেছনের কিউআর কোড স্ক্যান করে যে কেউ তাৎক্ষণিকভাবে সত্যতা যাচাই করতে পারবেন।
            </p>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex xl:hidden rounded-2xl bg-canvas p-1 border border-line">
          <button
            type="button"
            onClick={() => setActiveTab("pass")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black rounded-xl transition-all select-none touch-manipulation",
              activeTab === "pass"
                ? "bg-white text-emerald-900 shadow-xs ring-1 ring-emerald-500/20"
                : "text-muted-600 hover:text-ink-900"
            )}
          >
            💳 ডিজিটাল স্মার্ট পাস (ID)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("certificate")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black rounded-xl transition-all select-none touch-manipulation",
              activeTab === "certificate"
                ? "bg-white text-amber-900 shadow-xs ring-1 ring-amber-500/20"
                : "text-muted-600 hover:text-ink-900"
            )}
          >
            📜 সম্মাননা সনদ (Certificate)
          </button>
        </div>

        {/* Two-Column Layout: Physical Style ID Card (Left) + Certificate of Service (Right) */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Left: The Tactical Physical Style ID Card */}
          <div
            className={cn(
              "space-y-4 xl:col-span-5",
              activeTab === "pass" ? "block" : "hidden xl:block"
            )}
          >
            <h2 className="text-base font-black text-ink-900">
              ডিজিটাল ভলান্টিয়ার আইডি কার্ড (Smart Pass)
            </h2>

            {/* Realistic Lanyard ID Badge Container */}
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border-4 border-slate-900 bg-white shadow-2xl">
              {/* Lanyard Hole cutout visual */}
              <div className="mx-auto mt-3 h-2 w-14 rounded-full bg-slate-800" />

              {/* ID Card Header */}
              <div className="mt-2 bg-gradient-to-r from-[#02241b] via-[#033629] to-[#011812] px-5 py-4 text-white text-center border-b border-emerald-800/40">
                <p className="text-[10px] font-black tracking-widest uppercase text-emerald-400">
                  গণপ্রজাতন্ত্রী বাংলাদেশ · সিভিক ফুড রেসকিউ
                </p>
                <h3 className="mt-0.5 text-lg font-black tracking-tight text-white">
                  ShareBite BD Volunteer Squad
                </h3>
                <span className="inline-block mt-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                  {profile.squadBadge}
                </span>
              </div>

              {/* ID Card Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Avatar / Photo with verified ring */}
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-500 shadow-md">
                    <div className="grid size-full place-items-center bg-gradient-to-br from-emerald-600 to-teal-800 text-3xl font-black text-white">
                      {displayInitials}
                    </div>
                    <span className="absolute bottom-1 right-1 grid size-5 place-items-center rounded-full bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                  </div>

                  {/* Rider Details */}
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-lg font-black text-ink-900 truncate">
                      {displayName}
                    </h4>
                    <p className="text-xs font-bold text-emerald-700">
                      {profile.squadRank}
                    </p>
                    <p className="text-[11px] text-muted-500 font-mono">
                      আইডি: <strong>{displayId}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      মোবাইল: {displayPhone}
                    </p>
                  </div>
                </div>

                {/* Key metadata grid */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-canvas p-3 text-xs leading-relaxed border border-line">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-500">
                      সংযুক্ত উইং / এলাকা
                    </span>
                    <p className="font-bold text-ink-900 truncate">
                      {displayAffiliation.split("(")[0]}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-500">
                      যানবাহনের বিবরণ
                    </span>
                    <p className="font-bold text-ink-900 truncate">
                      {displayVehicle}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-500">
                      বিএফএসএ লাইসেন্স
                    </span>
                    <p className="font-mono text-[11px] font-bold text-emerald-800 truncate">
                      {profile.bfsaCertificationId}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-500">
                      জরুরি অভিভাবক ফোন
                    </span>
                    <p className="font-bold text-ink-900 truncate">
                      {profile.emergencyContact.split(" ")[0]}
                    </p>
                  </div>
                </div>

                {/* Bottom Barcode & QR Verification */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
                  <div>
                    <p className="font-mono text-[10px] text-muted-400 tracking-wider">
                      ||| | | |||| | ||| || |||| |
                    </p>
                    <p className="font-mono text-[9px] text-muted-500 mt-0.5">
                      AUTH-HASH: 7429-9814-2026-BD
                    </p>
                  </div>

                  <div className="grid size-12 place-items-center rounded-xl bg-canvas border border-line p-1">
                    <QrCode className="size-full text-slate-800" />
                  </div>
                </div>
              </div>

              {/* ID Footer Card */}
              <div className="bg-slate-100 p-2 text-center text-[10px] text-muted-500 font-medium">
                জরুরি রেসকিউ হটলাইন: +৮৮০ ৯৬১২-SHARE
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyVerifyLink}
                className="text-xs font-bold border-line"
              >
                {copiedLink ? "ভেরিফিকেশন লিঙ্ক কপি হয়েছে!" : "অনলাইন ভেরিফিকেশন লিঙ্ক কপি করুন"}
              </Button>
            </div>
          </div>

          {/* Right: Official Certificate of Civic Service */}
          <div
            className={cn(
              "space-y-4 xl:col-span-7",
              activeTab === "certificate" ? "block" : "hidden xl:block"
            )}
          >
            <h2 className="text-base font-black text-ink-900">
              নাগরিক সেবা ও খাদ্য উদ্ধার সম্মাননা সনদ
            </h2>

            <Card className="relative overflow-hidden border-4 border-amber-300/80 bg-gradient-to-b from-[#fdfbf7] via-white to-[#fbf9f4] p-8 shadow-xl">
              {/* Certificate Border Details */}
              <div className="absolute inset-2 border border-amber-400/40 pointer-events-none rounded-xl" />

              <div className="relative z-10 text-center space-y-4">
                {/* Certificate Crest */}
                <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white mx-auto shadow-md">
                  <Award className="size-8" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
                    CERTIFICATE OF CIVIC RECOGNITION
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-ink-900 font-serif">
                    খাদ্য উদ্ধার সম্মাননা সনদ
                  </h3>
                  <p className="text-xs text-muted-600 mt-1">
                    স্মার্ট বাংলাদেশ সিভিক টেক ইনিশিয়েটিভ · শেয়ারবাইট বিডি
                  </p>
                </div>

                <div className="my-6 border-t border-b border-amber-200/70 py-4 max-w-lg mx-auto">
                  <p className="text-xs text-muted-600">গর্বের সাথে প্রত্যয়ন করা যাচ্ছে যে,</p>
                  <p className="mt-2 text-2xl font-black text-emerald-950 font-serif">
                    {displayName}
                  </p>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    {displayAffiliation} · আইডি: {displayId}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-ink-800 max-w-md mx-auto">
                  {profile.totalRescuedMeals > 0 ? (
                    <>
                      ঢাকা শহরের খাদ্য অপচয় রোধে নিষ্ঠার সাথে দায়িত্ব পালন করে{" "}
                      <strong className="text-emerald-900 font-black">
                        {profile.totalRescuedMeals.toLocaleString()}টি উদ্বৃত্ত মিল
                      </strong>{" "}
                      সফলভাবে উদ্ধারপূর্বক এতিমখানা ও সুবিধাবঞ্চিত মানুষের মাঝে পৌঁছে দেওয়ার জন্য এই সম্মাননা প্রদান করা হলো।
                    </>
                  ) : (
                    <>
                      ঢাকা শহরের খাদ্য অপচয় রোধ ও নাগরিক সেবায় যুক্ত হয়ে ভলান্টিয়ার স্কোয়াডের সাথে একাত্মতা প্রকাশের স্বীকৃতিস্বরূপ এই অফিসিয়াল সনদ প্রদান করা হলো।
                    </>
                  )}
                </p>

                {/* Score Summary Box */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">মোট খাবার</p>
                    <p className="text-base font-black text-ink-900 mt-0.5">
                      {profile.totalRescuedMeals}টি
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">অন-টাইম রেটিং</p>
                    <p className="text-base font-black text-ink-900 mt-0.5">
                      {profile.onTimeRate}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">সার্টিফিকেশন</p>
                    <p className="text-xs font-black text-ink-900 mt-0.5">BFSA Level-2</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 max-w-sm mx-auto text-xs">
                  <div className="border-t border-slate-400 pt-1 text-center">
                    <p className="font-bold text-ink-900">রেসকিউ ডিরেক্টর</p>
                    <p className="text-[10px] text-muted-500">শেয়ারবাইট বিডি ঢাকা</p>
                  </div>

                  <div className="border-t border-slate-400 pt-1 text-center">
                    <p className="font-bold text-ink-900">ফুড সেফটি অ্যালায়েন্স</p>
                    <p className="text-[10px] text-muted-500">অডিট কমিটি</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                leftIcon={<Printer className="size-4" />}
                onClick={handlePrint}
                className="w-full sm:flex-1 justify-center font-bold shadow-md shadow-emerald-700/20"
              >
                সনদপত্র প্রিন্ট বা সেভ করুন (PDF)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
