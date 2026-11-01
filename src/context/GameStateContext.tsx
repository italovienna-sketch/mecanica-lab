import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  GameScreen,
  PlayerProfile,
  PlayerPosition,
  GameNotification,
  AvatarCustomization,
  GraphicsQuality,
  InstructorSession,
  TextSize,
  ThemePreference,
  PracticeSessionRecord,
  LessonProgressRecord,
  MicroLessonRecord,
  GameResultRecord
} from '../types/game';
import { SPAWN } from '../game/spawn';
import { appendRun, normalizeProfile, parseImport } from '../data/profileStorage';
import { DIAGNOSIS_GAME_ID, DiagnosisRun } from '../data/diagnosis/meta';
import { AssessmentRun, BenchRun, EMPTY_JOURNEY, MistakeEntry, StartupRun } from '../data/journey/meta';
import { addAssessmentRun, addBenchRun, addMissionStep, addMistake, addReviewAnswer, addStartupRun, markMissionCompleted, resolveMistakes as resolveMistakesIn } from '../data/journey/state';
import { CourseConfig, loadCourseConfig, saveCourseConfig } from '../data/journey/courseConfig';

interface GameStateContextType {
  currentScreen: GameScreen;
  activeParam: string | null;
  playerProfile: PlayerProfile;
  playerPosition: PlayerPosition;
  notifications: GameNotification[];
  soundEnabled: boolean;
  graphicsQuality: GraphicsQuality;
  reducedMotion: boolean;
  textSize: TextSize;
  theme: ThemePreference;
  instructorSession: InstructorSession | null;
  navigateTo: (screen: GameScreen, paramId?: string, options?: { replace?: boolean }) => void;
  updatePlayerPosition: (pos: PlayerPosition) => void;
  updatePlayerName: (name: string) => void;
  updateCustomization: (custom: Partial<AvatarCustomization>) => void;
  randomizeCustomization: () => void;
  resetCustomization: () => void;
  completeOnboarding: (name: string) => void;
  addXp: (amount: number, reason: string) => void;
  completeTask: (taskId: string, taskTitle: string, xpReward: number) => void;
  completeMission: (missionId: string, missionTitle: string, xpReward: number) => void;
  inspectItem: (itemId: string) => void;
  markToolMastered: (toolId: string, toolName: string) => void;
  recordQuizCompletion: (quizId: string, score: number, total: number) => void;
  recordPracticeSession: (
    session: Omit<PracticeSessionRecord, 'id' | 'completedAt'>,
    answers: { skillId: string; correct: boolean }[]
  ) => void;
  recordLessonStage: (lessonId: string, stageId: string) => void;
  recordLessonResult: (
    lessonId: string,
    score: number,
    total: number,
    answers: { skillId: string; correct: boolean }[]
  ) => { passed: boolean };
  recordLabStage: (machineId: string, stageId: string) => void;
  /** Registra a pergunta de uma aula rápida. Conclui a aula na primeira resposta correta. */
  recordMicroLesson: (lessonId: string, correct: boolean, skillId: string) => void;
  /** Registra uma tentativa em uma rodada de desafio. `solved` = rodada resolvida. */
  recordGameRound: (
    gameId: string,
    roundId: string,
    result: { solved: boolean; firstTry: boolean; score?: number },
    answers?: { skillId: string; correct: boolean }[]
  ) => void;
  setLastActivity: (screen: GameScreen, label: string, param?: string) => void;
  markDisassemblyComplete: (machineId?: string) => void;
  markReassemblyComplete: (machineId?: string) => void;
  dismissNotification: (id: string) => void;
  toggleSound: () => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  toggleReducedMotion: () => void;
  setTextSize: (size: TextSize) => void;
  setTheme: (theme: ThemePreference) => void;
  resetLearningProgress: () => void;
  /** Registra uma tentativa na Oficina de Diagnóstico (perfil + desafios + habilidades). */
  recordDiagnosisRun: (run: DiagnosisRun, answers: { skillId: string; correct: boolean }[]) => void;
  /** Resposta à pergunta de verificação de um componente da Máquina interativa. */
  recordComponentCheck: (componentId: string, correct: boolean) => void;
  /** Valida o texto de um arquivo exportado e, se for válido, substitui o progresso. */
  /** Valida o arquivo; com `apply` (padrão) também substitui o progresso. */
  importProgress: (text: string, apply?: boolean) => { ok: true } | { ok: false; error: string };
  setInstructorSession: (session: InstructorSession | null) => void;
  logoutInstructor: () => void;
  /** Jornada da bomba: evidências das atividades. Cada função só acrescenta ao registro. */
  recordMissionStep: (missionId: string, stepId: string) => void;
  recordBenchRun: (run: BenchRun) => void;
  recordStartupRun: (run: StartupRun) => void;
  recordAssessmentRun: (run: AssessmentRun) => void;
  recordReviewAnswer: (cardId: string, correct: boolean) => void;
  logMistake: (entry: Omit<MistakeEntry, 'count' | 'at'>) => void;
  resolveMistakes: (ids: string[]) => void;
  finishJourneyMission: (missionId: string, title: string, xp: number) => void;
  /** Configuração da turma definida pelo instrutor (vale neste navegador). */
  courseConfig: CourseConfig;
  setCourseConfig: (cfg: CourseConfig) => void;
}

