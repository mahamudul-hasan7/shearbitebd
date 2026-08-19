import { CheckCircle2, Clock3, KeyRound, QrCode, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fallbackVerificationCode, isClaimStepComplete } from "@/features/claims/claim-presentation";
import { ClaimStatus } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";
import type { Claim } from "@/types/domain";

function MockQr({ token, label }: { token: string; label: string }) {
  const cells = Array.from({ length: 169 }, (_, index) => {
    const character = token.charCodeAt(index % token.length);
    const row = Math.floor(index / 13);
    const column = index % 13;
    const finder = (row < 4 && column < 4) || (row < 4 && column > 8) || (row > 8 && column < 4);
    return finder || ((character + index * 7 + row * column) % 5 < 2);
  });
  return <div role="img" aria-label={`${label} mock QR placeholder`} className="grid aspect-square w-36 grid-cols-[repeat(13,minmax(0,1fr))] gap-px rounded-xl border-8 border-white bg-white p-1 shadow-sm ring-1 ring-line">{cells.map((active, index) => <span key={index} className={active ? "bg-ink-950" : "bg-white"} />)}</div>;
}

function VerificationCard({
  kind,
  token,
  complete,
  unavailable,
}: {
  kind: "Pickup" | "Delivery";
  token?: string;
  complete: boolean;
  unavailable: boolean;
}) {
  const code = fallbackVerificationCode(token);
  return (
    <Card className="overflow-hidden">
      <CardHeader title={`${kind} verification`} description={`${kind === "Pickup" ? "Donor handover" : "NGO receipt"} uses a separate mock token.`} action={<Badge tone={complete ? "success" : unavailable ? "neutral" : "warning"}>{complete ? "Verified" : unavailable ? "Not issued" : "Pending"}</Badge>} />
      <CardContent className="grid gap-5">
        {token ? <div className="grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]"><MockQr token={token} label={kind} /><div><div className="flex items-center gap-2 text-brand-800"><QrCode className="size-5" /><p className="font-black">Mock {kind.toLowerCase()} QR</p></div><p className="mt-2 text-sm leading-6 text-muted-600">Show only at the correct handover. This frontend placeholder is labelled one-time and time-limited, but real enforcement requires a backend.</p><div className="mt-4 flex items-center gap-2"><Clock3 className="size-4 text-warning-strong" /><span className="text-xs font-bold text-warning-strong">Demo token · expires after use in a real system</span></div></div></div> : <div className="rounded-2xl border border-dashed border-line bg-canvas p-5 text-center"><ShieldCheck className="mx-auto size-7 text-muted-400" /><p className="mt-2 text-sm font-bold text-muted-600">{complete ? "The earlier demo token is no longer displayed." : "Token appears after volunteer assignment."}</p></div>}
        <div><div className="flex items-center gap-2"><KeyRound className="size-4 text-brand-700" /><p className="text-sm font-black text-ink-900">6-digit fallback code</p></div><div aria-label={`${kind} fallback code ${code}`} className="mt-3 grid grid-cols-6 gap-2">{code.split("").map((digit, index) => <span key={`${digit}-${index}`} className={cn("grid h-12 place-items-center rounded-xl border text-lg font-black", token ? "border-brand-200 bg-brand-50 text-brand-900" : "border-line bg-canvas text-muted-400")}>{digit}</span>)}</div></div>
        {complete && <p className="flex items-center gap-2 text-sm font-bold text-success-strong"><CheckCircle2 className="size-5" />Mock verification completed</p>}
      </CardContent>
    </Card>
  );
}

export function ClaimVerificationPanel({ claim }: { claim: Claim }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <VerificationCard kind="Pickup" token={claim.pickupVerificationToken} complete={isClaimStepComplete(claim.status, ClaimStatus.PICKED_UP)} unavailable={claim.status === ClaimStatus.RESERVED} />
      <VerificationCard kind="Delivery" token={claim.deliveryVerificationToken} complete={isClaimStepComplete(claim.status, ClaimStatus.DELIVERED)} unavailable={[ClaimStatus.RESERVED].includes(claim.status)} />
    </div>
  );
}
