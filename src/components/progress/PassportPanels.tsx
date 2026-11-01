import React, { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Compass, Download, ShieldCheck, Stethoscope, Trash2, Upload, XCircle } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { COMPETENCIES, CompetencyLevel, LEVEL_TEXT, competencyProgress } from '../../data/competencies';
import { DIAGNOSIS_CASES_META } from '../../data/diagnosis/meta';
import { buildExport } from '../../data/profileStorage';
import type { PlayerProfile } from '../../types/game';
import { Dialog, ProgressBar } from '../ui';

/** Painéis do Passaporte de competências (Meu progresso). */

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const LEVEL_BADGE: Record<CompetencyLevel, string> = {
  'nao-iniciada': 'badge-neutral',
  praticada: 'badge-info',
  'em-desenvolvimento': 'badge-warning',
  demonstrada: 'badge-success'
};

type CompRow = ReturnType<typeof competencyProgress> & { c: (typeof COMPETENCIES)[number] };

/** Visão geral + próxima atividade: continua o que está em andamento; senão, começa a primeira não iniciada. */
export const PassportOverview: React.FC<{ rows: CompRow[] }> = ({ rows }) => {
  const { navigateTo } = useGameState();
  const demonstrated = rows.filter((r) => r.level === 'demonstrada').length;
  const reqDone = rows.reduce((a, r) => a + r.done, 0);
  const reqTotal = rows.reduce((a, r) => a + r.total, 0);
  const next =
    rows.find((r) => r.level === 'em-desenvolvimento') ?? rows.find((r) => r.level === 'praticada') ?? rows.find((r) => r.level === 'nao-iniciada');
  const nextItem = next?.items.find((i) => i.done < i.total);

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-5">
      <section className="card p-5 lg:col-span-2" aria-labelledby="pp-geral">
        <h2 id="pp-geral" className="section-title">
          Visão geral
        </h2>
        <p className="mt-2 text-3xl font-bold text-ink-100">
          {demonstrated} <span className="text-base font-medium text-ink-400">de {rows.length} competências demonstradas</span>
        </p>
        <div className="mt-3">
          <ProgressBar value={reqDone} max={reqTotal} label="Requisitos cumpridos em todas as competências" tone="success" />
          <p className="mt-1 text-xs text-ink-500">
            {reqDone} de {reqTotal} requisitos cumpridos
          </p>
        </div>
      </section>
      <section className="card flex flex-col p-5 lg:col-span-3" aria-labelledby="pp-prox">
        <h2 id="pp-prox" className="flex items-center gap-2 section-title">
          <Compass className="h-4 w-4 text-accent" aria-hidden /> Próxima atividade recomendada
        </h2>
        {next ? (
          <>
            <p className="mt-2 font-medium text-ink-100">{next.c.title}</p>
            <p className="text-sm text-ink-400">
              {nextItem ? `Falta: ${nextItem.req.label} (${nextItem.done}/${nextItem.total}).` : next.c.evidence}
            </p>
            <button className="btn-primary mt-auto self-start pt-2.5" onClick={() => navigateTo(next.c.start.screen, next.c.start.param)}>
              {next.level === 'nao-iniciada' ? 'Começar' : 'Continuar'} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : (
          <p className="mt-2 text-sm text-emerald-300">Todas as competências foram demonstradas nos exercícios. Revise quando quiser.</p>
        )}
      </section>
    </div>
  );
};

export const LevelLegend: React.FC = () => (
  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
    {(Object.keys(LEVEL_TEXT) as CompetencyLevel[]).map((k) => (
      <div key={k} className="flex items-start gap-2">
        <dt className={`${LEVEL_BADGE[k]} shrink-0`}>{LEVEL_TEXT[k].label}</dt>
        <dd className="text-ink-400">{LEVEL_TEXT[k].rule}</dd>
      </div>
    ))}
  </dl>
);

