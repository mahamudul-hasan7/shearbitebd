"use client";

import { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Bike,
  CheckCircle2,
  Clock,
  CloudRain,
  PhoneCall,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reason: string, delayMins: number) => void;
}

export function SosModal({ isOpen, onClose, onSubmitReport }: SosModalProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [selectedReason, setSelectedReason] = useState<string>("traffic");
  const [delayMinutes, setDelayMinutes] = useState<number>(15);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const reasons = [
    {
      id: "traffic",
      labelEn: "Severe Traffic Gridlock (Rampura / Mohakhali)",
      labelBn: "তীব্র ট্রাফিক জ্যাম (রামপুরা / মহাখালী ফ্লাইওভার)",
      icon: Clock,
    },
    {
      id: "rain",
      labelEn: "Monsoon Downpour / Waterlogged Route",
      labelBn: "ভারী বৃষ্টিপাত / জলমগ্ন রাস্তা",
      icon: CloudRain,
    },
    {
      id: "vehicle",
      labelEn: "Vehicle Mechanical / Flat Tire",
      labelBn: "বাইক বা যান্ত্রিক ত্রুটি / টায়ার পাংচার",
      icon: Bike,
    },
    {
      id: "seal",
      labelEn: "Packaging Seal or Temperature Anomaly",
      labelBn: "প্যাকেজিং সিল ক্ষতিগ্রস্ত বা তাপমাত্রার হেরফের",
      icon: ShieldAlert,
    },
  ];

  function handleSubmit() {
    setSubmitted(true);
    setTimeout(() => {
      onSubmitReport(selectedReason, delayMinutes);
      setSubmitted(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/70 p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-rose-500 text-white shadow-md">
              <AlertOctagon className="size-5" />
            </span>
            <div>
              <h3 className="font-heading text-base font-black text-rose-950 sm:text-lg">
                {isBn ? "জরুরি ট্রানজিট ডিলে ও এসওএস" : "Emergency Delay & Transit SOS"}
              </h3>
              <p className="text-xs text-rose-800">
                {isBn ? "সেন্ট্রাল ডিসপ্যাচ ও মাস্তুল শেল্টারকে তাৎক্ষণিক অবহিত করুন" : "Instantly update Central HQ & Mastul Shelter"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-rose-800 hover:bg-rose-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </span>
            <h4 className="font-heading text-lg font-black text-ink-900">
              {isBn ? "এসওএস বার্তা প্রেরণ সফল হয়েছে!" : "SOS Broadcast Dispatched!"}
            </h4>
            <p className="text-xs text-muted-600 max-w-sm mx-auto">
              {isBn
                ? "মাস্তুল ফাউন্ডেশন এবং সেন্ট্রাল কন্ট্রোলে নতুন আগমন সময়সীমা আপডেট করা হয়েছে।"
                : "ETA refreshed. Mastul Foundation notified of the transit delay."}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Reason selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                {isBn ? "বিলম্বের মূল কারণ নির্বাচন করুন" : "Select Delay Cause"}
              </label>
              <div className="space-y-2">
                {reasons.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedReason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReason(r.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/50 text-rose-950 shadow-xs ring-1 ring-rose-500"
                          : "border-line bg-canvas hover:bg-slate-50 text-ink-800"
                      }`}
                    >
                      <Icon className={`size-4.5 ${isSelected ? "text-rose-600" : "text-muted-500"}`} />
                      <span className="text-xs font-semibold flex-1">
                        {isBn ? r.labelBn : r.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delay minutes buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                {isBn ? "আনুমানিক বিলম্বের সময়" : "Estimated Delay Duration"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 35].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDelayMinutes(mins)}
                    className={`rounded-xl border py-2 text-center text-xs font-bold transition-all ${
                      delayMinutes === mins
                        ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                        : "border-line bg-canvas hover:bg-slate-50 text-ink-800"
                    }`}
                  >
                    +{mins} {isBn ? "মিনিট" : "mins"}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Central Hotline */}
            <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50 p-3 text-xs">
              <span className="text-muted-600">
                {isBn ? "জরুরি কন্ট্রোল রুম হটলাইন:" : "HQ Emergency Hotline:"}
              </span>
              <a
                href="tel:+880961274273"
                className="flex items-center gap-1.5 font-mono font-bold text-rose-700 hover:underline"
              >
                <PhoneCall className="size-3.5" />
                +880 9612-SHARE
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button variant="danger" onClick={handleSubmit}>
                {isBn ? "জরুরি অ্যালার্ট পাঠান" : "Dispatch SOS Broadcast"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}