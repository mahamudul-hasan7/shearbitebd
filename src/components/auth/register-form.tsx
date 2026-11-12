"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AuthProgress } from "@/components/auth/auth-progress";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMockAuth, getRoleLandingRoute } from "@/features/auth/mock-auth";
import {
  INITIAL_REGISTRATION_DATA,
  type RegistrationData,
  type RegistrationErrorKey,
  type RegistrationErrors,
  type RegistrationRole,
} from "@/features/auth/types";
import { hasErrors, validateRegistrationStep } from "@/features/auth/validation";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const steps = [
  { label: "অ্যাকাউন্ট তথ্য", shortLabel: "অ্যাকাউন্ট" },
  { label: "প্রাতিষ্ঠানিক বিবরণ", shortLabel: "বিবরণ" },
  { label: "ভেরিফিকেশন ও শর্ত", shortLabel: "ভেরিফিকেশন" },
  { label: "আবেদন সম্পন্ন", shortLabel: "সম্পন্ন" },
];

interface RoleMeta {
  title: string;
  subtitle: string;
  badge: string;
  icon: typeof Utensils;
  step2Title: string;
  step2Description: string;
}

const ROLE_METAS: Record<RegistrationRole, RoleMeta> = {
  donor: {
    title: "ফুড ডোনার",
    subtitle: "ক্যাফেটেরিয়া ও রেস্তোরাঁ",
    badge: "খাদ্য দাতা",
    icon: Utensils,
    step2Title: "দাতা প্রতিষ্ঠানের তথ্য ও লোকেশন",
    step2Description: "রেস্তোরাঁ, ক্যাফেটেরিয়া বা ক্যাটারিং সংক্রান্ত বিবরণ ও পিকআপের প্রাথমিক ঠিকানা দিন।",
  },
  ngo: {
    title: "এনজিও ও চ্যারিটি",
    subtitle: "বিদ্যানন্দ, মাস্তুল ও খাদ্য ব্যাংক",
    badge: "নিবন্ধিত চ্যারিটি",
    icon: HeartHandshake,
    step2Title: "সংস্থার সরকারি নিবন্ধন ও সক্ষমতা",
    step2Description: "খাদ্য বিতরণের প্রাতিষ্ঠানিক সনদ ও সুবিধাভোগী সম্পর্কিত তথ্য প্রদান করুন।",
  },
  volunteer: {
    title: "ভলান্টিয়ার স্কোয়াড",
    subtitle: "রাইডার ও ফিল্ড রেসকিউ টিম",
    badge: "জরুরি উদ্ধারকারী",
    icon: Truck,
    step2Title: "বাহন ও সেবাদানের সময়সূচি",
    step2Description: "আপনার সুবিধাজনক সময়, বাহন ও ঢাকা শহরের পছন্দের সার্ভিস এরিয়া নির্বাচন করুন।",
  },
};

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role");
  const initialRole: RegistrationRole = rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "donor";

  const [role, setRole] = useState<RegistrationRole>(initialRole);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(INITIAL_REGISTRATION_DATA);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [registeredUserId, setRegisteredUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { signIn } = useMockAuth();

  const activeMeta = ROLE_METAS[role];

  function clearError(key: RegistrationErrorKey) {
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function setFieldValue(field: keyof RegistrationData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
    clearError(field as RegistrationErrorKey);
  }

  function toggleCustomField(field: string, isCustom: boolean) {
    setCustomFields((prev) => ({ ...prev, [field]: isCustom }));
    if (!isCustom) {
      setFieldValue(field as keyof RegistrationData, "");
    }
  }

  function applyDemoPreset(targetRole: RegistrationRole = role) {
    setCustomFields({});
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    if (targetRole === "donor") {
      setData({
        fullName: "তানভীর আহমেদ (ক্যাফেটেরিয়া ইনচার্জ)",
        email: `uiu.cafe.${randomSuffix}@sharebite.demo`,
        phone: "01712345678",
        password: "Demo1234",
        confirmPassword: "Demo1234",
        donorType: "cafeteria",
        organizationName: "UIU সেন্ট্রাল ক্যাফেটেরিয়া",
        city: "ঢাকা",
        address: "ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২",
        notes: "প্রতিদিন দুপুর ৩টা এবং রাত ৯টায় ফ্রেশ উদ্বৃত্ত খাবার প্রস্তুত থাকে।",
        registrationNumber: "BFSA-2026-UIU-09",
        beneficiaryType: "shelter",
        transport: "motorcycle",
        availability: "flexible",
      });
      setDocumentName("BFSA_Food_Safety_Cert_2026.pdf");
      setTermsAccepted(true);
    } else if (targetRole === "ngo") {
      setData({
        fullName: "আরিফুল ইসলাম (প্রজেক্ট কো-অর্ডিনেটর)",
        email: `mastul.rescue.${randomSuffix}@sharebite.demo`,
        phone: "01812345678",
        password: "Demo1234",
        confirmPassword: "Demo1234",
        donorType: "restaurant",
        organizationName: "মাস্তুল ফাউন্ডেশন (বাড্ডা শাখা)",
        registrationNumber: "NGO-GOV-2026-912",
        beneficiaryType: "shelter",
        city: "ঢাকা",
        address: "বাড়ি #১৪, রোড #৭, ব্লক #সি, বাড্ডা, ঢাকা",
        notes: "দৈনিক ২৫০-৪০০ প্যাকেট তাজা খাবার সংগ্রহ ও নিজস্ব ভ্যানে সরাসরি বিতরণের সক্ষমতা রয়েছে।",
        transport: "car",
        availability: "flexible",
      });
      setDocumentName("Govt_NGO_Bureau_License_2026.pdf");
      setTermsAccepted(true);
    } else {
      setData({
        fullName: "মাহমুদ হাসান (রাইডার)",
        email: `rider.hasan.${randomSuffix}@sharebite.demo`,
        phone: "01912345678",
        password: "Demo1234",
        confirmPassword: "Demo1234",
        donorType: "individual",
        organizationName: "ভলান্টিয়ার স্কোয়াড",
        city: "ঢাকা",
        transport: "bicycle",
        availability: "flexible",
        address: "ইউআইইউ ক্যাম্পাস, মাদানী এভিনিউ ও বাড্ডা জোন",
        notes: "জরুরি ফুড রেসকিউ অ্যালার্ট পেলে বাইসাইকেল নিয়ে ৩০ মিনিটের মধ্যে খাবার পৌঁছে দিতে পারব।",
        registrationNumber: "STUDENT-ID-0112330182",
        beneficiaryType: "shelter",
      });
      setDocumentName("UIU_Student_ID_Verified.jpg");
      setTermsAccepted(true);
    }
    setErrors({});
  }

  const verificationNotice = useMemo(() => {
    if (role === "ngo") {
      return "সংস্থার সরকারি নিবন্ধন (সমাজসেবা বা এনজিও বিষয়ক ব্যুরো) সার্টিফিকেট আপলোড করা বাধ্যতামূলক। প্রাথমিক জমা দেওয়ার পর অ্যাডমিন টিম তথ্য যাচাই করবে।";
    }
    if (role === "volunteer") {
      return "স্বেচ্ছাসেবীদের নিরাপত্তা ও সত্যতা নিশ্চিতে জাতীয় পরিচয়পত্র (NID) বা স্টুডেন্ট আইডি কার্ড আপলোড করা আবশ্যক।";
    }
    return "দাতা প্রতিষ্ঠানের ট্রেড লাইসেন্স বা প্রাতিষ্ঠানিক আইডি আপলোড করা ঐচ্ছিক, তবে ভেরিফাইড ব্যাজ পাওয়ার জন্য এটি সুপারিশকৃত।";
  }, [role]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    clearError(name as RegistrationErrorKey);
  }

  function revealFirstError(nextErrors: RegistrationErrors) {
    setErrors(nextErrors);
    window.requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function validateCurrentStep() {
    const nextErrors = validateRegistrationStep({
      step: currentStep,
      role,
      data,
      termsAccepted,
      documentName,
    });
    if (hasErrors(nextErrors)) {
      revealFirstError(nextErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setCurrentStep((step) => Math.min(3, step + 1));
  }

  function goBack() {
    setErrors({});
    setCurrentStep((step) => Math.max(1, step - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    const userRole = role === "ngo" ? UserRole.NGO : role === "volunteer" ? UserRole.VOLUNTEER : UserRole.DONOR;
    const finalDisplayName = (role === "ngo" ? data.organizationName : (data.fullName || data.organizationName)) || "ShareBite Member";

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          organizationName: data.organizationName,
          phone: data.phone,
          role: userRole,
          details: {
            address: data.address,
            city: data.city,
            donorType: data.donorType,
            organizationName: data.organizationName,
            registrationNumber: data.registrationNumber,
            beneficiaryType: data.beneficiaryType,
            transportMethod: data.transport,
            availability: data.availability,
            notes: data.notes,
          },
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          email: resData.error || "এই ইমেইল দিয়ে অ্যাকাউন্ট নিবন্ধন করা সম্ভব হয়নি।",
        }));
        setCurrentStep(1);
        setIsSubmitting(false);
        return;
      }

      if (resData.user?.id) {
        setRegisteredUserId(resData.user.id);
      }

      signIn({
        email: data.email,
        displayName: finalDisplayName,
        role: userRole,
        remember: true,
      });

      setCurrentStep(4);
    } catch (err) {
      console.warn("Database sync note:", err);
      signIn({
        email: data.email,
        displayName: finalDisplayName,
        role: userRole,
        remember: true,
      });
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 4: Celebration Screen
  if (currentStep === 4) {
    const userRole = role === "ngo" ? UserRole.NGO : role === "volunteer" ? UserRole.VOLUNTEER : UserRole.DONOR;
    const dashboardUrl = getRoleLandingRoute(userRole);
    const trackingId = registeredUserId || `#SBD-2026-${role.toUpperCase()}-7492`;

    return (
      <div className="py-2 text-center">
        <AuthProgress steps={steps} current={4} />

        {/* Celebration Badge */}
        <div className="relative mx-auto mt-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30">
          <CheckCircle2 className="size-10 stroke-[2.5]" />
          <span className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-amber-400 text-slate-900 shadow-md">
            <Sparkles className="size-4" />
          </span>
        </div>

        <div className="mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/20 font-heading">
            <BadgeCheck className="size-3.5 text-emerald-600" />
            আবেদন সফলভাবে গৃহীত হয়েছে
          </span>
          <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl font-heading">
            ShareBite BD-তে আপনাকে স্বাগতম!
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
            আপনার <strong className="text-slate-900">{activeMeta.title}</strong> প্রোফাইল রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।
          </p>
        </div>

        {/* Verification Summary Card */}
        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 text-left shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <span className="text-xs font-bold text-slate-500 font-heading">ট্র্যাকিং রেফারেন্স আইডি</span>
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-slate-200 font-mono">
              {trackingId}
            </span>
          </div>

          <div className="mt-3.5 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-900 font-heading">
                {role === "donor"
                  ? "ডোনার প্রোফাইল ব্যবহারের জন্য প্রস্তুত"
                  : "প্রাতিষ্ঠানিক নথি ভেরিফিকেশন প্রক্রিয়াধীন"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 font-normal">
                {role === "donor"
                  ? "আপনার প্রতিষ্ঠানের ক্যাফেটেরিয়া বা রেস্তোরাঁর উদ্বৃত্ত খাবারের তথ্য পোস্ট করতে এখনই ড্যাশবোর্ডে প্রবেশ করতে পারেন।"
                  : "নিবন্ধিত সনদ ও পরিচয়পত্র প্রশাসন কর্তৃক অডিট সম্পন্ন করা হচ্ছে। ডেমো সংস্করণে আপনি এখনই টেস্ট ড্যাশবোর্ড পরখ করে দেখতে পারবেন।"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink
            href={dashboardUrl}
            size="lg"
            className="w-full sm:w-auto shadow-md shadow-emerald-700/20"
            rightIcon={<ArrowRight className="size-4" />}
          >
            সরাসরি ড্যাশবোর্ডে প্রবেশ করুন
          </ButtonLink>
          <ButtonLink
            href={ROUTES.auth.login}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            লগইন পেজে যান
          </ButtonLink>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          ভিন্ন রোলে অ্যাকাউন্ট তৈরি করতে চান?{" "}
          <Link
            href={ROUTES.auth.roleSelection}
            className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors font-heading"
          >
            সব ভূমিকা নির্বাচন পেজ দেখুন
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Step Stepper Indicator */}
      <AuthProgress steps={steps} current={currentStep} />

      {/* 2. Step Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/15 font-heading">
          ধাপ {currentStep}: {steps[currentStep - 1].label}
        </span>
        <h1 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl font-heading">
          {currentStep === 1
            ? `${activeMeta.title} হিসেবে অ্যাকাউন্ট তৈরি করুন`
            : currentStep === 2
            ? activeMeta.step2Title
            : "যাচাইকরণ নথি ও খাদ্য নিরাপত্তা শর্ত"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-normal">
          {currentStep === 1
            ? "আপনার যোগাযোগের মৌলিক তথ্য ও পাসওয়ার্ড প্রদান করে নিবন্ধন শুরু করুন।"
            : currentStep === 2
            ? activeMeta.step2Description
            : "সিস্টেমে স্বচ্ছতা ও জবাবদিহিতা নিশ্চিত করতে ড্রপডাউন থেকে তথ্যসমূহ নির্বাচন করুন।"}
        </p>
      </div>

      {/* 3. 1-Tap Quick Auto-Fill Helper Banner */}
      {currentStep < 4 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3 border border-emerald-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7.5 place-items-center rounded-xl bg-emerald-600 text-white shadow-2xs">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800 font-heading">সহজে ১-ক্লিকে টেস্ট করতে চান?</p>
              <p className="text-[11px] text-slate-500">প্রিসেট ডেমো ডেটা দিয়ে পলকে সব তথ্য পূরণ করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => applyDemoPreset(role)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all active:scale-95 shadow-sm shadow-emerald-700/20 cursor-pointer touch-manipulation font-heading"
          >
            <span>⚡ ডেমো অটো-ফিল</span>
          </button>
        </div>
      )}

      {/* 4. Multi-Step Form */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-5 grid gap-5">
        {hasErrors(errors) && (
          <Alert
            tone="danger"
            title="তথ্যগুলো আবার পরীক্ষা করুন"
            description="অনুগ্রহ করে নিচে লাল রঙে চিহ্নিত ঘরগুলোতে সঠিক তথ্য প্রদান করুন।"
          />
        )}

        {/* STEP 1: Account Setup */}
        {currentStep === 1 && (
          <div className="grid gap-4.5 sm:grid-cols-2">
            {/* Role Dropdown */}
            <div className="sm:col-span-2">
              <Select
                label="আপনার ভূমিকা নির্বাচন করুন (Select Role)"
                name="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as RegistrationRole);
                  setErrors({});
                }}
              >
                <option value="donor">👨‍🍳 ফুড ডোনার (ক্যাফেটেরিয়া, রেস্তোরাঁ ও মেজবান)</option>
                <option value="ngo">🏢 এনজিও ও চ্যারিটি (বিদ্যানন্দ, মাস্তুল ও খাদ্য ব্যাংক)</option>
                <option value="volunteer">🚴 ভলান্টিয়ার স্কোয়াড (রাইডার ও ফিল্ড রেসকিউ টিম)</option>
              </Select>
            </div>

            <Input
              label={role === "ngo" ? "দায়িত্বপ্রাপ্ত কর্মকর্তার পুরো নাম" : "আপনার পুরো নাম"}
              name="fullName"
              value={data.fullName}
              onChange={updateField}
              required
              error={errors.fullName}
              placeholder={role === "ngo" ? "যেমন: তানভীর আহমেদ (প্রজেক্ট কো-অর্ডিনেটর)" : "যেমন: সাজিদ মাহমুদ"}
              autoComplete="name"
              leftIcon={<UserRound className="size-5" />}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="অফিসিয়াল ইমেইল ঠিকানা"
              name="email"
              type="email"
              value={data.email}
              onChange={updateField}
              required
              error={errors.email}
              placeholder="name@institution.com"
              autoComplete="email"
              leftIcon={<Mail className="size-5" />}
            />
            <Input
              label="সচল মোবাইল নম্বর"
              name="phone"
              type="tel"
              value={data.phone}
              onChange={updateField}
              required
              error={errors.phone}
              placeholder="+880 1712-345678 বা 01712345678"
              autoComplete="tel"
              leftIcon={<Phone className="size-5" />}
            />

            <PasswordInput
              label="পাসওয়ার্ড তৈরি করুন"
              name="password"
              value={data.password}
              onChange={updateField}
              error={errors.password}
              hint="কমপক্ষে ৮ অক্ষর, একটি বর্ণ ও একটি সংখ্যা থাকতে হবে।"
              placeholder="পাসওয়ার্ড লিখুন (Demo1234)"
              autoComplete="new-password"
            />
            <PasswordInput
              label="পাসওয়ার্ড নিশ্চিত করুন"
              name="confirmPassword"
              value={data.confirmPassword}
              onChange={updateField}
              error={errors.confirmPassword}
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              autoComplete="new-password"
            />

            <div className="sm:col-span-2 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs leading-relaxed text-emerald-900 font-medium">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                🔒 আপনার ব্যক্তিগত মোবাইল নম্বর ও তথ্য সম্পূর্ণ এনক্রিপ্ট থাকে এবং শুধুমাত্র খাবার হ্যান্ডওভারের সময় ওটিপি যাচাইকরণের জন্য ব্যবহৃত হবে।
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Donor Specific Fields */}
        {currentStep === 2 && role === "donor" && (
          <div className="grid gap-4.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {!customFields.donorType ? (
                <Select
                  label="দাতার ধরন নির্বাচন করুন (Donor Type)"
                  name="donorType"
                  value={data.donorType}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("donorType", true);
                      setFieldValue("donorType", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.donorType}
                >
                  <option value="">-- দাতার ধরন বেছে নিন --</option>
                  <option value="cafeteria">বিশ্ববিদ্যালয় ক্যাফেটেরিয়া (UIU, BRACU, AIUB)</option>
                  <option value="restaurant">বাণিজ্যিক রেস্তোরাঁ ও ক্যাফে</option>
                  <option value="event">কমিউনিটি সেন্টার ও বিয়ের মেজবান</option>
                  <option value="bakery">বেকারি ও পেস্ট্রি শপ</option>
                  <option value="individual">ব্যক্তিগত বা পারিবারিক আয়োজন</option>
                  <option value="__custom__">✏️ অন্যান্য ধরন (নিজে টাইপ করব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>দাতার ধরন ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("donorType", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="donorType"
                    value={data.donorType}
                    onChange={updateField}
                    placeholder="যেমন: করপোরেট অফিস ক্যান্টিন / ফুড কোর্ট"
                    autoFocus
                    required
                    error={errors.donorType}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.organizationName ? (
                <Select
                  label="প্রতিষ্ঠান বা শাখার নাম (তালিকা থেকে বেছে নিন)"
                  name="organizationName"
                  value={data.organizationName}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("organizationName", true);
                      setFieldValue("organizationName", "");
                    } else {
                      const val = e.target.value;
                      setFieldValue("organizationName", val);
                      if (val.includes("UIU")) {
                        setFieldValue("address", "ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২");
                        setFieldValue("donorType", "cafeteria");
                      } else if (val.includes("BRACU")) {
                        setFieldValue("address", "মেরুল বাড্ডা, ঢাকা-১২১২");
                        setFieldValue("donorType", "cafeteria");
                      } else if (val.includes("ধানমন্ডি")) {
                        setFieldValue("address", "ধানমন্ডি ২৭, ঢাকা-১২০৯");
                        setFieldValue("donorType", "restaurant");
                      } else if (val.includes("মিরপুর")) {
                        setFieldValue("address", "মিরপুর ১০ গোলচত্বর, ঢাকা-১২১৬");
                        setFieldValue("donorType", "restaurant");
                      }
                    }
                  }}
                >
                  <option value="">-- প্রতিষ্ঠান নির্বাচন করুন --</option>
                  <option value="UIU সেন্ট্রাল ক্যাফেটেরিয়া">🏫 UIU সেন্ট্রাল ক্যাফেটেরিয়া (ইউনাইটেড সিটি)</option>
                  <option value="BRACU ক্যাফেটেরিয়া">🏫 BRACU ক্যাফেটেরিয়া (মেরুল বাড্ডা)</option>
                  <option value="AIUB সেন্ট্রাল ক্যান্টিন">🏫 AIUB সেন্ট্রাল ক্যান্টিন (কুড়িল)</option>
                  <option value="সুলতান'স ডাইন (ধানমন্ডি শাখা)">🍽️ সুলতান'স ডাইন (ধানমন্ডি শাখা)</option>
                  <option value="কাচ্চি ভাই (মিরপুর শাখা)">🍽️ কাচ্চি ভাই (মিরপুর শাখা)</option>
                  <option value="গ্র্যান্ড নবাব কনভেনশন সেন্টার">🎪 গ্র্যান্ড নবাব কনভেনশন সেন্টার</option>
                  <option value="সেনা কুঞ্জ মেজবান হল">🎪 সেনা কুঞ্জ কনভেনশন সেন্টার</option>
                  <option value="__custom__">✏️ অন্যান্য প্রতিষ্ঠান (নিজে নাম লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>প্রতিষ্ঠানের নাম ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("organizationName", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="organizationName"
                    value={data.organizationName}
                    onChange={updateField}
                    placeholder="আপনার প্রতিষ্ঠান বা ক্যাফেটেরিয়ার নাম লিখুন"
                    autoFocus
                    leftIcon={<Building2 className="size-5" />}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.address ? (
                <Select
                  label="খাদ্য সংগ্রহের প্রাথমিক পিকআপ এলাকা (এলাকা বেছে নিন)"
                  name="address"
                  value={data.address}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("address", true);
                      setFieldValue("address", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.address}
                >
                  <option value="">-- পিকআপ এলাকা নির্বাচন করুন --</option>
                  <option value="ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২">📍 মাদানী এভিনিউ, বাড্ডা (UIU ক্যাম্পাস সংলগ্ন)</option>
                  <option value="ধানমন্ডি ২৭, ঢাকা-১২০৯">📍 ধানমন্ডি ২৭ ও সংলগ্ন এলাকা</option>
                  <option value="গুলশান ২, ঢাকা-১২১২">📍 গুলশান ২ ও সার্কেল এরিয়া</option>
                  <option value="মিরপুর ১০ গোলচত্বর, ঢাকা-১২১৬">📍 মিরপুর ১০ ও কাজীপাড়া</option>
                  <option value="উত্তরা সেক্টর ৩, ঢাকা-১২৩০">📍 উত্তরা সেক্টর ৩ ও জসিমউদ্দীন মোড়</option>
                  <option value="বনানী ১১ নম্বর রোড, ঢাকা">📍 বনানী ১১ নম্বর ও কামাল আতাতুর্ক</option>
                  <option value="আফতাবনগর প্রধান সড়ক, ঢাকা">📍 আফতাবনগর ও রামপুরা</option>
                  <option value="__custom__">✏️ অন্যান্য এলাকা (নিজের ঠিকানা লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>পিকআপের বিস্তারিত ঠিকানা ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("address", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Textarea
                    name="address"
                    value={data.address}
                    onChange={updateField}
                    placeholder="যেমন: বাড়ি #১২, রোড #৪, বনশ্রী, ঢাকা"
                    autoFocus
                    required
                    error={errors.address}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.notes ? (
                <Select
                  label="উদ্বৃত্ত খাবার প্রস্তুতির সময়সূচি ও নির্দেশিকা (সময় বেছে নিন)"
                  name="notes"
                  value={data.notes}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("notes", true);
                      setFieldValue("notes", "");
                    } else {
                      updateField(e);
                    }
                  }}
                >
                  <option value="">-- সময়সূচি বেছে নিন --</option>
                  <option value="প্রতিদিন দুপুর ৩টায় লাঞ্চের উদ্বৃত্ত খাবার তৈরি থাকে।">☀️ দুপুর ৩টা (লাঞ্চের উদ্বৃত্ত খাবার প্রস্তুত থাকে)</option>
                  <option value="রাত ১০টায় মেজবানি ও ডিনারের তাজা খাবার প্রস্তুত থাকে।">🌙 রাত ১০টা (ডিনার ও মেজবানি উদ্বৃত্ত খাবার প্রস্তুত থাকে)</option>
                  <option value="সন্ধ্যা ৬টা ও মধ্যরাত ১২টায় দিনে ২ বার খাবার হস্তান্তর সম্ভব।">⚡ দিনে ২ বার (বিকাল ও মধ্যরাতে হস্তান্তরের সুযোগ)</option>
                  <option value="জরুরি যে কোনো ইভেন্ট শেষে কল দিয়ে অবগত করা হবে।">📞 জরুরি ইভেন্ট (খাবার তৈরি হলে তাৎক্ষণিক কল দেওয়া হবে)</option>
                  <option value="__custom__">✏️ অন্যান্য সময় ও নির্দেশিকা (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>খাদ্য হ্যান্ডওভার নির্দেশিকা ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("notes", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Textarea
                    name="notes"
                    value={data.notes}
                    onChange={updateField}
                    placeholder="যেমন: কিচেন ম্যানেজারের সাথে সরাসরি যোগাযোগ করুন বা সার্ভিসের সময় লিখুন।"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: NGO Specific Fields */}
        {currentStep === 2 && role === "ngo" && (
          <div className="grid gap-4.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {!customFields.organizationName ? (
                <Select
                  label="সংস্থার প্রাতিষ্ঠানিক নাম (তালিকা থেকে বেছে নিন)"
                  name="organizationName"
                  value={data.organizationName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__custom__") {
                      toggleCustomField("organizationName", true);
                      setFieldValue("organizationName", "");
                      return;
                    }
                    setFieldValue("organizationName", val);
                    if (val.includes("মাস্তুল")) {
                      setFieldValue("address", "বাড়ি #১৪, রোড #৭, ব্লক #সি, বাড্ডা, ঢাকা-১২১২");
                      setFieldValue("registrationNumber", "NGO-GOV-2026-912");
                      setFieldValue("city", "ঢাকা উত্তর সিটি কর্পোরেশন");
                      setFieldValue("beneficiaryType", "shelter");
                      setFieldValue("notes", "দৈনিক ২৫০-৪০০ প্যাকেট তাজা খাবার সংগ্রহ ও নিজস্ব ভ্যান যোগে বিতরণের সক্ষমতা রয়েছে।");
                    } else if (val.includes("বিদ্যানন্দ")) {
                      setFieldValue("address", "বাড়ি #২২, রোড #৪, মিরপুর ১২, ঢাকা-১২১৬");
                      setFieldValue("registrationNumber", "DSW-DHAKA-4820");
                      setFieldValue("city", "ঢাকা উত্তর সিটি কর্পোরেশন");
                      setFieldValue("beneficiaryType", "shelter");
                      setFieldValue("notes", "দৈনিক ৫০০+ প্যাকেট খাবার সংরক্ষণ ও বিতরণ নেটওয়ার্ক সক্রিয় রয়েছে।");
                    } else if (val.includes("আস-সুন্নাহ")) {
                      setFieldValue("address", "সেক্টর #৩, উত্তরা, ঢাকা-১২৩০");
                      setFieldValue("registrationNumber", "BFSA-TEST-REG-09");
                      setFieldValue("city", "ঢাকা উত্তর সিটি কর্পোরেশন");
                      setFieldValue("beneficiaryType", "community");
                      setFieldValue("notes", "দৈনিক ৩০০-৫০০ প্যাকেট খাবার তাৎক্ষণিক বিতরণ করার স্বেচ্ছাসেবক দল প্রস্তুত রয়েছে।");
                    }
                  }}
                  required
                  error={errors.organizationName}
                >
                  <option value="">-- চ্যারিটি সংস্থা বেছে নিন --</option>
                  <option value="মাস্তুল ফাউন্ডেশন (বাড্ডা শাখা)">🏢 মাস্তুল ফাউন্ডেশন (বাড্ডা শাখা)</option>
                  <option value="বিদ্যানন্দ ফাউন্ডেশন (ঢাকা জোন)">🏢 বিদ্যানন্দ ফাউন্ডেশন (ঢাকা জোন)</option>
                  <option value="আস-সুন্নাহ ফাউন্ডেশন (উত্তরা হেডকোয়ার্টার)">🏢 আস-সুন্নাহ ফাউন্ডেশন (উত্তরা হেডকোয়ার্টার)</option>
                  <option value="এক টাকায় আহার প্রকল্প (মিরপুর শাখা)">🏢 এক টাকায় আহার প্রকল্প (মিরপুর শাখা)</option>
                  <option value="__custom__">✏️ অন্যান্য নিবন্ধিত চ্যারিটি (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>সংস্থার প্রাতিষ্ঠানিক নাম ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("organizationName", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="organizationName"
                    value={data.organizationName}
                    onChange={updateField}
                    placeholder="যেমন: আলোকবর্তিকা মানবকল্যাণ সংস্থা"
                    autoFocus
                    required
                    error={errors.organizationName}
                    leftIcon={<Building2 className="size-5" />}
                  />
                </div>
              )}
            </div>

            <div>
              {!customFields.registrationNumber ? (
                <Select
                  label="সরকারি নিবন্ধন বা লাইসেন্স নম্বর (নম্বর বেছে নিন)"
                  name="registrationNumber"
                  value={data.registrationNumber}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("registrationNumber", true);
                      setFieldValue("registrationNumber", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.registrationNumber}
                >
                  <option value="">-- নিবন্ধন নম্বর নির্বাচন করুন --</option>
                  <option value="NGO-GOV-2026-912">📜 NGO-GOV-2026-912 (সমাজসেবা অধিদপ্তর)</option>
                  <option value="DSW-DHAKA-4820">📜 DSW-DHAKA-4820 (এনজিও বিষয়ক ব্যুরো)</option>
                  <option value="BFSA-TEST-REG-09">📜 BFSA-TEST-REG-09 (খাদ্য নিরাপত্তা সনদ)</option>
                  <option value="RJSC-SOC-5521">📜 RJSC-SOC-5521 (যৌথ মূলধনি কোম্পানি)</option>
                  <option value="__custom__">✏️ অন্যান্য নিবন্ধন নম্বর (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>নিবন্ধন বা লাইসেন্স নম্বর লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("registrationNumber", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="registrationNumber"
                    value={data.registrationNumber}
                    onChange={updateField}
                    placeholder="যেমন: DSW-REG-9876 বা NGO-2026-10"
                    autoFocus
                    required
                    error={errors.registrationNumber}
                  />
                </div>
              )}
            </div>

            <div>
              {!customFields.beneficiaryType ? (
                <Select
                  label="প্রধান সুবিধাভোগী শ্রেণি (সুবিধাভোগী বেছে নিন)"
                  name="beneficiaryType"
                  value={data.beneficiaryType}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("beneficiaryType", true);
                      setFieldValue("beneficiaryType", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.beneficiaryType}
                >
                  <option value="">-- সুবিধাভোগী শ্রেণি বেছে নিন --</option>
                  <option value="shelter">পথশিশু ও বস্তিবাসী পরিবার (Shelter)</option>
                  <option value="community">দিনমজুর ও নিম্নআয়ের শ্রমজীবী মানুষ (Daily Wage)</option>
                  <option value="elderly">বৃদ্ধাশ্রম ও বিশেষ চাহিদাসম্পন্ন ব্যক্তি (Elderly)</option>
                  <option value="women">সুবিধাবঞ্চিত নারী ও শিশু পুনর্বাসন (Women & Child)</option>
                  <option value="__custom__">✏️ অন্যান্য সুবিধাভোগী শ্রেণি (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>সুবিধাভোগী শ্রেণি ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("beneficiaryType", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="beneficiaryType"
                    value={data.beneficiaryType}
                    onChange={updateField}
                    placeholder="যেমন: এতিমখানা ও মাদ্রাসার শিক্ষার্থী"
                    autoFocus
                    required
                    error={errors.beneficiaryType}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.city ? (
                <Select
                  label="কার্যনির্বাহী শহর ও অঞ্চল (শহর বেছে নিন)"
                  name="city"
                  value={data.city}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("city", true);
                      setFieldValue("city", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.city}
                >
                  <option value="">-- শহর নির্বাচন করুন --</option>
                  <option value="ঢাকা উত্তর সিটি কর্পোরেশন">ঢাকা উত্তর সিটি কর্পোরেশন (বাড্ডা, উত্তরা, গুলশান, মিরপুর)</option>
                  <option value="ঢাকা দক্ষিণ সিটি কর্পোরেশন">ঢাকা দক্ষিণ সিটি কর্পোরেশন (ধানমন্ডি, মতিঝিল, পুরান ঢাকা)</option>
                  <option value="চট্টগ্রাম সিটি কর্পোরেশন">চট্টগ্রাম সিটি কর্পোরেশন (জিইসি, আগ্রাবাদ, হালিশহর)</option>
                  <option value="সিলেট ও পার্শ্ববর্তী অঞ্চল">সিলেট ও পার্শ্ববর্তী অঞ্চল (জিন্দাবাজার, আম্বরখানা)</option>
                  <option value="__custom__">✏️ অন্যান্য শহর / জেলা (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>শহর বা অঞ্চলের নাম লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("city", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="city"
                    value={data.city}
                    onChange={updateField}
                    placeholder="যেমন: খুলনা সিটি কর্পোরেশন বা রাজশাহী"
                    autoFocus
                    required
                    error={errors.city}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.address ? (
                <Select
                  label="সংস্থার কেন্দ্রীয় কার্যালয়ের ঠিকানা (ঠিকানা বেছে নিন)"
                  name="address"
                  value={data.address}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("address", true);
                      setFieldValue("address", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.address}
                >
                  <option value="">-- কার্যালয়ের ঠিকানা নির্বাচন করুন --</option>
                  <option value="বাড়ি #১৪, রোড #৭, ব্লক #সি, বাড্ডা, ঢাকা-১২১২">📍 বাড়ি #১৪, রোড #৭, ব্লক #সি, বাড্ডা, ঢাকা-১২১২</option>
                  <option value="বাড়ি #২২, রোড #৪, মিরপুর ১২, ঢাকা-১২১৬">📍 বাড়ি #২২, রোড #৪, মিরপুর ১২, ঢাকা-১২১৬</option>
                  <option value="সেক্টর #৩, রোড #৭, উত্তরা, ঢাকা-১২৩০">📍 সেক্টর #৩, রোড #৭, উত্তরা, ঢাকা-১২৩০</option>
                  <option value="বাড়ি #৫২, রোড #৮/এ, ধানমন্ডি, ঢাকা-১২০৯">📍 বাড়ি #৫২, রোড #৮/এ, ধানমন্ডি, ঢাকা-১২০৯</option>
                  <option value="__custom__">✏️ অন্যান্য কার্যালয় ঠিকানা (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>সংস্থার কার্যালয়ের বিস্তারিত ঠিকানা লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("address", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Textarea
                    name="address"
                    value={data.address}
                    onChange={updateField}
                    placeholder="যেমন: বাড়ি #৯, রোড #২, সেক্টর #১০, উত্তরা, ঢাকা"
                    autoFocus
                    required
                    error={errors.address}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.notes ? (
                <Select
                  label="খাদ্য বণ্টন সক্ষমতা ও সংক্ষিপ্ত বিবরণ (সক্ষমতা বেছে নিন)"
                  name="notes"
                  value={data.notes}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("notes", true);
                      setFieldValue("notes", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.notes}
                >
                  <option value="">-- খাদ্য বণ্টন সক্ষমতা বেছে নিন --</option>
                  <option value="দৈনিক ২৫০-৪০০ প্যাকেট তাজা খাবার সংগ্রহ ও নিজস্ব ভ্যান যোগে বিতরণের সক্ষমতা রয়েছে।">📦 দৈনিক ২৫০-৪০০ প্যাকেট (নিজস্ব ভ্যানে বিতরণ সক্ষমতা)</option>
                  <option value="দৈনিক ৫০০+ প্যাকেট খাবার তাৎক্ষণিক বিতরণ করার স্বেচ্ছাসেবক দল প্রস্তুত রয়েছে।">📦 দৈনিক ৫০০+ প্যাকেট (তাৎক্ষণিক বিতরণকারী স্বেচ্ছাসেবক দল)</option>
                  <option value="দৈনিক ১০০-১৫০ প্যাকেট পথশিশু ও বৃদ্ধাশ্রমে বিতরণের সক্ষমতা রয়েছে।">📦 দৈনিক ১০০-১৫০ প্যাকেট (পথশিশু ও আশ্রমে বিতরণ)</option>
                  <option value="জরুরি রাতে মেজবানি উদ্বৃত্ত খাবার আশ্রমে বিতরণের ব্যবস্থা রয়েছে।">🌙 নাইট স্কোয়াড (জরুরি রাতে উদ্বৃত্ত খাবার আশ্রমে বিতরণ)</option>
                  <option value="__custom__">✏️ অন্যান্য সক্ষমতা বিবরণ (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>খাদ্য বণ্টন সক্ষমতার বিবরণ লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("notes", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Textarea
                    name="notes"
                    value={data.notes}
                    onChange={updateField}
                    placeholder="যেমন: আমাদের খাদ্য সংরক্ষণ ফ্রিজার রয়েছে এবং নিজস্ব পরিবহনে ২০০+ প্যাকেট খাবার বিতরণ করতে পারব।"
                    autoFocus
                    required
                    error={errors.notes}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Volunteer Specific Fields */}
        {currentStep === 2 && role === "volunteer" && (
          <div className="grid gap-4.5 sm:grid-cols-2">
            <div>
              {!customFields.city ? (
                <Select
                  label="বসবাসরত শহর ও অঞ্চল (শহর বেছে নিন)"
                  name="city"
                  value={data.city}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("city", true);
                      setFieldValue("city", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.city}
                >
                  <option value="">-- শহর নির্বাচন করুন --</option>
                  <option value="ঢাকা (বাড্ডা ও মাদানী এভিনিউ জোন)">ঢাকা (বাড্ডা ও মাদানী এভিনিউ জোন)</option>
                  <option value="ঢাকা (ধানমন্ডি ও জিগাতলা জোন)">ঢাকা (ধানমন্ডি ও জিগাতলা জোন)</option>
                  <option value="ঢাকা (মিরপুর ও শেওড়াপাড়া জোন)">ঢাকা (মিরপুর ও শেওড়াপাড়া জোন)</option>
                  <option value="ঢাকা (উত্তরা ও বিমানবন্দর জোন)">ঢাকা (উত্তরা ও বিমানবন্দর জোন)</option>
                  <option value="চট্টগ্রাম মেট্রো">চট্টগ্রাম মেট্রো</option>
                  <option value="__custom__">✏️ অন্যান্য শহর / জোন (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>শহর বা জোনের নাম ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("city", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="city"
                    value={data.city}
                    onChange={updateField}
                    placeholder="যেমন: সিলেট সদর বা রাজশাহী"
                    autoFocus
                    required
                    error={errors.city}
                  />
                </div>
              )}
            </div>

            <div>
              {!customFields.transport ? (
                <Select
                  label="ব্যবহৃত পরিবহন মাধ্যম (বাহন বেছে নিন)"
                  name="transport"
                  value={data.transport}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("transport", true);
                      setFieldValue("transport", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.transport}
                >
                  <option value="">-- বাহন নির্বাচন করুন --</option>
                  <option value="bicycle">🚴 বাইসাইকেল (শহুরে শর্ট রুট ও দ্রুত ডেলিভারি)</option>
                  <option value="motorcycle">🏍️ মোটরসাইকেল (দ্রুততম রেসপন্স ও জরুরি উদ্ধার)</option>
                  <option value="walking">🚶 গণপরিবহন / পায়ে হেঁটে নিকটস্থ ডেলিভারি</option>
                  <option value="car">🚗 প্রাইভেট কার / ভ্যান (বড় ব্যাচ খাবার)</option>
                  <option value="__custom__">✏️ অন্যান্য বাহন (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>পরিবহন মাধ্যম ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("transport", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="transport"
                    value={data.transport}
                    onChange={updateField}
                    placeholder="যেমন: ইলেকট্রিক স্কুটার / সিএনজি"
                    autoFocus
                    required
                    error={errors.transport}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.availability ? (
                <Select
                  label="সক্রিয় থাকার সুবিধাজনক সময় (সময় বেছে নিন)"
                  name="availability"
                  value={data.availability}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("availability", true);
                      setFieldValue("availability", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.availability}
                >
                  <option value="">-- সক্রিয় সময় নির্বাচন করুন --</option>
                  <option value="flexible">⚡ ফ্লেক্সিবল (জরুরি অ্যালার্টে যেকোনো সময় সক্রিয়)</option>
                  <option value="evenings">🌙 সন্ধ্যা ও মধ্যরাত (মেজবানি ও অনুষ্ঠানের উদ্বৃত্ত খাবার উদ্ধার)</option>
                  <option value="weekends">📅 ছুটির দিন (শুক্রবার ও শনিবার সারাদিন)</option>
                  <option value="daytime">☀️ দিনের বেলা (বিশ্ববিদ্যালয় ক্যাফেটেরিয়া ও লাঞ্চ খাবার)</option>
                  <option value="__custom__">✏️ অন্যান্য সুবিধাজনক সময় (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>সক্রিয় থাকার সময় ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("availability", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="availability"
                    value={data.availability}
                    onChange={updateField}
                    placeholder="যেমন: প্রতিদিন রাত ৯টা থেকে ১১টা"
                    autoFocus
                    required
                    error={errors.availability}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.address ? (
                <Select
                  label="পছন্দনীয় সার্ভিস এলাকা / লোকাল জোন (এলাকা বেছে নিন)"
                  name="address"
                  value={data.address}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("address", true);
                      setFieldValue("address", "");
                    } else {
                      updateField(e);
                    }
                  }}
                  required
                  error={errors.address}
                >
                  <option value="">-- পছন্দের এলাকা নির্বাচন করুন --</option>
                  <option value="ইউআইইউ ক্যাম্পাস, মাদানী এভিনিউ ও বাড্ডা জোন">📍 ইউআইইউ ক্যাম্পাস, মাদানী এভিনিউ ও বাড্ডা জোন</option>
                  <option value="ধানমন্ডি, শুক্রাবাদ ও জিগাতলা জোন">📍 ধানমন্ডি, শুক্রাবাদ ও জিগাতলা জোন</option>
                  <option value="মিরপুর ১ থেকে ১০ নম্বর গোলচত্বর জোন">📍 মিরপুর ১ থেকে ১০ নম্বর গোলচত্বর জোন</option>
                  <option value="উত্তরা সেক্টর ১ থেকে ৯ জোন">📍 উত্তরা সেক্টর ১ থেকে ৯ জোন</option>
                  <option value="খিলগাঁও, মালিবাগ ও রামপুরা জোন">📍 খিলগাঁও, মালিবাগ ও রামপুরা জোন</option>
                  <option value="__custom__">✏️ অন্যান্য নির্দিষ্ট এলাকা (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>পছন্দের এলাকা ম্যানুয়ালি লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("address", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Textarea
                    name="address"
                    value={data.address}
                    onChange={updateField}
                    placeholder="যেমন: বনশ্রী, রামপুরা ও হাতিরঝিল সংলগ্ন এলাকা"
                    autoFocus
                    required
                    error={errors.address}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              {!customFields.notes ? (
                <Select
                  label="খাদ্য উদ্ধারে আগ্রহ ও অভিজ্ঞতা (অভিজ্ঞতা বেছে নিন)"
                  name="notes"
                  value={data.notes}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      toggleCustomField("notes", true);
                      setFieldValue("notes", "");
                    } else {
                      updateField(e);
                    }
                  }}
                >
                  <option value="">-- অভিজ্ঞতা ও প্রেরণা বেছে নিন --</option>
                  <option value="উদ্বৃত্ত খাবার নষ্ট হওয়া রোধে সুবিধাবঞ্চিত মানুষের পাশে দাঁড়াতে চাই।">উদ্বৃত্ত খাবার নষ্ট হওয়া রোধে সুবিধাবঞ্চিত মানুষের পাশে দাঁড়াতে চাই।</option>
                  <option value="বিশ্ববিদ্যালয় ক্যাম্পাস ও এলাকায় স্বেচ্ছাসেবী কার্যক্রমে যুক্ত থাকার পূর্ব অভিজ্ঞতা রয়েছে।">বিশ্ববিদ্যালয় ক্যাম্পাস ও এলাকায় স্বেচ্ছাসেবী কার্যক্রমে যুক্ত থাকার পূর্ব অভিজ্ঞতা রয়েছে।</option>
                  <option value="জরুরি ফুড রেসকিউ অ্যালার্টে বাইসাইকেল নিয়ে ৩০ মিনিটের মধ্যে খাবার পৌঁছে দিতে পারব।">জরুরি ফুড রেসকিউ অ্যালার্টে বাইসাইকেল নিয়ে ৩০ মিনিটের মধ্যে খাবার পৌঁছে দিতে পারব।</option>
                  <option value="__custom__">✏️ অন্যান্য প্রেরণা বা অভিজ্ঞতা (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>আপনার অভিজ্ঞতা ও প্রেরণা সংক্ষেপে লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("notes", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Textarea
                    name="notes"
                    value={data.notes}
                    onChange={updateField}
                    placeholder="যেমন: স্কাউটিং এবং রেড ক্রিসেন্টে ২ বছরের সেবামূলক কাজের অভিজ্ঞতা রয়েছে।"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Verification & Legal */}
        {currentStep === 3 && (
          <div className="grid gap-5">
            {/* Verification Document Selector Dropdown */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              {!customFields.documentSelector ? (
                <Select
                  label="যাচাইকরণ সনদের ধরন বেছে নিন (Select Verification Document)"
                  name="documentSelector"
                  value={documentName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__custom__") {
                      toggleCustomField("documentSelector", true);
                      setDocumentName("");
                      clearError("document");
                    } else {
                      setDocumentName(val);
                      clearError("document");
                    }
                  }}
                  required={role !== "donor"}
                  error={errors.document}
                >
                  <option value="">-- ড্রপডাউন থেকে সনদ নির্বাচন করুন --</option>
                  <option value="Govt_NGO_Bureau_License_2026.pdf">📄 সরকারি এনজিও বিষয়ক ব্যুরো সনদ (Govt_NGO_Bureau_License_2026.pdf)</option>
                  <option value="BFSA_Food_Safety_Cert_2026.pdf">📄 বাংলাদেশ খাদ্য নিরাপত্তা কর্তৃপক্ষ (BFSA) নিবন্ধন সনদ</option>
                  <option value="UIU_Student_ID_Verified.jpg">📄 জাতীয় পরিচয়পত্র / বিশ্ববিদ্যালয় স্টুডেন্ট আইডি কার্ড (NID_ID_Scan.jpg)</option>
                  <option value="Trade_License_Food_2026.pdf">📄 প্রাতিষ্ঠানিক ট্রেড লাইসেন্স ও ক্যাটারিং পারমিট</option>
                  <option value="__custom__">✏️ অন্য কোনো সনদের নাম (নিজে লিখব)</option>
                </Select>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>সনদ বা ডকুমেন্টের নাম লিখুন:</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomField("documentSelector", false)}
                      className="text-emerald-700 hover:text-emerald-800 underline font-bold cursor-pointer text-[11px]"
                    >
                      ← ড্রপডাউন তালিকা দেখুন
                    </button>
                  </div>
                  <Input
                    name="documentSelector"
                    value={documentName}
                    onChange={(e) => {
                      setDocumentName(e.target.value);
                      clearError("document");
                    }}
                    placeholder="যেমন: Bangladesh_Red_Crescent_ID.pdf বা NID_Card_Copy.pdf"
                    autoFocus
                    required={role !== "donor"}
                    error={errors.document}
                  />
                </div>
              )}
              {documentName && (
                <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <BadgeCheck className="size-4 text-emerald-600" />
                  <span>সনদ সংযুক্ত হয়েছে: {documentName}</span>
                </div>
              )}
            </div>

            <FileUpload
              label="অথবা আপনার ডিভাইস থেকে নতুন ফাইল আপলোড করুন (ঐচ্ছিক)"
              name="verificationDocument"
              accept=".pdf,.jpg,.jpeg,.png"
              error={errors.document}
              fileNames={documentName ? [documentName] : []}
              onFilesChange={(files) => {
                setDocumentName(files[0]?.name ?? "");
                clearError("document");
              }}
              buttonText="ফাইল নির্বাচন করুন বা ড্রপ করুন"
              hint="পিডিএফ, জেপিজি বা পিএনজি ফরম্যাট। সর্বোচ্চ সাইজ ৫ মেগাবাইট।"
            />

            <Alert
              tone="warning"
              title="যাচাইকরণ নীতিমালা"
              description={verificationNotice}
            />

            <div
              onClick={() => {
                setTermsAccepted((prev) => !prev);
                clearError("terms");
              }}
              className={cn(
                "rounded-2xl border p-4 cursor-pointer transition-colors",
                termsAccepted
                  ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-500/20"
                  : "bg-slate-50/60 border-slate-200/90 hover:bg-slate-100/60"
              )}
            >
              <Checkbox
                name="terms"
                checked={termsAccepted}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked);
                  clearError("terms");
                }}
                required
                error={errors.terms}
                label="আমি ShareBite খাদ্য নিরাপত্তা নীতিমালা (BFSA স্ট্যান্ডার্ড), প্ল্যাটফর্মের শর্তাবলী ও সত্যতা ঘোষণা মেনে নিচ্ছি।"
                description="আমি নিশ্চিত করছি যে খাবার হস্তান্তর ও বিতরণের সময় স্বাস্থ্যবিধি সম্পূর্ণ মানা হবে এবং ভুল বা অসত্য তথ্যের জন্য যেকোনো আইনি দায়ভার বর্তাবে।"
              />
            </div>
          </div>
        )}

        {/* Form Navigation Controls */}
        <div className="mt-4 flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:justify-between sm:items-center">
          {currentStep > 1 ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              leftIcon={<ArrowLeft className="size-4" />}
              onClick={goBack}
            >
              পূর্ববর্তী ধাপ
            </Button>
          ) : (
            <ButtonLink
              href={ROUTES.auth.login}
              size="lg"
              variant="ghost"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              লগইন পেজে যান
            </ButtonLink>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              size="lg"
              rightIcon={<ArrowRight className="size-4" />}
              onClick={goNext}
            >
              পরবর্তী ধাপ ({currentStep === 1 ? "বিবরণ" : "ভেরিফিকেশন"})
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
              rightIcon={<CheckCircle2 className="size-4" />}
            >
              {isSubmitting ? "নিবন্ধন সম্পন্ন হচ্ছে..." : "আবেদন সম্পূর্ণ করুন (সাবমিট)"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}