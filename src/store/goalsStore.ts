import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

type GoalsState = {
  goalsText: string;
  connected: string[];
  notionAccessToken: string | null;
  notionDatabaseId: string | null;
  goalsPolished: boolean;
  setGoals: (text: string) => void;
  toggleConnected: (id: string) => void;
  setNotionToken: (token: string | null) => void;
  setNotionDatabaseId: (id: string | null) => void;
  setGoalsPolished: (polished: boolean) => void;
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goalsText: '',
      connected: [],
      notionAccessToken: null,
      notionDatabaseId: null,
      goalsPolished: false,
      setGoals: (text) => set({ goalsText: text, goalsPolished: false }),
      toggleConnected: (id) =>
        set((s) => ({
          connected: s.connected.includes(id)
            ? s.connected.filter((x) => x !== id)
            : [...s.connected, id],
        })),
      setNotionToken: (token) => set({ notionAccessToken: token }),
      setNotionDatabaseId: (id) => set({ notionDatabaseId: id }),
      setGoalsPolished: (polished) => set({ goalsPolished: polished }),
    }),
    { name: 'hopoff-goals', storage: zustandStorage },
  ),
);
