"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState, useCallback, useRef } from "react";
import { Check, CheckCircle2, Sparkles, X, HandHeart, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveIcon } from "@/components/motion/live-icon";
import motionStyles from "@/components/motion/live-icon.module.css";

export interface CelebrationPayload {
  title: string;
  message: string;
  badge?: string;
  actionLabel?: string;
  type?: "SUCCESS" | "COMPLETE" | "DONE" | "CLAIM";
}

export function triggerCelebration(payload: CelebrationPayload) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("sharebite:celebration", { detail: payload })
    );
  }
}

export function ActionSuccessModal() {
  const tx = useUiText();
  const [data, setData] = useState<CelebrationPayload | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const close = useCallback(() => {
    setData(null);
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<CelebrationPayload>;
      if (customEvent.detail) {
        setData(customEvent.detail);

        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
        }
        // Auto-dismiss after 5 seconds
        autoCloseTimerRef.current = setTimeout(() => {
          setData(null);
        }, 5000);
      }
    };

    window.addEventListener("sharebite:celebration", handleEvent);
    return () => {
      window.removeEventListener("sharebite:celebration", handleEvent);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  if (!data) return null;

  const isComplete = data.type === "COMPLETE";
  const isClaim = data.type === "CLAIM";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      {/* Main Card */}
      <div
        className={cn("relative w-full max-w-sm sm:max-w-md rounded-3xl border border-emerald-500/30 bg-white p-7 sm:p-8 shadow-2xl text-center z-10",motionStyles.successPanel)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={tx("বন্ধ করুন")}
        >
          <X className="size-4" />
        </button>

        <div className={cn("mx-auto mb-4 grid size-20 place-items-center rounded-3xl",isComplete ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
          <LiveIcon key={data.title} icon={isClaim ? PackageCheck : isComplete ? HandHeart : CheckCircle2} motion="once" className="size-11" strokeWidth={1.7} />
        </div>

        {/* Optional Badge */}
        {data.badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 font-heading ring-1 ring-emerald-600/20 mb-2">
            <Sparkles className="size-3 text-emerald-600" />
            {data.badge}
          </span>
        )}

        {/* Heading Title */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-tight tracking-tight">
          {data.title}
        </h3>

        {/* Description Message */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
          {data.message}
        </p>

        {/* Bottom Done Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 active:scale-98 transition-all font-heading cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="size-4 stroke-[3]" />
            <span>{data.actionLabel || "ঠিক আছে, সম্পন্ন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
