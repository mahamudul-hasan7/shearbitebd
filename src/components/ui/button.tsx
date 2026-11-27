import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./button.module.css";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ActionGlyph } from "@/components/motion/live-icon";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-emerald-800/25 bg-[#047857] text-white ring-1 ring-inset ring-white/20",
  secondary:
    "border border-amber-700/30 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-600/25 hover:brightness-105 hover:shadow-lg hover:shadow-amber-600/35 ring-1 ring-inset ring-white/20",
  outline:
    "border border-emerald-950/15 bg-white/80 text-slate-800 shadow-xs backdrop-blur-sm hover:border-emerald-600 hover:bg-emerald-50/80 hover:text-emerald-900",
  ghost:
    "border border-slate-300/80 bg-slate-100/70 text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800",
  danger:
    "border border-red-900/25 bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-red-600/25 hover:brightness-105 hover:shadow-lg hover:shadow-red-600/35 ring-1 ring-inset ring-white/20",
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
    "group icon-interactive inline-flex items-center justify-center gap-2 font-heading font-bold tracking-wide cursor-pointer disabled:pointer-events-none disabled:opacity-55 select-none",
    styles.action,
    styles[variant],
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
      data-ui="button"
      data-variant={variant}
      className={buttonClassNames({ variant, size, fullWidth, className })}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          <ActionGlyph>{leftIcon}</ActionGlyph>
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
          <ActionGlyph>{rightIcon}</ActionGlyph>
        </span>
      )}
    </button>
  );
}

export interface ButtonLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
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
      <span
        className={classes}
        data-ui="button"
        data-variant={variant}
        aria-disabled="true"
        role="link"
      >
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
    <Link
      href={href}
      data-ui="button"
      data-variant={variant}
      className={classes}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
          <ActionGlyph>{leftIcon}</ActionGlyph>
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
          <ActionGlyph>{rightIcon}</ActionGlyph>
        </span>
      )}
    </Link>
  );
}
