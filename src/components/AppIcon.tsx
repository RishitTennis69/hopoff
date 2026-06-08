import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AppText } from './AppText';
import { brand, radii } from '@/theme';
import type { BrandKey } from '@/data/mock';

type Props = {
  brandKey: BrandKey;
  size?: number;
  radius?: number;
  /** Larger glyph fill for small stacked icons */
  tight?: boolean;
};

function Glyph({ brandKey, size, color, tight }: { brandKey: BrandKey; size: number; color: string; tight?: boolean }) {
  const s = size * (tight ? 0.72 : 0.6);
  switch (brandKey) {
    case 'twitter':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            fill={color}
            d="M23.95 4.57c-.88.39-1.83.65-2.82.77 1.01-.61 1.79-1.57 2.16-2.72-.95.56-2 .97-3.12 1.19-.9-.95-2.18-1.55-3.59-1.55-2.72 0-4.92 2.2-4.92 4.92 0 .39.04.76.13 1.12C7.69 8.09 4.07 6.13 1.64 3.16c-.43.73-.67 1.57-.67 2.47 0 1.71.87 3.21 2.19 4.09-.81-.03-1.57-.25-2.23-.62v.06c0 2.38 1.7 4.37 3.95 4.83-.41.11-.85.17-1.3.17-.32 0-.62-.03-.92-.08.62 1.95 2.44 3.38 4.6 3.42-1.68 1.32-3.81 2.11-6.12 2.11-.4 0-.79-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.05 0 14-7.5 14-14 0-.21 0-.43-.02-.64.96-.7 1.8-1.56 2.46-2.55z"
          />
        </Svg>
      );
    case 'facebook':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            fill={color}
            d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.27h3.32l-.53 3.49h-2.79V24C19.62 23.1 24 18.1 24 12.07z"
          />
        </Svg>
      );
    case 'tiktok':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            fill={color}
            d="M16 3c.5 2.2 2 3.8 4 4v3c-1.5 0-2.9-.5-4-1.3V16a5 5 0 1 1-5-5c.34 0 .68.03 1 .1v3.2c-.3-.18-.64-.3-1-.3a2 2 0 1 0 2 2V3h3z"
          />
        </Svg>
      );
    case 'youtube':
    case 'youtubeShorts':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path fill={color} d="M8 5v14l11-7z" />
        </Svg>
      );
    case 'instagram':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth={2} fill="none" />
          <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} fill="none" />
          <Circle cx="17.5" cy="6.5" r="1.3" fill={color} />
        </Svg>
      );
    case 'instagramReels':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth={2} fill="none" />
          <Path d="M10 8.5l6 3.5-6 3.5V8.5z" fill={color} />
        </Svg>
      );
    case 'reddit':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="13" r="7" stroke={color} strokeWidth={2} fill="none" />
          <Circle cx="9" cy="12.5" r="1.2" fill={color} />
          <Circle cx="15" cy="12.5" r="1.2" fill={color} />
          <Path d="M9 16c1.8 1.2 4.2 1.2 6 0" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'snapchat':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            fill={color}
            d="M12 2c2.5 0 4 2 4 4.5 0 1 .5 1.5 1.5 1.8.5.2 1 .4 1 .9s-.7.8-1.4 1c.3.8 1.6 2 3 2.4.5.1.4.8-.1 1-.8.3-1.6.3-2 .8-.2.3 0 .9-.6 1-.5.1-1.1-.4-1.9-.2-.7.2-1.3 1.1-3 1.1s-2.3-.9-3-1.1c-.8-.2-1.4.3-1.9.2-.6-.1-.4-.7-.6-1-.4-.5-1.2-.5-2-.8-.5-.2-.6-.9-.1-1 1.4-.4 2.7-1.6 3-2.4-.7-.2-1.4-.5-1.4-1s.5-.7 1-.9C7.5 8 8 7.5 8 6.5 8 4 9.5 2 12 2z"
          />
        </Svg>
      );
    case 'googleTasks':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} fill="none" />
          <Path
            d="M8 12l2.5 2.5L16 9"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      );
    default:
      return null;
  }
}

const LETTER: Partial<Record<BrandKey, string>> = {
  notion: 'N',
  notes: '\u2261',
  reminders: '\u25C9',
};

export function AppIcon({ brandKey, size = 44, radius, tight }: Props) {
  const b = brand[brandKey];
  const letter = LETTER[brandKey];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? radii.md,
        backgroundColor: b.bg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {letter ? (
        <AppText variant="heading" color={b.fg} style={{ fontSize: size * (tight ? 0.52 : 0.5) }}>
          {letter}
        </AppText>
      ) : (
        <Glyph brandKey={brandKey} size={size} color={b.fg} tight={tight} />
      )}
    </View>
  );
}
