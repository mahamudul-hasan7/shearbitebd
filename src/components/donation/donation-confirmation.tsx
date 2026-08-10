import { ArrowRight, CheckCircle2, Plus, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DonationWizardResult } from "@/features/donations/types";
import { ROUTES } from "@/lib/routes";

export function DonationConfirmation({ result, addAnother }: { result: DonationWizardResult; addAnother: () => void }) {
  const donation = result.donation;

  return (
    <div className="mx-auto max-w-4xl text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-success text-white shadow-float"><CheckCircle2 className="size-10" /></span>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-accent-600">Mock donation submitted</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-brand-900 sm:text-5xl">Your rescue listing is ready.</h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-600 sm:text-base">The donation was created in the in-memory Phase 3 service and will appear in My Donations during this browser session. No backend upload occurred.</p>

      <Card className="mx-auto mt-7 max-w-2xl p-5 text-left sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-muted-400">Donation ID</p><p className="mt-1 break-all font-mono text-sm font-black text-brand-800">{donation.id}</p></div><StatusBadge status={donation.status} /></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs text-muted-600">Food</p><p className="mt-1 font-black text-ink-900">{donation.title}</p></div>
          <div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs text-muted-600">Estimated meals</p><p className="mt-1 font-black text-ink-900">{donation.quantity.estimatedMeals}</p></div>
          <div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs text-muted-600">Public area</p><p className="mt-1 font-black text-ink-900">{donation.pickup.approximateArea}</p></div>
        </div>
        <div className="mt-5 rounded-2xl border border-info/20 bg-info-soft p-4"><p className="font-black text-info-strong">What happens next?</p><ol className="mt-2 grid gap-2 text-sm leading-6 text-muted-600"><li>1. Verified NGOs can discover the approximate listing.</li><li>2. Exact pickup/contact details remain private until an authorized claim.</li><li>3. Future phases will add matching, QR handover, tracking, and completed impact.</li></ol></div>
      </Card>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href={ROUTES.donor.donation(donation.id)} rightIcon={<ArrowRight className="size-4" />}>View donation</ButtonLink>
        <ButtonLink href={ROUTES.donor.donations} variant="outline">My Donations</ButtonLink>
        <Button type="button" variant="outline" leftIcon={<Plus className="size-4" />} onClick={addAnother}>Add another food</Button>
        <Button type="button" variant="ghost" leftIcon={<Share2 className="size-4" />} disabled title="Impact sharing becomes available after a completed distribution.">Share impact after rescue</Button>
      </div>
      <Badge tone="neutral" className="mt-5">Submitted {new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(Date.parse(result.submittedAt))}</Badge>
    </div>
  );
}
