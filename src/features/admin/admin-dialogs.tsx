"use client";
import { createRequestId } from "@/lib/request-id";
import { useRef, useState } from "react";
import { Check, ExternalLink, ShieldCheck } from "lucide-react";
import {
  DocumentFileCard,
  DocumentPreview,
} from "@/features/verification/document-preview";
import type { VerificationFile } from "@/features/verification/types";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type {
  AdminAccountDetail,
  AdminReport,
  AdminRescue,
} from "@/lib/db/admin";
import {
  Details,
  Dialog,
  Feedback,
  labels,
  Status,
  useAdminDate,
  useAdminQuery,
} from "./admin-shared";
import s from "./admin.module.css";

const ACCOUNT_NOTE_PRESETS = {
  APPROVE: [
    {
      key: "approve-complete",
      label: "Identity & documents verified",
      text: "Identity, organization details, and submitted verification documents are complete and verified.",
    },
    {
      key: "approve-registration",
      label: "Registration & contact confirmed",
      text: "Registration number and contact details verified with platform safety requirements.",
    },
    {
      key: "approve-volunteer",
      label: "Volunteer & service zone approved",
      text: "Volunteer identity and service area credentials checked and approved for active dispatch.",
    },
    {
      key: "approve-ready",
      label: "Profile & address ready",
      text: "Account profile, address, and operational readiness verified for ShareBite BD participation.",
    },
  ],
  REJECT: [
    {
      key: "reject-document",
      label: "Unclear or incomplete document",
      text: "Submitted verification document is unclear or incomplete. Please upload a readable official file.",
    },
    {
      key: "reject-registration",
      label: "Registration number mismatch",
      text: "Registration or certificate number does not match the organization details provided.",
    },
    {
      key: "reject-contact",
      label: "Contact or address unverified",
      text: "Contact number or Dhaka service address could not be verified. Update profile details and resubmit.",
    },
    {
      key: "reject-missing",
      label: "Missing supporting documents",
      text: "Required supporting documents are missing. Upload valid verification files before requesting review.",
    },
  ],
} as const;

