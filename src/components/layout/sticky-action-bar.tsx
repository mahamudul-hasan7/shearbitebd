import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StickyActionBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 -mx-3 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] xs:-mx-4 sm:mx-0 sm:py-4 sm:flex sm:items-center sm:justify-end sm:rounded-t-2xl",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      {...props}
    />
  );
}
