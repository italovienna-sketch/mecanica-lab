import type { GameScreen, PlayerProfile } from '../types/game';
import { PathActivity, activityProgress, masteredQuestionIds } from './learningPaths';
import { SAFETY_MICRO_IDS } from './microLessons';
import { DIAGNOSIS_CASE_IDS } from './diagnosis/meta';

/**
 * Marcos de competência: conquistas ligadas ao que o aluno realmente fez (aulas, desafios, missões),
 * e não a XP, sequência de dias ou tempo de tela. Não expiram e não se perdem.
 * São marcos de estudo dentro do app — não são certificação, habilitação nem capacitação exigida por NR.
 */
export interface Competency {
  id: string;
  title: string;
  /** O que o aluno demonstrou ao concluir (frase curta, sem exagero). */
  evidence: string;
  requirements: PathActivity[];
  /** Onde começar quando ainda falta algo. */
  start: { screen: GameScreen; param?: string };
}

const ALL_LAB = ['conhecer', 'explorar', 'identificar', 'desmontar', 'montar', 'verificar'];

export const COMPETENCIES: Competency[] = [
  {
    id: 'seguranca-base',
    title: 'Base de segurança na oficina',
    evidence: 'Reconheceu perigos, proteções, EPI e bloqueio de energia em situações simuladas.',
    requirements: [
      { kind: 'micro', microIds: SAFETY_MICRO_IDS, label: 'As 10 aulas rápidas de segurança' },
      { kind: 'game', gameId: 'inspecao-oficina', label: 'Desafio: inspeção de segurança' },
      { kind: 'game', gameId: 'epi-tarefa', label: 'Desafio: EPI para a tarefa' },
      { kind: 'game', gameId: 'decisao-segura', label: 'Desafio: decisão segura' }
    ],
    start: { screen: 'micro', param: SAFETY_MICRO_IDS[0] }
  },
  {
    id: 'ferramenta-fixador',
    title: 'Escolha de ferramentas e fixadores',
    evidence: 'Escolheu ferramentas adequadas e fez a seleção de fixadores, inclusive reconhecendo quando faltam dados.',
    requirements: [
      { kind: 'micro', microIds: ['tec-chave-combinada', 'tec-fixador'], label: 'Aulas rápidas: chave combinada e fixadores' },
      { kind: 'game', gameId: 'ferramenta-certa', label: 'Desafio: ferramenta certa' },
      {
        kind: 'tasks',
        taskIds: ['task-fastener-tampa-mancal', 'task-fastener-base-motor'],
        label: 'Seleção de fixadores nos dois cenários',
        screen: 'tools',
        param: 'fixadores'
      }
    ],
    start: { screen: 'games', param: 'ferramenta-certa' }
  },
  {
    id: 'leitura-instrumentos',
    title: 'Leitura de instrumentos',
    evidence: 'Fez leituras de paquímetro e micrômetro nos simuladores.',
    requirements: [
      { kind: 'micro', microIds: ['tec-paquimetro'], label: 'Aula rápida: leitura do paquímetro' },
      {
        kind: 'tasks',
        taskIds: ['caliper-chaveta', 'caliper-selo', 'caliper-parafuso-m12', 'caliper-colo-eixo'].map((id) => `task-caliper-${id}`),
        label: 'As 4 leituras do paquímetro',
        screen: 'tools',
        param: 'treino-paquimetro'
      },
      {
        kind: 'tasks',
        taskIds: ['micro-pino', 'micro-calco', 'micro-bucha', 'micro-colo'].map((id) => `task-micrometer-${id}`),
        label: 'As 4 leituras do micrômetro',
        screen: 'tools',
        param: 'treino-micrometro'
      }
    ],
    start: { screen: 'micro', param: 'tec-paquimetro' }
  },
  {
    id: 'metrologia-resolucao-fina',
    title: 'Leitura com resolução fina',
    evidence: 'Leu paquímetro (0,05 mm), micrômetro (0,01 mm) e relógio comparador (batimento) com medidas sorteadas, inclusive digitando a leitura sem alternativas.',
    requirements: [{ kind: 'game', gameId: 'mestre-metrologia', label: 'Os 5 níveis do Mestre da Metrologia' }],
    start: { screen: 'games', param: 'mestre-metrologia' }
  },
  {
    id: 'bombas-desmontagem',
    title: 'Desmontagem guiada de bombas',
    evidence: 'Desmontou e montou uma bomba centrífuga e uma bomba de engrenagens na ordem correta, no laboratório 3D.',
    requirements: [
      { kind: 'micro', microIds: ['tec-bomba-tipos'], label: 'Aula rápida: centrífuga ou engrenagens?' },
      { kind: 'lab', machineId: 'centrifugal-pump', stages: ALL_LAB, label: 'Missão da bomba centrífuga' },
      { kind: 'lab', machineId: 'gear-pump', stages: ALL_LAB, label: 'Missão da bomba de engrenagens' }
    ],
    start: { screen: 'lab', param: 'centrifugal-pump' }
  },
  {
    id: 'diagnostico-inicial',
    title: 'Raciocínio de diagnóstico',
    evidence: 'Relacionou sintomas a causas prováveis e reconheceu quando é preciso mais informação antes de concluir.',
    requirements: [
      { kind: 'micro', microIds: ['tec-pre-inspecao'], label: 'Aula rápida: inspeção antes de intervir' },
      { kind: 'game', gameId: 'diagnostico', label: 'Desafio: diagnóstico de falhas' }
    ],
    start: { screen: 'games', param: 'diagnostico' }
  },
  {
    id: 'diagnostico-evidencias',
    title: 'Diagnóstico de falhas baseado em evidências',
    evidence: 'Investigou os 3 casos da Oficina de Diagnóstico, chegou à causa provável sustentada pelos dados e escolheu uma ação adequada.',
    requirements: [{ kind: 'diagnosis', caseIds: DIAGNOSIS_CASE_IDS, rule: 'passed', label: 'Concluir os 3 casos da Oficina de Diagnóstico' }],
    start: { screen: 'diagnosis' }
  },
  {
    id: 'seguranca-manutencao',
    title: 'Decisões seguras na manutenção',
    evidence: 'Concluiu os 3 casos da Oficina de Diagnóstico sem nenhum teste ou ação insegura.',
    requirements: [{ kind: 'diagnosis', caseIds: DIAGNOSIS_CASE_IDS, rule: 'safe', label: 'Os 3 casos sem nenhuma escolha insegura' }],
    start: { screen: 'diagnosis' }
  },
  {
    id: 'identificacao-componentes',
    title: 'Identificação de componentes de um conjunto motobomba',
    evidence: 'Reconheceu a função, as falhas típicas e as inspeções de cada componente da Máquina interativa.',
    requirements: [{ kind: 'components', min: 9, label: 'Acertar as perguntas de verificação de 9 componentes' }],
    start: { screen: 'machine' }
  },
  {
    id: 'inspecao-bancada',
    title: 'Inspeção de peças em bancada',
    evidence: 'Reconheceu o estado de rotor, selo, rolamento, eixo e junta, comparou a medida com a tolerância e decidiu o destino de cada peça.',
    requirements: [{ kind: 'journey', steps: ['os-04/bancada'], label: 'Bancada de inspeção da OS-04' }],
    start: { screen: 'missions', param: 'os-04' }
  },
  {
    id: 'partida-segura',
    title: 'Devolução e teste de partida',
    evidence: 'Devolveu a bomba em ordem, leu os instrumentos contra a faixa do teste e decidiu entre liberar e parar.',
    requirements: [{ kind: 'journey', steps: ['os-03/liberacao', 'os-05/partida'], label: 'Liberação da OS-03 e teste de partida da OS-05' }],
    start: { screen: 'missions', param: 'os-05' }
  },
  {
    id: 'bomba-avaliacao',
    title: 'Caso completo de bomba centrífuga',
    evidence: 'Conduziu um caso novo sem dicas, com segurança total e o mínimo em diagnóstico, procedimento e inspeção.',
    requirements: [{ kind: 'journey', assessmentPassed: true, label: 'Avaliação prática da OS-06' }],
    start: { screen: 'missions', param: 'os-06' }
  },
  {
    id: 'leitura-desenho',
    title: 'Leitura de desenho técnico',
    evidence: 'Relacionou peça e vistas no 1º diedro, leu tolerâncias, símbolos e cortes, e achou peças em um desenho de conjunto.',
    requirements: [{ kind: 'game', gameId: 'oficina-desenho', label: 'As 6 bancadas da Oficina de Desenho' }],
    start: { screen: 'drawing' }
  }
];

