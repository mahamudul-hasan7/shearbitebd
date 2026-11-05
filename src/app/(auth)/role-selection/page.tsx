import { ArrowLeft, Building2, ShieldCheck, UserRoundCog, UsersRound, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "আপনার ভূমিকা নির্বাচন করুন | ShareBite BD",
  description: "খাদ্য দাতা, নিবন্ধিত এনজিও বা স্বেচ্ছাসেবী হিসেবে রেজিস্ট্রেশন করুন।",
};

export default function RoleSelectionPage() {
  return (
    <AuthShell
      title="আপনার প্রাতিষ্ঠানিক ভূমিকা নির্বাচন করুন"
      description="উদ্বৃত্ত খাবার উদ্ধার ও বণ্টনের জন্য খাদ্য দাতা, নিবন্ধিত চ্যারিটি এবং ভলান্টিয়ারদের জন্য রয়েছে সুনির্দিষ্ট ডেডিকেটেড ওয়ার্কস্পেস ও লাইভ ট্র্যাকিং ব্যবস্থা।"
    >
      <Link
        href={ROUTES.auth.login}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors font-heading"
      >
        <ArrowLeft className="size-3.5" /> লগইন পেজে ফিরে যান
      </Link>
      
      <div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/15 font-heading">
          অ্যাকাউন্ট রোল নির্বাচন
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-heading">
          আপনি কীভাবে অংশ নেবেন?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 font-normal">
          আপনার প্রতিষ্ঠান বা ব্যক্তিগত দায়িত্ব অনুযায়ী উপযুক্ত অপশনটি বেছে নিন।
        </p>
      </div>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
        <RoleCard
          icon={UtensilsCrossed}
          title="খাদ্য দাতা"
          bengaliSubtitle="Food Donor"
          description="ক্যাফেটেরিয়া, রেস্তোরাঁ ও বিয়ের মেজবানের উদ্বৃত্ত খাবার পোস্ট ও ডিজিটাল হ্যান্ডওভার করুন।"
          href={ROUTES.auth.registerDonor}
        />
        <RoleCard
          icon={Building2}
          title="এনজিও ও চ্যারিটি"
          bengaliSubtitle="NGO / Charity"
          description="নিকটস্থ এলাকার অতিরিক্ত খাবার ক্লেইম করুন এবং মানুষের মাঝে সুশৃঙ্খলভাবে বিতরণ করুন।"
          href={ROUTES.auth.registerNgo}
          tone="blue"
        />
        <RoleCard
          icon={UsersRound}
          title="ভলান্টিয়ার স্কোয়াড"
          bengaliSubtitle="Volunteer Squad"
          description="স্থানীয় এলাকায় খাবার সংগ্রহ ও এনজিও কিচেনে পৌঁছে দেওয়ার লজিস্টিক্সে সাহায্য করুন।"
          href={ROUTES.auth.registerVolunteer}
          tone="accent"
          badge="ওপেন পাইলট"
        />
        <RoleCard
          icon={UserRoundCog}
          title="সুপার অ্যাডমিন"
          bengaliSubtitle="Administrator"
          description="প্ল্যাটফর্ম নিরাপত্তা অডিট, এনজিও যাচাইকরণ ও জাতীয় ডেটা ড্যাশবোর্ড পরিচালনা।"
          href="#"
          tone="purple"
          disabled
          badge="ইনভাইট ওনলি"
        />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-500 font-normal">
        <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />
        <p>প্ল্যাটফর্মের স্বচ্ছতা ও খাদ্য নিরাপত্তা নিশ্চিত করতে এনজিওদের সরকারি নিবন্ধন ও দাতা প্রতিষ্ঠানের বাণিজ্যিক অনুমোদন যাচাই করা হয়।</p>
      </div>

      <p className="mt-6 text-center text-xs sm:text-sm text-slate-600 font-medium">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link href={ROUTES.auth.login} className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors font-heading">
          লগইন করুন
        </Link>
      </p>
    </AuthShell>
  );
}
