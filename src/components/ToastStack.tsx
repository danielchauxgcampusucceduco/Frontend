import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { Toast } from '../hooks/useToasts';

const TONE_STYLES = {
  success: { icon: CheckCircle2, className: 'border-emerald-500/40 text-emerald-300' },
  error: { icon: XCircle, className: 'border-red-500/40 text-red-300' },
  info: { icon: Info, className: 'border-gold-500/40 text-gold-300' },
} as const;

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => {
        const { icon: Icon, className } = TONE_STYLES[toast.tone];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-carbon-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur ${className}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-carbon-200">{toast.title}</p>
              {toast.message && <p className="mt-0.5 break-words text-xs text-carbon-400">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-carbon-500 transition hover:text-carbon-200"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
