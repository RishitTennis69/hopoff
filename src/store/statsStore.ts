import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

type StatsState = {
  commitCount: number;
  wasteCount: number;
  recordChoice: (committed: boolean) => void;
  commitRate: () => number;
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      commitCount: 0,
      wasteCount: 0,
      recordChoice: (committed) =>
        set((s) =>
          committed ? { commitCount: s.commitCount + 1 } : { wasteCount: s.wasteCount + 1 },
        ),
      commitRate: () => {
        const { commitCount, wasteCount } = get();
        const total = commitCount + wasteCount;
        return total === 0 ? 0 : Math.round((commitCount / total) * 100);
      },
    }),
    { name: 'hopoff-stats', storage: zustandStorage },
  ),
);
