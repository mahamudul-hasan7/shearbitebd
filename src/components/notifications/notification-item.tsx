"use client";

import Link from "next/link";
import { ArrowUpRight, Bell, BellOff, Bike, Check, CheckCheck, CircleAlert, HeartHandshake, PackageCheck, PackageOpen, Sprout, Utensils } from "lucide-react";
import type { MouseEvent } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { notificationMessage } from "@/lib/i18n/notification-copy";
import type { RealNotification } from "@/lib/notifications/real-notification-client";
import styles from "./notifications.module.css";
import { LiveIcon, type LiveIconMotion } from "@/components/motion/live-icon";

export function NotificationIcon({ type, motion="interaction" }: { type: string; motion?:LiveIconMotion }) {
  const Icon = ({ URGENT: CircleAlert, CLAIM: HeartHandshake, VOLUNTEER: Bike, PICKUP: PackageOpen, DELIVERY: PackageCheck, NEARBY_DONATION: Utensils, IMPACT: Sprout } as Record<string, typeof Bell>)[type] || Bell;
  return <span className={styles.noticeIcon} data-type={type}><LiveIcon icon={Icon} motion={motion} size={20} strokeWidth={1.7} /></span>;
}

export function NotificationItem({ item, compact = false, fallbackHref, busy, onRead, onNavigate }: {
  item: RealNotification; compact?: boolean; fallbackHref?: string; busy?: boolean;
  onRead: (id: string) => void; onNavigate?: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const date = new Date(item.createdAt);
  const dateText = Number.isNaN(date.getTime()) ? tx("Time unavailable") : new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date);
  const href = item.href || fallbackHref;
  return <article className={`${styles.item} ${compact ? styles.compactItem : ""}`} data-notification-id={item.id} data-unread={!item.read}>
    <NotificationIcon type={item.type} />
    <div className={styles.itemBody}>
      <h3>{href ? <Link href={href} onClick={(event) => onNavigate?.(event, href)}>{tx(item.title)}<ArrowUpRight size={13} aria-hidden="true" /></Link> : tx(item.title)}</h3>
      <p className={styles.message}>{notificationMessage(tx, item)}</p>
      <div className={styles.itemMeta}><time dateTime={item.createdAt}>{dateText}</time>{item.type === "URGENT" && <span className={styles.urgentLabel}>{tx("Urgent")}</span>}
        {!item.read ? <button type="button" className={styles.readButton} aria-label={tx("Mark read")} title={tx("Mark read")} disabled={busy} onClick={() => onRead(item.id)}><Check size={16} aria-hidden="true" />{!compact && <span>{tx("Mark read")}</span>}</button> : <span className={styles.readLabel} title={tx("Read")}><CheckCheck size={15} aria-hidden="true" /><span className="sr-only">{tx("Read")}</span></span>}
      </div>
    </div>
    {!item.read && <span className={styles.unreadDot} aria-label={tx("Unread")} />}
  </article>;
}

export function NotificationEmpty({ filtered = false, unreadOnly = false }: { filtered?: boolean; unreadOnly?: boolean }) {
  const tx = useUiText();
  return <div className={styles.empty} role="status"><span><BellOff size={27} strokeWidth={1.5} aria-hidden="true" /></span><h3>{tx(filtered ? "No matching updates" : unreadOnly ? "You're all caught up" : "No notifications yet.")}</h3><p>{tx(filtered ? "Try another search or switch to all updates." : unreadOnly ? "New unread updates will appear here." : "Updates about your food-sharing activity will appear here.")}</p></div>;
}
