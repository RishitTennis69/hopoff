# TestFlight — Internal Testing (iOS)

No public App Store listing needed. **TestFlight** lets you install HopOff on your iPhone through Apple’s beta channel — the iOS equivalent of Play Internal testing.

**Bundle ID:** `com.kgrogerrr.hopoff`  
**Scheme:** `hoptfoff://`

---

## Will iOS think the install is “fraudulent”?

**No — not like Android.**

| Platform | What HopOff uses | Sideload / dev install issue | TestFlight / store install |
|----------|------------------|------------------------------|----------------------------|
| **Android** | Accessibility + Usage access | “Restricted settings” can block Accessibility on APK sideloads | Play install is trusted |
| **iOS** | **Screen Time** (Family Controls), not Accessibility | No Android-style restricted-settings gate | TestFlight is trusted |

TestFlight builds are signed and distributed by Apple. You will **not** hit Android’s “allow restricted settings” / fraudulent-sideload problem on iPhone.

**Separate caveat:** Real Screen Time blocking on iOS still needs Apple’s **Family Controls entitlement** approved for your app. TestFlight fixes *install trust*; it does not by itself unlock Family Controls APIs. Until that entitlement ships, onboarding may open Settings but full native blocking / week-chart import on iOS can stay limited (see [`APP-STORE.md`](APP-STORE.md)).

---

## 1. Enroll in the Apple Developer Program (once)

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs/)
2. Sign in with your Apple ID → **Enroll** → choose **Individual** (solo / hobby app)
3. Pay **$99/year** and complete identity verification

This is the iOS counterpart to Play Console’s $25 fee. There is no cheaper official path to TestFlight on a real iPhone.

---

## 2. Create the app in App Store Connect (once)

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** → **New App**
2. Platform: **iOS** · Name: **HopOff** · Primary language: English
3. Bundle ID: **com.kgrogerrr.hopoff** (create it under [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) if it is not listed)
4. SKU: anything unique (e.g. `hopoff-ios`) · User access: Full access → **Create**

You are creating a record — you are **not** submitting for public App Review yet.

---

## 3. Build a signed iOS app (EAS)

From the project folder (Windows is fine — EAS builds iOS in the cloud):

```powershell
cd "C:\Users\K.Grover29\OneDrive - Bellarmine College Preparatory\Documents\hoptfoff"
eas login
eas build --profile production --platform ios
```

- Uses `EXPO_PUBLIC_API_BASE_URL=https://hopoff.vercel.app` from `eas.json`
- First run: EAS will prompt for Apple credentials / distribution cert — choose **Let EAS handle credentials** unless you already manage certs yourself

