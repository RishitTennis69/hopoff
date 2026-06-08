/** Approved overlay headlines — max 6 words per line. */
const GENERIC = [
  { line1: 'Put the phone down.', line2: 'Live your life.' },
  { line1: 'This scroll can wait.', line2: 'You cannot.' },
  { line1: 'Stop the autopilot.', line2: 'Choose your life.' },
] as const;

const NAMED = [
  { line1: '{app} can wait.', line2: 'Go live instead.' },
  { line1: 'Close {app} now.', line2: 'Open real life.' },
  { line1: 'Leave {app} alone.', line2: 'Stay present.' },
] as const;

export function pickBlockHeadline(appName?: string): { line1: string; line2: string } {
  const pool = appName ? NAMED : GENERIC;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const line1 = pick.line1.replace('{app}', appName ?? '');
  return { line1, line2: pick.line2 };
}
