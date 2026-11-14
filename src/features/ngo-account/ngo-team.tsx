"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
export function NGOTeam() {
  const tx = useUiText();
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.team} title={tx("Team & permissions")} description={tx("Organization team access.")} notificationHref={ROUTES.ngo.notifications}><Card><CardHeader title={tx("Team invitations are not available yet")} /><CardContent className="grid gap-4 text-sm"><p>{tx("Your signed-in NGO account can manage its own claims and food requests. Additional team invitations and permission changes are not connected yet.")}</p><ButtonLink href={ROUTES.ngo.profile} variant="outline">{tx("View organization profile")}</ButtonLink></CardContent></Card></PortalShell>;
}
