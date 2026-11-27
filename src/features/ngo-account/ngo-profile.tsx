"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Edit3,
  FileCheck2,
  HeartHandshake,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Utensils,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import glass from "@/features/ngo-account/ngo-profile-glass.module.css";
import { useMockAuth } from "@/features/auth/mock-auth";
import {
  NGO_ACCOUNT_PROFILE_ID,
  NGO_ACCOUNT_USER_ID,
  NGO_ACCOUNT_VIEWER,
} from "@/features/ngo-account/shared";
import { useLanguage } from "@/lib/i18n/language-context";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import {
  impactService,
  notificationService,
  profileService,
  toServiceError,
  type NGOImpactOverview,
  type ProfileBundle,
} from "@/services";

const QUICK_LINKS = [
  {
    href: ROUTES.ngo.addresses,
    label: "Delivery addresses & location pins",
    icon: MapPin,
  },
  {
    href: ROUTES.ngo.team,
    label: "Team & permissions",
    icon: UsersRound,
  },
  {
    href: ROUTES.ngo.verification,
    label: "Verification",
    icon: FileCheck2,
  },
  {
    href: ROUTES.ngo.impact,
    label: "Impact & CSR reports",
    icon: BarChart3,
  },
  {
    href: ROUTES.ngo.settings,
    label: "Privacy & settings",
    icon: Settings,
  },
  {
    href: ROUTES.ngo.support,
    label: "Help & support",
    icon: CircleHelp,
  },
];

function getOrganizationInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NG"
  );
}

