"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { NGO_NOTIFICATION_META, notificationPriorityTone } from "@/features/ngo-account/notification-meta";
import { NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER, formatNgoAccountDate } from "@/features/ngo-account/shared";
import { NotificationType, PriorityLevel } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { asyncState, notificationService, toServiceError, type AsyncState } from "@/services";
import type { Notification } from "@/types/domain";

type Filter = "ALL" | "UNREAD" | "RESCUE" | "NEARBY" | "SYSTEM";

export function NGONotifications() {
  const [state, setState] = useState<AsyncState<Notification[]>>(() => asyncState.loading());
  const [filter, setFilter] = useState<Filter>("ALL");
  const [busyId, setBusyId] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    notificationService.listForUser(NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER, { signal: controller.signal })
      .then((items) => setState(asyncState.success(items)))
      .catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);
  const notifications = useMemo(() => state.data ?? [], [state.data]);
  const unread = notifications.filter((item) => !item.readAt).length;
  const filtered = useMemo(() => notifications.filter((item) => {
    if (filter === "UNREAD") return !item.readAt;
    if (filter === "RESCUE") return [NotificationType.CLAIM, NotificationType.VOLUNTEER, NotificationType.PICKUP, NotificationType.DELIVERY].includes(item.type);
    if (filter === "NEARBY") return item.type === NotificationType.NEARBY_DONATION;
    if (filter === "SYSTEM") return [NotificationType.SYSTEM, NotificationType.IMPACT].includes(item.type);
    return true;
  }), [filter, notifications]);

  async function toggle(item: Notification) {
    setBusyId(item.id);
    try {
      const updated = item.readAt ? await notificationService.markUnread(item.id, NGO_ACCOUNT_VIEWER) : await notificationService.markRead(item.id, NGO_ACCOUNT_VIEWER);
      setState(asyncState.success(notifications.map((entry) => entry.id === updated.id ? updated : entry)));
    } finally { setBusyId(undefined); }
  }

  async function markAll() {
    setBusyId("all");
    try { setState(asyncState.success(await notificationService.markAllRead(NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER))); }
    finally { setBusyId(undefined); }
  }

  const tabs: Array<{ value: Filter; label: string; count: number }> = [
    { value: "ALL", label: "All", count: notifications.length }, { value: "UNREAD", label: "Unread", count: unread },
    { value: "RESCUE", label: "Rescue", count: notifications.filter((item) => [NotificationType.CLAIM, NotificationType.VOLUNTEER, NotificationType.PICKUP, NotificationType.DELIVERY].includes(item.type)).length },
    { value: "NEARBY", label: "Nearby", count: notifications.filter((item) => item.type === NotificationType.NEARBY_DONATION).length },
    { value: "SYSTEM", label: "Impact & system", count: notifications.filter((item) => [NotificationType.SYSTEM, NotificationType.IMPACT].includes(item.type)).length },
  ];

  return <PortalShell role="ngo" activeHref={ROUTES.ngo.notifications} title="Notifications" description="Urgent rescue, volunteer, pickup, delivery, nearby-food, impact, and system updates." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.notifications} unreadNotifications={unread} actions={unread ? <Button variant="outline" size="sm" leftIcon={<CheckCheck className="size-4" />} disabled={busyId === "all"} onClick={markAll}>Mark all read</Button> : undefined}>
    {state.status === "loading" && !state.data && <SkeletonGroup className="grid gap-4" label="Loading NGO notifications">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-32" />)}</SkeletonGroup>}
    {state.status === "error" && !state.data && <EmptyState icon={RefreshCw} title="Notifications could not load" description={state.error.message} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
    {state.data && <div className="grid gap-5"><div role="tablist" aria-label="Notification filters" className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-sm">{tabs.map((tab) => <button key={tab.value} type="button" role="tab" aria-selected={filter === tab.value} onClick={() => setFilter(tab.value)} className={`min-w-max rounded-xl px-4 py-2.5 text-sm font-bold ${filter === tab.value ? "bg-brand-600 text-white" : "text-muted-600 hover:bg-brand-50"}`}>{tab.label} <span className="ml-1 opacity-75">{tab.count}</span></button>)}</div>{filtered.length === 0 ? <EmptyState icon={Bell} title="No updates in this category" description="New matching updates will appear here." /> : <div className="grid gap-3">{filtered.map((item) => { const meta = NGO_NOTIFICATION_META[item.type]; const Icon = meta.icon; return <Card key={item.id} className={`p-5 ${item.readAt ? "bg-surface" : "border-brand-300 bg-brand-50/50"}`}><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge tone={notificationPriorityTone(item.priority)}>{item.priority === PriorityLevel.URGENT ? "Urgent" : meta.label}</Badge>{!item.readAt && <span className="size-2 rounded-full bg-accent-500" aria-label="Unread" />}</div><h2 className="mt-2 font-black text-ink-900">{item.title}</h2><p className="mt-1 text-sm leading-6 text-muted-600">{item.message}</p><p className="mt-2 text-xs font-semibold text-muted-500">{formatNgoAccountDate(item.createdAt)}</p><div className="mt-4 flex flex-wrap gap-4">{item.href && <Link href={item.href} className="text-sm font-black text-brand-700">View details →</Link>}<button type="button" disabled={busyId === item.id} onClick={() => void toggle(item)} className="text-sm font-bold text-muted-600 disabled:opacity-50">Mark {item.readAt ? "unread" : "read"}</button></div></div></div></Card>; })}</div>}</div>}
  </PortalShell>;
}
