import type { MachineData, MechanicalPart3D } from '../mechanicalMachines';
import type { MachineLabConfig } from '../labMission';

/**
 * Transportador de correia plana com motorredutor (laboratório 3D, seção Indústria na prática).
 * A desmontagem é a de uma intervenção típica de manutenção: retirar o acionamento e trocar um rolo de carga.
 * Sem valores de tensão da correia, velocidade, torque ou alinhamento: dependem do projeto e do fabricante.
 * Modelo: src/components/lab/models/beltConveyorModel.ts
 */

export const BELT_CONVEYOR_ID = 'belt-conveyor';

const MANUAL = 'Conforme o projeto do transportador e o manual do fabricante (não informado neste modelo educacional)';

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

export const BELT_CONVEYOR_MACHINE: MachineData = {
  id: BELT_CONVEYOR_ID,
  name: 'Transportador de correia (modelo educacional)',
  subtitle: 'Correia plana, polia de acionamento com revestimento, rolos de carga e de retorno, tensor de parafuso',
  category: 'Movimentação de materiais',
  difficulty: 'Iniciante',
  specs: [
    { label: 'Acionamento', value: 'Motor elétrico flangeado em redutor de eixos paralelos, acoplamento elástico no eixo da polia' },
    { label: 'Polias', value: 'Polia de acionamento (cabeça) revestida e polia de retorno (cauda) no lado do tensor' },
    { label: 'Apoio da correia', value: 'Rolos de carga planos no lado de cima e rolos de retorno embaixo' },
    { label: 'Tensionamento', value: 'Tensor de parafuso nos mancais da polia de retorno' },
    { label: 'Velocidade, tensão, potência e capacidade', value: 'Conforme o projeto (não informados no modelo)' }
  ],
  overviewDescription:
    'O motor gira rápido e com pouca força; o redutor diminui a rotação e aumenta o torque; o acoplamento passa esse giro para o eixo da polia de acionamento. A polia arrasta a correia pelo atrito — por isso ela tem revestimento e por isso a correia precisa de tensão. A correia volta por baixo até a polia de retorno, onde fica o tensor. Os rolos só apoiam a correia: eles giram porque a correia passa sobre eles.',
  safetyRules: [
    'Transportador só recebe manutenção parado, com todas as energias isoladas e bloqueadas (LOTO) e partida testada.',
    'Proteções fixas só saem com a máquina bloqueada e voltam antes de religar.',
    'Correia tensionada guarda energia: alivie o tensor de forma controlada antes de mexer nos rolos ou na correia.',
    'Nunca subir, andar ou se apoiar sobre a correia, nem limpar rolos e polias com o transportador em movimento.'
  ],
  parts: [
    part(
      {
        id: 'cv-frame',
        name: 'Estrutura',
        technicalName: 'Longarinas em perfil U, pernas, cavaletes dos rolos e pedestal do acionamento',
        tag: 'ESTR',
        category: 'structural',
        material: 'Aço (no modelo)',
        tolerance: 'Esquadro e nivelamento: ' + MANUAL,
        simpleDefinition: 'É o "esqueleto" do transportador: segura tudo no lugar.',
        mainFunction: 'Apoiar polias, rolos e acionamento, mantendo tudo alinhado e no esquadro.',
        location: 'Ao longo de todo o transportador.',
        relationshipWithOthers: 'Os mancais das polias e os cavaletes dos rolos são presos nela.',
        typicalFailureModes: 'Estrutura torta ou fora de esquadro (a correia desalinha), parafusos soltos, corrosão.',
        practicalExample: 'Uma perna que afundou no piso entorta a estrutura e a correia passa a correr para um lado.',
        quickCheckQuestion: {
          question: 'Estrutura fora de esquadro costuma causar o quê?',
          options: ['Desalinhamento da correia', 'Mais velocidade', 'Menos ruído'],
          correctIndex: 0,
          explanation: 'Polias e rolos tortos em relação à linha da correia empurram a correia para um lado.'
        }
      },
      0,
      'Fica fixa',
      '#3f5f7f'
    ),
    part(
      {
        id: 'cv-belt',
        name: 'Correia transportadora',
        technicalName: 'Correia plana sem fim (emendada)',
        tag: 'CORREIA',
        category: 'transmission',
        material: 'Carcaça têxtil com coberturas de borracha (no modelo)',
        tolerance: 'Tipo, emenda e tensão: ' + MANUAL,
        simpleDefinition: 'É a "esteira" que leva o material por cima e volta vazia por baixo.',
        mainFunction: 'Carregar o material da cauda até a cabeça do transportador.',
        location: 'Em volta das duas polias, apoiada nos rolos.',
        relationshipWithOthers: 'É arrastada pela polia de acionamento; o tensor mantém a tensão; os rolos apoiam.',
        typicalFailureModes: 'Desalinhamento (correia raspando na estrutura), bordas desfiadas, emenda abrindo, cortes na cobertura.',
        practicalExample: 'Borda da correia desfiada de um lado só: ela está correndo desalinhada e raspando na estrutura.',
        quickCheckQuestion: {
          question: 'Por que a correia precisa estar tensionada?',
          options: ['Para a polia conseguir arrastá-la pelo atrito, sem patinar', 'Para ficar bonita', 'Para os rolos girarem mais rápido'],
          correctIndex: 0,
          explanation: 'Sem tensão suficiente, a polia patina sob a correia. Tensão demais carrega mancais, eixos e emenda.'
        }
      },
      0,
      'Fica no lugar nesta intervenção',
      '#1f2124'
    ),
    part(
      {
        id: 'cv-head-pulley',
        name: 'Polia de acionamento',
        technicalName: 'Polia motriz (cabeça) com revestimento de borracha',
        tag: 'POL-ACION',
        category: 'transmission',
        material: 'Aço com revestimento de borracha (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o tambor que recebe o giro do motor e puxa a correia.',
        mainFunction: 'Transmitir o giro para a correia pelo atrito. O revestimento aumenta a aderência.',
        location: 'Na cabeça do transportador, ponta onde fica o acionamento.',
        relationshipWithOthers: 'Eixo apoiado em dois mancais; ligado ao redutor pelo acoplamento.',
        typicalFailureModes: 'Revestimento gasto ou descolado (correia patina), mancais com folga, material grudado no tambor.',
        practicalExample: 'Correia patinando com carga: verifique tensão e o revestimento da polia de acionamento.',
        quickCheckQuestion: {
          question: 'Para que serve o revestimento de borracha da polia de acionamento?',
          options: ['Aumentar a aderência entre polia e correia', 'Reduzir o peso da polia', 'Vedar o mancal'],
          correctIndex: 0,
          explanation: 'Mais atrito = a polia transmite o giro sem patinar.'
        }
      },
      0,
      'Fica no lugar nesta intervenção',
      '#c8ccd2'
    ),
    part(
      {
        id: 'cv-tail-pulley',
        name: 'Polia de retorno',
        technicalName: 'Polia movida (cauda), montada nos mancais do tensor',
        tag: 'POL-RET',
        category: 'transmission',
        material: 'Aço (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o tambor da outra ponta, onde a correia faz a volta.',
        mainFunction: 'Fazer a correia voltar e, com o tensor, dar tensão à correia.',
        location: 'Na cauda do transportador, onde o material é carregado.',
        relationshipWithOthers: 'Seus mancais deslizam no tensor de parafuso.',
        typicalFailureModes: 'Material acumulado entre correia e polia, polia fora de esquadro (desalinha a correia).',
        practicalExample: 'Ajuste desigual dos dois lados do tensor deixa a polia torta e a correia corre para um lado.',
        quickCheckQuestion: {
          question: 'O que acontece se o tensor for ajustado mais de um lado do que do outro?',
          options: ['A polia fica fora de esquadro e a correia tende a correr para um lado', 'Nada', 'A correia para de girar'],
          correctIndex: 0,
          explanation: 'A correia tende a se deslocar quando polias ou rolos não estão perpendiculares à sua linha de centro.'
        }
      },
      0,
      'Fica no lugar nesta intervenção',
      '#c8ccd2'
    ),
    part(
      {
        id: 'cv-carry-idlers',
        name: 'Rolos de carga',
        technicalName: 'Rolos planos do lado carregado',
        tag: 'ROLOS-C',
        category: 'bearing',
        material: 'Tubo de aço com rolamentos internos (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'São os rolos de cima, que seguram a correia e o peso do material.',
        mainFunction: 'Apoiar a correia carregada com pouco atrito.',
        location: 'Embaixo da correia de cima, ao longo da estrutura.',
        relationshipWithOthers: 'Encaixados nos cavaletes da estrutura; giram arrastados pela correia.',
        typicalFailureModes: 'Rolo travado (a correia esfrega e gasta o rolo e a cobertura), rolamento interno ruidoso, rolo torto.',
        practicalExample: 'Rolo travado fica com uma face lisa e brilhante e pode esquentar com o atrito.',
        quickCheckQuestion: {
          question: 'Um rolo de carga travado pode causar o quê?',
          options: ['Desgaste da correia e do rolo e aquecimento por atrito', 'Nada, o rolo é só um apoio', 'Aumento da velocidade'],
          correctIndex: 0,
          explanation: 'A correia passa a esfregar no rolo parado: gasta os dois e gera calor.'
        }
      },
      0,
      'Fica no lugar nesta intervenção',
      '#a7abb1'
    ),
    part(
      {
        id: 'cv-roller-inspect',
        name: 'Rolo de carga em inspeção',
        technicalName: 'Rolo de carga indicado na ordem de serviço para troca',
        tag: 'ROLO-OS',
        category: 'bearing',
        material: 'Tubo de aço com rolamentos internos (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o rolo que a inspeção apontou para troca.',
        mainFunction: 'Igual aos outros rolos de carga: apoiar a correia.',
        location: 'Entre os rolos de carga, perto da cabeça.',
        relationshipWithOthers: 'Encaixado nos cavaletes por rasgos nas pontas do eixo.',
        typicalFailureModes: 'Rolamento interno travado ou ruidoso, tubo gasto.',
        practicalExample: 'Ruído de rolamento que "anda" junto quando você caminha ao lado do transportador ajuda a localizar o rolo — sempre do lado de fora das proteções.',
        quickCheckQuestion: {
          question: 'Como trocar um rolo de carga com segurança?',
          options: ['Com o transportador parado e bloqueado e a tensão da correia aliviada', 'Com a correia andando bem devagar', 'Puxando o rolo com a correia em movimento'],
          correctIndex: 0,
          explanation: 'Nada se troca em movimento. Bloqueio, alívio de tensão e só depois a troca.'
        }
      },
      6,
      'Mãos (com luvas) e alavanca adequada para erguer a correia frouxa',
      '#a7abb1'
    ),
    part(
      {
        id: 'cv-return-idlers',
        name: 'Rolos de retorno',
        technicalName: 'Rolos planos do lado de retorno (de baixo)',
        tag: 'ROLOS-R',
        category: 'bearing',
        material: 'Tubo de aço com rolamentos internos (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'São os rolos de baixo, que seguram a correia vazia na volta.',
        mainFunction: 'Apoiar a correia de retorno e evitar que ela fique pendurada.',
        location: 'Embaixo da estrutura, em intervalos maiores que os de carga.',
        relationshipWithOthers: 'Pendurados nos cavaletes da estrutura.',
        typicalFailureModes: 'Material grudado no rolo (desalinha a correia), rolo travado.',
        practicalExample: 'Material grudado na correia de retorno se acumula nos rolos de baixo e empurra a correia para o lado.',
        quickCheckQuestion: {
          question: 'Material grudado nos rolos de retorno pode causar o quê?',
          options: ['Desalinhamento da correia', 'Mais aderência na polia de acionamento', 'Nada'],
          correctIndex: 0,
          explanation: 'O rolo fica "gordo" de um lado e empurra a correia para o outro.'
        }
      },
      0,
      'Fica no lugar nesta intervenção',
      '#a7abb1'
    ),
    part(
      {
        id: 'cv-bearings',
        name: 'Mancais das polias',
        technicalName: 'Mancais de pedestal com rolamento (4: dois por polia)',
        tag: 'MANCAIS',
        category: 'bearing',
        material: 'Ferro fundido com rolamento (no modelo)',
        tolerance: 'Tipo de rolamento, lubrificante e intervalo: ' + MANUAL,
        simpleDefinition: 'São as caixas que seguram os eixos das polias e deixam elas girarem.',
        mainFunction: 'Apoiar os eixos das polias com pouco atrito.',
        location: 'Dois na cabeça e dois na cauda, fora das longarinas.',
        relationshipWithOthers: 'Os da cauda ficam no tensor e podem deslizar para ajustar a tensão.',
        typicalFailureModes: 'Falta de graxa, contaminação, aquecimento, ruído.',
        practicalExample: 'Mancal da cabeça mais quente que os outros: verifique lubrificação, tensão e alinhamento do acionamento.',
        quickCheckQuestion: {
          question: 'Como verificar a temperatura de um mancal com o transportador funcionando?',
          options: ['De fora das proteções, com termômetro sem contato ou instrumento de monitoramento', 'Pondo a mão no mancal', 'Abrindo a proteção para ver melhor'],
          correctIndex: 0,
          explanation: 'Inspeção em funcionamento só de fora das proteções, sem contato com partes em movimento.'
        }
      },
      0,
      'Fica no lugar nesta intervenção',
      '#35587a'
    ),
    part(
      {
        id: 'cv-take-up',
        name: 'Tensor de parafuso',
        technicalName: 'Esticador por fuso nos mancais da polia de retorno',
        tag: 'TENSOR',
        category: 'fastener',
        material: 'Aço (no modelo)',
        tolerance: 'Tensão da correia: ' + MANUAL,
        simpleDefinition: 'São os fusos que empurram a polia de retorno para esticar a correia.',
        mainFunction: 'Dar a tensão certa à correia e permitir alinhar a polia de retorno.',
        location: 'Na cauda, um de cada lado.',
        relationshipWithOthers: 'Empurra os mancais da polia de retorno.',
        typicalFailureModes: 'Ajuste desigual (correia desalinha), fusos travados por sujeira, tensão demais ou de menos.',
        practicalExample: 'Depois de trocar um rolo, a correia é tensionada de novo igualmente dos dois lados e o alinhamento é conferido.',
        quickCheckQuestion: {
          question: 'Por que aliviar o tensor antes de trocar um rolo de carga?',
          options: ['A correia tensionada guarda energia e prende o rolo; aliviando, a troca fica controlada', 'Para a correia esfriar', 'Não precisa aliviar'],
          correctIndex: 0,
          explanation: 'Energia armazenada também se controla antes da intervenção.'
        }
      },
      5,
      'Chave combinada',
      '#a7abb1'
    ),
    part(
      {
        id: 'cv-coupling',
        name: 'Acoplamento elástico',
        technicalName: 'Acoplamento de garras com elemento elástico (eixo da polia ↔ saída do redutor)',
        tag: 'ACOPL',
        category: 'transmission',
        material: 'Aço e elastômero (no modelo)',
        tolerance: 'Alinhamento e folga entre cubos: ' + MANUAL,
        simpleDefinition: 'É a peça que liga o eixo do redutor ao eixo da polia.',
        mainFunction: 'Transmitir o giro do redutor para a polia, tolerando pequenos desalinhamentos e amortecendo choques.',
        location: 'Entre o redutor e a ponta do eixo da polia de acionamento.',
        relationshipWithOthers: 'Um cubo no eixo do redutor, outro no eixo da polia, elemento elástico no meio.',
        typicalFailureModes: 'Elemento elástico gasto (pó de borracha), desalinhamento, cubo solto.',
        practicalExample: 'Depois de remontar o acionamento, o alinhamento entre redutor e polia é conferido antes de recolocar a proteção.',
        quickCheckQuestion: {
          question: 'O acoplamento elástico dispensa alinhar redutor e polia?',
          options: ['Não: ele tolera só pequenos desvios', 'Sim, sempre', 'Só se for novo'],
          correctIndex: 0,
          explanation: 'O desalinhamento gasta o elemento elástico e carrega rolamentos e mancais.'
        }
      },
      4,
      'Saca-polias',
      '#c8ccd2'
    ),
    part(
      {
        id: 'cv-gearbox',
        name: 'Redutor',
        technicalName: 'Redutor de engrenagens de eixos paralelos (saída coaxial com a polia)',
        tag: 'REDUTOR',
        category: 'transmission',
        material: 'Carcaça de ferro fundido, engrenagens de aço (no modelo)',
        tolerance: 'Relação de redução, óleo e nível: ' + MANUAL,
        simpleDefinition: 'É a caixa de engrenagens que diminui a rotação do motor e aumenta a força.',
        mainFunction: 'Reduzir a rotação e multiplicar o torque para a polia conseguir puxar a correia carregada.',
        location: 'Entre o motor e o acoplamento, apoiado no pedestal.',
        relationshipWithOthers: 'Recebe o motor pelo flange; entrega o giro pelo acoplamento.',
        typicalFailureModes: 'Nível de óleo baixo, vazamento pelos retentores, aquecimento, ruído de engrenagem ou rolamento.',
        practicalExample: 'Mancha de óleo embaixo do redutor: confira o retentor de saída e o nível antes de religar.',
        quickCheckQuestion: {
          question: 'O que o redutor faz com a rotação e o torque?',
          options: ['Diminui a rotação e aumenta o torque', 'Aumenta a rotação e o torque', 'Não muda nada, só protege o motor'],
          correctIndex: 0,
          explanation: 'Fora as perdas, a potência que entra sai: menos rotação na saída significa mais torque.'
        }
      },
      3,
      'Chave combinada ou soquete + talha para o içamento',
      '#5a6470'
    ),
    part(
      {
        id: 'cv-motor',
        name: 'Motor elétrico',
        technicalName: 'Motor elétrico de indução, flangeado no redutor',
        tag: 'MOTOR',
        category: 'transmission',
        material: 'Carcaça aletada de ferro fundido ou alumínio (no modelo)',
        tolerance: 'Dados de placa: ' + MANUAL,
        simpleDefinition: 'É quem gera o giro. Fica preso no redutor pelo flange.',
        mainFunction: 'Converter energia elétrica em giro no eixo.',
        location: 'Na ponta do acionamento, preso no redutor.',
        relationshipWithOthers: 'Seu eixo entra no redutor; a ligação elétrica fica na caixa de ligação em cima.',
        typicalFailureModes: 'Aquecimento (aletas sujas, sobrecarga), ruído de rolamento, umidade na caixa de ligação.',
        practicalExample: 'Aletas cobertas de pó atrapalham o resfriamento e o motor esquenta.',
        quickCheckQuestion: {
          question: 'Quem pode desligar os cabos do motor na caixa de ligação?',
          options: ['Profissional autorizado para serviços em eletricidade, com o circuito desenergizado e bloqueado', 'Qualquer mecânico', 'Ninguém, nunca se desliga'],
          correctIndex: 0,
          explanation: 'Serviço elétrico segue a NR-10 e é feito por pessoa autorizada. O mecânico trabalha depois do bloqueio.'
        }
      },
      2,
      'Chave combinada + talha (o motor é pesado)',
      '#2f6d4f'
    ),
    part(
      {
        id: 'cv-guards',
        name: 'Proteções fixas',
        technicalName: 'Proteções fixas das polias (pontos de agarramento) e do acoplamento',
        tag: 'PROTEÇÃO',
        category: 'structural',
        material: 'Chapa de aço pintada (no modelo)',
        tolerance: 'Projeto das proteções conforme a apreciação de riscos e a NR-12',
        simpleDefinition: 'São as chapas amarelas que impedem a mão de chegar onde a correia entra na polia e no acoplamento.',
        mainFunction: 'Impedir o acesso às zonas de perigo: pontos onde a correia entra na polia (agarramento) e partes girando.',
        location: 'Nas laterais da cabeça e da cauda e em volta do acoplamento.',
        relationshipWithOthers: 'Presas na estrutura com parafusos: saem só com ferramenta e com o transportador bloqueado.',
        typicalFailureModes: 'Proteção retirada e não recolocada, amassada, com fixação faltando.',
        practicalExample: 'Uma proteção esquecida no chão depois da manutenção deixa o ponto de agarramento aberto.',
        quickCheckQuestion: {
          question: 'Quando a proteção fixa volta para o lugar?',
          options: ['Antes de liberar o transportador para religar', 'Depois de testar o transportador funcionando', 'Só na próxima parada'],
          correctIndex: 0,
          explanation: 'O transportador só volta a operar com as proteções instaladas e o local liberado.'
        }
      },
      1,
      'Chave combinada',
      '#f2c200'
    )
  ],
  disassemblySteps: []
};

