# Backlog

## Done

- **Section alignment (option A)** — all tab titles centered; list content stays left-aligned in cards.
- **Installed apps** — `hopoff-device` native module + iOS scheme checks; Apps tab shows only detected apps.
- **Screen time import** — Android Usage Access → fills “Your week” via `importFromDevice`. iOS has no public per-app history API (Apple restriction).

## Notion integration

### If you already registered `hoptfoff://notion-callback` (dev build)

The redirect URI is probably **not** the problem. Check these in order:

| Cause | What to verify |
|--------|----------------|
| **Still running Expo Go** | Expo Go sends `exp://…/--/notion-callback`, not `hoptfoff://`. Dev build only for stable OAuth. |
| **Vercel secrets** | `NOTION_CLIENT_ID` + `NOTION_CLIENT_SECRET` set and redeployed after adding them. |
| **Token exchange** | OAuth succeeds in browser but app shows “token exchange failed” → server secret mismatch. |
| **Local env** | `EXPO_PUBLIC_NOTION_CLIENT_ID` + `EXPO_PUBLIC_API_BASE_URL` in `.env`, Metro restarted. |

The in-app alert now shows **which environment** (Expo Go vs dev build) and the **exact URI** sent to Notion.

### Expo Go (unstable URI)

Register the `exp://…/--/notion-callback` URL from the alert whenever IP/port changes. Prefer dev build + `hoptfoff://notion-callback` once.

---

## Capitalization (reference)

Industry norm for consumer mobile apps is **sentence case** for almost all UI copy.

| App | Examples |
|-----|----------|
| **Duolingo** | “Continue”, “Pick a plan”, section headers like “Your progress” |
| **Headspace** | “Start your day”, “Browse meditations” — not “Start Your Day” |
| **Apple Health** | “Summary”, “Sharing”, “Edit sleep schedule” |
| **Instagram** | “Edit profile”, “Account privacy” — buttons rarely Title Case |
| **Spotify** | “Your Library”, “Made for you” — mixed but CTAs stay sentence case |

**HopOff convention:** sentence case for titles, headers, and buttons; proper nouns as spelled (Notion, YouTube, David Goggins); no trailing periods on single-line screen titles unless they are full sentences.

---

## Native module rebuild

`hopoff-device` requires a **new EAS dev build** after pulling these changes:

```bash
eas build --profile development --platform android
# and/or ios
```

**Android screen time chart:** after granting Accessibility, the app also opens **Usage access** (Settings → Apps → Special app access → Usage access → HopOff). Return to the app to import the last 7 days.

**iOS:** installed-app detection works via URL schemes; week chart import waits on Apple Family Controls entitlement (not available in stub).

**Deferred / time-based tests:** [`DEFERRED-TESTING.md`](DEFERRED-TESTING.md)
