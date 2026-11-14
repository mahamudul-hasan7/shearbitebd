"use client";
import { useCallback } from "react";
import { useLanguage } from "./language-context";
import { translateUiText } from "./ui-text";

export function useUiText() {
  const { language } = useLanguage();
  return useCallback((source: string | undefined | null, ...values: unknown[]) => translateUiText(language, source ?? "", ...values), [language]);
}
