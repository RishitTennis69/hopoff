import { apiBaseUrl } from '@/config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function proxyPost<T>(path: string, body: unknown): Promise<T> {
  const base = apiBaseUrl();
  if (!base) throw new ApiError('API proxy not configured');

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string; code?: string };
  if (!res.ok) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.code);
  }
  return data;
}

export async function proxyGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const base = apiBaseUrl();
  if (!base) throw new ApiError('API proxy not configured');

  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  const res = await fetch(`${base}${path}${qs}`);
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; code?: string };
  if (!res.ok) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.code);
  }
  return data;
}