export function NGOProfileView() {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const { signOut } = useMockAuth();
  const [data, setData] = useState<{
    profile: ProfileBundle;
    impact: NGOImpactOverview;
    unread: number;
  }>();
  const [error, setError] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    document.title = `${tx("Organization profile")} | ShareBite BD`;
  }, [tx]);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      profileService.getOwnProfile(
        NGO_ACCOUNT_USER_ID,
        NGO_ACCOUNT_VIEWER,
        options,
      ),
      impactService.getNgoOverview(
        NGO_ACCOUNT_PROFILE_ID,
        NGO_ACCOUNT_VIEWER,
        options,
      ),
      notificationService.listForUser(
        NGO_ACCOUNT_USER_ID,
        NGO_ACCOUNT_VIEWER,
        options,
      ),
    ])
      .then(([profile, impact, notices]) => {
        setData({
          profile,
          impact,
          unread: notices.filter((item) => !item.readAt).length,
        });
        setError(undefined);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(toServiceError(caught).message);
        }
      });
    return () => controller.abort();
  }, [retryKey]);

  const ngo = data?.profile.ngoProfile;
  const addresses = data?.profile.addresses ?? [];
  const orgName = ngo?.organizationName ?? "NGO account";
  const initials = getOrganizationInitials(orgName);
  const isVerified = ngo?.verificationStatus === "VERIFIED";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.profile}
      title={tx("Organization profile")}
      description={tx(
        "Manage public identity, service capacity, team access, verification, and account preferences.",
      )}
      profileName={orgName}
      profileDescription={tx(isVerified ? "Verified NGO" : "NGO account")}
      avatarInitials={initials}
      notificationHref={ROUTES.ngo.notifications}
      unreadNotifications={data?.unread}
      actions={
        <ButtonLink
          href={ROUTES.ngo.editProfile}
          variant="outline"
          size="sm"
          leftIcon={<Edit3 className="size-4" />}
        >
          <UiText source="Edit profile" />
        </ButtonLink>
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

      {data && ngo && (
        <div className={glass.stage}>
          <div className={glass.backdrop} aria-hidden="true">
            <span className={`${glass.orb} ${glass.orbEmerald}`} />
            <span className={`${glass.orb} ${glass.orbSky}`} />
            <span className={`${glass.orb} ${glass.orbAmber}`} />
          </div>

          <div className="grid gap-6">
            {/* 1. Liquid Glass NGO Identity, Capacity & Impact Overview */}
            <Card className={`${glass.glassCard} border-white/80 bg-transparent shadow-none`}>
              <div className={`${glass.glassHeroBand} p-5 sm:p-7`}>
                <div className="relative z-10 flex flex-wrap items-start gap-4 sm:gap-5">
                  <Avatar
                    initials={initials}
                    size="lg"
                    className="shrink-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-[#193b63] text-white shadow-md ring-4 ring-white/80"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">
                        {ngo.organizationName}
                      </h2>
                      <Badge tone={isVerified ? "success" : "warning"} className="shadow-2xs">
                        {isVerified ? (
                          <BadgeCheck className="size-3.5" />
                        ) : (
                          <Clock3 className="size-3.5" />
                        )}
                        {tx(isVerified ? "Verified NGO" : "Verification pending")}
                      </Badge>
                      {ngo.registrationNumber && (
                        <Badge tone="neutral" className={glass.glassPill}>
                          <Building2 className="size-3" />
                          <span className="font-mono">{ngo.registrationNumber}</span>
                        </Badge>
                      )}
                      {ngo.foundedYear > 0 && (
                        <Badge tone="neutral" className={glass.glassPill}>
                          {tx("Est.")} {ngo.foundedYear}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-2.5 max-w-3xl text-sm leading-6 text-ink-700">
                      {ngo.summary}
                    </p>

                    {ngo.serviceAreas.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {ngo.serviceAreas.map((area) => (
                          <Badge key={area} tone="neutral" className={glass.glassPill}>
                            <MapPin className="size-3 text-emerald-700" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="relative z-10 space-y-5 pt-6">
                {/* 3 Frosted Contact & Daily Capacity Tiles */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={`${glass.glassTile} flex items-start gap-3 p-4`}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-800 ring-1 ring-sky-300/50">
                      <Mail className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                        {tx("Official email")}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold text-ink-900">
                        {ngo.publicEmail}
                      </p>
                    </div>
                  </div>

                  <div className={`${glass.glassTile} flex items-start gap-3 p-4`}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-300/50">
                      <Phone className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                        {tx("Dispatch hotline")}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-sm font-bold text-ink-900">
                        {ngo.publicPhone}
                      </p>
                    </div>
                  </div>

                  <div className={`${glass.glassTile} flex items-start gap-3 p-4`}>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-800 ring-1 ring-amber-300/50">
                      <Utensils className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                        {tx("Daily meal capacity")}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-bold tabular-nums text-ink-900">
                        {ngo.capacityMealsPerDay.toLocaleString(locale)}{" "}
                        {tx("meals/day")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Translucent Tinted KPI Crystals */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={`${glass.glassTile} ${glass.kpiSky} flex items-center justify-between p-4`}>
                    <div>
                      <p className="text-xs font-semibold text-sky-900">
                        {tx("Completed rescues")}
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                        {ngo.completedRescues.toLocaleString(locale)}
                      </p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-[#2c4869] to-[#193b63] text-white shadow-sm ring-1 ring-white/40">
                      <PackageCheck className="size-5" />
                    </span>
                  </div>

                  <div className={`${glass.glassTile} ${glass.kpiEmerald} flex items-center justify-between p-4`}>
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">
                        {tx("Meals distributed")}
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                        {data.impact.mealsDistributed.toLocaleString(locale)}
                      </p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm ring-1 ring-white/40">
                      <Utensils className="size-5" />
                    </span>
                  </div>

                  <div className={`${glass.glassTile} ${glass.kpiAmber} flex items-center justify-between p-4`}>
                    <div>
                      <p className="text-xs font-semibold text-amber-900">
                        {tx("People served")}
                      </p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                        {data.impact.beneficiariesServed.toLocaleString(locale)}
                      </p>
                    </div>
                    <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm ring-1 ring-white/40">
                      <HeartHandshake className="size-5" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Frosted Mission & Hubs + Liquid Glass Quick Actions */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-6">
                <Card className={`${glass.glassCard} border-white/80 bg-transparent shadow-none`}>
                  <div className="relative z-10 border-b border-white/55">
                    <CardHeader
                      title={tx("Mission, vision & communities")}
                      description={tx("Public mandate shared with partner food donors.")}
                    />
                  </div>
                  <CardContent className="relative z-10 grid gap-4 pt-5">
                    <section className={`${glass.glassTile} p-4`}>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-800">
                        <Compass className="size-3.5" />
                        <span>{tx("Organization mandate")}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink-800">
                        {ngo.mission?.trim() ||
                          tx(
                            "Rescuing fresh surplus meals safely from partner donors and delivering dignified nutrition across verified Dhaka hubs.",
                          )}
                      </p>
                    </section>

                    <section className={`${glass.glassTile} p-4`}>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                        <Sparkles className="size-3.5" />
                        <span>{tx("Vision")}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink-800">
                        {ngo.vision?.trim() ||
                          tx(
                            "Zero edible surplus food wasted, supported by transparent OTP-verified handovers and real-time distribution tracking.",
                          )}
                      </p>
                    </section>

                    {ngo.beneficiaryTypes.length > 0 && (
                      <section className="pt-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-600">
                          {tx("Beneficiary communities")}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {ngo.beneficiaryTypes.map((group) => (
                            <Badge key={group} tone="info" className="shadow-2xs">
                              <UsersRound className="size-3" />
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </section>
                    )}
                  </CardContent>
                </Card>

                <Card className={`${glass.glassCard} border-white/80 bg-transparent shadow-none`}>
                  <div className="relative z-10 border-b border-white/55">
                    <CardHeader
                      title={tx("Delivery hubs & drop-off locations")}
                      description={tx("Authorized shelters and kitchen collection points.")}
                      action={
                        <ButtonLink href={ROUTES.ngo.addresses} size="sm" variant="outline" className="bg-white/70 backdrop-blur-md">
                          {tx("Manage saved addresses & pins")}
                        </ButtonLink>
                      }
                    />
                  </div>
                  <CardContent className="relative z-10 grid gap-3 pt-5">
                    {addresses.length === 0 ? (
                      <EmptyState
                        icon={MapPin}
                        title={tx("No saved delivery hubs yet")}
                        description={tx(
                          "Add a verified drop-off address and map pin so riders can deliver faster.",
                        )}
                        action={
                          <ButtonLink href={ROUTES.ngo.addresses} size="sm">
                            {tx("Manage saved addresses & pins")}
                          </ButtonLink>
                        }
                      />
                    ) : (
                      addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`${glass.glassTile} flex flex-wrap items-start justify-between gap-3 p-4`}
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-800 ring-1 ring-sky-300/50">
                              <MapPin className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-ink-900">{tx(address.label)}</p>
                                {address.isPrimary && (
                                  <Badge tone="success">{tx("Primary")}</Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-ink-700">
                                {address.addressLine}, {address.area}, {address.city}
                              </p>
                              <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-600">
                                <ShieldCheck className="size-3.5 text-emerald-600" />
                                {address.coordinates
                                  ? tx("GPS pin saved")
                                  : tx("Location pin not set")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className={`${glass.glassCard} divide-y divide-white/60 border-white/80 bg-transparent shadow-none`}>
                  {QUICK_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${glass.actionRow} icon-interactive relative z-10 flex items-center gap-3 p-4`}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/75 text-[#2c4869] shadow-2xs ring-1 ring-white/90">
                        <item.icon className="size-4" />
                      </span>
                      <span className="flex-1 text-sm font-semibold text-ink-900">
                        {tx(item.label)}
                      </span>
                      <ChevronRight className="size-4 text-muted-500" />
                    </Link>
                  ))}
                </Card>

                <div className="flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full shadow-sm backdrop-blur-md sm:w-auto"
                    leftIcon={<LogOut className="size-4" />}
                    onClick={() => void signOut()}
                  >
                    {tx("Log out")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
