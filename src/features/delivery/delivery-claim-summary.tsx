"use client";
import type { ReactNode } from "react";
import { Building2, PackageOpen, Truck } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDonationQuantity,
  formatDonationQuantityBn,
} from "@/features/donations/donation-presentation";
import type { ClaimCoordinationDetails } from "@/services";
export function DeliveryClaimSummary({
  details,
}: {
  details: ClaimCoordinationDetails;
}) {
  const tx = useUiText(),
    { language } = useLanguage();
  return (
    <Card>
      <CardHeader
        title={details.donation.title}
        description={tx("Claim {0}", details.claim.id)}
        action={<StatusBadge status={details.claim.status} />}
      />
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <SummaryItem
          icon={<Building2 />}
          label={tx("Food donor")}
          value={details.donorOrganization}
        />
        <SummaryItem
          icon={<PackageOpen />}
          label={tx("Expected quantity")}
          value={
            language === "bn"
              ? formatDonationQuantityBn(details.donation)
              : formatDonationQuantity(details.donation)
          }
        />
        <SummaryItem
          icon={<Truck />}
          label={tx("Rescue partner")}
          value={details.volunteer?.displayName ?? tx("NGO pickup team")}
        >
          {details.volunteer && (
            <Badge tone="success" className="mt-2">
              {tx("Verified partner")}
            </Badge>
          )}
        </SummaryItem>
      </CardContent>
    </Card>
  );
}
function SummaryItem({
  icon,
  label,
  value,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-brand-50 p-3 sm:block sm:p-4">
      <span className="mt-1 shrink-0 text-brand-700 [&>svg]:size-5 sm:mt-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-600 sm:mt-2">{label}</p>
        <p className="mt-1 break-words font-bold text-ink-900">{value}</p>
        {children}
      </div>
    </div>
  );
}
