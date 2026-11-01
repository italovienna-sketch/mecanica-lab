import type { PracticeQuestion } from '../practiceBank';

/** Questões da seção Indústria na prática (tema "industria" da área Praticar e etapa "Verificar" do laboratório). */
export const INDUSTRY_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'ind-01',
    topicId: 'industria',
    skillId: 'bearings.arrangement',
    level: 'Iniciante',
    scenario: 'Um eixo apoiado em dois mancais esquenta quando a máquina trabalha.',
    prompt: 'Por que um dos dois rolamentos costuma ser montado como rolamento LIVRE?',
    options: [
      'Para o eixo poder crescer com o calor sem empurrar os rolamentos para os lados',
      'Para o eixo girar mais rápido',
      'Porque um rolamento livre não precisa de lubrificação'
    ],
    correctIndex: 0,
    why: 'O eixo dilata quando aquece. Com um rolamento fixo e um livre, o eixo fica posicionado e ainda pode crescer sem gerar força axial nos rolamentos.',
    commonMistake: 'Achar que os dois rolamentos devem ser presos dos dois lados "para ficar mais firme".',
    optionFeedback: [
      'Correto.',
      'A rotação vem do acionamento; o arranjo dos rolamentos não muda a velocidade.',
      'Todo rolamento precisa de lubrificação, fixo ou livre.'
    ]
  },
  {
    id: 'ind-02',
    topicId: 'industria',
    skillId: 'bearings.mounting',
    level: 'Iniciante',
    prompt: 'Para extrair um rolamento que está apertado no eixo, onde o extrator deve aplicar a força?',
    options: ['No anel interno', 'No anel externo', 'Nas esferas ou nos rolos'],
    correctIndex: 0,
    why: 'A força deve passar só pelo anel que tem o aperto. Força passando pelos corpos rolantes marca as pistas.',
    commonMistake: 'Puxar pelo anel externo porque "é mais fácil de pegar".',
    optionFeedback: [
      'Correto.',
      'Puxando pelo anel externo, a força atravessa as esferas ou rolos e marca as pistas.',
      'Os corpos rolantes nunca devem receber a força de montagem ou desmontagem.'
    ]
  },
  {
    id: 'ind-03',
    topicId: 'industria',
    skillId: 'bearings.function',
    level: 'Iniciante',
    prompt: 'No rolamento de rolos cilíndricos tipo NU, o que permite que o eixo deslize no sentido axial?',
    options: [
      'O anel interno não tem rebordos: ele pode escorregar sob os rolos',
      'Os rolos são de borracha',
      'O anel externo fica solto na caixa, sem encosto'
    ],
    correctIndex: 0,
    why: 'No tipo NU, os rebordos ficam só no anel externo. O anel interno, preso no eixo, pode se deslocar axialmente sob os rolos.',
    optionFeedback: [
      'Correto.',
      'Os rolos são de aço para rolamentos.',
      'No tipo NU é o anel interno que desliza; o externo continua preso na caixa.'
    ]
  },
  {
    id: 'ind-04',
    topicId: 'industria',
    skillId: 'bearings.mounting',
    level: 'Iniciante',
    scenario: 'Você vai abrir duas caixas de mancal bipartidas iguais, lado a lado.',
    prompt: 'O que fazer com as tampas antes de retirá-las?',
    options: [
      'Marcar cada tampa com a sua base, porque cada par é usinado junto',
      'Nada: as tampas são iguais e podem ser trocadas',
      'Pintar as duas da mesma cor'
    ],
    correctIndex: 0,
    why: 'Base e tampa de uma caixa bipartida formam um par. Trocar as tampas pode deformar o alojamento e o anel externo.',
    optionFeedback: ['Correto.', 'Parecem iguais, mas não são intercambiáveis.', 'Cor não identifica o par.']
  },
  {
    id: 'ind-05',
    topicId: 'industria',
    skillId: 'conveyor.components',
    level: 'Iniciante',
    prompt: 'Num transportador de correia, como o giro chega até a correia?',
    options: [
      'Motor → redutor → acoplamento → polia de acionamento, que arrasta a correia pelo atrito',
      'O motor gira os rolos de carga, que empurram a correia',
      'A polia de retorno puxa a correia com engrenagens'
    ],
    correctIndex: 0,
    why: 'Só a polia de acionamento recebe o giro. Os rolos apenas apoiam a correia e giram porque ela passa sobre eles.',
    optionFeedback: [
      'Correto.',
      'Os rolos não são acionados: eles giram arrastados pela correia.',
      'A polia de retorno é movida: é ali que fica o tensor.'
    ]
  },
  {
    id: 'ind-06',
    topicId: 'industria',
    skillId: 'transmission.drive',
    level: 'Iniciante',
    prompt: 'O que o redutor faz entre o motor e a polia de acionamento?',
    options: ['Diminui a rotação e aumenta o torque', 'Aumenta a rotação e diminui o torque', 'Só muda o sentido de giro'],
    correctIndex: 0,
    why: 'Descontadas as perdas, a potência que entra sai. Com menos rotação na saída, o torque aumenta.',
    optionFeedback: ['Correto.', 'É o contrário: o redutor reduz a rotação.', 'Alguns redutores mudam o sentido, mas a função principal é reduzir a rotação.']
  },
  {
    id: 'ind-07',
    topicId: 'industria',
    skillId: 'conveyor.diagnosis',
    level: 'Intermediário',
    scenario: 'A borda da correia está desfiando sempre do mesmo lado, e o operador diz que a correia "corre" para esse lado.',
    prompt: 'Qual é a primeira hipótese a investigar, com o transportador parado e bloqueado?',
    options: [
      'Polias ou rolos fora de esquadro, material grudado nos rolos ou tensor ajustado de forma desigual',
      'Motor girando no sentido errado',
      'Correia nova demais'
    ],
    correctIndex: 0,
    why: 'A correia tende a se deslocar quando polias e rolos não estão perpendiculares à sua linha de centro ou quando algo muda o diâmetro de um lado.',
    commonMistake: 'Tentar "segurar" a correia com uma barra com o transportador andando — além de não resolver, é proibido e perigoso.',
    optionFeedback: [
      'Correto: estas são causas comuns. A confirmação é feita na inspeção com o transportador bloqueado.',
      'Sentido de giro errado não faz a correia ir para um lado só.',
      'Correia nova pode precisar de ajuste, mas desfiar sempre do mesmo lado aponta para desalinhamento.'
    ]
  },
  {
    id: 'ind-08',
    topicId: 'industria',
    skillId: 'safety.guards',
    level: 'Iniciante',
    prompt: 'Segundo a NR-12, o que deve ser feito com os movimentos perigosos de um transportador contínuo acessíveis durante a operação?',
    options: [
      'Devem ser protegidos, especialmente nos pontos de esmagamento, agarramento e aprisionamento',
      'Basta colocar uma placa de aviso',
      'Só precisam de proteção se o transportador for novo'
    ],
    correctIndex: 0,
    why: 'É o que diz o item 12.8.1 da NR-12. Os pontos onde a correia entra nas polias são exemplos típicos de agarramento.',
    optionFeedback: [
      'Correto (NR-12, item 12.8.1).',
      'Sinalização ajuda, mas não substitui a proteção da zona de perigo.',
      'A NR-12 vale para máquinas novas e usadas (item 12.1.2).'
    ]
  },
  {
    id: 'ind-09',
    topicId: 'industria',
    skillId: 'diagnosis.reasoning',
    level: 'Intermediário',
    scenario: 'Um mancal com rolamento de esferas faz um ruído que aumentou nas últimas semanas, e a graxa que sai pela vedação está escura e com partículas.',
    prompt: 'Qual conclusão é a mais responsável neste momento?',
    options: [
      'Há indícios de contaminação e desgaste; a causa é confirmada na inspeção do rolamento retirado e da vedação',
      'O rolamento com certeza tem defeito de fábrica',
      'É só pôr mais graxa que o ruído some de vez'
    ],
    correctIndex: 0,
    why: 'Ruído crescente e graxa contaminada são evidências, não um diagnóstico final. A análise do rolamento e da vedação confirma a causa.',
    commonMistake: 'Fechar o diagnóstico antes de ver a peça, ou "resolver" com excesso de graxa, que pode aquecer o mancal.',
    optionFeedback: [
      'Correto.',
      'Defeito de fábrica é raro; contaminação e lubrificação são causas muito mais comuns.',
      'Graxa a mais pode mascarar o ruído por um tempo e até aquecer o mancal.'
    ]
  },
  {
    id: 'ind-10',
    topicId: 'industria',
    skillId: 'safety.loto',
    level: 'Iniciante',
    prompt: 'Antes de trocar um rolo de carga, o que é preciso fazer com a correia tensionada?',
    options: [
      'Com o transportador bloqueado, aliviar a tensão de forma controlada no tensor',
      'Nada, o rolo sai com a correia esticada',
      'Cortar a correia para tirar a tensão'
    ],
    correctIndex: 0,
    why: 'A correia tensionada guarda energia. Depois do bloqueio, alivia-se a tensão aos poucos e por igual dos dois lados.',
    optionFeedback: ['Correto.', 'Com tensão, o rolo fica preso e a correia pode se mover de repente.', 'Cortar libera a energia de uma vez e destrói a emenda.']
  },
  {
    id: 'ind-11',
    topicId: 'bombas',
    skillId: 'pumps.diaphragm',
    level: 'Iniciante',
    prompt: 'Na bomba de duplo diafragma pneumática, o que move os diafragmas?',
    options: ['Ar comprimido, mandado para um lado de cada vez pela válvula de ar', 'Um rotor girando dentro da câmara', 'O próprio líquido bombeado'],
    correctIndex: 0,
    why: 'A válvula de ar alterna o ar entre as duas câmaras de ar; o eixo liga os diafragmas, então quando um empurra o outro aspira.',
    commonMistake: 'Imaginar um rotor como na bomba centrífuga.',
    optionFeedback: ['Correto.', 'Não há rotor: é uma bomba alternativa, de deslocamento positivo.', 'O líquido é empurrado pelos diafragmas, não o contrário.']
  },
  {
    id: 'ind-12',
    topicId: 'bombas',
    skillId: 'pumps.diaphragm',
    level: 'Iniciante',
    prompt: 'Para que servem as esferas dentro da bomba de diafragma?',
    options: ['São válvulas de retenção: deixam o líquido passar só num sentido', 'Lubrificam o eixo', 'Medem a vazão'],
    correctIndex: 0,
    why: 'Na sucção, a esfera de baixo abre e a de cima fecha; na descarga, o contrário. Sem elas o líquido só iria e voltaria.',
    optionFeedback: ['Correto.', 'O eixo fica do lado do ar; as esferas ficam no caminho do líquido.', 'Elas não medem nada: abrem e fecham a passagem.']
  },
  {
    id: 'ind-13',
    topicId: 'bombas',
    skillId: 'pumps.diaphragm',
    level: 'Intermediário',
    scenario: 'Uma bomba de diafragma pneumática começou a soltar produto pelo silenciador do escape de ar.',
    prompt: 'Qual é a causa mais provável?',
    options: ['Diafragma furado ou rasgado: o produto passou para o lado do ar', 'Esfera de descarga gasta', 'Pressão do ar baixa demais'],
    correctIndex: 0,
    why: 'O diafragma é a única separação entre o líquido e o ar. Produto no escape mostra que essa separação falhou.',
    commonMistake: 'Trocar esferas e sedes, que causam perda de vazão, mas não produto no escape.',
    optionFeedback: ['Correto.', 'Esfera gasta faz a bomba perder vazão, mas o produto continua do lado do líquido.', 'Pressão baixa reduz o desempenho, não leva produto ao escape.']
  },
  {
    id: 'ind-14',
    topicId: 'bombas',
    skillId: 'safety.energy',
    level: 'Iniciante',
    prompt: 'Antes de abrir uma bomba de diafragma pneumática para manutenção, o que é preciso?',
    options: [
      'Bloquear e aliviar o ar, fechar e aliviar as linhas de produto, drenar a bomba e usar os EPIs da FDS do produto',
      'Só fechar a válvula de ar',
      'Nada: sem motor elétrico não há energia perigosa'
    ],
    correctIndex: 0,
    why: 'Ar comprimido é energia armazenada, a descarga pode ficar pressurizada e sempre sobra produto nas câmaras.',
    commonMistake: 'Achar que bomba pneumática "não tem energia" por não ter motor elétrico.',
    optionFeedback: ['Correto.', 'Fechar não basta: o ar preso precisa ser aliviado, e o produto também é um perigo.', 'Ar comprimido e líquido pressurizado também são energias perigosas.']
  },
  {
    id: 'ind-15',
    topicId: 'industria',
    skillId: 'transmission.gears',
    level: 'Iniciante',
    scenario: 'No redutor do laboratório, o pinhão (no eixo do motor) tem 14 dentes e a coroa (no eixo de saída) tem 43.',
    prompt: 'Quantas voltas o pinhão dá enquanto a coroa dá uma volta?',
    options: ['43 ÷ 14 ≈ 3,07 voltas', '14 ÷ 43 ≈ 0,33 volta', '43 − 14 = 29 voltas'],
    correctIndex: 0,
    why: 'Os dentes passam um pelo outro na mesma quantidade. Para a coroa completar 43 dentes, o pinhão precisa girar 43 ÷ 14 ≈ 3,07 voltas.',
    commonMistake: 'Inverter a divisão e achar que a engrenagem pequena gira mais devagar.',
    optionFeedback: ['Correto.', 'Essa é a fração de volta da coroa para cada volta do pinhão — o contrário do que foi perguntado.', 'A relação é uma divisão, não uma subtração.']
  },
  {
    id: 'ind-16',
    topicId: 'industria',
    skillId: 'transmission.gears',
    level: 'Iniciante',
    prompt: 'Em um par de engrenagens externas (pinhão e coroa engrenados), em que sentido gira a coroa?',
    options: ['No sentido contrário ao do pinhão', 'No mesmo sentido do pinhão', 'Depende da velocidade do motor'],
    correctIndex: 0,
    why: 'No ponto de contato os dentes andam juntos, então os dois eixos giram em sentidos opostos. Por isso o sentido de giro do motor é conferido antes de acoplar a máquina.',
    optionFeedback: ['Correto.', 'Isso acontece com uma engrenagem intermediária ou com correia, não com um par externo direto.', 'O sentido não muda com a velocidade.']
  },
  {
    id: 'ind-17',
    topicId: 'industria',
    skillId: 'transmission.drive',
    level: 'Iniciante',
    prompt: 'O redutor diminui a rotação na saída. O que acontece com o torque na saída, descontadas as perdas?',
    options: ['Aumenta, na mesma proporção em que a rotação diminui', 'Diminui junto com a rotação', 'Fica igual ao do motor'],
    correctIndex: 0,
    why: 'A potência que entra é praticamente a que sai (menos as perdas). Com menos rotação, o torque precisa ser maior.',
    commonMistake: 'Achar que o redutor "tira força" do motor.',
    optionFeedback: ['Correto.', 'É o contrário: o redutor troca rotação por torque.', 'Só seria igual sem redução (relação 1:1).']
  },
  {
    id: 'ind-18',
    topicId: 'industria',
    skillId: 'transmission.drive',
    level: 'Intermediário',
    scenario: 'Depois da troca do motor, apareceu pó de borracha embaixo do acoplamento elástico e o elemento elástico novo já está gasto.',
    prompt: 'Qual é a hipótese mais provável e o que conferir?',
    options: [
      'Desalinhamento entre motor e redutor: com o conjunto bloqueado, conferir pé manco, calços e o alinhamento',
      'Elemento elástico de má qualidade: trocar de novo e seguir',
      'Motor girando no sentido errado'
    ],
    correctIndex: 0,
    why: 'O elemento elástico tolera pequenos desvios; desgaste rápido depois de mexer no motor aponta para alinhamento. A confirmação vem da medição com o conjunto parado.',
    optionFeedback: ['Correto.', 'Trocar sem corrigir a causa faz o elemento gastar de novo.', 'Sentido de giro errado não gasta o elemento desse jeito; muda o sentido da máquina.']
  }
];
