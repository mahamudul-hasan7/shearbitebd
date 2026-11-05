"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface LanguageSwitchProps {
  variant?: "default" | "minimal" | "dark";
  className?: string;
}

export function LanguageSwitch({
  variant = "default",
  className,
}: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage();
  const isDark = variant === "dark";
  const isMinimal = variant === "minimal";

  if (isMinimal) {
    return (
      <div
        role="group"
        aria-label="Language Selector"
        className={cn("inline-flex items-center gap-1 text-xs font-bold font-heading select-none", className)}
      >
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={language === "en"}
          className={cn(
            "cursor-pointer px-1.5 py-0.5 rounded transition-all",
            language === "en" ? "text-emerald-700 font-black" : "text-slate-500 hover:text-slate-900"
          )}
        >
          EN
        </button>
        <span className="text-slate-300">/</span>
        <button
          type="button"
          onClick={() => setLanguage("bn")}
          aria-pressed={language === "bn"}
          className={cn(
            "cursor-pointer px-1.5 py-0.5 rounded transition-all",
            language === "bn" ? "text-emerald-700 font-black" : "text-slate-500 hover:text-slate-900"
          )}
        >
          বাংলা
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language Selector"
      className={cn(
        "inline-flex h-9 items-center p-0.5 rounded-xl text-xs font-semibold select-none transition-all shadow-2xs",
        isDark
          ? "border border-emerald-800/60 bg-emerald-950/70 text-emerald-100"
          : "border border-slate-200/80 bg-slate-100/80 text-slate-600",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={cn(
          "cursor-pointer transition-all px-2.5 py-1 rounded-lg text-xs font-bold leading-none",
          language === "en"
            ? isDark
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-emerald-900 shadow-2xs font-extrabold"
            : isDark
            ? "text-emerald-200/60 hover:text-white"
            : "text-slate-500 hover:text-slate-900"
        )}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage("bn")}
        aria-pressed={language === "bn"}
        className={cn(
          "cursor-pointer transition-all px-2.5 py-1 rounded-lg text-xs font-bold leading-none",
          language === "bn"
            ? isDark
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-white text-emerald-900 shadow-2xs font-extrabold"
            : isDark
            ? "text-emerald-200/60 hover:text-white"
            : "text-slate-500 hover:text-slate-900"
        )}
      >
        বাংলা
      </button>
    </div>
  );
}
