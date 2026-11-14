export type PhotoPurpose = "DONATION" | "RECEIPT" | "DISTRIBUTION" | "INCIDENT";
export interface UploadedPhoto { id: string; url: string; name: string; width: number; height: number; byteSize: number; }
export const photoService = {
  async unused(purpose: PhotoPurpose, claimId?: string): Promise<UploadedPhoto[]> {
    const params = new URLSearchParams({ purpose });
    if (claimId) params.set("claimId", claimId);
    const response = await fetch(`/api/photos?${params}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Uploaded photos could not load.");
    return body.photos;
  },
  async upload(files: File[], purpose: PhotoPurpose, claimId?: string): Promise<UploadedPhoto[]> {
    const form = new FormData();
    form.set("purpose", purpose);
    if (claimId) form.set("claimId", claimId);
    for (const file of files) form.append("files", file);
    const response = await fetch("/api/photos", { method: "POST", body: form });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Photos could not be uploaded.");
    return body.photos;
  },
  async remove(url: string) {
    if (!/^\/api\/photos\/[a-f0-9-]{36}$/.test(url)) throw new Error("Invalid photo.");
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) { const body = await response.json(); throw new Error(body.error || "Photo could not be removed."); }
  },
};
