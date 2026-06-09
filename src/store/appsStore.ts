import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_CATALOG } from '@/data/mock';
import { zustandStorage } from './storage';

/** Empty until native detection runs — avoids showing every catalog app on device. */
const DEFAULT_INSTALLED: string[] = [];

const FULL_CATALOG_IDS = APP_CATALOG.map((a) => a.id);

function isStaleFullCatalog(ids: string[]): boolean {
  return ids.length === FULL_CATALOG_IDS.length && FULL_CATALOG_IDS.every((id) => ids.includes(id));
}

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
  /** Apps on this device — defaults to full catalog until native detection ships. */
  installedAppIds: string[];
  toggleChecked: (id: string) => void;
  selectAllUngrouped: () => void;
  clearChecked: () => void;
  beginGroupFromChecked: () => void;
  finalizeGroup: (name: string, hours: number) => void;
  removeGroup: (id: string) => void;
  setGroupHours: (id: string, hours: number) => void;
  updateGroup: (id: string, patch: Partial<Pick<Group, 'name' | 'hours'>>) => void;
  setInstalledAppIds: (ids: string[]) => void;
  groupedAppIds: () => string[];
};

export const useAppsStore = create<AppsState>()(
  persist(
    (set, get) => ({
      checkedIds: [],
      groups: [],
      draftAppIds: [],
      installedAppIds: DEFAULT_INSTALLED,
      toggleChecked: (id) =>
        set((s) => ({
          checkedIds: s.checkedIds.includes(id)
            ? s.checkedIds.filter((x) => x !== id)
            : [...s.checkedIds, id],
        })),
      selectAllUngrouped: () =>
        set((s) => {
          const grouped = new Set(s.groups.flatMap((g) => g.appIds));
          const ids = s.installedAppIds.filter((id) => !grouped.has(id));
          return { checkedIds: ids };
        }),
      clearChecked: () => set({ checkedIds: [] }),
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
      setInstalledAppIds: (ids) => set({ installedAppIds: ids }),
      groupedAppIds: () => get().groups.flatMap((g) => g.appIds),
    }),
    {
      name: 'hopoff-apps',
      storage: zustandStorage,
      version: 2,
      migrate: (state) => {
        const s = state as AppsState;
        if (s?.installedAppIds && isStaleFullCatalog(s.installedAppIds)) {
          return { ...s, installedAppIds: [] };
        }
        return s;
      },
    },
  ),
);
