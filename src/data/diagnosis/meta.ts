/**
 * Identificadores leves da Oficina de Diagnóstico. O resumo de progresso, as trilhas e as competências (pacote
 * principal) importam daqui sem carregar o texto dos casos.
 */

export const DIAGNOSIS_GAME_ID = 'oficina-diagnostico';

export const DIAGNOSIS_CASES_META = [
  { id: 'motor-vibracao', title: 'Motor com vibração anormal' },
  { id: 'bomba-vazao-baixa', title: 'Bomba centrífuga com vazão reduzida' },
  { id: 'mancal-quente', title: 'Mancal com temperatura alta' }
] as const;

export type DiagnosisCaseId = (typeof DIAGNOSIS_CASES_META)[number]['id'];

export const DIAGNOSIS_CASE_IDS: string[] = DIAGNOSIS_CASES_META.map((c) => c.id);

/** Nota mínima (0–100) para o caso contar como concluído com êxito, além das regras de causa, ação e segurança. */
export const PASS_SCORE = 60;

/** Registro de uma tentativa, guardado no perfil (Passaporte). */
export interface DiagnosisRun {
  caseId: string;
  at: number;
  score: number;
  passed: boolean;
  causeCorrect: boolean;
  /** Tipo da ação escolhida (ver ActionKind). */
  actionKind: string;
  /** Testes inseguros tentados + ação insegura. */
  unsafeChoices: number;
  hintsUsed: number;
  testsUsed: number;
}
