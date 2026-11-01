import type { PlayerProfile } from '../../types/game';
import { EMPTY_JOURNEY, JourneySkill, MissionId, MISSION_IDS } from './meta';
import { MISSIONS, missionProgress } from './missions';
import type { PumpSpot } from './pumpSection';

/**
 * Cartões de revisão espaçada. Cada um volta depois de 1, 3, 7, 14 e 30 dias (LEITNER_DAYS); errar volta ao começo.
 *
 * `spot`: em vez de escolher um texto, o aluno aponta a região no corte da bomba (recuperar onde a coisa fica).
 * A alternativa certa é sempre a primeira nos dados, e a tela embaralha. `traps` traz o motivo de cada alternativa
 * errada: dizer só “errado” não ensina nada.
 */

export interface ReviewCard {
  id: string;
  from: MissionId;
  skill: JourneySkill;
  prompt: string;
  options?: string[];
  traps?: string[];
  spot?: PumpSpot;
  explanation: string;
}

export const REVIEW_CARDS: ReviewCard[] = [
  {
    id: 'rc-voluta',
    from: 'os-01',
    skill: 'componentes',
    prompt: 'Aponte onde a velocidade do líquido se transforma em pressão.',
    spot: 'volute',
    explanation: 'A voluta alarga aos poucos: o líquido perde velocidade e ganha pressão. O rotor dá a velocidade.'
  },
  {
    id: 'rc-olho',
    from: 'os-01',
    skill: 'componentes',
    prompt: 'Aponte por onde o líquido entra no rotor.',
    spot: 'eye',
    explanation: 'O olho do rotor é a entrada, no centro. É a região de menor pressão da bomba.'
  },
  {
    id: 'rc-rotor-funcao',
    from: 'os-01',
    skill: 'componentes',
    prompt: 'Qual é a função do rotor?',
    options: ['Dar velocidade ao líquido, jogando-o para fora', 'Vedar a passagem do eixo', 'Segurar o eixo no lugar', 'Filtrar o líquido'],
    traps: ['Vedar a passagem do eixo é função do selo mecânico.', 'Quem sustenta o eixo são os rolamentos.', 'Bomba centrífuga não filtra: sólidos passam e desgastam.'],
    explanation: 'As pás giram e empurram o líquido para fora. Essa velocidade vira pressão na voluta.'
  },
  {
    id: 'rc-baixa-pressao',
    from: 'os-01',
    skill: 'diagnostico',
    prompt: 'Onde a pressão é mais baixa dentro da bomba em funcionamento?',
    options: ['Na entrada do rotor (olho)', 'Na saída da voluta', 'Na ponta das pás', 'No flange de recalque'],
    traps: ['Na saída da voluta a pressão já subiu.', 'Na ponta das pás a pressão já é maior que na entrada.', 'O recalque é o lado de maior pressão.'],
    explanation: 'É ali que o líquido pode vaporizar se a sucção for ruim. Por isso a cavitação começa na entrada da pá.'
  },
  {
    id: 'rc-selo-funcao',
    from: 'os-02',
    skill: 'componentes',
    prompt: 'Aponte a peça que impede o líquido de sair pela passagem do eixo.',
    spot: 'pump-mechanical-seal',
    explanation: 'O selo mecânico fica na tampa, onde o eixo que gira atravessa a parte parada.'
  },
  {
    id: 'rc-rolamento-funcao',
    from: 'os-02',
    skill: 'componentes',
    prompt: 'Aponte as peças que sustentam o eixo e deixam ele girar com pouco atrito.',
    spot: 'pump-bearings',
    explanation: 'Os rolamentos ficam no cavalete, longe do líquido, e recebem as cargas do eixo.'
  },
  {
    id: 'rc-chaveta',
    from: 'os-02',
    skill: 'componentes',
    prompt: 'O que faz o rotor girar junto com o eixo?',
    options: ['A chaveta, encaixada no eixo e no cubo do rotor', 'Só a porca do rotor, por atrito', 'A junta da carcaça', 'O selo mecânico'],
    traps: ['A porca segura o rotor no eixo na direção axial; quem transmite o giro é a chaveta.', 'A junta só veda a carcaça: não encosta no eixo.', 'O selo veda: não transmite torque.'],
    explanation: 'Sem chaveta o rotor patinaria no eixo. A porca impede que ele saia na direção do eixo.'
  },
  {
    id: 'rc-cavalete',
    from: 'os-02',
    skill: 'componentes',
    prompt: 'Qual é a vantagem da construção back-pull-out?',
    options: [
      'Tirar a parte que gira sem mexer na tubulação nem no motor',
      'Bombear nos dois sentidos',
      'Dispensar o alinhamento depois da montagem',
      'Funcionar sem selo mecânico'
    ],
    traps: ['O sentido de giro é definido pelo rotor e pela voluta.', 'O alinhamento precisa ser conferido de novo depois.', 'O selo continua existindo: ele só sai junto com a unidade.'],
    explanation: 'A carcaça fica presa à tubulação e o espaçador do acoplamento deixa a unidade sair por trás.'
  },
  {
    id: 'rc-teste-partida',
    from: 'os-03',
    skill: 'seguranca',
    prompt: 'Você bloqueou o disjuntor. O que confirma que o bloqueio foi feito no circuito certo?',
    options: ['Tentar dar partida no comando local e ver que o motor não gira', 'Olhar a etiqueta do painel', 'Perguntar ao operador', 'Medir a corrente com a mão no cabo'],
    traps: ['A etiqueta do painel pode estar errada ou desatualizada.', 'Confirmação verbal não prova nada sobre o circuito.', 'Nunca teste energia com o corpo.'],
    explanation: 'O teste de partida prova na prática que aquela máquina está sem energia antes de você pôr as mãos.'
  },
  {
    id: 'rc-energias',
    from: 'os-03',
    skill: 'seguranca',
    prompt: 'A bomba está sem energia elétrica. Por que ainda não dá para soltar a carcaça?',
    options: ['Ainda pode haver líquido sob pressão e quente na tubulação', 'Porque o motor ainda está magnetizado', 'Porque os parafusos só soltam frios', 'Não há motivo: já pode soltar'],
    traps: ['Magnetismo do motor não é o risco aqui.', 'Temperatura importa pela queimadura, não pelo parafuso.', 'Energia elétrica é só uma das energias: faltam pressão e temperatura.'],
    explanation: 'Isolar as válvulas, aliviar a pressão, drenar e esperar esfriar também faz parte da liberação.'
  },
  {
    id: 'rc-cruzado',
    from: 'os-03',
    skill: 'procedimento',
    prompt: 'Por que afrouxar todos os parafusos um pouco antes de retirar o primeiro?',
    options: ['Se ainda houver pressão, ela aparece na junta e você para a tempo', 'Para gastar menos a chave', 'Para os parafusos saírem mais limpos', 'Para a rosca não aquecer'],
    traps: ['O desgaste da chave não é o motivo.', 'Limpeza não muda nada aqui.', 'A rosca não aquece nessa operação.'],
    explanation: 'É a última barreira contra um jato de líquido: a junta “avisa” antes de a tampa soltar de vez.'
  },
  {
    id: 'rc-extrator',
    from: 'os-03',
    skill: 'procedimento',
    prompt: 'Qual ferramenta retira o rolamento do eixo sem danificar os assentos?',
    options: ['Extrator de rolamentos, puxando pelo anel que tem aperto', 'Martelo de aço direto no anel', 'Talhadeira entre o anel e o encosto', 'Maçarico até soltar'],
    traps: ['Pancada direta marca as pistas e pode lascar o anel.', 'A talhadeira risca o eixo e o encosto.', 'Maçarico altera a dureza e é perigoso sem procedimento.'],
    explanation: 'A força passa pelo anel com aperto, nunca pelos corpos rolantes.'
  },
  {
    id: 'rc-cavitacao-marca',
    from: 'os-04',
    skill: 'inspecao',
    prompt: 'Um rotor tem furinhos, como uma esponja, no lado de baixa pressão da pá, perto da entrada. O que isso sugere?',
    options: ['Cavitação', 'Ataque de corrosão uniforme', 'Desbalanceamento', 'Falta de lubrificação'],
    traps: ['Corrosão uniforme atinge toda a superfície molhada, não só a entrada da pá.', 'Desbalanceamento é efeito possível, não a origem do desgaste.', 'O rotor não depende da lubrificação do mancal.'],
    explanation: 'As bolhas de vapor nascem na baixa pressão e implodem na pá. O local do dano é a pista: aponta para a sucção.'
  },
  {
    id: 'rc-selo-seco',
    from: 'os-04',
    skill: 'inspecao',
    prompt: 'A face do selo tem trincas radiais finas e cor de queimado. Qual é a causa mais provável?',
    options: ['Calor por funcionar sem líquido entre as faces', 'Partículas abrasivas no líquido', 'Aperto excessivo dos parafusos da carcaça', 'Rolamento novo'],
    traps: ['Partículas deixam riscos circulares, não trincas radiais.', 'O aperto da carcaça não atinge as faces do selo dessa forma.', 'Rolamento novo não aquece a face do selo.'],
    explanation: 'As faces dependem do filme de líquido. Sem ele, o atrito aquece e a face trinca.'
  },
  {
    id: 'rc-tolerancia',
    from: 'os-04',
    skill: 'inspecao',
    prompt: 'O desenho pede Ø 25 h6 (de 24,987 a 25,000 mm). O micrômetro leu 24,96 mm. E agora?',
    options: ['Fora da tolerância: separar e registrar', 'Aprovado: a diferença é pequena', 'Aprovado: h6 aceita qualquer valor abaixo de 25', 'Medir com o paquímetro para ver se dá melhor'],
    traps: ['Pequeno é relativo: a faixa inteira tem só 0,013 mm.', 'h6 tem limite inferior: 24,987 mm.', 'Trocar por um instrumento menos preciso não melhora a peça.'],
    explanation: 'Quem manda é a faixa do desenho. Fora dela, a peça não pode voltar como está.'
  },
  {
    id: 'rc-junta',
    from: 'os-05',
    skill: 'procedimento',
    prompt: 'A junta da carcaça saiu inteira. Ela pode voltar para a bomba?',
    options: ['Não: junta usada já foi esmagada, vai junta nova', 'Sim, se não rasgou', 'Sim, com cola por cima', 'Sim, apertando mais os parafusos'],
    traps: ['Mesmo inteira, ela perdeu a capacidade de vedar.', 'Cola fora do indicado pelo fabricante atrapalha a vedação.', 'Mais aperto estica o parafuso e não recupera a junta.'],
    explanation: 'Junta é peça de sacrifício. Toda abertura pede junta nova, do tipo do fabricante.'
  },
  {
    id: 'rc-escorva',
    from: 'os-05',
    skill: 'seguranca',
    prompt: 'Por que não se liga a bomba sem encher de líquido?',
    options: ['As faces do selo ficam sem filme de líquido e queimam', 'Porque o motor consome mais', 'Porque a voluta enferruja', 'Porque a pressão fica alta demais'],
    traps: ['O consumo não é o problema principal: o dano é imediato no selo.', 'A corrosão não acontece em segundos.', 'Sem líquido quase não há pressão.'],
    explanation: 'É a escorva: encher a bomba e tirar o ar. Alguns segundos a seco já podem destruir o selo.'
  },
  {
    id: 'rc-liberar-bloqueio',
    from: 'os-05',
    skill: 'seguranca',
    prompt: 'Quem retira o bloqueio da bomba depois da manutenção?',
    options: ['Só o responsável, com todos fora da área', 'Qualquer pessoa da equipe', 'O operador, assim que quiser ligar', 'Quem chegar primeiro no painel'],
    traps: ['Cada bloqueio tem responsável: ninguém tira o cadeado de outro.', 'O operador não retira bloqueio de manutenção.', 'Não é uma corrida: há gente que pode estar na área.'],
    explanation: 'O bloqueio só sai quando quem o colocou confirma que está tudo fechado e a área está livre.'
  },
  {
    id: 'rc-parar',
    from: 'os-05',
    skill: 'diagnostico',
    prompt: 'Na partida, o selo pinga sem parar e a vibração sobe. O que fazer?',
    options: ['Parar, bloquear e investigar antes de liberar', 'Liberar: pequenos vazamentos somem sozinhos', 'Apertar os parafusos com a bomba em operação', 'Deixar ligada para “assentar”'],
    traps: ['Vazamento contínuo no selo é sinal de falha, não de ajuste.', 'Mexer em bomba em operação é inseguro.', 'Vibração subindo piora o selo e o rolamento.'],
    explanation: 'Os instrumentos existem para decidir. Se o comportamento foge do esperado, a bomba não é liberada.'
  }
];

