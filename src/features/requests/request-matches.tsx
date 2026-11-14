"use client";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { requestService, type FoodRequestMatch } from "@/services/request.service";
import { apiRequest } from "@/services/http";
import { toServiceError } from "@/services/shared";
import { ROUTES } from "@/lib/routes";
import type { Claim } from "@/types/domain";

export function RequestMatches({ requestId }: { requestId: string }) {
  const tx = useUiText();
  const router = useRouter();
  const [matches, setMatches] = useState<FoodRequestMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState("");
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const refresh = useCallback(async () => {
    try { const result = await requestService.matches(requestId); setMatches(result.matches); }
    catch (caught) { setError(toServiceError(caught).message); }
    finally { setLoading(false); }
  }, [requestId]);
  useEffect(() => {
    const initial = window.setTimeout(() => { void refresh(); }, 0);
    const timer = window.setInterval(() => { void refresh(); }, 10_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);
  async function reserve(item: FoodRequestMatch) {
    setAccepting(item.donation.id); setError("");
    try {
      const { claim } = await apiRequest<{ claim: Claim }>("/api/claims", { method: "POST", body: JSON.stringify({ donationId: item.donation.id, foodRequestId: requestId, allergenReviewAcknowledged: acknowledged[item.donation.id] === true }) });
      router.push(ROUTES.ngo.claim(claim.id));
    } catch (caught) { setError(toServiceError(caught).message); await refresh(); }
    finally { setAccepting(""); }
  }
  return <section className="grid gap-4" aria-label={tx("Suitable donations")}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{tx("Suitable donations")}</h2><Button variant="outline" size="sm" disabled={loading} onClick={() => { setError(""); void refresh(); }}>{tx("Refresh matches")}</Button></div>
    <p className="text-sm text-muted-600">{tx("Category, declared diet, city ও সময় মিলিয়ে দেখানো হয়। Location distance বা delivery ETA মাপা হয়নি। Donor-এর declaration ও restrictions যাচাই করে খাবার নিন।")}</p>
    {loading && <p>{tx("Finding matching food…")}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{tx(error)}</p>}
    {!loading && !matches.length && <p className="rounded-2xl border border-dashed border-slate-300 p-5">{tx("এখন reserve করার মতো উপযুক্ত donation নেই, অথবা প্রয়োজনীয় meals ইতিমধ্যে reserved/fulfilled হয়েছে।")}</p>}
    <div className="grid gap-4 md:grid-cols-2">{matches.map((item) => <Card key={item.donation.id}><CardHeader title={item.donation.title} description={item.donation.pickup.approximateArea} /><CardContent className="grid gap-4">
      <p>{item.donation.quantity.value} {tx(item.donation.quantity.unit.toLowerCase())} · {item.donation.quantity.estimatedMeals} {" "}{tx("declared meals")}</p>
      <p className="text-sm">{tx("Rule match score:")}{" "}{item.score}/100 · {item.mealsToAllocate} {" "}{tx("meals allocated to this request")}</p>
      <p className="text-xs text-muted-600">{tx("পুরো donation-টি claim হবে। Request-এর প্রয়োজনের অতিরিক্ত খাবার থাকলে সেটিও নিতে হবে; actual distribution আলাদাভাবে record হবে।")}</p>
      <p className="text-sm">{tx("Declared allergens:")}{" "}{item.donation.allergens.join(", ") || tx("None declared")}</p>
      <p className="text-xs">{tx("Donor-declared deadline:")}{" "}{new Date(item.donation.safePickupDeadline).toLocaleString(getUiLocale())}</p>
      {item.allergenReviewRequired && <Checkbox label={tx("I reviewed the donor declaration and restrictions for {0}", item.donation.title)} checked={acknowledged[item.donation.id] || false} onChange={(e) => setAcknowledged((old) => ({ ...old, [item.donation.id]: e.target.checked }))} />}
      <Button disabled={Boolean(accepting) || (item.allergenReviewRequired && !acknowledged[item.donation.id])} onClick={() => void reserve(item)}>{accepting === item.donation.id ? tx("Reserving…") : tx("Reserve for this request")}</Button>
    </CardContent></Card>)}</div>
  </section>;
}
