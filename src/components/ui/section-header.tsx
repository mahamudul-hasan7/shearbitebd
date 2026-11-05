import type { ReactNode } from "react";

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
          {title}
        </h2>
        {description && <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
