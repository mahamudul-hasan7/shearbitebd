"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, CheckCheck, HandHeart, MapPin, PackageCheck, RefreshCw, Truck, UsersRound, type LucideIcon } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { NotificationType, PriorityLevel } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { asyncState, notificationService, profileService, toServiceError, type AsyncState } from "@/services";
import type { Notification } from "@/types/domain";
import { DONOR_USER_ID, DONOR_VIEWER, formatAccountDate, getInitials } from "@/features/donor-account/shared";

type NotificationFilter = "ALL" | "UNREAD" | "URGENT" | "UPDATES";

const TYPE_META: Record<NotificationType, { label: string; icon: LucideIcon }> = {
  [NotificationType.URGENT]: { label: "Urgent", icon: AlertTriangle },
  [NotificationType.CLAIM]: { label: "NGO match", icon: HandHeart },
  [NotificationType.VOLUNTEER]: { label: "Volunteer", icon: UsersRound },
  [NotificationType.PICKUP]: { label: "Pickup", icon: Truck },
  [NotificationType.DELIVERY]: { label: "Delivery", icon: PackageCheck },
  [NotificationType.NEARBY_DONATION]: { label: "Nearby", icon: MapPin },
  [NotificationType.IMPACT]: { label: "Impact", icon: HandHeart },
  [NotificationType.SYSTEM]: { label: "System", icon: Bell },
};

function priorityTone(priority: PriorityLevel): BadgeTone {
  if (priority === PriorityLevel.URGENT) return "danger";
  if (priority === PriorityLevel.HIGH) return "warning";
  if (priority === PriorityLevel.MEDIUM) return "info";
  return "neutral";
}

export function NotificationCenter() {
  const [state, setState] = useState<AsyncState<{ notifications: Notification[]; name: string }>>(() => asyncState.loading());
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [busyId, setBusyId] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      notificationService.listForUser(DONOR_USER_ID, DONOR_VIEWER, { signal: controller.signal }),
      profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, { signal: controller.signal }),
    ]).then(([notifications, profile]) => setState(asyncState.success({ notifications, name: profile.user.displayName }))).catch((error: unknown) => {
      if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [retryKey]);

  const data = state.data;
  const unread = data?.notifications.filter((item) => !item.readAt).length ?? 0;
  const filtered = useMemo(() => data?.notifications.filter((item) => {
    if (filter === "UNREAD") return !item.readAt;
    if (filter === "URGENT") return item.priority === PriorityLevel.URGENT;
    if (filter === "UPDATES") return [NotificationType.CLAIM, NotificationType.VOLUNTEER, NotificationType.PICKUP, NotificationType.DELIVERY].includes(item.type);
    return true;
  }) ?? [], [data?.notifications, filter]);

  async function toggleRead(notification: Notification) {
    setBusyId(notification.id);
    try {
      const updated = notification.readAt
        ? await notificationService.markUnread(notification.id, DONOR_VIEWER)
        : await notificationService.markRead(notification.id, DONOR_VIEWER);
      setState((current) => current.data ? asyncState.success({ ...current.data, notifications: current.data.notifications.map((item) => item.id === updated.id ? updated : item) }) : current);
    } finally {
      setBusyId(undefined);
    }
  }

  async function markAllRead() {
    setBusyId("all");
    try {
      const notifications = await notificationService.markAllRead(DONOR_USER_ID, DONOR_VIEWER);
      setState((current) => current.data ? asyncState.success({ ...current.data, notifications }) : current);
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <PortalShell role="donor" activeHref={ROUTES.donor.notifications} title="Notifications" description="Time-sensitive rescue alerts and account updates in one place." profileName={data?.name ?? "UIU Cafeteria"} profileDescription="Verified food donor" avatarInitials={getInitials(data?.name ?? "UIU Cafeteria")} notificationHref={ROUTES.donor.notifications} unreadNotifications={unread} actions={unread > 0 ? <Button variant="outline" size="sm" leftIcon={<CheckCheck className="size-4" />} disabled={busyId === "all"} onClick={markAllRead}>Mark all read</Button> : undefined}>
      {state.status === "loading" && !data && <SkeletonGroup className="grid gap-4" label="Loading notifications">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-32" />)}</SkeletonGroup>}
      {state.status === "error" && !data && <EmptyState icon={RefreshCw} title="Notifications could not load" description={state.error.message} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
      {data && <div className="grid gap-5">
        <div role="tablist" aria-label="Notification filters" className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-sm">
          {([{"value":"ALL","label":"All","count":data.notifications.length},{"value":"UNREAD","label":"Unread","count":unread},{"value":"URGENT","label":"Urgent","count":data.notifications.filter((item) => item.priority === PriorityLevel.URGENT).length},{"value":"UPDATES","label":"Donation updates","count":data.notifications.filter((item) => [NotificationType.CLAIM, NotificationType.VOLUNTEER, NotificationType.PICKUP, NotificationType.DELIVERY].includes(item.type)).length}] as const).map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={`min-w-max rounded-xl px-4 py-2.5 text-sm font-bold transition ${filter === item.value ? "bg-brand-600 text-white" : "text-muted-600 hover:bg-brand-50"}`}>{item.label} <span className="ml-1 opacity-75">{item.count}</span></button>)}
        </div>
        {filtered.length === 0 ? <EmptyState icon={Bell} title="No notifications here" description="New rescue and account updates matching this filter will appear here." /> : <div className="grid gap-3">{filtered.map((notification) => {
          const meta = TYPE_META[notification.type];
          const Icon = meta.icon;
          return <Card key={notification.id} className={`p-5 transition ${notification.readAt ? "bg-surface" : "border-brand-300 bg-brand-50/50"}`}>
            <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge tone={priorityTone(notification.priority)}>{notification.priority === PriorityLevel.URGENT ? "Urgent" : meta.label}</Badge>{!notification.readAt && <span className="size-2 rounded-full bg-accent-500" aria-label="Unread" />}</div><h2 className="mt-2 font-black text-ink-900">{notification.title}</h2><p className="mt-1 text-sm leading-6 text-muted-600">{notification.message}</p><p className="mt-2 text-xs font-semibold text-muted-500">{formatAccountDate(notification.createdAt)}</p><div className="mt-4 flex flex-wrap gap-2">{notification.href && <Link href={notification.href} className="text-sm font-black text-brand-700 hover:text-brand-900">View details →</Link>}<button type="button" onClick={() => toggleRead(notification)} disabled={busyId === notification.id} className="text-sm font-bold text-muted-600 hover:text-ink-900 disabled:opacity-50">Mark {notification.readAt ? "unread" : "read"}</button></div></div></div>
          </Card>;
        })}</div>}
      </div>}
    </PortalShell>
  );
}
