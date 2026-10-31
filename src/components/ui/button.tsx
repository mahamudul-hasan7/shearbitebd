import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-xs shadow-brand-700/20 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98] ring-1 ring-brand-700/20",
  secondary: "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-xs shadow-accent-600/20 hover:from-accent-600 hover:to-accent-700 active:scale-[0.98]",
  outline: "border border-line bg-surface text-ink-700 shadow-2xs hover:bg-slate-50 hover:text-ink-900 active:scale-[0.98]",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-ink-900",
  danger: "bg-danger text-white shadow-xs hover:brightness-95 active:scale-[0.98]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs font-semibold rounded-lg",
  md: "h-10.5 px-4.5 text-sm font-semibold rounded-xl",
  lg: "h-12 px-6 text-base font-semibold rounded-xl",
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
    "icon-interactive inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
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
