export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  category: 'Segurança' | 'Transmissão' | 'Mancais' | 'Metrologia' | 'Procedimento';
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  question: string;
  contextNote?: string;
  options: QuizOption[];
  rewardXp: number;
}

export const GEARBOX_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1-basic-purpose',
    lessonId: 'lesson-gearbox-fundamentals',
    category: 'Transmissão',
    difficulty: 'Iniciante',
    question: 'Qual é a função básica de um redutor de velocidade em uma linha de produção industrial?',
    contextNote: 'Pense na relação entre a rotação do motor elétrico e a força necessária para movimentar a carga.',
    options: [
      {
        text: 'Diminuir a velocidade de rotação do motor e aumentar proporcionalmente o torque disponível.',
        isCorrect: true,
        explanation: 'Correto! Pela lei da conservação da potência, quando a rotação (RPM) é reduzida na saída, o torque (força de giro) é multiplicado pela mesma proporção menos as perdas por atrito.'
      },
      {
        text: 'Aumentar a velocidade do motor para fazer as esteiras andarem mais rápido.',
        isCorrect: false,
        explanation: 'Incorreto. O equipamento que aumenta a velocidade chama-se amplificador ou multiplicador de velocidade, não redutor.'
      },
      {
        text: 'Gerar eletricidade aproveitando o vento produzido pelas pás do motor.',
        isCorrect: false,
        explanation: 'Incorreto. Isso seria um gerador elétrico ou turbina eólica, não um redutor de velocidade mecânico.'
      },
      {
        text: 'Eliminar completamente o consumo de energia elétrica da fábrica.',
        isCorrect: false,
        explanation: 'Incorreto. O redutor é um elemento de transmissão mecânica passiva e não gera energia livre.'
      }
    ],
    rewardXp: 30
  },
  {
    id: 'q2-safety-loto',
    lessonId: 'lesson-gearbox-fundamentals',
    category: 'Segurança',
    difficulty: 'Iniciante',
    question: 'Qual é o primeiro procedimento OBRIGATÓRIO de segurança antes de iniciar a desmontagem de um redutor na bancada ou no campo?',
    contextNote: 'Conforme a norma regulamentadora NR-12 e diretrizes de manutenção segura.',
    options: [
      {
        text: 'Bloquear e etiquetar as fontes de energia (LOTO), testar a ausência de energia e utilizar EPIs completos.',
        isCorrect: true,
        explanation: 'Excelente! A regra de ouro da mecânica industrial é o bloqueio mecânico e elétrico com cadeado pessoal (Lockout / Tagout) e teste de partida zero para evitar acidentes graves.'
      },
      {
        text: 'Desaparafusar imediatamente a tampa superior com parafusadeira de impacto enquanto o motor desacelera.',
        isCorrect: false,
        explanation: 'Extremamente perigoso! Nunca toque em partes mecânicas antes de comprovar que o sistema está 100% parado e desenergizado.'
      },
      {
        text: 'Lavar a carcaça externa com solvente inflamável e água pressurizada.',
        isCorrect: false,
        explanation: 'Incorreto. Solventes inflamáveis geram risco de incêndio e não constituem o primeiro passo de segurança pessoal.'
      },
      {
        text: 'Pintar a carcaça com tinta amarela para sinalizar a manutenção.',
        isCorrect: false,
        explanation: 'Incorreto. A pintura é meramente estética e não protege a integridade do técnico mecânico.'
      }
    ],
    rewardXp: 35
  },
  {
    id: 'q3-helical-teeth',
    lessonId: 'lesson-gearbox-fundamentals',
    category: 'Transmissão',
    difficulty: 'Iniciante',
    question: 'Por que o redutor didático em estudo utiliza engrenagens com dentes HELICOIDAIS em vez de dentes retos comuns?',
    contextNote: 'Observe o contato progressivo entre os dentes usinados em ângulo.',
    options: [
      {
        text: 'Porque o contato gradual entre os dentes reduz vibrações, diminui o ruído operacional e aumenta a capacidade de carga.',
        isCorrect: true,
        explanation: 'Perfeito! Nas engrenagens cilíndricas helicoidais, o engrenamento se dá de forma progressiva e contínua a partir de um dos cantos da hélice, garantindo suavidade mecânica e alta durabilidade.'
      },
      {
        text: 'Porque dentes helicoidais não sofrem desgaste e nunca precisam de óleo lubrificante.',
        isCorrect: false,
        explanation: 'Incorreto. Todo engrenamento metálico sob carga requer lubrificação adequada para evitar quebras por fadiga ou adesão.'
      },
      {
        text: 'Porque são mais fáceis e baratas de fabricar artesanalmente.',
        isCorrect: false,
        explanation: 'Incorreto. Engrenagens helicoidais exigem máquinas fresadoras geradoras (hobbing) mais complexas e ferramental de precisão superior.'
      },
      {
        text: 'Porque dentes helicoidais não geram empuxo axial lateral nos eixos.',
        isCorrect: false,
        explanation: 'Incorreto. É exatamente o oposto: os dentes helicoidais GERAM força axial nos eixos, exigindo rolamentos apropriados.'
      }
    ],
    rewardXp: 40
  },
  {
    id: 'q4-bearings-type',
    lessonId: 'lesson-gearbox-fundamentals',
    category: 'Mancais',
    difficulty: 'Intermediário',
    question: 'Por que os mancais do redutor utilizam ROLAMENTOS DE ROLOS CÔNICOS montados em oposição nos eixos?',
    contextNote: 'Considere as duas forças mecânicas simultâneas geradas pelos dentes helicoidais.',
    options: [
      {
        text: 'Para suportar eficientemente as forças radiais (peso/engrenamento) e as forças axiais laterais geradas pelo ângulo de hélice.',
        isCorrect: true,
        explanation: 'Exato! A geometria cônica dos roletes é a solução de engenharia perfeita para absorver cargas combinadas (radiais e axiais simultâneas).'
      },
      {
        text: 'Porque rolamentos de rolos cônicos giram a 100.000 RPM sem aquecer.',
        isCorrect: false,
        explanation: 'Incorreto. Rolamentos cônicos são indicados para rotações baixas e médias com cargas pesadas, e não para rotações ultrarrápidas.'
      },
      {
        text: 'Porque qualquer mecânico consegue montá-los martelando sem necessidade de calços ou ajuste de folga.',
        isCorrect: false,
        explanation: 'Incorreto. Rolamentos cônicos exigem controle rigoroso da folga axial ou pré-carga através de anéis espaçadores retificados.'
      },
      {
        text: 'Para permitir que o eixo saia deslizando solto para fora da máquina quando quiser.',
        isCorrect: false,
        explanation: 'Incorreto. Os rolamentos mantêm o eixo rígido e firmemente alinhado em sua posição de trabalho.'
      }
    ],
    rewardXp: 45
  },
  {
    id: 'q5-metrology-seal',
    lessonId: 'lesson-gearbox-fundamentals',
    category: 'Metrologia',
    difficulty: 'Intermediário',
    question: 'Ao montar um retentor radial novo no eixo de saída, que boa prática metrológica e de montagem garante que ele não vaze?',
    contextNote: 'Lembre-se do lábio de borracha e da mola circular interna.',
    options: [
      {
        text: 'Verificar a ausência de ranhuras no eixo com micrômetro/rugosímetro, lubrificar o lábio e prensar com guia tubular plana.',
        isCorrect: true,
        explanation: 'Excelente! Pistas de eixo riscadas ou retentores prensados tortos vazam imediatamente. A lubrificação inicial protege o lábio contra fricção a seco na partida.'
      },
      {
        text: 'Bater com a ponta de uma chave de fenda diretamente sobre a mola metálica até ela entrar.',
        isCorrect: false,
        explanation: 'Inaceitável na mecânica! Isso desloca ou deforma a mola de retenção e rasga a borracha, arruinando a vedação.'
      },
      {
        text: 'Lixar o lábio de borracha com lixa grossa de ferro para ficar áspero.',
        isCorrect: false,
        explanation: 'Incorreto. O acabamento deve ser super liso e íntegro para reter o óleo com sucesso.'
      },
      {
        text: 'Reaproveitar sempre o retentor velho lavado com querosene para economizar peças.',
        isCorrect: false,
        explanation: 'Incorreto. Retentores sofrem deformação plástica e perda de elasticidade térmica; nunca devem ser reutilizados.'
      }
    ],
    rewardXp: 45
  },
  {
    id: 'q6-order-disassembly',
    lessonId: 'lesson-gearbox-fundamentals',
    category: 'Procedimento',
    difficulty: 'Avançado',
    question: 'No Procedimento Operacional Padronizado (POP), qual é a sequência física e mecânica correta para desmontar o redutor?',
    contextNote: 'Do exterior para o interior, respeitando o alívio de tensões da carcaça bipartida.',
    options: [
      {
        text: '1º Drenagem do óleo -> 2º Soltura dos parafusos em cruz -> 3º Remoção da tampa superior -> 4º Extração dos eixos e mancais.',
        isCorrect: true,
        explanation: 'Perfeito! Jamais se abre a caixa sem drenar o fluido. O desaperto em cruz alivia a tensão uniforme da partição usinada, permitindo retirar a tampa sem riscar as engrenagens.'
      },
      {
        text: '1º Puxar as engrenagens com marreta -> 2º Tirar os parafusos -> 3º Drenar o óleo no final quando derramar tudo.',
        isCorrect: false,
        explanation: 'Completamente incorreto e anti-profissional. Causaria derramamento de óleo no piso da oficina e destruição dos componentes.'
      },
      {
        text: '1º Aquecer a carcaça com maçarico -> 2º Tirar os rolamentos -> 3º Desligar o motor elétrico.',
        isCorrect: false,
        explanation: 'Grave violação de segurança operacional e integridade dos materiais metalúrgicos.'
      },
      {
        text: '1º Cortar os eixos com lixadeira -> 2º Retirar os retentores -> 3º Medir os diâmetros com paquímetro.',
        isCorrect: false,
        explanation: 'Incorreto. A desmontagem industrial preserva 100% dos componentes usinados para inspeção e reutilização.'
      }
    ],
    rewardXp: 50
  }
];

