import { NextResponse } from "next/server";
import { VerificationKind } from "@prisma/client";
import { ApiError, apiError, object, requireAuth, textField } from "@/lib/api";
import { handoverState, issueHandover, verifyHandover } from "@/lib/db/handover";
import { enumField } from "@/lib/db/rescue";
import { emitRescueEvent } from "@/lib/realtime/rescue-events";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();
    return NextResponse.json(await handoverState(textField(new URL(request.url).searchParams.get("claimId"), "claimId", 160), user), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    const body = object(await request.json());
    const id = textField(body.claimId, "claimId", 160);
    const kind = enumField(body.kind, Object.values(VerificationKind), "handover kind");
    const result = body.action === "issue" ? await issueHandover(id, kind, user)
      : body.action === "verify" ? await verifyHandover(id, kind, textField(body.code, "code", 6), user) : undefined;
    if (!result) throw new ApiError(422, "Choose issue or verify.");
    if (body.action === "verify") emitRescueEvent("handover.verified", `${kind} handover verified`);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
