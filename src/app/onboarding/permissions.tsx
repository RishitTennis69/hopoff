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
import { colors, spacing } from '@/theme';

const PRIVACY =
  'HopOff uses on-device usage data to block limited apps and show your week chart. We never view your screen.';

type SetupStep = {
  id: PermissionStepId | 'mic';
  label: string;
  path: string;
  openLabel: string;
  settingsStep?: PermissionStepId;
};

const ANDROID_STEPS: SetupStep[] = [
  {
    id: 'accessibility',
    label: 'Accessibility',
    path: 'Settings → Accessibility → HopOff → On',
    openLabel: 'Open Accessibility',
    settingsStep: 'accessibility',
  },
  {
    id: 'usage',
    label: 'Usage access',
    path: 'Settings → Usage access → HopOff → Allow',
    openLabel: 'Open Usage access',
    settingsStep: 'usage',
  },
  {
    id: 'mic',
    label: 'Microphone (optional)',
    path: 'Tap Allow when prompted — for voice goals',
    openLabel: 'Allow microphone',
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
    path: 'Tap Allow when prompted — for voice goals',
    openLabel: 'Allow microphone',
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

function Check({ filled }: { filled: boolean }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: filled ? 0 : 1.5,
        borderColor: colors.border,
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
  const micAuthorized = usePermissionsStore((s) => s.micAuthorized);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const pendingVerify = useRef<PermissionStepId | null>(null);
  const isAndroid = Platform.OS === 'android';
  const steps = isAndroid ? ANDROID_STEPS : IOS_STEPS;

  const currentStep = steps.find((s) => !completed[s.id]);
  const allDone = steps.every((s) => completed[s.id]);

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
      setError(result.message ?? 'Not detected yet — finish in Settings, then return here.');
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

  const openCurrentStep = async () => {
    if (!currentStep || busy) return;
    setError(null);

    if (currentStep.id === 'mic') {
      setBusy(true);
      await requestMicAndSpeechAccess();
      setCompleted((c) => ({ ...c, mic: true }));
      setError(null);
      setBusy(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (currentStep.settingsStep) {
      pendingVerify.current = currentStep.id as PermissionStepId;
      setBusy(true);
      await openPermissionSettings(currentStep.settingsStep);
      setBusy(false);
    }
  };

  const onContinue = () => {
    usePermissionsStore.getState().setScreenTimeAuthorized(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/onboarding/paywall');
  };

  const devBypass = async () => {
    setBusy(true);
    await skipPermissionsForDev();
    setBusy(false);
    router.push('/onboarding/paywall');
  };

  const title = allDone
    ? 'Permissions ready.'
    : isAndroid
      ? 'HopOff needs Android Settings access.'
      : 'HopOff needs iPhone Settings access.';

  const subtitle = allDone
    ? 'Tap Continue to finish setup.'
    : currentStep
      ? `${PRIVACY}\n\n${currentStep.path}`
      : PRIVACY;

  const footer = busy ? (
    <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
      <ActivityIndicator color={colors.text} />
    </View>
  ) : allDone ? (
    <PillButton label="Continue" onPress={onContinue} fullWidth />
  ) : currentStep ? (
    <PillButton label={currentStep.openLabel} onPress={openCurrentStep} fullWidth />
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
        <ShieldIcon enabled={allDone} />
      </View>

      <View style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
        {steps.map((step) => {
          const done = completed[step.id];
          const current = !allDone && step.id === currentStep?.id;
          const textColor = done ? colors.textMuted : current ? colors.text : colors.textMuted;

          return (
            <View key={step.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <Check filled={done} />
              <AppText variant="body" color={textColor} style={{ flex: 1 }}>
                {step.label}
              </AppText>
            </View>
          );
        })}
      </View>

      {micAuthorized && completed.mic ? (
        <AppText variant="small" color={colors.textFaint} style={{ marginBottom: spacing.md }}>
          Microphone ready.
        </AppText>
      ) : null}

      {error ? (
        <AppText variant="small" color={colors.textMuted} style={{ marginBottom: spacing.md }}>
          {error}
        </AppText>
      ) : null}

      {__DEV__ && !allDone ? (
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
            Skip permissions (dev testing)
          </AppText>
        </Pressable>
      ) : null}
    </OnboardingScreen>
  );
}
