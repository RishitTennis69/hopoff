import { useEffect, useState } from 'react';
import { LayoutChangeEvent, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { colors, radii, spacing } from '@/theme';

const FEED = [
  { accent: '#161616', tag: 'For You' },
  { accent: '#1d1d1d', tag: 'Trending' },
  { accent: '#141414', tag: 'For You' },
  { accent: '#202020', tag: 'Viral' },
  { accent: '#181818', tag: 'For You' },
  { accent: '#1a1a1a', tag: 'Trending' },
];

function PlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#fff" d="M8 5v14l11-7z" />
    </Svg>
  );
}

function FeedCard({ accent, tag, height }: { accent: string; tag: string; height: number }) {
  return (
    <View
      style={{
        height,
        borderRadius: radii.md,
        backgroundColor: accent,
        marginBottom: 10,
        padding: spacing.md,
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <AppText variant="caption" color="rgba(255,255,255,0.6)">
            {tag}
          </AppText>
        </View>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlayGlyph size={16} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.18)' }} />
            <View style={{ height: 7, width: '38%', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)' }} />
          </View>
          <View style={{ height: 7, width: '70%', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)' }} />
        </View>
        <View style={{ gap: 9, alignItems: 'center', marginLeft: spacing.md }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.16)' }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type Props = { style?: ViewStyle };

export function PhoneMockup({ style }: Props) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const feedY = useSharedValue(0);
  const overlay = useSharedValue(0);

  const cardH = dims ? dims.h * 0.34 : 0;
  const gap = 10;
  const listH = FEED.length * (cardH + gap);

  useEffect(() => {
    if (!dims) return;
    feedY.value = 0;
    feedY.value = withRepeat(
      withTiming(-listH, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
    overlay.value = withRepeat(
      withSequence(
        withDelay(2800, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })),
        withDelay(2600, withTiming(0, { duration: 650, easing: Easing.in(Easing.cubic) })),
      ),
      -1,
      false,
    );
  }, [dims, listH, feedY, overlay]);

  const feedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: feedY.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const overlayContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - overlay.value) * 18 }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDims({ w: width, h: height });
  };

  return (
    <View
      style={[
        {
          flex: 1,
          alignSelf: 'center',
          aspectRatio: 9 / 19,
          backgroundColor: '#0c0c0c',
          borderRadius: 40,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.14)',
          padding: 10,
        },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: 14,
          alignSelf: 'center',
          width: 86,
          height: 22,
          borderRadius: 12,
          backgroundColor: '#000',
          zIndex: 5,
        }}
      />
      <View
        onLayout={onLayout}
        style={{
          flex: 1,
          borderRadius: 30,
          backgroundColor: '#000',
          overflow: 'hidden',
        }}
      >
        {dims && (
          <>
            <Animated.View
              style={[
                { position: 'absolute', left: spacing.sm, right: spacing.sm, top: spacing.xl },
                feedStyle,
              ]}
            >
              {[...FEED, ...FEED].map((c, i) => (
                <FeedCard key={i} accent={c.accent} tag={c.tag} height={cardH} />
              ))}
            </Animated.View>

            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.82)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: spacing.lg,
                },
                overlayStyle,
              ]}
            >
              <Animated.View style={[{ alignItems: 'center' }, overlayContentStyle]}>
                <AppText variant="caption" color={colors.textMuted} style={{ letterSpacing: 1 }}>
                  HOPOFF
                </AppText>
                <View
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 33,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.5)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginVertical: spacing.lg,
                  }}
                >
                  <PlayGlyph size={26} />
                </View>
                <AppText variant="heading" color={colors.text} center>
                  Your reason{'\n'}is calling.
                </AppText>
                <AppText
                  variant="small"
                  color={colors.textMuted}
                  center
                  style={{ marginTop: spacing.sm }}
                >
                  We swap the feed for your goals.
                </AppText>
              </Animated.View>
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
}
