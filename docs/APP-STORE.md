# HopOff — App Store & Play Store Checklist

Everything to complete **before** submitting to Apple App Store and Google Play.  
For dev builds, API setup, and day-one testing, see [`PRODUCTION.md`](../PRODUCTION.md) and [`DEV-BUILD.md`](DEV-BUILD.md).

**Owner key:** **You** = accounts, legal, store consoles · **Dev** = code / native modules in this repo

---

## Code gaps — not production-ready yet

These block a “fully working” store build. Ship only after resolving or clearly disclosing in review notes.

| Gap | Impact | Owner | Status |
|-----|--------|-------|--------|
| **Real app blocking** — Android AccessibilityService ships in `hopoff-device`; iOS still needs Family Controls entitlement | Limit hit → overlay auto-fires on Android after rebuild; iOS manual/preview only | **Dev** + **You** (iOS entitlement) | [x] Android · [ ] iOS |
| **Android AccessibilityService** — registered in `hopoff-device` manifest | HopOff appears in Accessibility list after **native rebuild** | **Dev** | [x] code · **You** rebuild |
| **`react-native-purchases` installed** — wired in `payments.ts`, `initPurchases` on boot | Store purchases / restore work when RC key + products configured | **Dev** | [x] |
| **API routes not fully deployed** — `api/oembed.ts`, `api/youtube/search.ts`, `api/notion/goals.ts` in repo | Instagram thumbnails; YouTube ≤60s search; Notion goal import | **You** | [ ] commit + push → Vercel redeploy |
| **Notion goals sync** — `syncGoalsFromNotion()` + `/api/notion/goals` | Imports titles from first shared database | **Dev** | [x] |
| **Google Tasks** — opens app / Play Store only; no task import | Connect is cosmetic on Android | **Dev** | [ ] optional v1 |
| **Push notifications** — `notifications.ts` is stub | No weekly recap / nudges | **Dev** | [ ] post-v1 OK |
| **iOS week chart** — needs Family Controls entitlement; usage import incomplete on iOS | Dashboard week data may be empty on iPhone | **Dev** + **You** | [ ] |
| **RevenueCat sandbox** — SDK installed; needs store products + EAS secret | Sandbox purchases untested until **You** configure stores | **Dev** + **You** | [x] SDK · [ ] sandbox test |
| **Dev-only UI** — preview block, log out, expire trial, permissions skip gated behind `__DEV__` | Hidden in production builds | **Dev** | [x] |
| **Bundle slug** — repo/folder `hoptfoff`, scheme `hoptfoff://` | Fine for submit if intentional; rename is painful later | **You** | [ ] decide |

---

## 1. Accounts & legal (You)

| Task | Status |
|------|--------|
| Apple Developer Program ($99/yr) | [ ] |
| Google Play Developer ($25 one-time) | [ ] |
| Host [`legal/privacy-policy.md`](../legal/privacy-policy.md) at a **public HTTPS URL** | [ ] |
| Host [`legal/terms-of-service.md`](../legal/terms-of-service.md) at a **public HTTPS URL** | [ ] |
| Privacy policy URL in App Store Connect + Play Console | [ ] |
| Support email / contact URL in store listings | [ ] |
| GDPR / CCPA review if EU or CA users expected | [ ] |

---

## 2. Store products & subscriptions (You)

| Task | Status |
|------|--------|
| App Store Connect app record (`com.kgrogerrr.hopoff`) | [ ] |
| Subscriptions: **$9.99/mo**, **$59.99/yr**, **7-day free trial** | [ ] |
| Google Play app + matching subscription products | [ ] |
| Product IDs match `.env`: `EXPO_PUBLIC_RC_PRODUCT_MONTHLY`, `EXPO_PUBLIC_RC_PRODUCT_ANNUAL` | [ ] |
| RevenueCat project linked to both stores | [ ] |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` in **EAS secrets** (not only local `.env`) | [ ] |
| Install `react-native-purchases` + wire in EAS production profile | [x] **Dev** |
| Test sandbox purchase + **Restore purchases** on device | [ ] |
| Subscription terms visible on paywall (auto-renew, cancel, trial) | [x] — `SubscriptionTerms` on onboarding + post-trial paywall |

---

## 3. Native build & entitlements (You + Dev)

| Task | Status |
|------|--------|
| `eas build --profile production` iOS + Android | [ ] |
| **Rebuild after** `expo-intent-launcher` (Settings deep links) | [ ] |
| **Rebuild after** `hopoff-device` AccessibilityService (blocking module) | [ ] required |
| iOS: **Family Controls / Screen Time** entitlement requested from Apple | [ ] |
| iOS: `NSFamilyControlsUsageDescription` in `app.json` | [x] |
| Android: AccessibilityService + overlay permission in native module | [x] **Dev** |
| Android: `PACKAGE_USAGE_STATS` declared | [x] |
| Share extension (`expo-share-intent`) tested on production build | [ ] |
| Notion redirect `hoptfoff://notion-callback` in Notion integration | [ ] |

