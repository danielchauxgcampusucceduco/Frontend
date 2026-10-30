import type { ProblemDetail } from './types';

/**
 * Single HTTP entry point. Every request goes through here so the base URL, timeouts and the
 * RFC 7807 error parsing live in one place. In production VITE_API_URL points to Railway; it is
 * inlined at build time by Vite, so changing it on Vercel requires a redeploy.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail | null;

  constructor(status: number, message: string, problem: ProblemDetail | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  get requestId(): string | undefined {
    return this.problem?.requestId;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;

  // Railway may cold-start a sleeping container; without a timeout a hung request would freeze
  // the polling loop forever because the next tick waits for the previous one to settle.
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), timeoutMs);
  signal?.addEventListener('abort', () => controller.abort(signal.reason), { once: true });

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const payload = text ? safeParse(text) : null;

    if (!response.ok) {
      const problem = isProblem(payload) ? payload : null;
      throw new ApiError(response.status, problem?.detail ?? `HTTP ${response.status}`, problem);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError(0, 'La API tardó demasiado en responder', null);
    }
    throw new ApiError(0, 'No se pudo conectar con la API', null);
  } finally {
    window.clearTimeout(timer);
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isProblem(value: unknown): value is ProblemDetail {
  return typeof value === 'object' && value !== null && 'status' in value;
}
