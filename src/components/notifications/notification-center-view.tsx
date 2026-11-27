"use client";

import { useState } from "react";
import { CheckCheck, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNotificationFeed } from "@/lib/notifications/use-notification-feed";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
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
  const [unreadOnly, setUnreadOnly] = useState(false);
  const href = role === "donor" ? ROUTES.donor.notifications : role === "ngo" ? ROUTES.ngo.notifications : ROUTES.volunteer.notifications;
  const items = feed.notifications
    .filter(item => !unreadOnly || !item.read)
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  const unread = feed.notifications.filter(item => !item.read).length;
  return <PortalShell role={role} activeHref={href} title={tx(title)} description={tx(description)} compactHeader titleClassName={styles.pageTitle} profileName={profileName} profileDescription={profileDescription} avatarInitials={avatarInitials} notificationHref={href}>
    <div className={styles.page} data-testid="notification-center">
      {feed.error && <div role="alert" className={styles.error}><span>{tx(feed.error)}</span><button type="button" onClick={feed.refresh}>{tx("Retry")}</button></div>}
      {actions.error && <div role="alert" className={styles.error}><span>{tx(actions.error)}</span><button type="button" onClick={actions.retry}>{tx("Retry")}</button></div>}
      <section className={`${styles.inboxShell} liquid-glass-card`} aria-label={tx("Notification filters")}>
        <div className={styles.toolbarBand}>
          <div className={styles.summary}>
            <div className={styles.statusWrap}>
              <span
                aria-hidden="true"
                className={styles.statusDot}
                data-has-unread={unread > 0 ? "true" : "false"}
              />
              <p className={styles.inboxStatus}>
                {tx(
                  feed.loading || feed.refreshing
                    ? "Checking your updates"
                    : feed.error
                      ? "Your notification inbox"
                      : unread
                        ? "{0} unread updates"
                        : "You're all caught up",
                  unread.toLocaleString(locale),
                )}
              </p>
            </div>
            <div className={styles.toolbarActions}>
              <button
                type="button"
                className={styles.actionButton}
                disabled={Boolean(actions.busy) || !unread}
                onClick={() => { void actions.markRead(); }}
              >
                <CheckCheck size={15} aria-hidden="true" />
                <span>{tx("Mark all read")}</span>
              </button>
              <button
                type="button"
                className={`${styles.iconButton} ${feed.refreshing ? styles.spinning : ""}`}
                aria-label={tx("Refresh")}
                title={tx("Refresh")}
                aria-busy={feed.refreshing}
                data-refreshing={feed.refreshing ? "true" : "false"}
                onClick={feed.refresh}
              >
                <RefreshCw size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className={styles.filters}>
            <div className={styles.tabs} role="group" aria-label={tx("Notification filters")}>
              <button type="button" aria-label={tx("All")} aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>
                {tx("All")}
                <span aria-hidden="true">{feed.notifications.length.toLocaleString(locale)}</span>
              </button>
              <button type="button" aria-label={tx("Unread")} aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>
                {tx("Unread")}
                <span aria-hidden="true">{unread.toLocaleString(locale)}</span>
              </button>
            </div>
            <span className={styles.resultCount} role="status">
              {!feed.loading && tx("{0} updates", items.length.toLocaleString(locale))}
            </span>
          </div>
        </div>

        {feed.loading ? (
          <LoadingSpinner label="Loading notifications…" className={styles.loading} />
        ) : !feed.error && !items.length ? (
          <NotificationEmpty unreadOnly={unreadOnly} />
        ) : (
          <div className={styles.feedList}>
            {items.map(item => (
              <NotificationItem
                key={item.id}
                item={item}
                busy={Boolean(actions.busy)}
                onRead={id => { void actions.markRead(id); }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  </PortalShell>;
}
