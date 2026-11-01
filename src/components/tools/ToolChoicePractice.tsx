import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { MECHANICAL_TOOLS_CATALOG, TOOL_SELECTION_SCENARIOS } from '../../data/mechanicalToolsData';
import { ProgressBar } from '../ui';
import { ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react';

const scenarioTask = (id: string) => `task-tool-scenario-${id}`;

/** Situações de oficina: o aluno escolhe a ferramenta certa e recebe a explicação. Pode tentar quantas vezes quiser. */
export const ToolChoicePractice: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { playerProfile, completeTask } = useGameState();
  const doneIds = TOOL_SELECTION_SCENARIOS.filter((s) => playerProfile.completedTasks.includes(scenarioTask(s.id))).map((s) => s.id);
  const [idx, setIdx] = useState(() => {
    const firstOpen = TOOL_SELECTION_SCENARIOS.findIndex((s) => !doneIds.includes(s.id));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [chosen, setChosen] = useState<string | null>(null);
  const scenario = TOOL_SELECTION_SCENARIOS[idx];
  const acceptable = chosen !== null && chosen !== scenario.correctToolId && Boolean(scenario.alsoAcceptable?.[chosen]);
  // "Também resolve" conta como resolvido: a explicação mostra qual seria a primeira escolha.
  const correct = chosen === scenario.correctToolId || acceptable;
  const bestName = MECHANICAL_TOOLS_CATALOG.find((t) => t.id === scenario.correctToolId)?.name;

  const choose = (toolId: string) => {
    setChosen(toolId);
    if (toolId !== scenario.correctToolId && !scenario.alsoAcceptable?.[toolId]) return;
    completeTask(scenarioTask(scenario.id), scenario.title.replace(/^Desafio \d+:\s*/, ''), 20);
    const willBeDone = new Set([...doneIds, scenario.id]);
    if (willBeDone.size === TOOL_SELECTION_SCENARIOS.length) {
      completeTask('task-tools-workshop-complete', 'Todas as situações de escolha de ferramenta', 40);
    }
  };

  const goTo = (i: number) => {
    setIdx(i);
    setChosen(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Situações" className="flex flex-wrap gap-1.5">
          {TOOL_SELECTION_SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-current={i === idx ? 'step' : undefined}
              aria-label={`Situação ${i + 1}${doneIds.includes(s.id) ? ' (resolvida)' : ''}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold ${
                i === idx
                  ? 'border-accent bg-accent-soft text-ink-100'
                  : doneIds.includes(s.id)
                  ? 'border-emerald-800 text-emerald-300'
                  : 'border-ink-700 text-ink-400 hover:text-ink-100'
              }`}
            >
              {doneIds.includes(s.id) && i !== idx ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
            </button>
          ))}
        </nav>
        <div className="w-48">
          <p className="mb-1 text-xs text-ink-400">
            {doneIds.length} de {TOOL_SELECTION_SCENARIOS.length} resolvidas
          </p>
          <ProgressBar value={doneIds.length} max={TOOL_SELECTION_SCENARIOS.length} label="Situações resolvidas" />
        </div>
      </div>

      <section className="card space-y-4 p-5" aria-labelledby="scenario-title">
        <div>
          <p className="eyebrow">
            Situação {idx + 1} de {TOOL_SELECTION_SCENARIOS.length} · {scenario.machineContext}
          </p>
          <h2 id="scenario-title" className="mt-1 text-lg font-semibold text-ink-100">
            {scenario.title.replace(/^Desafio \d+:\s*/, '')}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-ink-200">{scenario.taskDescription}</p>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-200">Qual ferramenta você pega?</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MECHANICAL_TOOLS_CATALOG.map((tool) => {
              const isPicked = chosen === tool.id;
              const style =
                isPicked && correct
                  ? 'border-emerald-600 bg-emerald-950/50 text-emerald-100'
                  : isPicked
                  ? 'border-amber-600 bg-amber-950/40 text-amber-100'
                  : 'border-ink-700 bg-ink-950 text-ink-200 hover:border-ink-500';
              return (
                <button
                  key={tool.id}
                  onClick={() => choose(tool.id)}
                  disabled={correct}
                  aria-pressed={isPicked}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium disabled:cursor-default ${style}`}
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {chosen && (
          <div
            role="status"
            className={`space-y-2 rounded-lg border p-4 text-sm ${correct ? 'border-emerald-800/60 bg-emerald-950/30' : 'border-amber-800/60 bg-amber-950/20'}`}
          >
            <p className="font-semibold text-ink-100">
              {acceptable ? 'Também resolve.' : correct ? 'Boa escolha!' : 'Essa não é a melhor para esta tarefa.'}
            </p>
            <p className="leading-relaxed text-ink-200">
              {acceptable
                ? scenario.alsoAcceptable![chosen]
                : correct
                ? scenario.successExplanation
                : scenario.wrongToolFeedback[chosen] || 'Pense no que a tarefa exige e tente outra.'}
            </p>
            {acceptable && (
              <p className="leading-relaxed text-ink-300">
                <span className="font-semibold text-ink-200">Primeira escolha: {bestName}. </span>
                {scenario.successExplanation}
              </p>
            )}
            {!correct && (
              <p className="flex items-start gap-2 text-ink-300">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {scenario.hint}
              </p>
            )}
            {correct && (
              <div className="pt-1">
                {idx + 1 < TOOL_SELECTION_SCENARIOS.length ? (
                  <button onClick={() => goTo(idx + 1)} className="btn-primary">
                    Próxima situação
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <button onClick={onFinish} className="btn-primary">
                    Treinar leitura do paquímetro
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
