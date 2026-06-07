# HopOff — Production Checklist

Ordered by **when** to do things: top = do now, bottom = after launch.

**Owner key:** **You** = accounts, keys, store, legal hosting · **Dev** = code in this repo

**Live API:** `https://hopoff.vercel.app` — smoke-tested `/api` + YouTube; OpenRouter uses `google/gemini-2.5-flash`.

---

## 1. Right now — unblock real features

| Task | Owner | Status |
|------|-------|--------|
| OpenRouter API key | **You** | [x] |
| Google Cloud + YouTube Data API key | **You** | [x] |
| Notion integration (client ID + secret) | **You** | [x] |
| Deploy `/api` to Vercel | **You** | [x] — [`docs/DEPLOY-API.md`](docs/DEPLOY-API.md) |
| Set server env vars from `api/.env.example` | **You** | [x] (verify `OPENROUTER_MODEL=google/gemini-2.5-flash` on Vercel) |
| Set `EXPO_PUBLIC_API_BASE_URL` in app `.env` | **You** | [x] |
| Set `EXPO_PUBLIC_NOTION_CLIENT_ID` in app `.env` | **You** | [x] |
| Add Notion OAuth redirect URL (`hoptfoff://notion-callback`) | **You** | [ ] verify in Notion console |
| Remove client API keys from app `.env` (keys only on Vercel) | **You** | [ ] optional security cleanup |
| API proxy routes | **Dev** | [x] |
| Client proxy wiring | **Dev** | [x] |
| `vercel.json` + deploy guide | **Dev** | [x] |
| Default OpenRouter model → `google/gemini-2.5-flash` | **Dev** | [x] |

**Smoke test** (any time):
```bash
curl https://hopoff.vercel.app/api
curl "https://hopoff.vercel.app/api/youtube/search?q=motivation"
curl -X POST https://hopoff.vercel.app/api/openrouter -H "Content-Type: application/json" -d "{\"system\":\"Say ok\",\"user\":\"test\",\"model\":\"google/gemini-2.5-flash\"}"
```

After any `.env` change → **restart Expo**.

---

## 2. Before device testing (TestFlight / internal APK)

You need a **development build** (not Expo Go) for share sheet, mic, and future native blocking.

**Step-by-step:** [`docs/DEV-BUILD.md`](docs/DEV-BUILD.md)

```bash
npm install -g eas-cli && eas login
eas build:configure
eas build --profile development --platform ios   # or android
npx expo start --dev-client
```

| Task | Owner | Status |
|------|-------|--------|
| `eas build:configure` + link Expo account | **You** | [ ] |
| `eas build --profile development` (iOS + Android) | **You** | [ ] |
| `expo-dev-client` in project | **Dev** | [x] |
| `eas.json` + [`docs/DEV-BUILD.md`](docs/DEV-BUILD.md) | **Dev** | [x] |
| App display name → **HopOff** in `app.json` | **Dev** | [x] |
| Test share sheet (TikTok / IG → HopOff) | **You** | [ ] |
| Test mic + speech-to-text on goals | **You** | [ ] |
| Test YouTube search in app | **You** | [ ] |
| Test Notion Connect on device | **You** | [ ] |
| Test Screen Time permission prompt (iOS) | **You** | [ ] |

---

## 3. Before App Store / Play submit

