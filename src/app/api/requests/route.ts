import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth, object, textField } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { createFoodRequest, changeFoodRequest, ownFoodRequest, requestInclude, foodRequestDto, expireFoodRequests, foodRequestMatches } from "@/lib/db/food-requests";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.NGO);
    await expireFoodRequests(user);
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    if (id) return NextResponse.json(params.get("matches") === "true" ? await foodRequestMatches(id, user) : { request: foodRequestDto(await ownFoodRequest(id, user)) });
    const rows = await prisma.foodRequest.findMany({ where: { ngoProfileId: user.ngoProfileId || "__none__" }, include: requestInclude, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ requests: rows.map(foodRequestDto) });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try { const { user } = await requireAuth(UserRole.NGO); const result = await createFoodRequest(object(await request.json()), user); return NextResponse.json(result, { status: result.created ? 201 : 200 }); }
  catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  try { const { user } = await requireAuth(UserRole.NGO); const body = object(await request.json()); return NextResponse.json({ request: await changeFoodRequest(textField(body.id, "request id", 160), body.action, body.input === undefined ? {} : object(body.input), user) }); }
  catch (error) { return apiError(error); }
}
