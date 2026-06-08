import { Linking, Platform } from 'react-native';
import { usePermissionsStore } from '@/store/permissionsStore';
import {
  hasUsageAccess,
  openAccessibilitySettings,
  openUsageAccessSettings,
  syncDeviceData,
} from '@/services/deviceUsage';
import { nativeAppBlocking } from './native';
import type { AppBlockingProvider, AuthorizationResult, MonitoredApp } from './types';

export type { MonitoredApp, AuthorizationResult };

function provider(): AppBlockingProvider {
  return nativeAppBlocking;
}

/** Open the OS screen the user needs right now. */
export async function openPermissionSettings(step: 'accessibility' | 'usage' | 'screen_time'): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      if (step === 'usage') {
        await openUsageAccessSettings();
        return;
      }
      await openAccessibilitySettings();
      return;
    }
    if (step === 'screen_time') {
      const urls = ['App-Prefs:SCREEN_TIME', 'app-prefs:SCREEN_TIME', 'prefs:root=SCREEN_TIME'];
      for (const url of urls) {
        try {
          const can = await Linking.canOpenURL(url);
          if (can) {
            await Linking.openURL(url);
            return;
          }
        } catch {
          /* try next */
        }
      }
      await Linking.openSettings();
      return;
    }
    await Linking.openSettings();
  } catch {
    await Linking.openSettings();
  }
}

export async function requestScreenTimeAccess(): Promise<AuthorizationResult> {
  const result = await provider().requestAuthorization();

  if (result.granted) {
    usePermissionsStore.getState().setScreenTimeAuthorized(true);
    await afterScreenTimeGranted();
    return result;
  }

  if (result.needsSettings) {
    await openPermissionSettings(Platform.OS === 'android' ? 'accessibility' : 'screen_time');
  }

  return result;
}

async function afterScreenTimeGranted(): Promise<void> {
  if (Platform.OS === 'android') {
    const usageOk = await hasUsageAccess();
    if (!usageOk) {
      await openUsageAccessSettings();
    }
  }
  await syncDeviceData(7);
}

export async function confirmScreenTimeAccess(): Promise<boolean> {
  try {
    const authorized = await provider().isAuthorized();
    if (authorized) {
      usePermissionsStore.getState().setScreenTimeAuthorized(true);
      await afterScreenTimeGranted();
      return true;
    }

    if (Platform.OS === 'android') {
      const usageOk = await hasUsageAccess();
      if (!usageOk) return false;
      await syncDeviceData(7);
      usePermissionsStore.getState().setScreenTimeAuthorized(true);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function isScreenTimeAuthorized(): Promise<boolean> {
  if (usePermissionsStore.getState().screenTimeAuthorized) return true;
  return provider().isAuthorized();
}

export async function syncMonitoring(apps: MonitoredApp[]): Promise<void> {
  if (!apps.length) {
    await provider().stopMonitoring();
    return;
  }
  await provider().startMonitoring(apps);
}

export { onNativeLimitExceeded } from './native';
