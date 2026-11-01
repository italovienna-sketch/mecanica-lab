/**
 * Jornada da bomba P-101: identificadores e formatos dos registros. Só tipos e constantes curtas, sem texto de conteúdo:
 * o perfil, as trilhas e as competências (pacote principal) importam daqui sem carregar a jornada inteira.
 */

export const MISSION_IDS = ['os-01', 'os-02', 'os-03', 'os-04', 'os-05', 'os-06'] as const;
export type MissionId = (typeof MISSION_IDS)[number];

export type BenchDecision = 'reaproveitar' | 'recondicionar' | 'trocar';

/** Uma passagem pela bancada de inspeção (OS-04). As decisões voltam a contar no teste de partida (OS-05). */
export interface BenchRun {
  at: number;
  variant: number;
  /** Peças com o achado certo na primeira tentativa. */
  findingsFirstTry: number;
  findingsTotal: number;
  /** Decisão por peça: é ela que produz a consequência na partida. */
  decisions: Record<string, BenchDecision>;
}

/** Um teste de partida (OS-05). `correctCall`: liberou o que estava bom ou parou o que estava ruim. */
export interface StartupRun {
  at: number;
  variant: number;
  healthy: boolean;
  released: boolean;
  correctCall: boolean;
  sequenceErrors: number;
}

export const CRITERIA = ['seguranca', 'diagnostico', 'procedimento', 'inspecao'] as const;
export type CriterionId = (typeof CRITERIA)[number];

export const CRITERION_LABEL: Record<CriterionId, string> = {
  seguranca: 'Segurança',
  diagnostico: 'Raciocínio de diagnóstico',
  procedimento: 'Procedimento',
  inspecao: 'Inspeção e medição'
};

/** Uma tentativa da avaliação prática (OS-06). */
export interface AssessmentRun {
  at: number;
  variant: number;
  /** 0–100 por critério. */
  criteria: Record<CriterionId, number>;
  passed: boolean;
  /** Houve escolha insegura: reprova o critério de segurança, qualquer que seja a nota dos outros. */
  critical: boolean;
}

/** Estado de um cartão de revisão espaçada (caixas de Leitner). */
export interface ReviewCardState {
  box: number;
  dueAt: number;
  lapses: number;
  seen: number;
  lastAt: number;
}

/** Entrada do caderno de erros: o que aconteceu e o raciocínio correto, para rever depois. */
export interface MistakeEntry {
  /** Identificador estável do erro: repetir o mesmo erro não cria uma linha nova. */
  id: string;
  at: number;
  /** Onde aconteceu (ex.: "Bancada de inspeção"). */
  area: string;
  /** Competência ligada ao erro. */
  skill: JourneySkill;
  text: string;
  why: string;
  count: number;
  /** Refeito com acerto depois: sai da lista de pendências, mas fica no histórico. */
  resolvedAt?: number;
}

export type JourneySkill = 'seguranca' | 'componentes' | 'procedimento' | 'inspecao' | 'diagnostico' | 'desenho';

export const JOURNEY_SKILL_LABEL: Record<JourneySkill, string> = {
  seguranca: 'Segurança',
  componentes: 'Componentes',
  procedimento: 'Procedimento',
  inspecao: 'Inspeção e medição',
  diagnostico: 'Diagnóstico',
  desenho: 'Desenho técnico'
};

export interface JourneyMissionRecord {
  /** Atividades próprias da jornada já demonstradas (as do Lab 3D ficam em labMissionStages). */
  steps: string[];
  completedAt?: number;
}

export interface JourneyState {
  missions: Record<string, JourneyMissionRecord>;
  benchRuns: BenchRun[];
  startupRuns: StartupRun[];
  assessmentRuns: AssessmentRun[];
  review: Record<string, ReviewCardState>;
  mistakes: MistakeEntry[];
}

export const EMPTY_JOURNEY: JourneyState = { missions: {}, benchRuns: [], startupRuns: [], assessmentRuns: [], review: {}, mistakes: [] };

export const DRAWING_GAME_ID = 'oficina-desenho';
/** Rodadas da Oficina de Desenho: cada grupo concluído conta como uma rodada em “Meu progresso”. */
export const DRAWING_ROUNDS = ['vistas', 'folha', 'prancha', 'cotas', 'simbolos', 'cortes'] as const;
export type DrawingRoundId = (typeof DRAWING_ROUNDS)[number];
