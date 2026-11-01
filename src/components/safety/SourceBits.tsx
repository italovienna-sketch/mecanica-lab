import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { CLAIM_LABEL, ClaimKind, NOT_A_QUALIFICATION, REG_SOURCES, RegRef, SourceId, VERIFIED_ON, formatRef } from '../../data/regulatorySources';

const CLAIM_STYLE: Record<ClaimKind, string> = {
  requisito: 'border-sky-700/60 bg-sky-950/40 text-sky-200',
  'boa-pratica': 'border-emerald-700/60 bg-emerald-950/30 text-emerald-200',
  simplificado: 'border-ink-600 bg-ink-800 text-ink-300'
};

/** Selo que diz se a afirmação é requisito de NR, boa prática ou cenário simplificado. */
export const ClaimBadge: React.FC<{ kind: ClaimKind }> = ({ kind }) => (
  <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${CLAIM_STYLE[kind]}`}>{CLAIM_LABEL[kind]}</span>
);

/** Referência a um item de NR, com link para o texto oficial. */
export const RefLink: React.FC<{ r: RegRef }> = ({ r }) => (
  <a
    href={REG_SOURCES[r.source].pdfUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-xs font-medium text-accent-text hover:underline"
  >
    {formatRef(r)}
    <ExternalLink className="h-3 w-3" aria-hidden />
    <span className="sr-only">(abre o texto oficial em nova aba)</span>
  </a>
);

/** Lista as fontes oficiais usadas, com a data da verificação. */
export const SourcesFooter: React.FC<{ ids: SourceId[]; className?: string }> = ({ ids, className = '' }) => {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) return null;
  return (
    <section className={`rounded-xl border border-ink-800 bg-ink-900 p-4 text-sm ${className}`} aria-label="Fontes oficiais">
      <h3 className="flex items-center gap-2 font-semibold text-ink-100">
        <ShieldCheck className="h-4 w-4 text-sky-300" aria-hidden /> Fontes oficiais (verificadas em {VERIFIED_ON})
      </h3>
      <ul className="mt-2 space-y-1.5 text-ink-300">
        {unique.map((id) => {
          const s = REG_SOURCES[id];
          return (
            <li key={id}>
              <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-text hover:underline">
                {s.short} — {s.title}
              </a>{' '}
              <span className="text-ink-400">· última alteração: {s.lastChange}</span>
              {s.note && <p className="mt-0.5 text-xs text-ink-400">{s.note}</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-ink-500">
        Itens conferidos no texto publicado pelo Ministério do Trabalho e Emprego (gov.br). Os próprios arquivos avisam que não substituem o publicado no Diário
        Oficial da União. Textos explicativos aqui são resumos, não citações literais, salvo quando indicado.
      </p>
    </section>
  );
};

export const NotQualificationNote: React.FC<{ className?: string }> = ({ className = '' }) => (
  <p className={`rounded-lg border border-amber-800/50 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100/90 ${className}`}>{NOT_A_QUALIFICATION}</p>
);
