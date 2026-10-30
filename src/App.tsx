import { useCallback, useState } from 'react';
import { api } from './api/endpoints';
import { SERVICE_IDS, type LogFilters } from './api/types';
import { ConnectionBanner } from './components/ConnectionBanner';
import { DashboardHeader } from './components/DashboardHeader';
import { LatencyChart } from './components/LatencyChart';
import { DEFAULT_FILTERS } from './components/LogFiltersBar';
import { LogsTable } from './components/LogsTable';
import { ManualTriggerPanel } from './components/ManualTriggerPanel';
import { ServiceCard } from './components/ServiceCard';
import { ToastStack } from './components/ToastStack';
import { usePolling } from './hooks/usePolling';
import { useToasts } from './hooks/useToasts';
import { formatNumber } from './lib/format';
import { SERVICE_META } from './lib/services';

const POLL_INTERVAL_MS = 3_000;

export default function App() {
  const [live, setLive] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  const { toasts, notify, dismiss } = useToasts();

  const summary = usePolling((signal) => api.summary(signal), POLL_INTERVAL_MS, live, []);
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const logs = usePolling(
    (signal) => (invalidRange ? Promise.resolve(null) : api.logs(filters, signal)),
    POLL_INTERVAL_MS,
    live,
    [filters, invalidRange],
  );

  const { refresh: refreshSummary } = summary;
  const { refresh: refreshLogs } = logs;
  const refreshAll = useCallback(() => {
    void refreshSummary();
    void refreshLogs();
  }, [refreshSummary, refreshLogs]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const report = await api.simulateLoad(50);
      const breakdown = SERVICE_IDS.map((id) => `${SERVICE_META[id].label}: ${report.callsByService[id] ?? 0}`).join(' · ');
      notify(
        report.failed > 0 ? 'info' : 'success',
        `Carga simulada: ${formatNumber(report.requestedCalls)} llamadas en ${formatNumber(report.elapsedMs)} ms`,
        `${formatNumber(report.succeeded)} exitosas, ${formatNumber(report.failed)} con error. ${breakdown}`,
      );
    } catch (error) {
      notify('error', 'No se pudo simular la carga', error instanceof Error ? error.message : undefined);
    } finally {
      setSimulating(false);
      refreshAll();
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Borrar todos los logs y reiniciar las métricas?')) return;
    try {
      await api.resetLogs();
      notify('success', 'Métricas reiniciadas');
    } catch (error) {
      notify('error', 'No se pudieron reiniciar las métricas', error instanceof Error ? error.message : undefined);
    } finally {
      refreshAll();
    }
  };

  const connectionError = summary.error ?? logs.error;

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DashboardHeader
        live={live}
        healthy={!connectionError}
        lastUpdated={summary.lastUpdated}
        simulating={simulating}
        onToggleLive={() => setLive((current) => !current)}
        onSimulate={handleSimulate}
        onReset={handleReset}
      />

      {connectionError && <ConnectionBanner message={connectionError.message} />}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Estado de los servicios">
        {SERVICE_IDS.map((serviceId) => (
          <ServiceCard key={serviceId} serviceId={serviceId} metrics={summary.data?.services[serviceId]} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <LatencyChart summary={summary.data} />
        <ManualTriggerPanel onCallCompleted={refreshAll} notify={notify} />
      </div>

      <LogsTable page={logs.data} loading={logs.loading} filters={filters} onFiltersChange={setFilters} />

      <footer className="pb-2 text-center text-xs text-carbon-500">
        Proyecto académico · Patrón de diseño estructural Proxy · Ingeniería de Software
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
