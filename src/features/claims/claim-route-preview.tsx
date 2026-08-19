import { Building2, MapPin, Navigation, Route } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAddress } from "@/features/claims/claim-presentation";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimRoutePreview({ details }: { details: ClaimCoordinationDetails }) {
  const pickup = details.donation.pickup.exactAddress;
  const delivery = details.deliveryAddress;
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Rescue route" description="A privacy-aware visual preview for frontend coordination; this is not live navigation." action={<Badge tone="info">Mock route</Badge>} />
      <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-h-56 overflow-hidden rounded-3xl border border-brand-100 bg-[radial-gradient(circle_at_1px_1px,rgb(167_204_181_/_0.45)_1px,transparent_0)] bg-[length:22px_22px]">
          <div className="absolute left-[12%] top-[28%] grid size-12 place-items-center rounded-full bg-brand-700 text-white shadow-lg"><MapPin className="size-6" /></div>
          <div className="absolute bottom-[22%] right-[12%] grid size-12 place-items-center rounded-full bg-accent-500 text-white shadow-lg"><Building2 className="size-6" /></div>
          <svg aria-hidden="true" viewBox="0 0 500 230" className="absolute inset-0 size-full"><path d="M80 75 C165 10 235 190 315 105 S405 160 435 165" fill="none" stroke="rgb(30 122 69)" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 13" /></svg>
          <div className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-info text-white shadow"><Navigation className="size-4" /></div>
        </div>
        <div className="grid content-center gap-4">
          <div className="rounded-2xl bg-brand-50 p-4"><div className="flex items-center gap-2 text-brand-800"><MapPin className="size-4" /><p className="text-xs font-black uppercase tracking-wide">Pickup</p></div><p className="mt-2 text-sm font-bold text-ink-900">{pickup ? formatAddress(pickup) : details.donation.pickup.approximateArea}</p></div>
          <div className="flex items-center gap-3 px-4 text-muted-500"><Route className="size-5" /><span className="text-xs font-bold">Approx. {details.donation.pickup.distanceKm?.toFixed(1) ?? "--"} km coordination route</span></div>
          <div className="rounded-2xl bg-accent-50 p-4"><div className="flex items-center gap-2 text-accent-700"><Building2 className="size-4" /><p className="text-xs font-black uppercase tracking-wide">Delivery</p></div><p className="mt-2 text-sm font-bold text-ink-900">{formatAddress(delivery)}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
