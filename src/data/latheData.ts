import type { MachineData, MechanicalPart3D } from './mechanicalMachines';
import type { MachineLabConfig } from './labMission';
import type { OrderTask } from './lessonStructure';

/**
 * Torno mecânico convencional (paralelo) — dados do laboratório de usinagem.
 *
 * Conteúdo de nível introdutório para identificação de componentes, segurança e visão geral de uma operação.
 * Não substitui o treinamento prático: operar um torno real exige capacitação, máquina adequada à NR-12
 * e supervisão de um instrutor. Valores de referência (materiais, ajustes) são ilustrativos.
 */

import { LATHE_ID } from './latheStages';
export { LATHE_ID };

type PartInput = Omit<MechanicalPart3D, 'meshData' | 'tag' | 'tolerance' | 'quickCheckQuestion' | 'practicalExample'> & {
  shortName: string;
  tool: string;
  safety?: string;
};

// meshData só é usado por modelos .glb; o torno é procedural (latheModel.ts).
const toPart = (p: PartInput): MechanicalPart3D => ({
  id: p.id,
  name: p.name,
  technicalName: p.technicalName,
  tag: p.id.replace('lathe-', '').toUpperCase(),
  category: p.category,
  material: p.material,
  tolerance: '—',
  simpleDefinition: p.simpleDefinition,
  mainFunction: p.mainFunction,
  location: p.location,
  relationshipWithOthers: p.relationshipWithOthers,
  typicalFailureModes: p.typicalFailureModes,
  practicalExample: '',
  quickCheckQuestion: { question: '', options: [], correctIndex: 0, explanation: '' },
  meshData: {
    type: 'housing',
    color: '#5b7366',
    metalness: 0.2,
    roughness: 0.55,
    dimensions: [1, 1, 1],
    basePosition: [0, 0, 0],
    explodedOffset: [0, 0, 0],
    disassemblyOrder: 0,
    requiredTool: p.tool
  }
});

