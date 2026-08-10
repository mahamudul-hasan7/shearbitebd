import { Building2, Clock3, PackageCheck, Utensils } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { DonorDashboardData } from "@/features/donor-dashboard/types";

export function DonorImpactGrid({ stats }: { stats: DonorDashboardData["stats"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total donations" value={stats.totalDonations.toLocaleString()} helper="Mock all-time history" icon={PackageCheck} />
      <StatCard label="Active donations" value={stats.activeDonations.toLocaleString()} helper="Currently in rescue flow" icon={Clock3} tone="accent" />
      <StatCard label="Meals rescued" value={stats.mealsRescued.toLocaleString()} helper="From completed mock records" icon={Utensils} tone="success" />
      <StatCard label="NGOs helped" value={stats.ngosHelped.toLocaleString()} helper="Verified partner organizations" icon={Building2} tone="info" />
    </div>
  );
}