const STORAGE_KEY = 'mecanica_lab_profile_v4';
const LEGACY_STORAGE_KEY = 'mecanica_lab_profile_v3';
const SETTINGS_KEY = 'mecanica_lab_settings_v1';
const INSTRUCTOR_SESSION_KEY = 'mecanica_lab_instructor_session_v1';

/** Percentual mínimo para considerar uma aula concluída (verificação de aprendizagem). */
export const LESSON_PASS_RATIO = 0.6;

export const DEFAULT_CUSTOMIZATION: AvatarCustomization = {
  skinTone: '#e0ac69',
  headShape: 'oval',
  eyeStyle: 'padrao',
  eyeColor: '#291709',
  eyebrowStyle: 'natural',
  hairStyle: 'curto',
  hairColor: '#1f2937',
  makeupStyle: 'nenhuma',
  lipstickColor: '#be185d',
  stylePreset: 'escola_tradicional',
  uniformColor: '#f8fafc',
  uniformType: 'aluno_tecnico',
  trousersColor: '#1d4ed8',
  shoeStyle: 'tenis_escolar',
  shoeColor: '#111827',
  helmetType: 'capacete_epi',
  helmetColor: '#eab308',
  hasSafetyGlasses: true,
  hasEarMuffs: true,
  vestType: 'faixa_refletiva',
  accessoryType: 'cracha_escolar'
};

export const INITIAL_PROFILE: PlayerProfile = {
  name: '',
  avatarId: 'eng-apprentice-01',
  role: 'Aprendiz de Manutenção Mecânica',
  level: 1,
  xp: 0,
  xpForNextLevel: 500,
  completedTasks: [],
  inspectedItems: [],
  masteredTools: [],
  customization: DEFAULT_CUSTOMIZATION,
  completedQuizzes: [],
  unlockedAchievements: ['ach-welcome'],
  disassemblyCompleted: false,
  reassemblyCompleted: false,
  pumpDisassemblyCompleted: false,
  pumpReassemblyCompleted: false,
  completedMissions: [],
  lastMachineId: 'centrifugal-pump',
  onboardingCompleted: false,
  practiceSessions: [],
  lessonProgress: {},
  skillStats: {},
  labMissionStages: {},
  microLessons: {},
  gameResults: {},
  diagnosisRuns: [],
  componentChecks: {},
  journey: EMPTY_JOURNEY
};

const INITIAL_POSITION: PlayerPosition = {
  x: SPAWN.x,
  y: SPAWN.y,
  direction: 'down'
};

/** Caminhos canônicos (em português). Os caminhos antigos continuam aceitos em parseRoute. */
const SCREEN_TO_PATH: Record<GameScreen, string> = {
  landing: '/',
  courses: '/cursos',
  quiz: '/aula',
  practice: '/praticar',
  micro: '/aulas-rapidas',
  games: '/desafios',
  industry: '/industria',
  lab: '/lab',
  tools: '/ferramentas',
  progress: '/progresso',
  character: '/perfil',
  workshop: '/oficina',
  diagnosis: '/diagnostico',
  machine: '/maquina',
  missions: '/missoes',
  drawing: '/desenho',
  library: '/biblioteca',
  teacher: '/instrutor',
  notfound: '/nao-encontrado'
};

const PATH_ALIASES: Record<string, GameScreen> = {
  '': 'landing',
  inicio: 'landing',
  aulas: 'micro',
  cursos: 'courses',
  aula: 'quiz',
  quiz: 'quiz',
  praticar: 'practice',
  pratica: 'practice',
  'aulas-rapidas': 'micro',
  micro: 'micro',
  desafios: 'games',
  jogos: 'games',
  industria: 'industry',
  industry: 'industry',
  lab: 'lab',
  laboratorio: 'lab',
  ferramentas: 'tools',
  tools: 'tools',
  progresso: 'progress',
  progress: 'progress',
  perfil: 'character',
  character: 'character',
  oficina: 'workshop',
  workshop: 'workshop',
  instrutor: 'teacher',
  teacher: 'teacher',
  diagnostico: 'diagnosis',
  maquina: 'machine',
  missoes: 'missions',
  missions: 'missions',
  desenho: 'drawing',
  biblioteca: 'library'
};

export function buildHash(screen: GameScreen, paramId?: string | null): string {
  const basePath = SCREEN_TO_PATH[screen] || '/';
  return paramId ? `#${basePath === '/' ? '' : basePath}/${paramId}` : `#${basePath}`;
}

function parseRouteFromHash(): { screen: GameScreen; param: string | null } {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/') return { screen: 'landing', param: null };
  const parts = hash.split('/').filter(Boolean).map((p) => decodeURIComponent(p));
  // Link da turma gerado pelo instrutor: abre a tela de missões, que pede confirmação antes de aplicar.
  if (parts[0] === 'turma' && parts[1]) return { screen: 'missions', param: `turma:${parts[1]}` };
  const screen = PATH_ALIASES[parts[0] ?? ''];
  const param = parts[1] || null;

  if (!screen) return { screen: 'notfound', param: null };
  if (screen === 'lab') return { screen, param: param || 'centrifugal-pump' };
  if (screen === 'tools') return { screen, param: param || 'chave-combinada' };
  // Uma aula sem identificador leva ao catálogo de cursos.
  if (screen === 'quiz' && !param) return { screen: 'courses', param: null };
  return { screen, param };
}

