import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { usePermissionsStore } from '@/store/permissionsStore';
import {
  openPermissionSettings,
  requestScreenTimeAccess,
} from '@/services/appBlocking';
import { nativeAppBlocking } from '@/services/appBlocking/native';
import { hasUsageAccess } from '@/services/deviceUsage';

export { openPermissionSettings };

export type PermissionStepId = 'accessibility' | 'usage' | 'screen_time';

export async function verifyPermissionStep(
  step: PermissionStepId,
): Promise<{ ok: boolean; message?: string }> {
  if (step === 'usage') {
    const ok = await hasUsageAccess();
    return ok
      ? { ok: true }
      : { ok: false, message: 'Usage access → HopOff → Allow' };
  }

  const ok = await nativeAppBlocking.isAuthorized();
  if (ok) return { ok: true };

  return {
    ok: false,
    message:
      step === 'accessibility'
        ? 'Accessibility → HopOff → On'
        : 'Screen Time → HopOff → Allow',
  };
}

export async function requestMicAndSpeechAccess(): Promise<boolean> {
  if (Platform.OS === 'web') {
    usePermissionsStore.getState().setMicAuthorized(true);
    return true;
  }
  const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  const granted = perms.granted;
  usePermissionsStore.getState().setMicAuthorized(granted);
  return granted;
}

export async function requestAllHopOffPermissions(): Promise<{
  screenTime: boolean;
  mic: boolean;
  screenTimeMessage?: string;
}> {
  const screen = await requestScreenTimeAccess();
  const mic = await requestMicAndSpeechAccess();
  return {
    screenTime: screen.granted,
    mic,
    screenTimeMessage: screen.message,
  };
}

/** Dev / testing — HopOff may not appear in Accessibility until a production build. */
export async function skipPermissionsForDev(): Promise<void> {
  usePermissionsStore.getState().setScreenTimeAuthorized(true);
  usePermissionsStore.getState().setMicAuthorized(true);
}

export async function finalizeScreenTimePermission(step: PermissionStepId): Promise<boolean> {
  const result = await verifyPermissionStep(step);
  return result.ok;
}

export function getPermissionLabels() {
  const isAndroid = Platform.OS === 'android';
  return {
    screenTime: isAndroid ? 'Accessibility Services' : 'Screen Time',
    mic: 'Microphone & speech recognition',
  };
}
