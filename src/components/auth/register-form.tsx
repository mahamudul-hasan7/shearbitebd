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
  ShieldCheck,
  UploadCloud,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AuthProgress } from "@/components/auth/auth-progress";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { label: "Account" },
  { label: "Details" },
  { label: "Verification" },
  { label: "Complete" },
];

type Role = "donor" | "ngo" | "volunteer";

const roleLabels: Record<Role, string> = {
  donor: "Food Donor",
  ngo: "NGO / Organization",
  volunteer: "Volunteer",
};

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  donorType: string;
  organizationName: string;
  registrationNumber: string;
  beneficiaryType: string;
  address: string;
  city: string;
  transport: string;
  availability: string;
  notes: string;
}

const initialData: RegistrationData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  donorType: "individual",
  organizationName: "",
  registrationNumber: "",
  beneficiaryType: "shelter",
  address: "",
  city: "Dhaka",
  transport: "bicycle",
  availability: "weekends",
  notes: "",
};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role");
  const role: Role = rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "donor";
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(initialData);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const description = useMemo(() => {
    if (role === "ngo") return "Create a verified organization account to claim, receive, and distribute rescued food.";
    if (role === "volunteer") return "Join nearby pickup and delivery tasks after identity verification.";
    return "Post surplus food, coordinate handovers, and track your contribution.";
  }, [role]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
  }

  function goNext() {
    if (!formRef.current?.reportValidity()) return;
    if (currentStep === 1 && data.password !== data.confirmPassword) {
      window.alert("Passwords do not match.");
      return;
    }
    setCurrentStep((step) => Math.min(4, step + 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!termsAccepted) {
      window.alert("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }
    if (role === "ngo" && !documentName) {
      window.alert("Please add an organization verification document.");
      return;
    }
    setCurrentStep(4);
  }

  if (currentStep === 4) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-600 text-white shadow-float">
          <CheckCircle2 className="size-10" />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-accent-600">Registration submitted</p>
        <h1 className="mt-3 text-3xl font-black text-brand-900 sm:text-4xl">You&apos;re all set!</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-600 sm:text-base">
          Your {roleLabels[role]} account has been created. NGO and volunteer verification will be reviewed by an authorized administrator before full access is enabled.
        </p>
        <div className="mx-auto mt-7 max-w-md rounded-3xl border border-brand-100 bg-brand-50 p-5 text-left">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 size-6 shrink-0 text-brand-700" />
            <div>
              <p className="font-black text-brand-800">Next step</p>
              <p className="mt-1 text-sm leading-6 text-muted-600">Log in to view the frontend demo. Real authentication and document review will be connected in the backend phase.</p>
            </div>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login"><Button size="lg" rightIcon={<ArrowRight className="size-5" />}>Continue to login</Button></Link>
          <Link href="/role-selection"><Button size="lg" variant="outline">Register another role</Button></Link>
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
            {currentStep === 1 ? "Create your account" : currentStep === 2 ? "Tell us about you" : "Verify and finish"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-600">{description}</p>
        </div>
        <Link href="/role-selection" className="shrink-0 text-sm font-black text-brand-700 hover:text-brand-800">Change role</Link>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 grid gap-5">
        {currentStep === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" name="fullName" value={data.fullName} onChange={updateField} required placeholder="Enter your full name" autoComplete="name" leftIcon={<UserRound className="size-5" />} containerClassName="sm:col-span-2" />
            <Input label="Email address" name="email" type="email" value={data.email} onChange={updateField} required placeholder="you@example.com" autoComplete="email" leftIcon={<Mail className="size-5" />} />
            <Input label="Phone number" name="phone" type="tel" value={data.phone} onChange={updateField} required placeholder="+880 1XXXXXXXXX" autoComplete="tel" leftIcon={<Phone className="size-5" />} />
            <PasswordInput label="Password" name="password" value={data.password} onChange={updateField} placeholder="Create a strong password" autoComplete="new-password" />
            <PasswordInput label="Confirm password" name="confirmPassword" value={data.confirmPassword} onChange={updateField} placeholder="Repeat your password" autoComplete="new-password" />
            <div className="sm:col-span-2 rounded-2xl border border-brand-100 bg-brand-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-6 shrink-0 text-brand-700" />
                <div><p className="font-black text-brand-800">Your data is protected</p><p className="mt-1 text-sm leading-6 text-muted-600">Sensitive information will be stored securely when backend authentication is connected.</p></div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && role === "donor" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Donor type" name="donorType" value={data.donorType} onChange={updateField} required>
              <option value="individual">Individual donor</option>
              <option value="cafeteria">Cafeteria / Restaurant</option>
              <option value="bakery">Bakery / Food shop</option>
              <option value="event">Event organizer</option>
            </Select>
            <Input label="Organization name (optional)" name="organizationName" value={data.organizationName} onChange={updateField} placeholder="UIU Cafeteria" leftIcon={<Building2 className="size-5" />} />
            <Textarea label="Primary pickup address" name="address" value={data.address} onChange={updateField} required placeholder="Enter the address used for food pickup" containerClassName="sm:col-span-2" />
            <Textarea label="Additional notes (optional)" name="notes" value={data.notes} onChange={updateField} placeholder="Operating hours, entrance instructions, or other details" containerClassName="sm:col-span-2" />
          </div>
        )}

        {currentStep === 2 && role === "ngo" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Organization name" name="organizationName" value={data.organizationName} onChange={updateField} required placeholder="Hope Foundation" leftIcon={<Building2 className="size-5" />} />
            <Input label="Registration number" name="registrationNumber" value={data.registrationNumber} onChange={updateField} required placeholder="NGO registration ID" leftIcon={<FileCheck2 className="size-5" />} />
            <Select label="Primary beneficiary group" name="beneficiaryType" value={data.beneficiaryType} onChange={updateField} required>
              <option value="shelter">Shelter / Orphanage</option>
              <option value="community">Community center</option>
              <option value="elderly">Elderly support</option>
              <option value="women">Women and families</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Operating city" name="city" value={data.city} onChange={updateField} required placeholder="Dhaka" leftIcon={<MapPin className="size-5" />} />
            <Textarea label="Organization address" name="address" value={data.address} onChange={updateField} required placeholder="Enter the verified organization address" containerClassName="sm:col-span-2" />
            <Textarea label="About the organization" name="notes" value={data.notes} onChange={updateField} required placeholder="Briefly describe your work and distribution capacity" containerClassName="sm:col-span-2" />
          </div>
        )}

        {currentStep === 2 && role === "volunteer" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="City" name="city" value={data.city} onChange={updateField} required placeholder="Dhaka" leftIcon={<MapPin className="size-5" />} />
            <Select label="Transport method" name="transport" value={data.transport} onChange={updateField} required>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="walking">Walking / Public transport</option>
            </Select>
            <Select label="General availability" name="availability" value={data.availability} onChange={updateField} required>
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="daytime">Daytime</option>
              <option value="flexible">Flexible</option>
            </Select>
            <Input label="Preferred service area" name="address" value={data.address} onChange={updateField} required placeholder="Badda, Gulshan, Dhanmondi..." leftIcon={<MapPin className="size-5" />} />
            <Textarea label="Why do you want to volunteer?" name="notes" value={data.notes} onChange={updateField} placeholder="Tell us briefly about your motivation" containerClassName="sm:col-span-2" />
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-5">
            <label className="group grid min-h-44 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6 text-center transition hover:border-brand-400 hover:bg-brand-50">
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setDocumentName(event.target.files?.[0]?.name ?? "")}
              />
              <span>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-brand-700 shadow-sm"><UploadCloud className="size-7" /></span>
                <span className="mt-4 block font-black text-brand-800">{documentName || (role === "ngo" ? "Upload organization verification" : "Upload verification document (optional)")}</span>
                <span className="mt-2 block text-sm text-muted-600">PDF, JPG, or PNG · Maximum 5 MB</span>
              </span>
            </label>

            <div className="rounded-3xl border border-line bg-white p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-6 shrink-0 text-brand-700" />
                <div>
                  <p className="font-black text-ink-900">Verification boundary</p>
                  <p className="mt-1 text-sm leading-6 text-muted-600">Food donors may begin with limited access. NGO and volunteer accounts require administrator verification before claiming or handling food.</p>
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-muted-600">
              <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 size-4 shrink-0 accent-brand-600" />
              <span>I agree to the <span className="font-bold text-brand-700">Terms & Conditions</span>, <span className="font-bold text-brand-700">Privacy Policy</span>, and truthful use of the platform.</span>
            </label>
          </div>
        )}

        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
          {currentStep > 1 ? (
            <Button type="button" size="lg" variant="outline" leftIcon={<ArrowLeft className="size-5" />} onClick={() => setCurrentStep((step) => step - 1)}>
              Back
            </Button>
          ) : (
            <Link href="/role-selection"><Button type="button" size="lg" variant="ghost" leftIcon={<ArrowLeft className="size-5" />}>Role selection</Button></Link>
          )}

          {currentStep < 3 ? (
            <Button type="button" size="lg" rightIcon={<ArrowRight className="size-5" />} onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" size="lg" rightIcon={<ArrowRight className="size-5" />}>
              Create account
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
