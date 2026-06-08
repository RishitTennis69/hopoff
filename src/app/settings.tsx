import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { restorePurchases } from '@/services/payments';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { colors, spacing } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const mustSubscribe = useSubscriptionStore((s) => s.mustSubscribe());
  const expireTrialForTesting = useSubscriptionStore((s) => s.expireTrialForTesting);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onRestore = async () => {
    setBusy(true);
    setMessage(null);
    const result = await restorePurchases();
    setBusy(false);
    setMessage(result.ok ? 'Subscription restored.' : result.error);
  };

  return (
    <Screen scroll edges={['top']}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed, hovered }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          marginBottom: spacing.lg,
          opacity: pressed ? 0.6 : hovered ? 0.85 : 1,
          alignSelf: 'flex-start',
        })}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path
            d="M15 6l-6 6 6 6"
            stroke={colors.text}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
        <AppText variant="body" color={colors.textMuted}>
          Back
        </AppText>
      </Pressable>

      <AppText variant="title" style={{ marginBottom: spacing.xl }}>
        Settings
      </AppText>

      {mustSubscribe ? (
        <GlassCard style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
          <AppText variant="subheading" color={colors.text}>
            Subscription required
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Your free week has ended. Choose a plan on the main tabs to keep using HopOff.
          </AppText>
        </GlassCard>
      ) : null}

      <GlassCard style={{ gap: spacing.sm }}>
        <AppText variant="subheading" color={colors.text}>
          Subscription
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Already subscribed on another device? Restore your purchase here.
        </AppText>
        <Pressable
          onPress={onRestore}
          disabled={busy}
          style={({ pressed, hovered }) => ({
            marginTop: spacing.sm,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: hovered || pressed ? colors.textMuted : colors.border,
            backgroundColor: hovered || pressed ? 'rgba(255,255,255,0.06)' : 'transparent',
            alignItems: 'center',
            opacity: busy ? 0.6 : 1,
          })}
        >
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <AppText variant="subheading" color={colors.text}>
              Restore purchases
            </AppText>
          )}
        </Pressable>
        {message ? (
          <AppText variant="small" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
            {message}
          </AppText>
        ) : null}
      </GlassCard>

      {__DEV__ ? (
        <GlassCard style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          <AppText variant="subheading" color={colors.text}>
            Developer
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Expire the free week to preview the post-trial pricing popup.
          </AppText>
          <Pressable
            onPress={expireTrialForTesting}
            style={({ pressed, hovered }) => ({
              marginTop: spacing.sm,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              opacity: pressed ? 0.7 : hovered ? 0.9 : 1,
            })}
          >
            <AppText variant="small" color={colors.textMuted}>
              Expire trial (test)
            </AppText>
          </Pressable>
        </GlassCard>
      ) : null}
    </Screen>
  );
}
