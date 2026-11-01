/**
 * Elementos de fixação: biblioteca e seleção guiada.
 *
 * Dados dimensionais usados aqui (conferidos nas tabelas das normas citadas, rosca métrica grossa):
 *  - passo: M6 = 1 · M8 = 1,25 · M10 = 1,5 · M12 = 1,75 · M16 = 2 (ISO 261/262)
 *  - sextavado externo, ISO 4017/4014 e porca ISO 4032: M6 = 10 · M8 = 13 · M10 = 16 · M12 = 18 · M16 = 24 mm
 *  - mesmo item em DIN 933/934 (normas antigas, ainda muito comuns): M10 = 17 · M12 = 19 mm
 *  - sextavado interno, ISO 4762: M6 = 5 · M8 = 6 · M10 = 8 · M12 = 10 · M16 = 14 mm
 *  - arruela lisa ISO 7089, tamanho 10: espessura 2 mm
 * Valores de torque e de resistência de juntas NÃO aparecem: vêm do manual do equipamento ou do projeto.
 */

export interface FastenerType {
  id: string;
  name: string;
  family: 'parafuso' | 'porca' | 'arruela' | 'retencao';
  standards: string;
  whatItIs: string;
  whenToUse: string;
  watchOut: string;
  identify: string;
  tool: string;
  /** Partes destacáveis no modelo 3D. */
  parts: { id: string; name: string; description: string }[];
}

