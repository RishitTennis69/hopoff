import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { startFreeWeek } from '@/services/payments';
import { useOnboardingStore } from '@/store/onboardingStore';
import { SubscriptionTerms } from '@/components/SubscriptionTerms';
import { colors, spacing } from '@/theme';

const PREMIUM = [
  { icon: 'block', label: 'Block any app, any time' },
  { icon: 'video', label: 'Your own motivation library' },
  { icon: 'insight', label: 'Weekly soft-spot insights' },
  { icon: 'goal', label: 'AI-powered goal coaching' },
  { icon: 'share', label: 'Save from TikTok & Instagram' },
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

export default function OnboardingPaywall() {
  const router = useRouter();
  const complete = useOnboardingStore((s) => s.complete);
  const [busy, setBusy] = useState(false);

  const finish = () => {
    setBusy(true);
    startFreeWeek('annual');
    complete();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScreen
      step={8}
      title="7 days free — no card needed"
      subtitle="Everything below is included in your free week."
      onNext={finish}
      onBack={() => router.back()}
      ctaLabel={busy ? 'Starting…' : 'Start my free week'}
      disabled={busy}
      footer={
        busy ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : undefined
      }
    >
      <GlassCard style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        <AppText variant="subheading" color={colors.text}>
          What you get
        </AppText>
        {PREMIUM.map((item) => (
          <View key={item.label} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <FeatureIcon name={item.icon} />
            <AppText variant="bodyRegular" color={colors.text} style={{ flex: 1 }}>
              {item.label}
            </AppText>
          </View>
        ))}
      </GlassCard>
      <SubscriptionTerms compact />
    </OnboardingScreen>
  );
}
