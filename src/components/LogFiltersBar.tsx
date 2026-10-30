import { FilterX } from 'lucide-react';
import { SERVICE_IDS, type CallStatus, type LogFilters, type ServiceId } from '../api/types';
import { SERVICE_META } from '../lib/services';

export const DEFAULT_FILTERS: LogFilters = { service: 'ALL', status: 'ALL', from: '', to: '', page: 0, size: 20 };

interface LogFiltersBarProps {
  filters: LogFilters;
  onChange: (filters: LogFilters) => void;
}

export function LogFiltersBar({ filters, onChange }: LogFiltersBarProps) {
  // Any criterion change sends the user back to the first page; otherwise a narrower filter
  // could leave them on a page that no longer exists.
  const update = (patch: Partial<LogFilters>) => onChange({ ...filters, ...patch, page: 0 });
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const dirty = filters.service !== 'ALL' || filters.status !== 'ALL' || filters.from !== '' || filters.to !== '';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto] lg:items-end">
      <Field label="Servicio">
        <select className="field" value={filters.service} onChange={(event) => update({ service: event.target.value as ServiceId | 'ALL' })}>
          <option value="ALL">TODOS</option>
          {SERVICE_IDS.map((id) => (
            <option key={id} value={id}>
              {id} · {SERVICE_META[id].label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Estado">
        <select className="field" value={filters.status} onChange={(event) => update({ status: event.target.value as CallStatus | 'ALL' })}>
          <option value="ALL">TODOS</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="ERROR">ERROR</option>
        </select>
      </Field>

      <Field label="Desde">
        <input
          type="datetime-local"
          step={1}
          className={`field ${invalidRange ? 'border-red-500/70' : ''}`}
          value={filters.from}
          max={filters.to || undefined}
          onChange={(event) => update({ from: event.target.value })}
        />
      </Field>

      <Field label="Hasta">
        <input
          type="datetime-local"
          step={1}
          className={`field ${invalidRange ? 'border-red-500/70' : ''}`}
          value={filters.to}
          min={filters.from || undefined}
          onChange={(event) => update({ to: event.target.value })}
        />
      </Field>

      <Field label="Por página">
        <select className="field lg:w-24" value={filters.size} onChange={(event) => update({ size: Number(event.target.value) })}>
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </Field>

      <button type="button" className="btn-ghost h-[38px]" onClick={() => onChange(DEFAULT_FILTERS)} disabled={!dirty}>
        <FilterX className="h-4 w-4" />
        Limpiar
      </button>

      {invalidRange && (
        <p className="text-xs text-red-400 sm:col-span-2 lg:col-span-6">La fecha «Desde» no puede ser posterior a «Hasta».</p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-carbon-400">{label}</span>
      {children}
    </label>
  );
}
