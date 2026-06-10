import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors, radii, spacing } from '@/theme';

type Props = {
  message: string;
};

/** Solid confirmation pill — stays clearly visible over any screen. */
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
          backgroundColor: '#1C1C1E',
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.lg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.55,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <AppText variant="small" color={colors.text} center numberOfLines={2}>
          {message}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}
