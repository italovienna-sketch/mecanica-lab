import type { GameScreen, PlayerProfile } from '../../types/game';
import type { LearningLevel } from '../lessonsData';
import { EMPTY_JOURNEY, JourneyState, MISSION_IDS, MissionId } from './meta';

/**
 * As seis ordens de serviço da bomba P-101 (equipamento FICTÍCIO da planta-escola).
 *
 * Princípio: cada etapa com `gate` só conta quando o aluno demonstra o que ela pede. Ler, assistir ou esperar não libera
 * nada. A exploração livre (Laboratório 3D, Oficina de Desenho, Biblioteca) continua aberta o tempo todo; o que é
 * sequencial aqui é a demonstração de competência.
 */

export const PUMP_MACHINE_ID = 'centrifugal-pump';

export type StepKind =
  | 'video' // leva a uma atividade; não conta como evidência
  | 'warmup' // recuperação de conteúdo de missões anteriores
  | 'flow' // seguir o caminho do líquido no corte
  | 'spot' // apontar regiões no corte
  | 'lab' // etapa do Laboratório 3D
  | 'micro' // aula rápida exigida (segurança)
  | 'match' // função ↔ peça
  | 'pick3d' // apontar a peça no 3D
  | 'release' // liberação para manutenção
  | 'tools' // ferramenta ↔ tarefa
  | 'bench' // bancada de inspeção
  | 'fault3d' // achar o erro de montagem no 3D
  | 'startup' // teste de partida
  | 'assessment'; // avaliação prática

export interface MissionStep {
  id: string;
  kind: StepKind;
  title: string;
  /** O que o aluno precisa demonstrar, em uma frase. */
  demonstrates: string;
  /** Sem evidência própria (ex.: vídeo): não entra na contagem nem trava a missão. */
  optional?: boolean;
  labStage?: string;
  microId?: string;
  clip?: { start: number; end: number; prompt: string };
}

export interface Mission {
  id: MissionId;
  code: string;
  title: string;
  level: LearningLevel;
  /** Objetivo de aprendizagem. */
  objective: string;
  /** A situação na planta, contada como ordem de serviço. */
  situation: string;
  steps: MissionStep[];
  /** O que o aluno mostrou ao concluir (resumo de competências). */
  demonstrated: string[];
  xp: number;
}

const warmup = (from: string): MissionStep => ({
  id: 'aquecimento',
  kind: 'warmup',
  title: 'Aquecimento do turno',
  demonstrates: `Lembrar, sem consultar, o que você viu ${from}.`
});

