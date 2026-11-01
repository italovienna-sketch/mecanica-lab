import type { GameScreen, PlayerProfile } from '../types/game';
import { PRACTICE_QUESTIONS_BY_TOPIC } from './practiceBank';
import { MICRO_LESSONS_BY_ID, SAFETY_MICRO_IDS } from './microLessons';
import { GAMES_BY_ID } from './games';
import { STANDALONE_ROUND_IDS } from './standaloneGames';
import { DIAGNOSIS_CASE_IDS } from './diagnosis/meta';
import type { SourceId } from './regulatorySources';

/**
 * Trilhas de aprendizagem em manutenção mecânica industrial.
 *
 * Organização própria do projeto, inspirada na progressão comum em cursos técnicos de mecânica
 * (segurança → ferramentas → medição → componentes → equipamentos → diagnóstico). Não reproduz
 * material de nenhuma instituição e não confere certificação.
 *
 * Cada trilha declara honestamente o que já existe na plataforma ("disponível") e o que ainda está
 * em preparação. A conclusão é calculada só a partir de atividades reais registradas no perfil do aluno.
 */

export type PathStatus = 'disponivel' | 'parcial' | 'em-preparacao';

/** Uma atividade real da plataforma, com a regra que diz quando ela conta como feita. */
export type PathActivity =
  | { kind: 'lesson'; lessonId: string; label: string }
  | { kind: 'practice'; topicId: string; minCorrect: number; label: string }
  | { kind: 'lab'; machineId: string; stages: string[]; label: string }
  | { kind: 'tasks'; taskIds: string[]; label: string; screen: GameScreen; param?: string }
  | { kind: 'tools'; toolIds: string[]; label: string }
  | { kind: 'micro'; microIds: string[]; label: string }
  | { kind: 'game'; gameId: string; label: string }
  /** Casos da Oficina de Diagnóstico: concluídos (passed) ou concluídos sem nenhuma escolha insegura (safe). */
  | { kind: 'diagnosis'; caseIds: string[]; rule: 'passed' | 'safe'; label: string }
  /** Perguntas de verificação da Máquina interativa acertadas. */
  | { kind: 'components'; min: number; label: string }
  /** Etapas ou missões da jornada da bomba P-101 (`steps`: 'os-04/bancada'). */
  | { kind: 'journey'; missionIds?: string[]; steps?: string[]; assessmentPassed?: boolean; label: string };

export interface PathLesson {
  title: string;
  /** Aula existente na plataforma; sem ela, a aula está em preparação. */
  lessonId?: string;
  /** Aula rápida (micro-aula) existente na plataforma. */
  microId?: string;
}

export interface LearningPath {
  id: string;
  number: number;
  title: string;
  summary: string;
  status: PathStatus;
  /** Trilhas recomendadas antes desta (recomendação, não bloqueio). */
  prerequisites: string[];
  objectives: string[];
  lessons: PathLesson[];
  /** Atividades práticas que já funcionam na plataforma. */
  activities: PathActivity[];
  /** Verificação de conhecimento (também conta para a conclusão). */
  check?: PathActivity;
  /** Atividades planejadas, ainda não implementadas. */
  planned: string[];
  /** Critério de conclusão em linguagem simples. */
  completionText: string;
  next: string[];
  /** Fontes oficiais citadas no conteúdo da trilha. */
  sources?: SourceId[];
}

/** Aula rápida na lista de aulas da trilha (título vem da própria aula). */
const micro = (id: string): PathLesson => ({ title: MICRO_LESSONS_BY_ID[id].title, microId: id });

