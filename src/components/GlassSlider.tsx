import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { colors, glass, radii, spacing } from '@/theme';

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  labels: string[];
  onChange: (v: number) => void;
};

const SPRING = { damping: 17, stiffness: 195, mass: 0.85 };

export function GlassSlider({ value, min, max, step = 1, labels, onChange }: Props) {
  const trackW = useRef(280);
  const lastSnapped = useRef(value);
  const isDragging = useRef(false);
  const frac = useSharedValue((value - min) / (max - min));
  const [previewIdx, setPreviewIdx] = useState(value - min);

  useEffect(() => {
    if (!isDragging.current) {
      frac.value = withSpring((value - min) / (max - min), SPRING);
      setPreviewIdx(value - min);
    }
  }, [value, min, max]);

  const onLayout = (e: LayoutChangeEvent) => {
    trackW.current = e.nativeEvent.layout.width;
  };

  const snap = (rawFrac: number) => {
    const raw = min + rawFrac * (max - min);
    const snapped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, snapped));
  };

  const updatePreview = (rawFrac: number) => {
    const clamped = snap(rawFrac);
    setPreviewIdx(clamped - min);
  };

  const commit = (rawFrac: number) => {
    const clamped = snap(rawFrac);
    if (clamped !== lastSnapped.current) {
      lastSnapped.current = clamped;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChange(clamped);
    }
    frac.value = withSpring((clamped - min) / (max - min), SPRING);
    setPreviewIdx(clamped - min);
    isDragging.current = false;
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      isDragging.current = true;
    })
    .onUpdate((e) => {
      const w = trackW.current || 1;
      const f = Math.max(0, Math.min(1, e.x / w));
      frac.value = f;
      runOnJS(updatePreview)(f);
    })
    .onEnd(() => {
      runOnJS(commit)(frac.value);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    isDragging.current = true;
    const w = trackW.current || 1;
    const f = Math.max(0, Math.min(1, e.x / w));
    frac.value = withSpring(f, SPRING, () => {
      runOnJS(commit)(f);
    });
    runOnJS(updatePreview)(f);
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${frac.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${frac.value * 100}%`,
  }));

  const label = labels[previewIdx] ?? `${value}`;

  return (
    <View>
      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View
          onLayout={onLayout}
          style={{
            height: 52,
            justifyContent: 'center',
            backgroundColor: glass.bg,
            borderRadius: radii.pill,
            borderWidth: 1,
            borderColor: glass.border,
            borderTopColor: glass.highlight,
            paddingHorizontal: spacing.lg,
          }}
        >
          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.track,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: colors.text,
                  borderRadius: 3,
                },
                fillStyle,
              ]}
            />
          </View>
          <Animated.View
            style={[
              {
                position: 'absolute',
                marginLeft: -11,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: colors.text,
                borderWidth: 2,
                borderColor: colors.border,
              },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
      <AppText variant="heading" color={colors.text} center style={{ marginTop: spacing.lg }}>
        {label}
      </AppText>
    </View>
  );
}
