import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LIBRARY, type VideoItem } from '@/data/mock';
import { zustandStorage } from './storage';

type VideoState = {
  added: VideoItem[];
  lastImportCount: number;
  seeded: boolean;
  libraryCustomized: boolean;
  addVideo: (v: VideoItem) => boolean;
  updateVideo: (v: VideoItem) => void;
  removeVideo: (id: string) => void;
  addMany: (vids: VideoItem[]) => void;
  isAdded: (id: string) => boolean;
  seedDefaults: () => void;
};

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      added: [],
      lastImportCount: 0,
      seeded: false,
      libraryCustomized: false,
      addVideo: (v) => {
        const exists = get().added.some((x) => x.id === v.id);
        if (exists) return false;
        set((s) => ({ added: [...s.added, v], libraryCustomized: true }));
        return true;
      },
      updateVideo: (v) =>
        set((s) => ({
          added: s.added.map((x) => (x.id === v.id ? { ...x, ...v } : x)),
        })),
      removeVideo: (id) =>
        set((s) => ({ added: s.added.filter((v) => v.id !== id), libraryCustomized: true })),
      addMany: (vids) =>
        set((s) => {
          const existing = new Set(s.added.map((v) => v.id));
          const fresh = vids.filter((v) => !existing.has(v.id));
          return {
            added: [...s.added, ...fresh],
            lastImportCount: fresh.length,
            libraryCustomized: true,
          };
        }),
      isAdded: (id) => get().added.some((v) => v.id === id),
      // Give brand-new users the starter library once. Won't re-seed after
      // they've curated (so removing a default stays removed).
      seedDefaults: () =>
        set((s) => (s.seeded ? {} : { added: [...DEFAULT_LIBRARY], seeded: true })),
    }),
    { name: 'hopoff-videos', storage: zustandStorage },
  ),
);
