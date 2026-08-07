import { createMockAppState } from "@/data/mock-app-data";
import type { MockAppState } from "@/types/domain";

export type MockAppStateUpdater = (current: MockAppState) => MockAppState;
export type MockAppStoreListener = () => void;

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

class MockAppStore {
  private state = createMockAppState();
  private readonly listeners = new Set<MockAppStoreListener>();

  getSnapshot = () => this.state;

  read() {
    return cloneState(this.state);
  }

  update(updater: MockAppStateUpdater) {
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
