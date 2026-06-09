import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_cors';

const NOTION_VERSION = '2022-06-28';

async function notionFetch(path: string, accessToken: string, init?: RequestInit) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/** POST /api/notion/databases — list databases shared with HopOff. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body ?? {};
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  try {
    const { res: searchRes, data: searchData } = await notionFetch('/search', accessToken, {
      method: 'POST',
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        page_size: 20,
      }),
    });

    if (!searchRes.ok) {
      return res.status(searchRes.status).json({
        error: searchData.message ?? 'Notion search failed',
        code: 'notion_error',
      });
    }

    const databases = (searchData.results ?? [])
      .filter((r: { object?: string }) => r.object === 'database')
      .map((db: { id: string; title?: { plain_text?: string }[] }) => ({
        id: db.id,
        title: db.title?.map((t) => t.plain_text ?? '').join('').trim() || 'Untitled database',
      }));

    return res.status(200).json({ databases });
  } catch {
    return res.status(502).json({ error: 'Notion upstream unavailable', code: 'upstream' });
  }
}
