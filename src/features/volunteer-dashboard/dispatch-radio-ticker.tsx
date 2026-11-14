"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
export function DispatchRadioTicker() {
  const tx = useUiText();
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">{tx("Rescue communication")}</h3><p className="mt-2 text-sm text-muted-600">{tx("Radio messaging is not connected. Use the donor/NGO phone number in your assigned mission.")}</p></section>;
}
