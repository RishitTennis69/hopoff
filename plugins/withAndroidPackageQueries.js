const { withAndroidManifest } = require('@expo/config-plugins');

const PACKAGES = [
  'com.twitter.android',
  'com.zhiliaoapp.musically',
  'com.ss.android.ugc.trill',
  'com.google.android.youtube',
  'com.instagram.android',
  'com.snapchat.android',
  'com.reddit.frontpage',
  'com.facebook.katana',
  'com.google.android.apps.tasks',
];

const SCHEMES = [
  'twitter',
  'tiktok',
  'snssdk1128',
  'musically',
  'snssdk1180',
  'youtube',
  'vnd.youtube',
  'instagram',
  'snapchat',
  'reddit',
  'fb',
  'googletasks',
  'market',
];

/** Android 11+ visibility for installed-app detection (packages + URL schemes). */
module.exports = function withAndroidPackageQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    if (!manifest.manifest.queries) {
      manifest.manifest.queries = [{}];
    }
    const queries = manifest.manifest.queries[0];
    if (!queries.package) queries.package = [];
    if (!queries.intent) queries.intent = [];

    const existingPkgs = new Set(
      queries.package.map((p) => p.$?.['android:name']).filter(Boolean),
    );
    for (const name of PACKAGES) {
      if (!existingPkgs.has(name)) {
        queries.package.push({ $: { 'android:name': name } });
      }
    }

    const existingSchemes = new Set(
      queries.intent
        .flatMap((intent) => intent.data ?? [])
        .map((d) => d.$?.['android:scheme'])
        .filter(Boolean),
    );
    for (const scheme of SCHEMES) {
      if (!existingSchemes.has(scheme)) {
        queries.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        });
      }
    }

    return cfg;
  });
};
