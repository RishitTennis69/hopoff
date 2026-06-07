import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { apiBaseUrl, notionClientId, shortcutUrl, useApiProxy } from '@/config/env';
import { proxyPost } from '@/utils/apiClient';
import { useGoalsStore } from '@/store/goalsStore';

const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize';

export function hasNotionClient() {
  return useApiProxy() || notionClientId().length > 0;
}

type NotionTokenResponse = {
  accessToken: string;
  workspaceId?: string;
  workspaceName?: string;
};

async function exchangeNotionCode(code: string, redirectUri: string): Promise<NotionTokenResponse | null> {
  if (!useApiProxy()) return null;
  try {
    return await proxyPost<NotionTokenResponse>('/api/notion/token', { code, redirectUri });
  } catch {
    return null;
  }
}

/**
 * Kick off Notion OAuth. Token exchange runs via backend when EXPO_PUBLIC_API_BASE_URL is set.
 */
export async function connectNotion(): Promise<boolean> {
  const clientId = notionClientId();
  if (!clientId) {
    await WebBrowser.openBrowserAsync('https://www.notion.so/my-integrations');
    return false;
  }

  const redirectUri = Linking.createURL('notion-callback');
  const url =
    `${NOTION_AUTH_URL}?owner=user&response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  try {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
    if (result.type !== 'success' || !result.url) return false;

    const parsed = Linking.parse(result.url);
    const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
    if (!code) return false;

    const token = await exchangeNotionCode(code, redirectUri);
    if (token?.accessToken) {
      useGoalsStore.getState().setNotionToken(token.accessToken);
      return true;
    }

    // OAuth succeeded but backend not deployed yet — still mark connected for UX testing.
    return useApiProxy() ? false : true;
  } catch {
    return false;
  }
}

/** Pull goals from a Notion database — requires backend + user token. */
export async function syncGoalsFromNotion(): Promise<string | null> {
  const token = useGoalsStore.getState().notionAccessToken;
  if (!token || !apiBaseUrl()) return null;
  // Full database sync endpoint can be added to /api/notion/goals when ready.
  return null;
}

const SHORTCUT_FALLBACK = 'https://www.icloud.com/shortcuts/';

export async function openShortcut(serviceId: string): Promise<void> {
  const id = serviceId === 'reminders' || serviceId === 'notes' ? serviceId : null;
  const url = id ? shortcutUrl(id) || SHORTCUT_FALLBACK : SHORTCUT_FALLBACK;
  await WebBrowser.openBrowserAsync(url);
}
