import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { Card } from './Card';
import { GlassCard } from './GlassCard';
import { StackedIcons } from './StackedIcons';
import type { Group } from '@/store/appsStore';
import { colors, glass, radii, spacing } from '@/theme';

type Props = {
  group: Group;
  onPress?: () => void;
  variant?: 'light' | 'dark';
  /** Stronger hover/press glass on the Apps tab so groups feel tappable. */
  interactive?: boolean;
};

function formatGroupLimit(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)} Min`;
  if (hours === 1) return '1 Hr';
  return Number.isInteger(hours) ? `${hours} Hrs` : `${hours.toFixed(1)} Hrs`;
}

export function GroupCard({ group, onPress, variant = 'light', interactive = false }: Props) {
  const hrLabel = formatGroupLimit(group.hours);
  const content = (
    <>
      <StackedIcons appIds={group.appIds} size={34} />
      <View style={{ flex: 1 }}>
        <AppText variant="subheading" color={variant === 'dark' ? colors.text : colors.cardText}>
          {group.name}
        </AppText>
      </View>
      <AppText variant="subheading" color={variant === 'dark' ? colors.text : colors.cardText}>
        {hrLabel}
      </AppText>
    </>
  );

  if (variant === 'dark') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed, hovered }) => ({
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: interactive
            ? pressed || hovered
              ? glass.borderActive
              : glass.border
            : glass.border,
          borderTopColor: interactive && (pressed || hovered) ? glass.highlight : glass.highlight,
          backgroundColor: interactive
            ? pressed
              ? glass.bgPressed
              : hovered
                ? glass.bgHover
                : glass.bg
            : glass.bg,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          gap: spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: interactive && (pressed || hovered) ? 6 : 4 },
          shadowOpacity: interactive && (pressed || hovered) ? 0.45 : 0.35,
          shadowRadius: interactive && (pressed || hovered) ? 16 : 12,
          elevation: interactive && (pressed || hovered) ? 6 : 4,
          transform: [{ scale: interactive && pressed ? 0.99 : 1 }],
        })}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ hovered }) => ({ opacity: hovered ? 0.9 : 1 })}>
      <Card
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          gap: spacing.md,
        }}
      >
        {content}
      </Card>
    </Pressable>
  );
}
