import type { VerificationFile, VerificationState } from "./types";
export function uploadVerificationDocument(
  file: File,
  key: string,
  onProgress: (value: number) => void,
) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<{
    document: VerificationFile;
    status: VerificationState["status"];
    repeated: boolean;
  }>((resolve, reject) => {
    xhr.open("POST", "/api/verification");
    xhr.timeout = 60_000;
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(
          Math.min(100, Math.round((event.loaded * 100) / event.total)),
        );
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.document)
        resolve(xhr.response);
      else
        reject(
          new Error(
            xhr.response?.error ||
              "The document could not be uploaded. Try again.",
          ),
        );
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "The document could not be uploaded. Check your connection and try again.",
        ),
      );
    xhr.ontimeout = () =>
      reject(new Error("The upload took too long. Try again."));
    xhr.onabort = () =>
      reject(new Error("Upload cancelled. You can try again."));
    const form = new FormData();
    form.set("file", file);
    form.set("submissionKey", key);
    xhr.send(form);
  });
  return { promise, abort: () => xhr.abort() };
}
