import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

type SubscriptionState = {
  status: SubscriptionStatus;
  planId: 'monthly' | 'annual' | null;
  trialStartedAt: string | null;
  expiresAt: string | null;
  setFromPurchase: (planId: 'monthly' | 'annual', trialDays?: number) => void;
  activateSubscription: (planId: 'monthly' | 'annual') => void;
  setStatus: (status: SubscriptionStatus, expiresAt?: string | null) => void;
  isPremium: () => boolean;
  /** True when the free week ended and user has not subscribed. */
  isTrialExpired: () => boolean;
  /** Trial ended and user must subscribe — blocks the app behind the paywall. */
  mustSubscribe: () => boolean;
  /** Dev only — backdate trial so the post-trial popup appears. */
  expireTrialForTesting: () => void;
  reset: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      status: 'none',
      planId: null,
      trialStartedAt: null,
      expiresAt: null,
      setFromPurchase: (planId, trialDays = 7) => {
        const now = new Date();
        const expires = new Date(now);
        expires.setDate(expires.getDate() + trialDays);
        set({
          status: 'trial',
          planId,
          trialStartedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
        });
      },

      activateSubscription: (planId) =>
        set({
          status: 'active',
          planId,
          trialStartedAt: null,
          expiresAt: null,
        }),

      setStatus: (status, expiresAt = null) => set({ status, expiresAt }),

      isPremium: () => {
        const { status, expiresAt } = get();
        if (status === 'trial' || status === 'active') {
          if (expiresAt && new Date(expiresAt) < new Date()) return false;
          return true;
        }
        return false;
      },

      isTrialExpired: () => {
        const { status, expiresAt } = get();
        if (status === 'expired') return true;
        if (status === 'trial' && expiresAt && new Date(expiresAt) < new Date()) return true;
        return false;
      },

      mustSubscribe: () => get().isTrialExpired() && !get().isPremium(),

      expireTrialForTesting: () => {
        const past = new Date();
        past.setDate(past.getDate() - 1);
        set({
          status: 'trial',
          planId: 'annual',
          trialStartedAt: past.toISOString(),
          expiresAt: past.toISOString(),
        });
      },

      reset: () =>
        set({
          status: 'none',
          planId: null,
          trialStartedAt: null,
          expiresAt: null,
        }),
    }),
    { name: 'hopoff-subscription', storage: zustandStorage },
  ),
);