export const CENTRIFUGAL_PUMP_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pq1-volute-impeller',
    lessonId: 'lesson-centrifugal-pump',
    category: 'Transmissão',
    difficulty: 'Iniciante',
    question: 'Qual é o papel conjunto do Rotor (Impelidor) e da Carcaça em Voluta em uma bomba centrífuga industrial?',
    contextNote: 'Pense em como a velocidade gerada no centro se transforma em pressão na saída.',
    options: [
      {
        text: 'O rotor acelera o líquido pela força centrífuga (energia cinética) e a voluta em espiral desacelera o fluxo gradualmente para converter velocidade em pressão.',
        isCorrect: true,
        explanation: 'Exato! As pás curvas do rotor transferem velocidade ao fluido e o canal expansivo da voluta transforma essa energia cinética em pressão estática de recalque.'
      },
      {
        text: 'A voluta gira a 3500 RPM enquanto o rotor fica parado segurando os tubos.',
        isCorrect: false,
        explanation: 'Incorreto. A carcaça em voluta é estacionária (fixa na base e nos tubos); quem gira preso ao eixo é o rotor.'
      },
      {
        text: 'A voluta acelera o líquido e o rotor apenas guia o fluxo até a saída.',
        isCorrect: false,
        explanation: 'É o contrário: o rotor gira e acelera o líquido; a voluta é fixa e converte essa velocidade em pressão.'
      },
      {
        text: 'A bomba centrífuga funciona com pistões alternativos como um motor a combustão.',
        isCorrect: false,
        explanation: 'Incorreto. Bombas de pistão são bombas de deslocamento positivo; a bomba centrífuga é uma turbomáquina rotodinâmica.'
      }
    ],
    rewardXp: 35
  },
  {
    id: 'pq2-back-pull-out',
    lessonId: 'lesson-centrifugal-pump',
    category: 'Procedimento',
    difficulty: 'Iniciante',
    question: 'O que significa dizer que uma bomba centrífuga segue a norma ISO 2858 com construção "Back-Pull-Out"?',
    contextNote: 'Considere o trabalho do mecânico de manutenção ao trocar o selo mecânico ou os rolamentos.',
    options: [
      {
        text: 'Que o conjunto rotativo (cavalete, eixo, selo e rotor) pode ser desmontado e retirado para trás sem desconectar a carcaça das tubulações.',
        isCorrect: true,
        explanation: 'Perfeito! A voluta permanece parafusada nos flanges de sucção e recalque, economizando horas de serviço pesado na fábrica.'
      },
      {
        text: 'Que a bomba precisa ser retirada inteira da tubulação para qualquer manutenção.',
        isCorrect: false,
        explanation: 'É justamente o que o back-pull-out evita: a voluta fica presa nos tubos e só o conjunto rotativo sai pela traseira.'
      },
      {
        text: 'Que o motor elétrico fica dentro da água.',
        isCorrect: false,
        explanation: 'Incorreto. Isso seria uma bomba submersível, e não uma bomba horizontal normalizada ISO 2858.'
      },
      {
        text: 'Que o rotor é retirado pela frente, pelo bocal de sucção.',
        isCorrect: false,
        explanation: 'No back-pull-out, o rotor sai junto com o conjunto rotativo, pela traseira, depois de soltar os parafusos da carcaça.'
      }
    ],
    rewardXp: 40
  },
  {
    id: 'pq3-mechanical-seal',
    lessonId: 'lesson-centrifugal-pump',
    category: 'Metrologia',
    difficulty: 'Intermediário',
    question: 'Quais cuidados são indispensáveis ao instalar um Selo Mecânico EN 12756 e antes de dar a partida na bomba?',
    contextNote: 'Lembre-se das duas faces super polidas de Carbeto de Silício e Grafite.',
    options: [
      {
        text: 'Nunca tocar nas faces lapidadas com mãos sujas/oleosas, usar bucha guia no eixo e jamais ligar a bomba a seco (sem líquido na voluta).',
        isCorrect: true,
        explanation: 'Excelente! O filme microscópico do próprio líquido bombeado lubrifica e resfria as faces do selo. Girar a seco trinca as faces por choque térmico em segundos.'
      },
      {
        text: 'Passar graxa grossa de chassi com areia entre as duas faces espelhadas do selo.',
        isCorrect: false,
        explanation: 'Incorreto e destrutivo! Partículas ou graxa pesada impedem o fechamento óptico das faces e causam vazamento imediato.'
      },
      {
        text: 'Bater na mola do selo com martelo de bola até ela entortar.',
        isCorrect: false,
        explanation: 'Incorreto. A mola deve manter pressão axial perfeitamente uniforme.'
      },
      {
        text: 'Testar a bomba ligada a seco por 30 minutos antes de abrir a válvula de água.',
        isCorrect: false,
        explanation: 'Erro grave! Operar a seco queima o selo mecânico e engripa os anéis de desgaste.'
      }
    ],
    rewardXp: 45
  },
  {
    id: 'pq4-shaft-runout',
    lessonId: 'lesson-centrifugal-pump',
    category: 'Metrologia',
    difficulty: 'Intermediário',
    question: 'Durante a manutenção na bancada, qual instrumento é utilizado para verificar se o eixo da bomba está empenado (batimento radial / run-out)?',
    contextNote: 'A tolerância típica na região do selo mecânico é de no máximo 0,025 mm.',
    options: [
      {
        text: 'Relógio Comparador Centesimal montado em base magnética com o eixo apoiado sobre prismas em V.',
        isCorrect: true,
        explanation: 'Correto! Girando o eixo lentamente sobre os prismas em V, o ponteiro do relógio comparador revela qualquer excentricidade ou empenamento com precisão de 0,01 mm.'
      },
      {
        text: 'Trena de fita métrica de carpinteiro.',
        isCorrect: false,
        explanation: 'Incorreto. Uma trena tem resolução de milímetros e jamais detectaria 2 centésimos de milímetro.'
      },
      {
        text: 'Paquímetro, medindo o diâmetro em um único ponto do eixo.',
        isCorrect: false,
        explanation: 'O paquímetro mede o diâmetro, mas não mostra a oscilação do eixo girando. Para batimento, usa-se o relógio comparador.'
      },
      {
        text: 'Termômetro infravermelho.',
        isCorrect: false,
        explanation: 'Incorreto. Termômetro mede temperatura, não geometria dimensional.'
      }
    ],
    rewardXp: 45
  }
];

