import { AlertTriangle, CheckCircle2, Clock, Database, Hourglass, PhoneCall, XCircle } from 'lucide-react';
import type { ServiceId, ServiceMetrics } from '../api/types';
import { formatMs, formatNumber, formatPercent, formatTime } from '../lib/format';
import { DEGRADATION_THRESHOLD, SERVICE_META, isDegraded } from '../lib/services';

interface ServiceCardProps {
  serviceId: ServiceId;
  metrics: ServiceMetrics | undefined;
}

export function ServiceCard({ serviceId, metrics }: ServiceCardProps) {
  const meta = SERVICE_META[serviceId];
  const Icon = meta.icon;
  const errorRate = metrics?.errorRate ?? 0;
  // The rule is evaluated client-side too, so the alert reacts even if the backend threshold changes.
  const degraded = isDegraded(errorRate);

  return (
    <article
      className={`panel relative overflow-hidden p-5 transition-colors duration-500 ${
        degraded ? 'border-red-500 bg-red-950/40 shadow-[0_0_0_1px_rgba(239,68,68,0.6),0_0_32px_-4px_rgba(239,68,68,0.45)]' : ''
      }`}
      aria-label={`Servicio ${meta.label}`}
    >
      {degraded && (
        <div className="-mx-5 -mt-5 mb-4 flex items-center justify-center gap-2 bg-red-600 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
          <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
          ¡SERVICIO DEGRADADO: ERROR &gt; {DEGRADATION_THRESHOLD}%!
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-carbon-700 bg-carbon-850"
            style={{ color: degraded ? '#f87171' : meta.color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{meta.label}</h2>
            <p className="text-xs text-carbon-400">{meta.description}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            metrics?.realServiceInitialized
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-carbon-600 bg-carbon-800 text-carbon-400'
          }`}
          title={
            metrics?.realServiceInitializedAt
              ? `Servicio real instanciado por el proxy a las ${formatTime(metrics.realServiceInitializedAt)}`
              : 'El proxy aún no ha creado el servicio real (carga diferida)'
          }
        >
          {metrics?.realServiceInitialized ? <Database className="h-3 w-3" /> : <Hourglass className="h-3 w-3" />}
          {metrics?.realServiceInitialized ? 'Servicio real activo' : 'Lazy: en espera'}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <Stat icon={PhoneCall} label="Total de llamadas" value={metrics ? formatNumber(metrics.totalCalls) : '—'} />
        <Stat icon={Clock} label="Tiempo promedio" value={metrics ? formatMs(metrics.avgResponseTimeMs) : '—'} />
        <Stat icon={CheckCircle2} label="Tasa de éxito" value={metrics ? formatPercent(metrics.successRate) : '—'} tone="success" />
        <Stat icon={XCircle} label="Tasa de error" value={metrics ? formatPercent(errorRate) : '—'} tone={degraded ? 'danger' : 'muted'} />
      </dl>

      <div className="mt-4">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-carbon-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ${degraded ? 'bg-red-500' : 'bg-emerald-400'}`}
            style={{ width: `${metrics?.totalCalls ? metrics.successRate : 0}%` }}
          />
          <div className="absolute inset-y-0 w-px bg-white/40" style={{ left: `${100 - DEGRADATION_THRESHOLD}%` }} title="Umbral de degradación" />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-carbon-500">
          <span>{metrics ? `${formatNumber(metrics.failedCalls)} errores` : ''}</span>
          <span>{metrics ? `${formatNumber(metrics.cacheHits)} aciertos de caché` : ''}</span>
        </div>
      </div>
    </article>
  );
}

interface StatProps {
  icon: typeof Clock;
  label: string;
  value: string;
  tone?: 'success' | 'danger' | 'muted';
}

function Stat({ icon: Icon, label, value, tone }: StatProps) {
  const valueColor = tone === 'success' ? 'text-emerald-300' : tone === 'danger' ? 'text-red-300' : 'text-white';
  return (
    <div className="rounded-xl border border-carbon-700/70 bg-carbon-850/70 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-carbon-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className={`mt-1 font-mono text-lg font-semibold tabular-nums ${valueColor}`}>{value}</dd>
    </div>
  );
}
