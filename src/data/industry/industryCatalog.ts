import type { GameScreen } from '../../types/game';
import type { ClaimKind, RegRef } from '../regulatorySources';

/**
 * Seção "Indústria na prática": planta-escola FICTÍCIA e catálogo de equipamentos.
 *
 * A planta não reproduz nenhuma empresa real: é um arranjo didático de sistemas comuns na indústria.
 * Cada equipamento diz claramente o que já existe na plataforma (3D interativo, desenho, informação)
 * e o que ainda está planejado. Referências: normas e fontes citadas pelo nome, para consulta — a
 * plataforma não reproduz o conteúdo de normas pagas. Itens de NR citados foram conferidos no texto oficial.
 */

export type Availability = 'lab-3d' | 'simulator' | 'in-other-3d' | 'info' | 'planned';

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  'lab-3d': '3D interativo',
  simulator: 'Simulador interativo',
  'in-other-3d': 'Aparece em outro modelo 3D',
  info: 'Ficha informativa',
  planned: 'Planejado'
};

export interface ActivityLink {
  label: string;
  screen: GameScreen;
  param?: string;
}

export interface SafetyNote {
  text: string;
  kind: ClaimKind;
  ref?: RegRef;
}

export interface Reference {
  label: string;
  /** norma técnica | regulamento oficial | documentação de fabricante | material da plataforma */
  kind: 'norma' | 'regulamento' | 'fabricante' | 'plataforma';
}

export interface EquipmentEntry {
  id: string;
  name: string;
  category: string;
  areaId: string;
  availability: Availability;
  function: string;
  components: string[];
  principle: string;
  safety: SafetyNote[];
  references: Reference[];
  activities: ActivityLink[];
  /** Desenho técnico/ilustração disponível na própria seção. */
  drawingId?: 'bearing-assembly' | 'conveyor-drive' | 'motor-gearbox' | 'diaphragm-flow';
}

export interface PlantArea {
  id: string;
  code: string;
  name: string;
  description: string;
  /** Posição do bloco no mapa (viewBox 960 × 540). */
  box: { x: number; y: number; w: number; h: number };
}

export const PLANT_AREAS: PlantArea[] = [
  {
    id: 'bombeamento',
    code: 'A',
    name: 'Estação de bombeamento',
    description: 'Bomba centrífuga que leva água do reservatório para o processo e para o resfriamento.',
    box: { x: 24, y: 24, w: 270, h: 220 }
  },
  {
    id: 'hidraulica',
    code: 'B',
    name: 'Unidade hidráulica',
    description: 'Bomba de engrenagens que gera óleo sob pressão para cilindros e prensas da linha.',
    box: { x: 24, y: 264, w: 270, h: 252 }
  },
  {
    id: 'transporte',
    code: 'C',
    name: 'Linha de transporte',
    description: 'Transportador de correia que leva o produto do recebimento até a embalagem.',
    box: { x: 314, y: 24, w: 400, h: 220 }
  },
  {
    id: 'acionamentos',
    code: 'D',
    name: 'Acionamentos e transmissão',
    description: 'Motores, redutores, acoplamentos, eixos e mancais que fazem as máquinas girarem.',
    box: { x: 314, y: 264, w: 400, h: 252 }
  },
  {
    id: 'oficina',
    code: 'E',
    name: 'Oficina de manutenção',
    description: 'Bancada de desmontagem e usinagem: onde peças são inspecionadas, recuperadas ou trocadas.',
    box: { x: 734, y: 24, w: 202, h: 300 }
  },
  {
    id: 'monitoramento',
    code: 'F',
    name: 'Monitoramento',
    description: 'Instrumentos que acompanham temperatura, vibração e pressão para antecipar falhas.',
    box: { x: 734, y: 344, w: 202, h: 172 }
  }
];

