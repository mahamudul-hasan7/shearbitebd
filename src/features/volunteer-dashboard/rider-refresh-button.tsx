"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import styles from "./rider-mobile.module.css";

export function RiderRefreshButton({ onClick, disabled = false, label = "Refresh" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  const tx = useUiText();
  return <Button type="button" variant="outline" className={styles.refresh} onClick={onClick} disabled={disabled} aria-label={tx(label)} title={tx(label)}>
    <RefreshCw size={17} aria-hidden="true" />
  </Button>;
}
