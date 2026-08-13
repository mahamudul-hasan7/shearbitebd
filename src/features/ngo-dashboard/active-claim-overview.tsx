import { ArrowRight, Bike, Clock3, MapPin, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/lib/routes";
import type { NGOActiveClaim } from "@/features/ngo-dashboard/types";

function formatTime(value?: string) {
  return value ? new Intl.DateTimeFormat("en-BD", { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "Pending";
}

export function ActiveClaimOverview({ items }: { items: NGOActiveClaim[] }) {
  return <Card><CardHeader title="Active claims" description={`${items.length} rescue${items.length === 1 ? "" : "s"} currently need coordination.`} action={<ButtonLink href={ROUTES.ngo.claims} variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>View all</ButtonLink>} /><CardContent className="grid gap-3">{items.length === 0 ? <div className="rounded-2xl border border-dashed border-line p-7 text-center"><PackageCheck className="mx-auto size-8 text-brand-600" /><p className="mt-3 font-black text-ink-900">No active claims</p><p className="mt-1 text-sm text-muted-600">Browse nearby food to start a rescue.</p></div> : items.slice(0, 3).map(({ claim, donation }) => <div key={claim.id} className="rounded-2xl border border-line p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black text-ink-900">{donation.title}</p><p className="mt-1 text-xs text-muted-600">Claim {claim.id.replace("claim-", "#")}</p></div><StatusBadge status={claim.status} /></div><div className="mt-4 grid gap-2 text-xs sm:grid-cols-3"><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-ink-700"><MapPin className="size-4 text-brand-700" />{donation.pickup.approximateArea}</p><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-ink-700"><Clock3 className="size-4 text-brand-700" />ETA {formatTime(claim.estimatedPickupAt)}</p><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-ink-700"><Bike className="size-4 text-brand-700" />{claim.volunteerProfileId ? "Volunteer assigned" : "Volunteer pending"}</p></div><div className="mt-4 flex items-center justify-between gap-3"><Badge tone="accent">{claim.matchScore}% match</Badge><ButtonLink href={ROUTES.ngo.claim(claim.id)} variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>Open claim</ButtonLink></div></div>)}</CardContent></Card>;
}
