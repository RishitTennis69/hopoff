import { openRouterKey, useApiProxy } from '@/config/env';
import { proxyPost } from '@/utils/apiClient';
import { buildTimeInsights } from './goalInsights';
import { polishBrainDump } from './polishGoals';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

function model() {
  return process.env.EXPO_PUBLIC_OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
}

export function hasAiKey() {
  return useApiProxy() || openRouterKey().length > 0;
}

async function chat(system: string, user: string): Promise<string | null> {
  if (useApiProxy()) {
    try {
      const data = await proxyPost<{ content: string }>('/api/openrouter', {
        system,
        user,
        model: model(),
      });
      return data.content || null;
    } catch {
      return null;
    }
  }

  const key = openRouterKey();
  if (!key) return null;
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:8081',
        'X-Title': 'HopOff',
      },
      body: JSON.stringify({
        model: model(),
        temperature: 0.35,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

/** True when scraped social text reads like a bio/wiki blurb, not a clip title. */
export function looksLikeSocialBio(text: string): boolean {
  const t = text.trim();
  if (t.length > 100) return true;
  return (
    /\bborn\b/i.test(t) ||
    /\bon\s+(january|february|march|april|may|june|july|august|september|october|november|december|\d)/i.test(t) ||
    /\b\d{4}\b/.test(t) && /\bat\s+[A-Z]/i.test(t) ||
    /^(christopher|born|full name|biography)/i.test(t)
  );
}

function localSocialTitleFallback(raw: string, author?: string): string {
  const first = raw.split(/[.!?]\s/)[0]?.trim() || raw.trim();
  const words = first.split(/\s+/).filter(Boolean);
  if (words.length <= 10 && !looksLikeSocialBio(first)) return first;

  if (author?.replace(/^@/, '').trim() && author !== 'Instagram' && author !== 'TikTok') {
    return 'Motivational reel';
  }

  const short = words.slice(0, 8).join(' ');
  return short.length > 6 ? short : raw.slice(0, 48).trim();
}

/** Turn a long Instagram/TikTok caption into a short library label via OpenRouter. */
export async function summarizeSocialVideoTitle(
  rawTitle: string,
  author?: string,
  platform: 'instagram' | 'tiktok' = 'instagram',
): Promise<string> {
  const trimmed = rawTitle.trim();
  if (!trimmed) return trimmed;

  if (trimmed.length <= 50 && !looksLikeSocialBio(trimmed)) {
    return trimmed;
  }

  if (!hasAiKey()) {
    return localSocialTitleFallback(trimmed, author);
  }

  const result = await chat(
    `You label saved motivation clips in a personal video library app.

Rules:
- Return ONE short label only (typically 3–8 words; up to 12 if needed for clarity).
- Describe what the clip IS — e.g. "Motivational gym edit", "Morning discipline reel".
- Do NOT write biographies, birth dates, places, or Wikipedia-style intros.
- The creator handle is shown separately below the title — do NOT repeat the creator's name or @handle in the label.
- Only name a person in the label if they are the subject of the clip and not the posting creator.
- Never invent facts, quotes, or details not implied by the caption.
- No hashtags, no "on Instagram/TikTok", no platform names, no quotes in output.
- If the caption is already a good short title (under ~50 chars, not biographical), return it lightly cleaned.
- Output only the label.`,
    `Platform: ${platform}\nAuthor/handle: ${author?.trim() || 'unknown'}\nCaption:\n${trimmed}`,
  );

  if (!result) return localSocialTitleFallback(trimmed, author);

  const label = result
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return label.length > 2 ? label : localSocialTitleFallback(trimmed, author);
}

/** Polish a messy goals brain-dump into a short weekly list. Falls back to local rules. */
export async function polishGoalsWithAi(raw: string): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const result = await chat(
    `You clean up a messy voice/text brain-dump of weekly goals for a screen-time app. You are an EDITOR, not a coach.

Absolute rules:
- Only rewrite what the user actually wrote. NEVER add new goals, topics, activities, names, numbers, or details they did not state.
- Do NOT invent specifics: if they did not give a number/frequency/scope, do not add one (no "3x", no "this week", no targets they didn't say).
- Keep every distinct goal the user mentioned; only merge clear duplicates of the same goal.
- Fix grammar, remove filler words, and tighten run-ons — but preserve their meaning and wording.
- One goal per line, no numbers or bullets. Sentence case. No trailing periods. Max ~12 words per line.
- Output only the cleaned goal lines, nothing else.`,
    trimmed,
  );

  if (!result) return polishBrainDump(trimmed);

  const lines = result
    .split('\n')
    .map((l) => l.replace(/^[\d•\-*.)\s]+/, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 2)
    .map((l) => {
      let s = l.replace(/\.+$/, '').trim();
      s = s.charAt(0).toUpperCase() + s.slice(1);
      return s;
    });

  return lines.length ? lines.slice(0, 8).join('\n') : polishBrainDump(trimmed);
}

type InsightPayload = { bullets: string[]; summary?: string };

export function normalizeTimeInsightBullet(b: string): string {
  return b
    .replace(/^that'?s enough time to\s+/i, '')
    .replace(/^you could('ve| have)\s+/i, '')
    .replace(/^you could\s+/i, '')
    .replace(/^you might\s+/i, '')
    .replace(/\.\s*$/, '')
    .trim();
}

/** Natural "that's enough time to" lines — hours = time wasted on limited apps. */
export async function buildTimeInsightsWithAi(
  goalsText: string,
  wastedHours: number,
): Promise<string[]> {
  const fallback = buildTimeInsights(goalsText, wastedHours);
  const goals = goalsText.trim();
  if (!goals) return fallback;

  const raw = await chat(
    `You write short dashboard copy for a screen-time reduction app. Return ONLY valid JSON: {"bullets":["..."]}.

The UI already shows the heading "That's enough time to…" — each bullet MUST be only the phrase that completes that sentence.

Rules:
- 2–3 bullets max, each 3–10 words
- Each bullet is a verb phrase ONLY — e.g. "launch HopOff", "market on X", "finish your weekly reading"
- NEVER start with "You could have", "You could", "You might", or similar
- NEVER repeat "that's enough time to" inside a bullet
- Tie phrases to the user's actual goals when possible
- Never say reclaimed, saved, earned, or recovered time
- No periods at the end of bullets
- Output only the JSON object`,
    `Hours wasted on limited apps this week: ${wastedHours}\nUser goals:\n${goals}`,
  );

  if (!raw) return fallback;

  try {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) return fallback;
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as InsightPayload;
    const bullets = (parsed.bullets ?? [])
      .map(normalizeTimeInsightBullet)
      .filter(Boolean)
      .slice(0, 3);
    return bullets.length ? bullets : fallback;
  } catch {
    return fallback;
  }
}
