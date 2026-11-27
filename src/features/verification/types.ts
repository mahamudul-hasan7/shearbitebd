export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_ACCEPT =
  "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png";
export interface VerificationFile {
  id: string;
  name: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  pages: number | null;
  createdAt: string;
  url: string;
}
export interface VerificationReview {
  id: string;
  status: string;
  actorLabel: string;
  note: string;
  createdAt: string;
  document: VerificationFile | null;
}
export interface VerificationState {
  role: "DONOR" | "NGO" | "VOLUNTEER";
  status: "PENDING" | "NOT_SUBMITTED" | "VERIFIED" | "REJECTED";
  document: VerificationFile | null;
  reviews: VerificationReview[];
}
export function documentInputError(file: Pick<File, "type" | "size">) {
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
    return "Choose a PDF, JPG or PNG document.";
  if (file.size < 1) return "This file is empty. Choose another document.";
  if (file.size > MAX_DOCUMENT_BYTES)
    return "Choose a document no larger than 5 MB.";
}
