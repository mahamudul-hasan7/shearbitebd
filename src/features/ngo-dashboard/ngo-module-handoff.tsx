import { ArrowLeft, Construction, ShieldCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function NGOModuleHandoff({ title, description, moduleName, activeHref = ROUTES.ngo.dashboard, context }: { title: string; description: string; moduleName: string; activeHref?: string; context?: string }) {
  return <PortalShell role="ngo" activeHref={activeHref} title={title} description={description} profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"}>
    <Card className="mx-auto max-w-3xl p-6 text-center sm:p-10"><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-100 text-brand-700"><Construction className="size-8" /></span><Badge tone="info" className="mt-5">Dashboard handoff</Badge><h2 className="mt-4 text-2xl font-black text-ink-900">{moduleName}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-600">This route is connected so dashboard navigation never ends at a missing page. Its complete workflow is delivered in the dedicated upcoming NGO phase.</p>{context && <p className="mt-3 text-xs font-bold text-brand-700">Context: {context}</p>}<Alert className="mt-6 text-left" tone="info" title="Protected frontend preview" description="The NGO route guard is active. Backend authorization and production operations remain future integrations." /><div className="mt-7 flex flex-wrap justify-center gap-3"><ButtonLink href={ROUTES.ngo.dashboard} leftIcon={<ArrowLeft className="size-4" />}>Back to dashboard</ButtonLink><ButtonLink href={ROUTES.ngo.discover} variant="outline" leftIcon={<ShieldCheck className="size-4" />}>Browse handoff</ButtonLink></div></Card>
  </PortalShell>;
}
