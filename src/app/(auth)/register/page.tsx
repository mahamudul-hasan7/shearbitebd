import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Create Account", description: "Complete the responsive donor, NGO, or volunteer registration demonstration." };

export default function RegisterPage() {
  return (
    <AuthShell artworkVariant="security" eyebrow="Role-based registration" title="Build trust before the first rescue begins." description="Account details, permissions, and verification are separated by role so the platform remains clear and accountable.">
      <Suspense fallback={<div className="rounded-3xl border border-line bg-white p-8 text-center text-muted-600">Loading registration form...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
