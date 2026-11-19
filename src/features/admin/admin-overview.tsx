"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Users,
  Utensils,
} from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { AdminOverview, AdminRescue } from "@/lib/db/admin";
import { ROUTES } from "@/lib/routes";
import { AccountDialog, ReportDialog, RescueDialog } from "./admin-dialogs";
import {
  Empty,
  Feedback,
  labels,
  Status,
  useAdminDate,
  useAdminQuery,
} from "./admin-shared";
import s from "./admin.module.css";

function Panel({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle: string;
  href?: string;
  children: ReactNode;
}) {
  const tx = useUiText();
  return (
    <section className={s.panel}>
      <header className={s.panelHeader}>
        <div>
          <h2>{tx(title)}</h2>
          <p>{tx(subtitle)}</p>
        </div>
        {href && (
          <Link href={href}>
            {tx("View all")}
            <ArrowUpRight size={16} />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
export function AdminOverviewView() {
  const tx = useUiText();
  const date = useAdminDate();
  const query = useAdminQuery<AdminOverview>("/api/admin/overview");
  const [account, setAccount] = useState("");
  const [report, setReport] = useState("");
  const [rescue, setRescue] = useState<AdminRescue>();
  const [saved, setSaved] = useState(false);
  const data = query.data;
  const metrics = data
    ? [
        {
          label: "Pending accounts",
          value: data.pendingAccounts,
          caption: "Active accounts awaiting verification",
          icon: Users,
          href: ROUTES.admin.accounts,
          tone: "amber",
        },
        {
          label: "Active rescues",
          value: data.openRescues,
          caption: "From reservation to distribution",
          icon: HeartHandshake,
          href: ROUTES.admin.rescues,
          tone: "green",
        },
        {
          label: "Open reports",
          value: data.openReports,
          caption: "Submitted or under review",
          icon: CircleAlert,
          href: ROUTES.admin.reports,
          tone: "rose",
        },
        {
          label: "Meals distributed",
          value: data.mealsDistributed,
          caption: "Total recorded by NGOs",
          icon: Utensils,
          href: "/admin/rescues?status=DISTRIBUTED",
          tone: "blue",
        },
      ]
    : [];
  const onSaved = () => {
    query.refresh();
    setSaved(true);
  };
  return (
    <>
      <Feedback query={query} />
      {saved && (
        <p role="status" className={s.success}>
          {tx("Review saved successfully.")}
        </p>
      )}
      {data && (
        <>
          <div className={s.metrics}>
            {metrics.map(
              ({ label, value, caption, icon: Icon, href, tone }) => (
                <Link
                  href={href}
                  className={s.metric}
                  key={label}
                  data-tone={tone}
                >
                  <div className={s.metricTop}>
                    <span className={s.metricIcon}>
                      <Icon size={21} />
                    </span>
                    <ArrowUpRight size={18} />
                  </div>
                  <p>{tx(label)}</p>
                  <strong>{tx("{0}", value)}</strong>
                  <small>{tx(caption)}</small>
                </Link>
              ),
            )}
          </div>
          <div className={s.attention}>
            <span>
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2>{tx("Every decision helps a rescue move forward.")}</h2>
              <p>
                {tx("Start with pending accounts and open safety reports.")}
              </p>
            </div>
            <Link href={ROUTES.admin.accounts}>
              {tx("Review accounts")}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className={s.overviewGrid}>
            <Panel
              title="Account verification"
              subtitle="Oldest pending accounts first"
              href={ROUTES.admin.accounts}
            >
              {data.accounts.length ? (
                <div className={s.rows}>
                  {data.accounts.map((a) => (
                    <button
                      key={a.id}
                      className={s.accountRow}
                      onClick={() => setAccount(a.id)}
                    >
                      <span className={s.personIcon}>
                        {a.displayName.slice(0, 1)}
                      </span>
                      <span className={s.rowText}>
                        <strong>{a.displayName}</strong>
                        <small>{a.organization || a.email}</small>
                      </span>
                      <span className={s.rolePill}>{tx(labels[a.role])}</span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty>
                  {tx("All accounts are reviewed. You’re up to date.")}
                </Empty>
              )}
            </Panel>
            <Panel
              title="Active rescues"
              subtitle="Recent rescue activity"
              href={ROUTES.admin.rescues}
            >
              {data.rescues.length ? (
                <div className={s.rows}>
                  {data.rescues.map((r) => (
                    <button
                      key={r.id}
                      className={s.rescueRow}
                      onClick={() => setRescue(r)}
                    >
                      <span className={s.rowText}>
                        <strong>{r.title}</strong>
                        <small>
                          {r.donor} <span aria-hidden>→</span> {r.ngo}
                        </small>
                      </span>
                      <Status value={r.status} />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty>{tx("No active rescues at the moment.")}</Empty>
              )}
            </Panel>
            <Panel
              title="Reports requiring attention"
              subtitle="Oldest unresolved reports first"
              href={ROUTES.admin.reports}
            >
              {data.reports.length ? (
                <div className={s.rows}>
                  {data.reports.map((r) => (
                    <button
                      key={r.id}
                      className={s.reportRow}
                      onClick={() => setReport(r.id)}
                    >
                      <span className={s.reportIcon}>
                        <CircleAlert size={19} />
                      </span>
                      <span className={s.rowText}>
                        <strong>{tx(labels[r.type])}</strong>
                        <small>{r.title}</small>
                      </span>
                      <Status value={r.severity} />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty>
                  {tx("No open reports. All concerns are addressed.")}
                </Empty>
              )}
            </Panel>
            <Panel
              title="Recent decisions"
              subtitle="Recorded account and report reviews"
            >
              {data.activity.length ? (
                <ol className={s.activity}>
                  {data.activity.map((a) => (
                    <li key={a.id}>
                      <span className={s.activityDot}>
                        <Clock3 size={14} />
                      </span>
                      <div>
                        <strong>{a.subject}</strong>
                        <p>
                          {a.actor} · {tx(labels[a.action])}
                        </p>
                        <time dateTime={a.createdAt}>{date(a.createdAt)}</time>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty>
                  {tx("Decisions will appear here after your first review.")}
                </Empty>
              )}
            </Panel>
          </div>
        </>
      )}
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
