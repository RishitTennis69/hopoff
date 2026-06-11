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

/** Extra schemes to probe on Android (package queries often block getPackageInfo). */
const ANDROID_SCHEME_PROBES: { id: string; schemes: string[] }[] = [
  { id: 'twitter', schemes: ['twitter'] },
  { id: 'tiktok', schemes: ['tiktok', 'snssdk1128', 'musically', 'snssdk1180'] },
  { id: 'youtube', schemes: ['youtube', 'vnd.youtube'] },
  { id: 'youtube_shorts', schemes: ['youtube', 'vnd.youtube'] },
  { id: 'instagram', schemes: ['instagram'] },
  { id: 'instagram_reels', schemes: ['instagram'] },
  { id: 'snapchat', schemes: ['snapchat'] },
  { id: 'reddit', schemes: ['reddit'] },
  { id: 'facebook', schemes: ['fb'] },
];

async function schemeInstalled(scheme: string): Promise<boolean> {
  try {
    return await Linking.canOpenURL(`${scheme}://`);
  } catch {
    return false;
  }
}

function appIdsFromDetectedSchemes(
  probes: { id: string; schemes: string[] }[],
  installedSchemes: Set<string>,
): string[] {
  const ids = new Set<string>();
  for (const { id, schemes } of probes) {
    if (schemes.some((s) => installedSchemes.has(s))) ids.add(id);
  }
  return [...ids];
}

/** Checks URL schemes — native probe first on Android (uses manifest queries). */
async function detectViaUrlSchemes(): Promise<string[]> {
  const probes =
    Platform.OS === 'android'
      ? ANDROID_SCHEME_PROBES
      : APP_PLATFORM_REFS.filter((r) => r.iosScheme).map((r) => ({
          id: r.id,
          schemes: [r.iosScheme!],
        }));

  const allSchemes = [...new Set(probes.flatMap((p) => p.schemes))];

  if (Platform.OS === 'android' && HopoffDevice?.probeUrlSchemes) {
    try {
      const installed = await HopoffDevice.probeUrlSchemes(allSchemes);
      if (__DEV__) console.log('[apps] native scheme probe:', installed);
      return appIdsFromDetectedSchemes(probes, new Set(installed));
    } catch {
      /* fall through */
    }
  }

  const ids = new Set<string>();
  for (const { id, schemes } of probes) {
    for (const scheme of schemes) {
      if (await schemeInstalled(scheme)) {
        ids.add(id);
        break;
      }
    }
  }
  return [...ids];
}

/** Detect catalog apps installed on this device. */
export async function detectInstalledCatalogApps(): Promise<string[]> {
  const ids = new Set<string>();

  if (HopoffDevice) {
    try {
      if (Platform.OS === 'android' && HopoffDevice.getInstalledPackages) {
        const packages = await HopoffDevice.getInstalledPackages(androidPackages());
        const fromPkgs = appIdsForInstalledPackages(packages);
        if (__DEV__) {
          console.log('[apps] native packages found:', packages);
          console.log('[apps] mapped from packages:', fromPkgs);
        }
        for (const id of fromPkgs) ids.add(id);
      }
      if (Platform.OS === 'ios' && HopoffDevice.getInstalledSchemes) {
        const schemes = await HopoffDevice.getInstalledSchemes(iosSchemes());
        for (const id of appIdsForInstalledSchemes(schemes)) ids.add(id);
      }
    } catch {
      /* native module unavailable */
    }
  }

  if (!HopoffDevice && __DEV__ && Platform.OS !== 'web') {
    console.warn('[apps] HopoffDevice native module missing — rebuild dev client for installed-app detection');
  }

  const fromSchemes = await detectViaUrlSchemes();
  for (const id of fromSchemes) ids.add(id);
  if (__DEV__) {
    console.log('[apps] detected via schemes:', fromSchemes);
  }

  // Prefer native package hits; scheme-only hits fill gaps when package visibility is partial.
  if (ids.size) {
    if (__DEV__) {
      console.log('[apps] installed catalog ids:', [...ids]);
    }
    return [...ids];
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

/** Update the catalog filter from packages installed on this device. */
export async function refreshInstalledApps(): Promise<string[]> {
  const installedAppIds = await detectInstalledCatalogApps();
  useAppsStore.getState().setInstalledAppIds(installedAppIds);
  return installedAppIds;
}

/** Refresh installed-app list and week chart from the device. */
export async function syncDeviceData(days = 7): Promise<DeviceSyncResult> {
  try {
    const installedAppIds = await refreshInstalledApps();

    const usageAccessGranted = await hasUsageAccess();
    const usageDaysImported = usageAccessGranted ? await importScreenTimeHistory(days) : 0;

    return { installedAppIds, usageDaysImported, usageAccessGranted };
  } catch {
    return { installedAppIds: [], usageDaysImported: 0, usageAccessGranted: false };
  }
}
