"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type {
  AdminAccount,
  AdminPage,
  AdminReport,
  AdminRescue,
} from "@/lib/db/admin";
import { UserControlLinks } from "./admin-users";
import { AccountDialog, ReportDialog, RescueDialog } from "./admin-dialogs";
import {
  Empty,
  Feedback,
  labels,
  Pager,
  Status,
  useAdminDate,
  useAdminQuery,
} from "./admin-shared";
import s from "./admin.module.css";

const statusOptions = {
  accounts: ["PENDING", "REJECTED"],
  rescues: [
    "ACTIVE",
    "RESERVED",
    "ASSIGNED",
    "PICKED_UP",
    "DELIVERED",
    "DISPUTED",
    "DISTRIBUTED",
    "CANCELLED",
    "EXPIRED",
    "ALL",
  ],
  reports: ["OPEN", "SUBMITTED", "UNDER_REVIEW", "RESOLVED", "CLOSED", "ALL"],
};
const filterLabels: Record<string, string> = {
  ALL: "All statuses",
  ACTIVE: "Active rescues",
  OPEN: "Open reports",
};
export function AdminListView({
  kind,
}: {
  kind: "accounts" | "rescues" | "reports";
}) {
  const tx = useUiText();
  const date = useAdminDate();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(() => {
    const requested = searchParams.get("status") || "";
    return statusOptions[kind].includes(requested)
      ? requested
      : statusOptions[kind][0];
  });
  const [role, setRole] = useState("ALL");
  const [page, setPage] = useState(1);
  const url = `/api/admin/${kind}?${new URLSearchParams({ q, status, page: String(page), ...(kind === "accounts" ? { role } : {}) })}`;
  const query =
    useAdminQuery<AdminPage<AdminAccount | AdminRescue | AdminReport>>(url);
  const [account, setAccount] = useState("");
  const [report, setReport] = useState("");
  const [rescue, setRescue] = useState<AdminRescue>();
  const [saved, setSaved] = useState(false);
  const onSaved = () => {
    query.refresh();
    setSaved(true);
  };
  const rows = query.data?.items || [];
  return (
    <>
      {kind === "accounts" && <><UserControlLinks current="verifications"/><p className={s.userIntro}>{tx("Review accounts awaiting a decision here. Use All Users to ban, unblock or delete an account.")}</p></>}
      <section className={s.panel}>
        <form
          className={s.filters}
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQ(search.trim());
          }}
        >
          <Input
            label={tx("Search")}
            leftIcon={<Search size={17} />}
            placeholder={
              kind === "accounts"
                ? "Name, organization or email"
                : kind === "rescues"
                  ? "Food title or NGO"
                  : "Food title or report details"
            }
            maxLength={120}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className={s.field}>
            {tx("Status")}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              {statusOptions[kind].map((value) => (
                <option key={value} value={value}>
                  {tx(filterLabels[value] || labels[value])}
                </option>
              ))}
            </select>
          </label>
          {kind === "accounts" && (
            <label className={s.field}>
              {tx("Role")}
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
              >
                {["ALL", "DONOR", "NGO", "VOLUNTEER"].map((value) => (
                  <option key={value} value={value}>
                    {tx(value === "ALL" ? "All roles" : labels[value])}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button type="submit" variant="outline">
            {tx("Search")}
          </Button>
        </form>
        {saved && (
          <p role="status" className={s.success}>
            {tx("Review saved successfully.")}
          </p>
        )}
        <Feedback query={query} />
        {query.data && (
          <>
            {rows.length ? (
              <table className={s.table}>
                <caption className="sr-only">
                  {tx(
                    kind === "accounts"
                      ? "Account verification queue"
                      : kind === "rescues"
                        ? "Rescue records"
                        : "Incident reports",
                  )}
                </caption>
                <thead>
                  <tr>
                    <th>
                      {tx(
                        kind === "accounts"
                          ? "Account"
                          : kind === "rescues"
                            ? "Rescue"
                            : "Report",
                      )}
                    </th>
                    <th>
                      {tx(
                        kind === "accounts"
                          ? "Role"
                          : kind === "rescues"
                            ? "Destination"
                            : "Severity",
                      )}
                    </th>
                    <th>{tx("Status")}</th>
                    <th>{tx(kind === "accounts" ? "Joined" : "Created")}</th>
                    <th>
                      <span className="sr-only">{tx("Action")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {"email" in row ? (
                          <>
                            <strong>{row.displayName}</strong>
                            <small>{row.organization || row.email}</small>
                            {!row.isActive && (
                              <small>{tx("Inactive account")}</small>
                            )}
                          </>
                        ) : "donor" in row ? (
                          <>
                            <strong>{row.title}</strong>
                            <small>
                              {row.donor} ·{" "}
                              {tx("{0} estimated meals", row.meals)}
                            </small>
                          </>
                        ) : (
                          <>
                            <strong>{tx(labels[row.type])}</strong>
                            <small>{row.title}</small>
                          </>
                        )}
                      </td>
                      <td>
                        {"email" in row ? (
                          <span className={s.rolePill}>
                            {tx(labels[row.role])}
                          </span>
                        ) : "donor" in row ? (
                          row.ngo
                        ) : (
                          <Status value={row.severity} />
                        )}
                      </td>
                      <td>
                        <Status value={row.status} />
                      </td>
                      <td>
                        <time dateTime={row.createdAt}>
                          {date(row.createdAt)}
                        </time>
                      </td>
                      <td>
                        <button
                          className={s.rowAction}
                          aria-label={tx(
                            "Review {0}",
                            "email" in row ? row.displayName : row.title,
                          )}
                          onClick={() =>
                            "email" in row
                              ? setAccount(row.id)
                              : "donor" in row
                                ? setRescue(row)
                                : setReport(row.id)
                          }
                        >
                          {tx(
                            "email" in row || "type" in row
                              ? "Review"
                              : "Details",
                          )}
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty>{tx("No records match these filters.")}</Empty>
            )}
            <Pager
              page={page}
              pageSize={query.data.pageSize}
              total={query.data.total}
              onPage={setPage}
            />
          </>
        )}
      </section>
      {account && (
        <AccountDialog
          id={account}
          onClose={() => setAccount("")}
          onSaved={onSaved}
        />
      )}
      {report && (
        <ReportDialog
          id={report}
          onClose={() => setReport("")}
          onSaved={onSaved}
        />
      )}
      {rescue && (
        <RescueDialog rescue={rescue} onClose={() => setRescue(undefined)} />
      )}
    </>
  );
}
