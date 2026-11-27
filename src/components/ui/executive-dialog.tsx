"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { cn } from "@/lib/utils";

export type ExecutiveDialogTone = "emerald" | "rose" | "amber" | "slate";

const HEADER_TONES: Record<ExecutiveDialogTone, string> = {
  emerald: "from-[#03261d] via-[#064e3b] to-[#021f18]",
  rose: "from-[#2d0f18] via-[#4c1021] to-[#1d080f]",
  amber: "from-[#2b1a09] via-[#4a290b] to-[#1e1005]",
  slate: "from-[#0f172a] via-[#1e293b] to-[#090d16]",
};

const SIZE_CLASSES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
} as const;

const openDialogStack: string[] = [];

export function ExecutiveDialog({
  open = true,
  onClose,
  title,
  subtitle,
  eyebrow,
  badge,
  leading,
  tone = "emerald",
  size = "lg",
  busy = false,
  closeLabel = "বন্ধ করুন",
  zIndexClassName = "z-[80]",
  testId,
  footer,
  children,
}: {
  open?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  badge?: ReactNode;
  leading?: ReactNode;
  tone?: ExecutiveDialogTone;
  size?: keyof typeof SIZE_CLASSES;
  busy?: boolean;
  closeLabel?: string;
  zIndexClassName?: string;
  testId?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const tx = useUiText();
  const stackId = useId();
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    openDialogStack.push(stackId);
    const body = document.body;
    const prevCount = Number(body.dataset.executiveDialogCount || "0");
    if (prevCount === 0) {
      body.dataset.executivePrevOverflow = body.style.overflow;
      body.style.overflow = "hidden";
    }
    body.dataset.executiveDialogCount = String(prevCount + 1);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openDialogStack[openDialogStack.length - 1] !== stackId) return;
      event.preventDefault();
      if (!busy) onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      const index = openDialogStack.lastIndexOf(stackId);
      if (index !== -1) openDialogStack.splice(index, 1);
      const count = Math.max(0, Number(body.dataset.executiveDialogCount || "1") - 1);
      if (count === 0) {
        body.style.overflow = body.dataset.executivePrevOverflow || "";
        delete body.dataset.executivePrevOverflow;
        delete body.dataset.executiveDialogCount;
      } else {
        body.dataset.executiveDialogCount = String(count);
      }
    };
  }, [open, busy, onClose, stackId]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      data-testid={testId}
      onClick={() => {
        if (!busy) onClose();
      }}
      className={cn(
        "fixed inset-0 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in",
        zIndexClassName,
      )}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative flex w-full max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[var(--radius-panel)] border border-white/95 bg-[radial-gradient(circle_at_92%_6%,rgba(16,185,129,0.11),transparent_42%),radial-gradient(circle_at_8%_14%,rgba(56,189,248,0.08),transparent_38%),linear-gradient(165deg,rgba(255,255,255,0.98),rgba(247,251,249,0.96))] text-ink-900 shadow-[0_32px_90px_-16px_rgba(2,24,18,0.52),inset_0_1px_0_rgba(255,255,255,1)]",
          SIZE_CLASSES[size],
        )}
      >
        <header
          className={cn(
            "relative shrink-0 border-b border-white/15 bg-gradient-to-br px-5 py-4 sm:px-6 sm:py-5 text-white",
            HEADER_TONES[tone],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              {leading && (
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/14 text-white shadow-inner ring-1 ring-white/25 backdrop-blur-md">
                  {leading}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {(eyebrow || badge) && (
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {badge}
                    {eyebrow && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/75">
                        {eyebrow}
                      </span>
                    )}
                  </div>
                )}
                <h2
                  id={titleId}
                  className="truncate text-base sm:text-lg font-black tracking-tight text-white"
                >
                  {title}
                </h2>
                {subtitle && (
                  <div
                    id={subtitleId}
                    className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/80"
                  >
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              aria-label={tx(closeLabel)}
              disabled={busy}
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white/85 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {children}
        </div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t border-slate-200/80 bg-white/95 px-5 py-3.5 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
