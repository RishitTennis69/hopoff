type TaskEstimate = { keywords: string[]; hours: number; label: string };

const ESTIMATES: TaskEstimate[] = [
  { keywords: ['calligraphy', 'lettering'], hours: 2, label: 'a calligraphy session' },
  { keywords: ['read', 'book', 'pages'], hours: 1.5, label: 'reading' },
  { keywords: ['run', 'jog', 'workout', 'gym', '10k', 'exercise'], hours: 1, label: 'a workout' },
  { keywords: ['project', 'build', 'code', 'launch', 'startup'], hours: 4, label: 'meaningful project work' },
  { keywords: ['study', 'homework', 'exam', 'class'], hours: 2, label: 'focused study' },
  { keywords: ['cook', 'meal prep', 'recipe'], hours: 1, label: 'cooking a real meal' },
  { keywords: ['meditat', 'journal', 'mindful'], hours: 0.5, label: 'quiet reflection' },
  { keywords: ['write', 'essay', 'blog'], hours: 2, label: 'writing' },
  { keywords: ['practice', 'guitar', 'piano', 'instrument'], hours: 1.5, label: 'instrument practice' },
  { keywords: ['clean', 'organize', 'room', 'laundry'], hours: 1, label: 'tidying up' },
];

function matchEstimate(goal: string): TaskEstimate | null {
  const lower = goal.toLowerCase();
  return ESTIMATES.find((e) => e.keywords.some((k) => lower.includes(k))) ?? null;
}

function formatHours(h: number) {
  const rounded = Math.round(h * 2) / 2;
  if (rounded < 1) return `${Math.round(rounded * 60)} min`;
  if (rounded === 1) return '1 hour';
  if (Number.isInteger(rounded)) return `${rounded} hours`;
  return `${rounded} hours`;
}

function roundHalf(h: number) {
  return Math.round(h * 2) / 2;
}

function cleanGoal(goal: string) {
  return goal.replace(/^[•\-\d.]+\s*/, '').replace(/\.$/, '').trim();
}

/** Build goal bullets whose time allocations sum to at most availableHours. */
export function buildTimeInsights(goalsText: string, availableHours: number): string[] {
  const goals = goalsText
    .split(/\n|,/)
    .map(cleanGoal)
    .filter(Boolean)
    .slice(0, 3);

  if (!goals.length) {
    return [
      `Finish ${formatHours(availableHours)} of deep work you've been putting off`,
      "Start one habit you've talked about but never began",
    ];
  }

  const items = goals.map((goal) => ({
    goal,
    ideal: matchEstimate(goal)?.hours ?? availableHours / goals.length,
  }));

  const idealTotal = items.reduce((s, i) => s + i.ideal, 0);
  const scale = idealTotal > availableHours ? availableHours / idealTotal : 1;

  let allocated = items.map((i) => roundHalf(i.ideal * scale));
  let sum = allocated.reduce((s, h) => s + h, 0);

  if (sum > availableHours) {
    let excess = roundHalf(sum - availableHours);
    for (let i = allocated.length - 1; i >= 0 && excess > 0; i--) {
      const trim = Math.min(allocated[i], excess);
      allocated[i] = roundHalf(allocated[i] - trim);
      excess = roundHalf(excess - trim);
    }
  }

  sum = allocated.reduce((s, h) => s + h, 0);

  const bullets = items.map((item, i) => {
    const hrs = allocated[i];
    const est = matchEstimate(item.goal);
    if (est) {
      return `${item.goal} — about ${formatHours(hrs)} of ${est.label}`;
    }
    return `${item.goal} — about ${formatHours(hrs)}`;
  });

  if (goals.length > 1) {
    bullets.push(`That's ${formatHours(sum)} of your ${formatHours(availableHours)} reclaimed this week`);
  }

  return bullets;
}