export const BELT_CONVEYOR_SHORT_NAMES: Record<string, string> = {
  'cv-frame': 'Estrutura',
  'cv-belt': 'Correia',
  'cv-head-pulley': 'Polia de acionamento',
  'cv-tail-pulley': 'Polia de retorno',
  'cv-carry-idlers': 'Rolos de carga',
  'cv-roller-inspect': 'Rolo em inspeção',
  'cv-return-idlers': 'Rolos de retorno',
  'cv-bearings': 'Mancais das polias',
  'cv-take-up': 'Tensor',
  'cv-coupling': 'Acoplamento',
  'cv-gearbox': 'Redutor',
  'cv-motor': 'Motor',
  'cv-guards': 'Proteções fixas'
};

export const BELT_CONVEYOR_PART_SAFETY: Record<string, string> = {
  'cv-frame': 'Nunca subir na estrutura nem andar sobre a correia (NR-12, item 12.8.6).',
  'cv-belt': 'Nunca tocar, limpar ou ajustar a correia em movimento. Correia tensionada guarda energia.',
  'cv-head-pulley': 'O ponto onde a correia entra na polia agarra e puxa: só com proteção instalada (NR-12, item 12.8.1).',
  'cv-tail-pulley': 'O ponto onde a correia entra na polia agarra e puxa: só com proteção instalada (NR-12, item 12.8.1).',
  'cv-carry-idlers': 'Pontos entre correia e rolo também agarram. Inspeção em operação só de fora, sem contato.',
  'cv-roller-inspect': 'Troca só com o transportador bloqueado e a tensão aliviada. Use luvas: bordas de tubo cortam.',
  'cv-return-idlers': 'Rolos de baixo ficam em altura de mão e de pé: atenção ao circular perto deles.',
  'cv-bearings': 'Relubrificação com a máquina em movimento só se o projeto previr ponto remoto fora da zona de perigo.',
  'cv-take-up': 'Alivie a tensão aos poucos e dos dois lados; anote a posição para retensionar igual.',
  'cv-coupling': 'Acoplamento girando prende roupa e mãos: proteção sempre instalada para operar.',
  'cv-gearbox': 'Redutor pesado: talha e cinta com capacidade adequada; óleo quente queima.',
  'cv-motor': 'A parte elétrica é com pessoa autorizada (NR-10). Mecânico trabalha só depois do bloqueio testado.',
  'cv-guards': 'Proteção fixa sai só com ferramenta e máquina bloqueada, e volta antes de religar (NR-12, item 12.5.4).'
};

