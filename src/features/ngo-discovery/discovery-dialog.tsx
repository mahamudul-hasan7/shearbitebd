"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import styles from "./discovery.module.css";
export function DiscoveryDialog({
  title,
  children,
  footer,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const tx = useUiText(),
    id = useId(),
    ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current,
      previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onClose();
      }}
    >
      <header className={styles.dialogHeader}>
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={tx("Close")}
          disabled={busy}
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </header>
      {children}
      <footer className={styles.dialogFooter}>{footer}</footer>
    </dialog>
  );
}
