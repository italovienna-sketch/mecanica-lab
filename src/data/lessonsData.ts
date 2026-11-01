export type LearningLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Profissional';

export interface LessonTopic {
  id: string;
  order: number;
  title: string;
  conceptSummary: string;
  whatIsIt: string;
  whatDoesItDo: string;
  whereIsItLocated: string;
  whyIsItNeeded: string;
  interactionWithOthers: string;
  howToIdentify: string;
  safetyPrerequisite: string;
  keyCheck: string;
}

export interface GuidedDemonstrationStep {
  stepNumber: number;
  title: string;
  narration: string;
  visualFocus: string;
  keyTakeaway: string;
}

export interface MachineLesson {
  id: string;
  courseTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  level: LearningLevel;
  machineId: string;
  recommendedToolId: string;
  title: string;
  subtitle: string;
  learningObjective: string;
  targetAudience: string;
  estimatedTime: string;
  practiceTaskTitle: string;
  practiceTaskDescription: string;
  practiceTargetScreen: 'tools' | 'lab';
  practiceTargetParam: string;
  demonstrationSteps: GuidedDemonstrationStep[];
  topics: LessonTopic[];
  glossary: { term: string; definition: string }[];
}

export const BEGINNER_TOOLS_LESSON: MachineLesson = {
  id: 'lesson-beginner-tools-fasteners',
  courseTitle: 'Formação Interativa em Manutenção Mecânica Industrial',
  moduleNumber: 1,
  moduleTitle: 'Módulo 1: Fundamentos de Oficina, Ferramentas e Componentes Básicos',
  level: 'Iniciante',
  machineId: 'centrifugal-pump',
  recommendedToolId: 'chave-combinada',
  title: 'Ferramentas Básicas e os 4 Elementos Fundamentais das Máquinas',
  subtitle: 'Comece do absoluto zero: entenda para que servem parafusos, eixos, rolamentos, vedações e chaves da oficina',
  learningObjective:
    'Identificar visualmente as ferramentas manuais essenciais e compreender a função de um fixador (parafuso), um eixo, um rolamento e uma vedação dentro de uma máquina industrial.',
  targetAudience: 'Iniciante — Nenhuma experiência prévia necessária',
  estimatedTime: '15 minutos',
  practiceTaskTitle: 'Inspecionar a Chave Combinada 19 mm em 3D e Testar Seleção de Ferramenta',
  practiceTaskDescription:
    'Abra o Laboratório de Ferramentas, gire a Chave Combinada em 3D (.GLB), clique nas 3 partes dela e resolva o Desafio 1 de escolha de ferramenta.',
  practiceTargetScreen: 'tools',
  practiceTargetParam: 'chave-combinada',
  demonstrationSteps: [
    {
      stepNumber: 1,
      title: 'Bloqueio de Segurança (LOTO) e EPIs antes de Tocar na Máquina',
      narration:
        'Antes de encostar qualquer ferramenta na bancada, confirmamos que o motor está desligado e travado com cadeado (LOTO) e vestimos óculos de proteção, luvas e botina.',
      visualFocus: 'Cadeado de Bloqueio Vermelho + Óculos de Proteção',
      keyTakeaway: 'Segurança vem antes da primeira volta de chave.'
    },
    {
      stepNumber: 2,
      title: 'Fixadores (Parafusos M12) e a Chave Combinada 19 mm',
      narration:
        'Os parafusos sextavados mantêm a carcaça fechada sob pressão. Usamos o anel estriado da Chave Combinada de 19 mm para destravar o parafuso sem arredondar seus cantos.',
      visualFocus: 'Olhal Estriado de 12 Estrias acoplado ao Parafuso M12',
      keyTakeaway: 'Solte e aperte parafusos de flanges sempre em sequência cruzada (em X).'
    },
    {
      stepNumber: 3,
      title: 'Eixo, Rolamento e Vedação Trabalhando Juntos',
      narration:
        'O eixo transmite o giro do motor para o rotor; os rolamentos apoiam o eixo para girar leve sem atrito; e o selo/retentor impede que a água ou o óleo vaze pelo caminho.',
      visualFocus: 'Conjunto Girante: Eixo + Rolamentos 6308 + Selo Mecânico',
      keyTakeaway: 'Toda máquina rotativa depende da harmonia entre Eixo, Rolamento e Vedação.'
    }
  ],
  topics: [
    {
      id: 'beg-topic-1',
      order: 1,
      title: '1. O Parafuso Sextavado e a Chave Combinada: Como Unir Peças com Segurança',
      conceptSummary:
        'As máquinas industriais precisam ser desmontadas para limpeza e troca de peças. Por isso usamos parafusos em vez de soldar tudo.',
      whatIsIt:
        'Um parafuso sextavado tem cabeça de 6 lados planos. A Chave Combinada tem a mesma medida nas duas pontas: uma boca aberta (rápida) e um anel estriado (firme).',
      whatDoesItDo:
        'O parafuso aperta uma peça contra a outra; a chave aplica a força da nossa mão sem escorregar.',
      whereIsItLocated:
        'Ao redor das tampas e flanges da Bomba Centrífuga (parafusos M12 de cabeça DIN 933 = chave 19 mm) e do Redutor (M10 DIN 933 = chave 17 mm). Pela ISO 4017 essas cabeças medem 18 e 16 mm: confira antes.',
      whyIsItNeeded:
        'Permite fechar a máquina com vedação perfeita e abri-la anos depois sem estragar a estrutura.',
      interactionWithOthers:
        'Deve ser solto e apertado em ordem cruzada (como um "X") para não entortar a tampa.',
      howToIdentify:
        'Cabeça metálica com 6 faces externas; na chave está gravado o número em milímetros (ex.: 19 mm).',
      safetyPrerequisite:
        'Sempre puxe a chave em sua direção e nunca use um cano para aumentar o cabo da chave.',
      keyCheck: 'Use o lado fechado (estriado) para destravar o parafuso e a boca aberta para girar rápido!'
    },
    {
      id: 'beg-topic-2',
      order: 2,
      title: '2. O Que É um Eixo e Qual o Papel do Rolamento?',
      conceptSummary:
        'Se um cilindro de aço girasse raspando direto no furo da carcaça, o atrito geraria calor extremo e travaria a máquina em segundos.',
      whatIsIt:
        'O Eixo é uma barra cilíndrica de aço usinada com alta precisão. O Rolamento é um anel duplo com esferas ou roletes de aço polido entre eles.',
      whatDoesItDo:
        'O eixo transmite o movimento de rotação do motor para a bomba; o rolamento apoia o eixo transformando atrito de arrasto em rolamento suave.',
      whereIsItLocated:
        'No centro da máquina (cavalete de mancal da bomba ou interior do redutor).',
      whyIsItNeeded:
        'Garante que a máquina gire a 1750 rotações por minuto de forma silenciosa, alinhada e sem gastar energia à toa.',
      interactionWithOthers:
        'O anel interno do rolamento fica firme no eixo, enquanto o anel externo fica apoiado na carcaça.',
      howToIdentify:
        'O eixo é o cilindro central comprido; os rolamentos são os anéis prateados com esferas visíveis.',
      safetyPrerequisite:
        'Para retirar um rolamento do eixo, use sempre o Saca-Polias (extrator de 3 garras), nunca pancadas de martelo.',
      keyCheck: 'Eixo transmite o giro; Rolamento sustenta o eixo reduzindo o atrito!'
    },
    {
      id: 'beg-topic-3',
      order: 3,
      title: '3. Para Que Servem as Vedações (Selo Mecânico e Retentores)?',
      conceptSummary:
        'O eixo precisa sair de dentro da carcaça para se conectar ao motor, mas o líquido ou óleo não pode escapar por esse furo.',
      whatIsIt:
        'Componentes de vedação dinâmica: o Retentor (anel de borracha Viton com mola) e o Selo Mecânico (duas faces super planas em contato).',
      whatDoesItDo:
        'Impedem que a água pressurizada da bomba ou o óleo lubrificante dos rolamentos vaze para o chão da oficina, além de bloquear a entrada de poeira.',
      whereIsItLocated:
        'Exatamente na passagem onde o eixo atravessa a parede da carcaça.',
      whyIsItNeeded:
        'Vazamentos causam perda de lubrificação (quebrando a máquina) e risco de escorregamento ou contaminação.',
      interactionWithOthers:
        'Trabalham abraçando o eixo ou deslizando com uma película microscópica de líquido.',
      howToIdentify:
        'Peças circulares localizadas atrás do rotor da bomba ou nas saídas laterais do redutor.',
      safetyPrerequisite:
        'Nunca toque nas faces espelhadas de um selo mecânico com os dedos sujos de graxa.',
      keyCheck: 'Sem vedação, o óleo sai e a sujeira entra!'
    }
  ],
  glossary: [
    { term: 'Parafuso Sextavado', definition: 'Fixador roscado com cabeça de 6 lados planos, medido pela distância entre faces em milímetros.' },
    { term: 'Eixo', definition: 'Barra cilíndrica rotativa que sustenta rotores ou engrenagens e transmite força do motor.' },
    { term: 'Rolamento', definition: 'Elemento de máquina com esferas ou rolos que permite ao eixo girar com mínimo atrito.' },
    { term: 'Vedação (Selo / Retentor)', definition: 'Componente que impede o vazamento de líquidos e óleos ao redor de um eixo giratório.' }
  ]
};

