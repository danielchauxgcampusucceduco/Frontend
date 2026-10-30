import { request } from './client';
import type {
  AuditLogEntry,
  LogFilters,
  MetricsSummary,
  OperationResponse,
  PageResponse,
  ServiceCatalogEntry,
  ServiceId,
  SimulationReport,
} from './types';

const SERVICE_PATHS: Record<ServiceId, string> = {
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
};

/** datetime-local values carry no zone; interpret them in the browser's zone and send UTC. */
function toIsoInstant(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const api = {
  summary(signal?: AbortSignal) {
    return request<MetricsSummary>('/api/metrics/summary', { signal });
  },

  logs(filters: LogFilters, signal?: AbortSignal) {
    return request<PageResponse<AuditLogEntry>>('/api/metrics/logs', {
      signal,
      query: {
        service: filters.service === 'ALL' ? undefined : filters.service,
        status: filters.status === 'ALL' ? undefined : filters.status,
        from: toIsoInstant(filters.from),
        to: toIsoInstant(filters.to),
        page: filters.page,
        size: filters.size,
      },
    });
  },

  simulateLoad(calls = 50) {
    // 50 concurrent calls finish in ~1 s, but a cold Railway container can take much longer.
    return request<SimulationReport>('/api/metrics/simulate-load', { method: 'POST', query: { calls }, timeoutMs: 60_000 });
  },

  resetLogs() {
    return request<void>('/api/metrics/logs', { method: 'DELETE' });
  },

  catalog() {
    return request<ServiceCatalogEntry[]>('/api/services/catalog');
  },

  invoke(serviceId: ServiceId, operation: string, payload: Record<string, unknown>) {
    return request<OperationResponse>(`/api/services/${SERVICE_PATHS[serviceId]}/${encodeURIComponent(operation)}`, {
      method: 'POST',
      body: payload,
    });
  },
};