export const MISSIONS: Mission[] = [
  {
    id: 'os-01',
    code: 'OS-01',
    title: 'Conhecer a P-101',
    level: 'Iniciante',
    objective: 'Explicar como a bomba centrífuga transforma o giro do motor em pressão e por onde o líquido passa.',
    situation:
      'Você chegou à equipe de manutenção da planta-escola. A P-101 manda água de resfriamento para a linha e está na lista de parada da semana. Antes de pegar em ferramenta, é preciso entender a máquina.',
    steps: [
      {
        id: 'video-funcionamento',
        kind: 'video',
        title: 'Como ela funciona (18 s)',
        demonstrates: 'Só para assistir: a atividade seguinte usa o que aparece aqui.',
        optional: true,
        clip: { start: 7.9, end: 26.5, prompt: 'Preste atenção em onde a velocidade vira pressão: você vai apontar esse lugar no corte da bomba.' }
      },
      { id: 'caminho', kind: 'flow', title: 'Siga o líquido', demonstrates: 'Traçar o caminho da água da sucção ao recalque, na ordem certa.' },
      { id: 'pontos', kind: 'spot', title: 'Aponte no corte', demonstrates: 'Localizar no desenho em corte onde cada coisa acontece.' },
      { id: 'lab-conhecer', kind: 'lab', labStage: 'conhecer', title: 'Conhecer no 3D', demonstrates: 'Ver as peças separadas no modelo 3D.' }
    ],
    demonstrated: ['Descreve a função do rotor e da voluta', 'Localiza sucção, olho do rotor e recalque em um corte'],
    xp: 80
  },
  {
    id: 'os-02',
    code: 'OS-02',
    title: 'Identificar os componentes',
    level: 'Iniciante',
    objective: 'Reconhecer cada componente da bomba no modelo 3D e dizer para que ele serve.',
    situation: 'O planejador pede a lista de peças da P-101. Quem identifica errado compra errado, e a bomba fica parada esperando peça.',
    steps: [
      warmup('na OS-01'),
      { id: 'lab-explorar', kind: 'lab', labStage: 'explorar', title: 'Explorar em 3D', demonstrates: 'Inspecionar peças à vontade, com raio-X e rótulos.' },
      { id: 'lab-identificar', kind: 'lab', labStage: 'identificar', title: 'Identificar no 3D', demonstrates: 'Clicar em cada peça pedida, sem rótulos na tela.' },
      { id: 'funcoes', kind: 'match', title: 'Peça certa, função certa', demonstrates: 'Ligar cada função mecânica à peça que a cumpre.' },
      {
        id: 'video-selo',
        kind: 'video',
        title: 'O selo mecânico (9 s)',
        demonstrates: 'Só para assistir: logo depois você vai encontrar o selo no 3D.',
        optional: true,
        clip: { start: 79.9, end: 88.5, prompt: 'Repare onde o selo fica em relação ao eixo e à carcaça.' }
      },
      { id: 'achar-selo', kind: 'pick3d', title: 'Onde está o selo?', demonstrates: 'Apontar o selo e explicar por que ele fica naquele lugar.' }
    ],
    demonstrated: ['Identifica os componentes no modelo 3D', 'Relaciona cada componente à sua função mecânica'],
    xp: 100
  },
  {
    id: 'os-03',
    code: 'OS-03',
    title: 'Liberar e desmontar',
    level: 'Intermediário',
    objective: 'Liberar a bomba com segurança e desmontá-la na sequência certa, com a ferramenta certa.',
    situation: 'A parada da P-101 foi autorizada. Ninguém toca na bomba antes da liberação. Depois, cada ferramenta errada pode virar uma peça estragada.',
    steps: [
      warmup('nas OS-01 e OS-02'),
      { id: 'aula-bloqueio', kind: 'micro', microId: 'seg-bloqueio', title: 'Aula rápida: bloqueio de energias', demonstrates: 'Acertar a pergunta da aula de isolamento e bloqueio.' },
      { id: 'liberacao', kind: 'release', title: 'Liberar a bomba', demonstrates: 'Pôr a liberação em uma ordem que faça sentido, sabendo o que depende do quê.' },
      { id: 'ferramentas', kind: 'tools', title: 'Ferramenta para cada tarefa', demonstrates: 'Escolher a ferramenta adequada e dizer por que a outra estraga a peça.' },
      { id: 'lab-desmontar', kind: 'lab', labStage: 'desmontar', title: 'Desmontar no 3D', demonstrates: 'Concluir a desmontagem na ordem correta no modelo 3D.' }
    ],
    demonstrated: ['Sequencia a liberação para manutenção', 'Escolhe a ferramenta pela tarefa', 'Desmonta a bomba na ordem correta'],
    xp: 140
  },
  {
    id: 'os-04',
    code: 'OS-04',
    title: 'Bancada de inspeção',
    level: 'Intermediário',
    objective: 'Examinar as peças retiradas, reconhecer o estado de cada uma e decidir o que volta para a bomba.',
    situation: 'As peças da P-101 estão na bancada. O encarregado quer saber o que aconteceu e o que precisa ser comprado. Suas decisões vão para a montagem: elas têm consequência.',
    steps: [
      warmup('nas missões anteriores'),
      { id: 'bancada', kind: 'bench', title: 'Inspecionar as peças', demonstrates: 'Reconhecer a condição de cada peça, medir o eixo e decidir o destino de cada uma.' }
    ],
    demonstrated: ['Reconhece defeitos típicos em rotor, selo e rolamento', 'Compara uma medida com a tolerância do desenho', 'Registra a decisão sobre cada peça'],
    xp: 160
  },
  {
    id: 'os-05',
    code: 'OS-05',
    title: 'Remontar e dar partida',
    level: 'Avançado',
    objective: 'Remontar a bomba, encontrar erros de montagem e decidir se ela pode voltar a operar.',
    situation: 'A bomba volta para a base com as peças que você escolheu. No teste de partida, cada decisão da bancada aparece nos instrumentos.',
    steps: [
      warmup('nas missões anteriores'),
      { id: 'lab-montar', kind: 'lab', labStage: 'montar', title: 'Montar no 3D', demonstrates: 'Remontar a bomba de dentro para fora, sem destaque automático.' },
      { id: 'erros-montagem', kind: 'fault3d', title: 'Conferência de montagem', demonstrates: 'Achar o que está faltando ou fora do lugar em uma bomba montada por outra pessoa.' },
      { id: 'partida', kind: 'startup', title: 'Teste de partida', demonstrates: 'Fazer a devolução em ordem, ler os instrumentos e decidir: liberar ou parar.' }
    ],
    demonstrated: ['Remonta a bomba na sequência correta', 'Encontra erros de montagem', 'Decide a liberação a partir dos instrumentos'],
    xp: 180
  },
  {
    id: 'os-06',
    code: 'OS-06',
    title: 'Avaliação prática',
    level: 'Profissional',
    objective: 'Resolver sozinho um caso novo, do chamado até a liberação, sem dicas e sem roteiro.',
    situation: 'Outra bomba, outro problema, e desta vez ninguém está do seu lado. Vale o que você decidir. A tentativa seguinte traz um caso diferente.',
    steps: [
      warmup('em toda a jornada'),
      { id: 'avaliacao', kind: 'assessment', title: 'Caso sem roteiro', demonstrates: 'Atingir o mínimo em segurança, diagnóstico, procedimento e inspeção.' }
    ],
    demonstrated: ['Conduz um caso completo sem orientação', 'Sustenta a decisão com evidências', 'Não toma nenhuma decisão insegura'],
    xp: 300
  }
];

