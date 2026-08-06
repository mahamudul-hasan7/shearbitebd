import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Box,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Mail,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";

const colors = [
  ["Brand 900", "bg-brand-900", "#04351F"],
  ["Brand 700", "bg-brand-700", "#075632"],
  ["Brand 600", "bg-brand-600", "#0E6B40"],
  ["Brand 100", "bg-brand-100", "#E2F1E5"],
  ["Accent 500", "bg-accent-500", "#F7931E"],
  ["Canvas", "bg-canvas", "#FBFCF9"],
];

export const metadata = { title: "Design System" };

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="surface-grid overflow-hidden rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <BrandLogo />
          <div className="flex gap-2">
            <Link href="/preview/donor"><Button variant="outline" rightIcon={<ArrowRight className="size-4" />}>Donor preview</Button></Link>
            <Link href="/preview/ngo"><Button rightIcon={<ArrowRight className="size-4" />}>NGO preview</Button></Link>
          </div>
        </div>
        <div className="mt-12 max-w-3xl">
          <Badge tone="accent"><Sparkles className="size-3" /> Phase 1 foundation</Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-ink-900 sm:text-6xl">A consistent system for every ShareBite BD screen.</h1>
          <p className="mt-5 text-base leading-7 text-muted-600 sm:text-lg">Reusable tokens, components and responsive layouts make the donor and NGO portals easier for one developer to maintain.</p>
        </div>
      </header>

      <div className="mt-12 grid gap-12">
        <section>
          <SectionHeader title="Brand colors" description="Centralized tokens prevent inconsistent shades across screens." />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {colors.map(([label, color, hex]) => (
              <Card key={label} className="overflow-hidden">
                <div className={`h-24 ${color}`} />
                <div className="p-4"><p className="text-sm font-extrabold">{label}</p><p className="mt-1 text-xs text-muted-600">{hex}</p></div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Typography" description="Strong headings, readable labels and quiet supporting text." />
          <Card className="mt-5 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Display / 48</p>
            <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Rescue food before time runs out.</p>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Heading / 28</p>
            <p className="mt-3 text-2xl font-black">Recommended donations near you</p>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Body / 16</p>
            <p className="mt-3 max-w-3xl leading-7 text-muted-600">ShareBite BD connects verified donors, recipient organizations and volunteers through a clear, accountable rescue workflow.</p>
          </Card>
        </section>

        <section>
          <SectionHeader title="Buttons and badges" />
          <Card className="mt-5 p-6">
            <div className="flex flex-wrap gap-3">
              <Button>Primary action</Button>
              <Button variant="secondary">Urgent action</Button>
              <Button variant="outline">Secondary action</Button>
              <Button variant="ghost">Ghost action</Button>
              <Button variant="danger">Destructive action</Button>
              <IconButton label="Notifications"><Bell className="size-5" /></IconButton>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>Verified NGO</Badge><Badge tone="accent">92% Match</Badge><Badge tone="success">Delivered</Badge><Badge tone="warning">Reserved</Badge><Badge tone="danger">Critical</Badge><Badge tone="info">Assigned</Badge>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeader title="Form controls" description="Designed for mobile touch targets and desktop efficiency." />
          <Card className="mt-5 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Email address" placeholder="name@example.com" leftIcon={<Mail className="size-5" />} hint="We will send status updates here." />
              <Input label="Pickup location" placeholder="Select a location" leftIcon={<MapPin className="size-5" />} />
              <Input label="Search donations" placeholder="Food, donor or area" leftIcon={<Search className="size-5" />} />
              <Input label="Invalid example" defaultValue="Wrong value" error="Please review this field." />
            </div>
          </Card>
        </section>

        <section>
          <SectionHeader title="Statistics and tabs" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Meals rescued" value="1,240" helper="+18% this month" icon={PackageCheck} />
            <StatCard label="People helped" value="980" helper="+72 this week" icon={UsersRound} tone="accent" />
            <StatCard label="Active donations" value="12" helper="3 high priority" icon={Box} tone="info" />
            <StatCard label="Completed" value="86" helper="96% success rate" icon={CheckCircle2} tone="success" />
          </div>
          <div className="mt-5"><Tabs items={[{ label: "All", href: "#", active: true, count: 12 }, { label: "Available", href: "#", count: 5 }, { label: "Reserved", href: "#", count: 4 }, { label: "Delivered", href: "#", count: 3 }]} /></div>
        </section>

        <section>
          <SectionHeader title="Card composition" />
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Veg Meal Pack" description="UIU Cafeteria · 40 meal packs" action={<Badge tone="danger">High priority</Badge>} />
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><p className="text-xs text-muted-600">Distance</p><p className="mt-1 font-extrabold">1.2 km</p></div>
                  <div><p className="text-xs text-muted-600">Rescue time</p><p className="mt-1 font-extrabold text-danger">01:45:32</p></div>
                  <div><p className="text-xs text-muted-600">Match score</p><p className="mt-1 font-extrabold text-brand-700">92%</p></div>
                </div>
                <Button fullWidth className="mt-6" rightIcon={<ArrowRight className="size-4" />}>View details</Button>
              </CardContent>
            </Card>
            <EmptyState icon={HeartHandshake} title="No suitable donations found" description="Adjust filters, view all available food or create a food request." action={<Button variant="outline">Adjust filters</Button>} />
          </div>
        </section>

        <section>
          <SectionHeader title="Identity and trust" />
          <Card className="mt-5 p-6">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar initials="HF" size="lg" />
              <div><div className="flex items-center gap-2"><p className="text-xl font-black">Hope Foundation</p><ShieldCheck className="size-5 text-brand-600" /></div><p className="mt-1 text-sm text-muted-600">Verified NGO · Dhanmondi, Dhaka</p></div>
              <div className="ml-auto flex gap-2"><IconButton label="Calendar"><CalendarDays className="size-5" /></IconButton><Button variant="outline">View profile</Button></div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
