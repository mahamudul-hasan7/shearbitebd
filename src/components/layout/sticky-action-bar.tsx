import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StickyActionBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("safe-bottom sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-3 border-t border-line bg-white/95 px-4 py-4 shadow-sticky backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:rounded-t-2xl", className)}
      {...props}
    />
  );
}
