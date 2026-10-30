import { useCallback, useRef, useState } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

const TOAST_LIFETIME_MS = 5_000;
const MAX_VISIBLE = 4;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const sequence = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (tone: ToastTone, title: string, message?: string) => {
      const id = ++sequence.current;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, tone, title, message }]);
      window.setTimeout(() => dismiss(id), TOAST_LIFETIME_MS);
    },
    [dismiss],
  );

  return { toasts, notify, dismiss };
}
