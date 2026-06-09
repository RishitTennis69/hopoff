import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import HopoffDevice from 'hopoff-device';
import { apiBaseUrl, notionClientId, shortcutUrl, useApiProxy } from '@/config/env';
import { proxyPost } from '@/utils/apiClient';
import { useGoalsStore } from '@/store/goalsStore';

const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize';
const APP_DEEP_LINK = 'hoptfoff://notion-callback';

export function hasNotionClient() {
  return useApiProxy() || notionClientId().length > 0;
}

export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/** Redirect URI sent to Notion — must match exactly in your Notion integration settings. */
export function getNotionRedirectUri(): string {
  const base = apiBaseUrl();
  if (base) return `${base}/api/notion-callback`;
  if (isExpoGo()) return Linking.createURL('notion-callback');
  return APP_DEEP_LINK;
}

export function getNotionEnvironmentLabel(): string {
  if (apiBaseUrl()) return 'HTTPS via API (recommended)';
  if (isExpoGo()) return 'Expo Go (unstable exp:// URI)';
  return 'App deep link (hoptfoff://)';
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

function notionFailureReason(redirectUri: string, step: 'auth' | 'code' | 'token'): string {
  const env = getNotionEnvironmentLabel();
  const base = `Environment: ${env}\nURI sent to Notion: ${redirectUri}\n\n`;

  if (step === 'auth') {
    if (isExpoGo()) {
      return (
        base +
        'OAuth did not return to the app. In Expo Go the redirect URI changes when your dev server IP or port changes — add the exact URI above to Notion, or switch to a dev build and use hoptfoff://notion-callback only.'
      );
    }
    return (
      base +
      'OAuth did not return to the app. In Notion → your integration → Redirect URIs, add the HTTPS URI above exactly (ends with /api/notion-callback). Redeploy Vercel after adding api/notion-callback if you just pulled this change.'
    );
  }

  if (step === 'code') {
    return (
      base +
      'Notion redirected back but no authorization code was found. The redirect URI in Notion must match the HTTPS URI above character-for-character.'
    );
  }

  return (
    base +
    'Notion authorized the app but token exchange failed. Confirm NOTION_CLIENT_ID and NOTION_CLIENT_SECRET on Vercel match your Notion integration, then redeploy.'
  );
}

function showNotionSetupHelp(redirectUri: string, step: 'auth' | 'code' | 'token' = 'auth') {
  Alert.alert('Notion connect', notionFailureReason(redirectUri, step));
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

  if (__DEV__ && isExpoGo()) {
    console.warn(
      '[notion] Expo Go redirect URI (add to Notion if testing in Go):',
      redirectUri,
    );
  }

  const url =
    `${NOTION_AUTH_URL}?owner=user&response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const completeWithCode = async (code: string): Promise<boolean> => {
    const token = await exchangeNotionCode(code, redirectUri);
    if (token?.accessToken) {
      useGoalsStore.getState().setNotionToken(token.accessToken);
      try {
        await WebBrowser.dismissBrowser();
      } catch {
        /* already closed */
      }
      return true;
    }
    showNotionSetupHelp(redirectUri, 'token');
    return false;
  };

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      linkSub.remove();
      resolve(ok);
    };

    const linkSub = Linking.addEventListener('url', ({ url: incoming }) => {
      if (!incoming.includes('notion-callback')) return;
      const code = parseNotionAuthCode(incoming);
      if (!code) return;
      void completeWithCode(code).then(finish);
    });

    void WebBrowser.openAuthSessionAsync(url, redirectUri)
      .then(async (result) => {
        if (settled) return;
        if (result.type === 'cancel') {
          finish(false);
          return;
        }
        if (result.type === 'success' && result.url) {
          const code = parseNotionAuthCode(result.url);
          if (code) {
            finish(await completeWithCode(code));
            return;
          }
        }
        showNotionSetupHelp(redirectUri, 'auth');
        finish(false);
      })
      .catch(() => {
        if (!settled) {
          if (Platform.OS !== 'web') showNotionSetupHelp(redirectUri, 'auth');
          finish(false);
        }
      });
  });
}

type NotionGoalsResponse = {
  goals: string[];
  databaseTitle?: string;
};

type NotionDatabase = { id: string; title: string };

function parseNotionAuthCode(returnUrl: string): string | null {
  try {
    const parsed = Linking.parse(returnUrl);
    const fromLinking = parsed.queryParams?.code;
    if (typeof fromLinking === 'string') return fromLinking;
  } catch {
    /* fall through */
  }
  try {
    const u = new URL(returnUrl);
    return u.searchParams.get('code');
  } catch {
    return null;
  }
}

/** List Notion databases the user shared with HopOff. */
export async function fetchNotionDatabases(): Promise<NotionDatabase[]> {
  const token = useGoalsStore.getState().notionAccessToken;
  if (!token || !apiBaseUrl()) return [];
  try {
    const data = await proxyPost<{ databases: NotionDatabase[] }>('/api/notion/databases', {
      accessToken: token,
    });
    return data.databases ?? [];
  } catch {
    return [];
  }
}

/** Pull goals from a shared Notion database. */
export async function syncGoalsFromNotion(databaseId?: string | null): Promise<string | null> {
  const token = useGoalsStore.getState().notionAccessToken;
  const dbId = databaseId ?? useGoalsStore.getState().notionDatabaseId;
  if (!token || !apiBaseUrl()) return null;

  try {
    const data = await proxyPost<NotionGoalsResponse>('/api/notion/goals', {
      accessToken: token,
      databaseId: dbId ?? undefined,
    });
    if (!data.goals?.length) return null;
    return data.goals.map((g) => `• ${g}`).join('\n');
  } catch {
    return null;
  }
}

const SHORTCUT_FALLBACK = 'https://www.icloud.com/shortcuts/';
const GOOGLE_TASKS_PACKAGE = 'com.google.android.apps.tasks';

/** Opens Google Tasks on Android, or Play Store if not installed. */
export async function openGoogleTasks(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
      packageName: GOOGLE_TASKS_PACKAGE,
      flags: 0x10000000,
    });
    return true;
  } catch {
    /* fall through */
  }

  try {
    if (await Linking.canOpenURL('googletasks://')) {
      await Linking.openURL('googletasks://');
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    if (HopoffDevice?.getInstalledPackages) {
      const installed = await HopoffDevice.getInstalledPackages([GOOGLE_TASKS_PACKAGE]);
      if (!installed.includes(GOOGLE_TASKS_PACKAGE)) {
        await Linking.openURL(`market://details?id=${GOOGLE_TASKS_PACKAGE}`);
        return true;
      }
    }
  } catch {
    /* fall through */
  }

  try {
    await Linking.openURL(`market://details?id=${GOOGLE_TASKS_PACKAGE}`);
    return true;
  } catch {
    await Linking.openURL(`https://play.google.com/store/apps/details?id=${GOOGLE_TASKS_PACKAGE}`);
    return true;
  }
}

export async function openShortcut(serviceId: string): Promise<void> {
  const id = serviceId === 'reminders' || serviceId === 'notes' ? serviceId : null;
  const url = id ? shortcutUrl(id) || SHORTCUT_FALLBACK : SHORTCUT_FALLBACK;
  await WebBrowser.openBrowserAsync(url);
}
