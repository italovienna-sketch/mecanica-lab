import type { MachineData, MechanicalPart3D } from '../mechanicalMachines';
import type { MachineLabConfig, Vec3 } from '../labMission';

/**
 * Bomba de duplo diafragma acionada a ar comprimido (laboratório 3D, seção Indústria na prática).
 * Contrasta com a bomba centrífuga: deslocamento positivo alternativo, sem eixo girando nem selo no lado do produto.
 * A desmontagem é a de uma troca de diafragmas e de válvulas de retenção. Sem pressões, vazões, torques
 * ou materiais de diafragma: dependem do fabricante, do modelo e do produto bombeado.
 * Modelo: src/components/lab/models/diaphragmPumpModel.ts
 */

export const DIAPHRAGM_PUMP_ID = 'diaphragm-pump';

const MANUAL = 'Conforme o manual do fabricante da bomba (não informado neste modelo educacional)';

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

const BALL_CHECK = {
  question: 'Uma esfera gasta ou uma sede marcada causa o quê?',
  options: ['A válvula não fecha direito: a bomba perde vazão ou tem dificuldade para escorvar', 'A bomba gira mais rápido', 'Nada, a esfera é só um enfeite'],
  correctIndex: 0,
  explanation: 'Sem vedação na sede, parte do líquido volta a cada curso em vez de seguir em frente.'
};

const ball = (id: string, name: string, where: string, role: string, order: number): MechanicalPart3D =>
  part(
    {
      id,
      name,
      technicalName: 'Esfera da válvula de retenção',
      tag: 'ESFERA',
      category: 'sealing',
      material: 'Elastômero ou plástico compatível com o produto (no modelo)',
      tolerance: 'Material e diâmetro: ' + MANUAL,
      simpleDefinition: 'É a bolinha que abre e fecha a passagem do líquido.',
      mainFunction: role,
      location: where,
      relationshipWithOthers: 'Assenta na sede; fica presa no alojamento do coletor.',
      typicalFailureModes: 'Desgaste, deformação, inchaço por produto incompatível, sujeira entre esfera e sede.',
      practicalExample: 'Bomba que "bate" normalmente mas quase não manda líquido: verifique esferas e sedes.',
      quickCheckQuestion: BALL_CHECK
    },
    order,
    'Mãos limpas, com luvas adequadas ao produto',
    '#ece8dd'
  );

