import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { usePermissionsStore } from '@/store/permissionsStore';
import {
  finalizeScreenTimePermission,
  getPermissionLabels,
  requestAllHopOffPermissions,
} from '@/services/permissions';
import { colors, spacing } from '@/theme';

const BULLETS = [
  'Detect when you open a limited app',
  'Surface your motivation at the right moment',
  'Measure time saved — stored only on your device',
];

function ShieldIcon({ enabled }: { enabled: boolean }) {
  return (
    <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l8 3.5V11c0 5-3.4 9.3-8 10.5C7.4 20.3 4 16 4 11V5.5L12 2z"
        fill={enabled ? colors.text : 'rgba(255,255,255,0.06)'}
        stroke={colors.text}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 12l2.3 2.3L15.5 9.5"
        stroke={enabled ? colors.bg : colors.text}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Check({ filled }: { filled: boolean }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: filled ? 0 : 1.5,
        borderColor: colors.border,
        backgroundColor: filled ? colors.text : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Path
          d="M20 6L9 17l-5-5"
          stroke={filled ? colors.bg : colors.textMuted}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export default function OnboardingPermissions() {
  const router = useRouter();
  const screenTimeAuthorized = usePermissionsStore((s) => s.screenTimeAuthorized);
  const micAuthorized = usePermissionsStore((s) => s.micAuthorized);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const { screenTime: apiName } = getPermissionLabels();
  const enabled = screenTimeAuthorized;

  useEffect(() => {
    if (Platform.OS === 'web') {
      usePermissionsStore.getState().setScreenTimeAuthorized(true);
      usePermissionsStore.getState().setMicAuthorized(true);
    }
  }, []);

  const onCta = async () => {
    if (!enabled) {
      setBusy(true);
      setHint(null);
      const result = await requestAllHopOffPermissions();
      setBusy(false);

      if (result.screenTimeMessage) {
        setHint(result.screenTimeMessage);
      }

      if (!result.screenTime) {
        // User was sent to Settings — confirm on next tap after enabling.
        setHint(
          Platform.OS === 'ios'
            ? 'Turn on Screen Time for HopOff in Settings, then tap Enable again to confirm.'
            : 'Enable Accessibility for HopOff in Settings, then tap Enable again to confirm.',
        );
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    router.push('/onboarding/paywall');
  };

  const confirmAfterSettings = async () => {
    setBusy(true);
    const ok = await finalizeScreenTimePermission();
    setBusy(false);
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHint(null);
    }
  };

  return (
    <OnboardingScreen
      step={7}
      title={enabled ? `${apiName} is on.` : `Enable ${apiName}.`}
      subtitle={
        enabled
          ? 'You\u2019re all set. HopOff can now step in the moment you reach for a limited app.'
          : `HopOff requires ${apiName} to enforce the limits you set. No data leaves your device.`
      }
      ctaLabel={enabled ? 'Continue' : busy ? 'Opening Settings…' : `Enable ${apiName}`}
      onNext={hint && !enabled ? confirmAfterSettings : onCta}
      onBack={() => router.back()}
      footer={
        busy ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : undefined
      }
    >
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <ShieldIcon enabled={enabled} />
      </View>

      {enabled && (
        <Animated.View entering={FadeIn}>
          <GlassCard
            selected
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <Check filled />
            <AppText variant="subheading" color={colors.text} style={{ flex: 1 }}>
              {apiName} connected
            </AppText>
          </GlassCard>
        </Animated.View>
      )}

      <GlassCard style={{ gap: spacing.lg }}>
        {BULLETS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <Check filled={enabled} />
            <AppText variant="body" color={colors.text} style={{ flex: 1 }}>
              {b}
            </AppText>
          </View>
        ))}
        {micAuthorized && (
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <Check filled />
            <AppText variant="body" color={colors.text} style={{ flex: 1 }}>
              Microphone ready for voice goals
            </AppText>
          </View>
        )}
      </GlassCard>

      {hint ? (
        <AppText variant="small" color={colors.textMuted} center style={{ marginTop: spacing.lg }}>
          {hint}
        </AppText>
      ) : null}

      <AppText variant="small" color={colors.textFaint} center style={{ marginTop: spacing.lg }}>
        Access is used only to block and unblock apps. We never view your screen or personal data.
      </AppText>
    </OnboardingScreen>
  );
}
