"use client";

import { AlertTriangle, Ban, Check, Info, Pencil, Send, X, ShieldAlert } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  onEdit,
  onCancel,
  onReport,
}: {
  donation: DonationView;
  canEdit: boolean;
  canCancel: boolean;
  canReport: boolean;
  onEdit: (input: UpdateDonationInput) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onReport: (input: CreateDonationIncidentInput) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<ActionKind>("edit");
  const [busy, setBusy] = useState(false);
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
    window.requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function close() {
    if (!busy) dialogRef.current?.close();
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
      dialogRef.current?.close();
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
      ? "ভলান্টিয়ার খাবার সংগ্রহ শুরু করার পূর্ব পর্যন্ত আপনি তথ্য পরিমার্জন করতে পারবেন।"
      : action === "cancel"
      ? "অনুদান বাতিল করলে সক্রিয় এনজিও ক্লেইম অবমুক্ত হবে এবং তালিকাটি আর দৃশ্যমান থাকবে না।"
      : "কোনো অপ্রত্যাশিত সমস্যা বা খাদ্য নিরাপত্তা ঝুঁকি তৈরি হলে রিপোর্ট করুন, সাপোর্ট টিম অবিলম্বে পর্যালোচনায় নেবে।";

  const unitLabel = UNIT_LABELS_BN[donation.quantity.unit] || donation.quantity.unit;

  return (
    <>
      <div id="actions" className="grid gap-2.5">
        <Button
          type="button"
          variant="outline"
          leftIcon={<Pencil className="size-4 text-emerald-600" />}
          disabled={!canEdit}
          onClick={() => open("edit")}
          className="w-full justify-start font-bold border-line hover:border-emerald-300 hover:bg-emerald-50/50"
        >
          অনুদানের তথ্য সম্পাদনা
        </Button>
        <Button
          type="button"
          variant="outline"
          leftIcon={<AlertTriangle className="size-4 text-amber-500" />}
          disabled={!canReport}
          onClick={() => open("issue")}
          className="w-full justify-start font-bold border-line hover:border-amber-300 hover:bg-amber-50/50"
        >
          সমস্যা রিপোর্ট করুন
        </Button>
        <Button
          type="button"
          variant="danger"
          leftIcon={<Ban className="size-4" />}
          disabled={!canCancel}
          onClick={() => open("cancel")}
          className="w-full justify-start font-bold"
        >
          অনুদান বাতিল করুন
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="donation-action-title"
        aria-describedby="donation-action-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => {
          setError(undefined);
          setFieldErrors({});
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-3xl border border-line bg-white p-0 shadow-2xl backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-gradient-to-r from-emerald-50/60 to-transparent p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white">
                {action === "edit" ? <Pencil className="size-4" /> : action === "cancel" ? <Ban className="size-4" /> : <AlertTriangle className="size-4" />}
              </span>
              <h2 id="donation-action-title" className="text-xl font-black text-ink-900">
                {titleText}
              </h2>
            </div>
            <p id="donation-action-description" className="mt-1.5 text-xs leading-5 text-muted-600">
              {descriptionText}
            </p>
          </div>
          <IconButton autoFocus label="বন্ধ করুন" onClick={close}>
            <X className="size-5" />
          </IconButton>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="grid gap-5 p-5 sm:p-6">
            {error && <Alert tone="danger" title="কার্যক্রম সম্পন্ন করা যায়নি" description={error} />}

            {action === "edit" && (
              <>
                <Input
                  label="খাবারের শিরোনাম"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  error={fieldErrors.title}
                  placeholder="যেমন: দুপুরের স্পেশাল পোলাও ও রোস্ট"
                  required
                />
                <Textarea
                  label="খাবারের বিস্তারিত বিবরণ"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  error={fieldErrors.description}
                  placeholder="খাবারের উপাদান, প্যাকেট সংখ্যা এবং বিশেষ হাইজিন তথ্যাদি..."
                  required
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={`খাবারের মোট পরিমাণ (${unitLabel})`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    error={fieldErrors.quantity}
                    required
                  />
                  <Input
                    label="আনুমানিক খাদ্যগ্রহীতা (জন)"
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
                  label="নিরাপদ পিকআপের সর্বোচ্চ মেয়াদ (ডেডলাইন)"
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  error={fieldErrors.safePickupDeadline}
                  required
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="পিকআপ উইন্ডো শুরু"
                    type="datetime-local"
                    value={pickupStart}
                    onChange={(event) => setPickupStart(event.target.value)}
                    error={fieldErrors.pickupWindowStart}
                    required
                  />
                  <Input
                    label="পিকআপ উইন্ডো সমাপ্তি"
                    type="datetime-local"
                    value={pickupEnd}
                    onChange={(event) => setPickupEnd(event.target.value)}
                    error={fieldErrors.pickupWindowEnd}
                    required
                  />
                </div>
                <Textarea
                  label="রাইডারের জন্য বিশেষ নির্দেশনা (ঐচ্ছিক)"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="ক্যাফেটেরিয়ার পেছনের সার্ভিস গেট ব্যবহার করুন..."
                />
              </>
            )}

            {action === "cancel" && (
              <>
                <Alert
                  tone="warning"
                  title="বাতিলের কারণ আবশ্যক"
                  description="অনুদান বাতিল করলে সেটি অপরিবর্তনীয় এবং অনুদানের হিস্ট্রিতে কারণটি স্থায়ীভাবে সংরক্ষিত থাকবে।"
                />
                <Select
                  label="বাতিলের সুনির্দিষ্ট কারণ নির্বাচন করুন"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  error={fieldErrors.cancellationReason}
                  required
                >
                  <option value="">একটি কারণ নির্বাচন করুন</option>
                  {CANCELLATION_REASONS_BN.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </Select>
                <Textarea
                  label="অতিরিক্ত মন্তব্য বা ব্যাখ্যা (ঐচ্ছিক)"
                  value={cancelDetails}
                  onChange={(event) => setCancelDetails(event.target.value)}
                  placeholder="বিস্তারিত নোট লিখুন..."
                />
              </>
            )}

            {action === "issue" && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label="সমস্যার ধরণ"
                    value={incidentType}
                    onChange={(event) => setIncidentType(event.target.value as IncidentType)}
                  >
                    {Object.values(IncidentType).map((item) => (
                      <option key={item} value={item}>
                        {INCIDENT_LABELS_BN[item] || item}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="তীব্রতা / অগ্রাধিকার"
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value as PriorityLevel)}
                  >
                    {Object.values(PriorityLevel).map((item) => (
                      <option key={item} value={item}>
                        {PRIORITY_LABELS_BN[item] || item}
                      </option>
                    ))}
                  </Select>
                </div>
                <Textarea
                  label="সমস্যার বিস্তারিত বিবরণ"
                  value={issueDescription}
                  onChange={(event) => setIssueDescription(event.target.value)}
                  error={fieldErrors.description}
                  placeholder="কী ঘটেছে এবং কী ধরণের সহায়তা প্রয়োজন তা বিস্তারিত লিখুন..."
                  required
                />
                <Select
                  label="পছন্দের যোগাযোগ মাধ্যম"
                  value={contactMethod}
                  onChange={(event) => setContactMethod(event.target.value as CreateDonationIncidentInput["preferredContactMethod"])}
                >
                  <option value="IN_APP">ইন-অ্যাপ নোটিফিকেশন</option>
                  <option value="PHONE">সরাসরি ফোন কল</option>
                  <option value="EMAIL">ইমেইল বার্তা</option>
                </Select>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-line bg-canvas/40 p-5 sm:flex-row sm:justify-end sm:p-6">
            <Button type="button" variant="ghost" disabled={busy} onClick={close}>
              ফিরে যান
            </Button>
            <Button
              type="submit"
              variant={action === "cancel" ? "danger" : "primary"}
              rightIcon={<Send className="size-4" />}
              disabled={busy}
            >
              {busy
                ? "সংরক্ষণ করা হচ্ছে..."
                : action === "edit"
                ? "তথ্য আপডেট করুন"
                : action === "cancel"
                ? "বাতিল নিশ্চিত করুন"
                : "রিপোর্ট জমা দিন"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
