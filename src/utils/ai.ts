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

/** Polish a messy goals brain-dump into a short weekly list. Falls back to local rules. */
export async function polishGoalsWithAi(raw: string): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const result = await chat(
    `You are a focus coach for a screen-time reduction app. Rewrite a messy voice brain-dump into a tight weekly goals list.

Rules:
- Return 3–5 goals, one per line, no numbers or bullets
- Start each line with a strong verb (Train, Read, Finish, Call, etc.)
- Merge duplicates; drop filler and vague wishes
- Make goals concrete: add cadence or scope when implied ("gym" → "Train 3x this week")
- Edit for clarity: fix grammar, shorten run-ons, consistent sentence case
- No trailing periods; max 10 words per line
- Never invent goals the user did not imply`,
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

  return lines.length ? lines.slice(0, 5).join('\n') : polishBrainDump(trimmed);
}

type InsightPayload = { bullets: string[]; summary?: string };

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

Context: The user WASTED this many hours on limited apps (scrolling, etc.) — NOT time they saved or reclaimed.

Rules:
- 2–3 bullets max, each under 12 words
- Frame as what they could have done with that wasted time instead (tie to their goals)
- Never say reclaimed, saved, earned, or recovered time
- Never praise wasting less — this is time already lost to their phone
- No summary line, no "you had X hours", no checkmarks language
- Plain sentence case, scannable`,
    `Hours wasted on limited apps this week: ${wastedHours}\nUser goals:\n${goals}`,
  );

  if (!raw) return fallback;

  try {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) return fallback;
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as InsightPayload;
    const bullets = (parsed.bullets ?? []).filter(Boolean).slice(0, 3);
    return bullets.length ? bullets : fallback;
  } catch {
    return fallback;
  }
}
