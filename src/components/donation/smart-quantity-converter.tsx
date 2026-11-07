"use client";

import { useMemo } from "react";
import { Heart, Sparkles, Users, UtensilsCrossed } from "lucide-react";
import { QuantityUnit } from "@/lib/constants/domain";
import { cn } from "@/lib/utils";

interface SmartQuantityConverterProps {
  quantity: string;
  quantityUnit: QuantityUnit;
  onSelectPreset?: (qty: string, unit: QuantityUnit) => void;
  className?: string;
}

interface QuantityPreset {
  label: string;
  qty: string;
  unit: QuantityUnit;
  description: string;
}

const PRESETS: readonly QuantityPreset[] = [
  { label: "২৫ মিল", qty: "25", unit: QuantityUnit.MEALS, description: "টিম লাঞ্চ" },
  { label: "৫০ মিল", qty: "50", unit: QuantityUnit.MEALS, description: "ছোট অনুষ্ঠান" },
  { label: "১০০ মিল", qty: "100", unit: QuantityUnit.MEALS, description: "বড় অনুষ্ঠান" },
  { label: "২০০ মিল", qty: "200", unit: QuantityUnit.MEALS, description: "কমিউনিটি ইভেন্ট" },
  { label: "২০ কেজি", qty: "20", unit: QuantityUnit.KILOGRAMS, description: "রেস্তোরাঁ কিচেন" },
  { label: "৪০ কেজি", qty: "40", unit: QuantityUnit.KILOGRAMS, description: "বিয়ে / ক্যাটারিং" },
  { label: "৮০ কেজি", qty: "80", unit: QuantityUnit.KILOGRAMS, description: "কনভেনশন সেন্টার" },
];

export function SmartQuantityConverter({
  quantity,
  quantityUnit,
  onSelectPreset,
  className,
}: SmartQuantityConverterProps) {
  const numQty = Number.parseFloat(quantity);

  const conversion = useMemo(() => {
    if (!Number.isFinite(numQty) || numQty <= 0) {
      return null;
    }

    let minPeople = 0;
    let maxPeople = 0;
    let unitLabelBn = "";

    switch (quantityUnit) {
      case QuantityUnit.KILOGRAMS:
        minPeople = Math.round(numQty * 2);
        maxPeople = Math.round(numQty * 2.5);
        unitLabelBn = "কেজি";
        break;
      case QuantityUnit.TRAYS:
        minPeople = Math.round(numQty * 12);
        maxPeople = Math.round(numQty * 15);
        unitLabelBn = "ট্রে / ডেকচি";
        break;
      case QuantityUnit.LITRES:
        minPeople = Math.round(numQty * 3);
        maxPeople = Math.round(numQty * 4);
        unitLabelBn = "লিটার";
        break;
      case QuantityUnit.PACKETS:
        minPeople = Math.round(numQty);
        maxPeople = Math.round(numQty);
        unitLabelBn = "প্যাকেট";
        break;
      case QuantityUnit.PORTIONS:
        minPeople = Math.round(numQty);
        maxPeople = Math.round(numQty);
        unitLabelBn = "প্লেট";
        break;
      case QuantityUnit.MEALS:
      default:
        minPeople = Math.round(numQty);
        maxPeople = Math.round(numQty);
        unitLabelBn = "মিল";
        break;
    }

    const rangeText =
      minPeople === maxPeople
        ? `${minPeople} জন`
        : `${minPeople}-${maxPeople} জন`;

    // Impact statement
    let impactText = "অসহায় ও সুবিধাবঞ্চিত মানুষদের একবেলার আহার নিশ্চিত করবে।";
    if (minPeople >= 100) {
      impactText = "একটি সম্পূর্ণ বস্তি বা আশ্রয়কেন্দ্রের অনাহারী শিশুদের মুখে হাসি ফোটাবে!";
    } else if (minPeople >= 40) {
      impactText = "একাধিক অসহায় পরিবারের একবেলার পুষ্টিকর খাবার সরবরাহ করবে!";
    }

    return {
      rangeText,
      unitLabelBn,
      impactText,
      peopleCount: minPeople,
    };
  }, [numQty, quantityUnit]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Live Meal Conversion Banner */}
      {conversion ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white p-3.5 shadow-2xs transition-all">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 animate-icon-float">
            <Users className="size-5 transition-transform duration-300 hover:scale-110" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-black text-slate-800">
              <span className="text-emerald-700">স্মার্ট মিল রূপান্তর:</span>
              <span className="rounded-md bg-white px-2 py-0.5 text-slate-900 border border-emerald-200 font-mono">
                {quantity} {conversion.unitLabelBn}
              </span>
              <span>≈</span>
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-white shadow-2xs font-bold">
                {conversion.rangeText} অনাহারী মানুষের খাবার
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <Heart className="size-3.5 text-rose-500 fill-rose-500 shrink-0 animate-heart-beat" />
              <span>{conversion.impactText}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 border border-slate-200/60">
          <Sparkles className="size-3.5 text-emerald-600 animate-icon-breathe" />
          <span>খাবারের পরিমাণ লিখুন, স্বয়ংক্রিয়ভাবে মোট আহার ও ইমপ্যাক্ট হিসাব করা হবে।</span>
        </div>
      )}

      {/* Quick Preset Pills */}
      {onSelectPreset && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              কুইক সিলেক্ট প্রিসেট (Quick Quantity)
            </span>
            <span className="text-[10px] text-slate-400">ক্লিক করে পূরণ করুন</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => {
              const isSelected =
                quantity === preset.qty && quantityUnit === preset.unit;
              return (
                <button
                  key={`${preset.qty}-${preset.unit}`}
                  type="button"
                  onClick={() => onSelectPreset(preset.qty, preset.unit)}
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95",
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800",
                  )}
                >
                  <UtensilsCrossed
                    className={cn(
                      "size-3 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12",
                      isSelected ? "text-white" : "text-slate-400 group-hover:text-emerald-600",
                    )}
                  />
                  <span>{preset.label}</span>
                  <span
                    className={cn(
                      "text-[10px] font-normal",
                      isSelected ? "text-emerald-100" : "text-slate-400",
                    )}
                  >
                    ({preset.description})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
