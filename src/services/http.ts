import { MockApiError } from "@/services/shared";

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json();
  if (!response.ok) throw new MockApiError({ code: response.status === 409 ? "CONFLICT" : response.status === 422 ? "VALIDATION_ERROR" : response.status === 404 ? "NOT_FOUND" : "FORBIDDEN", message: body.error || "Request failed.", status: response.status, retryable: response.status >= 500, fieldErrors: body.fieldErrors });
  return body as T;
}
