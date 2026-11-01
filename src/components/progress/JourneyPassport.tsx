import React from 'react';
import { Check, ClipboardList, Printer } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { CRITERIA, CRITERION_LABEL } from '../../data/journey/meta';
import { MISSIONS, missionProgress } from '../../data/journey/missions';
import { COMPETENCIES, competencyProgress } from '../../data/competencies';
import { masteredQuestionIds } from '../../data/learningPaths';

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

/** Jornada no Passaporte: cada linha mostra a evidência, não uma nota solta. */
export const JourneyPassport: React.FC = () => {
  const { playerProfile: p, navigateTo } = useGameState();
  const runs = p.journey.assessmentRuns;
  const best = [...runs].reverse().find((r) => r.passed) ?? runs[runs.length - 1];
  const bench = p.journey.benchRuns[p.journey.benchRuns.length - 1];
  const startup = p.journey.startupRuns[p.journey.startupRuns.length - 1];
  const mastered = masteredQuestionIds(p);
  const demonstrated = COMPETENCIES.filter((c) => competencyProgress(c, p, mastered).completed);

  return (
    <section className="card mb-4 p-5" aria-labelledby="pg-jornada" id="registro">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="pg-jornada" className="flex items-center gap-2 text-base font-semibold text-ink-100">
          <ClipboardList className="h-[18px] w-[18px] text-accent-text" aria-hidden /> Jornada da bomba P-101
        </h2>
        <button className="btn-secondary btn-sm no-print" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden /> Imprimir registro
        </button>
      </div>
      <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {MISSIONS.map((m) => {
          const prog = missionProgress(m, p);
          const at = p.journey.missions[m.id]?.completedAt;
          return (
            <li key={m.id} className="flex items-baseline gap-2 text-sm">
              {prog.complete ? <Check className="h-4 w-4 shrink-0 self-center text-emerald-400" aria-label="Concluída" /> : <span className="w-4 shrink-0 text-center text-ink-500" aria-hidden>·</span>}
              <button className="link text-left" onClick={() => navigateTo('missions', m.id)}>{m.code}: {m.title}</button>
              <span className="ml-auto shrink-0 font-mono text-xs text-ink-400">{at ? dateFmt.format(at) : `${prog.done}/${prog.total}`}</span>
            </li>
          );
        })}
      </ul>
      {(bench || startup) && (
        <p className="mt-3 text-sm text-ink-300">
          {bench && `Bancada: ${bench.findingsFirstTry} de ${bench.findingsTotal} peças lidas de primeira. `}
          {startup && `Última partida: ${startup.correctCall ? 'decisão coerente com os instrumentos' : 'decisão contrária aos instrumentos'}.`}
        </p>
      )}
      {best && (
        <div className="mt-3 border-t border-ink-800 pt-3">
          <p className="text-sm font-medium text-ink-200">
            Avaliação prática: {best.passed ? 'aprovada' : 'não aprovada'} em {dateFmt.format(best.at)} · {runs.length} {runs.length === 1 ? 'tentativa' : 'tentativas'}
          </p>
          <dl className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CRITERIA.map((k) => (
              <div key={k}>
                <dt className="text-xs text-ink-400">{CRITERION_LABEL[k]}</dt>
                <dd className="font-mono font-semibold text-ink-100">{best.criteria[k]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {demonstrated.length > 0 && (
        <p className="mt-3 text-sm text-ink-300">
          <span className="font-medium text-ink-200">Competências demonstradas nos exercícios: </span>
          {demonstrated.map((c) => c.title).join('; ')}.
        </p>
      )}
      <p className="mt-3 text-xs text-ink-400">Registro de estudo gerado neste navegador. Não é certificado, não substitui a capacitação exigida por NR e não comprova habilitação profissional.</p>
    </section>
  );
};
