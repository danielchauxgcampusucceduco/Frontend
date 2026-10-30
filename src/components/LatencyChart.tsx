import { useMemo, useState } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { SERVICE_IDS, type CallSample, type MetricsSummary, type ServiceId } from '../api/types';
import { formatMs, formatTime } from '../lib/format';
import { OPERATION_LABELS, SERVICE_META } from '../lib/services';

const WINDOW = 20;

type ChartRow = { slot: number } & Partial<Record<ServiceId, number>> & { samples: Partial<Record<ServiceId, CallSample>> };

interface LatencyChartProps {
  summary: MetricsSummary | null;
}

/**
 * Plots the last 20 calls of each service side by side. The X axis is the call position within
 * each service's window (1 = oldest, 20 = newest) rather than wall-clock time: services receive
 * traffic at different rates, and a shared time axis would squeeze the quiet ones into a corner.
 */
export function LatencyChart({ summary }: LatencyChartProps) {
  const [hidden, setHidden] = useState<Set<ServiceId>>(new Set());

  const rows = useMemo<ChartRow[]>(() => {
    return Array.from({ length: WINDOW }, (_, index) => {
      const row: ChartRow = { slot: index + 1, samples: {} };
      for (const serviceId of SERVICE_IDS) {
        const calls = summary?.services[serviceId]?.last20Calls ?? [];
        // Right-align shorter series so the newest call of every service sits at slot 20.
        const sample = calls[index - (WINDOW - calls.length)];
        if (sample) {
          row[serviceId] = sample.durationMs;
          row.samples[serviceId] = sample;
        }
      }
      return row;
    });
  }, [summary]);

  const hasData = rows.some((row) => SERVICE_IDS.some((id) => row[id] !== undefined));

  const toggle = (serviceId: ServiceId) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title">
          <LineChartIcon className="h-4 w-4 text-gold-400" />
          Tiempo de respuesta · últimas 20 llamadas por servicio
        </h2>
        <span className="text-xs text-carbon-500">Puntos rojos = llamadas con error · clic en la leyenda para ocultar</span>
      </div>

      <div className="h-72 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#26262d" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="slot"
                stroke="#71717c"
                tickLine={false}
                axisLine={{ stroke: '#34343d' }}
                fontSize={11}
                label={{ value: 'Llamada (1 = más antigua · 20 = más reciente)', position: 'insideBottom', offset: -2, fill: '#71717c', fontSize: 11 }}
                height={36}
              />
              <YAxis stroke="#71717c" tickLine={false} axisLine={false} fontSize={11} width={56} tickFormatter={(value: number) => `${value} ms`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#4a4a55', strokeDasharray: '4 4' }} />
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                onClick={(entry) => toggle(entry.dataKey as ServiceId)}
                formatter={(value: ServiceId) => (
                  <span className={`text-xs ${hidden.has(value) ? 'text-carbon-500 line-through' : 'text-carbon-200'}`}>{SERVICE_META[value].label}</span>
                )}
              />
              {SERVICE_IDS.map((serviceId) => (
                <Line
                  key={serviceId}
                  type="monotone"
                  dataKey={serviceId}
                  name={serviceId}
                  stroke={SERVICE_META[serviceId].color}
                  strokeWidth={2}
                  hide={hidden.has(serviceId)}
                  connectNulls
                  isAnimationActive={false}
                  dot={(props: { cx?: number; cy?: number; payload?: ChartRow; key?: string }) => {
                    const sample = props.payload?.samples[serviceId];
                    if (props.cx === undefined || props.cy === undefined || !sample) {
                      return <g key={props.key} />;
                    }
                    const failed = sample.status === 'ERROR';
                    return (
                      <circle
                        key={props.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={failed ? 4.5 : 2.5}
                        fill={failed ? '#ef4444' : SERVICE_META[serviceId].color}
                        stroke={failed ? '#fecaca' : 'none'}
                        strokeWidth={failed ? 1.5 : 0}
                      />
                    );
                  }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-carbon-700 text-center">
            <p className="text-sm text-carbon-300">Todavía no hay llamadas registradas</p>
            <p className="text-xs text-carbon-500">Pulsa «Simular carga» o envía una petición manual para poblar la gráfica.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ChartRow;

  return (
    <div className="min-w-[15rem] rounded-xl border border-carbon-600 bg-carbon-900/95 p-3 text-xs shadow-2xl backdrop-blur">
      <p className="mb-2 font-medium text-carbon-300">Llamada #{row.slot}</p>
      <ul className="space-y-2">
        {payload.map((item) => {
          const serviceId = item.dataKey as ServiceId;
          const sample = row.samples[serviceId];
          if (!sample) return null;
          return (
            <li key={serviceId} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: SERVICE_META[serviceId].color }} />
              <div className="flex-1">
                <div className="flex justify-between gap-3">
                  <span className="text-carbon-200">{SERVICE_META[serviceId].label}</span>
                  <span className="font-mono font-semibold text-white">{formatMs(sample.durationMs)}</span>
                </div>
                <div className="flex justify-between gap-3 text-carbon-400">
                  <span>{OPERATION_LABELS[sample.operation] ?? sample.operation}</span>
                  <span className={sample.status === 'ERROR' ? 'text-red-400' : 'text-emerald-400'}>
                    {sample.status}
                    {sample.cacheHit ? ' · caché' : ''}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-carbon-500">{formatTime(sample.timestamp)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
