"use client";
import { Bike, Navigation, PackageCheck } from "lucide-react";
import {
  DashboardMetrics,
  DashboardMetric,
  DashboardSectionHeading,
  DashboardWorkCard,
} from "@/components/dashboard/dashboard-ui";
import { ButtonLink } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { getUiLocale } from "@/lib/i18n/locale";
import { ROUTES } from "@/lib/routes";
import type {
  VolunteerMission,
  CompletedMissionRecord,
} from "./volunteer-types";
import { VolunteerDutyPanel } from "./volunteer-duty-panel";

export function RiderDashboardOverview({
  mission,
  history,
  completed,
  available,
}: {
  mission: VolunteerMission | null;
  history: CompletedMissionRecord[];
  completed: number;
  available: number;
}) {
  const tx = useUiText(),
    format = (n: number) => n.toLocaleString(getUiLocale());
  const meals = history
    .filter((item) => item.status === "delivered_verified")
    .reduce((n, item) => n + item.servings, 0);
  const active = mission?.currentStage !== "completed" ? mission : null;
  return (
    <>
      {!active && <VolunteerDutyPanel />}
      <section>
        <DashboardSectionHeading title="Your next mission step" />
        <DashboardWorkCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink-900">
                {active?.foodTitle || tx("Ready for your next rescue")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-600">
                {active
                  ? tx(
                      "Open your saved mission to follow its current stage, contacts and verified handovers.",
                    )
                  : tx(
                      "Turn duty ON and choose an available dispatch. Your assigned mission will appear here.",
                    )}
              </p>
            </div>
            <ButtonLink
              className="shrink-0"
              href={
                active
                  ? ROUTES.volunteer.mission(active.id)
                  : ROUTES.volunteer.dispatches
              }
            >
              {tx(active ? "Continue mission" : "View dispatches")}
            </ButtonLink>
          </div>
        </DashboardWorkCard>
      </section>
      {active && <VolunteerDutyPanel />}
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
    </>
  );
}
