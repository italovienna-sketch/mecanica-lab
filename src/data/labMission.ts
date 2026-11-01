/**
 * Missões do laboratório 3D: etapas pedagógicas, sequências de desmontagem/montagem,
 * trajetórias das peças no modelo 3D e informações de segurança por componente.
 *
 * Coordenadas em "unidades de cena" (1 unidade ≈ 100 mm no modelo da bomba).
 */

import { BEARING_ASSEMBLY_LAB, BEARING_ASSEMBLY_PART_SAFETY } from './industry/bearingAssemblyMachine';
import { BELT_CONVEYOR_LAB, BELT_CONVEYOR_PART_SAFETY } from './industry/beltConveyorMachine';
import { DIAPHRAGM_PUMP_LAB, DIAPHRAGM_PUMP_PART_SAFETY } from './industry/diaphragmPumpMachine';
import { MOTOR_GEARBOX_LAB, MOTOR_GEARBOX_PART_SAFETY } from './industry/motorGearboxMachine';
import { ClaimKind, RegRef } from './regulatorySources';
import { PUMP_LAB, PUMP_PART_SAFETY } from './centrifugalPumpLab';

export type Vec3 = [number, number, number];

/** Pergunta rápida ao fim de uma etapa. A alternativa correta fica sempre no índice 0 (a tela embaralha). */
export interface StepQuiz {
  question: string;
  options: string[];
  explanation: string;
}

/**
 * Textos próprios da montagem. Montar não é só o inverso de desmontar: a ferramenta, o cuidado e a
 * conferência mudam (ex.: o rolamento sai com extrator, mas entra aquecido ou com bucha no anel interno).
 */
export interface AssemblyText {
  title: string;
  instruction: string;
  tool: string;
  toolWhy: string;
  safety?: string;
  /** O que conferir logo depois de instalar a peça. */
  check: string;
  quiz?: StepQuiz;
}

/** Item da liberação para manutenção (antes da primeira etapa de desmontagem). */
export interface PreWorkItem {
  id: string;
  text: string;
  why: string;
  kind: ClaimKind;
  ref?: RegRef;
}

export interface ProcedureStep {
  partId: string;
  title: string;
  instruction: string;
  tool: string;
  /** Por que essa ferramenta é a adequada. */
  toolWhy: string;
  safety?: string;
  /** O que inspecionar na peça logo depois de retirá-la (ponto de atenção do mecânico). */
  observe?: string;
  /** Outras ferramentas oferecidas no modo "Tentar sozinho" (escolhas menos adequadas). */
  toolDistractors?: { tool: string; why: string }[];
  /**
   * Movimentos executados ao REMOVER a peça nesta etapa: para cada peça afetada, a lista de
   * pontos (deslocamentos absolutos em relação à posição montada) que ela percorre em ordem.
   * O último ponto é a posição final. Na montagem, o caminho é percorrido ao contrário.
   */
  moves: Record<string, Vec3[]>;
  /** Peças que ficam transparentes durante esta etapa para que o movimento interno seja visível. */
  xrayParts?: string[];
  /** Como o conjunto deve ficar ao terminar a etapa. */
  result?: string;
  /** Pergunta de verificação depois da etapa de desmontagem (libera a próxima etapa). */
  quiz?: StepQuiz;
  /** Textos da mesma etapa na montagem (ordem inversa). Sem eles, a montagem usa um texto genérico. */
  assembly?: AssemblyText;
}

export interface MissionStage {
  id: 'conhecer' | 'explorar' | 'identificar' | 'desmontar' | 'montar' | 'verificar';
  label: string;
  short: string;
}

