import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const donorEmail = searchParams.get("donorEmail") || undefined;
    const status = searchParams.get("status") || undefined;

    const donations = db.donations.findMany({ donorEmail, status });

    return NextResponse.json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch donations";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      quantity,
      quantityUnit,
      estimatedMeals,
      donorName,
      donorEmail,
      donorId,
      preparationTime,
      safePickupDeadline,
      pickupWindowStart,
      pickupWindowEnd,
      approximateArea,
      addressLine,
      contactPerson,
      contactPhone,
      specialInstructions,
    } = body;

    if (!title || !quantity) {
      return NextResponse.json(
        { error: "খাবারের শিরোনাম এবং পরিমাণ অবশ্যই দিতে হবে।" },
        { status: 400 }
      );
    }

    const donation = db.donations.create({
      title: title.trim(),
      description: (description || "").trim(),
      category: category || "COOKED_MEAL",
      quantity: Number(quantity) || 1,
      quantityUnit: quantityUnit || "PACKETS",
      estimatedMeals: Number(estimatedMeals) || Number(quantity) || 1,
      status: "AVAILABLE",
      donorName: donorName || "নিবন্ধিত খাদ্য দাতা",
      donorEmail: donorEmail || undefined,
      donorId: donorId || undefined,
      preparationTime: preparationTime || new Date().toISOString(),
      safePickupDeadline: safePickupDeadline || new Date(Date.now() + 4 * 3600_000).toISOString(),
      pickupWindowStart: pickupWindowStart || new Date().toISOString(),
      pickupWindowEnd: pickupWindowEnd || new Date(Date.now() + 3 * 3600_000).toISOString(),
      approximateArea: approximateArea || undefined,
      addressLine: addressLine || undefined,
      contactPerson: contactPerson || undefined,
      contactPhone: contactPhone || undefined,
      specialInstructions: specialInstructions || undefined,
    });

    return NextResponse.json({
      success: true,
      donation,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create donation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
