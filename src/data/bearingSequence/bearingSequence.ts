/**
 * Montagem de rolamentos — lógica pura (sem React), testada em tests/e2e/bearingSequence.spec.ts.
 *
 * Cada rodada é um procedimento: passos com pré-requisitos (alguns podem ser feitos em qualquer ordem entre si)
 * e ações erradas plausíveis, cada uma com o motivo. O aluno escolhe a próxima ação entre cartões embaralhados.
 * Nenhum valor de temperatura, ajuste, torque ou quantidade de graxa é informado: isso vem do fabricante do rolamento
 * e do projeto da máquina (mesma regra do conjunto de mancais do Lab 3D, bearingAssemblyMachine.ts).
 */

import { rng } from '../metrology/metrologyMaster';
import { BEARING_ROUNDS, BearingRoundId, MAX_MISTAKES } from './rounds';

export * from './rounds';

export interface Step {
  id: string;
  text: string;
  /** Passos que precisam estar feitos antes deste. */
  after: string[];
  /** Por que o passo existe (mostrado quando ele entra na sequência). */
  why: string;
}

export interface WrongAction {
  id: string;
  text: string;
  /** O que dá errado se fizer isso. */
  why: string;
}

export interface Scenario {
  id: BearingRoundId;
  title: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  context: string;
  steps: Step[];
  wrong: WrongAction[];
}

