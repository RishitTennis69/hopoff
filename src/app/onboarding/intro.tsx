import { Redirect } from 'expo-router';

/** Intro removed — redirect legacy route to first onboarding step. */
export default function OnboardingIntro() {
  return <Redirect href="/onboarding/questions" />;
}
