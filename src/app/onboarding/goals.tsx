import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { PillButton } from '@/components/PillButton';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { GoalsEditor, type GoalsEditorHandle } from '@/features/GoalsEditor';
import { useGoalsStore } from '@/store/goalsStore';

export default function OnboardingGoals() {
  const router = useRouter();
  const editorRef = useRef<GoalsEditorHandle>(null);
  const [polishing, setPolishing] = useState(false);
  const goalsText = useGoalsStore((s) => s.goalsText);
  const goalsPolished = useGoalsStore((s) => s.goalsPolished);
  const hasGoals = goalsText.trim().length > 0;
  const canContinue = hasGoals && goalsPolished && !polishing;

  useEffect(() => {
    if (!hasGoals) {
      useGoalsStore.setState({ goalsPolished: false });
    }
  }, [hasGoals]);

  const footer = (
    <PillButton
      label="Continue"
      onPress={() => router.push('/onboarding/videos')}
      disabled={!canContinue}
      loading={polishing}
      fullWidth
    />
  );

  return (
    <OnboardingScreen
      step={5}
      title="Define your weekly goals."
      subtitle="These become the alternatives we surface when you hit a limit."
      onNext={() => router.push('/onboarding/videos')}
      onBack={() => router.back()}
      footer={footer}
    >
      <GoalsEditor
        ref={editorRef}
        minHeight={208}
        hidePolishButton
        autoPolishOnBlur
        onPolishingChange={setPolishing}
      />
    </OnboardingScreen>
  );
}
