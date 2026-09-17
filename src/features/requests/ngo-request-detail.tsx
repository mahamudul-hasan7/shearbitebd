"use client";

import { ArrowLeft, CalendarClock, Edit3, MapPin, RefreshCw, Soup, Trash2, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { useNgoRequest } from "@/features/requests/use-ngo-requests";
import { DIETARY_TYPE_LABELS, FOOD_CATEGORY_LABELS, PRIORITY_META, PriorityLevel } from "@/lib/constants/domain";
import { REQUEST_LIFECYCLE, RequestStatus, STATUS_META } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { FoodRequest } from "@/types/domain";

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function RequestLifecycle({ request }: { request: FoodRequest }) {
  const currentIndex = REQUEST_LIFECYCLE.indexOf(request.status);
  const terminal = [RequestStatus.CANCELLED, RequestStatus.EXPIRED].includes(request.status);
  return (
    <ol className="grid gap-3 sm:grid-cols-5" aria-label="Request lifecycle">
      {REQUEST_LIFECYCLE.map((status, index) => {
        const reached = !terminal && index <= currentIndex;
        return <li key={status} className={cn("rounded-2xl border p-3 text-sm", reached ? "border-brand-200 bg-brand-50 text-brand-900" : "border-line bg-white text-muted-500")}><span className={cn("mr-2 inline-grid size-6 place-items-center rounded-full text-xs font-black", reached ? "bg-brand-600 text-white" : "bg-canvas")}>{index + 1}</span>{STATUS_META[status].label}</li>;
      })}
    </ol>
  );
}

export function NGORequestDetail({ requestId }: { requestId: string }) {
  const { state, busy, message, actionError, retry, update, cancel } = useNgoRequest(requestId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", purpose: "", recipientType: "", mealsNeeded: "", peopleToServe: "", neededBy: "", preferredTimeSlot: "", priority: PriorityLevel.MEDIUM, priorityReason: "", notes: "" });

  function beginEdit(request: FoodRequest) {
    setForm({ title: request.title, purpose: request.purpose, recipientType: request.recipientType, mealsNeeded: String(request.mealsNeeded), peopleToServe: String(request.peopleToServe), neededBy: localDateTime(request.neededBy), preferredTimeSlot: request.preferredTimeSlot ?? "", priority: request.priority, priorityReason: request.priorityReason ?? "", notes: request.notes ?? "" });
    setEditing(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await update({ title: form.title.trim(), purpose: form.purpose.trim(), recipientType: form.recipientType.trim(), mealsNeeded: Number(form.mealsNeeded), peopleToServe: Number(form.peopleToServe), neededBy: new Date(form.neededBy).toISOString(), preferredTimeSlot: form.preferredTimeSlot.trim() || undefined, priority: form.priority, priorityReason: form.priorityReason.trim() || undefined, notes: form.notes.trim() || undefined });
    if (saved) setEditing(false);
  }

  async function cancelRequest() {
    if (!window.confirm("Cancel this request? It will stop active matching and cannot be reopened in this demo.")) return;
    await cancel();
    setEditing(false);
  }

  if (state.status === "loading" && !state.data) return <PortalShell role="ngo" activeHref={ROUTES.ngo.newRequest} title="Request details" description="Loading the verified community need." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard}><SkeletonGroup label="Loading request details" className="grid gap-4"><Skeleton className="h-20" /><Skeleton className="h-64" /><Skeleton className="h-52" /></SkeletonGroup></PortalShell>;
  if (state.status === "error" && !state.data) return <PortalShell role="ngo" activeHref={ROUTES.ngo.newRequest} title="Request details" description="Review a verified community need." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard}><EmptyState icon={RefreshCw} title="Request could not load" description={state.error.message} action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={retry}>Try again</Button><ButtonLink href={ROUTES.ngo.requests} variant="outline">My requests</ButtonLink></div>} /></PortalShell>;

  const request = state.data;
  if (!request) return null;
  const canEdit = [RequestStatus.DRAFT, RequestStatus.PENDING_REVIEW].includes(request.status);
  const canCancel = [RequestStatus.DRAFT, RequestStatus.PENDING_REVIEW, RequestStatus.FINDING_MATCH, RequestStatus.MATCHED].includes(request.status);

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.newRequest} title={request.title} description={`Request ${request.id}`} profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.requests} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>My requests</ButtonLink>}>
      <div className="grid gap-6">
        {message && <Alert tone="success" title="Request updated" description={message} />}
        {actionError && <Alert tone="danger" title="Action could not complete" description={actionError} />}
        <Card><CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"><div><div className="flex flex-wrap gap-2"><StatusBadge status={request.status} /><Badge tone={request.priority === PriorityLevel.HIGH || request.priority === PriorityLevel.URGENT ? "warning" : "neutral"}>{PRIORITY_META[request.priority].label} priority</Badge></div><p className="mt-4 max-w-3xl text-sm leading-6 text-muted-600">{request.purpose} for {request.recipientType}. Request matching remains separate from claims until suitable surplus food is selected and reserved.</p></div><div className="flex flex-wrap gap-2">{canEdit && <Button variant="outline" leftIcon={<Edit3 className="size-4" />} onClick={() => beginEdit(request)}>Edit</Button>}{canCancel && <Button variant="danger" leftIcon={<Trash2 className="size-4" />} disabled={busy} onClick={cancelRequest}>Cancel request</Button>}</div></CardContent></Card>

        <Card><CardHeader title="Request progress" description={request.status === RequestStatus.CANCELLED ? "This request is cancelled and no longer matching." : "Frontend-only lifecycle preview; review and matching require a future backend."} /><CardContent><RequestLifecycle request={request} /></CardContent></Card>

        {editing ? <form onSubmit={save}><Card><CardHeader title="Edit request" description="Pending-review requests can update their core need and schedule." /><CardContent className="grid gap-5 md:grid-cols-2"><Input label="Title" value={form.title} required onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} containerClassName="md:col-span-2" /><Input label="Purpose" value={form.purpose} required onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))} /><Input label="Recipient group" value={form.recipientType} required onChange={(event) => setForm((current) => ({ ...current, recipientType: event.target.value }))} /><Input type="number" min={1} label="Meals needed" value={form.mealsNeeded} required onChange={(event) => setForm((current) => ({ ...current, mealsNeeded: event.target.value }))} /><Input type="number" min={1} label="People to serve" value={form.peopleToServe} required onChange={(event) => setForm((current) => ({ ...current, peopleToServe: event.target.value }))} /><Input type="datetime-local" label="Needed by" value={form.neededBy} required onChange={(event) => setForm((current) => ({ ...current, neededBy: event.target.value }))} /><Input label="Preferred time slot" value={form.preferredTimeSlot} onChange={(event) => setForm((current) => ({ ...current, preferredTimeSlot: event.target.value }))} /><Select label="Priority" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as PriorityLevel }))}>{Object.values(PriorityLevel).map((priority) => <option key={priority} value={priority}>{PRIORITY_META[priority].label}</option>)}</Select><Input label="Priority reason" value={form.priorityReason} required={form.priority === PriorityLevel.HIGH || form.priority === PriorityLevel.URGENT} onChange={(event) => setForm((current) => ({ ...current, priorityReason: event.target.value }))} /><Textarea label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} containerClassName="md:col-span-2" /><div className="flex flex-wrap justify-end gap-2 md:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditing(false)}>Discard</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div></CardContent></Card></form> : (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card><CardHeader title="Food and recipients" /><CardContent className="grid gap-4"><div className="grid gap-3 sm:grid-cols-2"><p className="flex items-center gap-2 text-sm"><Soup className="size-5 text-brand-600" /> <span><strong>{request.mealsNeeded}</strong> meals needed</span></p><p className="flex items-center gap-2 text-sm"><Users className="size-5 text-brand-600" /> <span><strong>{request.peopleToServe}</strong> people</span></p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-500">Categories</p><p className="mt-1 text-sm text-ink-900">{request.categories.map((item) => FOOD_CATEGORY_LABELS[item]).join(", ")}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-500">Dietary compatibility</p><p className="mt-1 text-sm text-ink-900">{request.dietaryTypes.map((item) => DIETARY_TYPE_LABELS[item]).join(", ")}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-500">Allergens or restrictions</p><p className="mt-1 text-sm text-ink-900">{request.allergensOrRestrictions.join(", ") || "None provided"}</p></div></CardContent></Card>
            <Card><CardHeader title="Time and location" /><CardContent className="grid gap-4"><p className="flex items-start gap-2 text-sm"><CalendarClock className="mt-0.5 size-5 text-brand-600" /><span><strong>{new Date(request.neededBy).toLocaleString("en-BD", { dateStyle: "full", timeStyle: "short" })}</strong><br /><span className="text-muted-600">Preferred: {request.preferredTimeSlot ?? "Flexible"}</span></span></p><p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-5 text-brand-600" /><span><strong>{request.deliveryLocation.addressLine}</strong><br /><span className="text-muted-600">{request.deliveryLocation.area}, {request.deliveryLocation.city}{request.deliveryLocation.landmark ? ` · ${request.deliveryLocation.landmark}` : ""}</span></span></p>{request.deliveryLocation.instructions && <p className="rounded-2xl bg-brand-50 p-3 text-sm text-brand-900">{request.deliveryLocation.instructions}</p>}</CardContent></Card>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
