"use client";

import { CheckCircle2, ClipboardList, Home, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/lib/routes";
import { requestService, toServiceError } from "@/services";
import type { FoodRequest } from "@/types/domain";

export function RequestSubmitted({ requestId }: { requestId?: string }) {
  const [request, setRequest] = useState<FoodRequest>();
  const [serviceError, setServiceError] = useState<string>();
  const error = requestId ? serviceError : "No request reference was provided.";

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();
    requestService.getById(requestId, { signal: controller.signal }).then(setRequest).catch((reason: unknown) => { if (!controller.signal.aborted) setServiceError(toServiceError(reason).message); });
    return () => controller.abort();
  }, [requestId]);

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.newRequest} title="Request submitted" description="Your verified community need entered the frontend review workflow." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"}>
      {!request && !error && <SkeletonGroup label="Loading submitted request" className="grid gap-4"><Skeleton className="h-44" /><Skeleton className="h-64" /></SkeletonGroup>}
      {error && <Card><CardContent className="grid place-items-center p-8 text-center"><RefreshCw className="size-10 text-warning" /><h2 className="mt-4 text-xl font-black text-ink-900">Request reference unavailable</h2><p className="mt-2 text-sm text-muted-600">{error} The in-memory demo resets after a full browser refresh.</p><ButtonLink href={ROUTES.ngo.requests} className="mt-5">View my requests</ButtonLink></CardContent></Card>}
      {request && <div className="grid gap-6"><Card className="overflow-hidden border-brand-200"><div className="bg-brand-700 px-6 py-8 text-center text-white"><span className="mx-auto grid size-16 place-items-center rounded-full bg-white/15"><CheckCircle2 className="size-9" /></span><h2 className="mt-4 text-2xl font-black">Food request received</h2><p className="mt-2 text-sm text-white/80">Mock request ID: {request.id}</p></div><CardContent className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase text-muted-500">Status</p><div className="mt-2"><StatusBadge status={request.status} /></div></div><div><p className="text-xs font-bold uppercase text-muted-500">Meals</p><p className="mt-2 text-xl font-black text-ink-900">{request.mealsNeeded}</p></div><div><p className="text-xs font-bold uppercase text-muted-500">Needed by</p><p className="mt-2 text-sm font-bold text-ink-900">{new Date(request.neededBy).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</p></div></CardContent></Card><Card><CardHeader title="What happens next?" description="This is a frontend demonstration; no external team or donor was notified." /><CardContent><ol className="grid gap-4 sm:grid-cols-3"><li className="rounded-2xl bg-canvas p-4"><span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">1</span><p className="mt-3 font-bold text-ink-900">Review</p><p className="mt-1 text-sm text-muted-600">A future backend can verify the need and documents.</p></li><li className="rounded-2xl bg-canvas p-4"><span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">2</span><p className="mt-3 font-bold text-ink-900">Find a match</p><p className="mt-1 text-sm text-muted-600">Suitable surplus listings can be evaluated separately.</p></li><li className="rounded-2xl bg-canvas p-4"><span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">3</span><p className="mt-3 font-bold text-ink-900">Create a claim</p><p className="mt-1 text-sm text-muted-600">Only reserving a donation starts the claim workflow.</p></li></ol></CardContent></Card><div className="flex flex-wrap justify-center gap-3"><ButtonLink href={ROUTES.ngo.request(request.id)} leftIcon={<ClipboardList className="size-4" />}>View request</ButtonLink><ButtonLink href={ROUTES.ngo.dashboard} variant="outline" leftIcon={<Home className="size-4" />}>Go home</ButtonLink><ButtonLink href={ROUTES.ngo.newRequest} variant="ghost" leftIcon={<Plus className="size-4" />}>Create another</ButtonLink></div></div>}
    </PortalShell>
  );
}
