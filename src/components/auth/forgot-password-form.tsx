"use client";

import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 text-center sm:p-8">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-600 text-white">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-black text-brand-800">Check your email</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-600">
          We sent a password reset link. The demo does not send a real email yet; backend integration will be added later.
        </p>
        <Link href={ROUTES.auth.login} className="mt-6 inline-flex font-black text-brand-700 hover:text-brand-800">
          Back to login
        </Link>
      </div>
    );
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
        hint="Use the email connected to your ShareBite BD account."
      />
      <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight className="size-5" />}>
        Send reset link
      </Button>
    </form>
  );
}
