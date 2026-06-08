import { ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import { Card } from './Card';
import { spacing } from '@/theme';

/** Solid dark popup surface — no glassmorphism on the panel itself. */
export function PopupPanel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <Card tone="dark" padded style={[{ paddingVertical: spacing.xxl, gap: spacing.lg }, style]}>
      {children}
    </Card>
  );
}
