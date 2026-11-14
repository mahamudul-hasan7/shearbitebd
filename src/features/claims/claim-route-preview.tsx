"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RescueLocationMap } from "@/components/maps/rescue-location-map";
import { formatAddress } from "@/features/claims/claim-presentation";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimRoutePreview({ details }: { details: ClaimCoordinationDetails }) {
  const tx = useUiText();
  const pickup = details.donation.pickup.exactAddress;
  const delivery = details.deliveryAddress;
  return <Card><CardHeader title={tx("Rescue locations & navigation")} description={tx("Saved pickup and delivery points for this rescue.")} /><CardContent>
    <RescueLocationMap pickup={pickup?.coordinates} delivery={delivery?.coordinates} pickupLabel={pickup ? formatAddress(pickup) : details.donation.pickup.approximateArea} deliveryLabel={delivery ? formatAddress(delivery) : undefined} />
  </CardContent></Card>;
}
