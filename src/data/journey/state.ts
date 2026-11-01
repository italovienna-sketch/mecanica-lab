import type { JourneyState, MistakeEntry, ReviewCardState, BenchRun, StartupRun, AssessmentRun } from './meta';
import { EMPTY_JOURNEY } from './meta';

/**
 * Regras puras do registro da jornada (sem React). O contexto só aplica estas funções sobre o perfil.
 * Testadas em tests/e2e/journey.spec.ts, sem abrir página.
 */

const MAX_RUNS = 30;
const MAX_MISTAKES = 60;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const list = <T,>(v: unknown, item: (x: Obj) => T | null): T[] =>
  Array.isArray(v) ? v.filter(isObj).map(item).filter((x): x is T => x !== null) : [];

/** Saneia o que veio do navegador ou de um arquivo importado: item ruim é descartado, o resto continua. */
export function normalizeJourney(v: unknown): JourneyState {
  if (!isObj(v)) return EMPTY_JOURNEY;
  const missions: JourneyState['missions'] = {};
  if (isObj(v.missions)) {
    for (const [k, m] of Object.entries(v.missions)) {
      if (!isObj(m)) continue;
      missions[k] = {
        steps: Array.isArray(m.steps) ? m.steps.filter((s): s is string => typeof s === 'string') : [],
        ...(typeof m.completedAt === 'number' ? { completedAt: m.completedAt } : {})
      };
    }
  }
  const review: JourneyState['review'] = {};
  if (isObj(v.review)) {
    for (const [k, c] of Object.entries(v.review)) {
      if (!isObj(c)) continue;
      review[k] = { box: Math.max(0, Math.min(4, Math.round(num(c.box)))), dueAt: num(c.dueAt), lapses: Math.max(0, num(c.lapses)), seen: Math.max(0, num(c.seen)), lastAt: num(c.lastAt) };
    }
  }
  return {
    missions,
    review,
    benchRuns: list(v.benchRuns, (r) =>
      isObj(r.decisions)
        ? {
            at: num(r.at),
            variant: num(r.variant),
            findingsFirstTry: num(r.findingsFirstTry),
            findingsTotal: num(r.findingsTotal),
            decisions: r.decisions as BenchRun['decisions']
          }
        : null
    ).slice(-MAX_RUNS),
    startupRuns: list(v.startupRuns, (r) => ({
      at: num(r.at),
      variant: num(r.variant),
      healthy: r.healthy === true,
      released: r.released === true,
      correctCall: r.correctCall === true,
      sequenceErrors: num(r.sequenceErrors)
    })).slice(-MAX_RUNS),
    assessmentRuns: list(v.assessmentRuns, (r) =>
      isObj(r.criteria)
        ? { at: num(r.at), variant: num(r.variant), criteria: r.criteria as AssessmentRun['criteria'], passed: r.passed === true, critical: r.critical === true }
        : null
    ).slice(-MAX_RUNS),
    mistakes: list(v.mistakes, (m) =>
      typeof m.id === 'string' && typeof m.text === 'string'
        ? ({
            id: m.id,
            at: num(m.at),
            area: typeof m.area === 'string' ? m.area : '',
            skill: (typeof m.skill === 'string' ? m.skill : 'procedimento') as MistakeEntry['skill'],
            text: m.text,
            why: typeof m.why === 'string' ? m.why : '',
            count: Math.max(1, num(m.count, 1)),
            ...(typeof m.resolvedAt === 'number' ? { resolvedAt: m.resolvedAt } : {})
          } as MistakeEntry)
        : null
    ).slice(-MAX_MISTAKES)
  };
}

export function addMissionStep(j: JourneyState, missionId: string, stepId: string): JourneyState {
  const cur = j.missions[missionId] ?? { steps: [] };
  if (cur.steps.includes(stepId)) return j;
  return { ...j, missions: { ...j.missions, [missionId]: { ...cur, steps: [...cur.steps, stepId] } } };
}

export function markMissionCompleted(j: JourneyState, missionId: string, at: number): JourneyState {
  const cur = j.missions[missionId] ?? { steps: [] };
  if (cur.completedAt) return j;
  return { ...j, missions: { ...j.missions, [missionId]: { ...cur, completedAt: at } } };
}

export const addBenchRun = (j: JourneyState, run: BenchRun): JourneyState => ({ ...j, benchRuns: [...j.benchRuns, run].slice(-MAX_RUNS) });
export const addStartupRun = (j: JourneyState, run: StartupRun): JourneyState => ({ ...j, startupRuns: [...j.startupRuns, run].slice(-MAX_RUNS) });
export const addAssessmentRun = (j: JourneyState, run: AssessmentRun): JourneyState => ({ ...j, assessmentRuns: [...j.assessmentRuns, run].slice(-MAX_RUNS) });

/** Repetir o mesmo erro conta de novo e o traz de volta para as pendências. */
export function addMistake(j: JourneyState, m: Omit<MistakeEntry, 'count' | 'at'>, at: number): JourneyState {
  const cur = j.mistakes.find((x) => x.id === m.id);
  const entry: MistakeEntry = { ...m, at, count: (cur?.count ?? 0) + 1 };
  return { ...j, mistakes: [...j.mistakes.filter((x) => x.id !== m.id), entry].slice(-MAX_MISTAKES) };
}

export function resolveMistakes(j: JourneyState, ids: string[], at: number): JourneyState {
  if (!j.mistakes.some((m) => ids.includes(m.id) && !m.resolvedAt)) return j;
  return { ...j, mistakes: j.mistakes.map((m) => (ids.includes(m.id) && !m.resolvedAt ? { ...m, resolvedAt: at } : m)) };
}

/** Intervalos das caixas de Leitner, em dias. Errar volta para a primeira caixa; acertar sobe uma. */
export const LEITNER_DAYS = [1, 3, 7, 14, 30];
const DAY = 86_400_000;

export function nextCardState(cur: ReviewCardState | undefined, correct: boolean, now: number): ReviewCardState {
  const box = correct ? Math.min((cur ? cur.box + 1 : 1), LEITNER_DAYS.length - 1) : 0;
  return {
    box,
    dueAt: now + LEITNER_DAYS[box] * DAY,
    lapses: (cur?.lapses ?? 0) + (correct ? 0 : 1),
    seen: (cur?.seen ?? 0) + 1,
    lastAt: now
  };
}

export function addReviewAnswer(j: JourneyState, cardId: string, correct: boolean, now: number): JourneyState {
  return { ...j, review: { ...j.review, [cardId]: nextCardState(j.review[cardId], correct, now) } };
}
