import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileSearch,
  Lightbulb,
  ListChecks,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  XCircle
} from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { CATEGORY_LABEL, DIAGNOSIS_CASES, DIAGNOSIS_CASES_BY_ID, DiagTest, DiagnosisCase, TestCategory } from '../../data/diagnosis/cases';
import { DIAGNOSIS_GAME_ID, PASS_SCORE } from '../../data/diagnosis/meta';
import { ACTION_KIND_LABEL, Attempt, CaseResult, HINT_COST, MAX_HINTS, WEIGHTS, performedTests, runTest, scoreCase } from '../../data/diagnosis/scoring';
import { EmptyState, Page, PageHeader } from '../ui';

/**
 * Oficina de Diagnóstico: ordem de serviço → investigação (o aluno escolhe os testes) → causa provável com
 * evidências → próxima ação → relatório. Sem cronômetro. Dados em src/data/diagnosis/, pontuação em scoring.ts.
 */

export const DiagnosisPage: React.FC = () => {
  const { activeParam, navigateTo } = useGameState();
  if (!activeParam) return <Hub />;
  const c = DIAGNOSIS_CASES_BY_ID[activeParam];
  if (!c) {
    return (
      <Page>
        <EmptyState
          title="Caso não encontrado"
          message="Este caso não existe ou mudou de nome."
          action={
            <button className="btn-primary" onClick={() => navigateTo('diagnosis')}>
              Ver os casos
            </button>
          }
        />
      </Page>
    );
  }
  return <CaseRunner key={c.id} c={c} />;
};

/* ───────────── Lista de casos ───────────── */

const HOW_IT_WORKS = [
  { icon: ClipboardList, title: 'Leia a ordem de serviço', text: 'Sintomas, contexto e o que já se sabe.' },
  { icon: FileSearch, title: 'Escolha os testes', text: 'Cada teste revela um resultado. Pense antes: alguns são inseguros ou desnecessários.' },
  { icon: Compass, title: 'Indique a causa provável', text: 'E marque quais resultados sustentam a sua hipótese.' },
  { icon: ListChecks, title: 'Escolha a próxima ação', text: 'Corrigir com segurança e confirmar o resultado.' },
  { icon: Stethoscope, title: 'Leia o relatório', text: 'Nota explicada parcela por parcela, o que faltou e o que revisar.' }
];

