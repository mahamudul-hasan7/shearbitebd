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
        leftIcon={<Mail className="size-4.5 text-slate-400" />}
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
        <label className="flex cursor-pointer items-center gap-2 text-slate-600 text-xs font-medium">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
          />
          Remember this session
        </label>
        <Link href={ROUTES.auth.forgotPassword} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight className="size-4.5" />} disabled={loading}>
        {loading ? "Authenticating..." : "Sign in to Dashboard"}
      </Button>

      {/* Quick Demo Switcher */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FlaskConical className="size-4 text-emerald-600" />
            <span>One-Click Demo Access</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Select a role below to sign in instantly with simulated credentials:
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoLogin(account)}
                disabled={loading}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs transition-all hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-xs active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="text-xs font-bold text-slate-800 capitalize group-hover:text-emerald-700">
                  {account.role.toLowerCase()}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600">
                  1-Click Demo
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button type="button" size="md" variant="outline" fullWidth leftIcon={<Globe className="size-4.5 text-slate-400" />} disabled title="Google authentication will be connected with the backend.">
        Continue with Google
      </Button>

      <p className="text-center text-xs sm:text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.auth.roleSelection} className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
          Create an account
        </Link>
      </p>
    </form>
  );
}
