import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { ScreenTitle } from '@/components/ScreenTitle';
import { MotivationVideo } from '@/components/MotivationVideo';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const completed = useOnboardingStore((s) => s.completed);
  const [videoPlaying, setVideoPlaying] = useState(true);

  useEffect(() => {
    if (completed) router.replace('/(tabs)');
  }, [completed, router]);

  if (completed) return null;

  const start = () => {
    setVideoPlaying(false);
    router.push('/onboarding/questions');
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: spacing.sm }}>
        <AppText variant="small">HopOff</AppText>
      </View>
      <ScreenTitle center style={{ marginTop: spacing.xs }}>
        Stop scrolling. Start living.
      </ScreenTitle>

      <View style={{ flex: 1, justifyContent: 'center', marginTop: spacing.md, marginBottom: spacing.md }}>
        {videoPlaying ? (
          <MotivationVideo
            style={{ width: '100%', aspectRatio: 9 / 16, maxHeight: '88%', alignSelf: 'center' }}
            muted={false}
            loop={false}
          />
        ) : (
          <View style={{ width: '100%', aspectRatio: 9 / 16, maxHeight: '88%', alignSelf: 'center' }} />
        )}
      </View>

      <PillButton label="Start My HopOff Journey" onPress={start} />
    </Screen>
  );
}
