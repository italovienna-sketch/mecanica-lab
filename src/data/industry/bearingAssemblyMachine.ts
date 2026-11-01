import type { MachineData, MechanicalPart3D } from '../mechanicalMachines';
import type { MachineLabConfig, Vec3 } from '../labMission';

/**
 * Conjunto de eixo com dois mancais de pedestal bipartidos (laboratório 3D, seção Indústria na prática).
 * Ensina o arranjo rolamento FIXO + rolamento LIVRE. Nenhum valor de ajuste, folga, torque, quantidade de
 * graxa ou temperatura é informado: tudo isso depende do fabricante do rolamento e do projeto da máquina.
 * Modelo: src/components/lab/models/bearingAssemblyModel.ts
 */

export const BEARING_ASSEMBLY_ID = 'bearing-assembly';

const MANUAL = 'Conforme o projeto da máquina e o catálogo do fabricante (não informado neste modelo educacional)';

const mesh = (order: number, tool: string, color = '#9aa3ab'): MechanicalPart3D['meshData'] => ({
  type: 'housing',
  color,
  metalness: 0.7,
  roughness: 0.4,
  dimensions: [1, 1, 1],
  basePosition: [0, 0, 0],
  explodedOffset: [0, 0, 0],
  disassemblyOrder: order,
  requiredTool: tool
});

