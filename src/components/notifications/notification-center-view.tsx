"use client";

import { useState } from "react";
import { CheckCheck, RefreshCw, Search, X } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNotificationFeed } from "@/lib/notifications/use-notification-feed";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { notificationMessage } from "@/lib/i18n/notification-copy";
import { ROUTES } from "@/lib/routes";
import type { PortalRole } from "@/types/navigation";
import { NotificationEmpty, NotificationItem } from "./notification-item";
import { useNotificationActions } from "./use-notification-actions";
import styles from "./notifications.module.css";

export function NotificationCenterView({ role, title = "Notifications", description = "Your food-sharing updates, all in one place.", profileName, profileDescription, avatarInitials }: {
  role: PortalRole; title?: string; description?: string; profileName?: string; profileDescription?: string; avatarInitials?: string;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const feed = useNotificationFeed();
  const actions = useNotificationActions();
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const href = role === "donor" ? ROUTES.donor.notifications : role === "ngo" ? ROUTES.ngo.notifications : ROUTES.volunteer.notifications;
  const items = feed.notifications.filter(item => (!unreadOnly || !item.read) && `${tx(item.title)} ${notificationMessage(tx,item)}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale))).sort((a,b) => (Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0));
  const unread = feed.notifications.filter(item => !item.read).length;
  const day = (date: string | Date) => { const value = date instanceof Date ? date : new Date(date); return Number.isNaN(value.getTime()) ? "" : new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(value); };
  const today = day(new Date());
  const groups = [{title:"Today",items:items.filter(item => day(item.createdAt) === today)},{title:"Earlier",items:items.filter(item => day(item.createdAt) !== today)}];
  return <PortalShell role={role} activeHref={href} title={tx(title)} description={tx(description)} compactHeader showDutyPanel={false} titleClassName={styles.pageTitle} profileName={profileName} profileDescription={profileDescription} avatarInitials={avatarInitials} notificationHref={href}>
    <div className={styles.page} data-testid="notification-center">
      <section className={styles.toolbar} aria-label={tx("Notification filters")}>
        <div className={styles.summary}><p className={styles.inboxStatus}>{tx(feed.loading ? "Checking your updates" : feed.error ? "Your notification inbox" : unread ? "{0} unread updates" : "You're all caught up", unread.toLocaleString(locale))}</p><div className={styles.toolbarActions}><button type="button" className={styles.actionButton} disabled={Boolean(actions.busy) || !unread} onClick={() => {void actions.markRead();}}><CheckCheck size={16} aria-hidden="true" />{tx("Mark all read")}</button><button type="button" className={styles.iconButton} aria-label={tx("Refresh")} onClick={feed.refresh}><RefreshCw size={17} aria-hidden="true" /></button></div></div>
        <label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" aria-label={tx("Search notifications")} placeholder={tx("Find a notification")} value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label={tx("Clear notification search")} className={styles.clearSearch} onClick={() => setQuery("")}><X size={17} aria-hidden="true" /></button>}</label>
        <div className={styles.filters}><div className={styles.tabs} role="group" aria-label={tx("Notification filters")}><button type="button" aria-label={tx("All")} aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>{tx("All")}<span aria-hidden="true">{feed.notifications.length.toLocaleString(locale)}</span></button><button type="button" aria-label={tx("Unread")} aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>{tx("Unread")}<span aria-hidden="true">{unread.toLocaleString(locale)}</span></button></div><span className={styles.resultCount} role="status">{!feed.loading && tx("{0} updates",items.length.toLocaleString(locale))}</span></div>
      </section>
      {feed.error && <div role="alert" className={styles.error}><span>{tx(feed.error)}</span><button type="button" onClick={feed.refresh}>{tx("Retry")}</button></div>}
      {actions.error && <div role="alert" className={styles.error}><span>{tx(actions.error)}</span><button type="button" onClick={actions.retry}>{tx("Retry")}</button></div>}
      {feed.loading && <LoadingSpinner label="Loading notifications…" className={styles.loading} />}
      {!feed.loading && !feed.error && !items.length && <NotificationEmpty filtered={Boolean(query.trim())} unreadOnly={unreadOnly} />}
      {groups.filter(group => group.items.length).map(group => <section key={group.title} className={styles.group} aria-label={tx(group.title)}><h2 className={styles.groupTitle}>{tx(group.title)}<span>{group.items.length.toLocaleString(locale)}</span></h2><div className={styles.list}>{group.items.map(item => <NotificationItem key={item.id} item={item} busy={Boolean(actions.busy)} onRead={id => {void actions.markRead(id);}} />)}</div></section>)}
    </div>
  </PortalShell>;
}
