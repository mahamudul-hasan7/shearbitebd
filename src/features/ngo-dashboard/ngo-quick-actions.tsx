import { CheckCircle2, ClipboardList, Plus, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function NGOQuickActions({ activeClaimId }: { activeClaimId?: string }) {
  const actions = [
    { label: "Browse Food", description: "See nearby safe surplus listings", href: ROUTES.ngo.discover, icon: Search, primary: true },
    { label: "My Claims", description: "Manage reserved and active rescues", href: ROUTES.ngo.claims, icon: ClipboardList },
    { label: "Create Demand Request", description: "Publish a verified food need", href: ROUTES.ngo.newRequest, icon: Plus },
    { label: "Confirm Delivery", description: activeClaimId ? "Continue the active rescue" : "Available with an active claim", href: activeClaimId ? ROUTES.ngo.confirmDelivery(activeClaimId) : ROUTES.ngo.claims, icon: CheckCircle2, disabled: !activeClaimId },
  ];
  return <Card><CardHeader title="Quick actions" description="Move a verified food rescue forward." /><CardContent className="grid gap-3">{actions.map((action) => <ButtonLink key={action.label} href={action.href} disabled={action.disabled} variant={action.primary ? "primary" : "outline"} fullWidth className="h-auto justify-start px-4 py-3 text-left" leftIcon={<span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${action.primary ? "bg-white/15" : "bg-brand-100 text-brand-700"}`}><action.icon className="size-5" /></span>}><span><span className="block font-black">{action.label}</span><span className={`mt-0.5 block text-xs font-medium ${action.primary ? "text-white/75" : "text-muted-600"}`}>{action.description}</span></span></ButtonLink>)}</CardContent></Card>;
}
