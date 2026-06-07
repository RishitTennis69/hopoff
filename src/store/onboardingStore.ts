import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

export type AnswerValue = string | string[] | number;

type OnboardingState = {
  completed: boolean;
  answers: Record<string, AnswerValue>;
  setAnswer: (qid: string, value: AnswerValue) => void;
  toggleMulti: (qid: string, optionId: string) => void;
  moveRank: (qid: string, from: number, to: number) => void;
  initRanking: (qid: string, ids: string[]) => void;
  complete: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completed: false,
      answers: {},
      setAnswer: (qid, value) => set((s) => ({ answers: { ...s.answers, [qid]: value } })),
      toggleMulti: (qid, optionId) =>
        set((s) => {
          const current = (s.answers[qid] as string[] | undefined) ?? [];
          const next = current.includes(optionId)
            ? current.filter((x) => x !== optionId)
            : [...current, optionId];
          return { answers: { ...s.answers, [qid]: next } };
        }),
      initRanking: (qid, ids) => {
        if (get().answers[qid]) return;
        set((s) => ({ answers: { ...s.answers, [qid]: ids } }));
      },
      moveRank: (qid, from, to) =>
        set((s) => {
          const order = [...((s.answers[qid] as string[] | undefined) ?? [])];
          if (from < 0 || from >= order.length || to < 0 || to >= order.length) return {};
          const [item] = order.splice(from, 1);
          order.splice(to, 0, item);
          return { answers: { ...s.answers, [qid]: order } };
        }),
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false, answers: {} }),
    }),
    { name: 'hopoff-onboarding', storage: zustandStorage },
  ),
);
