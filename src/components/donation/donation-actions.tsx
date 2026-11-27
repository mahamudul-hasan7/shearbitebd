"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { AlertTriangle, Ban, Pencil, Send } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExecutiveDialog } from "@/components/ui/executive-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DonationStatus } from "@/lib/constants/statuses";
import { IncidentType, PriorityLevel } from "@/lib/constants/domain";
import { UNIT_LABELS_BN, PRIORITY_LABELS_BN } from "@/features/donations/donation-presentation";
import { validateDonationTimes } from "@/lib/validators/date-time";
import { toServiceError, type CreateDonationIncidentInput, type UpdateDonationInput } from "@/services";
import type { DonationView } from "@/types/domain";

type ActionKind = "edit" | "cancel" | "issue";

const INCIDENT_LABELS_BN: Record<IncidentType, string> = {
  [IncidentType.DAMAGED_FOOD]: "খাবার বা প্যাকেজিং ক্ষতিগ্রস্ত / অনুপযুক্ত",
  [IncidentType.WRONG_QUANTITY]: "ভুল পরিমাণের খাবার রেকর্ড হয়েছে",
  [IncidentType.LATE_DELIVERY]: "রাইডার পিকআপে অপ্রত্যাশিত বিলম্ব",
  [IncidentType.WRONG_ITEM]: "মেন্যু বা খাবারের বিবরণে গরমিল",
  [IncidentType.SAFETY_CONCERN]: "খাদ্য সুরক্ষা বা হাইজিন সংক্রান্ত উদ্বেগ",
  [IncidentType.OTHER]: "অন্যান্য সমস্যা",
};

