import type { CallStatus } from '../api/types';

export function StatusBadge({ status }: { status: CallStatus }) {
  const success = status === 'SUCCESS';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold ${
        success ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/40 bg-red-500/15 text-red-300'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${success ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {status}
    </span>
  );
}