export const BEGINNER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'beg-q1-wrench',
    lessonId: 'lesson-beginner-tools-fasteners',
    category: 'Procedimento',
    difficulty: 'Iniciante',
    question: 'Você precisa destravar um parafuso sextavado M12 de cabeça DIN 933 (19 mm) que está bem firme na tampa da bomba. Qual extremidade da Chave Combinada 19 mm é mais segura para o primeiro giro?',
    contextNote: 'Pense em qual lado abraça todos os 6 cantos do parafuso sem risco de escorregar.',
    options: [
      {
        text: 'O lado fechado (olhal estriado), pois distribui a força pelos 6 cantos da cabeça do parafuso sem espanar.',
        isCorrect: true,
        explanation: 'Exato! O anel estriado envolve 100% da cabeça sextavada. Depois que o parafuso afrouxa, você pode usar a boca aberta para girar mais rápido.'
      },
      {
        text: 'Usar um alicate universal apertando a cabeça do parafuso.',
        isCorrect: false,
        explanation: 'Incorreto. Alicates não têm encaixe calibrado e mastigam as quinas do parafuso sextavado.'
      },
      {
        text: 'Bater na chave com uma marreta de ferro.',
        isCorrect: false,
        explanation: 'Incorreto. Chaves manuais comuns não devem ser golpeadas com marreta.'
      }
    ],
    rewardXp: 30
  },
  {
    id: 'beg-q2-shaft-bearing',
    lessonId: 'lesson-beginner-tools-fasteners',
    category: 'Mancais',
    difficulty: 'Iniciante',
    question: 'Qual é a função principal de um ROLAMENTO montado sobre o eixo de uma máquina industrial?',
    contextNote: 'Imagine o que aconteceria se o eixo de aço girasse raspando direto no furo da carcaça.',
    options: [
      {
        text: 'Apoiar e guiar o eixo permitindo que ele gire com mínimo atrito através de esferas ou rolos.',
        isCorrect: true,
        explanation: 'Perfeito! O rolamento transforma o atrito de escorregamento em atrito de rolamento, evitando aquecimento e desgaste do eixo.'
      },
      {
        text: 'Vedar a passagem de óleo ao redor do eixo.',
        isCorrect: false,
        explanation: 'Quem veda é o retentor ou o selo mecânico. O rolamento apoia e guia o eixo.'
      },
      {
        text: 'Transmitir o movimento do motor diretamente para o rotor.',
        isCorrect: false,
        explanation: 'Quem transmite o movimento é o eixo (com o acoplamento). O rolamento apoia o eixo para que ele gire livre.'
      }
    ],
    rewardXp: 30
  },
  {
    id: 'beg-q3-sealing',
    lessonId: 'lesson-beginner-tools-fasteners',
    category: 'Segurança',
    difficulty: 'Iniciante',
    question: 'Para que servem o Retentor e o Selo Mecânico nas passagens onde o eixo sai da carcaça?',
    contextNote: 'Observe que dentro da bomba há líquido pressurizado e dentro do mancal há óleo lubrificante.',
    options: [
      {
        text: 'Para vedar o espaço ao redor do eixo giratório, impedindo que o líquido ou óleo vaze e que sujeira entre.',
        isCorrect: true,
        explanation: 'Correto! As vedações mantêm o lubrificante e o fluido de processo dentro da máquina enquanto o eixo gira.'
      },
      {
        text: 'Para reduzir o atrito do eixo, no lugar dos rolamentos.',
        isCorrect: false,
        explanation: 'Reduzir o atrito é papel do rolamento. As vedações impedem vazamentos e a entrada de sujeira.'
      },
      {
        text: 'Para manter o eixo centralizado enquanto ele gira.',
        isCorrect: false,
        explanation: 'Quem mantém o eixo centralizado são os rolamentos. A vedação depende disso para funcionar bem.'
      }
    ],
    rewardXp: 35
  }
];

