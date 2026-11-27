"use client";
import Image from "next/image";
import { PdfPreview } from "./pdf-preview";
import { useEffect, useState } from "react";
import { Download, FileText, LoaderCircle } from "lucide-react";
import { ExecutiveDialog } from "@/components/ui/executive-dialog";
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
  const [result, setResult] = useState<{
    id: string;
    url?: string;
    error?: string;
  }>();
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
    <ExecutiveDialog
      open
      onClose={onClose}
      tone="slate"
      size="xl"
      zIndexClassName="z-[95]"
      testId="verification-preview"
      closeLabel="Close document preview"
      eyebrow={tx("Private document preview")}
      title={document.name}
      leading={<FileText className="size-5" />}
      footer={
        <>
          <span className="text-xs text-muted-600">
            {tx("Visible only to the account owner and administrators.")}
          </span>
          <a
            href={`${document.url}?download=1`}
            download
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800"
          >
            <Download size={16} />
            {tx("Download document")}
          </a>
        </>
      }
    >
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
    </ExecutiveDialog>
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
