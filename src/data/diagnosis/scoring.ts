/**
 * Oficina de Diagnóstico — pontuação determinística (0–100), sem tempo e sem sorteio.
 * Mesmas escolhas → mesma nota. Cada parcela tem um teto e o total é limitado a 0–100.
 *
 *   Evidências (25)    testes-chave feitos ÷ testes-chave do caso
 *   Diagnóstico (25)   causa certa 25; causa relacionada mas incompleta 10; outra 0
 *   Justificativa (15) evidências marcadas que sustentam a causa escolhida; −4 por evidência que a contradiz ou não tem relação
 *   Ação (20)          correta 20; parcial 10; desnecessária, incorreta ou insegura 0
 *   Segurança (10)     −5 por teste inseguro escolhido; ação insegura zera
 *   Eficiência (5)     −2 por desmontagem sem indício (teste intrusivo)
 *   Dicas              −2 por dica usada (máx. 3)
 */

import { Action, ActionKind, DiagnosisCase } from './cases';
import { PASS_SCORE } from './meta';

export const WEIGHTS = { evidence: 25, diagnosis: 25, reasoning: 15, action: 20, safety: 10, efficiency: 5 } as const;
export const HINT_COST = 2;
export const MAX_HINTS = 3;

export interface Attempt {
  /** Testes escolhidos, na ordem (inclui os inseguros, que não são realizados). */
  tests: string[];
  causeId: string | null;
  /** Testes marcados como evidência da causa escolhida. */
  evidence: string[];
  actionId: string | null;
  hintsUsed: number;
}

export interface ScoreLine {
  key: keyof typeof WEIGHTS | 'hints';
  label: string;
  points: number;
  max: number;
  note: string;
}

