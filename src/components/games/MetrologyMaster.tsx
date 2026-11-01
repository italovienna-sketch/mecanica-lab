import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Ruler, XCircle } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import {
  AnswerRecord,
  LEVELS,
  LEVELS_BY_ID,
  LevelDef,
  METROLOGY_GAME_ID,
  MISTAKE_TEXT,
  MistakeId,
  PASS_MIN,
  QUESTIONS_PER_ROUND,
  SKILL_BY_INSTRUMENT,
  diagnose,
  explain,
  fmtMm,
  generateRound,
  levelRoundId,
  parseMm,
  scoreRound
} from '../../data/metrology/metrologyMaster';
import { DialRunout } from '../illustrations/TechnicalIllustrations';
import { CaliperScales } from '../tools/CaliperTrainer';
import { MicrometerScales } from '../tools/MicrometerTrainer';
import { Page, PageHeader, ProgressBar } from '../ui';

/**
 * Mestre da Metrologia: rodadas curtas de leitura de paquímetro, micrômetro e relógio comparador com valores sorteados.
 * Cada erro mostra o engano provável e o passo a passo da leitura certa. Sem cronômetro.
 */

type View = { kind: 'hub' } | { kind: 'play'; level: LevelDef['id']; seed: number };

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export const MetrologyMaster: React.FC = () => {
  const [view, setView] = useState<View>({ kind: 'hub' });
  if (view.kind === 'play') {
    return (
      <RoundView
        key={`${view.level}-${view.seed}`}
        levelId={view.level}
        seed={view.seed}
        onExit={() => setView({ kind: 'hub' })}
        onPlay={(level) => setView({ kind: 'play', level, seed: newSeed() })}
      />
    );
  }
  return <Hub onPlay={(level) => setView({ kind: 'play', level, seed: newSeed() })} />;
};

/* ───────────── Escolha do nível ───────────── */