export const REVIEW_CARDS_BY_ID = Object.fromEntries(REVIEW_CARDS.map((c) => [c.id, c]));

/** Cartões liberados: os das missões concluídas e os da missão em andamento (com alguma etapa feita). */
export function unlockedCards(p: PlayerProfile, extra: ReviewCard[] = [], disabled: string[] = []): ReviewCard[] {
  const started = new Set<MissionId>();
  MISSIONS.forEach((m) => {
    if (missionProgress(m, p).done > 0) started.add(m.id);
  });
  return [...REVIEW_CARDS, ...extra].filter((c) => started.has(c.from) && !disabled.includes(c.id));
}

/** Vencidos: nunca vistos ou com a data passada. A ordem é fixa: o mais atrasado primeiro, depois a ordem do banco. */
export function dueCards(p: PlayerProfile, now: number, extra: ReviewCard[] = [], disabled: string[] = []): ReviewCard[] {
  const review = (p.journey ?? EMPTY_JOURNEY).review;
  return unlockedCards(p, extra, disabled)
    .map((card, i) => ({ card, i, due: review[card.id]?.dueAt ?? 0 }))
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due || a.i - b.i)
    .map((c) => c.card);
}

/**
 * Cartões do aquecimento: conteúdo de missões ANTERIORES, primeiro os vencidos, depois os menos vistos.
 * Na OS-02 só há cartões da OS-01; na OS-06, de toda a jornada.
 */
export function warmupCards(p: PlayerProfile, missionId: MissionId, n = 3, extra: ReviewCard[] = [], disabled: string[] = []): ReviewCard[] {
  const review = (p.journey ?? EMPTY_JOURNEY).review;
  const before = MISSION_IDS.slice(0, MISSION_IDS.indexOf(missionId));
  return [...REVIEW_CARDS, ...extra]
    .filter((c) => before.includes(c.from) && !disabled.includes(c.id))
    .map((card, i) => ({ card, i, seen: review[card.id]?.seen ?? 0, due: review[card.id]?.dueAt ?? 0 }))
    .sort((a, b) => a.due - b.due || a.seen - b.seen || a.i - b.i)
    .slice(0, n)
    .map((c) => c.card);
}