export const CENTRIFUGAL_PUMP_LESSON: MachineLesson = {
  id: 'lesson-centrifugal-pump',
  courseTitle: 'Formação Interativa em Manutenção Mecânica Industrial',
  moduleNumber: 2,
  moduleTitle: 'Módulo 2: Bombas Centrífugas ISO 2858, Metrologia e Desmontagem Guiada',
  level: 'Intermediário',
  machineId: 'centrifugal-pump',
  recommendedToolId: 'paquimetro',
  title: 'Bombas Centrífugas Industriais ISO 2858 & Selagem Mecânica',
  subtitle: 'Do Básico ao Sistema Back-Pull-Out: Voluta, Rotor, Cavitação, Selo Mecânico e Mancais',
  learningObjective:
    'Compreender a relação entre os 7 componentes da Bomba Centrífuga ISO 2858, realizar medições com Paquímetro (0,05 mm) e executar a sequência correta de desmontagem e remontagem Back-Pull-Out em 3D.',
  targetAudience: 'Intermediário — Estudantes que já conhecem ferramentas básicas',
  estimatedTime: '25 minutos',
  practiceTaskTitle: 'Executar a Desmontagem e Remontagem 3D da Bomba Centrífuga ISO 2858',
  practiceTaskDescription:
    'No Laboratório 3D, clique em "Reproduzir no 3D" para observar a animação de extração das peças e depois complete os modos Desmontagem Guiada e Remontagem.',
  practiceTargetScreen: 'lab',
  practiceTargetParam: 'centrifugal-pump',
  demonstrationSteps: [
    {
      stepNumber: 1,
      title: 'Alívio Cruzado dos Prisioneiros Back-Pull-Out (Chave 19 mm)',
      narration:
        'Com a bomba drenada, soltamos os prisioneiros M12 em padrão cruzado. No sistema ISO 2858 Back-Pull-Out, a voluta frontal permanece presa na tubulação.',
      visualFocus: 'Prisioneiros M12 e Porca de Fixação do Rotor',
      keyTakeaway: 'O sistema Back-Pull-Out economiza horas porque não exige desmontar os tubos da fábrica.'
    },
    {
      stepNumber: 2,
      title: 'Extração Axial do Rotor Fechado e Remoção do Selo Mecânico EN 12756',
      narration:
        'O rotor Ø160 mm desliza para fora da ponta do eixo liberando a chaveta DIN 6885. Em seguida, o selo mecânico é retirado com bucha guia sem tocar nas faces lapidadas.',
      visualFocus: 'Rotor Centrífugo Fechado + Selo Mecânico Carbeto/Grafite',
      keyTakeaway: 'Nunca bata com martelo no rotor e jamais gire o selo mecânico a seco.'
    },
    {
      stepNumber: 3,
      title: 'Extração do Eixo Inox AISI 420 e Rolamentos 6308',
      narration:
        'O eixo é retirado pelo lado do acoplamento para medição com Paquímetro (0,05 mm) e Relógio Comparador (0,01 mm), e os rolamentos 6308 são sacados pelo anel interno.',
      visualFocus: 'Eixo Escalonado AISI 420 + Par de Rolamentos 6308',
      keyTakeaway: 'A força do extrator deve atuar sempre no anel que possui interferência (anel interno no eixo).'
    }
  ],
  topics: [
    {
      id: 'pump-topic-1',
      order: 1,
      title: '1. O Que Faz uma Bomba Centrífuga na Indústria?',
      conceptSummary: 'Líquidos não sobem tubulações ou vencem grandes distâncias sozinhos; a bomba centrífuga transforma a energia de giro do motor elétrico em velocidade e pressão hidráulica.',
      whatIsIt: 'É uma máquina de fluxo composta por uma carcaça em espiral (voluta) e um disco giratório com pás curvas (rotor ou impelidor) acionado por um eixo.',
      whatDoesItDo: 'Aspira o fluido pelo bocal central frontal (sucção) e o impulsiona sob pressão pelo bocal superior (recalque).',
      whereIsItLocated: 'Presente em casas de bombas, sistemas de refrigeração industrial, tratamento de água e processos químicos.',
      whyIsItNeeded: 'Mais de 70% de todo o bombeamento de líquidos na indústria mundial é feito por bombas centrífugas devido à sua simplicidade e confiabilidade.',
      interactionWithOthers: 'Acionada por um motor elétrico através de um acoplamento elástico montado sobre base metálica.',
      howToIdentify: 'Formato característico de caracol (voluta) na frente com flange de entrada no centro e flange de saída apontando para cima.',
      safetyPrerequisite: 'Jamais acione uma bomba centrífuga a seco (sem líquido preenchido/escorvado na carcaça).',
      keyCheck: 'O rotor dá velocidade ao líquido; a voluta transforma essa velocidade em pressão!'
    },
    {
      id: 'pump-topic-2',
      order: 2,
      title: '2. O Padrão ISO 2858 e o Conceito Back-Pull-Out',
      conceptSummary: 'Desmontar tubos pesados de aço toda vez que um rolamento ou selo precisa de troca pararia a fábrica por dias.',
      whatIsIt: 'Uma arquitetura construtiva normalizada internacionalmente onde o suporte de rolamentos (cavalete), a tampa e o rotor saem juntos pela parte de trás.',
      whatDoesItDo: 'Permite fazer toda a manutenção mecânica na bancada mantendo a carcaça espiral (voluta) parafusada na tubulação.',
      whereIsItLocated: 'Na junção perimetral entre a carcaça frontal azul e o cavalete traseiro.',
      whyIsItNeeded: 'Reduz drasticamente o tempo de parada de manutenção (MTTR) e preserva o alinhamento da tubulação.',
      interactionWithOthers: 'Exige um acoplamento com espaçador entre a bomba e o motor para abrir espaço de recuo sem mover o motor elétrico.',
      howToIdentify: 'Série de prisioneiros sextavados em círculo atrás da voluta segurando a tampa de pressão e o cavalete.',
      safetyPrerequisite: 'Sempre fechar as válvulas de sucção e recalque e drenar a voluta pelo bujão inferior antes de soltar os prisioneiros.',
      keyCheck: 'Back-Pull-Out = desmontagem traseira rápida sem mexer nos tubos!'
    },
    {
      id: 'pump-topic-3',
      order: 3,
      title: '3. Rotor Fechado e o Perigo da Cavitação',
      conceptSummary: 'Se a pressão na entrada da bomba cair demais, a água "ferve a frio" formando bolhas de vapor que implodem como pequenos martelos contra o metal.',
      whatIsIt: 'O rotor fechado possui dois discos laterais com pás curvas internas que guiam o líquido do centro para a periferia.',
      whatDoesItDo: 'Transfere a energia do eixo para o fluido através da força centrífuga.',
      whereIsItLocated: 'Chavetado e preso por porca de fixação na extremidade dianteira do eixo, dentro da voluta.',
      whyIsItNeeded: 'O modelo fechado tem alto rendimento hidráulico e evita refluxo graças aos anéis de desgaste.',
      interactionWithOthers: 'Trabalha com uma folga radial calibrada (0,20 a 0,35 mm) em relação ao anel de desgaste da carcaça.',
      howToIdentify: 'Peça circular de bronze ou ferro fundido com canais curvos internos; quando sofre cavitação, apresenta furinhos ásperos ("queijo suíço").',
      safetyPrerequisite: 'Nunca bater com martelo nas bordas do rotor para não desbalancear o conjunto.',
      keyCheck: 'Barulho de "pedregulhos batendo" dentro da bomba ligada é sinal clássico de Cavitação!'
    },
    {
      id: 'pump-topic-4',
      order: 4,
      title: '4. Selo Mecânico EN 12756 vs. Vazamentos',
      conceptSummary: 'O eixo gira a 1750 ou 3500 RPM atravessando uma parede com líquido sob alta pressão: como vedar sem travar o eixo?',
      whatIsIt: 'Conjunto de vedação frontal composto por um anel estacionário (fixo na tampa) e um anel rotativo (preso ao eixo com mola), com faces lapidadas em Carbeto de Silício e Grafite.',
      whatDoesItDo: 'Impede que o fluido bombeado vaze ao longo do eixo para fora da bomba.',
      whereIsItLocated: 'Na câmara de selagem da tampa de pressão, imediatamente atrás do rotor.',
      whyIsItNeeded: 'Elimina o gotejamento contínuo das antigas gaxetas e não desgasta o eixo.',
      interactionWithOthers: 'Depende de uma película invisível do próprio líquido bombeado para lubrificar e resfriar o contato entre suas duas faces.',
      howToIdentify: 'Cilindro com mola helicoidal de aço inox, anéis O-ring de Viton e duas faces espelhadas.',
      safetyPrerequisite: 'Nunca toque nas faces espelhadas do selo com as mãos desprotegidas; a gordura da pele ou um grão de poeira causa vazamento.',
      keyCheck: 'Girar a bomba a seco por 10 segundos já é suficiente para queimar e trincar o selo mecânico!'
    },
    {
      id: 'pump-topic-5',
      order: 5,
      title: '5. Eixo Escalonado, Rolamentos 6308 e Controle Dimensional',
      conceptSummary: 'Um eixo empenado em apenas 0,05 mm destrói o selo mecânico e os rolamentos em poucas semanas.',
      whatIsIt: 'Árvore de aço inox AISI 420 apoiada sobre dois rolamentos rígidos de esferas 6308 dentro do cavalete banhado a óleo.',
      whatDoesItDo: 'Garante rotação concêntrica e rígida entre o acoplamento do motor e o rotor da bomba.',
      whereIsItLocated: 'No interior do cavalete de mancal traseiro.',
      whyIsItNeeded: 'Suporta o peso do rotor, o empuxo hidráulico e mantém o alinhamento rigoroso.',
      interactionWithOthers: 'Lubrificado por banho de óleo ISO VG 46 cujo nível deve ficar exatamente na metade da esfera mais baixa.',
      howToIdentify: 'Eixo cilíndrico com degraus retificados (colos k6) e rasgo de chaveta DIN 6885.',
      safetyPrerequisite: 'Ao montar rolamentos novos no eixo, aplique força apenas no anel interno ou utilize aquecedor indutivo a 100°C.',
      keyCheck: 'Sempre meça o batimento radial (run-out ≤ 0,025 mm) do eixo com o relógio comparador na bancada!'
    }
  ],
  glossary: [
    { term: 'Voluta', definition: 'Carcaça em formato espiral crescente que converte a velocidade do líquido em pressão estática.' },
    { term: 'Rotor (Impelidor)', definition: 'Componente giratório com pás curvas que transfere energia centrífuga ao fluido.' },
    { term: 'Back-Pull-Out', definition: 'Construção normalizada ISO 2858 que permite retirar o conjunto girante pela traseira sem soltar a tubulação.' },
    { term: 'Cavitação', definition: 'Formação e implosão violenta de bolhas de vapor no rotor causada por pressão insuficiente na sucção.' },
    { term: 'Selo Mecânico', definition: 'Dispositivo de vedação axial composto por duas faces ultra planas (sede estacionária e anel rotativo).' },
    { term: 'Run-out (Batimento Radial)', definition: 'Desvio de excentricidade ou empenamento de um eixo medido com relógio comparador ao girá-lo.' },
    { term: 'Chaveta DIN 6885', definition: 'Elemento mecânico prismático de aço encaixado entre o eixo e o cubo do rotor para transmitir torque.' },
    { term: 'NPSH', definition: 'Net Positive Suction Head (Saldo Positivo de Carga de Sucção): margem de pressão necessária para evitar cavitação.' }
  ]
};

