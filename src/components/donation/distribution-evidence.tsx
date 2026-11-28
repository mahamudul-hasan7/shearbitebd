"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { DistributionRecord } from "@/types/domain";

export function DistributionEvidence({ record }: { record?: DistributionRecord }) {
  const tx = useUiText();
  const { language } = useLanguage();
  if (!record) return null;
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const metrics: [string, number][] = [["Meals distributed", record.mealsDistributed], ["People served", record.beneficiariesServed]];
  return <Card data-testid="distribution-evidence">
    <CardHeader title={tx("NGO distribution report")} description={tx("Saved completion details and photos for your donation.")}
      action={<CheckCircle2 className="size-6 text-success-strong" aria-hidden="true" />} />
    <CardContent className="grid gap-4">
      <dl className="grid grid-cols-2 gap-3">
        {metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-line bg-canvas p-3">
          <dt className="text-xs text-muted-600">{tx(label)}</dt>
          <dd className="mt-1 text-xl font-bold text-ink-900">{value.toLocaleString(locale)}</dd>
        </div>)}
      </dl>
      <p className="text-sm text-muted-600">{tx("Distributed at")}{" "}<time dateTime={record.distributedAt}>{new Date(record.distributedAt).toLocaleString(locale, { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })}</time></p>
      {record.notes && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink-800">{record.notes}</p>}
      {record.photoUrls.length
        ? <PhotoGallery urls={record.photoUrls} label={tx("Distribution photos")} />
        : <p className="text-sm text-muted-600">{tx("No distribution photos were attached to this record.")}</p>}
    </CardContent>
  </Card>;
}
