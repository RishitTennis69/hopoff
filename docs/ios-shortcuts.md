# iOS Shortcuts for Goals import

HopOff opens your Shortcut via URL when the user taps **Add Shortcut** on Reminders or Notes.

## After you publish each Shortcut

1. Get the iCloud share link (e.g. `https://www.icloud.com/shortcuts/abc123...`).
2. Add to app `.env`:

   ```
   EXPO_PUBLIC_SHORTCUT_REMINDERS_URL=https://www.icloud.com/shortcuts/YOUR_REMINDERS_LINK
   EXPO_PUBLIC_SHORTCUT_NOTES_URL=https://www.icloud.com/shortcuts/YOUR_NOTES_LINK
   ```

3. Rebuild the app (env vars are baked in at build time).

Until those URLs are set, the app opens the generic iCloud Shortcuts gallery.

## Suggested Shortcut behavior

**Reminders → HopOff**

1. Get today's / this week's reminders (or ask user to pick a list).
2. Format as plain text (one goal per line).
3. Open HopOff via URL scheme with encoded text, or copy to clipboard and show instructions.

**Notes → HopOff**

1. Get body of a selected note (or prompt user).
2. Same handoff to HopOff.

Deep link format (if you add a handler later): `hoptfoff://import?text=...`

Currently the app supports share-sheet and manual entry; Shortcut integration is optional polish.
