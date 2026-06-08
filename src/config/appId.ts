import Constants from 'expo-constants';

/** Bundle id used as YouTube embed Referer / WebView baseUrl (fixes Error 153). */
export const APP_BUNDLE_ID =
  Constants.expoConfig?.ios?.bundleIdentifier ??
  Constants.expoConfig?.android?.package ??
  'com.kgrogerrr.hopoff';

export const APP_REFERER_ORIGIN = `https://${APP_BUNDLE_ID}`;
