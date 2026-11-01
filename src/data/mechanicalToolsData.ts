import { EXTRA_TOOLS } from './mechanicalToolsExtra';

export interface ToolPartHotspot {
  id: string;
  name: string;
  description: string;
  svgX: number;
  svgY: number;
}

export interface ToolKnowledgeQuestion {
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface MechanicalToolProfile {
  id: string;
  name: string;
  subtitle: string;
  category: 'manuais' | 'medicao' | 'manutencao';
  categoryLabel: string;
  purpose: string;
  commonApplications: string[];
  selectionCriteria: string;
  typicalMistakes: string[];
  safetyNotes: string;
  comparison: {
    comparedWith: string;
    differenceExplanation: string;
  };
  parts: ToolPartHotspot[];
  knowledgeQuestion: ToolKnowledgeQuestion;
}

export interface ToolSelectionScenario {
  id: string;
  title: string;
  taskDescription: string;
  machineContext: string;
  correctToolId: string;
  /** Outras ferramentas que também resolvem a tarefa, com a explicação de por que não são a primeira escolha. */
  alsoAcceptable?: Record<string, string>;
  hint: string;
  successExplanation: string;
  wrongToolFeedback: Record<string, string>;
}

const BASE_TOOLS: MechanicalToolProfile[] = [
  {
    id: 'chave-combinada',
    name: 'Chave Combinada (19 mm)',
    subtitle: 'Boca fixa de um lado e anel estriado do outro para porcas e parafusos sextavados',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Serve para apertar e soltar parafusos ou porcas de cabeça sextavada (6 lados). Ela une duas ferramentas em uma só: um lado de boca aberta (para encaixe rápido) e um lado estriado fechado (que abraça todos os cantos do parafuso para fazer força com segurança).',
    commonApplications: [
      'Soltar e aproximar os parafusos sextavados da carcaça (voluta) de uma bomba centrífuga.',
      'Fixar pés de motores elétricos e mancais na bancada metálica.',
      'Manutenção geral de flanges hidráulicos e tampas de redutores.'
    ],
    selectionCriteria:
      'A medida gravada na chave (ex.: 19 mm) deve corresponder exatamente à distância entre duas faces paralelas da cabeça do parafuso (atenção: o parafuso M12 de cabeça DIN 931/933, muito comum no Brasil, usa chave 19 mm, mas pela norma ISO 4014/4017 a cabeça do M12 mede 18 mm — confirme a medida antes). Nunca use uma chave maior que deixe folga.',
    typicalMistakes: [
      'Usar uma chave de 20 mm ou em polegadas num parafuso de 19 mm, arredondando ("espanando") os cantos do sextavado.',
      'Empurrar a chave em vez de puxá-la em direção ao corpo (se a chave escapar ao empurrar, você bate os dedos na máquina).',
      'Bater na chave com martelo ou emendar um cano para aumentar a alavanca.'
    ],
    safetyNotes:
      'Verifique se a chave e o parafuso estão limpos de óleo ou graxa antes de fazer força. Sempre puxe a chave em sua direção mantendo os pés firmes no chão.',
    comparison: {
      comparedWith: 'Chave Inglesa (Ajustável) vs. Chave de Boca',
      differenceExplanation:
        'A Chave Inglesa possui mordente móvel regulável por sem-fim, útil em emergências, mas apresenta pequena folga mecânica. Na oficina industrial, prefira sempre a Chave Combinada na medida exata (ex.: 19 mm), usando o lado estriado para descolar o parafuso sem danificar suas quinas.'
    },
    parts: [
      {
        id: 'boca-aberta',
        name: 'Boca Fixa (Inclinação de 15°)',
        description:
          'Encaixa lateralmente no parafuso para giros rápidos quando o parafuso já está leve. O ângulo de 15° permite inverter a chave em locais apertados.',
        svgX: 90,
        svgY: 110
      },
      {
        id: 'haste-central',
        name: 'Corpo em Aço Cromo-Vanádio (Cr-V)',
        description:
          'Perfil anatômico forjado com a medida nominal (19 mm) gravada em relevo. Resiste à flexão sem quebrar de forma frágil.',
        svgX: 250,
        svgY: 110
      },
      {
        id: 'olhal-estriado',
        name: 'Anel Estriado (12 Pontas)',
        description:
          'Abraça os 6 cantos do parafuso por completo. Deve ser usado no início para destravar parafusos duros sem risco de escapar.',
        svgX: 410,
        svgY: 110
      }
    ],
    knowledgeQuestion: {
      question:
        'Você precisa destravar um parafuso M12 de cabeça DIN 933 (19 mm) da carcaça da bomba que está bem firme. Qual lado da Chave Combinada 19 mm é mais seguro para esse primeiro esforço?',
      options: [
        {
          text: 'O lado do anel estriado (fechado), pois ele envolve todos os cantos do parafuso e não escapa sob força.',
          isCorrect: true,
          feedback:
            'Exato! O anel estriado distribui a força nos 6 cantos do parafuso e evita que a chave escorregue. Depois que o parafuso fica leve, você pode usar a boca aberta para girar mais rápido.'
        },
        {
          text: 'A ponta da boca aberta encaixada só pela metade para sair mais rápido.',
          isCorrect: false,
          feedback:
            'Cuidado: aplicar muita força na ponta da boca aberta pode deformar os cantos do parafuso e fazer a chave escapar.'
        },
        {
          text: 'Qualquer chave próxima, como uma de 21 mm, calçada com uma moeda.',
          isCorrect: false,
          feedback:
            'Improvisar calços em chaves folgadas é uma das maiores causas de acidentes nas mãos e parafusos espanados.'
        }
      ]
    }
  },
  {
    id: 'chave-allen',
    name: 'Chave Allen / Hexagonal (6 mm)',
    subtitle: 'Perfil de 6 lados em formato de "L" para parafusos com encaixe interno',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Utilizada em parafusos cilíndricos ou sem cabeça que possuem um furo de seis lados (sextavado interno). Muito comum em cubos de acoplamento, polias e tampas embutidas onde uma chave comum não teria espaço ao redor do parafuso.',
    commonApplications: [
      'Soltar parafusos prisioneiros (sem cabeça) que travam o cubo do acoplamento no eixo da bomba.',
      'Fixar proteções acrílicas e suportes sensores em máquinas CNC e tornos.',
      'Ajustar blocos de ferramentas e mancais compactos.'
    ],
    selectionCriteria:
      'A chave Allen deve entrar justa até o fundo do alojamento sextavado do parafuso. Antes de inserir a chave, limpe o furo do parafuso caso haja cavaco ou tinta acumulada.',
    typicalMistakes: [
      'Inserir apenas a pontinha da chave no parafuso e fazer força, arredondando o furo interno.',
      'Confundir chave Allen milimétrica (ex.: 6 mm) com chave em polegada (ex.: 7/32"), que entra frouxa e estraga o parafuso.'
    ],
    safetyNotes:
      'Certifique-se de que a chave entrou totalmente no alojamento antes de aplicar torque. Nunca use canos extensores na haste da chave Allen.',
    comparison: {
      comparedWith: 'Chave Allen vs. Chave de Fenda / Phillips',
      differenceExplanation:
        'Parafusos de fenda ou Phillips têm pouco contato e espanam sob alto aperto. O encaixe sextavado interno da Chave Allen transmite muito mais torque em espaços reduzidos, sendo o padrão em máquinas industriais.'
    },
    parts: [
      {
        id: 'braco-curto',
        name: 'Braço Curto (Alto Torque)',
        description:
          'Quando encaixado no parafuso, permite usar o braço longo como alavanca para soltar ou dar o aperto final.',
        svgX: 120,
        svgY: 75
      },
      {
        id: 'curva-90',
        name: 'Curva Temperada de 90°',
        description:
          'Zona de transição tratada termicamente que transforma o movimento em alavanca sem dobrar.',
        svgX: 120,
        svgY: 140
      },
      {
        id: 'braco-longo',
        name: 'Haste Longa (Alcance Profundo)',
        description:
          'Usada para girar rapidamente o parafuso ou alcançar parafusos embutidos dentro de carcaças.',
        svgX: 310,
        svgY: 140
      }
    ],
    knowledgeQuestion: {
      question:
        'Por que é essencial limpar a sujeira de dentro da cabeça de um parafuso Allen antes de encaixar a chave?',
      options: [
        {
          text: 'Para que a chave entre até o fundo do sextavado, evitando que ela pegue só na borda e arredonde o encaixe.',
          isCorrect: true,
          feedback:
            'Perfeito! Se houver graxa endurecida ou limalha no fundo, a chave entra só pela metade e espana o parafuso na hora de fazer força.'
        },
        {
          text: 'Apenas por estética, pois a sujeira não interfere no encaixe mecânico.',
          isCorrect: false,
          feedback:
            'A sujeira no fundo impede que a chave desça totalmente, reduzindo a área de contato e estragando o parafuso.'
        },
        {
          text: 'Para deixar o parafuso mais leve durante a rotação do eixo.',
          isCorrect: false,
          feedback:
            'O motivo real é garantir o encaixe completo das 6 faces da chave até o fundo do furo.'
        }
      ]
    }
  },
  {
    id: 'torquimetro',
    name: 'Torquímetro de Estalo (10–60 N·m)',
    subtitle: 'Ferramenta de precisão que avisa com um "clique" quando o aperto exato é atingido',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Aplica uma força de aperto medida e exata (chamada de torque, medida em Newton-metro: N·m). Quando você atinge o valor ajustado no cabo, ele dá um estalo audível e tátil na mão, avisando para parar de apertar.',
    commonApplications: [
      'Aperto final cruzado dos parafusos da tampa da bomba no valor indicado pelo fabricante.',
      'Fechamento de tampas de mancais de rolamentos sem esmagar a junta de vedação.',
      'Montagem de cabeçotes e flanges pressurizados.'
    ],
    selectionCriteria:
      'Consulte a tabela técnica ou manual da máquina para saber o torque em N·m (o valor depende do parafuso, da classe, da lubrificação e da junta — não existe um número único) e escolha um torquímetro cuja faixa cubra esse valor no meio da escala.',
    typicalMistakes: [
      'Usar o torquímetro para SOLTAR parafusos enferrujados (isso descalibra a mola interna de medição!).',
      'Continuar puxando após ouvir o estalo ("dar mais um puxãozinho para garantir").',
      'Guardar o torquímetro na caixa com a mola comprimida em vez de retornar a escala ao valor mínimo.'
    ],
    safetyNotes:
      'Nunca use o torquímetro como chave catraca comum de desmontagem. Após terminar a montagem, retorne o punho para a carga mínima para preservar a calibração.',
    comparison: {
      comparedWith: 'Torquímetro vs. Chave Catraca Comum',
      differenceExplanation:
        'A Catraca Comum serve para aproximar ou soltar parafusos rapidamente, mas não mede força. O Torquímetro é um instrumento calibrado usado apenas na etapa final do aperto para garantir que todos os parafusos recebam a mesma pressão.'
    },
    parts: [
      {
        id: 'cabeca-catraca',
        name: 'Cabeça Catraca com Encaixe 1/2"',
        description:
          'Onde se encaixa o soquete sextavado (ex.: soquete 19 mm). Possui mecanismo interno que estala no torque programado.',
        svgX: 90,
        svgY: 110
      },
      {
        id: 'escala-nm',
        name: 'Visor Graduado em Newton-metro (N·m)',
        description:
          'Escala gravada a laser no tubo onde o mecânico lê o valor exato de aperto antes de iniciar o serviço.',
        svgX: 255,
        svgY: 110
      },
      {
        id: 'punho-micrometrico',
        name: 'Punho Recartilhado de Ajuste e Trava',
        description:
          'Gira-se este cabo para regular o torque desejado (o valor do manual) e trava-se o anel inferior antes de puxar.',
        svgX: 410,
        svgY: 110
      }
    ],
    knowledgeQuestion: {
      question:
        'Ao fechar a tampa de uma bomba com 8 parafusos usando o torquímetro ajustado no valor do manual, por que apertamos em "sequência cruzada" (estrela) até ouvir o estalo?',
      options: [
        {
          text: 'Para comprimir a junta de vedação por igual em toda a volta, evitando empenar a tampa ou causar vazamentos.',
          isCorrect: true,
          feedback:
            'Excelente! O aperto cruzado com torque controlado faz a tampa assentar reta, garantindo vedação uniforme.'
        },
        {
          text: 'Para gastar menos energia muscular durante o turno.',
          isCorrect: false,
          feedback:
            'O objetivo técnico do aperto em estrela é distribuir a pressão de fechamento uniformemente sobre o flange.'
        },
        {
          text: 'Porque o torquímetro só funciona se mudarmos de lado a cada parafuso.',
          isCorrect: false,
          feedback:
            'O torquímetro funciona em qualquer parafuso, mas a sequência cruzada protege a tampa contra empenamento.'
        }
      ]
    }
  },
  {
    id: 'paquimetro',
    name: 'Paquímetro Universal (0,05 mm)',
    subtitle: 'Instrumento essencial para medir diâmetros externos, furos internos e profundidades',
    category: 'medicao',
    categoryLabel: 'Instrumentos de Medição',
    purpose:
      'Mede peças mecânicas com precisão de décimos e centésimos de milímetro (0,05 mm ou 0,02 mm) — muito mais preciso que uma régua ou trena comum. É um instrumento "4 em 1": mede por fora, por dentro, profundidade de furos e ressaltos.',
    commonApplications: [
      'Conferir o diâmetro externo do eixo e de parafusos (ex.: verificar se o parafuso é M10 ou M12).',
      'Medir o diâmetro interno do furo do rotor ou da bucha.',
      'Medir a largura e profundidade do rasgo de chaveta no eixo.'
    ],
    selectionCriteria:
      'Ideal para medições rápidas de bancada onde a tolerância admitida é de até ±0,05 mm. Para ajustes ainda mais finos (como assentos de rolamento de ±0,005 mm), usa-se o Micrômetro.',
    typicalMistakes: [
      'Medir uma peça enquanto ela está girando no torno ou quente logo após a usinagem.',
      'Apertar o cursor com força excessiva contra a peça, inclinando os bicos de medição.',
      'Usar as pontas do paquímetro como compasso para riscar aço.'
    ],
    safetyNotes:
      'JAMAIS tente medir uma peça em movimento. Limpe as rebarbas da peça e encoste os bicos suavemente antes de fazer a leitura.',
    comparison: {
      comparedWith: 'Paquímetro Universal vs. Trena / Régua Metálica',
      differenceExplanation:
        'Uma trena ou régua tem divisão mínima de 1 mm ou 0,5 mm (ótimo para cortar barras ou medir bancadas). Já o Paquímetro usa a escala do Nônio (Vernier) para dividir 1 milímetro em 20 ou 50 partes, permitindo conferir encaixes mecânicos precisos.'
    },
    parts: [
      {
        id: 'orelhas-internas',
        name: 'Orelhas Fixa e Móvel (Medição Interna)',
        description:
          'Introduzidas dentro de furos, buchas ou anéis de rolamento para medir o diâmetro interno.',
        svgX: 115,
        svgY: 52
      },
      {
        id: 'bicos-externos',
        name: 'Bicos / Encostos (Medição Externa)',
        description:
          'Abraçam o lado de fora de eixos, parafusos e chapas para medir espessuras e diâmetros externos.',
        svgX: 115,
        svgY: 155
      },
      {
        id: 'nonio-vernier',
        name: 'Cursor com Escala do Nônio (Vernier)',
        description:
          'Desliza sobre a régua principal. O traço do nônio que coincidir perfeitamente com um traço da régua indica os décimos/centésimos de milímetro.',
        svgX: 215,
        svgY: 115
      },
      {
        id: 'haste-profundidade',
        name: 'Haste de Profundidade',
        description:
          'Sai pela ponta traseira do paquímetro conforme o cursor abre, servindo para medir o fundo de furos cegos e rasgos de chaveta.',
        svgX: 435,
        svgY: 105
      }
    ],
    knowledgeQuestion: {
      question:
        'Qual parte do Paquímetro Universal você deve usar para descobrir a profundidade de um rasgo de chaveta usinado no eixo da bomba?',
      options: [
        {
          text: 'A haste fina de profundidade que sai na extremidade traseira da régua quando abrimos o cursor.',
          isCorrect: true,
          feedback:
            'Correto! Apoiando a base traseira da régua na superfície do eixo, a haste fina desce até o fundo do rasgo e mostra a profundidade exata.'
        },
        {
          text: 'As orelhas superiores de medição interna.',
          isCorrect: false,
          feedback:
            'As orelhas superiores servem para medir a largura interna de furos e rasgos, mas não a profundidade até o fundo.'
        },
        {
          text: 'O parafuso de fixação superior.',
          isCorrect: false,
          feedback:
            'O parafuso superior serve apenas para travar o cursor após a medição.'
        }
      ]
    }
  },
  {
    id: 'micrometro',
    name: 'Micrômetro Externo (0–25 mm • 0,01 mm)',
    subtitle: 'Instrumento de alta precisão centesimal com catraca limitadora de pressão',
    category: 'medicao',
    categoryLabel: 'Instrumentos de Medição',
    purpose:
      'Mede dimensões externas com altíssima exatidão (cada divisão equivale a 0,01 mm — um centésimo de milímetro, mais fino que um fio de cabelo!). Essencial para verificar se o eixo tem a medida exata para receber um rolamento.',
    commonApplications: [
      'Conferir o diâmetro do colo do eixo onde o rolamento 6309 será montado com interferência.',
      'Verificar desgaste ou ovalização em eixos retificados.',
      'Medir espessura de calços de ajuste (shims) de alinhamento de bombas.'
    ],
    selectionCriteria:
      'Os micrômetros são divididos em faixas de 25 em 25 mm (0–25 mm, 25–50 mm, 50–75 mm). Escolha a faixa correspondente ao diâmetro da peça.',
    typicalMistakes: [
      'Apertar a peça girando o tambor com força em vez de usar a catraca na ponta traseira (forçar o tambor deforma o arco e altera a medida).',
      'Segurar o arco metálico diretamente no metal por muito tempo, fazendo o calor da mão dilatar o instrumento.'
    ],
    safetyNotes:
      'Segure o micrômetro sempre pelas placas isolantes térmicas do arco e faça o encosto final exclusivamente pela catraca (3 cliques suaves).',
    comparison: {
      comparedWith: 'Micrômetro (0,01 mm) vs. Paquímetro (0,05 mm)',
      differenceExplanation:
        'O Paquímetro é versátil e mede de 0 a 150 mm rapidamente. O Micrômetro trabalha numa faixa menor (ex.: 0 a 25 mm), mas seu fuso roscado de alta precisão e sua catraca garantem que dois mecânicos diferentes encontrem exatamente o mesmo centésimo de milímetro.'
    },
    parts: [
      {
        id: 'arco-termico',
        name: 'Arco Rígido com Isolante Térmico',
        description:
          'Estrutura em C super-rígida com placas plásticas para impedir que o calor da mão do operador dilate o aço.',
        svgX: 115,
        svgY: 145
      },
      {
        id: 'fuso-bigorna',
        name: 'Batente Fixo e Fuso Móvel (Faces de Metal Duro)',
        description:
          'Superfícies lapidadas de carbeto de tungstênio que tocam a peça a ser medida.',
        svgX: 140,
        svgY: 85
      },
      {
        id: 'tambor-bainha',
        name: 'Bainha e Tambor Graduado (50 divisões de 0,01 mm)',
        description:
          'A cada volta completa do tambor, o fuso avança 0,50 mm. Cada traço do tambor vale 0,01 mm.',
        svgX: 290,
        svgY: 85
      },
      {
        id: 'catraca',
        name: 'Catraca Limitadora de Força',
        description:
          'Gira em falso emitindo pequenos cliques assim que o fuso encosta na peça, garantindo pressão de medição sempre igual.',
        svgX: 430,
        svgY: 85
      }
    ],
    knowledgeQuestion: {
      question:
        'Para que serve a pequena catraca localizada na ponta direita do Micrômetro Externo?',
      options: [
        {
          text: 'Para limitar a pressão do fuso sobre a peça, garantindo uma medição exata sem forçar nem deformar o arco.',
          isCorrect: true,
          feedback:
            'Perfeito! Ao girar pela catraca até ouvir 3 cliques suaves, a força aplicada sobre a peça é sempre padronizada.'
        },
        {
          text: 'Para zerar a bateria digital do instrumento.',
          isCorrect: false,
          feedback:
            'O micrômetro mecânico não usa bateria; a catraca é um limitador mecânico de torque de medição.'
        },
        {
          text: 'Para destravar o arco quando queremos medir furos internos.',
          isCorrect: false,
          feedback:
            'O micrômetro externo mede dimensões externas; a catraca controla a pressão de contato do fuso.'
        }
      ]
    }
  },
  {
    id: 'chave-boca',
    name: 'Chave Fixa de Duas Bocas (17×19 mm)',
    subtitle: 'Chave plana de duas medidas com inclinação de 15° para locais estreitos',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Aperta e solta porcas e parafusos sextavados ou quadrados em locais onde o acesso por cima é bloqueado e só é possível encaixar a chave lateralmente.',
    commonApplications: [
      'Segurar a contraporca de pés de nivelamento de bombas e motores.',
      'Aproximar rapidamente porcas de 17 e 19 mm em tubulações (M10 e M12 pela DIN 933/934; pela ISO 4032 essas porcas têm 16 e 18 mm).',
      'Trabalhos em frestas laterais onde um soquete ou anel estriado não entra.'
    ],
    selectionCriteria:
      'Escolha sempre a boca milimétrica exata (17 mm ou 19 mm) que veste as duas faces paralelas da porca sem folga.',
    typicalMistakes: [
      'Aplicar força excessiva apenas com a ponta das mandíbulas, arredondando os cantos do parafuso.',
      'Empurrar a chave em vez de puxá-la em direção ao corpo, aumentando o risco de ferir a mão caso escape.'
    ],
    safetyNotes:
      'Inspecione se as mandíbulas não estão abertas ("esgarçadas") antes de aplicar força.',
    comparison: {
      comparedWith: 'Chave Fixa de Boca vs. Chave Combinada',
      differenceExplanation:
        'A Chave de Duas Bocas traz duas medidas diferentes na mesma ferramenta (ex.: 17 mm e 19 mm), mas ambas são abertas. Já a Chave Combinada tem a mesma medida nas duas pontas, unindo a rapidez da boca aberta à segurança do anel estriado.'
    },
    parts: [
      {
        id: 'boca-17mm',
        name: 'Mandíbula Menor (17 mm)',
        description:
          'Abertura de 17 mm entre faces, inclinada 15° para virar a chave do avesso e ganhar giro em locais apertados. Serve a cabeça M10 da DIN 933/934; pela ISO 4017/4032 o M10 tem 16 mm.',
        svgX: 90,
        svgY: 110
      },
      {
        id: 'corpo-forjado',
        name: 'Corpo Plano Forjado em Cromo-Vanádio',
        description:
          'Perfil fino e resistente que transmite o esforço da mão sem entortar.',
        svgX: 250,
        svgY: 110
      },
      {
        id: 'boca-19mm',
        name: 'Mandíbula Maior (19 mm)',
        description:
          'Abertura de 19 mm entre faces. Serve a cabeça M12 da DIN 933/934, ainda muito comum em flanges; pela ISO 4017/4032 o M12 tem 18 mm — confira antes.',
        svgX: 410,
        svgY: 110
      }
    ],
    knowledgeQuestion: {
      question:
        'Por que as bocas da Chave Fixa possuem um ângulo de 15° em relação ao corpo da ferramenta?',
      options: [
        {
          text: 'Para permitir inverter a chave em locais apertados e continuar girando a porca mesmo com pouco espaço de movimento.',
          isCorrect: true,
          feedback:
            'Exato! Virando a chave de lado a cada movimento, o ângulo de 15° permite girar porcas em vãos de apenas 30°.'
        },
        {
          text: 'Apenas por estética de fabricação.',
          isCorrect: false,
          feedback:
            'Na engenharia mecânica, cada ângulo da ferramenta tem uma função prática de acesso e ergonomia.'
        },
        {
          text: 'Para servir como alavanca de abrir tampas de ferro fundido.',
          isCorrect: false,
          feedback:
            'Nunca use chaves fixas como alavanca para forçar tampas usinadas.'
        }
      ]
    }
  },
  {
    id: 'chave-inglesa',
    name: 'Chave Ajustável / Inglesa (10")',
    subtitle: 'Chave de abertura regulável por sem-fim para manutenção geral',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Permite ajustar a distância entre as mandíbulas girando o tambor recartilhado (sem-fim), adaptando-se a diversas medidas de porcas e conexões hidráulicas quando não se tem a chave fixa exata em mãos.',
    commonApplications: [
      'Segurar conexões sextavadas de linhas de água de resfriamento e ar comprimido.',
      'Atendimentos rápidos de campo com medidas variadas em milímetros ou polegadas.',
      'Apoiar cabeças quadradas de bujões de dreno.'
    ],
    selectionCriteria:
      'Ajuste o sem-fim até eliminar toda a folga na porca e posicione a chave de modo que a força principal recaia sobre a mandíbula FIXA.',
    typicalMistakes: [
      'Deixar a mandíbula móvel frouxa na porca, o que espana os cantos imediatamente.',
      'Girar no sentido errado concentrando toda a força na mandíbula móvel ou usar para soltar parafusos de alto torque.'
    ],
    safetyNotes:
      'Reajuste o sem-fim a cada tentativa e nunca bata com martelo no cabo da Chave Inglesa.',
    comparison: {
      comparedWith: 'Chave Inglesa (Ajustável) vs. Chave Fixa / Combinada',
      differenceExplanation:
        'A Chave Inglesa é versátil por atender várias medidas, mas sua mandíbula móvel possui uma pequena folga mecânica. Por isso, em parafusos muito apertados da bomba ou do redutor, prefira sempre a Chave Combinada ou Soquete da medida exata.'
    },
    parts: [
      {
        id: 'mandibula-movel',
        name: 'Mandíbula Fixa e Mandíbula Móvel',
        description:
          'A mandíbula fixa suporta o esforço pesado, enquanto a móvel desliza pela cremalheira para se ajustar à porca.',
        svgX: 95,
        svgY: 110
      },
      {
        id: 'sem-fim-recartilhado',
        name: 'Tambor Sem-Fim Recartilhado',
        description:
          'Parafuso sem-fim girado com o polegar para abrir ou fechar a mandíbula com precisão.',
        svgX: 165,
        svgY: 125
      },
      {
        id: 'cabo-anatomico',
        name: 'Cabo Forjado com Olhal de Suspensão',
        description:
          'Alavanca anatômica com furo na extremidade para pendurar no painel de ferramentas ou prender cordão de segurança.',
        svgX: 350,
        svgY: 110
      }
    ],
    knowledgeQuestion: {
      question:
        'Ao usar uma Chave Inglesa (Ajustável), para qual lado você deve aplicar a força de giro?',
      options: [
        {
          text: 'No sentido que pressiona a força principal contra a mandíbula FIXA, protegendo a mandíbula móvel.',
          isCorrect: true,
          feedback:
            'Perfeito! A mandíbula fixa é forjada em peça única com o cabo e suporta muito mais esforço sem abrir.'
        },
        {
          text: 'Deixando 2 mm de folga para a chave sair fácil depois.',
          isCorrect: false,
          feedback:
            'Qualquer folga na Chave Inglesa faz a ferramenta escapar e arredondar a porca.'
        },
        {
          text: 'Batendo na ponta do cabo com uma marreta.',
          isCorrect: false,
          feedback:
            'Impactos quebram a cremalheira do sem-fim e podem projetar a ferramenta.'
        }
      ]
    }
  },
  {
    id: 'soquete-catraca',
    name: 'Soquete Sextavado 19 mm e Catraca Reversível 1/2"',
    subtitle: 'Conjunto de encaixe rápido que gira parafusos sem precisar retirar a chave da cabeça',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'O soquete sextavado veste completamente a cabeça do parafuso por cima, enquanto o mecanismo interno da catraca permite girar em um sentido e retornar em falso (fazendo "clic-clic") sem tirar a ferramenta do parafuso.',
    commonApplications: [
      'Remoção e aproximação ágil dos 8 parafusos M12 da carcaça da Bomba Centrífuga e do Redutor.',
      'Acesso a parafusos alojados em rebaixos fundos usando barra de extensão.',
      'Acoplamento do soquete diretamente no Torquímetro para o aperto final.'
    ],
    selectionCriteria:
      'Prefira soquetes sextavados (6 lados) para parafusos de alto aperto e selecione a alavanca reversora da catraca para apertar ou soltar.',
    typicalMistakes: [
      'Usar soquetes comuns cromados (manuais) em chaves pneumáticas de impacto (que exigem soquetes pretos de cromo-molibdênio).',
      'Usar cano prolongador na catraca, quebrando os dentes internos do mecanismo reversor.'
    ],
    safetyNotes:
      'Certifique-se de que a esfera de retenção do encaixe quadrado de 1/2" travou firme no soquete antes de usar.',
    comparison: {
      comparedWith: 'Catraca Reversível vs. Torquímetro de Estalo',
      differenceExplanation:
        'A Catraca Reversível serve para ganhar velocidade ao rosquear ou desenroscar o parafuso, mas NÃO mede força. O Torquímetro parece uma catraca mais longa, porém possui mola calibrada interna e deve ser usado apenas no aperto final em N·m.'
    },
    parts: [
      {
        id: 'soquete-sextavado',
        name: 'Soquete Sextavado 19 mm (Cromo-Vanádio)',
        description:
          'Copo cilíndrico com 6 faces internas que abraça 100% da cabeça do parafuso M12 sem escapar.',
        svgX: 110,
        svgY: 145
      },
      {
        id: 'cabeca-reversivel',
        name: 'Cabeça da Catraca com Seletor de Reversão',
        description:
          'Contém engrenagem e lingueta que permitem inverter entre apertar e soltar com um toque.',
        svgX: 110,
        svgY: 95
      },
      {
        id: 'cabo-recartilhado',
        name: 'Haste Cromada e Empunhadura Ergonômica',
        description:
          'Garante pegada firme mesmo com luvas na oficina mecânica.',
        svgX: 330,
        svgY: 95
      }
    ],
    knowledgeQuestion: {
      question:
        'Qual é a grande vantagem de usar um Soquete com Catraca Reversível ao soltar os 8 parafusos de uma carcaça?',
      options: [
        {
          text: 'Você não precisa tirar e recolocar a ferramenta no parafuso a cada movimento, agilizando o trabalho com segurança.',
          isCorrect: true,
          feedback:
            'Exato! O mecanismo de catraca trava no sentido de força e gira livre no retorno, economizando tempo e esforço.'
        },
        {
          text: 'A catraca substitui o torquímetro e mede os Newton-metros sozinha.',
          isCorrect: false,
          feedback:
            'Uma catraca comum não possui escala de torque; o aperto final calibrado exige o Torquímetro.'
        },
        {
          text: 'Um único soquete de 19 mm serve em parafusos de qualquer tamanho.',
          isCorrect: false,
          feedback:
            'Cada medida de cabeça sextavada exige seu soquete correspondente.'
        }
      ]
    }
  },
  {
    id: 'relogio-comparador',
    name: 'Relógio Comparador Centesimal (0,01 mm) com Base Magnética',
    subtitle: 'Instrumento de precisão para medir empenamento de eixos (batimento) e alinhamento',
    category: 'medicao',
    categoryLabel: 'Instrumentos de Medição',
    purpose:
      'Diferente do paquímetro (que mede o tamanho absoluto da peça), o Relógio Comparador mede pequenas variações, desvios, folgas e excentricidades com precisão de 0,01 mm (1 centésimo de milímetro) através de uma ponta apalpadora ligada a um mostrador circular.',
    commonApplications: [
      'Verificar se o eixo da Bomba Centrífuga está torto (medição de batimento radial / run-out sobre prismas em V).',
      'Medir a folga entre dentes (backlash) das engrenagens do Redutor Helicoidal.',
      'Alinhar o eixo da bomba com o eixo do motor elétrico.'
    ],
    selectionCriteria:
      'Prenda a base magnética em uma superfície firme de aço, posicione o fuso apalpador perpendicular (90°) à peça e dê uma pequena pré-carga (1 volta do ponteiro) antes de zerar o mostrador.',
    typicalMistakes: [
      'Esquecer de dar a pré-carga antes de zerar o mostrador, perdendo a leitura quando a peça se afasta.',
      'Girar um eixo áspero ou com rasgo de chaveta passando direto sob a ponta do apalpador, dando trancos nas engrenagens internas do relógio.'
    ],
    safetyNotes:
      'Nunca solte o fuso apalpador bruscamente e desligue a chave magnética da base antes de retirá-la da bancada.',
    comparison: {
      comparedWith: 'Relógio Comparador vs. Micrômetro / Paquímetro',
      differenceExplanation:
        'O Paquímetro e o Micrômetro dizem "qual é o diâmetro do eixo" (ex.: 40,00 mm). Já o Relógio Comparador diz "o quanto o eixo oscila ou está empenado ao girar" (ex.: batimento de 0,02 mm).'
    },
    parts: [
      {
        id: 'base-magnetica',
        name: 'Base Magnética com Chave Liga/Desliga e Braço Articulado',
        description:
          'Fixa o instrumento com ímã potente na carcaça ou bancada de aço para que o relógio não se mova durante a leitura.',
        svgX: 130,
        svgY: 145
      },
      {
        id: 'mostrador-centesimal',
        name: 'Mostrador Giratório Graduado em 0,01 mm',
        description:
          'Cada divisão equivale a 0,01 mm e uma volta completa do ponteiro grande corresponde a 1,00 mm.',
        svgX: 330,
        svgY: 75
      },
      {
        id: 'fuso-apalpador',
        name: 'Fuso com Ponta de Contato Esférica',
        description:
          'Encosta suavemente na superfície do eixo ou da engrenagem e transmite qualquer oscilação ao ponteiro.',
        svgX: 330,
        svgY: 165
      }
    ],
    knowledgeQuestion: {
      question:
        'Para descobrir se o eixo da Bomba Centrífuga sofreu empenamento (está "torto" ao girar), qual instrumento devemos usar?',
      options: [
        {
          text: 'Apoiar o eixo em prismas em V, encostar a ponta do Relógio Comparador no eixo e girá-lo lentamente observando a oscilação do ponteiro.',
          isCorrect: true,
          feedback:
            'Exatamente! Esse ensaio se chama verificação de batimento radial (run-out) e revela desvios de apenas centésimos de milímetro.'
        },
        {
          text: 'Medir o comprimento do eixo com uma trena metálica.',
          isCorrect: false,
          feedback:
            'A trena não consegue detectar empenamentos centesimais de um eixo retificado.'
        },
        {
          text: 'Apertar o eixo com o Torquímetro.',
          isCorrect: false,
          feedback:
            'O Torquímetro serve para aperto de parafusos, não para medição de excentricidade.'
        }
      ]
    }
  },
  {
    id: 'saca-polias',
    name: 'Saca-Polias / Extrator de 3 Garras',
    subtitle: 'Ferramenta de manutenção para remover rolamentos, polias e rotores sem pancadas',
    category: 'manutencao',
    categoryLabel: 'Manutenção Mecânica',
    purpose:
      'Remove peças montadas sob pressão (ajuste com interferência) no eixo — como rolamentos, polias, engrenagens e rotores. Enquanto as 3 garras seguram a peça por trás, o parafuso central (fuso) empurra o centro do eixo, puxando a peça de forma reta e suave.',
    commonApplications: [
      'Extrair os rolamentos rígidos de esferas 6308/6309 do eixo da Bomba Centrífuga ou do Redutor.',
      'Sacar polias e acoplamentos presos ao eixo sem usar marreta ou alavanca.',
      'Remoção controlada de engrenagens e rotores.'
    ],
    selectionCriteria:
      'Ajuste a abertura das 3 garras para que todas fiquem na mesma altura e perfeitamente alinhadas com o eixo antes de girar o fuso central.',
    typicalMistakes: [
      'Tentar arrancar um rolamento batendo com martelo e chave de fenda por trás (isso entorta o eixo e marca o assento!).',
      'Posicionar as garras tortas ou puxar um rolamento pela pista externa quando ele está preso no eixo sem apoio adequado.'
    ],
    safetyNotes:
      'Mantenha o fuso central lubrificado com graxa e verifique se as 3 garras estão bem engatadas na peça antes de aplicar força com a chave.',
    comparison: {
      comparedWith: 'Saca-Polias de 3 Garras vs. Alavanca / Martelo',
      differenceExplanation:
        'Bater com martelo ou forçar com duas chaves de fenda inclina o rolamento no eixo ("encavala"), riscando o aço retificado. O Saca-Polias aplica força axial perfeitamente alinhada com o centro do eixo, preservando a máquina.'
    },
    parts: [
      {
        id: 'fuso-central',
        name: 'Fuso Central Rosqueado com Ponta Cônica',
        description:
          'Apoia-se exatamente no furo de centro da ponta do eixo. Ao ser girado com uma chave, puxa todo o conjunto para trás.',
        svgX: 250,
        svgY: 95
      },
      {
        id: 'cruzeta-corpo',
        name: 'Cruzeta / Suporte Triplo Simétrico',
        description:
          'Distribui a força de tração igualmente a 120° entre os três braços articulados.',
        svgX: 250,
        svgY: 65
      },
      {
        id: 'garras-articuladas',
        name: 'Garras Forjadas Reversíveis (3 un.)',
        description:
          'Engatam atrás do anel do rolamento ou do cubo da polia para puxá-lo sem escorregar.',
        svgX: 145,
        svgY: 145
      }
    ],
    knowledgeQuestion: {
      question:
        'O rolamento está firme no eixo da Bomba Centrífuga. Qual é a forma correta de removê-lo sem danificar o eixo?',
      options: [
        {
          text: 'Centralizar o fuso do Saca-Polias (Extrator) na ponta do eixo, apoiar as 3 garras de forma alinhada e girar o fuso progressivamente.',
          isCorrect: true,
          feedback:
            'Isso mesmo! O extrator puxa o rolamento reto em relação ao eixo, sem impactos e sem riscar o colo retificado.'
        },
        {
          text: 'Bater na lateral do rolamento com um martelo de aço até ele sair.',
          isCorrect: false,
          feedback:
            'Pancadas laterais com martelo de aço entortam o eixo, quebram a gaiola do rolamento e podem lançar estilhaços.'
        },
        {
          text: 'Forçar duas chaves de fenda grandes por trás do rolamento como alavanca.',
          isCorrect: false,
          feedback:
            'Chaves de fenda não foram feitas para alavanca e acabam marcando o encosto da carcaça e do eixo.'
        }
      ]
    }
  }
];

export const MECHANICAL_TOOLS_CATALOG: MechanicalToolProfile[] = [...BASE_TOOLS, ...EXTRA_TOOLS];


export const TOOL_SELECTION_SCENARIOS: ToolSelectionScenario[] = [
  {
    id: 'scenario-1-volute-bolts',
    title: 'Desafio 1: Soltar os Parafusos da Carcaça da Bomba',
    taskDescription:
      'Você vai iniciar a manutenção da bomba centrífuga (já bloqueada e sem pressão). Precisa soltar os 8 parafusos sextavados M12 (cabeça de 19 mm) que prendem a carcaça espiral.',
    machineContext: 'Bomba centrífuga • Fixações M12 (cabeça 19 mm, DIN 933)',
    correctToolId: 'chave-combinada',
    alsoAcceptable: {
      'soquete-catraca': 'Também resolve: o soquete 19 mm abraça a cabeça inteira e a catraca agiliza. Use-o se houver espaço para o cabo e a cabeça da catraca.',
      'chave-estrela': 'Também resolve, pelo anel de 19 mm: abraça os cantos e não escorrega.'
    },
    hint: 'Procure a ferramenta manual feita exatamente para abraçar cabeças sextavadas externas de 19 mm com segurança.',
    successExplanation:
      'Excelente escolha! O lado estriado da Chave Combinada 19 mm abraça os 6 cantos do parafuso M12 para destravá-lo sem espanar, e a boca aberta agiliza a retirada.',
    wrongToolFeedback: {
      'chave-allen': 'A Chave Allen é para parafusos com furo sextavado interno, mas os parafusos da carcaça têm cabeça sextavada externa de 19 mm.',
      'torquimetro': 'Lembre-se da regra de ouro: nunca usamos o Torquímetro para SOLTAR parafusos presos, pois isso descalibra seu mecanismo de medição!',
      'paquimetro': 'O Paquímetro é um instrumento de medição delicado, nunca uma ferramenta para soltar parafusos.',
      'micrometro': 'O Micrômetro serve apenas para medir dimensões centesimais.',
      'saca-polias': 'O Saca-Polias serve para extrair rolamentos e polias do eixo, não para soltar parafusos.',
      'chave-inglesa': 'A Chave Inglesa tem folga no mordente e pode arredondar o sextavado num aperto firme. Use a chave na medida exata.',
      'alicate-universal': 'O alicate não encaixa nas faces: arredonda a cabeça do parafuso.'
    }
  },
  {
    id: 'scenario-2-coupling-grub-screw',
    title: 'Desafio 2: Destravar o Parafuso Embutido do Acoplamento',
    taskDescription:
      'No cubo do acoplamento do eixo há um parafuso prisioneiro (sem cabeça externa) que possui um encaixe interno de 6 lados de 6 mm.',
    machineContext: 'Acoplamento do Eixo • Parafuso Sextavado Interno',
    correctToolId: 'chave-allen',
    hint: 'Qual ferramenta tem perfil hexagonal em "L" próprio para entrar dentro do furo de 6 lados do parafuso?',
    successExplanation:
      'Perfeito! A Chave Allen 6 mm encaixa até o fundo do sextavado interno do parafuso prisioneiro, liberando o cubo no eixo.',
    wrongToolFeedback: {
      'chave-combinada': 'Como o parafuso está embutido e não tem cabeça externa, a Chave Combinada não consegue segurá-lo.',
      'torquimetro': 'O Torquímetro não deve ser usado para soltar parafusos.',
      'paquimetro': 'Instrumentos de medição nunca devem ser usados para girar parafusos.',
      'micrometro': 'O Micrômetro é exclusivo para metrologia dimensional.',
      'saca-polias': 'Antes de usar o Saca-Polias no cubo, é preciso soltar o parafuso prisioneiro interno.'
    }
  },
  {
    id: 'scenario-3-pull-bearing',
    title: 'Desafio 3: Remover o Rolamento Preso no Eixo',
    taskDescription:
      'Com o eixo fora da bomba na bancada, você precisa retirar um rolamento rígido de esferas montado com interferência no eixo (anel interno apertado). O rolamento será guardado para análise, então não pode ser danificado na retirada. Não bata nem risque o eixo.',
    machineContext: 'Eixo da bomba • Rolamento rígido de esferas',
    correctToolId: 'extrator-rolamentos',
    alsoAcceptable: {
      'saca-polias':
        'Tira o rolamento, mas as garras costumam puxar pelo anel externo e o esforço passa pelas esferas, marcando as pistas. Serve quando o rolamento será descartado; para análise ou reaproveitamento, prefira a placa separadora no anel interno.'
    },
    hint: 'O rolamento está preso pelo anel interno. Qual ferramenta puxa exatamente por esse anel?',
    successExplanation:
      'Isso! A placa separadora fica atrás do anel interno — o anel que está preso — e o fuso puxa o rolamento alinhado, sem passar esforço pelas esferas e sem pancadas.',
    wrongToolFeedback: {
      'chave-combinada': 'Uma chave fixa não consegue puxar um rolamento montado sob interferência no eixo.',
      'chave-allen': 'A Chave Allen é para parafusos sextavados internos, não para extração de rolamentos.',
      'torquimetro': 'O Torquímetro serve apenas para aperto controlado de parafusos.',
      'paquimetro': 'O Paquímetro mede o eixo depois que o rolamento sai, mas não remove o rolamento.',
      'micrometro': 'O Micrômetro mede o colo do eixo, mas não extrai peças.',
      'martelo-face-macia': 'Golpear o rolamento faz o impacto passar pelas esferas e pode marcar o eixo.'
    }
  },
  {
    id: 'scenario-4-measure-keyway',
    title: 'Desafio 4: Medir a Largura e a Profundidade do Rasgo de Chaveta',
    taskDescription:
      'Antes de montar a chaveta nova no eixo, você precisa medir a largura interna do rasgo (8,00 mm) e a profundidade dele (4,00 mm).',
    machineContext: 'Inspeção Dimensional do Eixo • Rasgo de Chaveta',
    correctToolId: 'paquimetro',
    hint: 'Qual instrumento de medição possui tanto orelhas para medir larguras internas quanto haste traseira para medir profundidade?',
    successExplanation:
      'Exato! O Paquímetro Universal é o instrumento 4 em 1 ideal: mede a largura interna do rasgo com as orelhas e a profundidade com a haste traseira.',
    wrongToolFeedback: {
      'chave-combinada': 'Chaves mecânicas não medem dimensões de rasgos.',
      'chave-allen': 'A Chave Allen não é um instrumento de medição.',
      'torquimetro': 'O Torquímetro mede força de aperto (N·m), não comprimento em milímetros.',
      'micrometro': 'O Micrômetro Externo comum mede apenas o lado de fora do eixo, não conseguindo entrar dentro do rasgo de chaveta para medir sua largura e profundidade.',
      'saca-polias': 'O Saca-Polias é uma ferramenta de desmontagem, não de medição.'
    }
  },
  {
    id: 'scenario-5-final-torque',
    title: 'Desafio 5: Aperto Final Controlado da Tampa da Bomba',
    taskDescription:
      'Você já encostou todos os 8 parafusos M12 da carcaça da bomba. Agora precisa aplicar o aperto final no valor indicado no manual do fabricante, em sequência cruzada, para vedar sem esmagar a junta.',
    machineContext: 'Remontagem final • Aperto cruzado no valor do manual',
    correctToolId: 'torquimetro',
    hint: 'Qual ferramenta permite ajustar o valor do manual na escala e avisa (com um estalo) quando ele é atingido?',
    successExplanation:
      'Perfeito! O torquímetro, ajustado no valor do manual e dentro da sua faixa, garante o mesmo aperto em todos os parafusos. O valor vem sempre do fabricante ou do projeto — nunca de memória.',
    wrongToolFeedback: {
      'chave-combinada': 'A Chave Combinada foi ótima para encostar os parafusos, mas ela não mede se você atingiu o valor do manual.',
      'chave-allen': 'Os parafusos da carcaça são sextavados externos e exigem controle de torque em N·m.',
      'paquimetro': 'O Paquímetro mede comprimentos em milímetros, não torque de aperto.',
      'micrometro': 'O Micrômetro mede espessuras externas, não força de aperto.',
      'saca-polias': 'O Saca-Polias é usado na desmontagem de polias e rolamentos.'
    }
  }
];
