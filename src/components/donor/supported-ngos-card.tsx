import { ArrowRight, Building2, MapPin, Utensils } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { SupportedNGOSummary } from "@/features/donor-dashboard/types";

export function SupportedNgosCard({ ngos }: { ngos: SupportedNGOSummary[] }) {
  return (
    <Card className="h-full">
      <CardHeader title="Recently supported NGOs" description="Verified organizations connected to completed mock impact records." action={<Link href={ROUTES.donor.ngos} className="text-sm font-black text-brand-700 hover:text-brand-800">View all</Link>} />
      <CardContent className="grid gap-3">
        {ngos.map((ngo) => (
          <Link key={ngo.id} href={ROUTES.donor.ngoProfile(ngo.id)} className="group rounded-3xl border border-line p-4 transition hover:border-brand-200 hover:bg-brand-50">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Building2 className="size-6" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3"><h3 className="truncate font-black text-ink-900">{ngo.name}</h3><ArrowRight className="size-4 shrink-0 text-brand-600 transition group-hover:translate-x-0.5" /></div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-600"><MapPin className="size-3.5" /> {ngo.serviceAreas.slice(0, 2).join(" · ")}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-brand-800">
                  <span className="rounded-full bg-brand-100 px-2.5 py-1"><Utensils className="mr-1 inline size-3.5" />{ngo.mealsSupported} meals together</span>
                  <span className="rounded-full bg-canvas px-2.5 py-1 ring-1 ring-line">{ngo.completedRescues} rescues</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
