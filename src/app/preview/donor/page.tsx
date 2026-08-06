import { ArrowRight, Building2, Clock3, PackageCheck, Plus, Utensils, UsersRound } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Donor Shell Preview" };

export default function DonorPreviewPage() {
  return (
    <PortalShell role="donor" activeHref="/preview/donor" title="Hello, Food Donor" description="Your responsive shell adapts from mobile bottom navigation to a desktop sidebar." actions={<Button leftIcon={<Plus className="size-4" />}>Add surplus food</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total donations" value="12" helper="All time" icon={PackageCheck} />
        <StatCard label="Active donations" value="3" helper="Ongoing" icon={Clock3} tone="accent" />
        <StatCard label="Meals rescued" value="198" helper="All time" icon={Utensils} tone="success" />
        <StatCard label="NGOs helped" value="8" helper="Across Dhaka" icon={Building2} tone="info" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Active donation" description="A shared card can be composed differently on mobile and desktop." action={<Badge tone="danger">High priority</Badge>} />
          <CardContent>
            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-2xl font-black">Veg Meal Pack</h3>
                <p className="mt-2 text-sm text-muted-600">UIU Cafeteria · 40 meal packs · Refrigerated</p>
                <div className="mt-5 flex flex-wrap gap-2"><Badge>Posted</Badge><Badge tone="success">Matched</Badge><Badge tone="warning">Pickup pending</Badge></div>
              </div>
              <div className="rounded-3xl bg-red-50 p-5 text-center"><p className="text-xs font-bold uppercase tracking-wider text-red-700">Rescue clock</p><p className="mt-2 text-3xl font-black text-danger">01:45:32</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Quick actions" description="Reusable action tiles" />
          <CardContent className="grid grid-cols-2 gap-3">
            {[{ icon: Plus, label: "Add food" }, { icon: PackageCheck, label: "Donations" }, { icon: UsersRound, label: "NGOs" }, { icon: ArrowRight, label: "Support" }].map(({ icon: Icon, label }) => <button key={label} className="grid min-h-28 place-items-center rounded-2xl bg-brand-50 p-4 text-sm font-bold text-brand-800 transition hover:bg-brand-100"><Icon className="size-6" /><span>{label}</span></button>)}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8"><SectionHeader title="Responsive foundation ready" description="Authentication and full donor pages will use these shared tokens and layouts in the next phases." /></div>
    </PortalShell>
  );
}
