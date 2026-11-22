"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  MapPin,
  Printer,
  Search,
  Star,
  Truck,
  Utensils,
  X,
} from "lucide-react";
import { CollectionToolbar } from "@/components/portal/collection-toolbar";
import { DashboardMetrics, DashboardMetric } from "@/components/dashboard/dashboard-ui";
import ui from "@/components/dashboard/dashboard.module.css";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { useMockAuth } from "@/features/auth/mock-auth";
import type { CompletedMissionRecord } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";

export function VolunteerHistoryView() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const { completedHistory, profile, syncWithUserSession } = useVolunteerStore();
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedReceipt, setSelectedReceipt] = useState<CompletedMissionRecord | null>(null);

  useEffect(() => {
    if (session?.email) {
      void syncWithUserSession(session.email, session.displayName).catch((error: Error) => setLoadError(error.message));
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

  function handlePrintSummary() {
    window.print();
  }

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.history}
      title={tx("সম্পন্ন খাদ্য উদ্ধার মিশন হিস্ট্রি ও অডিট লগ")}
      description={tx("Database-এ সংরক্ষিত verified delivery, সময় এবং NGO receipt-এর অবস্থা।")}
      profileName={profile.fullName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={profile.avatarInitials}
      backHref={ROUTES.volunteer.dashboard}
      backLabel={tx("কমান্ড হাবে ফিরুন")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            leftIcon={<Printer className="size-4" />}
            onClick={handlePrintSummary}
            className="font-bold shadow-md shadow-emerald-700/20"
          ><UiText source={"অডিট রিপোর্ট প্রিন্ট করুন"} /></Button>
        </div>
      }
    >
      <div className={ui.stack}>
        {loadError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{loadError}</p>}
        {/* Impact from verified delivery and distribution records */}
        <DashboardMetrics columns={2}>
          <DashboardMetric label="Verified deliveries" value={completedHistory.filter(item=>item.status==="delivered_verified").length.toLocaleString(getUiLocale())} icon={Truck}/>
          <DashboardMetric label="Meals distributed" value={completedHistory.filter(item=>item.status==="delivered_verified").reduce((n,item)=>n+item.servings,0).toLocaleString(getUiLocale())} icon={Utensils}/>
        </DashboardMetrics>

        {/* Filter and Search Bar */}
        <CollectionToolbar label={tx("Mission history filters")}><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-400" />
            <input
              type="text"
              placeholder={tx("খাবারের নাম, রেস্তোরাঁ, এলাকা বা এনজিও নাম দিয়ে খুঁজুন...")}
              aria-label={tx("Search mission history")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-xs font-medium text-ink-900 placeholder:text-muted-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <select
              aria-label={tx("Pickup area")}
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="h-11 min-w-0 max-w-full rounded-xl border border-line bg-white px-3 text-xs font-bold text-ink-900 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="all">{tx("সকল এলাকা (Dhaka Metro)")}</option>
              <option value="বাড্ডা">{tx("বাড্ডা / নতুন বাজার")}</option>
              <option value="গুলশান">{tx("গুলশান / বনানী")}</option>
              <option value="ধানমন্ডি">{tx("ধানমন্ডি ৩২")}</option>
              <option value="মিরপুর">{tx("মিরপুর ১২ ও ১০")}</option>
              <option value="ক্যান্টনমেন্ট">{tx("ঢাকা ক্যান্টনমেন্ট")}</option>
              <option value="লালবাগ">{tx("পুরান ঢাকা / লালবাগ")}</option>
            </select>

            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 border border-emerald-200 shrink-0">
              {tx("রেকর্ড:")}{filteredMissions.length}{tx("টি")}</span>
          </div>
        </div></CollectionToolbar>

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
                        {item.status === "disputed" ? tx("Incident / review history available") : tx("Delivery OTP verified")}
                      </span>
                      <span className="text-xs text-muted-500 font-medium">
                        🗓️ {item.date} · {item.time}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-ink-900">{item.foodTitle}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-950 bg-canvas px-2.5 py-1 rounded-lg border border-line">
                          🍱 {item.quantity} (~{item.servings} {tx("জনের খাবার)")}</span>
                        <span className="font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {tx("তাপমাত্রা মাপা হয়নি")}</span>
                        <span className="font-medium text-muted-600 bg-canvas px-2.5 py-1 rounded-lg border border-line">
                          {tx("⏱️ সময়:")}{item.deliverySpeedNote}
                        </span>
                      </div>
                    </div>

                    {/* Route Corridor */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 rounded-xl bg-canvas/60 p-3 text-xs border border-line">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-ink-900">{tx("উৎস (ডোনার):")}</strong>
                          <p className="text-muted-600">{item.donorName} ({item.donorArea})</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Building2 className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-ink-900">{tx("গন্তব্য (এনজিও):")}</strong>
                          <p className="text-muted-600">{item.ngoName} ({item.ngoArea})</p>
                        </div>
                      </div>
                    </div>

                    {/* NGO Feedback quote */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 text-xs text-emerald-950">
                      <p className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Star className="size-3 text-amber-500 fill-amber-500" />
                        <span>{tx("NGO receipt status:")}</span>
                      </p>
                      <p className="mt-0.5 text-emerald-800 italic"><UiText source={"&ldquo;"} />{item.ngoFeedback}<UiText source={"&rdquo;"} /></p>
                    </div>
                  </div>

                  {/* Right: Actions & Digital Receipt Button */}
                  <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-line">
                    <div className="text-right hidden lg:block">
                      <p className="text-[10px] font-bold uppercase text-muted-500">{tx("Verification record ID")}</p>
                      <p className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.verificationToken}
                      </p>
                    </div>

                    <ButtonLink href={ROUTES.volunteer.reportIssue(`mission-${item.id}`)} variant="outline" size="sm">{tx("Report / review history")}</ButtonLink>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText className="size-4 text-emerald-600" />}
                      onClick={() => setSelectedReceipt(item)}
                      className="font-bold border-line hover:bg-emerald-50/60"
                    >
                      {tx("হস্তান্তর রসিদ দেখুন 🧾")}</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-line">
            <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
            <h3 className="mt-4 text-xl font-black text-ink-900">{tx("কোনো হিস্ট্রি রেকর্ড নেই")}</h3>
            <p className="mt-1 text-xs text-muted-600 max-w-sm mx-auto">
              {tx("আপনি এখনো কোনো খাদ্য উদ্ধার মিশন সম্পন্ন করেননি। উন্মুক্ত ডিসপ্যাচ তালিকা হতে আপনার প্রথম মিশন সম্পন্ন করুন।")}</p>
            <div className="mt-5 flex justify-center">
              <ButtonLink href={ROUTES.volunteer.dispatches} variant="primary" className="font-bold shadow-md shadow-emerald-700/20">
                {tx("উন্মুক্ত ডিসপ্যাচ ফিড দেখুন ➔")}</ButtonLink>
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
                    <h3 className="text-sm font-black text-white">{tx("ডিজিটাল খাদ্য উদ্ধার ও হস্তান্তর রসিদ")}</h3>
                    <p className="text-[11px] text-emerald-300">{tx("শেয়ারবাইট বিডি অফিসিয়াল অডিট ট্রেইল")}</p>
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
                    {selectedReceipt.status === "disputed" ? tx("Incident recorded") : tx("Delivery OTP verified ✓")}
                  </span>
                </div>

                <div className="space-y-2 bg-canvas p-3.5 rounded-2xl border border-line">
                  <div className="flex justify-between">
                    <span className="text-muted-600">{tx("খাবারের বিবরণ:")}</span>
                    <strong className="text-ink-900">{selectedReceipt.foodTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">{tx("মোট পরিমাণ ও মিল:")}</span>
                    <strong className="text-ink-900">{selectedReceipt.quantity} ({selectedReceipt.servings} {" "}{tx("জন)")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">{tx("দাতা প্রতিষ্ঠান:")}</span>
                    <strong className="text-ink-900">{selectedReceipt.donorName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">{tx("গ্রহীতা এনজিও:")}</span>
                    <strong className="text-ink-900">{selectedReceipt.ngoName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">{tx("হস্তান্তর তাপমাত্রা:")}</span>
                    <strong className="text-amber-800">{tx("Not measured")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-600">{tx("রাইডার পরিচয়:")}</span>
                    <strong className="text-ink-900">{profile.fullName} ({profile.id})</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] leading-relaxed text-emerald-950">
                  <p className="font-bold">{tx("ডিজিটাল সত্যতা স্বীকৃতি:")}</p>
                  <p className="mt-0.5 text-emerald-900">
                    {tx("Assigned volunteer-এর সফল delivery OTP verification অনুযায়ী এই mission log সংরক্ষিত হয়েছে। NGO receipt আলাদাভাবে সংরক্ষিত হয়।")}</p>
                  <p className="font-mono text-[10px] text-emerald-700 mt-1">
                    {tx("Verification record ID:")}{selectedReceipt.verificationToken}
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
                  {tx("রসিদ প্রিন্ট করুন")}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedReceipt(null)}
                  className="border-line font-bold"
                >
                  {tx("বন্ধ করুন")}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
