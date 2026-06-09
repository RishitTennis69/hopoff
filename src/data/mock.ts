import { brand } from '@/theme';

export type BrandKey = keyof typeof brand;

export type AppItem = {
  id: string;
  name: string;
  brand: BrandKey;
};

export const APP_CATALOG: AppItem[] = [
  { id: 'twitter', name: 'Twitter', brand: 'twitter' },
  { id: 'tiktok', name: 'TikTok', brand: 'tiktok' },
  { id: 'youtube', name: 'YouTube', brand: 'youtube' },
  { id: 'youtube_shorts', name: 'YouTube Shorts', brand: 'youtubeShorts' },
  { id: 'instagram', name: 'Instagram', brand: 'instagram' },
  { id: 'instagram_reels', name: 'Instagram Reels', brand: 'instagramReels' },
  { id: 'snapchat', name: 'Snapchat', brand: 'snapchat' },
  { id: 'reddit', name: 'Reddit', brand: 'reddit' },
  { id: 'facebook', name: 'Facebook', brand: 'facebook' },
];

export function getApp(id: string): AppItem | undefined {
  return APP_CATALOG.find((a) => a.id === id);
}

export type VideoKind = 'youtube' | 'mp4' | 'link';

export type VideoItem = {
  id: string;
  title: string;
  author: string;
  source: BrandKey;
  accent: string;
  duration: string;
  /** mp4 stream, original share link, or '' for youtube */
  videoUrl: string;
  kind?: VideoKind;
  youtubeId?: string;
  thumbnailUrl?: string;
};

export const WELCOME_YOUTUBE_ID = 'D5SyEe5oGZU';

const SAMPLE_URLS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

const THUMB_COLORS = ['#2A2E45', '#3A2A45', '#45342A', '#2A4538', '#452A3C', '#2A3F45'];

function makeVideos(prefix: string, author: string, source: BrandKey, n: number): VideoItem[] {
  const titles = [
    'Stop wasting your potential',
    'The 5am discipline mindset',
    'Why you feel stuck (and the fix)',
    'How winners spend their time',
    'You only need 1% better daily',
    'Nobody is coming to save you',
  ];
  return Array.from({ length: n }).map((_, i) => ({
    id: `${prefix}-${i}`,
    title: titles[i % titles.length],
    author,
    source,
    accent: THUMB_COLORS[i % THUMB_COLORS.length],
    duration: `0:${(20 + i * 7).toString().padStart(2, '0')}`,
    videoUrl: SAMPLE_URLS[i % SAMPLE_URLS.length],
    kind: 'mp4' as VideoKind,
  }));
}

export { THUMB_COLORS };

const SEARCH_DB: Record<string, VideoItem[]> = {
  default: makeVideos('def', 'HopOff Picks', 'youtube', 4),
  'andrew tate': makeVideos('tate', 'Andrew Tate', 'youtube', 6),
  'roy lee': makeVideos('roy', 'Roy Lee', 'tiktok', 6),
  motivation: makeVideos('mot', 'Daily Motivation', 'instagram', 6),
  goggins: makeVideos('gog', 'David Goggins', 'youtube', 6),
};

