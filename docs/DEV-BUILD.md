# HopOff — development build (EAS)

Expo Go **cannot** run share sheet, reliable mic, or native blocking. Use a **development build** — your own HopOff app binary that loads JS from Metro like Expo Go.

## Prerequisites

- [Expo account](https://expo.dev/signup) (free)
- **Apple:** Apple Developer account ($99/yr) for iOS device builds
- **Android:** Google account (no fee for internal APK)

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

## Notion redirect (dev build vs Expo Go)

| Environment | Redirect URI to register in Notion |
|-------------|-----------------------------------|
| **Development build** | `hoptfoff://notion-callback` |
| **Expo Go** | `exp://YOUR_IP:8081/--/notion-callback` (changes when IP/port changes) |

Prefer a dev build for stable OAuth.

## Troubleshooting

- **Build fails on iOS:** Run `eas credentials` or let EAS manage certs automatically.
- **App won’t connect to Metro:** Phone and PC must be on the same Wi‑Fi; try `npx expo start --dev-client --tunnel`.
- **Share sheet missing:** Confirm you installed the **dev build**, not Expo Go.
