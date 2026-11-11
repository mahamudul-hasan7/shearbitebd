import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const userId = searchParams.get("userId") || undefined;

    db.notifications.markAllRead({ role, userId });

    return NextResponse.json({
      success: true,
      message: "সবগুলো নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark notifications read";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
