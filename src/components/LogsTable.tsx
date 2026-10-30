import { Fragment, useState } from 'react';
import { ChevronRight, Database, ScrollText } from 'lucide-react';
import type { AuditLogEntry, LogFilters, PageResponse } from '../api/types';
import { formatDateTime, formatNumber, shortId } from '../lib/format';
import { OPERATION_LABELS, SERVICE_META } from '../lib/services';
import { LogDetail } from './LogDetail';
import { LogFiltersBar } from './LogFiltersBar';
import { Pagination } from './Pagination';
import { StatusBadge } from './StatusBadge';

interface LogsTableProps {
  page: PageResponse<AuditLogEntry> | null;
  loading: boolean;
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
}

const COLUMNS = ['requestId', 'Servicio', 'Operación', 'Duración (ms)', 'Estado', 'Fecha / hora'];

export function LogsTable({ page, loading, filters, onFiltersChange }: LogsTableProps) {
  // Keyed by requestId (not row index) so the expanded row survives the 3 s refresh even when
  // new entries push it further down the page.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rows = page?.content ?? [];

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title">
          <ScrollText className="h-4 w-4 text-gold-400" />
          Logs de auditoría en tiempo real
        </h2>
        <span className="text-xs text-carbon-500">
          {page ? `${formatNumber(page.totalElements)} registros` : ''} · clic en una fila para ver el detalle
        </span>
      </div>

      <LogFiltersBar filters={filters} onChange={onFiltersChange} />

      <div className="scrollbar-thin mt-4 overflow-x-auto rounded-xl border border-carbon-700/70">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-carbon-850 text-[11px] uppercase tracking-wider text-carbon-400">
            <tr>
              <th className="w-8" />
              {COLUMNS.map((column) => (
                <th key={column} className="px-3 py-2.5 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-800">
            {rows.map((entry) => {
              const expanded = expandedId === entry.requestId;
              const failed = entry.status === 'ERROR';
              return (
                <Fragment key={entry.requestId}>
                  <tr
                    onClick={() => setExpandedId(expanded ? null : entry.requestId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setExpandedId(expanded ? null : entry.requestId);
                      }
                    }}
                    tabIndex={0}
                    aria-expanded={expanded}
                    className={`cursor-pointer transition-colors focus:outline-none focus-visible:bg-carbon-800 ${
                      expanded ? 'bg-carbon-800/80' : failed ? 'bg-red-500/[0.04] hover:bg-red-500/10' : 'hover:bg-carbon-850'
                    }`}
                  >
                    <td className="pl-3 text-carbon-500">
                      <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90 text-gold-400' : ''}`} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-carbon-300" title={entry.requestId}>
                      {shortId(entry.requestId)}…
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: SERVICE_META[entry.serviceId].color }} />
                        <span className="font-mono text-xs text-carbon-200">{entry.serviceId}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-carbon-200">{entry.operation}</span>
                      <span className="ml-2 hidden text-xs text-carbon-500 xl:inline">{OPERATION_LABELS[entry.operation] ?? ''}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono tabular-nums text-carbon-200">
                      {formatNumber(entry.durationMs)}
                      {entry.cacheHit && <Database className="ml-1.5 inline h-3 w-3 text-emerald-400" aria-label="Respuesta desde caché" />}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-carbon-400">{formatDateTime(entry.timestamp)}</td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="p-0">
                        <LogDetail entry={entry} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-12 text-center text-sm text-carbon-400">
                  {loading ? 'Cargando logs…' : 'No hay registros que coincidan con los filtros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {page && (
        <div className="mt-4">
          <Pagination
            page={page.page}
            size={page.size}
            totalPages={page.totalPages}
            totalElements={page.totalElements}
            onPageChange={(next) => onFiltersChange({ ...filters, page: next })}
          />
        </div>
      )}
    </section>
  );
}
