# HopOff — device test checklist

Use the **dev build APK** on your phone (not Expo Go). Start Metro from the project folder:

```powershell
cd "C:\Users\K.Grover29\OneDrive - Bellarmine College Preparatory\Documents\hoptfoff"
npx expo start --dev-client
```

Open HopOff on your phone and connect to Metro (same Wi‑Fi, scan QR). Reload after code changes (`r` in terminal or shake → Reload).

**Rebuild APK** when native/manifest code changed (installed apps, Google Tasks intent, accessibility service):

```bash
eas build --profile development --platform android
```

---

## Without rebuild (Metro reload only)

These should work after reload alone:

- [x] **Save toast** — black glass pill, short “Saved {name} video”
- [x] **Group limit wheel** — same dial as before; each spoke = 30 min (not 1 hr)
- [x] **Instagram player** — cropped embed, short caption, no “Open in Instagram” when embed works
- [x] **Permissions flow** — one step at a time; subtitle shows path only; **Skip** on optional steps
- [x] **Block preview** — faster encrypted text; “Discipline beats motivation” clip removed
- [x] **Trial paywall** — no restore link (restore stays in Settings)
- [x] **Onboarding paywall** — 7-day free, no fine print

## Needs rebuild OR retest after rebuild

Mark these **blocked until new APK** if you have not rebuilt since the native changes landed:

- [ ] **Installed apps** — only YouTube showing → expected without rebuild (package queries are native)
- [ ] **Google Tasks** — opens Play Store → JS fix shipped; rebuild if still broken after reload
- [ ] **Accessibility / Usage access** — “access denied” / restricted settings → **sideloaded dev APK only**; Play Store install should not have this

## Permissions (Android)

| Step | What it does |
|------|----------------|
| 1. Usage access | Imports screen time for the week chart |
| 2. Accessibility | Required for real app blocking |
| 3. Microphone | Optional, for voice goals |

**Dev APK:** Android may block Accessibility and Usage for apps not installed from Play Store. Use **Skip** on step 2 to keep testing. **Production Play Store builds should not see this.**

Flow: complete step 1 before step 2 unlocks. Footer button opens the current step only.

## Notion

1. Set `EXPO_PUBLIC_API_BASE_URL` in `.env` (your Vercel URL).
2. In Notion → integration → Redirect URIs, add: `https://YOUR-VERCEL-URL/api/notion-callback` (HTTPS, not `hoptfoff://`).
3. Redeploy Vercel so `api/notion-callback` is live (bridges HTTPS → app deep link).

## Offline test

**Cellular counts as online.** Offline means no internet at all (airplane mode, or Wi‑Fi + cellular both off).

Turn off Wi‑Fi and cellular, or use airplane mode after HopOff is already open. Your **saved library** should still show. **YouTube search** should fail gracefully with an offline message.

## Notion (after git push to Vercel)

- **Vercel API** (`/api/notion-callback`): deploys when you push to GitHub. No APK rebuild.
- **App OAuth flow**: Metro reload is enough once Vercel is live and Notion has `https://YOUR-VERCEL-URL/api/notion-callback`.

## Still to verify after rebuild

- [ ] **Share** — Instagram/TikTok/YouTube → library
- [ ] **Blocking** — low limit → open app → block overlay
- [ ] **Dashboard** — week chart after Usage access granted
- [ ] **Goals** — Notion connect with HTTPS redirect above

## Reminder

Send your preferred **block-preview YouTube clip** link to replace `starter-2` in the starter library (`src/data/mock.ts`).
