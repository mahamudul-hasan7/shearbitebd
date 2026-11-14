import type { MockAuthSession } from "@/features/auth/types";

// Display-only snapshot for existing stores. It never grants server access.
let session: MockAuthSession | undefined;
export function getClientSession() { return session; }
export function setClientSession(value: MockAuthSession | undefined) { session = value; }
