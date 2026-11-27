"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Bell,
  Bike,
  Car,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  Footprints,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Utensils,
  X,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { QrMatrix } from "@/components/donation/qr-matrix";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMockAuth } from "@/features/auth/mock-auth";
import { VerificationDocumentPanel } from "@/features/verification/document-panel";
import { VolunteerDutySwitch } from "@/features/volunteer-dashboard/volunteer-duty-switch";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { useLanguage } from "@/lib/i18n/language-context";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import {
  notificationService,
  profileService,
  toServiceError,
  type ProfileBundle,
} from "@/services";
import { TransportMethod } from "@/lib/constants/domain";

const TRANSPORT_LABELS: Record<TransportMethod, string> = {
  [TransportMethod.WALKING_OR_TRANSIT]: "Walking or transit",
  [TransportMethod.BICYCLE]: "Bicycle",
  [TransportMethod.MOTORCYCLE]: "Motorcycle",
  [TransportMethod.CAR]: "Car",
};

function TransportIcon({ method }: { method?: TransportMethod }) {
  switch (method) {
    case TransportMethod.WALKING_OR_TRANSIT:
      return <Footprints className="size-3.5" />;
    case TransportMethod.CAR:
      return <Car className="size-3.5" />;
    case TransportMethod.BICYCLE:
    case TransportMethod.MOTORCYCLE:
    default:
      return <Bike className="size-3.5" />;
  }
}

const RIDER_QUICK_LINKS = [
  {
    href: ROUTES.volunteer.dashboard,
    label: "Command hub",
    icon: LayoutDashboard,
  },
  {
    href: ROUTES.volunteer.dispatches,
    label: "Available dispatches",
    icon: Navigation,
  },
  {
    href: ROUTES.volunteer.history,
    label: "Mission history",
    icon: History,
  },
  {
    href: ROUTES.volunteer.notifications,
    label: "Notifications & alerts",
    icon: Bell,
  },
];