const PARTS: PartInput[] = [
  {
    id: 'lathe-bed',
    shortName: 'Barramento',
    name: 'Barramento',
    technicalName: 'Barramento com guias prismáticas e planas',
    category: 'structural',
    material: 'Ferro fundido, com guias temperadas e retificadas',
    simpleDefinition: 'É a “espinha” do torno: a base longa e rígida onde ficam o cabeçote fixo, o carro e o cabeçote móvel.',
    mainFunction: 'Guiar o carro e o cabeçote móvel em linha reta, paralela ao eixo da peça. A precisão do torno depende das guias.',
    location: 'Ao longo de toda a máquina, apoiado nos pedestais.',
    relationshipWithOthers: 'O carro desliza sobre as guias externas; o cabeçote móvel, sobre as internas. A cremalheira presa sob a guia dianteira move o carro pelo volante do avental.',
    typicalFailureModes: 'Desgaste das guias perto da placa (onde mais se trabalha), riscos causados por cavacos e falta de lubrificação.',
    tool: 'Pincel ou gancho para cavacos; óleo de guias indicado pelo fabricante',
    safety: 'Não apoie ferramentas nem instrumentos sobre as guias. Retire cavacos com pincel ou gancho, nunca com a mão.'
  },
  {
    id: 'lathe-headstock',
    shortName: 'Cabeçote fixo',
    name: 'Cabeçote fixo',
    technicalName: 'Cabeçote fixo com caixa de velocidades e eixo-árvore',
    category: 'transmission',
    material: 'Carcaça de ferro fundido; engrenagens e eixo-árvore de aço',
    simpleDefinition: 'É a caixa à esquerda que faz a peça girar. Dentro dela ficam o eixo-árvore e as engrenagens que mudam a rotação.',
    mainFunction: 'Transmitir o movimento do motor ao eixo-árvore e permitir escolher a rotação pelas alavancas, conforme a tabela da máquina.',
    location: 'Extremidade esquerda do barramento.',
    relationshipWithOthers: 'A placa é montada no nariz do eixo-árvore. Do cabeçote também sai o movimento para a caixa de avanços, que aciona o fuso e a vara.',
    typicalFailureModes: 'Nível de óleo baixo, ruído nas engrenagens, folga ou aquecimento nos rolamentos do eixo-árvore.',
    tool: 'Visor de nível de óleo; tabela de rotações da máquina',
    safety: 'Em caixas de engrenagens convencionais, troque a rotação só com a máquina parada. Engatar em movimento quebra dentes.'
  },
  {
    id: 'lathe-emergency-stop',
    shortName: 'Botão de emergência',
    name: 'Botão de parada de emergência',
    technicalName: 'Dispositivo de parada de emergência (botão tipo cogumelo com trava)',
    category: 'structural',
    material: 'Botão vermelho sobre fundo amarelo',
    simpleDefinition: 'O botão vermelho grande que para a máquina imediatamente em caso de perigo.',
    mainFunction: 'Interromper o movimento perigoso o mais rápido possível. Ele trava ao ser pressionado e só é liberado de propósito.',
    location: 'Na frente do cabeçote fixo, ao alcance do operador.',
    relationshipWithOthers: 'Corta o comando do motor principal. Não substitui o botão de parada normal nem as proteções.',
    typicalFailureModes: 'Botão obstruído por objetos, sem teste periódico ou com o circuito de segurança desativado.',
    tool: 'Teste de funcionamento antes do uso, conforme o procedimento da oficina',
    safety: 'A NR-12 exige dispositivos de parada de emergência nas máquinas. Saiba onde ele está antes de ligar o torno.'
  },
  {
    id: 'lathe-feed-gearbox',
    shortName: 'Caixa de avanços',
    name: 'Caixa de avanços e roscas',
    technicalName: 'Caixa de câmbio de avanços (tipo Norton)',
    category: 'transmission',
    material: 'Carcaça de ferro fundido; engrenagens de aço',
    simpleDefinition: 'Caixa com alavancas que escolhe a velocidade do avanço automático e o passo das roscas.',
    mainFunction: 'Transformar a rotação vinda do cabeçote em diferentes velocidades para o fuso e para a vara.',
    location: 'Na frente do barramento, abaixo do cabeçote fixo.',
    relationshipWithOthers: 'Recebe o movimento do cabeçote e entrega ao fuso (roscas) e à vara (avanços de cilindrar e facear).',
    typicalFailureModes: 'Alavancas fora de posição, engrenagens desgastadas, falta de óleo.',
    tool: 'Tabela de avanços e roscas fixada na própria caixa',
    safety: 'Selecione os avanços com a máquina parada, conforme a tabela da caixa.'
  },
  {
    id: 'lathe-leadscrew',
    shortName: 'Fuso e vara',
    name: 'Fuso e vara',
    technicalName: 'Fuso de rosca trapezoidal, vara ranhurada e barra de comando',
    category: 'transmission',
    material: 'Aço',
    simpleDefinition: 'Os eixos longos na frente do barramento. O fuso (com rosca) serve para abrir roscas; a vara (lisa, com rasgo) faz os avanços automáticos.',
    mainFunction: 'Levar o movimento da caixa de avanços até o avental do carro, para que ele avance sozinho com velocidade constante.',
    location: 'Ao longo da frente do barramento, da caixa de avanços até o mancal da ponta direita.',
    relationshipWithOthers: 'O fuso aciona o carro pela porca bipartida (para roscas). A vara aciona as engrenagens do avental (para cilindrar e facear).',
    typicalFailureModes: 'Rosca do fuso gasta, sujeira e cavacos na rosca, pino de segurança rompido.',
    tool: 'Pincel para limpeza e óleo',
    safety: 'Nunca encoste roupas ou panos no fuso e na vara girando: eles podem enrolar o tecido.'
  },
  {
    id: 'lathe-chuck',
    shortName: 'Placa',
    name: 'Placa universal de 3 castanhas',
    technicalName: 'Placa universal autocentrante de 3 castanhas',
    category: 'structural',
    material: 'Corpo de aço ou ferro fundido',
    simpleDefinition: 'O “prato” preso na ponta do eixo-árvore que segura e gira a peça.',
    mainFunction: 'Fixar a peça e centralizá-la: ao girar a chave, as três castanhas se movem juntas, por isso a peça redonda fica centrada.',
    location: 'No nariz do eixo-árvore, à direita do cabeçote fixo.',
    relationshipWithOthers: 'Gira junto com o eixo-árvore. As castanhas deslizam nas ranhuras da face da placa.',
    typicalFailureModes: 'Castanhas gastas (a peça perde a centragem), sujeira nas ranhuras, rosca interna danificada.',
    tool: 'Chave da placa (retirar logo após o aperto)',
    safety: 'Nunca deixe a chave na placa. Ao ligar o torno, ela é arremessada com muita força.'
  },
  {
    id: 'lathe-jaws',
    shortName: 'Castanhas',
    name: 'Castanhas',
    technicalName: 'Castanhas escalonadas (duras) da placa universal',
    category: 'fastener',
    material: 'Aço temperado',
    simpleDefinition: 'As três garras escalonadas que apertam a peça.',
    mainFunction: 'Prender a peça com firmeza. Os degraus permitem fixar diâmetros diferentes; muitas placas aceitam castanhas invertidas para peças grandes.',
    location: 'Na face da placa, a 120° uma da outra.',
    relationshipWithOthers: 'São movidas pela espiral interna da placa. Encostam na peça, que também pode ser apoiada na ponta do cabeçote móvel.',
    typicalFailureModes: 'Desgaste ou boca aberta (castanhas em “sino”), que deixa a peça presa só pela ponta.',
    tool: 'Chave da placa',
    safety: 'Prenda a peça com comprimento suficiente dentro das castanhas. Peça mal presa pode se soltar girando.'
  },
  {
    id: 'lathe-workpiece',
    shortName: 'Peça',
    name: 'Peça (barra redonda)',
    technicalName: 'Peça em usinagem — barra de aço entre placa e ponta',
    category: 'structural',
    material: 'Aço carbono (exemplo)',
    simpleDefinition: 'A barra que está sendo torneada. A parte brilhante à direita já foi usinada com diâmetro menor.',
    mainFunction: 'É o que se quer fabricar: o torno remove material girando a peça contra a ferramenta.',
    location: 'Entre as castanhas da placa e a ponta do cabeçote móvel.',
    relationshipWithOthers: 'Presa pela placa e apoiada na ponta rotativa. A ferramenta corta enquanto o carro avança.',
    typicalFailureModes: 'Vibração quando está muito longa sem apoio; medida errada por desgaste da ferramenta ou medição incorreta.',
    tool: 'Paquímetro ou micrômetro para conferir as medidas',
    safety: 'Peças longas precisam de apoio na contraponta. Meça só com a máquina parada.'
  },
  {
    id: 'lathe-carriage',
    shortName: 'Carro principal',
    name: 'Carro principal (sela e avental)',
    technicalName: 'Carro longitudinal: sela sobre as guias e avental com mecanismos de avanço',
    category: 'transmission',
    material: 'Ferro fundido',
    simpleDefinition: 'O conjunto que anda para a esquerda e para a direita sobre o barramento, levando a ferramenta.',
    mainFunction: 'Fazer o movimento longitudinal (ao longo da peça), à mão pelo volante ou automaticamente pela vara ou pelo fuso.',
    location: 'Sobre as guias, entre o cabeçote fixo e o cabeçote móvel.',
    relationshipWithOthers: 'Carrega o carro transversal, o carro superior e o porta-ferramenta. O avental (frente) tem o volante, a alavanca de avanço e a da porca bipartida.',
    typicalFailureModes: 'Folga na sela, falta de lubrificação, engate do avanço com a alavanca em posição errada.',
    tool: 'Volante do avental',
    safety: 'Antes de ligar o avanço automático, confira o curso: o carro não pode chegar até a placa girando.'
  },
  {
    id: 'lathe-cross-slide',
    shortName: 'Carro transversal',
    name: 'Carro transversal',
    technicalName: 'Carro transversal com fuso, anel graduado e régua de ajuste',
    category: 'transmission',
    material: 'Ferro fundido; fuso de aço',
    simpleDefinition: 'O carro que se move para frente e para trás, em direção ao centro da peça.',
    mainFunction: 'Definir a profundidade de corte ao cilindrar e fazer o faceamento (corte da face da peça).',
    location: 'Em cima da sela do carro principal.',
    relationshipWithOthers: 'Leva o carro superior. O anel graduado do volante mostra quanto a ferramenta avançou.',
    typicalFailureModes: 'Folga no fuso (o anel “volta” sem a ferramenta mexer), régua de ajuste solta.',
    tool: 'Volante com anel graduado',
    safety: 'Em alguns tornos o anel indica o avanço no raio; em outros, já indica a redução no diâmetro. Confira na máquina antes de cortar.'
  },
  {
    id: 'lathe-compound-rest',
    shortName: 'Carro superior',
    name: 'Carro superior (espera)',
    technicalName: 'Carro superior com base giratória graduada',
    category: 'transmission',
    material: 'Ferro fundido',
    simpleDefinition: 'O carro pequeno de cima, que pode ser girado para trabalhar em ângulo.',
    mainFunction: 'Dar movimentos finos e, com a base girada, tornear chanfros e cones curtos.',
    location: 'Sobre o carro transversal, embaixo do porta-ferramenta.',
    relationshipWithOthers: 'Apoia o porta-ferramenta. A base graduada indica o ângulo em que ele foi girado.',
    typicalFailureModes: 'Parafusos da base soltos (o ângulo muda durante o corte), balanço excessivo do carro estendido.',
    tool: 'Chave para travar a base giratória',
    safety: 'Mantenha o carro superior pouco estendido para reduzir vibração.'
  },
  {
    id: 'lathe-tool-post',
    shortName: 'Porta-ferramenta',
    name: 'Porta-ferramenta (castelo)',
    technicalName: 'Porta-ferramenta quádruplo (castelo) com tampa de aperto',
    category: 'fastener',
    material: 'Aço',
    simpleDefinition: 'O bloco que segura a ferramenta de corte. Este modelo aceita até quatro ferramentas.',
    mainFunction: 'Fixar a ferramenta com firmeza e na altura certa. Girando o castelo, troca-se de ferramenta rapidamente.',
    location: 'Em cima do carro superior.',
    relationshipWithOthers: 'Os parafusos da tampa prendem a ferramenta; o manípulo trava o castelo no carro superior.',
    typicalFailureModes: 'Parafusos de aperto danificados, ferramenta presa com muito balanço.',
    tool: 'Chave do porta-ferramenta',
    safety: 'Deixe a ferramenta com o menor balanço possível e retire a chave do castelo antes de ligar.'
  },
  {
    id: 'lathe-cutting-tool',
    shortName: 'Ferramenta de corte',
    name: 'Ferramenta de corte',
    technicalName: 'Ferramenta de tornear (haste com pastilha)',
    category: 'fastener',
    material: 'Haste de aço com pastilha de metal duro (também existem ferramentas inteiras de aço rápido)',
    simpleDefinition: 'A ponta dura que remove o material da peça, formando o cavaco.',
    mainFunction: 'Cortar a peça. A geometria da ponta e o material da ferramenta são escolhidos conforme o material da peça e a operação.',
    location: 'Presa no porta-ferramenta, com a aresta de corte na altura do centro da peça.',
    relationshipWithOthers: 'Recebe os movimentos dos carros. A rotação vem da peça, não da ferramenta.',
    typicalFailureModes: 'Desgaste ou quebra da aresta; ferramenta acima ou abaixo do centro (deixa um “pino” no centro ao facear e piora o corte).',
    tool: 'Calço e ponta do cabeçote móvel para acertar a altura do centro',
    safety: 'Arestas de corte e cavacos são afiados e quentes. Use óculos de proteção e não retire cavacos com a mão.'
  },
  {
    id: 'lathe-chuck-guard',
    shortName: 'Proteção da placa',
    name: 'Proteção da placa',
    technicalName: 'Proteção móvel da placa com dobradiça (e, em máquinas adequadas, chave de intertravamento)',
    category: 'structural',
    material: 'Chapa de aço (algumas têm visor de policarbonato)',
    simpleDefinition: 'A capa amarela articulada que cobre a placa enquanto ela gira.',
    mainFunction: 'Impedir o contato com a placa girando e segurar cavacos e fluido de corte.',
    location: 'Sobre a placa, presa por dobradiça na parte de trás.',
    relationshipWithOthers: 'Em tornos adequados à NR-12, um interruptor de segurança impede a partida com a proteção aberta.',
    typicalFailureModes: 'Proteção retirada, interruptor de segurança desativado ou “jumpeado”.',
    tool: '—',
    safety: 'Nunca retire nem desative a proteção. Se ela estiver danificada, a máquina não deve ser usada.'
  },
  {
    id: 'lathe-tailstock',
    shortName: 'Cabeçote móvel',
    name: 'Cabeçote móvel (contraponta)',
    technicalName: 'Cabeçote móvel com mangote, ponta rotativa e trava',
    category: 'structural',
    material: 'Ferro fundido; mangote de aço',
    simpleDefinition: 'O conjunto à direita que apoia a ponta das peças longas. Também serve para furar com broca.',
    mainFunction: 'Apoiar a peça com a ponta rotativa (evita que ela vergue e vibre) ou segurar brocas e mandris no mangote.',
    location: 'Extremidade direita, sobre as guias internas do barramento.',
    relationshipWithOthers: 'Desliza e trava no barramento. O volante avança o mangote; a alavanca de cima trava o mangote.',
    typicalFailureModes: 'Desalinhamento (a peça sai cônica), trava solta, ponta gasta.',
    tool: 'Volante do mangote e alavanca de fixação',
    safety: 'Trave o cabeçote móvel e o mangote antes de cortar. Uma ponta solta deixa a peça escapar.'
  },
  {
    id: 'lathe-chuck-key',
    shortName: 'Chave da placa',
    name: 'Chave da placa',
    technicalName: 'Chave em T da placa universal',
    category: 'fastener',
    material: 'Aço',
    simpleDefinition: 'A chave em T usada para abrir e fechar as castanhas.',
    mainFunction: 'Girar o pinhão da placa que move as três castanhas ao mesmo tempo.',
    location: 'Fora da máquina, depois do uso. Aqui ela aparece esquecida na placa para a atividade de segurança.',
    relationshipWithOthers: 'Encaixa nos furos quadrados da periferia da placa.',
    typicalFailureModes: 'Ser esquecida na placa — é um dos acidentes mais conhecidos em tornos.',
    tool: '—',
    safety: 'Regra de ouro: tirou a mão da chave, tirou a chave da placa. Algumas oficinas usam chaves com mola que não ficam presas.'
  }
];

