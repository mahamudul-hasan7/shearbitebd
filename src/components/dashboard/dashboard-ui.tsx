"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { LiveIconGroup } from "@/components/motion/live-icon";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { cn } from "@/lib/utils";
import styles from "./dashboard.module.css";

export function DashboardSectionHeading({
  id,
  title,
  description,
  href,
  count,
  linkLabel = "View all",
}: {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  count?: number;
  linkLabel?: string;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h2 id={id}>
          {tx(title)}
          {count !== undefined && (
            <span className={styles.count}>
              {count.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}
            </span>
          )}
        </h2>
        {description && <p>{tx(description)}</p>}
      </div>
      {href && (
        <Link href={href}>
          {tx(linkLabel)}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
export function DashboardMetrics({
  columns = 4,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { columns?: 2 | 3 | 4 }) {
  return (
    <LiveIconGroup
      data-columns={columns}
      {...props}
      className={cn(styles.metrics, className)}
    />
  );
}
export function DashboardMetric({
  tone = "brand",
  ...props
}: Omit<Parameters<typeof StatCard>[0], "motion" | "className">) {
  return (
    <StatCard
      {...props}
      tone={tone}
      motion="ambient"
      className={styles.metric}
      data-tone={tone}
    />
  );
}
export function DashboardWorkCard({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <article {...props} className={cn(styles.workCard, className)} />;
}
export function DashboardDisclosure({
  title,
  icon: Icon,
  aside,
  children,
  className,
  ...props
}: {
  title: string;
  icon: LucideIcon;
  aside?: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLDetailsElement>) {
  const tx = useUiText();
  return (
    <details {...props} className={cn(styles.disclosure, className)}>
      <summary>
        <Icon size={18} aria-hidden="true" />
        <span>{tx(title)}</span>
        {aside}
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  );
}
export function DashboardFeedback({
  message,
  onRetry,
  stale = false,
  ...props
}: {
  message?: string;
  onRetry: () => void;
  stale?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  const tx = useUiText();
  return (
    <div {...props} role="alert" className={styles.feedback} data-stale={stale}>
      <span className={styles.feedbackIcon}>
        <RefreshCw size={20} aria-hidden="true" />
      </span>
      <div>
        <h2>
          {tx(
            stale
              ? "Updates are temporarily unavailable"
              : "Dashboard could not load",
          )}
        </h2>
        <p>
          {tx(
            stale
              ? "New updates could not load. Your last saved dashboard is still shown."
              : message || "Please try again.",
          )}
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        {tx("Retry")}
      </Button>
    </div>
  );
}
export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  icon: LucideIcon;
}
export function DashboardActivityList({
  items,
  emptyText,
}: {
  items: DashboardActivityItem[];
  emptyText: string;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const date = new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
  if (!items.length)
    return <p className={styles.emptyActivity}>{tx(emptyText)}</p>;
  return (
    <ol className={styles.activity}>
      {items.map((item) => {
        const Icon = item.icon;
        const at = new Date(item.timestamp);
        const content = (
          <>
            <span className={styles.activityIcon}>
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className={styles.activityCopy}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <time dateTime={item.timestamp}>
                {Number.isFinite(at.getTime())
                  ? date.format(at)
                  : tx("Time unavailable")}
              </time>
            </span>
            {item.href && (
              <ArrowRight
                className={styles.activityArrow}
                size={16}
                aria-hidden="true"
              />
            )}
          </>
        );
        return (
          <li key={item.id}>
            {item.href ? (
              <Link href={item.href}>{content}</Link>
            ) : (
              <div>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