export const GEARBOX_LESSON: MachineLesson = {
  id: 'lesson-gearbox-fundamentals',
  courseTitle: 'Formação Interativa em Manutenção Mecânica Industrial',
  moduleNumber: 3,
  moduleTitle: 'Módulo 3: Transmissão Mecânica, Redutores Helicoidais e Análise de Desgaste',
  level: 'Avançado',
  machineId: 'gearbox-reducer',
  recommendedToolId: 'relogio-comparador',
  title: 'Redutores de Engrenagens Helicoidais, Mancais Cônicos e Folga (Backlash)',
  subtitle: 'Multiplicação de Torque, Empuxo Axial, Rolamentos 30206 e Desmontagem em 3D',
  learningObjective:
    'Analisar o funcionamento de engrenagens cilíndricas helicoidais (Z1=17 / Z2=82), explicar por que elas exigem rolamentos de rolos cônicos e executar a intervenção completa no Redutor Helicoidal 3D.',
  targetAudience: 'Avançado — Estudantes prontos para conjuntos de transmissão de potência',
  estimatedTime: '30 minutos',
  practiceTaskTitle: 'Desmontar e Remontar o Redutor de Velocidade Helicoidal em 3D (.GLB)',
  practiceTaskDescription:
    'Abra o Redutor Helicoidal no Laboratório 3D, observe as engrenagens helicoidais e os rolamentos cônicos 30206 e conclua a sequência de manutenção.',
  practiceTargetScreen: 'lab',
  practiceTargetParam: 'gearbox-reducer',
  demonstrationSteps: [
    {
      stepNumber: 1,
      title: 'Abertura da Carcaça Bipartida sem Danificar a Face Retificada',
      narration:
        'Após soltar os 8 parafusos M10 em cruz, a tampa superior é suspensa verticalmente pelos olhais M8. Jamais introduza chaves de fenda entre as faces usinadas.',
      visualFocus: 'Tampa Superior Aletada + 8 Parafusos M10 Classe 8.8',
      keyTakeaway: 'A carcaça bipartida usa vedante anaeróbico sem junta grossa de papelão para não alterar o centro entre eixos.'
    },
    {
      stepNumber: 2,
      title: 'Engrenamento Helicoidal (20°) e Empuxo Axial nos Rolamentos Cônicos',
      narration:
        'O pinhão de 17 dentes transmite força suave para a coroa de 82 dentes (redução 1:4,82). A inclinação de 20° gera empuxo lateral absorvido pelos rolamentos cônicos 30206.',
      visualFocus: 'Eixo-Pinhão Z1=17 + Coroa Z2=82 + Rolamentos Cônicos',
      keyTakeaway: 'Dentes helicoidais exigem mancais que suportem carga radial e carga axial combinadas.'
    },
    {
      stepNumber: 3,
      title: 'Controle de Folga entre Flancos (Backlash) com Relógio Comparador',
      narration:
        'Na remontagem, travamos o pinhão e medimos com o Relógio Comparador Centesimal (0,01 mm) a folga entre os dentes da coroa (0,12 a 0,18 mm) para garantir espaço ao filme de óleo ISO VG 220.',
      visualFocus: 'Relógio Comparador apoiado no flanco do dente da Coroa',
      keyTakeaway: 'Sem folga mínima (backlash), a dilatação térmica trava os dentes; com folga excessiva, ocorrem trancos.'
    }
  ],
  topics: [
    {
      id: 'topic-intro-power',
      order: 1,
      title: '1. O que é um Redutor de Velocidade e Por Que Ele Existe?',
      conceptSummary: 'Motores elétricos giram rápido demais (1750 ou 3500 RPM) e têm força de rotação (torque) insuficiente para mover cargas pesadas de imediato.',
      whatIsIt: 'Um equipamento fechado composto por eixos, engrenagens e rolamentos montados dentro de uma carcaça resistente com banho de óleo.',
      whatDoesItDo: 'Reduz a velocidade de rotação que vem do motor e multiplica a força (torque) disponível para puxar, moer ou erguer cargas na fábrica.',
      whereIsItLocated: 'Fica instalado estrategicamente entre o motor elétrico primário e a máquina que realiza o trabalho (esteira, elevador de carga, moinho).',
      whyIsItNeeded: 'Sem ele, o motor precisaria ser gigantesco e caríssimo para conseguir girar equipamentos lentos e pesados.',
      interactionWithOthers: 'Acopla-se ao motor por acoplamento elástico ou polias na entrada, e ao eixo da máquina na sua ponta de saída.',
      howToIdentify: 'Caixa robusta de ferro cinzento, aletada, com bujão de óleo na parte inferior e olhais de içamento no topo.',
      safetyPrerequisite: 'Antes de qualquer inspeção externa, certifique-se de que o motor está desligado e bloqueado (LOTO).',
      keyCheck: 'Lembre-se: quando a rotação cai, o torque sobe na mesma proporção!'
    },
    {
      id: 'topic-gears-helical',
      order: 2,
      title: '2. Engrenagens Helicoidais: Por Que os Dentes São Inclinados?',
      conceptSummary: 'Dentes retos batem um contra o outro em linha reta, fazendo muito ruído. Dentes helicoidais entram em contato de forma suave e contínua.',
      whatIsIt: 'Rodas dentadas de aço beneficiado cujos dentes foram usinados com uma inclinação angular chamada ângulo de hélice (geralmente 15° a 25°).',
      whatDoesItDo: 'Transmitem movimento e força entre dois eixos paralelos com baixo nível de ruído e alta capacidade de carga.',
      whereIsItLocated: 'No centro da carcaça do redutor, em constante engrenamento com banho no óleo lubrificante.',
      whyIsItNeeded: 'Permite que o redutor trabalhe 24 horas por dia em indústrias sem barulho ensurdecedor e suportando impactos repentinos de carga.',
      interactionWithOthers: 'O pinhão (engrenagem menor do eixo motor) empurra a coroa (engrenagem maior do eixo movido).',
      howToIdentify: 'Observe a direção dos dentes: eles formam uma espiral ou rampa inclinada em relação ao eixo de centro.',
      safetyPrerequisite: 'Nunca aproxime ferramentas ou mãos de engrenagens em rotação. Risco de esmagamento severo.',
      keyCheck: 'O dente inclinado reduz o barulho, mas cria uma força lateral que empurra o eixo para o lado!'
    },
    {
      id: 'topic-taper-bearings',
      order: 3,
      title: '3. Rolamentos de Rolos Cônicos: Os Guardiões dos Eixos',
      conceptSummary: 'Como os dentes inclinados empurram o eixo para o lado e para baixo, precisamos de um rolamento especial que suporte os dois esforços ao mesmo tempo.',
      whatIsIt: 'Um par de anéis de aço temperado com roletes em formato de cone invertido enfileirados em uma gaiola metálica.',
      whatDoesItDo: 'Permite que o eixo gire livremente com pouquíssimo atrito, suportando a força radial (peso) e a força axial (empuxo lateral).',
      whereIsItLocated: 'Prensado nas extremidades dos eixos, repousando dentro dos berços semicilíndricos da carcaça.',
      whyIsItNeeded: 'Se usássemos um rolamento comum de esferas, ele estragaria rapidamente devido ao forte empurrão lateral dos dentes helicoidais.',
      interactionWithOthers: 'Trabalha sempre aos pares e contraposto (um virado contra o outro) para travar o eixo em ambos os sentidos axiais.',
      howToIdentify: 'A capa externa se solta facilmente com as mãos, revelando os roletes cônicos inclinados montados no cone interno.',
      safetyPrerequisite: 'Nunca golpear a capa ou a gaiola com punção ou martelo de aço. O anel é temperado e pode trincar ou soltar estilhaços.',
      keyCheck: 'A folga axial do rolamento cônico deve ser ajustada com micrômetro e calços de espessura calibrados.'
    },
    {
      id: 'topic-sealing-lubrication',
      order: 4,
      title: '4. Vedação e Lubrificação: A Vida Útil do Redutor',
      conceptSummary: 'Metal girando contra metal sem óleo destrói as superfícies usinadas em poucos minutos.',
      whatIsIt: 'Óleo sintético ou mineral de alta viscosidade (ISO VG 220) e retentores de elastômero especial (Viton) com mola.',
      whatDoesItDo: 'O óleo forma uma película protetora microscópica que impede o contato direto entre os dentes de aço; os retentores impedem que o óleo escape para o chão.',
      whereIsItLocated: 'O óleo preenche o terço inferior da carcaça; os retentores ficam nas passagens onde as pontas dos eixos saem para fora da caixa.',
      whyIsItNeeded: 'Sem lubrificação ocorre superaquecimento e quebra imediata de dentes; sem retentor o óleo vaza, contaminando a fábrica e secando a caixa.',
      interactionWithOthers: 'O retentor abraça a superfície super polida do eixo giratório com uma pressão suave mantida por uma mola circular.',
      howToIdentify: 'Anel flexível de cor marrom ou avermelhada com uma mola helicoidal visível no seu interior.',
      safetyPrerequisite: 'Ao drenar óleo aquecido após o funcionamento, use luvas impermeáveis para evitar queimaduras.',
      keyCheck: 'Retentor nunca se reaproveita: ao abrir a tampa para manutenção, substitua sempre por um novo!'
    },
    {
      id: 'topic-maintenance-loto',
      order: 5,
      title: '5. Segurança Operacional e Regra de Ouro (LOTO & NR-12)',
      conceptSummary: 'Nenhum trabalho de mecânica industrial pode começar com a máquina energizada ou conectada.',
      whatIsIt: 'Procedimento padronizado de Bloqueio, Travamento e Etiquetagem (Lockout / Tagout) regulamentado pela norma NR-12.',
      whatDoesItDo: 'Garante que ninguém, por engano ou distração, consiga ligar a eletricidade do motor enquanto o mecânico trabalha com as mãos no equipamento.',
      whereIsItLocated: 'Aplicado no painel elétrico de força e na chave seccionadora geral do circuito do motor.',
      whyIsItNeeded: 'Evita acidentes graves ou fatais causados pela partida inesperada de eixos e engrenagens.',
      interactionWithOthers: 'Cada operador do serviço coloca seu próprio cadeado de cor vermelha e etiqueta com seu nome e telefone.',
      howToIdentify: 'Cadeado físico travando o disjuntor com etiqueta de aviso: "PERIGO — EQUIPAMENTO EM MANUTENÇÃO — NÃO LIGUE".',
      safetyPrerequisite: 'O teste de energia zero (tentar ligar no botão para confirmar que não funciona) é mandatório antes de encostar qualquer chave.',
      keyCheck: 'Sua vida em primeiro lugar: se não estiver bloqueado com seu cadeado, não encoste a ferramenta!'
    }
  ],
  glossary: [
    { term: 'Torque', definition: 'Momento de força que causa a rotação de um corpo em torno de um ponto ou eixo (medido em Newton-metro - N·m).' },
    { term: 'Relação de Transmissão (i)', definition: 'Razão entre a rotação de entrada e a rotação de saída (ex: i=4,82 significa que a cada 4,82 voltas do motor, a saída dá 1 volta).' },
    { term: 'Pinhão', definition: 'A engrenagem de menor número de dentes em um par engrenado, normalmente montada no eixo de alta velocidade.' },
    { term: 'Coroa', definition: 'A engrenagem de maior diâmetro e maior número de dentes acionada pelo pinhão.' },
    { term: 'Ângulo de Hélice', definition: 'Ângulo de inclinação que os dentes helicoidais fazem em relação ao eixo geométrico do eixo.' },
    { term: 'Carga Axial', definition: 'Força paralela à linha central do eixo que empurra o componente para as laterais.' },
    { term: 'Carga Radial', definition: 'Força perpendicular à linha do eixo gerada pelo peso próprio e pela pressão de engrenamento.' },
    { term: 'Folga entre Dentes (Backlash)', definition: 'Distância mínima entre as faces inativas dos dentes para permitir passagem do filme de óleo e dilatação térmica.' }
  ]
};

