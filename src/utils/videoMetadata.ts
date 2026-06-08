import type { VideoItem } from '@/data/mock';
import { useApiProxy } from '@/config/env';
import { ApiError, proxyGet } from '@/utils/apiClient';
import { parseYouTubeId } from '@/utils/youtube';
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

type OEmbed = { title?: string; author_name?: string; thumbnail_url?: string };

async function fetchOEmbed(endpoint: string, pageUrl: string): Promise<OEmbed> {
  const res = await fetch(`${endpoint}?url=${encodeURIComponent(pageUrl)}&format=json`);
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

async function fetchLinkOEmbedFromProxy(pageUrl: string): Promise<Partial<VideoItem>> {
  if (!useApiProxy()) return {};
  try {
    const data = await proxyGet<OEmbed>('/api/oembed', { url: pageUrl });
    const title = data.title?.trim();
    return {
      title: title?.replace(/\s*•\s*Instagram$/i, '').trim() || title,
      author: data.author_name?.trim(),
      thumbnailUrl: data.thumbnail_url,
    };
  } catch (e) {
    if (__DEV__ && e instanceof ApiError) {
      console.warn('[oembed] proxy failed', pageUrl, e.status, e.message);
    }
    return {};
  }
}

async function fetchLinkOEmbed(pageUrl: string, platform: 'instagram' | 'tiktok'): Promise<Partial<VideoItem>> {
  const proxied = await fetchLinkOEmbedFromProxy(pageUrl);
  if (proxied.title || proxied.thumbnailUrl || proxied.author) return proxied;

  const endpoints =
    platform === 'instagram'
      ? ['https://api.instagram.com/oembed', 'https://www.instagram.com/oembed']
      : ['https://www.tiktok.com/oembed'];

  for (const endpoint of endpoints) {
    try {
      const data = await fetchOEmbed(endpoint, pageUrl);
      if (data.title || data.author_name || data.thumbnail_url) {
        return {
          title: data.title?.trim(),
          author: data.author_name?.trim(),
          thumbnailUrl: data.thumbnail_url,
        };
      }
    } catch {
      /* try next */
    }
  }

  try {
    const data = await fetchOEmbed('https://noembed.com/embed', pageUrl);
    if (data.title || data.author_name || data.thumbnail_url) {
      return {
        title: data.title?.trim(),
        author: data.author_name?.trim(),
        thumbnailUrl: data.thumbnail_url,
      };
    }
  } catch {
    /* fall through */
  }

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
        return {
          ...video,
          title: meta.title || fallbackTitle,
          author: meta.author || fallbackAuthor,
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
