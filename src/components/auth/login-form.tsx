"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, UserRound } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getRoleLandingRoute, useMockAuth } from "@/features/auth/mock-auth";
import { DEMO_ACCOUNTS } from "@/features/auth/demo-accounts";
import { validateLogin } from "@/features/auth/validation";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import styles from "./auth-pages.module.css";

type LoginErrors = Partial<Record<"email" | "password" | "form", string>>;

function getSafeDestination(
  requestedPath: string | null,
  account: { role: UserRole | string },
) {
  const landingRoute = getRoleLandingRoute(account.role as UserRole);
  const roleBase = landingRoute.slice(0, landingRoute.lastIndexOf("/") + 1);
  if (requestedPath?.startsWith(roleBase) && !requestedPath.startsWith("//"))
    return requestedPath;
  return landingRoute;
}

export function LoginForm() {
  const tx = useUiText();
  const searchParams = useSearchParams();
  const { signIn } = useMockAuth();
  const form = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || redirecting) return;
    const validationErrors = validateLogin({ email, password });
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      window.requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const account = await signIn({ email: email.trim(), password, remember });
      setRedirecting(true);
      window.location.replace(
        getSafeDestination(searchParams.get("next"), account),
      );
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : tx("Could not sign in. Please try again."),
      });
      setLoading(false);
    }
  }

  return (
    <form
      ref={form}
      onSubmit={handleSubmit}
      noValidate
      className={styles.form}
      aria-busy={loading || redirecting}
    >
      {errors.form && (
        <Alert
          tone="danger"
          title={tx("লগইন ব্যর্থ হয়েছে")}
          description={tx(errors.form)}
        />
      )}
      <fieldset disabled={loading || redirecting}>
        <Input
          label={tx("Email, mobile or username")}
          id="login-email"
          name="email"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={254}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((previous) => ({
              ...previous,
              email: undefined,
              form: undefined,
            }));
          }}
          placeholder="Email, mobile or username"
          error={errors.email}
          required
          leftIcon={<UserRound size={20} />}
        />
        <PasswordInput
          id="login-password"
          value={password}
          maxLength={256}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((previous) => ({
              ...previous,
              password: undefined,
              form: undefined,
            }));
          }}
          error={errors.password}
        />
        <div className={styles.formOptions}>
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 accent-emerald-600"
            />
            {tx("Keep me signed in")}
          </label>
          <Link href={ROUTES.auth.forgotPassword}>
            {tx("পাসওয়ার্ড ভুলে গেছেন?")}
          </Link>
        </div>
      </fieldset>
      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={loading || redirecting}
      >
        {redirecting
          ? tx("ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...")
          : loading
            ? tx("যাচাই করা হচ্ছে...")
            : tx("Sign in")}
        {!loading && !redirecting && (
          <ArrowRight size={18} aria-hidden="true" />
        )}
      </Button>
      <p className={styles.signup}>
        {tx("Need an account?")}{" "}
        <Link href={ROUTES.auth.roleSelection}>{tx("Create an account")}</Link>
      </p>
      <details className={styles.demo}>
        <summary>{tx("Try a demo account")}</summary>
        <p>{tx("Choose a demo account to fill the form, then sign in.")}</p>
        <div className={styles.demoOptions}>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              disabled={loading || redirecting}
              aria-pressed={email === account.email}
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                setErrors({});
              }}
            >
              {tx(
                account.role === UserRole.DONOR
                  ? "Food donor"
                  : account.role === UserRole.NGO
                    ? "NGO"
                    : "Volunteer",
              )}
            </button>
          ))}
        </div>
      </details>
    </form>
  );
}
