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

You need a **development build** (not Expo Go) for share sheet, mic, Notion OAuth, installed-app detection, and screen-time import.

**Build guide:** [`docs/DEV-BUILD.md`](docs/DEV-BUILD.md)  
**Time-gated / easy-to-miss tests:** [`docs/DEFERRED-TESTING.md`](docs/DEFERRED-TESTING.md) — trial expiry, overlay timing, week chart, iOS Shortcuts vs Android, etc.

```bash
npm install -g eas-cli && eas login
eas build:configure
eas build --profile development --platform ios   # or android
npx expo start --dev-client
```

**Rebuild required** after `hopoff-device` native module or `app.json` permission changes — Metro reload is not enough.

### 2a. Build & environment

| Task | Owner | Status |
|------|-------|--------|
| `eas build:configure` + link Expo account | **You** | [ ] |
| `eas build --profile development` (iOS + Android) | **You** | [ ] — rebuild after latest native changes |
| `expo-dev-client` + `hopoff-device` module | **Dev** | [x] |
| `eas.json` + [`docs/DEV-BUILD.md`](docs/DEV-BUILD.md) | **Dev** | [x] |
| App display name → **HopOff** in `app.json` | **Dev** | [x] |
| Notion redirect `hoptfoff://notion-callback` in Notion console | **You** | [ ] verify (dev build — not Expo Go) |
| Vercel redeploy after YouTube duration API change | **You** | [ ] if search timestamps missing |

### 2b. Immediate device tests (same session)

| Task | Owner | Status |
|------|-------|--------|
| Open app via **dev client** (not Expo Go) | **You** | [ ] |
| Share sheet — TikTok / IG / YT → HopOff | **You** | [ ] |
| Mic + speech-to-text on Goals (start/stop cue) | **You** | [ ] |
| YouTube search — results ≤2 min + timestamps | **You** | [ ] |
| Notion Connect on device | **You** | [ ] — if fail, read alert (Go vs dev URI / Vercel secret) |
| **Block overlay — Preview block screen** (Home) | **You** | [ ] |
| **Block overlay — Simulate limit hit** (Home, dev) | **You** | [ ] |
| Apps tab — only **installed** apps listed | **You** | [ ] |
| Apps — Select all, Create Group (full-width tap) | **You** | [ ] |
| Group name input cursor centered | **You** | [ ] |
| Onboarding ranking icons + drag (no bounce) | **You** | [ ] |
| Videos grid — 2 columns when width allows | **You** | [ ] |
| Tab titles centered (Home, Apps, Videos, Goals) | **You** | [ ] |

### 2c. Permissions & platform-specific

| Task | Owner | Status |
|------|-------|--------|
| iOS Screen Time / Android Accessibility prompt | **You** | [ ] |
| Android **Usage access** (week chart import) | **You** | [ ] — Settings → Special app access → Usage access → HopOff |
| Week chart fills from device (Android) | **You** | [ ] — see [`docs/BACKLOG.md`](docs/BACKLOG.md) |
| iOS installed-app detection (URL schemes) | **You** | [ ] |
| Polish my list (AI) | **You** | [ ] |
| Dashboard hides “That's enough time” when usage is 0 | **You** | [ ] |

### 2d. Goals integrations

| Task | Owner | Platform | Status |
|------|-------|----------|--------|
| Notion OAuth | **You** | iOS + Android | [ ] |
| Reminders Shortcut | **You** | **iOS only** — [`docs/ios-shortcuts.md`](docs/ios-shortcuts.md) | [ ] |
| Notes Shortcut | **You** | **iOS only** | [ ] |
| Set `EXPO_PUBLIC_SHORTCUT_*_URL` after publishing Shortcuts | **You** | iOS | [ ] |
| Google Tasks Connect (opens app / Play Store) | **You** | Android | [ ] |
| Reminders/Notes hidden on Android (iOS only) | **You** | Android | [ ] — expected |

### 2e. Deferred — use later checklist

Not visible on day one; full list in [`docs/DEFERRED-TESTING.md`](docs/DEFERRED-TESTING.md):

| Task | Owner | Status |
|------|-------|--------|
| Overlay “waste my life” link (appears after **4 s**) | **You** | [ ] |
| Settings pricing after **7-day trial** ends | **You** | [ ] — **Settings → Expire trial (test)** in dev |
| Real limit → overlay (native blocking) | **You** + **Dev** | [ ] — §4 below |
| RevenueCat restore + sandbox purchase | **You** | [ ] — §3 below |
| Commit rate / reclaimed hours after overlay choices | **You** | [ ] |

---

## 3. Before App Store / Play submit

**→ Full pre-submit checklist:** [`docs/APP-STORE.md`](docs/APP-STORE.md) (legal, store products, native gaps, QA, submit).

**Store fees:** Apple Developer **$99/yr**, Google Play **$25 one-time** — pay when you submit, not per user.

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

## 5. iOS Shortcuts & Android goal import (optional for v1)

| Task | Owner | Status |
|------|-------|--------|
| Build + publish Reminders + Notes Shortcuts | **You** | [ ] — [`docs/ios-shortcuts.md`](docs/ios-shortcuts.md) |
| Set `EXPO_PUBLIC_SHORTCUT_*_URL` in `.env` | **You** | [ ] |
| Shortcut URL env wiring in app | **Dev** | [x] |
| Android: surface **Google Keep / Tasks** when installed (detect via package) | **Dev** | [ ] — see [`docs/DEFERRED-TESTING.md`](docs/DEFERRED-TESTING.md) §4 |
| Hide or replace Reminders/Notes rows on Android | **Dev** | [ ] |

**Platform note:** Reminders + Notes use **Apple Shortcuts** (iOS only). Android has no equivalent; **Notion** works on both. Keep/Tasks detection is planned using the same `hopoff-device` package checks as social apps.

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

**Next:** new EAS dev build (native module) → [`PRODUCTION.md`](PRODUCTION.md) §2 immediate tests → overlay preview → [`docs/DEFERRED-TESTING.md`](docs/DEFERRED-TESTING.md) for time-gated items.

**Before submit:** stores + RevenueCat + host legal docs + screenshots.

**After launch:** native blocking, Notion sync, Android Keep/Tasks, push, account sync.