export const FASTENER_TYPES: FastenerType[] = [
  {
    id: 'parafuso-sextavado',
    name: 'Parafuso de cabeça sextavada',
    family: 'parafuso',
    standards: 'ISO 4017 (rosca total) · ISO 4014 (rosca parcial) · antigas DIN 933/931',
    whatItIs: 'Cabeça de seis lados acionada por fora. É o parafuso mais comum em máquinas.',
    whenToUse: 'Quando há espaço em volta da cabeça para chave de boca, estrela ou soquete.',
    watchOut: 'A medida da cabeça muda conforme a norma: um M12 tem 18 mm (ISO) ou 19 mm (DIN). Confira antes de escolher a chave.',
    identify: 'Cabeça sextavada com a classe gravada no topo (ex.: 8.8) e marca do fabricante.',
    tool: 'Chave estrela, combinada ou soquete da medida da cabeça.',
    parts: [
      { id: 'cabeca', name: 'Cabeça sextavada', description: 'Onde a chave encaixa. A face de baixo apoia na peça ou na arruela.' },
      { id: 'haste', name: 'Haste lisa', description: 'Parte sem rosca (no ISO 4014). Ajuda a centrar e trabalha melhor ao cisalhamento.' },
      { id: 'rosca', name: 'Rosca', description: 'Métrica, com passo grosso por padrão (M10 → 1,5 mm).' }
    ]
  },
  {
    id: 'parafuso-allen',
    name: 'Parafuso de cabeça cilíndrica com sextavado interno',
    family: 'parafuso',
    standards: 'ISO 4762 · antiga DIN 912',
    whatItIs: 'Cabeça redonda com encaixe sextavado por dentro (chave Allen).',
    whenToUse: 'Quando falta espaço em volta da cabeça ou a cabeça precisa ficar embutida num rebaixo.',
    watchOut: 'Chave folgada ou gasta espana o encaixe. Encaixe a chave até o fundo.',
    identify: 'Cabeça cilíndrica com furo sextavado; classe gravada na lateral ou no topo (comum: 12.9 ou 8.8).',
    tool: 'Chave Allen da medida do encaixe (M10 → 8 mm, pela ISO 4762).',
    parts: [
      { id: 'cabeca', name: 'Cabeça cilíndrica', description: 'Diâmetro menor que o de um sextavado externo equivalente: cabe em rebaixos.' },
      { id: 'encaixe', name: 'Sextavado interno', description: 'Recebe a chave Allen. Limpe antes de encaixar.' },
      { id: 'rosca', name: 'Rosca', description: 'Métrica grossa.' }
    ]
  },
  {
    id: 'parafuso-escareado',
    name: 'Parafuso escareado com sextavado interno',
    family: 'parafuso',
    standards: 'ISO 10642 · antiga DIN 7991',
    whatItIs: 'Cabeça cônica que fica nivelada com a superfície, dentro de um furo escareado.',
    whenToUse: 'Quando a superfície precisa ficar lisa (nada pode sobressair).',
    watchOut: 'O cone centraliza a peça: furos fora de posição fazem a cabeça apoiar torta.',
    identify: 'Cabeça em cone (90°) com sextavado interno.',
    tool: 'Chave Allen da medida do encaixe.',
    parts: [
      { id: 'cabeca', name: 'Cabeça cônica', description: 'Apoia no escareado e fica rente à superfície.' },
      { id: 'rosca', name: 'Rosca', description: 'Métrica grossa.' }
    ]
  },
  {
    id: 'parafuso-sem-cabeca',
    name: 'Parafuso sem cabeça (de fixação)',
    family: 'parafuso',
    standards: 'ISO 4026 (ponta plana) · ISO 4027 (cônica) · ISO 4029 (côncava)',
    whatItIs: 'Só rosca, com sextavado interno numa ponta. A outra ponta pressiona o eixo.',
    whenToUse: 'Travar um cubo, polia ou anel num eixo (muitas vezes sobre a chaveta ou numa face plana do eixo).',
    watchOut: 'A ponta marca o eixo: ao soltar, a rebarba pode prender o cubo. A ponta certa depende do projeto.',
    identify: 'Não tem cabeça; o sextavado interno fica rente à peça.',
    tool: 'Chave Allen da medida do encaixe.',
    parts: [
      { id: 'encaixe', name: 'Sextavado interno', description: 'Recebe a chave Allen.' },
      { id: 'ponta', name: 'Ponta', description: 'Plana, cônica ou côncava: define como prende no eixo.' }
    ]
  },
  {
    id: 'prisioneiro',
    name: 'Prisioneiro (estojo)',
    family: 'parafuso',
    standards: 'DIN 938/939 (lado de fixação no corpo) · varia por aplicação',
    whatItIs: 'Barra roscada nas duas pontas: uma fica fixa no corpo, a outra recebe a porca.',
    whenToUse: 'Quando a tampa é desmontada muitas vezes: a rosca do corpo não se desgasta, só a porca gira.',
    watchOut: 'Os dois lados podem ter comprimentos de rosca diferentes. Não troque por barra roscada comum sem o projeto permitir.',
    identify: 'Sem cabeça, roscado nas duas pontas com um trecho liso no meio.',
    tool: 'Para a porca: chave da medida da porca. Para instalar: ferramenta de prisioneiro ou duas porcas travadas.',
    parts: [
      { id: 'rosca-corpo', name: 'Rosca do lado do corpo', description: 'Fica aparafusada na peça principal.' },
      { id: 'haste', name: 'Trecho liso', description: 'Entre as roscas.' },
      { id: 'rosca-porca', name: 'Rosca do lado da porca', description: 'Recebe a porca que prende a tampa.' }
    ]
  },
  {
    id: 'porca-sextavada',
    name: 'Porca sextavada',
    family: 'porca',
    standards: 'ISO 4032 · antiga DIN 934',
    whatItIs: 'Peça com rosca interna que, junto com o parafuso, prende as peças em furos passantes.',
    whenToUse: 'Furos passantes, com acesso dos dois lados.',
    watchOut: 'A classe da porca deve combinar com a do parafuso (ex.: parafuso 8.8 com porca classe 8).',
    identify: 'Seis faces, rosca interna; a classe pode vir gravada numa face.',
    tool: 'Chave da medida das faces (M10 → 16 mm pela ISO 4032).',
    parts: [
      { id: 'corpo', name: 'Corpo sextavado', description: 'Faces para a chave.' },
      { id: 'rosca', name: 'Rosca interna', description: 'Mesmo diâmetro e passo do parafuso.' }
    ]
  },
  {
    id: 'porca-autotravante',
    name: 'Porca autotravante com anel de náilon',
    family: 'porca',
    standards: 'ISO 7040 (antiga DIN 982) · versão baixa: ISO 10511 (antiga DIN 985)',
    whatItIs: 'Porca com um anel de náilon que aperta a rosca e dificulta que ela se solte com vibração.',
    whenToUse: 'Quando o projeto pede resistência ao afrouxamento e a temperatura permite náilon.',
    watchOut: 'O efeito do anel diminui a cada reuso; siga o manual sobre reaproveitamento. Não serve para temperaturas acima do limite do náilon.',
    identify: 'Porca mais alta com um anel colorido (geralmente branco ou azul) num dos lados.',
    tool: 'Chave da medida das faces.',
    parts: [
      { id: 'corpo', name: 'Corpo sextavado', description: 'Faces para a chave.' },
      { id: 'anel', name: 'Anel de náilon', description: 'Deforma sobre a rosca e cria atrito contra o afrouxamento.' }
    ]
  },
  {
    id: 'arruela-lisa',
    name: 'Arruela lisa',
    family: 'arruela',
    standards: 'ISO 7089 (com chanfro: ISO 7090) · antiga DIN 125',
    whatItIs: 'Disco furado que distribui a pressão da cabeça ou da porca.',
    whenToUse: 'Superfícies macias ou furos com folga grande; também protege a superfície da peça.',
    watchOut: 'A arruela precisa ter dureza compatível com o parafuso: arruela macia sob parafuso de alta classe pode afundar.',
    identify: 'Disco liso, sem corte.',
    tool: '—',
    parts: [{ id: 'corpo', name: 'Disco', description: 'Tamanho 10 (para M10) com 2 mm de espessura pela ISO 7089.' }]
  },
  {
    id: 'arruela-pressao',
    name: 'Arruela de pressão (partida)',
    family: 'arruela',
    standards: 'DIN 127 (norma retirada; peça ainda muito encontrada)',
    whatItIs: 'Arruela cortada e torcida, que funciona como mola.',
    whenToUse: 'Só quando o projeto ou o manual pedirem. Muitos projetos atuais não a usam mais em juntas de alta resistência.',
    watchOut: 'Não é garantia de travamento. Use o que o manual especificar (porca autotravante, adesivo, arame de frenagem...).',
    identify: 'Anel cortado, com as pontas desencontradas.',
    tool: '—',
    parts: [{ id: 'corpo', name: 'Anel partido', description: 'O corte e a torção dão o efeito de mola.' }]
  },
  {
    id: 'anel-elastico',
    name: 'Anel elástico de eixo',
    family: 'retencao',
    standards: 'DIN 471 (eixo) · DIN 472 (furo)',
    whatItIs: 'Anel de aço-mola que encaixa num canal e impede o deslocamento axial de uma peça.',
    whenToUse: 'Segurar rolamentos, polias e engrenagens contra um ressalto, sem rosca.',
    watchOut: 'Anel deformado na retirada deve ser trocado. Use o alicate certo e óculos.',
    identify: 'Anel aberto com dois furos nas pontas.',
    tool: 'Alicate para anéis externos (eixo) ou internos (furo).',
    parts: [
      { id: 'corpo', name: 'Anel', description: 'Fica no canal do eixo.' },
      { id: 'furos', name: 'Furos das pontas', description: 'Onde entram as pontas do alicate.' }
    ]
  }
];

