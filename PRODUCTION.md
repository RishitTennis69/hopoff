# HopOff — Production Checklist

Ordered by **when** to do things: top = do now, bottom = after launch.

**Owner key:** **You** = accounts, keys, store, legal hosting · **Dev** = code in this repo

---

## 1. Right now — unblock real features

These gate AI, YouTube search, and Notion. The app works in dev mode without them, but production features need this first.

| Task | Owner | Status |
|------|-------|--------|
| OpenRouter API key | **You** | [ ] |
| Google Cloud + YouTube Data API key | **You** | [ ] |
| Notion integration (client ID + secret) | **You** | [ ] |
| Deploy `/api` to Vercel | **You** | [ ] — step-by-step: [`docs/DEPLOY-API.md`](docs/DEPLOY-API.md) |
| Set server env vars from `api/.env.example` | **You** | [ ] |
| Set `EXPO_PUBLIC_API_BASE_URL` in app `.env` | **You** | [ ] |
| Set `EXPO_PUBLIC_NOTION_CLIENT_ID` in app `.env` | **You** | [ ] |
| Add Notion OAuth redirect URL (`hoptfoff://notion-callback`) | **You** | [ ] |
| API proxy routes (`/api/openrouter`, `/youtube/search`, `/notion/token`) | **Dev** | [x] |
| Client proxy wiring (`apiClient.ts`, `ai.ts`, `youtube.ts`, `connect.ts`) | **Dev** | [x] |
| `vercel.json` + deploy guide | **Dev** | [x] |

**Your next 30 minutes:** create the three API keys → import repo to Vercel → paste env vars → deploy → copy URL into `.env` → restart Expo.

---

## 2. Before device testing (TestFlight / internal APK)

You need a **development build** (not Expo Go) for share sheet, mic, and future native blocking.

| Task | Owner | Status |
|------|-------|--------|
| `eas build:configure` + link Expo account | **You** | [ ] |
| `eas build --profile development` (iOS + Android) | **You** | [ ] |
| `eas.json` scaffold | **Dev** | [x] |
| App display name → **HopOff** in `app.json` | **Dev** | [x] |
| Test share sheet (TikTok / IG → HopOff) | **You** | [ ] |
| Test mic + speech-to-text on goals | **You** | [ ] |
| Test YouTube search (after API deploy) | **You** | [ ] |
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
| Subscription disclosure in store listing + paywall | **You** | [ ] — copy in [`docs/store-listing-draft.md`](docs/store-listing-draft.md) |
| App icon + screenshots (5–6 per size) + optional preview video | **You** | [ ] |
| Store description / subtitle / keywords | **You** | [ ] — draft: [`docs/store-listing-draft.md`](docs/store-listing-draft.md) |
| Age rating questionnaire | **You** | [ ] |
| Apple Privacy Nutrition Labels | **You** | [ ] |
| Google Play Data Safety form | **You** | [ ] |
| GDPR / CCPA review if applicable | **You** | [ ] |
| Decide final slug (`hoptfoff` vs rename bundle ID) | **You** | [ ] |
| `eas build --profile production` | **You** | [ ] |
| `eas submit` iOS + Android | **You** | [ ] |

---

## 4. Native app blocking (before “real” blocking ships)

Blocking UI and service layer exist; OS-level enforcement needs custom native code + dev build.

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
| Build + publish Reminders + Notes Shortcuts | **You** | [ ] — guide: [`docs/ios-shortcuts.md`](docs/ios-shortcuts.md) |
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

Already stubbed: notifications (`src/services/notifications.ts`), account sync (`src/services/accountSync.ts`), Notion sync hook in `connect.ts`.

---

## Already done (dev)

- UI / onboarding flow
- Real usage store + dashboard stats (`usageStore`, `statsStore`)
- Soft-spot insights from usage data
- Permissions service + Screen Time / mic flows
- Offline handling, YouTube error states, onboarding analytics
- Share intent configured (`expo-share-intent`)
- Splash + Android icon polish

---

## Bottom line

**Do today:** API keys → Vercel deploy → `.env` → smoke test ([`docs/DEPLOY-API.md`](docs/DEPLOY-API.md)).

**Do this week:** EAS dev build → test on a real phone.

**Before submit:** stores + RevenueCat + host legal docs + screenshots.

**After launch:** native blocking modules, Notion sync, push, account sync.
