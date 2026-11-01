import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, ClipboardList, RotateCcw, Target, XCircle } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { EVIDENCE_LABEL, Evidence, FigureId, IndustryMission, MISSION_GAME_PREFIX, MissionTask } from '../../data/industry/industryMissions';
import { ClaimBadge, NotQualificationNote, RefLink } from '../safety/SourceBits';
import { BearingAssemblyDrawing, BearingTempTrend, BeltDriftFigure, PumpSuctionFigure, VibrationTrend } from './TechnicalDrawings';

const FIGURES: Record<FigureId, React.FC> = {
  'bearing-temp-trend': BearingTempTrend,
  'belt-drift': BeltDriftFigure,
  'pump-suction': PumpSuctionFigure,
  'bearing-drawing': () => <BearingAssemblyDrawing />,
  'vibration-trend': VibrationTrend
};

/** Embaralhamento estável por missão/tarefa (a ordem não muda a cada renderização). */
function shuffled<T>(items: T[], seed: string): T[] {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out = items.map((v, i) => ({ v, k: ((h ^ (i * 2654435761)) >>> 0) % 997 }));
  out.sort((a, b) => a.k - b.k);
  const res = out.map((o) => o.v);
  // Nunca apresenta a sequência já na ordem certa.
  if (res.every((v, i) => v === items[i]) && res.length > 1) res.push(res.shift()!);
  return res;
}

