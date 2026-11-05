import { ArrowUpRight, Bell, Leaf, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DashboardActivity } from "@/features/donor-dashboard/types";

function relativeTime(timestamp: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 60_000));
  if (minutes < 1) return "এইমাত্র";
  if (minutes < 60) return `${minutes} মি. আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  return `${Math.floor(hours / 24)} দিন আগে`;
}

const activityStyles = {
  donation: { icon: PackageCheck, tone: "bg-emerald-100 text-emerald-800" },
  notification: { icon: Bell, tone: "bg-amber-100 text-amber-800" },
  impact: { icon: Leaf, tone: "bg-teal-100 text-teal-800" },
};

export function RecentActivityCard({ activities }: { activities: DashboardActivity[] }) {
  return (
    <Card className="h-full border-slate-200/90 shadow-xs">
      <CardHeader
        title="সাম্প্রতিক কার্যক্রম ও অডিট"
        description="আপনার অনুদানের সর্বশেষ স্ট্যাটাস পরিবর্তন, ভলান্টিয়ার পিকআপ ও নোটিফিকেশন।"
      />
      <CardContent className="grid gap-1.5 p-2 sm:p-3">
        {activities.map((activity) => {
          const style = activityStyles[activity.kind];
          const Icon = style.icon;
          const content = (
            <>
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${style.tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-ink-900 font-heading">{activity.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-600">{activity.description}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[11px] font-bold text-muted-400 font-mono">{relativeTime(activity.timestamp)}</span>
                {activity.href && <ArrowUpRight className="ml-auto mt-2 size-4 text-emerald-600" />}
              </span>
            </>
          );
          const className = "flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-emerald-50/70";
          return activity.href ? (
            <Link key={activity.id} href={activity.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={activity.id} className={className}>
              {content}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
