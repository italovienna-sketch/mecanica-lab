import type { MachineData, MechanicalPart3D } from '../mechanicalMachines';
import type { MachineLabConfig, Vec3 } from '../labMission';
import { MG_RATIO_TEXT, MG_TEETH } from './motorGearboxSpec';

/**
 * Acionamento motor elétrico + acoplamento elástico + redutor de um estágio (laboratório 3D, Indústria na prática).
 * A relação de transmissão mostrada é a do próprio modelo (número de dentes), não de um produto real.
 * Sem potências, rotações nominais, torques, folgas, óleos ou apertos: dependem da placa e do manual do fabricante.
 * Modelo: src/components/lab/models/motorGearboxModel.ts
 */

export const MOTOR_GEARBOX_ID = 'motor-gearbox';

const MANUAL = 'Conforme o manual do fabricante (não informado neste modelo educacional)';


const mesh = (order: number, tool: string, color = '#9aa3ab'): MechanicalPart3D['meshData'] => ({
  type: 'housing',
  color,
  metalness: 0.6,
  roughness: 0.45,
  dimensions: [1, 1, 1],
  basePosition: [0, 0, 0],
  explodedOffset: [0, 0, 0],
  disassemblyOrder: order,
  requiredTool: tool
});

type PartText = Omit<MechanicalPart3D, 'meshData'>;

const part = (p: PartText, order: number, tool: string, color?: string): MechanicalPart3D => ({ ...p, meshData: mesh(order, tool, color) });

const BEARING_CHECK = {
  question: 'Ao extrair um rolamento preso no eixo, onde a força deve ser aplicada?',
  options: ['No anel interno, que é o que tem aperto no eixo', 'No anel externo', 'Nas esferas'],
  correctIndex: 0,
  explanation: 'A força passa só pelo anel com aperto. Se atravessar as esferas, marca as pistas.'
};