export const DIAPHRAGM_PUMP_MACHINE: MachineData = {
  id: DIAPHRAGM_PUMP_ID,
  name: 'Bomba de duplo diafragma pneumática (modelo educacional)',
  subtitle: 'Dois diafragmas ligados por um eixo, válvula de ar, quatro válvulas de retenção de esfera e coletores de entrada e saída',
  category: 'Bombas',
  difficulty: 'Intermediário',
  specs: [
    { label: 'Princípio', value: 'Deslocamento positivo alternativo: cada diafragma aumenta e diminui o volume de uma câmara' },
    { label: 'Acionamento', value: 'Ar comprimido, distribuído pela válvula de ar para um lado de cada vez' },
    { label: 'Válvulas de retenção', value: 'Quatro, de esfera: duas de sucção (embaixo) e duas de descarga (em cima)' },
    { label: 'Vedação do eixo', value: 'O eixo fica do lado do ar: não há selo girando em contato com o produto' },
    { label: 'Pressão, vazão e materiais', value: 'Conforme o fabricante e o produto (não informados no modelo)' }
  ],
  overviewDescription:
    'O ar comprimido entra pela válvula de ar e empurra um diafragma para fora: a câmara daquele lado diminui e o líquido sai pela válvula de cima. Como os dois diafragmas estão presos no mesmo eixo, o outro é puxado para dentro: a câmara dele aumenta e o líquido entra pela válvula de baixo. No fim do curso a válvula de ar inverte e tudo se repete do outro lado. As esferas só deixam o líquido passar num sentido: de baixo para cima.',
  safetyRules: [
    'Fechar e bloquear o ar comprimido e aliviar a pressão do ar antes de qualquer serviço.',
    'Fechar as válvulas das linhas de produto, aliviar a pressão da descarga e drenar a bomba.',
    'Consultar a ficha com dados de segurança do produto (FDS) e usar os EPIs indicados: resíduos ficam dentro da bomba.',
    'Com produtos inflamáveis, manter o aterramento previsto pelo fabricante (eletricidade estática).'
  ],
  parts: [
    part(
      {
        id: 'dp-center-body',
        name: 'Corpo central',
        technicalName: 'Bloco central com as câmaras de ar',
        tag: 'CORPO',
        category: 'structural',
        material: 'Metal ou plástico de engenharia (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o "miolo" da bomba: separa o lado do ar dos dois lados do líquido.',
        mainFunction: 'Guiar o eixo, alojar a válvula de ar e formar, com os diafragmas, as duas câmaras de ar.',
        location: 'No meio da bomba, entre as duas câmaras de líquido.',
        relationshipWithOthers: 'O eixo passa por dentro dele; a válvula de ar fica presa em cima; as tampas apertam os diafragmas contra ele.',
        typicalFailureModes: 'Desgaste da guia do eixo (vazamento de ar entre as câmaras), roscas danificadas.',
        practicalExample: 'Ar escapando de um lado para o outro pela guia gasta deixa a bomba fraca e irregular.',
        quickCheckQuestion: {
          question: 'O que fica dentro das câmaras do corpo central?',
          options: ['Ar comprimido, do lado de dentro dos diafragmas', 'O líquido bombeado', 'Óleo de lubrificação'],
          correctIndex: 0,
          explanation: 'O diafragma separa o ar (lado do corpo central) do líquido (lado da tampa externa).'
        }
      },
      0,
      'Fica fixo',
      '#35587a'
    ),
    part(
      {
        id: 'dp-air-valve',
        name: 'Válvula de ar e silenciador',
        technicalName: 'Válvula distribuidora de ar com silenciador de escape',
        tag: 'VÁLV-AR',
        category: 'structural',
        material: 'Corpo metálico com carretel e vedações (no modelo)',
        tolerance: 'Ar comprimido filtrado e, se o fabricante pedir, lubrificado: ' + MANUAL,
        simpleDefinition: 'É a peça que manda o ar para um lado e depois para o outro, fazendo a bomba "bater".',
        mainFunction: 'Alternar o ar entre as duas câmaras de ar e soltar o ar usado pelo silenciador.',
        location: 'Em cima do corpo central. Entrada de ar na frente, silenciador atrás.',
        relationshipWithOthers: 'Recebe o ar da linha; inverte no fim de cada curso do eixo.',
        typicalFailureModes: 'Travamento por ar sujo ou úmido, vedações gastas, silenciador entupido ou com gelo.',
        practicalExample: 'Produto saindo pelo silenciador é sinal clássico de diafragma furado: o líquido passou para o lado do ar.',
        quickCheckQuestion: {
          question: 'Saiu líquido pelo silenciador de escape. O que isso indica?',
          options: ['Diafragma furado: o produto passou para o lado do ar', 'Ar comprimido limpo demais', 'Esfera de descarga presa'],
          correctIndex: 0,
          explanation: 'Do lado do ar só deveria haver ar. Se o produto aparece no escape, a separação (o diafragma) falhou.'
        }
      },
      8,
      'Chave combinada ou soquete',
      '#2b4763'
    ),
    part(
      {
        id: 'dp-cover-left',
        name: 'Câmara de líquido esquerda',
        technicalName: 'Tampa externa (câmara de líquido) com bocais das válvulas',
        tag: 'CÂM-E',
        category: 'structural',
        material: 'Metal ou plástico compatível com o produto (no modelo)',
        tolerance: 'Sequência e aperto dos parafusos: ' + MANUAL,
        simpleDefinition: 'É a "tampa" de fora: onde o líquido entra e sai de um lado da bomba.',
        mainFunction: 'Formar a câmara de líquido junto com o diafragma e prender a borda dele contra o corpo central.',
        location: 'Lado esquerdo, presa no corpo central por parafusos.',
        relationshipWithOthers: 'Encosta nos coletores de entrada e de saída pelos bocais de baixo e de cima.',
        typicalFailureModes: 'Vazamento pela borda do diafragma (aperto desigual), corrosão ou ataque químico.',
        practicalExample: 'Vazamento pela borda logo após a montagem: aperto desigual ou diafragma mal assentado.',
        quickCheckQuestion: {
          question: 'Por que apertar os parafusos da câmara em sequência cruzada?',
          options: ['Para prender a borda do diafragma por igual e não vazar', 'Para a bomba ficar mais leve', 'Não faz diferença'],
          correctIndex: 0,
          explanation: 'A borda do diafragma é a vedação entre câmara e corpo: precisa de pressão uniforme.'
        }
      },
      5,
      'Chave combinada ou soquete',
      '#9aa3ab'
    ),
    part(
      {
        id: 'dp-cover-right',
        name: 'Câmara de líquido direita',
        technicalName: 'Tampa externa (câmara de líquido) com bocais das válvulas',
        tag: 'CÂM-D',
        category: 'structural',
        material: 'Metal ou plástico compatível com o produto (no modelo)',
        tolerance: 'Sequência e aperto dos parafusos: ' + MANUAL,
        simpleDefinition: 'É a "tampa" de fora do lado direito.',
        mainFunction: 'Formar a câmara de líquido junto com o diafragma e prender a borda dele contra o corpo central.',
        location: 'Lado direito, presa no corpo central por parafusos.',
        relationshipWithOthers: 'Encosta nos coletores de entrada e de saída pelos bocais de baixo e de cima.',
        typicalFailureModes: 'Vazamento pela borda do diafragma, corrosão ou ataque químico.',
        practicalExample: 'Antes de abrir, a câmara é drenada: sempre sobra produto lá dentro.',
        quickCheckQuestion: {
          question: 'Antes de soltar a câmara de líquido, o que é preciso?',
          options: ['Ar bloqueado e aliviado, linhas fechadas, bomba drenada e EPI para o produto', 'Só desligar o ar', 'Nada, a bomba está parada'],
          correctIndex: 0,
          explanation: 'Ar e produto são energias e perigos diferentes: os dois precisam estar controlados.'
        }
      },
      5,
      'Chave combinada ou soquete',
      '#9aa3ab'
    ),
    part(
      {
        id: 'dp-diaphragm-left',
        name: 'Diafragma esquerdo',
        technicalName: 'Diafragma (membrana) com placas interna e externa',
        tag: 'DIAF-E',
        category: 'sealing',
        material: 'Elastômero ou PTFE, escolhido pelo produto (no modelo)',
        tolerance: 'Material e vida útil: ' + MANUAL,
        simpleDefinition: 'É a membrana que vai e volta e empurra o líquido.',
        mainFunction: 'Separar o ar do líquido e, indo e voltando, mudar o volume da câmara.',
        location: 'Entre o corpo central e a câmara de líquido esquerda, preso no eixo pelas placas.',
        relationshipWithOthers: 'A borda fica presa entre corpo e tampa; o centro fica preso no eixo.',
        typicalFailureModes: 'Rasgo ou furo (produto no escape de ar), fadiga, ataque químico, inchaço.',
        practicalExample: 'Diafragma inchado e mole indica material incompatível com o produto.',
        quickCheckQuestion: {
          question: 'O que define o material do diafragma?',
          options: ['O produto bombeado (compatibilidade química, temperatura, abrasão)', 'A cor da bomba', 'A pressão do ar, só'],
          correctIndex: 0,
          explanation: 'É a peça que toca no produto: precisa resistir a ele. A escolha segue a tabela do fabricante.'
        }
      },
      7,
      'Mãos (o diafragma sai junto com o eixo nesta etapa)',
      '#2e3238'
    ),
    part(
      {
        id: 'dp-diaphragm-right',
        name: 'Diafragma direito',
        technicalName: 'Diafragma (membrana) com placas interna e externa',
        tag: 'DIAF-D',
        category: 'sealing',
        material: 'Elastômero ou PTFE, escolhido pelo produto (no modelo)',
        tolerance: 'Material e vida útil: ' + MANUAL,
        simpleDefinition: 'É a membrana do lado direito.',
        mainFunction: 'Separar o ar do líquido e, indo e voltando, mudar o volume da câmara.',
        location: 'Entre o corpo central e a câmara de líquido direita, preso no eixo pelas placas.',
        relationshipWithOthers: 'Preso na ponta do eixo pela placa externa; a outra ponta do eixo segura o diafragma esquerdo.',
        typicalFailureModes: 'Rasgo ou furo, fadiga, ataque químico.',
        practicalExample: 'Ao trocar um diafragma, muitos fabricantes recomendam trocar o par: confira no manual.',
        quickCheckQuestion: {
          question: 'Ao soltar a placa externa do diafragma, onde segurar para o eixo não girar?',
          options: ['Na placa do outro lado, com a ferramenta indicada no manual', 'No eixo, com chave de grifo', 'Em lugar nenhum'],
          correctIndex: 0,
          explanation: 'O eixo desliza nas vedações do corpo central: marcas de ferramenta nele causam vazamento de ar.'
        }
      },
      6,
      'Chave combinada ou soquete na placa externa',
      '#2e3238'
    ),
    part(
      {
        id: 'dp-shaft',
        name: 'Eixo dos diafragmas',
        technicalName: 'Eixo (haste) de ligação dos diafragmas',
        tag: 'EIXO',
        category: 'transmission',
        material: 'Aço inoxidável (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É a haste que liga os dois diafragmas: quando um vai, o outro vem.',
        mainFunction: 'Fazer os dois diafragmas andarem juntos e acionar a inversão da válvula de ar.',
        location: 'Atravessando o corpo central, de um diafragma ao outro.',
        relationshipWithOthers: 'Desliza em vedações dentro do corpo central; as placas dos diafragmas são presas nas pontas.',
        typicalFailureModes: 'Riscos ou desgaste na superfície (vazamento de ar entre as câmaras).',
        practicalExample: 'Eixo riscado por ferramenta deixa o ar passar de uma câmara para a outra.',
        quickCheckQuestion: {
          question: 'Este eixo gira como o de uma bomba centrífuga?',
          options: ['Não: ele vai e volta (movimento alternativo)', 'Sim, gira o tempo todo', 'Gira só na partida'],
          correctIndex: 0,
          explanation: 'É uma bomba alternativa: o eixo só faz o curso de ida e volta.'
        }
      },
      7,
      'Mãos limpas (puxar reto, sem forçar)',
      '#dfe2e6'
    ),
    part(
      {
        id: 'dp-manifold-out',
        name: 'Coletor de saída',
        technicalName: 'Coletor (manifold) de descarga',
        tag: 'COL-SAÍDA',
        category: 'structural',
        material: 'Metal ou plástico compatível com o produto (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o "cano" de cima que junta o líquido que sai das duas câmaras.',
        mainFunction: 'Reunir a descarga das duas câmaras numa saída só e alojar as válvulas de descarga.',
        location: 'Em cima da bomba.',
        relationshipWithOthers: 'Preso nos bocais de cima das duas câmaras; as esferas de descarga ficam no alojamento.',
        typicalFailureModes: 'Vazamento nas juntas, ataque químico, esforço da tubulação.',
        practicalExample: 'Tubulação apoiada na bomba força o coletor e abre vazamentos nas juntas.',
        quickCheckQuestion: {
          question: 'Antes de soltar o coletor de saída, o que fazer com a linha de descarga?',
          options: ['Fechar a válvula da linha e aliviar a pressão', 'Nada', 'Aumentar a pressão do ar'],
          correctIndex: 0,
          explanation: 'A linha de descarga pode ficar pressurizada mesmo com a bomba parada.'
        }
      },
      1,
      'Chave combinada ou soquete',
      '#9aa3ab'
    ),
    part(
      {
        id: 'dp-manifold-in',
        name: 'Coletor de entrada',
        technicalName: 'Coletor (manifold) de sucção, com os pés de apoio',
        tag: 'COL-ENTR',
        category: 'structural',
        material: 'Metal ou plástico compatível com o produto (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'É o "cano" de baixo, por onde o líquido entra e se divide entre as duas câmaras.',
        mainFunction: 'Distribuir a sucção para as duas câmaras e alojar as válvulas de sucção.',
        location: 'Embaixo da bomba; os pés de apoio fazem parte dele.',
        relationshipWithOthers: 'Preso nos bocais de baixo das duas câmaras.',
        typicalFailureModes: 'Entrada de ar pelas juntas (a bomba perde a escorva), sujeira acumulada.',
        practicalExample: 'Junta de sucção com vazamento puxa ar: a bomba bate mais rápido e manda pouco líquido.',
        quickCheckQuestion: {
          question: 'Uma junta frouxa no coletor de entrada causa o quê?',
          options: ['Entrada de ar: a bomba perde vazão e escorva mal', 'Mais vazão', 'Produto no silenciador'],
          correctIndex: 0,
          explanation: 'Na sucção a pressão é baixa: em vez de vazar líquido, o furo puxa ar para dentro.'
        }
      },
      3,
      'Chave combinada ou soquete',
      '#9aa3ab'
    ),
    part(
      {
        id: 'dp-seats-out',
        name: 'Sedes de descarga',
        technicalName: 'Sedes das válvulas de retenção de descarga (2)',
        tag: 'SEDE-SAÍDA',
        category: 'sealing',
        material: 'Material compatível com o produto (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'São os anéis onde as esferas de cima encostam para fechar.',
        mainFunction: 'Dar uma superfície de vedação para as esferas de descarga.',
        location: 'Entre o bocal de cima de cada câmara e o coletor de saída.',
        relationshipWithOthers: 'A esfera assenta na sede; o coletor prende a sede no lugar.',
        typicalFailureModes: 'Desgaste, riscos, sujeira presa.',
        practicalExample: 'Sede marcada não veda nem com esfera nova: troque as duas peças juntas quando o manual indicar.',
        quickCheckQuestion: BALL_CHECK
      },
      2,
      'Mãos limpas, com luvas adequadas ao produto',
      '#c8ccd2'
    ),
    part(
      {
        id: 'dp-seats-in',
        name: 'Sedes de sucção',
        technicalName: 'Sedes das válvulas de retenção de sucção (2)',
        tag: 'SEDE-ENTR',
        category: 'sealing',
        material: 'Material compatível com o produto (no modelo)',
        tolerance: MANUAL,
        simpleDefinition: 'São os anéis onde as esferas de baixo encostam para fechar.',
        mainFunction: 'Dar uma superfície de vedação para as esferas de sucção.',
        location: 'Entre o coletor de entrada e o bocal de baixo de cada câmara.',
        relationshipWithOthers: 'A esfera assenta na sede; o coletor de entrada prende a sede no lugar.',
        typicalFailureModes: 'Desgaste, riscos, sólidos presos.',
        practicalExample: 'Um sólido preso entre esfera e sede deixa a válvula aberta: a bomba bate e não puxa.',
        quickCheckQuestion: BALL_CHECK
      },
      4,
      'Mãos limpas, com luvas adequadas ao produto',
      '#c8ccd2'
    ),
    ball('dp-ball-out-left', 'Esfera de descarga esquerda', 'Em cima, do lado esquerdo, dentro do alojamento do coletor de saída.', 'Abrir quando a câmara esquerda empurra o líquido e fechar quando ela aspira.', 2),
    ball('dp-ball-out-right', 'Esfera de descarga direita', 'Em cima, do lado direito, dentro do alojamento do coletor de saída.', 'Abrir quando a câmara direita empurra o líquido e fechar quando ela aspira.', 2),
    ball('dp-ball-in-left', 'Esfera de sucção esquerda', 'Embaixo, do lado esquerdo, logo acima da sede de sucção.', 'Abrir quando a câmara esquerda aspira e fechar quando ela empurra o líquido.', 4),
    ball('dp-ball-in-right', 'Esfera de sucção direita', 'Embaixo, do lado direito, logo acima da sede de sucção.', 'Abrir quando a câmara direita aspira e fechar quando ela empurra o líquido.', 4)
  ],
  disassemblySteps: []
};

