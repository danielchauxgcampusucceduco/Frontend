import { Activity, Loader2, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { API_URL } from '../api/client';
import { LiveIndicator } from './LiveIndicator';

interface DashboardHeaderProps {
  live: boolean;
  healthy: boolean;
  lastUpdated: Date | null;
  simulating: boolean;
  onToggleLive: () => void;
  onSimulate: () => void;
  onReset: () => void;
}

export function DashboardHeader({ live, healthy, lastUpdated, simulating, onToggleLive, onSimulate, onReset }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-gold-400">
          <Activity className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Patrón Proxy · Auditoría y logging</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Monitoreo de microservicios</h1>
        <p className="mt-1 text-sm text-carbon-400">
          Cada llamada atraviesa un <span className="text-carbon-200">LoggingProxy</span> que la audita, la controla y la mide.
          <span className="ml-1 hidden font-mono text-xs text-carbon-500 md:inline">API: {API_URL.replace(/^https?:\/\//, '')}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LiveIndicator live={live} healthy={healthy} lastUpdated={lastUpdated} />
        <button type="button" className="btn-ghost" onClick={onToggleLive} title={live ? 'Pausar actualización automática' : 'Reanudar actualización automática'}>
          {live ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {live ? 'Pausar' : 'Reanudar'}
        </button>
        <button type="button" className="btn-ghost" onClick={onReset} title="Borrar logs y reiniciar métricas">
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </button>
        <button type="button" className="btn-primary" onClick={onSimulate} disabled={simulating}>
          {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {simulating ? 'Simulando…' : 'Simular carga'}
        </button>
      </div>
    </header>
  );
}
