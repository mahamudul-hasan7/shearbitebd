"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import styles from "@/components/auth/auth-pages.module.css";

export default function RoleSelectionPage() {
  const tx = useUiText();
  return (
    <AuthShell contentClassName="max-w-2xl">
      <div className={styles.form}>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            {tx("Choose your role")}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-600">
            {tx("Choose how you want to help, then create your account.")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <RoleCard
            title={tx("Food donor")}
            description={tx("List extra meals for collection.")}
            href={ROUTES.auth.registerDonor}
            tone="donor"
          />
          <RoleCard
            title={tx("NGO")}
            description={tx("Claim food for your organization.")}
            href={ROUTES.auth.registerNgo}
            tone="ngo"
          />
          <RoleCard
            title={tx("Volunteer")}
            description={tx("Collect and deliver food.")}
            href={ROUTES.auth.registerVolunteer}
            tone="volunteer"
          />
        </div>
        <p className={styles.signup}>
          {tx("Already have an account?")}{" "}
          <Link href={ROUTES.auth.login}>{tx("Sign in")}</Link>
        </p>
      </div>
    </AuthShell>
  );
}
