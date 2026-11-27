"use client";

import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface LanguageSwitchProps {
  variant?: "default" | "minimal" | "dark";
  className?: string;
  touchFriendly?: boolean;
}

export function LanguageSwitch({
  variant = "default",
  className,
  touchFriendly = false,
}: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage();
  const tx = useUiText();
  const isDark = variant === "dark";
  const isMinimal = variant === "minimal";

  if (isMinimal) {
    return (
      <div
        role="group"
        aria-label={tx("Choose language")}
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
        ><UiText source={"EN"} /></button>
        <span className="text-slate-300">/</span>
        <button
          type="button"
          onClick={() => setLanguage("bn")}
          aria-pressed={language === "bn"}
          className={cn(
            "cursor-pointer px-1.5 py-0.5 rounded transition-all",
            language === "bn" ? "text-emerald-700 font-black" : "text-slate-500 hover:text-slate-900"
          )}
        ><UiText source={"বাংলা"} /></button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={tx("Choose language")}
      className={cn(
        "relative grid grid-cols-2 items-center p-0.5 rounded-xl text-xs font-semibold select-none transition-colors shadow-2xs",
        touchFriendly ? "h-11 sm:h-9" : "h-9",
        isDark
          ? "border border-emerald-800/60 bg-emerald-950/70 text-emerald-100"
          : "border border-slate-200/80 bg-slate-100/85 text-slate-600",
        className
      )}
    >
      <span
        aria-hidden="true"
        style={{
          transform: language === "bn" ? "translate3d(100%, 0, 0)" : "translate3d(0, 0, 0)",
          transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-lg will-change-transform",
          isDark ? "bg-emerald-800 shadow-xs" : "bg-white shadow-2xs",
        )}
      />
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={cn(
          "relative z-10 cursor-pointer transition-colors duration-200 px-2.5 py-1 rounded-lg text-xs font-bold leading-none text-center",
          touchFriendly && "min-h-9 min-w-7 px-1.5 text-[11px] min-[375px]:min-w-9 min-[375px]:px-2 min-[375px]:text-xs sm:min-h-0 sm:min-w-0 sm:px-2.5",
          language === "en"
            ? isDark
              ? "text-white"
              : "text-emerald-900"
            : isDark
            ? "text-emerald-200/60 hover:text-white"
            : "text-slate-500 hover:text-slate-900"
        )}
      ><UiText source={"EN"} /></button>

      <button
        type="button"
        onClick={() => setLanguage("bn")}
        aria-pressed={language === "bn"}
        className={cn(
          "relative z-10 cursor-pointer transition-colors duration-200 px-2.5 py-1 rounded-lg text-xs font-bold leading-none text-center",
          touchFriendly && "min-h-9 min-w-7 px-1.5 text-[11px] min-[375px]:min-w-9 min-[375px]:px-2 min-[375px]:text-xs sm:min-h-0 sm:min-w-0 sm:px-2.5",
          language === "bn"
            ? isDark
              ? "text-white"
              : "text-emerald-900"
            : isDark
            ? "text-emerald-200/60 hover:text-white"
            : "text-slate-500 hover:text-slate-900"
        )}
      ><UiText source={"বাংলা"} /></button>
    </div>
  );
}
