import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

export type Group = {
  id: string;
  name: string;
  appIds: string[];
  hours: number;
};

type AppsState = {
  checkedIds: string[];
  groups: Group[];
  draftAppIds: string[];
  toggleChecked: (id: string) => void;
  beginGroupFromChecked: () => void;
  finalizeGroup: (name: string, hours: number) => void;
  removeGroup: (id: string) => void;
  setGroupHours: (id: string, hours: number) => void;
  updateGroup: (id: string, patch: Partial<Pick<Group, 'name' | 'hours'>>) => void;
  groupedAppIds: () => string[];
};

export const useAppsStore = create<AppsState>()(
  persist(
    (set, get) => ({
      checkedIds: [],
      groups: [],
      draftAppIds: [],
      toggleChecked: (id) =>
        set((s) => ({
          checkedIds: s.checkedIds.includes(id)
            ? s.checkedIds.filter((x) => x !== id)
            : [...s.checkedIds, id],
        })),
      beginGroupFromChecked: () => set((s) => ({ draftAppIds: [...s.checkedIds] })),
      finalizeGroup: (name, hours) =>
        set((s) => {
          if (s.draftAppIds.length === 0) return {};
          const group: Group = {
            id: `g-${Date.now()}`,
            name: name.trim() || 'My Group',
            appIds: [...s.draftAppIds],
            hours,
          };
          return {
            groups: [group, ...s.groups],
            checkedIds: s.checkedIds.filter((id) => !s.draftAppIds.includes(id)),
            draftAppIds: [],
          };
        }),
      removeGroup: (id) => set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),
      setGroupHours: (id, hours) =>
        set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, hours } : g)) })),
      updateGroup: (id, patch) =>
        set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      groupedAppIds: () => get().groups.flatMap((g) => g.appIds),
    }),
    { name: 'hopoff-apps', storage: zustandStorage },
  ),
);
