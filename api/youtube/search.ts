import type { VercelRequest, VercelResponse } from '@vercel/node';

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured on server', code: 'config' });
  }

  const q = String(req.query.q ?? '').trim();
  const max = Math.min(Number(req.query.max ?? 12), 25);
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' });
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

    return res.status(200).json({ items: data.items ?? [] });
  } catch {
    return res.status(502).json({ error: 'YouTube upstream unavailable', code: 'upstream' });
  }
}
