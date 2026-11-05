import { Award, Leaf, ShieldCheck, TrendingUp, Utensils } from "lucide-react";
import type { DonorDashboardData } from "@/features/donor-dashboard/types";

export function DonorImpactGrid({ stats }: { stats: DonorDashboardData["stats"] }) {
  const cards = [
    {
      title: "এই মাসের খাদ্য উদ্ধার",
      value: `${stats.mealsRescued.toLocaleString()} প্যাকেট`,
      badge: "+১৮% প্রবৃদ্ধি",
      badgeTone: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
      description: "ক্ষুধার্ত ও সুবিধাবঞ্চিত মানুষের মাঝে সফল বিতরণ",
      icon: Utensils,
      iconTone: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    },
    {
      title: "খাদ্য অপচয় রোধ ও সাশ্রয়",
      value: "৫৮০ কেজি খাদ্য",
      badge: "~৳৪২,০০০ সাশ্রয়",
      badgeTone: "bg-teal-50 text-teal-800 border-teal-200/60",
      description: "ক্যাফেটেরিয়ার উদ্বৃত্ত খাবার নষ্ট হওয়া থেকে রক্ষা",
      icon: Leaf,
      iconTone: "bg-teal-50 text-teal-700 border-teal-200/80",
    },
    {
      title: "ডোনার ট্রাস্ট ও সেফটি স্কোর",
      value: `${stats.donorScore}% (A+ রেটিং)`,
      badge: "BFSA ভেরিফায়েড",
      badgeTone: "bg-amber-50 text-amber-800 border-amber-200/60",
      description: "অন-টাইম পিকআপ ও থার্মাল ফুড সেফটি কমপ্লায়েন্স",
      icon: ShieldCheck,
      iconTone: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 font-heading">
                {card.title}
              </span>
              <span
                className={`grid size-9 place-items-center rounded-xl border shadow-2xs ${card.iconTone}`}
              >
                <Icon className="size-4.5" />
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <p className="text-2xl font-black tracking-tight text-slate-900 font-heading">
                {card.value}
              </p>
              <span
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold font-heading ${card.badgeTone}`}
              >
                {card.badge}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
