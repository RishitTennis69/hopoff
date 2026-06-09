import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_cors';

const NOTION_VERSION = '2022-06-28';

type NotionRichText = { plain_text?: string };
type NotionTitle = { title?: NotionRichText[] };
type NotionProperty = NotionTitle & { rich_text?: NotionRichText[]; name?: string; type?: string };

function extractPlain(prop: NotionProperty | undefined): string {
  if (!prop) return '';
  const fromTitle = prop.title?.map((t) => t.plain_text ?? '').join('').trim();
  if (fromTitle) return fromTitle;
  return prop.rich_text?.map((t) => t.plain_text ?? '').join('').trim() ?? '';
}

function pageTitle(properties: Record<string, NotionProperty>): string {
  for (const key of Object.keys(properties)) {
    const prop = properties[key];
    if (prop?.type === 'title' || prop?.title?.length) {
      const text = extractPlain(prop);
      if (text) return text;
    }
  }
  for (const key of Object.keys(properties)) {
    const text = extractPlain(properties[key]);
    if (text) return text;
  }
  return '';
}

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

/** POST /api/notion/goals — list goal titles from the user's first shared database. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken, databaseId: requestedId } = req.body ?? {};
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

    const databases = (searchData.results ?? []).filter(
      (r: { object?: string }) => r.object === 'database',
    );
    if (!databases.length) {
      return res.status(404).json({
        error: 'No Notion databases shared with HopOff. Share a goals database with your integration.',
        code: 'no_database',
      });
    }

    const databaseId =
      typeof requestedId === 'string' && databases.some((d: { id: string }) => d.id === requestedId)
        ? requestedId
        : (databases[0].id as string);
    const { res: queryRes, data: queryData } = await notionFetch(`/databases/${databaseId}/query`, accessToken, {
      method: 'POST',
      body: JSON.stringify({ page_size: 50 }),
    });

    if (!queryRes.ok) {
      return res.status(queryRes.status).json({
        error: queryData.message ?? 'Notion query failed',
        code: 'notion_error',
      });
    }

    const goals: string[] = [];
    for (const page of queryData.results ?? []) {
      const title = pageTitle(page.properties ?? {});
      if (title) goals.push(title);
    }

    return res.status(200).json({
      goals,
      databaseId,
      databaseTitle: databases[0].title?.[0]?.plain_text ?? 'Notion database',
    });
  } catch {
    return res.status(502).json({ error: 'Notion upstream unavailable', code: 'upstream' });
  }
}
