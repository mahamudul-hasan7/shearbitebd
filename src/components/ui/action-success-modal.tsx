"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Check, Sparkles, X, Trophy, HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";

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

function playSuccessChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic 3-note major chord (C5, E5, G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.09, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  } catch {
    // Non-blocking
  }
}

// Decorative floating confetti micro-particles
const PARTICLES = [
  { top: "15%", left: "18%", color: "bg-emerald-400", size: "w-2.5 h-2.5", delay: "delay-75" },
  { top: "20%", right: "20%", color: "bg-amber-400", size: "w-2 h-3 rotate-45", delay: "delay-100" },
  { top: "35%", left: "10%", color: "bg-teal-400", size: "w-2 h-2 rounded-full", delay: "delay-150" },
  { top: "30%", right: "12%", color: "bg-emerald-500", size: "w-3 h-1.5 rotate-12", delay: "delay-200" },
  { bottom: "25%", left: "15%", color: "bg-amber-300", size: "w-2 h-2 rotate-45", delay: "delay-100" },
  { bottom: "20%", right: "18%", color: "bg-teal-500", size: "w-2 h-2 rounded-full", delay: "delay-150" },
];

export function ActionSuccessModal() {
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
        playSuccessChime();

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
      {/* Celebration Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, idx) => (
          <span
            key={idx}
            style={{ top: p.top, left: p.left, right: p.right, bottom: p.bottom }}
            className={cn(
              "absolute rounded-xs shadow-xs animate-ping opacity-75 duration-1000",
              p.color,
              p.size,
              p.delay
            )}
          />
        ))}
      </div>

      {/* Main Card */}
      <div
        className="relative w-full max-w-sm sm:max-w-md rounded-3xl border border-emerald-500/30 bg-white p-7 sm:p-8 shadow-2xl text-center animate-popup-pop z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="size-4" />
        </button>

        {/* Top Animated Checkmark Circle */}
        <div className="mx-auto mb-4 flex size-20 items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-emerald-100/70 animate-pulse-ring" />
          
          {isComplete ? (
            <div className="grid size-18 place-items-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-100">
              <Trophy className="size-9 animate-bounce" />
            </div>
          ) : isClaim ? (
            <div className="grid size-18 place-items-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-100">
              <HandHeart className="size-9 animate-icon-breathe" />
            </div>
          ) : (
            <svg
              className="size-18 drop-shadow-md"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="animate-stroke-circle"
                cx="26"
                cy="26"
                r="25"
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                className="animate-stroke-check"
                d="M14 27l8 8 16-16"
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
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