export const PROFESSIONAL_DIAGNOSTICS_LESSON: MachineLesson = {
  id: 'lesson-professional-diagnostics',
  courseTitle: 'Formação Interativa em Manutenção Mecânica Industrial',
  moduleNumber: 4,
  moduleTitle: 'Módulo 4: Diagnóstico Baseado em Evidências, Ajustes ISO e Planejamento Técnico',
  level: 'Profissional',
  machineId: 'centrifugal-pump',
  recommendedToolId: 'micrometro',
  title: 'Diagnóstico Multi-Etapas, Ajustes Tolerados ISO (H7/k6) e Causa Raiz',
  subtitle: 'Nível Avançado Aplicado: interpretação de sintomas reais, seleção metrológica centesimal e tomada de decisão em manutenção',
  learningObjective:
    'Diagnosticar falhas mecânicas complexas a partir de sintomas combinados (vibração, ruído, vazamento e temperatura), interpretar ajustes ISO (H7/k6) e planejar a intervenção completa com ferramentas de precisão.',
  targetAudience: 'Nível Profissional (Estudo Avançado — Não substitui habilitação formal)',
  estimatedTime: '35 minutos',
  practiceTaskTitle: 'Simulador de Metrologia + Desafio Autônomo Sem Dicas no Laboratório 3D',
  practiceTaskDescription:
    'Meça os 4 componentes no Simulador de Paquímetro 0,05 mm e execute o Modo 4 (Desafio Autônomo) no Laboratório 3D sem cometer erros de sequência.',
  practiceTargetScreen: 'tools',
  practiceTargetParam: 'micrometro',
  demonstrationSteps: [
    {
      stepNumber: 1,
      title: 'Triagem de Sintomas em Campo: Cavitação vs. Desbalanceamento vs. Desalinhamento',
      narration:
        'Ruído de "pedregulhos" na sucção aponta cavitação hidráulica; vibração radial em 1x RPM indica desbalanceamento do rotor; vibração axial em 2x RPM aponta desalinhamento entre motor e bomba.',
      visualFocus: 'Análise Comparativa entre Rotor, Acoplamento e Mancais',
      keyTakeaway: 'Nunca troque peças às cegas: descubra a causa raiz antes de desmontar.'
    },
    {
      stepNumber: 2,
      title: 'Inspeção Metrológica Centesimal: Micrômetro (0,01 mm) + Relógio Comparador',
      narration:
        'Com o eixo na bancada, conferimos o diâmetro do colo do rolamento (Ø40 k6: +0,002 a +0,018 mm) com o Micrômetro Externo e o batimento radial (≤ 0,025 mm) com o Relógio Comparador.',
      visualFocus: 'Micrômetro 0–25/25–50 mm e Relógio Comparador nos Prismas em V',
      keyTakeaway: 'Um colo gasto abaixo da tolerância faz o anel interno do rolamento girar solto no eixo.'
    },
    {
      stepNumber: 3,
      title: 'Montagem Controlada: Aquecimento Indutivo e Aperto Cruzado Documentado',
      narration:
        'Montamos o rolamento aquecido com aquecedor indutivo (sem passar da temperatura indicada pelo fabricante do rolamento), instalamos o selo mecânico com bucha guia e aplicamos o aperto final em estágios até o valor do manual, com torquímetro calibrado.',
      visualFocus: 'Torquímetro de Estalo ISO 6789 em Sequência Cruzada',
      keyTakeaway: 'A confiabilidade industrial nasce do controle dimensional e do torque documentado.'
    }
  ],
  topics: [
    {
      id: 'prof-topic-1',
      order: 1,
      title: '1. Diagnóstico Baseado em Evidências: Lendo os Sintomas da Máquina',
      conceptSummary:
        'Trocar um selo mecânico que vazou sem descobrir POR QUE ele vazou fará o selo novo quebrar novamente em poucos dias.',
      whatIsIt:
        'Metodologia de Análise de Causa Raiz (RCA) que cruza ruído, temperatura de mancal, padrão de desgaste nas peças e histórico operacional.',
      whatDoesItDo:
        'Diferencia se uma falha prematura de selo mecânico foi causada por operação a seco (choque térmico nas faces), eixo empenado (run-out alto) ou cavitação severa (vibração destrutiva).',
      whereIsItLocated:
        'Aplicada na inspeção preliminar e durante a peritagem dos componentes desmontados na bancada.',
      whyIsItNeeded:
        'Elimina retrabalho e paradas repetitivas na planta industrial.',
      interactionWithOthers:
        'Conecta a condição do rotor (erosão), do eixo (empenamento) e dos rolamentos (folga excessiva) à vida útil da vedação.',
      howToIdentify:
        'Faces do selo com trincas radiais indicam trabalho a seco; pista do rolamento marcada na mesma distância das esferas indica brinelling (impacto na montagem).',
      safetyPrerequisite:
        'Aguardar o resfriamento completo da carcaça e despressurização total da linha antes da peritagem.',
      keyCheck: 'Trinca térmica no selo = giro a seco; Vibração + furinhos no rotor = cavitação!'
    },
    {
      id: 'prof-topic-2',
      order: 2,
      title: '2. Leitura de Desenho Técnico: O Que Significa o Ajuste ISO Ø40 k6 e Ø90 H7?',
      conceptSummary:
        'Em mecânica de precisão, um rolamento não pode entrar frouxo no eixo nem apertado demais no alojamento da carcaça.',
      whatIsIt:
        'Sistema internacional de Tolerâncias e Ajustes ABNT NBR 6158 / ISO 286. Letras maiúsculas (H7) indicam furos (carcaça); letras minúsculas (k6) indicam eixos.',
      whatDoesItDo:
        'Define que o colo do eixo (k6) é alguns milésimos de milímetro MAIOR que o furo do rolamento (ajuste com interferência leve), enquanto o alojamento da carcaça (H7) permite deslizamento suave do anel externo.',
      whereIsItLocated:
        'Especificado no desenho técnico dos colos de eixo e dos mancais da Bomba ISO 2858 e do Redutor.',
      whyIsItNeeded:
        'Impede que o anel interno patine no eixo sob carga e permite que o anel externo acomode a dilatação térmica axial do eixo.',
      interactionWithOthers:
        'Exige o uso do Micrômetro Externo (0,01 mm) para medir o eixo e do Súbito / Paquímetro para conferir o alojamento.',
      howToIdentify:
        'Cota no desenho técnico como "Ø40 k6 (+0,002 / +0,018 mm)".',
      safetyPrerequisite:
        'Limpar perfeitamente a peça e zerar o instrumento na temperatura ambiente (20°C) antes de aprovar ou reprovar um eixo.',
      keyCheck: 'Letra minúscula (k6, m6) = Eixo; Letra maiúscula (H7, J7) = Furo do mancal!'
    },
    {
      id: 'prof-topic-3',
      order: 3,
      title: '3. Planejamento de Intervenção e Torqueamento em Múltiplos Estágios',
      conceptSummary:
        'Apertar o primeiro parafuso de um flange direto até o valor final inclina a tampa, esmaga a junta de um lado só e deixa o lado oposto vazando.',
      whatIsIt:
        'Plano de aperto técnico em 3 passes cruzados: 1º passe com 30% do torque, 2º passe com 60% do torque e 3º passe final com 100% do torque nominal no Torquímetro.',
      whatDoesItDo:
        'Garante paralelismo absoluto entre as faces da voluta/tampa e distribuição homogênea da carga nos prisioneiros.',
      whereIsItLocated:
        'Etapa final de fechamento da Bomba Centrífuga ISO 2858 e da carcaça bipartida do Redutor Helicoidal.',
      whyIsItNeeded:
        'Previne empenamento de fundidos, quebra de prisioneiros e desalinhamento interno da câmara do selo.',
      interactionWithOthers:
        'Combina o uso rápido do Soquete com Catraca (aproximação inicial) com o Torquímetro de Estalo calibrado (passes de torque).',
      howToIdentify:
        'Sequência numerada em estrela (1–5–3–7–2–6–4–8) nos 8 parafusos do flange.',
      safetyPrerequisite:
        'Ao terminar o serviço, retornar a escala do Torquímetro de Estalo ao valor mínimo da escala para preservar a mola interna.',
      keyCheck: 'Aperto profissional = Sequência em Cruz (Estrela) + 3 Passes Progressivos (30% → 60% → 100%)!'
    }
  ],
  glossary: [
    { term: 'Ajuste com Interferência (k6)', definition: 'União mecânica onde o diâmetro do eixo é ligeiramente maior que o furo do rolamento, exigindo prensa ou aquecimento.' },
    { term: 'Ajuste Deslizante (H7)', definition: 'Tolerância de furo que permite a entrada justa da capa externa do rolamento sem folga excessiva.' },
    { term: 'Brinelling', definition: 'Deformação permanente (marcas profundas das esferas) nas pistas do rolamento causada por pancadas na montagem.' },
    { term: 'Análise de Causa Raiz (RCA)', definition: 'Investigação técnica para corrigir a origem física da falha em vez de apenas trocar a peça quebrada.' }
  ]
};

export const COURSE_MODULES_ORDER: MachineLesson[] = [
  BEGINNER_TOOLS_LESSON,
  CENTRIFUGAL_PUMP_LESSON,
  GEARBOX_LESSON,
  PROFESSIONAL_DIAGNOSTICS_LESSON
];

export const LESSONS_BY_ID: Record<string, MachineLesson> = {
  'lesson-beginner-tools-fasteners': BEGINNER_TOOLS_LESSON,
  'lesson-centrifugal-pump': CENTRIFUGAL_PUMP_LESSON,
  'lesson-gearbox-fundamentals': GEARBOX_LESSON,
  'lesson-professional-diagnostics': PROFESSIONAL_DIAGNOSTICS_LESSON,
  // Aliases legados preservados para compatibilidade total
  'lesson-lathe-operations': GEARBOX_LESSON,
  'lesson-metrology-precision': CENTRIFUGAL_PUMP_LESSON
};