export const MISSION_STAGES: MissionStage[] = [
  { id: 'conhecer', label: 'Conhecer o equipamento', short: 'Conhecer' },
  { id: 'explorar', label: 'Explorar em 3D', short: 'Explorar' },
  { id: 'identificar', label: 'Identificar as peças', short: 'Identificar' },
  { id: 'desmontar', label: 'Desmontar em sequência', short: 'Desmontar' },
  { id: 'montar', label: 'Montar de novo', short: 'Montar' },
  { id: 'verificar', label: 'Verificar o aprendizado', short: 'Verificar' }
];

export const PUMP_MISSION_STAGES = MISSION_STAGES;

export interface IdentifyTarget {
  partId: string;
  prompt: string;
  hint: string;
  /** Liga a transparência das peças externas para facilitar achar peças internas. */
  needsXray?: boolean;
}

export interface MachineLabConfig {
  machineId: string;
  /** Texto curto para quem nunca viu o equipamento. */
  purpose: string;
  whereUsed: string;
  source: 'procedural-pump' | 'procedural-gear-pump' | 'procedural-lathe' | 'procedural-bearing-assembly' | 'procedural-conveyor' | 'procedural-diaphragm-pump' | 'procedural-motor-gearbox' | 'glb';
  /**
   * Modelo .glb do pipeline Blender (peças com `extras.partId`, mesmas coordenadas do modelo procedural).
   * Usado na qualidade "alta"; na "baixa" ou se o download falhar, o laboratório usa o modelo de `source`.
   */
  modelUrl?: string;
  /** Peças que giram juntas em torno do eixo X quando o modelo não traz animação própria (ex.: rotor e eixo). */
  spinParts?: string[];
  /** Texto do modo "em operação" (modelos com animação de giro): o que observar enquanto gira. */
  operating?: { label: string; observe: string };
  /** Peças de carcaça que podem ser mostradas em corte (metade da frente escondida). */
  cutawayParts?: string[];
  /** Cuidados antes de qualquer manutenção, mostrados na etapa "Conhecer". */
  preWorkSafety?: string[];
  /** Liberação para manutenção: itens que o aluno confirma antes da primeira etapa de desmontagem. */
  preWorkChecklist?: PreWorkItem[];
  /** O que fazer antes de devolver o equipamento para operação (depois da montagem). */
  returnToService?: { text: string; ref?: RegRef }[];
  /** Altura do piso da cena (padrão −2,2, a base da bomba). */
  floorY?: number;
  accuracy: {
    label: string;
    detail: string;
  };
  disassembly: ProcedureStep[];
  explode: Record<string, Vec3>;
  identify: IdentifyTarget[];
  checkQuestionIds: string[];
  lessonId: string;
}

