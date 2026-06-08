import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import HopoffDevice from 'hopoff-device';
import { useRouter, usePathname } from 'expo-router';
import { useAppsStore } from '@/store/appsStore';
import { useInterventionStore } from '@/store/interventionStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { usePermissionsStore } from '@/store/permissionsStore';
import { useUsageStore } from '@/store/usageStore';
import { syncMonitoring, type MonitoredApp } from '@/services/appBlocking';
import { syncDeviceData } from '@/services/deviceUsage';

/**
 * Keeps native monitoring in sync with app groups and opens the block overlay
 * when an intervention is triggered.
 */
export function useAppBlockingMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const completed = useOnboardingStore((s) => s.completed);
  const screenTimeAuthorized = usePermissionsStore((s) => s.screenTimeAuthorized);
  const groups = useAppsStore((s) => s.groups);
  const pendingAppId = useInterventionStore((s) => s.pendingAppId);
  const clearIntervention = useInterventionStore((s) => s.clear);
  const bgAt = useRef<number | null>(null);

  // Refresh installed apps + screen time history when monitoring is active.
  useEffect(() => {
    if (!completed || !screenTimeAuthorized || Platform.OS === 'web') return;
    syncDeviceData(7).catch(() => {});
  }, [completed, screenTimeAuthorized]);

  // Sync monitored apps whenever groups change.
  useEffect(() => {
    if (!completed || !screenTimeAuthorized) return;
    const installed = new Set(useAppsStore.getState().installedAppIds);
    const apps: MonitoredApp[] = groups.flatMap((g) =>
      g.appIds
        .filter((appId) => installed.has(appId))
        .map((appId) => ({
          appId,
          limitHours: g.hours,
          groupId: g.id,
        })),
    );
    syncMonitoring(apps).catch(() => {});
  }, [completed, screenTimeAuthorized, groups]);

  // Native limit events (Android AccessibilityService).
  useEffect(() => {
    if (!HopoffDevice?.addListener) return;
    const sub = HopoffDevice.addListener('onLimitExceeded', ({ appId }) => {
      useInterventionStore.getState().trigger(appId);
    });
    return () => sub.remove();
  }, []);

  // Dev simulation: returning from background adds usage to test the block overlay.
  useEffect(() => {
    if (!__DEV__) return;
    if (!completed || !screenTimeAuthorized || Platform.OS === 'web') return;
    if (!groups.length) return;

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        bgAt.current = Date.now();
        return;
      }
      if (state !== 'active' || bgAt.current === null) return;

      const awayMin = Math.max(1, Math.round((Date.now() - bgAt.current) / 60_000));
      bgAt.current = null;

      const group = groups[0];
      if (!group?.appIds.length) return;
      const appId = group.appIds[0];
      useUsageStore.getState().addUsage(appId, Math.min(awayMin, 15));

      const limitMin = group.hours * 60;
      const used = useUsageStore.getState().getTodayUsageForApps(group.appIds);
      if (used >= limitMin) {
        useInterventionStore.getState().trigger(appId);
      }
    });

    return () => sub.remove();
  }, [completed, screenTimeAuthorized, groups]);

  // Navigate to block overlay when triggered (skip if already there).
  useEffect(() => {
    if (!pendingAppId || pathname === '/block') return;
    router.push({ pathname: '/block', params: { appId: pendingAppId } });
    clearIntervention();
  }, [pendingAppId, pathname, router, clearIntervention]);
}