| Task | Owner | Status |
|------|-------|--------|
| App Store Connect app + subscriptions ($9.99/mo, $59.99/yr, 7-day trial) | **You** | [ ] |
| Google Play app + matching subscription products | **You** | [ ] |
| RevenueCat project linked to both stores | **You** | [ ] |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` in EAS secrets | **You** | [ ] |
| Product IDs match `EXPO_PUBLIC_RC_PRODUCT_*` in `.env` | **You** | [ ] |
| Payments service + paywall + restore (Settings) | **Dev** | [x] |
| Privacy policy hosted at public URL | **You** | [ ] — draft: [`legal/privacy-policy.md`](legal/privacy-policy.md) |
| Terms of service hosted at public URL | **You** | [ ] — draft: [`legal/terms-of-service.md`](legal/terms-of-service.md) |
| Subscription disclosure in store listing + paywall | **You** | [ ] — copy: [`docs/store-listing-draft.md`](docs/store-listing-draft.md) |
| App icon + screenshots (5–6 per size) + optional preview video | **You** | [ ] |
| Store description / subtitle / keywords | **You** | [ ] — draft: [`docs/store-listing-draft.md`](docs/store-listing-draft.md) |
| Age rating questionnaire | **You** | [ ] |
| Apple Privacy Nutrition Labels | **You** | [ ] |
| Google Play Data Safety form | **You** | [ ] |
| GDPR / CCPA review if applicable | **You** | [ ] |
| Decide final slug (`hoptfoff` vs rename bundle ID) | **You** | [ ] |
| `eas build --profile production` | **You** | [ ] |
| `eas submit` iOS + Android | **You** | [ ] |

**Store fees (unrelated to API usage):** Apple Developer **$99/yr**, Google Play **$25 one-time** — pay when you submit, not per user.

---

## 4. Native app blocking (before “real” blocking ships)

| Task | Owner | Status |
|------|-------|--------|
| App blocking service + intervention wiring | **Dev** | [x] |
| Block screen + dev simulation | **Dev** | [x] |
| iOS Family Controls native module | **Dev** | [ ] |
| Android Accessibility / Usage Stats module | **Dev** | [ ] |
| Test app-open → block overlay on real devices | **You** + **Dev** | [ ] |

---

## 5. iOS Shortcuts (optional for v1)

| Task | Owner | Status |
|------|-------|--------|
| Build + publish Reminders + Notes Shortcuts | **You** | [ ] — [`docs/ios-shortcuts.md`](docs/ios-shortcuts.md) |
| Set `EXPO_PUBLIC_SHORTCUT_*_URL` in `.env` | **You** | [ ] |
| Shortcut URL env wiring in app | **Dev** | [x] |

---

## 6. Post-launch (dev backlog)

| Task | Owner | Status |
|------|-------|--------|
| Notion goals database pull/push API endpoint | **Dev** | [ ] |
| Wire `expo-notifications` when push certs ready | **Dev** | [ ] |
| Wire account sync to real auth provider | **Dev** | [ ] |
| TikTok / IG direct import (APIs limited — share sheet works) | **Dev** | [ ] |
| Widget / Apple Watch / referral flow | **Dev** | [ ] |

---

## Cost & scale — when do you start paying?

Rough order-of-magnitude for **HopOff’s current stack**. Not legal/financial advice — check each provider’s pricing page.

| Service | Free tier / starting cost | When you’ll likely pay | Ballpark at scale |
|---------|---------------------------|------------------------|-------------------|
| **OpenRouter** (AI) | No free tier; add credit ($5+) | **From first real AI call** — but cost is tiny per user | ~$0.001–0.01 per goal polish / insight. **100 active users × a few AI calls/week ≈ $1–5/mo.** **1,000 users ≈ $10–50/mo** depending on usage |
| **YouTube Data API** | ~10,000 quota units/day free | **~100+ searches/day** across all users (each search ≈ 100 units) | Request quota increase from Google (still often free for small apps) or cache results |
| **Notion API** | Free for normal OAuth/API use | Unlikely at small scale | Enterprise only at large org scale |
| **Vercel** (API proxy) | Hobby free tier | **High traffic** — many serverless invocations or bandwidth over limits | Hobby fine for hundreds–low thousands of users; Pro ~$20/mo if you outgrow limits |
| **RevenueCat** | Free until **$2,500/mo tracked revenue** | When subscriptions generate real MRR past that | Then % of revenue |
| **Expo EAS** | Limited free builds | Extra **build minutes** if you build constantly | Optional paid plan |
| **Apple / Google** | $99/yr + $25 one-time | **At store submit** | Not per-user |

### Simple mental model

| Users | What to expect |
|-------|----------------|
| **You + friends (1–50)** | OpenRouter maybe **$1–5 total** if you add $5 credit. Everything else **$0**. |
| **Early launch (50–500)** | OpenRouter **~$5–20/mo**. YouTube + Vercel still likely **$0**. |
| **Growing (500–5,000)** | OpenRouter **~$20–100/mo**; consider caching YouTube search; watch Vercel usage. |
| **5,000+** | Budget for Vercel Pro, OpenRouter spend, possible YouTube quota increase; RevenueCat may take a cut once MRR > $2.5k. |

**First thing you pay for in practice:** a few dollars of **OpenRouter credit** as soon as AI features run in production — not “at X users.”

**First infrastructure upgrade:** usually **Vercel Pro** or **YouTube quota** — typically in the **low thousands of active users** range, not hundreds.

---

## Already done (dev)

- UI / onboarding flow
- Real usage store + dashboard stats
- Permissions, offline handling, share intent, payments code
- API proxy deployed and smoke-tested

---

## Bottom line

**Done:** API keys, Vercel deploy, app `.env` wired.

**Next:** restart Expo → test in app → EAS dev build on a real phone.

**Before submit:** stores + RevenueCat + host legal docs + screenshots.

**After launch:** native blocking, Notion sync, push, account sync.
