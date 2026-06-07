import type { VercelRequest, VercelResponse } from '@vercel/node';

/** GET /api — quick check that serverless routes deployed. */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    ok: true,
    service: 'hopoff-api',
    routes: ['/api/openrouter', '/api/youtube/search', '/api/notion/token'],
  });
}
