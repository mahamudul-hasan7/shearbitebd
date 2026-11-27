import { translateUiText } from "./ui-text";
let browserLocaleReady = false;
// Called by the language store after the initial server-compatible hydration.
export function enableBrowserLocale() { browserLocaleReady = true; }
/** Display locale only. Stored dates, identifiers and API values are never localized. */
export function getUiLocale() {
  if (typeof window === "undefined" || !browserLocaleReady) return "bn-BD";
  try {
    const selected = localStorage.getItem("sharebite_preferred_lang");
    if (selected === "en") return "en-BD";
    if (selected === "bn") return "bn-BD";
  } catch { /* LanguageProvider also supports storage being unavailable. */ }
  return document.documentElement.lang === "en" ? "en-BD" : "bn-BD";
}

export function displayUiText(source: string) {
  return translateUiText(getUiLocale() === "en-BD" ? "en" : "bn", source);
}

function banglaPeriodForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "সকাল";
  if (hour >= 12 && hour < 16) return "দুপুর";
  if (hour >= 16 && hour < 18) return "বিকাল";
  return "রাত";
}

function appendBanglaPeriod(formatted: string, date: Date, locale: string) {
  if (locale !== "bn-BD") return formatted;
  return formatted.replace(/\s?(?:AM|PM)$/i, "") + ` (${banglaPeriodForHour(date.getHours())})`;
}

export function formatUiTime(value: string | Date, locale = getUiLocale()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  return appendBanglaPeriod(date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }), date, locale);
}

export function formatUiDateTime(value: string | Date, locale = getUiLocale()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  return appendBanglaPeriod(date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }), date, locale);
}

export function formatUiNumber(value: string | number | null | undefined, locale = getUiLocale(), fallback = "—") {
  if (value === null || value === undefined) return fallback;
  const trimmed = typeof value === "string" ? value.trim() : String(value);
  const num = Number(trimmed);
  if (!trimmed || !Number.isFinite(num)) return fallback;
  return num.toLocaleString(locale);
}
