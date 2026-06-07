import { ActivityIndicator, Pressable, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { colors, radii, spacing } from '@/theme';

type Variant = 'primary' | 'dark' | 'ghost' | 'accent';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'default' | 'compact';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
};

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled,
  loading,
  style,
  haptic = true,
}: Props) {
  const compact = size === 'compact';
  const bg =
    variant === 'primary'
      ? colors.card
      : variant === 'accent'
        ? colors.accent
        : variant === 'dark'
          ? colors.bgElevated
          : 'transparent';
  const fg =
    variant === 'primary' ? colors.cardText : variant === 'ghost' ? colors.textMuted : colors.text;

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: bg,
          borderRadius: radii.pill,
          paddingVertical: compact ? spacing.sm : spacing.lg,
          paddingHorizontal: compact ? spacing.lg : spacing.xl,
          alignSelf: compact ? 'flex-start' : undefined,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.85 : hovered ? 0.92 : 1,
          borderWidth: variant === 'ghost' || variant === 'dark' ? 1 : 0,
          borderColor: hovered ? colors.textMuted : colors.border,
          transform: [{ scale: pressed ? 0.98 : hovered ? 1.01 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <AppText variant={compact ? 'small' : 'subheading'} color={fg}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
