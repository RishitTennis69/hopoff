# HopOff — development build (EAS)

Expo Go **cannot** run share sheet, reliable mic, or native blocking. Use a **development build** — your own HopOff app binary that loads JS from Metro like Expo Go.

## Prerequisites

- [Expo account](https://expo.dev/signup) (free)
- **Apple:** Apple Developer account ($99/yr) for iOS device builds
- **Android:** Google account (no fee for internal APK)

## 0. Go to the project folder

**Windows (PowerShell):**
```bash
cd "C:\Users\K.Grover29\OneDrive - Bellarmine College Preparatory\Documents\hoptfoff"
```

**macOS / Linux** (if you cloned elsewhere, use your clone path):
```bash
cd ~/Documents/hoptfoff
```

All commands below run from this folder (the repo root — where `package.json` and `app.json` live).

## 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

## 2. Configure the project (once)

From the repo root:

```bash
eas build:configure
```

Link to your Expo project when prompted. `eas.json` is already in the repo.

## 3. Build for your phone

**iOS** (physical device — needs Apple Developer):

```bash
eas build --profile development --platform ios
```

When the build finishes, open the link on your iPhone → install the dev client.

**iOS Simulator** (Mac only, no Apple Developer needed for simulator):

```bash
eas build --profile development --platform ios
```

Use the simulator build artifact from the Expo dashboard.

**Android:**

```bash
eas build --profile development --platform android
```

Download and install the `.apk` on your device (enable “Install unknown apps” if asked).

## 4. Run Metro and open the dev client

```bash
npx expo start --dev-client
```

Scan the QR code **with the HopOff dev build** (not Expo Go).

## 5. What to test on device

- [ ] Share sheet — TikTok / Instagram → HopOff
- [ ] Mic + speech-to-text on Goals
- [ ] YouTube search (needs `EXPO_PUBLIC_API_BASE_URL`)
- [ ] Notion Connect — use redirect `hoptfoff://notion-callback` in Notion settings
- [ ] Screen Time permission prompt (iOS)

## 6. Test the block overlay (without waiting for limits)

You do **not** need to scroll until a limit is hit.

**Fastest:** Home tab → **Preview block screen** at the bottom. Opens the full intervention UI immediately.

**Simulate a real trigger (dev build):**

1. Create a group with a **1 hour** limit and at least one app.
2. On the Home tab (dev builds only), tap **Simulate limit hit** — opens the overlay as if you exceeded the limit.

**Manual simulation (background trick):** The app adds usage when you leave HopOff and return (dev monitor). Set a **1 hour** group limit, background the app for a few minutes, then return — if tracked usage crosses the limit, the overlay opens. This is slower; use Preview or Simulate instead.

## Notion redirect (dev build vs Expo Go)

| Environment | Redirect URI to register in Notion |
|-------------|-----------------------------------|
| **Development build** | `hoptfoff://notion-callback` only — register once, never changes |
| **Expo Go** | `exp://YOUR_IP:8081/--/notion-callback` (changes when IP/port changes) |

**Using a dev build?** Ignore Expo Go `exp://` URIs. Only add `hoptfoff://notion-callback` in Notion. If Connect fails, the in-app alert shows the exact URI the app is using — it should match that string.

Prefer a dev build for stable Notion OAuth.

## 7. Rebuild after native module changes

Installed-app detection and Android screen-time import use the local **`hopoff-device`** module. After pulling changes that touch `modules/hopoff-device` or `app.json` permissions, run a **new** `eas build` and reinstall the dev client. Metro reload alone is not enough.

On Android, for the week chart: **Settings → Apps → Special app access → Usage access → HopOff → Allow**.

## Troubleshooting

- **`eas build:configure` / `expo config` fails with duplicate ShareExtension:** `eas build:configure` may add a ShareExtension block that conflicts with `expo-share-intent`. Remove `extra.eas.build.experimental.ios.appExtensions` from `app.json` — the share-intent plugin adds it automatically. Ensure `ios.bundleIdentifier` is set (e.g. `com.kgrogerrr.hopoff`).
- **Build fails on iOS:** Run `eas credentials` or let EAS manage certs automatically.
- **App won’t connect to Metro:** Phone and PC must be on the same Wi‑Fi; try `npx expo start --dev-client --tunnel`.
- **Share sheet missing:** Confirm you installed the **dev build**, not Expo Go.
