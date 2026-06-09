/** Approved overlay headlines — max 6 words per line. */
const HEADLINES = [
  { line1: 'Put the phone down.', line2: 'Live your life.' },
  { line1: 'Close {app} now.', line2: 'Open real life.' },
  { line1: 'Leave {app} alone.', line2: 'Stay present.' },
  { line1: 'One more reel won’t help.', line2: 'You know that.' },
  { line1: '{app} stole enough time.', line2: 'Take it back.' },
  { line1: 'This feed is infinite.', line2: 'Your day isn’t.' },
  { line1: 'Put {app} away.', line2: 'Pick your goals.' },
  { line1: '{app} is winning.', line2: 'Fight back.' },
  { line1: 'You opened {app} again.', line2: 'Close it now.' },
  { line1: 'The algorithm doesn’t care.', line2: 'You should.' },
  { line1: 'Your future self waits.', line2: 'Not this app.' },
  { line1: 'Enough {app} for today.', line2: 'Do something real.' },
] as const;

export function pickBlockHeadline(appName?: string): { line1: string; line2: string } {
  const pick = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
  const name = appName ?? 'This app';
  return {
    line1: pick.line1.replace(/\{app\}/g, name),
    line2: pick.line2,
  };
}
