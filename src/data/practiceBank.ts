/**
 * Banco de questões da área "Praticar".
 *
 * Regras de conteúdo (revisadas para iniciantes):
 * - Uma ideia por questão, linguagem simples, situação real de oficina quando possível.
 * - Alternativas erradas plausíveis (erros que iniciantes realmente cometem), sem "pegadinhas".
 * - Feedback curto: por que a correta funciona + o erro comum. Detalhe extra fica em "Saiba mais".
 * - Fatos baseados em princípios consolidados de manutenção mecânica (catálogos de fabricantes
 *   de rolamentos, NRs do Ministério do Trabalho, ISO 1 para temperatura de referência etc.).
 *   Valores de torque e tolerâncias específicos aparecem apenas como "dados do enunciado".
 */

import { INDUSTRY_QUESTIONS } from './industry/industryQuestions';

export type PracticeLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export type IllustrationId =
  | 'caliper-reading'
  | 'micrometer-reading'
  | 'flange-pattern'
  | 'combination-wrench'
  | 'pump-section'
  | 'dial-runout';

export interface PracticeQuestion {
  id: string;
  topicId: string;
  skillId: string;
  level: PracticeLevel;
  /** Contexto curto de trabalho (opcional), mostrado acima da pergunta. */
  scenario?: string;
  prompt: string;
  illustration?: IllustrationId;
  illustrationAlt?: string;
  options: string[];
  correctIndex: number;
  /** Por que a resposta correta é a adequada (1–2 frases). */
  why: string;
  /** Erro comum de quem está começando (opcional). */
  commonMistake?: string;
  /** Explicação opcional mais longa, aberta por "Saiba mais". */
  learnMore?: string;
  /** Feedback específico de cada alternativa (mesma ordem de `options`), quando disponível. */
  optionFeedback?: string[];
}

export interface PracticeTopic {
  id: string;
  title: string;
  description: string;
  /** Aula relacionada para revisão. */
  lessonId?: string;
  /** Ferramenta relacionada na biblioteca. */
  toolId?: string;
  /** Máquina relacionada no laboratório 3D. */
  machineId?: string;
}

export const SKILLS: Record<string, string> = {
  'tools.selection': 'Escolher a ferramenta certa',
  'tools.safe-use': 'Usar ferramentas com segurança',
  'bearings.function': 'Função e tipos de rolamentos',
  'bearings.mounting': 'Montagem e desmontagem de rolamentos',
  'bearings.diagnosis': 'Diagnóstico de falhas em rolamentos',
  'pumps.principle': 'Funcionamento da bomba centrífuga',
  'pumps.operation': 'Operação correta de bombas',
  'pumps.sealing': 'Vedação de eixos (selo e gaxeta)',
  'fasteners.identification': 'Identificar parafusos e roscas',
  'fasteners.tightening': 'Aperto e travamento de fixadores',
  'measure.caliper': 'Leitura do paquímetro',
  'measure.micrometer': 'Leitura do micrômetro',
  'measure.dial': 'Uso do relógio comparador',
  'measure.good-practice': 'Boas práticas de medição',
  'transmission.gears': 'Transmissão por engrenagens',
  'maint.types': 'Tipos de manutenção',
  'maint.routine': 'Rotina, registro e lubrificação',
  'safety.loto': 'Bloqueio de energias (LOTO)',
  'safety.ppe': 'EPIs e normas de segurança',
  'safety.workshop': 'Comportamento seguro na oficina',
  'safety.hazards': 'Reconhecer perigos e riscos',
  'safety.guards': 'Proteções de máquinas',
  'safety.estop': 'Parada de emergência',
  'safety.energy': 'Energias perigosas e partida inesperada',
  'safety.handling': 'Movimentação de cargas e ferramentas danificadas',
  'safety.supervision': 'Autorização, supervisão e direito de parar',
  'fasteners.selection': 'Selecionar fixadores com critério',
  'diagnosis.reasoning': 'Raciocínio de diagnóstico',
  'diagnosis.evidence': 'Decisão baseada em evidências',
  'components.identification': 'Identificação de componentes',
  'pumps.types': 'Tipos de bomba',
  'pumps.gear': 'Bomba de engrenagens',
  'pumps.diaphragm': 'Bomba de diafragma',
  'pneumatics.basics': 'Circuitos pneumáticos básicos',
  'lathe.parts': 'Partes do torno e suas funções',
  'lathe.safety': 'Segurança no torno',
  'lathe.setup': 'Preparação da ferramenta e da peça',
  'lathe.cutting': 'Conceitos de velocidade de corte',
  'lathe.operations': 'Operações básicas de torneamento',
  'bearings.arrangement': 'Arranjo de rolamentos (fixo e livre)',
  'conveyor.components': 'Componentes do transportador de correia',
  'conveyor.diagnosis': 'Inspeção e falhas em transportadores',
  'transmission.drive': 'Motor, redutor e acoplamento'
};

