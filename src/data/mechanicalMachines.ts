import { GEAR_PUMP_MACHINE } from './gearPumpMachine';
import { BEARING_ASSEMBLY_MACHINE } from './industry/bearingAssemblyMachine';
import { BELT_CONVEYOR_MACHINE } from './industry/beltConveyorMachine';
import { DIAPHRAGM_PUMP_MACHINE } from './industry/diaphragmPumpMachine';
import { MOTOR_GEARBOX_MACHINE } from './industry/motorGearboxMachine';

export interface MechanicalPart3D {
  id: string;
  name: string;
  technicalName: string;
  tag: string;
  category: 'structural' | 'transmission' | 'bearing' | 'sealing' | 'fastener';
  material: string;
  tolerance: string;
  simpleDefinition: string;
  mainFunction: string;
  location: string;
  relationshipWithOthers: string;
  typicalFailureModes: string;
  practicalExample: string;
  /** O que o mecânico olha nesta peça durante a inspeção. */
  inspection?: string[];
  /** Cuidados de manutenção e montagem. */
  maintenance?: string[];
  /** Ids de `TECH_REFERENCES` (src/data/technicalReferences.ts) usados como base do texto. */
  references?: string[];
  quickCheckQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  meshData: {
    type: 'cylinder' | 'box' | 'ring' | 'gear' | 'housing';
    color: string;
    metalness: number;
    roughness: number;
    dimensions: [number, number, number, number?];
    basePosition: [number, number, number];
    explodedOffset: [number, number, number];
    disassemblyOrder: number;
    requiredTool: string;
  };
}

export interface GuidedStep {
  step: number;
  partId: string;
  title: string;
  actionText: string;
  objectiveText: string;
  requiredTool: string;
  safetyCaution?: string;
  validationCheck: string;
}

export interface MachineData {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  glbUrl?: string;
  sourceAttribution?: {
    standard: string;
    referenceModel: string;
    license: string;
    assetPath: string;
  };
  specs: {
    label: string;
    value: string;
  }[];
  overviewDescription: string;
  safetyRules: string[];
  parts: MechanicalPart3D[];
  disassemblySteps: GuidedStep[];
}

