# Play Console — Internal Testing Setup

No public listing needed. Internal testing lets you install the app via Play and unlock Accessibility.

---

## 1. Create the app (once)

1. Go to [play.google.com/console](https://play.google.com/console) → **Create app**
2. App name: **HopOff** · Default language: English · Type: App · Free
3. Accept policies → **Create app**

---

## 2. Build a signed AAB

```powershell
cd "C:\Users\K.Grover29\OneDrive - Bellarmine College Preparatory\Documents\hoptfoff"
eas build --profile production --platform android
```

> Production builds are signed and accepted by Play. Dev APKs are not.

---

## 3. Upload to Internal testing

1. Play Console → your app → **Testing → Internal testing**
2. Click **Create new release**
3. Upload the `.aab` from the EAS build
4. Add release notes (anything, e.g. "Initial test") → **Save → Review release → Start rollout**

---

## 4. Add yourself as tester

1. Still in **Internal testing** → **Testers** tab
2. **Create email list** → add your Gmail address → **Save**
3. Copy the **opt-in link** and open it on your Android phone
4. Tap **Become a tester** → then the Play Store install link

---

## 5. Install and test

1. Install HopOff from the Play Store link
2. Open the app → Permissions step → tap **Open Accessibility**
3. Accessibility → HopOff → **On** — it should work without any "restricted settings" prompt

---

## Notes

- Internal testing is **invite-only** (max 100 testers); nothing is public.
- Production build uses `EXPO_PUBLIC_API_BASE_URL=https://hopoff.vercel.app` from `eas.json` — no extra env setup needed.
- Update: build a new AAB and upload a new release; testers get it via Play Store auto-update.
