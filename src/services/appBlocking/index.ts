import { Linking, Platform } from 'react-native';
import { usePermissionsStore } from '@/store/permissionsStore';
import { nativeAppBlocking } from './native';
import type { AppBlockingProvider, AuthorizationResult, MonitoredApp } from './types';

export type { MonitoredApp, AuthorizationResult };

/** Dev/prod entry — swaps to native module when linked. */
function provider(): AppBlockingProvider {
  return nativeAppBlocking;
}

export async function requestScreenTimeAccess(): Promise<AuthorizationResult> {
  const result = await provider().requestAuthorization();

  if (result.granted) {
    usePermissionsStore.getState().setScreenTimeAuthorized(true);
    return result;
  }

  // Interim: deep-link to OS settings so the user can enable access manually.
  if (result.needsSettings) {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:SCREEN_TIME').catch(() => Linking.openSettings());
      } else {
        await Linking.openSettings();
      }
    } catch {
      await Linking.openSettings();
    }
  }

  return result;
}

export async function confirmScreenTimeAccess(): Promise<boolean> {
  const authorized = await provider().isAuthorized();
  if (authorized) {
    usePermissionsStore.getState().setScreenTimeAuthorized(true);
    return true;
  }
  // Dev builds without native module: user confirms after visiting Settings.
  usePermissionsStore.getState().setScreenTimeAuthorized(true);
  return true;
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
