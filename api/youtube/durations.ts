import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_cors';
import { fetchVideoDurations, formatDuration } from './_duration';

/** Batch lookup YouTube video durations by id (for starter library sync). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured on server', code: 'config' });
  }

  const raw = String(req.query.ids ?? '').trim();
  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (!ids.length) {
    return res.status(400).json({ error: 'Missing query parameter ids' });
  }

  try {
    const secMap = await fetchVideoDurations(ids, key);
    const durations: Record<string, number> = {};
    const labels: Record<string, string> = {};
    for (const id of ids) {
      const sec = secMap.get(id);
      if (sec !== undefined && sec > 0) {
        durations[id] = sec;
        labels[id] = formatDuration(sec);
      }
    }
    return res.status(200).json({ durations, labels });
  } catch {
    return res.status(502).json({ error: 'YouTube upstream unavailable', code: 'upstream' });
  }
}
