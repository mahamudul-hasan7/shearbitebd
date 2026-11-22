"use client";
import { createRequestId } from "@/lib/request-id";
import Link from "next/link";
import { useState } from "react";
import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import type { ManagedUserDetail } from "@/lib/db/admin-users";
import {
  Details,
  Dialog,
  Feedback,
  Status,
  labels,
  useAdminDate,
  useAdminQuery,
} from "./admin-shared";
import s from "./admin.module.css";

export function UserAccessDialog({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const tx = useUiText(),
    date = useAdminDate();
  const query = useAdminQuery<ManagedUserDetail>(
    `/api/admin/users?id=${encodeURIComponent(id)}`,
  );
  const [action, setAction] = useState<"BAN" | "UNBAN" | "DELETE">();
  const [note, setNote] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [retry, setRetry] = useState<{ signature: string; key: string }>();
  const data = query.data,
    user = data?.user;
  const blocked = action === "DELETE" && !!data?.activity.activeRescues;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !action || busy || blocked) return;
    const payload = {
      id,
      action,
      note: note.trim(),
      expectedVersion: user.version,
      confirmation,
    };
    const signature = JSON.stringify(payload),
      submissionKey =
        retry?.signature === signature ? retry.key : createRequestId();
    setRetry({ signature, key: submissionKey });
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionKey }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not update account access.");
      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update account access.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={user?.displayName || tx("Manage user")}
      onClose={onClose}
      busy={busy}
    >
      <Feedback query={query} />
      {user && data && (
        <>
          <div className={s.accessBadges}>
            <Status value={user.access} />
            <Status value={user.verification} />
          </div>
          <Details
            items={[
              ["Role", tx(labels[user.role])],
              ["Email", user.email],
              ["Phone", user.phone],
              ["Organization", user.organization],
              ["Joined", date(user.createdAt)],
            ]}
          />
          <div className={s.activitySummary}>
            <span>
              <strong>{data.activity.activeRescues}</strong>
              {tx("Active rescues")}
            </span>
            <span>
              <strong>{data.activity.openDonations}</strong>
              {tx("Open donations")}
            </span>
            <span>
              <strong>{data.activity.openRequests}</strong>
              {tx("Open food requests")}
            </span>
          </div>
          {user.access === "DELETED" ? (
            <p className={s.note}>
              {tx(
                "This account was permanently removed. Its rescue and review history is retained.",
              )}
            </p>
          ) : (
            <>
              {user.verification !== "VERIFIED" && (
                <Link className={s.rowAction} href={ROUTES.admin.verifications}>
                  {tx("Review verification separately")} →
                </Link>
              )}
              <div
                className={s.accessChoices}
                role="group"
                aria-label={tx("Choose an account action")}
              >
                <button
                  type="button"
                  aria-pressed={
                    action === (user.access === "ACTIVE" ? "BAN" : "UNBAN")
                  }
                  disabled={busy}
                  onClick={() => {
                    setAction(user.access === "ACTIVE" ? "BAN" : "UNBAN");
                    setError("");
                  }}
                >
                  {user.access === "ACTIVE" ? (
                    <Ban size={19} />
                  ) : (
                    <ShieldCheck size={19} />
                  )}
                  <strong>
                    {tx(user.access === "ACTIVE" ? "Ban / Block" : "Unban")}
                  </strong>
                  <small>
                    {tx(
                      user.access === "ACTIVE"
                        ? "Stop login and revoke all sessions"
                        : "Allow the user to sign in again",
                    )}
                  </small>
                </button>
                <button
                  type="button"
                  data-danger="true"
                  aria-pressed={action === "DELETE"}
                  disabled={busy}
                  onClick={() => {
                    setAction("DELETE");
                    setError("");
                  }}
                >
                  <Trash2 size={19} />
                  <strong>{tx("Delete account")}</strong>
                  <small>{tx("Permanently remove account access")}</small>
                </button>
              </div>
              {action && (
                <form className={s.reviewForm} onSubmit={submit}>
                  <h3>
                    {tx(
                      action === "DELETE"
                        ? "Confirm account deletion"
                        : action === "BAN"
                          ? "Confirm ban"
                          : "Confirm unban",
                    )}
                  </h3>
                  <p className={s.note}>
                    {tx(
                      action === "DELETE"
                        ? "Login will be permanently removed. Open donations and food requests will be cancelled. Rescue records, contact details and review history are retained; this cannot be undone."
                        : action === "BAN"
                          ? "All sessions will end immediately. Verification and rescue records stay unchanged. Active rescues may need your attention."
                          : "The user can sign in again. Previous sessions stay revoked and verification status is unchanged.",
                    )}
                  </p>
                  {blocked && (
                    <p className={s.warning} role="alert">
                      {tx(
                        "Resolve {0} active rescues before deleting this account.",
                        data.activity.activeRescues,
                      )}
                    </p>
                  )}
                  <label className={s.field}>
                    {tx("Reason")}
                    <textarea
                      required
                      minLength={12}
                      maxLength={1000}
                      rows={3}
                      value={note}
                      disabled={busy}
                      placeholder={tx(
                        "Explain the reason in at least 12 characters",
                      )}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  {action === "DELETE" && (
                    <Input
                      label={tx("Type DELETE to confirm")}
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      autoComplete="off"
                      disabled={busy}
                      required
                    />
                  )}
                  {error && (
                    <div className={s.error} role="alert">
                      <p>{tx(error)}</p>
                      <button
                        type="button"
                        className={s.rowAction}
                        onClick={() => {
                          query.refresh();
                          setAction(undefined);
                          setError("");
                        }}
                      >
                        {tx("Reload details")}
                      </button>
                    </div>
                  )}
                  <div className={s.accessFooter}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setAction(undefined)}
                    >
                      {tx("Cancel")}
                    </Button>
                    <Button
                      type="submit"
                      variant={action === "UNBAN" ? "primary" : "danger"}
                      disabled={
                        busy ||
                        blocked ||
                        note.trim().length < 12 ||
                        (action === "DELETE" && confirmation !== "DELETE")
                      }
                    >
                      {tx(
                        busy
                          ? "Saving…"
                          : action === "DELETE"
                            ? "Delete permanently"
                            : action === "BAN"
                              ? "Confirm ban"
                              : "Confirm unban",
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
          <section className={s.history}>
            <h3>{tx("Account access history")}</h3>
            {data.history.length ? (
              <ol>
                {data.history.map((h) => (
                  <li key={h.id}>
                    <div>
                      <strong>{h.actorLabel}</strong>
                      <Status value={h.action} />
                    </div>
                    <p>{h.note}</p>
                    <time dateTime={h.createdAt}>{date(h.createdAt)}</time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={s.note}>{tx("No account access changes yet.")}</p>
            )}
          </section>
        </>
      )}
    </Dialog>
  );
}
