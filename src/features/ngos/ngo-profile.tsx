"use client";

import { ArrowLeft, Bookmark, CalendarDays, CheckCircle2, Clock3, HeartHandshake, Mail, MapPin, Phone, Plus, RefreshCw, Scale, Star, Target, UsersRound } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClassNames } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useSavedNgos } from "@/features/ngos/use-saved-ngos";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { asyncState, ngoService, toServiceError, type AsyncState, type NGODirectoryItem } from "@/services";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(Date.parse(value));
}

function ProfileLoading() {
  return <SkeletonGroup label="Loading NGO profile" className="grid gap-6"><Skeleton className="h-80 w-full" /><div className="grid gap-6 xl:grid-cols-[1fr_22rem]"><Skeleton className="h-[36rem] w-full" /><Skeleton className="h-[28rem] w-full" /></div></SkeletonGroup>;
}

export function DonorNGOProfile({ ngoId }: { ngoId: string }) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<NGODirectoryItem>>(() => asyncState.loading());
  const { isSaved, toggleSaved } = useSavedNgos();

  useEffect(() => {
    const controller = new AbortController();
    ngoService.getById(ngoId, { signal: controller.signal }).then((item) => setState(asyncState.success(item))).catch((error: unknown) => {
      if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [ngoId, retryKey]);

  const item = state.data;
  const profile = item?.profile;
  const saved = profile ? isSaved(profile.id) : false;
  const galleryImage = profile?.galleryUrls[0] ?? "/images/ngo-community-gallery.png";

  return (
    <PortalShell role="donor" activeHref={ROUTES.donor.ngos} title={profile?.organizationName ?? "NGO profile"} description="Review verified mock identity, causes, service areas, impact, and food-rescue contact options." actions={<ButtonLink href={ROUTES.donor.ngos} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>NGO directory</ButtonLink>} profileName="UIU Cafeteria" profileDescription="Mock verified food donor" avatarInitials="UC" notificationHref={ROUTES.donor.notifications} unreadNotifications={1}>
      {state.status === "loading" && !item && <ProfileLoading />}
      {state.status === "error" && !item && <Alert tone="danger" title="NGO profile could not be loaded" description={state.error.message} action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={() => setRetryKey((current) => current + 1)}>Retry</Button>} />}

      {item && profile && (
        <div className="grid gap-6">
          <Card className="overflow-hidden"><div className="relative min-h-[25rem] bg-brand-100"><Image src={galleryImage} alt="Prepared meals, rescued food supplies, and a community dining space" fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-brand-950/25" /><div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8"><div className="flex flex-wrap gap-2"><Badge tone="success"><CheckCircle2 className="mr-1 size-3" />Verified organization · mock</Badge><Badge tone="accent"><Star className="mr-1 size-3" />{profile.rating?.toFixed(1) ?? "New"} demo rating</Badge></div><h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{profile.organizationName}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">{profile.summary}</p><div className="mt-5 flex flex-wrap gap-2">{profile.serviceAreas.map((area) => <span key={area} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">{area}</span>)}</div></div></div></Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            <div className="grid gap-6">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="NGO impact overview"><StatCard label="People helped · demo" value={formatNumber(item.impact.peopleHelped)} icon={UsersRound} tone="brand" /><StatCard label="Completed rescues" value={formatNumber(item.impact.completedRescues)} icon={HeartHandshake} tone="success" /><StatCard label="Recent meals recorded" value={formatNumber(item.impact.recentMealsDistributed)} icon={Clock3} tone="accent" /><StatCard label="Food rescued · recent" value={`${formatNumber(item.impact.recentFoodRescuedKg)} kg`} icon={Scale} tone="info" /></section>

              <div className="grid gap-6 lg:grid-cols-2"><Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Target className="size-5" /></span><h2 className="text-xl font-black text-ink-900">Mission</h2></div><p className="mt-4 text-sm leading-7 text-muted-600">{profile.mission}</p></Card><Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-accent-100 text-accent-600"><Star className="size-5" /></span><h2 className="text-xl font-black text-ink-900">Vision</h2></div><p className="mt-4 text-sm leading-7 text-muted-600">{profile.vision}</p></Card></div>

              <Card className="p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">How they work</p><h2 className="mt-2 text-2xl font-black text-ink-900">Values and food categories</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{profile.values.map((value) => <div key={value} className="flex items-start gap-3 rounded-2xl bg-brand-50 p-4"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600" /><p className="text-sm font-black text-ink-900">{value}</p></div>)}</div><div className="mt-5 flex flex-wrap gap-2">{profile.acceptedFoodCategories.map((category) => <Badge key={category} tone="accent">{FOOD_CATEGORY_LABELS[category]}</Badge>)}</div></Card>

              <Card className="p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Traceable activity</p><h2 className="mt-2 text-2xl font-black text-ink-900">Recent rescue records</h2></div><Badge tone="neutral">Service-derived mock data</Badge></div>{item.recentActivities.length ? <ol className="mt-5 grid gap-3">{item.recentActivities.map((activity) => <li key={activity.id} className="flex items-start gap-4 rounded-2xl border border-line p-4"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-success-soft text-success-strong"><HeartHandshake className="size-5" /></span><div><p className="font-black text-ink-900">{activity.title}</p><p className="mt-1 text-sm leading-6 text-muted-600">{activity.description}</p><p className="mt-2 flex items-center gap-2 text-xs font-bold text-muted-400"><CalendarDays className="size-3.5" />{formatDate(activity.occurredAt)}</p></div></li>)}</ol> : <p className="mt-5 rounded-2xl bg-canvas p-5 text-sm text-muted-600">No completed mock impact records are available yet.</p>}<p className="mt-4 text-xs leading-5 text-muted-600">Estimated CO2 prevented across these recent records: <strong>{formatNumber(item.impact.estimatedCo2PreventedKg)} kg</strong>. This is an estimate, not a measured environmental result.</p></Card>

              <Card className="overflow-hidden"><div className="p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Privacy-safe gallery</p><h2 className="mt-2 text-2xl font-black text-ink-900">Food rescue in action</h2><p className="mt-2 text-sm leading-6 text-muted-600">Generic generated imagery contains no identifiable beneficiaries, logos, text, or exact location.</p></div><div className="grid gap-1 sm:grid-cols-3">{[{ position: "left center", alt: "Sealed meal boxes and insulated food carriers" }, { position: "center center", alt: "Organized produce and pantry rescue crates" }, { position: "right center", alt: "Clean community dining room prepared for service" }].map((gallery, index) => <div key={gallery.position} className="relative h-56 overflow-hidden bg-brand-100"><Image src={galleryImage} alt={gallery.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-300 hover:scale-[1.03]" style={{ objectPosition: gallery.position }} /><span className="absolute bottom-3 left-3 rounded-full bg-brand-950/75 px-3 py-1 text-xs font-bold text-white">Gallery {index + 1}</span></div>)}</div></Card>
            </div>

            <aside className="grid gap-5 xl:sticky xl:top-24" aria-label="NGO profile actions and contact">
              <Card className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Organization details</p><p className="mt-2 text-lg font-black text-ink-900">Founded {profile.foundedYear}</p></div><Badge tone="success">Verified mock</Badge></div><dl className="mt-5 grid gap-4 text-sm"><div><dt className="text-xs font-bold text-muted-400">Registration</dt><dd className="mt-1 font-mono font-bold text-ink-900">{profile.registrationNumber}</dd></div><div><dt className="text-xs font-bold text-muted-400">Daily meal capacity</dt><dd className="mt-1 font-black text-ink-900">{formatNumber(profile.capacityMealsPerDay)}</dd></div><div><dt className="text-xs font-bold text-muted-400">Primary public area</dt><dd className="mt-1 flex items-start gap-2 font-bold text-ink-900"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />{item.addresses[0]?.area}, {item.addresses[0]?.city}</dd></div></dl></Card>
              <ButtonLink href={`${ROUTES.donor.newDonation}?ngo=${encodeURIComponent(profile.id)}`} leftIcon={<Plus className="size-4" />}>Donate Surplus Food</ButtonLink>
              <Button type="button" variant={saved ? "primary" : "outline"} leftIcon={<Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />} onClick={() => toggleSaved(profile.id)}>{saved ? "Saved in this browser" : "Save NGO"}</Button>
              <Card className="p-5"><p className="font-black text-ink-900">Public contact</p><p className="mt-2 text-xs leading-5 text-muted-600">These mock organization contacts are intentionally marked public for donor coordination.</p><div className="mt-4 grid gap-3"><a href={`mailto:${profile.publicEmail}`} className={buttonClassNames({ variant: "outline", size: "sm", fullWidth: true })}><Mail className="size-4" />Email organization</a><a href={`tel:${profile.publicPhone}`} className={buttonClassNames({ variant: "ghost", size: "sm", fullWidth: true })}><Phone className="size-4" />Call public number</a></div></Card>
              <Alert tone="info" title="Food, not money" description="The CTA opens the surplus-food wizard with this NGO as a non-guaranteed matching preference. No payment or fundraising flow exists." />
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
