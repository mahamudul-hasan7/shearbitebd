"use client";

import { Bookmark, Building2, CheckCircle2, HeartHandshake, MapPin, Plus, RefreshCw, RotateCcw, Star, UsersRound } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useSavedNgos } from "@/features/ngos/use-saved-ngos";
import { FoodCategory, FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { asyncState, ngoService, toServiceError, type AsyncState, type NGODirectoryItem } from "@/services";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD").format(value);
}

function DirectoryLoading() {
  return <SkeletonGroup label="Loading verified NGOs" className="grid gap-5 lg:grid-cols-2">{[0, 1, 2, 3].map((item) => <Card key={item} className="overflow-hidden"><Skeleton className="h-52 rounded-none" /><div className="grid gap-4 p-6"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-16 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-11 w-full" /></div></Card>)}</SkeletonGroup>;
}

export function NGODirectory() {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<NGODirectoryItem[]>>(() => asyncState.loading());
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("all");
  const [category, setCategory] = useState<FoodCategory | "all">("all");
  const [location, setLocation] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const { savedNgoIds, isSaved, toggleSaved } = useSavedNgos();

  useEffect(() => {
    const controller = new AbortController();
    ngoService.listVerified({ signal: controller.signal }).then((items) => setState(asyncState.success(items))).catch((error: unknown) => {
      if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [retryKey]);

  const ngos = useMemo(() => state.data ?? [], [state.data]);
  const causes = useMemo(() => [...new Set(ngos.flatMap((item) => item.profile.beneficiaryTypes))].sort(), [ngos]);
  const locations = useMemo(() => [...new Set(ngos.flatMap((item) => item.profile.serviceAreas))].sort(), [ngos]);
  const categories = useMemo(() => [...new Set(ngos.flatMap((item) => item.profile.acceptedFoodCategories))], [ngos]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ngos.filter((item) => {
      if (query && !`${item.profile.organizationName} ${item.profile.summary} ${item.profile.serviceAreas.join(" ")}`.toLowerCase().includes(query)) return false;
      if (cause !== "all" && !item.profile.beneficiaryTypes.includes(cause)) return false;
      if (category !== "all" && !item.profile.acceptedFoodCategories.includes(category)) return false;
      if (location !== "all" && !item.profile.serviceAreas.includes(location)) return false;
      if (savedOnly && !savedNgoIds.has(item.profile.id)) return false;
      return true;
    });
  }, [category, cause, location, ngos, savedNgoIds, savedOnly, search]);

  function resetFilters() {
    setSearch("");
    setCause("all");
    setCategory("all");
    setLocation("all");
    setSavedOnly(false);
  }

  const areaCount = new Set(ngos.flatMap((item) => item.profile.serviceAreas)).size;
  const peopleHelped = ngos.reduce((total, item) => total + item.impact.peopleHelped, 0);
  const completedRescues = ngos.reduce((total, item) => total + item.impact.completedRescues, 0);

  return (
    <PortalShell role="donor" activeHref={ROUTES.donor.ngos} title="Verified NGOs" description="Find trusted mock organizations by cause, accepted food category, and service area." actions={<ButtonLink href={ROUTES.donor.newDonation} leftIcon={<Plus className="size-4" />}>Donate Surplus Food</ButtonLink>} profileName="UIU Cafeteria" profileDescription="Mock verified food donor" avatarInitials="UC" notificationHref={ROUTES.donor.notifications} unreadNotifications={1}>
      {state.status === "loading" && !state.data && <DirectoryLoading />}
      {state.status === "error" && !state.data && <Alert tone="danger" title="NGO directory could not be loaded" description={state.error.message} action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={() => setRetryKey((current) => current + 1)}>Retry</Button>} />}

      {state.data && (
        <div className="grid gap-6">
          <Alert tone="info" title="Food rescue directory only" description="This experience coordinates surplus food. It does not include money, fundraising, bank details, payouts, or financial donation actions." />

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="NGO directory overview">
            {[
              { label: "Verified organizations", value: ngos.length, icon: CheckCircle2 },
              { label: "Service areas", value: areaCount, icon: MapPin },
              { label: "People helped · demo", value: formatNumber(peopleHelped), icon: UsersRound },
              { label: "Completed rescues · demo", value: formatNumber(completedRescues), icon: HeartHandshake },
            ].map((item) => <Card key={item.label} className="flex items-center gap-4 p-4"><span className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><item.icon className="size-6" /></span><div><p className="text-2xl font-black text-ink-900">{item.value}</p><p className="text-xs font-bold text-muted-600">{item.label}</p></div></Card>)}
          </section>

          <Card className="p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(14rem,1fr)_repeat(3,minmax(10rem,0.55fr))]">
              <SearchInput label="Search NGOs" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Organization or area" />
              <Select label="Cause" value={cause} onChange={(event) => setCause(event.target.value)}><option value="all">All causes</option>{causes.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
              <Select label="Food category" value={category} onChange={(event) => setCategory(event.target.value as FoodCategory | "all")}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{FOOD_CATEGORY_LABELS[item]}</option>)}</Select>
              <Select label="Service area" value={location} onChange={(event) => setLocation(event.target.value)}><option value="all">All areas</option>{locations.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Switch label="Saved NGOs only" description="Saved in this browser tab." checked={savedOnly} onCheckedChange={setSavedOnly} className="sm:min-w-72" /><div className="flex items-center gap-3"><p className="text-sm font-bold text-muted-600">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>{(search || cause !== "all" || category !== "all" || location !== "all" || savedOnly) && <Button type="button" size="sm" variant="ghost" leftIcon={<RotateCcw className="size-4" />} onClick={resetFilters}>Reset</Button>}</div></div>
          </Card>

          {ngos.length === 0 ? <EmptyState icon={Building2} title="No verified NGOs yet" description="Verified organizations will appear here after the future backend review process." /> : filtered.length === 0 ? <EmptyState icon={Building2} title="No NGOs match" description="Adjust the organization, cause, food category, area, or saved-only filter." action={<Button type="button" variant="outline" leftIcon={<RotateCcw className="size-4" />} onClick={resetFilters}>View all NGOs</Button>} /> : (
            <section className="grid gap-5 lg:grid-cols-2" aria-label="Verified NGO results">
              {filtered.map((item, index) => {
                const profile = item.profile;
                const saved = isSaved(profile.id);
                return <Card key={profile.id} className="group overflow-hidden"><div className="relative h-52 overflow-hidden bg-brand-100"><Image src={profile.galleryUrls[0] ?? "/images/ngo-community-gallery.png"} alt="Organized food rescue supplies and a community meal space" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" style={{ objectPosition: index % 2 === 0 ? "left center" : "right center" }} /><div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-brand-950/75 to-transparent p-4 pb-16"><Badge tone="success"><CheckCircle2 className="mr-1 size-3" />Verified mock</Badge><Button type="button" size="sm" variant={saved ? "primary" : "outline"} leftIcon={<Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />} onClick={() => toggleSaved(profile.id)}>{saved ? "Saved" : "Save"}</Button></div></div><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Founded {profile.foundedYear}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900">{profile.organizationName}</h2></div><Badge tone="accent"><Star className="mr-1 size-3" />{profile.rating?.toFixed(1) ?? "New"} demo rating</Badge></div><p className="mt-3 text-sm leading-6 text-muted-600">{profile.summary}</p><div className="mt-4 flex flex-wrap gap-2">{profile.beneficiaryTypes.map((beneficiary) => <Badge key={beneficiary} tone="brand">{beneficiary}</Badge>)}</div><dl className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-brand-50 p-3"><dt className="text-xs font-bold text-muted-600">People helped · demo</dt><dd className="mt-1 text-xl font-black text-ink-900">{formatNumber(item.impact.peopleHelped)}</dd></div><div className="rounded-2xl bg-brand-50 p-3"><dt className="text-xs font-bold text-muted-600">Completed rescues</dt><dd className="mt-1 text-xl font-black text-ink-900">{formatNumber(item.impact.completedRescues)}</dd></div></dl><p className="mt-4 flex items-start gap-2 text-sm text-muted-600"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />{profile.serviceAreas.join(" · ")}</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><ButtonLink href={ROUTES.donor.ngoProfile(profile.id)} variant="outline" fullWidth>View profile</ButtonLink><ButtonLink href={`${ROUTES.donor.newDonation}?ngo=${encodeURIComponent(profile.id)}`} fullWidth>Donate food</ButtonLink></div></div></Card>;
              })}
            </section>
          )}
        </div>
      )}
    </PortalShell>
  );
}