export const LATHE_PART_SHORT_NAMES: Record<string, string> = Object.fromEntries(PARTS.map((p) => [p.id, p.shortName]));
export const LATHE_PART_SAFETY: Record<string, string> = Object.fromEntries(PARTS.filter((p) => p.safety).map((p) => [p.id, p.safety!]));

export const LATHE_MACHINE: MachineData = {
  id: LATHE_ID,
  name: 'Torno mecânico convencional (modelo educacional)',
  subtitle: 'Torno paralelo com placa universal, carros e cabeçote móvel',
  category: 'Usinagem convencional',
  difficulty: 'Iniciante',
  specs: [
    { label: 'Tipo', value: 'Torno paralelo (universal) de oficina-escola' },
    { label: 'Escala do modelo', value: 'Aproximada: cerca de 1 m entre pontas e altura de centros de uns 175 mm' }
  ],
  overviewDescription:
    'O torno faz a peça girar e uma ferramenta de corte, presa nos carros, remove material para obter formas cilíndricas, faces, cones, furos e roscas.',
  safetyRules: [
    'Opere o torno somente depois de treinado e com autorização e supervisão do instrutor.',
    'Use óculos de proteção, roupa justa, cabelo preso e nada pendurado (correntes, crachás soltos, mangas largas).',
    'Não use luvas perto de partes girando: elas podem ser puxadas junto com a mão.',
    'Retire a chave da placa logo após o aperto e mantenha a proteção da placa fechada.',
    'Meça, limpe e ajuste somente com a máquina parada e a placa totalmente imóvel.'
  ],
  parts: PARTS.map(toPart),
  disassemblySteps: []
};