export const BELT_CONVEYOR_LAB: MachineLabConfig = {
  machineId: BELT_CONVEYOR_ID,
  purpose:
    'O transportador de correia leva material de um ponto a outro da fábrica sem parar. Um motor com redutor gira a polia de acionamento, que puxa a correia pelo atrito. Os rolos apoiam a correia e o tensor mantém a tensão. É um equipamento simples de entender e perigoso de tocar: os pontos onde a correia entra nas polias agarram e puxam.',
  whereUsed: 'Mineração, alimentos, embalagem, logística, siderurgia, cimento e qualquer linha de produção com fluxo contínuo de material.',
  source: 'procedural-conveyor',
  floorY: -1.5,
  operating: {
    label: 'Ver em operação',
    observe:
      'Siga o caminho do giro: motor → redutor (diminui a rotação e aumenta o torque) → acoplamento → polia de acionamento → correia. A correia de cima anda para a polia de acionamento; a de baixo volta. Os rolos giram porque a correia passa sobre eles. Na vida real, tudo isso é observado de fora das proteções. Velocidade didática: não representa a real.'
  },
  preWorkSafety: [
    'Parar o transportador, isolar e bloquear todas as fontes de energia com cadeado e etiqueta e testar a partida (NR-12, item 12.11.3).',
    'Conferir que não há material ou carga que possa mover a correia por gravidade e aliviar a tensão de forma controlada antes de mexer nos rolos.',
    'Retirar proteções fixas só depois do bloqueio — e recolocá-las antes de liberar o transportador.',
    'Desligar cabos do motor é serviço elétrico: só pessoa autorizada (NR-10).'
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D construído no próprio projeto (licença CC0). Representa um transportador curto de correia plana, sem fabricante nem projeto real. Foram simplificados: os rolos de carga são planos (muitos transportadores usam rolos em ângulo, "em calha"), não há raspadores, chutes, guias laterais, chaves de desalinhamento nem cordão de emergência, a correia não se deforma ao ser erguida e as proteções foram reduzidas a chapas. Velocidade, tensão, potência e alinhamento seguem sempre o projeto e o fabricante.'
  },
  disassembly: [
    {
      partId: 'cv-guards',
      title: 'Retirar as proteções fixas',
      instruction:
        'Com o transportador parado, todas as energias bloqueadas e a partida testada, solte os parafusos e retire as proteções das polias e do acoplamento.',
      tool: 'Chave combinada',
      toolWhy: 'Proteção fixa só sai com ferramenta — de propósito: não é para abrir sem parar e bloquear a máquina.',
      safety: 'Nenhuma proteção sai com o transportador energizado. Guarde-as perto: elas voltam antes de religar.',
      observe: 'Confira se as proteções estão inteiras e com todos os parafusos.',
      toolDistractors: [{ tool: 'Martelo de aço para soltar a chapa', why: 'Amassa a proteção e deixa frestas que dão acesso à zona de perigo.' }],
      moves: { 'cv-guards': [[0, 1.6, 0], [0, 1.6, -3.4]] }
    },
    {
      partId: 'cv-motor',
      title: 'Retirar o motor do redutor',
      instruction:
        'Depois que a pessoa autorizada desligou os cabos, prenda o motor na talha, solte os parafusos do flange e afaste o motor reto, sem forçar o eixo dentro do redutor.',
      tool: 'Chave combinada + talha com cinta',
      toolWhy: 'O motor é pesado e o eixo encaixa no redutor: a talha segura o peso enquanto ele sai reto.',
      safety: 'Nunca fique embaixo da carga suspensa. Confira a capacidade da talha e da cinta.',
      observe: 'Veja o encaixe do eixo do motor e o estado do retentor de entrada do redutor.',
      toolDistractors: [{ tool: 'Alavanca entre motor e redutor', why: 'Força o eixo e o flange e pode deixar o motor cair.' }],
      moves: { 'cv-motor': [[0, 0, 0.8], [0, 0.9, 0.8], [0, 0.9, 2.2]] }
    },
    {
      partId: 'cv-gearbox',
      title: 'Soltar o redutor e desacoplar',
      instruction: 'Solte os parafusos dos pés do redutor e afaste-o no sentido do eixo para separar as duas metades do acoplamento.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'Ferramenta de boca fechada para os parafusos dos pés, que costumam estar bem apertados.',
      observe: 'Marque a posição dos pés e dos calços: isso ajuda a realinhar na montagem.',
      toolDistractors: [{ tool: 'Chave inglesa', why: 'Folga na boca: arredonda parafusos apertados.' }],
      moves: { 'cv-gearbox': [[0, 0, 0.5]] }
    },
    {
      partId: 'cv-coupling',
      title: 'Retirar o acoplamento do eixo da polia',
      instruction: 'Extraia o cubo do acoplamento da ponta do eixo da polia com o saca-polias e inspecione o elemento elástico.',
      tool: 'Saca-polias',
      toolWhy: 'O cubo tem ajuste no eixo: o saca-polias puxa reto, sem pancadas no eixo e nos mancais.',
      observe: 'Elemento elástico rachado ou com pó de borracha indica desalinhamento.',
      toolDistractors: [{ tool: 'Martelo de aço', why: 'A pancada passa para o eixo e para os rolamentos dos mancais.' }],
      moves: { 'cv-coupling': [[0, 0, 0.3], [0, 1.2, 0.3], [0, 1.2, 1.6]] }
    },
    {
      partId: 'cv-take-up',
      title: 'Aliviar a tensão da correia no tensor',
      instruction: 'Anote a posição dos fusos e afrouxe os dois lados do tensor por igual, até a correia ficar frouxa sobre os rolos.',
      tool: 'Chave combinada',
      toolWhy: 'O ajuste é feito nas porcas dos fusos, um pouco de cada lado.',
      safety: 'Alivie aos poucos: a correia tensionada guarda energia.',
      observe: 'Fusos travados por sujeira ou ajuste desigual entre os lados explicam correia desalinhada.',
      toolDistractors: [{ tool: 'Cortar a correia para aliviar', why: 'Destrói a emenda e libera a energia de uma vez.' }],
      moves: { 'cv-take-up': [[-0.7, 0, 0]] }
    },
    {
      partId: 'cv-roller-inspect',
      title: 'Retirar o rolo de carga indicado',
      instruction: 'Com a correia frouxa, erga-a o suficiente e tire o rolo dos rasgos dos cavaletes. Gire o rolo à mão para confirmar o defeito.',
      tool: 'Mãos com luvas (e alavanca adequada para erguer a correia)',
      toolWhy: 'O rolo sai dos rasgos sem ferramenta; as luvas protegem das bordas do tubo.',
      safety: 'Use luvas. Não coloque a mão entre a correia e a estrutura sem a correia estar bem apoiada.',
      observe: 'Rolo duro de girar, com ruído ou com face gasta e lisa: rolamento interno travado.',
      toolDistractors: [{ tool: 'Martelo para soltar o rolo', why: 'Amassa o tubo e os cavaletes; o rolo sai à mão.' }],
      moves: { 'cv-roller-inspect': [[0, -0.04, 0], [0, -0.04, -2.1]] }
    }
  ],
  explode: {
    'cv-frame': [0, 0, 0],
    'cv-belt': [0, 1.3, 0],
    'cv-head-pulley': [0.9, 0, 0],
    'cv-tail-pulley': [-0.9, 0, 0],
    'cv-take-up': [-1.6, 0, 0],
    'cv-carry-idlers': [0, 0.6, 0],
    'cv-roller-inspect': [0, 0.6, 0],
    'cv-return-idlers': [0, -0.3, 0],
    'cv-bearings': [0, 0, 0],
    'cv-coupling': [0.9, 0, 0.45],
    'cv-gearbox': [0.9, 0, 1.0],
    'cv-motor': [0.9, 0, 1.9],
    'cv-guards': [0, 2.4, 0]
  },
  identify: [
    { partId: 'cv-head-pulley', prompt: 'Clique na polia de acionamento — a que recebe o giro do motor e puxa a correia.', hint: 'Fica na ponta onde estão o motor e o redutor. Tem revestimento escuro.' },
    { partId: 'cv-take-up', prompt: 'Clique no tensor — os fusos que esticam a correia.', hint: 'Fica na ponta oposta ao motor, atrás da polia de retorno.' },
    { partId: 'cv-gearbox', prompt: 'Clique no redutor — a caixa que diminui a rotação e aumenta o torque.', hint: 'Fica entre o motor (verde) e o acoplamento.' },
    { partId: 'cv-return-idlers', prompt: 'Clique nos rolos de retorno — os que apoiam a correia vazia por baixo.', hint: 'Ficam embaixo da estrutura.' }
  ],
  checkQuestionIds: ['ind-05', 'ind-06', 'ind-07', 'ind-08'],
  lessonId: 'lesson-gearbox-fundamentals'
};