export const GEARBOX_REDUCER_MACHINE: MachineData = {
  id: 'gearbox-reducer',
  name: 'Redutor de Velocidade de Eixos Paralelos',
  subtitle: 'Conjunto de Engrenagens Cilíndricas Helicoidais e Mancais de Rolamentos Cônicos',
  category: 'Transmissão Mecânica & Redutores',
  difficulty: 'Intermediário',
  glbUrl: '/assets/models/gearboxes/helical_gearbox_industrial.glb',
  sourceAttribution: {
    standard: 'DIN 3990 / ISO 6336 (Modelo CAD Didático Simplificado)',
    referenceModel: 'Redutor Industrial de 1 Estágio Z1=17 / Z2=82 (30206 + DIN 3760)',
    license: 'CC0 1.0 Public Domain (Gerado via GLTFExporter para Ensino Técnico)',
    assetPath: '/assets/models/gearboxes/helical_gearbox_industrial.glb'
  },
  specs: [
    { label: 'Relação de Transmissão (i)', value: '1 : 4.82' },
    { label: 'Potência Nominal', value: '7.5 kW (10 CV)' },
    { label: 'Tipo de Dentes', value: 'Helicoidais (Ângulo de hélice 20°)' },
    { label: 'Lubrificante Recomendado', value: 'Óleo Mineral ISO VG 220' }
  ],
  overviewDescription: 
    'Um redutor de velocidade tem como função primordial reduzir a rotação do motor elétrico enquanto multiplica proporcionalmente o torque transmitido para a máquina operatriz acoplada. Este modelo didático permite inspecionar cada componente interno, compreender as forças axiais geradas pelo engrenamento helicoidal e dominar o procedimento seguro de montagem.',
  safetyRules: [
    'NR-12 e Procedimento LOTO: Desenergizar, bloquear com cadeado físico e etiquetar a chave seccionadora do motor.',
    'Drenagem Prévia: Nunca abrir a carcaça sem antes drenar o lubrificante morno para uma bandeja ecológica apropriada.',
    'EPIs Mandatórios: Óculos de proteção ampla visão, luvas de vaqueta/nitrílicas e calçado com biqueira de composite.',
    'Nunca golpear faces usinadas de partição com martelos metálicos; utilizar sempre martelo com pontas de nylon ou cobre.'
  ],
  parts: [
    {
      id: 'part-housing-top',
      name: 'Carcaça Bipartida Superior',
      technicalName: 'Tampa Superior da Caixa de Engrenagens',
      tag: 'CARC-TOP',
      category: 'structural',
      material: 'Ferro Fundido Cinzento ABNT NBR 6589 FC-250 (GG-25)',
      tolerance: 'Planicidade na partição ≤ 0.03 mm',
      simpleDefinition: 'É a "tampa" de metal fundido que fecha o conjunto e protege as engrenagens contra sujeira e perda de óleo.',
      mainFunction: 'Enclausurar os componentes móveis, reter o óleo lubrificante e amortecer vibrações de operação.',
      location: 'Topo do redutor, assentada sobre a carcaça inferior e fixada por parafusos perimetrais.',
      relationshipWithOthers: 'Acopla-se à carcaça inferior através de um flange retificado com vedação anaeróbica, sem junta de papel para não alterar o centro entre eixos.',
      typicalFailureModes: 'Trincas por choque mecânico externo, empenamento da face de partição por aperto assimétrico e vazamento de lubrificante.',
      practicalExample: 'Presente em caixas de transmissão de esteiras industriais, pontes rolantes e misturadores.',
      quickCheckQuestion: {
        question: 'Por que não se deve usar junta espessa de papelão na união bipartida das carcaças de um redutor usinado?',
        options: [
          'Porque alteraria a distância entre centros dos eixos e as folgas radiais dos rolamentos.',
          'Porque o óleo quente queima o papelão imediatamente.',
          'Porque a junta de papel não resiste à pressão atmosférica.',
          'Porque os parafusos ficariam longos demais para o furo cego.'
        ],
        correctIndex: 0,
        explanation: 'A carcaça bipartida é usinada em conjunto. Qualquer espessura introduzida na partição afasta os mancais, desregulando o engrenamento perfeito dos dentes e a pré-carga dos rolamentos.'
      },
      meshData: {
        type: 'housing',
        color: '#475569',
        metalness: 0.4,
        roughness: 0.6,
        dimensions: [3.2, 1.2, 2.2],
        basePosition: [0, 1.2, 0],
        explodedOffset: [0, 2.8, 0],
        disassemblyOrder: 2,
        requiredTool: 'Chave Combinada 17mm'
      }
    },
    {
      id: 'part-bolts-perimeter',
      name: 'Conjunto de Parafusos Perimetrais (8x M10)',
      technicalName: 'Parafusos Sextavados M10x55 Classe 8.8 DIN 931',
      tag: 'PARAF-M10',
      category: 'fastener',
      material: 'Aço Médio Carbono Temperado e Revenido (Classe 8.8)',
      tolerance: 'Aperto em sequência cruzada, com torquímetro, no valor do manual do fabricante (não informado neste modelo educacional)',
      simpleDefinition: 'São os parafusos que mantêm a tampa superior firmemente unida à base inferior.',
      mainFunction: 'Garantir a força de união (pressão de contato) na partição para evitar vibração e vazamento.',
      location: 'Distribuídos em torno de todo o flange perimetral da carcaça.',
      relationshipWithOthers: 'Tracionam a tampa contra a base e devem ser soltos ou apertados sempre em ordem cruzada alternada.',
      typicalFailureModes: 'Espanamento de rosca por aperto excessivo sem torquímetro, quebra por cisalhamento ou fadiga.',
      practicalExample: 'Parafusos idênticos aos usados em tampas de cabeçote de motores e redutores de pontes rolantes.',
      quickCheckQuestion: {
        question: 'Qual é a forma correta de soltar e apertar os parafusos do flange da carcaça?',
        options: [
          'Em padrão cruzado e progressivo, evitando tensões assimétricas na estrutura fundida.',
          'Apertando primeiro todos do lado direito e depois do lado esquerdo.',
          'Aplicando o torque máximo no primeiro parafuso de uma só vez.',
          'Seguindo sempre a ordem sequencial circular horária.'
        ],
        correctIndex: 0,
        explanation: 'O aperto ou alívio em cruz distribui as tensões de forma equilibrada, impedindo o empenamento permanente das faces retificadas.'
      },
      meshData: {
        type: 'cylinder',
        color: '#cbd5e1',
        metalness: 0.8,
        roughness: 0.3,
        dimensions: [0.12, 0.12, 0.6],
        basePosition: [0, 1.85, 0],
        explodedOffset: [0, 3.8, 0],
        disassemblyOrder: 1,
        requiredTool: 'Chave Combinada 17mm + Torquímetro'
      }
    },
    {
      id: 'part-input-pinion-shaft',
      name: 'Eixo de Entrada com Pinhão Helicoidal',
      technicalName: 'Eixo Pinhão Usinado Integral Z1=17',
      tag: 'EIXO-PINHAO',
      category: 'transmission',
      material: 'Aço Liga SAE 4340 Beneficiado e Flancos Nitretados',
      tolerance: 'Batimento radial ≤ 0.015 mm / Colo do rolamento ø25 k6',
      simpleDefinition: 'É a barra de aço giratória onde o motor se conecta, contendo a engrenagem menor talhada no próprio metal.',
      mainFunction: 'Receber a alta rotação do motor primário e transferir torque para a coroa dentada.',
      location: 'Instalado paralelamente ao eixo de saída na parte superior do alojamento interno.',
      relationshipWithOthers: 'Engrena diretamente com a coroa conduzida e é sustentado nas extremidades por dois rolamentos de rolos cônicos.',
      typicalFailureModes: 'Desgaste por micropitting nos dentes, trincas na base do dente por sobrecarga ou quebra por choque mecânico.',
      practicalExample: 'Presente no primeiro estágio de quase todos os redutores industriais de alto rendimento.',
      quickCheckQuestion: {
        question: 'Por que o pinhão muitas vezes é usinado integralmente junto ao eixo de entrada?',
        options: [
          'Porque seu diâmetro primitivo pequeno não deixa espaço suficiente para cubo, furo e chaveta resistentes.',
          'Para economizar aço na fábrica.',
          'Porque dentes separados não suportam rotação horária.',
          'Para que ele nunca possa ser desmontado na vida útil do redutor.'
        ],
        correctIndex: 0,
        explanation: 'Com 17 dentes, o diâmetro da raiz da engrenagem é muito próximo do diâmetro do eixo. Fabricá-lo em peça única maximiza a resistência à torção e flexão.'
      },
      meshData: {
        type: 'gear',
        color: '#38bdf8',
        metalness: 0.85,
        roughness: 0.25,
        dimensions: [0.65, 0.65, 2.6],
        basePosition: [-0.65, 0.45, 0],
        explodedOffset: [-1.4, 0.45, 0],
        disassemblyOrder: 4,
        requiredTool: 'Saca-polias / Extrator Mecânico'
      }
    },
    {
      id: 'part-output-gear',
      name: 'Coroa Helicoidal Conduzida',
      technicalName: 'Engrenagem Cilíndrica Helicoidal Z2=82',
      tag: 'COROA-SAIDA',
      category: 'transmission',
      material: 'Aço Liga SAE 8620 Cementado, Temperado e Retificado',
      tolerance: 'Furo central ø50 H7 / Folga entre dentes (Backlash) 0.12 a 0.18 mm',
      simpleDefinition: 'É a engrenagem grande que recebe a rotação do pinhão, girando mais devagar com muito mais força.',
      mainFunction: 'Multiplicar o torque de rotação na proporção de 4.82 vezes e acionar o eixo de saída da máquina.',
      location: 'Montada no eixo de saída, engrenada com o pinhão helicoidal.',
      relationshipWithOthers: 'Acoplada ao eixo de saída através de chaveta paralela norma DIN 6885 forma A e retida axialmente por ressaltos.',
      typicalFailureModes: 'Desgaste adesivo por lubrificação inadequada, pitting superficial e quebra de dente por fadiga.',
      practicalExample: 'Comum em acionamentos de tambores de britagem, moendas e calandras industriais.',
      quickCheckQuestion: {
        question: 'O que o ângulo de hélice de 20° nas engrenagens helicoidais proporciona em comparação com dentes retos?',
        options: [
          'Engrenamento gradual e contínuo, reduzindo ruído e vibração e aumentando a capacidade de carga.',
          'Eliminação total de atrito entre os dentes.',
          'Gera rotação no sentido anti-horário em ambos os eixos.',
          'Permite girar sem nenhuma lubrificação.'
        ],
        correctIndex: 0,
        explanation: 'Nas engrenagens helicoidais o contato inicia em uma extremidade do dente e se propaga suavemente ao longo da hélice, garantindo suavidade acústica e alta resistência.'
      },
      meshData: {
        type: 'gear',
        color: '#f59e0b',
        metalness: 0.85,
        roughness: 0.25,
        dimensions: [1.35, 1.35, 0.6],
        basePosition: [0.65, 0.1, 0],
        explodedOffset: [1.8, 0.1, 0],
        disassemblyOrder: 5,
        requiredTool: 'Prensa Hidráulica / Extrator com Apoio em V'
      }
    },
    {
      id: 'part-taper-bearings',
      name: 'Rolamentos de Rolos Cônicos (Par 30206)',
      technicalName: 'Rolamentos Cônicos de Precisão DIN 720',
      tag: 'ROL-30206',
      category: 'bearing',
      material: 'Aço para Rolamentos 100Cr6 (SAE 52100) Alta Dureza (62 HRC)',
      tolerance: 'Folga axial de trabalho: 0.03 a 0.06 mm (ajustada por calços retificados)',
      simpleDefinition: 'São anéis com roletes cônicos de aço super lisos que permitem que os eixos girem com mínimo atrito.',
      mainFunction: 'Apoiar e guiar o giro do eixo, absorvendo ao mesmo tempo as cargas radiais do peso e as cargas axiais geradas pelos dentes helicoidais.',
      location: 'Prensados nos colos de cada extremidade dos eixos de entrada e de saída.',
      relationshipWithOthers: 'A capa externa apoia-se no alojamento da carcaça e o cone interno assenta-se no eixo sob ajuste interferente k6.',
      typicalFailureModes: 'Descamação (spalling) por fadiga superficial, marcas de estrias (brinelling) por vibração ou superaquecimento por falta de folga.',
      practicalExample: 'Utilizados amplamente em cubos de roda automotivos, redutores pesados e fusos de máquinas-ferramenta.',
      quickCheckQuestion: {
        question: 'Por que o redutor helicoidal utiliza rolamentos de rolos CÔNICOS e não rolamentos simples de esferas?',
        options: [
          'Porque os dentes helicoidais geram empuxo axial significativo, que os rolamentos cônicos absorvem com excelência junto à carga radial.',
          'Porque rolamentos cônicos são mais baratos que qualquer outro tipo.',
          'Porque eles não precisam de graxa nem de óleo.',
          'Porque rolamentos de esferas não podem girar em velocidade média.'
        ],
        correctIndex: 0,
        explanation: 'A inclinação dos dentes helicoidais empurra o eixo lateralmente (força axial). A geometria cônica dos roletes é ideal para equilibrar forças radiais e axiais simultaneamente.'
      },
      meshData: {
        type: 'ring',
        color: '#e2e8f0',
        metalness: 0.9,
        roughness: 0.2,
        dimensions: [0.55, 0.35, 0.3],
        basePosition: [-0.65, 0.45, 1.15],
        explodedOffset: [-1.4, 0.45, 2.2],
        disassemblyOrder: 3,
        requiredTool: 'Extrator de Rolamentos com Fuso Hidráulico'
      }
    },
    {
      id: 'part-radial-seals',
      name: 'Retentores Radiais com Mola em Viton',
      technicalName: 'Vedadores de Eixo Giratório NBR DIN 3760',
      tag: 'RET-VITON',
      category: 'sealing',
      material: 'Elastômero Fluorocarbono (Viton FKM) + Mola de Tração Inox',
      tolerance: 'Eixo ø25 mm h9 / Alojamento ø47 mm H8 / Largura 7 mm',
      simpleDefinition: 'É um anel de borracha especial com mola que abraça o eixo que sai da máquina para o óleo não escapar.',
      mainFunction: 'Evitar o vazamento do fluido lubrificante interno e impedir a entrada de água, pó e cavacos na carcaça.',
      location: 'Prensados nas tampas cegas e passantes das saídas dos eixos.',
      relationshipWithOthers: 'O lábio de vedação desliza suavemente sobre a pista retificada do eixo giratório com um filme fino de óleo.',
      typicalFailureModes: 'Endurecimento do elastômero por calor, sulcos de desgaste na pista do eixo ou rasgo do lábio por montagem sem lubrificação prévia.',
      practicalExample: 'Item mandatório em virabrequins, caixas de engrenagens de tratores e bombas centrífugas.',
      quickCheckQuestion: {
        question: 'Que cuidado metrológico e de montagem deve ser tomado ao instalar um novo retentor no eixo?',
        options: [
          'Lubrificar previamente o lábio com o próprio óleo do redutor e usar dispositivo tubular para prensagem uniforme sem danificar a mola.',
          'Bater com punção de aço pontiagudo no centro da borracha.',
          'Aquecer o retentor com maçarico até amolecer.',
          'Aplicar cola instantânea cianoacrilato no lábio que toca o eixo.'
        ],
        correctIndex: 0,
        explanation: 'Montar o retentor a seco causa queima imediata do lábio nos primeiros segundos de giro. O dispositivo tubular garante que a mola não escape da cavidade interna.'
      },
      meshData: {
        type: 'ring',
        color: '#b91c1c',
        metalness: 0.2,
        roughness: 0.8,
        dimensions: [0.48, 0.26, 0.15],
        basePosition: [-0.65, 0.45, 1.35],
        explodedOffset: [-1.4, 0.45, 2.8],
        disassemblyOrder: 0,
        requiredTool: 'Saca-retentores / Punção Guia Tubular'
      }
    },
    {
      id: 'part-housing-bottom',
      name: 'Carcaça Bipartida Inferior (Base Estrutural)',
      technicalName: 'Corpo Inferior com Reservatório de Óleo',
      tag: 'CARC-BASE',
      category: 'structural',
      material: 'Ferro Fundido Cinzento FC-250 com Nervuras de Reforço',
      tolerance: 'Alinhamento dos berços dos mancais coaxialidade ≤ 0.02 mm',
      simpleDefinition: 'É a base pesada que fica fixada na bancada ou no chão da fábrica, servindo de cárter de óleo.',
      mainFunction: 'Sustentar o peso de todos os componentes internos, absorver reações de torque e alojar o cárter com bujão magnético.',
      location: 'Base do conjunto, parafusada na placa de fundação.',
      relationshipWithOthers: 'Recebe os eixos nos berços semicilíndricos e une-se à tampa superior por parafusos.',
      typicalFailureModes: 'Acúmulo de borra nos cantos do reservatório, empenamento da base por aperto em piso irregular.',
      practicalExample: 'Base monobloco comum a redutores de esteiras e transportadores helicoidais.',
      quickCheckQuestion: {
        question: 'Qual é o papel do bujão magnético localizado no fundo da carcaça inferior?',
        options: [
          'Atrair e reter partículas metálicas ferrosas provenientes do desgaste dos dentes, evitando que recirculem nos rolamentos.',
          'Criar um campo elétrico para aumentar a velocidade dos eixos.',
          'Evitar que o óleo congele durante o inverno.',
          'Indicar visualmente o nível máximo de óleo.'
        ],
        correctIndex: 0,
        explanation: 'O ímã atrai as limalhas de aço geradas no amaciamento dos dentes, protegendo as pistas polidas dos rolamentos contra risco abrasivo.'
      },
      meshData: {
        type: 'housing',
        color: '#334155',
        metalness: 0.4,
        roughness: 0.6,
        dimensions: [3.2, 1.0, 2.2],
        basePosition: [0, -0.2, 0],
        explodedOffset: [0, -1.2, 0],
        disassemblyOrder: 6,
        requiredTool: 'Chave Allen 8mm (Bujão de Dreno)'
      }
    }
  ],
  disassemblySteps: [
    {
      step: 1,
      partId: 'part-bolts-perimeter',
      title: 'Etapa 1: Alívio e Desaperto dos Parafusos Perimetrais',
      actionText: 'Utilize a chave combinada de 17mm para afrouxar os 8 parafusos em ordem cruzada.',
      objectiveText: 'Aliviar progressivamente as tensões da carcaça fundida sem provocar deformações angulares na junta de vedação.',
      requiredTool: 'Chave Combinada 17mm',
      safetyCaution: 'Certifique-se de que o motor primário está bloqueado e etiquetado (LOTO).',
      validationCheck: 'Todos os 8 parafusos M10 soltos e removidos da tampa.'
    },
    {
      step: 2,
      partId: 'part-housing-top',
      title: 'Etapa 2: Levantamento Vertical da Carcaça Superior',
      actionText: 'Use os parafusos de extração (sacadores) ou levante a tampa perpendicularmente pelas alças.',
      objectiveText: 'Expor o trem de engrenagens e os mancais sem raspar os dentes contra as paredes internas da fundição.',
      requiredTool: 'Alavancas Guiadas / Parafusos Sacadores M12',
      safetyCaution: 'Nunca bater talhadeira entre as duas metades da carcaça.',
      validationCheck: 'Tampa superior desacoplada e posicionada sobre bancada de madeira.'
    },
    {
      step: 3,
      partId: 'part-radial-seals',
      title: 'Etapa 3: Remoção Cuidadosa dos Retentores Radiais',
      actionText: 'Extraia os anéis de vedação das tampas laterais com ferramenta especial de gancho arredondado.',
      objectiveText: 'Inspecionar visualmente o lábio de elastômero e a pista de atrito no eixo em busca de ranhuras.',
      requiredTool: 'Extrator Especial de Retentores',
      safetyCaution: 'Retentores usados nunca devem ser reaproveitados em montagens industriais.',
      validationCheck: 'Retentores retirados e encaminhados para descarte ecologicamente correto.'
    },
    {
      step: 4,
      partId: 'part-input-pinion-shaft',
      title: 'Etapa 4: Extração do Conjunto do Eixo de Entrada',
      actionText: 'Içar o eixo pinhão junto com seus rolamentos de rolos cônicos apoiando em prisma em V.',
      objectiveText: 'Verificar a concentricidade, os dentes do pinhão helicoidal e o estado das pistas dos rolamentos.',
      requiredTool: 'Prisma em V com Base Magnética',
      safetyCaution: 'Cuidado para não bater os dentes helicoidais contra superfícies de aço temperado.',
      validationCheck: 'Eixo de entrada repousando seguro no berço da bancada.'
    },
    {
      step: 5,
      partId: 'part-output-gear',
      title: 'Etapa 5: Remoção do Eixo de Saída e Coroa Conduzida',
      actionText: 'Retirar o conjunto do eixo secundário e verificar o assentamento da coroa e da chaveta paralela.',
      objectiveText: 'Concluir a desmontagem do trem cinemático para medição metrológica dos colos com micrômetro.',
      requiredTool: 'Micrômetro Externo 25-50mm + Paquímetro 150mm',
      safetyCaution: 'Utilizar luvas com aderência mecânica devido à presença de película viscosa de óleo.',
      validationCheck: 'Todos os componentes inspecionados e prontos para a avaliação prática.'
    }
  ]
};

