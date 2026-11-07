import { createMockAppState } from "@/data/mock-app-data";
import { DonationStatus } from "@/lib/constants/statuses";
import type { MockAppState } from "@/types/domain";

export type MockAppStateUpdater = (current: MockAppState) => MockAppState;
export type MockAppStoreListener = () => void;

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const ROLLING_SCHEDULE = [
  { id: "donation-dhanmondi-kacchi", safeHours: 2.5, prepHoursAgo: 1, winStartMins: 15, winEndHours: 2.2 },
  { id: "donation-gulshan-buffet", safeHours: 3.2, prepHoursAgo: 1.2, winStartMins: 20, winEndHours: 3.0 },
  { id: "donation-mohakhali-dinner", safeHours: 2.0, prepHoursAgo: 0.8, winStartMins: 10, winEndHours: 1.8 },
  { id: "donation-uiu-bakery-snacks", safeHours: 5.5, prepHoursAgo: 2, winStartMins: 30, winEndHours: 5.0 },
  { id: "donation-badda-pantry", safeHours: 18.0, prepHoursAgo: 4, winStartMins: 60, winEndHours: 16.0 },
  { id: "donation-karwan-produce", safeHours: 12.0, prepHoursAgo: 3, winStartMins: 45, winEndHours: 10.0 },
  { id: "donation-uttara-khichuri", safeHours: 4.5, prepHoursAgo: 1.5, winStartMins: 25, winEndHours: 4.0 },
  { id: "donation-banani-produce", safeHours: 10.0, prepHoursAgo: 2.5, winStartMins: 40, winEndHours: 8.0 },
  { id: "donation-banani-dairy", safeHours: 3.5, prepHoursAgo: 1.0, winStartMins: 20, winEndHours: 3.0 },
];

class MockAppStore {
  private state = createMockAppState();
  private readonly listeners = new Set<MockAppStoreListener>();

  /**
   * Automatically refreshes donation deadlines so available surplus food batches
   * never appear expired regardless of how long the dev server process has been running.
   */
  private ensureFreshDeadlines() {
    const now = Date.now();
    const available = this.state.donations.filter(
      (d) => d.status === DonationStatus.AVAILABLE
    );

    const needsRefresh =
      available.length === 0 ||
      available.some((d) => Date.parse(d.safePickupDeadline) <= now + 20 * 60_000);

    if (needsRefresh) {
      for (const config of ROLLING_SCHEDULE) {
        const donation = this.state.donations.find((d) => d.id === config.id);
        if (donation && donation.status === DonationStatus.AVAILABLE) {
          donation.safePickupDeadline = new Date(now + config.safeHours * 3600_000).toISOString();
          donation.preparationTime = new Date(now - config.prepHoursAgo * 3600_000).toISOString();
          donation.publishedAt = new Date(now - 25 * 60_000).toISOString();
          donation.updatedAt = new Date(now - 10 * 60_000).toISOString();
          donation.pickup.windowStart = new Date(now + config.winStartMins * 60_000).toISOString();
          donation.pickup.windowEnd = new Date(now + config.winEndHours * 3600_000).toISOString();
          if (donation.safetyDeclaration) {
            donation.safetyDeclaration.declaredAt = new Date(now - 20 * 60_000).toISOString();
          }
        }
      }

      // Safeguard for any other dynamically created or active AVAILABLE donations
      for (const donation of this.state.donations) {
        if (
          donation.status === DonationStatus.AVAILABLE &&
          Date.parse(donation.safePickupDeadline) <= now + 20 * 60_000
        ) {
          donation.safePickupDeadline = new Date(now + 4 * 3600_000).toISOString();
          donation.preparationTime = new Date(now - 60 * 60_000).toISOString();
          donation.publishedAt = new Date(now - 20 * 60_000).toISOString();
          donation.pickup.windowStart = new Date(now + 15 * 60_000).toISOString();
          donation.pickup.windowEnd = new Date(now + 3.5 * 3600_000).toISOString();
        }
      }
    }
  }

  getSnapshot = () => {
    this.ensureFreshDeadlines();
    return this.state;
  };

  read() {
    this.ensureFreshDeadlines();
    return cloneState(this.state);
  }

  update(updater: MockAppStateUpdater) {
    this.ensureFreshDeadlines();
    const nextState = updater(cloneState(this.state));
    this.state = cloneState(nextState);
    this.listeners.forEach((listener) => listener());
    return this.read();
  }

  subscribe = (listener: MockAppStoreListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  reset(now = new Date()) {
    this.state = createMockAppState(now);
    this.listeners.forEach((listener) => listener());
  }
}

export const mockAppStore = new MockAppStore();

