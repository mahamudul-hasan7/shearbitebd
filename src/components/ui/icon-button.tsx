import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "group relative grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink-700 shadow-xs transition-all duration-150 hover:bg-slate-50 hover:text-ink-900 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButtonLink({ href, label, children, className, ...props }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "group relative grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink-700 shadow-xs transition-all duration-150 hover:bg-slate-50 hover:text-ink-900 active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
