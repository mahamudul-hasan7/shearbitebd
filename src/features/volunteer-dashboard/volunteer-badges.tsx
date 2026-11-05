"use client";

import { Award, CheckCircle2, Flame, ShieldCheck, Sparkles, Star, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";

export function VolunteerBadges() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const badges = [
    {
      titleEn: "Hatirjheel Express Rider",
      titleBn: "হাতিরঝিল এক্সপ্রেস রাইডার",
      descEn: "25+ rapid rescues delivered in under 30 minutes across Dhaka expressways.",
      descBn: "৩০ মিনিটের কম সময়ে ঢাকা এক্সপ্রেসওয়ে দিয়ে ২৫টির বেশি দ্রুত রেসকিউ সম্পন্ন।",
      icon: Flame,
      color: "from-amber-400 to-orange-500",
      tier: "Elite",
    },
    {
      titleEn: "Zero-Spillage Master",
      titleBn: "জিরো-স্পিলেজ মাস্টার",
      descEn: "100% spill-free catering tray transit verified by receiving NGO shelters.",
      descBn: "এনজিওদের দ্বারা শতভাগ নিখুঁত ও অক্ষত খাদ্য পরিবহন স্বীকৃতি প্রাপ্ত।",
      icon: ShieldCheck,
      color: "from-emerald-400 to-teal-600",
      tier: "Certified",
    },
    {
      titleEn: "Night Owl Rescuer",
      titleBn: "নাইট আউল রেসকিউয়ার",
      descEn: "18 successful late-night wedding and banquet recoveries after 10:00 PM.",
      descBn: "রাত ১০টার পর ১৮টি বড় বিয়ে ও কনভেনশন হলের অতিরিক্ত খাবার সফল উদ্ধার।",
      icon: Star,
      color: "from-indigo-400 to-blue-600",
      tier: "Veteran",
    },
    {
      titleEn: "BFSA Hygiene Handler",
      titleBn: "BFSA হাইজিন হ্যান্ডলার",
      descEn: "Certified in Bangladesh Food Safety Authority thermal and sanitary standards.",
      descBn: "বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষের থার্মাল ও স্বাস্থ্যবিধি প্রশিক্ষণপ্রাপ্ত।",
      icon: Award,
      color: "from-purple-400 to-pink-600",
      tier: "Official",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-black text-ink-900 sm:text-xl">
            {isBn ? "স্কোয়াড র‍্যাঙ্কিং ও স্বীকৃতি ব্যাজ" : "Squad Leaderboard & Recognition"}
          </h3>
          <p className="text-xs text-muted-600">
            {isBn
              ? "ঢাকা সিটির স্বেচ্ছাসেবকদের মাঝে আপনার অবস্থান ও বিশেষ অর্জনসমূহ"
              : "Your verified milestones and standing among Dhaka Metro rescue squads"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="warning" className="font-heading font-black">
            <Trophy className="size-3.5 mr-1" />
            {isBn ? "ঢাকা র‍্যাঙ্ক: #০৩" : "Dhaka Rank: #03"}
          </Badge>
          <Badge tone="success">
            {isBn ? "শীর্ষ ৫% রাইডার" : "Top 5% Rider"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <Card
              key={idx}
              className="flex flex-col justify-between overflow-hidden border border-slate-200/90 p-5 transition-all hover:border-brand-500/40 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md`}
                  >
                    <Icon className="size-5.5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700">
                    {b.tier}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading text-sm font-black text-ink-900">
                    {isBn ? b.titleBn : b.titleEn}
                  </h4>
                  <p className="mt-1 text-xs text-muted-600 leading-relaxed">
                    {isBn ? b.descBn : b.descEn}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] font-semibold text-brand-700">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  {isBn ? "অর্জিত হয়েছে" : "Unlocked"}
                </span>
                <span className="text-muted-400 font-mono">+250 pts</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}