"use client";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { DonorDashboardData } from "@/features/donor-dashboard/types";
import { HandHeart, Package, UsersRound } from "lucide-react";
import {
  DashboardMetric,
  DashboardMetrics,
} from "@/components/dashboard/dashboard-ui";

export function DonorImpactGrid({
  stats,
}: {
  stats: DonorDashboardData["stats"];
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  return (
    <DashboardMetrics columns={3} data-testid="donor-impact">
      <DashboardMetric
        label={tx("Meals distributed")}
        value={stats.mealsRescued.toLocaleString(
          language === "bn" ? "bn-BD" : "en-BD",
        )}
        icon={HandHeart}
        badge={tx("All time")}
        helper={tx("From saved distribution records.")}
        tone="brand"
        data-stat="meals"
      />
      <DashboardMetric
        label={tx("Food posts")}
        value={stats.totalDonations.toLocaleString(
          language === "bn" ? "bn-BD" : "en-BD",
        )}
        icon={Package}
        badge={tx("All time")}
        helper={tx("All your saved food posts.")}
        tone="info"
        data-stat="posts"
      />
      <DashboardMetric
        label={tx("NGOs supported")}
        value={stats.ngosHelped.toLocaleString(
          language === "bn" ? "bn-BD" : "en-BD",
        )}
        icon={UsersRound}
        badge={tx("All time")}
        helper={tx("NGOs with recorded distributions.")}
        tone="success"
        data-stat="ngos"
      />
    </DashboardMetrics>
  );
}