/** Resultados da Oficina de Diagnóstico: melhor e última nota por caso, decisões de segurança e tentativas recentes. */
export const DiagnosisResults: React.FC<{ p: PlayerProfile }> = ({ p }) => {
  const { navigateTo } = useGameState();
  const runs = p.diagnosisRuns;
  const safeRuns = runs.filter((r) => r.unsafeChoices === 0).length;
  const title = (id: string) => DIAGNOSIS_CASES_META.find((c) => c.id === id)?.title ?? id;

  return (
    <section className="card p-5" aria-labelledby="pg-diag">
      <h2 id="pg-diag" className="flex items-center gap-2 text-base font-semibold text-ink-100">
        <Stethoscope className="h-4 w-4 text-accent" aria-hidden /> Oficina de Diagnóstico
      </h2>
      {runs.length === 0 ? (
        <p className="mt-2 text-sm text-ink-400">
          Nenhum caso tentado ainda.{' '}
          <button className="link" onClick={() => navigateTo('diagnosis')}>
            Abrir a Oficina de Diagnóstico
          </button>
        </p>
      ) : (
        <>
          <table className="mt-3 w-full text-left text-sm">
            <caption className="sr-only">Resultado por caso</caption>
            <thead className="text-xs text-ink-400">
              <tr>
                <th scope="col" className="pb-1 font-medium">
                  Caso
                </th>
                <th scope="col" className="pb-1 text-right font-medium">
                  Melhor
                </th>
                <th scope="col" className="pb-1 text-right font-medium">
                  Última
                </th>
              </tr>
            </thead>
            <tbody>
              {DIAGNOSIS_CASES_META.map((c) => {
                const mine = runs.filter((r) => r.caseId === c.id);
                const last = mine[mine.length - 1];
                const passed = mine.some((r) => r.passed);
                return (
                  <tr key={c.id} className="border-t border-ink-800">
                    <th scope="row" className="py-2 pr-2 font-normal text-ink-200">
                      <span className="flex items-center gap-2">
                        {passed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-label="Concluído" /> : <span className="w-4" />}
                        {c.title}
                      </span>
                    </th>
                    <td className="py-2 text-right font-mono text-ink-100">{mine.length ? Math.max(...mine.map((r) => r.score)) : '—'}</td>
                    <td className="py-2 text-right font-mono text-ink-300">{last ? last.score : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            Decisões de segurança: {safeRuns} de {runs.length} tentativa(s) sem nenhuma escolha insegura.
          </p>
          <h3 className="mt-4 text-sm font-semibold text-ink-200">Tentativas recentes</h3>
          <ul className="mt-1 divide-y divide-ink-800">
            {[...runs]
              .reverse()
              .slice(0, 5)
              .map((r, i) => (
                <li key={`${r.caseId}-${r.at}-${i}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate text-ink-200">{title(r.caseId)}</span>
                    <span className="block text-xs text-ink-500">
                      {dateFmt.format(r.at)} · {r.testsUsed} teste(s){r.hintsUsed ? ` · ${r.hintsUsed} dica(s)` : ''}
                      {r.unsafeChoices ? ` · ${r.unsafeChoices} escolha(s) insegura(s)` : ''}
                    </span>
                  </span>
                  <span className={`flex shrink-0 items-center gap-1 font-mono ${r.passed ? 'text-emerald-300' : 'text-ink-300'}`}>
                    {r.passed ? <CheckCircle2 className="h-4 w-4" aria-label="concluído" /> : <XCircle className="h-4 w-4" aria-label="não concluído" />}
                    {r.score}
                  </span>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
};

/** Exportar, importar e apagar o progresso deste navegador. */
export const DataPanel: React.FC = () => {
  const { playerProfile, importProgress, resetLearningProgress } = useGameState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportFile = () => {
    const data = JSON.stringify(buildExport(playerProfile), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `mecanica-lab-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    const text = await file.text();
    const check = importProgress(text, false);
    if (check.ok) setPending(text);
    else setError(check.error);
  };

  const confirmImport = () => {
    if (pending === null) return;
    const res = importProgress(pending);
    setPending(null);
    if (!res.ok) setError(res.error);
  };

  return (
    <section className="card p-5" aria-labelledby="pg-dados">
      <h2 id="pg-dados" className="text-base font-semibold text-ink-100">
        Seus dados
      </h2>
      <p className="mt-1 text-sm text-ink-400">
        O progresso fica só neste navegador. Exporte um arquivo para levar a outro computador ou guardar uma cópia. É um registro de estudo, não é nota oficial
        nem certificação.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-secondary btn-sm" onClick={exportFile}>
          <Download className="h-4 w-4" aria-hidden /> Exportar progresso (JSON)
        </button>
        <button className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" aria-hidden /> Importar progresso
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={onFile} data-testid="import-file" />
        <button className="btn-ghost btn-sm text-rose-300" onClick={() => setConfirmReset(true)}>
          <Trash2 className="h-4 w-4" aria-hidden /> Apagar progresso
        </button>
      </div>
      {error && (
        <p role="alert" className="field-error">
          Não foi possível importar: {error}
        </p>
      )}

      <Dialog
        open={pending !== null}
        title="Substituir o progresso?"
        onClose={() => setPending(null)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setPending(null)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={confirmImport}>
              Substituir
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-300">O progresso deste navegador será trocado pelo do arquivo. Se quiser guardar o atual, exporte antes.</p>
      </Dialog>

      <Dialog
        open={confirmReset}
        title="Apagar o progresso?"
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                resetLearningProgress();
                setConfirmReset(false);
              }}
            >
              Apagar
            </button>
          </>
        }
      >
        <p className="text-sm text-ink-300">Aulas, desafios, casos e competências voltam ao início. O nome e o personagem continuam.</p>
      </Dialog>
    </section>
  );
};