/** Passos comuns às montagens no eixo (rodadas 1 e 2). */
const CONFERIR: Step = {
  id: 'conferir',
  text: 'Conferir se a referência gravada no rolamento novo é a mesma do antigo (ou a do desenho)',
  after: [],
  why: 'Rolamentos parecidos podem ter folga interna, vedação ou classe diferentes. A referência tem que ser a especificada.'
};
const LIMPAR: Step = {
  id: 'limpar-eixo',
  text: 'Limpar o assento e o ressalto do eixo e tirar rebarbas',
  after: [],
  why: 'Sujeira ou rebarba no assento faz o anel entrar torto ou não encostar no ressalto.'
};
const MEDIR: Step = {
  id: 'medir-assento',
  text: 'Medir o diâmetro do assento com micrômetro e comparar com o desenho',
  after: ['limpar-eixo'],
  why: 'Assento gasto deixa o anel interno girar no eixo; assento grande demais força o rolamento. Mede-se com o eixo limpo.'
};
const DESEMBALAR: Step = {
  id: 'desembalar',
  text: 'Tirar o rolamento da embalagem só na hora de montar, sem lavar o protetivo',
  after: ['conferir'],
  why: 'Fora da embalagem ele pega poeira. O óleo protetivo é compatível com as graxas comuns; só se lava se o fabricante indicar.'
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'montagem-a-frio',
    title: BEARING_ROUNDS[0].title,
    level: 'Iniciante',
    context:
      'Rolamento rígido de esferas pequeno, com aperto (interferência) no anel interno. O eixo já está fora da máquina, na bancada.',
    steps: [
      CONFERIR,
      LIMPAR,
      MEDIR,
      DESEMBALAR,
      {
        id: 'bucha',
        text: 'Apoiar a bucha de montagem no anel interno e bater com martelo de face macia até encostar no ressalto',
        after: ['medir-assento', 'desembalar'],
        why: 'A força vai pelo anel que tem aperto. Assim ela não atravessa as esferas e não marca as pistas.'
      },
      {
        id: 'anel-elastico',
        text: 'Colocar o anel elástico no canal do eixo com alicate de anel elástico para eixo',
        after: ['bucha'],
        why: 'O anel elástico trava o rolamento contra o ressalto. O alicate certo abre o anel sem deformá-lo.'
      },
      {
        id: 'girar-mao',
        text: 'Girar o rolamento devagar com a mão e conferir se gira livre e sem ruído',
        after: ['anel-elastico'],
        why: 'Travamento ou aspereza logo após a montagem indicam dano ou montagem torta.'
      }
    ],
    wrong: [
      {
        id: 'bater-externo',
        text: 'Bater no anel externo com martelo de aço até o rolamento entrar',
        why: 'A força passa pelas esferas e marca as pistas: o rolamento novo já sai com defeito. E martelo de aço lasca o anel.'
      },
      {
        id: 'lavar-novo',
        text: 'Lavar o rolamento novo em solvente para tirar a sujeira',
        why: 'O rolamento novo vem limpo. Lavar tira o protetivo e, nos blindados, a graxa de fábrica, que não se repõe.'
      },
      {
        id: 'ar-comprimido',
        text: 'Girar o rolamento com jato de ar comprimido para testar',
        why: 'Sem carga e sem lubrificação as esferas giram rápido demais e se marcam; o anel também pode escapar e ferir alguém.'
      }
    ]
  },
  {
    id: 'montagem-a-quente',
    title: BEARING_ROUNDS[1].title,
    level: 'Intermediário',
    context:
      'Rolamento maior, com aperto no anel interno: a frio ele não entra sem força excessiva. A oficina tem aquecedor indutivo com sensor de temperatura.',
    steps: [
      CONFERIR,
      LIMPAR,
      MEDIR,
      DESEMBALAR,
      {
        id: 'aquecer',
        text: 'Aquecer o rolamento no aquecedor indutivo, com o sensor no anel interno, até a temperatura indicada pelo fabricante',
        after: ['desembalar'],
        why: 'O anel interno dilata e passa pelo assento sem força. O sensor evita passar do limite que tira a dureza do aço.'
      },
      {
        id: 'encaixar',
        text: 'Com luvas térmicas, encaixar o rolamento de uma vez até encostar no ressalto',
        after: ['aquecer', 'medir-assento'],
        why: 'Ele esfria rápido sobre o eixo: se parar no meio, prende fora do lugar.'
      },
      {
        id: 'segurar',
        text: 'Manter o rolamento pressionado contra o ressalto até esfriar',
        after: ['encaixar'],
        why: 'Ao esfriar ele também encolhe na largura e pode se afastar do ressalto, deixando uma folga.'
      },
      {
        id: 'travar',
        text: 'Com o rolamento frio, colocar o anel elástico (ou a porca de fixação) e conferir o giro à mão',
        after: ['segurar'],
        why: 'Travar só depois de frio garante que o anel ficou encostado. O giro à mão confirma a montagem.'
      }
    ],
    wrong: [
      {
        id: 'macarico',
        text: 'Aquecer o rolamento com maçarico para ir mais rápido',
        why: 'A chama aquece um ponto só, passa da temperatura e tira a dureza do aço. Rolamento aquecido assim vai para o lixo.'
      },
      {
        id: 'agua',
        text: 'Jogar água no rolamento montado para esfriar logo',
        why: 'O choque térmico contrai o anel de forma desigual e a água fica dentro do rolamento, causando corrosão.'
      },
      {
        id: 'oleo-sem-controle',
        text: 'Mergulhar o rolamento em óleo quente, sem termômetro',
        why: 'Sem controle não se sabe a temperatura: pode passar do limite ou nem dilatar o suficiente. Use o aquecedor com sensor.'
      }
    ]
  },
  {
    id: 'troca-no-mancal',
    title: BEARING_ROUNDS[2].title,
    level: 'Avançado',
    context:
      'O rolamento de um mancal de pedestal bipartido está ruidoso e precisa ser trocado. O eixo recebe o giro por correia e o entrega por acoplamento.',
    steps: [
      {
        id: 'bloquear',
        text: 'Desligar, bloquear com cadeado e etiqueta e testar a partida do motor',
        after: [],
        why: 'Ninguém pode ligar a máquina enquanto as mãos estão nas polias, na correia e nos mancais.'
      },
      {
        id: 'soltar-transmissao',
        text: 'Soltar a correia e o acoplamento',
        after: ['bloquear'],
        why: 'Só com o equipamento bloqueado. Livre da correia e do acoplamento, o eixo pode sair dos mancais.'
      },
      {
        id: 'marcar-tampas',
        text: 'Marcar cada tampa com a sua base',
        after: ['bloquear'],
        why: 'Base e tampa são usinadas juntas: cada tampa tem que voltar para a mesma base.'
      },
      {
        id: 'tirar-tampas',
        text: 'Soltar os parafusos e retirar as tampas',
        after: ['marcar-tampas', 'soltar-transmissao'],
        why: 'Com as tampas fora, o eixo sai com os rolamentos.'
      },
      {
        id: 'sacar',
        text: 'Retirar o eixo e sacar o rolamento velho com saca-polias apoiado no anel interno',
        after: ['tirar-tampas'],
        why: 'Puxar pelo anel externo força as esferas e pode danificar o assento do eixo.'
      },
      {
        id: 'montar-novo',
        text: 'Limpar e medir o assento, montar o rolamento novo pelo anel interno e travar',
        after: ['sacar'],
        why: 'É o procedimento das rodadas anteriores: assento limpo e medido, força só no anel com aperto.'
      },
      {
        id: 'engraxar',
        text: 'Aplicar a graxa indicada, na quantidade do fabricante',
        after: ['montar-novo'],
        why: 'Graxa de menos causa desgaste; graxa demais aquece o rolamento. A quantidade vem do fabricante.'
      },
      {
        id: 'fechar',
        text: 'Recolocar o eixo e as tampas nas suas bases, apertando os parafusos alternadamente, em etapas, até o torque indicado',
        after: ['engraxar'],
        why: 'Aperto alternado fecha a tampa por igual e não deforma o anel externo.'
      },
      {
        id: 'girar-eixo',
        text: 'Remontar correia e acoplamento e girar o eixo à mão',
        after: ['fechar'],
        why: 'Ainda bloqueado: confirma que nada prende antes de ter energia.'
      },
      {
        id: 'liberar',
        text: 'Retirar o bloqueio, ligar e acompanhar ruído e temperatura do mancal',
        after: ['girar-eixo'],
        why: 'O bloqueio sai por último, quando todos estão afastados. Os primeiros minutos mostram se a montagem ficou boa.'
      }
    ],
    wrong: [
      {
        id: 'trocar-tampas',
        text: 'Montar as tampas em qualquer base, já que são iguais',
        why: 'Elas parecem iguais, mas cada tampa foi usinada com a sua base. Trocadas, deformam o alojamento e aquecem o rolamento.'
      },
      {
        id: 'aperto-um-lado',
        text: 'Apertar um parafuso da tampa até o fim e só depois o outro',
        why: 'A tampa fica inclinada e aperta o anel externo de um lado só.'
      },
      {
        id: 'encher-graxa',
        text: 'Encher a caixa toda de graxa para durar mais',
        why: 'Graxa demais é agitada pelo rolamento, aquece e pode vazar pelas vedações.'
      }
    ]
  }
];

