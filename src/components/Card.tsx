import { View, type ViewProps } from 'react-native';
import { colors, radii, spacing } from '@/theme';

type Props = ViewProps & {
  tone?: 'light' | 'dark' | 'input';
  padded?: boolean;
};

export function Card({ tone = 'light', padded = true, style, ...rest }: Props) {
  const bg =
    tone === 'light' ? colors.card : tone === 'input' ? colors.bgInput : colors.bgElevated;
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: bg,
          borderRadius: radii.lg,
          padding: padded ? spacing.lg : 0,
        },
        tone !== 'light' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    />
  );
}