const NR12_LOTO: SafetyNote = {
  text: 'Intervenções só com a máquina parada e com isolamento e bloqueio das fontes de energia.',
  kind: 'requisito',
  ref: { source: 'nr12', item: '12.11.3' }
};
const NR12_GUARDS: SafetyNote = {
  text: 'Transmissões de força acessíveis (correias, polias, acoplamentos) que ofereçam risco devem ter proteções que impeçam o acesso por todos os lados.',
  kind: 'requisito',
  ref: { source: 'nr12', item: '12.5.9' }
};
const NR12_RECORD: SafetyNote = {
  text: 'As manutenções devem ser registradas (intervenções, data, serviço, peças trocadas, condições de segurança, responsável).',
  kind: 'requisito',
  ref: { source: 'nr12', item: '12.11.2' }
};

export const EQUIPMENT: EquipmentEntry[] = [
  {
    id: 'belt-conveyor',
    name: 'Transportador de correia',
    category: 'Movimentação de materiais',
    areaId: 'transporte',
    availability: 'lab-3d',
    function: 'Levar material de forma contínua entre dois pontos da fábrica.',
    components: ['Correia', 'Polia de acionamento e polia de retorno', 'Rolos de carga e de retorno', 'Mancais das polias', 'Tensor', 'Motor, redutor e acoplamento', 'Estrutura e proteções'],
    principle:
      'A polia de acionamento arrasta a correia pelo atrito; por isso a correia precisa de tensão e a polia costuma ter revestimento. Os rolos só apoiam: giram porque a correia passa sobre eles.',
    safety: [
      {
        text: 'Movimentos perigosos acessíveis durante a operação devem ser protegidos, especialmente nos pontos de esmagamento, agarramento e aprisionamento.',
        kind: 'requisito',
        ref: { source: 'nr12', item: '12.8.1' }
      },
      { text: 'É proibido permanecer ou circular sobre partes em movimento dos transportadores não projetadas para isso.', kind: 'requisito', ref: { source: 'nr12', item: '12.8.6' } },
      {
        text: 'Transportadores contínuos acessíveis devem ter parada de emergência ao longo da extensão, acionável de todas as posições de trabalho (salvo se a análise de risco indicar o contrário).',
        kind: 'requisito',
        ref: { source: 'nr12', item: '12.8.7 e 12.8.7.1' }
      },
      {
        text: 'Onde o desalinhamento anormal da correia ou a sobrecarga oferecerem risco, deve haver dispositivos que interrompam o funcionamento ao passar dos limites de projeto.',
        kind: 'requisito',
        ref: { source: 'nr12', item: '12.8.8' }
      },
      NR12_LOTO,
      { text: 'Aliviar a tensão da correia de forma controlada antes de trocar rolos.', kind: 'boa-pratica' }
    ],
    references: [
      { label: 'NR-12, itens 12.8.1 a 12.8.8 (transportadores de materiais)', kind: 'regulamento' },
      { label: 'ISO 5048 — transportadores de correia com rolos: cálculo de potência e forças de tração', kind: 'norma' },
      { label: 'CEMA — Belt Conveyors for Bulk Materials (referência da associação de fabricantes dos EUA)', kind: 'fabricante' },
      { label: 'Modelo 3D próprio do Mecânica Lab (CC0), sem cotas de projeto', kind: 'plataforma' }
    ],
    activities: [
      { label: 'Laboratório 3D: transportador de correia', screen: 'lab', param: 'belt-conveyor' },
      { label: 'Missão: correia desalinhada', screen: 'industry', param: 'missao-correia-desalinhada' },
      { label: 'Missão: ruído no mancal', screen: 'industry', param: 'missao-mancal-ruidoso' }
    ],
    drawingId: 'conveyor-drive'
  },
  {
    id: 'bearing-assembly',
    name: 'Eixo com mancais de rolamento',
    category: 'Rolamentos & transmissão',
    areaId: 'acionamentos',
    availability: 'lab-3d',
    function: 'Apoiar um eixo que gira, recebendo o giro por polia e entregando por acoplamento.',
    components: ['Eixo escalonado', 'Rolamento rígido de esferas (fixo)', 'Rolamento de rolos cilíndricos tipo NU (livre)', 'Caixas de mancal bipartidas', 'Vedações', 'Anéis elásticos', 'Chavetas', 'Polia em V', 'Acoplamento elástico'],
    principle:
      'Um rolamento FIXO posiciona o eixo nos dois sentidos axiais; o outro, LIVRE, deixa o eixo dilatar com o calor. Os anéis com aperto recebem a força de montagem — nunca os corpos rolantes.',
    safety: [
      NR12_LOTO,
      NR12_GUARDS,
      { text: 'Rolamentos se montam e desmontam com força só no anel que tem aperto, e nunca são aquecidos com chama.', kind: 'boa-pratica' },
      { text: 'Use óculos ao retirar anéis elásticos e ao usar extratores.', kind: 'boa-pratica' }
    ],
    references: [
      { label: 'ISO 15 — rolamentos radiais: dimensões principais', kind: 'norma' },
      { label: 'ISO 281 — rolamentos: capacidade de carga dinâmica e vida nominal', kind: 'norma' },
      { label: 'ISO 15243 — rolamentos: danos e falhas (terminologia e características)', kind: 'norma' },
      { label: 'Catálogos e manuais de montagem dos fabricantes de rolamentos (ajustes, folgas e lubrificação)', kind: 'fabricante' }
    ],
    activities: [
      { label: 'Laboratório 3D: eixo e mancais', screen: 'lab', param: 'bearing-assembly' },
      { label: 'Aula narrada: rolamento fixo e rolamento livre', screen: 'micro', param: 'rol-fixo-livre' },
      { label: 'Missão: ler o desenho de conjunto', screen: 'industry', param: 'missao-ler-desenho' },
      { label: 'Missão: ferramentas para trocar o rolamento', screen: 'industry', param: 'missao-ferramenta-certa' }
    ],
    drawingId: 'bearing-assembly'
  },
  {
    id: 'centrifugal-pump',
    name: 'Bomba centrífuga',
    category: 'Bombas',
    areaId: 'bombeamento',
    availability: 'lab-3d',
    function: 'Transferir líquidos (água, produtos de baixa viscosidade) dando energia ao fluido pelo rotor.',
    components: ['Voluta (carcaça)', 'Rotor', 'Selo mecânico', 'Eixo', 'Rolamentos', 'Cavalete de mancal'],
    principle: 'O rotor gira e joga o líquido para fora pela força centrífuga; a voluta transforma velocidade em pressão.',
    safety: [NR12_LOTO, { text: 'Antes de abrir: válvulas fechadas, carcaça drenada e despressurizada, líquido frio.', kind: 'boa-pratica' }, NR12_GUARDS],
    references: [
      { label: 'ISO 2858 — bombas centrífugas de sucção axial: designação, desempenho nominal e dimensões', kind: 'norma' },
      { label: 'EN 12756 — selos mecânicos: dimensões principais', kind: 'norma' },
      { label: 'Manual do fabricante da bomba (folgas, apertos, selo)', kind: 'fabricante' }
    ],
    activities: [
      { label: 'Laboratório 3D: bomba centrífuga', screen: 'lab', param: 'centrifugal-pump' },
      { label: 'Missão: bomba com ruído e vazão baixa', screen: 'industry', param: 'missao-bomba-cavitando' },
      { label: 'Aula: bomba centrífuga', screen: 'quiz', param: 'lesson-centrifugal-pump' }
    ]
  },
  {
    id: 'gear-pump',
    name: 'Bomba de engrenagens',
    category: 'Bombas',
    areaId: 'hidraulica',
    availability: 'lab-3d',
    function: 'Gerar vazão de óleo para circuitos hidráulicos e lubrificação, com volume quase fixo por volta.',
    components: ['Corpo com câmara em "8"', 'Engrenagem motora e movida', 'Mancais em bloco', 'Tampa e flange', 'Retentor do eixo'],
    principle: 'Deslocamento positivo: os vãos entre os dentes levam o óleo pela parede do corpo; o engrenamento impede a volta. Por isso o circuito precisa de válvula de alívio.',
    safety: [NR12_LOTO, { text: 'Aliviar a pressão do circuito (incluindo acumuladores) antes de soltar conexões.', kind: 'boa-pratica' }],
    references: [
      { label: 'Manual do fabricante da bomba e da unidade hidráulica', kind: 'fabricante' },
      { label: 'Modelo 3D próprio do Mecânica Lab (CC0)', kind: 'plataforma' }
    ],
    activities: [{ label: 'Laboratório 3D: bomba de engrenagens', screen: 'lab', param: 'gear-pump' }]
  },
  {
    id: 'gearbox-reducer',
    name: 'Redutor de engrenagens',
    category: 'Acionamentos',
    areaId: 'acionamentos',
    availability: 'lab-3d',
    function: 'Reduzir a rotação do motor e aumentar o torque entregue à máquina.',
    components: ['Carcaça superior e inferior', 'Eixo-pinhão de entrada', 'Coroa e eixo de saída', 'Rolamentos cônicos', 'Retentores'],
    principle: 'Uma engrenagem pequena (pinhão) gira uma maior (coroa): a saída gira mais devagar e com mais torque.',
    safety: [NR12_LOTO, NR12_GUARDS, { text: 'Óleo quente queima: drenar frio e descartar conforme as regras ambientais.', kind: 'boa-pratica' }],
    references: [
      { label: 'ISO 6336 — cálculo da capacidade de carga de engrenagens cilíndricas', kind: 'norma' },
      { label: 'Manual do fabricante do redutor (óleo, nível, intervalos)', kind: 'fabricante' }
    ],
    activities: [
      { label: 'Laboratório 3D: motor, acoplamento e redutor (em operação)', screen: 'lab', param: 'motor-gearbox' },
      { label: 'Aula narrada: redutor troca rotação por torque', screen: 'micro', param: 'red-rotacao-torque' },
      { label: 'Missão: elemento elástico gastando', screen: 'industry', param: 'missao-acoplamento-desalinhado' },
      { label: 'Laboratório 3D: redutor', screen: 'lab', param: 'gearbox-reducer' }
    ],
    drawingId: 'motor-gearbox'
  },
  {
    id: 'electric-motor',
    name: 'Motor elétrico de indução',
    category: 'Acionamentos',
    areaId: 'acionamentos',
    availability: 'lab-3d',
    function: 'Transformar energia elétrica em giro no eixo.',
    components: ['Carcaça aletada com estator', 'Rotor de gaiola com eixo', 'Rolamentos nas tampas', 'Ventilador e tampa defletora', 'Caixa de ligação'],
    principle: 'A corrente no estator cria um campo magnético girante que arrasta o rotor.',
    safety: [
      { text: 'Serviços em eletricidade têm requisitos próprios de qualificação, habilitação e autorização na NR-10.', kind: 'requisito', ref: { source: 'nr10', item: '10.8' } },
      { text: 'O mecânico só começa depois do bloqueio elétrico feito e testado.', kind: 'boa-pratica' }
    ],
    references: [
      { label: 'ABNT NBR 17094-1 — máquinas elétricas girantes: motores de indução', kind: 'norma' },
      { label: 'Placa de identificação e manual do fabricante do motor', kind: 'fabricante' }
    ],
    activities: [
      { label: 'Laboratório 3D: motor, acoplamento e redutor', screen: 'lab', param: 'motor-gearbox' },
      { label: 'Ver o motor no transportador (3D)', screen: 'lab', param: 'belt-conveyor' }
    ],
    drawingId: 'motor-gearbox'
  },
  {
    id: 'flexible-coupling',
    name: 'Acoplamento elástico',
    category: 'Acionamentos',
    areaId: 'acionamentos',
    availability: 'in-other-3d',
    function: 'Ligar dois eixos, transmitindo o giro e tolerando pequenos desalinhamentos.',
    components: ['Dois cubos', 'Elemento elástico (estrela ou similar)', 'Chavetas'],
    principle: 'O elemento elástico entre as garras transmite o torque e absorve choques e pequenos desvios. Não substitui o alinhamento.',
    safety: [NR12_GUARDS, NR12_LOTO],
    references: [{ label: 'Manual do fabricante do acoplamento (desalinhamentos admissíveis)', kind: 'fabricante' }],
    activities: [
      { label: 'Ver no conjunto motor e redutor (3D)', screen: 'lab', param: 'motor-gearbox' },
      { label: 'Ver no eixo com mancais (3D)', screen: 'lab', param: 'bearing-assembly' },
      { label: 'Ver no transportador (3D)', screen: 'lab', param: 'belt-conveyor' }
    ]
  },
  {
    id: 'conventional-lathe',
    name: 'Torno mecânico',
    category: 'Usinagem',
    areaId: 'oficina',
    availability: 'lab-3d',
    function: 'Usinar peças cilíndricas — por exemplo, recuperar ou fabricar um eixo.',
    components: ['Cabeçote fixo', 'Placa', 'Carro e porta-ferramenta', 'Cabeçote móvel', 'Barramento'],
    principle: 'A peça gira e a ferramenta avança: o material é removido em forma de cavaco.',
    safety: [{ text: 'Proteções da placa e do cavaco, e nada de luvas, anéis ou roupas soltas perto da placa girando.', kind: 'boa-pratica' }, NR12_LOTO],
    references: [{ label: 'Manual do fabricante do torno', kind: 'fabricante' }],
    activities: [{ label: 'Laboratório 3D: torno', screen: 'lab', param: 'conventional-lathe' }]
  },
  {
    id: 'maintenance-record',
    name: 'Registro de manutenção',
    category: 'Gestão da manutenção',
    areaId: 'oficina',
    availability: 'info',
    function: 'Guardar o histórico do que foi feito em cada máquina para planejar e investigar falhas.',
    components: ['Ordem de serviço', 'Peças trocadas', 'Causa encontrada', 'Condições de segurança', 'Responsável'],
    principle: 'Sem histórico, toda falha parece nova. O registro mostra repetições e ajuda a achar a causa raiz.',
    safety: [NR12_RECORD],
    references: [{ label: 'NR-12, item 12.11.2', kind: 'regulamento' }],
    activities: [{ label: 'Praticar: manutenção preventiva', screen: 'practice', param: 'manutencao' }]
  },
  {
    id: 'condition-monitoring',
    name: 'Monitoramento de temperatura e vibração',
    category: 'Instrumentação',
    areaId: 'monitoramento',
    availability: 'info',
    function: 'Acompanhar a tendência de temperatura e vibração dos mancais para agir antes da quebra.',
    components: ['Termômetro sem contato', 'Coletor de vibração', 'Pontos de medição marcados', 'Histórico de medições'],
    principle:
      'O que importa é a tendência: um ponto que muda semana após semana, medido sempre do mesmo jeito, pede inspeção. Um valor isolado medido de outro jeito não é tendência.',
    safety: [{ text: 'Medições com a máquina em operação só de fora das proteções, sem contato com partes em movimento.', kind: 'boa-pratica' }],
    references: [
      { label: 'ISO 20816 (série) — vibração mecânica: medição e avaliação da vibração de máquinas', kind: 'norma' },
      { label: 'Manual do fabricante da máquina e do instrumento de medição', kind: 'fabricante' }
    ],
    activities: [
      { label: 'Missão: ronda de vibração', screen: 'industry', param: 'missao-ronda-vibracao' },
      { label: 'Missão: ruído no mancal (tendência de temperatura)', screen: 'industry', param: 'missao-mancal-ruidoso' }
    ]
  },
  {
    id: 'diaphragm-pump',
    name: 'Bomba de diafragma',
    category: 'Bombas',
    areaId: 'bombeamento',
    availability: 'lab-3d',
    function: 'Transferir líquidos abrasivos, viscosos, agressivos ou com sólidos, sem eixo girando em contato com o produto.',
    components: ['Dois diafragmas ligados por um eixo', 'Válvula de ar e silenciador', 'Quatro válvulas de retenção de esfera', 'Câmaras de líquido', 'Coletores de entrada e de saída'],
    principle:
      'Deslocamento positivo alternativo: o ar comprimido empurra um diafragma enquanto o eixo puxa o outro. As válvulas de esfera fazem o líquido entrar por baixo e sair por cima. Contraste com a centrífuga: aqui um volume é empurrado a cada curso.',
    safety: [
      NR12_LOTO,
      { text: 'Bloquear e aliviar o ar comprimido; fechar, aliviar e drenar as linhas de produto antes de abrir.', kind: 'boa-pratica' },
      { text: 'Consultar a FDS do produto e usar os EPIs indicados: sempre sobra produto nas câmaras.', kind: 'boa-pratica' }
    ],
    references: [
      { label: 'Manual do fabricante da bomba (materiais, apertos, kits de reparo)', kind: 'fabricante' },
      { label: 'Ficha com dados de segurança (FDS) do produto bombeado', kind: 'fabricante' },
      { label: 'Modelo 3D próprio do Mecânica Lab (CC0)', kind: 'plataforma' }
    ],
    activities: [
      { label: 'Laboratório 3D: bomba de diafragma', screen: 'lab', param: 'diaphragm-pump' },
      { label: 'Missão: produto saindo pelo silenciador', screen: 'industry', param: 'missao-diafragma-silenciador' },
      { label: 'Praticar: bombas', screen: 'practice', param: 'bombas' }
    ],
    drawingId: 'diaphragm-flow'
  },
  {
    id: 'pneumatic-station',
    name: 'Bancada pneumática',
    category: 'Pneumática',
    areaId: 'hidraulica',
    availability: 'simulator',
    function: 'Estudar cilindros, válvulas e unidade de conservação de ar comprimido — os mesmos elementos que acionam garras, travas e a bomba de diafragma da planta.',
    components: [
      'Unidade de conservação: filtro (retém água e partículas), regulador (ajusta a pressão de trabalho) e, quando o fabricante pede, lubrificador',
      'Válvula de bloqueio com escape, para isolar e despressurizar a bancada',
      'Válvulas direcionais (por exemplo 3/2 e 5/2): decidem para onde o ar vai',
      'Cilindros de simples e de dupla ação',
      'Válvulas reguladoras de fluxo: ajustam a velocidade do cilindro'
    ],
    principle:
      'O ar comprimido, tratado e regulado na unidade de conservação, é mandado pelas válvulas direcionais para um lado ou para o outro do pistão; o cilindro avança ou recua. A velocidade se ajusta controlando a saída do ar.',
    safety: [
      { text: 'Ar comprimido é energia perigosa: fechar a válvula de bloqueio, despressurizar e conferir que não há ar preso antes de soltar conexões.', kind: 'boa-pratica' },
      { text: 'Um cilindro pode se mover sozinho com ar preso ou por gravidade: apoie ou trave a carga antes de intervir.', kind: 'boa-pratica' },
      { text: 'Nunca direcionar ar comprimido para o corpo ou usá-lo para limpar roupas.', kind: 'boa-pratica' },
      NR12_LOTO
    ],
    references: [
      { label: 'ISO 1219-1 — símbolos gráficos de sistemas e componentes fluido-mecânicos', kind: 'norma' },
      { label: 'ISO 4414 — transmissões pneumáticas: regras gerais e requisitos de segurança', kind: 'norma' },
      { label: 'Simulador da plataforma: circuito com um cilindro de dupla ação, qualitativo (não calcula força nem vazão reais).', kind: 'plataforma' }
    ],
    activities: [
      { label: 'Bancada simulada: cilindro de dupla ação', screen: 'industry', param: 'bancada-pneumatica' },
      { label: 'Ver uma máquina pneumática: bomba de diafragma (3D)', screen: 'lab', param: 'diaphragm-pump' }
    ]
  }
];

export const EQUIPMENT_BY_ID: Record<string, EquipmentEntry> = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e]));
