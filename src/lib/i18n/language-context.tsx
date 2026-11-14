"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { translations, type Language, type Translations } from "./translations";
import { enableBrowserLocale } from "./locale";
import { localizeUiCopy } from "./ui-text";

interface LanguageContextType { language: Language; setLanguage: (lang: Language) => void; toggleLanguage: () => void; t: Translations; }
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const STORAGE_KEY = "sharebite_preferred_lang";
const CHANGE_EVENT = "sharebite:language-changed";
let memoryLanguage: Language = "bn";
function subscribe(notify: () => void) {
  enableBrowserLocale();
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) notify(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, notify);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(CHANGE_EVENT, notify); };
}
export function readLanguage(): Language {
  try { const saved = localStorage.getItem(STORAGE_KEY); if (saved === "bn" || saved === "en") return saved; } catch {}
  return memoryLanguage;
}
function setLanguage(language: Language) {
  memoryLanguage = language;
  try { localStorage.setItem(STORAGE_KEY, language); } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "bn" as Language);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage: () => setLanguage(language === "bn" ? "en" : "bn"), t: localizeUiCopy(translations[language], language) }}>{children}</LanguageContext.Provider>;
}
const fallback: LanguageContextType = { language: "bn", setLanguage: () => {}, toggleLanguage: () => {}, t: translations.bn };
export function useLanguage() { return useContext(LanguageContext) ?? fallback; }
