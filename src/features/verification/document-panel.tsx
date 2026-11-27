"use client";
import { createRequestId } from "@/lib/request-id";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  FileCheck2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { DocumentFileCard, DocumentPreview } from "./document-preview";
import { uploadVerificationDocument } from "./document-client";
import {
  DOCUMENT_ACCEPT,
  documentInputError,
  type VerificationFile,
} from "./types";
import { useVerification } from "./use-verification";
import styles from "./verification.module.css";

function SelectedImage({ file }: { file: File }) {
  const [preview, setPreview] = useState<{ file: File; url: string }>();
  useEffect(() => {
    const url = URL.createObjectURL(file);
    let alive = true;
    void file.arrayBuffer().then(() => {
      if (alive) setPreview({ file, url });
    });
    return () => {
      alive = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);
  const tx = useUiText();
  return preview?.file === file ? (
    <Image
      src={preview.url}
      alt={tx("Selected document preview")}
      width={600}
      height={400}
      unoptimized
      className={styles.selectedImage}
    />
  ) : null;
}
export function VerificationDocumentPanel() {
  const tx = useUiText();
  const { language } = useLanguage();
  const query = useVerification();
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = useId();
  const [file, setFile] = useState<File>();
  const [key, setKey] = useState(() => createRequestId());
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<VerificationFile>();
  const active = useRef(true);
  const lock = useRef(false);
  const abort = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      abort.current?.();
    };
  }, []);
  const data = query.data;
  const verified = data?.status === "VERIFIED";
  const rejected = data?.status === "REJECTED";
  const uploaded = !!data?.document;
  const badge = verified
    ? "Verified"
    : rejected
      ? "Changes requested"
      : uploaded
        ? "Awaiting review"
        : "Document needed";
  function select(candidate?: File) {
    if (busy || !candidate) return;
    const issue = documentInputError(candidate);
    setSaved(false);
    setError(issue || "");
    if (issue) {
      setFile(undefined);
      return;
    }
    setFile(candidate);
    setKey(createRequestId());
    setProgress(0);
  }
  async function submit() {
    if (!file || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setSaved(false);
    setProgress(0);
    const task = uploadVerificationDocument(file, key, (value) => {
      if (active.current) setProgress(value);
    });
    abort.current = task.abort;
    try {
      await task.promise;
      if (active.current) {
        setFile(undefined);
        setSaved(true);
        setPreview(undefined);
        query.refresh();
      }
    } catch (error) {
      if (active.current)
        setError(
          error instanceof Error
            ? error.message
            : "The document could not be uploaded. Try again.",
        );
    } finally {
      lock.current = false;
      abort.current = undefined;
      if (active.current) setBusy(false);
    }
  }
  const date = (value: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-BD", {
      timeZone: "Asia/Dhaka",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  return (
    <section
      className={styles.panel}
      aria-labelledby={`${inputId}-heading`}
      data-testid="verification-panel"
    >
      <header className={styles.panelHeader}>
        <span className={styles.headerIcon}>
          <ShieldCheck size={24} />
        </span>
        <div>
          <p className={styles.eyebrow}>{tx("Account verification")}</p>
          <h2 id={`${inputId}-heading`}>
            {tx(
              (data?.role || query.role) === "DONOR"
                ? "Your business or license document"
                : (data?.role || query.role) === "VOLUNTEER"
                  ? "Your identity document"
                  : "Your registration document",
            )}
          </h2>
        </div>
        {data && (
          <Badge
            tone={
              verified
                ? "success"
                : rejected
                  ? "danger"
                  : uploaded
                    ? "warning"
                    : "neutral"
            }
          >
            {tx(badge)}
          </Badge>
        )}
      </header>
      {query.loading && (
        <p role="status" className={styles.loading}>
          <LoaderCircle className={styles.spin} size={20} />
          {tx("Loading verification details…")}
        </p>
      )}
      {query.error && (
        <div role="alert" className={styles.error}>
          <p>{tx(query.error)}</p>
          <Button variant="outline" onClick={query.refresh}>
            {tx("Try again")}
          </Button>
        </div>
      )}
      {data && (
        <div className={styles.panelBody}>
          {(!verified || uploaded) && <ol
            className={styles.steps}
            aria-label={tx("Document verification progress")}
          >
            {[
              { label: "Upload document", icon: FileText },
              { label: "Admin review", icon: FileCheck2 },
              { label: "Verified", icon: BadgeCheck },
            ].map(({ label, icon: Icon }, index) => (
              <li
                key={label}
                data-complete={index === 0 ? uploaded : verified}
                aria-current={
                  !verified && index === (uploaded ? 1 : 0) ? "step" : undefined
                }
              >
                <span>
                  {(index === 0 && uploaded) || verified ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>
                <strong>{tx(label)}</strong>
              </li>
            ))}
          </ol>}
          {!verified && <p className={styles.intro}>
            {tx(
              data.role === "DONOR"
                ? "Upload a trade license, BFSA certificate, or valid ID for an administrator to verify your donor account."
                : data.role === "NGO"
                  ? "Upload your NGO registration certificate for an administrator to review."
                  : "Upload an identity document for an administrator to review your volunteer account.",
            )}
          </p>}
          {data.document && (
            <DocumentFileCard
              document={data.document}
              onPreview={() => setPreview(data.document!)}
            />
          )}
          {verified ? (
            <p className={styles.success}>
              <BadgeCheck size={19} />
              {tx(
                uploaded
                  ? "Your account is verified. Your approved document is saved with the review."
                  : "Your account is approved and ready to use.",
              )}
            </p>
          ) : (
            <>
              <div
                className={styles.dropzone}
                data-dragging={dragging}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!busy) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  if (event.dataTransfer.files.length !== 1)
                    setError("Choose one verification document.");
                  else select(event.dataTransfer.files[0]);
                }}
              >
                <UploadCloud size={32} aria-hidden="true" />
                <h3>
                  {tx(
                    uploaded
                      ? "Submit an updated document"
                      : "Add your verification document",
                  )}
                </h3>
                <p>{tx("Choose a file or drag it here.")}</p>
                <input
                  ref={input}
                  id={inputId}
                  type="file"
                  accept={DOCUMENT_ACCEPT}
                  aria-label={tx("Choose verification document")}
                  aria-describedby={hintId}
                  className={styles.fileInput}
                  disabled={busy}
                  tabIndex={-1}
                  onChange={(event) => {
                    select(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  {tx("Choose document")}
                </Button>
                <small id={hintId}>
                  {tx("PDF, JPG or PNG · Up to 5 MB · PDF up to 10 pages")}
                </small>
              </div>
              {file && (
                <div className={styles.selected}>
                  {file.type.startsWith("image/") && (
                    <SelectedImage file={file} />
                  )}
                  <div className={styles.selectionInfo}>
                    <FileText size={21} />
                    <div>
                      <strong>{file.name}</strong>
                      <span>
                        {tx(
                          "{0} KB · Ready to upload",
                          Math.max(1, Math.round(file.size / 1024)),
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={tx("Remove selected document")}
                      disabled={busy}
                      onClick={() => setFile(undefined)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className={styles.hint}>
                    {tx(
                      "Submitting a document sends this account back to review. Approval is a manual admin decision.",
                    )}
                  </p>
                </div>
              )}
              {busy && (
                <div className={styles.progressArea}>
                  <div>
                    <span>
                      {tx(
                        progress >= 100
                          ? "Checking and saving your document…"
                          : "Uploading document…",
                      )}
                    </span>
                    <span>
                      {progress.toLocaleString(
                        language === "bn" ? "bn-BD" : "en-BD",
                      )}
                      %
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={tx("Document upload progress")}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    className={styles.progress}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <button type="button" onClick={() => abort.current?.()}>
                    {tx("Cancel upload")}
                  </button>
                </div>
              )}
              {error && (
                <p className={styles.error} role="alert">
                  {tx(error)}
                </p>
              )}
              {saved && (
                <p className={styles.success} role="status">
                  <Check size={18} />
                  {tx("Document submitted. An administrator will review it.")}
                </p>
              )}
              <div className={styles.actions}>
                <span className={styles.privacy}>
                  <LockKeyhole size={15} />
                  {tx("Only you and administrators can view these files.")}
                </span>
                <Button
                  disabled={!file || busy}
                  aria-busy={busy}
                  leftIcon={
                    busy ? (
                      <LoaderCircle className={styles.spin} size={17} />
                    ) : (
                      <UploadCloud size={17} />
                    )
                  }
                  onClick={() => void submit()}
                >
                  {tx(
                    busy
                      ? "Submitting…"
                      : rejected || uploaded
                        ? "Submit updated document"
                        : "Submit document",
                  )}
                </Button>
              </div>
            </>
          )}
          {!verified && <p className={styles.demoNote}>
            {tx(
              "For a project demo, use a PDF or image marked DEMO / SAMPLE. The app does not certify document authenticity.",
            )}
          </p>}
          {data.reviews.length > 0 && (
            <section className={styles.reviewHistory}>
              <h3>{tx("Review feedback")}</h3>
              {data.reviews.map((review) => (
                <article key={review.id}>
                  <div>
                    <strong>{review.actorLabel}</strong>
                    <Badge
                      tone={review.status === "VERIFIED" ? "success" : "danger"}
                    >
                      {tx(
                        review.status === "VERIFIED"
                          ? "Approved"
                          : "Changes requested",
                      )}
                    </Badge>
                  </div>
                  <p>{review.note}</p>
                  <time dateTime={review.createdAt}>
                    {date(review.createdAt)}
                  </time>
                  {review.document && (
                    <button
                      type="button"
                      className={styles.reviewFile}
                      onClick={() => setPreview(review.document!)}
                    >
                      {tx("Reviewed document: {0}", review.document.name)}
                    </button>
                  )}
                </article>
              ))}
            </section>
          )}
          <button
            type="button"
            className={styles.refresh}
            disabled={busy}
            onClick={query.refresh}
          >
            <RefreshCw size={15} />
            {tx("Refresh verification status")}
          </button>
        </div>
      )}
      {preview && (
        <DocumentPreview
          document={preview}
          onClose={() => setPreview(undefined)}
        />
      )}
    </section>
  );
}
