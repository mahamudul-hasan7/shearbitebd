import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StickyActionBar({
  contained = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { contained?: boolean }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 backdrop-blur-2xl backdrop-saturate-180 px-4 py-3 sm:py-4 sm:flex sm:items-center sm:justify-end",
        contained
          ? "mx-0 rounded-b-[calc(var(--radius-card)-1.5px)] border-t border-white/65 bg-white/38 shadow-[inset_0_1px_0_rgb(255_255_255/82%)]"
          : "-mx-1 rounded-2xl border border-white/82 bg-white/68 shadow-[0_14px_34px_-12px_rgba(12,40,75,0.22),inset_0_1px_0_rgba(255,255,255,0.92)] sm:mx-0",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      {...props}
    />
  );
}
