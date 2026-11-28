"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useMockAuth } from "@/features/auth/mock-auth";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/lib/routes";

interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "COORDINATOR", label: "Rescue Coordinator" },
  { value: "FIELD_STAFF", label: "Field Distribution Staff" },
  { value: "VIEWER", label: "Audit Viewer" },
];

export function NGOTeam() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("COORDINATOR");
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; message: string }>();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch("/api/ngo/team", { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Team list could not load.");
        if (!controller.signal.aborted) setMembers(data.members ?? []);
      } catch (error) {
        if (!controller.signal.aborted) setNotice({
          tone: "danger",
          message: error instanceof Error ? error.message : "Could not load team.",
        });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  async function addMember(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(undefined);
    try {
      const res = await fetch("/api/ngo/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add team member.");
      setMembers((prev) => [...prev, data.member]);
      setName("");
      setEmail("");
      setNotice({ tone: "success", message: "Team member saved to organization roster." });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "Could not add team member.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(id: string) {
    setBusy(true);
    setNotice(undefined);
    try {
      const res = await fetch(`/api/ngo/team?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove member.");
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setNotice({ tone: "success", message: "Team member removed." });
    } catch (error) {
      setNotice({
        tone: "danger",
        message: error instanceof Error ? error.message : "Could not remove member.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.team}
      title={tx("Team & permissions")}
      description={tx("Manage NGO coordinators and field staff stored in PostgreSQL.")}
      profileName={session?.displayName || "NGO"}
      notificationHref={ROUTES.ngo.notifications}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start">
        <Card>
          <CardHeader
            title={tx("Organization roster")}
            description={tx("Primary owner plus assigned rescue coordinators.")}
            action={<Users className="size-5 text-sky-700" />}
          />
          <CardContent className="grid gap-3">
            {notice && <Alert tone={notice.tone} title={tx(notice.message)} />}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700 text-sm font-bold text-white">
                  {(session?.displayName || "N").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-900">
                    {session?.displayName || "Organization Lead"}
                  </p>
                  <p className="truncate text-xs text-muted-600">{session?.email}</p>
                </div>
              </div>
              <Badge tone="success">
                <ShieldCheck className="mr-1 size-3.5" />
                {tx("OWNER")}
              </Badge>
            </div>

            {loading ? (
              <LoadingSpinner label={tx("Loading team members…")} />
            ) : members.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted-600">
                {tx("No additional staff added yet. Add a coordinator or field member on the right.")}
              </p>
            ) : (
              <div className="divide-y divide-line">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900">{member.name}</p>
                      <p className="text-xs text-muted-600">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="info">{tx(member.role.replace("_", " "))}</Badge>
                      <Badge tone="neutral">{tx(member.status)}</Badge>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeMember(member.id)}
                        aria-label={`${tx("Remove")} ${member.name}`}
                        className="grid size-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={tx("Add team member")}
            description={tx("Assign coordinators for pickup & shelter distribution.")}
            action={<UserPlus className="size-5 text-sky-700" />}
          />
          <CardContent>
            <form onSubmit={addMember} className="grid gap-4">
              <Input
                label={tx("Full name")}
                placeholder="e.g. Farhana Akter"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label={tx("Email address")}
                type="email"
                placeholder="coordinator@ngo.org"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select
                label={tx("Access role")}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {tx(opt.label)}
                  </option>
                ))}
              </Select>
              <Button
                type="submit"
                disabled={busy}
                leftIcon={<UserPlus className="size-4" />}
              >
                {busy ? tx("Saving…") : tx("Add to NGO team")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
