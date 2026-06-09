import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { PillButton } from '@/components/PillButton';
import { OnboardingScreen } from '@/features/OnboardingScreen';
import { usePermissionsStore } from '@/store/permissionsStore';
import {
  openPermissionSettings,
  requestMicAndSpeechAccess,
  skipPermissionsForDev,
  verifyPermissionStep,
  type PermissionStepId,
} from '@/services/permissions';
import { syncDeviceData } from '@/services/deviceUsage';
import { colors, spacing } from '@/theme';

const PRIVACY =
  'HopOff uses on-device usage data to block limited apps and show your week chart. We never view your screen.';

type SetupStep = {
  id: PermissionStepId | 'mic';
  label: string;
  path: string;
  openLabel: string;
  settingsStep?: PermissionStepId;
  skippable?: boolean;
};

const ANDROID_STEPS: SetupStep[] = [
  {
    id: 'usage',
    label: 'Usage access',
    path: 'Settings → Usage access → HopOff → Allow',
    openLabel: 'Open Usage access',
    settingsStep: 'usage',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    path: 'Settings → Accessibility → HopOff → On',
    openLabel: 'Open Accessibility',
    settingsStep: 'accessibility',
    skippable: true,
  },
  {
    id: 'mic',
    label: 'Microphone (optional)',
    path: 'Tap Allow when prompted for voice goals',
    openLabel: 'Allow microphone',
    skippable: true,
  },
];

const IOS_STEPS: SetupStep[] = [
  {
    id: 'screen_time',
    label: 'Screen Time',
    path: 'Settings → Screen Time → HopOff → Allow',
    openLabel: 'Open Screen Time',
    settingsStep: 'screen_time',
  },
  {
    id: 'mic',
    label: 'Microphone (optional)',
    path: 'Tap Allow when prompted for voice goals',
    openLabel: 'Allow microphone',
    skippable: true,
  },
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

function Check({ filled, active }: { filled: boolean; active: boolean }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: filled ? 0 : 1.5,
        borderColor: active ? colors.text : colors.border,
        backgroundColor: filled ? colors.text : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
      }}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24">
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
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const pendingVerify = useRef<PermissionStepId | null>(null);
  const isAndroid = Platform.OS === 'android';
  const steps = isAndroid ? ANDROID_STEPS : IOS_STEPS;

  const focusStep = steps.find((s) => !completed[s.id]);
  const canContinue = isAndroid ? completed.usage : steps.every((s) => completed[s.id]);

  const tryCompleteStep = useCallback(async (stepId: PermissionStepId | 'mic') => {
    if (stepId === 'mic') {
      const ok = usePermissionsStore.getState().micAuthorized;
      if (ok) {
        setCompleted((c) => ({ ...c, mic: true }));
        setError(null);
      }
      return;
    }

    const result = await verifyPermissionStep(stepId);
    if (result.ok) {
      setCompleted((c) => ({ ...c, [stepId]: true }));
      pendingVerify.current = null;
      setError(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (pendingVerify.current === stepId) {
      setError(result.message ?? 'Finish in Settings, then return here.');
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      usePermissionsStore.getState().setScreenTimeAuthorized(true);
      usePermissionsStore.getState().setMicAuthorized(true);
      setCompleted({ accessibility: true, usage: true, screen_time: true, mic: true });
    }
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !pendingVerify.current) return;
      void tryCompleteStep(pendingVerify.current);
    });
    return () => sub.remove();
  }, [tryCompleteStep]);

  const openFocusStep = async () => {
    if (!focusStep || busy) return;
    setError(null);

    if (focusStep.id === 'mic') {
      setBusy(true);
      await requestMicAndSpeechAccess();
      setCompleted((c) => ({ ...c, mic: true }));
      setError(null);
      setBusy(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (focusStep.settingsStep) {
      pendingVerify.current = focusStep.id as PermissionStepId;
      setBusy(true);
      await openPermissionSettings(focusStep.settingsStep);
      setBusy(false);
    }
  };

  const skipFocusStep = () => {
    if (!focusStep?.skippable) return;
    setCompleted((c) => ({ ...c, [focusStep.id]: true }));
    pendingVerify.current = null;
    setError(null);
  };

  const onContinue = async () => {
    usePermissionsStore.getState().setScreenTimeAuthorized(true);
    if (completed.usage) {
      await syncDeviceData(7);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/onboarding/paywall');
  };

  const devBypass = async () => {
    setBusy(true);
    await skipPermissionsForDev();
    setBusy(false);
    router.push('/onboarding/paywall');
  };

  const title = canContinue
    ? 'Permissions ready.'
    : isAndroid
      ? 'HopOff needs Android Settings access.'
      : 'HopOff needs iPhone Settings access.';

  const subtitle = canContinue
    ? 'Tap Continue to finish setup.'
    : focusStep?.path ?? '';

  const footer = busy ? (
    <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
      <ActivityIndicator color={colors.text} />
    </View>
  ) : canContinue ? (
    <View style={{ gap: spacing.sm }}>
      {focusStep ? (
        <PillButton label={focusStep.openLabel} onPress={openFocusStep} fullWidth variant="dark" />
      ) : null}
      <PillButton label="Continue" onPress={onContinue} fullWidth />
    </View>
  ) : focusStep ? (
    <PillButton label={focusStep.openLabel} onPress={openFocusStep} fullWidth />
  ) : null;

  return (
    <OnboardingScreen
      step={7}
      title={title}
      subtitle={subtitle}
      onNext={() => {}}
      onBack={() => router.back()}
      footer={footer}
    >
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <ShieldIcon enabled={canContinue} />
      </View>

      <AppText variant="bodyRegular" color={colors.textMuted} style={{ marginBottom: spacing.lg }}>
        {PRIVACY}
      </AppText>

      <View style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
        {steps.map((step, index) => {
          const done = completed[step.id];
          const active = step.id === focusStep?.id;
          const textColor = done ? colors.textMuted : active ? colors.text : colors.textFaint;

          return (
            <View key={step.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <AppText variant="caption" color={textColor} style={{ width: 18 }}>
                {index + 1}.
              </AppText>
              <Check filled={done} active={active} />
              <AppText variant="body" color={textColor} style={{ flex: 1 }}>
                {step.label}
              </AppText>
            </View>
          );
        })}
      </View>

      {focusStep?.skippable ? (
        <Pressable
          onPress={skipFocusStep}
          style={({ pressed }) => ({
            marginBottom: spacing.md,
            paddingVertical: spacing.sm,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppText variant="small" color={colors.textFaint}>
            Skip
          </AppText>
        </Pressable>
      ) : null}

      {error ? (
        <AppText variant="small" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
          {error}
        </AppText>
      ) : null}

      {__DEV__ && !canContinue ? (
        <Pressable
          onPress={devBypass}
          style={({ pressed }) => ({
            marginTop: spacing.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppText variant="small" color={colors.textFaint}>
            Skip
          </AppText>
        </Pressable>
      ) : null}
    </OnboardingScreen>
  );
}