const MICROMETER_TASKS = ['micro-pino', 'micro-calco', 'micro-bucha', 'micro-colo'].map((id) => `task-micrometer-${id}`);
const CALIPER_TASKS = ['caliper-chaveta', 'caliper-selo', 'caliper-parafuso-m12', 'caliper-colo-eixo'].map((id) => `task-caliper-${id}`);
const ALL_PUMP_STAGES = ['conhecer', 'explorar', 'identificar', 'desmontar', 'montar', 'verificar'];
const ALL_LATHE_STAGES = ['conhecer', 'identificar', 'seguranca', 'sequencia', 'verificar'];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'seguranca-oficina',
    number: 1,
    title: 'Orientação e segurança na oficina',
    summary: 'Antes de qualquer ferramenta: perigos, proteções, emergência, EPIs, energias perigosas, bloqueio, cargas e quando parar e chamar o responsável.',
    status: 'disponivel',
    prerequisites: [],
    objectives: [
      'Diferenciar perigo de risco e reconhecer os perigos mecânicos, elétricos, térmicos e de pressão.',
      'Explicar a função das proteções fixas e móveis e por que não se alteram dispositivos de segurança.',
      'Usar a parada de emergência corretamente e saber que o rearme vem depois da correção da causa.',
      'Escolher EPIs a partir dos riscos da tarefa, sabendo que eles são a última barreira.',
      'Descrever as etapas gerais de isolamento, bloqueio, etiqueta e teste de energias.',
      'Reconhecer quando a tarefa exige autorização ou supervisão e quando parar.'
    ],
    lessons: SAFETY_MICRO_IDS.map(micro),
    activities: [
      { kind: 'game', gameId: 'inspecao-oficina', label: 'Desafio: inspeção de segurança da oficina' },
      { kind: 'game', gameId: 'epi-tarefa', label: 'Desafio: EPI certo para a tarefa' },
      { kind: 'game', gameId: 'decisao-segura', label: 'Desafio: o que fazer agora?' },
      { kind: 'lab', machineId: 'conventional-lathe', stages: ['seguranca'], label: 'Inspeção de segurança no torno 3D' }
    ],
    check: { kind: 'practice', topicId: 'seguranca', minCorrect: 7, label: 'Acertar 7 questões de segurança mecânica' },
    planned: ['Introdução a vasos de pressão e caldeiras (NR-13)'],
    completionText: 'Concluir as 10 aulas rápidas de segurança, resolver os três desafios de segurança, fazer a inspeção no torno 3D e acertar 7 questões de segurança mecânica.',
    next: ['ferramentas-fixacao', 'medicao'],
    sources: ['nr12', 'nr06', 'nr10', 'nr11', 'nr17']
  },
  {
    id: 'ferramentas-fixacao',
    number: 2,
    title: 'Ferramentas manuais e elementos de fixação',
    summary: 'Chaves, torquímetro, parafusos, porcas e arruelas: escolher a ferramenta certa e apertar do jeito certo.',
    status: 'disponivel',
    prerequisites: ['seguranca-oficina'],
    objectives: [
      'Escolher a chave adequada para cada situação e evitar arredondar parafusos.',
      'Ler a identificação de um parafuso métrico (diâmetro, passo, classe).',
      'Explicar para que serve o torquímetro e a sequência de aperto em cruz.'
    ],
    lessons: [
      micro('tec-chave-combinada'),
      micro('tec-fixador'),
      { title: 'Ferramentas básicas e as peças de uma máquina', lessonId: 'lesson-beginner-tools-fasteners' }
    ],
    activities: [
      { kind: 'game', gameId: 'ferramenta-certa', label: 'Desafio: qual ferramenta usar?' },
      {
        kind: 'tasks',
        taskIds: ['task-fastener-tampa-mancal', 'task-fastener-base-motor'],
        label: 'Escolher fixadores passo a passo (2 cenários)',
        screen: 'tools',
        param: 'fixadores'
      },
      { kind: 'tools', toolIds: ['chave-combinada', 'torquimetro'], label: 'Estudar a chave combinada e o torquímetro na biblioteca' }
    ],
    check: { kind: 'practice', topicId: 'fixacao', minCorrect: 7, label: 'Acertar 7 questões de elementos de fixação' },
    planned: [],
    completionText: 'Concluir as aulas, resolver o desafio de escolha de ferramenta, fazer a seleção de fixadores nos dois cenários, estudar as duas ferramentas e acertar 7 questões de fixação.',
    next: ['componentes', 'medicao']
  },
  {
    id: 'medicao',
    number: 3,
    title: 'Medição e metrologia',
    summary: 'Paquímetro, micrômetro e relógio comparador: ler medidas corretamente e cuidar dos instrumentos.',
    status: 'parcial',
    prerequisites: ['seguranca-oficina'],
    objectives: [
      'Ler um paquímetro de 0,05 mm usando a escala principal e o nônio.',
      'Escolher o instrumento adequado para a precisão exigida.',
      'Aplicar boas práticas: limpar, zerar e medir com a peça parada e na temperatura ambiente.'
    ],
    lessons: [micro('tec-paquimetro'), { title: 'Micrômetro e relógio comparador' }],
    activities: [
      { kind: 'tasks', taskIds: CALIPER_TASKS, label: 'Fazer as 4 leituras do treino de paquímetro', screen: 'tools', param: 'treino-paquimetro' },
      { kind: 'tasks', taskIds: MICROMETER_TASKS, label: 'Fazer as 4 leituras do treino de micrômetro', screen: 'tools', param: 'treino-micrometro' },
      { kind: 'tools', toolIds: ['paquimetro', 'micrometro'], label: 'Estudar o paquímetro e o micrômetro na biblioteca' }
    ],
    check: { kind: 'practice', topicId: 'medicao', minCorrect: 7, label: 'Acertar 7 questões de instrumentos de medição' },
    planned: ['Uso do relógio comparador para medir batimento'],
    completionText: 'Concluir a aula rápida do paquímetro, fazer as leituras dos treinos de paquímetro e de micrômetro, estudar os dois instrumentos e acertar 7 questões de medição.',
    next: ['desenho-tecnico', 'usinagem-torno']
  },
  {
    id: 'desenho-tecnico',
    number: 4,
    title: 'Desenho técnico e interpretação mecânica',
    summary: 'Vistas, cortes, cotas e tolerâncias: entender o desenho antes de fabricar ou montar uma peça.',
    status: 'em-preparacao',
    prerequisites: ['medicao'],
    objectives: [
      'Reconhecer as vistas principais de uma peça simples.',
      'Ler cotas e identificar a medida a conferir com o instrumento.',
      'Entender o que significa uma tolerância indicada no desenho.'
    ],
    lessons: [{ title: 'Vistas e projeções' }, { title: 'Cotas, cortes e tolerâncias' }],
    activities: [],
    planned: ['Exercícios de associar a peça 3D às suas vistas', 'Interpretar um desenho simplificado de eixo'],
    completionText: 'Ainda não há atividades nesta trilha.',
    next: ['componentes']
  },
  {
    id: 'componentes',
    number: 5,
    title: 'Componentes mecânicos e conjuntos',
    summary: 'Eixos, rolamentos, vedações, acoplamentos e fixadores: o que cada peça faz dentro de uma máquina.',
    status: 'parcial',
    prerequisites: ['ferramentas-fixacao'],
    objectives: [
      'Identificar os componentes principais em um conjunto montado.',
      'Relacionar cada componente à sua função e às peças vizinhas.',
      'Reconhecer falhas típicas de cada componente.'
    ],
    lessons: [
      { title: 'Ferramentas básicas e as peças de uma máquina', lessonId: 'lesson-beginner-tools-fasteners' },
      micro('tec-rolamento'),
      { title: 'Eixos, chavetas e acoplamentos' }
    ],
    activities: [
      { kind: 'lab', machineId: 'centrifugal-pump', stages: ['identificar'], label: 'Identificar as peças da bomba no laboratório 3D' },
      { kind: 'lab', machineId: 'gearbox-reducer', stages: ['identificar'], label: 'Identificar as peças do redutor no laboratório 3D' }
    ],
    planned: ['Associar componente e função em um conjunto novo', 'Aula sobre eixos, chavetas e acoplamentos'],
    completionText: 'Concluir as aulas disponíveis e a etapa “Identificar” da bomba e do redutor no laboratório 3D.',
    next: ['rolamentos-transmissao', 'bombas']
  },
  {
    id: 'rolamentos-transmissao',
    number: 6,
    title: 'Rolamentos e sistemas de transmissão',
    summary: 'Tipos de rolamentos, montagem correta, engrenagens e redutores.',
    status: 'disponivel',
    prerequisites: ['componentes'],
    objectives: [
      'Diferenciar rolamentos rígidos de esferas, de rolos cônicos e autocompensadores.',
      'Montar e desmontar rolamentos sem transmitir força pelos corpos rolantes.',
      'Explicar a redução de rotação em um par de engrenagens.'
    ],
    lessons: [
      micro('tec-rolamento'),
      { title: 'Redutores de engrenagens e rolamentos', lessonId: 'lesson-gearbox-fundamentals' }
    ],
    activities: [
      { kind: 'lab', machineId: 'gearbox-reducer', stages: ALL_PUMP_STAGES, label: 'Missão completa do redutor no laboratório 3D' },
      { kind: 'game', gameId: 'montagem-rolamento', label: 'Desafio: montagem de rolamentos (3 procedimentos)' }
    ],
    check: { kind: 'practice', topicId: 'rolamentos', minCorrect: 7, label: 'Acertar 7 questões sobre rolamentos' },
    planned: ['Correias e polias', 'Alinhamento de eixos'],
    completionText: 'Concluir as aulas, a missão do redutor, o desafio de montagem de rolamentos e acertar 7 questões sobre rolamentos.',
    next: ['lubrificacao-preventiva']
  },
  {
    id: 'lubrificacao-preventiva',
    number: 7,
    title: 'Lubrificação e manutenção preventiva',
    summary: 'Tipos de manutenção, rotina de inspeção, lubrificantes e registro do que foi feito.',
    status: 'parcial',
    prerequisites: ['rolamentos-transmissao'],
    objectives: [
      'Diferenciar manutenção corretiva, preventiva e preditiva.',
      'Explicar os efeitos da falta e do excesso de lubrificante.',
      'Registrar uma inspeção de forma que outra pessoa entenda.'
    ],
    lessons: [{ title: 'Tipos de manutenção e plano preventivo' }, { title: 'Lubrificantes e intervalos de lubrificação' }],
    activities: [],
    check: { kind: 'practice', topicId: 'manutencao', minCorrect: 6, label: 'Acertar 6 questões de manutenção preventiva' },
    planned: ['Montar uma rotina de inspeção para a bomba', 'Escolher o ponto e a quantidade de lubrificação'],
    completionText: 'Por enquanto: acertar 6 questões do tema “Manutenção preventiva”.',
    next: ['planejamento-diagnostico']
  },
  {
    id: 'bombas',
    number: 8,
    title: 'Bombas e equipamentos de fluidos',
    summary: 'Bomba centrífuga e bomba de engrenagens: como funcionam, suas peças, vedação, cavitação e desmontagem segura.',
    status: 'disponivel',
    prerequisites: ['componentes'],
    objectives: [
      'Explicar o caminho do líquido dentro de uma bomba centrífuga.',
      'Diferenciar bomba dinâmica (centrífuga) de bomba de deslocamento positivo (engrenagens).',
      'Identificar rotor, voluta, eixo, mancais e selo mecânico.',
      'Seguir a sequência de desmontagem com bloqueio de energia.'
    ],
    lessons: [
      { title: 'Como funciona uma bomba centrífuga', lessonId: 'lesson-centrifugal-pump' },
      micro('tec-bomba-tipos'),
      micro('tec-selo')
    ],
    activities: [
      { kind: 'lab', machineId: 'centrifugal-pump', stages: ALL_PUMP_STAGES, label: 'Missão completa da bomba centrífuga no laboratório 3D' },
      { kind: 'lab', machineId: 'gear-pump', stages: ALL_PUMP_STAGES, label: 'Missão completa da bomba de engrenagens no laboratório 3D' }
    ],
    check: { kind: 'practice', topicId: 'bombas', minCorrect: 7, label: 'Acertar 7 questões sobre bombas' },
    planned: ['Válvulas e tubulações', 'Leitura de curva de bomba (introdução)'],
    completionText: 'Concluir as aulas, as missões das duas bombas e acertar 7 questões sobre bombas.',
    next: ['hidraulica-pneumatica', 'planejamento-diagnostico']
  },
  {
    id: 'hidraulica-pneumatica',
    number: 9,
    title: 'Sistemas hidráulicos e pneumáticos',
    summary: 'Componentes, símbolos e funcionamento básico de circuitos hidráulicos e pneumáticos.',
    status: 'em-preparacao',
    prerequisites: ['bombas'],
    objectives: [
      'Reconhecer bomba, válvula direcional, atuador e reservatório em um circuito.',
      'Ler símbolos básicos de um esquema.',
      'Explicar os riscos de energia acumulada (pressão) na manutenção.'
    ],
    lessons: [{ title: 'Componentes de um circuito hidráulico' }, { title: 'Pneumática básica' }],
    activities: [],
    planned: ['Montar um circuito simples arrastando componentes', 'Identificar símbolos'],
    completionText: 'Ainda não há atividades nesta trilha.',
    next: ['automacao']
  },
  {
    id: 'usinagem-torno',
    number: 10,
    title: 'Usinagem convencional e fundamentos do torno',
    summary: 'Partes do torno, segurança na usinagem, operações básicas e conceitos de velocidade de corte.',
    status: 'parcial',
    prerequisites: ['seguranca-oficina', 'medicao'],
    objectives: [
      'Identificar as partes de um torno mecânico convencional e suas funções.',
      'Reconhecer condições inseguras antes de ligar a máquina.',
      'Descrever a ordem segura de uma operação simples de cilindramento.',
      'Explicar a relação entre diâmetro, rotação e velocidade de corte.'
    ],
    lessons: [{ title: 'Introdução ao torneamento: operações e parâmetros' }, { title: 'Ferramentas de corte e fixação da peça' }],
    activities: [{ kind: 'lab', machineId: 'conventional-lathe', stages: ALL_LATHE_STAGES, label: 'Todas as atividades do torno no laboratório 3D' }],
    check: { kind: 'practice', topicId: 'torno', minCorrect: 8, label: 'Acertar 8 questões sobre o torno mecânico' },
    planned: ['Aula sobre ferramentas de corte e fixação da peça', 'Fresadora e furadeira de bancada'],
    completionText: 'Concluir todas as atividades do torno e acertar 8 questões do tema “Torno mecânico”.',
    next: ['planejamento-diagnostico']
  },
  {
    id: 'planejamento-diagnostico',
    number: 11,
    title: 'Planejamento de manutenção e diagnóstico de falhas',
    summary: 'Partir dos sintomas, levantar evidências, encontrar a causa e decidir o que fazer.',
    status: 'parcial',
    prerequisites: ['lubrificacao-preventiva', 'bombas'],
    objectives: [
      'Organizar um diagnóstico em etapas: sintoma → hipóteses → testes → causa.',
      'Escolher a inspeção ou medição que confirma uma hipótese.',
      'Registrar a causa raiz e a ação corretiva.'
    ],
    lessons: [
      micro('tec-pre-inspecao'),
      { title: 'Diagnóstico de falhas e ajustes', lessonId: 'lesson-professional-diagnostics' }
    ],
    activities: [
      { kind: 'game', gameId: 'diagnostico', label: 'Desafio: diagnóstico de falhas' },
      { kind: 'diagnosis', caseIds: DIAGNOSIS_CASE_IDS, rule: 'passed', label: 'Oficina de Diagnóstico: os 3 casos' }
    ],
    check: { kind: 'practice', topicId: 'manutencao', minCorrect: 8, label: 'Acertar 8 questões de manutenção' },
    planned: ['Montar uma ordem de serviço'],
    completionText: 'Concluir as aulas, resolver o desafio de diagnóstico, concluir os casos da Oficina de Diagnóstico e acertar 8 questões de manutenção.',
    next: ['desafios-integrados']
  },
  {
    id: 'automacao',
    number: 12,
    title: 'Introdução à automação industrial',
    summary: 'Sensores, atuadores e controladores: o que o mecânico precisa saber para trabalhar junto com a automação.',
    status: 'em-preparacao',
    prerequisites: ['hidraulica-pneumatica'],
    objectives: [
      'Diferenciar sensor, atuador e controlador.',
      'Reconhecer sensores comuns em máquinas (indutivo, fim de curso).',
      'Entender por que a manutenção mecânica exige bloqueio também da automação.'
    ],
    lessons: [{ title: 'Sensores e atuadores' }, { title: 'O que é um CLP' }],
    activities: [],
    planned: ['Identificar sensores em uma máquina 3D'],
    completionText: 'Ainda não há atividades nesta trilha.',
    next: ['desafios-integrados']
  },
  {
    id: 'desafios-integrados',
    number: 13,
    title: 'Desafios integrados de manutenção',
    summary: 'Situações que juntam segurança, ferramentas, medição e diagnóstico em um só problema.',
    status: 'parcial',
    prerequisites: ['planejamento-diagnostico'],
    objectives: [
      'Aplicar o que foi aprendido nas outras trilhas em situações combinadas.',
      'Decidir a sequência de trabalho com segurança, do bloqueio ao teste final.'
    ],
    lessons: [],
    activities: [
      { kind: 'lab', machineId: 'centrifugal-pump', stages: ALL_PUMP_STAGES, label: 'Missão completa da bomba' },
      { kind: 'lab', machineId: 'gearbox-reducer', stages: ALL_PUMP_STAGES, label: 'Missão completa do redutor' },
      { kind: 'lab', machineId: 'conventional-lathe', stages: ALL_LATHE_STAGES, label: 'Atividades completas do torno' }
    ],
    planned: ['Desafios com vários equipamentos e um relatório final'],
    completionText: 'Por enquanto: concluir as missões dos três equipamentos do laboratório 3D.',
    next: []
  }
];

