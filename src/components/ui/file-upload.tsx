"use client";

import { FileCheck2, UploadCloud } from "lucide-react";
import { useId, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export function FileUpload({
  label,
  name,
  accept,
  multiple = false,
  maxFiles = 1,
  maxSizeMb = 5,
  hint = "Choose a file from your device.",
  required = false,
  error: externalError,
  fileNames,
  onFilesChange,
  className,
}: {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  hint?: string;
  required?: boolean;
  error?: string;
  fileNames?: readonly string[];
  onFilesChange?: (files: File[]) => void;
  className?: string;
}) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;
  const [files, setFiles] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>();
  const visibleFiles = fileNames ?? files;
  const error = localError ?? externalError;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > maxFiles) {
      event.target.value = "";
      setFiles([]);
      onFilesChange?.([]);
      setLocalError(`Select no more than ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`);
      return;
    }
    const oversized = selected.find((file) => file.size > maxSizeMb * 1024 * 1024);
    if (oversized) {
      event.target.value = "";
      setFiles([]);
      onFilesChange?.([]);
      setLocalError(`${oversized.name} is larger than ${maxSizeMb} MB.`);
      return;
    }
    setLocalError(undefined);
    setFiles(selected.map((file) => file.name));
    onFilesChange?.(selected);
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <span className="text-sm font-bold text-ink-700">{label}</span>
      <label htmlFor={inputId} className="grid min-h-40 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50">
        <input id={inputId} name={name} type="file" accept={accept} multiple={multiple} required={required} onChange={handleChange} aria-describedby={descriptionId} aria-invalid={Boolean(error)} className="sr-only" />
        <span>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm">
            {visibleFiles.length > 0 ? <FileCheck2 className="size-6" /> : <UploadCloud className="size-6" />}
          </span>
          <span className="mt-3 block text-sm font-black text-brand-800">{visibleFiles.length > 0 ? visibleFiles.join(", ") : "Select file"}</span>
          <span id={descriptionId} className={cn("mt-1 block text-xs leading-5", error ? "text-danger" : "text-muted-600")}>{error ?? hint}</span>
        </span>
      </label>
    </div>
  );
}
