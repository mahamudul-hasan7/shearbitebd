import { NextResponse } from "next/server";
import { apiError, ApiError, requireAuth, textField } from "@/lib/api";
import {
  ownVerification,
  submitVerification,
} from "@/lib/db/verification-documents";
import { MAX_DOCUMENT_BYTES } from "@/features/verification/types";
export const runtime = "nodejs";
export async function GET() {
  try {
    const { user } = await requireAuth();
    return NextResponse.json(await ownVerification(user), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    if (user.role !== "NGO" && user.role !== "VOLUNTEER")
      throw new ApiError(
        403,
        "Only NGO and volunteer accounts can submit verification documents.",
      );
    if (!request.headers.get("content-type")?.includes("multipart/form-data"))
      throw new ApiError(415, "Choose a PDF, JPG or PNG document.");
    const length = Number(request.headers.get("content-length"));
    if (length > MAX_DOCUMENT_BYTES + 256 * 1024)
      throw new ApiError(413, "Choose a document no larger than 5 MB.");
    // Enforce the limit even when Content-Length is absent or forged.
    const reader = request.body?.getReader();
    if (!reader)
      throw new ApiError(
        400,
        "The document upload could not be read. Try again.",
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > MAX_DOCUMENT_BYTES + 256 * 1024) {
          await reader.cancel();
          throw new ApiError(413, "Choose a document no larger than 5 MB.");
        }
        chunks.push(chunk.value);
      }
    } finally {
      reader.releaseLock();
    }
    let form: FormData;
    try {
      form = await new Response(Buffer.concat(chunks), {
        headers: { "Content-Type": request.headers.get("content-type")! },
      }).formData();
    } catch {
      throw new ApiError(
        400,
        "The document upload could not be read. Try again.",
      );
    }
    const files = form.getAll("file");
    if (files.length !== 1 || !(files[0] instanceof File))
      throw new ApiError(422, "Choose one verification document.");
    const result = await submitVerification(
      files[0],
      textField(form.get("submissionKey"), "submission key", 100),
      user,
    );
    return NextResponse.json(result, {
      status: result.repeated ? 200 : 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
