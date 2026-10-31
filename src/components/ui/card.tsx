import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-w-0 rounded-2xl border border-line bg-surface shadow-xs transition-shadow duration-150", className)}
      {...props}
    />
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-4.5">
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold tracking-tight text-ink-900">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-muted-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 p-5 sm:p-6", className)} {...props} />;
}
