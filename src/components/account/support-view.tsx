"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function SupportView({ role }: { role: "donor" | "ngo" }) {
  const tx = useUiText();
  const routes = role === "donor" ? ROUTES.donor : ROUTES.ngo;
  const rescues = role === "donor" ? ROUTES.donor.donations : ROUTES.ngo.claims;
  return <PortalShell role={role} activeHref={routes.support} title={tx("Help & rescue issues")} description={tx("Use the connected report workflow for a food rescue issue.")} notificationHref={routes.notifications}>
    <Card><CardHeader title={tx("Report an issue with a rescue")} /><CardContent className="grid gap-4 text-sm"><p>{tx("অনুদান বা claim খুলে “Report an issue” বেছে নিন। বর্ণনা ও প্রয়োজন হলে ছবি যোগ করলে report সংরক্ষিত হবে। চলমান rescue-এ report হলে handover সাময়িকভাবে থামবে এবং operator review প্রয়োজন হবে।")}</p><ButtonLink href={rescues} variant="outline">{tx("Open my rescues")}</ButtonLink><p className="text-xs text-muted-600">{tx("A support ticket inbox and a staffed project hotline are not available yet. Contact your project operator directly for account help.")}</p></CardContent></Card>
  </PortalShell>;
}
