import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { LearningLevel } from '../../data/lessonsData';

/** Contêiner padrão de página: largura máxima, margens laterais e espaço para a barra inferior no celular. */
export const Page: React.FC<{ children: React.ReactNode; width?: 'page' | 'reading'; className?: string }> = ({
  children,
  width = 'page',
  className = ''
}) => (
  <div
    className={`mx-auto w-full px-4 pb-24 pt-6 sm:px-6 md:pb-12 md:pt-8 ${width === 'reading' ? 'max-w-reading' : 'max-w-page'} ${className}`}
  >
    {children}
  </div>
);

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-base text-ink-300">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </header>
);

export const ProgressBar: React.FC<{ value: number; max?: number; label?: string; tone?: 'accent' | 'success' }> = ({
  value,
  max = 100,
  label,
  tone = 'accent'
}) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-ink-800"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tone === 'success' ? 'bg-emerald-500' : 'bg-accent'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

/** Nome exibido do nível. "Profissional" é apresentado como prática de nível profissional (não é certificação). */
export const LEVEL_LABEL: Record<LearningLevel, string> = {
  Iniciante: 'Iniciante',
  Intermediário: 'Intermediário',
  Avançado: 'Avançado',
  Profissional: 'Prática profissional'
};

const LEVEL_STYLE: Record<LearningLevel, string> = {
  Iniciante: 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300',
  Intermediário: 'border-sky-700/60 bg-sky-950/40 text-sky-300',
  Avançado: 'border-amber-700/60 bg-amber-950/40 text-amber-300',
  Profissional: 'border-violet-700/60 bg-violet-950/40 text-violet-300'
};

export const LevelBadge: React.FC<{ level: LearningLevel }> = ({ level }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[level]}`}>
    {LEVEL_LABEL[level]}
  </span>
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Carregando…' }) => (
  <div role="status" className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 text-ink-300">
    <Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden />
    <span className="text-sm">{label}</span>
  </div>
);

export const ErrorState: React.FC<{ title: string; message: string; action?: React.ReactNode }> = ({ title, message, action }) => (
  <div role="alert" className="card mx-auto flex max-w-md flex-col items-start gap-3 p-6">
    <div className="flex items-center gap-2 text-rose-300">
      <AlertTriangle className="h-5 w-5" aria-hidden />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
    <p className="text-sm text-ink-300">{message}</p>
    {action}
  </div>
);

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; message: string; action?: React.ReactNode }> = ({
  icon,
  title,
  message,
  action
}) => (
  <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
    {icon && <div className="mb-1 text-ink-400">{icon}</div>}
    <h3 className="text-base font-semibold text-ink-100">{title}</h3>
    <p className="max-w-sm text-sm text-ink-400">{message}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

/**
 * Diálogo modal: foco preso dentro, Esc fecha e o foco volta para onde estava.
 * O primeiro elemento com data-autofocus (ou o primeiro botão) recebe o foco ao abrir.
 */
export const Dialog: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, title, onClose, children, footer }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const returnTo = document.activeElement as HTMLElement | null;
    (panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>('button, a[href]'))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea'));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      returnTo?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink-800 px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-ink-100">
            {title}
          </h2>
          <button onClick={onClose} className="btn-icon -mr-2 -mt-1" aria-label="Fechar">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-4 text-sm text-ink-300">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-800 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};
