import { useRef, useState } from 'react';
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

  const footer = goalsPolished ? (
    <PillButton label="Continue" onPress={() => router.push('/onboarding/videos')} fullWidth />
  ) : (
    <PillButton
      label="Polish my list"
      onPress={async () => {
        setPolishing(true);
        await editorRef.current?.polish();
        setPolishing(false);
      }}
      disabled={!hasGoals}
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
      <GoalsEditor ref={editorRef} minHeight={160} hidePolishButton />
    </OnboardingScreen>
  );
}
