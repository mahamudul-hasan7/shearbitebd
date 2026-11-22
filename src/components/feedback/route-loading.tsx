import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function RouteLoading({ label }: { label: string }) {
  return (
    <main className="min-h-[60svh] bg-canvas">
      <LoadingSpinner label={label} className="min-h-[60svh]" />
    </main>
  );
}
