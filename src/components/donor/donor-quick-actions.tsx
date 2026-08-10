import { CircleHelp, PackageSearch, Plus, ScanLine } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function DonorQuickActions({ activeDonationId }: { activeDonationId?: string }) {
  const actions = [
    { label: "Add Surplus Food", description: "Create a food rescue listing", href: ROUTES.donor.newDonation, icon: Plus, tone: "bg-brand-600 text-white" },
    { label: "My Donations", description: "Review every donation", href: ROUTES.donor.donations, icon: PackageSearch, tone: "bg-brand-50 text-brand-800" },
    { label: "Scan QR Handover", description: "Open pickup verification", href: activeDonationId ? ROUTES.donor.donationTracking(activeDonationId) : ROUTES.donor.donations, icon: ScanLine, tone: "bg-accent-50 text-accent-600" },
    { label: "Help & Support", description: "Get workflow guidance", href: ROUTES.donor.support, icon: CircleHelp, tone: "bg-info-soft text-info-strong" },
  ];

  return (
    <Card className="h-full">
      <CardHeader title="Quick actions" description="Start the next donor task." />
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {actions.map(({ label, description, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className={`group min-h-32 rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-card ${tone}`}>
            <span className="grid size-10 place-items-center rounded-2xl bg-white/85 text-current shadow-sm"><Icon className="size-5" aria-hidden="true" /></span>
            <span className="mt-4 block text-sm font-black">{label}</span>
            <span className="mt-1 block text-xs leading-5 opacity-75">{description}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
