"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Clock3,
  Edit3,
  FileCheck2,
  Globe,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { RoleBadge } from "@/components/portal/role-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface NotificationPrefs {
  liveUpdates: boolean;
  deadlineAlerts: boolean;
  silentCelebrations: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  liveUpdates: true,
  deadlineAlerts: true,
  silentCelebrations: true,
};

function readPrefs(role: "donor" | "ngo"): NotificationPrefs {
  try {
    const raw = localStorage.getItem(`sharebite_alert_prefs_${role}`);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      liveUpdates: parsed.liveUpdates ?? true,
      deadlineAlerts: parsed.deadlineAlerts ?? true,
      silentCelebrations: parsed.silentCelebrations ?? true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function createPreferencesStore(role: "donor" | "ngo") {
  let value = DEFAULT_PREFS;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => value,
    subscribe(listener: () => void) {
      listeners.add(listener);
      value = readPrefs(role);
      listener();
      return () => { listeners.delete(listener); };
    },
    toggle(key: keyof NotificationPrefs) {
      value = { ...value, [key]: !value[key] };
      try {
        localStorage.setItem(`sharebite_alert_prefs_${role}`, JSON.stringify(value));
      } catch {
        // Keep the current page's preference usable when browser storage is full.
      }
      listeners.forEach(listener => listener());
    },
  };
}

export function AccountSettingsView({ role }: { role: "donor" | "ngo" }) {
  const tx = useUiText();
  const { session, signOut } = useMockAuth();
  const routes = role === "donor" ? ROUTES.donor : ROUTES.ngo;
  const profileRoute = role === "donor" ? ROUTES.donor.profile : ROUTES.ngo.profile;
  const preferences = useMemo(() => createPreferencesStore(role), [role]);
  const prefs = useSyncExternalStore(preferences.subscribe, preferences.getSnapshot, () => DEFAULT_PREFS);
  const [savedToast, setSavedToast] = useState(false);

  function togglePref(key: keyof NotificationPrefs) {
    preferences.toggle(key);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1800);
  }

  const displayName =
    session?.displayName ||
    (role === "donor" ? "Donor account" : "NGO account");
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || (role === "donor" ? "FD" : "NG");

  const accountLinks = [
    { href: profileRoute, label: "View full profile", icon: ShieldCheck },
    { href: routes.editProfile, label: "Edit profile", icon: Edit3 },
    { href: routes.addresses, label: "Manage addresses & pins", icon: MapPin },
    ...(role === "ngo"
      ? [
          { href: ROUTES.ngo.team, label: "Team & permissions", icon: UsersRound },
          { href: ROUTES.ngo.verification, label: "Verification", icon: FileCheck2 },
        ]
      : []),
    { href: routes.support, label: "Help & support", icon: CircleHelp },
  ];

  return (
    <PortalShell
      role={role}
      activeHref={routes.settings}
      title={tx("Account settings")}
      description={tx("Manage language, live rescue alerts, and account preferences.")}
      profileName={displayName}
      avatarInitials={initials}
      notificationHref={routes.notifications}
      actions={
        <ButtonLink href={profileRoute} size="sm" variant="outline">
          {tx("View full profile")}
        </ButtonLink>
      }
    >
      <div className="grid gap-6">
        {/* 1. Account Identity Snapshot */}
        <Card className="border-slate-200/90">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar
                initials={initials}
                size="lg"
                className={cn(
                  "shrink-0 text-white shadow-sm",
                  role === "donor"
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-800"
                    : "bg-gradient-to-br from-[#2c4869] to-[#193b63]",
                )}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-ink-900 sm:text-xl">
                    {displayName}
                  </h2>
                  <RoleBadge role={role} />
                </div>
                <p className="mt-1 truncate text-sm text-muted-600">
                  {session?.email || tx("Authenticated workspace session")}
                </p>
              </div>
            </div>
            <ButtonLink
              href={routes.editProfile}
              size="sm"
              variant="outline"
              leftIcon={<Edit3 className="size-4" />}
            >
              {tx("Edit profile")}
            </ButtonLink>
          </CardContent>
        </Card>

        {/* 2. Two-Column Settings Workspace */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            {/* Language Preference */}
            <Card className="border-slate-200/90">
              <CardHeader
                title={tx("Language on this browser")}
                description={tx("Your language choice is remembered by this browser.")}
              />
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Globe className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {tx("Display language (Bangla / English)")}
                    </p>
                    <p className="text-xs text-muted-600">
                      {tx("Switches smoothly across portals and mobile view.")}
                    </p>
                  </div>
                </div>
                <LanguageSwitch />
              </CardContent>
            </Card>

            {/* Interactive Notification & Experience Preferences */}
            <Card className="border-slate-200/90">
              <CardHeader
                title={tx("Notification & rescue alert preferences")}
                description={tx("Customize live alerts and visual confirmation behavior.")}
                action={
                  savedToast ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {tx("Preferences saved")}
                    </span>
                  ) : undefined
                }
              />
              <CardContent className="divide-y divide-line pt-0">
                {(
                  [
                    {
                      key: "liveUpdates",
                      icon: Bell,
                      title: "Live in-app rescue updates",
                      desc: "Real-time claim, pickup, and handover alerts inside the portal.",
                    },
                    {
                      key: "deadlineAlerts",
                      icon: Clock3,
                      title: "Safe consumption deadline reminders",
                      desc: "Highlight urgent batches nearing safe pickup thresholds.",
                    },
                    {
                      key: "silentCelebrations",
                      icon: Sparkles,
                      title: "Silent completion popups",
                      desc: "Show celebratory milestones cleanly without audio chimes.",
                    },
                  ] as const
                ).map((item) => {
                  const checked = prefs[item.key];
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 py-4 first:pt-2 last:pb-2"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                          <item.icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-900">
                            {tx(item.title)}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-600">
                            {tx(item.desc)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        aria-label={tx(item.title)}
                        onClick={() => togglePref(item.key)}
                        className="grid h-11 w-14 shrink-0 cursor-pointer place-items-center rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-emerald-600"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "relative block h-7 w-12 rounded-full transition-colors duration-200",
                            checked ? "bg-emerald-600" : "bg-slate-300",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-1 top-1 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                              checked && "translate-x-5",
                            )}
                          />
                        </span>
                      </button>
                    </div>
                  );
                })}
                <div className="pt-4">
                  <ButtonLink href={routes.notifications} variant="outline" size="sm">
                    {tx("View in-app notifications")}
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: iOS Grouped Quick Settings & Sign Out */}
          <div className="space-y-4">
            <Card className="divide-y divide-line overflow-hidden border-slate-200/90">
              {accountLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="icon-interactive flex items-center gap-3 p-4 transition-colors hover:bg-canvas"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[var(--role-ink,var(--brand-800))]">
                    <item.icon className="size-4" />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-ink-900">
                    {tx(item.label)}
                  </span>
                  <ChevronRight className="size-4 text-muted-400" />
                </Link>
              ))}
            </Card>

            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                className="w-full sm:w-auto"
                leftIcon={<LogOut className="size-4" />}
                onClick={() => void signOut()}
              >
                {tx("Log out")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
