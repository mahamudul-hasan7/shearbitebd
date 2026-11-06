import * as React from "react";
import { cn } from "@/lib/utils";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: React.ElementType;
}

/**
 * Screen-reader-only element that remains accessible to assistive technology while hidden from visual layout.
 */
export function VisuallyHidden({ as: Comp = "span", className, children, ...props }: VisuallyHiddenProps) {
  return (
    <Comp
      className={cn("sr-only select-none pointer-events-none", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function LiveRegionAnnouncer({ message, priority = "polite" }: { message: string; priority?: "polite" | "assertive" }) {
  return (
    <div aria-live={priority} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
