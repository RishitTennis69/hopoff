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

function cleanGoal(goal: string) {
  return goal.replace(/^[•\-\d.]+\s*/, '').replace(/\.$/, '').trim();
}

/** Build 2–3 short goal bullets from hours wasted on limited apps. */
export function buildTimeInsights(goalsText: string, _wastedHours: number): string[] {
  const goals = goalsText
    .split(/\n|,/)
    .map(cleanGoal)
    .filter(Boolean)
    .slice(0, 3);

  if (!goals.length) {
    return [
      'make progress on deep work',
      'finish a habit you keep putting off',
    ];
  }

  return goals.map((goal) => phraseForTimeInsight(goal));
}

/** Verb phrase that completes the dashboard line "That's enough time to…" */
export function phraseForTimeInsight(goal: string): string {
  const g = cleanGoal(goal);
  if (!g) return 'make progress on something that matters';

  const est = matchEstimate(g);
  if (est) {
    const map: Record<string, string> = {
      calligraphy: 'practice calligraphy',
      reading: 'finish reading',
      'a workout': 'get a workout in',
      'project work': 'work on your project',
      studying: 'study',
      cooking: 'cook a real meal',
      'quiet time': 'take quiet time',
      writing: 'write',
      practice: 'practice',
      'tidying up': 'tidy up',
    };
    if (map[est.label]) return map[est.label];
  }

  const words = g.split(/\s+/);
  const short = words.length > 8 ? words.slice(0, 7).join(' ') : g;
  const first = short.charAt(0);
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    return short;
  }
  return short.charAt(0).toLowerCase() + short.slice(1);
}
