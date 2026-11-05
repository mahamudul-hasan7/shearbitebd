"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Lock,
  Mail,
  ShieldCheck,
  Truck,
  Utensils,
} from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { DEMO_ACCOUNTS, findDemoAccount, type DemoAccount } from "@/features/auth/demo-accounts";
import { UserRole } from "@/lib/constants/roles";
import { getRoleLandingRoute, useMockAuth } from "@/features/auth/mock-auth";
import { validateLogin } from "@/features/auth/validation";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

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

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(UserRole.DONOR);
  const [email, setEmail] = useState("donor@sharebite.demo");
  const [password, setPassword] = useState("Demo1234");
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

  function handleRoleQuickSelect(role: UserRole) {
    const account = DEMO_ACCOUNTS.find((acc) => acc.role === role);
    if (account) {
      setSelectedRole(role);
      setEmail(account.email);
      setPassword(account.password);
      setErrors({});
    }
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
      setErrors({
        form: "ডেমো টেস্টের জন্য অনুগ্রহ করে উপরের যেকোনো ১টি রোল সিলেক্ট করুন অথবা সঠিক ডেমো ইমেইল ব্যবহার করুন।",
      });
      return;
    }
    if (password !== account.password) {
      setErrors({ password: "ডেমো পাসওয়ার্ড হলো: Demo1234" });
      return;
    }

    setLoading(true);
    completeDemoLogin(account);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {errors.form && (
        <Alert
          tone="danger"
          title="লগইন ব্যর্থ হয়েছে"
          description={errors.form}
        />
      )}

      {/* 1. Fast Role Selector (১-ক্লিক ভূমিকা নির্বাচন) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold font-heading">
          <span className="text-slate-700 flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            দ্রুত ডেমো রোল সিলেক্ট করুন:
          </span>
          <span className="text-[11px] text-slate-400 font-normal">১-ক্লিক অটো-ফিল</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Donor */}
          <button
            type="button"
            onClick={() => handleRoleQuickSelect(UserRole.DONOR)}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all cursor-pointer font-heading active:scale-95",
              selectedRole === UserRole.DONOR
                ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-600/20"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl text-white shadow-xs transition-colors",
                selectedRole === UserRole.DONOR ? "bg-emerald-600" : "bg-slate-700 group-hover:bg-emerald-600"
              )}
            >
              <Utensils className="size-4.5" />
            </span>
            <span className="mt-2 text-xs font-black text-slate-900">ফুড ডোনার</span>
            <span className="text-[10px] text-emerald-700 font-semibold truncate max-w-[90px]">
              UIU Cafeteria
            </span>
            {selectedRole === UserRole.DONOR && (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="size-3.5" />
              </span>
            )}
          </button>

          {/* Card 2: NGO */}
          <button
            type="button"
            onClick={() => handleRoleQuickSelect(UserRole.NGO)}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all cursor-pointer font-heading active:scale-95",
              selectedRole === UserRole.NGO
                ? "border-teal-600 bg-teal-50/80 shadow-xs ring-2 ring-teal-600/20"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl text-white shadow-xs transition-colors",
                selectedRole === UserRole.NGO ? "bg-teal-600" : "bg-slate-700 group-hover:bg-teal-600"
              )}
            >
              <HeartHandshake className="size-4.5" />
            </span>
            <span className="mt-2 text-xs font-black text-slate-900">এনজিও ডেস্ক</span>
            <span className="text-[10px] text-teal-700 font-semibold truncate max-w-[90px]">
              Hope / Mastul
            </span>
            {selectedRole === UserRole.NGO && (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-teal-600 text-white shadow-xs">
                <CheckCircle2 className="size-3.5" />
              </span>
            )}
          </button>

          {/* Card 3: Volunteer */}
          <button
            type="button"
            onClick={() => handleRoleQuickSelect(UserRole.VOLUNTEER)}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all cursor-pointer font-heading active:scale-95",
              selectedRole === UserRole.VOLUNTEER
                ? "border-amber-600 bg-amber-50/80 shadow-xs ring-2 ring-amber-600/20"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl text-white shadow-xs transition-colors",
                selectedRole === UserRole.VOLUNTEER ? "bg-amber-600" : "bg-slate-700 group-hover:bg-amber-600"
              )}
            >
              <Truck className="size-4.5" />
            </span>
            <span className="mt-2 text-xs font-black text-slate-900">ভলান্টিয়ার</span>
            <span className="text-[10px] text-amber-700 font-semibold truncate max-w-[90px]">
              Tanvir Squad
            </span>
            {selectedRole === UserRole.VOLUNTEER && (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-amber-600 text-white shadow-xs">
                <CheckCircle2 className="size-3.5" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Manual Credentials Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">
            ইমেইল ঠিকানা (Email Address)
          </label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3.5 size-4.5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedRole(null);
                setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
              }}
              placeholder="donor@sharebite.demo"
              className={cn(
                "h-12 w-full rounded-xl border bg-slate-50/50 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden transition-all",
                errors.email
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200/90 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              )}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">
            পাসওয়ার্ড (Password)
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
            }}
            placeholder="পাসওয়ার্ড দিন (Demo1234)"
            error={errors.password}
          />
        </div>
      </div>

      {/* 3. Remember Me & Forgot Password */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600 font-medium select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
          <span>আমাকে মনে রাখুন (Remember session)</span>
        </label>

        <Link
          href={ROUTES.auth.forgotPassword}
          className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors font-heading"
        >
          পাসওয়ার্ড ভুলে গেছেন?
        </Link>
      </div>

      {/* 4. Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 text-sm font-black uppercase tracking-wider text-white shadow-md shadow-emerald-700/25 hover:from-emerald-700 hover:to-teal-800 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none font-heading cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            যাচাই করা হচ্ছে...
          </span>
        ) : (
          <>
            <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      {/* 5. Alternative Login Divider */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200/80" />
        </span>
        <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">
          অথবা
        </span>
      </div>

      {/* 6. Google Login Button */}
      <button
        type="button"
        disabled
        title="গুগল অথেন্টিকেশন শিঘ্রই ব্যাকএন্ডের সাথে যুক্ত হবে"
        className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-4 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors font-heading disabled:opacity-60 cursor-not-allowed"
      >
        <svg className="size-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google দিয়ে প্রবেশ করুন</span>
      </button>

      {/* 7. Sign-up prompt */}
      <p className="text-center text-xs text-slate-600 font-medium">
        নতুন যুক্ত হতে চান?{" "}
        <Link
          href={ROUTES.auth.roleSelection}
          className="font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors font-heading"
        >
          অ্যাকাউন্ট রেজিস্টার করুন →
        </Link>
      </p>

      {/* 8. Security Badge Footer */}
      <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400 font-medium border-t border-slate-100">
        <ShieldCheck className="size-3.5 text-emerald-600" />
        <span>সুরক্ষিত ওটিপি ভেরিফিকেশন ও BFSA খাদ্য নিরাপত্তা নিশ্চিত</span>
      </div>
    </form>
  );
}
