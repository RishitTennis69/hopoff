export type MonitoredApp = {
  appId: string;
  /** Daily limit in hours (shared across group members) */
  limitHours: number;
  groupId: string;
};

export type AuthorizationResult = {
  granted: boolean;
  /** User may need to finish setup in Settings */
  needsSettings?: boolean;
  message?: string;
};

export type AppBlockingProvider = {
  requestAuthorization: () => Promise<AuthorizationResult>;
  isAuthorized: () => Promise<boolean>;
  startMonitoring: (apps: MonitoredApp[]) => Promise<void>;
  stopMonitoring: () => Promise<void>;
};
