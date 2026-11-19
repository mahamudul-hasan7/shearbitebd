"use client";
import { Bell, Leaf, PackageCheck } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { DashboardActivity } from "@/features/donor-dashboard/types";
import { DashboardActivityList } from "@/components/dashboard/dashboard-ui";
const icons = { donation: PackageCheck, notification: Bell, impact: Leaf };
export function RecentActivityCard({
  activities,
}: {
  activities: DashboardActivity[];
}) {
  const tx = useUiText();
  return (
    <DashboardActivityList
      items={activities.map((activity) => ({
        ...activity,
        icon: icons[activity.kind],
        description: tx(activity.description),
      }))}
      emptyText="No donor activity has been recorded yet."
    />
  );
}
