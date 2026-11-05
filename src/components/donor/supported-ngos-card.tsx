import { ArrowRight, Building2, MapPin, Utensils } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { SupportedNGOSummary } from "@/features/donor-dashboard/types";

export function SupportedNgosCard({ ngos }: { ngos: SupportedNGOSummary[] }) {
  return (
    <Card className="h-full border-slate-200/90 shadow-xs">
      <CardHeader
        title="সহায়তাপ্রাপ্ত পার্টনার এনজিও"
        description="যেসব সার্টিফাইড এনজিও আপনার খাদ্য সরাসরি অভাবী মানুষের মাঝে পৌঁছে দিয়েছে।"
        action={
          <Link
            href={ROUTES.donor.ngos}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 font-heading hover:underline"
          >
            সবগুলো দেখুন →
          </Link>
        }
      />
      <CardContent className="grid gap-3">
        {ngos.map((ngo) => (
          <Link
            key={ngo.id}
            href={ROUTES.donor.ngoProfile(ngo.id)}
            className="group rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-4 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:shadow-xs"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs">
                <Building2 className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate font-black text-ink-900 font-heading">{ngo.name}</h3>
                  <ArrowRight className="size-4 shrink-0 text-emerald-600 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-600">
                  <MapPin className="size-3.5 text-emerald-600" /> {ngo.serviceAreas.slice(0, 2).join(" · ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold font-heading">
                  <span className="rounded-full bg-emerald-100/80 px-2.5 py-1 text-emerald-900 border border-emerald-300/40">
                    <Utensils className="mr-1 inline size-3.5 text-emerald-700" />
                    {ngo.mealsSupported}টি মিল যৌথভাবে বিতরণ
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-700 ring-1 ring-slate-200 shadow-2xs">
                    {ngo.completedRescues}টি সফল উদ্ধার
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
