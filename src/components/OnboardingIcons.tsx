import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme';

type Props = { name: string; size?: number; color?: string };

export function OnboardingIcon({ name, size = 22, color = colors.accent }: Props) {
  switch (name) {
    case 'sunrise':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3v3M4.2 7.8l2.1 2.1M19.8 7.8l-2.1 2.1M3 14h3M18 14h3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Circle cx="12" cy="14" r="4" stroke={color} strokeWidth={1.8} />
          <Path d="M5 20h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'briefcase':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="8" width="18" height="12" rx="2" stroke={color} strokeWidth={1.8} />
          <Path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={1.8} />
          <Path d="M3 13h18" stroke={color} strokeWidth={1.8} />
        </Svg>
      );
    case 'moon':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'spark':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      );
    case 'present':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} />
          <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'target':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} />
          <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.8} />
          <Circle cx="12" cy="12" r="1.2" fill={color} />
        </Svg>
      );
    case 'sleep':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 14h4l2-4 3 8 2-4h7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'habit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 12a8 8 0 1 0 16 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M12 4v4M12 16v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} />
        </Svg>
      );
  }
}
