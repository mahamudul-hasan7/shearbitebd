import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAuth } from "@/lib/api";

export async function POST() {
  try {
    const { user } = await requireAuth();
    await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
