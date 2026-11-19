"use client";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const tx = useUiText();
  return (
    <div role="alert" className="p-6">
      <p className="mb-4">{tx("Could not load the admin workspace.")}</p>
      <Button onClick={reset}>{tx("Try again")}</Button>
    </div>
  );
}
