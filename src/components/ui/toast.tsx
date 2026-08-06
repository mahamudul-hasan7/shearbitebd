"use client";

import { CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export function Toast({
  title,
  description,
  tone = "success",
  triggerLabel = "Show toast",
  defaultOpen = false,
  autoDismissMs,
}: {
  title: string;
  description?: string;
  tone?: "success" | "info";
  triggerLabel?: string;
  defaultOpen?: boolean;
  autoDismissMs?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = tone === "success" ? CheckCircle2 : Info;

  useEffect(() => {
    if (!open || !autoDismissMs) return;
    const timer = window.setTimeout(() => setOpen(false), autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, open]);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>{triggerLabel}</Button>
      {open && (
        <div role="status" aria-live="polite" className={cn("fixed bottom-24 right-4 z-[70] flex w-[min(calc(100%-2rem),24rem)] items-start gap-3 rounded-2xl border bg-white p-4 shadow-dialog lg:bottom-6", tone === "success" ? "border-success/25" : "border-info/25")}>
          <Icon className={cn("mt-0.5 size-5 shrink-0", tone === "success" ? "text-success" : "text-info")} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink-900">{title}</p>
            {description && <p className="mt-1 text-sm leading-6 text-muted-600">{description}</p>}
          </div>
          <IconButton label="Dismiss notification" onClick={() => setOpen(false)} className="size-9 shrink-0 border-0 shadow-none"><X className="size-4" /></IconButton>
        </div>
      )}
    </>
  );
}
