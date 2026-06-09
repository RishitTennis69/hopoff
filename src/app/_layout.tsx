import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { PhoneFrame } from '@/components/PhoneFrame';
import { ShareFeedbackToast } from '@/components/ShareFeedbackToast';
import { useAppBlockingMonitor } from '@/hooks/useAppBlockingMonitor';
import { useShareIntake } from '@/hooks/useShareIntake';
import { refreshInstalledApps } from '@/services/deviceUsage';
import { initPurchases } from '@/services/payments';
import { enrichStarterLibrary } from '@/utils/enrichStarterLibrary';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

function AppBootstrap() {
  useAppBlockingMonitor();
  useShareIntake();

  useEffect(() => {
    initPurchases();
    refreshInstalledApps().catch(() => {});

    enrichStarterLibrary().catch(() => {});

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshInstalledApps().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  return null;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppBootstrap />
        <PhoneFrame>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="block"
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="group-modal"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
          <Stack.Screen name="import-modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        </Stack>
        </PhoneFrame>
        <ShareFeedbackToast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
