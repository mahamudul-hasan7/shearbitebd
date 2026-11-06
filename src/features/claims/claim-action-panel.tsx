"use client";

import {
  ClipboardCheck,
  PackageCheck,
  ShieldAlert,
  Truck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClaimStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import type { Claim } from "@/types/domain";

export function ClaimActionPanel({
  claim,
  busy,
  onAssignVolunteer,
  onRelease,
  onMarkPickedUp,
}: {
  claim: Claim;
  busy: boolean;
  onAssignVolunteer: () => void;
  onRelease: () => void;
  onMarkPickedUp: () => void;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const canReport = [
    ClaimStatus.RESERVED,
    ClaimStatus.ASSIGNED,
    ClaimStatus.PICKED_UP,
    ClaimStatus.DELIVERED,
  ].includes(claim.status);

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
      <CardHeader
        title={isBn ? "ক্লেইম অ্যাকশন ও লাইফসাইকেল" : "Claim actions"}
        description={
          isBn
            ? "প্রতিটি হ্যান্ডওভার ও পরিবহন ধাপের জন্য ডেডিকেটেড ভ্যালিডেশন এবং ডিজিটাল ট্র্যাক রেকর্ড।"
            : "Each handover opens a dedicated workflow with validation and a traceable record."
        }
      />
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          {claim.status === ClaimStatus.RESERVED && (
            <Button
              disabled={busy}
              leftIcon={<UserRoundCheck className="size-4" />}
              onClick={onAssignVolunteer}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {busy ? (isBn ? "আপডেট হচ্ছে…" : "Updating…") : isBn ? "ভলান্টিয়ার রাইডার বরাদ্দ করুন" : "Assign demo volunteer"}
            </Button>
          )}

          {claim.status === ClaimStatus.ASSIGNED && (
            <Button
              disabled={busy}
              leftIcon={<Truck className="size-4" />}
              onClick={onMarkPickedUp}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {busy ? (isBn ? "আপডেট হচ্ছে…" : "Updating…") : isBn ? "পিকআপ সম্পন্ন ভেরিফাই করুন" : "Verify mock pickup"}
            </Button>
          )}

          {claim.status === ClaimStatus.PICKED_UP && (
            <ButtonLink
              href={ROUTES.ngo.confirmDelivery(claim.id)}
              leftIcon={<PackageCheck className="size-4" />}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isBn ? "ডেলিভারি প্রাপ্তি নিশ্চিত করুন" : "Confirm delivery"}
            </ButtonLink>
          )}

          {claim.status === ClaimStatus.DELIVERED && (
            <ButtonLink
              href={ROUTES.ngo.distribution(claim.id)}
              leftIcon={<ClipboardCheck className="size-4" />}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isBn ? "খাদ্য বিতরণ রিপোর্ট জমা দিন" : "Record distribution"}
            </ButtonLink>
          )}

          {[ClaimStatus.RESERVED, ClaimStatus.ASSIGNED].includes(claim.status) && (
            <Button
              disabled={busy}
              variant="outline"
              leftIcon={<XCircle className="size-4" />}
              onClick={onRelease}
            >
              {isBn ? "ক্লেইম ছেড়ে দিন (রিলিজ)" : "Release claim"}
            </Button>
          )}

          {canReport && (
            <ButtonLink
              href={ROUTES.ngo.reportIssue(claim.id)}
              variant="danger"
              leftIcon={<ShieldAlert className="size-4" />}
            >
              {isBn ? "সমস্যা রিপোর্ট করুন" : "Report an issue"}
            </ButtonLink>
          )}
        </div>

        {claim.status === ClaimStatus.DELIVERED && (
          <Alert
            tone="success"
            title={isBn ? "বিতরণ রিপোর্ট প্রস্তুত করতে প্রস্তুত" : "Ready for distribution recording"}
            description={
              isBn
                ? "খাদ্য শেল্টারে পৌঁছেছে। মোট সুবিধাভোগী সংখ্যা, সম্মতি নিশ্চিতকরণ এবং বিতরণের ছবি যুক্ত করে রেকর্ড সম্পন্ন করুন।"
                : "Add aggregate beneficiary counts, consent confirmation, optional evidence, and the distribution location."
            }
          />
        )}

        {claim.status === ClaimStatus.DISTRIBUTED && (
          <Alert
            tone="success"
            title={isBn ? "উদ্ধার কার্যক্রম সফলভাবে সম্পন্ন হয়েছে" : "Rescue completed"}
            description={
              isBn
                ? "এই ক্লেইমটি সম্পূর্ণভাবে ক্লোজড এবং শেয়ারবাইট বিডি-র জাতীয় খাদ্য নিরাপত্তা ইমপ্যাক্ট মেট্রিক্সে সংরক্ষিত হয়েছে।"
                : "This claim is closed and contributes to the NGO impact history."
            }
          />
        )}

        {claim.status === ClaimStatus.DISPUTED && (
          <Alert
            tone="warning"
            title={isBn ? "অভিযোগ বা অসঙ্গতি পর্যালোচনায় রয়েছে" : "Incident under review"}
            description={
              isBn
                ? "রিপোর্টকৃত সমস্যার কারণে উদ্ধার প্রক্রিয়া সাময়িকভাবে স্থগিত আছে। আমাদের সাপোর্ট টিম পর্যালোচনা করছে।"
                : "Normal rescue progression is paused while the submitted report is reviewed."
            }
          />
        )}

        {[ClaimStatus.CANCELLED, ClaimStatus.EXPIRED].includes(claim.status) && (
          <Alert
            tone="warning"
            title={isBn ? "বর্তমানে কোনো সাধারণ অ্যাকশন উপলব্ধ নেই" : "No normal actions available"}
            description={
              isBn
                ? "এই ক্লেইমটির সময়সীমা শেষ অথবা এটি বাতিল হওয়ায় পরবর্তী ধাপে পরিচালনা সম্ভব নয়।"
                : "This claim cannot continue through the standard rescue lifecycle."
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
