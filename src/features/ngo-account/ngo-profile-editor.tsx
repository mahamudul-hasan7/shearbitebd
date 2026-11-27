"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw, Save } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  NGO_ACCOUNT_USER_ID,
  NGO_ACCOUNT_VIEWER,
} from "@/features/ngo-account/shared";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import { profileService, toServiceError } from "@/services";

export function NGOProfileEditor() {
  const tx = useUiText();
  const [form, setForm] = useState({
    organizationName: "",
    summary: "",
    mission: "",
    vision: "",
    serviceAreas: "",
    beneficiaryTypes: "",
    capacityMealsPerDay: "",
    publicEmail: "",
    publicPhone: "",
  });
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    profileService
      .getOwnProfile(NGO_ACCOUNT_USER_ID, NGO_ACCOUNT_VIEWER, {
        signal: controller.signal,
      })
      .then(({ ngoProfile }) => {
        if (!ngoProfile) return;
        setForm({
          organizationName: ngoProfile.organizationName,
          summary: ngoProfile.summary,
          mission: ngoProfile.mission,
          vision: ngoProfile.vision,
          serviceAreas: ngoProfile.serviceAreas.join(", "),
          beneficiaryTypes: ngoProfile.beneficiaryTypes.join(", "),
          capacityMealsPerDay: String(ngoProfile.capacityMealsPerDay),
          publicEmail: ngoProfile.publicEmail,
          publicPhone: ngoProfile.publicPhone,
        });
        setLoadError("");
        setReady(true);
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(toServiceError(caught).message || "Profile could not load.");
        }
      });
    return () => controller.abort();
  }, [retryKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrors({});
    try {
      await profileService.updateNGOProfile(
        NGO_ACCOUNT_USER_ID,
        {
          ...form,
          capacityMealsPerDay: Number(form.capacityMealsPerDay),
          serviceAreas: form.serviceAreas.split(","),
          beneficiaryTypes: form.beneficiaryTypes.split(","),
        },
        NGO_ACCOUNT_VIEWER,
      );
      setSaved(true);
    } catch (caught) {
      const issue = toServiceError(caught);
      setErrors(issue.fieldErrors ?? { form: issue.message });
    } finally {
      setSaving(false);
    }
  }

  const orgName = form.organizationName || "Hope Foundation";
  const initials =
    orgName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NG";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.profile}
      title={tx("Edit organization")}
      description={tx("Keep public information and operational capacity accurate.")}
      profileName={orgName}
      profileDescription={tx("Verified NGO")}
      avatarInitials={initials}
      notificationHref={ROUTES.ngo.notifications}
      actions={
        <ButtonLink
          href={ROUTES.ngo.profile}
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="size-4" />}
        >
          <UiText source="Back to profile" />
        </ButtonLink>
      }
    >
      {!ready && !loadError && <LoadingSpinner />}

      {loadError && !ready && (
        <EmptyState
          icon={RefreshCw}
          title={tx("Profile could not load")}
          description={tx(loadError)}
          action={
            <Button onClick={() => setRetryKey((value) => value + 1)}>
              <UiText source="Try again" />
            </Button>
          }
        />
      )}

      {ready && (
        <form onSubmit={submit} className="grid gap-6">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader
              title={tx("Public organization details")}
              description={tx("These fields may appear in the verified donor directory.")}
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Input
                label={tx("Organization name")}
                value={form.organizationName}
                error={tx(errors.organizationName)}
                onChange={(e) =>
                  setForm({ ...form, organizationName: e.target.value })
                }
              />
              <Input
                label={tx("Daily meal capacity")}
                type="number"
                min="1"
                value={form.capacityMealsPerDay}
                error={tx(errors.capacityMealsPerDay)}
                onChange={(e) =>
                  setForm({ ...form, capacityMealsPerDay: e.target.value })
                }
              />
              <Textarea
                label={tx("Summary")}
                value={form.summary}
                error={tx(errors.summary)}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                containerClassName="sm:col-span-2"
              />
              <Textarea
                label={tx("Organization mandate")}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
              />
              <Textarea
                label={tx("Vision")}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
              />
              <Input
                label={tx("Service areas")}
                value={form.serviceAreas}
                error={tx(errors.serviceAreas)}
                hint={tx("Comma-separated areas")}
                onChange={(e) =>
                  setForm({ ...form, serviceAreas: e.target.value })
                }
              />
              <Input
                label={tx("Beneficiary groups")}
                value={form.beneficiaryTypes}
                hint={tx("Comma-separated groups")}
                onChange={(e) =>
                  setForm({ ...form, beneficiaryTypes: e.target.value })
                }
              />
              <Input
                label={tx("Public email")}
                type="email"
                value={form.publicEmail}
                error={tx(errors.publicEmail)}
                onChange={(e) =>
                  setForm({ ...form, publicEmail: e.target.value })
                }
              />
              <Input
                label={tx("Public phone")}
                value={form.publicPhone}
                error={tx(errors.publicPhone)}
                onChange={(e) =>
                  setForm({ ...form, publicPhone: e.target.value })
                }
              />
            </CardContent>
          </Card>

          {errors.form && (
            <Alert
              tone="danger"
              title={tx("Profile could not be saved")}
              description={tx(errors.form)}
            />
          )}

          {saved && (
            <Alert
              tone="success"
              title={tx("Profile updated")}
              description={tx(
                "Your verified NGO profile and operational capacity have been saved.",
              )}
              action={
                <ButtonLink href={ROUTES.ngo.profile} size="sm" variant="outline">
                  {tx("Back to profile")}
                </ButtonLink>
              }
            />
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <ButtonLink
              href={ROUTES.ngo.profile}
              variant="ghost"
              size="md"
              className="justify-center"
            >
              {tx("Cancel")}
            </ButtonLink>
            <Button
              type="submit"
              disabled={saving}
              className="justify-center"
              leftIcon={
                saved ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Save className="size-4" />
                )
              }
            >
              {saving ? tx("Saving…") : tx("Save changes")}
            </Button>
          </div>
        </form>
      )}
    </PortalShell>
  );
}
