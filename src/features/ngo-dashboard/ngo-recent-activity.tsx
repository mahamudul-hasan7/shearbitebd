"use client";
import {
  Bell,
  ClipboardCheck,
  HandHeart,
  History,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { notificationMessage } from "@/lib/i18n/notification-copy";
import { STATUS_META } from "@/lib/constants/statuses";
import {
  DashboardActivityList,
  DashboardDisclosure,
} from "@/components/dashboard/dashboard-ui";
import type { NGOActivity } from "./types";
const ICONS: Record<NGOActivity["kind"], LucideIcon> = {
  CLAIM: ClipboardCheck,
  NOTIFICATION: Bell,
  REQUEST: Megaphone,
  IMPACT: HandHeart,
};
export function NGORecentActivity({
  activities,
}: {
  activities: NGOActivity[];
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const items = activities.map((activity) => ({
    ...activity,
    icon: ICONS[activity.kind],
    title:
      activity.kind === "IMPACT" && activity.meals !== undefined
        ? tx("{0} meals distributed", activity.meals.toLocaleString(locale))
        : activity.kind === "NOTIFICATION"
          ? tx(activity.title)
          : activity.title,
    description:
      activity.kind === "IMPACT" && activity.beneficiaries !== undefined
        ? tx(
            "{0} recipients recorded in this distribution.",
            activity.beneficiaries.toLocaleString(locale),
          )
        : activity.status
          ? tx("Current status: {0}", tx(STATUS_META[activity.status].label))
          : notificationMessage(tx, {
              title: activity.title,
              message: activity.description,
            }),
  }));
  return (
    <DashboardDisclosure
      title="Recent activity"
      icon={History}
      id="recent-activity"
      data-testid="ngo-activity"
    >
      <DashboardActivityList
        items={items}
        emptyText="No NGO activity has been recorded yet."
      />
    </DashboardDisclosure>
  );
}