export const GEARBOX_LAB: MachineLabConfig = {
  machineId: 'gearbox-reducer',
  purpose:
    'O redutor diminui a rotação do motor e, na mesma proporção (descontadas as perdas), aumenta o torque. Um pinhão pequeno gira uma coroa maior dentro de uma carcaça com óleo.',
  whereUsed: 'Esteiras transportadoras, misturadores, elevadores de canecas e máquinas que precisam de força com pouca velocidade.',
  source: 'glb',
  preWorkSafety: [
    'Desligar, bloquear com cadeado e etiqueta e testar a partida (LOTO).',
    'Drenar o óleo com o redutor frio.',
    'Usar olhal e talha para a tampa; nunca ficar sob carga suspensa.'
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D (.glb, licença CC0) gerado no projeto para ensino: um estágio de engrenagens helicoidais (Z1 = 17, Z2 = 82) com rolamentos de rolos cônicos e retentores. Não representa um fabricante ou modelo comercial específico.'
  },
  disassembly: [
    {
      partId: 'part-bolts-perimeter',
      title: 'Soltar os parafusos da tampa',
      instruction: 'Com o redutor parado, bloqueado e com o óleo drenado, solte os parafusos em sequência cruzada.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'O aperto cruzado (e a soltura cruzada) evita empenar a tampa e a face de vedação.',
      safety: 'Drene o óleo com o equipamento frio para evitar queimaduras.',
      moves: { 'part-bolts-perimeter': [[0, 4.4, 0]] }
    },
    {
      partId: 'part-housing-top',
      title: 'Levantar a tampa superior',
      instruction: 'Levante a tampa na vertical, guiada pelos pinos. Não force chaves de fenda na junta.',
      tool: 'Olhal de içamento e martelo de face macia',
      toolWhy: 'O martelo macio descola a tampa sem marcar a face usinada; o olhal permite içar com segurança.',
      safety: 'Não fique embaixo da tampa suspensa.',
      moves: { 'part-housing-top': [[0, 3.2, 0]] }
    },
    {
      partId: 'part-radial-seals',
      title: 'Retirar os retentores',
      instruction: 'Retire os retentores das pontas dos eixos antes de levantar os eixos.',
      tool: 'Saca-retentor',
      toolWhy: 'Ele engancha o retentor sem riscar o alojamento nem o eixo.',
      moves: { 'part-radial-seals': [[-1.6, 0.5, 3.2]] }
    },
    {
      partId: 'part-input-pinion-shaft',
      title: 'Retirar o eixo-pinhão',
      instruction: 'Levante o eixo de entrada (pinhão) com os rolamentos, sem bater nos dentes.',
      tool: 'Extrator e cinta de elevação',
      toolWhy: 'A cinta têxtil não marca os dentes e o extrator solta os rolamentos de forma controlada.',
      moves: { 'part-input-pinion-shaft': [[-1.6, 0.5, 0]], 'part-taper-bearings': [[-1.6, 0.5, 1.6]] }
    },
    {
      partId: 'part-output-gear',
      title: 'Retirar a coroa com o eixo de saída',
      instruction: 'Levante o conjunto da coroa. Inspecione os dentes e meça folgas antes de decidir trocas.',
      tool: 'Cinta de elevação e paquímetro',
      toolWhy: 'O paquímetro ajuda a registrar medidas de desgaste para comparar com o manual.',
      moves: { 'part-output-gear': [[2.1, 0.1, 0]] }
    }
  ],
  explode: {
    'part-housing-top': [0, 2.8, 0],
    'part-bolts-perimeter': [0, 3.8, 0],
    'part-input-pinion-shaft': [-1.4, 0.45, 0],
    'part-output-gear': [1.8, 0.1, 0],
    'part-taper-bearings': [-1.4, 0.45, 2.2],
    'part-radial-seals': [-1.4, 0.45, 2.8],
    'part-housing-bottom': [0, -1.2, 0]
  },
  identify: [
    { partId: 'part-output-gear', prompt: 'Clique na coroa — a engrenagem grande do eixo de saída.', hint: 'É a maior engrenagem dentro da carcaça.', needsXray: true },
    { partId: 'part-input-pinion-shaft', prompt: 'Clique no eixo-pinhão — o eixo de entrada que vem do motor.', hint: 'A engrenagem pequena, com menos dentes.', needsXray: true },
    { partId: 'part-taper-bearings', prompt: 'Clique nos rolamentos de rolos cônicos.', hint: 'Ficam nas pontas dos eixos, apoiados na carcaça.', needsXray: true },
    { partId: 'part-housing-top', prompt: 'Clique na tampa superior da carcaça.', hint: 'É a parte de cima da carcaça, presa pelos parafusos.' }
  ],
  checkQuestionIds: ['rol-05', 'fix-01', 'rol-02', 'man-07'],
  lessonId: 'lesson-gearbox-fundamentals'
};


/* ───────────── Bomba de engrenagens externas ───────────── */

/**
 * Tira a peça pelo eixo (para trás, +X) e a deixa na bancada atrás da bomba (−Z), à direita na vista padrão.
 * Fileira z = −2,3: engrenagens. Fileira z = −3,9: parafusos, tampa, mancais e retentor. As posições finais não se sobrepõem.
 */
