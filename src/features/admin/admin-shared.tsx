"use client";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ExecutiveDialog,
  type ExecutiveDialogTone,
} from "@/components/ui/executive-dialog";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import s from "./admin.module.css";

export const labels: Record<string, string> = {
  ACTIVE: "Active",
  BANNED: "Banned",
  DELETED: "Deleted account",
  BAN: "Banned",
  UNBAN: "Unbanned",
  DELETE: "Deleted account",
  PENDING: "Awaiting review",
  NOT_SUBMITTED: "Awaiting documents",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  DONOR: "Donor",
  NGO: "NGO",
  VOLUNTEER: "Volunteer",
  RESERVED: "Reserved",
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked up",
  DELIVERED: "Delivered",
  DISTRIBUTED: "Distributed",
  DISPUTED: "On hold",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  RESUME: "Rescue resumed",
  REJECT_FOOD: "Food rejected",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
  DAMAGED_FOOD: "Damaged food",
  WRONG_QUANTITY: "Wrong quantity",
  LATE_DELIVERY: "Late delivery",
  WRONG_ITEM: "Wrong item",
  SAFETY_CONCERN: "Safety concern",
  OTHER: "Other",
  WALKING: "Walking",
  BICYCLE: "Bicycle",
  MOTORCYCLE: "Motorcycle",
  VAN: "Van",
  CAR: "Car",
  assigned: "Assigned",
  en_route_pickup: "Going to pickup",
  at_pickup: "At pickup",
  cargo_loaded: "Food collected",
  en_route_dropoff: "Going to delivery",
  completed: "Completed",
};
export function Status({ value }: { value: string }) {
  const tx = useUiText();
  const tone = [
    "ACTIVE",
    "UNBAN",
    "VERIFIED",
    "DISTRIBUTED",
    "DELIVERED",
    "RESOLVED",
    "CLOSED",
    "RESUME",
  ].includes(value)
    ? "success"
    : ["BANNED", "DELETED", "BAN", "DELETE", "REJECTED", "DISPUTED", "REJECT_FOOD", "URGENT", "HIGH"].includes(value)
      ? "danger"
      : [
            "PENDING",
            "SUBMITTED",
            "UNDER_REVIEW",
            "MEDIUM",
          ].includes(value)
        ? "warning"
        : "info";
  return (
    <span className={s.badge} data-tone={tone}>
      <i />
      {tx(labels[value] || value)}
    </span>
  );
}
export function useAdminQuery<T>(url: string) {
  const [revision, setRevision] = useState(0);
  const key = `${url}#${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data?: T;
    error?: string;
  }>({ key: "" });
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    const abort = new AbortController();
    fetch(url, { cache: "no-store", signal: abort.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not load the admin workspace.");
        if (!abort.signal.aborted) setResult({ key, data });
      })
      .catch((error) => {
        if (!abort.signal.aborted) setResult({ key, error: error.message });
      });
    return () => abort.abort();
  }, [url, key]);
  useEffect(() => {
    window.addEventListener("sharebite:admin-refresh", refresh);
    return () => window.removeEventListener("sharebite:admin-refresh", refresh);
  }, [refresh]);
  return {
    data: result.key === key ? result.data : undefined,
    error: result.key === key ? result.error : undefined,
    loading: result.key !== key,
    refresh,
  };
}
export function Feedback({
  query,
}: {
  query: { loading: boolean; error?: string; refresh: () => void };
}) {
  const tx = useUiText();
  if (query.loading)
    return (
      <div className={s.feedback} role="status">
        <RefreshCw className={s.spin} size={20} />
        {tx("Loading workspace…")}
      </div>
    );
  if (!query.error) return null;
  return (
    <div className={s.feedback} role="alert">
      <p>{tx(query.error)}</p>
      <Button variant="outline" onClick={query.refresh}>
        {tx("Try again")}
      </Button>
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className={s.empty}>
      <CheckCheck size={28} />
      <p>{children}</p>
    </div>
  );
}
export function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const tx = useUiText();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className={s.pager}>
      <span>{tx("{0} results · Page {1} of {2}", total, page, pages)}</span>
      <div>
        <button
          aria-label={tx("Previous page")}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label={tx("Next page")}
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  busy = false,
  tone = "emerald",
  subtitle,
  badge,
  leading,
  footer,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  tone?: ExecutiveDialogTone;
  subtitle?: ReactNode;
  badge?: ReactNode;
  leading?: ReactNode;
  footer?: ReactNode;
}) {
  const tx = useUiText();
  return (
    <ExecutiveDialog
      open
      title={title}
      eyebrow={tx("Admin review")}
      subtitle={subtitle}
      badge={badge}
      leading={leading}
      tone={tone}
      size="lg"
      busy={busy}
      closeLabel="Close"
      onClose={onClose}
      footer={footer}
    >
      <div className={s.dialogContent}>{children}</div>
    </ExecutiveDialog>
  );
}
export function useAdminDate() {
  const { language } = useLanguage();
  return (value: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date(value));
}
export function Details({
  items,
}: {
  items: [string, string | null | undefined][];
}) {
  const tx = useUiText();
  return (
    <dl className={s.details}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{tx(label)}</dt>
          <dd>{value || tx("Not provided")}</dd>
        </div>
      ))}
    </dl>
  );
}
