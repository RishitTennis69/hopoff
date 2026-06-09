import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors, glass, radii, spacing } from '@/theme';

type Props = {
  message: string;
};

/** Black liquid-glass confirmation pill. */
export function SaveToast({ message }: Props) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        alignSelf: 'center',
        maxWidth: '100%',
      }}
    >
      <Animated.View
        style={{
          backgroundColor: glass.bg,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: glass.border,
          borderTopColor: glass.highlight,
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.lg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 14,
          elevation: 6,
        }}
      >
        <AppText variant="small" color={colors.text} center numberOfLines={2}>
          {message}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}
