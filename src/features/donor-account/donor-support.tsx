"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, CircleHelp, LifeBuoy, MessageSquareText, Send } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DONOR_USER_ID, DONOR_VIEWER } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";
import { accountService, toServiceError, type SupportRequestInput } from "@/services";

const FAQS = [
  { question: "Who can see my exact pickup address?", answer: "Only the account owner sees saved addresses by default. Exact address and private contact details appear to authorized rescue participants only after assignment." },
  { question: "What should I do if pickup is delayed?", answer: "Open the active donation tracking page and report an issue if the safe pickup deadline may be missed. Never hand over food that no longer meets your declaration." },
  { question: "Can I choose an NGO for a donation?", answer: "You can record a preferred verified NGO in the donation flow, but it remains a preference—not a guaranteed assignment." },
  { question: "Does ShareBite BD accept money?", answer: "No. This portal coordinates surplus food rescue and does not offer payments, cash donations, or fundraising." },
];

export function DonorSupport() {
  const [category, setCategory] = useState<SupportRequestInput["category"]>("DONATION");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string>();

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setMessageError(undefined); setReference(undefined);
    try {
      const result = await accountService.submitSupportRequest({ userId: DONOR_USER_ID, category, message }, DONOR_VIEWER);
      setReference(result.reference); setMessage("");
    } catch (error: unknown) { setMessageError(toServiceError(error).fieldErrors?.message ?? toServiceError(error).message); }
    finally { setSubmitting(false); }
  }

  return <PortalShell role="donor" activeHref={ROUTES.donor.profile} title="Help & support" description="Find quick answers or send a mock support request to the ShareBite BD team." profileName="UIU Cafeteria" profileDescription="Verified food donor" avatarInitials="UC" notificationHref={ROUTES.donor.notifications}>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
      <section aria-labelledby="faq-title"><div className="mb-4 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700"><CircleHelp className="size-5" /></span><div><h2 id="faq-title" className="text-xl font-black text-ink-900">Frequently asked questions</h2><p className="text-sm text-muted-600">Food rescue, safety, privacy, and matching.</p></div></div><div className="grid gap-3">{FAQS.map((faq, index) => <details key={faq.question} className="group rounded-card border border-line bg-white p-5 shadow-sm" open={index === 0}><summary className="cursor-pointer list-none pr-6 font-black text-ink-900">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-muted-600">{faq.answer}</p></details>)}</div></section>
      <form onSubmit={submit}><Card><CardHeader title="Contact support" description="This demo validates and submits locally; no external message is sent." /><CardContent className="grid gap-5"><div className="flex items-start gap-3 rounded-2xl bg-info-soft p-4 text-info-strong"><LifeBuoy className="mt-0.5 size-5 shrink-0" /><p className="text-sm leading-6">For an immediate food-safety risk, pause the handover and use the active rescue&apos;s issue report flow.</p></div><Select label="Issue category" value={category} onChange={(event) => setCategory(event.target.value as SupportRequestInput["category"])}><option value="DONATION">Donation listing</option><option value="PICKUP">Pickup or delivery</option><option value="ACCOUNT">Account or privacy</option><option value="TECHNICAL">Technical issue</option><option value="OTHER">Other</option></Select><Textarea label="How can we help?" value={message} error={messageError} hint="Do not include passwords, payment details, or beneficiary-identifying information." placeholder="Describe what happened and what you need help with…" onChange={(event) => setMessage(event.target.value)} />{reference && <Alert tone="success" title="Support request recorded" description={`Mock reference ${reference}. A real integration can connect this form to the support queue later.`} />}<Button type="submit" fullWidth disabled={submitting} leftIcon={reference ? <CheckCircle2 className="size-4" /> : <Send className="size-4" />}>{submitting ? "Sending…" : "Send request"}</Button></CardContent></Card></form>
    </div>
    <Card id="privacy-policy" className="mt-6 p-5"><div className="flex items-start gap-3"><MessageSquareText className="mt-0.5 size-5 text-brand-700" /><div><p className="font-black text-ink-900">Demo policy summary</p><p className="mt-1 text-sm leading-6 text-muted-600">The frontend uses mock data, protects sensitive pickup information by role and rescue state, and provides no payment or fundraising features. Terms and full production policies require legal review before launch.</p></div></div></Card>
  </PortalShell>;
}
