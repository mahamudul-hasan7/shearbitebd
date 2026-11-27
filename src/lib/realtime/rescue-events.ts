import { EventEmitter } from "node:events";

export interface RescueRealtimeEvent {
  type:
    | "donation.created"
    | "donation.cancelled"
    | "claim.created"
    | "claim.cancelled"
    | "mission.accepted"
    | "mission.released"
    | "handover.verified"
    | "distribution.completed"
    | "rescue.closed";
  summary: string;
  at: string;
}

const globalForEvents = globalThis as unknown as {
  sharebiteRescueBus?: EventEmitter;
};

const bus =
  globalForEvents.sharebiteRescueBus ??
  (() => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(100);
    globalForEvents.sharebiteRescueBus = emitter;
    return emitter;
  })();

export function emitRescueEvent(
  type: RescueRealtimeEvent["type"],
  summary: string,
) {
  const payload: RescueRealtimeEvent = {
    type,
    summary,
    at: new Date().toISOString(),
  };
  bus.emit("rescue", payload);
}

export function subscribeRescueEvents(
  listener: (event: RescueRealtimeEvent) => void,
) {
  bus.on("rescue", listener);
  return () => {
    bus.off("rescue", listener);
  };
}
