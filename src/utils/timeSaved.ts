/**
 * Minutes credited when the user commits on the block overlay.
 *
 * We cannot measure how long they would have scrolled, so each commit uses a
 * standardized estimate based on the motivation clip they just watched:
 *   minutes = clamp(round(videoSeconds / 60), 5, 15)
 *
 * Floor 5 min  → minimum meaningful “session avoided”
 * Cap 15 min   → avoids inflating stats on long clips
 */
export function reclaimedMinutesForCommit(videoDurationSec: number): number {
  const minutes = Math.round(videoDurationSec / 60);
  return Math.min(15, Math.max(5, minutes > 0 ? minutes : 5));
}

/** Parse m:ss or h:mm:ss into seconds; returns 0 when unknown. */
export function parseDurationLabel(duration: string | undefined): number {
  if (!duration?.trim()) return 0;
  const parts = duration.split(':').map((p) => Number(p.trim()));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}
