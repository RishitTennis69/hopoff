import { View, type ViewProps } from 'react-native';
import { colors, glass, radii, spacing } from '@/theme';

type Props = ViewProps & {
  selected?: boolean;
  padded?: boolean;
};

export function GlassCard({ selected, padded = true, style, children, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: selected ? glass.bgSelected : glass.bg,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: selected ? glass.borderActive : glass.border,
          padding: padded ? spacing.lg : 0,
          // Top highlight simulates inner light edge
          borderTopColor: glass.highlight,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
