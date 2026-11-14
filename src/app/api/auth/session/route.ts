import { NextResponse } from "next/server";
import { currentAuth } from "@/lib/auth/server";

export async function GET() {
  const auth = await currentAuth();
  return NextResponse.json({ session: auth?.session ?? null }, { headers: { "Cache-Control": "no-store" } });
}
