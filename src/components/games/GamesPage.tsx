import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Eye, Lightbulb, ListChecks, RotateCcw, Ruler, Box, Puzzle, ShieldCheck, Stethoscope, Wrench } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  ChoiceRound,
  EXTERNAL_CHALLENGES,
  GAMES,
  GAMES_BY_ID,
  GameDef,
  GameRound,
  InspectionRound,
  LEVEL_LABEL,
  MultiRound,
  Note,
  Verdict
} from '../../data/games';
import { LEARNING_PATHS_BY_ID } from '../../data/learningPaths';
import { DIAGNOSIS_CASE_IDS, DIAGNOSIS_GAME_ID } from '../../data/diagnosis/meta';
import { LoadingState, Page, PageHeader, ProgressBar } from '../ui';
import { ClaimBadge, NotQualificationNote, RefLink, SourcesFooter } from '../safety/SourceBits';
import { InspectionScene } from './InspectionScenes';
import { METROLOGY_GAME_ID } from '../../data/metrology/levels';
import { BEARING_GAME_ID } from '../../data/bearingSequence/rounds';
import { STANDALONE_ROUND_IDS } from '../../data/standaloneGames';

const MetrologyMaster = lazy(() => import('./MetrologyMaster').then((m) => ({ default: m.MetrologyMaster })));
const BearingSequence = lazy(() => import('./BearingSequence').then((m) => ({ default: m.BearingSequence })));

const STANDALONE_SCREENS: Record<string, React.LazyExoticComponent<React.FC>> = {
  [METROLOGY_GAME_ID]: MetrologyMaster,
  [BEARING_GAME_ID]: BearingSequence
};

export const GamesPage: React.FC = () => {
  const { activeParam } = useGameState();
  const Standalone = activeParam ? STANDALONE_SCREENS[activeParam] : undefined;
  if (Standalone) {
    return (
      <Suspense fallback={<LoadingState label="Carregando o desafio…" />}>
        <Standalone />
      </Suspense>
    );
  }
  const game = activeParam ? GAMES_BY_ID[activeParam] : undefined;
  return game ? <GameView key={game.id} game={game} /> : <GamesHub />;
};

const solvedCount = (rounds: Record<string, { solved: boolean }> | undefined, game: GameDef) =>
  game.rounds.filter((r) => rounds?.[r.id]?.solved).length;

/* ───────────────────────── Lista de desafios ───────────────────────── */

