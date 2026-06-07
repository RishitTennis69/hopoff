import { openRouterKey, useApiProxy } from '@/config/env';
import { proxyPost } from '@/utils/apiClient';
import { buildTimeInsights } from './goalInsights';
import { polishBrainDump } from './polishGoals';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

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
    `You are a focus coach for a screen-time reduction app. Rewrite a messy voice brain-dump into a clear weekly goals list. Do MORE than reformat: merge duplicate or related thoughts, drop filler and vague wishes, make each goal concrete and action-oriented (start with a verb), and add a light specific detail or cadence when the intent implies one (e.g. "read more" -> "Read 20 pages before bed", "gym" -> "Train 3x this week"). Return 3-5 goals, one per line, no numbering, bullets, or preamble. Keep each line under 12 words. Never invent goals the user did not imply.`,
    trimmed,
  );

  if (!result) return polishBrainDump(trimmed);

  const lines = result
    .split('\n')
    .map((l) => l.replace(/^[\d•\-*.)\s]+/, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 2)
    .map((l) => l.charAt(0).toUpperCase() + l.slice(1));

  return lines.length ? lines.slice(0, 5).join('\n') : polishBrainDump(trimmed);
}

type InsightPayload = { bullets: string[]; summary?: string };

/** Natural "that's enough time to" lines whose hours add up. Falls back to local rules. */
export async function buildTimeInsightsWithAi(
  goalsText: string,
  availableHours: number,
): Promise<string[]> {
  const fallback = buildTimeInsights(goalsText, availableHours);
  const goals = goalsText.trim();
  if (!goals) return fallback;

  const raw = await chat(
    `You write motivating copy for a screen-time app. Given reclaimed hours and the user's weekly goals, return ONLY valid JSON: {"bullets":["..."],"summary":"..."}. Rules: bullets are 2–4 natural sentences tying each goal to a realistic time chunk; assigned hours across bullets must sum to at most ${availableHours}; estimate how long each goal typically takes (e.g. calligraphy ~2 hrs); no repeated "you had X hours to spare" on every line; summary is one short line totaling the hours (e.g. "That's 5 hours of your 12 reclaimed").`,
    `Reclaimed hours: ${availableHours}\nGoals:\n${goals}`,
  );

  if (!raw) return fallback;

  try {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) return fallback;
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as InsightPayload;
    const bullets = (parsed.bullets ?? []).filter(Boolean).slice(0, 4);
    if (!bullets.length) return fallback;
    if (parsed.summary?.trim()) bullets.push(parsed.summary.trim());
    return bullets;
  } catch {
    return fallback;
  }
}
