"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import styles from "./verification.module.css";

export function PdfPreview({ url }: { url: string }) {
  const tx = useUiText();
  const { language } = useLanguage();
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const [rendered, setRendered] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    let destroy: (() => void) | undefined;
    void import("pdfjs-dist")
      .then((pdfjs) => {
        if (!alive) return;
        pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs?v=${pdfjs.version}`;
        const task = pdfjs.getDocument({
          url,
          isEvalSupported: false,
          enableXfa: false,
          disableFontFace: false,
          useSystemFonts: true,
        });
        destroy = () => {
          void task.destroy();
        };
        void task.promise
          .then((value) => {
            if (alive) setDocument(value);
          })
          .catch(() => {
            if (alive) setError(true);
          });
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
      destroy?.();
    };
  }, [url]);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const key = `${page}-${width}`;
  useEffect(() => {
    if (!document || !width || !canvas.current) return;
    let alive = true,
      task: RenderTask | undefined;
    const target = canvas.current;
    void document
      .getPage(page)
      .then(async (pdfPage) => {
        if (!alive) return;
        const original = pdfPage.getViewport({ scale: 1 });
        const scale = Math.min(width / original.width, 2400 / original.height);
        const ratio = Math.min(devicePixelRatio || 1, 2);
        const viewport = pdfPage.getViewport({ scale: scale * ratio });
        target.width = Math.ceil(viewport.width);
        target.height = Math.ceil(viewport.height);
        task = pdfPage.render({
          canvas: target,
          viewport,
          background: "white",
        });
        await task.promise;
        if (alive) setRendered(key);
      })
      .catch((error) => {
        if (alive && error?.name !== "RenderingCancelledException")
          setError(true);
      });
    return () => {
      alive = false;
      task?.cancel();
    };
  }, [document, page, width, key]);
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  return (
    <div ref={container} className={styles.pdfViewer}>
      {error ? (
        <p role="alert" className={styles.error}>
          {tx(
            "This PDF could not be displayed. Download the document to view it.",
          )}
        </p>
      ) : (
        <>
          {document && (
            <div className={styles.pdfControls}>
              <button
                type="button"
                aria-label={tx("Previous document page")}
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft size={19} />
              </button>
              <span aria-live="polite">
                {tx("Page {0} of {1}", number(page), number(document.numPages))}
              </span>
              <button
                type="button"
                aria-label={tx("Next document page")}
                disabled={page >= document.numPages}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight size={19} />
              </button>
            </div>
          )}
          {rendered !== key && (
            <p role="status" className={styles.loading}>
              <LoaderCircle className={styles.spin} size={20} />
              {tx("Opening document…")}
            </p>
          )}
          <canvas
            ref={canvas}
            className={styles.pdfCanvas}
            role="img"
            aria-label={tx("Verification document page {0}", number(page))}
            data-rendered={rendered === key}
            style={{ display: rendered === key ? "block" : "none" }}
          />
        </>
      )}
    </div>
  );
}
