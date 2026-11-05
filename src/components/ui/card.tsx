import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-4.5">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-heading">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500 font-normal">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 p-5 sm:p-6", className)} {...props} />;
}
