"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { ROUTES } from "@/lib/routes";

export default function RoleSelectionPage() {
  return (
    <AuthShell
      title="আপনার প্রাতিষ্ঠানিক ভূমিকা নির্বাচন করুন"
      description="উদ্বৃত্ত খাবার উদ্ধার ও বণ্টনে খাদ্য দাতা, নিবন্ধিত এনজিও এবং ভলান্টিয়ারদের জন্য ডেডিকেটেড ওয়ার্কস্পেস।"
      eyebrow="সিভিক ফুড অনবোর্ডিং"
      contentClassName="max-w-2xl"
    >
      {/* Header Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-heading">
          <span className="font-bold text-slate-500">ধাপ ১ / ৩</span>
          <p className="text-slate-500">
            অ্যাকাউন্ট আছে?{" "}
            <Link
              href={ROUTES.auth.login}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              লগইন করুন
            </Link>
          </p>
        </div>

        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl font-heading">
          আপনি কীভাবে অংশ নেবেন?
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
          আপনার ভূমিকাটি নির্বাচন করে রেজিস্ট্রেশন শুরু করুন।
        </p>
      </div>

      {/* Role Cards Grid (Simple, Clean & Balanced) */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <RoleCard
          title="খাদ্য দাতা"
          subtitle="Food Donor"
          description="ক্যাফেটেরিয়া, রেস্তোরাঁ ও ক্যাটারারদের উদ্বৃত্ত খাবার সহজে দান করুন।"
          href={ROUTES.auth.registerDonor}
          tone="donor"
        />

        <RoleCard
          title="এনজিও ও চ্যারিটি"
          subtitle="NGO / Charity"
          description="নিকটস্থ এলাকার অতিরিক্ত খাবার ক্লেইম করে মানুষের মাঝে বিতরণ করুন।"
          href={ROUTES.auth.registerNgo}
          tone="ngo"
        />

        <RoleCard
          title="ভলান্টিয়ার রাইডার"
          subtitle="Volunteer"
          description="খাবার সংগ্রহ করে দ্রুততম সময়ে নির্ধারিত শেল্টার হোমে পৌঁছে দিন।"
          href={ROUTES.auth.registerVolunteer}
          tone="volunteer"
          badge="ঢাকা মেট্রো"
        />

        <RoleCard
          title="সুপার অ্যাডমিন"
          subtitle="Administrator"
          description="প্ল্যাটফর্ম অডিট, এনজিও যাচাইকরণ ও জাতীয় মনিটরিং পরিচালনা।"
          href="#"
          tone="admin"
          badge="ইনভাইট ওনলি"
          disabled
        />
      </div>

      {/* Minimal Trust Footnote */}
      <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/60 font-normal">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
        <span>BFSA হাইজিন ও সরকারি নিবন্ধন যাচাইকরণের মাধ্যমে খাদ্য নিরাপত্তা নিশ্চিত করা হয়।</span>
      </div>
    </AuthShell>
  );
}