export const LEARNING_PATHS_BY_ID: Record<string, LearningPath> = Object.fromEntries(LEARNING_PATHS.map((p) => [p.id, p]));

export const PATH_STATUS_LABEL: Record<PathStatus, string> = {
  disponivel: 'Disponível',
  parcial: 'Parcialmente disponível',
  'em-preparacao': 'Em preparação'
};

/* ───────────────────────── Progresso calculado do perfil ───────────────────────── */

export function masteredQuestionIds(profile: PlayerProfile): Set<string> {
  const ids = new Set<string>();
  profile.practiceSessions.forEach((s) =>
    (s.questionIds || []).forEach((id) => {
      if (!s.wrongQuestionIds.includes(id)) ids.add(id);
    })
  );
  return ids;
}

/** Progresso de uma atividade: quantos itens de quantos (ex.: 3 de 4 leituras). */
export function activityProgress(a: PathActivity, profile: PlayerProfile, mastered: Set<string>): { done: number; total: number } {
  switch (a.kind) {
    case 'lesson':
      return { done: profile.lessonProgress[a.lessonId]?.completed ? 1 : 0, total: 1 };
    case 'practice': {
      const n = (PRACTICE_QUESTIONS_BY_TOPIC[a.topicId] || []).filter((q) => mastered.has(q.id)).length;
      return { done: Math.min(n, a.minCorrect), total: a.minCorrect };
    }
    case 'lab': {
      const got = profile.labMissionStages[a.machineId] || [];
      return { done: a.stages.filter((s) => got.includes(s)).length, total: a.stages.length };
    }
    case 'tasks':
      return { done: a.taskIds.filter((t) => profile.completedTasks.includes(t)).length, total: a.taskIds.length };
    case 'tools':
      return { done: a.toolIds.filter((t) => profile.masteredTools.includes(t)).length, total: a.toolIds.length };
    case 'micro':
      return { done: a.microIds.filter((id) => profile.microLessons[id]?.completedAt !== undefined).length, total: a.microIds.length };
    case 'game': {
      const rounds = profile.gameResults[a.gameId]?.rounds || {};
      // Desafios de tela própria (Mestre da Metrologia, Montagem de rolamentos): cada nível ou procedimento conta como uma rodada.
      const roundIds = STANDALONE_ROUND_IDS[a.gameId] ?? GAMES_BY_ID[a.gameId].rounds.map((r) => r.id);
      return { done: roundIds.filter((id) => rounds[id]?.solved).length, total: roundIds.length };
    }
    case 'diagnosis': {
      const runs = profile.diagnosisRuns || [];
      const ok = (id: string) => runs.some((r) => r.caseId === id && r.passed && (a.rule === 'passed' || r.unsafeChoices === 0));
      return { done: a.caseIds.filter(ok).length, total: a.caseIds.length };
    }
    case 'components': {
      const right = Object.values(profile.componentChecks || {}).filter((c) => c.correct).length;
      return { done: Math.min(right, a.min), total: a.min };
    }
    case 'journey': {
      const j = profile.journey?.missions ?? {};
      const missions = (a.missionIds ?? []).filter((id) => j[id]?.completedAt).length;
      const steps = (a.steps ?? []).filter((key) => {
        const [mission, step] = key.split('/');
        return j[mission]?.steps.includes(step);
      }).length;
      const exam = a.assessmentPassed ? (profile.journey?.assessmentRuns.some((r) => r.passed) ? 1 : 0) : 0;
      return { done: missions + steps + exam, total: (a.missionIds?.length ?? 0) + (a.steps?.length ?? 0) + (a.assessmentPassed ? 1 : 0) };
    }
  }
}

