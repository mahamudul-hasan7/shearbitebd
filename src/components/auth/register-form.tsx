"use client";
import { createRequestId } from "@/lib/request-id";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { AuthProgress } from "@/components/auth/auth-progress";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMockAuth, getRoleLandingRoute } from "@/features/auth/mock-auth";
import {
  INITIAL_REGISTRATION_DATA,
  type RegistrationData,
  type RegistrationErrors,
  type RegistrationRole,
} from "@/features/auth/types";
import {
  hasErrors,
  validateRegistrationStep,
} from "@/features/auth/validation";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import styles from "./auth-pages.module.css";

const steps = [
  { label: "Account details", shortLabel: "Account" },
  { label: "Profile details", shortLabel: "Details" },
  { label: "Review and consent", shortLabel: "Review" },
  { label: "Account created", shortLabel: "Complete" },
];

const roleNames = {
  donor: "Food donor",
  ngo: "NGO",
  volunteer: "Volunteer",
} as const;

export function RegisterForm() {
  const tx = useUiText();
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role")?.toLowerCase();
  const initialRole: RegistrationRole =
    rawRole === "ngo" || rawRole === "volunteer" ? rawRole : "donor";
  const [role, setRole] = useState<RegistrationRole>(initialRole);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(INITIAL_REGISTRATION_DATA);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { refreshSession } = useMockAuth();
  const userRole =
    role === "ngo"
      ? UserRole.NGO
      : role === "volunteer"
        ? UserRole.VOLUNTEER
        : UserRole.DONOR;

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      form: undefined,
    }));
  }

  function focusHeading() {
    window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
  }

  function goToStep(step: number) {
    setCurrentStep(step);
    setErrors({});
    focusHeading();
  }

  function validateStep(step: number) {
    const nextErrors = validateRegistrationStep({
      step,
      role,
      data,
      termsAccepted,
    });
    if (!hasErrors(nextErrors)) return true;
    setCurrentStep(step);
    setErrors(nextErrors);
    window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    });
    return false;
  }

  function goNext() {
    if (validateStep(currentStep)) goToStep(currentStep + 1);
  }

  function applyDemoPreset() {
    const suffix = createRequestId().slice(0, 8);
    const digits = String(Math.floor(Math.random() * 100_000_000)).padStart(
      8,
      "0",
    );
    setData({
      ...INITIAL_REGISTRATION_DATA,
      fullName: "Demo " + roleNames[role],
      email: `demo.${role}.${suffix}@example.test`,
      phone: "017" + digits,
      password: "Demo1234",
      confirmPassword: "Demo1234",
      organizationName: "Sample organization",
      registrationNumber: "DEMO-" + suffix,
      address: "Sample address, Dhaka",
      notes: "Sample profile for a registration demonstration.",
    });
    setTermsAccepted(false);
    goToStep(1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (currentStep < 3) {
      goNext();
      return;
    }
    for (const step of [1, 2, 3]) {
      if (!validateStep(step)) return;
    }
    setIsSubmitting(true);
    setErrors({});
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
          termsAccepted,
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
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) setCurrentStep(1);
        setErrors({
          form:
            result.error ||
            tx("Could not create the account. Please try again."),
        });
        focusHeading();
        return;
      }
      const session = await refreshSession().catch(() => null);
      setSessionReady(Boolean(session));
      setCurrentStep(4);
      focusHeading();
    } catch {
      setErrors({
        form: tx(
          "Could not reach the server. Check your connection and try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (currentStep === 4) {
    return (
      <div className="grid gap-6">
        <AuthProgress steps={steps} current={4} />
        <CheckCircle2
          size={48}
          className="text-emerald-600"
          aria-hidden="true"
        />
        <div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-ink-900"
          >
            {tx("Your account is ready")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-600">
            {tx("Your account was approved automatically at registration.")}
          </p>
        </div>
        {!sessionReady && (
          <Alert
            tone="info"
            title={tx("Sign in to continue")}
            description={tx(
              "Your account was created. Sign in with the details you just entered.",
            )}
          />
        )}
        <p className="break-all text-sm text-muted-600">{data.email}</p>
        <ButtonLink
          href={
            sessionReady ? getRoleLandingRoute(userRole) : ROUTES.auth.login
          }
          size="lg"
          rightIcon={<ArrowRight size={18} />}
        >
          {tx(sessionReady ? "Continue to dashboard" : "Sign in")}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <AuthProgress steps={steps} current={currentStep} />
      <div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold leading-snug text-ink-900"
        >
          {tx(
            currentStep === 1
              ? "Create your account"
              : currentStep === 2
                ? "Tell us how you will help"
                : "Review your details",
          )}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-600">
          {tx(
            currentStep === 1
              ? "Start with your contact details and a password."
              : currentStep === 2
                ? "These details help coordinate food collection and delivery."
                : "Check your details before creating the account.",
          )}
        </p>
      </div>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className={styles.form}
        aria-busy={isSubmitting}
      >
        {errors.form && (
          <Alert
            tone="danger"
            title={tx("Please check your details")}
            description={tx(errors.form)}
          />
        )}
        <fieldset disabled={isSubmitting}>
          {currentStep === 1 && (
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <Select
                label={tx("Choose your role")}
                name="role"
                value={role}
                containerClassName="sm:col-span-2"
                onChange={(event) => {
                  setRole(event.target.value as RegistrationRole);
                  setTermsAccepted(false);
                  setErrors({});
                }}
              >
                <option value="donor">{tx("Food donor")}</option>
                <option value="ngo">{tx("NGO")}</option>
                <option value="volunteer">{tx("Volunteer")}</option>
              </Select>
              <Input
                label={
                  role === "ngo"
                    ? tx("দায়িত্বপ্রাপ্ত কর্মকর্তার পুরো নাম")
                    : tx("আপনার পুরো নাম")
                }
                name="fullName"
                value={data.fullName}
                onChange={updateField}
                required
                maxLength={120}
                autoComplete="name"
                error={errors.fullName}
                leftIcon={<UserRound size={20} />}
                containerClassName="sm:col-span-2"
              />
              <Input
                label={tx("Email address")}
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={data.email}
                onChange={updateField}
                required
                maxLength={254}
                error={errors.email}
                leftIcon={<Mail size={20} />}
              />
              <Input
                label={tx("Mobile number")}
                name="phone"
                type="tel"
                autoComplete="tel"
                value={data.phone}
                onChange={updateField}
                required
                error={errors.phone}
                placeholder="01712345678"
                leftIcon={<Phone size={20} />}
              />
              <PasswordInput
                label={tx("Create a password")}
                name="password"
                value={data.password}
                onChange={updateField}
                autoComplete="new-password"
                maxLength={256}
                error={errors.password}
                hint={tx(
                  "Use at least 8 characters, including a letter and a number.",
                )}
              />
              <PasswordInput
                label={tx("Confirm password")}
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={updateField}
                autoComplete="new-password"
                maxLength={256}
                error={errors.confirmPassword}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              {role === "donor" && (
                <Select
                  label={tx("Donor type")}
                  name="donorType"
                  value={data.donorType}
                  onChange={updateField}
                  error={errors.donorType}
                >
                  <option value="individual">{tx("Individual")}</option>
                  <option value="cafeteria">{tx("Cafeteria")}</option>
                  <option value="restaurant">{tx("Restaurant")}</option>
                  <option value="bakery">{tx("Bakery")}</option>
                  <option value="event_organizer">
                    {tx("Event organizer")}
                  </option>
                </Select>
              )}
              {role !== "volunteer" && (
                <Input
                  label={tx(
                    role === "ngo"
                      ? "Organization name"
                      : "Organization name (optional)",
                  )}
                  name="organizationName"
                  value={data.organizationName}
                  onChange={updateField}
                  required={role === "ngo"}
                  maxLength={160}
                  autoComplete="organization"
                  error={errors.organizationName}
                  containerClassName={
                    role === "ngo" ? "sm:col-span-2" : undefined
                  }
                />
              )}
              {role === "ngo" && (
                <>
                  <Input
                    label={tx("Registration or licence number")}
                    name="registrationNumber"
                    value={data.registrationNumber}
                    onChange={updateField}
                    required
                    maxLength={160}
                    error={errors.registrationNumber}
                  />
                  <Select
                    label={tx("Who do you support?")}
                    name="beneficiaryType"
                    value={data.beneficiaryType}
                    onChange={updateField}
                    error={errors.beneficiaryType}
                  >
                    <option value="shelter">
                      {tx("Shelters and orphanages")}
                    </option>
                    <option value="community">{tx("Local communities")}</option>
                    <option value="students">{tx("Students")}</option>
                    <option value="other">{tx("Other")}</option>
                  </Select>
                </>
              )}
              {role === "volunteer" && (
                <>
                  <Select
                    label={tx("Transport method")}
                    name="transport"
                    value={data.transport}
                    onChange={updateField}
                    error={errors.transport}
                  >
                    <option value="walking">{tx("Walking")}</option>
                    <option value="bicycle">{tx("Bicycle")}</option>
                    <option value="motorcycle">{tx("Motorcycle")}</option>
                    <option value="van">{tx("Van")}</option>
                    <option value="car">{tx("Car")}</option>
                  </Select>
                  <Select
                    label={tx("Availability")}
                    name="availability"
                    value={data.availability}
                    onChange={updateField}
                    error={errors.availability}
                  >
                    <option value="weekends">{tx("Weekends")}</option>
                    <option value="weekdays">{tx("Weekdays")}</option>
                    <option value="evenings">{tx("Evenings")}</option>
                    <option value="flexible">{tx("Flexible")}</option>
                  </Select>
                </>
              )}
              <Input
                label={tx("City or district")}
                name="city"
                value={data.city}
                onChange={updateField}
                required={role !== "donor"}
                maxLength={160}
                autoComplete="address-level2"
                error={errors.city}
                containerClassName="sm:col-span-2"
              />
              <Textarea
                label={tx(
                  role === "donor"
                    ? "Pickup address"
                    : role === "ngo"
                      ? "Organization address"
                      : "Preferred service area",
                )}
                name="address"
                value={data.address}
                onChange={updateField}
                required
                maxLength={500}
                autoComplete="street-address"
                error={errors.address}
                containerClassName="sm:col-span-2"
              />
              <Textarea
                label={tx(
                  role === "ngo"
                    ? "Food distribution capacity"
                    : "Additional details (optional)",
                )}
                name="notes"
                value={data.notes}
                onChange={updateField}
                required={role === "ngo"}
                maxLength={500}
                error={errors.notes}
                containerClassName="sm:col-span-2"
              />
            </div>
          )}
          {currentStep === 3 && (
            <>
              <dl className={styles.review}>
                {[
                  [tx("Role"), tx(roleNames[role])],
                  [tx("Name"), data.fullName],
                  [tx("Email address"), data.email],
                  [tx("Mobile number"), data.phone],
                  [tx("Address"), data.address],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <Checkbox
                label={tx(
                  "I confirm my details and accept the food-sharing terms.",
                )}
                description={tx(
                  "Provide accurate food information and coordinate safe handovers with the other participants.",
                )}
                name="terms"
                checked={termsAccepted}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked);
                  setErrors((current) => ({ ...current, terms: undefined }));
                }}
                error={errors.terms}
              />
            </>
          )}
        </fieldset>
        <div className={styles.navigation}>
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              leftIcon={<ArrowLeft size={17} />}
              onClick={() => goToStep(currentStep - 1)}
            >
              {tx("Back")}
            </Button>
          ) : (
            <Link
              href={ROUTES.auth.login}
              className="py-3 text-sm font-semibold text-emerald-700"
            >
              {tx("Sign in instead")}
            </Link>
          )}
          {currentStep < 3 ? (
            <Button
              type="submit"
              size="lg"
              rightIcon={<ArrowRight size={17} />}
            >
              {tx("Continue")}
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              rightIcon={<CheckCircle2 size={18} />}
            >
              {tx(isSubmitting ? "Creating your account..." : "Create account")}
            </Button>
          )}
        </div>
      </form>
      <details className={styles.demo}>
        <summary>{tx("Try sample registration details")}</summary>
        <p>
          {tx(
            "Fill sample details for a demonstration. Review them before submitting.",
          )}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={applyDemoPreset}
        >
          {tx("Fill sample details")}
        </Button>
      </details>
    </div>
  );
}
