import rescueCoordination from "./copy/rescue-coordination.json";
import ngoDiscovery from "./copy/ngo-discovery.json";
import verificationDocuments from "./copy/verification-documents.json";
import adminLogin from "./copy/admin-login.json";
import dashboardConsistency from "./copy/dashboard-consistency.json";
import admin from "./copy/admin.json";
import legacy from "./ui-copy.json";
import banglaA from "./copy/bangla-a.json";
import banglaB from "./copy/bangla-b.json";
import banglaC from "./copy/bangla-c.json";
import banglaD from "./copy/bangla-d.json";
import banglaE from "./copy/bangla-e.json";
import common from "./copy/common.json";
import authPages from "./copy/auth-pages.json";
import distribution from "./copy/distribution.json";
import donationPost from "./copy/donation-post.json";
import donorMobile from "./copy/donor-mobile.json";
import extra from "./copy/extra.json";
import homeHero from "./copy/home-hero.json";
import homeMobile from "./copy/home-mobile.json";
import homeReviews from "./copy/home-reviews.json";
import homeSlogan from "./copy/home-slogan.json";
import loading from "./copy/loading.json";
import ngoDashboard from "./copy/ngo-dashboard.json";
import notificationUi from "./copy/notification-ui.json";
import rescueProgress from "./copy/rescue-progress.json";
import riderOffer from "./copy/rider-offer.json";
import validation from "./copy/validation.json";
import volunteerDuty from "./copy/volunteer-duty.json";
import polish from "./copy/z-polish.json";
import workflows from "./copy/zz-workflows.json";
import operationsA from "./copy/operations-a.json";
import operationsB from "./copy/operations-b.json";
import operationsC from "./copy/operations-c.json";

export type CopyPair = { bn: string; en: string };
export const normalizeUiText = (text: string) => text.replace(/\s+/g, " ").trim();
export const catalogue: Record<string, CopyPair> = { ...legacy };
for (const entries of [banglaA, banglaB, banglaC, banglaD, banglaE, common, authPages, distribution, donationPost, donorMobile, extra, homeHero, homeMobile, homeReviews, homeSlogan, loading, ngoDashboard, notificationUi, operationsA, operationsB, operationsC, rescueProgress, riderOffer, validation, volunteerDuty, polish, workflows, admin, dashboardConsistency, adminLogin, verificationDocuments, ngoDiscovery, rescueCoordination]) {
  for (const [en, bn, ...aliases] of entries) {
    for (const alias of [en, bn, ...aliases]) catalogue[normalizeUiText(alias)] = { en, bn };
  }
}
// Keep old aliases in sync when simpler wording overrides their English key.
for (const [key, pair] of Object.entries(catalogue)) catalogue[key] = catalogue[normalizeUiText(pair.en)] ?? pair;