export const PRACTICE_TOPICS: PracticeTopic[] = [
  {
    id: 'ferramentas',
    title: 'Ferramentas manuais',
    description: 'Chaves, torquímetro, extratores e o uso correto de cada um.',
    lessonId: 'lesson-beginner-tools-fasteners',
    toolId: 'chave-combinada'
  },
  {
    id: 'seguranca',
    title: 'Segurança mecânica',
    description: 'Bloqueio de energias, EPIs e cuidados antes de tocar na máquina.',
    lessonId: 'lesson-beginner-tools-fasteners'
  },
  {
    id: 'fixacao',
    title: 'Elementos de fixação',
    description: 'Parafusos, roscas, porcas e sequência de aperto.',
    lessonId: 'lesson-beginner-tools-fasteners',
    toolId: 'torquimetro'
  },
  {
    id: 'medicao',
    title: 'Instrumentos de medição',
    description: 'Paquímetro, micrômetro e relógio comparador na prática.',
    toolId: 'paquimetro'
  },
  {
    id: 'rolamentos',
    title: 'Rolamentos',
    description: 'Para que servem, como montar e como reconhecer falhas.',
    lessonId: 'lesson-gearbox-fundamentals',
    toolId: 'saca-polias'
  },
  {
    id: 'bombas',
    title: 'Bombas',
    description: 'Bomba centrífuga (rotor, voluta, cavitação, selo), bomba de engrenagens e bomba de diafragma (deslocamento positivo).',
    lessonId: 'lesson-centrifugal-pump',
    machineId: 'centrifugal-pump'
  },
  {
    id: 'torno',
    title: 'Torno mecânico',
    description: 'Partes do torno, segurança na usinagem e conceitos básicos de corte.',
    toolId: 'paquimetro',
    machineId: 'conventional-lathe'
  },
  {
    id: 'industria',
    title: 'Indústria na prática',
    description: 'Eixos e mancais, transportador de correia, acionamento e diagnóstico com evidências.',
    lessonId: 'lesson-gearbox-fundamentals',
    machineId: 'belt-conveyor'
  },
  {
    id: 'manutencao',
    title: 'Manutenção preventiva',
    description: 'Tipos de manutenção, inspeção, lubrificação e registro.',
    lessonId: 'lesson-professional-diagnostics'
  }
];

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // ───────────────────────────── FERRAMENTAS MANUAIS ─────────────────────────────
  {
    id: 'fer-01',
    topicId: 'ferramentas',
    skillId: 'tools.selection',
    level: 'Iniciante',
    scenario: 'Um parafuso sextavado de 19 mm está muito apertado na tampa de uma bomba.',
    prompt: 'Qual lado da chave combinada é o mais indicado para dar o primeiro giro?',
    illustration: 'combination-wrench',
    illustrationAlt: 'Chave combinada com boca aberta em uma ponta e anel estriado fechado na outra.',
    options: ['O lado estriado (anel fechado)', 'O lado de boca aberta', 'Tanto faz, os dois lados têm a mesma firmeza'],
    correctIndex: 0,
    why: 'O anel estriado abraça a cabeça do parafuso por todos os lados e distribui a força pelos cantos, sem escorregar.',
    commonMistake: 'A boca aberta toca só duas faces. Com muita força ela pode abrir um pouco e arredondar os cantos do parafuso.',
    learnMore:
      'Regra prática: use o anel (ou um soquete) para "quebrar" o aperto inicial e para o aperto final. A boca aberta é ótima para girar rápido quando o parafuso já está solto ou em lugares onde o anel não encaixa.'
  },
  {
    id: 'fer-02',
    topicId: 'ferramentas',
    skillId: 'tools.selection',
    level: 'Iniciante',
    prompt: 'Para que serve um torquímetro?',
    options: [
      'Para apertar um parafuso com o valor de torque especificado',
      'Para soltar parafusos travados com mais força',
      'Para medir o diâmetro do parafuso'
    ],
    correctIndex: 0,
    why: 'O torquímetro controla a força de aperto. Ele avisa (estalo ou ponteiro) quando o torque definido no manual é atingido.',
    commonMistake: 'Usar o torquímetro como alavanca para soltar parafusos. Isso pode descalibrar a ferramenta.',
    learnMore:
      'Torquímetros são instrumentos e precisam de calibração periódica. Depois do uso, os modelos de estalo devem ser guardados na menor regulagem da escala, conforme orientação do fabricante.'
  },
  {
    id: 'fer-03',
    topicId: 'ferramentas',
    skillId: 'tools.selection',
    level: 'Iniciante',
    prompt: 'Em qual tipo de parafuso se usa a chave Allen (chave hexagonal)?',
    options: [
      'Parafuso com sextavado interno (furo de 6 lados na cabeça)',
      'Parafuso com cabeça sextavada externa',
      'Parafuso com fenda simples na cabeça'
    ],
    correctIndex: 0,
    why: 'A chave Allen tem seção hexagonal e encaixa dentro do sextavado interno da cabeça do parafuso.',
    commonMistake: 'Usar uma chave Allen gasta ou de medida menor. Ela gira em falso e estraga o sextavado do parafuso.'
  },
  {
    id: 'fer-04',
    topicId: 'ferramentas',
    skillId: 'tools.safe-use',
    level: 'Iniciante',
    prompt: 'Por que não se deve colocar um cano no cabo da chave para ganhar força?',
    options: [
      'A chave pode quebrar ou escapar e causar acidente, e o aperto fica sem controle',
      'Porque o cano deixa a chave mais leve',
      'Porque o cano só funciona em parafusos de rosca esquerda'
    ],
    correctIndex: 0,
    why: 'A chave é dimensionada para a força de um braço no cabo original. A extensão multiplica a força além do previsto.',
    commonMistake: 'Achar que "mais força resolve". Se o parafuso não solta, use a ferramenta correta (soquete, catraca) e investigue o motivo.'
  },
  {
    id: 'fer-05',
    topicId: 'ferramentas',
    skillId: 'tools.safe-use',
    level: 'Iniciante',
    prompt: 'Qual é a forma mais segura de puxar uma chave para soltar um parafuso?',
    options: [
      'Puxar a chave na direção do corpo, com os pés firmes',
      'Empurrar a chave com a palma da mão aberta, longe do corpo',
      'Bater no cabo da chave com o martelo'
    ],
    correctIndex: 0,
    why: 'Se a chave escapar ao ser puxada, o corpo vem para trás com controle. Empurrando, a mão bate contra a máquina.',
    commonMistake: 'Bater na chave comum com martelo. Só chaves de bater (com face própria para impacto) podem receber golpes.'
  },
  {
    id: 'fer-06',
    topicId: 'ferramentas',
    skillId: 'tools.selection',
    level: 'Iniciante',
    prompt: 'Qual é a principal vantagem de usar um soquete com catraca?',
    options: [
      'Girar o parafuso sem tirar a ferramenta do lugar a cada volta',
      'Medir o torque aplicado no parafuso',
      'Servir para qualquer medida de parafuso'
    ],
    correctIndex: 0,
    why: 'A catraca deixa o cabo voltar livre enquanto o soquete continua encaixado. Isso agiliza o trabalho em espaços pequenos.',
    commonMistake: 'Confundir catraca com torquímetro. A catraca comum não controla o torque.'
  },
  {
    id: 'fer-07',
    topicId: 'ferramentas',
    skillId: 'tools.safe-use',
    level: 'Intermediário',
    prompt: 'Você precisa encaixar uma peça de precisão com leves batidas. Qual martelo usar?',
    options: [
      'Martelo de face macia (borracha, náilon ou poliuretano)',
      'Martelo de bola de aço, batendo direto na peça',
      'Marreta de aço para resolver em um golpe só'
    ],
    correctIndex: 0,
    why: 'A face macia transmite a força sem amassar, riscar ou soltar lascas da peça.',
    commonMistake: 'Bater aço contra aço temperado. Além de marcar a peça, pode soltar fragmentos que atingem os olhos.'
  },
  {
    id: 'fer-08',
    topicId: 'ferramentas',
    skillId: 'tools.selection',
    level: 'Intermediário',
    prompt: 'Para retirar uma polia presa no eixo, qual ferramenta é a adequada?',
    options: ['Saca-polias (extrator de garras)', 'Talhadeira e martelo', 'Chave de fenda usada como alavanca'],
    correctIndex: 0,
    why: 'O extrator puxa a polia de forma centrada e gradual, apoiando o fuso no centro do eixo.',
    commonMistake: 'Usar alavancas ou pancadas. Isso pode empenar o eixo e danificar a polia e os rolamentos.'
  },
  {
    id: 'fer-09',
    topicId: 'ferramentas',
    skillId: 'tools.safe-use',
    level: 'Intermediário',
    prompt: 'Ao usar uma chave ajustável (chave inglesa), qual é o cuidado correto?',
    options: [
      'Ajustar sem folga e girar de forma que o esforço fique na mandíbula fixa',
      'Deixar uma folga para encaixar mais rápido',
      'Usá-la sempre no lugar da chave fixa, porque é universal'
    ],
    correctIndex: 0,
    why: 'A mandíbula fixa é a parte mais resistente. Sem folga, a chave não escorrega nem arredonda o parafuso.',
    commonMistake: 'Usar a chave ajustável como primeira opção. Ela é útil, mas a chave fixa da medida certa é mais firme.'
  },
  {
    id: 'fer-10',
    topicId: 'ferramentas',
    skillId: 'tools.selection',
    level: 'Intermediário',
    prompt: 'Por que a chave precisa ter exatamente a medida da cabeça do parafuso?',
    options: [
      'Com folga, a chave escorrega e arredonda os cantos do parafuso',
      'Porque a chave maior aperta com menos força',
      'A medida só importa em parafusos de aço inox'
    ],
    correctIndex: 0,
    why: 'A medida correta encosta nas faces planas do sextavado. Com folga, a força se concentra nos cantos e eles se deformam.',
    commonMistake: 'Usar uma chave "quase do tamanho". Um parafuso espanado transforma uma tarefa simples em uma extração difícil.'
  },

  // ───────────────────────────── SEGURANÇA MECÂNICA ─────────────────────────────
  {
    id: 'seg-01',
    topicId: 'seguranca',
    skillId: 'safety.loto',
    level: 'Iniciante',
    scenario: 'Você vai trocar o selo mecânico de uma bomba instalada na linha.',
    prompt: 'O que deve ser feito antes de soltar o primeiro parafuso?',
    options: [
      'Desligar, bloquear com cadeado, etiquetar e testar se a máquina realmente não liga',
      'Desligar o motor no botão e começar logo para não atrasar a produção',
      'Avisar o colega da sala de controle para não ligar a bomba'
    ],
    correctIndex: 0,
    why: 'O bloqueio com cadeado e etiqueta (LOTO) impede que alguém ligue a máquina. O teste confirma que a energia foi mesmo isolada.',
    commonMistake: 'Confiar apenas no botão desligado ou em um aviso verbal. Qualquer pessoa poderia religar a máquina.',
    learnMore:
      'LOTO vem de "Lockout/Tagout" (bloqueio e etiquetagem). Sequência típica: avisar os envolvidos, desligar, isolar a fonte (disjuntor/seccionadora), aplicar cadeado pessoal e etiqueta, aliviar energias residuais e testar a partida.'
  },
  {
    id: 'seg-02',
    topicId: 'seguranca',
    skillId: 'safety.loto',
    level: 'Iniciante',
    prompt: 'Por que cada pessoa que trabalha na máquina coloca o próprio cadeado no bloqueio?',
    options: [
      'Porque a máquina só pode ser religada quando todos tirarem seus cadeados',
      'Para identificar quem chegou primeiro',
      'Porque um cadeado só não fecha a seccionadora'
    ],
    correctIndex: 0,
    why: 'Cada cadeado protege quem o colocou. Ninguém pode remover o cadeado de outra pessoa.',
    commonMistake: 'Trabalhar "debaixo do cadeado" de um colega. Se ele terminar e retirar o cadeado, você fica desprotegido.'
  },
  {
    id: 'seg-03',
    topicId: 'seguranca',
    skillId: 'safety.loto',
    level: 'Intermediário',
    scenario: 'A bomba já está desligada e bloqueada eletricamente.',
    prompt: 'O que ainda pode oferecer risco ao abrir a carcaça?',
    options: [
      'Pressão e líquido quente presos na tubulação e na carcaça',
      'Nada, porque a energia elétrica já foi isolada',
      'Somente o ruído do ambiente'
    ],
    correctIndex: 0,
    why: 'Bloquear a eletricidade não elimina outras energias. É preciso fechar válvulas, despressurizar, drenar e deixar esfriar.',
    commonMistake: 'Pensar que LOTO é só elétrico. Pressão, temperatura, molas e peças suspensas também são energias perigosas.'
  },
  {
    id: 'seg-04',
    topicId: 'seguranca',
    skillId: 'safety.ppe',
    level: 'Iniciante',
    prompt: 'Qual Norma Regulamentadora (NR) trata da segurança no trabalho em máquinas e equipamentos?',
    options: ['NR-12', 'NR-6', 'NR-10'],
    correctIndex: 0,
    why: 'A NR-12 define proteções, dispositivos de parada e procedimentos seguros para máquinas e equipamentos.',
    commonMistake: 'Confundir com a NR-6 (equipamentos de proteção individual) ou a NR-10 (segurança em eletricidade).'
  },
  {
    id: 'seg-05',
    topicId: 'seguranca',
    skillId: 'safety.ppe',
    level: 'Iniciante',
    prompt: 'Ao usar um saca-polias para extrair um rolamento, qual EPI é indispensável?',
    options: ['Óculos de proteção', 'Protetor auricular apenas', 'Avental de couro apenas'],
    correctIndex: 0,
    why: 'Sob carga, uma garra pode escapar ou a peça pode se soltar de repente e lançar fragmentos.',
    commonMistake: 'Tirar os óculos "só por um minuto". A maioria dos acidentes nos olhos acontece em tarefas rápidas.'
  },
  {
    id: 'seg-06',
    topicId: 'seguranca',
    skillId: 'safety.workshop',
    level: 'Intermediário',
    prompt: 'Por que não se deve usar luvas perto de partes que estão girando, como a broca de uma furadeira de bancada?',
    options: [
      'A luva pode ser agarrada e puxar a mão para dentro da máquina',
      'Porque a luva atrapalha a leitura das medidas',
      'Porque a luva suja a peça de óleo'
    ],
    correctIndex: 0,
    why: 'Tecido e borracha podem enroscar em peças rotativas. A mão nua tende a escorregar, a luva prende.',
    commonMistake: 'Achar que luva protege em qualquer situação. O EPI certo depende do risco de cada tarefa.'
  },
  {
    id: 'seg-07',
    topicId: 'seguranca',
    skillId: 'safety.ppe',
    level: 'Iniciante',
    prompt: 'Qual Norma Regulamentadora trata dos Equipamentos de Proteção Individual (EPI)?',
    options: ['NR-6', 'NR-12', 'NR-35'],
    correctIndex: 0,
    why: 'A NR-6 define as obrigações sobre fornecimento, uso, guarda e Certificado de Aprovação (CA) dos EPIs.',
    commonMistake: 'Usar EPI sem CA ou danificado. EPI com defeito deve ser trocado.'
  },
  {
    id: 'seg-08',
    topicId: 'seguranca',
    skillId: 'safety.workshop',
    level: 'Intermediário',
    scenario: 'Você terminou o alinhamento entre motor e bomba.',
    prompt: 'O que deve ser feito antes de liberar a máquina para ligar?',
    options: [
      'Reinstalar a proteção do acoplamento, retirar as ferramentas e só então remover os bloqueios',
      'Ligar rapidamente sem a proteção para testar a vibração',
      'Retirar o cadeado e deixar a proteção para o próximo turno'
    ],
    correctIndex: 0,
    why: 'O acoplamento gira em alta rotação. A proteção evita contato e lançamento de peças.',
    commonMistake: 'Fazer um "teste rápido" sem as proteções. É uma das situações mais comuns de acidente grave.'
  },
  {
    id: 'seg-09',
    topicId: 'seguranca',
    skillId: 'safety.workshop',
    level: 'Intermediário',
    prompt: 'Ao içar o cavalete de uma bomba com talha, qual atitude é correta?',
    options: [
      'Verificar a capacidade da talha e das cintas e nunca ficar embaixo da carga suspensa',
      'Segurar a peça por baixo para guiar a descida',
      'Usar qualquer corrente disponível, desde que pareça forte'
    ],
    correctIndex: 0,
    why: 'Equipamentos de içamento têm carga máxima. Se algo falhar, quem está embaixo da carga não tem como escapar.',
    commonMistake: 'Guiar a carga com as mãos por baixo. Use cordas-guia e mantenha distância.'
  },
  {
    id: 'seg-10',
    topicId: 'seguranca',
    skillId: 'safety.workshop',
    level: 'Iniciante',
    prompt: 'Você percebe que o cabo de um martelo está trincado. O que fazer?',
    options: [
      'Retirar a ferramenta de uso e avisar o responsável',
      'Enrolar fita isolante e continuar usando',
      'Usar só para batidas leves'
    ],
    correctIndex: 0,
    why: 'Uma ferramenta danificada pode se partir durante o uso. Ela deve ser identificada e trocada.',
    commonMistake: 'Fazer remendos improvisados. A fita esconde o defeito, mas não devolve a resistência.'
  },

  // ───────────────────────────── ELEMENTOS DE FIXAÇÃO ─────────────────────────────
  {
    id: 'fix-01',
    topicId: 'fixacao',
    skillId: 'fasteners.tightening',
    level: 'Iniciante',
    prompt: 'A figura mostra a ordem de aperto dos parafusos de uma flange. Qual é o objetivo dessa sequência cruzada?',
    illustration: 'flange-pattern',
    illustrationAlt: 'Flange circular com 8 parafusos numerados na ordem 1, 5, 3, 7, 2, 6, 4, 8 em padrão de estrela.',
    options: [
      'Fechar a flange por igual, sem inclinar a tampa nem esmagar a junta de um lado só',
      'Terminar o aperto mais rápido',
      'Permitir usar menos parafusos'
    ],
    correctIndex: 0,
    why: 'Apertando em cruz, a tampa desce paralela e a junta é comprimida de modo uniforme.',
    commonMistake: 'Apertar em volta, um ao lado do outro. A tampa entorta e pode vazar.',
    learnMore:
      'Na prática, o aperto também é feito em etapas: primeiro todos encostados, depois uma fração do torque final em cruz, depois o torque final em cruz e uma volta de conferência. O manual do equipamento define os valores.'
  },
  {
    id: 'fix-02',
    topicId: 'fixacao',
    skillId: 'fasteners.identification',
    level: 'Iniciante',
    prompt: 'O que significa a indicação "M12 × 1,75" em um parafuso?',
    options: [
      'Rosca métrica de 12 mm de diâmetro com passo de 1,75 mm',
      'Parafuso de 12 mm de comprimento e 1,75 mm de cabeça',
      'Parafuso de 12 polegadas com 1,75 fio por polegada'
    ],
    correctIndex: 0,
    why: '"M" indica rosca métrica, 12 é o diâmetro nominal em milímetros e 1,75 é o passo (distância entre dois filetes).',
    commonMistake: 'Achar que o número indica o comprimento. O comprimento é informado à parte (ex.: M12 × 1,75 × 40).'
  },
  {
    id: 'fix-03',
    topicId: 'fixacao',
    skillId: 'fasteners.identification',
    level: 'Intermediário',
    prompt: 'Na cabeça de um parafuso está gravado "8.8". O que o primeiro número 8 indica?',
    options: [
      'A resistência à tração nominal: cerca de 800 MPa (8 × 100)',
      'O diâmetro do parafuso: 8 mm',
      'A quantidade máxima de vezes que ele pode ser reutilizado'
    ],
    correctIndex: 0,
    why: 'Na classe de resistência, o primeiro número × 100 dá a resistência à tração em MPa. O segundo indica a relação de escoamento (0,8 → 80%).',
    commonMistake: 'Trocar um parafuso 8.8 por um comum sem classe. Ele pode deformar com o torque especificado.'
  },
  {
    id: 'fix-04',
    topicId: 'fixacao',
    skillId: 'fasteners.identification',
    level: 'Iniciante',
    prompt: 'Na maioria dos parafusos (rosca direita), para soltar você gira a ferramenta no sentido…',
    options: ['Anti-horário', 'Horário', 'Depende do tamanho do parafuso'],
    correctIndex: 0,
    why: 'Rosca direita aperta no sentido horário e solta no anti-horário. Roscas esquerdas existem, mas são exceção e costumam ser identificadas.',
    commonMistake: 'Forçar no sentido errado e apertar ainda mais um parafuso que já está preso.'
  },
  {
    id: 'fix-05',
    topicId: 'fixacao',
    skillId: 'fasteners.identification',
    level: 'Iniciante',
    prompt: 'O que é um prisioneiro (estojo)?',
    options: [
      'Uma barra roscada nas duas pontas: uma fica presa na peça e a outra recebe a porca',
      'Um parafuso sem rosca usado como pino',
      'Uma arruela de travamento'
    ],
    correctIndex: 0,
    why: 'O prisioneiro fica fixo na carcaça e guia a tampa na montagem. Para abrir, solta-se só a porca.',
    commonMistake: 'Retirar o prisioneiro sem necessidade. Isso desgasta a rosca da carcaça.'
  },
  {
    id: 'fix-06',
    topicId: 'fixacao',
    skillId: 'fasteners.tightening',
    level: 'Iniciante',
    prompt: 'O que pode acontecer se você aplicar torque muito acima do especificado?',
    options: [
      'O parafuso pode alongar de forma permanente, espanar a rosca ou romper',
      'O parafuso fica mais firme para sempre, sem nenhum risco',
      'Nada, o torque só importa na desmontagem'
    ],
    correctIndex: 0,
    why: 'O parafuso funciona como uma mola esticada. Passando do limite, ele deforma e perde a força de fixação.',
    commonMistake: 'Apertar "até não dar mais". Isso costuma causar exatamente o afrouxamento ou a quebra que se queria evitar.'
  },
  {
    id: 'fix-07',
    topicId: 'fixacao',
    skillId: 'fasteners.tightening',
    level: 'Intermediário',
    prompt: 'Para que serve uma contraporca?',
    options: [
      'Travar a porca principal para que ela não afrouxe com a vibração',
      'Aumentar o comprimento da rosca',
      'Substituir a arruela lisa'
    ],
    correctIndex: 0,
    why: 'Apertada contra a primeira porca, a contraporca cria atrito extra entre as roscas e dificulta o afrouxamento.',
    commonMistake: 'Apertar as duas porcas no mesmo sentido ao mesmo tempo. Uma deve ser segurada enquanto a outra é apertada contra ela.'
  },
  {
    id: 'fix-08',
    topicId: 'fixacao',
    skillId: 'fasteners.tightening',
    level: 'Intermediário',
    prompt: 'Como funciona o adesivo trava-rosca do tipo anaeróbico?',
    options: [
      'Endurece na ausência de ar, entre as roscas metálicas, travando e vedando a união',
      'Endurece com o calor de um maçarico',
      'Funciona como um lubrificante para soltar o parafuso depois'
    ],
    correctIndex: 0,
    why: 'Dentro da rosca não há ar e há contato com metal, condições que fazem o produto curar.',
    commonMistake: 'Escolher qualquer trava-rosca. Existem resistências diferentes; algumas exigem calor para desmontar.'
  },
  {
    id: 'fix-09',
    topicId: 'fixacao',
    skillId: 'fasteners.identification',
    level: 'Intermediário',
    prompt: 'Qual é a função da chaveta entre um eixo e uma polia?',
    options: [
      'Transmitir o torque do eixo para a polia, impedindo que ela gire em falso',
      'Vedar a passagem de óleo pelo eixo',
      'Medir a rotação do eixo'
    ],
    correctIndex: 0,
    why: 'A chaveta encaixa no rasgo do eixo e no rasgo do cubo e "trava" um no outro na rotação.',
    commonMistake: 'Montar uma chaveta gasta ou improvisada. Ela pode cisalhar e o eixo passa a girar sem levar a polia.'
  },
  {
    id: 'fix-10',
    topicId: 'fixacao',
    skillId: 'fasteners.tightening',
    level: 'Avançado',
    scenario: 'A rosca de um furo na carcaça de alumínio espanou durante a montagem.',
    prompt: 'Qual é a solução tecnicamente adequada?',
    options: [
      'Recuperar a rosca com um inserto roscado apropriado, conforme orientação técnica',
      'Apertar mais forte para o parafuso "morder" a rosca',
      'Encher o furo de cola comum e colocar o parafuso'
    ],
    correctIndex: 0,
    why: 'O inserto recria uma rosca resistente do mesmo tamanho original, sem trocar a carcaça.',
    commonMistake: 'Improvisar com cola ou fita. A união parece firme, mas solta com vibração e temperatura.'
  },

  // ───────────────────────────── INSTRUMENTOS DE MEDIÇÃO ─────────────────────────────
  {
    id: 'med-01',
    topicId: 'medicao',
    skillId: 'measure.caliper',
    level: 'Intermediário',
    prompt: 'Qual é a leitura deste paquímetro com resolução de 0,05 mm?',
    illustration: 'caliper-reading',
    illustrationAlt:
      'Escala do paquímetro: o zero do nônio está logo depois de 23 mm na escala fixa e o 7º traço do nônio coincide com um traço da escala fixa.',
    options: ['23,35 mm', '23,70 mm', '30,35 mm', '23,07 mm'],
    correctIndex: 0,
    why: 'O zero do nônio passou de 23 mm. O 7º traço coincide, e cada traço vale 0,05 mm: 7 × 0,05 = 0,35. Total: 23,35 mm.',
    commonMistake: 'Ler o número do traço como décimos diretos (0,7) ou somar o valor errado de cada traço.',
    learnMore:
      'Passo a passo: 1) leia na escala fixa os milímetros inteiros antes do zero do nônio; 2) procure o traço do nônio que fica perfeitamente alinhado com um traço da escala fixa; 3) multiplique a posição desse traço pela resolução e some.'
  },
  {
    id: 'med-02',
    topicId: 'medicao',
    skillId: 'measure.caliper',
    level: 'Iniciante',
    prompt: 'O que significa dizer que um paquímetro tem resolução de 0,05 mm?',
    options: [
      'É a menor diferença de medida que se consegue ler na escala dele',
      'É o erro máximo que ele comete em qualquer medida',
      'É a medida mínima que ele consegue medir'
    ],
    correctIndex: 0,
    why: 'Resolução é o menor valor que a escala permite distinguir. Em um paquímetro de 0,05 mm, as leituras variam de 0,05 em 0,05.',
    commonMistake: 'Confundir resolução com exatidão. Um instrumento pode mostrar 0,05 mm e ainda estar descalibrado.'
  },
  {
    id: 'med-03',
    topicId: 'medicao',
    skillId: 'measure.micrometer',
    level: 'Avançado',
    prompt: 'Micrômetro de 0,01 mm: na bainha aparecem 12 mm e mais o traço de meio milímetro; o tambor indica 18. Qual é a leitura?',
    illustration: 'micrometer-reading',
    illustrationAlt: 'Bainha do micrômetro mostrando 12 mm mais o traço de 0,5 mm visível, e o tambor alinhado na divisão 18.',
    options: ['12,68 mm', '12,18 mm', '13,80 mm'],
    correctIndex: 0,
    why: 'Bainha: 12 + 0,5 = 12,5 mm. Tambor: 18 × 0,01 = 0,18 mm. Total: 12,68 mm.',
    commonMistake: 'Esquecer o traço de meio milímetro da bainha. É o erro de leitura mais comum no micrômetro.',
    learnMore:
      'No micrômetro comum, o fuso avança 0,5 mm por volta e o tambor tem 50 divisões. Por isso cada divisão vale 0,5 ÷ 50 = 0,01 mm.'
  },
  {
    id: 'med-04',
    topicId: 'medicao',
    skillId: 'measure.micrometer',
    level: 'Iniciante',
    prompt: 'Para que serve a catraca (ou fricção) na ponta do micrômetro?',
    options: [
      'Garantir sempre a mesma força de contato com a peça',
      'Travar o micrômetro na caixa',
      'Aumentar a resolução do instrumento'
    ],
    correctIndex: 0,
    why: 'A catraca patina quando a força certa é atingida. Assim, ninguém aperta demais e a medida não varia de pessoa para pessoa.',
    commonMistake: 'Girar direto pelo tambor até apertar. A peça e o fuso se deformam e a leitura sai menor.'
  },
  {
    id: 'med-05',
    topicId: 'medicao',
    skillId: 'measure.dial',
    level: 'Iniciante',
    prompt: 'Qual destas tarefas é típica de um relógio comparador?',
    options: [
      'Verificar o batimento (empeno) de um eixo girando',
      'Medir o comprimento total de uma barra de 2 metros',
      'Medir a temperatura do rolamento'
    ],
    correctIndex: 0,
    why: 'O relógio comparador mede variações pequenas em relação a uma referência, como a oscilação de um eixo a cada volta.',
    commonMistake: 'Esperar que ele dê o diâmetro da peça. O comparador mostra a diferença, não a medida absoluta.'
  },
  {
    id: 'med-06',
    topicId: 'medicao',
    skillId: 'measure.dial',
    level: 'Avançado',
    prompt: 'Girando o eixo uma volta, o ponteiro do relógio comparador variou de −0,02 mm até +0,03 mm. Qual é o batimento total?',
    illustration: 'dial-runout',
    illustrationAlt: 'Relógio comparador com marcações de −0,02 mm e +0,03 mm indicando os extremos do ponteiro.',
    options: ['0,05 mm', '0,03 mm', '0,01 mm'],
    correctIndex: 0,
    why: 'Batimento total é a diferença entre a maior e a menor leitura: 0,03 − (−0,02) = 0,05 mm.',
    commonMistake: 'Usar só o maior valor (0,03) ou subtrair sem considerar o sinal negativo.'
  },
  {
    id: 'med-07',
    topicId: 'medicao',
    skillId: 'measure.caliper',
    level: 'Iniciante',
    prompt: 'Qual parte do paquímetro é usada para medir o diâmetro interno de um furo?',
    options: ['As orelhas (bicos internos), na parte de cima', 'Os bicos externos, na parte de baixo', 'A haste de profundidade'],
    correctIndex: 0,
    why: 'As orelhas se afastam e encostam nas paredes internas do furo.',
    commonMistake: 'Medir o furo com os bicos externos "por fora". A leitura não representa o diâmetro interno.'
  },
  {
    id: 'med-08',
    topicId: 'medicao',
    skillId: 'measure.good-practice',
    level: 'Intermediário',
    prompt: 'Uma peça acabou de sair da usinagem e está quente. Quando medir com precisão?',
    options: [
      'Depois que ela esfriar até perto da temperatura ambiente',
      'Imediatamente, enquanto ela ainda está quente',
      'Tanto faz, o metal não muda de tamanho'
    ],
    correctIndex: 0,
    why: 'O metal dilata com o calor. Medidas de referência são definidas a 20 °C; a peça quente parece maior do que é.',
    commonMistake: 'Ajustar a usinagem com a peça quente. Depois que ela esfria, a medida sai menor que a desejada.'
  },
  {
    id: 'med-09',
    topicId: 'medicao',
    skillId: 'measure.good-practice',
    level: 'Iniciante',
    prompt: 'Como evitar o erro de paralaxe ao ler uma escala?',
    options: [
      'Olhar a escala de frente, perpendicular aos traços',
      'Olhar a escala de lado, para ver melhor os traços',
      'Ler sempre com um olho fechado'
    ],
    correctIndex: 0,
    why: 'Olhando de lado, o traço parece estar em outra posição. De frente, a leitura fica correta.',
    commonMistake: 'Ler o instrumento em posição torta por preguiça de mudar de lugar.'
  },
  {
    id: 'med-10',
    topicId: 'medicao',
    skillId: 'measure.good-practice',
    level: 'Iniciante',
    prompt: 'O que fazer antes de medir uma peça com o paquímetro?',
    options: [
      'Limpar a peça e os bicos e conferir se o instrumento marca zero fechado',
      'Lubrificar os bicos com graxa para deslizar melhor',
      'Apertar bem os bicos para a peça não escapar'
    ],
    correctIndex: 0,
    why: 'Sujeira entre os bicos e a peça soma na medida. Conferir o zero mostra se o instrumento está pronto.',
    commonMistake: 'Forçar os bicos contra a peça. Isso inclina o cursor e gera erro.'
  },

  // ───────────────────────────── ROLAMENTOS ─────────────────────────────
  {
    id: 'rol-01',
    topicId: 'rolamentos',
    skillId: 'bearings.function',
    level: 'Iniciante',
    prompt: 'Qual é a principal função de um rolamento?',
    options: [
      'Apoiar o eixo e permitir que ele gire com pouco atrito, suportando as cargas',
      'Vedar a passagem de óleo pelo eixo',
      'Transmitir o movimento do motor para outro eixo'
    ],
    correctIndex: 0,
    why: 'As esferas ou rolos trocam o atrito de escorregamento por atrito de rolamento, que é muito menor.',
    commonMistake: 'Confundir rolamento com vedação. O retentor e o selo é que vedam.'
  },
  {
    id: 'rol-02',
    topicId: 'rolamentos',
    skillId: 'bearings.mounting',
    level: 'Iniciante',
    scenario: 'Você vai prensar um rolamento novo em um eixo (ajuste com interferência no anel interno).',
    prompt: 'Em qual parte do rolamento a força de montagem deve ser aplicada?',
    options: ['No anel interno', 'No anel externo', 'Na gaiola que segura as esferas'],
    correctIndex: 0,
    why: 'A força deve passar pelo anel que está sendo montado com aperto. Assim ela não atravessa as esferas.',
    commonMistake: 'Empurrar pelo anel externo. A força passa pelas esferas e marca as pistas, estragando o rolamento novo.'
  },
  {
    id: 'rol-03',
    topicId: 'rolamentos',
    skillId: 'bearings.mounting',
    level: 'Intermediário',
    prompt: 'Qual é a forma adequada de aquecer um rolamento para montá-lo no eixo?',
    options: [
      'Aquecedor indutivo com controle de temperatura',
      'Chama direta de maçarico até ficar vermelho',
      'Mergulhar em óleo sem controlar a temperatura'
    ],
    correctIndex: 0,
    why: 'O aquecedor indutivo aquece por igual e com temperatura controlada. O rolamento dilata e entra no eixo sem esforço.',
    commonMistake: 'Superaquecer. Acima da temperatura indicada pelo fabricante o aço perde dureza e o rolamento se estraga.',
    learnMore:
      'Os fabricantes costumam indicar algo em torno de 80 a 90 °C acima da temperatura do eixo, sem passar do limite máximo do catálogo (normalmente perto de 120 °C para rolamentos comuns).'
  },
  {
    id: 'rol-04',
    topicId: 'rolamentos',
    skillId: 'bearings.function',
    level: 'Intermediário',
    prompt: 'Que tipo de carga um rolamento rígido de esferas suporta?',
    options: [
      'Principalmente carga radial, e também carga axial moderada nos dois sentidos',
      'Somente carga axial',
      'Somente carga radial, nunca axial'
    ],
    correctIndex: 0,
    why: 'As pistas profundas permitem que as esferas recebam força radial e também alguma força axial.',
    commonMistake: 'Usá-lo onde há grande força axial constante. Nesses casos existem rolamentos de contato angular ou de rolos cônicos.'
  },
  {
    id: 'rol-05',
    topicId: 'rolamentos',
    skillId: 'bearings.function',
    level: 'Intermediário',
    prompt: 'Por que redutores com engrenagens helicoidais costumam usar rolamentos de rolos cônicos montados aos pares?',
    options: [
      'Os dentes helicoidais geram força axial, e o par de rolos cônicos suporta força radial e axial combinadas',
      'Porque rolamentos cônicos não precisam de lubrificação',
      'Porque são os únicos que giram em alta rotação'
    ],
    correctIndex: 0,
    why: 'O dente inclinado empurra o eixo para o lado. Cada rolamento cônico segura um sentido; montados opostos, seguram os dois.',
    commonMistake: 'Montar sem ajustar a folga axial. Rolamentos cônicos precisam de ajuste correto de folga ou pré-carga.'
  },
  {
    id: 'rol-06',
    topicId: 'rolamentos',
    skillId: 'bearings.function',
    level: 'Intermediário',
    prompt: 'Na designação do rolamento 6205, qual é o diâmetro do furo?',
    options: ['25 mm', '5 mm', '62 mm'],
    correctIndex: 0,
    why: 'Nos dois últimos dígitos (a partir de 04), multiplica-se por 5: 05 × 5 = 25 mm. O "62" indica o tipo e a série.',
    commonMistake: 'Ler o número final diretamente como milímetros.',
    learnMore: 'Exceções: 00 = 10 mm, 01 = 12 mm, 02 = 15 mm e 03 = 17 mm. De 04 em diante, multiplica-se por 5.'
  },
  {
    id: 'rol-07',
    topicId: 'rolamentos',
    skillId: 'bearings.diagnosis',
    level: 'Avançado',
    scenario: 'Um rolamento novo começou a fazer ruído logo após a montagem. Na inspeção, as pistas têm marcas afundadas no mesmo espaçamento das esferas.',
    prompt: 'Qual é a causa mais provável?',
    options: [
      'Impacto na montagem (pancadas transmitidas pelas esferas)',
      'Falta de uso por muito tempo na prateleira',
      'Óleo de viscosidade um pouco maior que a indicada'
    ],
    correctIndex: 0,
    why: 'Marcas no espaçamento das esferas são impressões causadas por impacto ou força aplicada pelo anel errado.',
    commonMistake: 'Trocar o rolamento e repetir o mesmo método de montagem. A falha volta.'
  },
  {
    id: 'rol-08',
    topicId: 'rolamentos',
    skillId: 'bearings.diagnosis',
    level: 'Intermediário',
    prompt: 'O que pode acontecer se você encher completamente de graxa a caixa de um rolamento que gira rápido?',
    options: [
      'O rolamento aquece por excesso de graxa sendo agitada',
      'Ele passa a durar para sempre sem relubrificar',
      'Nada, mais graxa sempre protege mais'
    ],
    correctIndex: 0,
    why: 'O excesso de graxa é batido pelas esferas, gera atrito interno e eleva a temperatura.',
    commonMistake: 'Achar que "quanto mais, melhor". A quantidade certa vem do plano de lubrificação ou do fabricante.'
  },
  {
    id: 'rol-09',
    topicId: 'rolamentos',
    skillId: 'bearings.diagnosis',
    level: 'Intermediário',
    scenario: 'Na ronda, um mancal está mais quente que o normal e com ruído novo.',
    prompt: 'Qual é a atitude correta?',
    options: [
      'Registrar e comunicar, verificar lubrificação e alinhamento e programar a intervenção',
      'Jogar água no mancal para esfriar',
      'Ignorar até o rolamento travar, para aproveitar a peça ao máximo'
    ],
    correctIndex: 0,
    why: 'Calor e ruído são sinais de falha em andamento. Agir cedo evita a quebra e danos ao eixo e à carcaça.',
    commonMistake: 'Resfriar com água: além do choque térmico, a água contamina o lubrificante.'
  },
  {
    id: 'rol-10',
    topicId: 'rolamentos',
    skillId: 'bearings.function',
    level: 'Avançado',
    prompt: 'O que indica o sufixo C3 em um rolamento (ex.: 6308 C3)?',
    options: [
      'Folga interna radial maior que a normal',
      'Rolamento com três carreiras de esferas',
      'Rolamento blindado dos dois lados'
    ],
    correctIndex: 0,
    why: 'C3 indica folga interna maior. É usado quando o ajuste apertado ou a temperatura de trabalho reduzem a folga.',
    commonMistake: 'Trocar um C3 por um de folga normal sem consultar o projeto. O rolamento pode trabalhar sem folga e aquecer.'
  },

  // ───────────────────────────── BOMBAS CENTRÍFUGAS ─────────────────────────────
  {
    id: 'bom-01',
    topicId: 'bombas',
    skillId: 'pumps.principle',
    level: 'Iniciante',
    prompt: 'Na bomba centrífuga da figura, qual é o papel do rotor e da voluta (carcaça em espiral)?',
    illustration: 'pump-section',
    illustrationAlt: 'Ilustração isométrica de uma bomba centrífuga com voluta, rotor, selo, eixo e cavalete.',
    options: [
      'O rotor acelera o líquido e a voluta transforma essa velocidade em pressão',
      'A voluta gira e o rotor fica parado',
      'O rotor aquece o líquido e a voluta resfria'
    ],
    correctIndex: 0,
    why: 'As pás do rotor jogam o líquido para fora com velocidade. A espiral da voluta vai alargando e converte velocidade em pressão.',
    commonMistake: 'Achar que a bomba "cria" pressão sozinha. Ela entrega energia ao líquido por meio do rotor.'
  },
  {
    id: 'bom-02',
    topicId: 'bombas',
    skillId: 'pumps.operation',
    level: 'Iniciante',
    prompt: 'O que é cavitação em uma bomba centrífuga?',
    options: [
      'Formação de bolhas de vapor na entrada, que estouram no rotor e arrancam material',
      'Entrada de ar pela vedação do motor elétrico',
      'Desgaste normal da pintura da carcaça'
    ],
    correctIndex: 0,
    why: 'Se a pressão na entrada do rotor cai abaixo da pressão de vapor, o líquido "ferve" a frio. As bolhas colapsam e erodem o metal.',
    commonMistake: 'Ignorar o barulho de "pedrinhas" dentro da bomba. É um sinal típico de cavitação.'
  },
  {
    id: 'bom-03',
    topicId: 'bombas',
    skillId: 'pumps.operation',
    level: 'Intermediário',
    prompt: 'Qual atitude ajuda a evitar cavitação?',
    options: [
      'Manter a válvula de sucção totalmente aberta e o filtro de sucção limpo',
      'Fechar parcialmente a válvula de sucção para controlar a vazão',
      'Aumentar a rotação da bomba sempre que possível'
    ],
    correctIndex: 0,
    why: 'Restrições na sucção reduzem a pressão na entrada do rotor. Quando é preciso regular vazão, usa-se a válvula de recalque.',
    commonMistake: 'Regular a vazão pela válvula de sucção. É uma causa clássica de cavitação.',
    learnMore:
      'Tecnicamente, é preciso manter o NPSH disponível (pressão útil na sucção) maior que o NPSH requerido pela bomba. Perdas na sucção, líquido quente e bomba muito acima do nível do reservatório reduzem o NPSH disponível.'
  },
  {
    id: 'bom-04',
    topicId: 'bombas',
    skillId: 'pumps.operation',
    level: 'Iniciante',
    prompt: 'Antes de ligar uma bomba centrífuga comum (não autoescorvante), o que é necessário?',
    options: [
      'Que a carcaça e a tubulação de sucção estejam cheias de líquido (escorvada)',
      'Que a carcaça esteja vazia para a bomba ficar mais leve',
      'Que a válvula de sucção esteja fechada'
    ],
    correctIndex: 0,
    why: 'Bomba centrífuga cheia de ar não consegue puxar o líquido. Além disso, girar a seco danifica o selo mecânico.',
    commonMistake: 'Ligar "para ver se puxa". Poucos segundos a seco já podem trincar as faces do selo.'
  },
  {
    id: 'bom-05',
    topicId: 'bombas',
    skillId: 'pumps.sealing',
    level: 'Iniciante',
    prompt: 'Por que o selo mecânico estraga quando a bomba funciona a seco?',
    options: [
      'Porque as faces do selo precisam de uma fina camada do líquido para lubrificar e resfriar',
      'Porque o selo é feito de papel',
      'Porque o motor gira ao contrário sem líquido'
    ],
    correctIndex: 0,
    why: 'Sem o líquido entre as faces, o atrito gera calor muito rápido e as faces trincam ou se desgastam.',
    commonMistake: 'Tocar as faces do selo novo com os dedos. Gordura e poeira também prejudicam a vedação.'
  },
  {
    id: 'bom-06',
    topicId: 'bombas',
    skillId: 'pumps.principle',
    level: 'Intermediário',
    prompt: 'Qual é a vantagem da construção "back-pull-out" em bombas centrífugas?',
    options: [
      'Retirar o conjunto rotativo pela traseira sem desconectar a carcaça das tubulações',
      'Permitir que a bomba funcione sem motor',
      'Dispensar o alinhamento com o motor'
    ],
    correctIndex: 0,
    why: 'A voluta fica presa na tubulação. Sai só o conjunto de cavalete, eixo, selo e rotor, o que agiliza a manutenção.',
    commonMistake: 'Desmontar a tubulação sem necessidade, o que aumenta o tempo de parada e o risco de vazamentos.'
  },
  {
    id: 'bom-07',
    topicId: 'bombas',
    skillId: 'pumps.operation',
    level: 'Intermediário',
    scenario: 'Depois da troca do motor, a bomba funciona, mas a pressão ficou bem menor que antes.',
    prompt: 'Qual é a primeira verificação a fazer?',
    options: [
      'O sentido de rotação, comparando com a seta da carcaça',
      'A cor da tinta do motor novo',
      'O tamanho da placa de identificação'
    ],
    correctIndex: 0,
    why: 'Com rotação invertida, a bomba centrífuga ainda bombeia um pouco, mas com vazão e pressão bem menores.',
    commonMistake: 'Concluir que a bomba "está fraca" e trocar o rotor antes de checar o básico.'
  },
  {
    id: 'bom-08',
    topicId: 'bombas',
    skillId: 'pumps.operation',
    level: 'Avançado',
    prompt: 'Por que não se deve deixar uma bomba centrífuga funcionando por muito tempo com a válvula de recalque fechada?',
    options: [
      'A energia vira calor no líquido parado, que pode aquecer, vaporizar e danificar selo e rolamentos',
      'Porque a bomba passa a consumir zero energia',
      'Porque a vazão aumenta demais'
    ],
    correctIndex: 0,
    why: 'Sem vazão, o líquido dentro da carcaça não é renovado e esquenta rapidamente.',
    commonMistake: 'Deixar a bomba ligada "esperando" com o recalque fechado durante muito tempo.'
  },
  {
    id: 'bom-09',
    topicId: 'bombas',
    skillId: 'pumps.principle',
    level: 'Intermediário',
    prompt: 'Qual é o efeito de um desalinhamento entre o motor e a bomba?',
    options: [
      'Vibração e desgaste prematuro de rolamentos, acoplamento e selo',
      'Aumento da pressão de recalque',
      'Redução da conta de energia'
    ],
    correctIndex: 0,
    why: 'Eixos desalinhados forçam o acoplamento a cada volta. Essa força vai para os rolamentos e para o selo.',
    commonMistake: 'Confiar que o acoplamento elástico "compensa tudo". Ele aceita pequenos desvios, não substitui o alinhamento.'
  },
  {
    id: 'bom-10',
    topicId: 'bombas',
    skillId: 'pumps.sealing',
    level: 'Avançado',
    scenario: 'Uma bomba vedada com gaxetas apresenta um gotejamento leve e constante.',
    prompt: 'Como interpretar essa situação?',
    options: [
      'É normal: a gaxeta precisa de um pequeno vazamento para lubrificar e resfriar',
      'É um defeito: aperte o preme-gaxeta até parar de pingar',
      'Indica cavitação no rotor'
    ],
    correctIndex: 0,
    why: 'Na gaxeta, o próprio líquido lubrifica e resfria a vedação. O gotejamento é regulado conforme o fabricante.',
    commonMistake: 'Apertar demais o preme-gaxeta. A vedação aquece e desgasta a luva ou o eixo.'
  },
  {
    id: 'bom-11',
    topicId: 'bombas',
    skillId: 'pumps.gear',
    level: 'Iniciante',
    prompt: 'Numa bomba de engrenagens externas, por onde o líquido é levado da entrada até a saída?',
    options: [
      'Nos vãos entre os dentes, pela parte de fora das engrenagens, junto à parede do corpo',
      'Pelo meio, entre os dentes engrenados',
      'Por dentro do eixo motor'
    ],
    correctIndex: 0,
    why: 'Na entrada os dentes se separam e os vãos se enchem; o líquido viaja nos vãos junto à parede até a saída. No meio, o engrenamento impede a volta.',
    commonMistake: 'Achar que o líquido passa entre os dentes engrenados. É justamente ali que ele é impedido de voltar.',
    optionFeedback: [
      'Correto.',
      'No engrenamento os dentes ocupam os vãos: é ali que o líquido é barrado.',
      'O eixo é maciço; ele só transmite o giro.'
    ]
  },
  {
    id: 'bom-12',
    topicId: 'bombas',
    skillId: 'pumps.gear',
    level: 'Iniciante',
    prompt: 'Por que um circuito com bomba de engrenagens precisa de válvula de alívio?',
    options: [
      'Porque ela desloca volume a cada volta e, se a saída for bloqueada, a pressão sobe até algo romper',
      'Porque ela gira ao contrário quando a pressão cai',
      'Porque a válvula de alívio aumenta a vazão da bomba'
    ],
    correctIndex: 0,
    why: 'É uma bomba de deslocamento positivo: não "escorrega" como a centrífuga. A válvula de alívio limita a pressão máxima do circuito.',
    optionFeedback: [
      'Correto.',
      'O sentido de giro é imposto pelo motor.',
      'A válvula de alívio não aumenta vazão: ela desvia o fluxo quando a pressão chega ao valor ajustado.'
    ]
  },
  {
    id: 'bom-13',
    topicId: 'bombas',
    skillId: 'pumps.gear',
    level: 'Intermediário',
    scenario: 'Você abriu uma bomba de engrenagens para revisão e vai retirar os mancais em bloco.',
    prompt: 'O que fazer antes de retirar cada mancal?',
    options: [
      'Marcar a posição e o lado de cada mancal para montar igual',
      'Lixar as faces para limpar',
      'Aquecer com maçarico para soltar'
    ],
    correctIndex: 0,
    why: 'Muitos mancais em bloco têm lado e posição definidos (canais de alívio e lubrificação). Montar invertido pode travar ou derrubar o rendimento da bomba.',
    optionFeedback: [
      'Correto.',
      'Lixar altera a face que veda as laterais dos dentes.',
      'Os blocos saem deslizando; calor de chama deforma e altera o material.'
    ]
  },
  {
    id: 'bom-14',
    topicId: 'bombas',
    skillId: 'pumps.gear',
    level: 'Intermediário',
    scenario: 'Depois de trocar o retentor do eixo, a bomba de engrenagens voltou a vazar pelo eixo em poucos dias.',
    prompt: 'Qual é uma causa provável a verificar?',
    options: [
      'Sulco ou risco no eixo na região onde o lábio do retentor trabalha',
      'Excesso de tinta no corpo da bomba',
      'Chaveta nova demais'
    ],
    correctIndex: 0,
    why: 'Se o eixo tem sulco na pista do lábio, o retentor novo não veda. Também vale conferir se o retentor foi montado reto e com o lábio voltado para o lado do óleo.',
    optionFeedback: [
      'Correto.',
      'A pintura externa não interfere na vedação do eixo.',
      'A chaveta não tem relação com a vedação do eixo.'
    ]
  },

  // ───────────────────────────── MANUTENÇÃO PREVENTIVA ─────────────────────────────
  {
    id: 'man-01',
    topicId: 'manutencao',
    skillId: 'maint.types',
    level: 'Iniciante',
    prompt: 'Trocar o óleo de um redutor a cada intervalo definido de horas, mesmo sem defeito, é um exemplo de manutenção…',
    options: ['Preventiva', 'Corretiva', 'Preditiva'],
    correctIndex: 0,
    why: 'A manutenção preventiva é feita em intervalos planejados para evitar a falha.',
    commonMistake: 'Chamar de corretiva qualquer troca de peça. Corretiva é a intervenção depois que a falha acontece.'
  },
  {
    id: 'man-02',
    topicId: 'manutencao',
    skillId: 'maint.types',
    level: 'Iniciante',
    prompt: 'Medir a vibração de um motor todo mês e decidir a troca do rolamento pelos resultados é manutenção…',
    options: ['Preditiva', 'Preventiva por tempo', 'Corretiva'],
    correctIndex: 0,
    why: 'A preditiva acompanha a condição real da máquina (vibração, temperatura, análise de óleo) e intervém no momento certo.',
    commonMistake: 'Achar que medir é "perder tempo". As medições mostram a falha antes de ela parar a produção.'
  },
  {
    id: 'man-03',
    topicId: 'manutencao',
    skillId: 'maint.types',
    level: 'Iniciante',
    prompt: 'Qual é a principal vantagem da manutenção preventiva?',
    options: [
      'Reduzir paradas inesperadas e permitir planejar peças e equipe',
      'Eliminar totalmente a necessidade de inspeções',
      'Dispensar o registro das intervenções'
    ],
    correctIndex: 0,
    why: 'Com o plano, a parada acontece no momento escolhido, com as peças e as pessoas já disponíveis.',
    commonMistake: 'Pular as preventivas quando a produção está apertada. A falha costuma vir no pior momento.'
  },
  {
    id: 'man-04',
    topicId: 'manutencao',
    skillId: 'maint.routine',
    level: 'Iniciante',
    prompt: 'Por que seguir o plano de lubrificação em vez de "colocar bastante graxa"?',
    options: [
      'Cada ponto tem lubrificante, quantidade e intervalo certos; excesso também causa falha',
      'Porque graxa é cara e precisa ser economizada a qualquer custo',
      'Porque o plano é só uma formalidade'
    ],
    correctIndex: 0,
    why: 'Lubrificante errado ou em excesso aquece e degrada a peça tanto quanto a falta.',
    commonMistake: 'Misturar graxas diferentes. Algumas não são compatíveis e perdem as propriedades.'
  },
  {
    id: 'man-05',
    topicId: 'manutencao',
    skillId: 'maint.routine',
    level: 'Iniciante',
    prompt: 'Por que é importante registrar cada intervenção na ordem de serviço?',
    options: [
      'Para criar um histórico e identificar falhas que se repetem',
      'Somente para controlar o horário do técnico',
      'Não é importante quando o serviço deu certo'
    ],
    correctIndex: 0,
    why: 'Com o histórico, fica fácil perceber padrões, como um rolamento que sempre falha no mesmo equipamento.',
    commonMistake: 'Registrar de forma vaga ("arrumado"). Anote o que foi encontrado, o que foi feito e as peças trocadas.'
  },
  {
    id: 'man-06',
    topicId: 'manutencao',
    skillId: 'maint.routine',
    level: 'Intermediário',
    scenario: 'Durante a ronda, você sente cheiro de queimado e escuta um ruído novo em um motor.',
    prompt: 'Qual é a ação correta?',
    options: [
      'Comunicar e registrar na hora e seguir o procedimento, parando a máquina se houver risco',
      'Esperar a próxima preventiva programada',
      'Abrir a tampa do motor com ele funcionando para ver o que é'
    ],
    correctIndex: 0,
    why: 'Sinais novos indicam uma falha em andamento. Agir cedo evita danos maiores e acidentes.',
    commonMistake: 'Investigar com a máquina ligada. Qualquer abertura exige bloqueio de energia.'
  },
  {
    id: 'man-07',
    topicId: 'manutencao',
    skillId: 'maint.routine',
    level: 'Iniciante',
    prompt: 'Por que limpar o equipamento por fora antes de abri-lo para manutenção?',
    options: [
      'Para que a sujeira não entre nas partes internas durante a desmontagem',
      'Somente por questão de aparência',
      'Porque a limpeza substitui a lubrificação'
    ],
    correctIndex: 0,
    why: 'Poeira e cavacos que caem dentro de mancais e engrenagens são causa frequente de desgaste.',
    commonMistake: 'Usar ar comprimido direto em rolamentos. Isso empurra sujeira para dentro e pode girar as esferas a seco.'
  },
  {
    id: 'man-08',
    topicId: 'manutencao',
    skillId: 'maint.types',
    level: 'Avançado',
    scenario: 'O rolamento de uma mesma bomba é trocado a cada dois meses.',
    prompt: 'Qual é a melhor decisão?',
    options: [
      'Investigar a causa raiz (alinhamento, lubrificação, contaminação, montagem)',
      'Deixar sempre um rolamento reserva e continuar trocando',
      'Trocar por um rolamento de outra marca sem investigar'
    ],
    correctIndex: 0,
    why: 'Se a causa continua, qualquer rolamento novo vai falhar de novo. A análise de causa raiz resolve a origem do problema.',
    commonMistake: 'Tratar o sintoma. Trocar a peça é necessário, mas não basta.'
  },
  {
    id: 'man-09',
    topicId: 'manutencao',
    skillId: 'maint.types',
    level: 'Intermediário',
    prompt: 'Na manutenção autônoma (um dos pilares da TPM), quem faz a limpeza, a inspeção e a lubrificação básicas?',
    options: [
      'O próprio operador da máquina, treinado para isso',
      'Somente a equipe de engenharia',
      'Uma empresa externa, uma vez por ano'
    ],
    correctIndex: 0,
    why: 'O operador convive com a máquina todos os dias e percebe cedo mudanças de ruído, temperatura ou vazamentos.',
    commonMistake: 'Achar que o operador "não deve encostar" na máquina. Tarefas básicas e seguras fazem parte do trabalho dele.'
  },
  {
    id: 'man-10',
    topicId: 'manutencao',
    skillId: 'maint.routine',
    level: 'Intermediário',
    prompt: 'O nível de óleo de um cavalete de bomba deve ficar em qual posição?',
    options: [
      'Na marca indicada pelo fabricante (normalmente o centro do visor)',
      'Completamente cheio até o respiro',
      'O mais baixo possível, para não sujar'
    ],
    correctIndex: 0,
    why: 'Com o nível certo, as esferas mais baixas pegam óleo sem agitar o banho todo, o que evita aquecimento e espuma.',
    commonMistake: 'Completar "até em cima". Óleo em excesso aquece e vaza pelos retentores.'
  },
  // ───────────────────────────── TORNO MECÂNICO ─────────────────────────────
  {
    id: 'tor-01',
    topicId: 'torno',
    skillId: 'lathe.parts',
    level: 'Iniciante',
    prompt: 'No torno mecânico convencional, o que gira durante o corte?',
    options: ['A peça, presa na placa', 'A ferramenta, presa no porta-ferramenta', 'As duas giram, em sentidos opostos'],
    correctIndex: 0,
    why: 'No torno a peça gira com o eixo-árvore. A ferramenta fica parada no porta-ferramenta e só se desloca com os carros.',
    commonMistake: 'Confundir com a furadeira e a fresadora, em que é a ferramenta que gira.',
    optionFeedback: [
      'Isso. A rotação vem do cabeçote fixo, passa pelo eixo-árvore e chega à placa, que gira a peça.',
      'Não. A ferramenta não gira no torno: ela é levada pelos carros (longitudinal e transversal).',
      'Não. Só a peça gira; a ferramenta apenas avança.'
    ]
  },
  {
    id: 'tor-02',
    topicId: 'torno',
    skillId: 'lathe.parts',
    level: 'Iniciante',
    prompt: 'Por que a placa universal de 3 castanhas é chamada de “autocentrante”?',
    options: [
      'Porque as três castanhas se movem juntas ao girar a chave, centralizando peças redondas',
      'Porque ela se aperta sozinha quando o torno é ligado',
      'Porque cada castanha é ajustada separadamente com um relógio comparador'
    ],
    correctIndex: 0,
    why: 'Uma espiral interna move as três castanhas ao mesmo tempo, na mesma distância do centro. Assim uma peça redonda fica centrada sem ajuste individual.',
    commonMistake: 'Confundir com a placa de 4 castanhas independentes, em que cada castanha é ajustada separadamente.',
    learnMore:
      'A centragem da placa universal depende do estado das castanhas e da placa. Quando é preciso mais precisão ou a peça não é redonda, usa-se a placa de 4 castanhas independentes, ajustada com relógio comparador.'
  },
  {
    id: 'tor-03',
    topicId: 'torno',
    skillId: 'lathe.safety',
    level: 'Iniciante',
    scenario: 'Você acabou de apertar a peça na placa com a chave.',
    prompt: 'O que fazer com a chave da placa antes de ligar o torno?',
    options: [
      'Retirar a chave da placa imediatamente e guardá-la no lugar dela',
      'Deixar a chave na placa para soltar a peça mais rápido depois',
      'Deixar a chave na placa, mas com a proteção fechada'
    ],
    correctIndex: 0,
    why: 'Se o torno for ligado com a chave na placa, ela é arremessada com muita força. Regra: tirou a mão da chave, tirou a chave da placa.',
    commonMistake: 'Achar que a proteção basta. A chave pode bater na proteção ou na peça e ser lançada mesmo assim.'
  },
  {
    id: 'tor-04',
    topicId: 'torno',
    skillId: 'lathe.parts',
    level: 'Iniciante',
    scenario: 'Uma barra longa e fina vibra muito quando a ferramenta se aproxima da ponta livre.',
    prompt: 'Qual parte do torno ajuda a resolver isso?',
    options: ['O cabeçote móvel, apoiando a ponta da peça com a contraponta', 'O carro superior, girado em ângulo', 'A caixa de avanços, com o avanço mais rápido'],
    correctIndex: 0,
    why: 'A ponta do cabeçote móvel apoia a extremidade livre da peça, que deixa de trabalhar “em balanço” e vibra bem menos.',
    commonMistake: 'Aumentar o avanço. Isso aumenta o esforço e tende a piorar a vibração.'
  },
  {
    id: 'tor-05',
    topicId: 'torno',
    skillId: 'lathe.safety',
    level: 'Iniciante',
    prompt: 'Qual destas práticas é correta para quem vai trabalhar perto de um torno em funcionamento?',
    options: [
      'Usar óculos de proteção, roupa justa e cabelo preso, sem luvas perto das partes que giram',
      'Usar luvas grossas para segurar os cavacos com segurança',
      'Usar manga comprida e larga para proteger os braços dos cavacos'
    ],
    correctIndex: 0,
    why: 'Partes girando podem puxar luvas, mangas largas, cabelo e adornos — e a mão vai junto. Os óculos protegem contra cavacos lançados.',
    commonMistake: 'Usar luvas por hábito. Perto de placa, peça ou broca girando, a luva é um risco de enrolamento.',
    learnMore:
      'Luvas podem ser usadas para manusear peças e cavacos com a máquina parada, conforme a orientação da oficina. Retire cavacos com gancho ou pincel, nunca com a mão.'
  },
  {
    id: 'tor-06',
    topicId: 'torno',
    skillId: 'lathe.setup',
    level: 'Intermediário',
    scenario: 'Ao facear uma peça, sobrou um pequeno “pino” no centro da face.',
    prompt: 'Qual é a causa mais provável?',
    options: ['A ponta da ferramenta está fora da altura do centro da peça', 'A rotação estava alta demais', 'A peça estava apoiada na contraponta'],
    correctIndex: 0,
    why: 'Se a aresta de corte está abaixo (ou acima) do centro, ela não alcança o centro exato e deixa um pino. A ponta deve ficar na altura do centro.',
    commonMistake: 'Mudar a rotação ou o avanço sem conferir a altura da ferramenta.',
    learnMore: 'Uma forma comum de conferir é comparar a ponta da ferramenta com a ponta do cabeçote móvel e ajustar com calços sob a haste.'
  },
  {
    id: 'tor-07',
    topicId: 'torno',
    skillId: 'lathe.parts',
    level: 'Iniciante',
    prompt: 'No cilindramento, qual carro define a profundidade de corte (o quanto a ferramenta “entra” na peça)?',
    options: ['O carro transversal', 'O carro principal', 'O cabeçote móvel'],
    correctIndex: 0,
    why: 'O carro transversal move a ferramenta em direção ao centro da peça. O anel graduado do volante mostra o deslocamento.',
    commonMistake: 'Confundir com o carro principal, que faz o movimento ao longo da peça (o avanço longitudinal).',
    optionFeedback: [
      'Isso. Ele aproxima a ferramenta do centro e define a profundidade.',
      'Não. O carro principal leva a ferramenta ao longo da peça, não em direção ao centro.',
      'Não. O cabeçote móvel apoia a peça ou segura brocas; ele não leva a ferramenta de tornear.'
    ]
  },
  {
    id: 'tor-08',
    topicId: 'torno',
    skillId: 'lathe.parts',
    level: 'Intermediário',
    prompt: 'Qual eixo do torno é usado para abrir roscas com o avanço automático?',
    options: ['O fuso (eixo com rosca), acoplado pela porca bipartida', 'A vara (eixo liso com rasgo)', 'O eixo do volante do cabeçote móvel'],
    correctIndex: 0,
    why: 'Para roscas, o carro precisa avançar em sincronia exata com a rotação da peça. Isso é feito pelo fuso, acoplado ao carro pela porca bipartida.',
    commonMistake: 'Usar o fuso para os avanços comuns. Em tornos com fuso e vara, a vara é usada para cilindrar e facear, o que poupa o fuso do desgaste.'
  },
  {
    id: 'tor-09',
    topicId: 'torno',
    skillId: 'lathe.safety',
    level: 'Iniciante',
    scenario: 'Você quer conferir o diâmetro da peça com o paquímetro.',
    prompt: 'Quando a medição deve ser feita?',
    options: ['Com o torno desligado e a placa totalmente parada', 'Com a placa girando devagar, para medir em vários pontos', 'Durante o corte, para corrigir a medida na hora'],
    correctIndex: 0,
    why: 'Medir com a peça girando expõe a mão à placa e à ferramenta, e o instrumento pode ser puxado. A leitura também sai errada.',
    commonMistake: 'Medir “só rapidinho” com a placa ainda desacelerando.'
  },
  {
    id: 'tor-10',
    topicId: 'torno',
    skillId: 'lathe.cutting',
    level: 'Intermediário',
    prompt: 'Mantendo a mesma rotação (rpm), o que acontece com a velocidade de corte quando o diâmetro da peça aumenta?',
    options: ['Aumenta, porque a superfície percorre uma distância maior a cada volta', 'Diminui', 'Não muda, porque a rotação é a mesma'],
    correctIndex: 0,
    why: 'A velocidade de corte é a velocidade da superfície da peça: Vc = π × D × n ÷ 1000 (m/min, com D em mm e n em rpm). Com D maior, Vc aumenta.',
    commonMistake: 'Achar que rpm e velocidade de corte são a mesma coisa. Por isso peças de diâmetro grande normalmente pedem rotação menor.',
    learnMore:
      'A velocidade de corte recomendada depende do material da peça, do material da ferramenta e da operação. Ela vem de tabelas do fabricante da ferramenta e da orientação do instrutor; aqui o objetivo é só entender a relação.'
  },
  {
    id: 'tor-11',
    topicId: 'torno',
    skillId: 'lathe.operations',
    level: 'Iniciante',
    prompt: 'Qual operação reduz o diâmetro externo de uma barra ao longo do comprimento?',
    options: ['Cilindramento', 'Faceamento', 'Sangramento (corte)'],
    correctIndex: 0,
    why: 'No cilindramento a ferramenta anda paralela ao eixo da peça e reduz o diâmetro. O faceamento corta a face (perpendicular ao eixo) e o sangramento abre canais ou separa a peça.',
    optionFeedback: [
      'Isso. A ferramenta avança ao longo da peça, paralela ao eixo.',
      'Não. O faceamento deixa a face da peça plana, cortando em direção ao centro.',
      'Não. O sangramento abre canais ou separa a peça da barra.'
    ]
  },
  {
    id: 'tor-12',
    topicId: 'torno',
    skillId: 'lathe.operations',
    level: 'Intermediário',
    prompt: 'Para tornear um chanfro curto de 45° na ponta de uma peça, qual parte costuma ser girada no ângulo desejado?',
    options: ['O carro superior (base giratória graduada)', 'O cabeçote móvel', 'A placa universal'],
    correctIndex: 0,
    why: 'A base do carro superior é graduada em graus. Girando-a, a ferramenta avança na inclinação desejada, o que permite chanfros e cones curtos.',
    commonMistake: 'Esquecer de travar a base depois de girar: o ângulo muda durante o corte.'
  },
  ...INDUSTRY_QUESTIONS
];

