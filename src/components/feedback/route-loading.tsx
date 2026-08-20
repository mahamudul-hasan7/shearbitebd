import { BrandLogo } from "@/components/brand/brand-logo";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

export function RouteLoading({ label }: { label: string }) {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BrandLogo />
        <SkeletonGroup label={label} className="mt-10 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 max-w-md" />
            <Skeleton className="h-5 max-w-2xl" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </SkeletonGroup>
      </div>
    </main>
  );
}
