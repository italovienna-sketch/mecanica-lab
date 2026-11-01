import type { DiagnosisRun } from '../data/diagnosis/meta';
import type { JourneyState } from '../data/journey/meta';

export type GameScreen = 
  | 'landing' 
  | 'character' 
  | 'workshop' 
  | 'lab' 
  | 'tools'
  | 'quiz' 
  | 'progress' 
  | 'teacher'
  | 'courses'
  | 'practice'
  | 'micro'
  | 'games'
  | 'industry'
  | 'diagnosis'
  | 'machine'
  | 'missions'
  | 'drawing'
  | 'library'
  | 'notfound';

export type GraphicsQuality = 'high' | 'low';

export type TextSize = 'normal' | 'large';

/** Aparência: claro (padrão, melhor para leitura), escuro ou igual ao sistema. */
export type ThemePreference = 'light' | 'dark' | 'system';

export type AvatarStylePreset = 'escola_tradicional' | 'casual_urbano' | 'gotico_alternativo' | 'colorido_criativo' | 'industrial_pesado';

export interface AvatarCustomization {
  skinTone: string;
  headShape: 'oval' | 'redondo' | 'angular';
  eyeStyle: 'padrao' | 'amendoado' | 'expressivo' | 'sereno';
  eyeColor: string;
  eyebrowStyle: 'natural' | 'arqueada' | 'marcada' | 'reta';
  hairStyle: 'curto' | 'militar' | 'cacheado' | 'longo_solto' | 'preso' | 'coque' | 'franja_alt';
  hairColor: string;
  makeupStyle: 'nenhuma' | 'delineado_sutil' | 'batom_suave' | 'gotico_marcante' | 'sombra_colorida';
  lipstickColor: string;
  stylePreset: AvatarStylePreset;
  uniformType: 'aluno_tecnico' | 'mecanico_geral' | 'ajustador' | 'inspetor_qualidade' | 'manutencao_pesada' | 'jaqueta_gotica' | 'moletom_casual';
  uniformColor: string;
  trousersColor: string;
  shoeStyle: 'tenis_escolar' | 'bota_composite' | 'coturno_alt';
  shoeColor: string;
  helmetType: 'capacete_epi' | 'bone_oficina' | 'sem_capacete';
  helmetColor: string;
  hasSafetyGlasses: boolean;
  hasEarMuffs: boolean;
  accessoryType: 'nenhum' | 'cracha_escolar' | 'colar_alt' | 'relogio_tecnico';
  vestType: 'nenhum' | 'faixa_refletiva' | 'colete_seguranca';
}

export interface QuizAttemptRecord {
  quizId: string;
  score: number;
  total: number;
  attemptsCount?: number;
  bestScore?: number;
  completedAt: number;
}

/** Uma sessão curta de prática (tela "Praticar"). */
export interface PracticeSessionRecord {
  id: string;
  topicId: string;
  correct: number;
  total: number;
  questionIds: string[];
  wrongQuestionIds: string[];
  completedAt: number;
}

/** Progresso por aula: etapas A–F vistas e resultado da verificação. */
export interface LessonProgressRecord {
  stagesDone: string[];
  completed: boolean;
  bestScore: number;
  lastScore: number;
  total: number;
  attempts: number;
  completedAt?: number;
}

/** Acertos/tentativas por habilidade (alimenta "Áreas para revisar"). */
export interface SkillStat {
  correct: number;
  total: number;
}

/** Aula rápida (micro-aula) concluída: assistiu à demonstração e respondeu à pergunta. */
export interface MicroLessonRecord {
  /** Momento do primeiro acerto da pergunta rápida. Sem valor = ainda não concluída. */
  completedAt?: number;
  /** Acertou a pergunta rápida já na primeira tentativa. */
  correctFirstTry: boolean;
  attempts: number;
}

/** Resultado de uma rodada de mini-jogo (desafio). */
export interface GameRoundRecord {
  solved: boolean;
  /** Resolvida sem erros (usada como "melhor resultado", não como punição). */
  firstTry: boolean;
  attempts: number;
  /** Pontuação da melhor tentativa (0–100), quando o jogo calcula. */
  bestScore?: number;
}

export interface GameResultRecord {
  rounds: Record<string, GameRoundRecord>;
  lastPlayedAt: number;
}

export interface PlayerProfile {
  name: string;
  avatarId: string;
  role: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  completedTasks: string[];
  inspectedItems: string[];
  masteredTools: string[];
  customization: AvatarCustomization;
  completedQuizzes: QuizAttemptRecord[];
  unlockedAchievements: string[];
  disassemblyCompleted: boolean;
  reassemblyCompleted: boolean;
  pumpDisassemblyCompleted: boolean;
  pumpReassemblyCompleted: boolean;
  completedMissions: string[];
  lastMachineId: string;
  onboardingCompleted: boolean;
  practiceSessions: PracticeSessionRecord[];
  lessonProgress: Record<string, LessonProgressRecord>;
  skillStats: Record<string, SkillStat>;
  /** Etapas concluídas na missão guiada de cada máquina do laboratório 3D. */
  labMissionStages: Record<string, string[]>;
  /** Aulas rápidas concluídas (micro-aulas). */
  microLessons: Record<string, MicroLessonRecord>;
  /** Resultados dos desafios (mini-jogos), por jogo e por rodada. */
  gameResults: Record<string, GameResultRecord>;
  /** Tentativas na Oficina de Diagnóstico (as mais recentes). */
  diagnosisRuns: DiagnosisRun[];
  /** Perguntas de verificação da Máquina interativa, por componente (correct = já acertou alguma vez). */
  componentChecks: Record<string, { correct: boolean; at: number }>;
  /** Jornada da bomba P-101: etapas demonstradas, bancada, partida, avaliação, revisão e caderno de erros. */
  journey: JourneyState;
  lastActivity?: { screen: GameScreen; param?: string; label: string; at: number };
}

export interface PlayerPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'xp';
  timestamp: number;
}

export interface InstructorSession {
  authenticated: boolean;
  instructorName: string;
  role: 'instructor' | 'developer_admin';
  token: string;
  expiresAt: number;
}