/** Peças que acompanham o carro principal quando ele se desloca. */
const CARRIAGE_STACK = ['lathe-cross-slide', 'lathe-compound-rest', 'lathe-tool-post', 'lathe-cutting-tool'];

export const LATHE_LAB: MachineLabConfig = {
  machineId: LATHE_ID,
  purpose:
    'O torno faz a peça girar enquanto uma ferramenta, levada pelos carros, corta o material. É a máquina básica para fabricar e recuperar eixos, pinos, buchas, flanges e roscas.',
  whereUsed: 'Oficinas de manutenção, ferramentarias e indústrias metalúrgicas — por exemplo, para fazer uma bucha nova ou recuperar o colo de um eixo.',
  source: 'procedural-lathe',
  floorY: -5.25,
  accuracy: {
    label: 'Modelo educacional simplificado',
    detail:
      'Modelo 3D construído no próprio projeto (CC0), com a disposição clássica de um torno paralelo de oficina-escola. Não representa um fabricante ou modelo comercial; mecanismos internos (engrenagens, porca bipartida, interruptores) não aparecem. É uma demonstração visual: não simula forças de corte, calor, tolerâncias ou o resultado real da usinagem.'
  },
  // "Etapa" usada pela atividade de segurança: o carro aparece encostado perto da placa.
  disassembly: [
    {
      partId: 'lathe-carriage',
      title: 'Carro próximo da placa',
      instruction: '',
      tool: '',
      toolWhy: '',
      moves: {
        'lathe-carriage': [[-2.5, 0, 0]],
        ...Object.fromEntries(CARRIAGE_STACK.map((id) => [id, [[0, 0, 0.18], [-2.5, 0, 0.18]]]))
      }
    }
  ],
  explode: {
    'lathe-chuck-guard': [0, 1.6, -0.6],
    'lathe-chuck': [0.5, 0, 0],
    'lathe-jaws': [1.3, 0, 0],
    'lathe-workpiece': [0.6, 1.5, 0],
    'lathe-cross-slide': [0, 0.35, 0],
    'lathe-compound-rest': [0, 0.75, 0],
    'lathe-tool-post': [0, 1.2, 0],
    'lathe-cutting-tool': [0, 1.25, 1.0],
    'lathe-tailstock': [1.6, 0, 0],
    'lathe-leadscrew': [0, -0.4, 0.9],
    'lathe-feed-gearbox': [0, 0, 0.9],
    'lathe-emergency-stop': [0, 0, 0.7],
    'lathe-chuck-key': [0, 0.6, 0.6]
  },
  identify: [
    { partId: 'lathe-chuck', prompt: 'Clique na placa — o “prato” que segura e gira a peça.', hint: 'Fica logo à direita do cabeçote fixo, embaixo da proteção amarela.' },
    { partId: 'lathe-tailstock', prompt: 'Clique no cabeçote móvel, que apoia a ponta da peça.', hint: 'É o conjunto da direita, com um volante na ponta.' },
    { partId: 'lathe-cross-slide', prompt: 'Clique no carro transversal — ele leva a ferramenta em direção ao centro da peça.', hint: 'Fica em cima do carro principal, com um volante virado para você.' },
    { partId: 'lathe-tool-post', prompt: 'Clique no porta-ferramenta (castelo).', hint: 'O bloco escuro no alto dos carros, com um manípulo em cima.' },
    { partId: 'lathe-leadscrew', prompt: 'Clique no fuso ou na vara — os eixos longos na frente do barramento.', hint: 'Passam por dentro do avental, abaixo das guias.' },
    { partId: 'lathe-emergency-stop', prompt: 'Clique no botão de emergência.', hint: 'Botão vermelho sobre fundo amarelo, na frente do cabeçote fixo.' }
  ],
  checkQuestionIds: ['tor-01', 'tor-03', 'tor-05', 'tor-07', 'tor-09'],
  lessonId: ''
};

