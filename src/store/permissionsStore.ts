import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

type PermissionsState = {
  screenTimeAuthorized: boolean;
  micAuthorized: boolean;
  setScreenTimeAuthorized: (v: boolean) => void;
  setMicAuthorized: (v: boolean) => void;
  reset: () => void;
};

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set) => ({
      screenTimeAuthorized: false,
      micAuthorized: false,
      setScreenTimeAuthorized: (v) => set({ screenTimeAuthorized: v }),
      setMicAuthorized: (v) => set({ micAuthorized: v }),
      reset: () => set({ screenTimeAuthorized: false, micAuthorized: false }),
    }),
    { name: 'hopoff-permissions', storage: zustandStorage },
  ),
);
