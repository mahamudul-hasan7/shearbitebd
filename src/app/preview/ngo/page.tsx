import { ArrowRight, Box, Clock3, MapPin, PackageCheck, Search, UsersRound } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "NGO Shell Preview" };

const donations = [
  { title: "Veg Meal Pack", donor: "UIU Cafeteria", quantity: "40 meal packs", distance: "1.2 km", match: "92%", priority: "High" },
  { title: "Bakery Items Mix", donor: "Bella Bakery", quantity: "30 meal packs", distance: "1.8 km", match: "88%", priority: "High" },
  { title: "Fresh Fruit Pack", donor: "Event Hub, UIU", quantity: "25 meal packs", distance: "2.6 km", match: "78%", priority: "Medium" },
];

export default function NgoPreviewPage() {
  return (
    <PortalShell role="ngo" activeHref="/preview/ngo" title="Recommended for your NGO" description="Discover nearby surplus food using a clean list and map-ready desktop layout." actions={<Button leftIcon={<Search className="size-4" />}>Browse food</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available nearby" value="18" helper="Within 5 km" icon={Box} />
        <StatCard label="Active claims" value="4" helper="Ongoing" icon={Clock3} tone="accent" />
        <StatCard label="Meals distributed" value="86" helper="This week" icon={PackageCheck} tone="success" />
        <StatCard label="People served" value="120" helper="Today" icon={UsersRound} tone="info" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader title="Smart-matched donations" description="Cards remain readable at every breakpoint." />
          <CardContent>
            <Input placeholder="Search food, donor or area" leftIcon={<Search className="size-5" />} />
            <div className="mt-5 grid gap-3">
              {donations.map((donation) => (
                <article key={donation.title} className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{donation.title}</h3><Badge tone={donation.priority === "High" ? "danger" : "warning"}>{donation.priority} priority</Badge></div><p className="mt-2 text-sm text-muted-600">{donation.donor} · {donation.quantity}</p><p className="mt-2 flex items-center gap-1 text-xs font-bold text-brand-700"><MapPin className="size-4" />{donation.distance} away</p></div>
                  <div className="flex items-center justify-between gap-3 sm:block sm:text-right"><Badge>{donation.match} match</Badge><Button size="sm" className="sm:mt-3" rightIcon={<ArrowRight className="size-4" />}>Details</Button></div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="surface-grid grid min-h-72 place-items-center bg-brand-50 p-6 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-white"><MapPin className="size-8" /></span><h3 className="mt-5 text-xl font-black">Map-ready panel</h3><p className="mt-2 text-sm leading-6 text-muted-600">Leaflet or another map provider can be integrated later without changing the surrounding layout.</p><Button variant="outline" className="mt-5">Open map view</Button></div></div>
        </Card>
      </div>
    </PortalShell>
  );
}
