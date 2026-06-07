import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { VideoCard } from '@/components/VideoCard';
import { getSavedVideos, type BrandKey } from '@/data/mock';
import { useVideoStore } from '@/store/videoStore';
import { colors, spacing } from '@/theme';

export default function ImportModal() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const brandKey = (source as BrandKey) ?? 'tiktok';
  const addMany = useVideoStore((s) => s.addMany);

  const saved = useMemo(() => getSavedVideos(brandKey), [brandKey]);
  const [selected, setSelected] = useState<string[]>([]);
  const [width, setWidth] = useState(0);

  const gap = spacing.md;
  const cardW = width > 0 ? (width - gap) / 2 : 0;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const confirm = () => {
    const vids = saved.filter((v) => selected.includes(v.id));
    addMany(vids);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (router.canGoBack()) router.back();
  };

  const title = brandKey === 'tiktok' ? 'TikTok Saved' : 'Instagram Saved';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen scroll edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
          <AppText variant="title" style={{ flex: 1 }}>
            {title}
          </AppText>
          <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={10}>
            <Svg width={26} height={26} viewBox="0 0 24 24">
              <Path d="M6 6l12 12M18 6L6 18" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
        <AppText variant="bodyRegular" color={colors.textMuted} style={{ marginBottom: spacing.lg }}>
          Pick the motivational clips you&apos;ve saved.
        </AppText>

        <View
          onLayout={onLayout}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap, paddingBottom: 90 }}
        >
          {cardW > 0 &&
            saved.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                width={cardW}
                mode="select"
                variant="dark"
                active={selected.includes(v.id)}
                onToggle={() => toggle(v.id)}
              />
            ))}
        </View>
      </Screen>

      {selected.length > 0 && (
        <View style={{ position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: spacing.xxl }}>
          <PillButton label={`Add ${selected.length} videos`} onPress={confirm} />
        </View>
      )}
    </View>
  );
}
