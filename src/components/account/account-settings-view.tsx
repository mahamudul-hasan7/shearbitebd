"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { PortalShell } from "@/components/layout/portal-shell";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

export function AccountSettingsView({ role }: { role: "donor" | "ngo" }) {
  const tx = useUiText();
  const routes = role === "donor" ? ROUTES.donor : ROUTES.ngo;
  return <PortalShell role={role} activeHref={routes.settings} title={tx("Account settings")} description={tx("Manage available account options.")} notificationHref={routes.notifications}>
    <div className="grid gap-5"><Card><CardHeader title={tx("Language on this browser")} description={tx("Your language choice is remembered by this browser.")} /><CardContent><LanguageSwitch /></CardContent></Card>
      <Card><CardHeader title={tx("Saved account details")} /><CardContent className="flex flex-wrap gap-3"><ButtonLink href={routes.editProfile} variant="outline">{tx("Edit profile")}</ButtonLink><ButtonLink href={routes.addresses} variant="outline">{tx("Manage addresses & pins")}</ButtonLink></CardContent></Card>
      <Card><CardHeader title={tx("Notification channels")} /><CardContent className="grid gap-3 text-sm"><p>{tx("In-app rescue notifications are available. SMS, email and push delivery preferences are not available yet.")}</p><ButtonLink href={routes.notifications} variant="outline">{tx("View in-app notifications")}</ButtonLink><p className="text-xs text-muted-600">{tx("Password reset and additional privacy settings are not connected yet.")}</p></CardContent></Card></div>
  </PortalShell>;
}
