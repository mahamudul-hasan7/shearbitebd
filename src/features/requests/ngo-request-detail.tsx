"use client";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useState, type FormEvent } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNgoRequest } from "@/features/requests/use-ngo-requests";
import { RequestMatches } from "@/features/requests/request-matches";
import { useMockAuth } from "@/features/auth/mock-auth";
import { FOOD_CATEGORY_LABELS, DIETARY_TYPE_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";

function localDateTime(value: string) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); }
export function NGORequestDetail({ requestId }: { requestId: string }) {
  const tx = useUiText();
  const { session } = useMockAuth();
  const { state, busy, message, actionError, retry, update, cancel } = useNgoRequest(requestId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", purpose: "", peopleToServe: "", mealsNeeded: "", neededBy: "", notes: "" });
  const request = state.data;
  const open = request && ["FINDING_MATCH", "MATCHED"].includes(request.status);
  const canCancel = open && !(request?.mealsReserved || 0);
  const canEdit = canCancel && !(request?.mealsFulfilled || 0);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (await update({ title: form.title, purpose: form.purpose, peopleToServe: Number(form.peopleToServe), mealsNeeded: Number(form.mealsNeeded), neededBy: new Date(form.neededBy).toISOString(), notes: form.notes })) setEditing(false);
  }
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.requests} title={request?.title || "Food request"} description={tx("Request matching, linked rescues এবং actual meal fulfillment.")} profileName={session?.displayName || "NGO"} avatarInitials={session?.displayName.slice(0, 2).toUpperCase()} backHref={ROUTES.ngo.requests} backLabel={tx("My requests")}>
    <div className="grid gap-6">
      {state.status === "loading" && !request && <p>{tx("Loading request…")}</p>}
      {state.status === "error" && !request && <div role="alert"><p>{tx(state.error.message)}</p><Button onClick={retry}>{tx("Try again")}</Button></div>}
      {actionError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{actionError}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{message}</p>}
      {request && <>
        <Card><CardHeader title={tx("Request progress")} description={request.id} action={<StatusBadge status={request.status} />} /><CardContent className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label={tx("Meals fulfilled")} value={`${request.mealsFulfilled || 0} / ${request.mealsNeeded}`} />
            <Metric label={tx("Meals reserved")} value={request.mealsReserved || 0} />
            <Metric label={tx("Still to reserve")} value={request.remainingMeals ?? request.mealsNeeded} />
          </div>
          <p className="text-sm">{request.purpose} · {request.recipientType} · {request.peopleToServe} {" "}{tx("planned recipients")}</p>
          <p className="text-sm">{tx("Claim করলে meals reserved হয়। Recorded distribution-এর পর fulfilled meal count বাড়ে।")}</p>
          {request.requestType === "RECURRING" && <p className="text-xs text-muted-600">{tx("Recurring program intent: এই request শুধু উল্লেখিত occurrence-এর জন্য। Future occurrence আলাদাভাবে তৈরি করুন।")}</p>}
          <div className="flex flex-wrap gap-3">
            {canEdit && <Button variant="outline" onClick={() => { setForm({ title: request.title, purpose: request.purpose, peopleToServe: String(request.peopleToServe), mealsNeeded: String(request.mealsNeeded), neededBy: localDateTime(request.neededBy), notes: request.notes || "" }); setEditing(true); }}>{tx("Edit request")}</Button>}
            {canCancel && <Button variant="danger" disabled={busy} onClick={() => { if (window.confirm("Cancel the remaining food need? Existing distribution history will be retained.")) void cancel(); }}>{tx("Cancel request")}</Button>}
          </div>
        </CardContent></Card>
        {editing && <form onSubmit={save}><Card><CardHeader title={tx("Edit request")} /><CardContent className="grid gap-4 sm:grid-cols-2">
          <Input label={tx("Request title")} required value={form.title} onChange={(e) => setForm((old) => ({ ...old, title: e.target.value }))} />
          <Input label={tx("Purpose")} required value={form.purpose} onChange={(e) => setForm((old) => ({ ...old, purpose: e.target.value }))} />
          <Input label={tx("People to serve")} type="number" min="1" step="1" required value={form.peopleToServe} onChange={(e) => setForm((old) => ({ ...old, peopleToServe: e.target.value }))} />
          <Input label={tx("Meals needed")} type="number" min="1" step="1" required value={form.mealsNeeded} onChange={(e) => setForm((old) => ({ ...old, mealsNeeded: e.target.value }))} />
          <Input label={tx("Needed by")} type="datetime-local" required value={form.neededBy} onChange={(e) => setForm((old) => ({ ...old, neededBy: e.target.value }))} />
          <Textarea label={tx("Notes")} value={form.notes} onChange={(e) => setForm((old) => ({ ...old, notes: e.target.value }))} />
          <Button type="submit" disabled={busy}>{tx("Save changes")}</Button><Button variant="outline" type="button" onClick={() => setEditing(false)}>{tx("Discard")}</Button>
        </CardContent></Card></form>}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card><CardHeader title={tx("Food requirements")} /><CardContent className="grid gap-3 text-sm"><p>{request.categories.map((c) => FOOD_CATEGORY_LABELS[c]).join(", ")}</p><p>{request.dietaryTypes.map((d) => DIETARY_TYPE_LABELS[d]).join(", ")}</p><p>{tx("Restrictions:")}{" "}{request.allergensOrRestrictions.join(", ") || "None stated"}</p><p>{request.specificPreferences}</p></CardContent></Card>
          <Card><CardHeader title={tx("Delivery and deadline")} /><CardContent className="grid gap-3 text-sm"><p>{request.deliveryLocation.addressLine}</p><p>{request.deliveryLocation.area}, {request.deliveryLocation.city}</p><p>{request.deliveryLocation.instructions}</p><p>{tx("Needed by:")}{" "}{new Date(request.neededBy).toLocaleString(getUiLocale())}</p><p>{request.preferredTimeSlot}</p></CardContent></Card>
        </div>
        {open && <RequestMatches requestId={request.id} />}
        <Card><CardHeader title={tx("Linked rescues")} description={tx("এই request-এর reserved ও distributed খাবারের history.")} /><CardContent className="grid gap-3">
          {!request.linkedClaims?.length && <p className="text-sm">{tx("এখনও কোনো linked claim নেই। Suitable donation reserve করলে এখানে দেখা যাবে।")}</p>}
          {request.linkedClaims?.map((claim) => <div key={claim.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
            <div className="grid gap-1"><p className="font-semibold">{claim.title}</p><p className="text-xs text-muted-600">{claim.status} · {claim.mealsAllocated} {" "}{tx("allocated ·")}{" "}{claim.mealsDistributed} {" "}{tx("meals distributed")}</p></div>
            <ButtonLink size="sm" variant="outline" href={ROUTES.ngo.claim(claim.id)}>{tx("View linked rescue")}</ButtonLink>
          </div>)}
        </CardContent></Card>
      </>}
    </div>
  </PortalShell>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs text-muted-600">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
