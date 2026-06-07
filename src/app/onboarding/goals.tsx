import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { GoalsEditor } from '@/features/GoalsEditor';
import { useGoalsStore } from '@/store/goalsStore';

export default function OnboardingGoals() {
  const router = useRouter();
  const goalsText = useGoalsStore((s) => s.goalsText);
  const hasGoals = goalsText.trim().length > 0;

  return (
    <OnboardingScreen
      step={5}
      title="Define your weekly goals."
      subtitle="These become the alternatives we surface when you hit a limit."
      onNext={() => router.push('/onboarding/videos')}
      onBack={() => router.back()}
      disabled={!hasGoals}
    >
      <GoalsEditor minHeight={160} />
    </OnboardingScreen>
  );
}
