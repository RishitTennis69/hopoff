import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

type Props = {
  checked: boolean;
  onPress?: () => void;
  size?: number;
  onLight?: boolean;
  /** White ring for visibility on dark thumbnails (same size, no scale). */
  highlightRing?: boolean;
};

export function CheckCircle({ checked, onPress, size = 28, onLight = true, highlightRing = false }: Props) {
  const ring = highlightRing
    ? 'rgba(255,255,255,0.95)'
    : checked
      ? colors.text
      : onLight
        ? colors.borderDark
        : colors.border;

  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: ring,
          backgroundColor: checked ? colors.text : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
            <Path
              d="M20 6L9 17l-5-5"
              stroke={onLight ? '#fff' : colors.bg}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        )}
      </View>
    </Pressable>
  );
}