export const BEARING_ASSEMBLY_MACHINE: MachineData = {
  id: BEARING_ASSEMBLY_ID,
  name: 'Conjunto de eixo com mancais (modelo educacional)',
  subtitle: 'Dois mancais de pedestal bipartidos: rolamento fixo de esferas e rolamento livre de rolos cilíndricos',
  category: 'Rolamentos & Transmissão',
  difficulty: 'Iniciante',
  specs: [
    { label: 'Lado da polia', value: 'Rolamento rígido de esferas — rolamento FIXO (posiciona o eixo nos dois sentidos axiais)' },
    { label: 'Lado do acoplamento', value: 'Rolamento de rolos cilíndricos tipo NU — rolamento LIVRE (permite a dilatação do eixo)' },
    { label: 'Caixas de mancal', value: 'Pedestal bipartido (base + tampa), lubrificação com graxa pela graxeira' },
    { label: 'Fixação axial dos anéis internos', value: 'Encosto no ressalto do eixo + anel elástico para eixo' },
    { label: 'Ajustes, folgas, torques e graxa', value: 'Conforme o projeto e o fabricante (não informados no modelo)' }
  ],
  overviewDescription:
    'Um eixo apoiado em dois mancais recebe o giro por uma polia e o entrega por um acoplamento. Os dois rolamentos não fazem o mesmo trabalho: o de esferas, do lado da polia, é o FIXO — segura o eixo para ele não andar para os lados. O de rolos cilíndricos é o LIVRE — o anel interno pode deslizar sobre os rolos quando o eixo esquenta e cresce. Se os dois fossem fixos, a dilatação do eixo carregaria os rolamentos e eles aqueceriam e falhariam cedo.',
  safetyRules: [
    'Bloqueio (LOTO): desligar, bloquear com cadeado e etiqueta e testar a partida do motor antes de soltar a correia ou o acoplamento.',
    'Correias, polias e acoplamentos girando prendem roupa, cabelo e mãos: nunca trabalhe neles com a máquina em movimento.',
    'Rolamento só se monta e desmonta aplicando força no anel que tem aperto — nunca através das esferas ou dos rolos.',
    'Nunca aqueça rolamento com maçarico: use aquecedor indutivo com controle de temperatura, conforme o fabricante.'
  ],
  parts: [
    {
      id: 'ba-base',
      name: 'Chapa de assentamento',
      technicalName: 'Base de aço com chumbadores dos mancais',
      tag: 'BASE',
      category: 'structural',
      material: 'Aço (no modelo)',
      tolerance: 'Planicidade do assentamento: ' + MANUAL,
      simpleDefinition: 'É a chapa onde as duas caixas de mancal ficam presas.',
      mainFunction: 'Manter as duas caixas alinhadas entre si e presas à estrutura da máquina.',
      location: 'Embaixo das duas caixas de mancal.',
      relationshipWithOthers: 'Recebe as bases das caixas pelos chumbadores (parafusos dos pés).',
      typicalFailureModes: 'Base empenada ou suja embaixo de um pé: a caixa fica torta e o rolamento trabalha desalinhado.',
      practicalExample: 'Um calço esquecido ou sujeira embaixo de um pé do mancal causa aquecimento e ruído.',
      quickCheckQuestion: {
        question: 'Por que limpar bem a base antes de assentar uma caixa de mancal?',
        options: ['Sujeira embaixo do pé deixa a caixa torta e desalinha o rolamento', 'Para a tinta durar mais', 'Não faz diferença'],
        correctIndex: 0,
        explanation: 'Qualquer sujeira ou rebarba entre o pé e a base inclina a caixa e força o rolamento.'
      },
      meshData: mesh(0, 'Fica fixa')
    },
    {
      id: 'ba-housing-bases',
      name: 'Bases das caixas de mancal',
      technicalName: 'Metade inferior das caixas de mancal de pedestal bipartidas',
      tag: 'CX-BASE',
      category: 'structural',
      material: 'Ferro fundido (no modelo)',
      tolerance: 'Ajuste do anel externo no alojamento: ' + MANUAL,
      simpleDefinition: 'É a metade de baixo de cada caixa de mancal, presa na base pelos pés.',
      mainFunction: 'Apoiar o anel externo do rolamento e transmitir a carga do eixo para a estrutura.',
      location: 'Uma em cada mancal, presa na chapa de assentamento.',
      relationshipWithOthers: 'Recebe a tampa por cima; o anel externo do rolamento assenta no alojamento semicircular.',
      typicalFailureModes: 'Alojamento gasto ou ovalizado (anel externo girando na caixa), trinca por pancada.',
      practicalExample: 'Marcas brilhantes em volta do alojamento mostram que o anel externo estava girando na caixa.',
      quickCheckQuestion: {
        question: 'A tampa de uma caixa pode ser trocada pela tampa da outra caixa?',
        options: ['Não: cada tampa é usinada junto com a sua base e tem que voltar para ela', 'Sim, são todas iguais', 'Só se forem da mesma cor'],
        correctIndex: 0,
        explanation: 'Em caixas bipartidas, base e tampa formam um par usinado junto. Marque as duas antes de desmontar.'
      },
      meshData: mesh(0, 'Fica fixa', '#4f6f8c')
    },
    {
      id: 'ba-cap-bolts',
      name: 'Parafusos das tampas',
      technicalName: 'Parafusos de fixação da tampa da caixa de mancal (2 por caixa)',
      tag: 'PARAF',
      category: 'fastener',
      material: 'Aço, classe de resistência conforme o fabricante',
      tolerance: 'Aperto com torquímetro: ' + MANUAL,
      simpleDefinition: 'São os parafusos que prendem a tampa de cima na base de cada caixa.',
      mainFunction: 'Fechar a caixa com a tampa encostada por igual, sem apertar o anel externo de forma desigual.',
      location: 'Dois em cada caixa, nas orelhas laterais.',
      relationshipWithOthers: 'Atravessam a tampa e rosqueiam na base.',
      typicalFailureModes: 'Aperto desigual (tampa torta, anel externo deformado), rosca danificada.',
      practicalExample: 'Um parafuso apertado demais de um lado pode ovalizar o alojamento e aquecer o rolamento.',
      quickCheckQuestion: {
        question: 'Como apertar os dois parafusos da tampa?',
        options: ['Alternando entre os dois, em etapas, até o valor do fabricante', 'Apertar um até o fim e depois o outro', 'O mais forte possível'],
        correctIndex: 0,
        explanation: 'Alternar em etapas fecha a tampa por igual.'
      },
      meshData: mesh(1, 'Chave combinada ou soquete', '#a7abb1')
    },
    {
      id: 'ba-housing-caps',
      name: 'Tampas das caixas de mancal',
      technicalName: 'Metade superior das caixas bipartidas, com graxeira',
      tag: 'CX-TAMPA',
      category: 'structural',
      material: 'Ferro fundido (no modelo)',
      tolerance: 'Par usinado com a base: não intercambiável',
      simpleDefinition: 'É a metade de cima de cada caixa. Tem a graxeira por onde entra a graxa.',
      mainFunction: 'Fechar o alojamento do rolamento e proteger contra sujeira; permitir a relubrificação.',
      location: 'Em cima de cada base, presa pelos dois parafusos.',
      relationshipWithOthers: 'Forma o alojamento junto com a base; a graxeira leva graxa até o rolamento.',
      typicalFailureModes: 'Graxeira entupida ou quebrada, tampa trocada entre caixas, trinca.',
      practicalExample: 'Mancal que não recebe graxa porque a graxeira entupiu: aquece e fica ruidoso.',
      quickCheckQuestion: {
        question: 'O que fazer antes de retirar as tampas?',
        options: ['Marcar cada tampa com a sua base', 'Pintar as tampas', 'Nada'],
        correctIndex: 0,
        explanation: 'A marcação garante que cada tampa volte para a base com que foi usinada.'
      },
      meshData: mesh(2, 'Mãos (tampa solta) e caneta marcadora', '#4f6f8c')
    },
    {
      id: 'ba-shaft',
      name: 'Eixo',
      technicalName: 'Eixo escalonado com assentos dos rolamentos, ressaltos, canais de anel elástico e rasgos de chaveta',
      tag: 'EIXO',
      category: 'transmission',
      material: 'Aço (no modelo)',
      tolerance: 'Diâmetros dos assentos e acabamento: ' + MANUAL,
      simpleDefinition: 'É a barra que gira. Recebe o giro pela polia e entrega pelo acoplamento.',
      mainFunction: 'Transmitir o giro e apoiar os rolamentos nos assentos, encostados nos ressaltos.',
      location: 'Atravessa as duas caixas de mancal.',
      relationshipWithOthers: 'Os anéis internos dos rolamentos ficam presos nos assentos; polia e acoplamento ficam nas pontas com chavetas.',
      typicalFailureModes: 'Assento gasto (anel interno girando no eixo), eixo empenado, rasgo de chaveta alargado, trinca no canto do ressalto.',
      practicalExample: 'Um anel interno "solto" desgasta o assento e deixa marcas de giro no eixo.',
      quickCheckQuestion: {
        question: 'Para que serve o ressalto (degrau) do eixo ao lado do rolamento?',
        options: ['Dar encosto ao anel interno e posicionar o rolamento no lugar certo', 'Só para enfeite', 'Aumentar a velocidade'],
        correctIndex: 0,
        explanation: 'O anel interno encosta no ressalto de um lado e é seguro pelo anel elástico do outro.'
      },
      meshData: mesh(3, 'Cinta e duas pessoas, ou talha (conforme o peso)', '#dfe2e6')
    },
    {
      id: 'ba-pulley',
      name: 'Polia em V',
      technicalName: 'Polia de dois canais para correias em V',
      tag: 'POLIA',
      category: 'transmission',
      material: 'Ferro fundido (no modelo)',
      tolerance: 'Perfil dos canais conforme a correia; ajuste no eixo: ' + MANUAL,
      simpleDefinition: 'É a roda com canais onde passam as correias que trazem o giro do motor.',
      mainFunction: 'Receber o giro das correias e passar para o eixo pela chaveta.',
      location: 'Na ponta do eixo, do lado do rolamento fixo.',
      relationshipWithOthers: 'Presa no eixo com chaveta; a tensão das correias puxa o eixo para o lado e carrega o rolamento mais próximo.',
      typicalFailureModes: 'Canais gastos (correia afunda e patina), polia desalinhada com a do motor, folga na chaveta.',
      practicalExample: 'Correias gastando de um lado só costumam indicar polias desalinhadas.',
      quickCheckQuestion: {
        question: 'Qual ferramenta é adequada para tirar a polia do eixo?',
        options: ['Saca-polias, apoiado na ponta do eixo', 'Martelo de aço batendo na polia', 'Alavanca de chave de fenda'],
        correctIndex: 0,
        explanation: 'O saca-polias puxa por igual sem bater: não empena o eixo nem danifica o rolamento.'
      },
      meshData: mesh(4, 'Saca-polias', '#5b6168')
    },
    {
      id: 'ba-coupling',
      name: 'Meia-luva do acoplamento',
      technicalName: 'Cubo de acoplamento elástico de garras com estrela de elastômero',
      tag: 'ACOPL',
      category: 'transmission',
      material: 'Aço (cubo) e elastômero (estrela), no modelo',
      tolerance: 'Desalinhamentos admissíveis e folga entre cubos: ' + MANUAL,
      simpleDefinition: 'É a metade do acoplamento que liga este eixo ao eixo da máquina acionada.',
      mainFunction: 'Transmitir o giro e tolerar pequenos desalinhamentos, com a estrela de borracha amortecendo choques.',
      location: 'Na ponta do eixo, do lado do rolamento livre.',
      relationshipWithOthers: 'Presa com chaveta; as garras encaixam na estrela e na outra meia-luva (não mostrada).',
      typicalFailureModes: 'Estrela gasta ou rachada, garras marcadas, desalinhamento que aquece os rolamentos.',
      practicalExample: 'Pó de borracha embaixo do acoplamento é sinal de estrela se desgastando — verifique o alinhamento.',
      quickCheckQuestion: {
        question: 'Um acoplamento elástico dispensa o alinhamento dos eixos?',
        options: ['Não: ele tolera só pequenos desvios; os eixos precisam ser alinhados', 'Sim, ele corrige qualquer desalinhamento', 'Só em baixa rotação'],
        correctIndex: 0,
        explanation: 'O desalinhamento além do admissível gasta a estrela e carrega os rolamentos dos dois lados.'
      },
      meshData: mesh(5, 'Saca-polias', '#c8ccd2')
    },
    {
      id: 'ba-keys',
      name: 'Chavetas',
      technicalName: 'Chavetas paralelas da polia e do acoplamento',
      tag: 'CHAVETA',
      category: 'fastener',
      material: 'Aço',
      tolerance: 'Dimensões conforme o eixo e a norma indicada no projeto',
      simpleDefinition: 'São as pecinhas retangulares que fazem a polia e o acoplamento girarem junto com o eixo.',
      mainFunction: 'Transmitir o giro entre o eixo e o cubo sem escorregar.',
      location: 'Nos rasgos das duas pontas do eixo.',
      relationshipWithOthers: 'Encaixam no rasgo do eixo e no rasgo do cubo da polia ou do acoplamento.',
      typicalFailureModes: 'Chaveta amassada ou cisalhada, rasgo alargado.',
      practicalExample: 'Polia "batendo" no eixo ao partir: a chaveta ou o rasgo está com folga.',
      quickCheckQuestion: {
        question: 'Chaveta amassada pode voltar para o eixo?',
        options: ['Não: troque por uma nova com a mesma especificação', 'Sim, basta desamassar com martelo', 'Sim, se passar graxa'],
        correctIndex: 0,
        explanation: 'Chaveta deformada não ajusta bem no rasgo e volta a falhar.'
      },
      meshData: mesh(6, 'Alicate universal ou punção de latão', '#d1d5db')
    },
    {
      id: 'ba-seal-pulley-side',
      name: 'Vedação do lado da polia',
      technicalName: 'Anel de vedação de lábio no lado de fora da caixa',
      tag: 'VED-P',
      category: 'sealing',
      material: 'Elastômero com armação (material conforme a temperatura e o ambiente)',
      tolerance: MANUAL,
      simpleDefinition: 'É o anel de borracha que fecha a caixa em volta do eixo, do lado da polia.',
      mainFunction: 'Manter a graxa dentro da caixa e a sujeira e a água fora.',
      location: 'No lado de fora da caixa do rolamento fixo.',
      relationshipWithOthers: 'O lábio trabalha sobre o eixo; precisa sair antes do rolamento ao desmontar por este lado.',
      typicalFailureModes: 'Lábio endurecido, rasgado ou gasto; sujeira entrando e contaminando a graxa.',
      practicalExample: 'Graxa escura e com areia dentro da caixa indica vedação falhando.',
      quickCheckQuestion: {
        question: 'Por que a vedação sai antes do rolamento?',
        options: ['Ela fica entre o rolamento e a ponta do eixo: o rolamento não passa com ela no caminho', 'Porque é mais leve', 'Não importa a ordem'],
        correctIndex: 0,
        explanation: 'A ordem de desmontagem segue o que está mais por fora primeiro.'
      },
      meshData: mesh(7, 'Mãos limpas', '#1c1d1f')
    },
    {
      id: 'ba-seal-coupling-side',
      name: 'Vedação do lado do acoplamento',
      technicalName: 'Anel de vedação de lábio no lado de fora da caixa',
      tag: 'VED-A',
      category: 'sealing',
      material: 'Elastômero com armação (material conforme a temperatura e o ambiente)',
      tolerance: MANUAL,
      simpleDefinition: 'É o anel de borracha que fecha a caixa em volta do eixo, do lado do acoplamento.',
      mainFunction: 'Manter a graxa dentro e a contaminação fora.',
      location: 'No lado de fora da caixa do rolamento livre.',
      relationshipWithOthers: 'Trabalha sobre o eixo; sai antes do rolamento livre.',
      typicalFailureModes: 'Lábio gasto ou rasgado; montagem torta.',
      practicalExample: 'Vazamento de graxa pela vedação depois de relubrificar demais.',
      quickCheckQuestion: {
        question: 'Uma vedação de lábio retirada deve ser reaproveitada?',
        options: ['Não: em geral troca-se por uma nova', 'Sim, sempre', 'Só se for lavada com solvente'],
        correctIndex: 0,
        explanation: 'A retirada costuma danificar o lábio. Na montagem, lubrifique o lábio e proteja-o dos cantos vivos do eixo.'
      },
      meshData: mesh(8, 'Mãos limpas', '#1c1d1f')
    },
    {
      id: 'ba-snap-rings',
      name: 'Anéis elásticos',
      technicalName: 'Anéis elásticos para eixo (externos)',
      tag: 'ANEL',
      category: 'fastener',
      material: 'Aço mola',
      tolerance: 'Dimensões conforme o canal do eixo e a norma indicada no projeto',
      simpleDefinition: 'São os anéis de aço que ficam nos canais do eixo e seguram os rolamentos no lugar.',
      mainFunction: 'Impedir que o anel interno do rolamento saia do assento no sentido da ponta do eixo.',
      location: 'Nos canais do eixo, encostados por fora de cada rolamento.',
      relationshipWithOthers: 'Seguram os anéis internos contra os ressaltos do eixo.',
      typicalFailureModes: 'Anel deformado (perde a pressão), saltando do canal; canal gasto.',
      practicalExample: 'Anel elástico aberto demais na retirada não segura mais: troque por um novo.',
      quickCheckQuestion: {
        question: 'Qual ferramenta é a certa para retirar o anel elástico do eixo?',
        options: ['Alicate para anéis elásticos externos', 'Chave de fenda como alavanca', 'Alicate universal'],
        correctIndex: 0,
        explanation: 'O alicate de anéis abre o anel por igual pelas orelhas, sem deformar e sem ele escapar.'
      },
      meshData: mesh(9, 'Alicate para anéis elásticos externos', '#2d3136')
    },
    {
      id: 'ba-roller-bearing',
      name: 'Rolamento de rolos cilíndricos (lado livre)',
      technicalName: 'Rolamento de rolos cilíndricos tipo NU — rebordos só no anel externo',
      tag: 'ROL-LIVRE',
      category: 'bearing',
      material: 'Aço para rolamentos (no modelo)',
      tolerance: 'Ajustes e folga interna: ' + MANUAL,
      simpleDefinition: 'É o rolamento do lado do acoplamento. Os rolos deixam o anel interno escorregar para os lados.',
      mainFunction: 'Apoiar a carga radial e deixar o eixo crescer ou encolher com a temperatura sem forçar os rolamentos.',
      location: 'Dentro da caixa do lado do acoplamento.',
      relationshipWithOthers: 'O anel interno é preso no eixo; o anel externo fica na caixa. Como o anel interno não tem rebordos, o eixo pode se deslocar axialmente.',
      typicalFailureModes: 'Marcas de rolo nas pistas (montagem forçada), desgaste por contaminação, falha por falta de lubrificação.',
      practicalExample: 'Num rolamento tipo NU, o anel interno sai separado do conjunto de rolos e anel externo.',
      quickCheckQuestion: {
        question: 'Por que este conjunto usa um rolamento livre de um lado?',
        options: ['Para o eixo poder dilatar com o calor sem carregar os rolamentos no sentido axial', 'Para economizar graxa', 'Porque o rolamento livre é mais barato'],
        correctIndex: 0,
        explanation: 'Dois rolamentos fixos prenderiam o eixo; a dilatação viraria força axial e aquecimento.'
      },
      meshData: mesh(10, 'Extrator com placa separadora (força no anel interno)', '#c8ccd2')
    },
    {
      id: 'ba-ball-bearing',
      name: 'Rolamento rígido de esferas (lado fixo)',
      technicalName: 'Rolamento rígido de uma carreira de esferas',
      tag: 'ROL-FIXO',
      category: 'bearing',
      material: 'Aço para rolamentos; gaiola de latão (no modelo)',
      tolerance: 'Ajustes e folga interna: ' + MANUAL,
      simpleDefinition: 'É o rolamento do lado da polia. Ele "segura" o eixo no lugar para os lados.',
      mainFunction: 'Apoiar a carga radial e também posicionar o eixo axialmente nos dois sentidos.',
      location: 'Dentro da caixa do lado da polia.',
      relationshipWithOthers: 'Anel interno preso entre o ressalto e o anel elástico; anel externo travado axialmente na caixa.',
      typicalFailureModes: 'Ruído e aquecimento por falta de lubrificação ou contaminação; marcas nas pistas por montagem com pancada.',
      practicalExample: 'Rolamento montado batendo no anel externo, com o aperto no anel interno: as esferas marcam as pistas e o rolamento já nasce ruidoso.',
      quickCheckQuestion: {
        question: 'Na retirada, onde o extrator deve aplicar a força?',
        options: ['No anel interno, que é o que está apertado no eixo', 'No anel externo', 'Nas esferas'],
        correctIndex: 0,
        explanation: 'A força passa só pelo anel com aperto. Força pelas esferas danifica as pistas.'
      },
      meshData: mesh(11, 'Extrator com placa separadora (força no anel interno)', '#c8ccd2')
    }
  ],
  disassemblySteps: []
};

