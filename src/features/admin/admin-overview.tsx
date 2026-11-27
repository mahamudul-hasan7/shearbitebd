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
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  href?: string;
  badge?: ReactNode;
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
        {badge}
        {href && (
          <Link href={href}>
            {tx("View all")}
            <ArrowUpRight size={15} />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function decisionDotTone(action: string): "success" | "danger" | "warning" {
  if (["VERIFIED", "RESUME", "RESOLVED", "UNBAN"].includes(action))
    return "success";
  if (["REJECTED", "REJECT_FOOD", "BAN", "DELETE"].includes(action))
    return "danger";
  return "warning";
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

  const onSaved = () => {
    query.refresh();
    setSaved(true);
  };

  const metrics = data
    ? [
        {
          label: "Pending accounts",
          value: data.pendingAccounts,
          note: "Active accounts awaiting verification",
          href: ROUTES.admin.accounts,
          tone: "amber",
          icon: Users,
        },
        {
          label: "Active rescues",
          value: data.openRescues,
          note: "From reservation to distribution",
          href: ROUTES.admin.rescues,
          tone: "emerald",
          icon: HeartHandshake,
        },
        {
          label: "Open reports",
          value: data.openReports,
          note: "Submitted or under review",
          href: ROUTES.admin.reports,
          tone: "rose",
          icon: CircleAlert,
        },
        {
          label: "Meals distributed",
          value: data.mealsDistributed,
          note: "Total recorded by NGOs",
          href: "/admin/rescues?status=DISTRIBUTED",
          tone: "blue",
          icon: Utensils,
        },
      ]
    : [];

  const attention = data
    ? data.openReports > 0
      ? {
          priority: "urgent" as const,
          title: "Safety reports require your review.",
          note: "Resolve open concerns to keep active rescues moving safely.",
          cta: "Review reports",
          href: ROUTES.admin.reports,
          icon: CircleAlert,
        }
      : data.pendingAccounts > 0
        ? {
            priority: "normal" as const,
            title: "Every decision helps a rescue move forward.",
            note: "Start with pending accounts and open safety reports.",
            cta: "Review accounts",
            href: ROUTES.admin.accounts,
            icon: ShieldCheck,
          }
        : {
            priority: "clear" as const,
            title: "Verification and safety queues are clear.",
            note: "Follow active rescues and verified meal distributions across Dhaka.",
            cta: "View rescues",
            href: ROUTES.admin.rescues,
            icon: ShieldCheck,
          }
    : null;

  const posted = data?.funnel.posted ?? 0;
  const completionPct =
    posted > 0 && data
      ? Math.min(100, Math.round((data.funnel.distributed / posted) * 100))
      : 0;
  const maxZoneMeals = data?.zones.length
    ? Math.max(
        1,
        ...data.zones.map((item) =>
          Math.max(item.surplusMeals, item.demandMeals),
        ),
      )
    : 1;

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
              ({ label, value, note, href, tone, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className={s.metric}
                  data-tone={tone}
                >
                  <div className={s.metricTop}>
                    <span className={s.metricIcon}>
                      <Icon size={20} />
                    </span>
                    <ArrowUpRight size={17} />
                  </div>
                  <p>{tx(label)}</p>
                  <strong>{value.toLocaleString("en-US")}</strong>
                  <small>{tx(note)}</small>
                </Link>
              ),
            )}
          </div>

          {attention && (
            <div className={s.attention} data-priority={attention.priority}>
              <span>
                <attention.icon size={21} />
              </span>
              <div>
                <h2>{tx(attention.title)}</h2>
                <p>{tx(attention.note)}</p>
              </div>
              <Link href={attention.href}>
                {tx(attention.cta)}
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className={s.analyticsGrid}>
            <Panel
              title="Rescue conversion funnel"
              subtitle="Live pipeline from published food to verified distribution"
              badge={
                <span className={s.panelBadge}>
                  {tx("Conversion rate")}: {completionPct}%
                </span>
              }
            >
              <div className={s.funnelBody}>
                {[
                  {
                    label: "Food batches posted",
                    value: data.funnel.posted,
                    tone: "emerald",
                  },
                  {
                    label: "Claimed by NGOs",
                    value: data.funnel.claimed,
                    tone: "teal",
                  },
                  {
                    label: "Verified pickup",
                    value: data.funnel.pickedUp,
                    tone: "sky",
                  },
                  {
                    label: "Distributed to people",
                    value: data.funnel.distributed,
                    tone: "amber",
                  },
                ].map((step) => {
                  const pct =
                    posted > 0
                      ? Math.min(100, Math.round((step.value / posted) * 100))
                      : 0;
                  const fillWidth = step.value > 0 ? Math.max(4, pct) : 0;
                  return (
                    <div key={step.label} className={s.funnelRow}>
                      <div className={s.funnelMeta}>
                        <span className={s.funnelLabel}>{tx(step.label)}</span>
                        <span className={s.funnelValue}>
                          {step.value.toLocaleString("en-US")} ({pct}%)
                        </span>
                      </div>
                      <div className={s.progressTrack}>
                        <div
                          className={s.progressFill}
                          data-tone={step.tone}
                          style={{ width: `${fillWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel
              title="Dhaka zone supply vs demand"
              subtitle="Meals posted vs NGO demand by area"
              href="/admin/rescues?status=ALL"
            >
              {data.zones.length ? (
                <div className={s.zoneBody}>
                  {data.zones.map((z) => {
                    const supplyPct = Math.min(
                      100,
                      Math.round((z.surplusMeals / maxZoneMeals) * 100),
                    );
                    const demandPct = Math.min(
                      100,
                      Math.round((z.demandMeals / maxZoneMeals) * 100),
                    );
                    const supplyWidth =
                      z.surplusMeals > 0 ? Math.max(4, supplyPct) : 0;
                    const demandWidth =
                      z.demandMeals > 0 ? Math.max(4, demandPct) : 0;
                    const highDemand = z.demandMeals > z.surplusMeals;
                    return (
                      <div key={z.zone} className={s.zoneCard}>
                        <div className={s.zoneHead}>
                          <strong>{z.zone}</strong>
                          <div className={s.zonePills}>
                            <span className={s.zoneBatchPill}>
                              {tx("{0} batches", z.batches)}
                            </span>
                            {highDemand && (
                              <span className={s.zoneAlertPill}>
                                {tx("High NGO demand")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={s.zoneBars}>
                          <div className={s.zoneMetricRow}>
                            <span className={s.zoneMetricLabel}>
                              {tx("Surplus")}
                            </span>
                            <div className={s.progressTrack}>
                              <div
                                className={s.progressFill}
                                data-tone="emerald"
                                style={{ width: `${supplyWidth}%` }}
                              />
                            </div>
                            <span className={s.zoneMetricValue}>
                              {z.surplusMeals.toLocaleString("en-US")}
                            </span>
                          </div>
                          <div className={s.zoneMetricRow}>
                            <span className={s.zoneMetricLabel}>
                              {tx("Demand")}
                            </span>
                            <div className={s.progressTrack}>
                              <div
                                className={s.progressFill}
                                data-tone="sky"
                                style={{ width: `${demandWidth}%` }}
                              />
                            </div>
                            <span className={s.zoneMetricValue}>
                              {z.demandMeals.toLocaleString("en-US")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty>{tx("Zone metrics appear once donations are posted.")}</Empty>
              )}
            </Panel>
          </div>

          <div className={s.overviewGrid}>
            <Panel
              title="Account verification"
              subtitle="Ready for review first, oldest next"
              href={ROUTES.admin.accounts}
            >
              {data.accounts.length ? (
                <div className={s.rows}>
                  {data.accounts.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={s.accountRow}
                      onClick={() => setAccount(a.id)}
                    >
                      <span className={s.personIcon}>
                        {a.displayName.slice(0, 1).toUpperCase()}
                      </span>
                      <span className={s.rowText}>
                        <strong>{a.displayName}</strong>
                        <small>{a.organization || a.email}</small>
                      </span>
                      {a.status === "NOT_SUBMITTED" ? (
                        <Status value={a.status} />
                      ) : (
                        <span className={s.rolePill}>
                          {tx(labels[a.role] || a.role)}
                        </span>
                      )}
                      <ArrowUpRight size={15} />
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
              subtitle="Held rescues and urgent deadlines first"
              href={ROUTES.admin.rescues}
            >
              {data.rescues.length ? (
                <div className={s.rows}>
                  {data.rescues.map((r) => {
                    const contextNote = r.distributionBlocked
                      ? tx("Distribution held")
                      : !r.volunteer
                        ? tx("No driver assigned")
                        : r.volunteer;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={s.rescueRow}
                        onClick={() => setRescue(r)}
                      >
                        <span className={s.rowText}>
                          <strong>{r.title}</strong>
                          <small>
                            {r.donor} → {r.ngo} · {tx("{0} meals", r.meals)} ·{" "}
                            {contextNote}
                          </small>
                        </span>
                        <Status value={r.status} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Empty>{tx("No active rescues at the moment.")}</Empty>
              )}
            </Panel>

            <Panel
              title="Reports requiring attention"
              subtitle="Urgent and rescue-blocking reports first"
              href={ROUTES.admin.reports}
            >
              {data.reports.length ? (
                <div className={s.rows}>
                  {data.reports.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={s.reportRow}
                      onClick={() => setReport(r.id)}
                    >
                      <span className={s.reportIcon}>
                        <CircleAlert size={18} />
                      </span>
                      <span className={s.rowText}>
                        <strong>{tx(labels[r.type] || r.type)}</strong>
                        <small>
                          {r.title} · {tx(labels[r.status] || r.status)}
                          {r.blocksRescue ? ` · ${tx("Rescue on hold")}` : ""}
                        </small>
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
              subtitle="Account, report and access actions"
            >
              {data.activity.length ? (
                <ol className={s.activity}>
                  {data.activity.map((a) => (
                    <li key={a.id}>
                      <span
                        className={s.activityDot}
                        data-tone={decisionDotTone(a.action)}
                      >
                        <Clock3 size={14} />
                      </span>
                      <div>
                        <strong>{a.subject}</strong>
                        <p>
                          {a.actor} · {tx(labels[a.action] || a.action)}
                        </p>
                        <time>{date(a.createdAt)}</time>
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
        <RescueDialog
          rescue={rescue}
          onClose={() => setRescue(undefined)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
