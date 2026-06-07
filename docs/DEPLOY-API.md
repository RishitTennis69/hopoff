# Deploy the HopOff API proxy (Vercel)

The `/api` folder is ready to deploy. You only need accounts and env vars.

## 1. Create API keys (if you have not already)

| Service | Where | Used for |
|---------|-------|----------|
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | Goal polish + time insights |
| YouTube Data API | [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com) | Video search in app |
| Notion integration | [notion.so/my-integrations](https://www.notion.so/my-integrations) | Goals OAuth (client ID + secret) |

## 2. Deploy to Vercel

1. Push this repo to GitHub (if not already).
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo.
3. Leave **Root Directory** as `.` (project root).
4. **Important — override the Expo preset:**
   - Framework Preset: **Other**
   - Build Command: **leave empty**
   - Output Directory: **leave empty**
   - (Or rely on `vercel.json` in the repo — it already disables the Expo web build.)
5. Under **Environment Variables**, add everything from `api/.env.example`:

   ```
   OPENROUTER_API_KEY=
   YOUTUBE_API_KEY=
   NOTION_CLIENT_ID=
   NOTION_CLIENT_SECRET=
   APP_URL=https://YOUR-PROJECT.vercel.app
   ```

5. Deploy. Copy the production URL (e.g. `https://hopoff-api.vercel.app`).

### 404?

| URL | Expected |
|-----|----------|
| `https://YOUR-URL.vercel.app/` | **404** — no website, API only |
| `https://YOUR-URL.vercel.app/api` | **200** JSON `{ ok: true, ... }` |
| `https://YOUR-URL.vercel.app/api/openrouter` | **405** on GET, **500** on POST without env vars |

If `/api` is also 404, redeploy with Framework = **Other** and empty build command (see step 4).

## 3. Wire the app

In your app `.env`:

```
EXPO_PUBLIC_API_BASE_URL=https://YOUR-PROJECT.vercel.app
EXPO_PUBLIC_NOTION_CLIENT_ID=your_notion_client_id
```

Restart Expo. You can remove `EXPO_PUBLIC_OPENROUTER_API_KEY` and `EXPO_PUBLIC_YOUTUBE_API_KEY` from the client once the proxy works.

## 4. Notion redirect URL

In your Notion integration settings, add the redirect URL your app uses:

- Dev: run the app once and log `Linking.createURL('notion-callback')` — typically `hoptfoff://notion-callback`
- Production: same scheme after you set a custom URL scheme in `app.json` if needed

## 5. Smoke test

```bash
curl -X POST https://YOUR-PROJECT.vercel.app/api/openrouter \
  -H "Content-Type: application/json" \
  -d '{"system":"Reply hi","user":"hi"}'
```

You should get JSON with a `content` field.
