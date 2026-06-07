/**
 * Native Screen Time / Accessibility integration point.
 *
 * Replace this stub with a custom Expo native module:
 * - iOS: FamilyControls + ManagedSettings + DeviceActivity
 * - Android: AccessibilityService + UsageStatsManager
 *
 * See PRODUCTION.md → "Native blocking module".
 */
import type { AppBlockingProvider, AuthorizationResult, MonitoredApp } from './types';

let monitored: MonitoredApp[] = [];

export const nativeAppBlocking: AppBlockingProvider = {
  async requestAuthorization(): Promise<AuthorizationResult> {
    return {
      granted: false,
      needsSettings: true,
      message:
        'Native blocking requires a dev/production build with the HopOff blocking module. Use Settings to enable Screen Time / Accessibility until the native module is linked.',
    };
  },

  async isAuthorized(): Promise<boolean> {
    return false;
  },

  async startMonitoring(apps: MonitoredApp[]): Promise<void> {
    monitored = apps;
    if (__DEV__) console.log('[appBlocking] native stub — monitoring registered for', apps.length, 'apps');
  },

  async stopMonitoring(): Promise<void> {
    monitored = [];
  },
};

/** Called from native code when a limited app is opened and limit is exceeded. */
export function onNativeLimitExceeded(appId: string) {
  // Lazy import avoids circular deps at module load
  const { useInterventionStore } = require('@/store/interventionStore');
  useInterventionStore.getState().trigger(appId);
}

export function getMonitoredApps(): MonitoredApp[] {
  return monitored;
}
