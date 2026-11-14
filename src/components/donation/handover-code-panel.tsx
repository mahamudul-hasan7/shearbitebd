"use client";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handoverService, type HandoverChallengeState, type HandoverKind } from "@/services/handover.service";

export function HandoverCodePanel({ claimId, kind }: { claimId: string; kind: HandoverKind }) {
  const tx = useUiText();
  const [challenge, setChallenge] = useState<HandoverChallengeState>();
  const [issuedCode, setIssued] = useState<{ claimId: string; kind: HandoverKind; code: string; expiresAt: string }>();
  const issued = issuedCode?.claimId === claimId && issuedCode.kind === kind ? issuedCode : undefined;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const refresh = useCallback(async () => {
    try {
      const data = await handoverService.state(claimId);
      setChallenge(data.challenges.find((c) => c.kind === kind));
      setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Code status could not load."); }
  }, [claimId, kind]);
  useEffect(() => {
    const initial = window.setTimeout(() => { setNow(Date.now()); void refresh(); }, 0);
    const timer = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 10_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);
  async function generate() {
    setBusy(true); setError(""); setIssued(undefined);
    try { setIssued({ ...await handoverService.issue(claimId, kind), claimId, kind }); await refresh(); setNow(Date.now()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Code could not be created."); }
    finally { setBusy(false); }
  }
  const consumed = Boolean(challenge?.consumedAt);
  const expired = issued && Math.min(Date.parse(issued.expiresAt), Date.parse(challenge?.expiresAt || issued.expiresAt)) <= now;
  const cooldown = challenge?.reissueAfter ? Date.parse(challenge.reissueAfter) > now : false;
  return <Card id="handover">
    <CardHeader title={kind === "PICKUP" ? tx("Pickup handover code") : tx("Delivery handover code")} description={tx("হস্তান্তরের সময় assigned volunteer-কে এই code দিন।")} />
    <CardContent className="grid gap-4">
      {error && <p role="alert" className="text-sm text-red-700">{tx(error)}</p>}
      {consumed ? <p className="font-semibold text-emerald-700">{tx("Handover verified ✓")}</p> : <>
        {issued && !expired && challenge?.canIssue && <div className="rounded-2xl bg-emerald-50 p-5 text-center">
          <p className="font-mono text-4xl font-bold tracking-widest" aria-label={tx("Six digit handover code")}>{issued.code}</p>
          <p className="mt-3 text-sm">{tx("Expires:")}{" "}{new Date(issued.expiresAt).toLocaleTimeString(getUiLocale())}</p>
        </div>}
        {expired && <p>{tx("Code expired. Generate a replacement.")}</p>}
        {!challenge?.canIssue && <p className="text-sm">{tx("Pickup-এর জন্য volunteer assignment এবং delivery-এর জন্য verified pickup প্রয়োজন।")}</p>}
        {challenge?.issuedAt && !issued && !consumed && <p className="text-sm">{tx("Code শুধু তৈরির সময় দেখানো হয়। প্রয়োজন হলে replacement তৈরি করুন।")}</p>}
        <Button disabled={busy || !challenge?.canIssue || cooldown} onClick={() => void generate()}>{busy ? tx("Creating…") : challenge?.issuedAt ? tx("Generate replacement code") : tx("Generate six-digit code")}</Button>
        {cooldown && <p className="text-xs text-muted-600">{tx("Replacement তৈরির আগে এক মিনিট অপেক্ষা করুন।")}</p>}
        <p className="text-xs text-muted-600">{tx("Code একবার ব্যবহার করা যাবে, সর্বোচ্চ ১০ মিনিট কার্যকর থাকবে। এটি app-এর মাধ্যমে দেওয়া হয়।")}</p>
      </>}
    </CardContent>
  </Card>;
}
