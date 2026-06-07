import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { GlassPressable } from './GlassPressable';
import { OnboardingIcon } from './OnboardingIcons';
import { colors, spacing } from '@/theme';

type Option = { id: string; label: string; icon: string };

type Props = {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
};

export function MultiSelectCards({ options, selected, onToggle }: Props) {
  return (
    <View style={{ gap: spacing.md }}>
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <GlassPressable
            key={opt.id}
            selected={active}
            onPress={() => onToggle(opt.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xl,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: active ? colors.border : 'rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <OnboardingIcon name={opt.icon} size={20} color={active ? colors.text : colors.textMuted} />
            </View>
            <AppText variant="subheading" color={colors.text} style={{ flex: 1 }}>
              {opt.label}
            </AppText>
            {active && (
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M20 6L9 17l-5-5"
                  stroke={colors.text}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            )}
          </GlassPressable>
        );
      })}
    </View>
  );
}
