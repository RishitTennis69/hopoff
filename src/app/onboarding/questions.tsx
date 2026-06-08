import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { DefaultsConfirmModal } from '@/components/DefaultsConfirmModal';
import { HourWheel } from '@/components/HourWheel';
import { MultiSelectCards } from '@/components/MultiSelectCards';
import { RankingList } from '@/components/RankingList';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { ONBOARDING_QUESTIONS } from '@/data/mock';
import { useOnboardingStore } from '@/store/onboardingStore';
import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/theme';

const DIAL_DEFAULT = 2;

export default function OnboardingQuestions() {
  const router = useRouter();
  const { answers, setAnswer, toggleMulti, initRanking, moveRank } = useOnboardingStore();
  const [index, setIndex] = useState(0);
  const [rankTouched, setRankTouched] = useState(false);
  const [defaultsPrompt, setDefaultsPrompt] = useState<{ message: string } | null>(null);
  const rankDefaultOrder = useRef('');

  const q = ONBOARDING_QUESTIONS[index];

  useEffect(() => {
    if (q.type === 'rank') {
      const ids = q.options.map((o) => o.id);
      rankDefaultOrder.current = ids.join(',');
      initRanking(q.id, ids);
      const order = (answers[q.id] as string[] | undefined) ?? [];
      setRankTouched(order.join(',') !== rankDefaultOrder.current);
    } else {
      setRankTouched(false);
    }
    if (q.type === 'dial' && answers[q.id] === undefined) {
      setAnswer(q.id, DIAL_DEFAULT);
    }
  }, [index]);

  const canContinue = (() => {
    if (q.type === 'multi') {
      const sel = (answers[q.id] as string[] | undefined) ?? [];
      return sel.length > 0;
    }
    if (q.type === 'dial') return typeof answers[q.id] === 'number';
    if (q.type === 'rank') {
      const order = (answers[q.id] as string[] | undefined) ?? [];
      return order.length === q.options.length;
    }
    return false;
  })();

  const advance = () => {
    setDefaultsPrompt(null);
    if (index < ONBOARDING_QUESTIONS.length - 1) setIndex((i) => i + 1);
    else router.push('/onboarding/apps');
  };

  const usingDefaults = () => {
    if (q.type === 'rank' && !rankTouched) {
      return {
        message:
          "You haven't reordered your priorities — we'll use the default order. You can change this anytime.",
      };
    }
    return null;
  };

  const next = () => {
    const prompt = usingDefaults();
    if (prompt) {
      setDefaultsPrompt(prompt);
      return;
    }
    advance();
  };

  const back = () => {
    if (index > 0) setIndex((i) => i - 1);
    else router.back();
  };

  return (
    <>
      <OnboardingScreen
        step={index + 1}
        title={q.question}
        ctaLabel={index < ONBOARDING_QUESTIONS.length - 1 ? 'Next' : 'Continue'}
        onNext={next}
        onBack={back}
        onGoToStep={(s) => setIndex(s - 1)}
        disabled={!canContinue}
        animateKey={`${q.id}-${index}`}
      >
        {q.type === 'multi' && (
          <MultiSelectCards
            options={q.options}
            selected={(answers[q.id] as string[] | undefined) ?? []}
            onToggle={(id) => toggleMulti(q.id, id)}
          />
        )}
        {q.type === 'dial' && (
          <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
            <HourWheel
              hours={(answers[q.id] as number | undefined) ?? DIAL_DEFAULT}
              max={q.max}
              onChange={(v) => setAnswer(q.id, v)}
            />
          </View>
        )}
        {q.type === 'rank' && (
          <>
            <AppText variant="small" color={colors.text} center style={{ marginBottom: spacing.md, opacity: 0.85 }}>
              Tap one item, then tap another to swap — #1 is your top priority
            </AppText>
            <RankingList
            items={q.options}
            order={(answers[q.id] as string[] | undefined) ?? q.options.map((o) => o.id)}
            onReorder={(from, to) => {
              moveRank(q.id, from, to);
              setRankTouched(true);
            }}
          />
          </>
        )}
      </OnboardingScreen>

      <DefaultsConfirmModal
        visible={!!defaultsPrompt}
        message={defaultsPrompt?.message ?? ''}
        onConfirm={advance}
        onCancel={() => setDefaultsPrompt(null)}
      />
    </>
  );
}
