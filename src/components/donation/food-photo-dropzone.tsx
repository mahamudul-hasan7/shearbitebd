"use client";

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  FileImage,
  ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodPhotoDropzoneProps {
  photoNames: readonly string[];
  onPhotosChange: (photos: string[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  className?: string;
}

interface DemoPhotoPreset {
  name: string;
  label: string;
  badge: string;
  emoji: string;
  previewUrl: string;
}

const DEMO_PRESETS: readonly DemoPhotoPreset[] = [
  {
    name: "kacchi-biryani-containers.jpg",
    label: "কাচ্চি বিরিয়ানি ও ডিম",
    badge: "হট-প্যাকড",
    emoji: "🍛",
    previewUrl: "/images/surplus-food-containers.jpg",
  },
  {
    name: "bhuna-khichuri-catering.jpg",
    label: "ভুনা খিচুড়ি ডেকচি",
    badge: "ইনসুলেটেড বক্স",
    emoji: "🍲",
    previewUrl: "/images/donor-active-meal.png",
  },
  {
    name: "hotel-bakery-pastry.jpg",
    label: "তাজা বেকারি স্ন্যাক্স",
    badge: "শুকনো খাবার",
    emoji: "🥐",
    previewUrl: "/images/surplus-food-containers.jpg",
  },
  {
    name: "fresh-vegetable-crate.jpg",
    label: "তাজা সবজি ও ফল",
    badge: "রুম টেম্পারেচার",
    emoji: "🥕",
    previewUrl: "/images/donor-active-meal.png",
  },
];

export function FoodPhotoDropzone({
  photoNames,
  onPhotosChange,
  maxFiles = 5,
  maxSizeMb = 5,
  className,
}: FoodPhotoDropzoneProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>();

  function handleFiles(files: File[]) {
    if (photoNames.length + files.length > maxFiles) {
      setError(`সর্বোচ্চ ${maxFiles}টি ছবি আপলোড করা যাবে।`);
      return;
    }

    const oversized = files.find((f) => f.size > maxSizeMb * 1024 * 1024);
    if (oversized) {
      setError(`"${oversized.name}" ফাইলটির আকার ${maxSizeMb} MB-এর বেশি।`);
      return;
    }

    setError(undefined);
    const newNames = files.map((f) => f.name);
    // Combine deduplicated
    const combined = Array.from(new Set([...photoNames, ...newNames]));
    onPhotosChange(combined.slice(0, maxFiles));
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) {
      handleFiles(selected);
    }
    // reset input so same file can be re-selected if removed
    e.target.value = "";
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }

  function handleRemovePhoto(indexToRemove: number) {
    const updated = photoNames.filter((_, idx) => idx !== indexToRemove);
    onPhotosChange(updated);
  }

  function handleAddPreset(preset: DemoPhotoPreset) {
    if (photoNames.length >= maxFiles) {
      setError(`সর্বোচ্চ ${maxFiles}টি ছবি যুক্ত করা যাবে।`);
      return;
    }
    if (!photoNames.includes(preset.name)) {
      setError(undefined);
      onPhotosChange([...photoNames, preset.name]);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header & Counter */}
      <div className="flex items-center justify-between">
        <div>
          <label
            htmlFor={inputId}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            <Camera className="size-4 text-emerald-600 animate-icon-breathe" />
            <span>খাবারের ছবি আপলোড জোন (Dropzone)</span>
          </label>
          <p className="mt-0.5 text-[11px] text-slate-500">
            স্বচ্ছ ও বাস্তব ছবি দিলে এনজিও তাৎক্ষণিক ভেরিফাই করতে পারে।
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold font-mono",
            photoNames.length >= maxFiles
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200",
          )}
        >
          {photoNames.length}/{maxFiles} ছবি
        </span>
      </div>

      {/* Modern Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all",
          isDragging
            ? "border-emerald-500 bg-emerald-50/80 scale-[1.01] shadow-md"
            : "border-slate-300/80 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30",
        )}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200/80 group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-md group-hover:shadow-emerald-500/20 transition-all duration-300">
          <UploadCloud className="size-6 text-emerald-600 animate-icon-float transition-transform group-hover:-translate-y-0.5" />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
            <Camera className="size-4" />
            <span>ডিভাইস থেকে ছবি বেছে নিন</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">অথবা ড্র্যাগ করে ড্রপ করুন</span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          জেপিজি, পিএনজি বা ওয়েবপি ফাইল (প্রতিটি সর্বোচ্চ ৫ মেগাবাইট)
        </p>

        {/* BFSA Quality Assurance Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/70 shadow-2xs">
          <CheckCircle2 className="size-3 text-emerald-600 animate-pulse" />
          <span>BFSA স্ট্যান্ডার্ড: মেয়াদ, কন্টেইনার সিল ও স্টিম পরিষ্কার দৃশ্যমান হতে হবে</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
          {error}
        </p>
      )}

      {/* Demo 1-Click Preset Food Photos (for Presentations / Testing) */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-2xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <Sparkles className="size-3.5 text-amber-500 animate-icon-breathe" />
            <span>ডেমো ও টেস্ট প্রিসেট ছবি (১-ক্লিক সংযোগ)</span>
          </span>
          <span className="text-[10px] text-slate-400">প্রেজেন্টেশনের সুবিধার্থে</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DEMO_PRESETS.map((preset) => {
            const isAdded = photoNames.includes(preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddPreset(preset)}
                disabled={isAdded || photoNames.length >= maxFiles}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left text-xs transition-all duration-200 select-none",
                  isAdded
                    ? "border-emerald-400 bg-emerald-50/80 text-emerald-900 shadow-2xs cursor-default ring-1 ring-emerald-400/30"
                    : "border-slate-300 bg-white text-slate-800 shadow-xs hover:border-emerald-500 hover:bg-emerald-50/60 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer active:translate-y-0 active:scale-95",
                )}
              >
                <span className="text-xl shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                  {preset.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-800 text-[11px]">{preset.label}</p>
                  <p className="text-[9px] text-slate-500">{preset.badge}</p>
                </div>
                {isAdded ? (
                  <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 className="size-3 text-emerald-600" /> যুক্ত
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Plus className="size-3" /> যোগ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Uploaded Thumbnails Grid */}
      {photoNames.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            সংযুক্ত ছবির থাম্বনেইল ({photoNames.length}টি)
          </span>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {photoNames.map((name, index) => {
              // Check if matching preset for preview image
              const matchedPreset = DEMO_PRESETS.find((p) => p.name === name);
              const previewSrc = matchedPreset?.previewUrl ?? "/images/surplus-food-containers.jpg";

              return (
                <div
                  key={`${name}-${index}`}
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-xs"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                    <Image
                      src={previewSrc}
                      alt={name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 text-xs">
                      {matchedPreset?.label ?? name}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">✓ ভেরিফাইড থাম্বনেইল</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    title="ছবি মুছে ফেলুন"
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
