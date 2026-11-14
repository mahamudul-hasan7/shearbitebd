"use client";
import { useUiText } from "./use-ui-text";
export function UiText({ source, values = [] }: { source: string; values?: unknown[] }) {
  const tx = useUiText();
  return <>{tx(source, ...values)}</>;
}
