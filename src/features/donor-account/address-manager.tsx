"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Edit3, MapPin, Plus, RefreshCw, Star, Trash2, X } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";
import { asyncState, profileService, toServiceError, type AddressInput, type AsyncState, type ProfileBundle } from "@/services";
import type { Address } from "@/types/domain";

const EMPTY_ADDRESS: AddressInput = { label: "", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "", addressLine: "", postalCode: "", landmark: "" };

export function AddressManager() {
  const [state, setState] = useState<AsyncState<ProfileBundle>>(() => asyncState.loading());
  const [form, setForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    profileService.getOwnProfile(DONOR_USER_ID, DONOR_VIEWER, { signal: controller.signal }).then((profile) => setState(asyncState.success(profile))).catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  function startEdit(address: Address) {
    setEditingId(address.id); setShowForm(true); setErrors({}); setNotice(undefined);
    setForm({ label: address.label, division: address.division, district: address.district, city: address.city, area: address.area, addressLine: address.addressLine, postalCode: address.postalCode ?? "", landmark: address.landmark ?? "" });
  }

  function closeForm() { setShowForm(false); setEditingId(undefined); setForm(EMPTY_ADDRESS); setErrors({}); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(editingId ?? "new"); setErrors({}); setNotice(undefined);
    try {
      const profile = editingId ? await profileService.updateAddress(DONOR_USER_ID, editingId, form, DONOR_VIEWER) : await profileService.addAddress(DONOR_USER_ID, form, DONOR_VIEWER);
      setState(asyncState.success(profile)); setNotice(editingId ? "Address updated." : "Address added."); closeForm();
    } catch (error: unknown) {
      const serviceError = toServiceError(error); setErrors(serviceError.fieldErrors ?? { form: serviceError.message });
    } finally { setBusy(undefined); }
  }

  async function setPrimary(addressId: string) {
    setBusy(addressId); setNotice(undefined);
    try { setState(asyncState.success(await profileService.setPrimaryAddress(DONOR_USER_ID, addressId, DONOR_VIEWER))); setNotice("Primary pickup address updated."); }
    catch (error: unknown) { setNotice(toServiceError(error).message); }
    finally { setBusy(undefined); }
  }

  async function remove(addressId: string) {
    setBusy(addressId); setNotice(undefined);
    try { setState(asyncState.success(await profileService.removeAddress(DONOR_USER_ID, addressId, DONOR_VIEWER))); setNotice("Address removed from this mock profile."); }
    catch (error: unknown) { setNotice(toServiceError(error).message); }
    finally { setBusy(undefined); }
  }

  const profile = state.data;
  const name = profile?.user.displayName ?? "UIU Cafeteria";
  return <PortalShell role="donor" activeHref={ROUTES.donor.profile} title="Saved addresses" description="Manage pickup locations and choose the default used by new donations." profileName={name} profileDescription="Verified food donor" avatarInitials={getInitials(name)} notificationHref={ROUTES.donor.notifications} actions={<Button size="sm" leftIcon={showForm ? <X className="size-4" /> : <Plus className="size-4" />} onClick={() => showForm ? closeForm() : setShowForm(true)}>{showForm ? "Close" : "Add address"}</Button>}>
    {state.status === "loading" && !profile && <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-60" /><Skeleton className="h-60" /></div>}
    {state.status === "error" && !profile && <EmptyState icon={RefreshCw} title="Addresses could not load" description={state.error.message} action={<Button onClick={() => setRetryKey((value) => value + 1)}>Try again</Button>} />}
    {profile && <div className="grid gap-5">
      {notice && <Alert tone="success" title={notice} description="Changes are stored in the active frontend mock session." />}
      {showForm && <form onSubmit={submit}><Card><CardHeader title={editingId ? "Edit pickup address" : "Add pickup address"} description="Use operational details that help verified rescue partners find the handover point." /><CardContent className="grid gap-4 sm:grid-cols-2"><Input label="Address label" value={form.label} error={errors.label} placeholder="Main kitchen" onChange={(event) => setForm({ ...form, label: event.target.value })} /><Input label="Area" value={form.area} error={errors.area} placeholder="Badda" onChange={(event) => setForm({ ...form, area: event.target.value })} /><Input label="Division" value={form.division} error={errors.division} onChange={(event) => setForm({ ...form, division: event.target.value })} /><Input label="District" value={form.district} error={errors.district} onChange={(event) => setForm({ ...form, district: event.target.value })} /><Input label="City" value={form.city} error={errors.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /><Input label="Postal code" value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} /><Input label="Address line" containerClassName="sm:col-span-2" value={form.addressLine} error={errors.addressLine} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} /><Input label="Landmark (optional)" containerClassName="sm:col-span-2" value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} />{errors.form && <Alert className="sm:col-span-2" tone="danger" title="Address could not be saved" description={errors.form} />}<div className="flex justify-end gap-2 sm:col-span-2"><Button variant="ghost" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={Boolean(busy)} leftIcon={<Check className="size-4" />}>{busy ? "Saving…" : "Save address"}</Button></div></CardContent></Card></form>}
      {profile.addresses.length === 0 ? <EmptyState icon={MapPin} title="No saved addresses" description="Add a pickup address before publishing your next food donation." action={<Button onClick={() => setShowForm(true)}>Add address</Button>} /> : <div className="grid gap-4 md:grid-cols-2">{profile.addresses.map((address) => <Card key={address.id} className={address.isPrimary ? "border-brand-300" : undefined}><CardContent><div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700"><MapPin className="size-5" /></span>{address.isPrimary && <Badge tone="success"><Star className="size-3.5" />Primary</Badge>}</div><h2 className="mt-5 text-lg font-black text-ink-900">{address.label}</h2><p className="mt-2 text-sm leading-6 text-muted-600">{address.addressLine}, {address.area}, {address.city} {address.postalCode}</p>{address.landmark && <p className="mt-2 text-xs font-semibold text-muted-500">Landmark: {address.landmark}</p>}<div className="mt-5 flex flex-wrap gap-2">{!address.isPrimary && <Button size="sm" variant="outline" disabled={busy === address.id} onClick={() => setPrimary(address.id)}>Set primary</Button>}<Button size="sm" variant="ghost" leftIcon={<Edit3 className="size-4" />} disabled={busy === address.id} onClick={() => startEdit(address)}>Edit</Button><Button size="sm" variant="ghost" leftIcon={<Trash2 className="size-4" />} disabled={busy === address.id} onClick={() => remove(address.id)}>Remove</Button></div></CardContent></Card>)}</div>}
    </div>}
  </PortalShell>;
}
