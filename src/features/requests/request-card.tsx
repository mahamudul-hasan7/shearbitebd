import { CalendarClock, MapPin, Soup, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FOOD_CATEGORY_LABELS, PRIORITY_META } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import type { FoodRequest } from "@/types/domain";

const REQUEST_TYPE_LABELS = { ONE_TIME: "One-time", RECURRING: "Recurring", EMERGENCY: "Emergency" } as const;
const REQUEST_TIMING_LABELS = { ASAP: "Needed ASAP", TODAY: "Needed today", TOMORROW: "Needed tomorrow", CUSTOM: "Custom timing" } as const;

export function RequestCard({ request }: { request: FoodRequest }) {
  return (
    <Card>
      <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={request.status} /><Badge tone={request.priority === "HIGH" || request.priority === "URGENT" ? "warning" : "neutral"}>{PRIORITY_META[request.priority].label} priority</Badge><Badge tone="info">{REQUEST_TYPE_LABELS[request.requestType]}</Badge><Badge tone="neutral">{REQUEST_TIMING_LABELS[request.neededWhen]}</Badge><span className="text-xs font-bold text-muted-500">{request.id}</span></div>
          <h2 className="mt-3 text-xl font-black text-ink-900">{request.title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-600">{request.purpose} · {request.recipientType}</p>
          <div className="mt-4 grid gap-3 text-sm text-muted-600 sm:grid-cols-2 xl:grid-cols-4">
            <span className="flex items-center gap-2"><Soup className="size-4 text-brand-600" aria-hidden="true" />{request.mealsNeeded} meals</span>
            <span className="flex items-center gap-2"><Users className="size-4 text-brand-600" aria-hidden="true" />{request.peopleToServe} people</span>
            <span className="flex items-center gap-2"><MapPin className="size-4 text-brand-600" aria-hidden="true" />{request.deliveryLocation.area}</span>
            <span className="flex items-center gap-2"><CalendarClock className="size-4 text-brand-600" aria-hidden="true" />{new Date(request.neededBy).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
          <p className="mt-4 text-xs text-muted-500">{request.categories.map((category) => FOOD_CATEGORY_LABELS[category]).join(" · ")}</p>
        </div>
        <ButtonLink href={ROUTES.ngo.request(request.id)} variant="outline">View request</ButtonLink>
      </CardContent>
    </Card>
  );
}
