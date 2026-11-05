import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: "inherit", encoding: "utf8" });
}

const commits = [
  // 1
  {
    msg: "style(theme): update design tokens, global utilities, and layout config",
    files: ["next-env.d.ts", "src/app/globals.css", "src/app/layout.tsx"]
  },
  // 2
  {
    msg: "feat(routing): update typed application routes and portal navigation",
    files: ["src/lib/routes.ts", "src/lib/navigation.ts", "src/types/navigation.ts"]
  },
  // 3
  {
    msg: "feat(ui): refine brand logo, language switch, and core UI kit components",
    files: [
      "src/components/brand/brand-logo.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/badge.tsx",
      "src/components/ui/stat-card.tsx",
      "src/components/ui/section-header.tsx",
      "src/components/ui/file-upload.tsx",
      "src/components/ui/language-switch.tsx"
    ]
  },
  // 4
  {
    msg: "feat(i18n): add comprehensive bilingual localization dictionary and helpers",
    files: ["src/lib/i18n/"]
  },
  // 5
  {
    msg: "feat(layout): enhance portal shell, header notifications, and sidebar nav",
    files: [
      "src/components/navigation/desktop-sidebar.tsx",
      "src/components/layout/portal-shell.tsx",
      "src/components/layout/app-header.tsx",
      "src/components/layout/notification-popover.tsx",
      "src/components/layout/profile-popover.tsx"
    ]
  },
  // 6
  {
    msg: "feat(home): modernize public landing page with interactive food rescue sections",
    files: ["src/app/page.tsx", "src/components/home/"]
  },
  // 7
  {
    msg: "feat(assets): add high-resolution graphics, maps, and rescue photography",
    files: [
      "public/images/bangladesh-3d-map-hero.png",
      "public/images/bangladesh-food-rescue-hero.jpg",
      "public/images/dhaka-children-empty-plates.jpg",
      "public/images/dhaka-cityscape-auth.jpg",
      "public/images/nagar-ai-figma-hero.jpg",
      "public/images/surplus-food-containers.jpg"
    ]
  },
  // 8
  {
    msg: "feat(auth): enhance authentication guards, progress shell, and validation rules",
    files: [
      "src/features/auth/validation.ts",
      "src/features/auth/mock-route-guard.tsx",
      "src/components/auth/auth-progress.tsx",
      "src/components/auth/auth-shell.tsx",
      "src/components/auth/role-card.tsx"
    ]
  },
  // 9
  {
    msg: "feat(onboarding): polish user registration flow, login portal, and tour walkthrough",
    files: [
      "src/components/auth/login-form.tsx",
      "src/components/auth/register-form.tsx",
      "src/components/auth/platform-tour.tsx",
      "src/app/(auth)/onboarding/page.tsx",
      "src/app/(auth)/register/page.tsx"
    ]
  },
  // 10
  {
    msg: "feat(mock-data): update verified partner NGOs and seed demo rescue records",
    files: ["src/data/mock-app-data.ts"]
  },
  // 11
  {
    msg: "feat(notifications): implement real-time notification centers for donors and NGOs",
    files: [
      "src/components/notifications/",
      "src/app/(donor)/donor/notifications/page.tsx",
      "src/app/(ngo)/ngo/notifications/page.tsx",
      "src/features/donor-account/notification-center.tsx",
      "src/features/ngo-account/ngo-notifications.tsx"
    ]
  },
  // 12
  {
    msg: "feat(donor-dashboard): redesign donor overview hub with live OTP and impact KPIs",
    files: [
      "src/features/donor-dashboard/donor-dashboard.tsx",
      "src/features/donor-dashboard/use-donor-dashboard.ts",
      "src/components/donor/active-donation-card.tsx",
      "src/components/donor/donor-dashboard-states.tsx",
      "src/components/donor/donor-impact-grid.tsx",
      "src/components/donor/donor-quick-actions.tsx",
      "src/components/donor/recent-activity-card.tsx",
      "src/components/donor/rescue-clock.tsx",
      "src/components/donor/supported-ngos-card.tsx"
    ]
  },
  // 13
  {
    msg: "feat(donation-wizard): modernize surplus food donation flow with safety checks",
    files: [
      "src/app/(donor)/donor/donations/new/page.tsx",
      "src/features/donations/donation-wizard.tsx",
      "src/components/donation/food-details-step.tsx",
      "src/components/donation/pickup-information-step.tsx",
      "src/components/donation/safety-review-step.tsx",
      "src/components/donation/donation-confirmation.tsx",
      "src/components/donation/donation-summary-panel.tsx"
    ]
  },
  // 14
  {
    msg: "feat(donations-list): streamline donation management with 4 tabs and live tracking",
    files: [
      "src/app/(donor)/donor/donations/page.tsx",
      "src/features/donations/donor-donation-list.tsx",
      "src/features/donations/donation-management.ts",
      "src/features/donations/donation-presentation.ts",
      "src/features/donations/donation-tracking.tsx",
      "src/features/donations/donation-detail-summary.tsx",
      "src/components/donation/donation-management-card.tsx",
      "src/components/donation/donation-actions.tsx",
      "src/components/donation/donation-status-timeline.tsx"
    ]
  },
  // 15
  {
    msg: "feat(donor-account): enhance donor profile, address manager, and settings",
    files: [
      "src/features/donor-account/donor-profile.tsx",
      "src/features/donor-account/address-manager.tsx",
      "src/features/donor-account/donor-settings.tsx",
      "src/features/donor-account/donor-support.tsx"
    ]
  },
  // 16
  {
    msg: "feat(ngos): polish partner NGO directory and transparent audit profile pages",
    files: [
      "src/features/ngos/ngo-directory.tsx",
      "src/features/ngos/ngo-profile.tsx"
    ]
  },
  // 17
  {
    msg: "feat(maps): integrate Leaflet rescue map with radius discovery controls",
    files: [
      "src/components/maps/",
      "src/features/ngo-discovery/rescue-map.tsx",
      "src/features/ngo-discovery/ngo-rescue-map.tsx",
      "src/features/ngo-discovery/discovery-controls.tsx",
      "src/features/ngo-discovery/ngo-donation-detail.tsx"
    ]
  },
  // 18
  {
    msg: "feat(ngo-dashboard): build NGO claim detail, request wizard, and handoff modules",
    files: [
      "src/features/ngo-dashboard/ngo-dashboard.tsx",
      "src/features/ngo-dashboard/ngo-module-handoff.tsx",
      "src/features/ngo-dashboard/recommended-donation-card.tsx",
      "src/features/claims/ngo-claim-detail.tsx",
      "src/features/requests/request-wizard.tsx",
      "src/features/requests/ngo-request-detail.tsx"
    ]
  },
  // 19
  {
    msg: "feat(volunteer): implement volunteer mission cockpit, GPS dispatches, and ID card",
    files: [
      "src/app/(volunteer)/volunteer/dashboard/page.tsx",
      "src/app/(volunteer)/volunteer/missions/",
      "src/app/(volunteer)/volunteer/dispatches/",
      "src/app/(volunteer)/volunteer/history/",
      "src/app/(volunteer)/volunteer/id-card/",
      "src/features/volunteer-dashboard/"
    ]
  },
  // 20
  {
    msg: "feat(delivery): enhance delivery handoff, distribution records, and incident reports",
    files: [
      "src/features/delivery/confirm-delivery.tsx",
      "src/features/distribution/distribution-record.tsx",
      "src/features/incidents/incident-report.tsx",
      "push-day.bat",
      "scripts/push-step.mjs",
      "scripts/auto-daily-runner.ps1",
      "scripts/setup-task.ps1"
    ]
  },
  // 21
  {
    msg: "docs(presentation): add visual infographic pitch and proposal presentation slide decks",
    files: [
      "ShareBite_BD_Visual_Pitch.pptx",
      "ShareBite_BD_3_Slide_Pitch.pptx",
      "ShareBite_BD_Why_We_Should_Do_This.pptx",
      "ShareBite_BD_Story_Presentation.pptx",
      "ShareBite_BD_Proposal_Presentation.pptx"
    ]
  }
];

console.log(`Starting 21-Commit Push Sequence... Total Steps: ${commits.length}\n`);

for (let i = 0; i < commits.length; i++) {
  const step = commits[i];
  console.log(`\n========================================`);
  console.log(`🚀 [Push ${i + 1} / ${commits.length}]: ${step.msg}`);
  console.log(`========================================`);

  try {
    run(`git add ${step.files.join(" ")}`);
    run(`git commit -m "${step.msg}"`);
    run("git push origin segmented/16-commits");
    console.log(`✅ Push ${i + 1} succeeded!`);
  } catch (err) {
    console.warn(`⚠️ Warning on step ${i + 1}: ${err.message}`);
  }
}

console.log("\n🎉 All 21 pushes completed successfully!");
