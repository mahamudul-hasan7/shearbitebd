import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoEmail = searchParams.get("ngoEmail") || undefined;
    const donationId = searchParams.get("donationId") || undefined;
    const status = searchParams.get("status") || undefined;

    const claims = db.claims.findMany({ ngoEmail, donationId, status });

    return NextResponse.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch claims";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      donationId,
      donationTitle,
      ngoId,
      ngoName,
      ngoEmail,
      matchScore,
      pickupOtp,
      dropoffOtp,
    } = body;

    if (!donationId || !ngoId) {
      return NextResponse.json(
        { error: "donationId and ngoId are required." },
        { status: 400 }
      );
    }

    const claim = db.claims.create({
      donationId,
      donationTitle: donationTitle || "উদ্বৃত্ত খাবার ব্যাচ",
      ngoId,
      ngoName: ngoName || "নিবন্ধিত চ্যারিটি এনজিও",
      ngoEmail: ngoEmail || undefined,
      matchScore: Number(matchScore) || 98,
      status: "RESERVED",
      pickupOtp: pickupOtp || "7429",
      dropoffOtp: dropoffOtp || "9814",
    });

    return NextResponse.json({
      success: true,
      claim,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create claim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, volunteerId, volunteerName } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Claim id and status are required." },
        { status: 400 }
      );
    }

    const updated = db.claims.updateStatus(id, status, {
      volunteerId,
      volunteerName,
      assignedAt: status === "ASSIGNED" ? new Date().toISOString() : undefined,
      pickedUpAt: status === "PICKED_UP" ? new Date().toISOString() : undefined,
      deliveredAt: status === "DELIVERED" ? new Date().toISOString() : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      claim: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update claim";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
