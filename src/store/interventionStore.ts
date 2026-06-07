import { create } from 'zustand';

type InterventionState = {
  /** App that triggered the block overlay, if any */
  pendingAppId: string | null;
  trigger: (appId: string) => void;
  clear: () => void;
};

export const useInterventionStore = create<InterventionState>((set) => ({
  pendingAppId: null,
  trigger: (appId) => set({ pendingAppId: appId }),
  clear: () => set({ pendingAppId: null }),
}));
