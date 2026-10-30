import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { prettyJson } from '../lib/format';

interface JsonBlockProps {
  title: string;
  raw: string | null | undefined;
  tone?: 'neutral' | 'danger';
  /** Plain text (e.g. a stack trace) is shown verbatim instead of being parsed as JSON. */
  plain?: boolean;
}

export function JsonBlock({ title, raw, tone = 'neutral', plain = false }: JsonBlockProps) {
  const [copied, setCopied] = useState(false);
  const content = plain ? raw ?? '—' : prettyJson(raw);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl border ${tone === 'danger' ? 'border-red-500/40' : 'border-carbon-700'}`}>
      <div
        className={`flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${
          tone === 'danger' ? 'bg-red-500/10 text-red-300' : 'bg-carbon-800 text-carbon-300'
        }`}
      >
        {title}
        <button type="button" onClick={copy} className="flex items-center gap-1 normal-case tracking-normal text-carbon-400 transition hover:text-white">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="scrollbar-thin max-h-80 overflow-auto bg-carbon-950/80 p-3 font-mono text-[12px] leading-relaxed text-carbon-200">
        {content}
      </pre>
    </div>
  );
}
