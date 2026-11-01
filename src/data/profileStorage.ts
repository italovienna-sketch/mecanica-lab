import type { AvatarCustomization, GameResultRecord, PlayerProfile } from '../types/game';
import type { DiagnosisRun } from './diagnosis/meta';
import { normalizeJourney } from './journey/state';

/**
 * Validação do perfil salvo no navegador e do arquivo de progresso (exportar/importar).
 * Tudo que vier malformado é descartado item a item: um registro ruim não derruba a página nem apaga o resto.
 */

export const EXPORT_FORMAT = 'mecanica-lab-progresso';
export const EXPORT_VERSION = 1;
/** Limite do arquivo importado (o progresso real fica bem abaixo disso). */
export const MAX_IMPORT_BYTES = 2_000_000;
const MAX_DIAGNOSIS_RUNS = 50;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const strArr = (v: unknown, fallback: string[] = []) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : fallback);
const objOf = <T,>(v: unknown, item: (x: unknown) => T | null): Record<string, T> => {
  if (!isObj(v)) return {};
  const out: Record<string, T> = {};
  for (const [k, x] of Object.entries(v)) {
    const ok = item(x);
    if (ok !== null) out[k] = ok;
  }
  return out;
};

function gameResult(v: unknown): GameResultRecord | null {
  if (!isObj(v)) return null;
  return {
    lastPlayedAt: num(v.lastPlayedAt),
    rounds: objOf(v.rounds, (r) =>
      isObj(r)
        ? {
            solved: r.solved === true,
            firstTry: r.firstTry === true,
            attempts: Math.max(0, Math.round(num(r.attempts))),
            ...(typeof r.bestScore === 'number' && Number.isFinite(r.bestScore) ? { bestScore: r.bestScore } : {})
          }
        : null
    )
  };
}

function diagnosisRun(v: unknown): DiagnosisRun | null {
  if (!isObj(v) || typeof v.caseId !== 'string') return null;
  return {
    caseId: v.caseId,
    at: num(v.at),
    score: Math.max(0, Math.min(100, num(v.score))),
    passed: v.passed === true,
    causeCorrect: v.causeCorrect === true,
    actionKind: typeof v.actionKind === 'string' ? v.actionKind : '',
    unsafeChoices: Math.max(0, Math.round(num(v.unsafeChoices))),
    hintsUsed: Math.max(0, Math.round(num(v.hintsUsed))),
    testsUsed: Math.max(0, Math.round(num(v.testsUsed)))
  };
}

/** Normaliza um perfil vindo do localStorage ou de um arquivo. Devolve null se não for um objeto. */
export function normalizeProfile(parsed: unknown, initial: PlayerProfile, defaultCustomization: AvatarCustomization): PlayerProfile | null {
  if (!isObj(parsed)) return null;
  const p = parsed;
  const customization: AvatarCustomization = { ...defaultCustomization, ...(isObj(p.customization) ? (p.customization as Partial<AvatarCustomization>) : {}) };
  return {
    ...initial,
    ...(p as Partial<PlayerProfile>),
    name: typeof p.name === 'string' && p.name.trim() ? p.name.slice(0, 60) : 'Aprendiz',
    level: Math.max(1, Math.round(num(p.level, initial.level))),
    xp: Math.max(0, num(p.xp, initial.xp)),
    xpForNextLevel: Math.max(1, num(p.xpForNextLevel, initial.xpForNextLevel)),
    customization,
    completedTasks: strArr(p.completedTasks),
    inspectedItems: strArr(p.inspectedItems),
    masteredTools: strArr(p.masteredTools),
    completedQuizzes: Array.isArray(p.completedQuizzes) ? p.completedQuizzes.filter(isObj) as unknown as PlayerProfile['completedQuizzes'] : [],
    unlockedAchievements: strArr(p.unlockedAchievements, ['ach-welcome']),
    disassemblyCompleted: Boolean(p.disassemblyCompleted),
    reassemblyCompleted: Boolean(p.reassemblyCompleted),
    pumpDisassemblyCompleted: Boolean(p.pumpDisassemblyCompleted),
    pumpReassemblyCompleted: Boolean(p.pumpReassemblyCompleted),
    completedMissions: strArr(p.completedMissions),
    lastMachineId: typeof p.lastMachineId === 'string' ? p.lastMachineId : 'centrifugal-pump',
    // Perfis salvos antes desta versão já passaram pela criação do personagem.
    onboardingCompleted: p.onboardingCompleted !== false,
    practiceSessions: Array.isArray(p.practiceSessions)
      ? (p.practiceSessions.filter((s) => isObj(s) && typeof s.topicId === 'string' && Number.isFinite(s.correct) && Number.isFinite(s.total)) as unknown as PlayerProfile['practiceSessions'])
      : [],
    lessonProgress: objOf(p.lessonProgress, (x) => (isObj(x) ? (x as unknown as PlayerProfile['lessonProgress'][string]) : null)),
    skillStats: objOf(p.skillStats, (x) => (isObj(x) ? { correct: Math.max(0, num(x.correct)), total: Math.max(0, num(x.total)) } : null)),
    labMissionStages: objOf(p.labMissionStages, (x) => (Array.isArray(x) ? strArr(x) : null)),
    microLessons: objOf(p.microLessons, (x) => (isObj(x) ? (x as unknown as PlayerProfile['microLessons'][string]) : null)),
    gameResults: objOf(p.gameResults, gameResult),
    diagnosisRuns: Array.isArray(p.diagnosisRuns) ? p.diagnosisRuns.map(diagnosisRun).filter((r): r is DiagnosisRun => r !== null).slice(-MAX_DIAGNOSIS_RUNS) : [],
    componentChecks: objOf(p.componentChecks, (x) => (isObj(x) && typeof x.correct === 'boolean' ? { correct: x.correct, at: num(x.at) } : null)),
    journey: normalizeJourney(p.journey),
    lastActivity: isObj(p.lastActivity) && typeof p.lastActivity.screen === 'string' ? (p.lastActivity as unknown as PlayerProfile['lastActivity']) : undefined
  };
}

/** Acrescenta uma tentativa de diagnóstico mantendo só as mais recentes. */
export const appendRun = (runs: DiagnosisRun[], run: DiagnosisRun) => [...runs, run].slice(-MAX_DIAGNOSIS_RUNS);

/** Conteúdo do arquivo exportado: só o progresso (o perfil não tem dados pessoais além do apelido escolhido). */
export function buildExport(profile: PlayerProfile, now = Date.now()) {
  return { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date(now).toISOString(), profile };
}

export type ImportResult = { ok: true; profile: PlayerProfile } | { ok: false; error: string };

/** Lê o texto de um arquivo exportado. Não altera nada: quem chama decide se substitui o progresso. */
export function parseImport(text: string, initial: PlayerProfile, defaultCustomization: AvatarCustomization): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: 'O arquivo é grande demais para ser um progresso do Mecânica Lab.' };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' };
  }
  if (!isObj(data) || data.format !== EXPORT_FORMAT) return { ok: false, error: 'Este arquivo não foi exportado pelo Mecânica Lab.' };
  if (typeof data.version !== 'number' || data.version > EXPORT_VERSION) {
    return { ok: false, error: 'O arquivo é de uma versão mais nova do Mecânica Lab e não pode ser lido aqui.' };
  }
  const profile = normalizeProfile(data.profile, initial, defaultCustomization);
  if (!profile) return { ok: false, error: 'O arquivo não contém um progresso válido.' };
  return { ok: true, profile: { ...profile, onboardingCompleted: true } };
}
