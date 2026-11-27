"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Edit3,
  HeartHandshake,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  PlusCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
  Utensils,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMockAuth } from "@/features/auth/mock-auth";
import {
  DONOR_PROFILE_ID,
  DONOR_USER_ID,
  DONOR_VIEWER,
  getInitials,
} from "@/features/donor-account/shared";
import { useLanguage } from "@/lib/i18n/language-context";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import {
  impactService,
  notificationService,
  profileService,
  toServiceError,
  type DonorImpactOverview,
  type ProfileBundle,
} from "@/services";
import { VerificationDocumentPanel } from "@/features/verification/document-panel";
import type { DonorProfile } from "@/types/domain";

const DONOR_TYPE_LABELS: Record<DonorProfile["donorType"], string> = {
  CAFETERIA: "Cafeteria",
  RESTAURANT: "Restaurant",
  BAKERY: "Bakery",
  EVENT_ORGANIZER: "Event organizer",
  INDIVIDUAL: "Individual donor",
};

const QUICK_LINKS = [
  {
    href: ROUTES.donor.donations,
    label: "My food donations",
    icon: PackageCheck,
  },
  {
    href: ROUTES.donor.newDonation,
    label: "Post surplus food",
    icon: PlusCircle,
  },
  {
    href: ROUTES.donor.addresses,
    label: "Pickup addresses & location pins",
    icon: MapPin,
  },
  {
    href: ROUTES.donor.ngos,
    label: "Partner NGOs",
    icon: Building2,
  },
  {
    href: ROUTES.donor.settings,
    label: "Privacy & settings",
    icon: Settings,
  },
  {
    href: ROUTES.donor.support,
    label: "Help & support",
    icon: CircleHelp,
  },
];

