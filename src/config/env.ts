/** Central env access — prefer API proxy in production over client-side keys. */

export function apiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') || '';
}

export function useApiProxy(): boolean {
  return apiBaseUrl().length > 0;
}

export function openRouterKey(): string {
  return process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() || '';
}

export function youtubeKey(): string {
  return process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim() || '';
}

export function notionClientId(): string {
  return process.env.EXPO_PUBLIC_NOTION_CLIENT_ID?.trim() || '';
}

export function shortcutUrl(serviceId: 'reminders' | 'notes'): string {
  const key =
    serviceId === 'reminders'
      ? process.env.EXPO_PUBLIC_SHORTCUT_REMINDERS_URL
      : process.env.EXPO_PUBLIC_SHORTCUT_NOTES_URL;
  return key?.trim() || '';
}

export function revenueCatKey(): string {
  return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim() || '';
}

export const PLAN_IDS = {
  monthly: process.env.EXPO_PUBLIC_RC_PRODUCT_MONTHLY?.trim() || 'hopoff_monthly',
  annual: process.env.EXPO_PUBLIC_RC_PRODUCT_ANNUAL?.trim() || 'hopoff_annual',
} as const;
