"use client";

import { ArrowRight, BadgeCheck, CheckCircle2, Navigation, Plus, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DonationWizardResult } from "@/features/donations/types";
import { ROUTES } from "@/lib/routes";

export function DonationConfirmation({
  result,
  addAnother,
}: {
  result: DonationWizardResult;
  addAnother: () => void;
}) {
  const donation = result.donation;

  return (
    <div className="mx-auto max-w-4xl text-center py-4">
      {/* Celebration Icon */}
      <div className="relative mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30">
        <CheckCircle2 className="size-10 stroke-[2.5]" />
        <span className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-amber-400 text-slate-900 shadow-md">
          <Sparkles className="size-4" />
        </span>
      </div>

      <div className="mt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/20 font-heading">
          <BadgeCheck className="size-4 text-emerald-600" />
          খাদ্য অনুদান সফলভাবে তালিকাভুক্ত হয়েছে
        </span>
        <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-4xl font-heading">
          আপনার অতিরিক্ত খাবার এখন লাইভ ফিডে উপলব্ধ!
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
          আপনার পোস্টকৃত খাদ্য তালিকাটি নিকটবর্তী নিবন্ধিত দাতব্য সংস্থা (যেমন: বিদ্যানন্দ, মাস্তুল ফাউন্ডেশন) এবং ঢাকা মেট্রো ভলান্টিয়ার স্কোয়াডের জন্য উন্মুক্ত করা হয়েছে।
        </p>
      </div>

      {/* Summary Card */}
      <div className="mx-auto mt-7 max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 text-left shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 font-heading">রেফারেন্স ট্র্যাকিং আইডি</p>
            <p className="mt-1 font-mono text-sm font-black text-emerald-800">#{donation.id.toUpperCase()}</p>
          </div>
          <StatusBadge status={donation.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 text-xs font-heading">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="text-slate-400 font-bold uppercase text-[10px]">খাদ্যের নাম</p>
            <p className="mt-1 font-black text-slate-900 text-sm truncate">{donation.title}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="text-slate-400 font-bold uppercase text-[10px]">আনুমানিক মিলস</p>
            <p className="mt-1 font-black text-emerald-700 text-sm">{donation.quantity.estimatedMeals} প্যাকেট</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="text-slate-400 font-bold uppercase text-[10px]">পিকআপ জোন</p>
            <p className="mt-1 font-black text-slate-900 text-sm truncate">{donation.pickup.approximateArea}</p>
          </div>
        </div>

        {/* Next steps notice */}
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 text-xs">
          <p className="font-bold text-emerald-900 font-heading">পরবর্তী পদক্ষেপ কী?</p>
          <ol className="mt-2 space-y-1.5 text-slate-600 leading-relaxed">
            <li>১. অনুমোদিত এনজিও খাবারটি ক্লেইম করলে আপনার ড্যাশবোর্ডে ও ফোনে এসএমএস যাবে।</li>
            <li>২. ভলান্টিয়ার রাইডার পিকআপে পৌঁছানোর পর কিউআর কোড বা ওটিপি দিয়ে খাবার হস্তান্তর করবেন।</li>
            <li>৩. খাবার বিতরণ সম্পন্ন হওয়ার পর আপনার প্রোফাইলে স্বয়ংক্রিয় সিএসআর ইমপ্যাক্ট যুক্ত হবে।</li>
          </ol>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={ROUTES.donor.donationTracking(donation.id)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all font-heading"
        >
          <Navigation className="size-4" />
          <span>লাইভ ট্র্যাকিং পেজে যান</span>
        </Link>

        <Link
          href={ROUTES.donor.donations}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors font-heading shadow-2xs"
        >
          আমার খাদ্য তালিকা দেখুন
        </Link>

        <button
          type="button"
          onClick={addAnother}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors font-heading shadow-2xs cursor-pointer"
        >
          <Plus className="size-4" />
          <span>আরেকটি খাবার পোস্ট করুন</span>
        </button>
      </div>
    </div>
  );
}