/**
 * Wire types mirroring the backend DTOs (microservice-logging-proxy-api).
 * Field names must stay in sync with the Java records.
 */

export type ServiceId = 'INVENTORY' | 'ORDERS' | 'PAYMENTS';
export type CallStatus = 'SUCCESS' | 'ERROR';

export const SERVICE_IDS: readonly ServiceId[] = ['INVENTORY', 'ORDERS', 'PAYMENTS'];

export interface CallSample {
  requestId: string;
  operation: string;
  durationMs: number;
  status: CallStatus;
  timestamp: string;
  cacheHit: boolean;
}

export interface ServiceMetrics {
  serviceId: ServiceId;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  errorRate: number;
  avgResponseTimeMs: number;
  degraded: boolean;
  cacheHits: number;
  realServiceInitialized: boolean;
  realServiceInitializedAt: string | null;
  last20Calls: CallSample[];
}

export interface MetricsSummary {
  generatedAt: string;
  degradationThresholdPercent: number;
  totalCalls: number;
  services: Record<ServiceId, ServiceMetrics>;
}

export interface AuditLogEntry {
  requestId: string;
  serviceId: ServiceId;
  operation: string;
  durationMs: number;
  status: CallStatus;
  timestamp: string;
  inputParams: string;
  responsePayload: string;
  stackTraceSummary: string | null;
  cacheHit: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface LogFilters {
  service: ServiceId | 'ALL';
  status: CallStatus | 'ALL';
  /** Value of a datetime-local input (local time, no zone) or empty. */
  from: string;
  to: string;
  page: number;
  size: number;
}

export interface SimulationReport {
  requestedCalls: number;
  succeeded: number;
  failed: number;
  callsByService: Record<ServiceId, number>;
  failuresByService: Record<ServiceId, number>;
  elapsedMs: number;
  startedAt: string;
}

export interface OperationSpec {
  name: string;
  requiredParameters: string[];
  readOnly: boolean;
  cacheable: boolean;
  samplePayload: Record<string, unknown>;
}

export interface ServiceCatalogEntry {
  serviceId: ServiceId;
  endpoint: string;
  realServiceInitialized: boolean;
  operations: OperationSpec[];
}

export interface OperationResponse {
  requestId: string;
  serviceId: ServiceId;
  operation: string;
  status: CallStatus;
  data: Record<string, unknown>;
  processedAt: string;
}

/** RFC 7807 body produced by the backend's GlobalExceptionHandler. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  errorCode?: string;
  requestId?: string;
  serviceId?: ServiceId;
  operation?: string;
  durationMs?: number;
}
