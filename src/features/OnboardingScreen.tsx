import { ReactNode, useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppText } from '@/components/AppText';
import { ScreenTitle } from '@/components/ScreenTitle';
import { PillButton } from '@/components/PillButton';
import { useOnboardingAnalytics } from '@/hooks/useOnboardingAnalytics';
import { ONBOARDING_TOTAL_STEPS } from '@/data/mock';
import { colors, spacing } from '@/theme';

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  ctaLabel?: string;
  onNext: () => void;
  onBack?: () => void;
  onGoToStep?: (step: number) => void;
  disabled?: boolean;
  animateKey?: string | number;
  /** Replace the default footer button. Pass `null` to hide it entirely. */
  footer?: ReactNode | null;
};

function ProgressDots({
  step,
  onGoToStep,
}: {
  step: number;
  onBack?: () => void;
  onGoToStep?: (step: number) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: ONBOARDING_TOTAL_STEPS }).map((_, i) => {
        const done = i < step - 1;
        const current = i === step - 1;
        const goBack = () => {
          if (onGoToStep) onGoToStep(i + 1);
        };
        return (
          <Pressable
            key={i}
            onPress={done ? goBack : undefined}
            disabled={!done}
            hitSlop={8}
          >
            <View
              style={{
                height: 6,
                width: current ? 22 : 6,
                borderRadius: 3,
                backgroundColor: i < step ? colors.text : colors.border,
                opacity: done ? 0.85 : 1,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function OnboardingScreen({
  step,
  title,
  subtitle,
  children,
  ctaLabel = 'Continue',
  onNext,
  onBack,
  onGoToStep,
  disabled,
  animateKey,
  footer,
}: Props) {
  const key = animateKey ?? step;
  const showBack = step > 1 && onBack;
  const showFooter =
    footer !== null && (footer !== undefined || !disabled);

  useOnboardingAnalytics(step, typeof animateKey === 'string' ? animateKey : undefined);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          {showBack ? (
            <Pressable onPress={onBack} hitSlop={12} style={{ padding: spacing.xs }}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path d="M15 6l-6 6 6 6" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <ProgressDots step={step} onBack={onBack} onGoToStep={onGoToStep} />
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View key={key} entering={FadeInRight.duration(280)} exiting={FadeOutLeft.duration(180)}>
            <ScreenTitle>{title}</ScreenTitle>
            {subtitle ? (
              <AppText variant="bodyRegular" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
                {subtitle}
              </AppText>
            ) : null}
            <View style={{ marginTop: spacing.xl }}>{children}</View>
          </Animated.View>
        </ScrollView>
        {showFooter && (
          <View style={{ paddingVertical: spacing.md }}>
            {footer ?? <PillButton label={ctaLabel} onPress={onNext} disabled={disabled} />}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
