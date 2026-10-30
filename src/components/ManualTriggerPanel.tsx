import { useEffect, useMemo, useState } from 'react';
import { Bomb, Flame, Loader2, Send, Terminal } from 'lucide-react';
import { ApiError } from '../api/client';
import { api } from '../api/endpoints';
import { SERVICE_IDS, type ServiceCatalogEntry, type ServiceId } from '../api/types';
import { shortId } from '../lib/format';
import { OPERATION_LABELS, SERVICE_META } from '../lib/services';
import type { ToastTone } from '../hooks/useToasts';

interface ManualTriggerPanelProps {
  onCallCompleted: () => void;
  notify: (tone: ToastTone, title: string, message?: string) => void;
}

interface LastCall {
  ok: boolean;
  httpStatus: number;
  requestId?: string;
  summary: string;
}

const FORCED_FAILURE_PAYLOAD = { orderId: 'ORD-2026-001041', amount: 459900, currency: 'COP', method: 'NEQUI', forceFail: true };
const FAILURE_BURST_SIZE = 5;

export function ManualTriggerPanel({ onCallCompleted, notify }: ManualTriggerPanelProps) {
  const [catalog, setCatalog] = useState<ServiceCatalogEntry[]>([]);
  const [serviceId, setServiceId] = useState<ServiceId>('INVENTORY');
  const [operation, setOperation] = useState('');
  const [payload, setPayload] = useState('{}');
  const [sending, setSending] = useState(false);
  const [lastCall, setLastCall] = useState<LastCall | null>(null);

  useEffect(() => {
    api
      .catalog()
      .then(setCatalog)
      .catch(() => notify('error', 'No se pudo cargar el catálogo de operaciones'));
  }, [notify]);

  const operations = useMemo(() => catalog.find((entry) => entry.serviceId === serviceId)?.operations ?? [], [catalog, serviceId]);

  // Pre-fill with the backend's sample payload whenever the selected operation changes.
  useEffect(() => {
    const first = operations.find((spec) => spec.name === operation) ?? operations[0];
    if (!first) return;
    if (first.name !== operation) setOperation(first.name);
    setPayload(JSON.stringify(first.samplePayload, null, 2));
  }, [operations, operation]);

  const parsedPayload = useMemo(() => {
    try {
      const value = JSON.parse(payload) as unknown;
      return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }, [payload]);

  const send = async (target: ServiceId, op: string, body: Record<string, unknown>): Promise<LastCall> => {
    try {
      const response = await api.invoke(target, op, body);
      return { ok: true, httpStatus: 200, requestId: response.requestId, summary: `${SERVICE_META[target].label} · ${op} respondió correctamente` };
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      return {
        ok: false,
        httpStatus: apiError?.status ?? 0,
        requestId: apiError?.requestId,
        summary: apiError?.message ?? 'Error desconocido',
      };
    }
  };

  const handleSend = async () => {
    if (!parsedPayload) return;
    setSending(true);
    const result = await send(serviceId, operation, parsedPayload);
    setLastCall(result);
    setSending(false);
    onCallCompleted();
  };

  const handleForcedFailures = async (count: number) => {
    setSending(true);
    const results = await Promise.all(Array.from({ length: count }, () => send('PAYMENTS', 'processPayment', FORCED_FAILURE_PAYLOAD)));
    setSending(false);
    setLastCall(results[results.length - 1]);
    onCallCompleted();
    notify(
      'info',
      count === 1 ? 'Fallo simulado en Pagos' : `${count} fallos simulados en Pagos`,
      'Observa cómo sube la tasa de error; por encima del 15 % la tarjeta se pone en rojo.',
    );
  };

  return (
    <section className="panel flex flex-col p-5">
      <h2 className="panel-title mb-4">
        <Terminal className="h-4 w-4 text-gold-400" />
        Disparador manual
      </h2>

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-carbon-700 bg-carbon-850 p-1" role="tablist" aria-label="Servicio destino">
        {SERVICE_IDS.map((id) => {
          const Icon = SERVICE_META[id].icon;
          const selected = id === serviceId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setServiceId(id);
                setOperation('');
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                selected ? 'bg-carbon-700 text-white shadow' : 'text-carbon-400 hover:text-carbon-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: selected ? SERVICE_META[id].color : undefined }} />
              {SERVICE_META[id].label}
            </button>
          );
        })}
      </div>

      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-carbon-400">Operación</span>
        <select className="field" value={operation} onChange={(event) => setOperation(event.target.value)} disabled={operations.length === 0}>
          {operations.map((spec) => (
            <option key={spec.name} value={spec.name}>
              {spec.name} — {OPERATION_LABELS[spec.name] ?? spec.name}
              {spec.cacheable ? ' (cacheable)' : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 flex flex-1 flex-col gap-1.5">
        <span className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-carbon-400">
          Cuerpo JSON
          {!parsedPayload && <span className="normal-case tracking-normal text-red-400">JSON inválido</span>}
        </span>
        <textarea
          className={`field scrollbar-thin min-h-[9rem] flex-1 resize-y font-mono text-xs leading-relaxed ${parsedPayload ? '' : 'border-red-500/70'}`}
          spellCheck={false}
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
        />
      </label>

      <button type="button" className="btn-primary mt-3" onClick={handleSend} disabled={sending || !parsedPayload || !operation}>
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar petición
      </button>

      <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3">
        <p className="text-xs font-medium text-red-300">Pruebas de resiliencia en Pagos</p>
        <p className="mt-0.5 text-[11px] text-carbon-400">
          Envía <code className="font-mono text-carbon-300">forceFail: true</code> para simular la caída de la pasarela.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" className="btn-danger text-xs" onClick={() => handleForcedFailures(1)} disabled={sending}>
            <Bomb className="h-3.5 w-3.5" />
            Simular fallo
          </button>
          <button type="button" className="btn-danger text-xs" onClick={() => handleForcedFailures(FAILURE_BURST_SIZE)} disabled={sending}>
            <Flame className="h-3.5 w-3.5" />
            Ráfaga ×{FAILURE_BURST_SIZE}
          </button>
        </div>
      </div>

      {lastCall && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs ${
            lastCall.ok ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-red-500/30 bg-red-500/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-mono font-semibold ${lastCall.ok ? 'text-emerald-300' : 'text-red-300'}`}>
              HTTP {lastCall.httpStatus || '—'}
            </span>
            {lastCall.requestId && <span className="font-mono text-carbon-400">req {shortId(lastCall.requestId)}…</span>}
          </div>
          <p className="mt-1 break-words text-carbon-300">{lastCall.summary}</p>
        </div>
      )}
    </section>
  );
}
