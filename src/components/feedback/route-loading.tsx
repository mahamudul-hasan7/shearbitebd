import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function RouteLoading({ label }: { label: string }) {
  return <main className="min-h-svh bg-canvas"><LoadingSpinner label={label} fullPage /></main>;
}