function applyXp(prev: PlayerProfile, amount: number): Pick<PlayerProfile, 'xp' | 'level' | 'xpForNextLevel'> {
  let xp = prev.xp + amount;
  let level = prev.level;
  let target = prev.xpForNextLevel;
  // Permite subir mais de um nível de uma vez sem perder XP excedente.
  while (xp >= target) {
    level += 1;
    target = Math.round(target * 1.5);
  }
  return { xp, level, xpForNextLevel: target };
}

function mergeSkillStats(
  stats: PlayerProfile['skillStats'],
  answers: { skillId: string; correct: boolean }[]
): PlayerProfile['skillStats'] {
  const next = { ...stats };
  answers.forEach(({ skillId, correct }) => {
    const cur = next[skillId] || { correct: 0, total: 0 };
    next[skillId] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 };
  });
  return next;
}

function loadProfile(): PlayerProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) return normalizeProfile(JSON.parse(saved), INITIAL_PROFILE, DEFAULT_CUSTOMIZATION) ?? INITIAL_PROFILE;
  } catch {
    // localStorage corrompido ou indisponível: começa com um perfil novo.
  }
  return INITIAL_PROFILE;
}

function loadSettings(): {
  graphicsQuality: GraphicsQuality;
  reducedMotion: boolean;
  textSize: TextSize;
  soundEnabled: boolean;
  theme: ThemePreference;
} {
  let prefersReduced = false;
  try {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    // ignore
  }
  const fallback = { graphicsQuality: 'high' as GraphicsQuality, reducedMotion: prefersReduced, textSize: 'normal' as TextSize, soundEnabled: true, theme: 'light' as ThemePreference };
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        graphicsQuality: parsed.graphicsQuality === 'low' ? 'low' : 'high',
        reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion || prefersReduced : prefersReduced,
        textSize: parsed.textSize === 'large' ? 'large' : 'normal',
        soundEnabled: parsed.soundEnabled !== false,
        theme: parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : 'light'
      };
    }
  } catch {
    // ignore
  }
  return fallback;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = parseRouteFromHash();
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(initialRoute.screen);
  const [activeParam, setActiveParam] = useState<string | null>(initialRoute.param);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadProfile);
  const [courseConfig, setCourseConfigState] = useState<CourseConfig>(loadCourseConfig);

  const [instructorSession, setInstructorSessionState] = useState<InstructorSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(INSTRUCTOR_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InstructorSession;
        if (parsed && parsed.authenticated && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const initialSettings = useRef(loadSettings()).current;
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>(INITIAL_POSITION);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled);
  const [graphicsQuality, setGraphicsQualityState] = useState<GraphicsQuality>(initialSettings.graphicsQuality);
  const [reducedMotion, setReducedMotion] = useState<boolean>(initialSettings.reducedMotion);
  const [textSize, setTextSizeState] = useState<TextSize>(initialSettings.textSize);
  const [theme, setThemeState] = useState<ThemePreference>(initialSettings.theme);
  const notificationTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerProfile));
    } catch {
      // Ignora erro de quota
    }
  }, [playerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ graphicsQuality, reducedMotion, textSize, soundEnabled, theme }));
    } catch {
      // Ignora erro
    }
    document.documentElement.dataset.textSize = textSize;
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  }, [graphicsQuality, reducedMotion, textSize, soundEnabled, theme]);

  // Tema da página. Áreas técnicas (navegação, laboratório 3D, oficina) forçam o escuro com data-theme="dark".
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme;
    };
    apply();
    if (theme !== 'system' || !media) return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  // Sincroniza a tela com o endereço. "popstate" cobre voltar/avançar após pushState;
  // "hashchange" cobre links digitados ou âncoras.
  useEffect(() => {
    const syncFromLocation = () => {
      const route = parseRouteFromHash();
      setCurrentScreen(route.screen);
      setActiveParam(route.param);
    };
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, []);

  // Cada página nova começa no topo e recebe um título de aba coerente.
  useEffect(() => {
    const titles: Record<GameScreen, string> = {
      landing: 'Início',
      courses: 'Trilhas',
      quiz: 'Aula',
      practice: 'Questões',
      micro: 'Aulas rápidas',
      games: 'Desafios',
      industry: 'Indústria na prática',
      lab: 'Laboratório 3D',
      tools: 'Ferramentas',
      progress: 'Meu progresso',
      character: 'Perfil',
      workshop: 'Oficina 2D',
      diagnosis: 'Oficina de Diagnóstico',
      machine: 'Máquina interativa',
      missions: 'Missões',
      drawing: 'Oficina de Desenho',
      library: 'Biblioteca',
      teacher: 'Área do instrutor',
      notfound: 'Página não encontrada'
    };
    document.title = `${titles[currentScreen]} · Mecânica Lab`;
  }, [currentScreen]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = notificationTimers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      notificationTimers.current.delete(id);
    }
  }, []);

  const pushNotification = useCallback(
    (title: string, message: string, type: GameNotification['type'] = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setNotifications((prev) => [...prev.slice(-2), { id, title, message, type, timestamp: Date.now() }]);
      const timer = window.setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        notificationTimers.current.delete(id);
      }, 4500);
      notificationTimers.current.set(id, timer);
    },
    []
  );

  useEffect(() => {
    const timers = notificationTimers.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const navigateTo = useCallback((screen: GameScreen, paramId?: string, options?: { replace?: boolean }) => {
    setCurrentScreen(screen);
    setActiveParam(paramId || null);
    const fullHash = buildHash(screen, paramId);
    if (window.location.hash !== fullHash) {
      if (options?.replace) window.history.replaceState(null, '', fullHash);
      else window.history.pushState(null, '', fullHash);
    }
    window.scrollTo?.(0, 0);
  }, []);

  const updatePlayerPosition = useCallback((pos: PlayerPosition) => {
    setPlayerPosition(pos);
  }, []);

  const updatePlayerName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 40);
    if (!trimmed) return;
    setPlayerProfile((prev) => ({ ...prev, name: trimmed }));
  }, []);

  const completeOnboarding = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 40) || 'Aprendiz';
    setPlayerProfile((prev) => ({ ...prev, name: trimmed, onboardingCompleted: true }));
  }, []);

  const updateCustomization = useCallback((custom: Partial<AvatarCustomization>) => {
    setPlayerProfile((prev) => ({
      ...prev,
      customization: { ...prev.customization, ...custom },
      // Missão da Oficina 2D "equipar o personagem" (comportamento existente preservado)
      completedMissions: prev.completedMissions.includes('mission-safety-loto')
        ? prev.completedMissions
        : [...prev.completedMissions, 'mission-safety-loto']
    }));
  }, []);

  const randomizeCustomization = useCallback(() => {
    const skinTones = ['#ffe7d1', '#f8d9b5', '#e0ac69', '#c68642', '#9c6137', '#6f411c', '#3d2210'];
    const headShapes: AvatarCustomization['headShape'][] = ['oval', 'redondo', 'angular'];
    const eyeStyles: AvatarCustomization['eyeStyle'][] = ['padrao', 'amendoado', 'expressivo', 'sereno'];
    const eyeColors = ['#291709', '#5c4033', '#15803d', '#0369a1', '#475569', '#6d28d9'];
    const eyebrowStyles: AvatarCustomization['eyebrowStyle'][] = ['natural', 'arqueada', 'marcada'];
    const hairStyles: AvatarCustomization['hairStyle'][] = ['curto', 'militar', 'cacheado', 'longo_solto', 'preso', 'coque', 'franja_alt'];
    const hairColors = ['#090d16', '#3e2723', '#9a3412', '#d97706', '#991b1b', '#6d28d9', '#0284c7', '#059669'];
    const makeupStyles: AvatarCustomization['makeupStyle'][] = ['nenhuma', 'delineado_sutil', 'batom_suave', 'gotico_marcante', 'sombra_colorida'];
    const lipstickColors = ['#be185d', '#991b1b', '#4c1d95', '#111827', '#d97706'];
    const uniformColors = ['#f8fafc', '#090d16', '#1e3a8a', '#0f766e', '#581c87', '#991b1b', '#334155'];
    const uniformTypes: AvatarCustomization['uniformType'][] = [
      'aluno_tecnico',
      'jaqueta_gotica',
      'moletom_casual',
      'mecanico_geral',
      'ajustador',
      'inspetor_qualidade',
      'manutencao_pesada'
    ];
    const trousersColors = ['#1d4ed8', '#1e293b', '#090d16', '#334155', '#3f3f46', '#312e81'];
    const shoeStyles: AvatarCustomization['shoeStyle'][] = ['tenis_escolar', 'bota_composite', 'coturno_alt'];
    const shoeColors = ['#111827', '#f8fafc', '#451a03', '#7f1d1d'];
    const helmetTypes: AvatarCustomization['helmetType'][] = ['sem_capacete', 'capacete_epi', 'bone_oficina'];
    const helmetColors = ['#eab308', '#f8fafc', '#0284c7', '#ef4444', '#22c55e', '#111827'];
    const vestTypes: AvatarCustomization['vestType'][] = ['nenhum', 'faixa_refletiva', 'colete_seguranca'];
    const accessoryTypes: AvatarCustomization['accessoryType'][] = ['nenhum', 'cracha_escolar', 'colar_alt', 'relogio_tecnico'];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    setPlayerProfile((prev) => ({
      ...prev,
      customization: {
        skinTone: pick(skinTones),
        headShape: pick(headShapes),
        eyeStyle: pick(eyeStyles),
        eyeColor: pick(eyeColors),
        eyebrowStyle: pick(eyebrowStyles),
        hairStyle: pick(hairStyles),
        hairColor: pick(hairColors),
        makeupStyle: pick(makeupStyles),
        lipstickColor: pick(lipstickColors),
        stylePreset: 'casual_urbano',
        uniformColor: pick(uniformColors),
        uniformType: pick(uniformTypes),
        trousersColor: pick(trousersColors),
        shoeStyle: pick(shoeStyles),
        shoeColor: pick(shoeColors),
        helmetType: pick(helmetTypes),
        helmetColor: pick(helmetColors),
        hasSafetyGlasses: Math.random() > 0.25,
        hasEarMuffs: Math.random() > 0.35,
        vestType: pick(vestTypes),
        accessoryType: pick(accessoryTypes)
      }
    }));
    pushNotification('Visual aleatório criado', 'Nova combinação de estilo, roupas e EPIs aplicada.', 'info');
  }, [pushNotification]);

  const resetCustomization = useCallback(() => {
    setPlayerProfile((prev) => ({ ...prev, customization: DEFAULT_CUSTOMIZATION }));
    pushNotification('Uniforme padrão restaurado', 'Visual restaurado para camiseta de treinamento, jeans e EPIs.', 'info');
  }, [pushNotification]);

  const addXp = useCallback((amount: number, reason: string) => {
    setPlayerProfile((prev) => ({ ...prev, ...applyXp(prev, amount) }));
    pushNotification(`+${amount} XP`, reason, 'xp');
  }, [pushNotification]);

  const completeTask = useCallback((taskId: string, taskTitle: string, xpReward: number) => {
    setPlayerProfile((prev) => {
      if (prev.completedTasks.includes(taskId)) return prev;
      return { ...prev, ...applyXp(prev, xpReward), completedTasks: [...prev.completedTasks, taskId] };
    });
    pushNotification('Atividade concluída', `${taskTitle} (+${xpReward} XP)`, 'success');
  }, [pushNotification]);

  const completeMission = useCallback((missionId: string, missionTitle: string, xpReward: number) => {
    setPlayerProfile((prev) => {
      if (prev.completedMissions.includes(missionId)) return prev;
      return { ...prev, ...applyXp(prev, xpReward), completedMissions: [...prev.completedMissions, missionId] };
    });
    pushNotification('Missão cumprida', `${missionTitle} (+${xpReward} XP)`, 'success');
  }, [pushNotification]);

  const inspectItem = useCallback((itemId: string) => {
    setPlayerProfile((prev) => {
      if (prev.inspectedItems.includes(itemId)) return prev;
      const nextInspected = [...prev.inspectedItems, itemId];
      const nextAchievements = [...prev.unlockedAchievements];
      const nextMissions = [...prev.completedMissions];

      if (nextInspected.length === 1 && !nextAchievements.includes('ach-first-inspect')) {
        nextAchievements.push('ach-first-inspect');
      }
      if (nextInspected.length >= 6 && !nextAchievements.includes('ach-all-parts-inspected')) {
        nextAchievements.push('ach-all-parts-inspected');
      }
      if (nextInspected.length >= 6 && !nextMissions.includes('mission-inspect-components')) {
        nextMissions.push('mission-inspect-components');
      }

      return {
        ...prev,
        ...applyXp(prev, 10),
        inspectedItems: nextInspected,
        unlockedAchievements: nextAchievements,
        completedMissions: nextMissions
      };
    });
  }, []);

  const markToolMastered = useCallback((toolId: string, toolName: string) => {
    setPlayerProfile((prev) => {
      if (prev.masteredTools.includes(toolId)) return prev;
      const nextTools = [...prev.masteredTools, toolId];
      const nextMissions = [...prev.completedMissions];
      if (nextTools.length >= 3 && !nextMissions.includes('mission-tools-cnc')) {
        nextMissions.push('mission-tools-cnc');
      }
      return { ...prev, ...applyXp(prev, 40), masteredTools: nextTools, completedMissions: nextMissions };
    });
    pushNotification('Ferramenta estudada', `${toolName} (+40 XP)`, 'success');
  }, [pushNotification]);

  const recordQuizCompletion = useCallback((quizId: string, score: number, total: number) => {
    setPlayerProfile((prev) => {
      const nextAchievements = [...prev.unlockedAchievements];
      if (score === total && total > 0 && !nextAchievements.includes('ach-quiz-master')) {
        nextAchievements.push('ach-quiz-master');
      }

      const nextMissions = [...prev.completedMissions];
      if (quizId.includes('lathe') && !nextMissions.includes('mission-tools-cnc')) {
        nextMissions.push('mission-tools-cnc');
      }
      if ((quizId.includes('gearbox') || quizId.includes('pump')) && !nextMissions.includes('mission-bearings-seals')) {
        nextMissions.push('mission-bearings-seals');
      }
      if (quizId.includes('metrology') && !nextMissions.includes('mission-metrology-mastery')) {
        nextMissions.push('mission-metrology-mastery');
      }

      const existingAttempt = prev.completedQuizzes.find((q) => q.quizId === quizId);
      const attemptsCount = (existingAttempt?.attemptsCount || 0) + 1;
      const bestScore = Math.max(existingAttempt?.bestScore || 0, score);

      return {
        ...prev,
        ...applyXp(prev, score * 20),
        unlockedAchievements: nextAchievements,
        completedMissions: nextMissions,
        completedQuizzes: [
          ...prev.completedQuizzes.filter((q) => q.quizId !== quizId),
          { quizId, score, total, attemptsCount, bestScore, completedAt: Date.now() }
        ]
      };
    });
  }, []);

  const recordPracticeSession = useCallback(
    (session: Omit<PracticeSessionRecord, 'id' | 'completedAt'>, answers: { skillId: string; correct: boolean }[]) => {
      const record: PracticeSessionRecord = {
        ...session,
        id: `ps-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completedAt: Date.now()
      };
      setPlayerProfile((prev) => ({
        ...prev,
        ...applyXp(prev, session.correct * 10),
        practiceSessions: [...prev.practiceSessions, record].slice(-200),
        skillStats: mergeSkillStats(prev.skillStats, answers)
      }));
    },
    []
  );

  const recordLessonStage = useCallback((lessonId: string, stageId: string) => {
    setPlayerProfile((prev) => {
      const cur: LessonProgressRecord = prev.lessonProgress[lessonId] || {
        stagesDone: [],
        completed: false,
        bestScore: 0,
        lastScore: 0,
        total: 0,
        attempts: 0
      };
      if (cur.stagesDone.includes(stageId)) return prev;
      return {
        ...prev,
        lessonProgress: { ...prev.lessonProgress, [lessonId]: { ...cur, stagesDone: [...cur.stagesDone, stageId] } }
      };
    });
  }, []);

  const recordLessonResult = useCallback(
    (lessonId: string, score: number, total: number, answers: { skillId: string; correct: boolean }[]) => {
      const passed = total > 0 && score / total >= LESSON_PASS_RATIO;
      setPlayerProfile((prev) => {
        const cur: LessonProgressRecord = prev.lessonProgress[lessonId] || {
          stagesDone: [],
          completed: false,
          bestScore: 0,
          lastScore: 0,
          total,
          attempts: 0
        };
        const wasCompleted = cur.completed;
        const nextRecord: LessonProgressRecord = {
          ...cur,
          stagesDone: cur.stagesDone.includes('verificar') ? cur.stagesDone : [...cur.stagesDone, 'verificar'],
          completed: cur.completed || passed,
          bestScore: Math.max(cur.bestScore, score),
          lastScore: score,
          total,
          attempts: cur.attempts + 1,
          completedAt: !wasCompleted && passed ? Date.now() : cur.completedAt
        };
        const existingAttempt = prev.completedQuizzes.find((q) => q.quizId === lessonId);
        const nextAchievements = [...prev.unlockedAchievements];
        if (score === total && total > 0 && !nextAchievements.includes('ach-quiz-master')) {
          nextAchievements.push('ach-quiz-master');
        }
        return {
          ...prev,
          // XP de conclusão só na primeira aprovação; acertos sempre valem um pouco.
          ...applyXp(prev, score * 10 + (!wasCompleted && passed ? 100 : 0)),
          unlockedAchievements: nextAchievements,
          lessonProgress: { ...prev.lessonProgress, [lessonId]: nextRecord },
          skillStats: mergeSkillStats(prev.skillStats, answers),
          completedQuizzes: [
            ...prev.completedQuizzes.filter((q) => q.quizId !== lessonId),
            {
              quizId: lessonId,
              score,
              total,
              attemptsCount: (existingAttempt?.attemptsCount || 0) + 1,
              bestScore: Math.max(existingAttempt?.bestScore || 0, score),
              completedAt: Date.now()
            }
          ]
        };
      });
      if (passed) pushNotification('Aula concluída', `Você acertou ${score} de ${total}.`, 'success');
      return { passed };
    },
    [pushNotification]
  );

  const recordLabStage = useCallback((machineId: string, stageId: string) => {
    setPlayerProfile((prev) => {
      const cur = prev.labMissionStages[machineId] || [];
      if (cur.includes(stageId)) return prev;
      return {
        ...prev,
        ...applyXp(prev, 20),
        labMissionStages: { ...prev.labMissionStages, [machineId]: [...cur, stageId] }
      };
    });
  }, []);

  const recordMicroLesson = useCallback(
    (lessonId: string, correct: boolean, skillId: string) => {
      setPlayerProfile((prev) => {
        const cur: MicroLessonRecord = prev.microLessons[lessonId] || { correctFirstTry: false, attempts: 0 };
        const alreadyDone = cur.completedAt !== undefined;
        const next: MicroLessonRecord = {
          attempts: cur.attempts + 1,
          correctFirstTry: alreadyDone ? cur.correctFirstTry : correct && cur.attempts === 0,
          completedAt: alreadyDone ? cur.completedAt : correct ? Date.now() : undefined
        };
        return {
          ...prev,
          // XP só no primeiro acerto; repetir a aula para revisar é livre, mas não rende pontos.
          ...(!alreadyDone && correct ? applyXp(prev, 30) : {}),
          microLessons: { ...prev.microLessons, [lessonId]: next },
          // Só a primeira resposta de cada aula entra na estatística da habilidade.
          skillStats: cur.attempts === 0 ? mergeSkillStats(prev.skillStats, [{ skillId, correct }]) : prev.skillStats
        };
      });
    },
    []
  );

  const recordGameRound = useCallback(
    (
      gameId: string,
      roundId: string,
      result: { solved: boolean; firstTry: boolean; score?: number },
      answers: { skillId: string; correct: boolean }[] = []
    ) => {
      setPlayerProfile((prev) => {
        const game: GameResultRecord = prev.gameResults[gameId] || { rounds: {}, lastPlayedAt: 0 };
        const cur = game.rounds[roundId];
        const wasSolved = Boolean(cur?.solved);
        const round = {
          solved: wasSolved || result.solved,
          // "Sem erros" só vale se a rodada foi resolvida sem erro em alguma tentativa.
          firstTry: Boolean(cur?.firstTry) || (result.solved && result.firstTry),
          attempts: (cur?.attempts || 0) + 1,
          bestScore: result.score === undefined ? cur?.bestScore : Math.max(cur?.bestScore ?? 0, result.score)
        };
        return {
          ...prev,
          // XP só na primeira vez que a rodada é resolvida: repetir para "farmar" pontos não rende nada.
          ...(!wasSolved && result.solved ? applyXp(prev, 25) : {}),
          gameResults: { ...prev.gameResults, [gameId]: { rounds: { ...game.rounds, [roundId]: round }, lastPlayedAt: Date.now() } },
          skillStats: answers.length ? mergeSkillStats(prev.skillStats, answers) : prev.skillStats
        };
      });
    },
    []
  );

  const setLastActivity = useCallback((screen: GameScreen, label: string, param?: string) => {
    setPlayerProfile((prev) => {
      if (prev.lastActivity && prev.lastActivity.screen === screen && prev.lastActivity.param === param && prev.lastActivity.label === label) {
        return prev;
      }
      return { ...prev, lastActivity: { screen, param, label, at: Date.now() } };
    });
  }, []);

  // Antes, concluir a desmontagem de qualquer máquina marcava as duas como concluídas.
  // Agora o registro é separado por máquina (bomba x redutor), mantendo os campos antigos.
  const markDisassemblyComplete = useCallback((machineId: string = 'gearbox-reducer') => {
    setPlayerProfile((prev) => {
      const isPump = machineId === 'centrifugal-pump';
      if (isPump ? prev.pumpDisassemblyCompleted : prev.disassemblyCompleted) return prev;
      const nextAchievements = prev.unlockedAchievements.includes('ach-disassembly-pop')
        ? prev.unlockedAchievements
        : [...prev.unlockedAchievements, 'ach-disassembly-pop'];
      const nextMissions = prev.completedMissions.includes('mission-disassembly-pop')
        ? prev.completedMissions
        : [...prev.completedMissions, 'mission-disassembly-pop'];
      return {
        ...prev,
        ...(isPump ? { pumpDisassemblyCompleted: true } : { disassemblyCompleted: true }),
        ...applyXp(prev, 100),
        unlockedAchievements: nextAchievements,
        completedMissions: nextMissions
      };
    });
    pushNotification('Desmontagem concluída', 'Sequência de desmontagem realizada na ordem correta.', 'success');
  }, [pushNotification]);

  const markReassemblyComplete = useCallback((machineId: string = 'gearbox-reducer') => {
    setPlayerProfile((prev) => {
      const isPump = machineId === 'centrifugal-pump';
      if (isPump ? prev.pumpReassemblyCompleted : prev.reassemblyCompleted) return prev;
      const nextMissions = prev.completedMissions.includes('mission-reassembly-pop')
        ? prev.completedMissions
        : [...prev.completedMissions, 'mission-reassembly-pop'];
      return {
        ...prev,
        ...(isPump ? { pumpReassemblyCompleted: true } : { reassemblyCompleted: true }),
        ...applyXp(prev, 120),
        completedMissions: nextMissions
      };
    });
    pushNotification('Montagem concluída', 'Equipamento montado na sequência correta.', 'success');
  }, [pushNotification]);

  const toggleSound = useCallback(() => setSoundEnabled((prev) => !prev), []);

  const setGraphicsQuality = useCallback((quality: GraphicsQuality) => {
    setGraphicsQualityState(quality);
    pushNotification(
      quality === 'low' ? 'Modo leve ativado' : 'Modo padrão ativado',
      quality === 'low'
        ? 'Menos efeitos e resolução menor para computadores mais simples.'
        : 'Sombras suaves, reflexos e suavização de bordas ativados.',
      'info'
    );
  }, [pushNotification]);

  const toggleReducedMotion = useCallback(() => setReducedMotion((prev) => !prev), []);
  const setTextSize = useCallback((size: TextSize) => setTextSizeState(size), []);
  const setTheme = useCallback((t: ThemePreference) => setThemeState(t), []);

  const resetLearningProgress = useCallback(() => {
    setPlayerProfile((prev) => ({
      ...INITIAL_PROFILE,
      name: prev.name,
      customization: prev.customization,
      onboardingCompleted: true
    }));
    pushNotification('Progresso reiniciado', 'Seu nome e seu personagem foram mantidos.', 'info');
  }, [pushNotification]);

  const recordDiagnosisRun = useCallback((run: DiagnosisRun, answers: { skillId: string; correct: boolean }[]) => {
    setPlayerProfile((prev) => {
      const game: GameResultRecord = prev.gameResults[DIAGNOSIS_GAME_ID] || { rounds: {}, lastPlayedAt: 0 };
      const cur = game.rounds[run.caseId];
      const wasSolved = Boolean(cur?.solved);
      const round = {
        solved: wasSolved || run.passed,
        firstTry: Boolean(cur?.firstTry) || (run.passed && run.unsafeChoices === 0 && run.hintsUsed === 0),
        attempts: (cur?.attempts || 0) + 1,
        bestScore: Math.max(cur?.bestScore ?? 0, run.score)
      };
      return {
        ...prev,
        // XP só na primeira conclusão do caso.
        ...(!wasSolved && run.passed ? applyXp(prev, 60) : {}),
        gameResults: { ...prev.gameResults, [DIAGNOSIS_GAME_ID]: { rounds: { ...game.rounds, [run.caseId]: round }, lastPlayedAt: run.at } },
        diagnosisRuns: appendRun(prev.diagnosisRuns, run),
        skillStats: answers.length ? mergeSkillStats(prev.skillStats, answers) : prev.skillStats
      };
    });
  }, []);

  const recordComponentCheck = useCallback((componentId: string, correct: boolean) => {
    setPlayerProfile((prev) => {
      const cur = prev.componentChecks[componentId];
      return {
        ...prev,
        componentChecks: { ...prev.componentChecks, [componentId]: { correct: Boolean(cur?.correct) || correct, at: Date.now() } },
        skillStats: mergeSkillStats(prev.skillStats, [{ skillId: 'components.identification', correct }])
      };
    });
  }, []);

  const importProgress = useCallback(
    (text: string, apply = true) => {
      const res = parseImport(text, INITIAL_PROFILE, DEFAULT_CUSTOMIZATION);
      if (!res.ok || !apply) return res.ok ? { ok: true as const } : res;
      setPlayerProfile(res.profile);
      pushNotification('Progresso importado', 'O progresso do arquivo substituiu o deste navegador.', 'success');
      return { ok: true as const };
    },
    [pushNotification]
  );

  const updateJourney = useCallback((fn: (j: PlayerProfile['journey']) => PlayerProfile['journey']) => {
    setPlayerProfile((prev) => {
      const journey = fn(prev.journey);
      return journey === prev.journey ? prev : { ...prev, journey };
    });
  }, []);

  const recordMissionStep = useCallback((missionId: string, stepId: string) => updateJourney((j) => addMissionStep(j, missionId, stepId)), [updateJourney]);
  const recordBenchRun = useCallback((run: BenchRun) => updateJourney((j) => addBenchRun(j, run)), [updateJourney]);
  const recordStartupRun = useCallback((run: StartupRun) => updateJourney((j) => addStartupRun(j, run)), [updateJourney]);
  const recordAssessmentRun = useCallback((run: AssessmentRun) => updateJourney((j) => addAssessmentRun(j, run)), [updateJourney]);
  const recordReviewAnswer = useCallback(
    (cardId: string, correct: boolean) => updateJourney((j) => addReviewAnswer(j, cardId, correct, Date.now())),
    [updateJourney]
  );
  const logMistake = useCallback((entry: Omit<MistakeEntry, 'count' | 'at'>) => updateJourney((j) => addMistake(j, entry, Date.now())), [updateJourney]);
  const resolveMistakes = useCallback((ids: string[]) => updateJourney((j) => resolveMistakesIn(j, ids, Date.now())), [updateJourney]);

  // XP e carimbo só na primeira conclusão: completeMission já ignora quem repete.
  const finishJourneyMission = useCallback(
    (missionId: string, title: string, xp: number) => {
      updateJourney((j) => markMissionCompleted(j, missionId, Date.now()));
      completeMission(missionId, title, xp);
    },
    [updateJourney, completeMission]
  );

  const setCourseConfig = useCallback((cfg: CourseConfig) => {
    setCourseConfigState(cfg);
    saveCourseConfig(cfg);
  }, []);

  const setInstructorSession = useCallback((session: InstructorSession | null) => {
    setInstructorSessionState(session);
    try {
      if (session) sessionStorage.setItem(INSTRUCTOR_SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(INSTRUCTOR_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const logoutInstructor = useCallback(() => {
    setInstructorSessionState(null);
    try {
      sessionStorage.removeItem(INSTRUCTOR_SESSION_KEY);
    } catch {
      // ignore
    }
    pushNotification('Sessão encerrada', 'Você saiu da área do instrutor.', 'info');
  }, [pushNotification]);

  return (
    <GameStateContext.Provider
      value={{
        currentScreen,
        activeParam,
        playerProfile,
        playerPosition,
        notifications,
        soundEnabled,
        graphicsQuality,
        reducedMotion,
        textSize,
        theme,
        instructorSession,
        navigateTo,
        updatePlayerPosition,
        updatePlayerName,
        updateCustomization,
        randomizeCustomization,
        resetCustomization,
        completeOnboarding,
        addXp,
        completeTask,
        completeMission,
        inspectItem,
        markToolMastered,
        recordQuizCompletion,
        recordPracticeSession,
        recordLessonStage,
        recordLessonResult,
        recordLabStage,
        recordMicroLesson,
        recordGameRound,
        setLastActivity,
        markDisassemblyComplete,
        markReassemblyComplete,
        dismissNotification,
        toggleSound,
        setGraphicsQuality,
        toggleReducedMotion,
        setTextSize,
        setTheme,
        resetLearningProgress,
        recordDiagnosisRun,
        recordComponentCheck,
        importProgress,
        setInstructorSession,
        logoutInstructor,
        recordMissionStep,
        recordBenchRun,
        recordStartupRun,
        recordAssessmentRun,
        recordReviewAnswer,
        logMistake,
        resolveMistakes,
        finishJourneyMission,
        courseConfig,
        setCourseConfig
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState deve ser usado dentro de um GameStateProvider');
  }
  return context;
};
