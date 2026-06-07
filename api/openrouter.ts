import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_cors';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured on server' });
  }

  const { system, user, model = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash', temperature = 0.35 } = req.body ?? {};
  if (!system || !user) {
    return res.status(400).json({ error: 'Missing system or user message' });
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.APP_URL ?? 'https://hopoff.app',
        'X-Title': 'HopOff',
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data.error?.message ?? 'OpenRouter request failed',
        code: 'openrouter_error',
      });
    }

    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    return res.status(200).json({ content });
  } catch {
    return res.status(502).json({ error: 'Upstream unavailable', code: 'upstream' });
  }
}
