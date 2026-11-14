"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Edit3, MapPin, Plus, RefreshCw, Star, Trash2, X } from "lucide-react";
import { LocationPicker } from "@/components/maps/location-picker";
import { navigationUrl } from "@/lib/locations";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DONOR_USER_ID, DONOR_VIEWER, getInitials } from "@/features/donor-account/shared";
import { ROUTES } from "@/lib/routes";
import { asyncState, profileService, toServiceError, type AddressInput, type AsyncState, type ProfileBundle } from "@/services";
import type { Address, Coordinates } from "@/types/domain";

const EMPTY_ADDRESS: AddressInput = { label: "", division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "", addressLine: "", postalCode: "", landmark: "" };

export function AddressManager({ role = "donor" }: { role?: "donor" | "ngo" }) {
  const tx = useUiText();
  const [locationTarget, setLocationTarget] = useState<Address>();
  const [pin, setPin] = useState<Coordinates | null>(null);
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
    setForm({ label: address.label, division: address.division, district: address.district, city: address.city, area: address.area, addressLine: address.addressLine, postalCode: address.postalCode ?? "", landmark: address.landmark ?? "", coordinates: address.coordinates ?? null });
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
    try { setState(asyncState.success(await profileService.removeAddress(DONOR_USER_ID, addressId, DONOR_VIEWER))); setNotice("Address removed."); }
    catch (error: unknown) { setNotice(toServiceError(error).message); }
    finally { setBusy(undefined); }
  }

  async function savePin() {
    if (!locationTarget) return;
    setBusy(locationTarget.id); setNotice(undefined);
    try { setState(asyncState.success(await profileService.setAddressCoordinates(DONOR_USER_ID, locationTarget.id, pin, DONOR_VIEWER))); setLocationTarget(undefined); setNotice("Location pin saved. Existing donations and claims keep their original handover locations."); }
    catch (error: unknown) { setNotice(toServiceError(error).message); }
    finally { setBusy(undefined); }
  }

  const profile = state.data;
  const name = profile?.user.displayName ?? "My account";
  return <PortalShell role={role} activeHref={role === "ngo" ? ROUTES.ngo.addresses : ROUTES.donor.addresses} title={role === "ngo" ? tx("Delivery addresses & location pins") : tx("Pickup addresses & location pins")} description={tx("উদ্বৃত্ত খাবার সংগ্রহের সঠিক লোকেশন, ল্যান্ডমার্ক ও হ্যান্ডওভার পয়েন্ট পরিচালনা করুন।")} profileName={name} profileDescription={role === "ngo" ? tx("NGO account") : tx("Donor account")} avatarInitials={getInitials(name)} notificationHref={role === "ngo" ? ROUTES.ngo.notifications : ROUTES.donor.notifications} actions={<Button size="sm" leftIcon={showForm ? <X className="size-4" /> : <Plus className="size-4" />} onClick={() => showForm ? closeForm() : setShowForm(true)}>{showForm ? tx("বন্ধ করুন") : tx("নতুন ঠিকানা যোগ")}</Button>}>
    {state.status === "loading" && !profile && <LoadingSpinner />}
    {state.status === "error" && !profile && <EmptyState icon={RefreshCw} title={tx("Addresses could not load")} description={tx(state.error.message)} action={<Button onClick={() => setRetryKey((value) => value + 1)}><UiText source={"Try again"} /></Button>} />}
    {profile && <div className="grid gap-5">
      {notice && <Alert tone="success" title={tx(notice)} description={tx("Changes are stored in your account database.")} />}
      {locationTarget && <Card><CardHeader title={tx("Set location: {0}", locationTarget.label)} description={tx("New donations and requests will use this saved pin.")} /><CardContent className="grid gap-4"><LocationPicker key={locationTarget.id} value={pin} onChange={setPin} /><div className="flex gap-2"><Button disabled={Boolean(busy)} onClick={() => void savePin()}>{tx("Save location pin")}</Button><Button variant="ghost" onClick={() => setLocationTarget(undefined)}>{tx("Cancel")}</Button></div></CardContent></Card>}
      {showForm && <form onSubmit={submit}><Card><CardHeader title={editingId ? tx("Edit pickup address") : tx("Add pickup address")} description={tx("Use operational details that help verified rescue partners find the handover point.")} /><CardContent className="grid gap-4 sm:grid-cols-2"><Input label={tx("Address label")} value={form.label} error={tx(errors.label)} placeholder={tx("Main kitchen")} onChange={(event) => setForm({ ...form, label: event.target.value })} /><Input label={tx("Area")} value={form.area} error={tx(errors.area)} placeholder={tx("Badda")} onChange={(event) => setForm({ ...form, area: event.target.value })} /><Input label={tx("Division")} value={form.division} error={tx(errors.division)} onChange={(event) => setForm({ ...form, division: event.target.value })} /><Input label={tx("District")} value={form.district} error={tx(errors.district)} onChange={(event) => setForm({ ...form, district: event.target.value })} /><Input label={tx("City")} value={form.city} error={tx(errors.city)} onChange={(event) => setForm({ ...form, city: event.target.value })} /><Input label={tx("Postal code")} value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} /><Input label={tx("Address line")} containerClassName="sm:col-span-2" value={form.addressLine} error={tx(errors.addressLine)} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} /><Input label={tx("Landmark (optional)")} containerClassName="sm:col-span-2" value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} /><div className="sm:col-span-2"><LocationPicker key={editingId || "new"} value={form.coordinates} onChange={(coordinates) => setForm({ ...form, coordinates })} /></div>{errors.form && <Alert className="sm:col-span-2" tone="danger" title={tx("Address could not be saved")} description={tx(errors.form)} />}<div className="flex justify-end gap-2 sm:col-span-2"><Button variant="ghost" onClick={closeForm}>{tx("Cancel")}</Button><Button type="submit" disabled={Boolean(busy)} leftIcon={<Check className="size-4" />}>{busy ? tx("Saving…") : tx("Save address")}</Button></div></CardContent></Card></form>}
      {profile.addresses.length === 0 ? <EmptyState icon={MapPin} title={tx("No saved addresses")} description={tx("Add a pickup address before publishing your next food donation.")} action={<Button onClick={() => setShowForm(true)}><UiText source={"Add address"} /></Button>} /> : <div className="grid gap-4 md:grid-cols-2">{profile.addresses.map((address) => <Card key={address.id} className={address.isPrimary ? "border-brand-300" : undefined}><CardContent><div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700"><MapPin className="size-5" /></span>{address.isPrimary && <Badge tone="success"><Star className="size-3.5" />{tx("Primary")}</Badge>}</div><h2 className="mt-5 text-lg font-black text-ink-900">{address.label}</h2><p className="mt-2 text-sm leading-6 text-muted-600">{address.addressLine}, {address.area}, {address.city} {address.postalCode}</p>{address.landmark && <p className="mt-2 text-xs font-semibold text-muted-500">{tx("Landmark:")}{" "}{address.landmark}</p>}<p className="mt-3 text-xs text-muted-600">{address.coordinates ? tx("Saved pin: {0}, {1}", address.coordinates.latitude, address.coordinates.longitude) : tx("Location pin not set")}</p>{address.coordinates && <a className="mt-2 inline-block text-sm font-bold text-emerald-700" href={navigationUrl(address.coordinates)} target="_blank" rel="noopener noreferrer">{tx("Open directions ↗")}</a>}<div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { setLocationTarget(address); setPin(address.coordinates || null); closeForm(); }}>{tx("Set location pin")}</Button>{!address.isPrimary && <Button size="sm" variant="outline" disabled={busy === address.id} onClick={() => setPrimary(address.id)}>{tx("Set primary")}</Button>}<Button size="sm" variant="ghost" leftIcon={<Edit3 className="size-4" />} disabled={busy === address.id} onClick={() => startEdit(address)}>{tx("Edit")}</Button><Button size="sm" variant="ghost" leftIcon={<Trash2 className="size-4" />} disabled={busy === address.id} onClick={() => remove(address.id)}>{tx("Remove")}</Button></div></CardContent></Card>)}</div>}
    </div>}
  </PortalShell>;
}
