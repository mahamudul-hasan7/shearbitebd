"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, CheckCheck, X } from "lucide-react";
import { NotificationEmpty, NotificationItem } from "@/components/notifications/notification-item";
import { useNotificationActions } from "@/components/notifications/use-notification-actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNotificationFeed } from "@/lib/notifications/use-notification-feed";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { PortalRole } from "@/types/navigation";
import styles from "@/components/notifications/notifications.module.css";
import { LiveIcon } from "@/components/motion/live-icon";

export function NotificationPopover({ notificationHref, className }: { role: PortalRole; notificationHref: string; className?: string }) {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const router = useRouter();
  const feed = useNotificationFeed();
  const actions = useNotificationActions();
  const [state, setState] = useState<"closed" | "open" | "closing">("closed");
  const mounted = state !== "closed";
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const motions = useRef<Animation[]>([]);
  const closing = useRef(false);
  const unread = feed.notifications.filter(item => !item.read).length;
  const items = [...feed.notifications].sort((a,b) => (Date.parse(b.createdAt)||0) - (Date.parse(a.createdAt)||0)).slice(0,6);

  async function close() {
    const current = dialog.current;
    if (!current?.open || closing.current) return false;
    closing.current = true; setState("closing");
    const elements = [backdrop.current, panel.current].filter((e): e is HTMLButtonElement | HTMLDivElement => Boolean(e));
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const starts = elements.map(e => ({ opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform }));
      motions.current.forEach(a => a.cancel());
      motions.current = elements.map((e,index) => e.animate([starts[index], { opacity:0, transform:index === 1 ? "translateY(-8px) scale(.985)" : "none" }], { duration:160, easing:"ease-in", fill:"forwards" }));
      await Promise.allSettled(motions.current.map(a => a.finished));
    }
    if (dialog.current !== current || !current.open) return false;
    current.close(); setState("closed"); return true;
  }
  async function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); if (await close()) router.push(href);
  }
  useEffect(() => {
    if (!mounted) return;
    const current = dialog.current;
    const opener = trigger.current;
    const previous = document.body.style.overflow;
    closing.current = false;
    const position = () => {
      const box = opener?.getBoundingClientRect();
      current?.style.setProperty("--notice-right", `${Math.max(12, innerWidth - (box?.right || innerWidth - 16))}px`);
      current?.style.setProperty("--notice-top", `${Math.min((box?.bottom || 64) + 12, innerHeight - 140)}px`);
    };
    position(); current?.showModal(); document.body.style.overflow = "hidden";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (panel.current) motions.current.push(panel.current.animate([{ opacity:0, transform:"translateY(-10px) scale(.985)" },{ opacity:1, transform:"translateY(0) scale(1)" }], { duration:200, easing:"cubic-bezier(.16,1,.3,1)", fill:"both" }));
      if (backdrop.current) motions.current.push(backdrop.current.animate([{opacity:0},{opacity:1}],{duration:180,fill:"both"}));
    }
    window.addEventListener("resize", position);
    return () => {
      window.removeEventListener("resize", position); motions.current.forEach(a => a.cancel()); motions.current = [];
      current?.close(); document.body.style.overflow = previous; closing.current = false; opener?.focus({preventScroll:true});
    };
  }, [mounted]);

  return <div className={className}>
    <button ref={trigger} type="button" aria-label={tx("Open notifications")} aria-expanded={state === "open"} aria-controls={id} aria-haspopup="dialog" onClick={() => setState("open")} className={styles.trigger}>
      <LiveIcon icon={Bell} signal={feed.loading ? undefined : items[0]?.id || "empty"} size={19} strokeWidth={1.7} />{unread > 0 && <span aria-label={tx("{0} unread notifications", unread.toLocaleString(locale))} className={styles.counter}>{unread > 99 ? `${(99).toLocaleString(locale)}+` : unread.toLocaleString(locale)}</span>}
    </button>
    {mounted && <dialog id={id} ref={dialog} className={styles.dialog} aria-label={tx("Notifications")} data-state={state} onCancel={event => {event.preventDefault(); void close();}}>
      <button ref={backdrop} type="button" tabIndex={-1} className={styles.backdrop} aria-label={tx("Close notifications")} onClick={() => {void close();}} />
      <div ref={panel} className={styles.panel}>
        <div className={styles.popupHeader}><h2>{tx("Notifications")}{unread > 0 && <span className={styles.headerCount} aria-label={tx("{0} unread notifications",unread.toLocaleString(locale))}>{unread.toLocaleString(locale)}</span>}</h2><div className={styles.popupHeaderActions}><button type="button" className={styles.iconButton} aria-label={tx("Mark all read")} title={tx("Mark all read")} disabled={Boolean(actions.busy) || !unread} onClick={() => {void actions.markRead();}}><CheckCheck size={19} aria-hidden="true" /></button><button type="button" autoFocus className={styles.iconButton} aria-label={tx("Close notifications")} onClick={() => {void close();}}><X size={20} aria-hidden="true" /></button></div></div>
        <div className={styles.popupList}>
          {feed.error && <div role="alert" className={styles.error}><span>{tx(feed.error)}</span><button type="button" onClick={feed.refresh}>{tx("Retry")}</button></div>}
          {actions.error && <div role="alert" className={styles.error}><span>{tx(actions.error)}</span><button type="button" onClick={actions.retry}>{tx("Retry")}</button></div>}
          {feed.loading && <LoadingSpinner label="Loading notifications…" className={styles.loading} />}
          {!feed.loading && !feed.error && items.length === 0 && <NotificationEmpty />}
          {items.map(item => <NotificationItem key={item.id} item={item} compact fallbackHref={notificationHref} busy={Boolean(actions.busy)} onRead={id => {void actions.markRead(id);}} onNavigate={(event,href) => {void navigate(event,href);}} />)}
        </div>
        <div className={styles.popupFooter}><Link href={notificationHref} onClick={event => {void navigate(event,notificationHref);}}>{tx("View all notifications")}<ArrowRight size={17} aria-hidden="true" /></Link></div>
      </div>
    </dialog>}
  </div>;
}