export function AccountDialog({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const tx = useUiText();
  const date = useAdminDate();
  const query = useAdminQuery<AdminAccountDetail>(
    `/api/admin/accounts?id=${encodeURIComponent(id)}`,
  );
  const [action, setAction] = useState("APPROVE");
  const [note, setNote] = useState("");
  const [presetKey, setPresetKey] = useState("");
  const [key, setKey] = useState(() => createRequestId());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const account = query.data?.account;
  const [preview, setPreview] = useState<VerificationFile>();
  const documentRequired =
    account?.role === "NGO" || account?.role === "VOLUNTEER";
  const missingDocument = documentRequired && !account?.document;
  const effectiveAction =
    missingDocument && account?.status !== "REJECTED" ? "REJECT" : action;
  const notePresets =
    effectiveAction === "REJECT"
      ? ACCOUNT_NOTE_PRESETS.REJECT
      : ACCOUNT_NOTE_PRESETS.APPROVE;
  const detailItems: [string, string | null | undefined][] = account
    ? [
        ["Email", account.email],
        ["Phone", account.phone],
        ["Address", account.address],
        ["Joined", date(account.createdAt)],
      ]
    : [];
  if (account) {
    if (account.role !== "VOLUNTEER")
      detailItems.unshift(
        ["Organization", account.organization],
        ["Registration / certificate number", account.registrationNumber],
      );
    if (account.role === "NGO" && account.summary)
      detailItems.push(["About the organization", account.summary]);
    if (account.role === "VOLUNTEER")
      detailItems.push(
        ["Service areas", account.serviceAreas.join(", ")],
        ["Transport", account.transport ? tx(labels[account.transport]) : ""],
      );
    if (account.documentName && !account.document)
      detailItems.push(["Declared document name", account.documentName]);
  }
  const editable =
    account &&
    account.isActive &&
    account.status !== "VERIFIED" &&
    !!account.version;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!account || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action: effectiveAction,
          note,
          submissionKey: key,
          expectedUpdatedAt: account.version,
          documentId: account.document?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not save the review. Try again.");
      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save the review. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={tx("Account verification")}
      tone={
        account?.status === "REJECTED"
          ? "rose"
          : account?.status === "VERIFIED"
            ? "emerald"
            : "amber"
      }
      onClose={onClose}
      busy={busy}
    >
      <Feedback query={query} />
      {account && (
        <>
          <div className={s.detailIntro}>
            <span className={s.personIcon}>
              {account.displayName.slice(0, 1)}
            </span>
            <div>
              <h3>{account.displayName}</h3>
              <p>{tx(labels[account.role])}</p>
            </div>
            <Status value={account.status} />
          </div>
          <Details items={detailItems} />
          {account.document ? (
            <DocumentFileCard
              document={account.document}
              onPreview={() => setPreview(account.document!)}
            />
          ) : documentRequired ? (
            <p className={s.note}>
              {tx(
                account.status === "VERIFIED"
                  ? "This previously verified account has no uploaded document."
                  : "A document must be uploaded before this account can be approved.",
              )}
            </p>
          ) : null}
          {!account.isActive && (
            <p className={s.note}>{tx("This account is inactive.")}</p>
          )}
          {editable ? (
            <form onSubmit={submit} className={s.reviewForm}>
              <div className={s.sectionLabel}>
                <ShieldCheck size={18} />
                <h3>{tx("Your decision")}</h3>
              </div>
              <div className={s.decisions}>
                <label data-selected={effectiveAction === "APPROVE"}>
                  <input
                    type="radio"
                    name="account-decision"
                    value="APPROVE"
                    checked={effectiveAction === "APPROVE"}
                    disabled={busy || missingDocument}
                    onChange={(e) => {
                      setAction(e.target.value);
                      if (presetKey) {
                        setPresetKey("");
                        setNote("");
                      }
                      setKey(createRequestId());
                    }}
                  />
                  {tx("Approve account")}
                </label>
                <label data-selected={effectiveAction === "REJECT"}>
                  <input
                    type="radio"
                    name="account-decision"
                    value="REJECT"
                    checked={effectiveAction === "REJECT"}
                    disabled={busy || account.status === "REJECTED"}
                    onChange={(e) => {
                      setAction(e.target.value);
                      if (presetKey) {
                        setPresetKey("");
                        setNote("");
                      }
                      setKey(createRequestId());
                    }}
                  />
                  {tx("Reject account")}
                </label>
              </div>
              <label className={s.field}>
                {tx("Quick note preset")}
                <select
                  aria-label={tx("Quick note preset")}
                  disabled={busy}
                  value={
                    notePresets.some((item) => item.key === presetKey)
                      ? presetKey
                      : ""
                  }
                  onChange={(e) => {
                    const selectedKey = e.target.value;
                    setPresetKey(selectedKey);
                    const matched = notePresets.find(
                      (item) => item.key === selectedKey,
                    );
                    if (matched) {
                      setNote(tx(matched.text));
                      setKey(createRequestId());
                    }
                  }}
                >
                  <option value="">
                    {tx("Select a ready-made note (optional)")}
                  </option>
                  {notePresets.map((item) => (
                    <option key={item.key} value={item.key}>
                      {tx(item.label)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={s.field}>
                {tx("Review note")}
                <textarea
                  required
                  minLength={12}
                  maxLength={1000}
                  rows={3}
                  disabled={busy}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setPresetKey("");
                    setKey(createRequestId());
                  }}
                  placeholder={tx("Explain the checks and your decision…")}
                />
              </label>
              <p className={s.note}>
                {tx(
                  "At least 12 characters. Your note is recorded and sent to the account owner.",
                )}
              </p>
              {error && (
                <p role="alert" className={s.error}>
                  {tx(error)}
                </p>
              )}
              <div className={s.formActions}>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setError("");
                    query.refresh();
                  }}
                >
                  {tx("Reload details")}
                </Button>
                <Button
                  type="submit"
                  variant={effectiveAction === "REJECT" ? "danger" : "primary"}
                  disabled={
                    busy ||
                    note.trim().length < 12 ||
                    (effectiveAction === "APPROVE" && missingDocument)
                  }
                  leftIcon={<Check size={16} />}
                >
                  {tx(busy ? "Saving…" : "Save review")}
                </Button>
              </div>
            </form>
          ) : account.status === "VERIFIED" ? (
            <p className={s.success}>{tx("This account is verified.")}</p>
          ) : null}
          <History items={query.data?.reviews || []} onPreview={setPreview} />
        </>
      )}
      {preview && (
        <DocumentPreview
          document={preview}
          onClose={() => setPreview(undefined)}
        />
      )}
    </Dialog>
  );
}
function History({
  items,
  onPreview,
}: {
  items: {
    id: string;
    actorLabel: string;
    status: string;
    note: string;
    createdAt: string;
    document?: VerificationFile | null;
  }[];
  onPreview?: (document: VerificationFile) => void;
}) {
  const tx = useUiText();
  const date = useAdminDate();
  return (
    <section className={s.history}>
      <h3>{tx("Review history")}</h3>
      {items.length ? (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.actorLabel}</strong>
                <Status value={item.status} />
              </div>
              <p>{item.note}</p>
              <time dateTime={item.createdAt}>{date(item.createdAt)}</time>
              {item.document && onPreview && (
                <button
                  type="button"
                  className={s.reviewFile}
                  onClick={() => onPreview(item.document!)}
                >
                  {tx("Reviewed document: {0}", item.document.name)}
                </button>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className={s.note}>{tx("No reviews recorded yet.")}</p>
      )}
    </section>
  );
}
export function ReportDialog({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const tx = useUiText();
  const date = useAdminDate();
  const query = useAdminQuery<AdminReport>(
    `/api/admin/reports?id=${encodeURIComponent(id)}`,
  );
  const report = query.data;
  const [action, setAction] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const actions =
    report?.status === "SUBMITTED"
      ? report.blocksRescue === false
        ? ["UNDER_REVIEW", "RESUME"]
        : ["UNDER_REVIEW", "RESUME", "REJECT_FOOD"]
      : report?.status === "UNDER_REVIEW"
        ? report.blocksRescue === false
          ? ["RESUME"]
          : ["RESUME", "REJECT_FOOD"]
        : report?.status === "RESOLVED"
          ? ["CLOSE"]
          : [];
  const choice = actions.includes(action) ? action : actions[0] || "";
  const actionLabels: Record<string, string> = {
    UNDER_REVIEW: "Start review",
    RESUME: "Resolve and resume",
    REJECT_FOOD: "Reject food",
    CLOSE: "Close report",
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!report || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: choice, note }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not save the review. Try again.");
      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save the review. Try again.",
      );
      query.refresh();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={tx("Report review")}
      tone={
        choice === "REJECT_FOOD" || report?.decision === "REJECT_FOOD"
          ? "rose"
          : report?.status === "RESOLVED" || report?.status === "CLOSED"
            ? "emerald"
            : "amber"
      }
      onClose={onClose}
      busy={busy}
    >
      <Feedback query={query} />
      {report && (
        <>
          <div className={s.detailIntro}>
            <div>
              <h3>{report.title}</h3>
              <p>{tx(labels[report.type])}</p>
            </div>
            <Status value={report.status} />
            <Status value={report.severity} />
          </div>
          <p className={s.reportDescription}>{report.description}</p>
          <Details
            items={[
              [
                "Reported by",
                `${report.reporter} · ${tx(labels[report.reporterRole])}`,
              ],
              ["Submitted", date(report.createdAt)],
              ["Rescue reference", report.claimId],
              ["Decision", report.decision ? tx(labels[report.decision]) : ""],
            ]}
          />
          {report.evidenceUrls.length > 0 && (
            <div className={s.evidence}>
              <h3>{tx("Evidence")}</h3>
              {report.evidenceUrls.map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noreferrer">
                  {tx("View evidence {0}", index + 1)}
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
          {actions.length > 0 && (
            <form onSubmit={submit} className={s.reviewForm}>
              <label className={s.field}>
                {tx("Review action")}
                <select
                  aria-label={tx("Review action")}
                  value={choice}
                  disabled={busy}
                  onChange={(e) => setAction(e.target.value)}
                >
                  {actions.map((value) => (
                    <option key={value} value={value}>
                      {tx(actionLabels[value])}
                    </option>
                  ))}
                </select>
              </label>
              {choice === "REJECT_FOOD" && (
                <p className={s.warning}>
                  {tx(
                    "Rejecting food cancels a rescue that is on hold. Review the evidence before saving.",
                  )}
                </p>
              )}
              {choice === "RESUME" && (
                <p className={s.note}>
                  {tx(
                    "A rescue resumes only when all blocking reports are resolved and its safety deadline is valid.",
                  )}
                </p>
              )}
              <label className={s.field}>
                {tx("Review note")}
                <textarea
                  required
                  rows={3}
                  minLength={12}
                  maxLength={2000}
                  value={note}
                  disabled={busy}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={tx("Explain the checks and your decision…")}
                />
              </label>
              <p className={s.note}>
                {tx(
                  "At least 12 characters. Your note is recorded and shared with rescue participants.",
                )}
              </p>
              <div className={s.formActions}>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={query.refresh}
                >
                  {tx("Reload details")}
                </Button>
                <Button
                  type="submit"
                  variant={choice === "REJECT_FOOD" ? "danger" : "primary"}
                  disabled={busy || note.trim().length < 12}
                >
                  {tx(busy ? "Saving…" : "Save review")}
                </Button>
              </div>
            </form>
          )}
          <History items={report.reviews} />
        </>
      )}
      {error && (
        <p role="alert" className={s.error}>
          {tx(error)}
        </p>
      )}
    </Dialog>
  );
}
export function RescueDialog({
  rescue,
  onClose,
  onSaved,
}: {
  rescue: AdminRescue;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const tx = useUiText();
  const date = useAdminDate();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const expired = Date.parse(rescue.deadline) <= Date.now();
  const canClose =
    !["CANCELLED", "EXPIRED", "DISTRIBUTED"].includes(rescue.status) &&
    (rescue.distributionBlocked || expired || rescue.status === "DISPUTED");
  async function closeRescue(event: React.FormEvent) {
    event.preventDefault();
    if (!canClose || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/rescues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rescue.id, note }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not close this rescue. Try again.");
      onSaved?.();
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not close this rescue. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={tx("Rescue details")}
      tone={
        rescue.distributionBlocked || rescue.status === "CANCELLED"
          ? "rose"
          : expired || rescue.status === "EXPIRED" || rescue.status === "DISPUTED"
            ? "amber"
            : "emerald"
      }
      onClose={onClose}
      busy={busy}
    >
      <div className={s.detailIntro}>
        <div>
          <h3>{rescue.title}</h3>
          <p>{tx("{0} estimated meals", rescue.meals)}</p>
        </div>
        <Status value={rescue.status} />
      </div>
      <Details
        items={[
          ["Rescue reference", rescue.id],
          ["Created", date(rescue.createdAt)],
          ["Safe pickup deadline", date(rescue.deadline)],
          ["Route progress", tx(labels[rescue.routeStage])],
          ["Donor", rescue.donor],
          ["Pickup address", rescue.pickupAddress],
          ["Pickup contact", rescue.pickupContact],
          ["Pickup phone", rescue.pickupPhone],
          ["NGO", rescue.ngo],
          ["NGO phone", rescue.ngoPhone],
          ["Saved delivery address", rescue.deliveryAddress],
          ["Volunteer", rescue.volunteer],
          ["Volunteer phone", rescue.volunteerPhone],
        ]}
      />
      {rescue.distributionBlocked && (
        <p role="alert" className={s.error}>
          {tx("Receipt blocked distribution because food was marked damaged or poor.")}
        </p>
      )}
      {!rescue.distributionBlocked &&
        expired &&
        !["CANCELLED", "EXPIRED", "DISTRIBUTED"].includes(rescue.status) && (
          <p role="alert" className={s.error}>
            {tx("The safe food pickup deadline has passed.")}
          </p>
        )}
      {canClose && (
        <form onSubmit={closeRescue} className={s.reviewForm}>
          <div className={s.sectionLabel}>
            <ShieldCheck size={18} />
            <h3>{tx("Close unsafe or expired rescue")}</h3>
          </div>
          <label className={s.field}>
            {tx("Closure note")}
            <textarea
              required
              minLength={12}
              maxLength={1000}
              rows={3}
              disabled={busy}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={tx("Explain why this food cannot continue safely…")}
            />
          </label>
          {error && (
            <p role="alert" className={s.error}>
              {tx(error)}
            </p>
          )}
          <div className={s.formActions}>
            <Button
              type="submit"
              variant="danger"
              disabled={busy || note.trim().length < 12}
            >
              {tx(busy ? "Closing…" : "Discard and close rescue")}
            </Button>
          </div>
        </form>
      )}
      <p className={s.note}>
        {tx(
          "Meal quantities are donor estimates. Completed distribution totals come from NGO records.",
        )}
      </p>
    </Dialog>
  );
}
