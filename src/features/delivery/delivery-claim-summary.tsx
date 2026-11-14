"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import { Building2, PackageOpen, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDonationQuantity } from "@/features/donations/donation-presentation";
import type { ClaimCoordinationDetails } from "@/services";

export function DeliveryClaimSummary({ details }: { details: ClaimCoordinationDetails }) {
  const tx = useUiText();
  return (
    <Card>
      <CardHeader
        title={details.donation.title}
        description={tx("Claim {0}", details.claim.id)}
        action={<StatusBadge status={details.claim.status} />}
      />
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-brand-50 p-4">
          <Building2 className="size-5 text-brand-700" />
          <p className="mt-2 text-xs text-muted-600">{tx("Food donor")}</p>
          <p className="mt-1 font-black text-ink-900">{details.donorOrganization}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-4">
          <PackageOpen className="size-5 text-brand-700" />
          <p className="mt-2 text-xs text-muted-600">{tx("Expected quantity")}</p>
          <p className="mt-1 font-black text-ink-900">{formatDonationQuantity(details.donation)}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-4">
          <Truck className="size-5 text-brand-700" />
          <p className="mt-2 text-xs text-muted-600">{tx("Rescue partner")}</p>
          <p className="mt-1 font-black text-ink-900">{details.volunteer?.displayName ?? "NGO pickup team"}</p>
          {details.volunteer && <Badge tone="success" className="mt-2">{tx("Verified partner")}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
