"use client";

import { ArrowRight, FlaskConical, Globe, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_ACCOUNTS, findDemoAccount, type DemoAccount } from "@/features/auth/demo-accounts";
import { getRoleLandingRoute, useMockAuth } from "@/features/auth/mock-auth";
import { validateLogin } from "@/features/auth/validation";
import { ROUTES } from "@/lib/routes";

type LoginErrors = Partial<Record<"email" | "password" | "form", string>>;

function getSafeDestination(requestedPath: string | null, account: DemoAccount) {
  const landingRoute = getRoleLandingRoute(account.role);
  const roleBase = landingRoute.slice(0, landingRoute.lastIndexOf("/") + 1);
  if (requestedPath?.startsWith(roleBase) && !requestedPath.startsWith("//")) return requestedPath;
  return landingRoute;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useMockAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  function completeDemoLogin(account: DemoAccount, shouldRemember = remember) {
    signIn({
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      remember: shouldRemember,
    });
    router.push(getSafeDestination(searchParams.get("next"), account));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin({ email, password });
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    const account = findDemoAccount(email);
    if (!account) {
      setErrors({ form: "This frontend build accepts the demo accounts listed below. Real account lookup is not connected yet." });
      return;
    }
    if (password !== account.password) {
      setErrors({ password: "The demo password is Demo1234." });
      return;
    }

    setLoading(true);
    completeDemoLogin(account);
  }

  function handleDemoLogin(account: DemoAccount) {
    setErrors({});
    setEmail(account.email);
    setPassword(account.password);
    setLoading(true);
    completeDemoLogin(account);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      {errors.form && <Alert tone="danger" title="Demo sign-in unavailable" description={errors.form} />}

      <Input
        label="Email address"
        name="email"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setErrors((current) => ({ ...current, email: undefined, form: undefined }));
        }}
        placeholder="you@example.com"
        autoComplete="email"
        required
        error={errors.email}
        leftIcon={<Mail className="size-5" />}
      />
      <PasswordInput
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setErrors((current) => ({ ...current, password: undefined, form: undefined }));
        }}
        error={errors.password}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-muted-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 rounded border-line accent-brand-600"
          />
          Remember this demo session
        </label>
        <Link href={ROUTES.auth.forgotPassword} className="font-bold text-brand-700 hover:text-brand-800">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight className="size-5" />} disabled={loading}>
        {loading ? "Opening workspace..." : "Log in"}
      </Button>

      {process.env.NODE_ENV === "development" && (
        <div className="rounded-3xl border border-info/20 bg-info-soft p-4">
          <div className="flex items-start gap-3 text-info-strong">
            <FlaskConical className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-sm font-black">Development demo accounts</p>
              <p className="mt-1 text-xs leading-5 opacity-80">One-click login uses the shared password Demo1234. Only mock role and profile details are stored.</p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((account) => (
              <Button key={account.email} type="button" size="sm" variant="outline" onClick={() => handleDemoLogin(account)} disabled={loading}>
                {account.role.toLowerCase()} demo
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-400">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button type="button" size="lg" variant="outline" fullWidth leftIcon={<Globe className="size-5" />} disabled title="Google authentication will be connected with the backend.">
        Google sign-in coming later
      </Button>

      <p className="text-center text-sm text-muted-600">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.auth.roleSelection} className="font-black text-brand-700 hover:text-brand-800">
          Create account
        </Link>
      </p>
    </form>
  );
}
