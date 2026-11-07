import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-700/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ring-1 ring-white/20 border-b-2 border-emerald-950/40",
  secondary:
    "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-600/25 hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-600/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ring-1 ring-white/20 border-b-2 border-amber-900/40",
  outline:
    "border-2 border-slate-300 bg-white text-slate-800 shadow-xs hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  ghost:
    "border border-slate-300/80 bg-slate-100/70 text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  danger:
    "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-red-600/25 hover:from-rose-500 hover:to-red-500 hover:shadow-lg hover:shadow-red-600/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ring-1 ring-white/20 border-b-2 border-red-950/40",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs font-bold rounded-xl",
  md: "h-11 px-5 text-xs sm:text-sm font-bold rounded-xl",
  lg: "h-12.5 px-6.5 text-sm sm:text-base font-bold rounded-2xl",
};

export function buttonClassNames({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "group icon-interactive inline-flex items-center justify-center gap-2 font-heading font-bold tracking-wide transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassNames({ variant, size, fullWidth, className })}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
          {rightIcon}
        </span>
      )}
    </button>
  );
}

export interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = buttonClassNames({
    variant,
    size,
    fullWidth,
    className: cn(disabled && "pointer-events-none opacity-50", className),
  });

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true" role="link">
        {leftIcon && (
          <span className="shrink-0 transition-transform duration-200">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span className="shrink-0 transition-transform duration-200">
            {rightIcon}
          </span>
        )}
      </span>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {leftIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
          {rightIcon}
        </span>
      )}
    </Link>
  );
}
