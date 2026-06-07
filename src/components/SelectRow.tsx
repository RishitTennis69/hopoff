import { Pressable, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { Card } from './Card';
import { CheckCircle } from './CheckCircle';
import { GlassCard } from './GlassCard';
import type { BrandKey } from '@/data/mock';
import { colors, glass, spacing } from '@/theme';

type Props = {
  brandKey: BrandKey;
  label: string;
  sublabel?: string;
  checked: boolean;
  onToggle: () => void;
  variant?: 'light' | 'dark';
};

export function SelectRow({
  brandKey,
  label,
  sublabel,
  checked,
  onToggle,
  variant = 'light',
}: Props) {
  const inner = (
    <>
      <AppIcon brandKey={brandKey} size={38} />
      <View style={{ flex: 1 }}>
        <AppText variant="subheading" color={variant === 'dark' ? colors.text : colors.cardText}>
          {label}
        </AppText>
        {sublabel ? (
          <AppText variant="small" color={colors.textMuted}>
            {sublabel}
          </AppText>
        ) : null}
      </View>
      <CheckCircle checked={checked} onPress={onToggle} onLight={variant === 'light'} />
    </>
  );

  if (variant === 'dark') {
    return (
      <Pressable onPress={onToggle} style={({ pressed, hovered }) => ({ opacity: pressed ? 0.85 : hovered ? 0.95 : 1 })}>
        <GlassCard
          selected={checked}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            gap: spacing.md,
            backgroundColor: checked ? glass.bgSelected : glass.bg,
          }}
        >
          {inner}
        </GlassCard>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onToggle}>
      <Card
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          gap: spacing.md,
        }}
      >
        {inner}
      </Card>
    </Pressable>
  );
}
