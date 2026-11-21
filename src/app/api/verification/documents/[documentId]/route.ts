import { apiError, requireAuth } from "@/lib/api";
import { readVerificationFile } from "@/lib/db/verification-documents";
export const runtime = "nodejs";
type Context = { params: Promise<{ documentId: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { user } = await requireAuth();
    const { documentId } = await context.params;
    const file = await readVerificationFile(documentId, user);
    const extension = file.mimeType === "application/pdf" ? "pdf" : "webp";
    const disposition =
      new URL(request.url).searchParams.get("download") === "1"
        ? "attachment"
        : "inline";
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.data.length),
        "Content-Disposition": `${disposition}; filename="verification-document.${extension}"`,
        "Cache-Control": "private, no-store",
        Vary: "Cookie",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Content-Security-Policy":
          "sandbox; default-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
