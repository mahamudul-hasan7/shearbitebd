"use client";

import Link from "next/link";
import { ArrowRight, Award, Leaf, Scale, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/language-context";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import type { DonorDashboardData } from "@/features/donor-dashboard/types";
import type { ImpactRecord } from "@/types/domain";

export function DonorImpactSummaryCard({
  stats,
  records,
}: {
  stats: DonorDashboardData["stats"];
  records: ImpactRecord[];
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = getUiLocale();
  const isBn = language === "bn";

  const totalWeightKg = records.reduce((sum, r) => sum + (r.foodWeightKg || 0), 0);
  const totalCo2Kg = records.reduce((sum, r) => sum + (r.estimatedCo2PreventedKg || 0), 0);
  const formatDecimal = (value: number) =>
    value.toLocaleString(locale, { maximumFractionDigits: 1 });

  return (
    <Card className="h-full border-white/80">
      <CardHeader
        title={tx("Impact & CSR summary")}
        description={tx("CSR audit certificates ready")}
        action={
          <Link
            href={ROUTES.donor.ngos}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            <span>{tx("View partner NGOs")}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <CardContent className="grid gap-3">
        <div className="liquid-glass-tile flex items-center justify-between rounded-2xl p-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tx("Food rescued (kg)")}
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-slate-900">
              {formatDecimal(totalWeightKg)} {isBn ? "কেজি" : "kg"}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-800 ring-1 ring-emerald-300/50">
            <Scale className="size-5" />
          </span>
        </div>

        <div className="liquid-glass-tile flex items-center justify-between rounded-2xl p-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tx("CO₂e prevented (kg)")}
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-slate-900">
              {formatDecimal(totalCo2Kg)} {isBn ? "কেজি" : "kg"}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 text-teal-800 ring-1 ring-teal-300/50">
            <Leaf className="size-5" />
          </span>
        </div>

        <div className="liquid-glass-tile flex items-center justify-between rounded-2xl p-4">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {tx("Donor score")}
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-emerald-800">
              {stats.donorScore.toLocaleString(locale)} / {(100).toLocaleString(locale)}
            </p>
            {stats.donorScoreDescription && (
              <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                {tx(stats.donorScoreDescription)}
              </p>
            )}
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400/25 to-emerald-500/20 text-emerald-900 ring-1 ring-emerald-300/50">
            <Award className="size-5" />
          </span>
        </div>

        <Link
          href={ROUTES.donor.donations}
          className="liquid-glass-pill flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-white/90"
        >
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            {tx("All donations")}
          </span>
          <ArrowRight className="size-3.5 text-emerald-700" />
        </Link>
      </CardContent>
    </Card>
  );
}