export const PRACTICE_QUESTIONS_BY_TOPIC: Record<string, PracticeQuestion[]> = PRACTICE_TOPICS.reduce(
  (acc, t) => ({ ...acc, [t.id]: PRACTICE_QUESTIONS.filter((q) => q.topicId === t.id) }),
  {} as Record<string, PracticeQuestion[]>
);

export const PRACTICE_QUESTIONS_BY_ID: Record<string, PracticeQuestion> = PRACTICE_QUESTIONS.reduce(
  (acc, q) => ({ ...acc, [q.id]: q }),
  {} as Record<string, PracticeQuestion>
);

const LEVEL_ORDER: Record<PracticeLevel, number> = { Iniciante: 0, Intermediário: 1, Avançado: 2 };

/**
 * Monta uma sessão curta priorizando: 1) questões nunca respondidas certo; 2) nível mais básico.
 * `exclude` evita repetir as questões da sessão anterior ("Praticar mais 5").
 */
export function buildPracticeSession(options: {
  topicId: string | 'simulado';
  size: number;
  masteredIds?: Set<string>;
  exclude?: Set<string>;
  seed?: number;
}): PracticeQuestion[] {
  const { topicId, size, masteredIds = new Set(), exclude = new Set() } = options;
  let rnd = options.seed ?? Date.now();
  const random = () => {
    rnd = (rnd * 9301 + 49297) % 233280;
    return rnd / 233280;
  };

  if (topicId === 'simulado') {
    const perTopic = Math.max(1, Math.ceil(size / PRACTICE_TOPICS.length));
    const picked = PRACTICE_TOPICS.flatMap((t) =>
      [...(PRACTICE_QUESTIONS_BY_TOPIC[t.id] || [])]
        .filter((q) => !exclude.has(q.id))
        .sort(() => random() - 0.5)
        .slice(0, perTopic)
    );
    return picked.sort(() => random() - 0.5).slice(0, size);
  }

  const pool = (PRACTICE_QUESTIONS_BY_TOPIC[topicId] || []).filter((q) => !exclude.has(q.id));
  const source = pool.length >= size ? pool : PRACTICE_QUESTIONS_BY_TOPIC[topicId] || [];
  return [...source]
    .map((q) => ({ q, r: random() }))
    .sort((a, b) => {
      const ma = masteredIds.has(a.q.id) ? 1 : 0;
      const mb = masteredIds.has(b.q.id) ? 1 : 0;
      if (ma !== mb) return ma - mb;
      if (LEVEL_ORDER[a.q.level] !== LEVEL_ORDER[b.q.level]) return LEVEL_ORDER[a.q.level] - LEVEL_ORDER[b.q.level];
      return a.r - b.r;
    })
    .slice(0, size)
    .map(({ q }) => q);
}