const CANCELLATION_REASONS_BN = [
  { value: "খাবারটি ইতোমধ্যে স্থানীয়ভাবে বিতরণ করা হয়েছে", label: "খাবারটি ইতোমধ্যে স্থানীয়ভাবে বিতরণ করা হয়েছে" },
  { value: "নিরাপদ পিকআপের নির্ধারিত সময় আর রক্ষা করা সম্ভব নয়", label: "নিরাপদ পিকআপের নির্ধারিত সময় আর রক্ষা করা সম্ভব নয়" },
  { value: "পোস্টকৃত তথ্যে গুরুতর ভুল রয়েছে (নতুন করে পোস্ট করা হবে)", label: "পোস্টকৃত তথ্যে গুরুতর ভুল রয়েছে (নতুন করে পোস্ট করা হবে)" },
  { value: "পিকআপ লোকেশনে অনাকাঙ্ক্ষিত জরুরি পরিস্থিতি বা বিদ্যুৎ বিভ্রাট", label: "পিকআপ লোকেশনে অনাকাঙ্ক্ষিত জরুরি পরিস্থিতি বা বিদ্যুৎ বিভ্রাট" },
  { value: "খাবারের গুণমান সন্তোষজনক না থাকায় বাতিল করা হয়েছে", label: "খাবারের গুণমান সন্তোষজনক না থাকায় বাতিল করা হয়েছে" },
  { value: "অন্যান্য কারণ", label: "অন্যান্য কারণ" },
];

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function DonationActions({
  donation,
  canEdit,
  canCancel,
  canReport,
  onPublishDraft,
  onEdit,
  onCancel,
  onReport,
  reportHref,
}: {
  donation: DonationView;
  reportHref?: string;
  canEdit: boolean;
  canCancel: boolean;
  canReport: boolean;
  onPublishDraft?: () => Promise<void>;
  onEdit: (input: UpdateDonationInput) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onReport: (input: CreateDonationIncidentInput) => Promise<void>;
}) {
  const tx = useUiText();
  const formId = useId();
  const [openModal, setOpenModal] = useState(false);
  const [action, setAction] = useState<ActionKind>("edit");
  const [busy, setBusy] = useState(false);
  const [publishError, setPublishError] = useState<string>();
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(donation.title);
  const [description, setDescription] = useState(donation.description);
  const [quantity, setQuantity] = useState(String(donation.quantity.value));
  const [estimatedMeals, setEstimatedMeals] = useState(String(donation.quantity.estimatedMeals));
  const [deadline, setDeadline] = useState(localDateTime(donation.safePickupDeadline));
  const [pickupStart, setPickupStart] = useState(localDateTime(donation.pickup.windowStart));
  const [pickupEnd, setPickupEnd] = useState(localDateTime(donation.pickup.windowEnd));
  const [instructions, setInstructions] = useState(donation.specialInstructions ?? "");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetails, setCancelDetails] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.LATE_DELIVERY);
  const [severity, setSeverity] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [issueDescription, setIssueDescription] = useState("");
  const [contactMethod, setContactMethod] = useState<CreateDonationIncidentInput["preferredContactMethod"]>("IN_APP");

  function open(nextAction: ActionKind) {
    setAction(nextAction);
    setError(undefined);
    setFieldErrors({});
    setOpenModal(true);
  }

  function close() {
    if (!busy) {
      setOpenModal(false);
      setError(undefined);
      setFieldErrors({});
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setFieldErrors({});

    try {
      setBusy(true);
      if (action === "edit") {
        const quantityValue = Number(quantity);
        const mealsValue = Number(estimatedMeals);
        const nextErrors: Record<string, string> = {};
        if (!title.trim()) nextErrors.title = "খাবারের শিরোনাম উল্লেখ করুন।";
        if (!description.trim()) nextErrors.description = "খাবারের বিস্তারিত বর্ণনা প্রদান করুন।";
        if (!Number.isFinite(quantityValue) || quantityValue <= 0) nextErrors.quantity = "সঠিক পরিমাণ লিখুন।";
        if (!Number.isFinite(mealsValue) || mealsValue <= 0) nextErrors.estimatedMeals = "আনুমানিক খাদ্যগ্রহীতা সংখ্যা লিখুন।";
        Object.assign(
          nextErrors,
          validateDonationTimes({
            preparationTime: donation.preparationTime,
            safePickupDeadline: deadline,
            pickupWindowStart: pickupStart,
            pickupWindowEnd: pickupEnd,
            requireFutureDeadline: true,
          })
        );
        if (Object.keys(nextErrors).length > 0) {
          setFieldErrors(nextErrors);
          return;
        }
        await onEdit({
          title,
          description,
          quantity: { value: quantityValue, unit: donation.quantity.unit, estimatedMeals: mealsValue },
          safePickupDeadline: new Date(deadline).toISOString(),
          pickupWindowStart: new Date(pickupStart).toISOString(),
          pickupWindowEnd: new Date(pickupEnd).toISOString(),
          specialInstructions: instructions,
        });
      } else if (action === "cancel") {
        if (!cancelReason) {
          setFieldErrors({ cancellationReason: "অনুদান বাতিলের একটি কারণ নির্বাচন করুন।" });
          return;
        }
        await onCancel(`${cancelReason}${cancelDetails.trim() ? `: ${cancelDetails.trim()}` : ""}`);
      } else {
        if (issueDescription.trim().length < 12) {
          setFieldErrors({ description: "সমস্যার বিস্তারিত বর্ণনায় কমপক্ষে ১২টি অক্ষর লিখুন।" });
          return;
        }
        await onReport({
          type: incidentType,
          severity,
          description: issueDescription,
          preferredContactMethod: contactMethod,
        });
      }
      setOpenModal(false);
    } catch (caught: unknown) {
      const serviceError = toServiceError(caught);
      setError(serviceError.message);
      setFieldErrors(serviceError.fieldErrors ?? {});
    } finally {
      setBusy(false);
    }
  }

  const titleText =
    action === "edit"
      ? "অনুদানের তথ্য সম্পাদনা"
      : action === "cancel"
      ? "অনুদান বাতিল নিশ্চিতকরণ"
      : "রেসকিউ সমস্যা রিপোর্ট করুন";

  const descriptionText =
    action === "edit"
      ? "এনজিও ক্লেইম করার আগ পর্যন্ত তথ্য পরিমার্জন করা যাবে।"
      : action === "cancel"
      ? "অনুদান বাতিল করলে সক্রিয় এনজিও ক্লেইম অবমুক্ত হবে এবং তালিকাটি আর দৃশ্যমান থাকবে না।"
      : "কোনো অপ্রত্যাশিত সমস্যা বা খাদ্য নিরাপত্তা ঝুঁকি তৈরি হলে রিপোর্ট করুন, সাপোর্ট টিম অবিলম্বে পর্যালোচনায় নেবে।";

  const unitLabel = UNIT_LABELS_BN[donation.quantity.unit] || donation.quantity.unit;

  async function handlePublishDraft() {
    if (!onPublishDraft || busy) return;
    setPublishError(undefined);
    try {
      setBusy(true);
      await onPublishDraft();
    } catch (caught: unknown) {
      setPublishError(toServiceError(caught).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div id="actions" className="grid gap-2.5">
        {donation.status === DonationStatus.DRAFT && onPublishDraft && (
          <>
            <Button
              type="button"
              variant="primary"
              leftIcon={<Send className="size-4" />}
              disabled={busy}
              onClick={() => void handlePublishDraft()}
              className="w-full justify-start font-bold"
            >
              {tx("খসড়া অনুদান প্রকাশ করুন")}
            </Button>
            {publishError && (
              <Alert tone="danger" title={tx("কার্যক্রম সম্পন্ন করা যায়নি")} description={tx(publishError)} />
            )}
          </>
        )}
        <Button
          type="button"
          variant="outline"
          leftIcon={<Pencil className="size-4 text-emerald-600" />}
          disabled={!canEdit || busy}
          onClick={() => open("edit")}
          className="w-full justify-start font-bold border-line hover:border-emerald-300 hover:bg-emerald-50/50"
        >
          {tx("অনুদানের তথ্য সম্পাদনা")}</Button>
        {reportHref ? <ButtonLink href={reportHref} variant="outline" className="w-full justify-start">{tx("Report an issue / history")}</ButtonLink> : <Button
          type="button"
          variant="outline"
          leftIcon={<AlertTriangle className="size-4 text-amber-500" />}
          disabled={!canReport}
          onClick={() => open("issue")}
          className="w-full justify-start font-bold border-line hover:border-amber-300 hover:bg-amber-50/50"
        >
          {tx("সমস্যা রিপোর্ট করুন")}</Button>}
        <Button
          type="button"
          variant="danger"
          leftIcon={<Ban className="size-4" />}
          disabled={!canCancel}
          onClick={() => open("cancel")}
          className="w-full justify-start font-bold"
        >
          {tx("অনুদান বাতিল করুন")}</Button>
      </div>

      <ExecutiveDialog
        open={openModal}
        onClose={close}
        busy={busy}
        tone={action === "cancel" ? "rose" : action === "issue" ? "amber" : "emerald"}
        size="lg"
        title={titleText}
        subtitle={descriptionText}
        leading={
          action === "edit" ? (
            <Pencil className="size-5" />
          ) : action === "cancel" ? (
            <Ban className="size-5" />
          ) : (
            <AlertTriangle className="size-5" />
          )
        }
        footer={
          <>
            <Button type="button" variant="outline" disabled={busy} onClick={close}>
              {tx("ফিরে যান")}
            </Button>
            <Button
              type="submit"
              form={formId}
              variant={action === "cancel" ? "danger" : "primary"}
              rightIcon={<Send className="size-4" />}
              disabled={busy}
            >
              {busy
                ? tx("সংরক্ষণ করা হচ্ছে...")
                : action === "edit"
                  ? tx("তথ্য আপডেট করুন")
                  : action === "cancel"
                    ? tx("বাতিল নিশ্চিত করুন")
                    : tx("রিপোর্ট জমা দিন")}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={submit} noValidate className="grid gap-5">
          {error && <Alert tone="danger" title={tx("কার্যক্রম সম্পন্ন করা যায়নি")} description={tx(error)} />}

            {action === "edit" && (
              <>
                <Input
                  label={tx("খাবারের শিরোনাম")}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  error={fieldErrors.title}
                  placeholder={tx("যেমন: দুপুরের স্পেশাল পোলাও ও রোস্ট")}
                  required
                />
                <Textarea
                  label={tx("খাবারের বিস্তারিত বিবরণ")}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  error={fieldErrors.description}
                  placeholder={tx("খাবারের উপাদান, প্যাকেট সংখ্যা এবং বিশেষ হাইজিন তথ্যাদি...")}
                  required
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={tx("খাবারের মোট পরিমাণ ({0})", unitLabel)}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    error={fieldErrors.quantity}
                    required
                  />
                  <Input
                    label={tx("আনুমানিক খাদ্যগ্রহীতা (জন)")}
                    type="number"
                    min="1"
                    step="1"
                    value={estimatedMeals}
                    onChange={(event) => setEstimatedMeals(event.target.value)}
                    error={fieldErrors.estimatedMeals}
                    required
                  />
                </div>
                <Input
                  label={tx("নিরাপদ পিকআপের সর্বোচ্চ মেয়াদ (ডেডলাইন)")}
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  error={fieldErrors.safePickupDeadline}
                  required
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={tx("পিকআপ উইন্ডো শুরু")}
                    type="datetime-local"
                    value={pickupStart}
                    onChange={(event) => setPickupStart(event.target.value)}
                    error={fieldErrors.pickupWindowStart}
                    required
                  />
                  <Input
                    label={tx("পিকআপ উইন্ডো সমাপ্তি")}
                    type="datetime-local"
                    value={pickupEnd}
                    onChange={(event) => setPickupEnd(event.target.value)}
                    error={fieldErrors.pickupWindowEnd}
                    required
                  />
                </div>
                <Textarea
                  label={tx("রাইডারের জন্য বিশেষ নির্দেশনা (ঐচ্ছিক)")}
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder={tx("ক্যাফেটেরিয়ার পেছনের সার্ভিস গেট ব্যবহার করুন...")}
                />
              </>
            )}

            {action === "cancel" && (
              <>
                <Alert
                  tone="warning"
                  title={tx("বাতিলের কারণ আবশ্যক")}
                  description={tx("অনুদান বাতিল করলে সেটি অপরিবর্তনীয় এবং অনুদানের হিস্ট্রিতে কারণটি স্থায়ীভাবে সংরক্ষিত থাকবে।")}
                />
                <Select
                  label={tx("বাতিলের সুনির্দিষ্ট কারণ নির্বাচন করুন")}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  error={fieldErrors.cancellationReason}
                  required
                >
                  <option value="">{tx("একটি কারণ নির্বাচন করুন")}</option>
                  {CANCELLATION_REASONS_BN.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {tx(reason.label)}
                    </option>
                  ))}
                </Select>
                <Textarea
                  label={tx("অতিরিক্ত মন্তব্য বা ব্যাখ্যা (ঐচ্ছিক)")}
                  value={cancelDetails}
                  onChange={(event) => setCancelDetails(event.target.value)}
                  placeholder={tx("বিস্তারিত নোট লিখুন...")}
                />
              </>
            )}

            {action === "issue" && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label={tx("সমস্যার ধরণ")}
                    value={incidentType}
                    onChange={(event) => setIncidentType(event.target.value as IncidentType)}
                  >
                    {Object.values(IncidentType).map((item) => (
                      <option key={item} value={item}>
                        {tx(INCIDENT_LABELS_BN[item] || item)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label={tx("তীব্রতা / অগ্রাধিকার")}
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value as PriorityLevel)}
                  >
                    {Object.values(PriorityLevel).map((item) => (
                      <option key={item} value={item}>
                        {tx(PRIORITY_LABELS_BN[item] || item)}
                      </option>
                    ))}
                  </Select>
                </div>
                <Textarea
                  label={tx("সমস্যার বিস্তারিত বিবরণ")}
                  value={issueDescription}
                  onChange={(event) => setIssueDescription(event.target.value)}
                  error={fieldErrors.description}
                  placeholder={tx("কী ঘটেছে এবং কী ধরণের সহায়তা প্রয়োজন তা বিস্তারিত লিখুন...")}
                  required
                />
                <Select
                  label={tx("পছন্দের যোগাযোগ মাধ্যম")}
                  value={contactMethod}
                  onChange={(event) => setContactMethod(event.target.value as CreateDonationIncidentInput["preferredContactMethod"])}
                >
                  <option value="IN_APP">{tx("ইন-অ্যাপ নোটিফিকেশন")}</option>
                  <option value="PHONE">{tx("সরাসরি ফোন কল")}</option>
                  <option value="EMAIL">{tx("ইমেইল বার্তা")}</option>
                </Select>
              </>
            )}
        </form>
      </ExecutiveDialog>
    </>
  );
}
