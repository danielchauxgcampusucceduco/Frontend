const numberFormat = new Intl.NumberFormat('es-CO');
const percentFormat = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateTimeFormat = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});
const timeFormat = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export const formatNumber = (value: number) => numberFormat.format(value);
export const formatPercent = (value: number) => `${percentFormat.format(value)} %`;
export const formatMs = (value: number) => `${numberFormat.format(Math.round(value))} ms`;
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
export const formatTime = (iso: string | Date) => timeFormat.format(typeof iso === 'string' ? new Date(iso) : iso);

export function shortId(requestId: string): string {
  return requestId.slice(0, 8);
}

/**
 * The backend stores payloads as JSON strings. Pretty-print them, but never throw on a payload
 * that was truncated or is not JSON: show it raw instead.
 */
export function prettyJson(raw: string | null | undefined): string {
  if (!raw) return '—';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
