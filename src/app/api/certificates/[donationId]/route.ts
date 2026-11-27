import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ApiError, apiError, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants/roles";

export async function GET(
  _request: Request,
  context: { params: Promise<{ donationId: string }> },
) {
  try {
    const { user } = await requireAuth();
    const { donationId } = await context.params;
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        donor: { include: { user: true } },
        claims: {
          where: { status: "DISTRIBUTED" },
          orderBy: { updatedAt: "desc" },
          take: 1,
          include: {
            ngo: { include: { user: true } },
            volunteer: { include: { user: true } },
            distributionRecord: true,
            impactRecord: true,
          },
        },
      },
    });

    if (!donation) throw new ApiError(404, "Donation not found.");
    const claim = donation.claims[0];
    if (!claim || donation.status !== "DISTRIBUTED") {
      throw new ApiError(
        409,
        "Certificate is available after beneficiary distribution is completed.",
      );
    }

    const isDonor =
      user.role === UserRole.DONOR &&
      donation.donor.userId === user.id;
    const isNgo =
      user.role === UserRole.NGO && claim.ngo.userId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isDonor && !isNgo && !isAdmin) {
      throw new ApiError(403, "You cannot download this rescue certificate.");
    }

    const meals =
      claim.distributionRecord?.mealsDistributed ?? donation.estimatedMeals;
    const beneficiaries =
      claim.distributionRecord?.beneficiariesServed ?? meals;
    const co2Kg =
      claim.impactRecord?.estimatedCo2PreventedKg ?? Number((meals * 1.25).toFixed(1));
    const waterL =
      claim.impactRecord?.estimatedWaterSavedLitres ?? Math.round(meals * 125);
    const digest = createHash("sha256")
      .update(`${donation.id}:${claim.id}:${meals}:${claim.distributedAt?.toISOString() ?? ""}`)
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]); // A4 Landscape
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);

    const deepGreen = rgb(0.012, 0.153, 0.114);
    const emerald = rgb(0.02, 0.588, 0.412);
    const amber = rgb(0.851, 0.467, 0.024);
    const slate = rgb(0.2, 0.255, 0.333);
    const muted = rgb(0.4, 0.46, 0.53);

    page.drawRectangle({
      x: 24,
      y: 24,
      width: 794,
      height: 547,
      borderColor: emerald,
      borderWidth: 3,
      color: rgb(0.985, 0.995, 0.99),
    });
    page.drawRectangle({
      x: 34,
      y: 34,
      width: 774,
      height: 527,
      borderColor: rgb(0.8, 0.91, 0.87),
      borderWidth: 1,
    });

    page.drawRectangle({ x: 34, y: 472, width: 774, height: 89, color: deepGreen });
    page.drawText("SHAREBITE BD", { x: 64, y: 522, size: 15, font: bold, color: rgb(0.43, 0.91, 0.72) });
    page.drawText("VERIFIED FOOD RESCUE & CSR IMPACT CERTIFICATE", {
      x: 64,
      y: 492,
      size: 20,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Presented in recognition of verified surplus food recovery and community distribution:", {
      x: 64,
      y: 432,
      size: 12,
      font: regular,
      color: muted,
    });

    const donorName = donation.donor.organizationName || donation.donor.user.displayName;
    const ngoName = claim.ngo.organizationName || claim.ngo.user.displayName;
    const riderName = claim.volunteer?.user.displayName || "Verified Volunteer Squad";

    page.drawText(donorName, { x: 64, y: 396, size: 24, font: bold, color: deepGreen });
    page.drawText(`Batch Title: ${donation.title}`, { x: 64, y: 364, size: 13, font: bold, color: slate });
    page.drawText(`Receiving Charity: ${ngoName}   |   Delivered By: ${riderName}`, {
      x: 64,
      y: 340,
      size: 11.5,
      font: regular,
      color: slate,
    });

    const boxY = 216;
    const boxes = [
      { title: "MEALS DISTRIBUTED", value: `${meals} Meals`, accent: emerald },
      { title: "PEOPLE SERVED", value: `${beneficiaries} Beneficiaries`, accent: deepGreen },
      { title: "EST. CO2e PREVENTED", value: `${co2Kg.toFixed(1)} kg`, accent: emerald },
      { title: "EST. WATER SAVED", value: `${waterL.toLocaleString("en-US")} L`, accent: amber },
    ];
    boxes.forEach((box, idx) => {
      const bx = 64 + idx * 182;
      page.drawRectangle({
        x: bx,
        y: boxY,
        width: 168,
        height: 92,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.84, 0.9, 0.88),
        borderWidth: 1.5,
      });
      page.drawText(box.title, { x: bx + 14, y: boxY + 64, size: 8.5, font: bold, color: muted });
      page.drawText(box.value, { x: bx + 14, y: boxY + 32, size: 16, font: bold, color: box.accent });
    });

    page.drawText(`Batch ID: ${donation.id}`, { x: 64, y: 150, size: 10.5, font: regular, color: slate });
    page.drawText(`Distributed At: ${(claim.distributedAt ?? claim.updatedAt).toISOString()}`, {
      x: 64,
      y: 130,
      size: 10.5,
      font: regular,
      color: slate,
    });
    page.drawText(`Cryptographic Audit Digest (SHA-256): ${digest}`, {
      x: 64,
      y: 110,
      size: 10.5,
      font: bold,
      color: deepGreen,
    });
    page.drawText("Methodology: Dual HMAC-OTP Handover + NGO Receipt Reconciliation + EPA/FAO Proxy Factors", {
      x: 64,
      y: 66,
      size: 9.5,
      font: regular,
      color: muted,
    });

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sharebite-certificate-${donation.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