/** Nomes curtos para rótulos e listas do laboratório. */
export const BEARING_ASSEMBLY_SHORT_NAMES: Record<string, string> = {
  'ba-base': 'Chapa de base',
  'ba-housing-bases': 'Bases das caixas',
  'ba-housing-caps': 'Tampas das caixas',
  'ba-cap-bolts': 'Parafusos das tampas',
  'ba-shaft': 'Eixo',
  'ba-pulley': 'Polia em V',
  'ba-coupling': 'Acoplamento',
  'ba-keys': 'Chavetas',
  'ba-seal-pulley-side': 'Vedação (lado polia)',
  'ba-seal-coupling-side': 'Vedação (lado acopl.)',
  'ba-snap-rings': 'Anéis elásticos',
  'ba-roller-bearing': 'Rolamento livre (rolos)',
  'ba-ball-bearing': 'Rolamento fixo (esferas)'
};

export const BEARING_ASSEMBLY_PART_SAFETY: Record<string, string> = {
  'ba-base': 'Base fixa na estrutura: não fique embaixo de peças içadas durante a troca.',
  'ba-housing-bases': 'Proteja o alojamento com pano limpo enquanto o eixo estiver fora: sujeira aqui vai direto para o rolamento.',
  'ba-housing-caps': 'Marque cada tampa com a sua base. Tampas não são intercambiáveis.',
  'ba-cap-bolts': 'Aperto alternado, em etapas, com torquímetro no valor do fabricante.',
  'ba-shaft': 'Eixo pesado: use cinta e talha ou duas pessoas. Apoie em prismas em V, nunca direto no chão.',
  'ba-pulley': 'Polia pesada pode cair ao soltar: segure-a antes do último puxão do saca-polias.',
  'ba-coupling': 'Antes de soltar o acoplamento, a máquina acionada também precisa estar parada e bloqueada.',
  'ba-keys': 'Guarde as chavetas: sem elas, polia e acoplamento patinam no eixo.',
  'ba-seal-pulley-side': 'Na montagem, proteja o lábio dos cantos vivos e do rasgo de chaveta.',
  'ba-seal-coupling-side': 'Na montagem, proteja o lábio dos cantos vivos e do rasgo de chaveta.',
  'ba-snap-rings': 'Anel elástico pode saltar ao abrir: use óculos de proteção e o alicate certo.',
  'ba-roller-bearing': 'Use óculos. Extrator apoiado no anel interno; nunca aqueça com chama.',
  'ba-ball-bearing': 'Use óculos. Extrator apoiado no anel interno; rolamento retirado com força pelas esferas não é reaproveitado.'
};

