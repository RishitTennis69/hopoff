import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_cors';
import { fetchVideoDurations, formatDuration } from './_duration';

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const DEFAULT_MAX_DURATION_SEC = 59;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured on server', code: 'config' });
  }

  const q = String(req.query.q ?? '').trim();
  const max = Math.min(Number(req.query.max ?? 12), 25);
  const maxDurationSec = Math.min(Number(req.query.maxDuration ?? DEFAULT_MAX_DURATION_SEC), 600);
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' });
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
    const upstream = await fetch(`${SEARCH_URL}?${params.toString()}`);
    const data = await upstream.json();

    if (!upstream.ok) {
      const reason = data.error?.errors?.[0]?.reason ?? data.error?.message;
      const code =
        reason === 'quotaExceeded' ? 'quota_exceeded' : upstream.status === 403 ? 'forbidden' : 'youtube_error';
      return res.status(upstream.status).json({
        error: reason ?? 'YouTube search failed',
        code,
      });
    }

    const rawItems = data.items ?? [];
    const videoIds = rawItems
      .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
      .filter((id: string | undefined): id is string => !!id);

    const durations = await fetchVideoDurations(videoIds, key);
    const filtered = rawItems.filter((item: { id?: { videoId?: string } }) => {
      const id = item.id?.videoId;
      if (!id) return false;
      const sec = durations.get(id);
      if (sec === undefined) return false;
      return sec > 0 && sec <= maxDurationSec;
    }).slice(0, max);

    const items = filtered.map((item: { id?: { videoId?: string }; snippet?: Record<string, unknown> }) => {
      const id = item.id?.videoId;
      const sec = id ? durations.get(id) : undefined;
      return {
        ...item,
        durationSec: sec,
        durationLabel: sec ? formatDuration(sec) : undefined,
      };
    });

    return res.status(200).json({ items });
  } catch {
    return res.status(502).json({ error: 'YouTube upstream unavailable', code: 'upstream' });
  }
}
