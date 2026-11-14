"use client";

import Link from "next/link";
import { Bell, ClipboardCheck, HandHeart, Megaphone, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { notificationMessage } from "@/lib/i18n/notification-copy";
import { STATUS_META } from "@/lib/constants/statuses";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { NGOActivity } from "./types";

const ICONS:Record<NGOActivity["kind"],LucideIcon> = {CLAIM:ClipboardCheck,NOTIFICATION:Bell,REQUEST:Megaphone,IMPACT:HandHeart};
export function NGORecentActivity({activities}:{activities:NGOActivity[]}) {
  const tx = useUiText();
  const {language} = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  return <Card id="recent-activity"><CardHeader title={tx("Recent activity")} description={tx("Claims, food requests, alerts, and impact records.")} /><CardContent className="grid gap-1 p-2 sm:p-3">{activities.length === 0 ? <p className="p-6 text-center text-sm text-slate-600">{tx("No NGO activity has been recorded yet.")}</p> : activities.map(activity=>{
    const Icon = ICONS[activity.kind];
    const at = new Date(activity.timestamp);
    const title = activity.kind === "IMPACT" && activity.meals !== undefined ? tx("{0} meals distributed",activity.meals.toLocaleString(locale)) : tx(activity.title);
    const description = activity.kind === "IMPACT" && activity.beneficiaries !== undefined ? tx("{0} recipients recorded in this distribution.",activity.beneficiaries.toLocaleString(locale)) : activity.status ? tx("Current status: {0}",tx(STATUS_META[activity.status].label)) : notificationMessage(tx,{title:activity.title,message:activity.description});
    const content = <><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink-900">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span><time className="mt-1.5 block text-[11px] text-slate-600" dateTime={activity.timestamp}>{Number.isFinite(at.getTime()) ? new Intl.DateTimeFormat(locale,{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"}).format(at) : tx("Time unavailable")}</time></span></>;
    return activity.href ? <Link key={activity.id} href={activity.href} className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-brand-50">{content}</Link> : <div key={activity.id} className="flex items-start gap-3 rounded-xl p-3">{content}</div>;
  })}</CardContent></Card>;
}
