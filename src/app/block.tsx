import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { EncryptedText } from '@/components/EncryptedText';
import { BlockVideoFrame } from '@/components/BlockVideoFrame';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { pickBlockHeadline } from '@/data/blockHeadlines';
import { TASK_SUGGESTIONS, getApp } from '@/data/mock';
import { useGoalsStore } from '@/store/goalsStore';
import { useStatsStore } from '@/store/statsStore';
import { useUsageStore } from '@/store/usageStore';
import { reclaimedMinutesForCommit } from '@/utils/timeSaved';
import { colors, spacing } from '@/theme';

export default function BlockScreen() {
  const router = useRouter();
  const { appId } = useLocalSearchParams<{ appId?: string }>();
  const goalsText = useGoalsStore((s) => s.goalsText);
  const recordChoice = useStatsStore((s) => s.recordChoice);
  const addReclaimed = useUsageStore((s) => s.addReclaimed);
  const [videoWatched, setVideoWatched] = useState(false);
  const [watchedDurationSec, setWatchedDurationSec] = useState(0);

  const limitedApp = appId ? getApp(appId) : null;

  const headline = useMemo(
    () => pickBlockHeadline(limitedApp?.name),
    [limitedApp?.name],
  );

  const task = useMemo(() => {
    const goals = goalsText
      .split(/\n|,/)
      .map((g) => g.trim())
      .filter(Boolean);
    return goals[0] ?? TASK_SUGGESTIONS[Math.floor(Math.random() * TASK_SUGGESTIONS.length)];
  }, [goalsText]);

  const dismiss = () => router.canGoBack() && router.back();

  const commit = () => {
    recordChoice(true);
    addReclaimed(reclaimedMinutesForCommit(watchedDurationSec));
    dismiss();
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <EncryptedText text={headline.line1} center duration={1400} />
        <EncryptedText text={headline.line2} center duration={1200} delay={280} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg }}>
        <BlockVideoFrame
          onWatched={(durationSec) => {
            setWatchedDurationSec(durationSec);
            setVideoWatched(true);
          }}
        />
      </View>

      {videoWatched ? (
        <Animated.View entering={FadeIn.duration(500)}>
          <AppText variant="body" color={colors.textMuted} center style={{ marginBottom: spacing.md }}>
            Right now you could: {task.toLowerCase()}
          </AppText>
          <PillButton label="I'll commit to do better" onPress={commit} />
        </Animated.View>
      ) : (
        <View style={{ minHeight: 100 }} />
      )}
    </Screen>
  );
}
