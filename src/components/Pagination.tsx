import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatNumber } from '../lib/format';

interface PaginationProps {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, size, totalPages, totalElements, onPageChange }: PaginationProps) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const lastPage = Math.max(totalPages - 1, 0);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-carbon-700/70 pt-4 text-sm sm:flex-row">
      <p className="text-carbon-400">
        Mostrando <span className="font-mono text-carbon-200">{formatNumber(from)}–{formatNumber(to)}</span> de{' '}
        <span className="font-mono text-carbon-200">{formatNumber(totalElements)}</span> registros
      </p>
      <div className="flex items-center gap-1">
        <PageButton label="Primera página" disabled={page === 0} onClick={() => onPageChange(0)}>
          <ChevronsLeft className="h-4 w-4" />
        </PageButton>
        <PageButton label="Página anterior" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </PageButton>
        <span className="px-3 font-mono text-xs text-carbon-300">
          Página {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </span>
        <PageButton label="Página siguiente" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </PageButton>
        <PageButton label="Última página" disabled={page >= lastPage} onClick={() => onPageChange(lastPage)}>
          <ChevronsRight className="h-4 w-4" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-carbon-700 bg-carbon-850 text-carbon-300 transition hover:border-carbon-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
