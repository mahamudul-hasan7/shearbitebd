"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, ShieldCheck, Users, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import type { ManagedUser } from "@/lib/db/admin-users";
import type { AdminPage } from "@/lib/db/admin";
import {
  Empty,
  Feedback,
  Pager,
  Status,
  labels,
  useAdminDate,
  useAdminQuery,
} from "./admin-shared";
import { UserAccessDialog } from "./user-access-dialog";
import s from "./admin.module.css";

export function UserControlLinks({
  current,
}: {
  current: "verifications" | "users";
}) {
  const tx = useUiText();
  return (
    <nav className={s.userTabs} aria-label={tx("User control")}>
      <Link
        href={ROUTES.admin.verifications}
        aria-current={current === "verifications" ? "page" : undefined}
      >
        <ShieldCheck size={19} />
        <span>
          {tx("Verification Requests")}
          <small>{tx("Review pending documents")}</small>
        </span>
      </Link>
      <Link
        href={ROUTES.admin.users}
        aria-current={current === "users" ? "page" : undefined}
      >
        <Users size={19} />
        <span>
          {tx("All Users")}
          <small>{tx("Manage account access")}</small>
        </span>
      </Link>
    </nav>
  );
}
export function AdminUsers() {
  const tx = useUiText(),
    date = useAdminDate();
  const [search, setSearch] = useState(""),
    [q, setQ] = useState(""),
    [role, setRole] = useState("ALL"),
    [access, setAccess] = useState("ALL"),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState("");
  const [saved, setSaved] = useState(false);
  const query = useAdminQuery<AdminPage<ManagedUser>>(
    `/api/admin/users?${new URLSearchParams({ q, role, access, page: String(page) })}`,
  );
  return (
    <>
      <UserControlLinks current="users" />
      <p className={s.userIntro}>
        {tx(
          "Search every donor, NGO and volunteer. Verification and account access are managed separately.",
        )}
      </p>
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
            placeholder={tx("Name, organization, email or phone")}
            leftIcon={<Search size={17} />}
            maxLength={120}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className={s.field}>
            {tx("Account access")}
            <select
              value={access}
              onChange={(e) => {
                setAccess(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">{tx("All current users")}</option>
              <option value="ACTIVE">{tx("Active")}</option>
              <option value="BANNED">{tx("Banned")}</option>
              <option value="DELETED">{tx("Deleted accounts")}</option>
            </select>
          </label>
          <label className={s.field}>
            {tx("Role")}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">{tx("All roles")}</option>
              {["DONOR", "NGO", "VOLUNTEER"].map((r) => (
                <option key={r} value={r}>
                  {tx(labels[r])}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit">{tx("Search")}</Button>
        </form>
        {saved && (
          <p className={s.success} role="status">
            {tx("Account access updated.")}
          </p>
        )}
        <Feedback query={query} />
        {query.data && (
          <>
            {query.data.items.length ? (
              <table className={`${s.table} ${s.usersTable}`}>
                <thead>
                  <tr>
                    <th>{tx("User")}</th>
                    <th>{tx("Role")}</th>
                    <th>{tx("Account access")}</th>
                    <th>{tx("Verification")}</th>
                    <th>{tx("Joined")}</th>
                    <th>
                      <span className="sr-only">{tx("Actions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.displayName}</strong>
                        <small>{user.organization}</small>
                        <small>{user.email || tx("Deleted account")}</small>
                      </td>
                      <td>
                        <span className={s.rolePill}>
                          {tx(labels[user.role])}
                        </span>
                      </td>
                      <td>
                        <Status value={user.access} />
                      </td>
                      <td>
                        <Status value={user.verification} />
                      </td>
                      <td>
                        <time dateTime={user.createdAt}>
                          {date(user.createdAt)}
                        </time>
                      </td>
                      <td>
                        <button
                          className={s.rowAction}
                          aria-label={tx("Manage {0}", user.displayName)}
                          onClick={() => setSelected(user.id)}
                        >
                          {tx(user.access === "DELETED" ? "History" : "Manage")}
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty>{tx("No users match these filters.")}</Empty>
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
      {selected && (
        <UserAccessDialog
          key={selected}
          id={selected}
          onClose={() => setSelected("")}
          onSaved={() => {
            query.refresh();
            setSaved(true);
          }}
        />
      )}
    </>
  );
}
