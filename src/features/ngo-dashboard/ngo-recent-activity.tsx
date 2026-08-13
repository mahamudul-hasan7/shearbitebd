import Link from "next/link";
import { Bell, ClipboardCheck, HandHeart, Megaphone, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { NGOActivity } from "@/features/ngo-dashboard/types";

const ICONS: Record<NGOActivity["kind"], LucideIcon> = { CLAIM: ClipboardCheck, NOTIFICATION: Bell, REQUEST: Megaphone, IMPACT: HandHeart };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function NGORecentActivity({ activities }: { activities: NGOActivity[] }) {
  return <Card id="recent-activity"><CardHeader title="Recent activity" description="Claims, food requests, alerts, and impact records." /><CardContent className="grid gap-1 p-2 sm:p-3">{activities.length === 0 ? <p className="p-6 text-center text-sm text-muted-600">No NGO activity has been recorded yet.</p> : activities.map((activity) => {
    const Icon = ICONS[activity.kind];
    const content = <><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-ink-900">{activity.title}</span><span className="mt-1 block text-xs leading-5 text-muted-600">{activity.description}</span><span className="mt-1.5 block text-[11px] font-semibold text-muted-500">{formatDate(activity.timestamp)}</span></span></>;
    return activity.href ? <Link key={activity.id} href={activity.href} className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-brand-50">{content}</Link> : <div key={activity.id} className="flex items-start gap-3 rounded-2xl p-3">{content}</div>;
  })}</CardContent></Card>;
}
