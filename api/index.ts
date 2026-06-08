import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_cors';

/** GET /api — quick check that serverless routes deployed. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  return res.status(200).json({
    ok: true,
    service: 'hopoff-api',
    routes: ['/api/openrouter', '/api/youtube/search', '/api/notion/token', '/api/oembed'],
  });
}
