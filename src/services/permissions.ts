import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { usePermissionsStore } from '@/store/permissionsStore';
import { confirmScreenTimeAccess, requestScreenTimeAccess } from '@/services/appBlocking';

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

export async function finalizeScreenTimePermission(): Promise<boolean> {
  return confirmScreenTimeAccess();
}

export function getPermissionLabels() {
  const isAndroid = Platform.OS === 'android';
  return {
    screenTime: isAndroid ? 'Accessibility Services' : 'Screen Time',
    mic: 'Microphone & speech recognition',
  };
}