export const MOTOR_GEARBOX_MACHINE: MachineData = {
  id: MOTOR_GEARBOX_ID,
  name: 'Motor, acoplamento e redutor (modelo educacional)',
  subtitle: `Motor de indução com rotor de gaiola, acoplamento elástico de garras e redutor de um estágio (${MG_TEETH.pinion} : ${MG_TEETH.gear} dentes)`,
  category: 'Acionamentos',
  difficulty: 'Intermediário',
  specs: [
    { label: 'Motor', value: 'Indução trifásico, rotor de gaiola, ventilação externa (no modelo)' },
    { label: 'Acoplamento', value: 'Elástico de garras, com elemento elástico entre os cubos' },
    { label: 'Redutor', value: 'Um estágio, engrenagens cilíndricas de dentes retos, eixos paralelos' },
    { label: 'Relação do modelo', value: `${MG_TEETH.gear} ÷ ${MG_TEETH.pinion} ≈ ${MG_RATIO_TEXT} (dentes da coroa ÷ dentes do pinhão)` },
    { label: 'Potência, rotação, torque e óleo', value: 'Conforme a placa e o manual do fabricante (não informados no modelo)' }
  ],
  overviewDescription: `O motor transforma energia elétrica em giro. O acoplamento leva esse giro ao eixo de entrada do redutor, onde está o pinhão (${MG_TEETH.pinion} dentes). O pinhão engrena na coroa (${MG_TEETH.gear} dentes), presa no eixo de saída. Como a coroa tem mais dentes, ela dá menos voltas: a saída gira cerca de ${MG_RATIO_TEXT} vezes mais devagar, no sentido contrário, e — descontadas as perdas — com torque maior na mesma proporção.`,
  safetyRules: [
    'Antes de qualquer serviço: desligar, bloquear com cadeado e etiqueta e testar a partida (LOTO).',
    'Cabos do motor são desligados só por pessoa autorizada para serviços em eletricidade (NR-10).',
    'Proteção do acoplamento sai só com o conjunto bloqueado e volta antes de religar.',
    'Óleo do redutor pode estar quente: drenar frio e descartar conforme as regras ambientais.'
  ],
  parts: [
    part(
      {
        id: 'mg-base',
        name: 'Base comum',
        technicalName: 'Base metálica de motor e redutor',
        tag: 'BASE',
        category: 'structural',
        material: 'Aço (no modelo)',
        tolerance: 'Planicidade e calços: ' + MANUAL,
        simpleDefinition: 'É a chapa onde motor e redutor ficam parafusados.',
        mainFunction: 'Manter motor e redutor na posição certa um em relação ao outro.',
        location: 'Embaixo de todo o conjunto.',
        relationshipWithOthers: 'Pés do motor e do redutor apoiados nela, com calços quando preciso.',
        typicalFailureModes: 'Base torta ou solta, pé "manco" (um pé que não apoia), corrosão.',
        practicalExample: 'Pé manco: ao apertar o parafuso, a carcaça entorta e o alinhamento muda.',
        quickCheckQuestion: {
          question: 'O que é um "pé manco"?',
          options: ['Um pé que não apoia direito na base e entorta a carcaça ao ser apertado', 'Um pé quebrado', 'Um pé sem parafuso'],
          correctIndex: 0,
          explanation: 'É verificado e corrigido com calços antes do alinhamento final.'
        }
      },
      0,
      'Fica fixa',
      '#3f5f7f'
    ),
    part(
      {
        id: 'mg-motor-frame',
        name: 'Carcaça e estator do motor',
        technicalName: 'Carcaça aletada com estator bobinado, pés e caixa de ligação',
        tag: 'MOTOR',
        category: 'structural',
        material: 'Ferro fundido ou alumínio; estator de chapas de aço e bobinas de cobre (no modelo)',
        tolerance: 'Dados de placa: ' + MANUAL,
        simpleDefinition: 'É o "corpo" do motor. Dentro dele fica o estator, que cria o campo magnético.',
        mainFunction: 'Segurar o estator e as tampas, apoiar o motor na base e trocar calor pelas aletas.',
        location: 'Do lado esquerdo do conjunto.',
        relationshipWithOthers: 'As tampas fecham as pontas; o rotor gira por dentro do estator, sem encostar.',
        typicalFailureModes: 'Aquecimento (aletas sujas, sobrecarga), umidade na caixa de ligação, pés soltos.',
        practicalExample: 'Aletas cobertas de pó atrapalham o resfriamento e o motor esquenta.',
        quickCheckQuestion: {
          question: 'Quem desliga os cabos na caixa de ligação para tirar o motor?',
          options: ['Pessoa autorizada para serviços em eletricidade, com o circuito desenergizado e bloqueado', 'Qualquer mecânico', 'O operador'],
          correctIndex: 0,
          explanation: 'Serviço elétrico segue a NR-10. O mecânico trabalha depois do bloqueio feito e testado.'
        }
      },
      2,
      'Chave combinada (pés) — depois da desconexão elétrica',
      '#2f6d4f'
    ),
    part(
      {
        id: 'mg-endshield-de',
        name: 'Tampa dianteira do motor',
        technicalName: 'Tampa do lado acionado, com alojamento do rolamento',
        tag: 'TAMPA-D',
        category: 'structural',
        material: 'Ferro fundido (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É a tampa do lado do acoplamento, que segura um dos rolamentos.',
        mainFunction: 'Fechar o motor e centralizar o rotor pelo rolamento dianteiro.',
        location: 'Ponta do motor voltada para o acoplamento.',
        relationshipWithOthers: 'Encaixa na carcaça; o rolamento dianteiro fica no alojamento dela.',
        typicalFailureModes: 'Alojamento do rolamento gasto (o rolamento gira na tampa), trincas.',
        practicalExample: 'Marcas de giro no alojamento indicam que o anel externo patinou.',
        quickCheckQuestion: BEARING_CHECK
      },
      0,
      'Saca-polias ou extrator adequado (oficina de motores)',
      '#2f6d4f'
    ),
    part(
      {
        id: 'mg-endshield-nde',
        name: 'Tampa traseira do motor',
        technicalName: 'Tampa do lado do ventilador, com alojamento do rolamento',
        tag: 'TAMPA-T',
        category: 'structural',
        material: 'Ferro fundido (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É a tampa do lado do ventilador, que segura o outro rolamento.',
        mainFunction: 'Fechar o motor e apoiar o rolamento traseiro.',
        location: 'Ponta do motor do lado do ventilador.',
        relationshipWithOthers: 'Fica entre a carcaça e o ventilador.',
        typicalFailureModes: 'Alojamento gasto, vedação danificada.',
        practicalExample: 'As duas tampas são marcadas antes da desmontagem para voltar na mesma posição.',
        quickCheckQuestion: BEARING_CHECK
      },
      0,
      'Chave combinada (oficina de motores)',
      '#2f6d4f'
    ),
    part(
      {
        id: 'mg-rotor',
        name: 'Rotor com eixo',
        technicalName: 'Rotor de gaiola (barras e anéis de curto-circuito) montado no eixo',
        tag: 'ROTOR',
        category: 'transmission',
        material: 'Chapas de aço, barras e anéis de alumínio ou cobre, eixo de aço (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É a parte que gira dentro do motor, arrastada pelo campo magnético do estator.',
        mainFunction: 'Transformar o campo magnético girante em giro do eixo.',
        location: 'Dentro do estator, apoiado nos dois rolamentos.',
        relationshipWithOthers: 'A ponta do eixo leva o cubo do acoplamento; a outra ponta leva o ventilador.',
        typicalFailureModes: 'Eixo empenado ou com colo gasto, barras trincadas, rotor raspando no estator (rolamento gasto).',
        practicalExample: 'Rotor raspando no estator deixa marcas brilhantes nas chapas: costuma ser rolamento com folga.',
        quickCheckQuestion: {
          question: 'O rotor encosta no estator quando o motor está bom?',
          options: ['Não: há uma folga pequena (entreferro) entre eles', 'Sim, sempre', 'Só na partida'],
          correctIndex: 0,
          explanation: 'Se encosta, algo está errado — por exemplo, rolamento gasto deixando o rotor descer.'
        }
      },
      0,
      'Mãos e apoio adequado (oficina de motores)',
      '#6b6f75'
    ),
    part(
      {
        id: 'mg-motor-bearings',
        name: 'Rolamentos do motor',
        technicalName: 'Rolamentos dianteiro e traseiro do eixo do motor',
        tag: 'ROL-MOT',
        category: 'bearing',
        material: 'Aço para rolamentos (no modelo)',
        tolerance: 'Tipo, folga interna e lubrificação: conforme a placa e o manual do motor',
        simpleDefinition: 'São os rolamentos que deixam o rotor girar centrado.',
        mainFunction: 'Apoiar o eixo do motor com pouco atrito.',
        location: 'Um em cada tampa.',
        relationshipWithOthers: 'Anel interno no eixo, anel externo no alojamento da tampa.',
        typicalFailureModes: 'Ruído, aquecimento, falta ou excesso de graxa, contaminação.',
        practicalExample: 'Ruído no motor que muda com a carga do acoplamento pode ser desalinhamento forçando os rolamentos.',
        quickCheckQuestion: BEARING_CHECK
      },
      0,
      'Extrator de rolamentos (oficina de motores)',
      '#c8ccd2'
    ),
    part(
      {
        id: 'mg-fan',
        name: 'Ventilador do motor',
        technicalName: 'Ventilador externo de refrigeração',
        tag: 'VENT',
        category: 'transmission',
        material: 'Plástico ou alumínio (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É a hélice que sopra ar sobre as aletas para resfriar o motor.',
        mainFunction: 'Resfriar o motor enquanto ele gira.',
        location: 'Na ponta traseira do eixo, dentro da tampa defletora.',
        relationshipWithOthers: 'Gira com o eixo do motor.',
        typicalFailureModes: 'Pás quebradas, ventilador solto, entrada de ar obstruída.',
        practicalExample: 'Pá quebrada desbalanceia e faz o motor vibrar.',
        quickCheckQuestion: {
          question: 'Por que não se pode obstruir a entrada de ar da tampa defletora?',
          options: ['Porque o motor deixa de ser resfriado e esquenta', 'Porque o motor gira mais rápido', 'Não faz diferença'],
          correctIndex: 0,
          explanation: 'O ventilador puxa o ar pela tampa defletora e sopra sobre as aletas.'
        }
      },
      0,
      'Extrator adequado (oficina de motores)',
      '#2a2b2e'
    ),
    part(
      {
        id: 'mg-fan-cover',
        name: 'Tampa defletora',
        technicalName: 'Tampa defletora do ventilador (proteção)',
        tag: 'DEFLET',
        category: 'structural',
        material: 'Chapa de aço (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É a "grade" de trás do motor: guia o ar e impede acesso ao ventilador.',
        mainFunction: 'Direcionar o ar do ventilador para as aletas e proteger contra contato com o ventilador.',
        location: 'Na traseira do motor.',
        relationshipWithOthers: 'Parafusada na carcaça, por cima do ventilador.',
        typicalFailureModes: 'Amassada (raspa no ventilador), entrada de ar entupida.',
        practicalExample: 'Tampa amassada encostando no ventilador faz ruído de raspagem.',
        quickCheckQuestion: {
          question: 'A tampa defletora pode ser retirada para o motor esfriar melhor?',
          options: ['Não: ela guia o ar e protege contra o ventilador girando', 'Sim', 'Só no verão'],
          correctIndex: 0,
          explanation: 'Sem ela, o ar não é guiado para as aletas e o ventilador fica exposto.'
        }
      },
      0,
      'Chave combinada',
      '#2f6d4f'
    ),
    part(
      {
        id: 'mg-coupling-hub-motor',
        name: 'Cubo do acoplamento (motor)',
        technicalName: 'Cubo de garras montado no eixo do motor',
        tag: 'CUBO-M',
        category: 'transmission',
        material: 'Aço (no modelo)',
        tolerance: 'Folga entre cubos e desalinhamentos admissíveis: ' + MANUAL,
        simpleDefinition: 'É a metade do acoplamento que fica no eixo do motor.',
        mainFunction: 'Passar o giro do eixo do motor para o elemento elástico.',
        location: 'Na ponta do eixo do motor, dentro da proteção.',
        relationshipWithOthers: 'Preso no eixo pela chaveta; as garras encaixam no elemento elástico.',
        typicalFailureModes: 'Cubo solto no eixo, chaveta gasta, garras desgastadas.',
        practicalExample: 'Ao afastar o motor, este cubo vai junto, preso no eixo.',
        quickCheckQuestion: {
          question: 'O que impede o cubo de girar em falso no eixo?',
          options: ['A chaveta, encaixada no rasgo do eixo e do cubo', 'A graxa', 'A proteção do acoplamento'],
          correctIndex: 0,
          explanation: 'A chaveta transmite o torque entre eixo e cubo.'
        }
      },
      2,
      'Sai junto com o motor',
      '#c8ccd2'
    ),
    part(
      {
        id: 'mg-coupling',
        name: 'Acoplamento (cubo do redutor e elemento elástico)',
        technicalName: 'Cubo de garras no eixo de entrada do redutor, com elemento elástico',
        tag: 'ACOPL',
        category: 'transmission',
        material: 'Aço e elastômero (no modelo)',
        tolerance: 'Alinhamento e folga entre cubos: ' + MANUAL,
        simpleDefinition: 'É a outra metade do acoplamento, com a peça de borracha que fica entre as garras.',
        mainFunction: 'Ligar motor e redutor transmitindo o giro e tolerando pequenos desalinhamentos.',
        location: 'Na ponta do eixo de entrada do redutor.',
        relationshipWithOthers: 'O elemento elástico fica entre as garras dos dois cubos.',
        typicalFailureModes: 'Elemento elástico gasto, rachado ou virando pó (sinal de desalinhamento).',
        practicalExample: 'Pó de borracha embaixo do acoplamento: confira o alinhamento motor-redutor.',
        quickCheckQuestion: {
          question: 'O acoplamento elástico dispensa o alinhamento entre motor e redutor?',
          options: ['Não: ele tolera só pequenos desvios', 'Sim', 'Só se o elemento for novo'],
          correctIndex: 0,
          explanation: 'Desalinhamento gasta o elemento e carrega os rolamentos do motor e do redutor.'
        }
      },
      3,
      'Saca-polias',
      '#d9a21b'
    ),
    part(
      {
        id: 'mg-coupling-guard',
        name: 'Proteção do acoplamento',
        technicalName: 'Proteção fixa do acoplamento',
        tag: 'PROTEÇÃO',
        category: 'structural',
        material: 'Chapa de aço pintada (no modelo)',
        tolerance: 'Projeto conforme a apreciação de riscos e a NR-12',
        simpleDefinition: 'É a capa amarela que cobre o acoplamento girando.',
        mainFunction: 'Impedir contato com o acoplamento e os eixos em movimento.',
        location: 'Entre o motor e o redutor.',
        relationshipWithOthers: 'Parafusada na base: sai só com ferramenta.',
        typicalFailureModes: 'Retirada e não recolocada, amassada, parafusos faltando.',
        practicalExample: 'Proteção esquecida no chão depois da manutenção deixa o acoplamento exposto.',
        quickCheckQuestion: {
          question: 'Quando a proteção do acoplamento volta para o lugar?',
          options: ['Antes de liberar o conjunto para religar', 'Depois do teste em funcionamento', 'Na próxima parada'],
          correctIndex: 0,
          explanation: 'Partes girando só operam com a proteção instalada.'
        }
      },
      1,
      'Chave combinada',
      '#f2c200'
    ),
    part(
      {
        id: 'mg-gb-housing',
        name: 'Carcaça do redutor',
        technicalName: 'Carcaça com alojamentos dos rolamentos, respiro, visor de nível e dreno',
        tag: 'CARCAÇA',
        category: 'structural',
        material: 'Ferro fundido (no modelo)',
        tolerance: 'Tipo e nível de óleo: ' + MANUAL,
        simpleDefinition: 'É a "caixa" do redutor: segura os eixos e guarda o óleo.',
        mainFunction: 'Manter os eixos na distância certa, alojar os rolamentos e conter o óleo de lubrificação.',
        location: 'Do lado direito, preso na base.',
        relationshipWithOthers: 'A tampa lateral fecha o lado aberto; o eixo de entrada passa pelo retentor da parede de trás.',
        typicalFailureModes: 'Vazamento de óleo, respiro entupido (pressão interna força os retentores), trincas.',
        practicalExample: 'Respiro entupido faz o redutor "suar" óleo pelos retentores.',
        quickCheckQuestion: {
          question: 'Para que serve o respiro em cima do redutor?',
          options: ['Equalizar a pressão interna quando o óleo esquenta e esfria', 'Pôr óleo com o redutor girando', 'Resfriar as engrenagens com ar'],
          correctIndex: 0,
          explanation: 'Sem respiro, a pressão interna empurra óleo pelos retentores.'
        }
      },
      0,
      'Fica fixa',
      '#5a6470'
    ),
    part(
      {
        id: 'mg-gb-side-cover',
        name: 'Tampa lateral do redutor',
        technicalName: 'Tampa lateral com alojamentos dos rolamentos e cubo do eixo de saída',
        tag: 'TAMPA-RED',
        category: 'structural',
        material: 'Ferro fundido (no modelo)',
        tolerance: 'Vedação e aperto: ' + MANUAL,
        simpleDefinition: 'É a tampa que fecha o redutor e segura a outra ponta dos dois eixos.',
        mainFunction: 'Fechar a carcaça e apoiar os rolamentos do lado de fora.',
        location: 'Lado direito do redutor, por onde sai o eixo de saída.',
        relationshipWithOthers: 'O retentor do eixo de saída fica nela.',
        typicalFailureModes: 'Vazamento pela junta, parafusos soltos.',
        practicalExample: 'Antes de soltar a tampa, o óleo é drenado: senão ele sai todo de uma vez.',
        quickCheckQuestion: {
          question: 'O que fazer antes de soltar a tampa lateral?',
          options: ['Drenar o óleo (frio) em recipiente adequado', 'Nada', 'Pôr mais óleo'],
          correctIndex: 0,
          explanation: 'Óleo drenado frio, recolhido e descartado conforme as regras ambientais.'
        }
      },
      4,
      'Chave combinada ou soquete',
      '#5a6470'
    ),
    part(
      {
        id: 'mg-gb-seal-out',
        name: 'Retentor do eixo de saída',
        technicalName: 'Retentor radial de lábio',
        tag: 'RETENTOR',
        category: 'sealing',
        material: 'Elastômero com armação metálica (no modelo)',
        tolerance: 'Dimensões e material: ' + MANUAL,
        simpleDefinition: 'É o anel de borracha que segura o óleo onde o eixo sai da tampa.',
        mainFunction: 'Vedar o óleo e impedir entrada de sujeira pelo eixo de saída.',
        location: 'No cubo da tampa lateral, em volta do eixo de saída.',
        relationshipWithOthers: 'O lábio trabalha encostado no eixo girando.',
        typicalFailureModes: 'Lábio endurecido ou cortado, eixo com sulco no ponto de contato.',
        practicalExample: 'Retentor novo vazando: veja se o eixo não tem sulco onde o lábio encosta.',
        quickCheckQuestion: {
          question: 'Retentor retirado pode voltar para o redutor?',
          options: ['Não: retentor retirado é trocado por um novo', 'Sim, se parecer bom', 'Sim, com cola'],
          correctIndex: 0,
          explanation: 'A retirada deforma a armação e o lábio; o novo é montado com ferramenta de encaixe.'
        }
      },
      7,
      'Saca-retentor',
      '#1c1d1f'
    ),
    part(
      {
        id: 'mg-gb-input-shaft',
        name: 'Eixo de entrada com pinhão',
        technicalName: `Eixo-pinhão de entrada (${MG_TEETH.pinion} dentes)`,
        tag: 'PINHÃO',
        category: 'transmission',
        material: 'Aço (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o eixo que recebe o giro do motor. A engrenagem pequena nele é o pinhão.',
        mainFunction: 'Levar o giro do acoplamento até a coroa.',
        location: 'Na altura do eixo do motor, atravessando o redutor.',
        relationshipWithOthers: `O pinhão (${MG_TEETH.pinion} dentes) engrena na coroa (${MG_TEETH.gear} dentes).`,
        typicalFailureModes: 'Desgaste ou lascamento dos dentes, colos dos rolamentos gastos, sulco no ponto do retentor.',
        practicalExample: 'O pinhão dá mais voltas que a coroa, então os dentes dele trabalham mais vezes e costumam gastar antes.',
        quickCheckQuestion: {
          question: 'Quem gira mais rápido: o pinhão ou a coroa?',
          options: ['O pinhão, que tem menos dentes', 'A coroa', 'Os dois giram igual'],
          correctIndex: 0,
          explanation: 'Os dentes passam um pelo outro na mesma quantidade; a engrenagem com menos dentes precisa dar mais voltas.'
        }
      },
      6,
      'Mãos e apoio (puxar reto); martelo de face macia se preciso',
      '#c8ccd2'
    ),
    part(
      {
        id: 'mg-gb-output-shaft',
        name: 'Eixo de saída com coroa',
        technicalName: `Eixo de saída com coroa (${MG_TEETH.gear} dentes) e chaveta`,
        tag: 'COROA',
        category: 'transmission',
        material: 'Aço (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o eixo que entrega o giro para a máquina. A engrenagem grande nele é a coroa.',
        mainFunction: 'Receber o giro do pinhão, mais devagar e com mais torque, e entregá-lo à máquina.',
        location: 'Acima do eixo de entrada; sai pela tampa lateral.',
        relationshipWithOthers: 'A coroa engrena no pinhão; a ponta com chaveta vai para a máquina acionada.',
        typicalFailureModes: 'Desgaste dos dentes, chaveta solta, sulco no ponto do retentor.',
        practicalExample: `Com ${MG_TEETH.gear} ÷ ${MG_TEETH.pinion} ≈ ${MG_RATIO_TEXT}, a cada ${MG_RATIO_TEXT} voltas do motor a saída dá uma volta.`,
        quickCheckQuestion: {
          question: 'A saída gira no mesmo sentido da entrada neste redutor de um estágio?',
          options: ['Não: duas engrenagens externas engrenadas giram em sentidos contrários', 'Sim', 'Depende da velocidade'],
          correctIndex: 0,
          explanation: 'Um par de engrenagens externas inverte o sentido. Por isso o sentido de giro do motor é conferido antes de acoplar a máquina.'
        }
      },
      5,
      'Mãos e talha se pesado; martelo de face macia se preciso',
      '#c8ccd2'
    ),
    part(
      {
        id: 'mg-gb-bearings-in',
        name: 'Rolamentos do eixo de entrada',
        technicalName: 'Rolamentos do eixo-pinhão (2)',
        tag: 'ROL-ENT',
        category: 'bearing',
        material: 'Aço para rolamentos (no modelo)',
        tolerance: 'Tipo e ajuste: ' + MANUAL,
        simpleDefinition: 'São os rolamentos que apoiam o eixo de entrada.',
        mainFunction: 'Apoiar o eixo-pinhão e manter o engrenamento na posição certa.',
        location: 'Um na parede de trás, outro na tampa lateral.',
        relationshipWithOthers: 'Saem junto com o eixo e depois são extraídos se precisarem de troca.',
        typicalFailureModes: 'Ruído, folga, contaminação do óleo.',
        practicalExample: 'Partículas metálicas no óleo drenado pedem inspeção de rolamentos e dentes.',
        quickCheckQuestion: BEARING_CHECK
      },
      6,
      'Saem com o eixo (extrator de rolamentos depois)',
      '#c8ccd2'
    ),
    part(
      {
        id: 'mg-gb-bearings-out',
        name: 'Rolamentos do eixo de saída',
        technicalName: 'Rolamentos do eixo da coroa (2)',
        tag: 'ROL-SAÍ',
        category: 'bearing',
        material: 'Aço para rolamentos (no modelo)',
        tolerance: 'Tipo e ajuste: ' + MANUAL,
        simpleDefinition: 'São os rolamentos que apoiam o eixo de saída.',
        mainFunction: 'Apoiar o eixo da coroa, que leva o maior torque do conjunto.',
        location: 'Um na parede de trás, outro na tampa lateral, na altura do eixo de saída.',
        relationshipWithOthers: 'Saem junto com o eixo de saída.',
        typicalFailureModes: 'Ruído, folga, aquecimento.',
        practicalExample: 'Tendência de vibração subindo na saída do redutor pede inspeção destes rolamentos e da coroa.',
        quickCheckQuestion: BEARING_CHECK
      },
      5,
      'Saem com o eixo (extrator de rolamentos depois)',
      '#c8ccd2'
    )
  ],
  disassemblySteps: []
};

