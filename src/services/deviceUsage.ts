import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import HopoffDevice from 'hopoff-device';
import { APP_CATALOG } from '@/data/mock';
import {
  androidPackages,
  appIdForPackage,
  appIdsForInstalledPackages,
  appIdsForInstalledSchemes,
  APP_PLATFORM_REFS,
  iosSchemes,
} from '@/data/appPackages';
import { useAppsStore } from '@/store/appsStore';
import { useUsageStore } from '@/store/usageStore';

export type DeviceSyncResult = {
  installedAppIds: string[];
  usageDaysImported: number;
  usageAccessGranted: boolean;
};

/** Detect catalog apps installed on this device. */
export async function detectInstalledCatalogApps(): Promise<string[]> {
  if (HopoffDevice) {
    try {
      if (Platform.OS === 'android' && HopoffDevice.getInstalledPackages) {
        const packages = await HopoffDevice.getInstalledPackages(androidPackages());
        const ids = appIdsForInstalledPackages(packages);
        if (ids.length) return ids;
      }
      if (Platform.OS === 'ios' && HopoffDevice.getInstalledSchemes) {
        const schemes = await HopoffDevice.getInstalledSchemes(iosSchemes());
        const ids = appIdsForInstalledSchemes(schemes);
        if (ids.length) return ids;
      }
    } catch {
      /* native module unavailable */
    }
  }

  if (Platform.OS === 'ios') {
    const ids: string[] = [];
    for (const ref of APP_PLATFORM_REFS) {
      if (!ref.iosScheme) continue;
      try {
        const can = await Linking.canOpenURL(`${ref.iosScheme}://`);
        if (can && !ids.includes(ref.id)) ids.push(ref.id);
      } catch {
        // ignore
      }
    }
    if (ids.length) return ids;
  }

  if (Platform.OS === 'web') {
    return APP_CATALOG.map((a) => a.id);
  }

  return [];
}

/** Import per-app minutes for the last N calendar days (Android Usage Access). */
export async function importScreenTimeHistory(days = 7): Promise<number> {
  if (!HopoffDevice || Platform.OS !== 'android') return 0;

  const hasAccess = await hasUsageAccess();
  if (!hasAccess) return 0;

  let rows: Awaited<ReturnType<NonNullable<typeof HopoffDevice>['queryUsageByDay']>> = [];
  try {
    rows = (await HopoffDevice.queryUsageByDay(androidPackages(), days)) ?? [];
  } catch {
    return 0;
  }
  const entries: { appId: string; minutes: number; dateKey: string }[] = [];

  for (const row of rows) {
    const appId = appIdForPackage(row.packageName);
    if (!appId || row.minutes <= 0) continue;
    entries.push({ appId, minutes: row.minutes, dateKey: row.date });
  }

  if (entries.length) {
    useUsageStore.getState().importFromDevice(entries);
  }

  return new Set(entries.map((e) => e.dateKey)).size;
}

async function launchAndroidSettings(action: string): Promise<boolean> {
  try {
    await IntentLauncher.startActivityAsync(action);
    return true;
  } catch {
    return false;
  }
}

export async function openUsageAccessSettings(): Promise<void> {
  try {
    if (HopoffDevice?.openUsageAccessSettings) {
      await HopoffDevice.openUsageAccessSettings();
      return;
    }
  } catch {
    /* fall through */
  }

  if (Platform.OS === 'android') {
    const opened = await launchAndroidSettings(
      IntentLauncher.ActivityAction.USAGE_ACCESS_SETTINGS,
    );
    if (opened) return;
  }

  await Linking.openSettings();
}

export async function openAccessibilitySettings(): Promise<void> {
  try {
    if (HopoffDevice?.openAccessibilitySettings) {
      await HopoffDevice.openAccessibilitySettings();
      return;
    }
  } catch {
    /* fall through */
  }

  if (Platform.OS === 'android') {
    const opened = await launchAndroidSettings(
      IntentLauncher.ActivityAction.ACCESSIBILITY_SETTINGS,
    );
    if (opened) return;
  }

  await Linking.openSettings();
}

export async function hasUsageAccess(): Promise<boolean> {
  if (!HopoffDevice?.hasUsageAccess) return false;
  try {
    return await HopoffDevice.hasUsageAccess();
  } catch {
    return false;
  }
}

/** Refresh installed-app list and week chart from the device. */
export async function syncDeviceData(days = 7): Promise<DeviceSyncResult> {
  try {
    const installedAppIds = await detectInstalledCatalogApps();
    if (installedAppIds.length) {
      useAppsStore.getState().setInstalledAppIds(installedAppIds);
    }

    const usageAccessGranted = await hasUsageAccess();
    const usageDaysImported = usageAccessGranted ? await importScreenTimeHistory(days) : 0;

    return { installedAppIds, usageDaysImported, usageAccessGranted };
  } catch {
    return { installedAppIds: [], usageDaysImported: 0, usageAccessGranted: false };
  }
}