export const CENTRIFUGAL_PUMP_MACHINE: MachineData = {
  id: 'centrifugal-pump',
  name: 'Bomba centrífuga horizontal (modelo educacional)',
  subtitle: 'Construção Back-Pull-Out com Rotor Fechado, Selo Mecânico EN 12756 e Cavalete de Mancal',
  category: 'Máquinas de Fluxo & Bombeamento Industrial',
  difficulty: 'Iniciante',
  glbUrl: '/assets/models/pumps/centrifugal_pump_iso2858.glb',
  sourceAttribution: {
    standard: 'ISO 2858 / EN 22858 / DIN 24256 & EN 12756',
    referenceModel: 'Família de bombas normalizadas ISO 2858, back-pull-out, 65-50-160 (modelo educacional simplificado)',
    license: 'CC0 1.0 Public Domain (Geometria Paramétrica Normalizada)',
    assetPath: 'public/assets/models/pumps/centrifugal_pump_iso2858.glb'
  },
  specs: [
    { label: 'Tipo de referência', value: 'Bomba normalizada de sucção axial (família ISO 2858) — proporções aproximadas' },
    { label: 'Bocais Flang. (Sucção / Recalque)', value: 'Axial DN 65 / Superior DN 50' },
    { label: 'Vedação de Eixo', value: 'Selo Mecânico Carbeto de Silício / Grafite (EN 12756)' },
    { label: 'Mancais de Rolamento', value: 'Par de Rolamentos Rígidos de Esferas 6308' }
  ],
  overviewDescription:
    'Uma bomba centrífuga converte a energia mecânica de rotação do motor elétrico em energia cinética (velocidade) através do rotor (impelidor) e, em seguida, transforma essa velocidade em energia de pressão dentro da carcaça em espiral (voluta). O padrão industrial ISO 2858 utiliza construção Back-Pull-Out, permitindo retirar todo o conjunto girante pela traseira sem desmontar a tubulação de sucção e recalque.',
  safetyRules: [
    'NR-12 e LOTO: Desenergizar e bloquear o motor elétrico principal antes de tocar no acoplamento ou nos prisioneiros.',
    'Despressurização e Drenagem: Fechar válvulas de sucção e recalque, aguardar o resfriamento do fluido e abrir o bujão inferior de dreno da voluta.',
    'Nunca operar a bomba centrífuga a seco: o selo mecânico depende do próprio líquido bombeado para lubrificar e resfriar suas faces lapidadas.',
    'Jamais tocar ou contaminar com graxa as faces espelhadas de carbeto/grafite do selo mecânico durante a montagem.'
  ],
  parts: [
    {
      id: 'pump-volute-casing',
      name: 'Carcaça Espiral em Voluta (Corpo da Bomba)',
      technicalName: 'Corpo Espiral Fundido ISO 2858 com Sucção Axial DN 65 e Recalque DN 50',
      tag: 'VOLUTA-ISO',
      category: 'structural',
      material: 'Ferro Fundido Nodular ASTM A536 Gr. 60-40-18 (GGG-40)',
      tolerance: 'Encaixe do anel de desgaste e planicidade da face de vedação: conforme desenho do fabricante',
      simpleDefinition: 'É o "caracol" metálico externo por onde o líquido entra pela frente (sucção) e sai empurrado sob pressão por cima (recalque).',
      mainFunction: 'Coletar o fluido acelerado pelas pás do rotor e converter gradualmente sua alta velocidade em pressão estática devido ao aumento progressivo da área da espiral.',
      location: 'Parte frontal da bomba, permanece parafusada nos flanges da tubulação durante a manutenção Back-Pull-Out.',
      relationshipWithOthers: 'Aloja o rotor centrífugo em seu interior e fecha-se na traseira contra a tampa de pressão e o cavalete por meio dos prisioneiros perimetrais.',
      typicalFailureModes: 'Erosão por cavitação na língua da voluta, corrosão interna ou desgaste excessivo no anel de desgaste frontal.',
      practicalExample: 'Estações de bombeamento de água gelada (HVAC), torres de resfriamento e transferência química industrial.',
      inspection: [
        "Língua da voluta e parede interna: erosão, corrosão ou furinhos de cavitação.",
        "Anel de desgaste da carcaça: folga com o rotor comparada ao limite do manual.",
        "Face de vedação traseira: riscos ou corrosão onde a junta assenta.",
        "Flanges e pés: trincas e pé manco na base."
      ],
      maintenance: [
        "Fica presa à tubulação: a construção back-pull-out evita desmontar os tubos.",
        "Folga do anel de desgaste acima do limite faz a bomba perder vazão: troque o anel, não a carcaça."
      ],
      references: ["iso2858", "macintyre", "manual"],
      quickCheckQuestion: {
        question: 'Qual é a grande vantagem prática da carcaça ISO 2858 com sistema Back-Pull-Out durante a manutenção?',
        options: [
          'Permite extrair o cavalete, o selo mecânico e o rotor pela traseira sem precisar desconectar a carcaça das tubulações de sucção e recalque.',
          'Permite que a bomba funcione sem motor elétrico.',
          'Elimina a necessidade de usar parafusos na carcaça.',
          'Transforma água em vapor dentro da tubulação.'
        ],
        correctIndex: 0,
        explanation: 'No sistema Back-Pull-Out, a voluta permanece presa aos tubos da fábrica enquanto o subconjunto rotativo sai para trás, economizando horas de retrabalho e alinhamento.'
      },
      meshData: {
        type: 'housing',
        color: '#0d6aad',
        metalness: 0.45,
        roughness: 0.5,
        dimensions: [2.2, 2.2, 1.4],
        basePosition: [0, 0.1, 1.15],
        explodedOffset: [0, 0, 2.2],
        disassemblyOrder: 6,
        requiredTool: 'Permanece fixa na tubulação (bujão de dreno: chave conforme o bujão)'
      }
    },
    {
      id: 'pump-fasteners',
      name: 'Parafusos da carcaça',
      technicalName: 'Parafusos sextavados de união carcaça–tampa–cavalete (8 unidades no modelo)',
      tag: 'FIX-BOMBA',
      category: 'fastener',
      material: 'Aço carbono de alta resistência (classe conforme a lista de peças do fabricante)',
      tolerance: 'Aperto em sequência cruzada, com torquímetro, no valor do manual do fabricante (não informado neste modelo educacional)',
      simpleDefinition: 'São os parafusos que prendem a tampa e o cavalete na carcaça em espiral, apertando a junta entre elas.',
      mainFunction: 'Manter a junta entre a carcaça e a tampa de pressão comprimida por igual, para não vazar, e segurar a unidade rotativa no lugar.',
      location: 'Em círculo no flange traseiro da carcaça, passando pelo flange do cavalete e pela tampa de pressão.',
      relationshipWithOthers: 'Atravessam o flange do cavalete e a tampa de pressão e rosqueiam na carcaça. A junta fica entre a carcaça e a tampa.',
      typicalFailureModes: 'Rosca engripada por corrosão, parafuso esticado por excesso de aperto e vazamento na junta por aperto desigual.',
      practicalExample: 'Soltar e apertar em cruz é a regra em qualquer flange com junta: tampa de bomba, flange de tubulação, tampa de redutor.',
      inspection: [
        'Roscas: amassadas, engripadas ou com corrosão.',
        'Parafuso esticado (rosca “alongada”) ou cabeça arredondada.'
      ],
      maintenance: [
        'Parafuso danificado é trocado por outro da mesma especificação.',
        'Aperto final em cruz, em etapas, com torquímetro no valor do manual.'
      ],
      references: ['manual'],
      quickCheckQuestion: {
        question: 'Por que os parafusos da carcaça devem ser soltos e apertados em sequência cruzada?',
        options: [
          'Para distribuir a carga sobre a junta por igual e não inclinar a tampa.',
          'Apenas por tradição da oficina.',
          'Para aumentar a rotação do motor.',
          'Porque chaves de boca só funcionam em diagonal.'
        ],
        correctIndex: 0,
        explanation: 'Aperto desigual inclina a tampa, e a junta e o selo mecânico podem vazar.'
      },
      meshData: {
        type: 'cylinder',
        color: '#e2e8f0',
        metalness: 0.85,
        roughness: 0.25,
        dimensions: [0.15, 0.15, 0.4],
        basePosition: [0, 0.1, 0.52],
        explodedOffset: [0, 2.1, 0.8],
        disassemblyOrder: 1,
        requiredTool: 'Chave combinada ou soquete; torquímetro no aperto final'
      }
    },
    {
      id: 'pump-casing-gasket',
      name: 'Junta da carcaça',
      technicalName: 'Junta plana entre a carcaça (voluta) e a tampa de pressão',
      tag: 'JUNTA',
      category: 'sealing',
      material: 'Conforme a lista de peças do fabricante (ex.: papelão hidráulico sem amianto ou grafite)',
      tolerance: 'Tipo, material e espessura: conforme a lista de peças do fabricante',
      simpleDefinition: 'É o anel fino que fica entre a carcaça e a tampa e veda a junção das duas peças.',
      mainFunction: 'Preencher as pequenas irregularidades entre as faces e impedir que o líquido sob pressão vaze pela junção da carcaça.',
      location: 'Entre a face traseira da carcaça em espiral e a tampa de pressão, por dentro do círculo de parafusos.',
      relationshipWithOthers: 'É comprimida pelos parafusos da carcaça. Aperto desigual deixa um lado frouxo, e ali ela vaza.',
      typicalFailureModes: 'Vazamento por aperto desigual, junta reaproveitada, face riscada ou material incompatível com o produto.',
      practicalExample: 'Junta usada sempre vai para o descarte: ela já foi esmagada e perdeu a capacidade de vedar.',
      inspection: [
        'Junta retirada: rasgos ou marcas de vazamento mostram onde a vedação falhou.',
        'Faces da carcaça e da tampa: riscos, corrosão ou restos de junta antiga.'
      ],
      maintenance: [
        'Use sempre junta nova, do tipo indicado pelo fabricante.',
        'Limpe as faces com espátula de plástico ou latão, sem riscar.'
      ],
      references: ['mattosFalco', 'manual'],
      quickCheckQuestion: {
        question: 'A junta da carcaça saiu inteira. O que fazer na montagem?',
        options: [
          'Usar junta nova, do tipo indicado pelo fabricante.',
          'Reaproveitar a mesma junta.',
          'Montar sem junta e apertar mais os parafusos.',
          'Passar graxa grossa no lugar da junta.'
        ],
        correctIndex: 0,
        explanation: 'A junta usada já foi esmagada e não veda como uma nova.'
      },
      meshData: {
        type: 'ring',
        color: '#7a8450',
        metalness: 0,
        roughness: 0.9,
        dimensions: [1.12, 0.98, 0.02],
        basePosition: [0, 0, -0.43],
        explodedOffset: [1.1, 0, 0],
        disassemblyOrder: 3,
        requiredTool: 'Espátula de plástico ou latão; junta nova na montagem'
      }
    },
    {
      id: 'pump-impeller-nut',
      name: 'Porca e arruela do rotor',
      technicalName: 'Porca de fixação do rotor com arruela, na ponta roscada do eixo',
      tag: 'PORCA-ROTOR',
      category: 'fastener',
      material: 'Aço inoxidável (comum neste uso; conferir na lista de peças)',
      tolerance: 'Torque de aperto e sentido da rosca: conforme o manual do fabricante',
      simpleDefinition: 'É a porca na ponta do eixo, do lado da sucção, que prende o rotor no lugar.',
      mainFunction: 'Impedir que o rotor se desloque no eixo enquanto gira.',
      location: 'Na ponta roscada do eixo, no centro da entrada do rotor (olhal de sucção).',
      relationshipWithOthers: 'Aperta o rotor contra o ressalto do eixo. A chaveta transmite o giro; a porca segura o rotor na posição.',
      typicalFailureModes: 'Porca solta por giro ao contrário da bomba, rosca danificada por força no sentido errado e corrosão.',
      practicalExample: 'O sentido da rosca é escolhido para que o giro da bomba tenda a apertá-la; por isso pode ser rosca esquerda.',
      inspection: [
        'Rosca da porca e da ponta do eixo: sem amassados.',
        'Arruela ou trava: sem deformação.'
      ],
      maintenance: [
        'Confira o sentido da rosca no manual antes de fazer força.',
        'Trave o eixo pelo cubo do acoplamento, nunca pelas pás do rotor.',
        'Aperte com torquímetro, no valor do manual.'
      ],
      references: ['manual'],
      quickCheckQuestion: {
        question: 'A porca do rotor não solta no sentido comum. O que fazer?',
        options: [
          'Conferir no manual se a rosca é esquerda.',
          'Usar cano de extensão.',
          'Aquecer com maçarico.',
          'Bater com talhadeira.'
        ],
        correctIndex: 0,
        explanation: 'A rosca pode ser esquerda. Forçar no sentido errado danifica a ponta do eixo.'
      },
      meshData: {
        type: 'cylinder',
        color: '#dfe2e6',
        metalness: 1,
        roughness: 0.16,
        dimensions: [0.15, 0.15, 0.14],
        basePosition: [0.45, 0, 0],
        explodedOffset: [0.45, 0, 0],
        disassemblyOrder: 4,
        requiredTool: 'Chave de boca ou soquete, com o eixo travado; torquímetro na montagem'
      }
    },
    {
      id: 'pump-impeller',
      name: 'Rotor Centrífugo Fechado (Impelidor Radial)',
      technicalName: 'Rotor radial fechado de 6 pás curvas, diâmetro nominal 160 mm (modelo educacional), balanceado conforme o fabricante',
      tag: 'ROTOR-160',
      category: 'transmission',
      material: 'Bronze Fosforoso Fundido SAE 65 / Ferro Fundido ASTM A48',
      tolerance: 'Ajuste no eixo e batimento máximo: conforme desenho do fabricante',
      simpleDefinition: 'É o "coração" giratório da bomba: um disco com pás curvas internas que suga o líquido pelo centro e o arremessa com força para as bordas.',
      mainFunction: 'Transferir a energia mecânica do eixo para o líquido por meio da força centrífuga gerada pelas pás curvas em rotação.',
      location: 'Montado na ponta dianteira do eixo mediante chaveta paralela e porca de travamento, girando livre dentro da voluta.',
      relationshipWithOthers: 'Trabalha com uma folga pequena (definida pelo fabricante) entre os anéis de desgaste do rotor e da carcaça, que limita o retorno do líquido da pressão para a sucção.',
      typicalFailureModes: 'Corrosão por cavitação (furinhos tipo "queijo suíço" nas pás por fervura a frio do líquido em baixa pressão), desbalanceamento por incrustação ou abrasão.',
      practicalExample: 'Impelidores fechados são o padrão em bombas de água limpa, solventes e óleos leves pela altíssima eficiência hidráulica.',
      inspection: [
        "Pás: furinhos perto da entrada (cavitação), erosão ou pás tortas.",
        "Anel de desgaste do rotor: marcas de raspagem indicam eixo empenado ou rolamento gasto.",
        "Furo e rasgo de chaveta: sem marcas nem folga.",
        "Incrustação ou falta de material: causam desbalanceamento e vibração."
      ],
      maintenance: [
        "Rotor reparado ou usinado deve ser rebalanceado conforme o fabricante.",
        "Cavitação é sintoma: a causa está na sucção (NPSH disponível baixo), não no rotor."
      ],
      references: ["macintyre", "mattosFalco", "manual"],
      quickCheckQuestion: {
        question: 'O que acontece nas pás do rotor quando ocorre o fenômeno destrutivo chamado CAVITAÇÃO?',
        options: [
          'Bolhas de vapor se formam na entrada de baixa pressão e implodem violentamente nas pás, arrancando partículas do metal e gerando ruído de pedregulhos.',
          'As pás derretem porque o motor gira devagar.',
          'O rotor aumenta de diâmetro sozinho.',
          'O líquido congela instantaneamente dentro da bomba.'
        ],
        correctIndex: 0,
        explanation: 'Quando a pressão de sucção cai abaixo da pressão de vapor do líquido (NPSH disponível menor que o requerido), formam-se microbolhas que implodem em regiões de alta pressão, corroendo o metal.'
      },
      meshData: {
        type: 'gear',
        color: '#d97706',
        metalness: 0.85,
        roughness: 0.25,
        dimensions: [0.88, 0.88, 0.38],
        basePosition: [0, 0.1, 1.02],
        explodedOffset: [0, 0, 1.15],
        disassemblyOrder: 2,
        requiredTool: 'Saca-Polias de 3 Garras + Chave de Retenção'
      }
    },
    {
      id: 'pump-mechanical-seal',
      name: 'Tampa de Pressão & Selo Mecânico (EN 12756)',
      technicalName: 'Selo Mecânico Simples de Mola Única (Faces SiC vs. Grafite + Elastômero Viton)',
      tag: 'SELO-MEC',
      category: 'sealing',
      material: 'Carbeto de Silício (SiC), Grafite Impregnado, Inox AISI 316 e Viton (FKM)',
      tolerance: 'Faces lapidadas; a planicidade é verificada pelo fabricante com luz monocromática (bandas de luz)',
      simpleDefinition: 'É o sistema de vedação de altíssima precisão que impede que o líquido pressurizado da bomba vaze pelo vão onde o eixo atravessa a carcaça.',
      mainFunction: 'Promover a vedação dinâmica entre o eixo rotativo e a tampa estacionária através do contato de duas faces super polidas pressionadas por uma mola.',
      location: 'Alojado na câmara de selagem da tampa de pressão, logo atrás do cubo do rotor.',
      relationshipWithOthers: 'Uma metade (sede estacionária) fica fixa na tampa; a outra metade (unidade rotativa com mola) gira abraçada ao eixo.',
      typicalFailureModes: 'Trinca térmica das faces por trabalho a seco (sem líquido), riscamento por partículas abrasivas ou ataque químico nos anéis O-ring.',
      practicalExample: 'Substituiu as antigas gaxetas trançadas na indústria moderna por operar sem gotejamento visível e sem desgastar o eixo.',
      inspection: [
        "Faces: riscos, trincas, lascas ou marcas de calor (trabalho a seco).",
        "Borrachas (O-rings, fole): endurecidas, inchadas ou cortadas.",
        "Mola: quebrada, presa por sujeira ou cansada.",
        "Câmara do selo: depósitos e corrosão."
      ],
      maintenance: [
        "Selo que vazou é trocado (ou recondicionado pelo fabricante do selo): faces não se lixam na oficina.",
        "Na montagem, respeite a medida da mola e use só o lubrificante indicado nas borrachas, nunca nas faces."
      ],
      references: ["en12756", "mattosFalco", "manual"],
      quickCheckQuestion: {
        question: 'Qual é o erro mais comum e fatal cometido por iniciantes ao manusear ou ligar uma bomba com Selo Mecânico?',
        options: [
          'Ligar a bomba a seco (sem líquido na carcaça) ou tocar nas faces lapidadas com dedos sujos de graxa e poeira.',
          'Limpar a bancada antes da montagem.',
          'Usar água limpa para lubrificar o anel O-ring na montagem.',
          'Verificar o alinhamento do eixo com relógio comparador.'
        ],
        correctIndex: 0,
        explanation: 'Sem o filme microscópico do próprio líquido bombeado entre as faces do selo, o atrito gera calor extremo em poucos segundos, trincando a cerâmica/carbeto.'
      },
      meshData: {
        type: 'ring',
        color: '#dc2626',
        metalness: 0.5,
        roughness: 0.4,
        dimensions: [1.1, 0.38, 0.42],
        basePosition: [0, 0.1, 0.62],
        explodedOffset: [0, 0, 0.25],
        disassemblyOrder: 3,
        requiredTool: 'Bucha Guia de Montagem de Poliacetal (POM)'
      }
    },
    {
      id: 'pump-shaft',
      name: 'Eixo Escalonado de Transmissão com Chaveta',
      technicalName: 'Eixo Rotativo Retificado em Aço Inox Martensítico AISI 420 / SAE 4140',
      tag: 'EIXO-BOMBA',
      category: 'transmission',
      material: 'Aço Inoxidável AISI 420 Beneficiado e Retificado nos Colos',
      tolerance: 'Colos de rolamento com Ø 40 mm (furo do rolamento 6308); ajuste e batimento máximo conforme desenho do fabricante',
      simpleDefinition: 'É a árvore metálica rígida que recebe o giro do motor elétrico na ponta traseira e faz o rotor girar na ponta dianteira.',
      mainFunction: 'Transmitir o torque e a rotação com rigidez flexional máxima para que o rotor e o selo mecânico girem perfeitamente centrados.',
      location: 'Atravessa o centro do cavalete de mancal, apoiado sobre os dois rolamentos de esferas.',
      relationshipWithOthers: 'Conecta-se ao acoplamento elástico do motor na traseira e ao cubo do rotor na dianteira através de chaveta paralela DIN 6885.',
      typicalFailureModes: 'Empenamento (flecha excessiva) por desalinhamento com o motor, corrosão sob o fole do selo ou desgaste no rasgo de chaveta.',
      practicalExample: 'Todo mecânico industrial verifica o empenamento do eixo entre pontas com o relógio comparador antes de remontar a bomba.',
      inspection: [
        "Batimento (empeno) com relógio comparador, com o eixo apoiado em prismas em V.",
        "Colos dos rolamentos e região do selo: riscos, corrosão ou desgaste.",
        "Rasgos de chaveta e rosca da ponta: sem amassados nem trincas."
      ],
      maintenance: [
        "Eixo com batimento acima do limite do fabricante é trocado ou recuperado por quem tem processo para isso.",
        "Apoie sempre em madeira ou prismas: colos retificados não podem bater no chão."
      ],
      references: ["skf", "manual"],
      quickCheckQuestion: {
        question: 'Como um técnico mecânico verifica na bancada se o eixo da bomba centrífuga está empenado após a desmontagem?',
        options: [
          'Apoiando o eixo em prismas em V (ou entre pontas) e girando-o lentamente enquanto lê a variação no Relógio Comparador Centesimal.',
          'Olhando de longe com um olho fechado.',
          'Batendo no eixo com uma marreta para ouvir o som.',
          'Aquecendo o eixo até ficar vermelho.'
        ],
        correctIndex: 0,
        explanation: 'O relógio comparador mede o batimento radial (run-out). Se passar do limite do fabricante, principalmente na região do selo, o selo mecânico tende a vazar antes do tempo.'
      },
      meshData: {
        type: 'cylinder',
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.18,
        dimensions: [0.18, 0.18, 2.35],
        basePosition: [0, 0.1, -0.15],
        explodedOffset: [0, 0, -0.85],
        disassemblyOrder: 4,
        requiredTool: 'Relógio Comparador + Base Magnética e Prensa Arbor'
      }
    },
    {
      id: 'pump-bearings',
      name: 'Par de Rolamentos Rígidos de Esferas (6308)',
      technicalName: 'Rolamentos Rígidos de Uma Carreira de Esferas DIN 625 (6308 C3)',
      tag: 'ROL-6308',
      category: 'bearing',
      material: 'Aço Cromo de Alta Pureza 100Cr6 (SAE 52100)',
      tolerance: 'Folga interna (ex.: C3) e ajustes no eixo e no alojamento: conforme o fabricante da bomba',
      simpleDefinition: 'São os dois rolamentos alojados dentro do cavalete que sustentam o eixo para que ele gire a 1750 ou 3500 RPM sem atrito e sem folga.',
      mainFunction: 'Suportar a carga radial hidráulica do rotor e o empuxo axial residual da sucção, mantendo a concentricidade do eixo.',
      location: 'Instalados nas extremidades dianteira e traseira interna do cavalete de mancal, lubrificados em banho de óleo ISO VG 46/68.',
      relationshipWithOthers: 'O anel interno gira solidário ao eixo com interferência; o anel externo fica alojado nos berços usinados do cavalete.',
      typicalFailureModes: 'Fadiga das pistas por desalinhamento de acoplamento, contaminação do óleo por entrada de água através do labirinto/retentor ou montagem com pancadas.',
      practicalExample: 'A montagem correta em oficina é feita aquecendo o rolamento em aquecedor indutivo a 90°C–110°C para entrar deslizando no eixo sem esforço.',
      inspection: [
        "Pistas e esferas: marcas, descascamento, ferrugem ou cor de aquecimento.",
        "Giro à mão: ruído, pontos duros ou folga excessiva.",
        "Óleo retirado: cor, água ou partículas metálicas."
      ],
      maintenance: [
        "Rolamento retirado com extrator normalmente não volta: monte rolamento novo.",
        "Montagem com força só no anel com interferência ou com aquecedor indutivo; nada de chama.",
        "Óleo na altura indicada (em geral, até o meio da esfera mais baixa, no centro do visor)."
      ],
      references: ["iso15", "skf", "manual"],
      quickCheckQuestion: {
        question: 'Ao instalar um rolamento novo no eixo da bomba usando prensa ou tubo guia, onde a força de montagem DEVE ser aplicada?',
        options: [
          'Exclusivamente na face do ANEL INTERNO (ou usando aquecedor indutivo), nunca transmitindo força pelas esferas.',
          'No anel externo, forçando as esferas contra a pista.',
          'Diretamente na gaiola fina de chapa que separa as esferas.',
          'Com golpes de marreta sem proteção.'
        ],
        correctIndex: 0,
        explanation: 'Como o ajuste interferente fica no eixo, empurrar pelo anel externo crava as esferas nas pistas (brinelling), condenando o rolamento novo antes mesmo de ligar a bomba.'
      },
      meshData: {
        type: 'ring',
        color: '#f1f5f9',
        metalness: 0.92,
        roughness: 0.15,
        dimensions: [0.46, 0.24, 0.22],
        basePosition: [0, 0.1, -0.35],
        explodedOffset: [0, 1.35, -1.35],
        disassemblyOrder: 5,
        requiredTool: 'Aquecedor Indutivo de Rolamentos / Sacador Hidráulico'
      }
    },
    {
      id: 'pump-bearing-bracket',
      name: 'Cavalete de Mancal (Suporte Back-Pull-Out)',
      technicalName: 'Suporte de Rolamentos Monobloco com Câmara de Óleo e Lanterna Integrada',
      tag: 'CAVALETE-BPO',
      category: 'structural',
      material: 'Ferro Fundido Cinzento EN-GJL-250 (GG-25)',
      tolerance: 'Coaxialidade entre os alojamentos de rolamento: conforme desenho do fabricante',
      simpleDefinition: 'É o corpo cilíndrico robusto traseiro que guarda os rolamentos e o banho de óleo, mantendo o eixo perfeitamente alinhado.',
      mainFunction: 'Sustentar mecanicamente todo o conjunto rotativo (Back-Pull-Out), abrigar o reservatório de óleo lubrificante dos rolamentos e unir-se à tampa de pressão.',
      location: 'Parte traseira da bomba, apoiada sobre o pé suporte na base metálica.',
      relationshipWithOthers: 'Possui visor de nível constante de óleo, respiro superior e retentores/protetores de labirinto nas saídas do eixo.',
      typicalFailureModes: 'Vazamento de óleo pelos retentores do mancal, nível de óleo incorreto ou pé quebrado por pé-manco na base.',
      practicalExample: 'Permite trocar o conjunto girante por um reserva sem desmontar a tubulação, reduzindo o tempo de parada.',
      inspection: [
        "Alojamentos dos rolamentos: desgaste ou marcas de giro do anel externo.",
        "Câmara de óleo: borra, água ou limalha.",
        "Visor, respiro e retentores: entupidos, trincados ou vazando.",
        "Pé de apoio: trincas e pé manco."
      ],
      maintenance: [
        "Lave a câmara de óleo antes de montar e use o óleo do manual.",
        "Retentores das tampas do mancal são trocados a cada abertura."
      ],
      references: ["skf", "mattosFalco", "manual"],
      quickCheckQuestion: {
        question: 'Qual é o nível correto de óleo lubrificante dentro do cavalete de mancal de uma bomba centrífuga horizontal?',
        options: [
          'Até a metade da esfera/rolete mais baixo do rolamento (centro do visor de nível), sem encher o cavalete até o topo.',
          'Completamente cheio até transbordar pelo respiro superior.',
          'Totalmente seco, pois rolamentos de bombas não usam lubrificante.',
          'Cheio de água da torneira.'
        ],
        correctIndex: 0,
        explanation: 'Se o óleo passar da metade da esfera inferior, o turbilhonamento (batedeira) das esferas em alta rotação superaquece o óleo e causa espuma e vazamento.'
      },
      meshData: {
        type: 'housing',
        color: '#334155',
        metalness: 0.45,
        roughness: 0.55,
        dimensions: [1.1, 1.1, 1.4],
        basePosition: [0, 0.1, -0.35],
        explodedOffset: [0, -0.8, -1.65],
        disassemblyOrder: 7,
        requiredTool: 'Chave Combinada 17mm (Pé de Apoio e Dreno)'
      }
    },
    {
      id: 'pump-coupling-hub',
      name: 'Cubo do acoplamento (lado da bomba)',
      technicalName: 'Cubo flangeado do acoplamento com espaçador, montado com chaveta na ponta de acionamento do eixo',
      tag: 'ACOPL-CUBO',
      category: 'transmission',
      material: 'Aço ou ferro fundido (conforme o fabricante do acoplamento)',
      tolerance: 'Ajuste no eixo, posição axial e alinhamento: conforme os manuais da bomba e do acoplamento',
      simpleDefinition: 'É a metade do acoplamento que fica no eixo da bomba e recebe o giro do motor.',
      mainFunction: 'Transmitir o torque do motor para o eixo da bomba. Com o espaçador, permite tirar a unidade sem mover o motor.',
      location: 'Na ponta do eixo do lado do motor, fora do cavalete de mancal.',
      relationshipWithOthers: 'Liga-se ao espaçador (não modelado), que se liga ao cubo do motor. Desalinhamento entre os cubos vira vibração e desgaste dos rolamentos.',
      typicalFailureModes: 'Rasgo de chaveta alargado, elementos elásticos gastos e desgaste causado por desalinhamento.',
      practicalExample: 'Depois de qualquer montagem, o alinhamento entre motor e bomba é conferido com relógio comparador ou laser.',
      inspection: [
        'Furo e rasgo de chaveta do cubo: sem marcas nem folga.',
        'Elementos elásticos (se houver): ressecados ou rachados.'
      ],
      maintenance: [
        'Retire com extrator, sem pancadas: o impacto chega aos rolamentos.',
        'Na montagem, respeite a posição axial do manual e alinhe o acoplamento no fim.'
      ],
      references: ['manual', 'mattosFalco'],
      quickCheckQuestion: {
        question: 'Por que não bater no cubo do acoplamento para soltá-lo?',
        options: [
          'O impacto passa pelo eixo e marca as pistas dos rolamentos.',
          'O martelo desalinha o motor.',
          'O cubo é de plástico.',
          'Porque o cubo gira ao contrário.'
        ],
        correctIndex: 0,
        explanation: 'Pancada no eixo chega às esferas e marca as pistas, o que depois vira ruído e falha.'
      },
      meshData: {
        type: 'cylinder',
        color: '#55595f',
        metalness: 0.75,
        roughness: 0.42,
        dimensions: [0.62, 0.62, 0.48],
        basePosition: [-4.82, 0, 0],
        explodedOffset: [-2.3, 0, 0],
        disassemblyOrder: 7,
        requiredTool: 'Extrator (saca-polias); dispositivo de montagem na volta'
      }
    }
  ],
  disassemblySteps: [
    {
      step: 1,
      partId: 'pump-fasteners',
      title: 'Etapa 1: Desaperto dos Prisioneiros da Voluta e Porca de Fixação do Rotor',
      actionText: 'Com a bomba bloqueada (LOTO) e drenada, solte os parafusos perimetrais Back-Pull-Out em padrão cruzado e remova a porca frontal do rotor.',
      objectiveText: 'Liberar o conjunto girante traseiro da carcaça em voluta e destravar axialmente o impelidor.',
      requiredTool: 'Chave Soquete Sextavada 19mm + Torquímetro',
      safetyCaution: 'Confirme que as válvulas de sucção e recalque estão fechadas e a pressão interna é zero.',
      validationCheck: 'Prisioneiros e porca do rotor removidos e organizados na bandeja.'
    },
    {
      step: 2,
      partId: 'pump-impeller',
      title: 'Etapa 2: Extração Axial do Rotor Centrífugo Fechado (Impelidor)',
      actionText: 'Utilize o dispositivo sacador para extrair o rotor suavemente da ponta do eixo e retire a chaveta paralela.',
      objectiveText: 'Desacoplar o elemento hidráulico sem empenar o eixo e inspecionar as pás quanto a cavitação e desgaste nos anéis.',
      requiredTool: 'Saca-Polias de 3 Garras Calibrado',
      safetyCaution: 'Nunca bata com martelo nas bordas finas do disco do rotor para não desbalanceá-lo.',
      validationCheck: 'Rotor e chaveta extraídos e inspecionados.'
    },
    {
      step: 3,
      partId: 'pump-mechanical-seal',
      title: 'Etapa 3: Retirada Cuidadosa do Selo Mecânico e Tampa de Pressão',
      actionText: 'Deslize o conjunto rotativo do selo mecânico pela bucha guia do eixo e desencaixe a tampa de pressão com a sede estacionária.',
      objectiveText: 'Preservar as faces lapidadas de Carbeto de Silício e Grafite para análise de falha de vedação.',
      requiredTool: 'Bucha Guia de Poliacetal (POM)',
      safetyCaution: 'Não toque nas faces espelhadas do selo com luvas sujas de óleo ou partículas.',
      validationCheck: 'Selo mecânico e tampa de pressão removidos com segurança.'
    },
    {
      step: 4,
      partId: 'pump-shaft',
      title: 'Etapa 4: Extração do Conjunto Eixo Escalonado do Cavalete',
      actionText: 'Após retirar os anéis elásticos de retenção das tampas de mancal, extraia o eixo junto aos rolamentos utilizando a prensa de bancada.',
      objectiveText: 'Permitir a medição do batimento radial (run-out) do eixo nos prismas em V com relógio comparador.',
      requiredTool: 'Prensa Arbor + Relógio Comparador Centesimal',
      safetyCaution: 'Apoie o eixo com firmeza para evitar queda dos colos retificados.',
      validationCheck: 'Eixo extraído e pronto para controle metrológico.'
    },
    {
      step: 5,
      partId: 'pump-bearings',
      title: 'Etapa 5: Remoção dos Rolamentos Rígidos de Esferas (6308)',
      actionText: 'Utilize o extrator separador apoiado exclusivamente no anel interno para sacar os dois rolamentos 6308 das extremidades do eixo.',
      objectiveText: 'Concluir a desmontagem completa deixando o cavalete de mancal livre para lavagem do reservatório de óleo.',
      requiredTool: 'Extrator de Rolamentos com Garra Separadora',
      safetyCaution: 'Use óculos de proteção contra impacto durante toda a operação sob carga.',
      validationCheck: 'Bomba centrífuga ISO 2858 100% desmontada segundo o POP industrial.'
    }
  ]
};

export const MACHINES_CATALOG: Record<string, MachineData> = {
  'gearbox-reducer': GEARBOX_REDUCER_MACHINE,
  'centrifugal-pump': CENTRIFUGAL_PUMP_MACHINE,
  'gear-pump': GEAR_PUMP_MACHINE,
  'bearing-assembly': BEARING_ASSEMBLY_MACHINE,
  'belt-conveyor': BELT_CONVEYOR_MACHINE,
  'diaphragm-pump': DIAPHRAGM_PUMP_MACHINE,
  'motor-gearbox': MOTOR_GEARBOX_MACHINE
};

