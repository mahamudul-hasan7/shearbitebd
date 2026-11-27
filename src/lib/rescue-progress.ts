export type RescueRouteStage = "assigned" | "en_route_pickup" | "at_pickup" | "cargo_loaded" | "en_route_dropoff" | "completed";
export type RescueProgressScope = "donation" | "claim" | "rider";
export type RescueProgressState = "active" | "complete" | "paused" | "cancelled" | "expired" | "draft";
export type RescueProgressIcon = "package" | "claim" | "rider" | "pickup" | "ngo" | "people";
export interface RescueProgressTimes {
  publishedAt?: string;
  reservedAt?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  distributedAt?: string;
}
export interface RescueProgressInput extends RescueProgressTimes {
  scope?: RescueProgressScope;
  status: string;
  routeStage?: RescueRouteStage;
  updatedAt?: string;
  cancellationReason?: string;
}

const foodSteps = [
  { id: "posted", label: "Food posted", icon: "package", time: "publishedAt" },
  { id: "claimed", label: "NGO claimed", icon: "claim", time: "reservedAt" },
  { id: "rider", label: "Rider assigned", icon: "rider", time: "assignedAt" },
  { id: "pickup", label: "Pickup verified", icon: "pickup", time: "pickedUpAt" },
  { id: "delivery", label: "Delivery verified", icon: "ngo", time: "deliveredAt" },
  { id: "distributed", label: "Food distributed", icon: "people", time: "distributedAt" },
] as const;
const riderSteps = [
  { id: "assigned", label: "Mission assigned", icon: "rider", time: "assignedAt" },
  { id: "en_route_pickup", label: "Travelling to pickup", icon: "rider" },
  { id: "at_pickup", label: "At donor location", icon: "package" },
  { id: "cargo_loaded", label: "Pickup verified", icon: "pickup", time: "pickedUpAt" },
  { id: "en_route_dropoff", label: "Travelling to NGO", icon: "rider" },
  { id: "completed", label: "Delivery verified", icon: "ngo", time: "deliveredAt" },
] as const;
const descriptions: Record<string, string> = {
  posted: "Your food is ready for an NGO to claim.",
  claimed: "The NGO has reserved the food. A rider is needed next.",
  rider: "A rider is assigned. Pickup is the next handover.",
  pickup: "Pickup is verified. The food is with the rider.",
  delivery: "Delivery is verified. The NGO can record receipt and distribution.",
  distributed: "Distribution is recorded. This food journey is complete.",
  assigned: "Review the pickup details, then start your trip.",
  en_route_pickup: "The rider is on the way to collect the food.",
  at_pickup: "The rider is at the donor. Verify the pickup code when receiving the food.",
  cargo_loaded: "Pickup is verified. Continue towards the receiving NGO.",
  en_route_dropoff: "The rider is on the way to the receiving NGO.",
  completed: "The delivery handover is verified. The NGO handles receipt and distribution next.",
};

function recorded(value?: string) { return Boolean(value && Number.isFinite(Date.parse(value))); }

export function buildRescueProgress(input: RescueProgressInput) {
  const rider = input.scope === "rider";
  const definitions = rider ? riderSteps : foodSteps;
  let state: RescueProgressState = input.status === "DISPUTED" ? "paused" : input.status === "CANCELLED" ? "cancelled" : input.status === "EXPIRED" ? "expired" : input.status === "DRAFT" ? "draft" : "active";
  const exceptional = ["paused", "cancelled", "expired"].includes(state);
  let index = 0;
  if (rider) {
    index = Math.max(0, riderSteps.findIndex((step) => step.id === input.routeStage));
    if (["DELIVERED", "DISTRIBUTED"].includes(input.status) || recorded(input.deliveredAt)) index = riderSteps.length - 1;
    else if (exceptional && recorded(input.pickedUpAt)) index = Math.max(index, 3);
    if (!exceptional && index === riderSteps.length - 1) state = "complete";
  } else {
    index = ({ DRAFT: 0, PUBLISHED: 0, AVAILABLE: 0, RESERVED: 1, ASSIGNED: 2, PICKED_UP: 3, DELIVERED: 4, DISTRIBUTED: 5 } as Record<string, number>)[input.status] ?? 0;
    if (exceptional) {
      for (let i = 0; i < foodSteps.length; i++) if (recorded(input[foodSteps[i].time])) index = i;
    }
    if (input.status === "DISTRIBUTED") state = "complete";
  }
  const current = definitions[index];
  let title: string = current.label, description = descriptions[current.id];
  if (!rider && ["ASSIGNED", "PICKED_UP"].includes(input.status) && input.routeStage && ["en_route_pickup", "at_pickup", "en_route_dropoff"].includes(input.routeStage)) {
    title = riderSteps.find((step) => step.id === input.routeStage)?.label ?? title;
    description = descriptions[input.routeStage];
  }
  if (state === "paused") { title = "Rescue paused"; description = "An issue is under review. The last confirmed steps remain visible."; }
  if (state === "cancelled") { title = "Rescue cancelled"; description = "This rescue is closed. No further handover is available."; }
  if (state === "expired") { title = "Food deadline passed"; description = "The safe food deadline has passed. This journey cannot continue."; }
  if (state === "draft") { title = "Draft saved"; description = "Publish the food to begin its rescue journey."; }
  const steps = definitions.map((step, i) => {
    const timestamp = "time" in step ? input[step.time] : undefined;
    return { id: step.id, label: step.label, icon: step.icon as RescueProgressIcon, timestamp: recorded(timestamp) ? timestamp : undefined,
      done: state === "complete" || i < index || (exceptional && i === index && recorded(timestamp)), current: i === index };
  });
  return {
    scope: input.scope ?? "donation",
    state,
    index,
    title,
    description,
    stoppedAtLabel: current.label,
    completedSteps: steps.filter((step) => step.done).length,
    steps,
    position: index / (definitions.length - 1) * 100,
  };
}