export const PROFESSIONAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'prof-q1-rca-seal',
    lessonId: 'lesson-professional-diagnostics',
    category: 'Metrologia',
    difficulty: 'Avançado',
    question: 'Uma Bomba Centrífuga ISO 2858 apresentou vazamento pelo selo mecânico apenas 48 horas após a troca. Na bancada, você encontra as faces de Carbeto/Grafite intactas, mas o eixo apresenta batimento radial (run-out) de 0,12 mm no Relógio Comparador (limite: 0,025 mm). Qual é a causa raiz?',
    contextNote: 'Analise por que um selo novo vazou mesmo sem ter rodado a seco.',
    options: [
      {
        text: 'O eixo está severamente empenado (0,12 mm > 0,025 mm), fazendo o anel rotativo oscilar a cada volta e abrindo passagem para o vazamento.',
        isCorrect: true,
        explanation: 'Diagnóstico preciso! Com 0,12 mm de excentricidade a 1750 RPM, a mola do selo não consegue acompanhar o batimento lateral do eixo.'
      },
      {
        text: 'O selo novo veio com defeito de fábrica e basta trocá-lo de novo.',
        isCorrect: false,
        explanation: 'As faces estão intactas. Trocar o selo de novo sem corrigir o empeno do eixo faria a falha se repetir.'
      },
      {
        text: 'A mola do selo está fraca, então basta aumentar o aperto do selo no eixo.',
        isCorrect: false,
        explanation: 'A medição mostra outra coisa: batimento de 0,12 mm, quase 5 vezes o limite. O eixo empenado faz o selo oscilar a cada volta.'
      }
    ],
    rewardXp: 50
  },
  {
    id: 'prof-q2-iso-fit',
    lessonId: 'lesson-professional-diagnostics',
    category: 'Metrologia',
    difficulty: 'Avançado',
    question: 'No desenho técnico de manutenção consta a cota "Ø40 k6 (+0,002 / +0,018 mm)" para o assento do rolamento no eixo. Ao medir com o Micrômetro Externo (0,01 mm), você encontra 39,94 mm. Qual decisão técnica deve ser tomada?',
    contextNote: 'Compare a medida encontrada (39,94 mm) com a faixa permitida (40,002 a 40,018 mm).',
    options: [
      {
        text: 'Reprovar o colo do eixo (está com folga de 0,06 mm abaixo do nominal), pois o anel interno do rolamento giraria frouxo causando desgaste destrutivo.',
        isCorrect: true,
        explanation: 'Excelente! Um colo com 39,94 mm perdeu totalmente a interferência k6. O eixo deve ser substituído ou recuperado por metalização/retífica antes da montagem.'
      },
      {
        text: 'Aprovar o eixo, porque 0,06 mm é uma diferença pequena demais para importar.',
        isCorrect: false,
        explanation: 'Em ajustes de rolamento, centésimos de milímetro fazem diferença: o anel interno ficaria frouxo e giraria sobre o eixo.'
      },
      {
        text: 'Dar pancadas de punção em toda a volta do eixo para "inchar" o metal.',
        isCorrect: false,
        explanation: 'Prática condenada na manutenção industrial: destrói a concentricidade do eixo e causa vibração.'
      }
    ],
    rewardXp: 50
  },
  {
    id: 'prof-q3-multi-pass-torque',
    lessonId: 'lesson-professional-diagnostics',
    category: 'Procedimento',
    difficulty: 'Avançado',
    question: 'Qual é o procedimento correto para aplicar o aperto indicado no manual nos 8 parafusos M12 do flange principal da bomba?',
    contextNote: 'Pense em como evitar o esmagamento desigual da junta e o empenamento da tampa.',
    options: [
      {
        text: 'Encostar todos os parafusos e usar o torquímetro calibrado em sequência cruzada (estrela), em estágios progressivos até o valor do manual.',
        isCorrect: true,
        explanation: 'Perfeito! O aperto cruzado em passes progressivos garante assentamento paralelo da tampa de pressão e vedação uniforme.'
      },
      {
        text: 'Apertar o parafuso nº 1 direto até o valor final e seguir em círculo, um ao lado do outro.',
        isCorrect: false,
        explanation: 'Incorreto. O aperto circular em passe único inclina o flange e provoca vazamento.'
      },
      {
        text: 'Apertar o máximo possível usando um cano de 1 metro na chave fixa.',
        isCorrect: false,
        explanation: 'Incorreto. Força sem controle pode passar do limite do parafuso e rompê-lo.'
      }
    ],
    rewardXp: 50
  }
];

export const QUIZZES_BY_ID: Record<string, QuizQuestion[]> = {
  'lesson-beginner-tools-fasteners': BEGINNER_QUIZ_QUESTIONS,
  'lesson-centrifugal-pump': CENTRIFUGAL_PUMP_QUIZ_QUESTIONS,
  'lesson-gearbox-fundamentals': GEARBOX_QUIZ_QUESTIONS,
  'lesson-professional-diagnostics': PROFESSIONAL_QUIZ_QUESTIONS,
  'lesson-lathe-operations': GEARBOX_QUIZ_QUESTIONS,
  'lesson-metrology-precision': CENTRIFUGAL_PUMP_QUIZ_QUESTIONS
};