export type CompetencyLevel = 'nao-iniciada' | 'praticada' | 'em-desenvolvimento' | 'demonstrada';

export const LEVEL_TEXT: Record<CompetencyLevel, { label: string; rule: string }> = {
  'nao-iniciada': { label: 'Não iniciada', rule: 'Nenhuma atividade feita ainda.' },
  praticada: { label: 'Praticada', rule: 'Você já tentou as atividades, mas ainda sem avanço nos requisitos.' },
  'em-desenvolvimento': { label: 'Em desenvolvimento', rule: 'Parte do que é pedido já foi cumprida.' },
  demonstrada: { label: 'Demonstrada nos exercícios', rule: 'Todos os requisitos foram cumpridos nas atividades do app.' }
};

/** Houve alguma tentativa na atividade, mesmo sem acerto (separa “não iniciada” de “praticada”). */
function attempted(r: PathActivity, p: PlayerProfile): boolean {
  switch (r.kind) {
    case 'game':
      return Object.keys(p.gameResults[r.gameId]?.rounds ?? {}).length > 0;
    case 'diagnosis':
      return (p.diagnosisRuns ?? []).some((x) => r.caseIds.includes(x.caseId));
    case 'components':
      return Object.keys(p.componentChecks ?? {}).length > 0;
    case 'practice':
      return p.practiceSessions.some((s) => s.topicId === r.topicId);
    case 'lab':
      return (p.labMissionStages[r.machineId] ?? []).length > 0;
    case 'lesson':
      return Boolean(p.lessonProgress[r.lessonId]);
    case 'journey':
      return (p.journey?.assessmentRuns.length ?? 0) > 0 || (p.journey?.benchRuns.length ?? 0) > 0 || Object.keys(p.journey?.missions ?? {}).length > 0;
    default:
      return false;
  }
}

export function competencyProgress(c: Competency, profile: PlayerProfile, mastered = masteredQuestionIds(profile)) {
  const items = c.requirements.map((r) => ({ req: r, ...activityProgress(r, profile, mastered) }));
  const done = items.filter((i) => i.done >= i.total).length;
  const completed = done === items.length;
  const level: CompetencyLevel = completed
    ? 'demonstrada'
    : items.some((i) => i.done > 0)
      ? 'em-desenvolvimento'
      : c.requirements.some((r) => attempted(r, profile))
        ? 'praticada'
        : 'nao-iniciada';
  return { items, done, total: items.length, completed, level };
}