export const FASTENER_BY_ID: Record<string, FastenerType> = Object.fromEntries(FASTENER_TYPES.map((f) => [f.id, f]));

/** Tabela de referência rápida (valores conferidos — ver cabeçalho do arquivo). */
export const FASTENER_SIZE_TABLE = [
  { size: 'M6', pitch: '1', hexIso: '10', hexDin: '10', socket: '5' },
  { size: 'M8', pitch: '1,25', hexIso: '13', hexDin: '13', socket: '6' },
  { size: 'M10', pitch: '1,5', hexIso: '16', hexDin: '17', socket: '8' },
  { size: 'M12', pitch: '1,75', hexIso: '18', hexDin: '19', socket: '10' },
  { size: 'M16', pitch: '2', hexIso: '24', hexDin: '24', socket: '14' }
];

/* ───────────────────────── Seleção guiada ───────────────────────── */

export type StepVerdict = 'best' | 'ok' | 'wrong' | 'missing';

export interface SelectionOption {
  text: string;
  verdict: StepVerdict;
  feedback: string;
}

export interface SelectionStep {
  id: string;
  title: string;
  question: string;
  /** Dados do cenário relevantes para esta etapa. */
  data: string[];
  options: SelectionOption[];
  /** Como o resultado desta etapa aparece na especificação final. */
  result: string;
}

