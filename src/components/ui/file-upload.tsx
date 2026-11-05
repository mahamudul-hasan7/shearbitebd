"use client";

import { CheckCircle2, FileCheck2, UploadCloud, X } from "lucide-react";
import { useId, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

export function FileUpload({
  label,
  name,
  accept,
  multiple = false,
  maxFiles = 1,
  maxSizeMb = 5,
  hint = "আপনার ডিভাইস থেকে ফাইল নির্বাচন করুন।",
  buttonText = "ফাইল নির্বাচন করুন অথবা এখানে টেনে এনে ছাড়ুন",
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
  buttonText?: string;
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
      setLocalError(`সর্বোচ্চ ${maxFiles}টি ফাইল আপলোড করতে পারবেন।`);
      return;
    }
    const oversized = selected.find((file) => file.size > maxSizeMb * 1024 * 1024);
    if (oversized) {
      event.target.value = "";
      setFiles([]);
      onFilesChange?.([]);
      setLocalError(`"${oversized.name}" ফাইলের সাইজ ${maxSizeMb} MB-এর বেশি।`);
      return;
    }
    setLocalError(undefined);
    setFiles(selected.map((file) => file.name));
    onFilesChange?.(selected);
  }

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFiles([]);
    onFilesChange?.([]);
    setLocalError(undefined);
  }

  const hasFiles = visibleFiles.length > 0;

  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      <span className="text-sm font-bold text-slate-800 font-heading">{label}</span>
      <label
        htmlFor={inputId}
        className={cn(
          "relative grid min-h-36 min-w-0 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 xs:p-6",
          hasFiles
            ? "border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50/70"
            : error
            ? "border-rose-400 bg-rose-50/30 hover:border-rose-500"
            : "border-slate-300 bg-slate-50/70 hover:border-emerald-500 hover:bg-emerald-50/30"
        )}
      >
        <input
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          required={required}
          onChange={handleChange}
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          className="sr-only"
        />

        <div className="flex flex-col items-center">
          <span
            className={cn(
              "grid size-12 place-items-center rounded-2xl shadow-xs transition-colors",
              hasFiles ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 ring-1 ring-slate-200/80"
            )}
          >
            {hasFiles ? <FileCheck2 className="size-6" /> : <UploadCloud className="size-6" />}
          </span>

          <span
            className={cn(
              "mt-3 block max-w-sm break-all text-sm font-black font-heading",
              hasFiles ? "text-emerald-900" : "text-slate-800"
            )}
          >
            {hasFiles ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 inline" />
                {visibleFiles.join(", ")}
              </span>
            ) : (
              buttonText
            )}
          </span>

          <span
            id={descriptionId}
            className={cn("mt-1.5 block max-w-md text-xs leading-relaxed font-normal", error ? "text-rose-600 font-medium" : "text-slate-500")}
          >
            {error ?? hint}
          </span>

          {hasFiles && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-slate-200/70 hover:bg-rose-100 hover:text-rose-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
            >
              <X className="size-3" /> ফাইল বাতিল করুন
            </button>
          )}
        </div>
      </label>
    </div>
  );
}
