/**
 * Push notification hooks — wire up expo-notifications when APNs/FCM keys are ready.
 * See PRODUCTION.md → post-launch notifications.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (__DEV__) console.log('[notifications] registerForPushNotifications — not configured yet');
  return null;
}

export async function scheduleWeeklyRecap(): Promise<void> {
  if (__DEV__) console.log('[notifications] scheduleWeeklyRecap — stub');
}

export async function scheduleSoftSpotNudge(_appName: string): Promise<void> {
  if (__DEV__) console.log('[notifications] scheduleSoftSpotNudge — stub');
}