export const MOTOR_GEARBOX_SHORT_NAMES: Record<string, string> = {
  'mg-base': 'Base',
  'mg-motor-frame': 'Carcaça do motor',
  'mg-endshield-de': 'Tampa dianteira',
  'mg-endshield-nde': 'Tampa traseira',
  'mg-rotor': 'Rotor',
  'mg-motor-bearings': 'Rolamentos do motor',
  'mg-fan': 'Ventilador',
  'mg-fan-cover': 'Tampa defletora',
  'mg-coupling-hub-motor': 'Cubo (motor)',
  'mg-coupling': 'Acoplamento',
  'mg-coupling-guard': 'Proteção',
  'mg-gb-housing': 'Carcaça do redutor',
  'mg-gb-side-cover': 'Tampa lateral',
  'mg-gb-seal-out': 'Retentor de saída',
  'mg-gb-input-shaft': 'Eixo-pinhão',
  'mg-gb-output-shaft': 'Eixo da coroa',
  'mg-gb-bearings-in': 'Rolamentos entrada',
  'mg-gb-bearings-out': 'Rolamentos saída'
};

export const MOTOR_GEARBOX_PART_SAFETY: Record<string, string> = {
  'mg-base': 'Calços e pés apertados por igual: pé manco entorta a carcaça e muda o alinhamento.',
  'mg-motor-frame': 'Parte elétrica é com pessoa autorizada (NR-10). Motor pesado: talha e olhal de içamento.',
  'mg-endshield-de': 'Marque a posição das tampas antes de soltar. Serviço interno do motor costuma ir para oficina especializada.',
  'mg-endshield-nde': 'Marque a posição das tampas antes de soltar.',
  'mg-rotor': 'Ao puxar o rotor, apoie o peso para ele não raspar no estator e danificar as bobinas.',
  'mg-motor-bearings': 'Força só no anel com aperto. Aqueça com aquecedor indutivo, nunca com chama.',
  'mg-fan': 'Ventilador girando corta: tampa defletora sempre no lugar para operar.',
  'mg-fan-cover': 'Não opere sem a tampa defletora: ela protege contra o ventilador.',
  'mg-coupling-hub-motor': 'Confira a chaveta e o assento do cubo no eixo.',
  'mg-coupling': 'Acoplamento girando prende roupa e mãos: proteção instalada para operar.',
  'mg-coupling-guard': 'Proteção fixa sai só com ferramenta e conjunto bloqueado, e volta antes de religar (NR-12, item 12.5.4).',
  'mg-gb-housing': 'Óleo quente queima: drene frio. Descarte o óleo conforme as regras ambientais.',
  'mg-gb-side-cover': 'Drene o óleo antes de soltar. Apoie a tampa: ela segura os rolamentos.',
  'mg-gb-seal-out': 'Retentor retirado é trocado por novo, com o lábio lubrificado e ferramenta de encaixe.',
  'mg-gb-input-shaft': 'Dentes podem ter rebarbas: luvas. Proteja os dentes ao apoiar o eixo.',
  'mg-gb-output-shaft': 'Conjunto pesado: talha e cinta. Proteja a ponta com chaveta.',
  'mg-gb-bearings-in': 'Força de extração só no anel interno.',
  'mg-gb-bearings-out': 'Força de extração só no anel interno.'
};

