import { useApiProxy, youtubeKey } from '@/config/env';
import { searchVideos, type StarterPack, type VideoItem } from '@/data/mock';
import { ApiError, proxyGet } from '@/utils/apiClient';

export type YouTubeSearchResult =
  | { ok: true; items: VideoItem[]; fromFallback?: boolean }
  | { ok: false; error: string; code?: string };

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Extract a YouTube video id from any common URL shape (or a bare id). */
export function parseYouTubeId(input: string): string | null {
  const url = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?[^ ]*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

type YtSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
  };
};

function toVideoItem(item: YtSearchItem): VideoItem | null {
  const videoId = item.id?.videoId;
  if (!videoId) return null;
  const thumb = item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url;
  return {
    id: `yt-${videoId}`,
    title: decodeEntities(item.snippet.title),
    author: decodeEntities(item.snippet.channelTitle),
    source: 'youtube',
    accent: '#1A1A1A',
    duration: '',
    videoUrl: '',
    kind: 'youtube',
    youtubeId: videoId,
    thumbnailUrl: thumb,
  };
}

export function hasYouTubeKey() {
  return useApiProxy() || youtubeKey().length > 0;
}

function mapItems(items: YtSearchItem[]): VideoItem[] {
  return items.map(toVideoItem).filter((v): v is VideoItem => v !== null);
}

/** Search YouTube with structured errors. Falls back to local samples when offline / no key. */
export async function searchYouTube(query: string, max = 12): Promise<YouTubeSearchResult> {
  const q = query.trim();
  if (!q) return { ok: true, items: searchVideos(q), fromFallback: true };

  if (useApiProxy()) {
    try {
      const data = await proxyGet<{ items: YtSearchItem[] }>('/api/youtube/search', {
        q,
        max: String(max),
      });
      const mapped = mapItems(data.items ?? []);
      return mapped.length
        ? { ok: true, items: mapped }
        : { ok: true, items: searchVideos(q), fromFallback: true };
    } catch (e) {
      if (e instanceof ApiError) {
        if (__DEV__) console.warn('[youtube] proxy error', e.message, e.code);
        return { ok: false, error: e.message, code: e.code };
      }
      if (__DEV__) console.warn('[youtube] network error', e);
      return { ok: false, error: 'Could not reach the search API. Check your connection.', code: 'network' };
    }
  }

  const key = youtubeKey();
  if (!key) {
    return { ok: true, items: searchVideos(q), fromFallback: true };
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: String(max),
      q,
      safeSearch: 'moderate',
      key,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      const reason = data.error?.errors?.[0]?.reason ?? data.error?.message ?? 'YouTube search failed';
      const code = reason === 'quotaExceeded' ? 'quota_exceeded' : 'youtube_error';
      return { ok: false, error: String(reason), code };
    }
    const mapped = mapItems(data.items ?? []);
    return mapped.length
      ? { ok: true, items: mapped }
      : { ok: true, items: searchVideos(q), fromFallback: true };
  } catch {
    return { ok: false, error: 'Search unavailable. Check your connection.', code: 'network' };
  }
}

/** Build a starter pack's videos (live YouTube when possible, else samples). */
export async function fetchPackVideos(pack: StarterPack, max = 4): Promise<VideoItem[]> {
  if (hasYouTubeKey()) {
    const result = await searchYouTube(pack.query, max);
    if (result.ok) return result.items.slice(0, max);
  }
  return searchVideos(pack.query).slice(0, max);
}

/** Turn a shared/pasted URL into a saveable VideoItem. */
export function videoFromUrl(rawUrl: string): VideoItem | null {
  const url = rawUrl.trim();
  if (!url) return null;

  const ytId = parseYouTubeId(url);
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

  const isTikTok = /tiktok\.com/i.test(url);
  const isInsta = /instagram\.com/i.test(url);
  if (isTikTok || isInsta) {
    return {
      id: `link-${hashUrl(url)}`,
      title: isTikTok ? 'TikTok clip' : 'Instagram clip',
      author: isTikTok ? 'TikTok' : 'Instagram',
      source: isTikTok ? 'tiktok' : 'instagram',
      accent: isTikTok ? '#111111' : '#2A1830',
      duration: '',
      videoUrl: url,
      kind: 'link',
    };
  }

  return null;
}

function hashUrl(url: string) {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h << 5) - h + url.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
