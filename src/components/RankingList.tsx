import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';
import { OnboardingIcon } from './OnboardingIcons';
import { colors, spacing } from '@/theme';

type Item = { id: string; label: string; icon: string };

type Props = {
  items: Item[];
  order: string[];
  onReorder: (from: number, to: number) => void;
};

const ROW_H = 68;
const GAP = spacing.sm;
const STEP = ROW_H + GAP;
const SPRING = { damping: 19, stiffness: 185 };

export function RankingList({ items, order, onReorder }: Props) {
  const lookup = Object.fromEntries(items.map((i) => [i.id, i]));
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);

  const move = (from: number, to: number) => {
    if (from !== to) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onReorder(from, to);
    }
    setDrag(null);
  };

  return (
    <View style={{ position: 'relative' }}>
      {drag && drag.to !== drag.from && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: drag.to * STEP,
            height: ROW_H,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: colors.text,
            borderStyle: 'dashed',
            opacity: 0.5,
            zIndex: 0,
          }}
        />
      )}

      <View style={{ gap: GAP }}>
        {order.map((id, index) => {
          const item = lookup[id];
          if (!item) return null;
          return (
            <RankRow
              key={id}
              item={item}
              rank={index + 1}
              index={index}
              total={order.length}
              dragging={drag?.from === index}
              onStart={(from) => setDrag({ from, to: from })}
              onMove={(from, to) => setDrag({ from, to })}
              onEnd={move}
            />
          );
        })}
      </View>
    </View>
  );
}

function RankRow({
  item,
  rank,
  index,
  total,
  dragging,
  onStart,
  onMove,
  onEnd,
}: {
  item: Item;
  rank: number;
  index: number;
  total: number;
  dragging: boolean;
  onStart: (from: number) => void;
  onMove: (from: number, to: number) => void;
  onEnd: (from: number, to: number) => void;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startIdx = useRef(index);
  const lastTo = useRef(index);

  const reportMove = (ty: number) => {
    const to = Math.max(0, Math.min(total - 1, startIdx.current + Math.round(ty / STEP)));
    if (to !== lastTo.current) {
      lastTo.current = to;
      onMove(startIdx.current, to);
    }
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      startIdx.current = index;
      lastTo.current = index;
      scale.value = withSpring(1.04, SPRING);
      runOnJS(onStart)(index);
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
      runOnJS(reportMove)(e.translationY);
    })
    .onEnd((e) => {
      const to = Math.max(0, Math.min(total - 1, startIdx.current + Math.round(e.translationY / STEP)));
      runOnJS(onEnd)(startIdx.current, to);
      translateY.value = withSpring(0, SPRING);
      scale.value = withSpring(1, SPRING);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    zIndex: translateY.value !== 0 ? 10 : 1,
  }));

  return (
    <Animated.View entering={FadeIn.delay(index * 40)} style={style}>
      <GestureDetector gesture={pan}>
        <GlassCard
          selected={dragging}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.md,
            minHeight: ROW_H,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText variant="body" color={colors.text}>
              {rank}
            </AppText>
          </View>
          <OnboardingIcon name={item.icon} size={26} color={colors.text} />
          <AppText variant="subheading" color={colors.text} style={{ flex: 1 }}>
            {item.label}
          </AppText>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
              stroke={colors.textMuted}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </GlassCard>
      </GestureDetector>
    </Animated.View>
  );
}
