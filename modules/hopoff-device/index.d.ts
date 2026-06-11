export type UsageRow = {
  packageName: string;
  date: string;
  minutes: number;
};

export type MonitoredAppConfig = {
  appId: string;
  packageName: string;
  limitMinutes: number;
};

export type LimitExceededEvent = {
  appId: string;
};

type EventSubscription = { remove: () => void };

type HopoffDeviceNative = {
  getInstalledPackages(packages: string[]): Promise<string[]>;
  probeUrlSchemes(schemes: string[]): Promise<string[]>;
  getInstalledSchemes(schemes: string[]): Promise<string[]>;
  hasUsageAccess(): Promise<boolean>;
  isAccessibilityServiceEnabled(): Promise<boolean>;
  setMonitoredApps(apps: MonitoredAppConfig[]): Promise<void>;
  clearMonitoredApps(): Promise<void>;
  openUsageAccessSettings(): Promise<void>;
  openAccessibilitySettings(): Promise<void>;
  openPackage(packageName: string): Promise<boolean>;
  queryUsageByDay(packages: string[], days: number): Promise<UsageRow[]>;
  addListener(event: 'onLimitExceeded', listener: (event: LimitExceededEvent) => void): EventSubscription;
};

declare const HopoffDevice: HopoffDeviceNative | null;

export default HopoffDevice;
