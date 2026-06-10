import type { VideoItem } from '@/data/mock';
import { useApiProxy } from '@/config/env';
import { summarizeSocialVideoTitle } from '@/utils/ai';
import { ApiError, proxyGet } from '@/utils/apiClient';
import { parseYouTubeId } from '@/utils/youtube';
import { scrubSocialText } from '@/utils/videoDisplay';
import { formatDuration } from '@/utils/youtubeDuration';

/** Pull the first http(s) URL from share-sheet text. */
export function extractShareUrl(webUrl?: string | null, text?: string | null): string {
  const direct = webUrl?.trim();
  if (direct?.startsWith('http')) return direct;
  const body = text?.trim() ?? '';
  const match = body.match(/https?:\/\/[^\s<>"']+/i);
  return match?.[0] ?? body;
}

/** Strip tracking params so the same reel dedupes reliably. */
export function normalizeShareUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    ['utm_source', 'utm_medium', 'utm_campaign', 'igsh', 'igshid'].forEach((k) => u.searchParams.delete(k));
    let path = u.pathname.replace(/\/+$/, '');
    return `${u.protocol}//${u.host}${path}`;
  } catch {
    return url.trim();
  }
}

function hashUrl(url: string) {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h << 5) - h + url.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function titleFromInstagramPath(path: string): string {
  if (/\/reel\//i.test(path)) return 'Instagram reel';
  if (/\/p\//i.test(path)) return 'Instagram post';
  return 'Instagram clip';
}

function titleFromTikTokPath(path: string): string {
  if (/\/video\//i.test(path)) return 'TikTok video';
  return 'TikTok clip';
}

type OEmbed = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  description?: string;
};

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; HopOff/1.0)',
  Accept: 'application/json',
};

function looksLikeBio(text: string): boolean {
  const t = text.trim();
  if (t.length > 100) return true;
  return (
    /\bborn\b/i.test(t) ||
    /\bon\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(t) ||
    (/\b\d{4}\b/.test(t) && /\bat\s+/i.test(t))
  );
}

