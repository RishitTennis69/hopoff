import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayStat } from '@/data/mock';
import { zustandStorage } from './storage';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type DayKey = string; // YYYY-MM-DD

type UsageState = {
  /** Minutes per app per calendar day */
  byDay: Record<DayKey, Record<string, number>>;
  /** Total reclaimed minutes from successful interventions */
  reclaimedMinutes: number;
  addUsage: (appId: string, minutes: number, date?: Date) => void;
  addReclaimed: (minutes: number) => void;
  getWeekStats: () => DayStat[];
  getWeekHours: () => number;
  getAllTimeHours: () => number;
  getDailyAvgMinutes: () => number;
  getTodayUsageForApps: (appIds: string[]) => number;
};

function dayKey(d = new Date()): DayKey {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): { key: DayKey; label: string }[] {
  const out: { key: DayKey; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ key: dayKey(d), label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1] ?? 'Mon' });
  }
  return out;
}

/** Pure helpers — safe to use in useMemo; do not use as Zustand selectors. */
export function computeWeekStats(byDay: Record<DayKey, Record<string, number>>): DayStat[] {
  return lastNDays(5).map(({ key, label }) => {
    const apps = byDay[key] ?? {};
    const softSpots = Object.entries(apps)
      .map(([appId, minutes]) => ({ appId, hours: Math.round((minutes / 60) * 10) / 10 }))
      .filter((s) => s.hours > 0)
      .sort((a, b) => b.hours - a.hours);
    const hours = Math.round(softSpots.reduce((sum, s) => sum + s.hours, 0) * 10) / 10;
    return { day: label, hours, softSpots };
  });
}

export function computeWeekHours(stats: DayStat[]): number {
  return Math.round(stats.reduce((sum, d) => sum + d.hours, 0) * 10) / 10;
}

export function computeAllTimeHours(reclaimedMinutes: number): number {
  return Math.round((reclaimedMinutes / 60) * 10) / 10;
}

export function computeDailyAvgMinutes(byDay: Record<DayKey, Record<string, number>>): number {
  const keys = Object.keys(byDay);
  if (!keys.length) return 0;
  const total = keys.reduce(
    (sum, k) => sum + Object.values(byDay[k] ?? {}).reduce((a, m) => a + m, 0),
    0,
  );
  return Math.round(total / keys.length);
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      byDay: {},
      reclaimedMinutes: 0,

      addUsage: (appId, minutes, date = new Date()) => {
        if (minutes <= 0) return;
        const key = dayKey(date);
        set((s) => {
          const day = { ...(s.byDay[key] ?? {}) };
          day[appId] = (day[appId] ?? 0) + minutes;
          return { byDay: { ...s.byDay, [key]: day } };
        });
      },

      addReclaimed: (minutes) => {
        if (minutes <= 0) return;
        set((s) => ({ reclaimedMinutes: s.reclaimedMinutes + minutes }));
      },

      getWeekStats: () => computeWeekStats(get().byDay),

      getWeekHours: () => computeWeekHours(get().getWeekStats()),

      getAllTimeHours: () => computeAllTimeHours(get().reclaimedMinutes),

      getDailyAvgMinutes: () => computeDailyAvgMinutes(get().byDay),

      getTodayUsageForApps: (appIds) => {
        const today = get().byDay[dayKey()] ?? {};
        return appIds.reduce((sum, id) => sum + (today[id] ?? 0), 0);
      },
    }),
    { name: 'hopoff-usage', storage: zustandStorage },
  ),
);