const Hub: React.FC<{ onPlay: (level: LevelDef['id']) => void }> = ({ onPlay }) => {
  const { playerProfile, navigateTo } = useGameState();
  const rounds = playerProfile.gameResults[METROLOGY_GAME_ID]?.rounds ?? {};
  const recommended = LEVELS.find((l) => !rounds[levelRoundId(l.id)]?.solved)?.id;

  return (
    <Page>
      <button className="btn-ghost btn-sm mb-4 -ml-2" onClick={() => navigateTo('games')}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Desafios
      </button>
      <PageHeader
        eyebrow="Desafio de medição"
        title="Mestre da Metrologia"
        description={`Leia paquímetros, micrômetros e relógios comparadores com medidas sorteadas a cada rodada. São ${QUESTIONS_PER_ROUND} leituras por rodada; com ${PASS_MIN} certas você conclui o nível. Errou? Você vê o engano e o passo a passo.`}
      />
      <ol className="grid gap-3 sm:grid-cols-2">
        {LEVELS.map((level) => {
          const rec = rounds[levelRoundId(level.id)];
          const max = level.points * QUESTIONS_PER_ROUND;
          return (
            <li key={level.id} className="card flex flex-col gap-2 p-4">
              <span className="flex items-center justify-between gap-2 text-xs text-ink-400">
                <span>
                  Nível {level.id} · {level.answerMode === 'typed' ? 'resposta digitada' : '4 alternativas'}
                </span>
                {rec?.solved ? (
                  <span className="badge-success">Concluído</span>
                ) : level.id === recommended ? (
                  <span className="badge-accent">Sugerido</span>
                ) : null}
              </span>
              <h2 className="font-semibold text-ink-100">{level.title}</h2>
              <p className="text-sm text-ink-400">{level.description}</p>
              <p className="mt-auto pt-1 text-xs text-ink-500">
                {rec?.bestScore !== undefined ? `Seu recorde: ${rec.bestScore} de ${max} pontos` : 'Ainda não jogado'}
              </p>
              <button className={level.id === recommended ? 'btn-primary self-start' : 'btn-secondary self-start'} onClick={() => onPlay(level.id)}>
                {rec ? 'Jogar de novo' : 'Começar'}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 max-w-reading text-sm text-ink-400">
        Como pontua: cada leitura certa vale os pontos do nível; com dica vale a metade; erro não tira pontos. Os recordes ficam salvos só
        neste navegador. Para rever a teoria, use os treinos de{' '}
        <button className="link" onClick={() => navigateTo('tools', 'treino-paquimetro')}>
          paquímetro
        </button>{' '}
        e{' '}
        <button className="link" onClick={() => navigateTo('tools', 'treino-micrometro')}>
          micrômetro
        </button>
        .
      </p>
    </Page>
  );
};

/* ───────────── Rodada ───────────── */

const RoundView: React.FC<{
  levelId: LevelDef['id'];
  seed: number;
  onExit: () => void;
  onPlay: (level: LevelDef['id']) => void;
}> = ({ levelId, seed, onExit, onPlay }) => {
  const { recordGameRound, playerProfile } = useGameState();
  const level = LEVELS_BY_ID[levelId];
  const questions = useMemo(() => generateRound(levelId, seed), [levelId, seed]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [hint, setHint] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [typedError, setTypedError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const previousBest = useRef(playerProfile.gameResults[METROLOGY_GAME_ID]?.rounds[levelRoundId(levelId)]?.bestScore);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);

  const q = questions[index];
  const answered = picked !== null;
  const last = answers[answers.length - 1];

  // Foco acompanha o fluxo: retorno depois de responder; título da leitura ao avançar.
  useEffect(() => {
    if (answered) feedbackRef.current?.focus();
  }, [answered]);
  useEffect(() => {
    if (index > 0) headingRef.current?.focus();
  }, [index]);
  // Em telas estreitas a ilustração rola na horizontal: centraliza a região da leitura (zero do nônio ou borda do tambor).
  useEffect(() => {
    const box = figureRef.current;
    if (!box || box.scrollWidth <= box.clientWidth) return;
    const { instrument, value } = questions[index].reading;
    if (instrument === 'relogio') return;
    const focus = instrument === 'paquimetro' ? (50 + (value / 100) * 12 + 110) / 760 : (70 + (value / 100) * 26) / 820;
    box.scrollLeft = focus * box.scrollWidth - box.clientWidth / 2;
  }, [index, questions]);

  const answer = (value: number) => {
    if (answered) return;
    const correct = value === q.reading.value;
    const mistake = correct ? null : q.options.find((o) => o.value === value)?.mistake ?? diagnose(q.reading, value);
    setPicked(value);
    setAnswers((prev) => [...prev, { questionId: q.id, instrument: q.reading.instrument, correct, hintUsed: hint, mistake }]);
  };

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseMm(typed);
    if (v === null) {
      setTypedError('Digite um número em milímetros, por exemplo 12,35.');
      return;
    }
    setTypedError(null);
    answer(v);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setHint(false);
      setPicked(null);
      setTyped('');
      return;
    }
    const result = scoreRound(levelId, answers);
    recordGameRound(
      METROLOGY_GAME_ID,
      levelRoundId(levelId),
      { solved: result.passed, firstTry: result.correct === result.total, score: result.score },
      answers.map((a) => ({ skillId: SKILL_BY_INSTRUMENT[a.instrument], correct: a.correct }))
    );
    setFinished(true);
  };

  if (finished) {
    return <Results levelId={levelId} answers={answers} previousBest={previousBest.current} onExit={onExit} onPlay={onPlay} />;
  }

  const mm = q.reading.value / 100;
  const { instrument, dial } = q.reading;
  const isCaliper = instrument === 'paquimetro';

  return (
    <Page width="reading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost btn-sm -ml-2" onClick={onExit}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Níveis
        </button>
        <div className="w-48">
          <ProgressBar value={answers.length} max={QUESTIONS_PER_ROUND} label="Leituras respondidas" />
          <p className="mt-1 text-right text-xs text-ink-400">
            {answers.filter((a) => a.correct).length} certas de {answers.length}
          </p>
        </div>
      </div>

      <p className="font-mono text-xs uppercase text-ink-400">
        Nível {level.id} · {level.title} · leitura {index + 1} de {questions.length}
      </p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-semibold text-ink-100 outline-none">
        {q.part}
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        {instrument === 'relogio'
          ? 'Relógio comparador de 0,01 mm por divisão, zerado na peça. Numa volta completa, o ponteiro azul marca o menor valor e o laranja, o maior. Qual é o batimento?'
          : `${isCaliper ? 'Paquímetro com nônio de 0,05 mm, já fechado na peça.' : 'Micrômetro externo 0–25 mm, resolução 0,01 mm, já travado na peça.'} Qual é a leitura?`}
      </p>

      <figure className="mt-4">
        <div ref={figureRef} className="overflow-x-auto rounded-lg border border-ink-800">
          {instrument === 'relogio' ? (
            <div className="mx-auto max-w-lg">
              <DialRunout label="Relógio comparador com os ponteiros de menor e maior valor" min={dial!.min} max={dial!.max} showValues={hint || answered} />
            </div>
          ) : isCaliper ? (
            <CaliperScales mm={mm} highlight={hint || answered} />
          ) : (
            <MicrometerScales mm={mm} highlight={hint || answered} />
          )}
        </div>
        <figcaption className="mt-1 text-xs text-ink-500">
          Ilustração gerada a partir do valor sorteado.{' '}
          {answered || hint ? (instrument === 'relogio' ? 'A legenda mostra o valor de cada ponteiro.' : 'Os traços usados na leitura estão destacados em laranja.') : ''}
        </figcaption>
      </figure>

      {!answered && (
        <button className="btn-ghost btn-sm mt-3" onClick={() => setHint(true)} disabled={hint} aria-pressed={hint}>
          <Lightbulb className="h-4 w-4" aria-hidden /> {hint ? 'Dica ativa (esta leitura vale metade)' : 'Mostrar dica (vale metade dos pontos)'}
        </button>
      )}

      {q.answerMode === 'choice' ? (
        <fieldset className="mt-4" disabled={answered}>
          <legend className="field-label">Escolha a leitura</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {q.options.map((o) => {
              const isPicked = picked === o.value;
              const isRight = o.value === q.reading.value;
              const state = !answered ? '' : isRight ? 'border-emerald-500 bg-emerald-950' : isPicked ? 'border-red-500 bg-red-950' : 'opacity-60';
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => answer(o.value)}
                  aria-pressed={isPicked}
                  className={`min-h-[48px] rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 font-mono text-base text-ink-100 hover:border-ink-500 disabled:cursor-default ${state}`}
                >
                  {fmtMm(o.value)}
                  {answered && isRight && <span className="sr-only"> (correta)</span>}
                  {answered && isPicked && !isRight && <span className="sr-only"> (sua resposta)</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <form className="mt-4" onSubmit={submitTyped} noValidate>
          <label htmlFor="leitura" className="field-label">
            Digite a leitura em milímetros
          </label>
          <div className="flex gap-2">
            <input
              id="leitura"
              className="input max-w-[12rem] font-mono"
              inputMode="decimal"
              autoComplete="off"
              placeholder="ex.: 12,35"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={answered}
              aria-invalid={Boolean(typedError)}
              aria-describedby={typedError ? 'leitura-erro' : 'leitura-dica'}
            />
            <button className="btn-primary" disabled={answered}>
              Conferir
            </button>
          </div>
          {typedError ? (
            <p id="leitura-erro" className="field-error" role="alert">
              {typedError}
            </p>
          ) : (
            <p id="leitura-dica" className="field-hint">
              Use vírgula ou ponto. Duas casas decimais: {isCaliper ? 'o paquímetro lê de 0,05 em 0,05 mm' : 'o micrômetro lê centésimos'}.
            </p>
          )}
        </form>
      )}

      {answered && last && (
        <div ref={feedbackRef} tabIndex={-1} className="card mt-5 p-4 outline-none" role="region" aria-label="Resultado da leitura">
          <p className={`flex items-center gap-2 font-semibold ${last.correct ? 'text-emerald-400' : 'text-red-400'}`}>
            {last.correct ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <XCircle className="h-5 w-5" aria-hidden />}
            {last.correct
              ? `Certo: ${fmtMm(q.reading.value)}${last.hintUsed ? ' (com dica)' : ''}`
              : `Você marcou ${fmtMm(picked!)}; a leitura é ${fmtMm(q.reading.value)}`}
          </p>
          {!last.correct && <MistakeNote id={last.mistake} />}
          <ol className="mt-3 space-y-1 text-sm text-ink-300">
            {explain(q.reading).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button className="btn-primary mt-4" onClick={next}>
            {index + 1 < questions.length ? 'Próxima leitura' : 'Ver resultado'} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </Page>
  );
};

const MistakeNote: React.FC<{ id: MistakeId | null }> = ({ id }) =>
  id ? (
    <p className="mt-2 text-sm text-ink-300">
      <span className="font-medium text-ink-100">Engano provável: {MISTAKE_TEXT[id].title.toLowerCase()}.</span> {MISTAKE_TEXT[id].fix}
    </p>
  ) : (
    <p className="mt-2 text-sm text-ink-300">Confira de novo cada escala seguindo o passo a passo abaixo.</p>
  );

/* ───────────── Resultado ───────────── */

const Results: React.FC<{
  levelId: LevelDef['id'];
  answers: AnswerRecord[];
  previousBest: number | undefined;
  onExit: () => void;
  onPlay: (level: LevelDef['id']) => void;
}> = ({ levelId, answers, previousBest, onExit, onPlay }) => {
  const result = scoreRound(levelId, answers);
  const level = LEVELS_BY_ID[levelId];
  const nextLevel = LEVELS_BY_ID[levelId + 1];
  const newRecord = previousBest === undefined ? result.score > 0 : result.score > previousBest;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <Page width="reading">
      <p className="font-mono text-xs uppercase text-ink-400">
        Nível {level.id} · {level.title}
      </p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold text-ink-100 outline-none">
        {result.passed ? 'Nível concluído' : result.correct >= PASS_MIN - 2 ? 'Quase lá' : 'Continue praticando'}
      </h1>
      <p className="mt-1 text-ink-300">
        {result.correct} de {result.total} leituras certas · {result.score} de {result.maxScore} pontos
        {newRecord && result.score > 0 ? ' · novo recorde pessoal' : previousBest !== undefined ? ` · recorde: ${Math.max(previousBest, result.score)}` : ''}
      </p>
      {!result.passed && <p className="mt-2 text-sm text-ink-400">Para concluir o nível são {PASS_MIN} leituras certas de {QUESTIONS_PER_ROUND}. Cada rodada sorteia medidas novas.</p>}

      {result.mistakes.length > 0 && (
        <section className="card mt-5 p-4" aria-labelledby="h-enganos">
          <h2 id="h-enganos" className="font-semibold text-ink-100">
            O que revisar
          </h2>
          <ul className="mt-2 space-y-3 text-sm">
            {result.mistakes.map((m) => (
              <li key={m.id}>
                <span className="font-medium text-ink-200">
                  {MISTAKE_TEXT[m.id].title} {m.count > 1 ? `(${m.count} vezes)` : ''}
                </span>
                <span className="block text-ink-400">{MISTAKE_TEXT[m.id].fix}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {result.passed && nextLevel ? (
          <button className="btn-primary" onClick={() => onPlay(nextLevel.id)}>
            Nível {nextLevel.id}: {nextLevel.title} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button className="btn-primary" onClick={() => onPlay(levelId)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Nova rodada
          </button>
        )}
        {result.passed && nextLevel && (
          <button className="btn-secondary" onClick={() => onPlay(levelId)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Repetir este nível
          </button>
        )}
        <button className="btn-secondary" onClick={onExit}>
          <Ruler className="h-4 w-4" aria-hidden /> Escolher nível
        </button>
      </div>
    </Page>
  );
};