function authorFromInstagramUrl(pageUrl: string): string | undefined {
  try {
    const path = new URL(pageUrl).pathname;
    const m = path.match(/^\/([^/]+)\/(?:reel|p|tv)\//i);
    const handle = m?.[1];
    if (!handle || ['reel', 'p', 'tv', 'stories', 'explore'].includes(handle.toLowerCase())) {
      return undefined;
    }
    return handle;
  } catch {
    return undefined;
  }
}

function parseInstagramMeta(
  title?: string,
  author?: string,
  description?: string,
  pageUrl?: string,
): { title: string; author: string } {
  let a = author?.trim().replace(/^@/, '') ?? '';
  const titleRaw = title?.trim() ?? '';
  const descRaw = description?.trim() ?? '';

  const onInsta = titleRaw.match(/^(.+?)\s+on Instagram(?::\s*(.+))?$/i);
  let caption = '';

  if (onInsta) {
    const who = onInsta[1].trim();
    const handle = who.match(/\(@([^)]+)\)/);
    if (!a) {
      a = handle?.[1] || who.replace(/^@/, '').replace(/\s*\(@[^)]+\)/, '').trim();
    }
    caption = onInsta[2]?.replace(/^["']|["']$/g, '').trim() ?? '';
  }

  let t = caption;
  if (!t) {
    const cleanedTitle = scrubSocialText(titleRaw);
    if (cleanedTitle && cleanedTitle.length <= 80 && !looksLikeBio(cleanedTitle)) {
      t = cleanedTitle;
    } else if (descRaw) {
      t = scrubSocialText(descRaw);
    } else {
      t = cleanedTitle;
    }
  } else {
    t = scrubSocialText(t);
  }

  if (!a && pageUrl) {
    a = authorFromInstagramUrl(pageUrl) ?? '';
  }

  a = scrubSocialText(a).replace(/^@/, '').trim();

  return { title: t || 'Instagram reel', author: a || 'Instagram' };
}

async function fetchOEmbed(endpoint: string, pageUrl: string, platform?: 'instagram' | 'tiktok'): Promise<OEmbed> {
  const params = new URLSearchParams({
    url: pageUrl,
    format: 'json',
  });
  if (platform === 'instagram') params.set('maxwidth', '640');

  const res = await fetch(`${endpoint}?${params.toString()}`, { headers: FETCH_HEADERS });
  if (!res.ok) return {};
  return (await res.json()) as OEmbed;
}

async function fetchYouTubeOEmbed(youtubeId: string): Promise<Partial<VideoItem>> {
  try {
    const watch = `https://www.youtube.com/watch?v=${youtubeId}`;
    const data = await fetchOEmbed('https://www.youtube.com/oembed', watch);
    return {
      title: data.title?.trim() || 'YouTube video',
      author: data.author_name?.trim() || 'YouTube',
      thumbnailUrl: data.thumbnail_url ?? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  } catch {
    return {
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }
}

function mapLinkOEmbed(
  data: OEmbed,
  platform: 'instagram' | 'tiktok',
  pageUrl: string,
): Partial<VideoItem> {
  if (platform === 'instagram') {
    const parsed = parseInstagramMeta(data.title, data.author_name, data.description, pageUrl);
    return {
      title: parsed.title,
      author: parsed.author,
      thumbnailUrl: data.thumbnail_url,
    };
  }
  const title = scrubSocialText(data.title?.trim() ?? '');
  const author = scrubSocialText(data.author_name?.trim() ?? '') || 'TikTok';
  return {
    title: title || scrubSocialText(data.description?.trim() ?? '') || 'TikTok clip',
    author,
    thumbnailUrl: data.thumbnail_url,
  };
}

async function fetchLinkOEmbedFromProxy(
  pageUrl: string,
  platform: 'instagram' | 'tiktok',
): Promise<Partial<VideoItem>> {
  if (!useApiProxy()) return {};
  try {
    const data = await proxyGet<OEmbed>('/api/oembed', { url: pageUrl });
    return mapLinkOEmbed(data, platform, pageUrl);
  } catch (e) {
    if (__DEV__ && e instanceof ApiError) {
      console.warn('[oembed] proxy failed', pageUrl, e.status, e.message);
    }
    return {};
  }
}

async function fetchLinkOEmbed(pageUrl: string, platform: 'instagram' | 'tiktok'): Promise<Partial<VideoItem>> {
  const endpoints =
    platform === 'instagram'
      ? ['https://api.instagram.com/oembed', 'https://www.instagram.com/oembed']
      : ['https://www.tiktok.com/oembed'];

  for (const endpoint of endpoints) {
    try {
      const data = await fetchOEmbed(endpoint, pageUrl, platform);
      if (data.title || data.author_name || data.thumbnail_url) {
        return mapLinkOEmbed(data, platform, pageUrl);
      }
    } catch {
      /* try next */
    }
  }

  try {
    const data = await fetchOEmbed('https://noembed.com/embed', pageUrl, platform);
    if (data.title || data.author_name || data.thumbnail_url) {
      return mapLinkOEmbed(data, platform, pageUrl);
    }
  } catch {
    /* fall through */
  }

  const proxied = await fetchLinkOEmbedFromProxy(pageUrl, platform);
  if (proxied.title || proxied.thumbnailUrl || proxied.author) return proxied;

  return {};
}

/** Fill title, author, thumbnail, and duration when possible. */
export async function enrichVideoMetadata(video: VideoItem): Promise<VideoItem> {
  if (video.kind === 'youtube' && video.youtubeId) {
    const meta = await fetchYouTubeOEmbed(video.youtubeId);
    return { ...video, ...meta };
  }

  if (video.kind === 'link' && video.videoUrl) {
    try {
      const u = new URL(video.videoUrl);
      const isInsta = /instagram\.com/i.test(u.host);
      const isTikTok = /tiktok\.com/i.test(u.host);
      const fallbackTitle = isInsta
        ? titleFromInstagramPath(u.pathname)
        : isTikTok
          ? titleFromTikTokPath(u.pathname)
          : video.title;
      const fallbackAuthor = isTikTok ? 'TikTok' : isInsta ? 'Instagram' : video.author;

      if (isInsta || isTikTok) {
        const meta = await fetchLinkOEmbed(video.videoUrl, isInsta ? 'instagram' : 'tiktok');
        let title = meta.title || fallbackTitle;
        let author = meta.author || fallbackAuthor;

        if (author === 'Instagram' && isInsta) {
          const fromUrl = authorFromInstagramUrl(video.videoUrl);
          if (fromUrl) author = fromUrl;
        }

        const platform = isInsta ? 'instagram' : 'tiktok';
        title = await summarizeSocialVideoTitle(title, author, platform);

        if (__DEV__) {
          console.log('[enrich]', platform, { raw: meta.title, title, author });
        }

        return {
          ...video,
          title,
          author,
          thumbnailUrl: meta.thumbnailUrl ?? video.thumbnailUrl,
        };
      }

      return { ...video, title: fallbackTitle };
    } catch {
      return video;
    }
  }

  return video;
}

/** Turn a shared/pasted URL into a saveable VideoItem (sync). */
export function videoFromShareUrl(raw: string): VideoItem | null {
  const normalized = normalizeShareUrl(raw);
  if (!normalized) return null;

  const ytId = parseYouTubeId(normalized);
  if (ytId) {
    return {
      id: `yt-${ytId}`,
      title: 'YouTube video',
      author: 'YouTube',
      source: 'youtube',
      accent: '#1A1A1A',
      duration: '',
      videoUrl: '',
      kind: 'youtube',
      youtubeId: ytId,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  const isTikTok = /tiktok\.com/i.test(normalized);
  const isInsta = /instagram\.com/i.test(normalized);
  if (isTikTok || isInsta) {
    let title = isTikTok ? 'TikTok clip' : 'Instagram clip';
    try {
      const u = new URL(normalized);
      title = isTikTok ? titleFromTikTokPath(u.pathname) : titleFromInstagramPath(u.pathname);
    } catch {
      /* keep default */
    }
    return {
      id: `link-${hashUrl(normalized)}`,
      title,
      author: isTikTok ? 'TikTok' : 'Instagram',
      source: isTikTok ? 'tiktok' : 'instagram',
      accent: isTikTok ? '#111111' : '#2A1830',
      duration: '',
      videoUrl: normalized,
      kind: 'link',
    };
  }

  return null;
}

/** Apply YouTube API duration when a key is available (optional). */
export async function attachYouTubeDuration(
  video: VideoItem,
  durationSec: number,
): Promise<VideoItem> {
  if (durationSec <= 0) return video;
  return { ...video, duration: formatDuration(durationSec) };
}
