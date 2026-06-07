import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { apiBaseUrl, notionClientId, shortcutUrl, useApiProxy } from '@/config/env';
import { proxyPost } from '@/utils/apiClient';
import { useGoalsStore } from '@/store/goalsStore';

const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize';

export function hasNotionClient() {
  return useApiProxy() || notionClientId().length > 0;
}

/** Redirect URI sent to Notion — must match exactly in your Notion integration settings. */
export function getNotionRedirectUri(): string {
  const runtime = Linking.createURL('notion-callback');
  const custom = Linking.createURL('notion-callback', { scheme: 'hoptfoff' });

  // Expo Go uses exp:// — custom scheme works in dev/production builds
  if (Constants.appOwnership === 'expo') return runtime;
  if (custom.startsWith('hoptfoff://')) return custom;
  return runtime;
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

function showNotionSetupHelp(redirectUri: string) {
  const message =
    `In Notion → your HopOff connection → Redirect URIs, add this exact URL:\n\n${redirectUri}\n\n` +
    (Constants.appOwnership === 'expo'
      ? 'In Expo Go this URL changes if your dev server IP/port changes — update Notion when that happens, or use a development build (hoptfoff://notion-callback).'
      : 'Use a development build for a stable hoptfoff:// redirect.');

  Alert.alert('Notion redirect URI', message);
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

  const redirectUri = getNotionRedirectUri();

  if (!useApiProxy()) {
    Alert.alert(
      'API not configured',
      'Set EXPO_PUBLIC_API_BASE_URL in .env so Notion can complete sign-in.',
    );
    return false;
  }

  const url =
    `${NOTION_AUTH_URL}?owner=user&response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  try {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
    if (result.type !== 'success' || !result.url) {
      if (result.type === 'cancel') return false;
      showNotionSetupHelp(redirectUri);
      return false;
    }

    const parsed = Linking.parse(result.url);
    const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
    if (!code) {
      showNotionSetupHelp(redirectUri);
      return false;
    }

    const token = await exchangeNotionCode(code, redirectUri);
    if (token?.accessToken) {
      useGoalsStore.getState().setNotionToken(token.accessToken);
      return true;
    }

    Alert.alert(
      'Notion connect failed',
      'OAuth succeeded but token exchange failed. Check NOTION_CLIENT_SECRET on Vercel.',
    );
    return false;
  } catch {
    if (Platform.OS !== 'web') showNotionSetupHelp(redirectUri);
    return false;
  }
}

/** Pull goals from a Notion database — requires backend + user token. */
export async function syncGoalsFromNotion(): Promise<string | null> {
  const token = useGoalsStore.getState().notionAccessToken;
  if (!token || !apiBaseUrl()) return null;
  return null;
}

const SHORTCUT_FALLBACK = 'https://www.icloud.com/shortcuts/';

export async function openShortcut(serviceId: string): Promise<void> {
  const id = serviceId === 'reminders' || serviceId === 'notes' ? serviceId : null;
  const url = id ? shortcutUrl(id) || SHORTCUT_FALLBACK : SHORTCUT_FALLBACK;
  await WebBrowser.openBrowserAsync(url);
}
