import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import type { DayStat } from '@/data/mock';
import { colors } from '@/theme';

type Props = {
  data: DayStat[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  height?: number;
};

export function BarChart({ data, selectedIndex, onSelect, height = 180 }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(4, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      true,
    );
  }, [bounce]);

  const cueStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bounce.value }] }));

  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  const worstIndex = data.reduce((best, d, i) => (d.hours > data[best].hours ? i : best), 0);
  const axisPad = 6;
  const chartH = height - 22;
  const slot = width / data.length;
  const barW = Math.min(slot * 0.5, 38);
  const worstBarH = (data[worstIndex].hours / maxHours) * (chartH - 12);

  const handle = (i: number) => {
    Haptics.selectionAsync();
    onSelect(i);
  };

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <>
          <Svg width={width} height={chartH}>
            <Line x1={axisPad} y1={0} x2={axisPad} y2={chartH} stroke={colors.border} strokeWidth={1} />
            <Line
              x1={axisPad}
              y1={chartH - 1}
              x2={width}
              y2={chartH - 1}
              stroke={colors.border}
              strokeWidth={1}
            />
            {data.map((d, i) => {
              const h = (d.hours / maxHours) * (chartH - 12);
              const x = i * slot + (slot - barW) / 2;
              const selected = selectedIndex === i;
              return (
                <Rect
                  key={d.day}
                  x={x}
                  y={chartH - h - 1}
                  width={barW}
                  height={h}
                  rx={5}
                  fill={selected ? colors.text : selectedIndex === null ? colors.textMuted : colors.textFaint}
                />
              );
            })}
          </Svg>

          {selectedIndex === null && (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  width: slot,
                  left: worstIndex * slot,
                  top: Math.max(chartH - worstBarH - 30, 0),
                  alignItems: 'center',
                },
                cueStyle,
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  backgroundColor: colors.text,
                  borderRadius: 999,
                  paddingVertical: 2,
                  paddingHorizontal: 7,
                }}
              >
                <AppText variant="caption" color={colors.bg}>
                  Tap
                </AppText>
                <Svg width={10} height={10} viewBox="0 0 24 24">
                  <Path d="M6 9l6 6 6-6" stroke={colors.bg} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
            </Animated.View>
          )}

          <View style={{ flexDirection: 'row', height: chartH, position: 'absolute', width }}>
            {data.map((d, i) => (
              <Pressable key={d.day} style={{ flex: 1 }} onPress={() => handle(i)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {data.map((d, i) => (
              <View key={d.day} style={{ flex: 1, alignItems: 'center' }}>
                <AppText
                  variant="caption"
                  color={selectedIndex === i ? colors.textMuted : colors.text}
                >
                  {d.day}
                </AppText>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
