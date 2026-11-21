"use client";
import Image from "next/image";
import { PdfPreview } from "./pdf-preview";
import { useEffect, useId, useRef, useState } from "react";
import { Download, FileText, LoaderCircle, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { VerificationFile } from "./types";
import styles from "./verification.module.css";
export function DocumentPreview({
  document,
  onClose,
}: {
  document: VerificationFile;
  onClose: () => void;
}) {
  const tx = useUiText();
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const [result, setResult] = useState<{
    id: string;
    url?: string;
    error?: string;
  }>();
  useEffect(() => {
    const dialog = ref.current;
    const previous = globalThis.document.body.style.overflow;
    globalThis.document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      globalThis.document.body.style.overflow = previous;
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    fetch(document.url, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            "This document could not be opened. Close the preview and refresh your details.",
          );
        const blob = await response.blob();
        if (!["application/pdf", "image/webp"].includes(blob.type))
          throw new Error("This document format cannot be previewed.");
        if (!controller.signal.aborted) {
          objectUrl = URL.createObjectURL(blob);
          setResult({ id: document.id, url: objectUrl });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({
            id: document.id,
            error:
              error instanceof Error
                ? error.message
                : "This document could not be opened.",
          });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.id, document.url]);
  const current = result?.id === document.id ? result : undefined;
  return (
    <dialog
      ref={ref}
      className={styles.previewDialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      data-testid="verification-preview"
    >
      <header className={styles.previewHeader}>
        <span className={styles.fileIcon}>
          <FileText size={21} />
        </span>
        <div>
          <p>{tx("Private document preview")}</p>
          <h2 id={titleId}>{document.name}</h2>
        </div>
        <button
          type="button"
          aria-label={tx("Close document preview")}
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </header>
      <div className={styles.previewBody}>
        {!current && (
          <p role="status" className={styles.loading}>
            <LoaderCircle className={styles.spin} size={21} />
            {tx("Opening document…")}
          </p>
        )}
        {current?.error && (
          <p role="alert" className={styles.error}>
            {tx(current.error)}
          </p>
        )}
        {current?.url &&
          (document.mimeType === "application/pdf" ? (
            <PdfPreview key={current.url} url={current.url} />
          ) : (
            <Image
              src={current.url}
              alt={tx("Uploaded verification document")}
              width={document.width || 1400}
              height={document.height || 1000}
              unoptimized
              className={styles.documentImage}
            />
          ))}
      </div>
      <footer className={styles.previewFooter}>
        <span>
          {tx("Visible only to the account owner and administrators.")}
        </span>
        <a href={`${document.url}?download=1`} download>
          <Download size={16} />
          {tx("Download document")}
        </a>
      </footer>
    </dialog>
  );
}
export function DocumentFileCard({
  document,
  onPreview,
}: {
  document: VerificationFile;
  onPreview: () => void;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  return (
    <div className={styles.fileCard}>
      <span className={styles.fileIcon}>
        <FileText size={22} aria-hidden="true" />
      </span>
      <div className={styles.fileInfo}>
        <strong>{document.name}</strong>
        <span>
          {document.mimeType === "application/pdf" ? "PDF" : tx("Image")} ·{" "}
          {number(Math.max(1, Math.round(document.byteSize / 1024)))} KB
          {document.pages
            ? ` · ${tx("{0} pages", number(document.pages))}`
            : ""}
        </span>
      </div>
      <button type="button" className={styles.viewButton} onClick={onPreview}>
        {tx("Preview document")}
      </button>
    </div>
  );
}