/** Todas as atividades que contam para concluir a trilha: aulas existentes, práticas e verificação. */
export function pathRequirements(path: LearningPath): PathActivity[] {
  const lessons: PathActivity[] = path.lessons
    .filter((l) => l.lessonId || l.microId)
    .map((l) =>
      l.microId
        ? { kind: 'micro', microIds: [l.microId], label: `Concluir a aula rápida “${l.title}”` }
        : { kind: 'lesson', lessonId: l.lessonId!, label: `Concluir a aula “${l.title}”` }
    );
  return [...lessons, ...path.activities, ...(path.check ? [path.check] : [])];
}

export function pathProgress(path: LearningPath, profile: PlayerProfile, mastered = masteredQuestionIds(profile)) {
  const reqs = pathRequirements(path);
  const done = reqs.filter((r) => {
    const p = activityProgress(r, profile, mastered);
    return p.done >= p.total;
  }).length;
  const started = reqs.some((r) => activityProgress(r, profile, mastered).done > 0);
  return { done, total: reqs.length, completed: reqs.length > 0 && done === reqs.length, started };
}

/** Próxima trilha sugerida: a primeira com conteúdo, ainda não concluída, cujos pré-requisitos com conteúdo já foram feitos. */
export function recommendedPath(profile: PlayerProfile): LearningPath | null {
  const mastered = masteredQuestionIds(profile);
  const completed = new Set(LEARNING_PATHS.filter((p) => pathProgress(p, profile, mastered).completed).map((p) => p.id));
  const hasContent = (p: LearningPath) => pathRequirements(p).length > 0;
  const started = LEARNING_PATHS.find((p) => hasContent(p) && !completed.has(p.id) && pathProgress(p, profile, mastered).started);
  if (started) return started;
  return (
    LEARNING_PATHS.find(
      (p) => hasContent(p) && !completed.has(p.id) && p.prerequisites.every((id) => completed.has(id) || !hasContent(LEARNING_PATHS_BY_ID[id]))
    ) || null
  );
}
