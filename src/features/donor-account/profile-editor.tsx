"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, RefreshCw, Save, ShieldCheck, ArrowLeft } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";
import { asyncState, profileService, toServiceError, type AsyncState, type ProfileBundle } from "@/services";
import type { DonorProfile } from "@/types/domain";

interface FormData {
  displayName: string;
  organizationName: string;
  email: string;
  phone: string;
  donorType: DonorProfile["donorType"];
}

const EMPTY_FORM: FormData = {
  displayName: "",
  organizationName: "",
  email: "",
  phone: "",
  donorType: "CAFETERIA",
};

export function ProfileEditor() {
  const tx = useUiText();
  const [state, setState] = useState<AsyncState<ProfileBundle>>(() => asyncState.loading());
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    profileService
      .getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, { signal: controller.signal })
      .then((profile) => {
        setState(asyncState.success(profile));
        setForm({
          displayName: profile.user.displayName,
          organizationName: profile.donorProfile?.organizationName ?? "",
          email: profile.user.email,
          phone: profile.user.phone ?? "",
          donorType: profile.donorProfile?.donorType ?? "CAFETERIA",
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [retryKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrors({});
    try {
      const updated = await profileService.updateDonorProfile(DONOR_USER_ID, form, DONOR_VIEWER);
      setState(asyncState.success(updated));
      setSaved(true);
    } catch (error: unknown) {
      const serviceError = toServiceError(error);
      setErrors(serviceError.fieldErrors ?? { form: serviceError.message });
    } finally {
      setSaving(false);
    }
  }

  const profile = state.data;
  const name = form.organizationName || form.displayName || "ইউআইইউ সেন্ট্রাল ক্যাফেটেরিয়া";

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.profile}
      title={tx("দাতা প্রোফাইল সম্পাদনা")}
      description={tx("আপনার প্রতিষ্ঠানের পরিচিতি, ফোকাল পারসন ও যোগাযোগের অফিসিয়াল তথ্য আপডেট রাখুন।")}
      profileName={name}
      profileDescription={tx("ভেরিফায়েড খাদ্য দাতা")}
      avatarInitials={getInitials(name)}
      notificationHref={ROUTES.donor.notifications}
      actions={
        <ButtonLink
          href={ROUTES.donor.profile}
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="size-4" />}
        ><UiText source={"প্রোফাইলে ফিরে যান"} /></ButtonLink>
      }
    >
      {state.status === "loading" && !profile && <LoadingSpinner />}

      {state.status === "error" && !profile && (
        <EmptyState
          icon={RefreshCw}
          title={tx("প্রোফাইল লোড করা যায়নি")}
          description={tx(state.error.message)}
          action={
            <Button onClick={() => setRetryKey((value) => value + 1)}><UiText source={"পুনরায় চেষ্টা করুন"} /></Button>
          }
        />
      )}

      {profile && (
        <form onSubmit={submit} className="grid gap-6">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader
              title={tx("প্রাতিষ্ঠানিক ও যোগাযোগের বিবরণ")}
              description={tx("উদ্ধার সমন্বয়ের সময় অনুমোদিত এনজিও ও ভলান্টিয়াররা কেবল এই তথ্যের ভিত্তিতে যোগাযোগ করবে।")}
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Input
                label={tx("প্রতিনিধি / ফোকাল পারসনের নাম")}
                value={form.displayName}
                error={tx(errors.displayName)}
                hint={tx("প্রধান খাদ্য সুপারভাইজার বা দায়িত্বরত ব্যক্তির নাম লিখুন।")}
                onChange={(event) => setForm({ ...form, displayName: event.target.value })}
              />

              <Input
                label={tx("প্রতিষ্ঠানের পূর্ণ নাম")}
                value={form.organizationName}
                error={tx(errors.organizationName)}
                hint={tx("যেমন: UIU Cafeteria বা আপনার রেস্তোরাঁর নাম।")}
                onChange={(event) => setForm({ ...form, organizationName: event.target.value })}
              />

              <Select
                label={tx("প্রতিষ্ঠানের ধরণ")}
                value={form.donorType}
                onChange={(event) =>
                  setForm({ ...form, donorType: event.target.value as DonorProfile["donorType"] })
                }
              >
                <option value="CAFETERIA">{tx("ক্যাফেটেরিয়া / ক্যান্টিন (Cafeteria)")}</option>
                <option value="RESTAURANT">{tx("রেস্তোরাঁ / হোটেল (Restaurant)")}</option>
                <option value="BAKERY">{tx("বেকারি ও কনফেকশনারি (Bakery)")}</option>
                <option value="EVENT_ORGANIZER">{tx("ইভেন্ট ও ক্যাটারিং (Event Organizer)")}</option>
                <option value="INDIVIDUAL">{tx("ব্যক্তিগত দাতা (Individual)")}</option>
              </Select>

              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50/70 p-4 text-xs font-medium text-emerald-800">
                <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                <span>
                  {tx("আপনার সংরক্ষিত পরিচয় ও যোগাযোগের তথ্য এখানে সম্পাদনা করুন। Account verification ও food safety certification আলাদা বিষয়।")}</span>
              </div>

              <Input
                label={tx("অফিসিয়াল ইমেইল অ্যাড্রেস")}
                type="email"
                value={form.email}
                error={tx(errors.email)}
                hint={tx("আপনার account-এর যোগাযোগের ইমেইল।")}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />

              <Input
                label={tx("মোবাইল নম্বর (পিকআপ হটলাইন)")}
                value={form.phone}
                error={tx(errors.phone)}
                hint={tx("পিকআপের সময় ওটিপি ভেরিফিকেশন ও রাইডার যোগাযোগের নম্বর।")}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </CardContent>
          </Card>

          {errors.form && (
            <Alert
              tone="danger"
              title={tx("তথ্য সংরক্ষণ করা যায়নি")}
              description={tx(errors.form)}
            />
          )}

          {saved && (
            <Alert
              tone="success"
              title={tx("প্রোফাইল সফলভাবে আপডেট করা হয়েছে!")}
              description={tx("আপনার প্রতিষ্ঠানের তথ্য ও যোগাযোগের বিবরণ ডিজিটাল সিস্টেমে সংরক্ষিত হয়েছে।")}
            />
          )}

          <div className="flex items-center justify-end gap-3">
            <ButtonLink href={ROUTES.donor.profile} variant="ghost" size="md">
              {tx("বাতিল করুন")}</ButtonLink>
            <Button
              type="submit"
              disabled={saving}
              leftIcon={saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            >
              {saving ? tx("সংরক্ষণ করা হচ্ছে…") : tx("পরিবর্তনগুলো সংরক্ষণ করুন")}
            </Button>
          </div>
        </form>
      )}
    </PortalShell>
  );
}
