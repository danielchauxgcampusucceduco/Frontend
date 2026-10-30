import { formatTime } from '../lib/format';

interface LiveIndicatorProps {
  live: boolean;
  healthy: boolean;
  lastUpdated: Date | null;
}

export function LiveIndicator({ live, healthy, lastUpdated }: LiveIndicatorProps) {
  const color = !healthy ? 'bg-red-500' : live ? 'bg-emerald-400' : 'bg-carbon-500';
  const label = !healthy ? 'Sin conexión' : live ? 'En vivo · 3s' : 'En pausa';

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-carbon-700 bg-carbon-850 px-3 py-1.5">
      <span className="relative flex h-2.5 w-2.5">
        {live && healthy && <span className={`absolute inline-flex h-full w-full rounded-full ${color} animate-pulse-ring`} />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
      </span>
      <span className="text-xs font-medium text-carbon-200">{label}</span>
      {lastUpdated && (
        <span className="hidden font-mono text-[11px] text-carbon-400 sm:inline">act. {formatTime(lastUpdated)}</span>
      )}
    </div>
  );
}
