# HopOff — device test checklist

Use the **dev build APK** on your phone (not Expo Go). Start Metro from the project folder:

```powershell
cd "C:\Users\K.Grover29\OneDrive - Bellarmine College Preparatory\Documents\hoptfoff"
npx expo start --dev-client
```

Open HopOff on your phone and connect to Metro (same Wi‑Fi, scan QR). Reload after code changes (`r` in terminal or shake → Reload).

---

- [ ] **Apps** — Installed apps list + create group (30‑min spokes in group popup). **Rebuild APK** if only YouTube shows — package queries need a fresh native build.
- [ ] **Permissions** — Usage access opens Settings; Accessibility optional with “Skip blocking for now” on dev APK; mic testable without Accessibility
- [ ] **Blocking** — Needs Accessibility enabled (Play Store build). Dev APK may block sideloaded apps — use skip for demo
- [x] **Share** — Share reel/link from Instagram/TikTok/YouTube → library
- [x] **Videos** — Search plays ≤60s clips with thumbnails
- [x] **Goals** — Continue only after polish; empty list shows "Polish my list" (disabled until text). Notion: `https://hopoff.vercel.app/api/notion-callback`
- [x] **Dashboard** — "That's enough time to…" bullets read as verb phrases (e.g. "launch HopOff"), not "You could have…"
- [x] **Instagram cards** — Title on top, gray author line below (like YouTube). Long bios → short AI labels via OpenRouter
- [x] **Google Tasks** — Opens app if installed; otherwise Play Store (rebuild APK for package queries)
- [x] **Onboarding paywall** — 7-day free starts; no subscription fine print
- [x] **Trial paywall** — Settings → Expire trial → pricing popup (restore is in Settings only)
- [ ] **Dashboard** — Week chart imports after **Usage access** (not Accessibility). Grant Usage access, then Continue on permissions
- [x] **Offline** — Library works; search shows offline message

### Known limitations (dev APK)


| Issue                         | Notes                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Only YouTube in apps list     | Rebuild: `eas build --profile development --platform android`                         |
| Accessibility “access denied” | Android restricts sideloaded apps; skip blocking for demo, or use Play Store build    |
| Screen time not imported      | Grant **Usage access** (Settings → Usage access → HopOff → Allow), not Accessibility  |
| Notion redirect error         | Add `https://hopoff.vercel.app/api/notion-callback` in Notion + confirm Vercel deploy |
| Google Tasks → Play Store     | Fixed in JS; reload Metro. Rebuild if still broken                                    |


