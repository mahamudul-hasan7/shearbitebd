import { ArrowUpRight, Bell, Leaf, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DashboardActivity } from "@/features/donor-dashboard/types";

function relativeTime(timestamp: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const activityStyles = {
  donation: { icon: PackageCheck, tone: "bg-brand-100 text-brand-700" },
  notification: { icon: Bell, tone: "bg-accent-100 text-accent-600" },
  impact: { icon: Leaf, tone: "bg-success-soft text-success-strong" },
};

export function RecentActivityCard({ activities }: { activities: DashboardActivity[] }) {
  return (
    <Card className="h-full">
      <CardHeader title="Recent activity" description="Latest events across your donor workflow." />
      <CardContent className="grid gap-1 p-2 sm:p-3">
        {activities.map((activity) => {
          const style = activityStyles[activity.kind];
          const Icon = style.icon;
          const content = (
            <>
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${style.tone}`}><Icon className="size-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-ink-900">{activity.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-600">{activity.description}</span>
              </span>
              <span className="shrink-0 text-right"><span className="block text-[11px] font-bold text-muted-400">{relativeTime(activity.timestamp)}</span>{activity.href && <ArrowUpRight className="ml-auto mt-2 size-4 text-brand-600" />}</span>
            </>
          );
          const className = "flex items-start gap-3 rounded-2xl p-3 transition hover:bg-brand-50";
          return activity.href ? <Link key={activity.id} href={activity.href} className={className}>{content}</Link> : <div key={activity.id} className={className}>{content}</div>;
        })}
      </CardContent>
    </Card>
  );
}