const GamesHub: React.FC = () => {
  const { playerProfile, navigateTo } = useGameState();
  const safety = GAMES.filter((g) => g.safety);
  const technical = GAMES.filter((g) => !g.safety);

  const card = (g: GameDef) => {
    const done = solvedCount(playerProfile.gameResults[g.id]?.rounds, g);
    const levels = Array.from(new Set(g.rounds.map((r) => r.level)));
    return (
      <li key={g.id}>
        <button onClick={() => navigateTo('games', g.id)} className="card flex h-full w-full flex-col gap-2 p-4 text-left transition-colors hover:border-ink-500">
          <span className="flex items-center justify-between text-xs text-ink-400">
            <span>
              {g.rounds.length} rodadas · {levels.map((l) => LEVEL_LABEL[l]).join(' → ')}
            </span>
            {done === g.rounds.length && <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Concluído" />}
          </span>
          <span className="font-semibold text-ink-100">{g.title}</span>
          <span className="text-sm text-ink-400">{g.description}</span>
          <span className="mt-auto pt-1">
            <ProgressBar value={done} max={g.rounds.length} label={`${g.title}: rodadas resolvidas`} tone="success" />
            <span className="mt-1 block text-xs text-ink-500">
              {done} de {g.rounds.length} rodadas resolvidas
            </span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Desafios"
        title="Aplique o que aprendeu"
        description="Sem cronômetro e sem perder pontos por errar. Cada resposta vem com explicação, e você pode tentar de novo quantas vezes quiser."
      />
      <section className="mb-8" aria-labelledby="h-seg">
        <h2 id="h-seg" className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-100">
          <ShieldCheck className="h-5 w-5 text-sky-300" aria-hidden /> Segurança primeiro
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{safety.map(card)}</ul>
      </section>
      <section className="mb-8" aria-labelledby="h-tec">
        <h2 id="h-tec" className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-100">
          <Puzzle className="h-5 w-5 text-accent" aria-hidden /> Ferramentas e diagnóstico
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{technical.map(card)}</ul>
        <div className="mt-3">
          <StandaloneCard
            id={DIAGNOSIS_GAME_ID}
            screen="diagnosis"
            roundIds={DIAGNOSIS_CASE_IDS}
            title="Oficina de Diagnóstico"
            description="Ordens de serviço simuladas: escolha os testes, aponte a causa provável pelas evidências e decida a próxima ação com segurança."
            unit="casos"
            icon={<Stethoscope className="h-6 w-6 shrink-0 text-accent" aria-hidden />}
          />
          <StandaloneCard
            id={BEARING_GAME_ID}
            title="Montagem de rolamentos"
            description="Monte a sequência de 3 procedimentos — a frio, a quente e a troca num mancal — e descarte as ações que estragam o rolamento."
            unit="procedimentos"
            icon={<Wrench className="h-6 w-6 shrink-0 text-accent" aria-hidden />}
          />
        </div>
      </section>
      <section className="mb-8" aria-labelledby="h-ext">
        <h2 id="h-ext" className="mb-1 text-lg font-semibold text-ink-100">
          Medição e laboratório 3D
        </h2>
        <p className="mb-3 text-sm text-ink-400">Os treinos e o laboratório 3D abrem em outras áreas do Mecânica Lab.</p>
        <StandaloneCard
          id={METROLOGY_GAME_ID}
          title="Mestre da Metrologia"
          description="Leituras sorteadas de paquímetro, micrômetro e relógio comparador em 5 níveis, com o engano explicado a cada erro."
          unit="níveis"
          icon={<Ruler className="h-6 w-6 shrink-0 text-accent" aria-hidden />}
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXTERNAL_CHALLENGES.map((c) => (
            <li key={c.id}>
              <button onClick={() => navigateTo(c.screen, c.param)} className="card flex h-full w-full flex-col gap-1.5 p-4 text-left transition-colors hover:border-ink-500">
                {c.screen === 'tools' ? <Ruler className="h-5 w-5 text-accent" aria-hidden /> : <Box className="h-5 w-5 text-accent" aria-hidden />}
                <span className="font-semibold text-ink-100">{c.title}</span>
                <span className="text-sm text-ink-400">{c.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <NotQualificationNote />
    </Page>
  );
};

/** Cartão de um desafio com tela própria (Mestre da Metrologia, Montagem de rolamentos, Oficina de Diagnóstico). */
const StandaloneCard: React.FC<{
  id: string;
  title: string;
  description: string;
  unit: string;
  icon: React.ReactNode;
  /** Para atividades fora de Desafios (ex.: a Oficina de Diagnóstico tem rota própria). */
  screen?: 'diagnosis';
  roundIds?: string[];
}> = ({ id, title, description, unit, icon, screen, roundIds: ids }) => {
  const { playerProfile, navigateTo } = useGameState();
  const rounds = playerProfile.gameResults[id]?.rounds;
  const roundIds = ids ?? STANDALONE_ROUND_IDS[id];
  const done = roundIds.filter((r) => rounds?.[r]?.solved).length;
  return (
    <button
      onClick={() => (screen ? navigateTo(screen) : navigateTo('games', id))}
      className="card mb-3 flex w-full flex-col gap-3 p-4 text-left transition-colors hover:border-ink-500 sm:flex-row sm:items-center"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-100">{title}</span>
        <span className="block text-sm text-ink-400">{description}</span>
      </span>
      <span className="w-full sm:w-44">
        <ProgressBar value={done} max={roundIds.length} label={`${title}: ${unit} concluídos`} tone="success" />
        <span className="mt-1 block text-xs text-ink-500">
          {done} de {roundIds.length} {unit} concluídos
        </span>
      </span>
    </button>
  );
};

/* ───────────────────────── Um desafio ───────────────────────── */

const GameView: React.FC<{ game: GameDef }> = ({ game }) => {
  const { playerProfile, navigateTo, setLastActivity } = useGameState();
  const rounds = playerProfile.gameResults[game.id]?.rounds;
  const firstOpen = game.rounds.findIndex((r) => !rounds?.[r.id]?.solved);
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const round = game.rounds[index];
  const path = LEARNING_PATHS_BY_ID[game.pathId];

  useEffect(() => {
    setLastActivity('games', `Desafio: ${game.title}`, game.id);
  }, [game.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (i: number) => {
    setFinished(false);
    setIndex(i);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    if (index < game.rounds.length - 1) goTo(index + 1);
    else setFinished(true);
  };

  const done = solvedCount(rounds, game);

  return (
    <Page width="reading">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => navigateTo('games')} className="btn-ghost -ml-3">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Desafios
        </button>
        {path && (
          <button onClick={() => navigateTo('courses', path.id)} className="btn-ghost text-ink-400">
            Trilha {path.number}: {path.title}
          </button>
        )}
      </div>
      <header className="mb-4">
        <p className="eyebrow">Desafio</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">{game.title}</h1>
        <p className="mt-1 text-ink-400">{game.description}</p>
      </header>

      <nav aria-label="Rodadas" className="mb-5">
        <ol className="flex flex-wrap gap-1.5">
          {game.rounds.map((r, i) => {
            const solved = rounds?.[r.id]?.solved;
            const current = i === index && !finished;
            return (
              <li key={r.id}>
                <button
                  onClick={() => goTo(i)}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`Rodada ${i + 1}: ${r.title}${solved ? ' (resolvida)' : ''}`}
                  className={`flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2 text-sm font-semibold ${
                    current ? 'border-accent bg-accent-soft text-ink-100' : solved ? 'border-emerald-700 bg-emerald-950/30 text-emerald-300' : 'border-ink-700 text-ink-400'
                  }`}
                >
                  {solved ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-xs text-ink-500">
          {done} de {game.rounds.length} rodadas resolvidas
        </p>
      </nav>

      {finished ? (
        <GameSummary game={game} onReview={goTo} />
      ) : (
        <RoundShell key={round.id} round={round} index={index} total={game.rounds.length} headingRef={headingRef} gameId={game.id} onNext={next} />
      )}

      {game.sources.length > 0 && <SourcesFooter ids={game.sources} className="mt-6" />}
      {game.safety && <NotQualificationNote className="mt-3" />}
    </Page>
  );
};

const GameSummary: React.FC<{ game: GameDef; onReview: (i: number) => void }> = ({ game, onReview }) => {
  const { playerProfile, navigateTo } = useGameState();
  const rounds = playerProfile.gameResults[game.id]?.rounds;
  const pending = game.rounds.map((r, i) => ({ r, i })).filter(({ r }) => !rounds?.[r.id]?.solved);
  return (
    <section className="card p-5" aria-labelledby="sum-title">
      <h2 id="sum-title" className="text-lg font-semibold text-ink-100">
        {pending.length === 0 ? 'Todas as rodadas resolvidas' : 'Fim das rodadas'}
      </h2>
      <p className="mt-1 text-sm text-ink-300">
        {pending.length === 0
          ? 'Revise as explicações quando quiser: entender o porquê vale mais que acertar de primeira.'
          : `Ainda faltam ${pending.length} rodada(s). Volte nelas com calma.`}
      </p>
      {pending.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {pending.map(({ r, i }) => (
            <li key={r.id}>
              <button className="btn-secondary w-full justify-between" onClick={() => onReview(i)}>
                Rodada {i + 1}: {r.title} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => navigateTo('games')}>
          Outros desafios
        </button>
        <button className="btn-ghost" onClick={() => navigateTo('courses', game.pathId)}>
          Voltar à trilha
        </button>
      </div>
    </section>
  );
};

/* ───────────────────────── Moldura da rodada ───────────────────────── */

interface RoundProps {
  gameId: string;
  onSolvedChange: (solved: boolean) => void;
}

const RoundShell: React.FC<{
  round: GameRound;
  index: number;
  total: number;
  gameId: string;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onNext: () => void;
}> = ({ round, index, total, gameId, headingRef, onNext }) => {
  const [hint, setHint] = useState(false);
  const [solved, setSolved] = useState(false);
  return (
    <section aria-labelledby="round-title">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-ink-700 px-2 py-0.5 font-semibold text-ink-300">
          Rodada {index + 1} de {total}
        </span>
        <span className="rounded-full border border-ink-700 px-2 py-0.5 text-ink-400">Nível: {LEVEL_LABEL[round.level]}</span>
      </div>
      <h2 id="round-title" ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-ink-100 outline-none">
        {round.title}
      </h2>

      <div className="mt-4">
        {round.type === 'choice' && <ChoiceView round={round} gameId={gameId} onSolvedChange={setSolved} />}
        {round.type === 'multi' && <MultiView round={round} gameId={gameId} onSolvedChange={setSolved} />}
        {round.type === 'inspection' && <InspectionView round={round} gameId={gameId} onSolvedChange={setSolved} />}
      </div>

      {!solved && (
        <div className="mt-3">
          {hint ? (
            <p className="flex gap-2 rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-ink-200" role="note">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" aria-hidden /> {round.hint}
            </p>
          ) : (
            <button className="btn-ghost text-sm" onClick={() => setHint(true)}>
              <Lightbulb className="h-4 w-4" aria-hidden /> Ver uma dica
            </button>
          )}
        </div>
      )}

      {solved && round.notes && round.notes.length > 0 && <NotesBox notes={round.notes} />}

      <div className="mt-5 flex justify-end">
        <button className={solved ? 'btn-primary' : 'btn-ghost'} onClick={onNext}>
          {index < total - 1 ? (solved ? 'Próxima rodada' : 'Pular por enquanto') : 'Concluir'} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
};

const NotesBox: React.FC<{ notes: Note[] }> = ({ notes }) => (
  <ul className="mt-4 space-y-2 rounded-xl border border-ink-800 bg-ink-900 p-4">
    {notes.map((n) => (
      <li key={n.text} className="flex flex-col gap-1 text-sm text-ink-200 sm:flex-row sm:items-start sm:gap-3">
        <ClaimBadge kind={n.kind} />
        <span className="flex-1">
          {n.text} {n.ref && <RefLink r={n.ref} />}
        </span>
      </li>
    ))}
  </ul>
);

const Given: React.FC<{ situation: string; given?: { label: string; value: string }[] }> = ({ situation, given }) => (
  <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
    <p className="text-base text-ink-100">{situation}</p>
    {given && given.length > 0 && (
      <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
        {given.map((g) => (
          <React.Fragment key={g.label}>
            <dt className="font-medium text-ink-400">{g.label}</dt>
            <dd className="text-ink-100">{g.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    )}
  </div>
);

/** Ordem estável das alternativas por rodada (a melhor resposta não fica sempre em primeiro). */
function useShuffled<T>(items: T[], key: string): number[] {
  return useMemo(() => {
    const o = items.map((_, i) => i);
    let seed = Array.from(key).reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7);
    for (let i = o.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  }, [items, key]);
}

const VERDICT_TEXT: Record<Verdict, string> = { best: 'Melhor escolha', ok: 'Também funciona', wrong: 'Não é a melhor escolha' };

/* ───────────────────────── Escolha (A, E, decisões) ───────────────────────── */

const ChoiceView: React.FC<{ round: ChoiceRound } & RoundProps> = ({ round, gameId, onSolvedChange }) => {
  const { recordGameRound } = useGameState();
  const order = useShuffled(round.options, round.id);
  const [tried, setTried] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const solved = last !== null && round.options[last].verdict !== 'wrong';

  const pick = (i: number) => {
    if (solved) return;
    const opt = round.options[i];
    const ok = opt.verdict !== 'wrong';
    const first = tried.length === 0;
    setTried((t) => (t.includes(i) ? t : [...t, i]));
    setLast(i);
    recordGameRound(gameId, round.id, { solved: ok, firstTry: first && ok }, first ? [{ skillId: round.skillId, correct: ok }] : []);
    if (ok) onSolvedChange(true);
  };

  const best = round.options.filter((o) => o.verdict === 'best');

  return (
    <div>
      <Given situation={round.situation} given={round.given} />
      <p className="mt-4 font-semibold text-ink-100">{round.prompt}</p>
      <ul className="mt-2 space-y-2">
        {order.map((i) => {
          const o = round.options[i];
          const wasTried = tried.includes(i);
          const reveal = wasTried || solved;
          let style = 'border-ink-700 bg-ink-850 hover:border-ink-500';
          if (reveal && o.verdict === 'best') style = 'border-emerald-600 bg-emerald-950/30';
          else if (reveal && o.verdict === 'ok') style = 'border-sky-700 bg-sky-950/30';
          else if (wasTried) style = 'border-amber-600/70 bg-amber-950/20';
          else if (solved) style = 'border-ink-800 bg-ink-900 opacity-70';
          return (
            <li key={i}>
              <button
                onClick={() => pick(i)}
                disabled={solved || wasTried}
                className={`w-full rounded-xl border p-3.5 text-left text-base text-ink-100 disabled:cursor-default ${style}`}
              >
                <span className="block">{o.text}</span>
                {reveal && (
                  <span className="mt-1.5 block text-sm text-ink-300">
                    <span className={`font-semibold ${o.verdict === 'wrong' ? 'text-amber-200' : o.verdict === 'ok' ? 'text-sky-200' : 'text-emerald-300'}`}>
                      {VERDICT_TEXT[o.verdict]}:
                    </span>{' '}
                    {o.feedback}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div role="status" aria-live="polite">
        {last !== null && !solved && (
          <p className="mt-3 flex items-center gap-2 text-sm text-amber-200">
            <RotateCcw className="h-4 w-4" aria-hidden /> Leia o retorno e escolha outra alternativa.
          </p>
        )}
        {solved && (
          <div className="mt-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 text-sm leading-relaxed">
            <p className="font-semibold text-emerald-300">
              {round.options[last!].verdict === 'best' ? 'Boa escolha!' : 'Resolve, mas veja a melhor opção:'}
            </p>
            {round.options[last!].verdict === 'ok' && <p className="mt-1 text-ink-200">Melhor: {best.map((b) => b.text).join(' ou ')}.</p>}
            <p className="mt-1 text-ink-200">{round.explanation}</p>
            {round.realWorld && (
              <p className="mt-2 text-ink-400">
                <span className="font-semibold text-ink-300">No trabalho real: </span>
                {round.realWorld}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────────────────────── Seleção múltipla (EPI) ───────────────────────── */

const MultiView: React.FC<{ round: MultiRound } & RoundProps> = ({ round, gameId, onSolvedChange }) => {
  const { recordGameRound } = useGameState();
  const order = useShuffled(round.options, round.id);
  const [sel, setSel] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const required = round.options.filter((o) => o.need === 'required');
  const missing = required.filter((o) => !sel.includes(o.id));
  const wrongPicked = round.options.filter((o) => o.need === 'wrong' && sel.includes(o.id));
  const solved = checked && missing.length === 0 && wrongPicked.length === 0;

  const toggle = (id: string) => {
    if (solved) return;
    setChecked(false);
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const check = () => {
    const ok = missing.length === 0 && wrongPicked.length === 0;
    setChecked(true);
    setAttempts((a) => a + 1);
    recordGameRound(gameId, round.id, { solved: ok, firstTry: attempts === 0 && ok }, attempts === 0 ? [{ skillId: round.skillId, correct: ok }] : []);
    if (ok) onSolvedChange(true);
  };

  return (
    <div>
      <Given situation={round.situation} given={round.given} />
      <fieldset className="mt-4">
        <legend className="font-semibold text-ink-100">{round.prompt}</legend>
        <p className="text-xs text-ink-500">Marque todos os que se aplicam.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {order.map((i) => {
            const o = round.options[i];
            const on = sel.includes(o.id);
            let style = on ? 'border-accent bg-accent-soft' : 'border-ink-700 bg-ink-850 hover:border-ink-500';
            if (checked && on && o.need === 'wrong') style = 'border-amber-600 bg-amber-950/25';
            if (checked && on && o.need === 'required') style = 'border-emerald-600 bg-emerald-950/30';
            return (
              <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-base text-ink-100 ${style}`}>
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#e8590c]" checked={on} onChange={() => toggle(o.id)} disabled={solved} />
                <span className="flex-1">
                  {o.text}
                  {checked && (on || (solved && o.need === 'required')) && <span className="mt-1 block text-sm text-ink-300">{o.feedback}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div role="status" aria-live="polite">
        {checked && !solved && (
          <div className="mt-3 rounded-xl border border-amber-700/50 bg-amber-950/20 p-4 text-sm text-ink-200">
            {wrongPicked.length > 0 && (
              <p>
                <span className="font-semibold text-amber-200">Cria risco nesta tarefa: </span>
                {wrongPicked.map((w) => w.text).join(', ')}.
              </p>
            )}
            {missing.length > 0 && (
              <p className={wrongPicked.length ? 'mt-1' : ''}>
                <span className="font-semibold text-amber-200">Ainda falta cobrir </span>
                {missing.length === 1 ? 'um risco listado' : `${missing.length} riscos listados`}. Releia os riscos e ajuste.
              </p>
            )}
          </div>
        )}
        {solved && (
          <div className="mt-3 rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 text-sm leading-relaxed">
            <p className="font-semibold text-emerald-300">Seleção adequada aos riscos listados!</p>
            <p className="mt-1 text-ink-200">{round.explanation}</p>
          </div>
        )}
      </div>
      {!solved && (
        <button className="btn-primary mt-4 w-full sm:w-auto" onClick={check} disabled={sel.length === 0}>
          <ListChecks className="h-4 w-4" aria-hidden /> Conferir
        </button>
      )}
    </div>
  );
};

/* ───────────────────────── Inspeção (F) ───────────────────────── */

const InspectionView: React.FC<{ round: InspectionRound } & RoundProps> = ({ round, gameId, onSolvedChange }) => {
  const { recordGameRound } = useGameState();
  const [flags, setFlags] = useState<string[]>([]);
  const [result, setResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showAreas, setShowAreas] = useState(false);
  const hazards = round.items.filter((i) => i.hazard);
  const found = hazards.filter((h) => flags.includes(h.id));
  const missed = hazards.filter((h) => !flags.includes(h.id));
  const falseFlags = round.items.filter((i) => !i.hazard && flags.includes(i.id));
  const solved = result && missed.length === 0;

  const toggle = (id: string) => {
    if (result) return;
    setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  const finish = () => {
    const ok = missed.length === 0;
    setResult(true);
    setAttempts((a) => a + 1);
    recordGameRound(
      gameId,
      round.id,
      { solved: ok, firstTry: attempts === 0 && ok && falseFlags.length === 0, score: Math.round((found.length / hazards.length) * 100) },
      attempts === 0 ? [{ skillId: round.skillId, correct: ok }] : []
    );
    if (ok) onSolvedChange(true);
  };

  const retry = () => {
    setResult(false);
    setFlags((f) => f.filter((id) => round.items.find((i) => i.id === id)?.hazard));
  };

  return (
    <div>
      <p className="text-base text-ink-100">{round.intro}</p>
      <p className="mt-1 text-sm text-ink-400">Toque na cena ou use a lista abaixo para marcar o que precisa ser corrigido. Depois, conclua a inspeção.</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-ink-700" data-testid="inspection-scene">
        <InspectionScene scene={round.scene}>
          {round.items.map((it, n) => {
            const on = flags.includes(it.id);
            let stroke = on ? '#e8590c' : showAreas ? '#6e706a' : 'transparent';
            if (result && it.hazard) stroke = on ? '#2f9e44' : '#e8590c';
            if (result && !it.hazard && on) stroke = '#6e706a';
            return (
              <g key={it.id} onClick={() => toggle(it.id)} style={{ cursor: result ? 'default' : 'pointer' }} aria-hidden>
                <rect
                  x={it.x}
                  y={it.y}
                  width={it.w}
                  height={it.h}
                  rx={8}
                  fill={on && !result ? 'rgba(232,89,12,0.12)' : 'rgba(0,0,0,0.001)'}
                  stroke={stroke}
                  strokeWidth={on || result ? 3 : 1.5}
                  strokeDasharray={!on && !result ? '6 5' : result && it.hazard && !on ? '7 4' : undefined}
                />
                {(on || (result && it.hazard)) && (
                  <g transform={`translate(${it.x + it.w - 4} ${it.y + 4})`}>
                    <circle r={11} fill={result ? (it.hazard ? (on ? '#2f9e44' : '#e8590c') : '#6e706a') : '#e8590c'} />
                    <text y={4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">
                      {result ? (it.hazard ? (on ? '✓' : '!') : '–') : n + 1}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </InspectionScene>
      </div>
      <div className="mt-2 flex justify-end">
        <button className="btn-ghost text-xs" onClick={() => setShowAreas((v) => !v)} aria-pressed={showAreas}>
          <Eye className="h-4 w-4" aria-hidden /> {showAreas ? 'Ocultar áreas tocáveis' : 'Mostrar áreas tocáveis'}
        </button>
      </div>

      <fieldset className="mt-2">
        <legend className="text-sm font-semibold text-ink-200">Itens da cena</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {round.items.map((it) => {
            const on = flags.includes(it.id);
            return (
              <button
                key={it.id}
                onClick={() => toggle(it.id)}
                disabled={result}
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                  on ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-300 hover:border-ink-500'
                }`}
              >
                {on ? <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                {it.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-500">{flags.length} marcado(s) como problema</p>
      </fieldset>

      {!result && (
        <button className="btn-primary mt-4 w-full sm:w-auto" onClick={finish} disabled={flags.length === 0}>
          Concluir inspeção
        </button>
      )}

      <div role="status" aria-live="polite">
        {result && (
          <div className="mt-4 space-y-3">
            <p className={`text-base font-semibold ${solved ? 'text-emerald-300' : 'text-amber-200'}`}>
              {solved
                ? `Você encontrou os ${hazards.length} problemas.`
                : `Você encontrou ${found.length} de ${hazards.length} problemas. Os que faltam estão destacados com "!".`}
            </p>
            <ul className="space-y-2">
              {round.items
                .filter((it) => it.hazard ? found.includes(it) || solved : flags.includes(it.id))
                .map((it) => (
                  <li key={it.id} className="rounded-xl border border-ink-800 bg-ink-900 p-3 text-sm">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-100">
                      {it.hazard ? <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden /> : <Circle className="h-4 w-4 text-ink-500" aria-hidden />}
                      {it.label}
                      <ClaimBadge kind={it.kind} />
                    </p>
                    <p className="mt-1 text-ink-300">
                      {!it.hazard && <span className="font-medium text-ink-200">Não era problema. </span>}
                      {it.feedback} {it.ref && <RefLink r={it.ref} />}
                    </p>
                  </li>
                ))}
            </ul>
            {!solved && (
              <button className="btn-primary w-full sm:w-auto" onClick={retry}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Procurar o que faltou
              </button>
            )}
            {solved && round.items.some((i) => !i.hazard && !flags.includes(i.id)) && (
              <details className="rounded-xl border border-ink-800 p-3 text-sm text-ink-300">
                <summary className="cursor-pointer font-medium text-ink-200">Por que os outros itens estavam certos?</summary>
                <ul className="mt-2 space-y-1.5">
                  {round.items
                    .filter((i) => !i.hazard && !flags.includes(i.id))
                    .map((i) => (
                      <li key={i.id}>
                        <span className="font-medium text-ink-200">{i.name}:</span> {i.feedback}
                      </li>
                    ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