export const DIAPHRAGM_PUMP_SHORT_NAMES: Record<string, string> = {
  'dp-center-body': 'Corpo central',
  'dp-air-valve': 'Válvula de ar',
  'dp-cover-left': 'Câmara esquerda',
  'dp-cover-right': 'Câmara direita',
  'dp-diaphragm-left': 'Diafragma esquerdo',
  'dp-diaphragm-right': 'Diafragma direito',
  'dp-shaft': 'Eixo',
  'dp-manifold-out': 'Coletor de saída',
  'dp-manifold-in': 'Coletor de entrada',
  'dp-seats-out': 'Sedes de descarga',
  'dp-seats-in': 'Sedes de sucção',
  'dp-ball-out-left': 'Esfera desc. esq.',
  'dp-ball-out-right': 'Esfera desc. dir.',
  'dp-ball-in-left': 'Esfera sucção esq.',
  'dp-ball-in-right': 'Esfera sucção dir.'
};

const BALL_SAFETY = 'Resíduo de produto: manuseie com as luvas indicadas na FDS. Não use a esfera que estiver deformada.';

export const DIAPHRAGM_PUMP_PART_SAFETY: Record<string, string> = {
  'dp-center-body': 'Ar bloqueado e aliviado antes de abrir: a bomba pode dar um curso inesperado com ar preso.',
  'dp-air-valve': 'Despressurize a linha de ar antes de soltar o engate. Silenciador com produto = diafragma furado.',
  'dp-cover-left': 'Drene a câmara antes: sempre sobra produto. Aperte em sequência cruzada na montagem.',
  'dp-cover-right': 'Drene a câmara antes: sempre sobra produto. Aperte em sequência cruzada na montagem.',
  'dp-diaphragm-left': 'Peça que toca o produto: luvas e óculos conforme a FDS. Confira o lado certo de montagem no manual.',
  'dp-diaphragm-right': 'Peça que toca o produto: luvas e óculos conforme a FDS. Confira o lado certo de montagem no manual.',
  'dp-shaft': 'Não prenda o eixo com chave de grifo ou alicate: riscos causam vazamento de ar.',
  'dp-manifold-out': 'Feche e alivie a linha de descarga antes de soltar: ela pode estar pressurizada.',
  'dp-manifold-in': 'Os pés fazem parte deste coletor: apoie a bomba na bancada antes de soltá-lo.',
  'dp-seats-out': BALL_SAFETY,
  'dp-seats-in': BALL_SAFETY,
  'dp-ball-out-left': BALL_SAFETY,
  'dp-ball-out-right': BALL_SAFETY,
  'dp-ball-in-left': BALL_SAFETY,
  'dp-ball-in-right': BALL_SAFETY
};

