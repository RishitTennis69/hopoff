import type { VercelRequest, VercelResponse } from '@vercel/node';

/** HTTPS bridge: Notion redirects here, then we forward to the app deep link. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => typeof v === 'string' && qs.append(key, v));
  }

  const deepLink = `hoptfoff://notion-callback?${qs.toString()}`;
  const safe = deepLink.replace(/"/g, '&quot;');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HopOff</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #000; color: #fff;
      display: flex; min-height: 100vh; align-items: center; justify-content: center; }
    p { opacity: 0.7; font-size: 15px; }
  </style>
</head>
<body>
  <p>Returning to HopOff…</p>
  <script>window.location.replace("${safe}");</script>
</body>
</html>`);
}
