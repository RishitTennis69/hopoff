import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

type GoalsState = {
  goalsText: string;
  connected: string[];
  notionAccessToken: string | null;
  setGoals: (text: string) => void;
  toggleConnected: (id: string) => void;
  setNotionToken: (token: string | null) => void;
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goalsText: '',
      connected: [],
      notionAccessToken: null,
      setGoals: (text) => set({ goalsText: text }),
      toggleConnected: (id) =>
        set((s) => ({
          connected: s.connected.includes(id)
            ? s.connected.filter((x) => x !== id)
            : [...s.connected, id],
        })),
      setNotionToken: (token) => set({ notionAccessToken: token }),
    }),
    { name: 'hopoff-goals', storage: zustandStorage },
  ),
);
