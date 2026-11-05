import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function RoleCard({
  icon: Icon,
  title,
  bengaliSubtitle,
  description,
  href,
  tone = "brand",
  disabled = false,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  bengaliSubtitle?: string;
  description: string;
  href: string;
  tone?: "brand" | "blue" | "accent" | "purple";
  disabled?: boolean;
  badge?: string;
}) {
  const tones = {
    brand: "border-emerald-200/90 bg-emerald-50/40 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50/70 hover:shadow-emerald-900/10",
    blue: "border-sky-200/90 bg-sky-50/40 text-sky-700 hover:border-sky-500 hover:bg-sky-50/70 hover:shadow-sky-900/10",
    accent: "border-amber-200/90 bg-amber-50/40 text-amber-700 hover:border-amber-500 hover:bg-amber-50/70 hover:shadow-amber-900/10",
    purple: "border-slate-200/90 bg-slate-50/40 text-slate-700 hover:border-slate-400 hover:bg-slate-50/70",
  };

  const content = (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border p-4.5 transition-all duration-200 shadow-2xs",
        tones[tone],
        disabled ? "cursor-not-allowed opacity-60 bg-slate-50" : "hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-100">
        <Icon className="size-6 text-slate-800 group-hover:scale-110 transition-transform" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold tracking-tight text-slate-900 font-heading">{title}</span>
          {bengaliSubtitle && (
            <span className="text-xs text-slate-500 font-medium">({bengaliSubtitle})</span>
          )}
          {badge && (
            <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shadow-2xs ring-1 ring-slate-200/80">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-600 font-normal">{description}</span>
      </span>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-xs text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-colors">
        {disabled ? <LockKeyhole className="size-4" /> : <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
      </span>
    </div>
  );

  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}
