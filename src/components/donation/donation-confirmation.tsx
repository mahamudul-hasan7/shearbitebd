"use client";
import { LiveIcon } from "@/components/motion/live-icon";
import { useUiText } from "@/lib/i18n/use-ui-text";

import {
  BadgeCheck,
  CheckCircle2,
  Navigation,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
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
  const tx = useUiText();
  const donation = result.donation;

  return (
    <div className="mx-auto max-w-4xl text-center py-4">
      {/* Celebration Icon */}
      <div className="relative mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30">
        <LiveIcon
          icon={CheckCircle2}
          motion="once"
          className="size-10 stroke-[2.5]"
        />
        <span className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-amber-400 text-slate-900 shadow-md">
          <Sparkles className="size-4" />
        </span>
      </div>

      <div className="mt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/20 font-heading">
          <BadgeCheck className="size-4 text-emerald-600" />
          {tx("খাদ্য অনুদান সফলভাবে তালিকাভুক্ত হয়েছে")}
        </span>
        <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-4xl font-heading">
          {tx("আপনার অতিরিক্ত খাবার এখন লাইভ ফিডে উপলব্ধ!")}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
          {tx(
            "Verified NGOs can now find and claim your donation. An available volunteer can accept the rescue after it is claimed.",
          )}
        </p>
      </div>

      {/* Summary Card */}
      <div className="mx-auto mt-7 max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 text-left shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 font-heading">
              {tx("রেফারেন্স ট্র্যাকিং আইডি")}
            </p>
            <p className="mt-1 font-mono text-sm font-black text-emerald-800">
              #{donation.id.toUpperCase()}
            </p>
          </div>
          <StatusBadge status={donation.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 text-xs font-heading">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="text-slate-400 font-bold uppercase text-[10px]">
              {tx("খাদ্যের নাম")}
            </p>
            <p className="mt-1 font-black text-slate-900 text-sm truncate">
              {donation.title}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="text-slate-400 font-bold uppercase text-[10px]">
              {tx("আনুমানিক মিলস")}
            </p>
            <p className="mt-1 font-black text-emerald-700 text-sm">
              {donation.quantity.estimatedMeals} {tx("estimated meals")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <p className="text-slate-400 font-bold uppercase text-[10px]">
              {tx("পিকআপ জোন")}
            </p>
            <p className="mt-1 font-black text-slate-900 text-sm truncate">
              {donation.pickup.approximateArea}
            </p>
          </div>
        </div>

        {/* Next steps notice */}
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 text-xs">
          <p className="font-bold text-emerald-900 font-heading">
            {tx("পরবর্তী পদক্ষেপ কী?")}
          </p>
          <ol className="mt-2 space-y-1.5 text-slate-600 leading-relaxed">
            <li>
              {tx(
                "1. Follow the NGO claim and volunteer assignment on your tracking page and in-app notifications.",
              )}
            </li>
            <li>
              {tx(
                "2. When the assigned volunteer arrives, generate the pickup code on the tracking page and share it at handover.",
              )}
            </li>
            <li>
              {tx(
                "3. The NGO records its receipt and actual distribution before meals are added to the saved impact history.",
              )}
            </li>
          </ol>
        </div>
      </div>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink
          href={ROUTES.donor.donationTracking(donation.id)}
          leftIcon={
            <LiveIcon
              icon={Navigation}
              motion="interaction"
              className="size-4"
            />
          }
        >
          {tx("লাইভ ট্র্যাকিং পেজে যান")}
        </ButtonLink>
        <ButtonLink href={ROUTES.donor.donations} variant="outline">
          {tx("আমার খাদ্য তালিকা দেখুন")}
        </ButtonLink>
        <Button
          variant="outline"
          onClick={addAnother}
          leftIcon={
            <LiveIcon icon={Plus} motion="interaction" className="size-4" />
          }
        >
          {tx("আরেকটি খাবার পোস্ট করুন")}
        </Button>
      </div>
    </div>
  );
}