export const MISSIONS_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m])) as Record<MissionId, Mission>;

export const isMissionId = (id: string | null | undefined): id is MissionId => MISSION_IDS.includes(id as MissionId);

/** Configuração do instrutor (ver courseConfig.ts). Aqui entra só o que a progressão precisa. */
export interface MissionGateConfig {
  hiddenMissions?: string[];
  passScore?: number;
}

const journeyOf = (p: PlayerProfile): JourneyState => p.journey ?? EMPTY_JOURNEY;

/** Etapa cumprida: a regra vem da evidência registrada, nunca de ter aberto a tela. */
export function stepDone(step: MissionStep, missionId: MissionId, p: PlayerProfile): boolean {
  if (step.kind === 'lab') return (p.labMissionStages[PUMP_MACHINE_ID] ?? []).includes(step.labStage!);
  if (step.kind === 'micro') return p.microLessons[step.microId!]?.completedAt !== undefined;
  return (journeyOf(p).missions[missionId]?.steps ?? []).includes(step.id);
}

export function missionProgress(m: Mission, p: PlayerProfile) {
  const counted = m.steps.filter((s) => !s.optional);
  const done = counted.filter((s) => stepDone(s, m.id, p)).length;
  const nextStep = counted.find((s) => !stepDone(s, m.id, p)) ?? null;
  return { done, total: counted.length, complete: done === counted.length, nextStep };
}

export type MissionStatus = 'concluida' | 'em-andamento' | 'disponivel' | 'bloqueada' | 'oculta';

export function missionStatus(m: Mission, p: PlayerProfile, cfg: MissionGateConfig = {}): MissionStatus {
  if (cfg.hiddenMissions?.includes(m.id)) return 'oculta';
  const prog = missionProgress(m, p);
  if (prog.complete) return 'concluida';
  const idx = MISSIONS.indexOf(m);
  const prev = MISSIONS.slice(0, idx).filter((x) => !cfg.hiddenMissions?.includes(x.id));
  if (prev.some((x) => !missionProgress(x, p).complete)) return 'bloqueada';
  return prog.done > 0 ? 'em-andamento' : 'disponivel';
}

/** A missão em que o aluno está: a primeira ainda não concluída. Null quando terminou a jornada. */
export function currentMission(p: PlayerProfile, cfg: MissionGateConfig = {}): Mission | null {
  return MISSIONS.find((m) => !['concluida', 'oculta'].includes(missionStatus(m, p, cfg))) ?? null;
}

/** O que ainda falta para abrir a próxima missão, em linguagem de tarefa. */
export function unlockHint(p: PlayerProfile, cfg: MissionGateConfig = {}): { mission: Mission; needs: string } | null {
  const cur = currentMission(p, cfg);
  if (!cur) return null;
  const next = MISSIONS.slice(MISSIONS.indexOf(cur) + 1).find((m) => !cfg.hiddenMissions?.includes(m.id));
  if (!next) return null;
  const step = missionProgress(cur, p).nextStep;
  return { mission: next, needs: step ? `${cur.code}: ${step.demonstrates}` : `Concluir a ${cur.code}.` };
}

