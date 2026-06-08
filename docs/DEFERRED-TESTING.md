# Deferred testing (short list)

Only things you **cannot** finish in one pass. Everything else is in [`PRODUCTION.md`](../PRODUCTION.md) §2.

**You do not need a new EAS dev build** for overlay preview, post-trial popup, or most UI — reload Metro (`npx expo start -c`). Rebuild only when you need native modules (`hopoff-device`, share extension, real blocking).

---

## Test now (2 places)

| What | Where |
|------|--------|
| **Block overlay** — real library video in white card, commit CTA after video | Home → **Preview block screen** |
| **Post-trial pricing popup** | Settings → **Expire trial (test)** → popup on tabs |

Dismiss the popup with **Maybe later**; reopen via Settings → **View plans**.

---

## Dashboard metrics (Home)

| Stat | Meaning |
|------|---------|
| **Time wasted (Hrs)** | Total hours on limited apps (from usage import / simulation) |
| **Screen time (Min/day)** | Average daily minutes on your **limited apps** (from usage import / simulation) — not time saved |
| **Commit rate (%)** | Overlay commits vs skips |

---

## Share sheet position (Instagram)

iOS orders the share sheet by **recent use** — apps cannot jump to the top programmatically. After sharing to HopOff a few times it should rise. Users can also tap **Edit Actions…** and pin HopOff to Favorites.

## Needs a rebuild or later

- **Installed-app filter / Android usage import** — EAS dev build with `hopoff-device`
- **Share sheet import** — dev build, not Expo Go
- **Real limit → overlay** — native blocking module (not shipped)
- **RevenueCat purchase / restore** — store products + API key

---

## Related

- [`DEV-BUILD.md`](DEV-BUILD.md) — when to rebuild
- [`PRODUCTION.md`](../PRODUCTION.md) — full launch checklist
