import { ReactNode } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { glass, radii } from '@/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
};

export function GlassPressable({
  children,
  onPress,
  selected,
  disabled,
  style,
  haptic = true,
}: Props) {
  const handlePress = () => {
    if (disabled) return;
    if (haptic) Haptics.selectionAsync();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed, hovered }) => [
        {
          backgroundColor: selected
            ? glass.bgSelected
            : hovered
              ? glass.bgHover
              : pressed
                ? glass.bgPressed
                : glass.bg,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: selected ? glass.borderActive : hovered ? glass.borderHover : glass.border,
          borderTopColor: glass.highlight,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : hovered ? 1.01 : 1 }],
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
