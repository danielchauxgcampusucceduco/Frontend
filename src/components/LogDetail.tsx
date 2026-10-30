import { Database, Fingerprint, Timer } from 'lucide-react';
import type { AuditLogEntry } from '../api/types';
import { formatDateTime, formatMs } from '../lib/format';
import { JsonBlock } from './JsonBlock';

export function LogDetail({ entry }: { entry: AuditLogEntry }) {
  const failed = entry.status === 'ERROR';

  return (
    <div className="space-y-4 border-l-2 border-gold-500/60 bg-carbon-850/60 p-4">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-carbon-400">
        <span className="flex items-center gap-1.5">
          <Fingerprint className="h-3.5 w-3.5 text-gold-400" />
          requestId: <span className="select-all font-mono text-carbon-200">{entry.requestId}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-gold-400" />
          {formatMs(entry.durationMs)} · {formatDateTime(entry.timestamp)}
        </span>
        {entry.cacheHit && (
          <span className="flex items-center gap-1.5 text-emerald-300">
            <Database className="h-3.5 w-3.5" />
            Respondido desde la caché del proxy (el servicio real no fue invocado)
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonBlock title="Parámetros de entrada (inputParams)" raw={entry.inputParams} />
        <JsonBlock
          title={failed ? 'Error devuelto (responsePayload)' : 'Respuesta completa (responsePayload)'}
          raw={entry.responsePayload}
          tone={failed ? 'danger' : 'neutral'}
        />
      </div>

      {failed && entry.stackTraceSummary && (
        <JsonBlock title="Stack trace resumido" raw={entry.stackTraceSummary} tone="danger" plain />
      )}
    </div>
  );
}