export interface Recommendation {
  id: string;
  eyebrow: string;
  title: string;
  /** Por que esta atividade agora: a regra fica visível para o aluno. */
  why: string;
  cta: string;
  screen: GameScreen;
  param?: string;
}

export interface RecommendInput {
  dueCards: number;
  openMistakes: number;
  /** Aulas rápidas de segurança ainda não concluídas (primeira id). */
  nextSafetyMicro?: { id: string; title: string; done: number; total: number };
  weakTopic?: { id: string; title: string };
}

/**
 * Recomendação da próxima atividade: regras fixas, em ordem, sem nada aleatório.
 * 1) Segurança antes de tudo. 2) Avaliação reprovada: reforçar antes de repetir. 3) Revisões vencidas (3 ou mais).
 * 4) Próxima etapa da jornada. 5) Revisão menor, tema fraco ou simulado.
 */
export function recommend(p: PlayerProfile, input: RecommendInput, cfg: MissionGateConfig = {}): Recommendation {
  const { nextSafetyMicro: safety, dueCards, weakTopic } = input;
  if (safety) {
    return {
      id: 'seguranca',
      eyebrow: safety.done ? `Segurança na oficina · ${safety.done} de ${safety.total} aulas` : 'Primeiro passo recomendado',
      title: safety.done ? `Continuar: ${safety.title}` : 'Comece pela segurança na oficina',
      why: 'Segurança vem antes de ferramenta e de máquina. São aulas de 1 a 5 minutos, com base nas NRs.',
      cta: safety.done ? 'Continuar a segurança' : 'Começar pela segurança',
      screen: 'micro',
      param: safety.id
    };
  }
  const runs = journeyOf(p).assessmentRuns;
  const lastRun = runs[runs.length - 1];
  const assessmentDone = runs.some((r) => r.passed);
  if (lastRun && !assessmentDone && dueCards > 0) {
    return {
      id: 'reforco',
      eyebrow: 'Antes de tentar de novo',
      title: 'Revise o que ficou fraco na avaliação',
      why: 'Repetir a avaliação logo depois de errar mede sorte. Rever primeiro faz a próxima tentativa valer.',
      cta: 'Revisar agora',
      screen: 'missions',
      param: 'revisao'
    };
  }
  if (dueCards >= 3) {
    return {
      id: 'revisao',
      eyebrow: `${dueCards} cartões para revisar hoje`,
      title: 'Revisão rápida antes de seguir',
      why: 'Lembrar sem consultar, alguns dias depois, é o que fixa o conteúdo. Leva cerca de 2 minutos.',
      cta: 'Começar a revisão',
      screen: 'missions',
      param: 'revisao'
    };
  }
  const cur = currentMission(p, cfg);
  if (cur) {
    const prog = missionProgress(cur, p);
    const step = prog.nextStep;
    return {
      id: 'missao',
      eyebrow: `${cur.code} · ${prog.done} de ${prog.total} etapas`,
      title: step ? `${cur.title}: ${step.title}` : cur.title,
      why: step ? `Para concluir esta etapa: ${step.demonstrates.charAt(0).toLowerCase()}${step.demonstrates.slice(1)}` : cur.objective,
      cta: prog.done ? 'Continuar a missão' : 'Abrir a missão',
      screen: 'missions',
      param: cur.id
    };
  }
  if (dueCards > 0) {
    return {
      id: 'revisao',
      eyebrow: `${dueCards} ${dueCards === 1 ? 'cartão' : 'cartões'} para revisar hoje`,
      title: 'Manter o que você já aprendeu',
      why: 'A jornada terminou, mas sem revisão o conteúdo some aos poucos.',
      cta: 'Começar a revisão',
      screen: 'missions',
      param: 'revisao'
    };
  }
  if (weakTopic) {
    return {
      id: 'tema-fraco',
      eyebrow: 'Recomendado para reforçar',
      title: `Praticar ${weakTopic.title.toLowerCase()}`,
      why: 'Na última sessão deste tema você acertou menos de 60%.',
      cta: 'Praticar 5 questões',
      screen: 'practice',
      param: weakTopic.id
    };
  }
  return {
    id: 'oficina',
    eyebrow: 'Jornada concluída',
    title: 'Treine a leitura de desenhos',
    why: 'Você terminou as seis ordens de serviço. A Oficina de Desenho treina o que aparece em toda manutenção.',
    cta: 'Abrir a Oficina de Desenho',
    screen: 'drawing'
  };
}
