import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useAppsStore } from '@/store/appsStore';
import { useGoalsStore } from '@/store/goalsStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { usePermissionsStore } from '@/store/permissionsStore';
import { useStatsStore } from '@/store/statsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useUsageStore } from '@/store/usageStore';
import { useVideoStore } from '@/store/videoStore';

const STORAGE_KEYS = [
  'hopoff-onboarding',
  'hopoff-goals',
  'hopoff-stats',
  'hopoff-videos',
  'hopoff-apps',
  'hopoff-usage',
  'hopoff-permissions',
  'hopoff-subscription',
  'hopoff-analytics',
];

/** Clear persisted state and replay onboarding from the welcome screen. */
export async function resetApp() {
  useOnboardingStore.getState().reset();
  useGoalsStore.setState({ goalsText: '', connected: [], notionAccessToken: null });
  useVideoStore.setState({ added: [], lastImportCount: 0, seeded: false, libraryCustomized: false });
  useAppsStore.setState({
    checkedIds: [],
    groups: [],
    draftAppIds: [],
    installedAppIds: useAppsStore.getState().installedAppIds,
  });
  useStatsStore.setState({ commitCount: 0, wasteCount: 0 });
  useUsageStore.setState({ byDay: {}, reclaimedMinutes: 0 });
  usePermissionsStore.getState().reset();
  useSubscriptionStore.getState().reset();
  useAnalyticsStore.getState().reset();

  try {
    await AsyncStorage.multiRemove(STORAGE_KEYS);
  } catch {
    // Non-fatal: in-memory reset already applied.
  }
}