const Hub: React.FC = () => {
  const { playerProfile, navigateTo } = useGameState();
  const rounds = playerProfile.gameResults[DIAGNOSIS_GAME_ID]?.rounds ?? {};
  const firstTime = playerProfile.diagnosisRuns.length === 0;

  return (
    <Page>
      <PageHeader
        eyebrow="Praticar"
        title="Oficina de Diagnóstico"
        description="Ordens de serviço simuladas de uma planta-escola fictícia. Investigue, levante a causa provável com base nas evidências e decida a próxima ação com segurança."
      />

      <section className="card mb-6 p-5" aria-labelledby="h-como">
        <h2 id="h-como" className="section-title">
          Como funciona
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((s, i) => (
            <li key={s.title} className="flex gap-3 lg:flex-col lg:gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-semibold text-accent-text">
                {i + 1}
              </span>
              <span className="text-sm">
                <span className="block font-medium text-ink-100">{s.title}</span>
                <span className="text-ink-400">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        {firstTime && (
          <button className="btn-primary mt-4" onClick={() => navigateTo('diagnosis', DIAGNOSIS_CASES[0].id)}>
            Começar pelo exemplo guiado <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </section>

      <h2 className="section-title mb-3">Casos</h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {DIAGNOSIS_CASES.map((c) => {
          const rec = rounds[c.id];
          return (
            <li key={c.id}>
              <button onClick={() => navigateTo('diagnosis', c.id)} className="card-interactive flex h-full w-full flex-col gap-2 p-4">
                <span className="flex items-center justify-between gap-2 font-mono text-xs text-ink-400">
                  <span>
                    {c.workOrder.number} · {c.level}
                  </span>
                  {rec?.solved ? <span className="badge-success">Concluído</span> : rec ? <span className="badge-warning">Tentado</span> : null}
                </span>
                <span className="font-semibold text-ink-100">{c.title}</span>
                <span className="text-sm text-ink-400">{c.workOrder.text}</span>
                <span className="mt-auto pt-2 text-xs text-ink-500">
                  {rec?.bestScore !== undefined ? `Melhor nota: ${rec.bestScore} de 100 · ${rec.attempts} tentativa(s)` : 'Ainda não tentado'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="notice mt-6">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />
        <span>
          Exercício de raciocínio com dados simulados. Na manutenção real, qualquer intervenção segue o procedimento da empresa, a documentação do equipamento,
          o bloqueio de energias e a orientação do instrutor ou do responsável.
        </span>
      </p>
    </Page>
  );
};

/* ───────────── Um caso ───────────── */

type Stage = 'os' | 'investigar' | 'hipotese' | 'acao' | 'relatorio';
const STAGES: { id: Stage; label: string }[] = [
  { id: 'os', label: 'Ordem de serviço' },
  { id: 'investigar', label: 'Investigação' },
  { id: 'hipotese', label: 'Causa provável' },
  { id: 'acao', label: 'Ação' },
  { id: 'relatorio', label: 'Relatório' }
];

const GUIDE: Record<Stage, string> = {
  os: 'Comece lendo a ordem de serviço com calma. Repare no que mudou recentemente no equipamento: costuma ser uma pista.',
  investigar: 'Escolha um teste por vez e leia o resultado. Prefira os que não exigem desmontar. Quando os dados apontarem numa direção, siga para a causa provável.',
  hipotese: 'Escolha a causa que os dados sustentam e marque os resultados que a apoiam. Marcar resultados sem relação tira pontos da justificativa.',
  acao: 'A melhor ação corrige a causa, é feita com segurança e confirma o resultado com uma medição.',
  relatorio: 'Veja cada parcela da nota e o que revisar. Você pode refazer o caso quantas vezes quiser.'
};

const CaseRunner: React.FC<{ c: DiagnosisCase }> = ({ c }) => {
  const { navigateTo, playerProfile, recordDiagnosisRun, setLastActivity } = useGameState();
  const [stage, setStage] = useState<Stage>('os');
  const [tests, setTests] = useState<string[]>([]);
  const [causeId, setCauseId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [guided, setGuided] = useState(() => playerProfile.diagnosisRuns.length === 0);
  const [run, setRun] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setLastActivity('diagnosis', `Diagnóstico: ${c.title}`, c.id);
  }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (s: Stage) => {
    setStage(s);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const restart = () => {
    setTests([]);
    setCauseId(null);
    setEvidence([]);
    setActionId(null);
    setHintsUsed(0);
    setRun((r) => r + 1);
    go('os');
  };

  const attempt: Attempt = { tests, causeId, evidence, actionId, hintsUsed };
  const performed = performedTests(c, tests);

  const finish = () => {
    const result = scoreCase(c, attempt);
    recordDiagnosisRun(
      {
        caseId: c.id,
        at: Date.now(),
        score: result.total,
        passed: result.passed,
        causeCorrect: result.causeCorrect,
        actionKind: result.actionKind ?? '',
        unsafeChoices: result.unsafeChoices,
        hintsUsed,
        testsUsed: new Set(tests).size
      },
      [
        { skillId: 'diagnosis.reasoning', correct: result.causeCorrect },
        { skillId: 'diagnosis.evidence', correct: result.weakEvidence.length === 0 && result.keyMissed.length === 0 },
        { skillId: 'safety.workshop', correct: result.unsafeChoices === 0 }
      ]
    );
    go('relatorio');
  };

  const stageIdx = STAGES.findIndex((s) => s.id === stage);

  return (
    <Page width="reading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <button className="btn-ghost btn-sm -ml-2" onClick={() => navigateTo('diagnosis')}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Casos
        </button>
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input type="checkbox" checked={guided} onChange={(e) => setGuided(e.target.checked)} className="h-4 w-4 accent-accent" />
          Mostrar orientações
        </label>
      </div>

      <p className="eyebrow">
        {c.workOrder.number} · Oficina de Diagnóstico
      </p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold tracking-tight text-ink-100 outline-none">
        {c.title}
      </h1>

      <ol className="mt-4 flex flex-wrap gap-1.5" aria-label="Etapas do caso">
        {STAGES.map((s, i) => (
          <li
            key={s.id}
            aria-current={i === stageIdx ? 'step' : undefined}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              i === stageIdx ? 'border-accent bg-accent-soft text-accent-text' : i < stageIdx ? 'border-ink-700 text-ink-300' : 'border-ink-800 text-ink-500'
            }`}
          >
            {i + 1}. {s.label}
            {i < stageIdx && <span className="sr-only"> (feita)</span>}
          </li>
        ))}
      </ol>

      {guided && (
        <p className="notice mt-4" role="note">
          <Lightbulb className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <span>
            <span className="font-semibold text-ink-100">Orientação: </span>
            {GUIDE[stage]}
          </span>
        </p>
      )}

      <div className="mt-5">
        {stage === 'os' && <WorkOrder c={c} onStart={() => go('investigar')} />}
        {stage === 'investigar' && (
          <Investigation
            c={c}
            tests={tests}
            onTest={(id) => setTests((t) => (t.includes(id) ? t : [...t, id]))}
            hintsUsed={hintsUsed}
            onHint={() => setHintsUsed((h) => Math.min(MAX_HINTS, h + 1))}
            onNext={() => go('hipotese')}
          />
        )}
        {stage === 'hipotese' && (
          <Hypothesis
            c={c}
            performed={performed}
            causeId={causeId}
            onCause={setCauseId}
            evidence={evidence}
            onEvidence={(id, on) => setEvidence((e) => (on ? [...e, id] : e.filter((x) => x !== id)))}
            onBack={() => go('investigar')}
            onNext={() => go('acao')}
          />
        )}
        {stage === 'acao' && <ActionStep c={c} actionId={actionId} onAction={setActionId} onBack={() => go('hipotese')} onFinish={finish} />}
        {stage === 'relatorio' && <Report key={run} c={c} result={scoreCase(c, attempt)} attempt={attempt} onRestart={restart} />}
      </div>
    </Page>
  );
};

/* ───────────── Etapa 1: ordem de serviço ───────────── */

const WorkOrder: React.FC<{ c: DiagnosisCase; onStart: () => void }> = ({ c, onStart }) => (
  <div className="space-y-4">
    <section className="card p-5" aria-labelledby="h-os">
      <h2 id="h-os" className="flex items-center gap-2 section-title">
        <ClipboardList className="h-4 w-4 text-accent" aria-hidden /> Ordem de serviço {c.workOrder.number}
      </h2>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-400">Área</dt>
          <dd className="text-ink-100">{c.workOrder.area}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Solicitante</dt>
          <dd className="text-ink-100">{c.workOrder.requester}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-400">Equipamento</dt>
          <dd className="text-ink-100">{c.equipment}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-400">Relato</dt>
          <dd className="text-ink-100">{c.workOrder.text}</dd>
        </div>
      </dl>
    </section>

    <div className="grid gap-4 sm:grid-cols-2">
      <section className="card p-5" aria-labelledby="h-ctx">
        <h2 id="h-ctx" className="section-title">
          Contexto
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-300">
          {c.context.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
      <section className="card p-5" aria-labelledby="h-ini">
        <h2 id="h-ini" className="section-title">
          O que já se sabe
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-300">
          {c.initialEvidence.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>

    <details className="card p-5">
      <summary className="cursor-pointer font-semibold text-ink-100">Sobre esta atividade (objetivo e critérios)</summary>
      <dl className="mt-3 space-y-2 text-sm">
        {[
          ['Objetivo', c.design.objective],
          ['Você precisa saber', c.design.priorKnowledge],
          ['O que você faz', c.design.studentAction],
          ['Retorno', c.design.feedback],
          ['Critério de êxito', c.design.successCriteria],
          ['Engano comum', c.design.misconception],
          ['Segurança', c.design.safety],
          ['Competências', c.design.competencies.join(', ')]
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="font-medium text-ink-200">{k}</dt>
            <dd className="text-ink-400">{v}</dd>
          </div>
        ))}
      </dl>
    </details>

    <button className="btn-primary" onClick={onStart}>
      Iniciar investigação <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  </div>
);

/* ───────────── Etapa 2: investigação ───────────── */

const CATEGORY_ORDER: TestCategory[] = ['observacao', 'medicao', 'registro', 'inspecao'];

const Investigation: React.FC<{
  c: DiagnosisCase;
  tests: string[];
  onTest: (id: string) => void;
  hintsUsed: number;
  onHint: () => void;
  onNext: () => void;
}> = ({ c, tests, onTest, hintsUsed, onHint, onNext }) => {
  const logRef = useRef<HTMLDivElement>(null);
  const performedCount = performedTests(c, tests).length;
  const latest = tests[tests.length - 1];

  useEffect(() => {
    if (latest) logRef.current?.querySelector<HTMLElement>(`[data-test="${latest}"]`)?.focus();
  }, [latest]);

  return (
    <div className="space-y-5">
      <section aria-labelledby="h-testes">
        <h2 id="h-testes" className="section-title">
          Testes disponíveis
        </h2>
        <p className="mt-1 text-sm text-ink-400">Escolha um teste por vez. O resultado aparece no registro logo abaixo.</p>
        <div className="mt-3 space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const list = c.tests.filter((t) => t.category === cat);
            if (!list.length) return null;
            return (
              <fieldset key={cat}>
                <legend className="field-label">{CATEGORY_LABEL[cat]}</legend>
                <ul className="grid gap-2">
                  {list.map((t) => {
                    const done = tests.includes(t.id);
                    const refused = done && t.safety === 'inseguro';
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => onTest(t.id)}
                          disabled={done}
                          className="flex min-h-[48px] w-full items-center gap-3 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left text-sm text-ink-100 hover:border-ink-500 disabled:cursor-default disabled:opacity-70 disabled:hover:border-ink-700"
                        >
                          <span className="flex-1">{t.label}</span>
                          {done &&
                            (refused ? (
                              <span className="badge-warning shrink-0">Não realizado</span>
                            ) : (
                              <span className="badge-neutral shrink-0">Feito</span>
                            ))}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className="card p-5" aria-labelledby="h-registro">
        <h2 id="h-registro" className="flex items-center gap-2 section-title">
          <FileSearch className="h-4 w-4 text-accent" aria-hidden /> Registro da investigação
        </h2>
        <div ref={logRef} aria-live="polite">
          {tests.length === 0 ? (
            <p className="mt-2 text-sm text-ink-400">Nenhum teste feito ainda.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {tests.map((id, i) => (
                <TestResult key={id} n={i + 1} test={runTest(c, id).test} />
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="card p-5" aria-labelledby="h-dicas">
        <h2 id="h-dicas" className="flex items-center gap-2 section-title">
          <Lightbulb className="h-4 w-4 text-accent" aria-hidden /> Dicas
        </h2>
        {hintsUsed > 0 && (
          <ol className="mt-2 space-y-1.5 text-sm text-ink-300">
            {c.hints.slice(0, hintsUsed).map((h, i) => (
              <li key={h}>
                <span className="font-medium text-ink-100">Dica {i + 1}:</span> {h}
              </li>
            ))}
          </ol>
        )}
        {hintsUsed < MAX_HINTS ? (
          <button className="btn-ghost btn-sm -ml-3 mt-2" onClick={onHint}>
            Pedir dica {hintsUsed + 1} de {MAX_HINTS} (custa {HINT_COST} pontos)
          </button>
        ) : (
          <p className="mt-2 text-xs text-ink-500">Todas as dicas já foram mostradas.</p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" onClick={onNext} disabled={performedCount === 0}>
          Indicar a causa provável <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        {performedCount === 0 && <span className="text-sm text-ink-400">Faça pelo menos um teste antes.</span>}
      </div>
    </div>
  );
};

const TestResult: React.FC<{ n: number; test: DiagTest }> = ({ n, test }) => {
  const refused = test.safety === 'inseguro';
  return (
    <li
      data-test={test.id}
      tabIndex={-1}
      className={`rounded-lg border p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent ${refused ? 'border-amber-700/60 bg-amber-950/20' : 'border-ink-800 bg-ink-850'}`}
    >
      <p className="font-medium text-ink-100">
        <span className="font-mono text-ink-500">{n}.</span> {test.label}
      </p>
      {refused ? (
        <p className="mt-1.5 flex gap-2 text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">Escolha insegura — teste não realizado.</span> {test.result}
          </span>
        </p>
      ) : (
        <>
          {test.safety === 'bloqueio' && <p className="mt-1 text-xs text-ink-500">Feito com o equipamento parado e bloqueado.</p>}
          <p className="mt-1.5 text-ink-300">{test.result}</p>
          {test.readings && (
            <table className="mt-2 w-full text-left text-xs">
              <caption className="sr-only">Leituras (valores simulados)</caption>
              <thead className="text-ink-500">
                <tr>
                  <th scope="col" className="py-1 pr-2 font-medium">
                    Ponto
                  </th>
                  <th scope="col" className="py-1 pr-2 font-medium">
                    Leitura
                  </th>
                  <th scope="col" className="py-1 font-medium">
                    Referência do equipamento
                  </th>
                </tr>
              </thead>
              <tbody>
                {test.readings.map((r) => (
                  <tr key={r.label} className="border-t border-ink-800">
                    <td className="py-1 pr-2 text-ink-300">{r.label}</td>
                    <td className="py-1 pr-2 font-mono text-ink-100">{r.value}</td>
                    <td className="py-1 text-ink-400">{r.reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </li>
  );
};

/* ───────────── Etapa 3: causa provável ───────────── */

const Hypothesis: React.FC<{
  c: DiagnosisCase;
  performed: string[];
  causeId: string | null;
  onCause: (id: string) => void;
  evidence: string[];
  onEvidence: (id: string, on: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ c, performed, causeId, onCause, evidence, onEvidence, onBack, onNext }) => (
  <div className="space-y-5">
    <fieldset className="card p-5">
      <legend className="sr-only">Causa provável</legend>
      <p className="section-title" aria-hidden>
        Qual é a causa provável?
      </p>
      <p className="mt-1 text-sm text-ink-400">Provável, não confirmada: a confirmação vem na inspeção, com o equipamento bloqueado.</p>
      <div className="mt-3 grid gap-2">
        {c.causes.map((cause) => (
          <label
            key={cause.id}
            className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
              causeId === cause.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 bg-ink-850 text-ink-200 hover:border-ink-500'
            }`}
          >
            <input type="radio" name="causa" value={cause.id} checked={causeId === cause.id} onChange={() => onCause(cause.id)} className="h-4 w-4 accent-accent" />
            {cause.label}
          </label>
        ))}
      </div>
    </fieldset>

    <fieldset className="card p-5">
      <legend className="sr-only">Evidências que sustentam a causa</legend>
      <p className="section-title" aria-hidden>
        Quais resultados sustentam essa causa?
      </p>
      <p className="mt-1 text-sm text-ink-400">Marque só os que apoiam a sua hipótese. Resultados sem relação contam contra a justificativa.</p>
      <div className="mt-3 grid gap-2">
        {performed.map((id) => {
          const t = c.tests.find((x) => x.id === id)!;
          const on = evidence.includes(id);
          return (
            <label
              key={id}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                on ? 'border-accent bg-accent-soft' : 'border-ink-700 bg-ink-850 hover:border-ink-500'
              }`}
            >
              <input type="checkbox" checked={on} onChange={(e) => onEvidence(id, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
              <span>
                <span className="block font-medium text-ink-100">{t.label}</span>
                <span className="text-ink-400">{t.result}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>

    <div className="flex flex-wrap gap-2">
      <button className="btn-secondary" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar a investigar
      </button>
      <button className="btn-primary" onClick={onNext} disabled={!causeId}>
        Escolher a ação <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  </div>
);

/* ───────────── Etapa 4: ação ───────────── */

const ActionStep: React.FC<{ c: DiagnosisCase; actionId: string | null; onAction: (id: string) => void; onBack: () => void; onFinish: () => void }> = ({
  c,
  actionId,
  onAction,
  onBack,
  onFinish
}) => (
  <div className="space-y-5">
    <fieldset className="card p-5">
      <legend className="sr-only">Próxima ação</legend>
      <p className="section-title" aria-hidden>
        Qual é a próxima ação?
      </p>
      <div className="mt-3 grid gap-2">
        {c.actions.map((a) => (
          <label
            key={a.id}
            className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
              actionId === a.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 bg-ink-850 text-ink-200 hover:border-ink-500'
            }`}
          >
            <input type="radio" name="acao" value={a.id} checked={actionId === a.id} onChange={() => onAction(a.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
            {a.label}
          </label>
        ))}
      </div>
    </fieldset>
    <div className="flex flex-wrap gap-2">
      <button className="btn-secondary" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
      </button>
      <button className="btn-primary" onClick={onFinish} disabled={!actionId}>
        Concluir e ver o relatório <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  </div>
);

/* ───────────── Etapa 5: relatório ───────────── */

const Report: React.FC<{ c: DiagnosisCase; result: CaseResult; attempt: Attempt; onRestart: () => void }> = ({ c, result, attempt, onRestart }) => {
  const { navigateTo } = useGameState();
  const cause = c.causes.find((x) => x.id === attempt.causeId);
  const correct = c.causes.find((x) => x.id === c.correctCause)!;
  const action = c.actions.find((x) => x.id === attempt.actionId);
  const label = (id: string) => c.tests.find((t) => t.id === id)!.label;
  const totalMax = useMemo(() => Object.values(WEIGHTS).reduce((a, b) => a + b, 0), []);

  return (
    <div className="space-y-5">
      <section className={`card p-5 ${result.passed ? 'border-emerald-700/60' : 'border-amber-700/60'}`} aria-labelledby="h-desfecho">
        <h2 id="h-desfecho" className={`flex items-center gap-2 text-lg font-semibold ${result.passed ? 'text-emerald-300' : 'text-amber-200'}`}>
          {result.passed ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <XCircle className="h-5 w-5" aria-hidden />}
          {result.passed ? 'Caso concluído' : 'Caso ainda não concluído'}
        </h2>
        <p className="mt-1 text-3xl font-bold text-ink-100">
          {result.total} <span className="text-base font-medium text-ink-400">de {totalMax} pontos</span>
        </p>
        {!result.passed && (
          <p className="mt-1 text-sm text-ink-400">
            Para concluir: causa provável certa, ação correta ou parcial, nenhuma ação insegura e pelo menos {PASS_SCORE} pontos.
          </p>
        )}
        <p className="mt-3 text-sm text-ink-300">
          <span className="font-medium text-ink-100">Sua causa provável:</span> {cause?.label ?? '—'}
          {result.causeCorrect ? ' (sustentada pelos dados)' : ` · a causa provável pelos dados é: ${correct.label}`}
        </p>
        {result.passed && <p className="mt-2 text-sm text-ink-400">{c.confirmation}</p>}
      </section>

      <section className="card p-5" aria-labelledby="h-nota">
        <h2 id="h-nota" className="section-title">
          Como a nota foi calculada
        </h2>
        <table className="mt-2 w-full text-left text-sm">
          <caption className="sr-only">Parcelas da nota</caption>
          <tbody>
            {result.lines.map((l) => (
              <tr key={l.key} className="border-t border-ink-800 first:border-t-0">
                <th scope="row" className="py-2 pr-3 font-medium text-ink-200">
                  {l.label}
                  <span className="block text-xs font-normal text-ink-400">{l.note}</span>
                </th>
                <td className="py-2 text-right font-mono text-ink-100">{l.max ? `${l.points}/${l.max}` : l.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card p-5" aria-labelledby="h-evid">
        <h2 id="h-evid" className="section-title">
          Evidências
        </h2>
        {result.keyFound.length > 0 && (
          <>
            <p className="mt-2 text-sm font-medium text-emerald-300">Evidências-chave que você levantou</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-300">
              {result.keyFound.map((id) => (
                <li key={id}>{label(id)}</li>
              ))}
            </ul>
          </>
        )}
        {result.keyMissed.length > 0 && (
          <>
            <p className="mt-3 text-sm font-medium text-amber-200">Testes-chave que ficaram de fora</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-300">
              {result.keyMissed.map((id) => (
                <li key={id}>{label(id)}</li>
              ))}
            </ul>
          </>
        )}
        {result.intrusive.length > 0 && (
          <p className="mt-3 text-sm text-ink-300">
            <span className="font-medium text-amber-200">Desmontagem sem indício:</span> {result.intrusive.map(label).join('; ')}. Antes de desmontar, use
            observação, medição e registros.
          </p>
        )}
      </section>

      {(!result.causeCorrect || result.weakEvidence.length > 0 || (action && action.kind !== 'correta')) && (
        <section className="card p-5" aria-labelledby="h-enganos">
          <h2 id="h-enganos" className="section-title">
            Suposições a rever
          </h2>
          <ul className="mt-2 space-y-3 text-sm">
            {!result.causeCorrect && cause && (
              <li>
                <span className="font-medium text-ink-100">{cause.label}:</span> <span className="text-ink-400">{cause.explanation}</span>
                <span className="mt-1 block text-ink-300">
                  <span className="font-medium text-ink-100">Pelos dados, {correct.label.toLowerCase()}:</span> {correct.explanation}
                </span>
              </li>
            )}
            {result.weakEvidence.map((id) => (
              <li key={id}>
                <span className="font-medium text-ink-100">Evidência marcada sem relação com a causa escolhida:</span> <span className="text-ink-400">{label(id)}</span>
              </li>
            ))}
            {action && action.kind !== 'correta' && (
              <li>
                <span className="font-medium text-ink-100">
                  Ação ({ACTION_KIND_LABEL[action.kind]}):
                </span>{' '}
                <span className="text-ink-400">{action.feedback}</span>
                <span className="mt-1 block text-ink-300">
                  <span className="font-medium text-ink-100">Ação recomendada:</span> {c.actions.find((a) => a.kind === 'correta')!.label}.
                </span>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="card p-5" aria-labelledby="h-seg">
        <h2 id="h-seg" className="flex items-center gap-2 section-title">
          <ShieldAlert className="h-4 w-4 text-amber-300" aria-hidden /> Segurança
        </h2>
        {result.unsafeChoices > 0 ? (
          <ul className="mt-2 space-y-2 text-sm">
            {result.unsafeTests.map((id) => (
              <li key={id} className="text-ink-300">
                <span className="font-medium text-amber-200">{label(id)}:</span> {c.tests.find((t) => t.id === id)!.result}
              </li>
            ))}
            {action?.kind === 'insegura' && (
              <li className="text-ink-300">
                <span className="font-medium text-amber-200">{action.label}:</span> {action.feedback}
              </li>
            )}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-emerald-300">Nenhuma escolha insegura neste caso.</p>
        )}
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-400">
          {c.safetyNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="card p-5" aria-labelledby="h-rev">
        <h2 id="h-rev" className="section-title">
          Competências praticadas e o que revisar
        </h2>
        <p className="mt-2 flex flex-wrap gap-1.5">
          {c.design.competencies.map((k) => (
            <span key={k} className="badge-neutral">
              {k}
            </span>
          ))}
        </p>
        <ul className="mt-3 space-y-1.5">
          {c.reviewTopics.map((r) => (
            <li key={r.label}>
              <button className="link" onClick={() => navigateTo(r.screen, r.param)}>
                {r.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Refazer o caso
        </button>
        <button className="btn-secondary" onClick={() => navigateTo('diagnosis')}>
          Outros casos
        </button>
        <button className="btn-secondary" onClick={() => navigateTo('progress')}>
          Ver no Passaporte
        </button>
      </div>
    </div>
  );
};
