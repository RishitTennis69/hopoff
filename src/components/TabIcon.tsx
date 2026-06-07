import type { ColorValue } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

type Props = { name: 'dashboard' | 'collection' | 'goals' | 'apps'; color: ColorValue; size?: number };

export function TabIcon({ name, color, size = 24 }: Props) {
  const sw = 2;
  switch (name) {
    case 'dashboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 20V10M10 20V4M16 20v-7M22 20H2"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'collection':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth={sw} />
          <Path d="M10 9l5 3-5 3V9z" fill={color} />
        </Svg>
      );
    case 'goals':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 6h10M4 12h10M4 18h7" stroke={color} strokeWidth={sw} strokeLinecap="round" />
          <Path
            d="M17 6l1.5 1.5L21 5"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="18" cy="12" r="1.4" fill={color} />
          <Circle cx="18" cy="18" r="1.4" fill={color} />
        </Svg>
      );
    case 'apps':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth={sw} />
          <Rect x="14" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth={sw} />
          <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth={sw} />
          <Rect x="14" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth={sw} />
        </Svg>
      );
  }
}
