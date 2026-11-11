import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || undefined;
  const userId = searchParams.get("userId") || undefined;

  const notifications = db.notifications.findMany({ role, userId });
  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({
    success: true,
    count: notifications.length,
    unreadCount,
    notifications,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, href, type, role, userId } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required." },
        { status: 400 }
      );
    }

    const notif = db.notifications.create({
      title,
      message,
      href: href || "#",
      type: type || "SYSTEM",
      role: role || "ALL",
      userId,
    });

    return NextResponse.json({
      success: true,
      notification: notif,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create notification";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }

    db.notifications.markRead(id);

    return NextResponse.json({
      success: true,
      message: "নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark read";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
