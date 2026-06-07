import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

export type AnalyticsEvent =
  | { type: 'onboarding_view'; step: string; stepIndex: number }
  | { type: 'onboarding_complete'; step: string; stepIndex: number }
  | { type: 'onboarding_drop'; lastStep: string; lastStepIndex: number };

type AnalyticsState = {
  events: AnalyticsEvent[];
  lastOnboardingStep: string | null;
  lastOnboardingStepIndex: number;
  track: (event: AnalyticsEvent) => void;
  trackOnboardingView: (step: string, stepIndex: number) => void;
  trackOnboardingComplete: (step: string, stepIndex: number) => void;
  reset: () => void;
};

const MAX_EVENTS = 200;

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      events: [],
      lastOnboardingStep: null,
      lastOnboardingStepIndex: 0,

      track: (event) => {
        set((s) => ({
          events: [...s.events, event].slice(-MAX_EVENTS),
        }));
        if (__DEV__) console.log('[analytics]', event);
      },

      trackOnboardingView: (step, stepIndex) => {
        get().track({ type: 'onboarding_view', step, stepIndex });
        set({ lastOnboardingStep: step, lastOnboardingStepIndex: stepIndex });
      },

      trackOnboardingComplete: (step, stepIndex) => {
        get().track({ type: 'onboarding_complete', step, stepIndex });
      },

      reset: () => set({ events: [], lastOnboardingStep: null, lastOnboardingStepIndex: 0 }),
    }),
    { name: 'hopoff-analytics', storage: zustandStorage },
  ),
);
