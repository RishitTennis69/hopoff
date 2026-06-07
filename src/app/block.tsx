import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { VideoStage } from '@/components/VideoStage';
import { TASK_SUGGESTIONS, getApp } from '@/data/mock';
import { useGoalsStore } from '@/store/goalsStore';
import { useStatsStore } from '@/store/statsStore';
import { useUsageStore } from '@/store/usageStore';
import { colors, spacing } from '@/theme';

export default function BlockScreen() {
  const router = useRouter();
  const { appId } = useLocalSearchParams<{ appId?: string }>();
  const goalsText = useGoalsStore((s) => s.goalsText);
  const recordChoice = useStatsStore((s) => s.recordChoice);
  const addReclaimed = useUsageStore((s) => s.addReclaimed);
  const [showWaste, setShowWaste] = useState(false);

  const limitedApp = appId ? getApp(appId) : null;

  const task = useMemo(() => {
    const goals = goalsText
      .split(/\n|,/)
      .map((g) => g.trim())
      .filter(Boolean);
    return goals[0] ?? TASK_SUGGESTIONS[Math.floor(Math.random() * TASK_SUGGESTIONS.length)];
  }, [goalsText]);

  useEffect(() => {
    const t = setTimeout(() => setShowWaste(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => router.canGoBack() && router.back();

  const commit = () => {
    recordChoice(true);
    addReclaimed(15);
    dismiss();
  };
  const waste = () => {
    recordChoice(false);
    dismiss();
  };

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(700)}>
        <AppText variant="title" center>
          {limitedApp ? `${limitedApp.name} can wait.` : 'Set down your phone.'}
          {'\n'}Enjoy real life.
        </AppText>
      </Animated.View>

      <View style={{ flex: 1, justifyContent: 'center', paddingVertical: spacing.lg }}>
        <VideoStage style={{ width: '100%', aspectRatio: 9 / 16, maxHeight: '100%' }} muted={false} />
      </View>

      <Animated.View entering={FadeIn.delay(500).duration(700)}>
        <AppText variant="body" color={colors.textMuted} center style={{ marginBottom: spacing.md }}>
          Right now you could: {task.toLowerCase()}
        </AppText>
        <PillButton label="I'll commit to do better" onPress={commit} />
      </Animated.View>

      <View style={{ height: 44, marginTop: spacing.lg, alignItems: 'center' }}>
        {showWaste && (
          <Animated.View entering={FadeIn.duration(900)}>
            <Pressable onPress={waste} hitSlop={10}>
              <AppText variant="small" color={colors.textFaint}>
                I&apos;m going to waste my life...
              </AppText>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}
