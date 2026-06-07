import { useEffect } from 'react';
import { useAnalyticsStore } from '@/store/analyticsStore';

const STEP_NAMES = [
  'questions',
  'apps',
  'goals',
  'videos',
  'permissions',
  'paywall',
] as const;

export function onboardingStepName(stepIndex: number): string {
  if (stepIndex <= 3) return 'questions';
  return STEP_NAMES[stepIndex - 1] ?? `step-${stepIndex}`;
}

export function useOnboardingAnalytics(step: number, stepKey?: string) {
  const trackView = useAnalyticsStore((s) => s.trackOnboardingView);

  useEffect(() => {
    const name = stepKey ?? onboardingStepName(step);
    trackView(name, step);
  }, [step, stepKey, trackView]);
}

export function trackOnboardingStepComplete(step: number, stepKey?: string) {
  const name = stepKey ?? onboardingStepName(step);
  useAnalyticsStore.getState().trackOnboardingComplete(name, step);
}
