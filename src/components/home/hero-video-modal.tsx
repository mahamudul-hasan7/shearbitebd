"use client";

import { useEffect } from "react";
import { ArrowDown, PlayCircle, X } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";

// Swap this single YouTube video ID anytime when uploading a custom ShareBite BD walkthrough.
export const DEMO_YOUTUBE_VIDEO_ID = "6rXSQhWjzSg";

export function HeroVideoModal({
  open,
  onClose,
  stepsHref = "#how-it-works",
}: {
  open: boolean;
  onClose: () => void;
  stepsHref?: string;
}) {
  const tx = useUiText();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tx("How ShareBite Works · Demo Video")}
      data-testid="hero-video-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Blurred Backdrop Overlay (click outside to close) */}
      <button
        type="button"
        aria-label={tx("Close video")}
        onClick={onClose}
        className="absolute inset-0 bg-[#021c15]/80 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Popup Video Frame */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/20 bg-[#052920] p-3 text-white shadow-[0_32px_90px_-16px_rgba(0,0,0,0.65)] sm:p-4">
        {/* Top Modal Header */}
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
              <PlayCircle className="size-4" aria-hidden="true" />
            </span>
            <h2 className="truncate font-heading text-sm font-bold text-white sm:text-base">
              {tx("How ShareBite Works · Demo Video")}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label={tx("Close video")}
            data-testid="close-hero-video"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 cursor-pointer"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* 16:9 Embedded YouTube Video Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
          <iframe
            src={`https://www.youtube.com/embed/${DEMO_YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&playsinline=1`}
            title={tx("ShareBite BD workflow video")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        {/* Subtle Bottom Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-emerald-100/80">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-200">
            {tx("Official YouTube Demo")}
          </span>
          <a
            href={stepsHref}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-emerald-200 transition hover:bg-white/10 hover:text-white"
          >
            <span>{tx("View written steps")}</span>
            <ArrowDown className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