const MOTOR_PARTS = ['mg-motor-frame', 'mg-endshield-de', 'mg-endshield-nde', 'mg-rotor', 'mg-motor-bearings', 'mg-fan', 'mg-fan-cover', 'mg-coupling-hub-motor'];
const all = (ids: string[], path: Vec3[]) => Object.fromEntries(ids.map((id) => [id, path]));

export const MOTOR_GEARBOX_LAB: MachineLabConfig = {
  machineId: MOTOR_GEARBOX_ID,
  purpose: `É o conjunto que gira a maioria das máquinas: um motor elétrico, um acoplamento e um redutor. O motor gira rápido e com pouca força; o redutor troca rotação por torque. Neste modelo o pinhão tem ${MG_TEETH.pinion} dentes e a coroa ${MG_TEETH.gear}: a saída gira cerca de ${MG_RATIO_TEXT} vezes mais devagar que o motor, no sentido contrário.`,
  whereUsed: 'Transportadores, misturadores, elevadores de canecas, bombas de deslocamento positivo, pontes rolantes e praticamente toda máquina que precisa de força em baixa rotação.',
  source: 'procedural-motor-gearbox',
  floorY: -0.95,
  cutawayParts: ['mg-motor-frame', 'mg-endshield-de', 'mg-endshield-nde', 'mg-fan-cover', 'mg-coupling-guard', 'mg-gb-housing', 'mg-gb-side-cover'],
  operating: {
    label: 'Ver girando',
    observe: `Use a vista em corte. Rotor, ventilador, acoplamento e pinhão giram juntos. A coroa gira no sentido contrário e mais devagar: ${MG_TEETH.gear} ÷ ${MG_TEETH.pinion} ≈ ${MG_RATIO_TEXT}. Essa relação vem do número de dentes do modelo; a velocidade da animação é didática e não representa a rotação real de um motor.`
  },
  preWorkSafety: [
    'Desligar, bloquear com cadeado e etiqueta e testar a partida (LOTO). Conferir também se a máquina acionada não pode girar o conjunto (carga, gravidade).',
    'A desconexão dos cabos do motor é serviço elétrico: só pessoa autorizada (NR-10).',
    'Esperar o óleo esfriar antes de drenar; ter recipiente e material de contenção.',
    'Motor e eixos são pesados: talha, cinta e olhal com capacidade conhecida, e ninguém embaixo da carga.'
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail: `Modelo 3D construído no próprio projeto (licença CC0), sem fabricante nem projeto real. A relação de transmissão (${MG_TEETH.gear} ÷ ${MG_TEETH.pinion}) é a do próprio modelo e foi escolhida só para o ensino. Simplificações: engrenagens de dentes retos com perfil aproximado (muitos redutores usam dentes helicoidais e mais de um estágio), um único estágio de redução, rolamentos representados como anéis, juntas, calços, anéis elásticos e bobinas internas simplificados. Potência, rotação, torque, óleo, folgas e apertos seguem sempre a placa e o manual do fabricante.`
  },
  disassembly: [
    {
      partId: 'mg-coupling-guard',
      title: 'Retirar a proteção do acoplamento',
      instruction: 'Com o conjunto desligado, bloqueado e com a partida testada, solte os parafusos e retire a proteção do acoplamento.',
      tool: 'Chave combinada',
      toolWhy: 'Proteção fixa sai só com ferramenta — de propósito: não se abre sem parar e bloquear.',
      safety: 'Nenhuma proteção sai com o conjunto energizado. Ela volta antes de religar.',
      observe: 'Pó de borracha embaixo do acoplamento é sinal de elemento elástico gasto (muitas vezes por desalinhamento).',
      toolDistractors: [{ tool: 'Martelo para soltar a chapa', why: 'Amassa a proteção e deixa frestas.' }],
      moves: { 'mg-coupling-guard': [[0, 1.4, 0], [0, 1.4, -2.2]] }
    },
    {
      partId: 'mg-motor-frame',
      title: 'Afastar o motor',
      instruction:
        'Depois que a pessoa autorizada desligou os cabos, marque a posição dos pés e dos calços, solte os parafusos dos pés e afaste o motor para trás. O cubo do lado do motor sai junto, preso no eixo.',
      tool: 'Chave combinada + talha se for pesado',
      toolWhy: 'Os parafusos dos pés costumam estar bem apertados; a talha segura o peso para o motor sair reto.',
      safety: 'Guarde os calços de cada pé separados e identificados.',
      observe: 'Elemento elástico entre os cubos: rachado, deformado ou faltando pedaços pede troca e conferência do alinhamento.',
      toolDistractors: [{ tool: 'Alavanca entre motor e redutor', why: 'Força os eixos e os rolamentos dos dois equipamentos.' }],
      moves: all(MOTOR_PARTS, [[-0.9, 0, 0]])
    },
    {
      partId: 'mg-coupling',
      title: 'Retirar o cubo do acoplamento do eixo de entrada',
      instruction: 'Retire o elemento elástico e extraia o cubo do lado do redutor com o saca-polias, puxando reto.',
      tool: 'Saca-polias',
      toolWhy: 'O cubo tem ajuste no eixo: o saca-polias puxa reto, sem pancadas que passariam para os rolamentos.',
      observe: 'Guarde a chaveta; veja se o rasgo do eixo não está alargado.',
      toolDistractors: [{ tool: 'Martelo de aço no cubo', why: 'A pancada passa para os rolamentos e pode marcar as pistas.' }],
      moves: { 'mg-coupling': [[0, 1.2, 0], [0, 1.2, 1.6]] }
    },
    {
      partId: 'mg-gb-side-cover',
      title: 'Drenar o óleo e retirar a tampa lateral',
      instruction: 'Com o óleo frio, drene pelo bujão inferior em recipiente adequado. Depois solte os parafusos da tampa lateral e retire-a deslizando sobre o eixo de saída.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'Muitos parafusos iguais: soquete agiliza e não arredonda as cabeças.',
      safety: 'Óleo quente queima. Recolha o óleo e descarte conforme as regras ambientais.',
      observe: 'Óleo escuro, com cheiro de queimado, água (aspecto leitoso) ou partículas metálicas dizem muito sobre o estado interno.',
      toolDistractors: [{ tool: 'Chave de fenda entre tampa e carcaça', why: 'Marca as faces de vedação: vai vazar depois da montagem.' }],
      moves: all(['mg-gb-side-cover', 'mg-gb-seal-out'], [[1.05, 0, 0], [1.05, 0, -2.6]])
    },
    {
      partId: 'mg-gb-output-shaft',
      title: 'Retirar o eixo de saída com a coroa',
      instruction: 'Puxe o eixo de saída para fora da carcaça, reto, com a coroa e os rolamentos. Se for pesado, use talha e cinta.',
      tool: 'Mãos e talha; martelo de face macia se preciso',
      toolWhy: 'O conjunto sai deslizando dos alojamentos; o martelo de face macia não marca o eixo.',
      observe: 'Veja os dentes da coroa: marcas de contato só numa ponta do dente indicam desalinhamento; lascas ou pites pedem análise.',
      toolDistractors: [{ tool: 'Martelo de aço na ponta do eixo', why: 'Amassa a ponta e a chaveta e pode danificar os rolamentos.' }],
      moves: all(['mg-gb-output-shaft', 'mg-gb-bearings-out'], [[1.9, 0, 0], [1.9, -0.4, 1.6]])
    },
    {
      partId: 'mg-gb-input-shaft',
      title: 'Retirar o eixo de entrada com o pinhão',
      instruction: 'Com a coroa fora, puxe o eixo-pinhão pelo lado da tampa, reto, para não forçar o retentor da parede de trás.',
      tool: 'Mãos limpas; martelo de face macia se preciso',
      toolWhy: 'O eixo sai deslizando; pancadas de aço marcam os colos e os dentes.',
      observe: 'Compare o desgaste dos dentes do pinhão com os da coroa e veja o colo onde trabalha o retentor de entrada.',
      toolDistractors: [{ tool: 'Saca-polias no pinhão', why: 'Não há interferência para vencer aqui: o eixo sai deslizando.' }],
      moves: all(['mg-gb-input-shaft', 'mg-gb-bearings-in'], [[1.9, 0, 0], [1.9, 0, -1.0]])
    },
    {
      partId: 'mg-gb-seal-out',
      title: 'Retirar o retentor do eixo de saída',
      instruction: 'Com a tampa lateral na bancada, retire o retentor com o saca-retentor, sem riscar o alojamento. Ele não volta: na montagem vai um novo.',
      tool: 'Saca-retentor',
      toolWhy: 'Engancha o retentor sem riscar o alojamento, que é onde ele veda por fora.',
      safety: 'Faça força para longe do corpo: a ferramenta pode escapar.',
      observe: 'Lábio endurecido ou cortado explica vazamento pelo eixo de saída.',
      toolDistractors: [{ tool: 'Chave de fenda', why: 'Escapa e risca o alojamento: o retentor novo vazará por fora.' }],
      moves: { 'mg-gb-seal-out': [[1.05, 0, -2.6], [1.7, 0, -2.6]] }
    }
  ],
  explode: {
    'mg-base': [0, 0, 0],
    'mg-gb-housing': [0, 0, 0],
    'mg-coupling-guard': [0, 1.6, 0],
    'mg-coupling': [0, 0, 0],
    'mg-coupling-hub-motor': [-0.6, 0, 0],
    'mg-motor-frame': [-1.6, 0, 0],
    'mg-endshield-de': [-0.7, 0, 0],
    'mg-rotor': [-1.6, 1.6, 0],
    'mg-motor-bearings': [-1.6, 1.6, 0],
    'mg-endshield-nde': [-2.6, 0, 0],
    'mg-fan': [-3.2, 0, 0],
    'mg-fan-cover': [-3.8, 0, 0],
    'mg-gb-side-cover': [2.8, 0, 0],
    'mg-gb-seal-out': [3.2, 0, 0],
    'mg-gb-output-shaft': [1.6, 0, 0],
    'mg-gb-bearings-out': [1.9, 0, 0],
    'mg-gb-input-shaft': [1.6, 0, 0],
    'mg-gb-bearings-in': [1.7, 0, 0]
  },
  identify: [
    { partId: 'mg-gb-input-shaft', prompt: 'Clique no pinhão — a engrenagem pequena, no eixo que vem do motor.', hint: 'Fica dentro do redutor, na mesma altura do eixo do motor. Use a vista em corte.', needsXray: true },
    { partId: 'mg-gb-output-shaft', prompt: 'Clique na coroa — a engrenagem grande, no eixo de saída.', hint: 'Fica dentro do redutor, acima do pinhão.', needsXray: true },
    { partId: 'mg-coupling', prompt: 'Clique no acoplamento — a peça que liga o motor ao redutor (o cubo com o elemento elástico).', hint: 'Fica embaixo da proteção amarela, entre o motor e o redutor.', needsXray: true },
    { partId: 'mg-motor-bearings', prompt: 'Clique nos rolamentos do motor — os anéis que apoiam o eixo do rotor nas tampas.', hint: 'Ficam nas duas tampas do motor, em volta do eixo.', needsXray: true }
  ],
  checkQuestionIds: ['ind-15', 'ind-16', 'ind-17', 'ind-18'],
  lessonId: 'lesson-gearbox-fundamentals'
};