---

## 4. Backend & secrets (You)

| Task | Status |
|------|--------|
| Vercel production: `YOUTUBE_API_KEY`, `OPENROUTER_API_KEY`, `NOTION_CLIENT_SECRET` | [ ] verify |
| Push `api/oembed.ts`, duration-aware `api/youtube/search.ts`, `api/notion/goals.ts` to git → auto-deploy | [ ] |
| `EXPO_PUBLIC_API_BASE_URL=https://hopoff.vercel.app` in **EAS env** for production builds | [x] in `eas.json` · add RC key via EAS secrets |
| Remove client-side API keys from production app env (proxy only) | [ ] recommended |

Smoke test after deploy:
```bash
curl https://hopoff.vercel.app/api
curl "https://hopoff.vercel.app/api/youtube/search?q=motivation&maxDuration=59"
curl "https://hopoff.vercel.app/api/oembed?url=https://www.instagram.com/reel/EXAMPLE/"
```

---

## 5. Store listing assets (You)

| Task | Status |
|------|--------|
| App icon 1024×1024 (no transparency iOS) | [ ] |
| Screenshots — 6.7", 6.5", 5.5" iPhone + iPad if supporting tablet | [ ] |
| Android phone + 7" / 10" if required | [ ] |
| Optional preview video (15–30s) | [ ] |
| Title, subtitle, keywords — [`store-listing-draft.md`](store-listing-draft.md) | [ ] |
| Age rating questionnaire (both stores) | [ ] |
| Apple **Privacy Nutrition Labels** | [ ] |
| Google Play **Data safety** form | [ ] |
| Explain Accessibility + Usage access in review notes (Android) | [ ] |

---

## 6. Pre-submit QA on production build (You)

Run on **production** profile build, not Expo Go.

| Area | Test |
|------|------|
| Onboarding | Full flow through paywall / trial start |
| Permissions | Android: Open Accessibility → **Accessibility list** (not App info); Usage access; mic |
| Permissions | iOS: Screen Time settings open; mic prompt |
| Blocking | Real limit → overlay (Android after rebuild; iOS after Family Controls entitlement) |
| Videos | YouTube search ≤60s, thumbnails, playback |
| Share | Instagram / TikTok / YouTube → library + metadata |
| Goals | AI polish, mic dictation, Notion connect + import |
| Paywall | Trial → hard paywall after 7 days; purchase + restore |
| Dashboard | Week chart, soft spots, insights copy (wasted time framing) |
| Offline | Library works; search shows offline message |

---

## 7. Submit (You)

```bash
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

| Task | Status |
|------|--------|
| iOS App Review submission | [ ] |
| Google Play production track (internal → closed → production) | [ ] |
| Respond to review feedback within 24h | [ ] |

---

## 8. Acceptable for v1.0 (disclose in listing / review)

| Item | Notes |
|------|--------|
| Google Tasks connect | Opens app only |
| iOS Shortcuts | Optional; Reminders/Notes iOS-only |
| Instagram metadata | Depends on `/api/oembed`; may fail on private reels |
| iOS blocking / week chart | Requires Apple Family Controls entitlement |
| Android blocking | Works after production rebuild with Accessibility enabled |

---

## Quick order

1. **Rebuild** native app (`hopoff-device` AccessibilityService + `react-native-purchases`).  
2. **Deploy API** (oembed + YouTube duration + Notion goals).  
3. **Host legal** URLs.  
4. **Store products** + RevenueCat + EAS secrets.  
5. **Production EAS build** → QA table above.  
6. **Screenshots** + listings.  
7. **Submit**.
