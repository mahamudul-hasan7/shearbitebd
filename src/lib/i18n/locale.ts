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
