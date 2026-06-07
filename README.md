# HopOff

Stop scrolling. Start living. HopOff helps you cut screen time by intervening with your own
motivational videos the moment you hit a limit — and by turning wasted hours into the goals that
actually matter.

This repo is a cross-platform **React Native + Expo (TypeScript)** prototype. Every screen is
high-fidelity UI backed by working local state (persisted on-device), animations, and haptics. The
real OS-level blocking (Apple Screen Time / Android Accessibility) is stubbed for a later native
phase — see [Roadmap](#roadmap).

## Getting started

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with the **Expo Go** app
on your phone. The hour-wheel haptics are best felt on a real device.

## What's implemented

- **Welcome** — "Stop scrolling. Start living." with a looping motivational video and the start CTA.
- **Onboarding** (7 steps) — value-prop intro, quick personalization questions, pick/group apps,
  weekly goals + connect (Notes/Reminders/Notion), add 3+ videos (gated), system permissions, paywall.
- **Apps & Limits** — select apps, combine them into **groups** with a single shared limit
  (YouTube and YouTube Shorts are separate items).
- **Group creation popup** — editable name + a draggable **hour wheel** with escalating haptic
  resistance as hours increase.
- **Collection** — search a topic to load videos (`+` to add), or import from TikTok / Instagram
  saved with multi-select and a "N videos added" confirmation.
- **Goals** — weekly goals with a voice-to-text affordance and service connections.
- **Dashboard** — stats, commit-vs-waste rate, a personalized "that's enough time to..." list, a
  tappable 5-day bar chart, and per-day soft spots with a change-limits CTA.
- **Block / Intervention** — personalized reveal, your video, a task-aware "I'll commit to do
  better" button, and a delayed-fade "I'm going to waste my life..." dismiss link. (Preview it from
  the bottom of the Dashboard.)

## Tech

- `expo-router` for navigation (tabs + onboarding stack + modal routes)
- `zustand` + `@react-native-async-storage/async-storage` for persisted state (`src/store`)
- `react-native-reanimated` + `react-native-gesture-handler` for the wheel and reveal animations
- `react-native-svg` for the hour wheel, bar chart, and brand glyphs
- `expo-haptics` for the escalating wheel feedback
- `expo-video` for video playback
- `@expo-google-fonts/nunito` for the heavy rounded display type

## Project structure

```
src/
  app/            expo-router routes (index, block, modals, (tabs)/, onboarding/)
  components/     reusable UI (AppText, Card, PillButton, HourWheel, BarChart, VideoCard, ...)
  features/       composed screen sections reused across tabs + onboarding
  store/          zustand persisted stores
  data/           mock data (apps, videos, stats, onboarding questions)
  theme/          colors, spacing, radii, typography, brand colors
```

## Roadmap (native phase)

These require native modules and platform entitlements, so they're mocked for now:

- Real app blocking via Apple `FamilyControls`/`DeviceActivity` and Android Accessibility Services
- Live TikTok / Instagram "saved" access and the TikTok share-sheet "Add to HopOff" target
- Voice-to-text wiring and habit-builder suggestions driven by real usage data
