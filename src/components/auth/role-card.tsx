import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function RoleCard({
  icon: Icon,
  title,
  description,
  href,
  tone = "brand",
  disabled = false,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  tone?: "brand" | "blue" | "accent" | "purple";
  disabled?: boolean;
  badge?: string;
}) {
  const tones = {
    brand: "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50/80",
    blue: "border-sky-200 bg-sky-50/50 text-sky-700 hover:border-sky-500 hover:bg-sky-50/80",
    accent: "border-amber-200 bg-amber-50/50 text-amber-700 hover:border-amber-500 hover:bg-amber-50/80",
    purple: "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80",
  };

  const content = (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border p-4.5 transition-all duration-200 shadow-2xs",
        tones[tone],
        disabled ? "cursor-not-allowed opacity-60 bg-slate-50" : "hover:-translate-y-0.5 hover:shadow-sm"
      )}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white shadow-xs">
        <Icon className="size-6 sm:size-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold tracking-tight text-slate-900">{title}</span>
          {badge && (
            <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-2xs ring-1 ring-slate-200/60">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-600 font-normal">{description}</span>
      </span>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-xs text-slate-400 group-hover:text-slate-900">
        {disabled ? <LockKeyhole className="size-4" /> : <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
      </span>
    </div>
  );

  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}
