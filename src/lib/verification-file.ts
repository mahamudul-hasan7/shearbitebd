import sharp from "sharp";
import { PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { ApiError } from "@/lib/api";
import {
  documentInputError,
  MAX_DOCUMENT_BYTES,
} from "@/features/verification/types";

export async function prepareVerificationFile(file: File) {
  const issue = documentInputError(file);
  if (issue) throw new ApiError(422, issue);
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = file.name
    .replaceAll("\\", "/")
    .split("/")
    .pop()
    ?.replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 160);
  if (!name)
    throw new ApiError(422, "Choose a document with a valid filename.");
  try {
    if (file.type === "application/pdf") {
      if (!bytes.subarray(0, 8).toString("ascii").startsWith("%PDF-"))
        throw new Error("Invalid PDF header");
      const source = await PDFDocument.load(bytes, {
        ignoreEncryption: false,
        throwOnInvalidObject: true,
        updateMetadata: false,
      });
      if (source.getPageCount() < 1 || source.getPageCount() > 10)
        throw new ApiError(422, "Choose a PDF with 1 to 10 pages.");
      const objects = source.context.enumerateIndirectObjects();
      if (objects.length > 5000)
        throw new ApiError(
          422,
          "This PDF is too complex. Upload a simpler PDF or an image.",
        );
      const blocked = new Set([
        "JavaScript",
        "JS",
        "Launch",
        "EmbeddedFiles",
        "EmbeddedFile",
        "XFA",
        "AcroForm",
        "RichMedia",
        "OpenAction",
        "AA",
      ]);
      for (const [, object] of objects)
        if (object instanceof PDFDict)
          for (const [key, value] of object.entries()) {
            if (
              blocked.has(key.decodeText()) ||
              (value instanceof PDFName && blocked.has(value.decodeText()))
            )
              throw new ApiError(
                422,
                "Use a PDF without scripts, forms or embedded files.",
              );
          }
      // Build a new, static document without source metadata, annotations or links.
      const safe = await PDFDocument.create();
      for (const page of await safe.copyPages(
        source,
        source.getPageIndices(),
      )) {
        page.node.delete(PDFName.of("Annots"));
        page.node.delete(PDFName.of("AA"));
        safe.addPage(page);
      }
      safe.setTitle("Verification document");
      safe.setCreator("ShareBite BD");
      safe.setProducer("ShareBite BD");
      const data = Buffer.from(await safe.save());
      if (data.length > MAX_DOCUMENT_BYTES)
        throw new ApiError(
          422,
          "The processed document is too large. Choose a smaller file.",
        );
      return {
        originalName: name,
        mimeType: "application/pdf",
        data,
        byteSize: data.length,
        pages: source.getPageCount(),
        width: null,
        height: null,
      };
    }
    const image = sharp(bytes, {
      limitInputPixels: 16_000_000,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (metadata.format !== (file.type === "image/jpeg" ? "jpeg" : "png"))
      throw new Error("Mismatched image type");
    const { data, info } = await image
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer({ resolveWithObject: true });
    return {
      originalName: name,
      mimeType: "image/webp",
      data,
      byteSize: data.length,
      pages: null,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      422,
      "This document could not be read. Choose a valid PDF, JPG or PNG.",
    );
  }
}
