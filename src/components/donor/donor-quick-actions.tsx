import {
  Building2,
  CircleHelp,
  MapPin,
  PackageSearch,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function DonorQuickActions({ activeDonationId }: { activeDonationId?: string }) {
  const actions = [
    {
      label: "উদ্বৃত্ত খাবার পোস্ট",
      description: "নতুন খাদ্য উদ্ধারের তালিকা তৈরি করুন",
      href: ROUTES.donor.newDonation,
      icon: Plus,
      badge: "নতুন",
      iconTone: "bg-emerald-600 text-white",
    },
    {
      label: "আমার অনুদানসমূহ",
      description: "সকল সক্রিয় ও অতীতের উদ্ধার রেকর্ড",
      href: ROUTES.donor.donations,
      icon: PackageSearch,
      iconTone: "bg-slate-100 text-slate-700",
    },
    {
      label: "পিকআপ শাখা ও ঠিকানা",
      description: "ক্যাফেটেরিয়া ও কিচেন লোকেশন ম্যানেজ",
      href: ROUTES.donor.addresses,
      icon: MapPin,
      iconTone: "bg-slate-100 text-slate-700",
    },
    {
      label: "সহায়তা ও হটলাইন",
      description: "জরুরি উদ্ধার নির্দেশনা ও সাপোর্ট ডেস্ক",
      href: ROUTES.donor.support,
      icon: CircleHelp,
      iconTone: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 font-heading">
              কুইক অ্যাকশন
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রয়োজনীয় কাজ দ্রুত সম্পন্ন করুন
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center justify-between rounded-2xl p-3 border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 shadow-2xs ${action.iconTone}`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 font-heading truncate">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {action.description}
                    </p>
                  </div>
                </div>

                {action.badge && (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/60 shrink-0">
                    {action.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
