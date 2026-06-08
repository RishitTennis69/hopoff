# Friend testing — free options

Ways to get HopOff on other phones **without TestFlight or paid Apple enrollment** (where possible).

## Best free path: Android APK (recommended)

EAS free tier includes Android builds. One build, share a link.

```bash
cd hoptfoff
eas build --profile preview --platform android
```

When it finishes, open the build on [expo.dev](https://expo.dev) → **Download** the `.apk` → share the file or link (Google Drive, Discord, etc.).

Friends:

1. Download the APK on their Android phone  
2. Allow **Install unknown apps** for Chrome/Files if prompted  
3. Install and open **HopOff**

This is a **standalone app** — they do **not** need your laptop running.

**Caveat:** Share sheet + native modules need this preview/dev build, not Expo Go.

---

## iPhone friends (the hard part)

Apple requires a **$99/yr Developer account** for installs on real iPhones (TestFlight or dev client). There is no reliable fully-free workaround for native share + blocking on physical iOS devices.

**Free-ish options:**

| Option | Cost | What works |
|--------|------|------------|
| **Web build on Vercel** | $0 | UI, onboarding, YouTube — **not** share sheet or Screen Time |
| **Expo Go** | $0 | Same limits as web + no custom native code |
| **Your phone + screen share** | $0 | You demo; they don’t install |
| **Borrow Mac + Simulator** | $0 | Mac only; not a real phone |

Deploy web for quick UI feedback:

```bash
npx expo export -p web
# Upload dist/ to Vercel (or npx vercel)
```

---

## Hybrid: one Android APK + your Metro tunnel

If you want **live JS updates** without rebuilding:

1. You already have a **dev client** on your phone  
2. Friends on **Android** install the same dev APK once (share from EAS `development` or `preview` build)  
3. You run:

```bash
npx expo start --dev-client --tunnel
```

4. They scan the QR code — app loads your latest code over the internet  

**You** must keep the tunnel running. Good for a review session, not permanent distribution.

---

## What to tell reviewers

- **Android:** Install APK → full native test  
- **iPhone (no $99):** Use web link OR you screen-share a device session  
- **iPhone (with $99):** `eas build --profile preview --platform ios` → TestFlight internal testers (up to 100, free after enrollment)

---

## Related

- [`DEV-BUILD.md`](DEV-BUILD.md) — dev client on your phone  
- [`DEFERRED-TESTING.md`](DEFERRED-TESTING.md) — what to verify after install
