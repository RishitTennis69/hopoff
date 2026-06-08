type TaskEstimate = { keywords: string[]; hours: number; label: string };

const ESTIMATES: TaskEstimate[] = [
  { keywords: ['calligraphy', 'lettering'], hours: 2, label: 'calligraphy' },
  { keywords: ['read', 'book', 'pages'], hours: 1.5, label: 'reading' },
  { keywords: ['run', 'jog', 'workout', 'gym', '10k', 'exercise'], hours: 1, label: 'a workout' },
  { keywords: ['project', 'build', 'code', 'launch', 'startup'], hours: 3, label: 'project work' },
  { keywords: ['study', 'homework', 'exam', 'class'], hours: 2, label: 'studying' },
  { keywords: ['cook', 'meal prep', 'recipe'], hours: 1, label: 'cooking' },
  { keywords: ['meditat', 'journal', 'mindful'], hours: 0.5, label: 'quiet time' },
  { keywords: ['write', 'essay', 'blog'], hours: 2, label: 'writing' },
  { keywords: ['practice', 'guitar', 'piano', 'instrument'], hours: 1.5, label: 'practice' },
  { keywords: ['clean', 'organize', 'room', 'laundry'], hours: 1, label: 'tidying up' },
];

function matchEstimate(goal: string): TaskEstimate | null {
  const lower = goal.toLowerCase();
  return ESTIMATES.find((e) => e.keywords.some((k) => lower.includes(k))) ?? null;
}

function formatHours(h: number) {
  const rounded = Math.round(h * 2) / 2;
  if (rounded < 1) return `${Math.round(rounded * 60)} min`;
  if (rounded === 1) return '1 hr';
  if (Number.isInteger(rounded)) return `${rounded} hrs`;
  return `${rounded} hrs`;
}

function roundHalf(h: number) {
  return Math.round(h * 2) / 2;
}

function cleanGoal(goal: string) {
  return goal.replace(/^[•\-\d.]+\s*/, '').replace(/\.$/, '').trim();
}

/** Build 2–3 short goal bullets from hours wasted on limited apps. */
export function buildTimeInsights(goalsText: string, wastedHours: number): string[] {
  const goals = goalsText
    .split(/\n|,/)
    .map(cleanGoal)
    .filter(Boolean)
    .slice(0, 3);

  if (!goals.length) {
    return [
      `${formatHours(wastedHours)} you could've spent on deep work`,
      'One habit you keep putting off',
    ];
  }

  const items = goals.map((goal) => ({
    goal,
    ideal: matchEstimate(goal)?.hours ?? wastedHours / goals.length,
  }));

  const idealTotal = items.reduce((s, i) => s + i.ideal, 0);
  const scale = idealTotal > wastedHours ? wastedHours / idealTotal : 1;

  let allocated = items.map((i) => roundHalf(i.ideal * scale));

  return items.slice(0, 3).map((item, i) => {
    const hrs = allocated[i];
    const est = matchEstimate(item.goal);
    if (est) return `${item.goal} — ${formatHours(hrs)} for ${est.label}`;
    return `${item.goal} — ${formatHours(hrs)}`;
  });
}
