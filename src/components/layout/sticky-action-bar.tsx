import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function StickyActionBar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("safe-bottom sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-3 flex flex-col-reverse gap-3 border-t border-line bg-white/95 px-3 py-4 shadow-sticky backdrop-blur xs:-mx-4 xs:px-4 sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:rounded-t-2xl lg:bottom-0", className)}
      {...props}
    />
  );
}
