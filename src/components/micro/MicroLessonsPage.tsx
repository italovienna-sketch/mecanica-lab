import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Clock, Lightbulb, PlayCircle, RotateCcw, Target } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { MICRO_GROUPS, MICRO_LESSONS, MICRO_LESSONS_BY_ID, MicroLesson, MicroLink, SAFETY_MICRO_IDS, microDuration } from '../../data/microLessons';
import { LEARNING_PATHS_BY_ID } from '../../data/learningPaths';
import type { SourceId } from '../../data/regulatorySources';
import { Page, PageHeader, ProgressBar } from '../ui';
import { MicroPlayer } from './MicroPlayer';
import { ClaimBadge, NotQualificationNote, RefLink, SourcesFooter } from '../safety/SourceBits';

const fmtMin = (s: number) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60 ? `${s % 60} s` : ''}`.trim());

export const MicroLessonsPage: React.FC = () => {
  const { activeParam } = useGameState();
  const lesson = activeParam ? MICRO_LESSONS_BY_ID[activeParam] : undefined;
  return lesson ? <MicroLessonView key={lesson.id} lesson={lesson} /> : <MicroHub />;
};

/* ───────────────────────── Lista de aulas rápidas ───────────────────────── */

const MicroHub: React.FC = () => {
  const { playerProfile, navigateTo } = useGameState();
  const done = (id: string) => playerProfile.microLessons[id]?.completedAt !== undefined;
  const total = MICRO_LESSONS.length;
  const doneCount = MICRO_LESSONS.filter((m) => done(m.id)).length;
  const firstOpen = MICRO_LESSONS.find((m) => !done(m.id));

  return (
    <Page>
      <PageHeader
        eyebrow="Aulas rápidas"
        title="Um conceito por vez, em poucos minutos"
        description="Assista a uma demonstração curta, responda uma pergunta e siga para a prática. Comece pela segurança."
        actions={
          firstOpen && (
            <button className="btn-primary" onClick={() => navigateTo('micro', firstOpen.id)}>
              <PlayCircle className="h-4 w-4" aria-hidden /> {doneCount ? 'Continuar' : 'Começar pela segurança'}
            </button>
          )
        }
      />
      <div className="mb-6 max-w-md">
        <ProgressBar value={doneCount} max={total} label="Aulas rápidas concluídas" tone="success" />
        <p className="mt-1 text-xs text-ink-400">
          {doneCount} de {total} aulas rápidas concluídas
        </p>
      </div>

      {MICRO_GROUPS.map((g) => (
        <section key={g.id} className="mb-8" aria-labelledby={`g-${g.id}`}>
          <h2 id={`g-${g.id}`} className="text-lg font-semibold text-ink-100">
            {g.title}
          </h2>
          <p className="mb-3 text-sm text-ink-400">{g.description}</p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.ids.map((id, i) => {
              const m = MICRO_LESSONS_BY_ID[id];
              const isDone = done(id);
              return (
                <li key={id}>
                  <button
                    onClick={() => navigateTo('micro', id)}
                    className="card flex h-full w-full flex-col gap-2 p-4 text-left transition-colors hover:border-ink-500"
                  >
                    <span className="flex items-center justify-between gap-2 text-xs text-ink-400">
                      <span className="font-mono">
                        {g.id === 'seguranca' ? `S${i + 1}` : `T${MICRO_LESSONS.findIndex((x) => x.id === id) - SAFETY_MICRO_IDS.length + 1}`}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {fmtMin(microDuration(m))} + pergunta
                      </span>
                    </span>
                    <span className="font-semibold leading-snug text-ink-100">{m.title}</span>
                    <span className="line-clamp-2 text-sm text-ink-400">{m.objective}</span>
                    <span className={`mt-auto inline-flex items-center gap-1.5 text-xs font-medium ${isDone ? 'text-emerald-300' : 'text-ink-500'}`}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                      {isDone ? 'Concluída' : 'Não iniciada'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <NotQualificationNote />
    </Page>
  );
};

/* ───────────────────────── Uma aula rápida ───────────────────────── */

const LETTERS = ['A', 'B', 'C', 'D'];

const MicroLessonView: React.FC<{ lesson: MicroLesson }> = ({ lesson }) => {
  const { navigateTo, playerProfile, recordMicroLesson, reducedMotion, setLastActivity } = useGameState();
  const record = playerProfile.microLessons[lesson.id];
  const alreadyDone = record?.completedAt !== undefined;
  const [questionOpen, setQuestionOpen] = useState(alreadyDone);
  const [chosen, setChosen] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const path = LEARNING_PATHS_BY_ID[lesson.pathId];

  useEffect(() => {
    setLastActivity('micro', `Aula rápida: ${lesson.title}`, lesson.id);
  }, [lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const group = MICRO_GROUPS.find((g) => g.ids.includes(lesson.id));
  const next = useMemo(() => {
    if (!group) return undefined;
    const i = group.ids.indexOf(lesson.id);
    return group.ids[i + 1] ? MICRO_LESSONS_BY_ID[group.ids[i + 1]] : undefined;
  }, [group, lesson.id]);

  // Embaralha as alternativas uma vez por visita, para a correta não ficar sempre na mesma posição.
  const order = useMemo(() => {
    const o = lesson.question.options.map((_, i) => i);
    let seed = lesson.id.length * 7 + new Date().getMinutes();
    for (let i = o.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  }, [lesson]);

  const openQuestion = () => {
    setQuestionOpen(true);
    requestAnimationFrame(() => questionRef.current?.focus());
  };

  const pickedOriginal = chosen !== null ? order[chosen] : null;
  const correct = pickedOriginal === lesson.question.correctIndex;

  const confirm = () => {
    if (chosen === null || confirmed) return;
    setConfirmed(true);
    recordMicroLesson(lesson.id, order[chosen] === lesson.question.correctIndex, lesson.skillId);
  };

  const retry = () => {
    setChosen(null);
    setConfirmed(false);
  };

  const sourceIds = lesson.keyPoints.filter((k) => k.ref).map((k) => k.ref!.source) as SourceId[];
  const go = (l: MicroLink) => navigateTo(l.screen, l.param);
  const solved = alreadyDone || (confirmed && correct);

  return (
    <Page width="reading">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => navigateTo('micro')} className="btn-ghost -ml-3">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Aulas rápidas
        </button>
        {path && (
          <button onClick={() => navigateTo('courses', path.id)} className="btn-ghost text-ink-400">
            <BookOpen className="h-4 w-4" aria-hidden /> Trilha {path.number}: {path.title}
          </button>
        )}
      </div>

      <header className="mb-4">
        <p className="eyebrow flex flex-wrap items-center gap-2">
          Aula rápida · {fmtMin(microDuration(lesson))} de demonstração
          {alreadyDone && (
            <span className="inline-flex items-center gap-1 normal-case tracking-normal text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> concluída
            </span>
          )}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">{lesson.title}</h1>
        <p className="mt-2 flex gap-2 text-base text-ink-300">
          <Target className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
          <span>
            <span className="font-semibold text-ink-200">Objetivo: </span>
            {lesson.objective}
          </span>
        </p>
      </header>

      <MicroPlayer media={lesson.media} title={lesson.title} reducedMotion={reducedMotion} onEnded={openQuestion} />
      <p className="mt-2 text-xs text-ink-500">
        {lesson.media.kind === 'animation'
          ? 'Demonstração animada desenhada no Mecânica Lab (ilustração didática, não é filmagem de procedimento real). Use as setas ← → para trocar de cena e a barra de espaço para pausar.'
          : lesson.media.credit}
      </p>

      <section className="card mt-5 p-5" aria-labelledby="kp-title">
        <h2 id="kp-title" className="text-base font-semibold text-ink-100">
          Pontos-chave
        </h2>
        <ul className="mt-3 space-y-3">
          {lesson.keyPoints.map((k) => (
            <li key={k.text} className="flex flex-col gap-1.5 text-sm text-ink-200 sm:flex-row sm:items-start sm:gap-3">
              <ClaimBadge kind={k.kind} />
              <span className="flex-1 leading-relaxed">
                {k.text} {k.ref && <RefLink r={k.ref} />}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {!questionOpen ? (
        <button className="btn-secondary mt-5 w-full" onClick={openQuestion}>
          Responder a pergunta rápida <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <section className="card mt-5 p-5" aria-labelledby="mq-title">
          <p className="eyebrow">Pergunta rápida</p>
          <h2 id="mq-title" ref={questionRef} tabIndex={-1} className="mt-1 text-lg font-semibold leading-snug text-ink-100 outline-none">
            {lesson.question.prompt}
          </h2>
          <div role="radiogroup" aria-label="Alternativas" className="mt-4 space-y-2">
            {order.map((orig, display) => {
              const isSel = chosen === display;
              const isRight = orig === lesson.question.correctIndex;
              let style = 'border-ink-700 bg-ink-850 hover:border-ink-500';
              if (confirmed && isSel && isRight) style = 'border-emerald-500 bg-emerald-950/40';
              else if (confirmed && isSel) style = 'border-amber-500 bg-amber-950/30';
              else if (confirmed) style = 'border-ink-800 bg-ink-900 opacity-60';
              else if (isSel) style = 'border-accent bg-accent-soft';
              return (
                <button
                  key={orig}
                  role="radio"
                  aria-checked={isSel}
                  disabled={confirmed}
                  onClick={() => setChosen(display)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-base text-ink-100 ${style}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-ink-600 text-sm font-semibold text-ink-300">
                    {LETTERS[display]}
                  </span>
                  <span className="flex-1 pt-0.5">{lesson.question.options[orig]}</span>
                </button>
              );
            })}
          </div>

          {confirmed && pickedOriginal !== null && (
            <div
              role="status"
              className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${correct ? 'border-emerald-700/60 bg-emerald-950/30' : 'border-amber-700/50 bg-amber-950/20'}`}
            >
              <p className={`text-base font-semibold ${correct ? 'text-emerald-300' : 'text-amber-200'}`}>{correct ? 'Correto!' : 'Ainda não. Veja por quê:'}</p>
              <p className="mt-1 text-ink-200">{lesson.question.optionFeedback[pickedOriginal]}</p>
              {correct && <p className="mt-2 text-ink-300">{lesson.question.why}</p>}
              {!correct && (
                <p className="mt-2 flex gap-2 text-ink-300">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Reveja os pontos-chave ou a demonstração e tente de novo.
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {!confirmed && (
              <button className="btn-primary w-full sm:w-auto" disabled={chosen === null} onClick={confirm}>
                Confirmar resposta
              </button>
            )}
            {confirmed && !correct && (
              <button className="btn-primary w-full sm:w-auto" onClick={retry}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Tentar de novo
              </button>
            )}
          </div>
        </section>
      )}

      {solved && (
        <section className="mt-5 rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-5" aria-labelledby="next-title">
          <h2 id="next-title" className="text-base font-semibold text-ink-100">
            Próximo passo
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {lesson.practice && (
              <button className="btn-primary justify-between" onClick={() => go(lesson.practice!)}>
                Praticar: {lesson.practice.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
            {next && (
              <button className="btn-secondary justify-between" onClick={() => navigateTo('micro', next.id)}>
                Próxima aula rápida: {next.title} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
            {lesson.deeper && (
              <button className="btn-ghost justify-between" onClick={() => go(lesson.deeper!)}>
                Aprofundar (opcional): {lesson.deeper.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
            {path && (
              <button className="btn-ghost justify-between" onClick={() => navigateTo('courses', path.id)}>
                Voltar à trilha {path.number} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </section>
      )}

      <SourcesFooter ids={sourceIds} className="mt-6" />
      {lesson.pathId === 'seguranca-oficina' && <NotQualificationNote className="mt-3" />}
    </Page>
  );
};
