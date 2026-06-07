const FILLERS = /^(um|uh|like|so|okay|well|i want to|i need to|i should|maybe|just)\s+/gi;

function capitalize(s: string) {
  const t = s.trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function cleanPhrase(raw: string) {
  let s = raw.replace(FILLERS, '').trim();
  s = s.replace(/\s+/g, ' ');
  if (s && !/[.!?]$/.test(s)) s += '.';
  return capitalize(s);
}

/** Turn a messy voice brain-dump into a short, scannable weekly goals list. */
export function polishBrainDump(raw: string): string {
  const chunks = raw
    .split(/[\n.!?]+/)
    .map((c) => cleanPhrase(c))
    .filter((c) => c.length > 3);

  const unique: string[] = [];
  for (const c of chunks) {
    const key = c.toLowerCase();
    if (!unique.some((u) => u.toLowerCase() === key)) unique.push(c);
  }

  return unique.slice(0, 5).join('\n');
}