export function VolunteerIdCardView() {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const { session, signOut } = useMockAuth();
  const { dutyStatus, dutyReady, profile: storeProfile } = useVolunteerStore();

  const [data, setData] = useState<ProfileBundle>();
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    let revision = 0;

    const load = () => {
      const current = ++revision;
      Promise.all([
        profileService.getOwnProfile(
          "",
          { userId: session.id, role: session.role },
          { signal: controller.signal },
        ),
        notificationService
          .listForUser(
            session.id,
            { userId: session.id, role: session.role },
            { signal: controller.signal },
          )
          .catch(() => []),
      ])
        .then(([bundle, notices]) => {
          if (!controller.signal.aborted && current === revision) {
            setData(bundle);
            setUnread(notices.filter((item) => !item.readAt).length);
            setError("");
          }
        })
        .catch((caught: unknown) => {
          if (!controller.signal.aborted && current === revision) {
            setError(
              toServiceError(caught).message ||
                "Volunteer profile could not load. Reload to retry.",
            );
          }
        });
    };

    load();
    window.addEventListener("sharebite:verification-changed", load);
    return () => {
      controller.abort();
      window.removeEventListener("sharebite:verification-changed", load);
    };
  }, [session, retryKey]);

  async function saveDisplayName(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2) {
      setNameError("Enter at least 2 characters.");
      return;
    }
    setNameSaving(true);
    setNameError("");
    setNameSaved(false);
    try {
      const updated = await profileService.updateDisplayName("", trimmed, {
        userId: session.id,
        role: session.role,
      });
      setData(updated);
      setEditingName(false);
      setNameSaved(true);
    } catch (caught: unknown) {
      setNameError(toServiceError(caught).message || "Could not update rider name.");
    } finally {
      setNameSaving(false);
    }
  }

  const rider = data?.volunteerProfile;
  const displayName = data?.user.displayName || session?.displayName || "Volunteer rider";
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "VR";

  const isVerified = rider?.verificationStatus === "VERIFIED";
  const isOnline = dutyReady ? dutyStatus === "online" : Boolean(rider?.isOnDuty);
  const transportLabel = rider?.transportMethod
    ? TRANSPORT_LABELS[rider.transportMethod]
    : "Bicycle";
  const operatingAreas =
    rider?.serviceAreas && rider.serviceAreas.length > 0
      ? rider.serviceAreas.join(", ")
      : data?.addresses?.[0]?.area || "Dhaka Metro";
  const completedHandovers = Math.max(
    rider?.completedRescues ?? 0,
    storeProfile.completedMissions ?? 0,
  );
  const qrPayload = `SHAREBITE-RIDER|${rider?.id ?? session?.id ?? "RIDER"}|${displayName}|${
    rider?.verificationStatus ?? "PENDING"
  }`;

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.idCard}
      title={tx("Volunteer profile")}
      description={tx("Saved identity, active dispatch credentials, and delivery record.")}
      profileName={displayName}
      profileDescription={tx(isVerified ? "Verified Volunteer Rider" : "Volunteer account")}
      avatarInitials={initials}
      notificationHref={ROUTES.volunteer.notifications}
      unreadNotifications={unread}
      actions={
        !editingName && data ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Edit3 className="size-4" />}
            onClick={() => {
              setNameDraft(displayName);
              setNameError("");
              setNameSaved(false);
              setEditingName(true);
            }}
          >
            <UiText source="Edit name" />
          </Button>
        ) : undefined
      }
    >
      {!data && !error && <LoadingSpinner />}

      {error && !data && (
        <EmptyState
          icon={RefreshCw}
          title={tx("Profile could not load")}
          description={tx(error)}
          action={
            <Button onClick={() => setRetryKey((value) => value + 1)}>
              <UiText source="Try again" />
            </Button>
          }
        />
      )}

      {data && (
        <div className="grid gap-6">
          {/* 1. Executive Rider Identity, Duty & Impact Overview */}
          <Card className="overflow-hidden border-slate-200/90">
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                  <Avatar
                    initials={initials}
                    size="lg"
                    className="shrink-0 bg-gradient-to-br from-emerald-600 to-emerald-950 text-white shadow-sm ring-4 ring-emerald-50"
                  />
                  <div className="min-w-0 flex-1">
                    {editingName ? (
                      <form
                        onSubmit={saveDisplayName}
                        className="flex flex-col gap-2 sm:flex-row sm:items-end"
                      >
                        <div className="min-w-0 flex-1 sm:max-w-xs">
                          <Input
                            label={tx("Rider full name")}
                            value={nameDraft}
                            error={nameError ? tx(nameError) : undefined}
                            onChange={(event) => setNameDraft(event.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={nameSaving}
                            leftIcon={<Check className="size-4" />}
                          >
                            {nameSaving ? tx("Saving...") : tx("Save")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={nameSaving}
                            leftIcon={<X className="size-4" />}
                            onClick={() => {
                              setEditingName(false);
                              setNameError("");
                            }}
                          >
                            {tx("Cancel")}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">
                            {displayName}
                          </h2>
                          <Badge tone={isVerified ? "success" : "warning"}>
                            {isVerified ? (
                              <BadgeCheck className="size-3.5" />
                            ) : (
                              <Clock3 className="size-3.5" />
                            )}
                            {tx(
                              isVerified
                                ? "Verified Volunteer Rider"
                                : "Verification pending",
                            )}
                          </Badge>
                          <Badge tone={isOnline ? "success" : "neutral"}>
                            <span
                              className={`size-2 rounded-full ${
                                isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            {tx(isOnline ? "Duty ON" : "Duty OFF")}
                          </Badge>
                          <Badge tone="neutral">
                            <TransportIcon method={rider?.transportMethod} />
                            {tx(transportLabel)}
                          </Badge>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-600">
                          {tx(
                            "Verified ShareBite BD volunteer squad member authorized for sealed surplus food pickup, OTP verification, and NGO handover.",
                          )}
                        </p>
                        {nameSaved && (
                          <p className="mt-2 text-xs font-semibold text-emerald-700">
                            {tx("Display name updated.")}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Structured Contact & Service Grid Tiles */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-300/50">
                    <Mail className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                      {tx("Official email")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-ink-900">
                      {data.user.email}
                    </p>
                  </div>
                </div>

                <div className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-300/50">
                    <Phone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                      {tx("Rider contact")}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-sm font-bold text-ink-900">
                      {data.user.phone || tx("Not provided")}
                    </p>
                  </div>
                </div>

                <div className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-800 ring-1 ring-sky-300/50">
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                      {tx("Operating zones")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-ink-900">
                      {operatingAreas}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Executive Delivery Impact KPI Tiles */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="liquid-glass-tile flex items-center justify-between rounded-2xl border-emerald-200/80 bg-emerald-100/45 p-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      {tx("Completed handovers")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                      {completedHandovers.toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 text-white shadow-sm ring-1 ring-white/40">
                    <PackageCheck className="size-5" />
                  </span>
                </div>

                <div className="liquid-glass-tile flex items-center justify-between rounded-2xl border-emerald-200/80 bg-emerald-100/45 p-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      {tx("Meals rescued")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                      {(storeProfile.totalRescuedMeals ?? 0).toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm ring-1 ring-white/40">
                    <Utensils className="size-5" />
                  </span>
                </div>

                <div className="liquid-glass-tile flex items-center justify-between rounded-2xl border-sky-200/80 bg-sky-100/45 p-4">
                  <div>
                    <p className="text-xs font-semibold text-sky-900">
                      {tx("Active service zones")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                      {Math.max(1, rider?.serviceAreas?.length ?? 0).toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-sm ring-1 ring-white/40">
                    <Navigation className="size-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Digital Rider Squad Pass + Verification Docs + Quick Actions */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              {/* Digital Squad Pass with Scannable Verification QR */}
              <Card className="liquid-glass-dark overflow-hidden border-emerald-400/25 bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/92 to-[#047857]/95 text-white shadow-xl">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                        <ShieldCheck className="size-3.5 text-emerald-300" />
                        <span>{tx("ShareBite BD Digital Squad Pass")}</span>
                      </div>

                      <div>
                        <p className="text-xl font-bold text-white sm:text-2xl">
                          {displayName}
                        </p>
                        <p className="mt-1 font-mono text-xs text-emerald-200/85">
                          ID: {rider?.id ?? session?.id ?? "—"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-medium text-white/95">
                          <TransportIcon method={rider?.transportMethod} />
                          {tx(transportLabel)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-medium text-white/95">
                          <QrCode className="size-3.5 text-emerald-300" />
                          {tx("OTP & QR pickup ready")}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-2xl bg-white p-2.5 text-center shadow-lg">
                      <QrMatrix
                        value={qrPayload}
                        size={96}
                        label={tx("Digital rider verification QR")}
                      />
                      <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        {tx("Squad Pass")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <VerificationDocumentPanel />
            </div>

            <div className="space-y-4">
              <Card className="border-slate-200/90">
                <CardHeader
                  title={tx("Duty availability")}
                  description={tx("Control whether your account receives live dispatch alerts.")}
                />
                <CardContent className="pt-0">
                  <VolunteerDutySwitch />
                </CardContent>
              </Card>

              <Card className="divide-y divide-white/60 overflow-hidden">
                {RIDER_QUICK_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="icon-interactive flex items-center gap-3 p-4 transition-colors hover:bg-white/55"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/75 text-emerald-700 shadow-2xs ring-1 ring-white/90">
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
      )}
    </PortalShell>
  );
}
