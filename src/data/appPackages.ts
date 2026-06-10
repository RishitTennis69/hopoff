/** Maps HopOff catalog ids to OS package names (Android) and URL schemes (iOS). */
export type AppPlatformRef = {
  id: string;
  androidPackage?: string;
  iosScheme?: string;
};

export const APP_PLATFORM_REFS: AppPlatformRef[] = [
  { id: 'twitter', androidPackage: 'com.twitter.android', iosScheme: 'twitter' },
  { id: 'tiktok', androidPackage: 'com.zhiliaoapp.musically', iosScheme: 'tiktok' },
  { id: 'tiktok', androidPackage: 'com.ss.android.ugc.trill' },
  { id: 'youtube', androidPackage: 'com.google.android.youtube', iosScheme: 'youtube' },
  { id: 'youtube_shorts', androidPackage: 'com.google.android.youtube', iosScheme: 'youtube' },
  { id: 'instagram', androidPackage: 'com.instagram.android', iosScheme: 'instagram' },
  { id: 'instagram_reels', androidPackage: 'com.instagram.android', iosScheme: 'instagram' },
  { id: 'snapchat', androidPackage: 'com.snapchat.android', iosScheme: 'snapchat' },
  { id: 'reddit', androidPackage: 'com.reddit.frontpage', iosScheme: 'reddit' },
  { id: 'facebook', androidPackage: 'com.facebook.katana', iosScheme: 'fb' },
];

const packageToAppId = new Map<string, string>();
for (const ref of APP_PLATFORM_REFS) {
  if (ref.androidPackage && !packageToAppId.has(ref.androidPackage)) {
    packageToAppId.set(ref.androidPackage, ref.id);
  }
}

export function appIdForPackage(packageName: string): string | undefined {
  return packageToAppId.get(packageName);
}

export function packageForAppId(appId: string): string | undefined {
  return APP_PLATFORM_REFS.find((r) => r.id === appId)?.androidPackage;
}

export function androidPackages(): string[] {
  return [...new Set(APP_PLATFORM_REFS.map((r) => r.androidPackage).filter(Boolean))] as string[];
}

export function iosSchemes(): string[] {
  return [...new Set(APP_PLATFORM_REFS.map((r) => r.iosScheme).filter(Boolean))] as string[];
}

export function appIdsForInstalledPackages(packages: string[]): string[] {
  const ids = new Set<string>();
  for (const pkg of packages) {
    for (const ref of APP_PLATFORM_REFS) {
      if (ref.androidPackage === pkg) ids.add(ref.id);
    }
  }
  return [...ids];
}

export function appIdsForInstalledSchemes(schemes: string[]): string[] {
  const schemeSet = new Set(schemes);
  return APP_PLATFORM_REFS.filter((r) => r.iosScheme && schemeSet.has(r.iosScheme)).map((r) => r.id);
}