export interface CaseResult {
  total: number;
  lines: ScoreLine[];
  passed: boolean;
  causeCorrect: boolean;
  actionKind: ActionKind | null;
  unsafeTests: string[];
  unsafeChoices: number;
  keyFound: string[];
  keyMissed: string[];
  intrusive: string[];
  /** Evidências marcadas que não sustentam a causa escolhida. */
  weakEvidence: string[];
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const uniq = (ids: string[]) => [...new Set(ids)];

/** Resultado de escolher um teste: realizado (com resultado) ou recusado por ser inseguro. */
export function runTest(c: DiagnosisCase, testId: string) {
  const test = c.tests.find((t) => t.id === testId);
  if (!test) throw new Error(`Teste desconhecido: ${testId}`);
  return { test, performed: test.safety !== 'inseguro' };
}

/** Testes que entram como evidência (realizados, sem repetição). */
export function performedTests(c: DiagnosisCase, tests: string[]) {
  return uniq(tests).filter((id) => runTest(c, id).performed);
}

export function scoreCase(c: DiagnosisCase, a: Attempt): CaseResult {
  const performed = performedTests(c, a.tests);
  const unsafeTests = uniq(a.tests).filter((id) => !runTest(c, id).performed);
  const keys = c.tests.filter((t) => t.relevance === 'chave').map((t) => t.id);
  const keyFound = keys.filter((k) => performed.includes(k));
  const keyMissed = keys.filter((k) => !performed.includes(k));
  const intrusive = performed.filter((id) => c.tests.find((t) => t.id === id)!.relevance === 'intrusivo');

  const cause = c.causes.find((x) => x.id === a.causeId) ?? null;
  const causeCorrect = cause?.id === c.correctCause;
  const action: Action | null = c.actions.find((x) => x.id === a.actionId) ?? null;
  const actionKind = action?.kind ?? null;

  // Evidência só conta se o teste foi realizado.
  const marked = uniq(a.evidence).filter((id) => performed.includes(id));
  const supporting = cause ? c.tests.filter((t) => t.supports?.includes(cause.id)).map((t) => t.id) : [];
  const good = marked.filter((id) => supporting.includes(id));
  const weakEvidence = marked.filter((id) => !supporting.includes(id));

  const evidence = Math.round((WEIGHTS.evidence * keyFound.length) / Math.max(1, keys.length));
  const diagnosis = causeCorrect ? WEIGHTS.diagnosis : cause?.partial ? 10 : 0;
  const reasoning = clamp(
    Math.round((WEIGHTS.reasoning * good.length) / Math.max(1, supporting.length)) - 4 * weakEvidence.length,
    0,
    WEIGHTS.reasoning
  );
  const actionPts = actionKind === 'correta' ? WEIGHTS.action : actionKind === 'parcial' ? 10 : 0;
  const safety = actionKind === 'insegura' ? 0 : clamp(WEIGHTS.safety - 5 * unsafeTests.length, 0, WEIGHTS.safety);
  const efficiency = clamp(WEIGHTS.efficiency - 2 * intrusive.length, 0, WEIGHTS.efficiency);
  const hints = clamp(a.hintsUsed, 0, MAX_HINTS);

  const lines: ScoreLine[] = [
    { key: 'evidence', label: 'Evidências coletadas', points: evidence, max: WEIGHTS.evidence, note: `${keyFound.length} de ${keys.length} testes-chave feitos` },
    {
      key: 'diagnosis',
      label: 'Causa provável',
      points: diagnosis,
      max: WEIGHTS.diagnosis,
      note: causeCorrect ? 'causa provável certa' : cause?.partial ? 'causa relacionada, mas não a principal' : 'causa não sustentada pelos dados'
    },
    {
      key: 'reasoning',
      label: 'Justificativa',
      points: reasoning,
      max: WEIGHTS.reasoning,
      note: `${good.length} evidência(s) que sustentam a causa escolhida${weakEvidence.length ? `; ${weakEvidence.length} sem relação ou contrária(s)` : ''}`
    },
    {
      key: 'action',
      label: 'Próxima ação',
      points: actionPts,
      max: WEIGHTS.action,
      note: actionKind ? ACTION_KIND_LABEL[actionKind] : 'nenhuma ação escolhida'
    },
    {
      key: 'safety',
      label: 'Segurança',
      points: safety,
      max: WEIGHTS.safety,
      note:
        actionKind === 'insegura'
          ? 'ação insegura escolhida'
          : unsafeTests.length
            ? `${unsafeTests.length} teste(s) inseguro(s) escolhido(s)`
            : 'nenhuma escolha insegura'
    },
    {
      key: 'efficiency',
      label: 'Intervenções sem indício',
      points: efficiency,
      max: WEIGHTS.efficiency,
      note: intrusive.length ? `${intrusive.length} desmontagem(ns) sem indício nos dados` : 'nenhuma desmontagem desnecessária'
    }
  ];
  if (hints) lines.push({ key: 'hints', label: 'Dicas usadas', points: -HINT_COST * hints, max: 0, note: `${hints} dica(s) × ${HINT_COST} pontos` });

  const total = clamp(
    lines.reduce((s, l) => s + l.points, 0),
    0,
    100
  );
  const unsafeChoices = unsafeTests.length + (actionKind === 'insegura' ? 1 : 0);
  const passed = causeCorrect && (actionKind === 'correta' || actionKind === 'parcial') && total >= PASS_SCORE;

  return { total, lines, passed, causeCorrect, actionKind, unsafeTests, unsafeChoices, keyFound, keyMissed, intrusive, weakEvidence };
}

export const ACTION_KIND_LABEL: Record<ActionKind, string> = {
  correta: 'ação correta',
  parcial: 'ação parcial (resolve só em parte)',
  desnecessaria: 'ação desnecessária',
  incorreta: 'ação incorreta',
  insegura: 'ação insegura'
};

/** Escolhas que garantem a nota máxima (usadas nos testes e no modo de apresentação). */
export function idealAttempt(c: DiagnosisCase): Attempt {
  const keys = c.tests.filter((t) => t.relevance === 'chave').map((t) => t.id);
  const supporting = c.tests.filter((t) => t.supports?.includes(c.correctCause)).map((t) => t.id);
  return {
    tests: uniq([...keys, ...supporting]),
    causeId: c.correctCause,
    evidence: supporting,
    actionId: c.actions.find((x) => x.kind === 'correta')!.id,
    hintsUsed: 0
  };
}
