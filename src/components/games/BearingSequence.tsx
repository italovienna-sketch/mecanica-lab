import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleSlash, Clock, RotateCcw, Wrench, XCircle } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  BEARING_GAME_ID,
  BEARING_SKILL,
  MAX_MISTAKES,
  PickResult,
  SCENARIOS,
  SCENARIOS_BY_ID,
  Scenario,
  cardsFor,
  checkPick,
  replay,
  scoreSequence
} from '../../data/bearingSequence/bearingSequence';
import { Page, PageHeader, ProgressBar } from '../ui';

/**
 * Montagem de rolamentos: o aluno monta a sequência de um procedimento escolhendo a próxima ação entre cartões.
 * Ação fora de ordem ou errada mostra o motivo e não entra na sequência. Sem cronômetro.
 */

type View = { kind: 'hub' } | { kind: 'play'; id: Scenario['id']; seed: number };

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export const BearingSequence: React.FC = () => {
  const [view, setView] = useState<View>({ kind: 'hub' });
  const { setLastActivity } = useGameState();
  useEffect(() => {
    setLastActivity('games', 'Desafio: Montagem de rolamentos', BEARING_GAME_ID);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (view.kind === 'play') {
    return (
      <RoundView
        key={`${view.id}-${view.seed}`}
        scenario={SCENARIOS_BY_ID[view.id]}
        seed={view.seed}
        onExit={() => setView({ kind: 'hub' })}
        onPlay={(id) => setView({ kind: 'play', id, seed: newSeed() })}
      />
    );
  }
  return <Hub onPlay={(id) => setView({ kind: 'play', id, seed: newSeed() })} />;
};

/* ───────────── Escolha do procedimento ───────────── */

const Hub: React.FC<{ onPlay: (id: Scenario['id']) => void }> = ({ onPlay }) => {
  const { playerProfile, navigateTo } = useGameState();
  const rounds = playerProfile.gameResults[BEARING_GAME_ID]?.rounds ?? {};
  const recommended = SCENARIOS.find((s) => !rounds[s.id]?.solved)?.id;

  return (
    <Page>
      <button className="btn-ghost btn-sm mb-4 -ml-2" onClick={() => navigateTo('games')}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Desafios
      </button>
      <PageHeader
        eyebrow="Desafio de procedimento"
        title="Montagem de rolamentos"
        description={`Monte a sequência de trabalho escolhendo a próxima ação. Algumas ações parecem certas, mas estragam o rolamento ou põem alguém em risco. Com até ${MAX_MISTAKES} erros você conclui o procedimento.`}
      />
      <ol className="grid gap-3 sm:grid-cols-3">
        {SCENARIOS.map((s, i) => {
          const rec = rounds[s.id];
          return (
            <li key={s.id} className="card flex flex-col gap-2 p-4">
              <span className="flex items-center justify-between gap-2 text-xs text-ink-400">
                <span>
                  Procedimento {i + 1} · {s.level}
                </span>
                {rec?.solved ? <span className="badge-success">Concluído</span> : s.id === recommended ? <span className="badge-accent">Sugerido</span> : null}
              </span>
              <h2 className="font-semibold text-ink-100">{s.title}</h2>
              <p className="text-sm text-ink-400">{s.context}</p>
              <p className="mt-auto pt-1 text-xs text-ink-500">
                {s.steps.length} passos
                {rec?.bestScore !== undefined ? ` · seu recorde: ${rec.bestScore} de ${s.steps.length * 10} pontos` : ''}
              </p>
              <button className={s.id === recommended ? 'btn-primary self-start' : 'btn-secondary self-start'} onClick={() => onPlay(s.id)}>
                {rec ? 'Jogar de novo' : 'Começar'}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 max-w-reading text-sm text-ink-400">
        Como pontua: cada passo que entra na sequência sem erro antes dele vale 10 pontos; erro não tira pontos já ganhos. Temperaturas, folgas,
        torques e quantidade de graxa não aparecem aqui de propósito: na oficina, eles vêm do fabricante do rolamento e do projeto da máquina.
      </p>
    </Page>
  );
};

/* ───────────── Rodada ───────────── */

const FEEDBACK_ICON = {
  ok: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />,
  wrong: <XCircle className="h-5 w-5 shrink-0" aria-hidden />,
  early: <Clock className="h-5 w-5 shrink-0" aria-hidden />
};

const RoundView: React.FC<{
  scenario: Scenario;
  seed: number;
  onExit: () => void;
  onPlay: (id: Scenario['id']) => void;
}> = ({ scenario, seed, onExit, onPlay }) => {
  const { recordGameRound, playerProfile } = useGameState();
  const cards = useMemo(() => cardsFor(scenario, seed), [scenario, seed]);
  const [picks, setPicks] = useState<string[]>([]);
  const [last, setLast] = useState<PickResult | null>(null);
  const [finished, setFinished] = useState(false);
  const previousBest = useRef(playerProfile.gameResults[BEARING_GAME_ID]?.rounds[scenario.id]?.bestScore);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const { done, results } = replay(scenario, picks);
  const ordered = done.map((id) => scenario.steps.find((s) => s.id === id)!);
  const discarded = new Set(picks.filter((id) => scenario.wrong.some((w) => w.id === id)));
  const { mistakes } = scoreSequence(scenario, picks);
  const complete = ordered.length === scenario.steps.length;

  useEffect(() => {
    if (picks.length) feedbackRef.current?.focus();
  }, [picks.length]);

  const pick = (id: string) => {
    setLast(checkPick(scenario, done, id));
    setPicks((prev) => [...prev, id]);
  };

  const finish = () => {
    const result = scoreSequence(scenario, picks);
    // Cada escolha alimenta a habilidade de montagem: certa na hora = acerto; fora de ordem ou errada = erro.
    const answers = results.map((r) => ({ skillId: BEARING_SKILL, correct: r.kind === 'ok' }));
    recordGameRound(BEARING_GAME_ID, scenario.id, { solved: result.passed, firstTry: result.mistakes === 0, score: result.score }, answers);
    setFinished(true);
  };

  if (finished) {
    return <Results scenario={scenario} picks={picks} previousBest={previousBest.current} onExit={onExit} onPlay={onPlay} />;
  }

  return (
    <Page width="reading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost btn-sm -ml-2" onClick={onExit}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Procedimentos
        </button>
        <div className="w-48">
          <ProgressBar value={done.length} max={scenario.steps.length} label="Passos na sequência" />
          <p className="mt-1 text-right text-xs text-ink-400">
            {done.length} de {scenario.steps.length} passos · {mistakes} {mistakes === 1 ? 'erro' : 'erros'}
          </p>
        </div>
      </div>

      <p className="font-mono text-xs uppercase text-ink-400">
        Montagem de rolamentos · {scenario.level}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-ink-100">{scenario.title}</h1>
      <p className="mt-1 text-sm text-ink-300">{scenario.context}</p>

      <section className="card mt-5 p-4" aria-labelledby="h-seq">
        <h2 id="h-seq" className="font-semibold text-ink-100">
          Sua sequência
        </h2>
        {ordered.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">Ainda vazia. Qual é a primeira coisa a fazer?</p>
        ) : (
          <ol className="mt-2 space-y-2 text-sm">
            {ordered.map((s, i) => (
              <li key={s.id} className="flex gap-3">
                <span className="font-mono text-ink-500">{i + 1}.</span>
                <span>
                  <span className="text-ink-100">{s.text}</span>
                  <span className="block text-ink-400">{s.why}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {last && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="region"
          aria-label="Resultado da escolha"
          className={`mt-4 flex gap-2 rounded-lg border p-3 text-sm outline-none ${
            last.kind === 'ok' ? 'border-emerald-700 text-emerald-300' : last.kind === 'early' ? 'border-amber-700 text-amber-300' : 'border-red-700 text-red-300'
          }`}
        >
          {FEEDBACK_ICON[last.kind]}
          <p>
            {last.kind === 'ok' && <>Certo: “{last.step.text}” entrou como passo {ordered.length}.</>}
            {last.kind === 'early' && (
              <>
                Ainda não. Antes de “{last.step.text}” falta: {last.missing.map((m) => `“${m.text}”`).join(' e ')}.
              </>
            )}
            {last.kind === 'wrong' && (
              <>
                Não faça isso. {last.action.why}
              </>
            )}
          </p>
        </div>
      )}

      {complete ? (
        <button className="btn-primary mt-5" onClick={finish}>
          Ver resultado <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <fieldset className="mt-5">
          <legend className="field-label">Escolha a próxima ação</legend>
          <ul className="grid gap-2">
            {cards
              .filter((c) => !ordered.some((s) => s.id === c.id))
              .map((c) => {
                const isDiscarded = discarded.has(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pick(c.id)}
                      disabled={isDiscarded}
                      className="flex min-h-[48px] w-full items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-left text-sm text-ink-100 hover:border-ink-500 disabled:cursor-default disabled:opacity-60 disabled:hover:border-ink-700"
                    >
                      {isDiscarded && <CircleSlash className="h-4 w-4 shrink-0 text-red-400" aria-hidden />}
                      <span className={isDiscarded ? 'line-through' : ''}>{c.text}</span>
                      {isDiscarded && <span className="sr-only"> (descartada: ação errada)</span>}
                    </button>
                  </li>
                );
              })}
          </ul>
        </fieldset>
      )}
    </Page>
  );
};

/* ───────────── Resultado ───────────── */

const Results: React.FC<{
  scenario: Scenario;
  picks: string[];
  previousBest: number | undefined;
  onExit: () => void;
  onPlay: (id: Scenario['id']) => void;
}> = ({ scenario, picks, previousBest, onExit, onPlay }) => {
  const result = scoreSequence(scenario, picks);
  const index = SCENARIOS.findIndex((s) => s.id === scenario.id);
  const next = SCENARIOS[index + 1];
  const newRecord = previousBest === undefined ? result.score > 0 : result.score > previousBest;
  const wrongPicked = scenario.wrong.filter((w) => picks.includes(w.id));
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <Page width="reading">
      <p className="font-mono text-xs uppercase text-ink-400">Montagem de rolamentos · {scenario.title}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold text-ink-100 outline-none">
        {result.passed ? 'Procedimento concluído' : 'Sequência completa, mas com erros demais'}
      </h1>
      <p className="mt-1 text-ink-300">
        {result.mistakes} {result.mistakes === 1 ? 'erro' : 'erros'} · {result.score} de {result.maxScore} pontos
        {newRecord && result.score > 0 ? ' · novo recorde pessoal' : previousBest !== undefined ? ` · recorde: ${Math.max(previousBest, result.score)}` : ''}
      </p>
      {!result.passed && <p className="mt-2 text-sm text-ink-400">Para concluir são no máximo {MAX_MISTAKES} erros. Os cartões mudam de ordem a cada rodada.</p>}

      {wrongPicked.length > 0 && (
        <section className="card mt-5 p-4" aria-labelledby="h-evitar">
          <h2 id="h-evitar" className="font-semibold text-ink-100">
            O que não fazer
          </h2>
          <ul className="mt-2 space-y-3 text-sm">
            {wrongPicked.map((w) => (
              <li key={w.id}>
                <span className="font-medium text-ink-200">{w.text}</span>
                <span className="block text-ink-400">{w.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {result.passed && next ? (
          <button className="btn-primary" onClick={() => onPlay(next.id)}>
            {next.title} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button className="btn-primary" onClick={() => onPlay(scenario.id)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Tentar de novo
          </button>
        )}
        {result.passed && next && (
          <button className="btn-secondary" onClick={() => onPlay(scenario.id)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Repetir este procedimento
          </button>
        )}
        <button className="btn-secondary" onClick={onExit}>
          <Wrench className="h-4 w-4" aria-hidden /> Escolher procedimento
        </button>
      </div>
    </Page>
  );
};
