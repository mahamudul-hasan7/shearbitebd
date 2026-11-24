"use client";
import { Bike, Navigation, PackageCheck } from "lucide-react";
import {
  DashboardMetrics,
  DashboardMetric,
  DashboardSectionHeading,
} from "@/components/dashboard/dashboard-ui";
import { getUiLocale } from "@/lib/i18n/locale";
import type { CompletedMissionRecord } from "./volunteer-types";

export function RiderDashboardOverview({
  history,
  completed,
  available,
}: {
  history: CompletedMissionRecord[];
  completed: number;
  available: number;
}) {
  const format = (n: number) => n.toLocaleString(getUiLocale());
  const meals = history
    .filter((item) => item.status === "delivered_verified")
    .reduce((n, item) => n + item.servings, 0);
  return (
    <section>
      <DashboardSectionHeading
        title="Your contribution"
        description="Saved delivery records and currently available work."
      />
      <DashboardMetrics columns={3} data-testid="rider-impact">
        <DashboardMetric
          label="Verified deliveries"
          value={format(completed)}
          icon={Bike}
        />
        <DashboardMetric
          label="Meals distributed"
          data-stat="meals"
          value={format(meals)}
          helper="From saved NGO distribution records for your verified deliveries."
          icon={PackageCheck}
        />
        <DashboardMetric
          label="Available dispatches"
          value={format(available)}
          icon={Navigation}
        />
      </DashboardMetrics>
    </section>
  );
}
