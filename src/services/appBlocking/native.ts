/**
 * Native Screen Time / Accessibility integration.
 * Android: hopoff-device AccessibilityService + UsageStats.
 * iOS: Family Controls entitlement required for full blocking (pending Apple approval).
 */
import { Platform } from 'react-native';
import HopoffDevice from 'hopoff-device';
import { packageForAppId } from '@/data/appPackages';
import type { AppBlockingProvider, AuthorizationResult, MonitoredApp } from './types';

let monitored: MonitoredApp[] = [];

function hasNativeBlocking(): boolean {
  return Platform.OS === 'android' && !!HopoffDevice?.isAccessibilityServiceEnabled;
}

function toNativePayload(apps: MonitoredApp[]) {
  const byPackage = new Map<string, { appId: string; limitMinutes: number }>();
  for (const app of apps) {
    const packageName = packageForAppId(app.appId);
    if (!packageName) continue;
    const limitMinutes = app.limitHours * 60;
    const existing = byPackage.get(packageName);
    if (!existing || limitMinutes < existing.limitMinutes) {
      byPackage.set(packageName, { appId: app.appId, limitMinutes });
    }
  }
  return [...byPackage.entries()].map(([packageName, value]) => ({
    appId: value.appId,
    packageName,
    limitMinutes: value.limitMinutes,
  }));
}

export const nativeAppBlocking: AppBlockingProvider = {
  async requestAuthorization(): Promise<AuthorizationResult> {
    if (hasNativeBlocking()) {
      const granted = await HopoffDevice!.isAccessibilityServiceEnabled();
      return {
        granted,
        needsSettings: !granted,
        message: granted
          ? undefined
          : 'Enable HopOff in Accessibility settings to block apps when limits are reached.',
      };
    }

    return {
      granted: false,
      needsSettings: true,
      message:
        Platform.OS === 'ios'
          ? 'iOS blocking requires the Family Controls entitlement. Open Screen Time settings to prepare, or use a production build after Apple approves the entitlement.'
          : 'Native blocking requires a dev/production build with the HopOff device module. Rebuild after pulling the latest native code.',
    };
  },

  async isAuthorized(): Promise<boolean> {
    if (hasNativeBlocking()) {
      try {
        return await HopoffDevice!.isAccessibilityServiceEnabled();
      } catch {
        return false;
      }
    }
    return false;
  },

  async startMonitoring(apps: MonitoredApp[]): Promise<void> {
    monitored = apps;
    if (HopoffDevice?.setMonitoredApps) {
      try {
        await HopoffDevice.setMonitoredApps(toNativePayload(apps));
      } catch {
        /* native module unavailable */
      }
    }
    if (__DEV__) console.log('[appBlocking] monitoring registered for', apps.length, 'apps');
  },

  async stopMonitoring(): Promise<void> {
    monitored = [];
    if (HopoffDevice?.clearMonitoredApps) {
      try {
        await HopoffDevice.clearMonitoredApps();
      } catch {
        /* ignore */
      }
    }
  },
};

/** Called from native code when a limited app is opened and limit is exceeded. */
export function onNativeLimitExceeded(appId: string) {
  const { useInterventionStore } = require('@/store/interventionStore');
  useInterventionStore.getState().trigger(appId);
}

export function getMonitoredApps(): MonitoredApp[] {
  return monitored;
}
