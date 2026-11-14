import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { currentAuth } from "@/lib/auth/server";
import type { UserRole } from "@/lib/constants/roles";

export class ApiError extends Error {
  constructor(public status: number, message: string, public fieldErrors?: Record<string, string>) { super(message); }
}

export async function requireAuth(role?: UserRole) {
  const auth = await currentAuth();
  if (!auth) throw new ApiError(401, "Please log in to continue.");
  if (role && auth.user.role !== role) throw new ApiError(403, "This action is not available for your account role.");
  return auth;
}

export function apiError(error: unknown) {
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Send valid JSON request data." }, { status: 400 });
  if (error instanceof ApiError) return NextResponse.json({ error: error.message, fieldErrors: error.fieldErrors }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "This record already exists or is already claimed." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Record not found." }, { status: 404 });
    if (error.code === "P2034") return NextResponse.json({ error: "Another request changed this record. Refresh and try again." }, { status: 409 });
  }
  return NextResponse.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
}

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(422, "Invalid request data.");
  return value as Record<string, unknown>;
}

export function textField(value: unknown, field: string, max = 500, optional = false) {
  if (optional && (value === undefined || value === null || value === "")) return "";
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new ApiError(422, `Check ${field}.`, { [field]: `Enter a valid ${field}.` });
  return value.trim();
}