const EvidenceCard: React.FC<{ e: Evidence }> = ({ e }) => {
  const Figure = e.figure ? FIGURES[e.figure] : null;
  return (
    <li className={`rounded-xl border border-ink-700 bg-ink-900 p-4 ${Figure ? 'lg:col-span-2' : ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{EVIDENCE_LABEL[e.kind]}</p>
      <p className="mt-0.5 font-semibold text-ink-100">{e.title}</p>
      <p className="mt-1 text-sm text-ink-300">{e.text}</p>
      {Figure && (
        <div className="mt-3">
          <Figure />
        </div>
      )}
    </li>
  );
};

type TaskState = { solved: boolean; attempts: number; feedback: { tone: 'success' | 'error'; lines: string[] } | null };

const TaskView: React.FC<{
  mission: IndustryMission;
  task: MissionTask;
  index: number;
  state: TaskState;
  onResult: (solved: boolean, feedback: string[]) => void;
}> = ({ mission, task, index, state, onResult }) => {
  const [picked, setPicked] = useState<number[]>([]);
  const [order, setOrder] = useState<string[]>(() => (task.type === 'order' ? shuffled(task.items, mission.id + task.id) : []));
  const options = useMemo(() => (task.type === 'order' ? [] : shuffled(task.options, mission.id + task.id)), [mission.id, task]);

  useEffect(() => {
    setPicked([]);
    if (task.type === 'order') setOrder(shuffled(task.items, mission.id + task.id));
  }, [task, mission.id]);

  const check = () => {
    if (task.type === 'choice') {
      const o = options[picked[0]];
      if (!o) return;
      onResult(o.correct, [o.feedback]);
    } else if (task.type === 'multi') {
      const lines: string[] = [];
      let ok = true;
      options.forEach((o, i) => {
        const sel = picked.includes(i);
        if (sel !== o.correct) {
          ok = false;
          lines.push(sel ? `Marcou “${o.text}”: ${o.feedback}` : `Faltou “${o.text}”: ${o.feedback}`);
        }
      });
      onResult(ok, ok ? ['Todas certas.'] : lines);
    } else {
      const wrongAt = order.findIndex((v, i) => v !== task.items[i]);
      onResult(wrongAt === -1, wrongAt === -1 ? ['Sequência correta.'] : [`A partir do passo ${wrongAt + 1} a ordem não está certa. Pense no que precisa acontecer antes.`]);
    }
  };

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  const locked = state.solved;

  return (
    <section className="rounded-xl border border-ink-700 bg-ink-900 p-4 sm:p-5" aria-labelledby={`task-${task.id}`} data-testid={`mission-task-${task.id}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        Tarefa {index + 1} de {mission.tasks.length} · {task.type === 'multi' ? 'marque todas que se aplicam' : task.type === 'order' ? 'coloque em ordem' : 'escolha uma'}
      </p>
      <h3 id={`task-${task.id}`} className="mt-1 text-lg font-semibold text-ink-100">
        {task.prompt}
      </h3>

      {task.type !== 'order' ? (
        <fieldset className="mt-3 space-y-2" disabled={locked}>
          <legend className="sr-only">{task.prompt}</legend>
          {options.map((o, i) => {
            const sel = picked.includes(i);
            return (
              <label
                key={o.text}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                  sel ? 'border-accent bg-accent-soft/40 text-ink-100' : 'border-ink-700 text-ink-200 hover:border-ink-500'
                } ${locked && o.correct ? 'border-emerald-600' : ''}`}
              >
                <input
                  type={task.type === 'multi' ? 'checkbox' : 'radio'}
                  name={`${mission.id}-${task.id}`}
                  className="mt-0.5 accent-[#e8590c]"
                  checked={sel}
                  onChange={() => setPicked(task.type === 'multi' ? (sel ? picked.filter((p) => p !== i) : [...picked, i]) : [i])}
                />
                <span>{o.text}</span>
              </label>
            );
          })}
        </fieldset>
      ) : (
        <ol className="mt-3 space-y-2" aria-label="Sequência (use as setas para mover)">
          {order.map((item, i) => (
            <li key={item} className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-950 p-2.5 text-sm text-ink-200">
              <span className="w-6 shrink-0 text-center font-mono text-ink-400">{i + 1}</span>
              <span className="flex-1">{item}</span>
              <button className="btn-ghost px-1.5" onClick={() => move(i, -1)} disabled={locked || i === 0} aria-label={`Subir: ${item}`}>
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
              <button className="btn-ghost px-1.5" onClick={() => move(i, 1)} disabled={locked || i === order.length - 1} aria-label={`Descer: ${item}`}>
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      )}

      {state.feedback && (
        <div
          role="status"
          className={`mt-3 rounded-lg border p-3 text-sm ${state.feedback.tone === 'success' ? 'border-emerald-700/60 bg-emerald-950/30 text-emerald-100' : 'border-amber-700/60 bg-amber-950/30 text-amber-100'}`}
          data-testid="mission-feedback"
        >
          <p className="flex items-center gap-2 font-semibold">
            {state.feedback.tone === 'success' ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
            {state.feedback.tone === 'success' ? 'Certo.' : 'Ainda não.'}
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {state.feedback.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          {state.feedback.tone === 'success' && <p className="mt-2 text-ink-200">{task.why}</p>}
        </div>
      )}

      {!locked && (
        <button className="btn-primary mt-3" onClick={check} disabled={task.type !== 'order' && picked.length === 0}>
          Conferir
        </button>
      )}
    </section>
  );
};

export const MissionRunner: React.FC<{ mission: IndustryMission; onBack: () => void }> = ({ mission, onBack }) => {
  const { recordGameRound, navigateTo, playerProfile, setLastActivity } = useGameState();
  const gameId = MISSION_GAME_PREFIX + mission.id;
  const saved = playerProfile.gameResults[gameId]?.rounds || {};
  const [states, setStates] = useState<Record<string, TaskState>>(() =>
    Object.fromEntries(mission.tasks.map((t) => [t.id, { solved: false, attempts: 0, feedback: null }]))
  );
  const firstOpen = mission.tasks.findIndex((t) => !states[t.id].solved);
  const current = firstOpen === -1 ? mission.tasks.length : firstOpen;
  const done = current >= mission.tasks.length;
  const previouslyDone = mission.tasks.every((t) => saved[t.id]?.solved);

  useEffect(() => {
    setLastActivity('industry', `Missão: ${mission.title}`, mission.id);
  }, [mission.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onResult = (task: MissionTask) => (solved: boolean, lines: string[]) => {
    const prev = states[task.id];
    setStates((s) => ({ ...s, [task.id]: { solved, attempts: prev.attempts + 1, feedback: { tone: solved ? 'success' : 'error', lines } } }));
    recordGameRound(gameId, task.id, { solved, firstTry: solved && prev.attempts === 0 }, [{ skillId: task.skillId, correct: solved }]);
  };

  const mistakes = mission.tasks.reduce((a, t) => a + Math.max(0, states[t.id].attempts - 1), 0);

  return (
    <article className="space-y-5" data-testid="industry-mission">
      <button className="btn-ghost -ml-2 text-sm" onClick={onBack}>
        ← Todas as missões
      </button>
      <header>
        <p className="eyebrow">Missão de manutenção · cenário simulado</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">{mission.title}</h1>
        {previouslyDone && <p className="mt-1 text-sm text-emerald-300">Você já concluiu esta missão antes. Pode refazer para revisar.</p>}
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            <ClipboardList className="h-4 w-4 text-accent" aria-hidden /> Ordem de serviço
          </p>
          <p className="mt-1 text-sm text-ink-300">{mission.situation}</p>
        </div>
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            <Target className="h-4 w-4 text-accent" aria-hidden /> Objetivo
          </p>
          <p className="mt-1 text-sm text-ink-300">{mission.objective}</p>
        </div>
      </div>

      <section aria-labelledby="ev-title">
        <h2 id="ev-title" className="text-lg font-semibold text-ink-100">
          Evidências
        </h2>
        <p className="text-sm text-ink-400">Leia antes das tarefas. Sintomas simulados ajudam a formar hipóteses; a causa se confirma na inspeção real.</p>
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {mission.evidence.map((e) => (
            <EvidenceCard key={e.title} e={e} />
          ))}
        </ul>
      </section>

      <section aria-label="Tarefas" className="space-y-3">
        {mission.tasks.slice(0, Math.min(current + 1, mission.tasks.length)).map((t, i) => (
          <TaskView key={t.id} mission={mission} task={t} index={i} state={states[t.id]} onResult={onResult(t)} />
        ))}
      </section>

      {done && (
        <section className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 p-5" data-testid="mission-complete" aria-labelledby="wrap-title">
          <h2 id="wrap-title" className="flex items-center gap-2 text-lg font-semibold text-emerald-200">
            <CheckCircle2 className="h-5 w-5" aria-hidden /> Missão concluída
          </h2>
          <p className="mt-1 text-sm text-ink-300">
            {mistakes === 0 ? 'Todas as tarefas certas na primeira tentativa.' : `Você precisou de ${mistakes} tentativa(s) a mais. Cada tentativa conta no seu progresso: habilidades com menos de 60% de acerto aparecem em "Para revisar".`}
          </p>
          <p className="mt-3 text-ink-200">{mission.wrapUp}</p>
          <h3 className="mt-4 text-sm font-semibold text-ink-100">Na vida real</h3>
          <ul className="mt-2 space-y-2">
            {mission.realWorld.map((n) => (
              <li key={n.text} className="flex flex-wrap items-start gap-2 text-sm text-ink-300">
                <ClaimBadge kind={n.kind} />
                <span className="flex-1">{n.text}</span>
                {n.ref && <RefLink r={n.ref} />}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {mission.next.map((l) => (
              <button key={l.label} className="btn-secondary" onClick={() => navigateTo(l.screen, l.param)}>
                {l.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ))}
            <button
              className="btn-ghost"
              onClick={() => setStates(Object.fromEntries(mission.tasks.map((t) => [t.id, { solved: false, attempts: 0, feedback: null }])))}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
            </button>
          </div>
          <NotQualificationNote className="mt-4" />
        </section>
      )}
    </article>
  );
};
