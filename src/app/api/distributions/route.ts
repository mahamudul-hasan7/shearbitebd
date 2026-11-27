import { NextResponse } from "next/server";
import { apiError, object, requireAuth, textField } from "@/lib/api";
import { getDistribution, saveDistribution } from "@/lib/db/fulfillment";
import { emitRescueEvent } from "@/lib/realtime/rescue-events";

export async function GET(request: Request) {
  try { const { user } = await requireAuth(); return NextResponse.json({ distribution: await getDistribution(textField(new URL(request.url).searchParams.get("claimId"), "claimId", 160), user), serverTime: new Date().toISOString() }); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(); const body = object(await request.json());
    const distribution = await saveDistribution(textField(body.claimId, "claimId", 160), object(body.input), user);
    emitRescueEvent("distribution.completed", "Beneficiary distribution recorded & CSR certificate ready");
    return NextResponse.json({ distribution }, { status: 201 });
  } catch (error) { return apiError(error); }
}
