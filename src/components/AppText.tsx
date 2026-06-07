import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  center?: boolean;
};

export function AppText({ variant = 'body', color = colors.text, center, style, ...rest }: Props) {
  const base = typography[variant] as TextStyle;
  return (
    <RNText
      {...rest}
      style={[base, { color }, center && { textAlign: 'center' }, style]}
    />
  );
}
