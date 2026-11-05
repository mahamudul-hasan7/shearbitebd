import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-900 active:scale-[0.98] ring-1 ring-emerald-600/30",
  secondary:
    "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-600/20 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] ring-1 ring-amber-600/30",
  outline:
    "border border-slate-200/90 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 active:scale-[0.98]",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100/80 hover:text-slate-950 active:scale-[0.98]",
  danger:
    "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-red-600/20 hover:from-rose-700 hover:to-red-700 active:scale-[0.98] ring-1 ring-rose-600/30",
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
    "icon-interactive inline-flex items-center justify-center gap-2 font-heading font-bold tracking-wide transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 select-none",
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
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
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
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </span>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  );
}
