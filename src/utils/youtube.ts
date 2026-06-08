import { useApiProxy, youtubeKey } from '@/config/env';
import { searchVideos, type StarterPack, type VideoItem } from '@/data/mock';
import { ApiError, proxyGet } from '@/utils/apiClient';
import { MAX_VIDEO_DURATION_SEC } from '@/utils/videoDuration';
import { fetchVideoDurationsDirect, formatDuration } from '@/utils/youtubeDuration';

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

const MAX_DURATION_SEC = MAX_VIDEO_DURATION_SEC;

type YtSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
  };
  durationLabel?: string;
  durationSec?: number;
};

function toVideoItem(item: YtSearchItem, durationSec?: number): VideoItem | null {
  const videoId = item.id?.videoId;
  if (!videoId) return null;
  const thumb = item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url;
  const sec = item.durationSec ?? durationSec;
  const duration =
    item.durationLabel ?? (sec !== undefined && sec > 0 ? formatDuration(sec) : '');
  return {
    id: `yt-${videoId}`,
    title: decodeEntities(item.snippet.title),
    author: decodeEntities(item.snippet.channelTitle),
    source: 'youtube',
    accent: '#1A1A1A',
    duration,
    videoUrl: '',
    kind: 'youtube',
    youtubeId: videoId,
    thumbnailUrl: thumb ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

export function hasYouTubeKey() {
  return useApiProxy() || youtubeKey().length > 0;
}

function mapItems(items: YtSearchItem[], durations?: Map<string, number>): VideoItem[] {
  return items
    .map((item) => {
      const id = item.id?.videoId;
      const sec = (id ? durations?.get(id) : undefined) ?? item.durationSec;
      if (sec === undefined || sec <= 0 || sec > MAX_DURATION_SEC) return null;
      return toVideoItem(item, sec);
    })
    .filter((v): v is VideoItem => v !== null);
}

async function filterByDuration(items: YtSearchItem[], key: string): Promise<VideoItem[]> {
  const ids = items.map((i) => i.id?.videoId).filter((id): id is string => !!id);
  const durations = await fetchVideoDurationsDirect(ids, key);
  return mapItems(items, durations);
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
        maxDuration: String(MAX_DURATION_SEC),
      });
      const raw = data.items ?? [];
      let mapped = mapItems(raw);
      if (!mapped.length && raw.length) {
        const key = youtubeKey();
        if (key) {
          mapped = await filterByDuration(raw, key);
        }
      }
      return mapped.length
        ? { ok: true, items: mapped.slice(0, max) }
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
    const fetchCount = Math.min(max * 3, 25);
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: String(fetchCount),
      q,
      safeSearch: 'moderate',
      videoDuration: 'short',
      key,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      const reason = data.error?.errors?.[0]?.reason ?? data.error?.message ?? 'YouTube search failed';
      const code = reason === 'quotaExceeded' ? 'quota_exceeded' : 'youtube_error';
      return { ok: false, error: String(reason), code };
    }
    const mapped = (await filterByDuration(data.items ?? [], key)).slice(0, max);
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

export { videoFromShareUrl as videoFromUrl } from '@/utils/videoMetadata';
