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

  function applyDemoPreset(targetRole: RegistrationRole = role) {
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
            : "সিস্টেমে স্বচ্ছতা ও জবাবদিহিতা নিশ্চিত করতে তথ্যসমূহ যাচাই করা হবে।"}
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
            {/* 1-Tap Role Switcher Tabs */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 font-heading">
                <span>১. ভূমিকা নির্বাচন করুন (Choose Role):</span>
                <span className="text-emerald-700 font-extrabold">{activeMeta.badge}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => { setRole("donor"); setErrors({}); }}
                  className={cn(
                    "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all touch-manipulation cursor-pointer",
                    role === "donor"
                      ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-600/30 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Utensils className="size-3.5 text-emerald-600" />
                  <span>👨‍🍳 ডোনার</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("ngo"); setErrors({}); }}
                  className={cn(
                    "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all touch-manipulation cursor-pointer",
                    role === "ngo"
                      ? "bg-white text-teal-800 shadow-sm ring-1 ring-teal-600/30 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <HeartHandshake className="size-3.5 text-teal-600" />
                  <span>🏢 এনজিও</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("volunteer"); setErrors({}); }}
                  className={cn(
                    "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all touch-manipulation cursor-pointer",
                    role === "volunteer"
                      ? "bg-white text-amber-800 shadow-sm ring-1 ring-amber-600/30 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Truck className="size-3.5 text-amber-600" />
                  <span>🚴 ভলান্টিয়ার</span>
                </button>
              </div>
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
            <div>
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
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400 font-bold">ডেমো নম্বর:</span>
                {["01712345678", "01812345678", "01912345678"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFieldValue("phone", num)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Quick Demo Password Setter */}
            <div className="sm:col-span-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setFieldValue("password", "Demo1234");
                  setFieldValue("confirmPassword", "Demo1234");
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>🔑 ডেমো পাসওয়ার্ড বসান (Demo1234)</span>
              </button>
            </div>

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
            <div className="sm:col-span-2 space-y-1.5">
              <Select
                label="দাতার ধরন নির্বাচন করুন"
                name="donorType"
                value={data.donorType}
                onChange={updateField}
                required
                error={errors.donorType}
              >
                <option value="">-- ধরন নির্বাচন করুন --</option>
                <option value="cafeteria">বিশ্ববিদ্যালয় ক্যাফেটেরিয়া (UIU, BRACU, AIUB)</option>
                <option value="restaurant">বাণিজ্যিক রেস্তোরাঁ ও ক্যাফে</option>
                <option value="event">কমিউনিটি সেন্টার ও বিয়ের মেজবান</option>
                <option value="bakery">বেকারি ও পেস্ট্রি শপ</option>
                <option value="individual">ব্যক্তিগত বা পারিবারিক আয়োজন</option>
              </Select>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: "cafeteria", label: "🏫 ক্যাফেটেরিয়া" },
                  { id: "restaurant", label: "🍽️ রেস্তোরাঁ" },
                  { id: "event", label: "🎪 মেজবান/ইভেন্ট" },
                  { id: "bakery", label: "🥐 বেকারি" },
                  { id: "individual", label: "🏠 ব্যক্তিগত" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFieldValue("donorType", item.id)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer touch-manipulation",
                      data.donorType === item.id
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Input
                label="প্রতিষ্ঠান বা শাখার নাম (ঐচ্ছিক)"
                name="organizationName"
                value={data.organizationName}
                onChange={updateField}
                placeholder="যেমন: UIU সেন্ট্রাল ক্যাফেটেরিয়া / ধানমন্ডি লাউঞ্জ"
                leftIcon={<Building2 className="size-5" />}
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">জনপ্রিয় প্রতিষ্ঠান প্রিসেট:</span>
                {[
                  "UIU সেন্ট্রাল ক্যাফেটেরিয়া",
                  "BRACU ক্যাফেটেরিয়া",
                  "সুলতান'স ডাইন",
                  "কাচ্চি ভাই",
                  "গ্র্যান্ড নবাব কনভেনশন",
                ].map((org) => (
                  <button
                    key={org}
                    type="button"
                    onClick={() => setFieldValue("organizationName", org)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    {org}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Textarea
                label="খাদ্য সংগ্রহের প্রাথমিক পিকআপ ঠিকানা"
                name="address"
                value={data.address}
                onChange={updateField}
                required
                error={errors.address}
                placeholder="যেমন: ইউনাইটেড সিটি, মাদানী এভিনিউ, ১০০ ফিট রোড, বাড্ডা, ঢাকা-১২১২"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">এলাকা প্রিসেট:</span>
                {[
                  "ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২",
                  "ধানমন্ডি ২৭, ঢাকা",
                  "গুলশান ২, ঢাকা-১২১২",
                  "মিরপুর ১০ গোলচত্বর, ঢাকা",
                  "উত্তরা সেক্টর ৩, ঢাকা",
                ].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setFieldValue("address", loc)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    📍 {loc.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Textarea
                label="অতিরিক্ত হ্যান্ডওভার নির্দেশিকা (ঐচ্ছিক)"
                name="notes"
                value={data.notes}
                onChange={updateField}
                placeholder="যেমন: ভবনের সার্ভিস লিফট ব্যবহার করতে হবে বা কিচেন ম্যানেজারকে কল দিতে হবে।"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">পরামর্শিত নোট:</span>
                {[
                  "প্রতিদিন দুপুর ৩টায় লাঞ্চের উদ্বৃত্ত খাবার তৈরি থাকে।",
                  "রাত ১০টায় মেজবানি তাজা খাবার পিকআপ করতে হবে।",
                  "কিচেন ম্যানেজারের সাথে সরাসরি যোগাযোগ করুন।",
                ].map((nt) => (
                  <button
                    key={nt}
                    type="button"
                    onClick={() => setFieldValue("notes", nt)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {nt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: NGO Specific Fields */}
        {currentStep === 2 && role === "ngo" && (
          <div className="grid gap-4.5 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Input
                label="সংস্থার প্রাতিষ্ঠানিক নাম"
                name="organizationName"
                value={data.organizationName}
                onChange={updateField}
                required
                error={errors.organizationName}
                placeholder="যেমন: মাস্তুল ফাউন্ডেশন / বিদ্যানন্দ চ্যারিটি"
                leftIcon={<Building2 className="size-5" />}
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">পরিচিত সংস্থা:</span>
                {[
                  "মাস্তুল ফাউন্ডেশন (বাড্ডা শাখা)",
                  "বিদ্যানন্দ ফাউন্ডেশন (ঢাকা জোন)",
                  "আস-সুন্নাহ ফাউন্ডেশন",
                  "এক টাকায় আহার প্রকল্প",
                ].map((org) => (
                  <button
                    key={org}
                    type="button"
                    onClick={() => setFieldValue("organizationName", org)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors cursor-pointer"
                  >
                    {org}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Input
                label="সরকারি নিবন্ধন বা লাইসেন্স নম্বর"
                name="registrationNumber"
                value={data.registrationNumber}
                onChange={updateField}
                required
                error={errors.registrationNumber}
                placeholder="যেমন: সমাজসেবা নং- ৪২১০/২০১৯"
                leftIcon={<FileCheck2 className="size-5" />}
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400 font-bold">টেস্ট লাইসেন্স:</span>
                {["NGO-GOV-2026-912", "DSW-DHAKA-4820", "BFSA-TEST-09"].map((lic) => (
                  <button
                    key={lic}
                    type="button"
                    onClick={() => setFieldValue("registrationNumber", lic)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-mono transition-colors cursor-pointer"
                  >
                    📜 {lic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Select
                label="প্রধান সুবিধাভোগী শ্রেণি"
                name="beneficiaryType"
                value={data.beneficiaryType}
                onChange={updateField}
                required
                error={errors.beneficiaryType}
              >
                <option value="">-- সুবিধাভোগী শ্রেণি বেছে নিন --</option>
                <option value="shelter">পথশিশু ও বস্তিবাসী পরিবার</option>
                <option value="community">দিনমজুর ও নিম্নআয়ের শ্রমজীবী মানুষ</option>
                <option value="elderly">বৃদ্ধাশ্রম ও বিশেষ চাহিদাসম্পন্ন ব্যক্তি</option>
                <option value="women">সুবিধাবঞ্চিত নারী ও শিশু পুনর্বাসন</option>
                <option value="other">অন্যান্য চ্যারিটি খাদ্য কর্মসূচি</option>
              </Select>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  { id: "shelter", label: "👶 পথশিশু ও বস্তিবাসী" },
                  { id: "community", label: "🛠️ দিনমজুর ও শ্রমজীবী" },
                  { id: "elderly", label: "👵 বৃদ্ধাশ্রম" },
                  { id: "women", label: "👩 নারী ও শিশু" },
                ].map((ben) => (
                  <button
                    key={ben.id}
                    type="button"
                    onClick={() => setFieldValue("beneficiaryType", ben.id)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-md font-bold border transition-all cursor-pointer",
                      data.beneficiaryType === ben.id
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {ben.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="কার্যনির্বাহী শহর ও অঞ্চল"
                name="city"
                value={data.city}
                onChange={updateField}
                required
                error={errors.city}
                placeholder="যেমন: ঢাকা (উত্তর ও দক্ষিণ সিটি কর্পোরেশন)"
                leftIcon={<MapPin className="size-5" />}
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400 font-bold">শহর:</span>
                {["ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী"].map((cty) => (
                  <button
                    key={cty}
                    type="button"
                    onClick={() => setFieldValue("city", cty)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {cty}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Textarea
                label="সংস্থার কেন্দ্রীয় কার্যালয়ের ঠিকানা"
                name="address"
                value={data.address}
                onChange={updateField}
                required
                error={errors.address}
                placeholder="যেমন: বাড়ি #১৪, রোড #৭, সেক্টর #৩, উত্তরা, ঢাকা"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">ঠিকানা প্রিসেট:</span>
                {[
                  "বাড়ি #১৪, রোড #৭, ব্লক #সি, বাড্ডা, ঢাকা",
                  "বাড়ি #২২, রোড #৪, মিরপুর ১২, ঢাকা",
                  "রোড #৮/এ, ধানমন্ডি, ঢাকা",
                ].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setFieldValue("address", loc)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    📍 {loc.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Textarea
                label="খাদ্য বণ্টন সক্ষমতা ও সংক্ষিপ্ত বিবরণ"
                name="notes"
                value={data.notes}
                onChange={updateField}
                required
                error={errors.notes}
                placeholder="যেমন: দৈনিক ২৫০-৪০০ প্যাকেট তাজা খাবার সংগ্রহ ও নিজস্ব ভ্যান যোগে বিতরণের সক্ষমতা রয়েছে।"
              />
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">সক্ষমতা প্রিসেট:</span>
                {[
                  "দৈনিক ২৫০-৪০০ প্যাকেট তাজা খাবার সংগ্রহ ও নিজস্ব ভ্যান যোগে বিতরণের সক্ষমতা রয়েছে।",
                  "দৈনিক ৫০০+ প্যাকেট খাবার তাৎক্ষণিক বিতরণ করার স্বেচ্ছাসেবক দল প্রস্তুত রয়েছে।",
                ].map((nt) => (
                  <button
                    key={nt}
                    type="button"
                    onClick={() => setFieldValue("notes", nt)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer text-left"
                  >
                    {nt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Volunteer Specific Fields */}
        {currentStep === 2 && role === "volunteer" && (
          <div className="grid gap-4.5 sm:grid-cols-2">
            <div>
              <Input
                label="আপনার বসবাসরত শহর"
                name="city"
                value={data.city}
                onChange={updateField}
                required
                error={errors.city}
                placeholder="যেমন: ঢাকা"
                leftIcon={<MapPin className="size-5" />}
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400 font-bold">শহর:</span>
                {["ঢাকা", "চট্টগ্রাম", "সিলেট"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFieldValue("city", c)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Select
                label="ব্যবহৃত পরিবহন মাধ্যম"
                name="transport"
                value={data.transport}
                onChange={updateField}
                required
                error={errors.transport}
              >
                <option value="">-- বাহন নির্বাচন করুন --</option>
                <option value="bicycle">বাইসাইকেল (শহুরে শর্ট রুটের জন্য উপযুক্ত)</option>
                <option value="motorcycle">মোটরসাইকেল (দ্রুততম রেসপন্স ও জরুরি উদ্ধার)</option>
                <option value="walking">গণপরিবহন / পায়ে হেঁটে নিকটস্থ ডেলিভারি</option>
                <option value="car">প্রাইভেট কার / ভ্যান</option>
              </Select>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  { id: "bicycle", label: "🚴 বাইসাইকেল" },
                  { id: "motorcycle", label: "🏍️ বাইক" },
                  { id: "walking", label: "🚶 পায়ে হেঁটে" },
                  { id: "car", label: "🚗 কার/ভ্যান" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFieldValue("transport", t.id)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-md font-bold border transition-all cursor-pointer",
                      data.transport === t.id
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Select
                label="সক্রিয় থাকার সুবিধাজনক সময়"
                name="availability"
                value={data.availability}
                onChange={updateField}
                required
                error={errors.availability}
              >
                <option value="">-- সক্রিয় সময় নির্বাচন করুন --</option>
                <option value="flexible">ফ্লেক্সিবল (জরুরি অ্যালার্টে যেকোনো সময়)</option>
                <option value="evenings">সন্ধ্যা ও মধ্যরাত (মেজবানি খাবার উদ্ধার)</option>
                <option value="weekends">ছুটির দিন (শুক্রবার ও শনিবার)</option>
                <option value="daytime">দিনের বেলা (ক্যাফেটেরিয়া ও লাঞ্চ)</option>
              </Select>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  { id: "flexible", label: "⚡ যেকোনো সময়" },
                  { id: "evenings", label: "🌙 সন্ধ্যা/মধ্যরাত" },
                  { id: "weekends", label: "📅 ছুটির দিন" },
                  { id: "daytime", label: "☀️ দিনের বেলা" },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setFieldValue("availability", a.id)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-md font-bold border transition-all cursor-pointer",
                      data.availability === a.id
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Input
                label="পছন্দনীয় সার্ভিস এলাকা / লোকাল জোন"
                name="address"
                value={data.address}
                onChange={updateField}
                required
                error={errors.address}
                placeholder="যেমন: বাড্ডা, রামপুরা, আফতাবনগর ও নতুনবাজার জোন"
                leftIcon={<MapPin className="size-5" />}
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">এলাকা প্রিসেট:</span>
                {[
                  "UIU ক্যাম্পাস, মাদানী এভিনিউ ও বাড্ডা জোন",
                  "ধানমন্ডি, শুক্রাবাদ ও জিগাতলা",
                  "মিরপুর ১ থেকে ১০ নম্বর জোন",
                  "উত্তরা সেক্টর ১-৯",
                ].map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setFieldValue("address", area)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    📍 {area.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Textarea
                label="খাদ্য উদ্ধারে আগ্রহের কারণ ও পূর্ব অভিজ্ঞতা (ঐচ্ছিক)"
                name="notes"
                value={data.notes}
                onChange={updateField}
                placeholder="কেন ShareBite ভলান্টিয়ার স্কোয়াডে যোগ দিতে চান? সংক্ষেপে লিখুন।"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold">পরামর্শিত নোট:</span>
                {[
                  "উদ্বৃত্ত খাবার নষ্ট হওয়া রোধে সুবিধাবঞ্চিত মানুষের পাশে দাঁড়াতে চাই।",
                  "ক্যাম্পাস ও এলাকায় স্বেচ্ছাসেবী কার্যক্রমে যুক্ত থাকার পূর্ব অভিজ্ঞতা রয়েছে।",
                ].map((nt) => (
                  <button
                    key={nt}
                    type="button"
                    onClick={() => setFieldValue("notes", nt)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer text-left"
                  >
                    {nt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Verification & Legal */}
        {currentStep === 3 && (
          <div className="grid gap-5">
            {/* Quick 1-Tap Sample Document Attachment Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-xl bg-amber-600 text-white shadow-2xs">
                  <FileCheck2 className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-amber-950 font-heading">ফোনে ফাইল বা পিডিএফ নেই?</p>
                  <p className="text-[11px] text-amber-800">টেস্টিংয়ের জন্য ১-ক্লিকে নমুনা সনদ যুক্ত করে এগিয়ে যান</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDocumentName(
                    role === "ngo"
                      ? "Govt_NGO_Bureau_License_2026.pdf"
                      : role === "volunteer"
                      ? "UIU_Student_ID_Verified.jpg"
                      : "BFSA_Food_Safety_Cert_2026.pdf"
                  );
                  clearError("document");
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer touch-manipulation whitespace-nowrap shadow-2xs font-heading"
              >
                📄 ১-ক্লিকে নমুনা সনদ যুক্ত করুন
              </button>
            </div>

            <FileUpload
              label={
                role === "ngo"
                  ? "সংস্থার সরকারি নিবন্ধন কপি বা সনদ (বাধ্যতামূলক)"
                  : role === "volunteer"
                  ? "জাতীয় পরিচয়পত্র (NID) বা স্টুডেন্ট আইডি (বাধ্যতামূলক)"
                  : "বাণিজ্য লাইসেন্স বা প্রাতিষ্ঠানিক পরিচয়পত্র (ঐচ্ছিক)"
              }
              name="verificationDocument"
              accept=".pdf,.jpg,.jpeg,.png"
              required={role !== "donor"}
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