export { LATHE_STAGES } from './latheStages';
export type { LatheStageId } from './latheStages';

export interface LatheHazard {
  id: string;
  /** Peças que, clicadas, identificam este perigo. */
  partIds: string[];
  title: string;
  why: string;
  fix: string;
}

/** Condições inseguras montadas na cena para o aluno encontrar antes de “ligar” o torno. */
export const LATHE_HAZARDS: LatheHazard[] = [
  {
    id: 'chave-na-placa',
    partIds: ['lathe-chuck-key'],
    title: 'Chave esquecida na placa',
    why: 'Ao ligar, a placa gira e arremessa a chave com muita força contra o operador.',
    fix: 'Chave retirada. Regra: tirou a mão da chave, tirou a chave da placa.'
  },
  {
    id: 'sem-protecao',
    partIds: ['lathe-chuck', 'lathe-jaws'],
    title: 'Placa sem a proteção',
    why: 'Sem a proteção, mãos, mangas e cabelo podem encostar na placa girando, e cavacos são lançados no operador.',
    fix: 'Proteção recolocada e fechada. Em máquinas adequadas, ela tem interruptor que impede a partida aberta.'
  },
  {
    id: 'carro-na-placa',
    partIds: ['lathe-carriage', ...CARRIAGE_STACK],
    title: 'Carro encostado perto da placa',
    why: 'Com o carro tão perto, as castanhas girando podem bater no castelo e na ferramenta — quebra a ferramenta e lança fragmentos.',
    fix: 'Carro afastado para uma posição segura antes da partida.'
  }
];

