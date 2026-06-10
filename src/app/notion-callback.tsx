import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { completeNotionOAuthFromCode, getNotionRedirectUri, parseNotionAuthCode } from '@/utils/connect';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors } from '@/theme';

function goalsRoute() {
  return useOnboardingStore.getState().completed ? '/(tabs)/goals' : '/onboarding/goals';
}

/** Handles hoptfoff://notion-callback after Vercel forwards the OAuth code. */
export default function NotionCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string | string[]; error?: string | string[] }>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    void (async () => {
      const rawCode = params.code;
      let code = typeof rawCode === 'string' ? rawCode : Array.isArray(rawCode) ? rawCode[0] : null;

      if (!code) {
        const initial = await Linking.getInitialURL();
        if (initial) code = parseNotionAuthCode(initial);
      }

      const rawError = params.error;
      const error =
        typeof rawError === 'string' ? rawError : Array.isArray(rawError) ? rawError[0] : null;

      if (error) {
        Alert.alert('Notion connect', 'Notion sign-in was cancelled or failed.');
        router.replace(goalsRoute());
        return;
      }

      if (code) {
        const ok = await completeNotionOAuthFromCode(code);
        if (!ok) {
          Alert.alert(
            'Notion connect',
            `Token exchange failed. Confirm Vercel has NOTION_CLIENT_ID and NOTION_CLIENT_SECRET, and Notion redirect URI is:\n${getNotionRedirectUri()}`,
          );
        }
      } else {
        Alert.alert('Notion connect', 'No authorization code was returned from Notion.');
      }

      router.replace(goalsRoute());
    })();
  }, [params.code, params.error, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.text} />
    </View>
  );
}