export function DonorProfileView() {
  const tx = useUiText();
  const { language } = useLanguage();
  const { signOut } = useMockAuth();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const [data, setData] = useState<{
    profile: ProfileBundle;
    impact: DonorImpactOverview;
    unread: number;
  }>();
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([
      profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, options),
      impactService.getDonorOverview(DONOR_PROFILE_ID, DONOR_VIEWER, options),
      notificationService.listForUser(DONOR_USER_ID, DONOR_VIEWER, options),
    ])
      .then(([profile, impact, notices]) => {
        setData({
          profile,
          impact,
          unread: notices.filter((item) => !item.readAt).length,
        });
        setError("");
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(toServiceError(caught).message || "Profile could not load. Please retry.");
        }
      });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    const refresh = () => setRetry((value) => value + 1);
    window.addEventListener("sharebite:verification-changed", refresh);
    return () => window.removeEventListener("sharebite:verification-changed", refresh);
  }, []);

  const profile = data?.profile;
  const donor = profile?.donorProfile;
  const orgName = donor?.organizationName || profile?.user.displayName || "Donor account";
  const initials = getInitials(orgName);
  const isVerified = donor?.verificationStatus === "VERIFIED";
  const isRejected = donor?.verificationStatus === "REJECTED";
  const donorTypeLabel = donor?.donorType
    ? DONOR_TYPE_LABELS[donor.donorType] ?? donor.donorType.toLowerCase().replaceAll("_", " ")
    : "Food donor";

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.profile}
      title={tx("Donor profile")}
      description={tx("Your saved account details and recorded food rescue impact.")}
      profileName={orgName}
      profileDescription={tx(isVerified ? "Verified Food Donor" : donorTypeLabel)}
      avatarInitials={initials}
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={data?.unread}
      actions={
        <ButtonLink
          href={ROUTES.donor.editProfile}
          size="sm"
          variant="outline"
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
            <Button onClick={() => setRetry((value) => value + 1)}>
              <UiText source="Try again" />
            </Button>
          }
        />
      )}

      {profile && data && (
        <div className="grid gap-6">
          {/* 1. Executive Donor Identity & Verification Overview */}
          <Card className="overflow-hidden border-slate-200/90">
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                  <Avatar
                    initials={initials}
                    size="lg"
                    className="shrink-0 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-sm ring-4 ring-emerald-50"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">
                        {orgName}
                      </h2>
                      <Badge tone={isVerified ? "success" : isRejected ? "danger" : "warning"}>
                        {isVerified ? (
                          <BadgeCheck className="size-3.5" />
                        ) : isRejected ? (
                          <ShieldCheck className="size-3.5" />
                        ) : (
                          <Clock3 className="size-3.5" />
                        )}
                        {tx(
                          isVerified
                            ? "Verified Food Donor"
                            : isRejected
                              ? "Verification rejected"
                              : "Verification pending",
                        )}
                      </Badge>
                      <Badge tone="neutral">
                        <Utensils className="size-3" />
                        {tx(donorTypeLabel)}
                      </Badge>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-600">
                      {tx(
                        "Account verification & digital handover tracking ensure every safe food donation by this donor is recorded and preserved.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structured Contact Information Grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-300/50">
                    <UserRound className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                      {tx("Contact person")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-ink-900">
                      {profile.user.displayName}
                    </p>
                  </div>
                </div>

                <div className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-800 ring-1 ring-sky-300/50">
                    <Mail className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                      {tx("Official email")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-ink-900">
                      {profile.user.email}
                    </p>
                  </div>
                </div>

                <div className="liquid-glass-tile flex items-start gap-3 rounded-2xl p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-800 ring-1 ring-amber-300/50">
                    <Phone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-600">
                      {tx("Pickup hotline")}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-sm font-bold text-ink-900">
                      {profile.user.phone || tx("Not provided")}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Executive Impact KPI Tiles */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="liquid-glass-tile flex items-center justify-between rounded-2xl border-emerald-200/80 bg-emerald-100/45 p-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      {tx("Donations published")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                      {data.impact.totalDonations.toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-sm ring-1 ring-white/40">
                    <PackageCheck className="size-5" />
                  </span>
                </div>

                <div className="liquid-glass-tile flex items-center justify-between rounded-2xl border-sky-200/80 bg-sky-100/45 p-4">
                  <div>
                    <p className="text-xs font-semibold text-sky-900">
                      {tx("Meals distributed")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                      {data.impact.mealsRescued.toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-sm ring-1 ring-white/40">
                    <Utensils className="size-5" />
                  </span>
                </div>

                <div className="liquid-glass-tile flex items-center justify-between rounded-2xl border-amber-200/80 bg-amber-100/45 p-4">
                  <div>
                    <p className="text-xs font-semibold text-amber-900">
                      {tx("NGOs supported")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
                      {data.impact.ngosHelped.toLocaleString(locale)}
                    </p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm ring-1 ring-white/40">
                    <HeartHandshake className="size-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <VerificationDocumentPanel />

          {/* 2. Saved Pickup Locations & iOS-Style Grouped Quick Actions */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <Card className="border-slate-200/90">
              <CardHeader
                title={tx("Pickup addresses")}
                description={tx("Saved locations used for new donations.")}
                action={
                  <ButtonLink href={ROUTES.donor.addresses} size="sm" variant="outline">
                    {tx("Manage saved addresses & pins")}
                  </ButtonLink>
                }
              />
              <CardContent className="grid gap-3">
                {profile.addresses.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title={tx("No saved pickup addresses yet")}
                    description={tx(
                      "Add a pickup address and map pin so NGOs and riders can find your kitchen faster.",
                    )}
                    action={
                      <ButtonLink href={ROUTES.donor.addresses} size="sm">
                        {tx("Manage saved addresses & pins")}
                      </ButtonLink>
                    }
                  />
                ) : (
                  profile.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="liquid-glass-tile flex flex-wrap items-start justify-between gap-3 rounded-2xl p-4"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100/80 text-emerald-700">
                          <MapPin className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-ink-900">{address.label}</p>
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

            <div className="space-y-4">
              <Card className="divide-y divide-white/60 overflow-hidden">
                {QUICK_LINKS.map((item) => (
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
