"use client";

import { ArrowRight, Globe, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push("/role-selection"), 450);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Input
        label="Email address"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        leftIcon={<Mail className="size-5" />}
      />
      <PasswordInput />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-muted-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 rounded border-line accent-brand-600"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-bold text-brand-700 hover:text-brand-800">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight className="size-5" />} disabled={loading}>
        {loading ? "Signing in..." : "Log in"}
      </Button>

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-400">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button type="button" size="lg" variant="outline" fullWidth leftIcon={<Globe className="size-5" />}>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-600">
        Don&apos;t have an account?{" "}
        <Link href="/role-selection" className="font-black text-brand-700 hover:text-brand-800">
          Create account
        </Link>
      </p>
    </form>
  );
}
