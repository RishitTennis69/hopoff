import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, G } from 'react-native-svg';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { getApp } from '@/data/mock';
import { colors } from '@/theme';

type Props = {
  appIds?: string[];
  hours: number;
  onChange: (hours: number) => void;
  max?: number;
  size?: number;
  /** Arc + knob color. Defaults to white to match the B&W system. */
  accent?: string;
};

const SPRING = { damping: 20, stiffness: 140 };

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function HourWheel({
  appIds = [],
  hours,
  onChange,
  max = 7,
  size = 240,
  accent = colors.text,
}: Props) {
  const lastHours = useRef(hours);
  const angleAccum = useRef(0);
  const lastAngle = useRef<number | null>(null);
  const displayFrac = useSharedValue(hours / max);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 24;

  useEffect(() => {
    displayFrac.value = withSpring(hours / max, SPRING);
    angleAccum.current = (hours / max) * Math.PI * 2;
  }, [hours, max]);

  const apply = (h: number) => {
    const clamped = Math.max(1, Math.min(max, h));
    if (clamped !== lastHours.current) {
      lastHours.current = clamped;
      onChange(clamped);
    }
    displayFrac.value = withSpring(clamped / max, SPRING);
  };

  const fromTouch = (x: number, y: number) => {
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    if (lastAngle.current !== null) {
      let delta = angle - lastAngle.current;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      const resistance = 1 + (lastHours.current / max) * 2.2;
      angleAccum.current += delta / resistance;

      const step = (Math.PI * 2) / max;
      const next = Math.round(angleAccum.current / step) || 1;
      const clamped = Math.max(1, Math.min(max, next));
      displayFrac.value = clamped / max;
      if (clamped !== lastHours.current) apply(clamped);
    } else {
      const fraction = angle / (Math.PI * 2);
      const h = Math.max(1, Math.min(max, Math.round(fraction * max) || 1));
      angleAccum.current = (h / max) * Math.PI * 2;
      displayFrac.value = h / max;
      apply(h);
    }
    lastAngle.current = angle;
  };

  const resetDrag = () => {
    lastAngle.current = null;
  };

  const pan = Gesture.Pan()
    .onBegin((e) => runOnJS(fromTouch)(e.x, e.y))
    .onUpdate((e) => runOnJS(fromTouch)(e.x, e.y))
    .onEnd(() => runOnJS(resetDrag)());

  const fraction = hours / max;
  const endDeg = -90 + Math.min(fraction, 0.9999) * 360;
  const knob = polar(cx, cy, r, endDeg);
  const hasApps = appIds.length > 0;
  const n = hasApps ? appIds.length : max;

  const centerStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + displayFrac.value * 0.15,
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      <GestureDetector gesture={pan}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Circle cx={cx} cy={cy} r={r} stroke={colors.border} strokeWidth={2} fill="none" />
            {Array.from({ length: n }).map((_, i) => {
              const p1 = polar(cx, cy, r - 10, -90 + (360 / n) * i);
              const p2 = polar(cx, cy, r + 10, -90 + (360 / n) * i);
              return (
                <Line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={colors.border}
                  strokeWidth={2}
                />
              );
            })}
            {hours > 0 && (
              <Path
                d={arcPath(cx, cy, r, -90, endDeg)}
                stroke={accent}
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            )}
            <G>
              <Circle cx={knob.x} cy={knob.y} r={13} fill={accent} />
              <Circle cx={knob.x} cy={knob.y} r={5} fill={colors.bg} />
            </G>
          </Svg>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
              },
              centerStyle,
            ]}
            pointerEvents="none"
          >
            <AppText variant="hero" color={colors.text}>
              {hours}
            </AppText>
            <AppText variant="small" color={colors.textMuted}>
              {hours === 1 ? 'Hour' : 'Hours'}
            </AppText>
          </Animated.View>
        </View>
      </GestureDetector>
      {hasApps && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
          {appIds.map((id) => {
            const app = getApp(id);
            return app ? <AppIcon key={id} brandKey={app.brand} size={40} /> : null;
          })}
        </View>
      )}
    </View>
  );
}
