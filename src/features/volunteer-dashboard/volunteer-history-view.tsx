"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Activity,
  ArrowLeft,
  Award,
  Bike,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  FileCheck2,
  FileText,
  Filter,
  MapPin,
  Printer,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Thermometer,
  Truck,
  Utensils,
  X,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { useMockAuth } from "@/features/auth/mock-auth";
import type { CompletedMissionRecord } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function VolunteerHistoryView() {
  const { session } = useMockAuth();
  const { completedHistory, profile, syncWithUserSession } = useVolunteerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedReceipt, setSelectedReceipt] = useState<CompletedMissionRecord | null>(null);

  useEffect(() => {
    if (session?.email) {
      syncWithUserSession(session.email, session.displayName);
    }
  }, [session?.email, session?.displayName, syncWithUserSession]);

  const filteredMissions = completedHistory.filter((item: CompletedMissionRecord) => {
    const matchesSearch =
      item.foodTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ngoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.missionNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea =
      selectedArea === "all" ||
      item.donorArea.toLowerCase().includes(selectedArea.toLowerCase()) ||
      item.ngoArea.toLowerCase().includes(selectedArea.toLowerCase());

    return matchesSearch && matchesArea;
  });

  const totalServings = completedHistory.reduce((sum, item) => sum + item.servings, 0);
  const totalValueSaved = completedHistory.reduce((sum, item) => sum + item.foodValueSavedEstimated, 0);
  const totalKm = completedHistory.reduce((sum, item) => sum + item.distanceKm, 0);
  const avgMins =
    completedHistory.length > 0
      ? (completedHistory.reduce((sum, item) => sum + item.durationMins, 0) / completedHistory.length).toFixed(1)
      : "0";

  function handlePrintSummary() {
    window.print();
  }

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.history}
      title="সম্পন্ন খাদ্য উদ্ধার মিশন হিস্ট্রি ও অডিট লগ"
      description="আপনার পরিচালিত প্রতিটি রেসকিউ মিশনের পুঙ্খানুপুঙ্খ বিবরণ, রুট টাইম, থার্মাল তাপমাত্রা এবং ডিজিটাল রসিদ।"
      profileName={profile.fullName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={profile.avatarInitials}
      backHref={ROUTES.volunteer.dashboard}
      backLabel="কমান্ড হাবে ফিরুন"
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            leftIcon={<Printer className="size-4" />}
            onClick={handlePrintSummary}
            className="font-bold shadow-md shadow-emerald-700/20"
          >
            অডিট রিপোর্ট প্রিন্ট করুন
          </Button>
        </div>
      }
    >
      <div className="space-y-7">
        {/* Top 4 Impact KPI Bento */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#02241b] to-[#011812] p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400">
              <Utensils className="size-4" />
              <p className="text-[11px] font-black uppercase tracking-wider">মোট উদ্ধারকৃত মিল</p>
            </div>
            <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {totalServings.toLocaleString()}টি
            </p>
            <p className="mt-1 text-[11px] text-emerald-300/70 font-medium">
              {completedHistory.length > 0
                ? `${completedHistory.length}টি সফল মিশনে প্রত্যক্ষ সুবিধাপ্রাপ্ত`
                : "এখনো কোনো সম্পন্ন মিশন নেই"}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#02241b] to-[#011812] p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400">
              <Coins className="size-4" />
              <p className="text-[11px] font-black uppercase tracking-wider">বাঁচানো খাবারের মূল্য</p>
            </div>
            <p className="mt-2 text-2xl font-black text-amber-300 sm:text-3xl">
              ৳{totalValueSaved.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-emerald-300/70 font-medium">
              খাদ্য অপচয় রোধকৃত বাজারমূল্য
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#02241b] to-[#011812] p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400">
              <Truck className="size-4" />
              <p className="text-[11px] font-black uppercase tracking-wider">মোট অতিক্রান্ত দূরত্ব</p>
            </div>
            <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {totalKm.toFixed(1)} কিমি
            </p>
            <p className="mt-1 text-[11px] text-emerald-300/70 font-medium">
              ঢাকা মেট্রো সিটি করিডোর জুড়ে
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#02241b] to-[#011812] p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="size-4" />
              <p className="text-[11px] font-black uppercase tracking-wider">গড় রেসকিউ সময়</p>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-300 sm:text-3xl">
              {completedHistory.length > 0 ? `${avgMins} মিনিট` : "নতুন রাইডার"}
            </p>
            <p className="mt-1 text-[11px] text-emerald-300/70 font-medium">
              {completedHistory.length > 0
                ? `সময়নিষ্ঠতা রেটিং: ${profile.onTimeRate}%`
                : "স্ট্যান্ডার্ড অন-টাইম রেটিং: ১০০%"}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-canvas/60 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-400" />
            <input
              type="text"
              placeholder="খাবারের নাম, রেস্তোরাঁ, এলাকা বা এনজিও নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-xs font-medium text-ink-900 placeholder:text-muted-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-bold text-ink-900 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="all">সকল এলাকা (Dhaka Metro)</option>
              <option value="বাড্ডা">বাড্ডা / নতুন বাজার</option>
              <option value="গুলশান">গুলশান / বনানী</option>
              <option value="ধানমন্ডি">ধানমন্ডি ৩২</option>
              <option value="মিরপুর">মিরপুর ১২ ও ১০</option>
              <option value="ক্যান্টনমেন্ট">ঢাকা ক্যান্টনমেন্ট</option>
              <option value="লালবাগ">পুরান ঢাকা / লালবাগ</option>
            </select>

            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 border border-emerald-200 shrink-0">
              রেকর্ড: {filteredMissions.length}টি
            </span>
          </div>
        </div>

        {/* Missions List */}
        {filteredMissions.length > 0 ? (
          <div className="space-y-4">
            {filteredMissions.map((item: CompletedMissionRecord) => (
              <Card
                key={item.id}
                className="overflow-hidden border-line p-5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left: Main details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {item.missionNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        বিতরণ ও ডিজিটাল ভেরিফিকেশন সম্পন্ন
                      </span>
                      <span className="text-xs text-muted-500 font-medium">
                        🗓️ {item.date} · {item.time}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-ink-900">{item.foodTitle}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-950 bg-canvas px-2.5 py-1 rounded-lg border border-line">
                          🍱 {item.quantity} (~{item.servings} জনের খাবার)
                        </span>
                        <span className="font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          🌡️ হস্তান্তর তাপমাত্রা: {item.cargoTempHandover}°C (হট সিল্ড)
                        </span>
                        <span className="font-medium text-muted-600 bg-canvas px-2.5 py-1 rounded-lg border border-line">
                          ⏱️ সময়: {item.deliverySpeedNote}
                        </span>
                      </div>
                    </div>

                    {/* Route Corridor */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 rounded-xl bg-canvas/60 p-3 text-xs border border-line">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-ink-900">উৎস (ডোনার):</strong>
                          <p className="text-muted-600">{item.donorName} ({item.donorArea})</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Building2 className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-ink-900">গন্তব্য (এনজিও):</strong>
                          <p className="text-muted-600">{item.ngoName} ({item.ngoArea})</p>
                        </div>
                      </div>
                    </div>

                    {/* NGO Feedback quote */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 text-xs text-emerald-950">
                      <p className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Star className="size-3 text-amber-500 fill-amber-500" />
                        <span>এনজিও ফিডব্যাক ({item.ngoRating} ★):</span>
                      </p>
                      <p className="mt-0.5 text-emerald-800 italic">&ldquo;{item.ngoFeedback}&rdquo;</p>
                    </div>
                  </div>

                  {/* Right: Actions & Digital Receipt Button */}
                  <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-line">
                    <div className="text-right hidden lg:block">
                      <p className="text-[10px] font-bold uppercase text-muted-500">অনলাইন অডিট হ্যাশ</p>
                      <p className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.verificationToken}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText className="size-4 text-emerald-600" />}
                      onClick={() => setSelectedReceipt(item)}
                      className="font-bold border-line hover:bg-emerald-50/60"
                    >
                      হস্তান্তর রসিদ দেখুন 🧾
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-line">
            <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
            <h3 className="mt-4 text-xl font-black text-ink-900">কোনো হিস্ট্রি রেকর্ড নেই</h3>
            <p className="mt-1 text-xs text-muted-600 max-w-sm mx-auto">
              আপনি এখনো কোনো খাদ্য উদ্ধার মিশন সম্পন্ন করেননি। উন্মুক্ত ডিসপ্যাচ তালিকা হতে আপনার প্রথম মিশন সম্পন্ন করুন।
            </p>
            <div className="mt-5 flex justify-center">
              <ButtonLink href={ROUTES.volunteer.dispatches} variant="primary" className="font-bold shadow-md shadow-emerald-700/20">
                উন্মুক্ত ডিসপ্যাচ ফিড দেখুন ➔
              </ButtonLink>
            </div>
          </Card>
        )}

        {/* Digital Handover Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-line bg-white shadow-2xl overflow-hidden">
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-[#02241b] to-[#011812] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
                    <FileCheck2 className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">ডিজিটাল খাদ্য উদ্ধার ও হস্তান্তর রসিদ</h3>
                    <p className="text-[11px] text-emerald-300">শেয়ারবাইট বিডি অফিসিয়াল অডিট ট্রেইল</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <p className="font-mono text-base font-black text-emerald-900">
                      {selectedReceipt.missionNumber}
                    </p>
                    <p className="text-muted-500">{selectedReceipt.date} · {selectedReceipt.time}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800">
                    ভেরিফায়েড সম্পন্ন ✓
                  </span>
                </div>

                <div className="space-y-2 bg-canvas p-3.5 rounded-2xl border border-line">
                  <div className="flex justify-between">
                    <span className="text-muted-600">খাবারের বিবরণ:</span>
                    <strong className="text-ink-900">{selectedReceipt.foodTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">মোট পরিমাণ ও মিল:</span>
                    <strong className="text-ink-900">{selectedReceipt.quantity} ({selectedReceipt.servings} জন)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">দাতা প্রতিষ্ঠান:</span>
                    <strong className="text-ink-900">{selectedReceipt.donorName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">গ্রহীতা এনজিও:</span>
                    <strong className="text-ink-900">{selectedReceipt.ngoName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">হস্তান্তর তাপমাত্রা:</span>
                    <strong className="text-amber-800">{selectedReceipt.cargoTempHandover}°C (BFSA Standard Pass)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">রাইডার পরিচয়:</span>
                    <strong className="text-ink-900">{profile.fullName} ({profile.id})</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] leading-relaxed text-emerald-950">
                  <p className="font-bold">ডিজিটাল সত্যতা স্বীকৃতি:</p>
                  <p className="mt-0.5 text-emerald-900">
                    এই রসিদটি দাতা এবং এনজিও প্রতিনিধিদের দ্বিমুখী ওটিপি পিন কোড বিনিময়ের মাধ্যমে ডিজিটাল ক্রিপ্টোগ্রাফিক হ্যাশে সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।
                  </p>
                  <p className="font-mono text-[10px] text-emerald-700 mt-1">
                    ভেরিফিকেশন কি: {selectedReceipt.verificationToken}
                  </p>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="border-t border-line bg-canvas p-4 flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="size-4" />}
                  className="flex-1 justify-center font-bold"
                >
                  রসিদ প্রিন্ট করুন
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedReceipt(null)}
                  className="border-line font-bold"
                >
                  বন্ধ করুন
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
