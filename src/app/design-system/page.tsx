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
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PageContainer } from "@/components/layout/page-container";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { Dropdown } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload } from "@/components/ui/file-upload";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { RadioGroup } from "@/components/ui/radio-group";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { DonationStatus, RequestStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";

const colors = [
  ["Brand 900", "bg-brand-900", "#04351F"],
  ["Brand 700", "bg-brand-700", "#075632"],
  ["Brand 600", "bg-brand-600", "#0E6B40"],
  ["Brand 100", "bg-brand-100", "#E2F1E5"],
  ["Accent 500", "bg-accent-500", "#F7931E"],
  ["Canvas", "bg-canvas", "#FBFCF9"],
];

const statusSamples = [
  DonationStatus.DRAFT,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
  DonationStatus.PICKED_UP,
  DonationStatus.DELIVERED,
  DonationStatus.DISTRIBUTED,
  DonationStatus.DISPUTED,
  RequestStatus.PENDING_REVIEW,
  RequestStatus.FINDING_MATCH,
];

export const metadata = { title: "Design System" };

export default function DesignSystemPage() {
  return (
    <PageContainer className="py-6 sm:py-8 lg:py-12">
      <main>
        <header className="surface-grid overflow-hidden rounded-panel border border-white/80 bg-white p-6 shadow-card sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <BrandLogo />
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={ROUTES.preview.donor} variant="outline" rightIcon={<ArrowRight className="size-4" />}>Donor preview</ButtonLink>
              <ButtonLink href={ROUTES.preview.ngo} rightIcon={<ArrowRight className="size-4" />}>NGO preview</ButtonLink>
            </div>
          </div>
          <div className="mt-12 max-w-3xl">
            <Badge tone="accent"><Sparkles className="size-3" /> Phase 1 foundation</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-ink-900 sm:text-6xl">One accessible system for every ShareBite BD screen.</h1>
            <p className="mt-5 text-base leading-7 text-muted-600 sm:text-lg">Centralized tokens, reusable controls, lifecycle badges, feedback patterns, and responsive layouts keep donor and NGO experiences consistent.</p>
          </div>
        </header>

        <div className="mt-12 grid gap-12 lg:gap-16">
          <section aria-labelledby="colors-title">
            <SectionHeader title="Brand colors" description="Deep green builds trust, orange signals urgency, and warm off-white keeps dense workflows calm." />
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
            <SectionHeader title="Typography and surfaces" description="Strong headings, readable body copy, 16px controls, shared radii, and tokenized shadows." />
            <Card className="mt-5 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Display</p>
              <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Rescue food before time runs out.</p>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Heading</p>
              <p className="mt-3 text-2xl font-black">Recommended donations near you</p>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Body</p>
              <p className="mt-3 max-w-3xl leading-7 text-muted-600">ShareBite BD connects verified donors, recipient organizations, and volunteers through a clear, accountable rescue workflow.</p>
            </Card>
          </section>

          <section>
            <SectionHeader title="Buttons, icon actions, and dropdown" description="All actions retain visible focus, semantic elements, and minimum touch targets." />
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary action</Button>
                <Button variant="secondary">Urgent action</Button>
                <Button variant="outline">Secondary action</Button>
                <Button variant="ghost">Ghost action</Button>
                <Button variant="danger">Destructive action</Button>
                <IconButton label="Notifications"><Bell className="size-5" /></IconButton>
                <Dropdown label="Quick links" items={[
                  { label: "Design system", href: ROUTES.designSystem, icon: HeartHandshake },
                  { label: "Donor preview", href: ROUTES.preview.donor, icon: PackageCheck },
                  { label: "NGO preview", href: ROUTES.preview.ngo, icon: UsersRound },
                ]} />
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Badges and lifecycle statuses" description="Friendly labels are rendered from centralized domain status values." />
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap gap-2">
                <Badge>Verified NGO</Badge>
                <Badge tone="accent">92% Match</Badge>
                <Badge tone="danger">Critical priority</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {statusSamples.map((status) => <StatusBadge key={status} status={status} />)}
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Text and selection controls" description="Every field has a stable label, help association, invalid state, and touch-friendly sizing." />
            <Card className="mt-5 p-6">
              <ResponsiveGrid columns={2}>
                <Input label="Email address" name="demo-email" placeholder="name@example.com" leftIcon={<Mail className="size-5" />} hint="We will send status updates here." />
                <Input label="Pickup area" name="demo-area" placeholder="Select an approximate area" leftIcon={<MapPin className="size-5" />} />
                <SearchInput name="demo-search" label="Search donations" placeholder="Food, donor, or area" />
                <Select label="Storage condition" name="demo-storage" defaultValue="refrigerated">
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                  <option value="room-temperature">Room temperature</option>
                </Select>
                <Textarea label="Pickup directions" name="demo-directions" placeholder="Add a landmark without exposing private contact details." containerClassName="sm:col-span-2" />
                <Input label="Invalid example" name="demo-invalid" defaultValue="Pickup after deadline" error="Pickup must be before the safe pickup deadline." containerClassName="sm:col-span-2" />
              </ResponsiveGrid>
            </Card>
          </section>

          <section>
            <SectionHeader title="Checkbox, radio group, and switch" />
            <ResponsiveGrid columns={2} className="mt-5">
              <Card className="p-5">
                <Checkbox label="Food is properly covered" name="demo-covered" description="Required before publishing a donation." defaultChecked />
                <div className="mt-3"><Switch label="Nearby donation alerts" description="Frontend preference only in this phase." defaultChecked /></div>
              </Card>
              <Card className="p-5">
                <RadioGroup label="Priority" name="demo-priority" defaultValue="normal" items={[
                  { label: "Normal", value: "normal", description: "Standard matching queue" },
                  { label: "High", value: "high", description: "Requires a clear reason" },
                ]} />
              </Card>
            </ResponsiveGrid>
          </section>

          <section>
            <SectionHeader title="File upload" description="A reusable, labelled upload surface with file-count validation and no storage claims." />
            <Card className="mt-5 p-6">
              <FileUpload label="Verification document" name="demo-document" accept=".pdf,.jpg,.jpeg,.png" hint="PDF, JPG, or PNG · Maximum one file in this example." />
            </Card>
          </section>

          <section>
            <SectionHeader title="Alerts, toast, and loading states" />
            <div className="mt-5 grid gap-3">
              <Alert tone="success" title="Donation published" description="Nearby verified organizations can now discover it." />
              <Alert tone="warning" title="Safe pickup deadline approaching" description="Review the pickup window before assigning a volunteer." />
              <Alert tone="danger" title="Submission blocked" description="Pickup cannot be scheduled after the safe pickup deadline." />
              <Alert tone="info" title="Privacy protected" description="Only approximate area and distance are shown before claim acceptance." />
            </div>
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Toast title="Draft saved" description="Your current frontend form state is preserved." />
                <span className="text-sm text-muted-600">Toast uses a polite live region and remains keyboard dismissible.</span>
              </div>
              <SkeletonGroup label="Loading donation preview" className="mt-7 grid gap-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-28 w-full" />
                <div className="grid grid-cols-3 gap-3"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
              </SkeletonGroup>
            </Card>
          </section>

          <section>
            <SectionHeader title="Modal and drawer" description="Native dialog behavior provides escape handling, focus containment, and backdrop interaction." />
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap gap-3">
                <Modal triggerLabel="Open modal" title="Confirm donation details" description="Review safety and pickup information before publishing.">
                  <Alert title="No medical guarantee" description="ShareBite BD records declarations and traceability but does not certify food safety." />
                </Modal>
                <Drawer triggerLabel="Open drawer" title="Filter donations" description="Drawers keep narrow screens focused without duplicating the page.">
                  <div className="grid gap-3">
                    <Checkbox label="Available now" name="drawer-available" defaultChecked />
                    <Checkbox label="Within 5 km" name="drawer-distance" />
                    <Switch label="High priority only" />
                  </div>
                </Drawer>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Stepper and tabs" description="Progress and section navigation communicate state without relying on color alone." />
            <Card className="mt-5 p-6">
              <Stepper current={2} steps={[
                { label: "Food details", description: "What is available" },
                { label: "Pickup", description: "Where and when" },
                { label: "Safety", description: "Declarations" },
                { label: "Review", description: "Confirm submission" },
              ]} />
              <div className="mt-8"><Tabs label="Donation status filters" items={[
                { label: "All", href: "#tabs", active: true, count: 12 },
                { label: "Available", href: "#tabs", count: 5 },
                { label: "Reserved", href: "#tabs", count: 4 },
                { label: "Delivered", href: "#tabs", count: 3 },
              ]} /></div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Statistics and responsive grid" description="One grid component adapts from a single mobile column to wide dashboard layouts." />
            <ResponsiveGrid columns={4} className="mt-5">
              <StatCard label="Meals rescued" value="1,240" helper="+18% this month" icon={PackageCheck} />
              <StatCard label="People helped" value="980" helper="+72 this week" icon={UsersRound} tone="accent" />
              <StatCard label="Active donations" value="12" helper="3 high priority" icon={Box} tone="info" />
              <StatCard label="Completed" value="86" helper="96% success rate" icon={CheckCircle2} tone="success" />
            </ResponsiveGrid>
          </section>

          <section>
            <SectionHeader title="Card composition and empty state" />
            <ResponsiveGrid columns={2} className="mt-5">
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
              <EmptyState icon={HeartHandshake} title="No suitable donations found" description="Adjust filters, view all available food, or create a food request." action={<Button variant="outline">Adjust filters</Button>} />
            </ResponsiveGrid>
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

          <section>
            <SectionHeader title="Responsive layout foundations" description="AppHeader, DesktopSidebar, MobileBottomNavigation, PageContainer, ResponsiveGrid, and StickyActionBar compose the same content at every breakpoint." />
            <Card className="mt-5 overflow-hidden">
              <div className="surface-grid p-6 sm:p-8">
                <div className="mx-auto max-w-3xl rounded-panel border border-line bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between gap-4 border-b border-line pb-4"><BrandLogo compact /><Badge>PageContainer</Badge></div>
                  <ResponsiveGrid columns={3} className="mt-5"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></ResponsiveGrid>
                  <StickyActionBar className="mt-6"><Button variant="outline">Save draft</Button><Button>Continue</Button></StickyActionBar>
                </div>
              </div>
              <CardContent><p className="text-sm leading-6 text-muted-600">Open the donor and NGO previews to verify the desktop sidebar and five-column mobile navigation using the same route configuration.</p></CardContent>
            </Card>
          </section>
        </div>
      </main>
    </PageContainer>
  );
}
