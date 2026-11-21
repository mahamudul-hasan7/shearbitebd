import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import { randomUUID, createHash } from "node:crypto";
export async function sampleVerificationPdf(
  label = "DEMO / SAMPLE verification document",
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 420]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("DEMO / SAMPLE", {
    x: 45,
    y: 330,
    size: 30,
    font,
    color: rgb(0.02, 0.4, 0.27),
  });
  page.drawText(label, { x: 45, y: 265, size: 15, font });
  page.drawText("For a university project demonstration only.", {
    x: 45,
    y: 215,
    size: 13,
    font,
  });
  return Buffer.from(await pdf.save());
}
export async function sampleVerificationImage() {
  return sharp(
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="1200" height="750" fill="#edf9f2"/><rect x="55" y="55" width="1090" height="640" rx="24" fill="white" stroke="#12774f" stroke-width="4"/><text x="110" y="190" font-family="sans-serif" font-size="66" fill="#065f46">DEMO / SAMPLE</text><text x="110" y="310" font-family="sans-serif" font-size="40" fill="#334155">Verification document</text><text x="110" y="410" font-family="sans-serif" font-size="30" fill="#64748b">University project demonstration</text></svg>',
    ),
  )
    .png()
    .toBuffer();
}
export async function seedVerificationDocument(prisma, ownerId, role) {
  const data = await sampleVerificationPdf(role + " registration sample");
  const doc = await prisma.verificationDocument.create({
    data: {
      ownerId,
      kind: role === "NGO" ? "NGO_REGISTRATION" : "VOLUNTEER_ID",
      originalName: `DEMO-${role}.pdf`,
      mimeType: "application/pdf",
      byteSize: data.length,
      pages: 1,
      data,
      uploadKey: randomUUID(),
      sourceHash: createHash("sha256").update(data).digest("hex"),
    },
  });
  const model = role === "NGO" ? prisma.nGOProfile : prisma.volunteerProfile;
  await model.update({
    where: { userId: ownerId },
    data: { verificationDocumentId: doc.id, verificationStatus: "PENDING" },
  });
  return doc;
}
