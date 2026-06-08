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
  /** Stretch to full parent width with a larger tap target. */
  fullWidth?: boolean;
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
  fullWidth = false,
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
    if (haptic) Haptics.selectionAsync();
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
          alignSelf: fullWidth ? 'stretch' : compact ? 'flex-start' : undefined,
          width: fullWidth ? '100%' : undefined,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullWidth ? 52 : undefined,
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