Wait for the build to finish on [expo.dev](https://expo.dev).

---

## 4. Upload to TestFlight

**Option A — submit right after build:**

```powershell
eas submit --platform ios --latest
```

**Option B — from App Store Connect:**

1. Download the `.ipa` from the Expo build page
2. Upload with [Transporter](https://apps.apple.com/app/transporter/id1450874784) (Mac) or Apple’s upload tools

Processing usually takes **10–30 minutes** before the build appears under **TestFlight**.

---

## 5. Add yourself as an internal tester

1. App Store Connect → **HopOff** → **TestFlight** tab
2. Wait until the build status is **Ready to Submit** / available for testing (not “Processing”)
3. **Internal Testing** → default group (or create one) → **+** add your Apple ID email
4. On your iPhone: install **[TestFlight](https://apps.apple.com/app/testflight/id899247664)** from the App Store
5. Open the email invite (or the TestFlight link from App Store Connect) → **Accept** → **Install**

Internal testers: up to **100**, invite-only, **no** public listing, **no** Beta App Review for internal builds.

---

## 6. Install and test

1. Open **HopOff** from TestFlight (not Expo Go)
2. Onboarding → **Permissions** → **Open Screen Time** (iOS label; not Accessibility)
3. Grant **Microphone & speech** when prompted
4. Exercise: share sheet (Instagram / TikTok / YouTube), Goals mic, video library, Notion `hoptfoff://notion-callback`

For a full checklist see [`DEVICE-TEST.md`](DEVICE-TEST.md) (Android-centric notes — on iOS, ignore Accessibility / Usage access rows).

---

## 7. Final settings check (before you call iOS done)

**Yes — TestFlight can still leave settings broken.** TestFlight only proves the install is trusted. It does **not** guarantee every permission flow works end-to-end. You can ship a TestFlight build, run through onboarding, and still have Screen Time (or other settings) fail until native code and Apple entitlements are finished.

Run this checklist on the **TestFlight** build after install. If something fails, note it — that is a real bug or missing entitlement, not “TestFlight being weird.”

| Setting | Where to test | Pass? | If it fails |
|---------|---------------|-------|-------------|
| **Screen Time authorization** | Onboarding → Permissions → **Open Screen Time** → return → **Continue** should unlock | [ ] | Family Controls entitlement may not be approved yet; iOS native module is still stubbed — see [`APP-STORE.md`](APP-STORE.md) |
| **Screen Time in Settings** | Settings → Screen Time → look for HopOff / app limits HopOff requested | [ ] | Expected to be incomplete until Family Controls ships |
| **Microphone & speech** | Permissions step → allow → Goals mic records and transcribes | [ ] | Check iOS Settings → HopOff → Microphone + Speech Recognition |
| **Installed apps list** | Apps tab lists apps you actually have (via URL schemes) | [ ] | Rebuild if empty; different from Android package scan |
| **Week chart / usage import** | Home dashboard after a day of use | [ ] | iOS usage import not wired yet — chart may stay empty even when Screen Time UI “works” |
| **Real limit → block overlay** | Exceed a group limit on a limited app | [ ] | Blocking is Android-first today; use Home → **Preview block screen** for overlay UI on iOS |
| **Share extension** | Share a reel/link from Instagram / TikTok / YouTube → HopOff | [ ] | Pin HopOff in share sheet **Edit Actions → Favorites** if it is buried |
| **Notion goals** | Goals → Connect Notion → OAuth completes | [ ] | `hoptfoff://notion-callback` in Notion + Vercel deploy |

**Bottom line:** Passing TestFlight install ≠ all settings fixed. Treat any unchecked row above as work still owed before App Store submit — especially **Screen Time input / authorization** and **usage on the dashboard**, which depend on Apple’s Family Controls entitlement and unfinished iOS native code.

---

## Updates

```powershell
eas build --profile production --platform ios
eas submit --platform ios --latest
```

TestFlight picks up the new build after processing; testers get an update prompt in the TestFlight app.

---

## Internal vs external testers

| Type | Who | Review | Use when |
|------|-----|--------|----------|
| **Internal** | Your App Store Connect team (you) | None | Solo testing — **start here** |
| **External** | Anyone with a link/email | Beta App Review required | Friends / wider beta later |

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Build missing in TestFlight | Wait for processing; check email for compliance/export questions |
| “Could not install” | Device iOS version must meet app minimum; remove old dev build if bundle ID conflicts |
| Screen Time step never completes | Family Controls entitlement may still be pending — use Preview block on dev build for UI; see [`APP-STORE.md`](APP-STORE.md) |
| Notion OAuth fails | Register `hoptfoff://notion-callback` in Notion; production API on Vercel |
| Share extension missing | Confirm you installed the **TestFlight / production** build, not Expo Go |

---

## iOS Shortcuts (Goals — Reminders & Notes)

Optional. On **Goals**, tapping **Reminders** or **Notes** opens your published Shortcut in Safari (or the Shortcuts app). Android has no equivalent — use Notion on both platforms.

### Build the Shortcuts (Shortcuts app on iPhone)

**Reminders → HopOff**

1. Open **Shortcuts** → **+** → name it e.g. `HopOff — Reminders`
2. Add actions: get this week’s reminders (or ask which list) → format as plain text (one goal per line)
3. Hand off to HopOff: copy to clipboard and show “Paste in HopOff Goals,” or open URL `hoptfoff://` (deep-link import is optional polish)
4. **Share** the Shortcut → **Copy iCloud Link**

**Notes → HopOff**

1. New Shortcut → e.g. `HopOff — Notes`
2. Ask for a note or get note body → format as plain text
3. Same handoff as Reminders
4. **Copy iCloud Link**

Suggested deep link for later: `hoptfoff://import?text=...` — today, share sheet + manual paste in Goals are the main paths.

### Wire links into the TestFlight build

Env vars are **baked in at build time** — local `.env` alone does not affect EAS production builds.

**Option A — EAS secrets (recommended):**

```powershell
eas secret:create --scope project --name EXPO_PUBLIC_SHORTCUT_REMINDERS_URL --value "https://www.icloud.com/shortcuts/YOUR_REMINDERS_LINK"
eas secret:create --scope project --name EXPO_PUBLIC_SHORTCUT_NOTES_URL --value "https://www.icloud.com/shortcuts/YOUR_NOTES_LINK"
```

**Option B — add to `eas.json` under `build.production.env`** (same keys as `.env.example`).

Then rebuild and resubmit:

```powershell
eas build --profile production --platform ios
eas submit --platform ios --latest
```

Until those URLs are set, **Add Shortcut** opens the generic [iCloud Shortcuts gallery](https://www.icloud.com/shortcuts/) instead of your Shortcut.

### Verify on TestFlight

1. Goals → **Reminders** or **Notes** → should open **your** iCloud Shortcut page
2. Run the Shortcut → confirm text lands in Goals (paste or future deep link)
3. If it opens the generic gallery, the env vars were missing at build time — set secrets and rebuild

More detail: [`ios-shortcuts.md`](ios-shortcuts.md)

---

## Related

- [`DEV-BUILD.md`](DEV-BUILD.md) — Metro + dev client (live reload, no TestFlight)
- [`PLAY-CONSOLE-INTERNAL.md`](PLAY-CONSOLE-INTERNAL.md) — Android internal testing
- [`APP-STORE.md`](APP-STORE.md) — full store submit checklist
- [`ios-shortcuts.md`](ios-shortcuts.md) — Shortcut behavior notes
