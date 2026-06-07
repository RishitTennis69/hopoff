import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { AppsManager } from '@/features/AppsManager';
import { useAppsStore } from '@/store/appsStore';

export default function OnboardingApps() {
  const router = useRouter();
  const groups = useAppsStore((s) => s.groups);
  const hasGroup = groups.some((g) => g.appIds.length > 0);

  return (
    <OnboardingScreen
      step={4}
      title="Select the apps to limit."
      onNext={() => router.push('/onboarding/goals')}
      onBack={() => router.back()}
      disabled={!hasGroup}
    >
      <AppsManager />
    </OnboardingScreen>
  );
}
