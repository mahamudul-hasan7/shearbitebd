"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { Claim } from "@/types/domain";

export function ClaimActionPanel({ claim, busy, onRelease }: { claim: Claim; busy: boolean; onRelease: () => void }) {
  const tx = useUiText();
  return <Card>
    <CardHeader title={tx("Claim actions")} description={tx("প্রতিটি handover assigned volunteer OTP দিয়ে নিশ্চিত করবেন।")} />
    <CardContent className="grid gap-4">
      {claim.status === ClaimStatus.RESERVED && <p>{tx("Verified volunteer-এর dispatch গ্রহণের অপেক্ষায়।")}</p>}
      {claim.status === ClaimStatus.ASSIGNED && <p>{tx("Donor-এর pickup code দিয়ে volunteer pickup নিশ্চিত করবেন।")}</p>}
      {claim.status === ClaimStatus.PICKED_UP && <p>{tx("খাবার পৌঁছালে delivery code তৈরি করে volunteer-কে দিন।")}</p>}
      {claim.status === ClaimStatus.DELIVERED && <div className="flex flex-wrap gap-3">
        <ButtonLink href={ROUTES.ngo.confirmDelivery(claim.id)}>{tx("Record delivery receipt")}</ButtonLink>
        <ButtonLink href={ROUTES.ngo.distribution(claim.id)} variant="outline">{tx("Record distribution")}</ButtonLink>
      </div>}
      <ButtonLink href={ROUTES.ngo.reportIssue(claim.id)} variant="outline">{tx("Report an issue / history")}</ButtonLink>
      {claim.status === ClaimStatus.DISPUTED && <p className="rounded-xl bg-amber-50 p-4 font-semibold text-amber-900">{tx("Incident hold: admin/operator review না হওয়া পর্যন্ত pickup, delivery ও distribution বন্ধ।")}</p>}
      {claim.status === ClaimStatus.DISTRIBUTED && <p>{tx("Distribution ও impact database-এ সংরক্ষিত হয়েছে।")}</p>}
      {[ClaimStatus.RESERVED, ClaimStatus.ASSIGNED].includes(claim.status) && <Button disabled={busy} variant="outline" onClick={onRelease}>{tx("Release claim")}</Button>}
      {[ClaimStatus.CANCELLED, ClaimStatus.EXPIRED].includes(claim.status) && <p>{tx("This claim cannot continue.")}</p>}
    </CardContent>
  </Card>;
}