const LIFT: Vec3 = [0, 1.4, 3.0];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const SHAFT_UNIT = [
  'ba-shaft',
  'ba-pulley',
  'ba-coupling',
  'ba-keys',
  'ba-seal-pulley-side',
  'ba-seal-coupling-side',
  'ba-snap-rings',
  'ba-roller-bearing',
  'ba-ball-bearing'
];

export const BEARING_ASSEMBLY_LAB: MachineLabConfig = {
  machineId: BEARING_ASSEMBLY_ID,
  purpose:
    'Quase toda máquina que gira tem um eixo apoiado em rolamentos. Aqui você vê o arranjo mais comum: um rolamento FIXO, que segura o eixo para os lados, e um rolamento LIVRE, que deixa o eixo dilatar com o calor. Cada um tem a sua caixa de mancal, as suas vedações e a sua forma de ser preso no eixo.',
  whereUsed: 'Transportadores, ventiladores, bombas com mancal separado, redutores, máquinas com transmissão por polia e correia.',
  source: 'procedural-bearing-assembly',
  floorY: -1.45,
  cutawayParts: ['ba-housing-caps', 'ba-housing-bases', 'ba-cap-bolts', 'ba-ball-bearing', 'ba-roller-bearing', 'ba-seal-pulley-side', 'ba-seal-coupling-side'],
  operating: {
    label: 'Ver girando',
    observe:
      'Repare no que gira junto com o eixo — polia, chavetas, anéis elásticos e acoplamento — e no que fica parado: as caixas e a base. Dentro do rolamento, o anel interno gira com o eixo e o externo fica preso na caixa. O giro é didático e lento: não representa a rotação real.'
  },
  preWorkSafety: [
    'Desligar o motor, bloquear com cadeado e etiqueta e testar a partida (LOTO). Bloquear também a máquina acionada, se ela puder girar sozinha.',
    'Com a máquina parada e bloqueada, soltar e retirar as correias e desligar o acoplamento antes de abrir os mancais.',
    'Separar as ferramentas certas: saca-polias, extrator com placa separadora, alicate de anéis, torquímetro.',
    'Trabalhar com mãos e bancada limpas: o maior inimigo do rolamento é a contaminação.'
  ],
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D construído no próprio projeto (licença CC0). Mostra o arranjo rolamento fixo + rolamento livre com caixas de pedestal bipartidas, mas não representa um fabricante nem um tamanho comercial. Foram simplificados: as vedações do lado de dentro das caixas, os anéis de fixação axial do rolamento fixo na caixa, a geometria interna das pistas e a outra metade do acoplamento. Ajustes, folgas, torques, tipo e quantidade de graxa vêm sempre do projeto e do catálogo do fabricante.'
  },
  disassembly: [
    {
      partId: 'ba-cap-bolts',
      title: 'Soltar os parafusos das tampas',
      instruction: 'Com a máquina bloqueada e as correias e o acoplamento já soltos, solte os dois parafusos de cada tampa, alternando entre eles.',
      tool: 'Chave combinada ou soquete com catraca',
      toolWhy: 'O anel estriado ou o soquete abraçam a cabeça inteira e não arredondam o sextavado.',
      observe: 'Confira as roscas e se a tampa estava encostada por igual dos dois lados.',
      toolDistractors: [
        { tool: 'Chave inglesa (ajustável)', why: 'A folga da boca tende a arredondar parafusos apertados.' },
        { tool: 'Alicate de pressão', why: 'Morde e estraga a cabeça; não é ferramenta de aperto.' }
      ],
      moves: { 'ba-cap-bolts': [[0, 1.6, 0], [0, 1.6, -3.4]] }
    },
    {
      partId: 'ba-housing-caps',
      title: 'Marcar e retirar as tampas',
      instruction: 'Marque cada tampa com a sua base (caneta ou punção leve fora da área de vedação) e levante as tampas.',
      tool: 'Mãos e caneta marcadora',
      toolWhy: 'A tampa sai solta. A marcação garante que cada tampa volte para a base com que foi usinada.',
      observe: 'Olhe a graxa: cor, cheiro de queimado, partículas ou água indicam o que aconteceu com o rolamento.',
      toolDistractors: [{ tool: 'Chave de fenda como alavanca na junta', why: 'Marca as faces da junta e pode trincar o ferro fundido.' }],
      moves: { 'ba-housing-caps': [[0, 1.2, 0], [0, 1.2, -3.0], [0, 0.6, -3.0]] }
    },
    {
      partId: 'ba-shaft',
      title: 'Levantar o eixo com os rolamentos',
      instruction:
        'Levante o eixo inteiro — com rolamentos, vedações, polia e acoplamento — reto para cima e leve até a bancada. Apoie em prismas em V.',
      tool: 'Cinta e talha (ou duas pessoas, conforme o peso)',
      toolWhy: 'O conjunto sai inteiro das caixas bipartidas. Levantar torto bate os rolamentos nas bordas das bases.',
      safety: 'Nunca fique embaixo da carga suspensa. Confira a capacidade da talha e da cinta.',
      observe: 'Veja se o anel externo do rolamento fixo tinha marcas de giro no alojamento.',
      toolDistractors: [{ tool: 'Alavanca embaixo do eixo', why: 'Pode empenar o eixo e soltar o conjunto de forma descontrolada.' }],
      moves: Object.fromEntries(SHAFT_UNIT.map((id) => [id, [[0, 1.4, 0], LIFT] as Vec3[]]))
    },
    {
      partId: 'ba-pulley',
      title: 'Retirar a polia',
      instruction: 'Solte o parafuso de trava da polia (se houver) e extraia a polia com o saca-polias apoiado no centro da ponta do eixo.',
      tool: 'Saca-polias',
      toolWhy: 'Puxa a polia por igual, sem pancadas que empenam o eixo ou marcam as pistas do rolamento.',
      observe: 'Canais da polia gastos de um lado só sugerem desalinhamento com a polia do motor.',
      toolDistractors: [
        { tool: 'Martelo de aço na polia', why: 'A pancada passa pelo eixo até o rolamento e marca as pistas.' },
        { tool: 'Alavancas de chave de fenda', why: 'Puxa torto e quebra a borda da polia.' }
      ],
      moves: { 'ba-pulley': [LIFT, add(LIFT, [-1.9, 0, 0])] }
    },
    {
      partId: 'ba-coupling',
      title: 'Retirar a meia-luva do acoplamento',
      instruction: 'Extraia o cubo do acoplamento com o saca-polias. Guarde a estrela elástica para inspeção.',
      tool: 'Saca-polias',
      toolWhy: 'O cubo tem ajuste no eixo; o saca-polias puxa reto e controlado.',
      observe: 'Estrela rachada ou com pó de borracha indica desalinhamento entre os eixos.',
      toolDistractors: [{ tool: 'Martelo de aço', why: 'Danifica as garras e o eixo.' }],
      moves: { 'ba-coupling': [LIFT, add(LIFT, [1.9, 0, 0])] }
    },
    {
      partId: 'ba-keys',
      title: 'Retirar as chavetas',
      instruction: 'Retire as duas chavetas dos rasgos das pontas do eixo e guarde-as identificadas.',
      tool: 'Alicate universal ou punção de latão',
      toolWhy: 'Saem com pouca força; o latão não marca o rasgo.',
      observe: 'Chaveta amassada ou rasgo alargado indicam folga ou sobrecarga.',
      toolDistractors: [{ tool: 'Chave de fenda e martelo de aço', why: 'A ponta escorrega e marca o rasgo.' }],
      moves: { 'ba-keys': [LIFT, add(LIFT, [0, 0.6, 0])] }
    },
    {
      partId: 'ba-seal-pulley-side',
      title: 'Retirar a vedação do lado da polia',
      instruction: 'Deslize a vedação para fora pela ponta do eixo, sem forçar o lábio contra o rasgo de chaveta.',
      tool: 'Mãos limpas',
      toolWhy: 'A vedação sai deslizando. Ferramentas cortam o lábio.',
      observe: 'Lábio endurecido, rasgado ou com sulco no eixo embaixo dele: troque e verifique o eixo.',
      toolDistractors: [{ tool: 'Chave de fenda', why: 'Rasga o lábio e risca o eixo.' }],
      moves: { 'ba-seal-pulley-side': [LIFT, add(LIFT, [-1.5, 0, 0]), add(LIFT, [-1.5, 0, -1.4])] }
    },
    {
      partId: 'ba-seal-coupling-side',
      title: 'Retirar a vedação do lado do acoplamento',
      instruction: 'Deslize a outra vedação pela ponta do eixo do lado do acoplamento.',
      tool: 'Mãos limpas',
      toolWhy: 'Igual à outra: sai deslizando.',
      observe: 'Compare as duas vedações: a mais suja costuma estar do lado mais exposto a pó ou água.',
      toolDistractors: [{ tool: 'Alicate universal', why: 'Morde e deforma a armação da vedação.' }],
      moves: { 'ba-seal-coupling-side': [LIFT, add(LIFT, [1.5, 0, 0]), add(LIFT, [1.5, 0, -1.4])] }
    },
    {
      partId: 'ba-snap-rings',
      title: 'Retirar os anéis elásticos',
      instruction: 'Abra cada anel pelas orelhas com o alicate de anéis e tire-o do canal do eixo.',
      tool: 'Alicate para anéis elásticos externos',
      toolWhy: 'As pontas entram nos furos das orelhas e abrem o anel por igual, sem deformá-lo.',
      safety: 'Use óculos: o anel pode saltar.',
      observe: 'Anel deformado ou canal gasto: troque o anel; avalie o eixo.',
      toolDistractors: [
        { tool: 'Chave de fenda como alavanca', why: 'O anel escapa, voa e deforma; o canal fica marcado.' },
        { tool: 'Alicate universal', why: 'Não abre o anel: só amassa.' }
      ],
      moves: { 'ba-snap-rings': [LIFT, add(LIFT, [0, 0.9, 0])] }
    },
    {
      partId: 'ba-roller-bearing',
      title: 'Extrair o rolamento livre (rolos)',
      instruction: 'Monte a placa separadora atrás do anel interno e extraia o rolamento pela ponta do eixo, puxando reto.',
      tool: 'Extrator com placa separadora',
      toolWhy: 'A placa apoia no anel interno — o que tem aperto no eixo — e a força não passa pelos rolos.',
      safety: 'Use óculos. Mantenha o corpo fora da linha de puxada.',
      observe: 'Pistas com marcas, descascamento ou cor de aquecimento: guarde o rolamento para a análise da falha.',
      toolDistractors: [
        { tool: 'Saca-polias com as garras no anel externo', why: 'A força passaria pelos rolos e marcaria as pistas.' },
        { tool: 'Maçarico para aquecer', why: 'Chama aquece sem controle e pode alterar o material; os fabricantes de rolamentos orientam a não usar chama.' }
      ],
      moves: { 'ba-roller-bearing': [LIFT, add(LIFT, [1.9, 0, 0]), add(LIFT, [1.9, 0, 1.5])] }
    },
    {
      partId: 'ba-ball-bearing',
      title: 'Extrair o rolamento fixo (esferas)',
      instruction: 'Repita com o rolamento de esferas: placa separadora no anel interno e extração reta pela ponta do eixo.',
      tool: 'Extrator com placa separadora',
      toolWhy: 'Força só no anel interno. O rolamento pode ser reaproveitado se a inspeção aprovar.',
      safety: 'Use óculos de proteção.',
      observe: 'Com o eixo limpo, confira os assentos: marcas de giro indicam anel interno solto.',
      toolDistractors: [
        { tool: 'Martelo e punção de aço no anel externo', why: 'A pancada passa pelas esferas e marca as pistas.' },
        { tool: 'Alicate de pressão', why: 'Não tem como puxar um rolamento com aperto.' }
      ],
      moves: { 'ba-ball-bearing': [LIFT, add(LIFT, [-2.0, 0, 0]), add(LIFT, [-2.0, 0, 1.5])] }
    }
  ],
  explode: {
    'ba-base': [0, 0, 0],
    'ba-housing-bases': [0, 0, 0],
    'ba-housing-caps': [0, 1.5, 0],
    'ba-cap-bolts': [0, 2.8, 0],
    'ba-shaft': [0, 0, 2.8],
    'ba-ball-bearing': [-1.0, 0, 2.8],
    'ba-roller-bearing': [1.0, 0, 2.8],
    'ba-seal-pulley-side': [-1.7, 0, 2.8],
    'ba-seal-coupling-side': [1.7, 0, 2.8],
    'ba-snap-rings': [0, 0.6, 2.8],
    'ba-keys': [0, 0.8, 2.8],
    'ba-pulley': [-2.3, 0, 2.8],
    'ba-coupling': [2.3, 0, 2.8]
  },
  identify: [
    {
      partId: 'ba-ball-bearing',
      prompt: 'Clique no rolamento FIXO — o de esferas, que segura o eixo para os lados.',
      hint: 'Fica na caixa do lado da polia. Ligue a vista em corte se precisar.',
      needsXray: true
    },
    {
      partId: 'ba-roller-bearing',
      prompt: 'Clique no rolamento LIVRE — o de rolos cilíndricos, que deixa o eixo dilatar.',
      hint: 'Fica na caixa do lado do acoplamento.',
      needsXray: true
    },
    { partId: 'ba-snap-rings', prompt: 'Clique nos anéis elásticos que seguram os rolamentos no eixo.', hint: 'São anéis finos e escuros, encostados por fora de cada rolamento.', needsXray: true },
    { partId: 'ba-housing-caps', prompt: 'Clique nas tampas das caixas de mancal — as que têm a graxeira.', hint: 'São as metades de cima das caixas.' }
  ],
  checkQuestionIds: ['ind-01', 'ind-02', 'ind-03', 'ind-04'],
  lessonId: 'lesson-gearbox-fundamentals'
};