const benchPath = (restX: number, z = -2.3): Vec3[] => [
  [restX, 0, 0],
  [restX, 0, z]
];

export const GEAR_PUMP_LAB: MachineLabConfig = {
  machineId: 'gear-pump',
  purpose:
    'A bomba de engrenagens tem duas engrenagens iguais girando juntas dentro de um corpo justo. O líquido entra pela lateral, é levado nos vãos dos dentes pela parte de fora e sai do outro lado. Os dentes engrenados no meio impedem a volta. Cada volta desloca um volume quase fixo (deslocamento positivo).',
  whereUsed: 'Unidades hidráulicas, lubrificação forçada de máquinas, transferência de óleo e de líquidos viscosos.',
  source: 'procedural-gear-pump',
  floorY: -1.75,
  cutawayParts: ['gp-body', 'gp-front-flange'],
  preWorkSafety: [
    'Desligar, bloquear com cadeado e etiqueta e testar a partida (LOTO) do motor.',
    'Aliviar a pressão do circuito hidráulico (incluindo acumuladores, se houver) antes de soltar qualquer conexão.',
    'Óleo quente queima: espere esfriar. Recolha o óleo e tampe as mangueiras e os bocais.',
    'Na bancada, limpe a bomba por fora e marque a posição entre corpo e tampas antes de abrir.'
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D construído no próprio projeto (licença CC0) de uma bomba de engrenagens externas de dentes retos, com mancais em bloco e buchas. Não representa um fabricante ou modelo comercial. O perfil dos dentes é aproximado (não é evolvente exato), e não há juntas, anéis de vedação das tampas nem placas de compensação de pressão, que existem em muitos modelos reais. Folgas, apertos e sentido de giro são sempre os do manual do fabricante.'
  },
  disassembly: [
    {
      partId: 'gp-key',
      title: 'Retirar a chaveta da ponta do eixo',
      instruction:
        'Com a bomba já fora da máquina e limpa, retire a chaveta do rasgo do eixo motor e guarde-a. Ela transmite o giro do acoplamento para o eixo.',
      tool: 'Alicate universal ou punção de latão',
      toolWhy: 'A chaveta sai com pouca força. O latão é mais macio que o aço e não marca o rasgo.',
      safety: 'Bordas do rasgo de chaveta podem cortar: manuseie com cuidado.',
      observe: 'Rasgo alargado ou chaveta amassada indicam folga no acoplamento ou sobrecarga.',
      toolDistractors: [
        { tool: 'Chave de fenda e martelo de aço', why: 'A ponta escorrega e marca o rasgo e o eixo.' },
        { tool: 'Torquímetro', why: 'Torquímetro serve para apertar com valor controlado, não para retirar chavetas.' }
      ],
      moves: { 'gp-key': [[0, 0.45, 0], [-0.5, 0.45, 0]] }
    },
    {
      partId: 'gp-bolts',
      title: 'Soltar os parafusos passantes',
      instruction: 'Solte os quatro parafusos que atravessam a tampa e o corpo, em sequência cruzada, um pouco de cada vez.',
      tool: 'Chave combinada ou soquete com catraca',
      toolWhy: 'O anel estriado ou o soquete abraçam a cabeça inteira e não arredondam os cantos.',
      safety: 'Mesmo na bancada, confirme que não há óleo sob pressão preso na bomba (bocais destampados para alívio).',
      observe: 'Confira as roscas. Parafuso com rosca danificada ou esticado é trocado por outro da mesma especificação.',
      toolDistractors: [
        { tool: 'Chave inglesa (ajustável)', why: 'Tem folga na boca e tende a arredondar parafusos apertados.' },
        { tool: 'Alicate de pressão', why: 'Morde e estraga a cabeça; não é ferramenta de aperto.' }
      ],
      moves: { 'gp-bolts': benchPath(3.25, -3.9) }
    },
    {
      partId: 'gp-rear-cover',
      title: 'Retirar a tampa traseira',
      instruction: 'Descole a tampa batendo de leve na lateral e puxe-a reto, sem girar. Observe se há pinos-guia entre a tampa e o corpo.',
      tool: 'Martelo de face macia',
      toolWhy: 'A face de nylon ou borracha solta a tampa sem marcar as superfícies usinadas de vedação.',
      safety: 'Apoie a bomba firme na bancada para ela não cair quando a tampa soltar.',
      observe: 'Riscos circulares na face interna da tampa mostram que as engrenagens ou os mancais estão raspando.',
      toolDistractors: [
        { tool: 'Chave de fenda como alavanca entre tampa e corpo', why: 'Marca as faces de vedação: a bomba passa a vazar internamente.' },
        { tool: 'Martelo de aço', why: 'Amassa e trinca a tampa, principalmente em corpos de alumínio.' }
      ],
      moves: { 'gp-rear-cover': benchPath(0.45, -3.9) }
    },
    {
      partId: 'gp-bearing-rear',
      title: 'Retirar o mancal traseiro',
      instruction:
        'Puxe o bloco do mancal traseiro reto para fora. Antes, marque com caneta qual lado fica para a tampa e qual lado fica para as engrenagens.',
      tool: 'Mãos limpas (e caneta marcadora)',
      toolWhy: 'O bloco sai deslizando. Montar invertido ou girado pode bloquear os canais internos de alívio e de lubrificação.',
      observe: 'Buchas gastas, ovalizadas ou com riscos e face do bloco marcada pelas engrenagens indicam desgaste.',
      toolDistractors: [
        { tool: 'Alicate universal', why: 'Morde e marca o bronze das faces e das buchas.' },
        { tool: 'Chave de fenda como alavanca', why: 'Risca a câmara do corpo e a face do mancal.' }
      ],
      moves: { 'gp-bearing-rear': benchPath(1.3, -3.9) }
    },
    {
      partId: 'gp-driven-gear',
      title: 'Retirar a engrenagem movida',
      instruction: 'Puxe a engrenagem de baixo (movida) para fora, segurando pelo eixo.',
      tool: 'Mãos limpas',
      toolWhy: 'Ela sai sem força. Ferramentas marcam os dentes e os colos do eixo, que trabalham nas buchas.',
      observe: 'Dentes com pontas gastas ou faces laterais riscadas aumentam a folga interna e a vazão cai.',
      toolDistractors: [
        { tool: 'Alicate de pressão no eixo', why: 'Marca o colo do eixo, que gira dentro da bucha.' },
        { tool: 'Extrator de rolamentos', why: 'Não há nada preso: a engrenagem desliza. Força aqui só danifica.' }
      ],
      moves: { 'gp-driven-gear': benchPath(4.5) }
    },
    {
      partId: 'gp-drive-gear',
      title: 'Retirar a engrenagem motora com o eixo',
      instruction:
        'Puxe a engrenagem de cima (motora) pela traseira. O eixo atravessa o mancal dianteiro e o retentor: puxe reto para não forçar o lábio.',
      tool: 'Mãos limpas',
      toolWhy: 'O conjunto desliza. Pancadas na ponta do eixo amassam a rosca ou o rasgo de chaveta.',
      observe: 'Na ponta do eixo, veja a região onde trabalha o lábio do retentor: um sulco ali causa vazamento mesmo com retentor novo.',
      toolDistractors: [
        { tool: 'Martelo de aço na ponta do eixo', why: 'Amassa o eixo e pode danificar a bucha e o retentor.' },
        { tool: 'Saca-polias', why: 'Não há interferência para vencer: o eixo sai deslizando.' }
      ],
      moves: { 'gp-drive-gear': benchPath(2.85) }
    },
    {
      partId: 'gp-bearing-front',
      title: 'Retirar o mancal dianteiro',
      instruction: 'Com as engrenagens fora, puxe o mancal dianteiro pela traseira do corpo. Marque a posição dele também.',
      tool: 'Mãos limpas (e caneta marcadora)',
      toolWhy: 'Igual ao traseiro: sai deslizando, e a marcação garante a montagem na mesma posição.',
      observe: 'Compare os dois mancais: desgaste maior de um lado costuma indicar a região de alta pressão (saída).',
      toolDistractors: [
        { tool: 'Punção de aço e martelo', why: 'Deforma o bronze e risca a câmara do corpo.' },
        { tool: 'Chave de fenda', why: 'Risca a câmara e a face do mancal.' }
      ],
      moves: { 'gp-bearing-front': benchPath(6.2, -3.9) }
    },
    {
      partId: 'gp-shaft-seal',
      title: 'Retirar o retentor do eixo',
      instruction:
        'Retire o retentor do alojamento no flange dianteiro com saca-retentor, sem riscar o alojamento. Retentor retirado não é reaproveitado.',
      tool: 'Saca-retentor',
      toolWhy: 'Engancha o retentor sem riscar o alojamento, que é onde ele veda pelo lado de fora.',
      safety: 'Faça força para longe do corpo: a ferramenta pode escapar quando o retentor solta.',
      observe: 'Lábio endurecido, rachado ou mola solta explicam vazamento pelo eixo.',
      toolDistractors: [
        { tool: 'Chave de fenda', why: 'Escapa com facilidade e risca o alojamento: o retentor novo vazará por fora.' },
        { tool: 'Prensa', why: 'O eixo já saiu e o retentor fica no alojamento do flange: não há o que prensar aqui.' }
      ],
      moves: { 'gp-shaft-seal': benchPath(6.9, -3.9) },
      xrayParts: ['gp-front-flange', 'gp-body']
    }
  ],
  explode: {
    'gp-body': [0, 0, 0],
    'gp-front-flange': [0, 0, 0],
    'gp-key': [-0.5, 0.45, 0],
    'gp-bolts': [3.25, 0, -3.9],
    'gp-rear-cover': [0.45, 0, -3.9],
    'gp-bearing-rear': [1.3, 0, -3.9],
    'gp-driven-gear': [4.5, 0, -2.3],
    'gp-drive-gear': [2.85, 0, -2.3],
    'gp-bearing-front': [6.2, 0, -3.9],
    'gp-shaft-seal': [6.9, 0, -3.9]
  },
  identify: [
    { partId: 'gp-drive-gear', prompt: 'Clique na engrenagem motora — a que tem o eixo comprido que recebe o giro do motor.', hint: 'É a engrenagem de cima. O eixo dela sai pelo flange dianteiro.', needsXray: true },
    { partId: 'gp-driven-gear', prompt: 'Clique na engrenagem movida — a que gira só porque está engrenada na outra.', hint: 'É a engrenagem de baixo, com eixo curto.', needsXray: true },
    { partId: 'gp-body', prompt: 'Clique no corpo — a peça com a câmara em forma de "8" e os bocais de entrada e saída.', hint: 'Fica no meio, entre o flange dianteiro e a tampa traseira. Os bocais ficam nas laterais.' },
    { partId: 'gp-bearing-rear', prompt: 'Clique no mancal traseiro — o bloco de bronze com as buchas que apoiam os eixos.', hint: 'Fica entre as engrenagens e a tampa traseira.', needsXray: true }
  ],
  checkQuestionIds: ['bom-11', 'bom-12', 'bom-13', 'bom-14'],
  lessonId: 'lesson-centrifugal-pump'
};

