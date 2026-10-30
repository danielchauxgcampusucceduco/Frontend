import { WifiOff } from 'lucide-react';
import { API_URL } from '../api/client';

export function ConnectionBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div>
        <p className="font-medium text-red-200">No hay comunicación con el backend</p>
        <p className="mt-0.5 text-carbon-300">
          {message}. Verifica que la API esté en ejecución en <span className="font-mono text-carbon-200">{API_URL}</span> y que su CORS
          permita este dominio. Se reintentará automáticamente.
        </p>
      </div>
    </div>
  );
}