export function searchVideos(query: string): VideoItem[] {
  const key = query.trim().toLowerCase();
  if (!key) return SEARCH_DB.default;
  return SEARCH_DB[key] ?? makeVideos(key.replace(/\s+/g, '-'), titleCase(query), 'youtube', 6);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSavedVideos(source: BrandKey): VideoItem[] {
  return makeVideos(`saved-${source}`, source === 'tiktok' ? 'TikTok Saved' : 'Instagram Saved', source, 8);
}

export const SAMPLE_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

function ytVideo(
  id: string,
  title: string,
  author: string,
  youtubeId: string,
  duration: string,
): VideoItem {
  return {
    id,
    title,
    author,
    source: 'youtube',
    accent: THUMB_COLORS[0],
    duration,
    videoUrl: '',
    kind: 'youtube',
    youtubeId,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
  };
}

/** The starter library every new user gets. All clips are verified YouTube Shorts ≤ 60s. */
/** TODO: replace starter-2 youtubeId when you have your preferred block-preview clip link. */
export const DEFAULT_LIBRARY: VideoItem[] = [
  ytVideo('starter-1', 'Stop scrolling, start living', 'BoltMotivation', WELCOME_YOUTUBE_ID, '0:57'),
  ytVideo('starter-2', 'You have to want it', 'Eric Thomas', 'fJ__hddpGVY', '0:25'),
  ytVideo('starter-3', 'GET UP AND GRIND', 'Motivation', '5f7E4DQG6kk', '0:21'),
];

export type DayStat = {
  day: string;
  hours: number;
  softSpots: { appId: string; hours: number }[];
};

export const WEEK_STATS: DayStat[] = [
  { day: 'Mon', hours: 1.2, softSpots: [{ appId: 'twitter', hours: 0.8 }, { appId: 'reddit', hours: 0.4 }] },
  { day: 'Tue', hours: 3.4, softSpots: [{ appId: 'tiktok', hours: 2.1 }, { appId: 'twitter', hours: 1.3 }] },
  { day: 'Wed', hours: 1.6, softSpots: [{ appId: 'youtube_shorts', hours: 1.0 }, { appId: 'instagram', hours: 0.6 }] },
  { day: 'Thu', hours: 2.5, softSpots: [{ appId: 'instagram', hours: 1.4 }, { appId: 'tiktok', hours: 1.1 }] },
  { day: 'Fri', hours: 3.9, softSpots: [{ appId: 'twitter', hours: 2.0 }, { appId: 'tiktok', hours: 1.9 }] },
];

export type ConnectMethod = 'oauth' | 'shortcut' | 'intent';

export type ConnectService = {
  id: string;
  name: string;
  brand: BrandKey;
  method: ConnectMethod;
};

/** @deprecated Use getConnectServicesForPlatform() — list varies by OS. */
export const CONNECT_SERVICES: ConnectService[] = [
  { id: 'notion', name: 'Notion', brand: 'notion', method: 'oauth' },
  { id: 'reminders', name: 'Reminders', brand: 'reminders', method: 'shortcut' },
  { id: 'notes', name: 'Notes', brand: 'notes', method: 'shortcut' },
];

export type OnboardingQuestion =
  | {
      id: string;
      type: 'multi';
      question: string;
      reason?: string;
      options: { id: string; label: string; icon: string }[];
    }
  | {
      id: string;
      type: 'dial';
      question: string;
      reason?: string;
      max: number;
    }
  | {
      id: string;
      type: 'rank';
      question: string;
      reason?: string;
      options: { id: string; label: string; icon: string }[];
    };

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'phone_triggers',
    type: 'multi',
    question: 'When do you reach for your phone most?',
    options: [
      { id: 'morning', label: 'First thing in the morning', icon: 'sunrise' },
      { id: 'work', label: 'During work or class', icon: 'briefcase' },
      { id: 'night', label: 'In bed at night', icon: 'moon' },
      { id: 'bored', label: 'Whenever I get bored', icon: 'spark' },
    ],
  },
  {
    id: 'daily_estimate',
    type: 'dial',
    question: 'How much time do you lose to your phone each day?',
    max: 7,
  },
  {
    id: 'priorities',
    type: 'rank',
    question: 'What should HopOff prioritize for you?',
    options: [
      { id: 'present', label: 'Be more present', icon: 'present' },
      { id: 'goals', label: 'Hit my goals', icon: 'target' },
      { id: 'sleep', label: 'Sleep better', icon: 'sleep' },
      { id: 'habits', label: 'Build better habits', icon: 'habit' },
    ],
  },
];

/** 3 questions + apps + goals + videos + permissions + paywall */
export const ONBOARDING_TOTAL_STEPS = 8;

export const TASK_SUGGESTIONS = [
  'Knock out your top goal for the week',
  'Read 10 pages of a book',
  'Go for a 15 minute walk',
  'Text someone you care about',
  'Stretch and drink some water',
];

/**
 * Curated starter packs. Each is query-driven: when a YouTube key is present we
 * fetch the top few clips live; otherwise we fall back to local samples. `tags`
 * map to onboarding option ids (phone_triggers + priorities) for personalization.
 */
export type StarterPack = {
  id: string;
  title: string;
  description: string;
  query: string;
  tags: string[];
  accent: string;
};

export const STARTER_PACKS: StarterPack[] = [
  {
    id: 'discipline',
    title: 'Discipline',
    description: 'No-excuses fuel for hard days.',
    query: 'self discipline motivation short',
    tags: ['goals', 'habits', 'work'],
    accent: '#45342A',
  },
  {
    id: 'morning',
    title: 'Morning mindset',
    description: 'Win the first hour of your day.',
    query: 'morning motivation routine short',
    tags: ['morning', 'habits'],
    accent: '#2A2E45',
  },
  {
    id: 'wind_down',
    title: 'Wind down',
    description: 'Calm reset for better sleep.',
    query: 'wind down calm sleep mindset short',
    tags: ['night', 'sleep'],
    accent: '#2A3F45',
  },
  {
    id: 'focus',
    title: 'Beat the boredom',
    description: 'Redirect the urge into focus.',
    query: 'focus deep work motivation short',
    tags: ['bored', 'work', 'goals'],
    accent: '#2A4538',
  },
  {
    id: 'present',
    title: 'Be present',
    description: 'Get out of the feed, into your life.',
    query: 'be present mindfulness short',
    tags: ['present', 'sleep'],
    accent: '#452A3C',
  },
];

export function getStarterPack(id: string): StarterPack | undefined {
  return STARTER_PACKS.find((p) => p.id === id);
}

/** Pick up to `max` packs based on the user's onboarding answers. */
export function recommendedPacks(
  answers: Record<string, string | string[] | number>,
  max = 3,
): StarterPack[] {
  const tags = new Set<string>();
  const triggers = answers.phone_triggers;
  if (Array.isArray(triggers)) triggers.forEach((t) => tags.add(t));
  const priorities = answers.priorities;
  if (Array.isArray(priorities)) priorities.slice(0, 2).forEach((t) => tags.add(t));

  if (tags.size === 0) return STARTER_PACKS.slice(0, max);

  const scored = STARTER_PACKS.map((p) => ({
    pack: p,
    score: p.tags.reduce((n, t) => (tags.has(t) ? n + 1 : n), 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).map((s) => s.pack);
  const result = matched.length ? matched : STARTER_PACKS;
  return result.slice(0, max);
}
