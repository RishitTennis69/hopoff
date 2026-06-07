import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../_cors';

const NOTION_TOKEN_URL = 'https://api.notion.com/v1/oauth/token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Notion OAuth not configured on server', code: 'config' });
  }

  const { code, redirectUri } = req.body ?? {};
  if (!code || !redirectUri) {
    return res.status(400).json({ error: 'Missing code or redirectUri' });
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const upstream = await fetch(NOTION_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data.error ?? 'Notion token exchange failed',
        code: 'notion_error',
      });
    }

    return res.status(200).json({
      accessToken: data.access_token,
      workspaceId: data.workspace_id,
      workspaceName: data.workspace_name,
    });
  } catch {
    return res.status(502).json({ error: 'Notion upstream unavailable', code: 'upstream' });
  }
}
