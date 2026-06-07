import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { ScreenTitle } from '@/components/ScreenTitle';
import { AppIcon } from '@/components/AppIcon';
import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { getApp } from '@/data/mock';
import { useGoalsStore } from '@/store/goalsStore';
import { useStatsStore } from '@/store/statsStore';
import {
  computeAllTimeHours,
  computeDailyAvgMinutes,
  computeWeekHours,
  computeWeekStats,
  useUsageStore,
} from '@/store/usageStore';
import { buildTimeInsightsWithAi } from '@/utils/ai';
import { buildTimeInsights } from '@/utils/goalInsights';
import { resetApp } from '@/utils/resetApp';
import { colors, spacing } from '@/theme';

export default function Dashboard() {
  const router = useRouter();
  const goalsText = useGoalsStore((s) => s.goalsText);
  const byDay = useUsageStore((s) => s.byDay);
  const reclaimedMinutes = useUsageStore((s) => s.reclaimedMinutes);
  const commitCount = useStatsStore((s) => s.commitCount);
  const wasteCount = useStatsStore((s) => s.wasteCount);

  const weekStats = useMemo(() => computeWeekStats(byDay), [byDay]);
  const weekHours = useMemo(() => computeWeekHours(weekStats), [weekStats]);
  const allTimeHours = useMemo(() => computeAllTimeHours(reclaimedMinutes), [reclaimedMinutes]);
  const dailyAvgMin = useMemo(() => computeDailyAvgMinutes(byDay), [byDay]);
  const commitRate = useMemo(() => {
    const total = commitCount + wasteCount;
    return total === 0 ? 0 : Math.round((commitCount / total) * 100);
  }, [commitCount, wasteCount]);
  const [selected, setSelected] = useState<number | null>(null);
  const [bullets, setBullets] = useState<string[]>(() => buildTimeInsights(goalsText, weekHours || 1));

  useEffect(() => {
    let cancelled = false;
    const hours = weekHours || 1;
    const fallback = buildTimeInsights(goalsText, hours);
    setBullets(fallback);

    buildTimeInsightsWithAi(goalsText, hours).then((ai) => {
      if (!cancelled && ai.length) setBullets(ai);
    });

    return () => {
      cancelled = true;
    };
  }, [goalsText, weekHours]);

  const day = selected !== null ? weekStats[selected] : null;
  const topSpot = day?.softSpots[0];
  const topApp = topSpot ? getApp(topSpot.appId) : null;

  const replayOnboarding = async () => {
    await resetApp();
    router.replace('/onboarding/questions');
  };

  const allTimeDisplay = useMemo(() => {
    if (allTimeHours >= 1) return String(Math.round(allTimeHours));
    return '<1';
  }, [allTimeHours]);

  return (
    <Screen scroll edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <ScreenTitle>What you could have been doing</ScreenTitle>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={10}
            style={({ pressed, hovered }) => ({
              padding: spacing.xs,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : hovered ? 0.85 : 1,
            })}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z"
                stroke={colors.textMuted}
                strokeWidth={1.8}
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
          <Pressable
            onPress={replayOnboarding}
            hitSlop={10}
            style={({ pressed, hovered }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : hovered ? 0.85 : 1,
            })}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path
                d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"
                stroke={colors.textMuted}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <AppText variant="caption" color={colors.textMuted}>
              Log out
            </AppText>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <StatCard label="All-time" value={allTimeDisplay} unit="Hrs" />
        <StatCard label="Daily avg" value={String(dailyAvgMin || 0)} unit="Min" />
        <StatCard label="Commit rate" value={String(commitRate)} unit="%" />
      </View>

      <AppText variant="heading" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        That&apos;s enough time to...
      </AppText>
      <View style={{ gap: spacing.sm }}>
        {bullets.map((b, i) => {
          const isSummary =
            b.startsWith("That's") || b.toLowerCase().includes('reclaimed') || b.toLowerCase().includes('of your');
          return (
            <View key={i} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              {!isSummary && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.text,
                    marginTop: 8,
                  }}
                />
              )}
              <AppText
                variant="bodyRegular"
                color={isSummary ? colors.textMuted : colors.text}
                style={{ flex: 1 }}
              >
                {b}
              </AppText>
            </View>
          );
        })}
      </View>

      <AppText variant="heading" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        Your week
      </AppText>
      <BarChart data={weekStats} selectedIndex={selected} onSelect={setSelected} />

      <AppText variant="heading" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        Your soft spots
      </AppText>
      {day && day.softSpots.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          {day.softSpots.map((spot) => {
            const app = getApp(spot.appId);
            if (!app) return null;
            const hr = spot.hours === 1 ? '1 Hr' : `${spot.hours} Hrs`;
            return (
              <Card
                key={spot.appId}
                tone="dark"
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}
              >
                <AppIcon brandKey={app.brand} size={40} />
                <AppText variant="subheading" color={colors.text} style={{ flex: 1 }}>
                  {app.name}
                </AppText>
                <AppText variant="subheading" color={colors.textMuted}>
                  {hr}
                </AppText>
              </Card>
            );
          })}
        </View>
      ) : (
        <AppText variant="bodyRegular" color={colors.textMuted}>
          {selected !== null
            ? 'No usage recorded for this day yet.'
            : 'Tap a day above to see where your time went.'}
        </AppText>
      )}

      {topApp && (
        <AppText variant="bodyRegular" color={colors.textMuted} center style={{ marginTop: spacing.lg }}>
          You&apos;ve been spending a lot of time on {topApp.name}...
        </AppText>
      )}
      <PillButton
        label="Change my limits"
        variant="dark"
        style={{ marginTop: spacing.md }}
        onPress={() => router.push('/(tabs)/apps')}
      />

      <Pressable
        onPress={() => router.push('/block')}
        style={{ marginTop: spacing.xl, marginBottom: spacing.lg }}
      >
        <AppText variant="small" color={colors.textFaint} center>
          Preview intervention screen
        </AppText>
      </Pressable>
    </Screen>
  );
}