export interface SelectionScenario {
  id: string;
  title: string;
  context: string;
  complete: boolean;
  steps: SelectionStep[];
  conclusion: string;
}

export const SELECTION_STEP_TITLES = [
  'Função da junta',
  'Tipo de furo',
  'Diâmetro e rosca',
  'Comprimento',
  'Cabeça e acionamento',
  'Classe de resistência',
  'Arruela e travamento',
  'Material e proteção',
  'Aperto e conferência'
];

export const SELECTION_SCENARIOS: SelectionScenario[] = [
  {
    id: 'tampa-mancal',
    title: 'Tampa de um mancal',
    complete: true,
    context:
      'Você vai fixar a tampa de inspeção de um mancal. O desenho e o manual do equipamento (deste cenário) estão disponíveis.',
    steps: [
      {
        id: 'funcao',
        title: 'Função da junta',
        question: 'O que esta junta precisa fazer?',
        data: ['A tampa é aberta nas inspeções periódicas.', 'Ela só fecha o mancal; não suporta a carga do eixo.'],
        options: [
          { text: 'Fixar uma tampa removível, com desmontagem periódica', verdict: 'best', feedback: 'Isso: a junta é desmontável e não estrutural. Isso orienta as próximas escolhas.' },
          { text: 'Unir peças de forma permanente', verdict: 'wrong', feedback: 'A tampa é aberta nas inspeções: a junta precisa ser desmontável.' }
        ],
        result: 'Junta desmontável, fixação de tampa'
      },
      {
        id: 'furo',
        title: 'Tipo de furo',
        question: 'Como o parafuso vai prender?',
        data: ['O corpo do mancal tem furos roscados cegos (sem saída do outro lado).'],
        options: [
          { text: 'Direto na rosca do corpo (furo roscado cego)', verdict: 'best', feedback: 'Isso: não há acesso para porca do outro lado.' },
          { text: 'Parafuso com porca do outro lado', verdict: 'wrong', feedback: 'O furo é cego: não existe "outro lado" para a porca.' }
        ],
        result: 'Parafuso em furo roscado cego'
      },
      {
        id: 'rosca',
        title: 'Diâmetro e rosca',
        question: 'Qual rosca?',
        data: ['Desenho: rosca M10 nos furos do corpo.', 'Na rosca métrica grossa, M10 tem passo 1,5 mm.'],
        options: [
          { text: 'M10 com passo 1,5 (grossa)', verdict: 'best', feedback: 'Isso: a rosca vem do desenho; "M10" sem passo indicado é rosca grossa.' },
          { text: 'M10 × 1,25 (fina)', verdict: 'wrong', feedback: 'O desenho não indica rosca fina. Passo errado danifica a rosca do corpo.' },
          { text: 'M12, para ficar mais forte', verdict: 'wrong', feedback: 'O diâmetro vem do furo existente; um M12 não entra numa rosca M10.' }
        ],
        result: 'M10 (passo 1,5)'
      },
      {
        id: 'comprimento',
        title: 'Comprimento',
        question: 'Qual comprimento de parafuso?',
        data: [
          'Espessura da tampa: 12 mm. Arruela: 2 mm.',
          'Engajamento mínimo de rosca exigido pelo projeto: 15 mm.',
          'Profundidade útil da rosca no corpo: 20 mm.',
          'Comprimento necessário = 12 + 2 + engajamento → entre 29 e 34 mm.'
        ],
        options: [
          { text: '30 mm (engajamento de 16 mm)', verdict: 'best', feedback: 'Isso: 30 − 12 − 2 = 16 mm de rosca engajada, acima dos 15 mm e abaixo dos 20 mm disponíveis.' },
          { text: '25 mm', verdict: 'wrong', feedback: 'Engajaria só 11 mm: menos que o mínimo do projeto.' },
          { text: '40 mm', verdict: 'wrong', feedback: 'Precisaria de 26 mm de rosca, mas só há 20: o parafuso bate no fundo antes de apertar a tampa.' }
        ],
        result: 'Comprimento 30 mm'
      },
      {
        id: 'cabeca',
        title: 'Cabeça e acionamento',
        question: 'Qual tipo de cabeça?',
        data: ['Há uma nervura a 10 mm da cabeça: não sobra espaço lateral para girar uma chave de boca.', 'O acesso por cima é livre.'],
        options: [
          { text: 'Cabeça cilíndrica com sextavado interno (ISO 4762)', verdict: 'best', feedback: 'Isso: a chave Allen entra por cima e gira sem precisar de espaço lateral.' },
          { text: 'Cabeça sextavada externa (ISO 4017)', verdict: 'wrong', feedback: 'Sem espaço lateral, a chave de boca ou estrela não gira.' },
          { text: 'Escareado (ISO 10642)', verdict: 'wrong', feedback: 'Precisa de furo escareado na tampa, que não existe.' }
        ],
        result: 'ISO 4762 (cabeça cilíndrica, sextavado interno de 8 mm)'
      },
      {
        id: 'classe',
        title: 'Classe de resistência',
        question: 'Qual classe usar?',
        data: ['Manual do equipamento (cenário): parafusos da tampa classe 8.8.'],
        options: [
          { text: '8.8, como indica o manual', verdict: 'best', feedback: 'Isso: a classe vem do projeto ou do manual.' },
          { text: '12.9, porque é mais forte', verdict: 'wrong', feedback: '"Mais forte" não é automaticamente melhor: muda o comportamento da junta e o aperto. Siga o especificado.' },
          { text: '4.6, que é mais barato', verdict: 'wrong', feedback: 'Classe abaixo da especificada pode falhar.' }
        ],
        result: 'Classe 8.8'
      },
      {
        id: 'arruela',
        title: 'Arruela e travamento',
        question: 'Arruela ou travamento?',
        data: ['Manual: arruela lisa sob a cabeça; não especifica travamento adicional.', 'A tampa é de alumínio (superfície macia).'],
        options: [
          { text: 'Arruela lisa (ISO 7089, tamanho 10)', verdict: 'best', feedback: 'Isso: distribui a pressão sobre o alumínio, como o manual pede.' },
          { text: 'Arruela de pressão', verdict: 'wrong', feedback: 'Não está especificada e não substitui a arruela lisa no alumínio.' },
          { text: 'Nenhuma arruela', verdict: 'wrong', feedback: 'O manual pede arruela lisa; sem ela, a cabeça pode marcar o alumínio.' }
        ],
        result: 'Arruela lisa ISO 7089 – 10'
      },
      {
        id: 'material',
        title: 'Material e proteção',
        question: 'Qual acabamento?',
        data: ['Ambiente interno e seco.', 'Manual: aço com revestimento de zinco.'],
        options: [
          { text: 'Aço zincado, como o manual', verdict: 'best', feedback: 'Isso: adequado ao ambiente e ao especificado.' },
          { text: 'Inox A2, para durar mais', verdict: 'ok', feedback: 'Resiste melhor à corrosão, mas tem outra resistência e outro aperto. Só com aprovação do responsável pelo projeto.' }
        ],
        result: 'Aço zincado'
      },
      {
        id: 'aperto',
        title: 'Aperto e conferência',
        question: 'Como apertar?',
        data: ['O manual traz o valor de aperto e a sequência (em cruz) para estes parafusos.'],
        options: [
          { text: 'Torquímetro calibrado, no valor e na sequência do manual; registrar na ordem de serviço', verdict: 'best', feedback: 'Isso: valor medido, sequência certa e registro.' },
          { text: 'Chave Allen "no braço", até sentir firme', verdict: 'wrong', feedback: 'Sem medir, o aperto varia muito de pessoa para pessoa.' }
        ],
        result: 'Aperto em cruz com torquímetro, no valor do manual'
      }
    ],
    conclusion:
      'Especificação: parafuso ISO 4762 M10 × 30 – 8.8, zincado, com arruela lisa ISO 7089 tamanho 10; aperto em cruz com torquímetro no valor do manual. Cada item veio de um dado do desenho, do manual ou de uma conta.'
  },
  {
    id: 'base-motor',
    title: 'Parafuso perdido na base de um motor',
    complete: false,
    context:
      'Um parafuso da base de um motor sumiu. O manual não foi encontrado e os outros parafusos estão muito oxidados.',
    steps: [
      {
        id: 'funcao',
        title: 'Função da junta',
        question: 'O que esta junta faz?',
        data: ['Prende o motor à base. Vibração constante.'],
        options: [
          { text: 'Junta estrutural, sob vibração', verdict: 'best', feedback: 'Isso: falha aqui solta o motor e desalinha o acoplamento.' },
          { text: 'Só uma tampa, sem esforço', verdict: 'wrong', feedback: 'O motor apoia nesta junta: ela recebe esforço e vibração.' }
        ],
        result: 'Junta estrutural sob vibração'
      },
      {
        id: 'furo',
        title: 'Tipo de furo',
        question: 'Como o parafuso prende?',
        data: ['Furo passante no pé do motor e na base; há acesso para porca por baixo.'],
        options: [
          { text: 'Parafuso com porca', verdict: 'best', feedback: 'Isso: furo passante com acesso dos dois lados.' },
          { text: 'Furo roscado na base', verdict: 'wrong', feedback: 'A base tem furo passante, sem rosca.' }
        ],
        result: 'Parafuso passante com porca'
      },
      {
        id: 'rosca',
        title: 'Diâmetro e rosca',
        question: 'Qual rosca?',
        data: ['Os parafusos vizinhos medem cerca de 12 mm na rosca; o passo, medido com pente de rosca, é 1,75 mm.'],
        options: [
          { text: 'M12 com passo 1,75 (grossa)', verdict: 'best', feedback: 'Isso: medida e passo conferidos nos parafusos vizinhos.' },
          { text: 'Ainda não sei: falta informação', verdict: 'wrong', feedback: 'Os dados permitem decidir: diâmetro e passo foram medidos nos parafusos vizinhos.' }
        ],
        result: 'M12 (passo 1,75)'
      },
      {
        id: 'comprimento',
        title: 'Comprimento',
        question: 'Qual comprimento?',
        data: ['As espessuras do pé do motor, da base e dos calços não foram medidas.'],
        options: [
          { text: 'Falta informação: medir pé, calços, base, arruelas e porca', verdict: 'missing', feedback: 'Isso: sem essas medidas, o comprimento é chute.' },
          { text: 'Usar o mesmo dos vizinhos "no olho"', verdict: 'wrong', feedback: 'Os vizinhos podem ter calços diferentes. Meça.' }
        ],
        result: 'FALTA: espessuras (pé, calços, base, arruelas, porca)'
      },
      {
        id: 'cabeca',
        title: 'Cabeça e acionamento',
        question: 'Qual cabeça?',
        data: ['Espaço livre em volta da cabeça; os vizinhos são sextavados.'],
        options: [
          { text: 'Sextavada, igual às vizinhas', verdict: 'best', feedback: 'Isso: há espaço para a chave e mantém o padrão.' },
          { text: 'Qualquer uma que entrar', verdict: 'wrong', feedback: 'Mantenha o padrão do conjunto, a não ser que o projeto diga outra coisa.' }
        ],
        result: 'Cabeça sextavada'
      },
      {
        id: 'classe',
        title: 'Classe de resistência',
        question: 'Qual classe?',
        data: ['A marcação das cabeças vizinhas está ilegível pela oxidação.', 'Não há manual nem desenho.'],
        options: [
          { text: 'Falta informação: consultar o fabricante, o desenho ou o responsável técnico', verdict: 'missing', feedback: 'Isso: numa junta estrutural, a classe não se escolhe por palpite.' },
          { text: '8.8, porque é a mais comum', verdict: 'wrong', feedback: '"Mais comum" não é especificação. Se a original for maior, a junta fica mais fraca.' },
          { text: 'A mais alta que houver no estoque', verdict: 'wrong', feedback: 'Também é palpite e muda o aperto necessário.' }
        ],
        result: 'FALTA: classe de resistência especificada'
      },
      {
        id: 'arruela',
        title: 'Arruela e travamento',
        question: 'Travamento contra vibração?',
        data: ['Sem manual, não se sabe qual travamento o projeto prevê.'],
        options: [
          { text: 'Falta informação: confirmar o método de travamento previsto', verdict: 'missing', feedback: 'Isso: o método certo depende do projeto.' },
          { text: 'Arruela de pressão resolve', verdict: 'wrong', feedback: 'Não é garantia de travamento e pode não ser o previsto.' }
        ],
        result: 'FALTA: arruela e travamento previstos'
      },
      {
        id: 'material',
        title: 'Material e proteção',
        question: 'Qual proteção?',
        data: ['Ambiente úmido: os vizinhos oxidaram.'],
        options: [
          { text: 'Proteção contra corrosão adequada ao ambiente, a confirmar com o responsável', verdict: 'best', feedback: 'Isso: o ambiente pede proteção; a escolha final acompanha a classe definida.' },
          { text: 'Tanto faz', verdict: 'wrong', feedback: 'A oxidação dos vizinhos mostra que o ambiente importa.' }
        ],
        result: 'Proteção contra corrosão (a confirmar)'
      },
      {
        id: 'aperto',
        title: 'Aperto e conferência',
        question: 'Como apertar?',
        data: ['Sem manual, não há valor de aperto disponível.'],
        options: [
          { text: 'Falta informação: obter o valor com o fabricante ou o responsável; depois, torquímetro e conferir o alinhamento', verdict: 'missing', feedback: 'Isso: sem valor especificado não há aperto controlado.' },
          { text: 'Apertar forte com chave estrela', verdict: 'wrong', feedback: 'Aperto sem valor pode ficar fraco ou romper o parafuso.' }
        ],
        result: 'FALTA: valor e método de aperto'
      }
    ],
    conclusion:
      'Ainda não é possível especificar este parafuso com segurança. Faltam: comprimento (medir), classe de resistência, travamento previsto e valor de aperto. Registre o que falta e consulte o fabricante, o desenho ou o responsável técnico antes de montar.'
  }
];

export const fastenerScenarioTask = (id: string) => `task-fastener-${id}`;
