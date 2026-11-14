"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { hasUiTranslation } from "@/lib/i18n/ui-text";
import styles from "./loading-spinner.module.css";

export function LoadingSpinner({ label = "Loading...", fullPage = false, className = "" }: {
  label?: string;
  fullPage?: boolean;
  className?: string;
}) {
  const tx = useUiText();
  const text = tx(hasUiTranslation(label) ? label : "Loading...");
  return <div role="status" aria-live="polite" className={`${styles.root} ${fullPage ? styles.fullPage : ""} ${className}`} data-testid="loading-spinner">
    <span className={styles.ring} aria-hidden="true" data-testid="loading-ring" />
    <span className={styles.label}>{text}</span>
  </div>;
}