const BALLS_OUT = ['dp-ball-out-left', 'dp-ball-out-right'];
const BALLS_IN = ['dp-ball-in-left', 'dp-ball-in-right'];
const all = (ids: string[], path: Vec3[]) => Object.fromEntries(ids.map((id) => [id, path]));

export const DIAPHRAGM_PUMP_LAB: MachineLabConfig = {
  machineId: DIAPHRAGM_PUMP_ID,
  purpose:
    'A bomba de duplo diafragma move líquidos difíceis — com sólidos, abrasivos, viscosos ou agressivos — usando ar comprimido. Não há rotor nem eixo girando no líquido: duas membranas vão e voltam, e quatro válvulas de esfera fazem o líquido andar num sentido só. É o contraste com a bomba centrífuga: aqui o volume é empurrado a cada curso (deslocamento positivo).',
  whereUsed: 'Indústria química, tintas, alimentos, mineração, tratamento de efluentes e transferência de tambores e tanques.',
  source: 'procedural-diaphragm-pump',
  floorY: -1.75,
  cutawayParts: ['dp-cover-left', 'dp-cover-right', 'dp-manifold-out', 'dp-manifold-in', 'dp-center-body'],
  operating: {
    label: 'Ver funcionando',
    observe:
      'Observe com o raio-X ligado: quando o eixo vai para a direita, o diafragma direito empurra (a esfera de cima à direita abre) e o esquerdo aspira (a esfera de baixo à esquerda abre). No outro curso, inverte. O líquido sempre entra por baixo e sai por cima. Simplificação: aqui o diafragma inteiro se move; na bomba real a borda fica presa e só o centro vai e volta. Velocidade e curso didáticos.'
  },
  preWorkSafety: [
    'Fechar e bloquear o ar comprimido e aliviar a pressão do ar até zero.',
    'Fechar as válvulas das linhas de sucção e de descarga, aliviar a pressão da descarga e drenar a bomba.',
    'Consultar a FDS do produto e usar os EPIs indicados: sempre sobra produto nas câmaras.',
    'Com produto inflamável, a bomba trabalha aterrada conforme o fabricante: recoloque o aterramento na montagem.'
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D construído no próprio projeto (licença CC0), inspirado na construção comum de bombas de duplo diafragma pneumáticas: coletor de entrada embaixo, de saída em cima e válvulas de esfera. Não representa um fabricante ou modelo comercial. Foram simplificados: a válvula de ar é um bloco (o carretel e a válvula piloto internos não aparecem), as vedações do eixo e as juntas foram omitidas e as tampas são presas por parafusos (alguns modelos usam abraçadeiras). Pressões, vazões, apertos e materiais seguem sempre o manual do fabricante e a compatibilidade com o produto.'
  },
  disassembly: [
    {
      partId: 'dp-manifold-out',
      title: 'Retirar o coletor de saída',
      instruction:
        'Com o ar bloqueado e aliviado, as linhas fechadas e a bomba drenada, solte a tubulação de descarga e os parafusos do coletor de cima. Levante o coletor reto.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'Boca fechada abraça a cabeça do parafuso e não arredonda, mesmo com resíduo de produto.',
      safety: 'A linha de descarga pode estar pressurizada: confirme o alívio antes do primeiro parafuso.',
      observe: 'Veja as juntas entre o coletor e as câmaras: endurecidas ou cortadas são trocadas.',
      toolDistractors: [{ tool: 'Chave inglesa (ajustável)', why: 'A boca tem folga e tende a arredondar a cabeça do parafuso.' }],
      moves: { 'dp-manifold-out': [[0, 1.4, 0]] }
    },
    {
      partId: 'dp-seats-out',
      title: 'Retirar as esferas e as sedes de descarga',
      instruction: 'Tire as duas esferas de cima e depois as duas sedes. Mantenha cada peça do seu lado para comparar.',
      tool: 'Mãos limpas, com luvas adequadas ao produto',
      toolWhy: 'As peças saem soltas. Ferramenta metálica risca a sede, que é superfície de vedação.',
      safety: 'Resíduo de produto: luvas e óculos conforme a FDS.',
      observe: 'Esfera gasta, ovalizada ou inchada e sede marcada não vedam: a bomba bate e manda pouco líquido.',
      toolDistractors: [{ tool: 'Chave de fenda como alavanca', why: 'Risca a sede e o alojamento; as peças saem à mão.' }],
      moves: {
        ...all(BALLS_OUT, [[0, 0.95, 0], [0, 0.95, -1.7]]),
        'dp-seats-out': [[0, 0.75, 0], [0, 0.75, -1.7]]
      }
    },
    {
      partId: 'dp-manifold-in',
      title: 'Retirar o coletor de entrada',
      instruction:
        'Apoie a bomba na bancada (os pés fazem parte deste coletor), solte a tubulação de sucção e os parafusos do coletor de baixo e retire-o.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'Mesmos parafusos do coletor de cima: ferramenta de boca fechada.',
      safety: 'Ao soltar o coletor de baixo, escorre o produto que ficou nas câmaras: tenha bandeja de contenção.',
      observe: 'Juntas da sucção danificadas deixam a bomba puxar ar.',
      toolDistractors: [{ tool: 'Martelo para soltar o coletor', why: 'Pode trincar o coletor e as câmaras, especialmente se forem de plástico.' }],
      moves: { 'dp-manifold-in': [[0, -0.3, 0], [0, -0.3, 2.0]] }
    },
    {
      partId: 'dp-seats-in',
      title: 'Retirar as esferas e as sedes de sucção',
      instruction: 'Retire as duas sedes de baixo e as esferas de sucção, mantendo a separação por lado.',
      tool: 'Mãos limpas, com luvas adequadas ao produto',
      toolWhy: 'As peças saem soltas; o cuidado é não riscar as superfícies de vedação.',
      observe: 'Sólidos presos entre esfera e sede explicam bomba que bate e não puxa.',
      toolDistractors: [{ tool: 'Alicate', why: 'Marca a esfera e a sede, criando caminho para vazamento.' }],
      moves: {
        ...all(BALLS_IN, [[0, -0.55, 0], [0, -0.55, -1.8]]),
        'dp-seats-in': [[0, -0.4, 0], [0, -0.4, -1.8]]
      },
      xrayParts: ['dp-cover-left', 'dp-cover-right']
    },
    {
      partId: 'dp-cover-right',
      title: 'Retirar as duas câmaras de líquido',
      instruction: 'Solte os parafusos de cada câmara em sequência cruzada e afaste as câmaras para os lados, sem forçar a borda dos diafragmas.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'Soltar em cruz, por etapas, evita empenar a tampa.',
      observe: 'Marcas de vazamento na borda indicam aperto desigual ou diafragma no fim da vida.',
      toolDistractors: [{ tool: 'Chave de fenda entre câmara e corpo', why: 'Alavancar marca as faces que prendem a borda do diafragma.' }],
      moves: {
        'dp-cover-right': [[0.6, 0, 0], [0.6, 0, 1.9]],
        'dp-cover-left': [[-0.6, 0, 0], [-0.6, 0, 1.9]]
      }
    },
    {
      partId: 'dp-diaphragm-right',
      title: 'Soltar o diafragma direito do eixo',
      instruction: 'Segure a placa do diafragma do outro lado e solte a placa externa do lado direito. Retire o diafragma com as placas.',
      tool: 'Chave combinada ou soquete na placa externa',
      toolWhy: 'A força fica nas placas; o eixo não é segurado com ferramenta.',
      safety: 'Use as luvas indicadas para o produto: o diafragma esteve em contato com ele.',
      observe: 'Furo, rasgo ou trinca no diafragma explicam produto saindo pelo silenciador.',
      toolDistractors: [{ tool: 'Chave de grifo no eixo', why: 'Os dentes riscam o eixo, que desliza nas vedações do corpo central: passa a vazar ar.' }],
      moves: { 'dp-diaphragm-right': [[0.5, 0, 0], [0.5, 0, -1.6]] }
    },
    {
      partId: 'dp-shaft',
      title: 'Puxar o eixo com o diafragma esquerdo',
      instruction: 'Puxe o eixo pelo lado esquerdo, reto, trazendo junto o diafragma esquerdo.',
      tool: 'Mãos limpas (puxar reto, sem forçar)',
      toolWhy: 'O eixo desliza; força de lado danifica as vedações internas do corpo central.',
      observe: 'Veja a superfície do eixo: riscos ou desgaste explicam ar passando de uma câmara para a outra.',
      toolDistractors: [{ tool: 'Martelo na ponta do eixo', why: 'Amassa a rosca da ponta e danifica as vedações internas.' }],
      moves: all(['dp-shaft', 'dp-diaphragm-left'], [[-1.0, 0, 0], [-1.0, 0, -1.6]])
    },
    {
      partId: 'dp-diaphragm-left',
      title: 'Separar o diafragma esquerdo do eixo',
      instruction: 'Fora da bomba, segure o eixo por uma região sem contato com vedações (ou com proteção macia) e solte a placa do diafragma esquerdo.',
      tool: 'Chave combinada ou soquete na placa',
      toolWhy: 'A placa recebe a força; se precisar prender o eixo, use mordente macio, nunca dentes.',
      observe: 'Compare os dois diafragmas: desgaste parecido confirma a troca do par.',
      toolDistractors: [{ tool: 'Alicate de pressão no eixo', why: 'Marca o eixo e causa vazamento de ar depois da montagem.' }],
      moves: { 'dp-diaphragm-left': [[-1.0, 0, -1.6], [-1.7, 0, -1.6]] }
    },
    {
      partId: 'dp-air-valve',
      title: 'Retirar a válvula de ar (quando a inspeção pedir)',
      instruction: 'Se a bomba travava ou batia irregular, solte os parafusos e retire a válvula de ar para limpeza e troca das vedações conforme o kit do fabricante.',
      tool: 'Chave combinada ou soquete',
      toolWhy: 'Parafusos pequenos em material macio: ferramenta do tamanho certo, sem excesso de força.',
      safety: 'Linha de ar bloqueada e com pressão zero antes de soltar o engate.',
      observe: 'Sujeira, água ou gelo no silenciador indicam ar sem tratamento: verifique o filtro da linha.',
      toolDistractors: [{ tool: 'Chave inglesa', why: 'Folga na boca: arredonda parafusos pequenos.' }],
      moves: { 'dp-air-valve': [[0, 0.6, 0], [0, 0.6, 1.4]] }
    }
  ],
  explode: {
    'dp-center-body': [0, 0, 0],
    'dp-air-valve': [0, 0.7, 0],
    'dp-cover-left': [-1.1, 0, 0],
    'dp-cover-right': [1.1, 0, 0],
    'dp-diaphragm-left': [-0.55, 0, 0],
    'dp-diaphragm-right': [0.55, 0, 0],
    'dp-shaft': [0, 0, 0],
    'dp-manifold-out': [0, 1.5, 0],
    'dp-seats-out': [0, 0.75, 0],
    'dp-ball-out-left': [0, 1.0, 0],
    'dp-ball-out-right': [0, 1.0, 0],
    'dp-manifold-in': [0, 0, 1.9],
    'dp-seats-in': [0, -0.35, 0],
    'dp-ball-in-left': [0, -0.15, 0],
    'dp-ball-in-right': [0, -0.15, 0]
  },
  identify: [
    { partId: 'dp-diaphragm-right', prompt: 'Clique no diafragma direito — a membrana que vai e volta e separa o ar do líquido.', hint: 'Fica entre o corpo central (azul) e a câmara de líquido da direita.', needsXray: true },
    { partId: 'dp-ball-in-left', prompt: 'Clique na esfera de sucção da esquerda — a válvula por onde o líquido entra naquela câmara.', hint: 'Fica embaixo, do lado esquerdo, entre o coletor de entrada e a câmara.', needsXray: true },
    { partId: 'dp-air-valve', prompt: 'Clique na válvula de ar — a peça que manda o ar para um lado de cada vez.', hint: 'Fica em cima do corpo central, com o engate de ar na frente e o silenciador atrás.' },
    { partId: 'dp-manifold-out', prompt: 'Clique no coletor de saída — por onde o líquido sai da bomba.', hint: 'É o tubo horizontal de cima.' }
  ],
  checkQuestionIds: ['ind-11', 'ind-12', 'ind-13', 'ind-14'],
  lessonId: 'lesson-centrifugal-pump'
};
