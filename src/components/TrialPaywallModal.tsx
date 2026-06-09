import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { PillButton } from './PillButton';
import { PopupPanel } from './PopupPanel';
import { purchasePlan, type PurchasePlan } from '@/services/payments';
import { colors, glass, radii, spacing } from '@/theme';

const BENEFITS = [
  { icon: 'block', label: 'Block any app, any time' },
  { icon: 'video', label: 'Your own motivation library' },
  { icon: 'insight', label: 'Weekly soft-spot insights' },
  { icon: 'goal', label: 'AI-powered goal coaching' },
  { icon: 'share', label: 'Save from TikTok & Instagram' },
] as const;

const PLANS: {
  id: PurchasePlan;
  name: string;
  price: string;
  cadence: string;
  highlight?: string;
}[] = [
  { id: 'monthly', name: 'Monthly', price: '$9.99', cadence: '/month' },
  { id: 'annual', name: 'Annual', price: '$59.99', cadence: '/year', highlight: 'Best value' },
];

function FeatureIcon({ name }: { name: string }) {
  const c = colors.textMuted;
  const sw = 1.8;
  switch (name) {
    case 'block':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l8 3.5V11c0 5-3.4 9.3-8 10.5C7.4 20.3 4 16 4 11V5.5L12 2z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'video':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M15 10l5-3v10l-5-3V10zM3 7h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'insight':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case 'goal':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v8M8 12h8" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case 'share':
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return null;
  }
}

type Props = {
  visible: boolean;
};

export function TrialPaywallModal({ visible }: Props) {
  const [selected, setSelected] = useState<PurchasePlan>('annual');
  const [busy, setBusy] = useState<PurchasePlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onContinue = async () => {
    if (!selected) return;
    setBusy(selected);
    setMessage(null);
    const result = await purchasePlan(selected);
    setBusy(null);
    if (!result.ok) setMessage(result.error);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={() => {}}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center' }}>
        <View style={{ paddingHorizontal: spacing.lg, maxHeight: '90%' }}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <PopupPanel>
              <View style={{ gap: spacing.xs }}>
                <AppText variant="title" center style={{ fontSize: 24 }}>
                  Been enjoying HopOff?
                </AppText>
                <AppText variant="bodyRegular" color={colors.textMuted} center>
                  Your free week has ended. Pick a plan to keep blocking and insights.
                </AppText>
              </View>

              <View style={{ gap: spacing.md }}>
                {PLANS.map((plan) => {
                  const isSelected = selected === plan.id;
                  return (
                    <Pressable
                      key={plan.id}
                      onPress={() => setSelected(plan.id)}
                      disabled={!!busy}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.md,
                        gap: spacing.md,
                        borderRadius: radii.md,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? colors.text : glass.border,
                        backgroundColor: isSelected ? glass.bgSelected : glass.bg,
                        opacity: busy ? 0.6 : 1,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                          <AppText variant="subheading" color={colors.text}>
                            {plan.name}
                          </AppText>
                          {plan.highlight ? (
                            <View
                              style={{
                                borderWidth: 1,
                                borderColor: glass.border,
                                borderRadius: 999,
                                paddingHorizontal: spacing.sm,
                                paddingVertical: 2,
                              }}
                            >
                              <AppText variant="caption" color={colors.textMuted}>
                                {plan.highlight}
                              </AppText>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <AppText variant="subheading" color={colors.text}>
                          {plan.price}
                        </AppText>
                        <AppText variant="caption" color={colors.textMuted}>
                          {plan.cadence}
                        </AppText>
                      </View>
                      {isSelected ? (
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
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <PillButton
                label={busy ? 'Continuing…' : 'Continue'}
                onPress={onContinue}
                disabled={!selected || !!busy}
                loading={busy !== null}
              />

              <View style={{ gap: spacing.sm }}>
                <AppText variant="subheading" color={colors.text}>
                  What&apos;s included
                </AppText>
                {BENEFITS.map((item) => (
                  <View key={item.label} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <FeatureIcon name={item.icon} />
                    <AppText variant="bodyRegular" color={colors.text} style={{ flex: 1 }}>
                      {item.label}
                    </AppText>
                  </View>
                ))}
              </View>

              {message ? (
                <AppText variant="small" color={colors.textMuted} center>
                  {message}
                </AppText>
              ) : null}
            </PopupPanel>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
