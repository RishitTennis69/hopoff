/** Strict cap: motivation clips must be under one minute. */
export const MAX_VIDEO_DURATION_SEC = 59;

/** True when duration is a real timestamp (not empty / placeholder). */
export function isDisplayDuration(duration: string | undefined): boolean {
  if (!duration?.trim()) return false;
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(duration.trim());
}

export function durationSecFromLabel(duration: string | undefined): number {
  if (!duration?.trim()) return 0;
  const parts = duration.split(':').map((p) => Number(p.trim()));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

export function isUnderMinute(duration: string | undefined, durationSec?: number): boolean {
  const sec = durationSec ?? durationSecFromLabel(duration);
  return sec > 0 && sec <= MAX_VIDEO_DURATION_SEC;
}
