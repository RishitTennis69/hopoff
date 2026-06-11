import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { CheckCircle } from './CheckCircle';
import type { VideoItem } from '@/data/mock';
import { isDisplayDuration } from '@/utils/videoDuration';
import { linkAuthorName, shortLinkTitle } from '@/utils/videoDisplay';
import { thumbnailSource } from '@/utils/videoThumbnail';
import { colors, glass, radii, spacing } from '@/theme';

type Props = {
  video: VideoItem;
  width: number;
  mode?: 'add' | 'select';
  variant?: 'light' | 'dark';
  active: boolean;
  onToggle: () => void;
  onPlay?: () => void;
  flashAdd?: boolean;
};

function PlayBadge() {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <Path fill="#fff" d="M8 5v14l11-7z" />
      </Svg>
    </View>
  );
}

function AddButton({ active, dark }: { active: boolean; dark: boolean }) {
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: radii.sm,
        backgroundColor: active ? glass.bgSelected : dark ? glass.bgSelected : colors.cardText,
        borderWidth: 1,
        borderColor: glass.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={16} height={16} viewBox="0 0 24 24">
        {active ? (
          <Path
            d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z"
            stroke={dark ? colors.textMuted : colors.card}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : (
          <Path
            d="M12 5v14M5 12h14"
            stroke={dark ? colors.text : colors.card}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </View>
  );
}

export function VideoCard({
  video,
  width,
  mode = 'add',
  variant = 'light',
  active,
  onToggle,
  onPlay,
  flashAdd,
}: Props) {
  const dark = variant === 'dark';
  const thumbH = width * 1.15;
  const isLink = video.kind === 'link';
  const title = isLink ? shortLinkTitle(video.title, video.author, 36) : video.title;
  const author = isLink ? linkAuthorName(video.author) : video.author;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (flashAdd) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 120, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [flashAdd, pulse]);

  const handleAdd = () => {
    Haptics.selectionAsync();
    onToggle();
  };

  if (video.pending) {
    return (
      <Animated.View
        style={{
          width,
          backgroundColor: dark ? glass.bg : colors.card,
          borderRadius: radii.md,
          borderWidth: dark ? 1 : 0,
          borderColor: glass.border,
          padding: spacing.sm,
        }}
      >
        <View
          style={{
            height: thumbH,
            borderRadius: radii.sm,
            backgroundColor: dark ? 'rgba(255,255,255,0.07)' : colors.cardSubtle,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={dark ? colors.text : colors.cardText} />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <AppText variant="small" color={dark ? colors.text : colors.cardText} numberOfLines={1}>
            Video being added…
          </AppText>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        width,
        backgroundColor: dark ? glass.bg : colors.card,
        borderRadius: radii.md,
        borderWidth: dark ? 1 : 0,
        borderColor: glass.border,
        padding: spacing.sm,
        transform: [{ scale: pulse }],
      }}
    >
      <Pressable onPress={onPlay}>
        <View
          style={{
            height: thumbH,
            borderRadius: radii.sm,
            backgroundColor: video.thumbnailUrl ? glass.bg : dark ? 'rgba(255,255,255,0.07)' : video.accent,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {video.thumbnailUrl ? (
            <Image
              source={thumbnailSource(video.thumbnailUrl, video.source)}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : null}
          <PlayBadge />
          {isDisplayDuration(video.duration) ? (
            <View
              style={{
                position: 'absolute',
                bottom: 6,
                left: 8,
                backgroundColor: 'rgba(0,0,0,0.55)',
                borderRadius: 4,
                paddingHorizontal: 5,
                paddingVertical: 1,
              }}
            >
              <AppText variant="caption" color="rgba(255,255,255,0.9)">
                {video.duration}
              </AppText>
            </View>
          ) : null}
          {mode === 'select' && (
            <View style={{ position: 'absolute', bottom: 6, right: 6 }}>
              <CheckCircle checked={active} onPress={handleAdd} size={26} onLight={false} highlightRing />
            </View>
          )}
        </View>
      </Pressable>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: spacing.sm,
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText variant="small" color={dark ? colors.text : colors.cardText} numberOfLines={2}>
            {title}
          </AppText>
          {author ? (
            <AppText variant="caption" color={dark ? colors.textMuted : colors.cardMuted} numberOfLines={1}>
              {author}
            </AppText>
          ) : null}
        </View>
        {mode === 'add' && (
          <Pressable onPress={handleAdd} hitSlop={8}>
            <AddButton active={active} dark={dark} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