export const SCENARIOS_BY_ID: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));

/* ───────────── Regras ───────────── */

export type PickResult =
  | { kind: 'ok'; step: Step }
  | { kind: 'wrong'; action: WrongAction }
  /** Passo certo, mas antes falta fazer `missing`. */
  | { kind: 'early'; step: Step; missing: Step[] };

/** Confere a ação escolhida, dados os passos já feitos. */
export function checkPick(scenario: Scenario, done: string[], id: string): PickResult {
  const wrong = scenario.wrong.find((w) => w.id === id);
  if (wrong) return { kind: 'wrong', action: wrong };
  const step = scenario.steps.find((s) => s.id === id);
  if (!step) throw new Error(`Ação desconhecida: ${id}`);
  const missing = step.after.filter((a) => !done.includes(a)).map((a) => scenario.steps.find((s) => s.id === a)!);
  return missing.length ? { kind: 'early', step, missing } : { kind: 'ok', step };
}

/** Refaz a rodada a partir das escolhas: passos aceitos (em ordem) e o resultado de cada escolha. */
export function replay(scenario: Scenario, picks: string[]): { done: string[]; results: PickResult[] } {
  const done: string[] = [];
  const results = picks.map((id) => {
    const res = checkPick(scenario, done, id);
    if (res.kind === 'ok' && !done.includes(id)) done.push(id);
    return res;
  });
  return { done, results };
}

export interface Card {
  id: string;
  text: string;
}

/** Cartões da rodada (passos + ações erradas) embaralhados. Mesma semente → mesma ordem. */
export function cardsFor(scenario: Scenario, seed: number): Card[] {
  const r = rng(seed);
  const cards = [...scenario.steps, ...scenario.wrong].map(({ id, text }) => ({ id, text }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/* ───────────── Pontuação ───────────── */

export const POINTS_PER_STEP = 10;

export interface SequenceResult {
  mistakes: number;
  score: number;
  maxScore: number;
  passed: boolean;
}

/**
 * `picks` = todas as escolhas da rodada, na ordem. Um passo pontua se entrou sem erro desde o passo anterior.
 * Erro não tira pontos já ganhos; conclui com no máximo MAX_MISTAKES erros e todos os passos feitos.
 */
export function scoreSequence(scenario: Scenario, picks: string[]): SequenceResult {
  const { done, results } = replay(scenario, picks);
  let mistakes = 0;
  let cleanSinceLast = true;
  let score = 0;
  for (const res of results) {
    if (res.kind === 'ok') {
      if (cleanSinceLast) score += POINTS_PER_STEP;
      cleanSinceLast = true;
    } else {
      mistakes++;
      cleanSinceLast = false;
    }
  }
  const complete = done.length === scenario.steps.length;
  return { mistakes, score, maxScore: scenario.steps.length * POINTS_PER_STEP, passed: complete && mistakes <= MAX_MISTAKES };
}

export const BEARING_SKILL = 'bearings.mounting';
