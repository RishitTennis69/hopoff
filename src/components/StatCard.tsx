import { View } from 'react-native';
import { AppText } from './AppText';
import { Card } from './Card';
import { colors, fonts, spacing } from '@/theme';

type Props = {
  label: string;
  value: string;
  unit: string;
};

export function StatCard({ label, value, unit }: Props) {
  return (
    <Card
      padded={false}
      style={{
        flex: 1,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <AppText
        variant="small"
        color={colors.cardText}
        center
        numberOfLines={1}
        style={{ letterSpacing: -0.3 }}
      >
        {label}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'center',
          marginTop: spacing.xs,
          gap: 2,
        }}
      >
        <AppText
          color={colors.cardText}
          style={{ fontFamily: fonts.extraBold, fontSize: 30, lineHeight: 34, letterSpacing: -1.5 }}
        >
          {value}
        </AppText>
        <AppText variant="small" color={colors.cardMuted} style={{ letterSpacing: -0.3 }}>
          {unit}
        </AppText>
      </View>
    </Card>
  );
}
