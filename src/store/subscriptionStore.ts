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
  setStatus: (status: SubscriptionStatus, expiresAt?: string | null) => void;
  isPremium: () => boolean;
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

      setStatus: (status, expiresAt = null) => set({ status, expiresAt }),

      isPremium: () => {
        const { status, expiresAt } = get();
        if (status === 'trial' || status === 'active') {
          if (expiresAt && new Date(expiresAt) < new Date()) return false;
          return true;
        }
        return false;
      },

      reset: () =>
        set({ status: 'none', planId: null, trialStartedAt: null, expiresAt: null }),
    }),
    { name: 'hopoff-subscription', storage: zustandStorage },
  ),
);
