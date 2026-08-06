"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  INITIAL_REGISTRATION_DATA,
  type RegistrationData,
  type RegistrationErrorKey,
  type RegistrationErrors,
  type RegistrationRole,
} from "@/features/auth/types";
import { hasErrors, validateRegistrationStep } from "@/features/auth/validation";
import { USER_ROLE_META, UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";

const steps = [
  { label: "Account" },
  { label: "Details" },
  { label: "Verification" },
  { label: "Complete" },
];

const roleLabels: Record<RegistrationRole, string> = {
  donor: USER_ROLE_META[UserRole.DONOR].label,
  ngo: USER_ROLE_META[UserRole.NGO].label,
  volunteer: USER_ROLE_META[UserRole.VOLUNTEER].label,
};

const roleDescriptions: Record<RegistrationRole, string> = {
  donor: "Post surplus food, coordinate handovers, and track your contribution.",
  ngo: "Register an organization and authorized contact to prepare for verification.",
  volunteer: "Share your service area, availability, transport, and identity document.",
};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role");
  const role: RegistrationRole = rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "donor";
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(INITIAL_REGISTRATION_DATA);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const verificationCopy = useMemo(() => {
    if (role === "ngo") return "Organization registration proof is required in this demo flow. The submitted NGO remains pending until a backend administrator reviews it.";
    if (role === "volunteer") return "An identity document is required in this demo flow. The submitted volunteer remains pending until a backend administrator reviews it.";
    return "A supporting document is optional for donors. Backend identity and food-safety controls will be added in a later phase.";
  }, [role]);

  function clearError(key: RegistrationErrorKey) {
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    clearError(name as RegistrationErrorKey);
  }

  function revealFirstError(nextErrors: RegistrationErrors) {
    setErrors(nextErrors);
    window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  function validateCurrentStep() {
    const nextErrors = validateRegistrationStep({ step: currentStep, role, data, termsAccepted, documentName });
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    setCurrentStep(4);
  }

  if (currentStep === 4) {
    const needsReview = role === "ngo" || role === "volunteer";
    return (
      <div className="text-center">
        <AuthProgress steps={steps} current={4} />
        <span className="mx-auto mt-9 grid size-20 place-items-center rounded-full bg-brand-600 text-white shadow-float">
          <CheckCircle2 className="size-10" />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-accent-600">Registration captured</p>
        <h1 className="mt-3 text-3xl font-black text-brand-900 sm:text-4xl">Frontend flow complete</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-600 sm:text-base">
          Your {roleLabels[role].toLowerCase()} registration was captured only in this page. No account, password, or document was sent to a server.
        </p>
        <div className="mx-auto mt-7 max-w-md rounded-3xl border border-brand-100 bg-brand-50 p-5 text-left">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 size-6 shrink-0 text-brand-700" />
            <div>
              <p className="font-black text-brand-800">{needsReview ? "Verification pending" : "Demo profile ready"}</p>
              <p className="mt-1 text-sm leading-6 text-muted-600">
                {needsReview
                  ? "Approval remains pending until a future backend review. Use a demo account to preview role-based navigation."
                  : "Use the donor demo account to preview role-based navigation. Real account creation comes with backend integration."}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href={ROUTES.auth.login} size="lg" rightIcon={<ArrowRight className="size-5" />}>Continue to login</ButtonLink>
          <ButtonLink href={ROUTES.auth.roleSelection} size="lg" variant="outline">Register another role</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthProgress steps={steps} current={currentStep} />

      <div className="mt-7 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-600">{roleLabels[role]}</p>
          <h1 className="mt-2 text-3xl font-black text-brand-900 sm:text-4xl">
            {currentStep === 1 ? "Create your account" : currentStep === 2 ? "Tell us the details" : "Verify and finish"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-600">{roleDescriptions[role]}</p>
        </div>
        <Link href={ROUTES.auth.roleSelection} className="shrink-0 text-sm font-black text-brand-700 hover:text-brand-800">Change role</Link>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 grid gap-5">
        {hasErrors(errors) && <Alert tone="danger" title="Check the highlighted fields" description="Correct the details below before continuing." />}

        {currentStep === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={role === "ngo" ? "Authorized contact name" : "Full name"}
              name="fullName"
              value={data.fullName}
              onChange={updateField}
              required
              error={errors.fullName}
              placeholder={role === "ngo" ? "Enter the authorized contact" : "Enter your full name"}
              autoComplete="name"
              leftIcon={<UserRound className="size-5" />}
              containerClassName="sm:col-span-2"
            />
            <Input label="Email address" name="email" type="email" value={data.email} onChange={updateField} required error={errors.email} placeholder="you@example.com" autoComplete="email" leftIcon={<Mail className="size-5" />} />
            <Input label="Bangladesh phone number" name="phone" type="tel" value={data.phone} onChange={updateField} required error={errors.phone} placeholder="+880 1XXXXXXXXX" autoComplete="tel" leftIcon={<Phone className="size-5" />} />
            <PasswordInput label="Password" name="password" value={data.password} onChange={updateField} error={errors.password} hint="At least 8 characters with a letter and number." placeholder="Create a password" autoComplete="new-password" />
            <PasswordInput label="Confirm password" name="confirmPassword" value={data.confirmPassword} onChange={updateField} error={errors.confirmPassword} placeholder="Repeat your password" autoComplete="new-password" />
            <Alert
              className="sm:col-span-2"
              tone="info"
              title="Frontend privacy boundary"
              description="This phase validates fields in the browser only. Submitted passwords and documents are not uploaded or treated as real accounts."
            />
          </div>
        )}

        {currentStep === 2 && role === "donor" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Donor type" name="donorType" value={data.donorType} onChange={updateField} required error={errors.donorType}>
              <option value="individual">Individual donor</option>
              <option value="cafeteria">Cafeteria / Restaurant</option>
              <option value="bakery">Bakery / Food shop</option>
              <option value="event">Event organizer</option>
            </Select>
            <Input label="Organization name (optional)" name="organizationName" value={data.organizationName} onChange={updateField} placeholder="UIU Cafeteria" leftIcon={<Building2 className="size-5" />} />
            <Textarea label="Primary pickup address" name="address" value={data.address} onChange={updateField} required error={errors.address} placeholder="Enter the address used for food pickup" containerClassName="sm:col-span-2" />
            <Textarea label="Additional notes (optional)" name="notes" value={data.notes} onChange={updateField} placeholder="Operating hours, entrance instructions, or other details" containerClassName="sm:col-span-2" />
          </div>
        )}

        {currentStep === 2 && role === "ngo" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Organization name" name="organizationName" value={data.organizationName} onChange={updateField} required error={errors.organizationName} placeholder="Hope Foundation" leftIcon={<Building2 className="size-5" />} />
            <Input label="Registration or licence number" name="registrationNumber" value={data.registrationNumber} onChange={updateField} required error={errors.registrationNumber} placeholder="NGO registration ID" leftIcon={<FileCheck2 className="size-5" />} />
            <Select label="Primary beneficiary group" name="beneficiaryType" value={data.beneficiaryType} onChange={updateField} required error={errors.beneficiaryType}>
              <option value="shelter">Shelter / Orphanage</option>
              <option value="community">Community center</option>
              <option value="elderly">Elderly support</option>
              <option value="women">Women and families</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Operating city" name="city" value={data.city} onChange={updateField} required error={errors.city} placeholder="Dhaka" leftIcon={<MapPin className="size-5" />} />
            <Textarea label="Organization address" name="address" value={data.address} onChange={updateField} required error={errors.address} placeholder="Enter the organization address" containerClassName="sm:col-span-2" />
            <Textarea label="Organization and distribution capacity" name="notes" value={data.notes} onChange={updateField} required error={errors.notes} placeholder="Briefly describe your work and distribution capacity" containerClassName="sm:col-span-2" />
          </div>
        )}

        {currentStep === 2 && role === "volunteer" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="City" name="city" value={data.city} onChange={updateField} required error={errors.city} placeholder="Dhaka" leftIcon={<MapPin className="size-5" />} />
            <Select label="Transport method" name="transport" value={data.transport} onChange={updateField} required error={errors.transport}>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="walking">Walking / Public transport</option>
            </Select>
            <Select label="General availability" name="availability" value={data.availability} onChange={updateField} required error={errors.availability}>
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="daytime">Daytime</option>
              <option value="flexible">Flexible</option>
            </Select>
            <Input label="Preferred service area" name="address" value={data.address} onChange={updateField} required error={errors.address} placeholder="Badda, Gulshan, Dhanmondi..." leftIcon={<MapPin className="size-5" />} />
            <Textarea label="Why do you want to volunteer? (optional)" name="notes" value={data.notes} onChange={updateField} placeholder="Tell us briefly about your motivation" containerClassName="sm:col-span-2" />
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-5">
            <FileUpload
              label={role === "ngo" ? "Organization verification document" : role === "volunteer" ? "Identity verification document" : "Supporting document (optional)"}
              name="verificationDocument"
              accept=".pdf,.jpg,.jpeg,.png"
              required={role !== "donor"}
              error={errors.document}
              fileNames={documentName ? [documentName] : []}
              onFilesChange={(files) => {
                setDocumentName(files[0]?.name ?? "");
                clearError("document");
              }}
              hint="PDF, JPG, or PNG. Maximum 5 MB. The file remains in this browser demo and is not uploaded."
            />

            <Alert tone="warning" title="Verification boundary" description={verificationCopy} />

            <Checkbox
              name="terms"
              checked={termsAccepted}
              onChange={(event) => {
                setTermsAccepted(event.target.checked);
                clearError("terms");
              }}
              required
              error={errors.terms}
              label="I accept the Terms & Conditions, Privacy Policy, and truthful-use declaration."
              description="This checkbox completes the frontend demo only; legal consent storage will require backend integration."
            />
          </div>
        )}

        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
          {currentStep > 1 ? (
            <Button type="button" size="lg" variant="outline" leftIcon={<ArrowLeft className="size-5" />} onClick={goBack}>
              Back
            </Button>
          ) : (
            <ButtonLink href={ROUTES.auth.roleSelection} size="lg" variant="ghost" leftIcon={<ArrowLeft className="size-5" />}>Role selection</ButtonLink>
          )}

          {currentStep < 3 ? (
            <Button type="button" size="lg" rightIcon={<ArrowRight className="size-5" />} onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" size="lg" rightIcon={<ArrowRight className="size-5" />}>
              Submit registration
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