/** O que responder quando o aluno clica numa peça que está em ordem durante a inspeção. */
export const LATHE_OK_NOTES: Record<string, string> = {
  'lathe-emergency-stop': 'Em ordem: o botão de emergência está visível e desobstruído.',
  'lathe-tailstock': 'Em ordem: o cabeçote móvel apoia a ponta da peça longa.',
  'lathe-workpiece': 'Em ordem: a peça está presa na placa e apoiada na contraponta.',
  'lathe-bed': 'Em ordem: as guias estão limpas, sem ferramentas apoiadas.',
  'lathe-headstock': 'Em ordem: nada errado no cabeçote fixo.',
  'lathe-feed-gearbox': 'Em ordem: a caixa de avanços não apresenta problema visível.',
  'lathe-leadscrew': 'Em ordem: fuso e vara sem panos ou objetos encostados.'
};

/** Sequência simplificada de uma operação de cilindramento — visão geral, sem parâmetros reais de corte. */
export const LATHE_SEQUENCE: OrderTask = {
  type: 'order',
  situation:
    'Seu instrutor pediu para você acompanhar o cilindramento de uma barra de aço (reduzir o diâmetro de uma parte da peça). Antes, ele quer saber se você entende a ordem segura do trabalho.',
  prompt: 'Coloque as etapas na ordem correta.',
  steps: [
    'Conferir o desenho e as medidas da peça e escolher a ferramenta',
    'Vestir óculos de proteção, prender o cabelo e tirar adornos e luvas',
    'Com a máquina desligada, prender a peça na placa e retirar a chave',
    'Fixar a ferramenta com pouco balanço e a ponta na altura do centro',
    'Fechar a proteção e selecionar rotação e avanço com a máquina parada',
    'Ligar e fazer o corte com acompanhamento do instrutor',
    'Desligar, esperar a placa parar e medir a peça com o paquímetro'
  ],
  explanation:
    'Planejar → proteger-se → preparar a máquina parada → só então ligar. Medir sempre com a placa parada. Rotação e avanço vêm de tabelas e do instrutor, conforme o material da peça e da ferramenta.'
};
