"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert } from "@/components/ui/alert";
import { DEMO_ACCOUNTS, findDemoAccount, type DemoAccount } from "@/features/auth/demo-accounts";
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

  const [email, setEmail] = useState("donor@sharebite.demo");
  const [password, setPassword] = useState("Demo1234");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  function completeDemoLogin(account: DemoAccount, shouldRemember = remember) {
    signIn({
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      remember: shouldRemember,
    });
    setRedirecting(true);
    const targetRoute = getSafeDestination(searchParams.get("next"), account);
    // Force direct window navigation to ensure clean session reload on mobile browsers
    window.location.href = targetRoute;
  }

  function handleDirectRoleLogin(roleName: "donor" | "ngo" | "volunteer") {
    const account = DEMO_ACCOUNTS.find((a) => a.role.toLowerCase() === roleName);
    if (account) {
      setLoading(true);
      completeDemoLogin(account);
    }
  }

  async function executeLogin(targetEmail: string, targetPass: string) {
    const cleanEmail = targetEmail.trim();
    const cleanPass = targetPass.trim();

    const validationErrors = validateLogin({ email: cleanEmail, password: cleanPass });
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 1. Authenticate with real database API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const resData = await res.json();

      if (res.ok && resData.user) {
        signIn({
          email: resData.user.email,
          displayName: resData.user.displayName,
          role: resData.user.role,
          remember,
        });

        setRedirecting(true);
        const targetRoute = getSafeDestination(searchParams.get("next"), {
          email: resData.user.email,
          displayName: resData.user.displayName,
          role: resData.user.role,
          password: "",
        });
        window.location.href = targetRoute;
        return;
      }

      // 2. Fallback check for static demo accounts
      const account = findDemoAccount(cleanEmail);
      if (account) {
        completeDemoLogin(account);
        return;
      }

      setErrors({
        form: resData.error || "লগইন ব্যর্থ হয়েছে। প্রদত্ত ইমেইল ও পাসওয়ার্ড সঠিক কিনা যাচাই করুন।",
      });
    } catch {
      const account = findDemoAccount(cleanEmail);
      if (account) {
        completeDemoLogin(account);
        return;
      }
      setErrors({ form: "সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে আপনার নেটওয়ার্ক সংযোগ যাচাই করুন।" });
    } finally {
      setLoading(false);
    }
  }

  // Handle URL query parameters if browser performed a fallback GET
  useEffect(() => {
    const qEmail = searchParams.get("email");
    const qPass = searchParams.get("password");
    if (qEmail && qPass) {
      setEmail(qEmail);
      setPassword(qPass);
      executeLogin(qEmail, qPass);
    }
  }, [searchParams]);

  function handleSubmit(event?: FormEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    executeLogin(email, password);
  }

  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }}
      noValidate
      className="space-y-6"
    >
      {errors.form && (
        <Alert
          tone="danger"
          title="লগইন ব্যর্থ হয়েছে"
          description={errors.form}
        />
      )}

      {/* 1-Tap Instant Lab Direct Access (Guaranteed 1-Click Entry) */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-[#022b20] p-3 text-white border border-emerald-700/60 space-y-2 shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-emerald-300">১-ক্লিক সরাসরি ড্যাশবোর্ডে প্রবেশ:</span>
          <span className="text-amber-400 font-mono text-[10px]">ইনস্ট্যান্ট</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDirectRoleLogin("donor")}
            disabled={loading || redirecting}
            className="flex flex-col items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 py-2.5 px-1 text-center transition-all active:scale-90 border border-white/20 touch-manipulation cursor-pointer shadow-xs"
          >
            <span className="text-base">👨‍🍳</span>
            <span className="text-xs font-black mt-1 text-white">ডোনার</span>
          </button>
          <button
            type="button"
            onClick={() => handleDirectRoleLogin("ngo")}
            disabled={loading || redirecting}
            className="flex flex-col items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 py-2.5 px-1 text-center transition-all active:scale-90 border border-white/20 touch-manipulation cursor-pointer shadow-xs"
          >
            <span className="text-base">🏢</span>
            <span className="text-xs font-black mt-1 text-white">এনজিও</span>
          </button>
          <button
            type="button"
            onClick={() => handleDirectRoleLogin("volunteer")}
            disabled={loading || redirecting}
            className="flex flex-col items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 py-2.5 px-1 text-center transition-all active:scale-90 border border-white/20 touch-manipulation cursor-pointer shadow-xs"
          >
            <span className="text-base">🚴</span>
            <span className="text-xs font-black mt-1 text-white">ভলান্টিয়ার</span>
          </button>
        </div>
      </div>

      {/* Credentials Form */}
      <div className="space-y-4">
        {/* Quick 1-Tap Demo Switcher Pills */}
        <div className="flex items-center justify-between pb-1 text-xs">
          <span className="font-bold text-slate-500 font-heading text-[11px]">ডেমো অ্যাকাউন্ট:</span>
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail("donor@sharebite.demo");
                setPassword("Demo1234");
                setErrors({});
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer touch-manipulation active:scale-95",
                email.toLowerCase().includes("donor")
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-black"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              👨‍🍳 ডোনার
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("ngo@sharebite.demo");
                setPassword("Demo1234");
                setErrors({});
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer touch-manipulation active:scale-95",
                email.toLowerCase().includes("ngo")
                  ? "bg-teal-600 text-white border-teal-600 shadow-2xs font-black"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              🏢 এনজিও
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("volunteer@sharebite.demo");
                setPassword("Demo1234");
                setErrors({});
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer touch-manipulation active:scale-95",
                email.toLowerCase().includes("volunteer")
                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs font-black"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              🚴 ভলান্টিয়ার
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">
            ইমেইল অথবা মোবাইল নম্বর (Email or Phone)
          </label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3.5 size-4.5 text-slate-400" />
            <input
              type="text"
              name="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
              }}
              placeholder="donor@sharebite.demo অথবা 01711000001"
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
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
        disabled={loading || redirecting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 text-sm font-black uppercase tracking-wider text-white shadow-md shadow-emerald-700/25 hover:from-emerald-700 hover:to-teal-800 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none font-heading cursor-pointer touch-manipulation"
      >
        {redirecting ? (
          <span className="flex items-center gap-2">
            <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...
          </span>
        ) : loading ? (
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
