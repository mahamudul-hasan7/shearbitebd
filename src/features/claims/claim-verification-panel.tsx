"use client";

import { CheckCircle2, Clock3, KeyRound, QrCode, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fallbackVerificationCode, isClaimStepComplete } from "@/features/claims/claim-presentation";
import { ClaimStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import type { Claim } from "@/types/domain";

function MockQr({ token, label }: { token: string; label: string }) {
  const cells = Array.from({ length: 169 }, (_, index) => {
    const character = token.charCodeAt(index % token.length);
    const row = Math.floor(index / 13);
    const column = index % 13;
    const finder = (row < 4 && column < 4) || (row < 4 && column > 8) || (row > 8 && column < 4);
    return finder || ((character + index * 7 + row * column) % 5 < 2);
  });
  return (
    <div
      role="img"
      aria-label={`${label} QR code`}
      className="grid aspect-square w-36 grid-cols-[repeat(13,minmax(0,1fr))] gap-px rounded-2xl border-8 border-white bg-white p-1.5 shadow-md ring-1 ring-slate-200"
    >
      {cells.map((active, index) => (
        <span key={index} className={active ? "bg-slate-950" : "bg-white"} />
      ))}
    </div>
  );
}

function VerificationCard({
  kind,
  token,
  complete,
  unavailable,
}: {
  kind: "Pickup" | "Delivery";
  token?: string;
  complete: boolean;
  unavailable: boolean;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const code = fallbackVerificationCode(token);

  const title = isBn
    ? kind === "Pickup"
      ? "পিকআপ যাচাইকরণ ও ওটিপি (হ্যান্ডওভার)"
      : "ডেলিভারি যাচাইকরণ ও ওটিপি (শেল্টার রিসিভ)"
    : `${kind} verification`;

  const description = isBn
    ? kind === "Pickup"
      ? "খাদ্যদাতা থেকে ভলান্টিয়ারের নিকট খাবার হস্তান্তরের ডিজিটাল ওয়ান-টাইম টোকেন।"
      : "ভলান্টিয়ার থেকে এনজিও সেন্টারে খাবার পৌঁছানোর ডিজিটাল ওয়ান-টাইম টোকেন।"
    : `${kind === "Pickup" ? "Donor handover" : "NGO receipt"} uses a separate verification token.`;

  const badgeText = complete
    ? isBn
      ? "যাচাই সম্পন্ন"
      : "Verified"
    : unavailable
      ? isBn
        ? "এখনও ইস্যু হয়নি"
        : "Not issued"
      : isBn
        ? "অপেক্ষমাণ"
        : "Pending";

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
      <CardHeader
        title={title}
        description={description}
        action={<Badge tone={complete ? "success" : unavailable ? "neutral" : "warning"}>{badgeText}</Badge>}
      />
      <CardContent className="grid gap-5">
        {token ? (
          <div className="grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
            <MockQr token={token} label={kind} />
            <div>
              <div className="flex items-center gap-2 text-emerald-800">
                <QrCode className="size-5" />
                <p className="font-black">
                  {isBn
                    ? kind === "Pickup"
                      ? "পিকআপ ডিজিটাল কিউআর"
                      : "ডেলিভারি ডিজিটাল কিউআর"
                    : `Digital ${kind.toLowerCase()} QR`}
                </p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">
                {isBn
                  ? "শুধুমাত্র সঠিক হ্যান্ডওভারের সময় স্ক্যান করুন। এই ওয়ান-টাইম সিকিউর টোকেন খাদ্য নিরাপত্তার সঠিক প্রমাণ নিশ্চিত করে।"
                  : "Show only at the correct handover. This frontend placeholder is one-time and time-limited."}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Clock3 className="size-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">
                  {isBn
                    ? "ডিজিটাল টোকেন · হ্যান্ডওভারের সাথে সাথে স্বয়ংক্রিয়ভাবে নিষ্ক্রিয় হবে"
                    : "One-time token · expires after completion"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
            <ShieldCheck className="mx-auto size-8 text-slate-400" />
            <p className="mt-2 text-sm font-bold text-slate-600">
              {complete
                ? isBn
                  ? "হ্যান্ডওভার সম্পন্ন হওয়ায় পূর্ববর্তী টোকেনটি লক করা হয়েছে।"
                  : "The earlier verification token is no longer displayed."
                : isBn
                  ? "ভলান্টিয়ার বরাদ্দ নিশ্চিত হওয়ার পর ডিজিটাল টোকেনটি এখানে দৃশ্যমান হবে।"
                  : "Token appears after volunteer assignment."}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-emerald-700" />
            <p className="text-sm font-black text-slate-900">
              {isBn ? "৬ ডিজিটের ব্যাকআপ ওটিপি (OTP)" : "6-digit fallback code"}
            </p>
          </div>
          <div
            aria-label={`${kind} fallback code ${code}`}
            className="mt-3 grid grid-cols-6 gap-2"
          >
            {code.split("").map((digit, index) => (
              <span
                key={`${digit}-${index}`}
                className={cn(
                  "grid h-12 place-items-center rounded-xl border font-mono text-xl font-black shadow-xs",
                  token
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-950"
                    : "border-slate-200 bg-slate-50 text-slate-400",
                )}
              >
                {digit}
              </span>
            ))}
          </div>
        </div>

        {complete && (
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="size-5" />
            {isBn ? "ডিজিটাল হ্যান্ডওভার ও যাচাই সফলভাবে সম্পন্ন" : "Verification completed"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ClaimVerificationPanel({ claim }: { claim: Claim }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <VerificationCard
        kind="Pickup"
        token={claim.pickupVerificationToken}
        complete={isClaimStepComplete(claim.status, ClaimStatus.PICKED_UP)}
        unavailable={claim.status === ClaimStatus.RESERVED}
      />
      <VerificationCard
        kind="Delivery"
        token={claim.deliveryVerificationToken}
        complete={isClaimStepComplete(claim.status, ClaimStatus.DELIVERED)}
        unavailable={[ClaimStatus.RESERVED].includes(claim.status)}
      />
    </div>
  );
}