/** Nome curto de cada equipamento do laboratório (abas e tela de progresso). */
export const LAB_MACHINE_LABELS: Record<string, string> = {
  'centrifugal-pump': 'Bomba centrífuga',
  'gear-pump': 'Bomba de engrenagens',
  'diaphragm-pump': 'Bomba de diafragma',
  'gearbox-reducer': 'Redutor de engrenagens',
  'motor-gearbox': 'Motor e redutor',
  'bearing-assembly': 'Eixo e mancais',
  'belt-conveyor': 'Transportador de correia',
  'conventional-lathe': 'Torno mecânico'
};

export { PUMP_LAB };

export const LAB_CONFIGS: Record<string, MachineLabConfig> = {
  'centrifugal-pump': PUMP_LAB,
  'gear-pump': GEAR_PUMP_LAB,
  'gearbox-reducer': GEARBOX_LAB,
  'bearing-assembly': BEARING_ASSEMBLY_LAB,
  'belt-conveyor': BELT_CONVEYOR_LAB,
  'diaphragm-pump': DIAPHRAGM_PUMP_LAB,
  'motor-gearbox': MOTOR_GEARBOX_LAB
};

/** Cuidados de segurança por componente, exibidos no painel de informações. */
export const PART_SAFETY: Record<string, string> = {
  ...PUMP_PART_SAFETY,
  'part-housing-top': 'Ice a tampa com olhal adequado e nunca fique sob a carga suspensa.',
  'part-bolts-perimeter': 'Aperto cruzado em etapas com torquímetro calibrado.',
  'part-input-pinion-shaft': 'Dentes de engrenagem podem ter rebarbas: manuseie com luvas.',
  'part-output-gear': 'Conjunto pesado: use cinta e talha para levantar.',
  'part-taper-bearings': 'Rolamentos cônicos precisam de ajuste de folga axial na montagem.',
  'part-radial-seals': 'Retentor retirado deve ser trocado por um novo, com o lábio lubrificado na montagem.',
  'part-housing-bottom': 'Drene o óleo frio e descarte conforme as regras ambientais da empresa.',
  'gp-body': 'Antes de abrir: motor bloqueado, circuito sem pressão e óleo frio. Proteja as faces usinadas.',
  'gp-front-flange': 'Faces de centragem usinadas: apoie sobre madeira ou pano, nunca direto no chão.',
  'gp-key': 'Guarde a chaveta: sem ela o acoplamento patina no eixo.',
  'gp-bolts': 'Solte e aperte em sequência cruzada, em etapas. Aperto final com torquímetro, no valor do manual.',
  'gp-rear-cover': 'Use martelo de face macia; não alavanque entre as faces de vedação.',
  'gp-bearing-rear': 'Marque a posição antes de retirar: montado invertido pode bloquear canais internos.',
  'gp-bearing-front': 'Marque a posição antes de retirar: montado invertido pode bloquear canais internos.',
  'gp-drive-gear': 'Na montagem, proteja o rasgo de chaveta com bucha ou fita para não cortar o retentor.',
  'gp-driven-gear': 'Lubrifique com o óleo do sistema antes de montar: a bomba não deve partir seca.',
  'gp-shaft-seal': 'Retentor retirado é trocado por um novo, montado com ferramenta de encaixe e lábio lubrificado.',
  ...BEARING_ASSEMBLY_PART_SAFETY,
  ...BELT_CONVEYOR_PART_SAFETY,
  ...DIAPHRAGM_PUMP_PART_SAFETY,
  ...MOTOR_GEARBOX_PART_SAFETY
};

/** Constrói as "poses" (deslocamento de cada peça) após cada etapa de desmontagem. */
export function buildPoses(steps: ProcedureStep[], partIds: string[]): Record<string, Vec3>[] {
  const poses: Record<string, Vec3>[] = [Object.fromEntries(partIds.map((id) => [id, [0, 0, 0] as Vec3]))];
  steps.forEach((step) => {
    const prev = poses[poses.length - 1];
    const next = { ...prev };
    Object.entries(step.moves).forEach(([id, path]) => {
      next[id] = path[path.length - 1];
    });
    poses.push(next);
  });
  return poses;
}
