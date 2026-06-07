import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { DefaultsConfirmModal } from '@/components/DefaultsConfirmModal';
import { PillButton } from '@/components/PillButton';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { CollectionManager, type SelectModeState } from '@/features/CollectionManager';
import { useVideoStore } from '@/store/videoStore';

export default function OnboardingVideos() {
  const router = useRouter();
  const count = useVideoStore((s) => s.added.length);
  const libraryCustomized = useVideoStore((s) => s.libraryCustomized);
  const seedDefaults = useVideoStore((s) => s.seedDefaults);
  const enough = count >= 1;
  const [showDefaultsPrompt, setShowDefaultsPrompt] = useState(false);
  const [selectMode, setSelectMode] = useState<SelectModeState>({
    active: false,
    selectedCount: 0,
    confirm: () => {},
  });

  useEffect(() => {
    seedDefaults();
  }, [seedDefaults]);

  const selectLabel =
    selectMode.selectedCount === 0
      ? 'Done'
      : `Add ${selectMode.selectedCount} video${selectMode.selectedCount > 1 ? 's' : ''}`;

  const advance = () => {
    setShowDefaultsPrompt(false);
    router.push('/onboarding/permissions');
  };

  const onNext = () => {
    if (!libraryCustomized) {
      setShowDefaultsPrompt(true);
      return;
    }
    advance();
  };

  return (
    <>
      <OnboardingScreen
        step={6}
        title="Here's your starter library."
        subtitle="We added three to get you going. Make it yours"
        ctaLabel={enough ? 'Continue' : 'Add at least one video'}
        disabled={!enough}
        onNext={onNext}
        onBack={() => router.back()}
        footer={
          selectMode.active ? (
            <PillButton label={selectLabel} onPress={selectMode.confirm} />
          ) : undefined
        }
      >
        <CollectionManager onSelectModeChange={setSelectMode} />
      </OnboardingScreen>

      <DefaultsConfirmModal
        visible={showDefaultsPrompt}
        message="You haven't added or changed any videos — we'll keep the starter picks we chose for you. You can customize your library anytime."
        onConfirm={advance}
        onCancel={() => setShowDefaultsPrompt(false)}
      />
    </>
  );
}
