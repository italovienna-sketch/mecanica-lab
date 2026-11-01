import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { LIBRARY_CATEGORIES, LIBRARY_ENTRIES, LibraryEntry } from '../../data/library';
import { EmptyState, Page, PageHeader } from '../ui';

const Detail: React.FC<{ entry: LibraryEntry }> = ({ entry }) => {
  const { navigateTo } = useGameState();
  return (
    <Page width="reading">
      <button className="link mb-3" onClick={() => navigateTo('library')}>
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Biblioteca
      </button>
      <PageHeader eyebrow={entry.category} title={entry.name} description={entry.summary} />
      <div className="mb-5 flex flex-wrap gap-2">
        {entry.actions.map((a) => (
          <button key={a.label} className={a.primary ? 'btn-primary' : 'btn-secondary'} onClick={() => navigateTo(a.screen, a.param)}>
            {a.label} {a.primary && <ArrowRight className="h-4 w-4" aria-hidden />}
          </button>
        ))}
      </div>
      {entry.safety.length > 0 && (
        <section aria-labelledby="seguranca-item" className="notice-warning mb-5 block">
          <h2 id="seguranca-item" className="mb-1 font-semibold">Antes de mexer</h2>
          <ul className="list-disc space-y-1 pl-5">
            {entry.safety.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="pecas-item">
        <h2 id="pecas-item" className="section-title mb-2">Peças</h2>
        <dl className="divide-y divide-ink-800">
          {entry.parts.map((p) => (
            <div key={p.name} className="py-2">
              <dt className="font-medium text-ink-100">{p.name}</dt>
              <dd className="text-sm leading-relaxed text-ink-300">{p.fn}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="mt-4 text-xs text-ink-400">{entry.note}</p>
    </Page>
  );
};

/** Biblioteca de equipamentos: cada ficha leva a uma atividade, não a um arquivo. */
export const LibraryPage: React.FC = () => {
  const { activeParam, navigateTo } = useGameState();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const entry = LIBRARY_ENTRIES.find((e) => e.id === activeParam);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIBRARY_ENTRIES.filter(
      (e) => (!category || e.category === category) && (!q || e.name.toLowerCase().includes(q) || e.parts.some((p) => p.name.toLowerCase().includes(q)))
    );
  }, [query, category]);

  if (entry) return <Detail entry={entry} />;

  return (
    <Page>
      <PageHeader title="Biblioteca de equipamentos" description="Cada equipamento tem peças, cuidados e o que fazer com ele no app. Procure por máquina ou por peça." />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block sm:w-72 sm:shrink-0">
          <span className="sr-only">Buscar equipamento ou peça</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input className="input pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: rolamento" />
        </label>
        <div className="segmented min-w-0 max-w-full overflow-x-auto" role="group" aria-label="Filtrar por categoria">
          <button aria-pressed={category === null} onClick={() => setCategory(null)}>Todos</button>
          {LIBRARY_CATEGORIES.map((c) => (
            <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>
      {list.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <li key={e.id}>
              <button onClick={() => navigateTo('library', e.id)} data-entry={e.id} className="card-interactive flex h-full w-full flex-col items-start p-4 text-left">
                <span className="text-xs text-ink-400">{e.category}</span>
                <span className="mt-0.5 font-semibold text-ink-100">{e.name}</span>
                <span className="mt-1 line-clamp-3 text-sm leading-snug text-ink-300">{e.summary}</span>
                <span className="mt-2 text-xs text-ink-400">{e.parts.length} peças · {e.actions.length} {e.actions.length === 1 ? 'atividade' : 'atividades'}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Nada encontrado" message="Tente outro nome de equipamento ou de peça." action={<button className="btn-secondary" onClick={() => { setQuery(''); setCategory(null); }}>Limpar a busca</button>} />
      )}
    </Page>
  );
};
