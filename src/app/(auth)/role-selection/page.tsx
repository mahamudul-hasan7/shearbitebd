import { Bike, Building2, ShieldCheck, Sparkles, UserRoundCog, UtensilsCrossed } from "lucide-react";
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
      description="উদ্বৃত্ত খাবার উদ্ধার ও সুষ্ঠু বণ্টনের জন্য খাদ্য দাতা, নিবন্ধিত চ্যারিটি এবং ভলান্টিয়ারদের জন্য রয়েছে সুনির্দিষ্ট ডেডিকেটেড ওয়ার্কস্পেস ও লাইভ ট্র্যাকিং ব্যবস্থা।"
      eyebrow="সিভিক ফুড অনবোর্ডিং"
      contentClassName="max-w-3xl"
    >
      {/* Header Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/20 font-heading">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            প্ল্যাটফর্ম ভূমিকা নির্বাচন
          </span>
          <p className="text-xs font-semibold text-slate-500 font-sans">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link
              href={ROUTES.auth.login}
              className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors font-heading underline underline-offset-2 cursor-pointer"
            >
              লগইন করুন →
            </Link>
          </p>
        </div>

        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl font-heading">
          আপনি কী ভূমিকায় অংশ নিতে চান?
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
          আপনার প্রাতিষ্ঠানিক বা ব্যক্তিগত দায়িত্ব অনুযায়ী উপযুক্ত অপশনটি বেছে নিয়ে সহজেই যুক্ত হোন।
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {/* Role 1: Food Donor */}
        <RoleCard
          icon={UtensilsCrossed}
          title="খাদ্য দাতা ও ক্যাটারার্স"
          englishSubtitle="Food Donor / Commercial Kitchen"
          badge="ক্যাফেটেরিয়া ও রেস্তোরাঁ"
          liveStatus="ঢাকা মেট্রো লাইভ"
          description="ক্যাফেটেরিয়া, রেস্তোরাঁ, হোটেল ও ইভেন্টের উদ্বৃত্ত তাজা খাবার ১-ক্লিকে তালিকাভুক্ত করে সহজে দান করুন।"
          features={[
            "১৫-৩০ মিনিটে ভলান্টিয়ার পিকআপ",
            "BFSA হাইজিন ও ডিজিটাল ওটিপি হ্যান্ডওভার",
            "জিরো ফুড-ওয়েস্ট সিভিক স্বীকৃতি সনদ",
          ]}
          ctaText="খাদ্যদাতা হিসেবে যোগ দিন"
          href={ROUTES.auth.registerDonor}
          tone="donor"
        />

        {/* Role 2: NGO / Charity */}
        <RoleCard
          icon={Building2}
          title="এনজিও ও দাতব্য সংস্থা"
          englishSubtitle="NGO & Charity Organization"
          badge="মাস্তুল ও বিদ্যানন্দ নেটওয়ার্ক"
          liveStatus="১২টি সক্রিয় শেল্টার"
          description="নিকটস্থ এলাকার অতিরিক্ত খাবারের লাইভ নোটিফিকেশন পেয়ে ক্লেইম করুন এবং সুবিধাভোগীদের মাঝে বণ্টন করুন।"
          features={[
            "রিয়েলটাইম সারপ্লাস ফুড ফিড ও স্মার্ট ম্যাচ",
            "নিরাপদ ডিজিটাল ওটিপি রিসিভিং ব্যবস্থা",
            "জাতীয় খাদ্য বণ্টন ও সুবিধাভোগী ট্র্যাকিং",
          ]}
          ctaText="এনজিও নিবন্ধন শুরু করুন"
          href={ROUTES.auth.registerNgo}
          tone="ngo"
        />

        {/* Role 3: Volunteer Squad */}
        <RoleCard
          icon={Bike}
          title="ভলান্টিয়ার স্কোয়াড"
          englishSubtitle="Volunteer Rescue Rider"
          badge="ওপেন পাইলট (ঢাকা মেট্রো)"
          liveStatus="৪২ জন রাইডার সক্রিয়"
          description="সাইকেল বা মোটরবাইক নিয়ে স্থানীয় কিচেন থেকে খাবার সংগ্রহ করে দ্রুততম সময়ে শেল্টার হোমে পৌঁছে দিন।"
          features={[
            "নমনীয় এলাকাভিত্তিক রাইড ও লাইভ জিপিএস রুট",
            "খাবার নষ্ট হওয়ার আগেই জরুরি উদ্ধার মিশন",
            "রেসকিউ পয়েন্ট, ব্যাজ ও সম্মাননা সনদ",
          ]}
          ctaText="ভলান্টিয়ার হিসেবে যোগ দিন"
          href={ROUTES.auth.registerVolunteer}
          tone="volunteer"
        />

        {/* Role 4: Super Admin */}
        <RoleCard
          icon={UserRoundCog}
          title="সুপার অ্যাডমিন পোর্টাল"
          englishSubtitle="Civic Governance & Audit"
          badge="ইনভাইট ওনলি"
          liveStatus="সংরক্ষিত গভর্নেন্স"
          description="প্ল্যাটফর্ম নিরাপত্তা, স্বাস্থ্যবিধি অডিট, এনজিও লাইসেন্স যাচাইকরণ ও জাতীয় ডেটা ড্যাশবোর্ড পরিচালনা।"
          features={[
            "এন্ড-টু-এন্ড এনক্রিপ্টেড অডিট ট্রেইল",
            "জাতীয় অপচয় ও খাদ্য বণ্টন অ্যানালিটিক্স",
          ]}
          ctaText="শুধুমাত্র অনুমোদিত অ্যাডমিন"
          href="#"
          tone="admin"
          disabled
        />
      </div>

      {/* Trust & Compliance Banner */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 p-4 text-xs leading-relaxed text-slate-700 font-medium">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 animate-icon-breathe" />
        <div>
          <strong className="block font-bold text-slate-900 font-heading">
            BFSA হাইজিন ও সরকারি এনজিও ব্যুরো কমপ্লায়েন্স নিশ্চয়তা
          </strong>
          প্ল্যাটফর্মের স্বচ্ছতা ও খাদ্য নিরাপত্তা নিশ্চিত করতে প্রতিটি এনজিওর সরকারি নিবন্ধন সনদ ও দাতা প্রতিষ্ঠানের বাণিজ্যিক অনুমোদন কঠোরভাবে যাচাই করা হয়।
        </div>
      </div>
    </AuthShell>
  );
}
