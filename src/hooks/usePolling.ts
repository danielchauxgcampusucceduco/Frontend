import { useCallback, useEffect, useRef, useState } from 'react';

interface PollingState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Polls `fetcher` every `intervalMs` while `enabled` is true.
 *
 * Design notes:
 * - Uses a setTimeout chain instead of setInterval, so a slow response never overlaps with the
 *   next tick (setInterval would stack requests when the API is slower than the interval).
 * - Aborts the in-flight request when inputs change; stale responses from previous filters
 *   can therefore never overwrite the table.
 * - Skips ticks while the tab is hidden to avoid hammering a free-tier Railway instance.
 * - Keeps the last good data on error, so a transient failure does not blank the dashboard.
 */
export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number,
  enabled: boolean,
  deps: readonly unknown[],
): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const result = await fetcherRef.current(controller.signal);
      if (controller.signal.aborted) return;
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    const tick = async () => {
      if (document.visibilityState === 'visible') {
        await load();
      }
      if (!cancelled && enabled) {
        timer = window.setTimeout(tick, intervalMs);
      }
    };

    void tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controllerRef.current?.abort();
    };
    // `deps` are spread on purpose: callers pass the values their fetcher closes over (e.g. filters).
  }, [load, intervalMs, enabled, ...deps]);

  return { data, error, loading, lastUpdated, refresh: load };
}
