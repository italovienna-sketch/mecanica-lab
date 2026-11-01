import { MISSION_IDS, MissionId } from './meta';
import type { ReviewCard } from './review';

/**
 * Controle do instrutor sobre a jornada. Sem backend: fica no navegador e viaja por um link de turma.
 * O link é uma configuração didática, não um mecanismo de segurança (qualquer um pode editar a própria cópia).
 */

export interface CourseConfig {
  /** Missões fora do ar para esta turma: somem do mapa e deixam de travar a seguinte. */
  hiddenMissions: string[];
  /** Nota mínima por critério na avaliação prática (segurança continua exigindo 100). */
  passScore: number;
  /** Cartões de revisão desligados. */
  disabledCards: string[];
  /** Perguntas de revisão escritas pelo instrutor. */
  customCards: ReviewCard[];
  /** Recado do instrutor mostrado no topo das missões. */
  note: string;
}

export const DEFAULT_COURSE_CONFIG: CourseConfig = { hiddenMissions: [], passScore: 70, disabledCards: [], customCards: [], note: '' };

export const MIN_PASS = 50;
export const MAX_PASS = 90;
const MAX_CUSTOM = 12;
const KEY = 'mecanica_lab_course_config_v1';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function customCard(v: unknown): ReviewCard | null {
  if (!isObj(v)) return null;
  const prompt = text(v.prompt, 240);
  const options = Array.isArray(v.options) ? v.options.map((o) => text(o, 120)).filter(Boolean).slice(0, 4) : [];
  const from = MISSION_IDS.includes(v.from as MissionId) ? (v.from as MissionId) : 'os-01';
  if (!prompt || options.length < 2) return null;
  return {
    id: typeof v.id === 'string' && v.id.startsWith('inst-') ? v.id.slice(0, 40) : `inst-${prompt.length}-${options.join('').length}`,
    from,
    skill: 'procedimento',
    prompt,
    options,
    explanation: text(v.explanation, 300) || 'Pergunta do instrutor: confira o raciocínio com a turma.'
  };
}

/** Saneia uma configuração vinda do navegador, de um link ou de um formulário. */
export function normalizeCourseConfig(v: unknown): CourseConfig {
  if (!isObj(v)) return DEFAULT_COURSE_CONFIG;
  const score = typeof v.passScore === 'number' && Number.isFinite(v.passScore) ? Math.round(v.passScore) : DEFAULT_COURSE_CONFIG.passScore;
  return {
    hiddenMissions: Array.isArray(v.hiddenMissions) ? v.hiddenMissions.filter((m): m is string => MISSION_IDS.includes(m as MissionId)) : [],
    passScore: Math.max(MIN_PASS, Math.min(MAX_PASS, score)),
    disabledCards: Array.isArray(v.disabledCards) ? v.disabledCards.filter((c): c is string => typeof c === 'string').slice(0, 100) : [],
    customCards: Array.isArray(v.customCards) ? v.customCards.map(customCard).filter((c): c is ReviewCard => c !== null).slice(0, MAX_CUSTOM) : [],
    note: text(v.note, 280)
  };
}

export function loadCourseConfig(): CourseConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalizeCourseConfig(JSON.parse(raw));
  } catch {
    // Sem armazenamento ou com dado corrompido: vale o padrão.
  }
  return DEFAULT_COURSE_CONFIG;
}

export function saveCourseConfig(cfg: CourseConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    // Ignora erro de quota: a configuração vale até fechar a página.
  }
}

/** Texto seguro para URL (base64url de JSON em UTF-8). */
export function encodeCourseConfig(cfg: CourseConfig): string {
  const bytes = new TextEncoder().encode(JSON.stringify(cfg));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeCourseConfig(code: string): CourseConfig | null {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return isObj(parsed) ? normalizeCourseConfig(parsed) : null;
  } catch {
    return null;
  }
}
