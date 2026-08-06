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
    brand: "border-brand-200 bg-brand-50/80 text-brand-700 group-hover:border-brand-400",
    blue: "border-blue-100 bg-blue-50/70 text-blue-800 group-hover:border-blue-300",
    accent: "border-accent-100 bg-accent-50 text-accent-600 group-hover:border-accent-400",
    purple: "border-purple-100 bg-purple-50/70 text-purple-800 group-hover:border-purple-300",
  };

  const content = (
    <div className={cn("group relative flex min-h-32 items-center gap-4 rounded-3xl border p-4 transition sm:min-h-36 sm:p-5", tones[tone], disabled ? "cursor-not-allowed opacity-65" : "hover:-translate-y-0.5 hover:shadow-card")}>
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white shadow-sm sm:size-20">
        <Icon className="size-8 sm:size-10" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-black text-ink-900 sm:text-xl">{title}</span>
          {badge && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-600">{badge}</span>}
        </span>
        <span className="mt-1 block text-sm leading-6 text-muted-600">{description}</span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
        {disabled ? <LockKeyhole className="size-5" /> : <ArrowRight className="size-5 transition group-hover:translate-x-0.5" />}
      </span>
    </div>
  );

  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}
