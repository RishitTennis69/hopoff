import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { Card } from './Card';
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

function swapDuration(from: number, to: number) {
  const dist = Math.abs(to - from);
  return 120 + dist * 100;
}

/** Rank 1 = brightest; lower priority = more muted. */
function rankColor(rank: number, total: number): string {
  if (rank === 1) return colors.text;
  const t = (rank - 1) / Math.max(total - 1, 1);
  const opacity = 0.92 - t * 0.38;
  return `rgba(255,255,255,${opacity.toFixed(2)})`;
}

type SwapState = { from: number; to: number };

export function RankingList({ items, order, onReorder }: Props) {
  const lookup = Object.fromEntries(items.map((i) => [i.id, i]));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [swap, setSwap] = useState<SwapState | null>(null);

  const onTap = (index: number) => {
    if (swap) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      Haptics.selectionAsync();
      return;
    }
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    const from = selectedIndex;
    const to = index;
    const duration = swapDuration(from, to);

    setSelectedIndex(null);
    setSwap({ from, to });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      onReorder(from, to);
      setSwap(null);
    }, duration);
  };

  return (
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
            selected={selectedIndex === index}
            swap={swap}
            onPress={() => onTap(index)}
          />
        );
      })}
    </View>
  );
}

function RankRow({
  item,
  rank,
  index,
  total,
  selected,
  swap,
  onPress,
}: {
  item: Item;
  rank: number;
  index: number;
  total: number;
  selected: boolean;
  swap: SwapState | null;
  onPress: () => void;
}) {
  const translateY = useSharedValue(0);
  const labelColor = rankColor(rank, total);

  useEffect(() => {
    if (!swap) {
      translateY.value = 0;
      return;
    }

    const duration = swapDuration(swap.from, swap.to);
    if (swap.from === index) {
      translateY.value = withTiming((swap.to - swap.from) * STEP, { duration });
    } else if (swap.to === index) {
      translateY.value = withTiming((swap.from - swap.to) * STEP, { duration });
    } else {
      translateY.value = 0;
    }
  }, [swap, index, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: translateY.value !== 0 ? 10 : 1,
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={onPress} disabled={!!swap}>
        <Card
          tone="dark"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.md,
            minHeight: ROW_H,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? colors.text : colors.border,
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
            <AppText variant="body" color={labelColor}>
              {rank}
            </AppText>
          </View>
          <OnboardingIcon name={item.icon} size={26} color={labelColor} />
          <AppText variant="subheading" color={labelColor} style={{ flex: 1 }}>
            {item.label}
          </AppText>
          {selected ? (
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M20 6L9 17l-5-5"
                stroke={colors.text}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          ) : (
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
                stroke={colors.textMuted}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          )}
        </Card>
      </Pressable>
    </Animated.View>
  );
}
