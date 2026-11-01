import type { ActivityLink, SafetyNote } from './industryCatalog';

/**
 * Missões de manutenção da seção "Indústria na prática".
 * Cada missão: objetivo → evidências → tarefas com retorno explicado → conclusão.
 * Todas as situações são SIMULADAS (planta fictícia). Sintomas simulados não são diagnóstico definitivo:
 * as missões ensinam a juntar evidências e a confirmar a causa na inspeção, com a máquina bloqueada.
 */

export type EvidenceKind = 'relato' | 'inspecao' | 'medicao' | 'historico' | 'desenho';

export const EVIDENCE_LABEL: Record<EvidenceKind, string> = {
  relato: 'Relato',
  inspecao: 'Inspeção visual',
  medicao: 'Medição (valores simulados)',
  historico: 'Histórico',
  desenho: 'Desenho técnico'
};

export type FigureId = 'bearing-temp-trend' | 'belt-drift' | 'pump-suction' | 'bearing-drawing' | 'vibration-trend';

export interface Evidence {
  kind: EvidenceKind;
  title: string;
  text: string;
  figure?: FigureId;
}

export interface ChoiceOption {
  text: string;
  correct: boolean;
  feedback: string;
}

export type MissionTask =
  | { id: string; type: 'choice'; skillId: string; prompt: string; options: ChoiceOption[]; why: string }
  | { id: string; type: 'multi'; skillId: string; prompt: string; options: ChoiceOption[]; why: string }
  | { id: string; type: 'order'; skillId: string; prompt: string; /** Na ordem correta; a tela embaralha. */ items: string[]; why: string };

export interface IndustryMission {
  id: string;
  title: string;
  equipmentId: string;
  /** Situação inicial, como chega a ordem de serviço. */
  situation: string;
  objective: string;
  evidence: Evidence[];
  tasks: MissionTask[];
  /** O que a conclusão ensina e o que é diferente na vida real. */
  wrapUp: string;
  realWorld: SafetyNote[];
  next: ActivityLink[];
}

export const MISSION_GAME_PREFIX = 'industria-';

export const INDUSTRY_MISSIONS: IndustryMission[] = [
  {
    id: 'missao-mancal-ruidoso',
    title: 'Ruído no mancal da polia de acionamento',
    equipmentId: 'belt-conveyor',
    situation:
      'Ordem de serviço da Linha de transporte (planta fictícia): "Barulho diferente no transportador, perto do motor, há umas duas semanas. Parece que piorou."',
    objective: 'Juntar evidências sem se expor ao risco, chegar a uma hipótese responsável e planejar a intervenção na ordem segura.',
    evidence: [
      { kind: 'relato', title: 'Operador do turno', text: 'O ruído é um chiado/rangido contínuo, mais forte do lado do acionamento. Não para quando a correia está vazia.' },
      {
        kind: 'medicao',
        title: 'Temperatura dos mancais na ronda semanal',
        text: 'Medida de fora das proteções, com termômetro sem contato. O mancal da polia de acionamento, lado do acoplamento, vem esquentando mais que os outros três semana após semana. Valores simulados, só para comparar a tendência.',
        figure: 'bearing-temp-trend'
      },
      { kind: 'inspecao', title: 'Vedação do mancal', text: 'Há graxa escura, com partículas, saindo pela vedação desse mancal. Nos outros, a graxa que aparece é clara.' },
      { kind: 'historico', title: 'Registro de manutenção', text: 'Na última parada, a área foi lavada com jato de água. Não há registro de relubrificação desse mancal depois disso.' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'safety.workshop',
        prompt: 'O transportador está funcionando. Qual é a sua primeira atitude?',
        options: [
          { text: 'Observar e medir de fora das proteções, sem contato, e combinar uma parada programada', correct: true, feedback: 'Isso: dá para coletar evidências sem chegar perto das partes em movimento.' },
          { text: 'Abrir a proteção do acoplamento para ouvir o mancal mais de perto', correct: false, feedback: 'Proteção só sai com a máquina parada e bloqueada. Chegar perto de acoplamento girando é risco de agarramento.' },
          { text: 'Pôr graxa no mancal com o transportador andando, para ver se o ruído some', correct: false, feedback: 'Além de expor você às partes em movimento, graxa "no escuro" pode esconder o problema e até aquecer mais o mancal.' }
        ],
        why: 'Na vida real, evidência se coleta sem se expor. A intervenção vem depois, com a máquina parada e bloqueada.'
      },
      {
        id: 't2',
        type: 'multi',
        skillId: 'diagnosis.reasoning',
        prompt: 'Marque TODAS as evidências que apontam para um problema de lubrificação ou contaminação no rolamento desse mancal.',
        options: [
          { text: 'Ruído contínuo do lado do acionamento, mesmo com a correia vazia', correct: true, feedback: 'Ruído que não depende da carga sugere algo girando com defeito, como um rolamento.' },
          { text: 'Temperatura subindo mais que a dos mancais iguais', correct: true, feedback: 'A comparação com mancais iguais é a evidência mais forte: mesma função, comportamento diferente.' },
          { text: 'Graxa escura com partículas saindo pela vedação', correct: true, feedback: 'Graxa contaminada é sinal clássico de vedação deixando sujeira ou água entrar.' },
          { text: 'Lavagem com jato de água sem relubrificação depois', correct: true, feedback: 'Água sob pressão pode passar pela vedação e expulsar ou contaminar a graxa.' },
          { text: 'A cor da tinta do mancal está desbotada', correct: false, feedback: 'Aparência da pintura não diz nada sobre o rolamento.' }
        ],
        why: 'Nenhuma evidência sozinha fecha o diagnóstico, mas juntas elas formam uma hipótese forte: contaminação e falta de lubrificação.'
      },
      {
        id: 't3',
        type: 'order',
        skillId: 'safety.loto',
        prompt: 'Coloque a intervenção na ordem segura.',
        items: [
          'Parar o transportador, bloquear as energias e testar a partida',
          'Retirar as proteções fixas do acionamento',
          'Abrir o mancal e inspecionar rolamento, graxa e vedação',
          'Montar, recolocar as proteções e só então liberar o transportador',
          'Registrar o que foi encontrado, as peças trocadas e o responsável'
        ],
        why: 'Bloqueio antes de tudo; proteções voltam antes de liberar; e o registro guarda a causa para a próxima vez (NR-12, item 12.11.2).'
      },
      {
        id: 't4',
        type: 'choice',
        skillId: 'diagnosis.reasoning',
        prompt: 'Qual conclusão você escreve na ordem de serviço ANTES de abrir o mancal?',
        options: [
          { text: 'Hipótese: contaminação e lubrificação deficiente no rolamento do mancal do lado do acoplamento — confirmar na inspeção', correct: true, feedback: 'É a conclusão responsável: aponta a hipótese e deixa claro que a confirmação vem da peça.' },
          { text: 'Rolamento com defeito de fábrica: trocar e encerrar', correct: false, feedback: 'Não há evidência de defeito de fábrica. Trocar sem achar a causa (vedação, lavagem) faz a falha voltar.' },
          { text: 'Ruído normal de transportador: nada a fazer', correct: false, feedback: 'Ruído que piora e temperatura subindo são sinais de degradação, não de normalidade.' }
        ],
        why: 'Sintoma simulado não é diagnóstico definitivo. A causa raiz se confirma com o rolamento e a vedação na mão.'
      }
    ],
    wrapUp:
      'Você separou o que dá para observar com segurança do que exige parada, juntou evidências que se reforçam e escreveu uma hipótese — não um veredito. Se a inspeção confirmar contaminação, trocar só o rolamento não basta: a vedação e a prática de lavagem também precisam mudar.',
    realWorld: [
      { text: 'Intervenção só com a máquina parada e com isolamento e bloqueio das fontes de energia.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } },
      { text: 'Registro da manutenção com intervenção, data, peças trocadas, condições de segurança e responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.2' } },
      { text: 'Tipo de graxa, quantidade e intervalo de relubrificação vêm do fabricante do rolamento e da máquina.', kind: 'boa-pratica' }
    ],
    next: [
      { label: 'Ver os mancais no transportador (3D)', screen: 'lab', param: 'belt-conveyor' },
      { label: 'Desmontar um conjunto de eixo com mancais (3D)', screen: 'lab', param: 'bearing-assembly' }
    ]
  },
  {
    id: 'missao-correia-desalinhada',
    title: 'Correia "correndo" para um lado',
    equipmentId: 'belt-conveyor',
    situation: 'O operador avisa: "A correia está encostando na estrutura do lado de cá, perto da cauda. Já apareceu fio solto na borda."',
    objective: 'Reconhecer as causas mais comuns de desalinhamento de correia e escolher uma correção segura.',
    evidence: [
      { kind: 'inspecao', title: 'Vista de cima (simulada)', text: 'Perto da polia de retorno, a correia se desloca para um lado e raspa na longarina.', figure: 'belt-drift' },
      { kind: 'inspecao', title: 'Rolos de retorno', text: 'O rolo de retorno mais perto da cauda tem material grudado em uma das pontas, formando uma "barriga".' },
      { kind: 'historico', title: 'Última intervenção', text: 'Na semana passada a correia foi tensionada no tensor de parafuso. O registro não diz se os dois lados foram ajustados por igual.' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'safety.workshop',
        prompt: 'Um colega sugere "segurar a correia com uma barra" para ela voltar ao centro enquanto o transportador anda. O que você responde?',
        options: [
          { text: 'Não: nada se ajusta com a correia em movimento. Primeiro parar e bloquear', correct: true, feedback: 'Correto. Ponto de agarramento puxa a barra — e a mão junto.' },
          { text: 'Pode, se for rápido e com luva', correct: false, feedback: 'Luva não protege contra agarramento; pode até ajudar a puxar a mão.' },
          { text: 'Pode, se a velocidade estiver baixa', correct: false, feedback: 'Velocidade baixa não elimina o risco de agarramento entre correia e polia.' }
        ],
        why: 'A NR-12 exige proteção dos pontos de agarramento (item 12.8.1) e bloqueio para intervenções (item 12.11.3).'
      },
      {
        id: 't2',
        type: 'multi',
        skillId: 'conveyor.diagnosis',
        prompt: 'Marque as causas que combinam com as evidências desta ordem de serviço.',
        options: [
          { text: 'Material grudado no rolo de retorno', correct: true, feedback: 'O rolo fica com diâmetro maior de um lado e empurra a correia para o outro.' },
          { text: 'Tensor ajustado de forma desigual, deixando a polia de retorno fora de esquadro', correct: true, feedback: 'Polia torta em relação à linha da correia faz a correia "andar" para um lado.' },
          { text: 'Motor ligado com a tensão elétrica errada', correct: false, feedback: 'Isso afeta o motor, mas não explica a correia se deslocando para um lado só.' },
          { text: 'Excesso de tinta nas proteções', correct: false, feedback: 'Não tem relação com a trajetória da correia.' }
        ],
        why: 'Desalinhamento costuma vir de algo que não está perpendicular à linha da correia (polia, rolo, estrutura) ou que muda o diâmetro de um lado (material grudado).'
      },
      {
        id: 't3',
        type: 'order',
        skillId: 'conveyor.diagnosis',
        prompt: 'Coloque a correção na ordem certa.',
        items: [
          'Parar, bloquear as energias e testar a partida',
          'Limpar o rolo de retorno e a região da cauda',
          'Conferir o esquadro da polia de retorno e igualar o ajuste do tensor nos dois lados',
          'Recolocar as proteções, liberar e observar a correia de fora das proteções'
        ],
        why: 'Tira-se a causa antes de "corrigir no tensor". Ajustar o tensor para compensar sujeira só esconde o problema.'
      },
      {
        id: 't4',
        type: 'choice',
        skillId: 'safety.guards',
        prompt: 'Segundo a NR-12, quando o desalinhamento anormal da correia oferecer risco de acidente, o transportador deve ter:',
        options: [
          { text: 'Dispositivos que interrompam o funcionamento quando os limites de segurança do projeto forem ultrapassados', correct: true, feedback: 'É o que diz o item 12.8.8.' },
          { text: 'Somente uma placa de "cuidado"', correct: false, feedback: 'Sinalização não interrompe o funcionamento.' },
          { text: 'Um operador vigiando o tempo todo', correct: false, feedback: 'A exigência é de dispositivo que interrompa o funcionamento, não de vigilância.' }
        ],
        why: 'NR-12, item 12.8.8 (conferido no texto oficial).'
      }
    ],
    wrapUp:
      'O desalinhamento era um sintoma. As causas prováveis — material grudado e tensor desigual — só são confirmadas e corrigidas com o transportador bloqueado. Depois da correção, a observação é feita de fora das proteções.',
    realWorld: [
      { text: 'Proteção dos pontos de esmagamento, agarramento e aprisionamento dos transportadores contínuos.', kind: 'requisito', ref: { source: 'nr12', item: '12.8.1' } },
      { text: 'Dispositivos que interrompam o funcionamento por desalinhamento ou sobrecarga, quando estes oferecerem risco.', kind: 'requisito', ref: { source: 'nr12', item: '12.8.8' } },
      { text: 'O ajuste fino de alinhamento segue o procedimento do fabricante e da empresa.', kind: 'boa-pratica' }
    ],
    next: [{ label: 'Explorar o transportador e o tensor (3D)', screen: 'lab', param: 'belt-conveyor' }]
  },
  {
    id: 'missao-bomba-cavitando',
    title: 'Bomba com ruído de "pedrinhas" e vazão baixa',
    equipmentId: 'centrifugal-pump',
    situation: 'Estação de bombeamento (planta fictícia): "A bomba de água de resfriamento está fazendo barulho de pedra batendo e o processo reclama de pouca água."',
    objective: 'Relacionar os sintomas com a condição de sucção da bomba e escolher a ação correta.',
    evidence: [
      { kind: 'relato', title: 'Operador', text: 'O barulho parece cascalho dentro da bomba. Começou depois que trocaram o filtro da linha de sucção por um de malha mais fina.' },
      { kind: 'inspecao', title: 'Linha de sucção', text: 'O filtro de sucção está bastante sujo. A válvula da sucção está parcialmente fechada — alguém tentou "regular a vazão" por ela.', figure: 'pump-suction' },
      { kind: 'medicao', title: 'Manômetro da descarga', text: 'A pressão de descarga oscila mais do que o normal registrado para esta bomba (valores simulados).' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'pumps.operation',
        prompt: 'Qual hipótese combina melhor com essas evidências?',
        options: [
          { text: 'Cavitação: a sucção está restringida e a pressão na entrada do rotor fica baixa demais', correct: true, feedback: 'Filtro sujo e válvula de sucção estrangulada reduzem a pressão na entrada: formam-se bolhas que implodem no rotor — o "barulho de pedras".' },
          { text: 'Selo mecânico vazando', correct: false, feedback: 'Vazamento pelo selo aparece como gotejamento no eixo, não como barulho de pedras com vazão baixa.' },
          { text: 'Motor girando rápido demais', correct: false, feedback: 'Nada nas evidências indica mudança de rotação.' }
        ],
        why: 'Cavitação é a hipótese que liga as três evidências. A confirmação vem das condições de sucção e, se a bomba for aberta, das marcas no rotor.'
      },
      {
        id: 't2',
        type: 'multi',
        skillId: 'pumps.operation',
        prompt: 'Marque as ações corretas para tratar a causa.',
        options: [
          { text: 'Abrir totalmente a válvula de sucção', correct: true, feedback: 'A válvula de sucção não serve para regular vazão: deve trabalhar totalmente aberta.' },
          { text: 'Limpar o filtro de sucção (com a bomba parada e bloqueada) e avaliar a malha usada', correct: true, feedback: 'Remove a restrição. A troca da malha precisa ser avaliada com o projeto.' },
          { text: 'Se for preciso regular vazão, fazer isso pela válvula da descarga, conforme o procedimento', correct: true, feedback: 'Regulagem de vazão, quando prevista, é feita na descarga — nunca na sucção.' },
          { text: 'Fechar mais a válvula de sucção para "segurar" o barulho', correct: false, feedback: 'Isso piora a cavitação.' }
        ],
        why: 'Cavitação se combate garantindo boa condição de sucção. Estrangular a sucção é a causa, não a solução.'
      },
      {
        id: 't3',
        type: 'choice',
        skillId: 'pumps.principle',
        prompt: 'Se a cavitação continuar por muito tempo, onde você espera ver o dano ao abrir a bomba?',
        options: [
          { text: 'No rotor, perto da entrada das pás: superfície "comida", com crateras', correct: true, feedback: 'As bolhas implodem ali e arrancam material da superfície.' },
          { text: 'Na pintura da voluta, por fora', correct: false, feedback: 'O dano é interno, onde o líquido passa.' },
          { text: 'Nos parafusos da base', correct: false, feedback: 'Parafusos da base podem soltar por vibração, mas não são o dano típico de cavitação.' }
        ],
        why: 'O rotor é o lugar clássico para observar o dano por cavitação.'
      }
    ],
    wrapUp:
      'O ruído e a vazão baixa eram consequência de uma sucção restringida. Abrir a válvula de sucção e limpar o filtro tratam a causa; a troca da malha do filtro precisa ser avaliada com quem conhece o projeto da instalação.',
    realWorld: [
      { text: 'Limpeza do filtro e qualquer intervenção na bomba só com a bomba parada, isolada, despressurizada e bloqueada.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } },
      { text: 'Condições de sucção, NPSH e regulagem seguem o projeto da instalação e o manual do fabricante.', kind: 'boa-pratica' }
    ],
    next: [
      { label: 'Explorar a bomba centrífuga (3D)', screen: 'lab', param: 'centrifugal-pump' },
      { label: 'Praticar: bombas', screen: 'practice', param: 'bombas' }
    ]
  },
  {
    id: 'missao-ler-desenho',
    title: 'Ler o desenho de conjunto do eixo com mancais',
    equipmentId: 'bearing-assembly',
    situation: 'Você recebeu o desenho de conjunto do eixo com mancais para separar as peças de reposição. Os números nos balões indicam as peças.',
    objective: 'Ligar a representação do desenho às peças reais e entender o papel de cada uma no conjunto.',
    evidence: [
      {
        kind: 'desenho',
        title: 'Desenho de conjunto — corte longitudinal (ilustração educativa, sem cotas)',
        text: 'A metade de cima está em corte: dá para ver dentro das caixas de mancal. Use os balões numerados e a lista de peças.',
        figure: 'bearing-drawing'
      }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'bearings.arrangement',
        prompt: 'No desenho, qual balão aponta o rolamento FIXO?',
        options: [
          { text: 'Balão 4 — rolamento de esferas, do lado da polia', correct: true, feedback: 'Isso. O desenho mostra as esferas em corte e o anel elástico do lado de fora.' },
          { text: 'Balão 5 — rolamento de rolos, do lado do acoplamento', correct: false, feedback: 'Esse é o rolamento LIVRE: repare que o anel interno não tem rebordos.' },
          { text: 'Balão 2 — caixa de mancal', correct: false, feedback: 'A caixa aloja o rolamento, mas não é o rolamento.' }
        ],
        why: 'O rolamento de esferas posiciona o eixo nos dois sentidos axiais: é o fixo.'
      },
      {
        id: 't2',
        type: 'multi',
        skillId: 'bearings.function',
        prompt: 'Quais peças giram junto com o eixo?',
        options: [
          { text: '7 — Polia', correct: true, feedback: 'Presa com chaveta, gira com o eixo.' },
          { text: '8 — Acoplamento', correct: true, feedback: 'Também preso com chaveta.' },
          { text: '6 — Anéis elásticos', correct: true, feedback: 'Ficam nos canais do eixo e giram com ele.' },
          { text: '2 — Caixas de mancal', correct: false, feedback: 'As caixas são fixas na base.' },
          { text: '1 — Base', correct: false, feedback: 'Fixa na estrutura.' }
        ],
        why: 'Separar o que gira do que fica parado ajuda a entender onde estão os rolamentos e as vedações: na fronteira entre os dois.'
      },
      {
        id: 't3',
        type: 'order',
        skillId: 'bearings.mounting',
        prompt: 'Com o eixo na bancada e a polia já retirada, em que ordem as peças saem pelo lado da polia?',
        items: ['Chaveta da polia', 'Vedação do lado da polia', 'Anel elástico', 'Rolamento de esferas'],
        why: 'Sai primeiro o que está mais perto da ponta do eixo. O rolamento é o último porque está encostado no ressalto.'
      }
    ],
    wrapUp:
      'Um desenho de conjunto não é só uma figura: os balões ligam cada forma a uma peça e a lista diz o que ela é. Este desenho é uma ilustração educativa — não tem cotas, tolerâncias nem materiais especificados e não serve para fabricação.',
    realWorld: [
      { text: 'Desenhos de fabricação trazem cotas, tolerâncias e especificações definidas pelo projeto; nunca complete um desenho "de cabeça".', kind: 'boa-pratica' }
    ],
    next: [{ label: 'Comparar com o modelo 3D do conjunto', screen: 'lab', param: 'bearing-assembly' }]
  },
  {
    id: 'missao-ferramenta-certa',
    title: 'Separar as ferramentas para trocar o rolamento',
    equipmentId: 'bearing-assembly',
    situation: 'A inspeção confirmou: o rolamento de esferas do eixo com mancais precisa ser trocado. Você vai separar as ferramentas antes de ir à máquina.',
    objective: 'Escolher a ferramenta adequada para cada etapa e evitar as que danificam peças ou ferem pessoas.',
    evidence: [
      { kind: 'historico', title: 'Ordem de serviço', text: 'Trocar o rolamento fixo (esferas). Reaproveitar polia e acoplamento. Vedações e anel elástico serão novos.' },
      { kind: 'inspecao', title: 'Ferramentaria', text: 'Disponíveis: saca-polias, extrator com placa separadora, alicate para anéis externos, alicate universal, martelo de aço, martelo de face macia, chaves de fenda, aquecedor indutivo, maçarico, bucha de montagem, torquímetro.' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'tools.selection',
        prompt: 'Para retirar a polia do eixo:',
        options: [
          { text: 'Saca-polias apoiado no centro da ponta do eixo', correct: true, feedback: 'Puxa por igual, sem pancadas.' },
          { text: 'Martelo de aço batendo por trás da polia', correct: false, feedback: 'A pancada passa pelo eixo e marca as pistas do rolamento.' },
          { text: 'Duas chaves de fenda como alavanca', correct: false, feedback: 'Puxa torto e pode quebrar a borda da polia.' }
        ],
        why: 'Ferramenta de extração controlada protege o eixo e os rolamentos.'
      },
      {
        id: 't2',
        type: 'choice',
        skillId: 'tools.selection',
        prompt: 'Para retirar o anel elástico do eixo:',
        options: [
          { text: 'Alicate para anéis elásticos EXTERNOS', correct: true, feedback: 'Anel de eixo é externo: o alicate abre o anel pelas orelhas.' },
          { text: 'Alicate para anéis elásticos internos', correct: false, feedback: 'O de internos fecha o anel — serve para anéis de furo.' },
          { text: 'Alicate universal', correct: false, feedback: 'Não abre o anel; só amassa.' }
        ],
        why: 'Anel de eixo (externo) e anel de furo (interno) pedem alicates diferentes.'
      },
      {
        id: 't3',
        type: 'choice',
        skillId: 'bearings.mounting',
        prompt: 'Para extrair o rolamento de esferas do eixo:',
        options: [
          { text: 'Extrator com placa separadora apoiada no anel interno', correct: true, feedback: 'A força passa só pelo anel que tem aperto.' },
          { text: 'Saca-polias com as garras no anel externo', correct: false, feedback: 'A força atravessaria as esferas e marcaria as pistas.' },
          { text: 'Maçarico para dilatar e soltar', correct: false, feedback: 'Chama aquece sem controle; os fabricantes de rolamentos orientam a não usar.' }
        ],
        why: 'Na desmontagem, força pelo anel com aperto; na montagem também.'
      },
      {
        id: 't4',
        type: 'multi',
        skillId: 'bearings.mounting',
        prompt: 'Para MONTAR o rolamento novo no eixo, quais opções são adequadas (conforme o tamanho e o manual do fabricante)?',
        options: [
          { text: 'Aquecedor indutivo com controle de temperatura', correct: true, feedback: 'Dilata o anel interno de forma controlada, sem contato com chama.' },
          { text: 'Bucha de montagem apoiada no anel interno', correct: true, feedback: 'Distribui a força no anel que tem aperto.' },
          { text: 'Martelo de aço batendo no anel externo', correct: false, feedback: 'A força passa pelas esferas e danifica as pistas antes do primeiro giro.' },
          { text: 'Maçarico', correct: false, feedback: 'Chama não tem controle de temperatura e pode alterar o material.' }
        ],
        why: 'Método de montagem, temperatura e ferramenta seguem o manual do fabricante do rolamento.'
      }
    ],
    wrapUp:
      'Ferramenta certa é a que aplica a força no lugar certo: saca-polias no cubo, alicate de anéis nas orelhas, extrator e bucha no anel com aperto. O resto — martelo de aço, alavanca, maçarico — danifica o rolamento antes mesmo de ele girar.',
    realWorld: [
      { text: 'Use óculos de proteção com extratores e anéis elásticos.', kind: 'boa-pratica' },
      { text: 'Temperaturas de aquecimento e métodos de montagem vêm do fabricante do rolamento.', kind: 'boa-pratica' }
    ],
    next: [
      { label: 'Treinar a desmontagem no 3D', screen: 'lab', param: 'bearing-assembly' },
      { label: 'Ver as ferramentas na biblioteca', screen: 'tools', param: 'extrator-rolamentos' }
    ]
  },
  {
    id: 'missao-diafragma-silenciador',
    title: 'Produto saindo pelo silenciador da bomba de diafragma',
    equipmentId: 'diaphragm-pump',
    situation:
      'Ordem de serviço da Estação de bombeamento (planta fictícia): "A bomba de diafragma que transfere o produto de limpeza está pingando produto pelo escape de ar. Começou ontem."',
    objective: 'Reconhecer o sintoma, controlar o risco do produto e do ar comprimido, planejar a troca na ordem segura e ir atrás da causa — não só da peça.',
    evidence: [
      { kind: 'relato', title: 'Operador do turno', text: 'O silenciador está molhado e pingando o mesmo produto que a bomba transfere. A bomba bate de forma irregular.' },
      { kind: 'inspecao', title: 'Ronda, de fora da área de respingo', text: 'Há produto embaixo do silenciador. Os coletores e as bordas das câmaras estão secos, sem vazamento externo.' },
      { kind: 'historico', title: 'Registro de manutenção', text: 'Há dois meses a planta trocou o produto de limpeza por outro, com solvente. Os diafragmas da bomba continuaram os mesmos.' },
      { kind: 'historico', title: 'Registro de manutenção (2)', text: 'É a segunda troca de diafragma desta bomba em pouco tempo. Na primeira, o diafragma retirado estava inchado e mole.' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'safety.energy',
        prompt: 'A bomba continua batendo e pingando produto. O que fazer primeiro?',
        options: [
          { text: 'Parar a bomba fechando o ar, conter o produto derramado com os EPIs indicados na FDS e avisar o responsável', correct: true, feedback: 'Isso: para o vazamento, protege as pessoas do produto e abre a ordem de serviço do jeito certo.' },
          { text: 'Tirar o silenciador com a bomba funcionando para ver de onde vem o produto', correct: false, feedback: 'Com ar e produto sob pressão, você se expõe a respingo e ao escape de ar. Primeiro pare e controle o risco.' },
          { text: 'Deixar funcionando até o fim do turno e colocar um balde embaixo', correct: false, feedback: 'O produto está indo para o ambiente e o diafragma pode romper de vez. É preciso parar.' }
        ],
        why: 'Antes do diagnóstico vem o controle do risco: energia (ar comprimido) e o próprio produto, que pode ser perigoso.'
      },
      {
        id: 't2',
        type: 'multi',
        skillId: 'pumps.diaphragm',
        prompt: 'Marque TODAS as evidências que apontam para falha do diafragma.',
        options: [
          { text: 'Produto saindo pelo silenciador do escape de ar', correct: true, feedback: 'É o sinal clássico: o produto só chega ao lado do ar se o diafragma deixou passar.' },
          { text: 'Sem vazamento externo nos coletores e nas câmaras', correct: true, feedback: 'Ajuda a descartar juntas e coletores: o caminho do produto é interno, pelo diafragma.' },
          { text: 'Bomba batendo de forma irregular', correct: true, feedback: 'Com o diafragma furado, ar e produto se misturam e o curso fica irregular. Sozinho não fecha o diagnóstico, mas reforça.' },
          { text: 'A bomba é pintada de azul', correct: false, feedback: 'A cor não diz nada sobre a falha.' }
        ],
        why: 'Produto no escape é a evidência mais forte; a ausência de vazamento externo e o curso irregular reforçam a hipótese.'
      },
      {
        id: 't3',
        type: 'order',
        skillId: 'safety.loto',
        prompt: 'Coloque a troca dos diafragmas na ordem segura.',
        items: [
          'Fechar e bloquear o ar comprimido e aliviar a pressão do ar',
          'Fechar as linhas de produto, aliviar a descarga e drenar a bomba',
          'Vestir os EPIs indicados na FDS do produto',
          'Retirar coletores e câmaras e trocar os diafragmas pelo material compatível indicado pelo fabricante',
          'Limpar o lado do ar e a válvula de ar, montar com aperto cruzado e recolocar o aterramento',
          'Registrar a falha, o material novo e o motivo da troca'
        ],
        why: 'Energia controlada antes de abrir; produto drenado e EPI antes de tocar nas peças; e o registro explica por que o material mudou.'
      },
      {
        id: 't4',
        type: 'choice',
        skillId: 'diagnosis.reasoning',
        prompt: 'Qual é a conclusão mais responsável sobre a CAUSA?',
        options: [
          { text: 'Hipótese: material do diafragma incompatível com o novo produto — conferir na tabela de compatibilidade do fabricante antes de escolher o diafragma novo', correct: true, feedback: 'É o que explica a repetição: diafragma inchado e mole e falhas desde a troca do produto. Trocar pelo mesmo material faz a falha voltar.' },
          { text: 'Diafragma com defeito de fábrica: trocar por outro igual e encerrar', correct: false, feedback: 'Já é a segunda falha, e começou depois da troca do produto. Peça igual tende a falhar de novo.' },
          { text: 'Pressão do ar alta demais: reduzir o regulador e não mexer no diafragma', correct: false, feedback: 'O diafragma já está furado: precisa ser trocado. E não há evidência de pressão fora do especificado.' }
        ],
        why: 'Falha que se repete pede a causa raiz. Aqui a mudança de produto é a pista mais forte — a confirmação vem da peça retirada e da tabela do fabricante.'
      }
    ],
    wrapUp:
      'Você controlou o risco antes de investigar, reconheceu o sintoma típico de diafragma furado e foi além da troca da peça: se o material não for compatível com o novo produto, a falha volta. Também é preciso limpar o lado do ar, por onde o produto passou.',
    realWorld: [
      { text: 'Intervenção só com a máquina parada e com isolamento e bloqueio das fontes de energia — ar comprimido incluído.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } },
      { text: 'Registro da manutenção com intervenção, data, peças trocadas, condições de segurança e responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.2' } },
      { text: 'Material do diafragma, das esferas e das sedes é escolhido pela tabela de compatibilidade do fabricante para o produto bombeado.', kind: 'boa-pratica' },
      { text: 'EPIs e cuidados com o produto seguem a ficha com dados de segurança (FDS) do fornecedor.', kind: 'boa-pratica' }
    ],
    next: [
      { label: 'Treinar a desmontagem da bomba de diafragma (3D)', screen: 'lab', param: 'diaphragm-pump' },
      { label: 'Praticar: bombas', screen: 'practice', param: 'bombas' }
    ]
  },
  {
    id: 'missao-ronda-vibracao',
    title: 'Ronda de vibração: o que a tendência mostra',
    equipmentId: 'condition-monitoring',
    situation:
      'Rotina da Sala de monitoramento (planta fictícia): "Fechar o relatório semanal da ronda de vibração do acionamento do transportador e dizer o que precisa de atenção."',
    objective: 'Ler uma tendência, separar uma medição suspeita de uma mudança real e decidir a próxima ação sem exagero e sem descaso.',
    evidence: [
      {
        kind: 'medicao',
        title: 'Seis semanas de ronda, quatro pontos',
        text: 'Medições com coletor de vibração, de fora das proteções, nos pontos marcados do motor e do redutor. Valores simulados, em um índice sem unidade: servem só para comparar a tendência.',
        figure: 'vibration-trend'
      },
      { kind: 'historico', title: 'Anotação da semana 3', text: 'Na entrada do redutor, o técnico substituto prendeu o sensor na tampa de inspeção, porque a marcação do ponto estava coberta de tinta.' },
      { kind: 'relato', title: 'Operador', text: 'O transportador trabalhou com a carga de sempre nas seis semanas. Ninguém notou ruído diferente.' },
      { kind: 'inspecao', title: 'Ronda visual', text: 'Sem vazamento de óleo aparente no redutor. O visor de nível não foi conferido nesta ronda.' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'choice',
        skillId: 'diagnosis.reasoning',
        prompt: 'Qual ponto pede atenção primeiro?',
        options: [
          { text: 'Redutor, saída: sobe semana após semana', correct: true, feedback: 'Isso: é uma tendência consistente, medida do mesmo jeito, em um ponto que antes era estável.' },
          { text: 'Redutor, entrada: teve o maior valor do período', correct: false, feedback: 'Foi um valor isolado, e a anotação mostra que ele foi medido em outro lugar. Logo depois voltou ao normal.' },
          { text: 'Nenhum: todos os valores ainda são baixos', correct: false, feedback: 'Os valores são simulados e não há limite definido aqui. O que importa é a mudança: a saída do redutor está piorando.' }
        ],
        why: 'Em monitoramento, a tendência de um ponto medido sempre do mesmo jeito diz mais que um valor isolado.'
      },
      {
        id: 't2',
        type: 'choice',
        skillId: 'maint.routine',
        prompt: 'E o valor alto da entrada do redutor na semana 3?',
        options: [
          { text: 'Tratar como medição não comparável: o sensor estava em outro lugar. Refazer a marcação do ponto e seguir acompanhando', correct: true, feedback: 'Correto: o valor mudou porque o jeito de medir mudou, e os valores seguintes confirmam isso.' },
          { text: 'Parar o transportador e abrir o redutor por causa desse valor', correct: false, feedback: 'Seria agir sobre um dado que não pode ser comparado com os outros, e o ponto voltou ao normal nas semanas seguintes.' },
          { text: 'Apagar o valor do histórico para o gráfico ficar bonito', correct: false, feedback: 'Não se apaga dado: registra-se o motivo (ponto diferente) para quem ler o histórico depois.' }
        ],
        why: 'Só dá para comparar medições feitas no mesmo ponto, do mesmo jeito. Quando isso muda, anota-se, e o valor deixa de entrar na tendência.'
      },
      {
        id: 't3',
        type: 'multi',
        skillId: 'maint.routine',
        prompt: 'Marque TODAS as práticas que deixam as medições comparáveis de uma semana para a outra.',
        options: [
          { text: 'Medir sempre no mesmo ponto marcado e na mesma direção', correct: true, feedback: 'Mudar o ponto muda o valor, como aconteceu na semana 3.' },
          { text: 'Medir com a máquina na mesma condição de trabalho (carga e rotação parecidas)', correct: true, feedback: 'A vibração muda com a carga e a rotação: compare condições parecidas.' },
          { text: 'Usar o mesmo instrumento e a mesma configuração', correct: true, feedback: 'Instrumento e configuração diferentes dão valores diferentes para a mesma máquina.' },
          { text: 'Registrar data, condição da máquina e qualquer desvio na medição', correct: true, feedback: 'É o registro que permitiu entender a semana 3.' },
          { text: 'Tirar a proteção para encostar o sensor mais perto do eixo', correct: false, feedback: 'Medição em operação é feita de fora das proteções, nos pontos previstos. Nunca perto de partes girando.' }
        ],
        why: 'Monitoramento de condição é comparação. Sem medir do mesmo jeito, a tendência perde o sentido.'
      },
      {
        id: 't4',
        type: 'choice',
        skillId: 'maint.types',
        prompt: 'Qual próxima ação você coloca no relatório para a saída do redutor?',
        options: [
          { text: 'Aumentar a frequência das medições nesse ponto e programar inspeção na próxima parada (nível e estado do óleo, ruído, folgas), registrando o motivo', correct: true, feedback: 'É a resposta proporcional: acompanha mais de perto e planeja a inspeção antes que vire quebra.' },
          { text: 'Parar a linha agora e trocar o redutor inteiro', correct: false, feedback: 'Não há evidência de falha iminente nem diagnóstico da causa. Trocar sem investigar custa caro e pode não resolver.' },
          { text: 'Esperar o redutor fazer barulho para agir', correct: false, feedback: 'Aí já é manutenção corretiva. A ideia do monitoramento é agir antes.' }
        ],
        why: 'A tendência indica que algo mudou; a inspeção programada descobre o quê. Limites de alerta e de alarme vêm de normas da série ISO 20816 e do fabricante, não de valores inventados.'
      }
    ],
    wrapUp:
      'Você separou uma medição feita de outro jeito de uma mudança real, escolheu o ponto certo para acompanhar e propôs uma ação proporcional. Na vida real, o monitoramento usa critérios definidos pela empresa a partir de normas e do fabricante, e a causa só é confirmada na inspeção.',
    realWorld: [
      { text: 'Medições com a máquina em operação só de fora das proteções, sem contato com partes em movimento.', kind: 'boa-pratica' },
      { text: 'Critérios de avaliação de vibração (zonas e limites) seguem as normas da série ISO 20816 e as recomendações do fabricante.', kind: 'boa-pratica' },
      { text: 'Registro da manutenção com intervenção, data, condições de segurança e responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.2' } }
    ],
    next: [
      { label: 'Ver o redutor e o motor no transportador (3D)', screen: 'lab', param: 'belt-conveyor' },
      { label: 'Missão: ruído no mancal da polia de acionamento', screen: 'industry', param: 'missao-mancal-ruidoso' }
    ]
  },
  {
    id: 'missao-acoplamento-desalinhado',
    title: 'Elemento elástico gastando depois da troca do motor',
    equipmentId: 'motor-gearbox',
    situation:
      'Ordem de serviço da área de Acionamentos (planta fictícia): "Trocaram o motor do misturador na semana passada. Hoje apareceu pó de borracha embaixo do acoplamento e um barulho novo."',
    objective: 'Relacionar os sintomas a uma causa provável, planejar a correção na ordem segura e evitar que a falha volte.',
    evidence: [
      { kind: 'inspecao', title: 'Ronda, com o conjunto parado e bloqueado', text: 'Pó de borracha embaixo do acoplamento. O elemento elástico, instalado novo junto com o motor, está deformado de um lado só.' },
      { kind: 'historico', title: 'Registro da troca do motor', text: 'O motor novo foi instalado e o acoplamento montado "no olho". Não há registro de medição de alinhamento nem dos calços usados.' },
      { kind: 'relato', title: 'Operador', text: 'O barulho é rítmico, acompanha a rotação, e começou depois da troca do motor. A máquina acionada trabalha normalmente.' },
      { kind: 'medicao', title: 'Temperatura na ronda anterior (valores simulados)', text: 'O mancal dianteiro do motor novo estava mais quente que o traseiro, medido de fora da proteção com termômetro sem contato.' }
    ],
    tasks: [
      {
        id: 't1',
        type: 'multi',
        skillId: 'transmission.drive',
        prompt: 'Marque TODAS as evidências que apontam para desalinhamento entre motor e redutor.',
        options: [
          { text: 'Elemento elástico novo deformado de um lado só', correct: true, feedback: 'Desgaste concentrado de um lado é típico de eixos fora de linha.' },
          { text: 'Montagem "no olho", sem medição de alinhamento', correct: true, feedback: 'Sem medir, não há como saber se os eixos ficaram alinhados.' },
          { text: 'Problema começou logo depois da troca do motor', correct: true, feedback: 'A mudança no sistema é a primeira suspeita.' },
          { text: 'Mancal dianteiro do motor mais quente que o traseiro', correct: true, feedback: 'O desalinhamento carrega mais o rolamento do lado do acoplamento. Sozinho não fecha o diagnóstico, mas reforça.' },
          { text: 'A máquina acionada trabalha normalmente', correct: false, feedback: 'Isso não aponta para desalinhamento — só mostra que o processo ainda funciona.' }
        ],
        why: 'As evidências se reforçam: mudança recente, montagem sem medição, desgaste de um lado e mancal do lado do acoplamento mais quente.'
      },
      {
        id: 't2',
        type: 'choice',
        skillId: 'transmission.drive',
        prompt: 'O que fazer com o elemento elástico?',
        options: [
          { text: 'Trocar o elemento E corrigir o alinhamento, senão o novo gasta de novo', correct: true, feedback: 'Isso: o elemento é a vítima, o desalinhamento é a causa.' },
          { text: 'Só trocar o elemento por um mais duro', correct: false, feedback: 'Um elemento mais duro transmite mais esforço para os rolamentos do motor e do redutor. A causa continua lá.' },
          { text: 'Retirar o elemento e deixar os cubos encostados', correct: false, feedback: 'Isso elimina a parte que absorve choques e pequenos desvios: metal batendo em metal.' }
        ],
        why: 'Trocar só a peça gasta é tratar o sintoma. O acoplamento elástico tolera pequenos desvios, não substitui o alinhamento.'
      },
      {
        id: 't3',
        type: 'order',
        skillId: 'safety.loto',
        prompt: 'Coloque a correção na ordem segura e técnica.',
        items: [
          'Parar, bloquear as energias e testar a partida',
          'Retirar a proteção do acoplamento',
          'Verificar e corrigir pé manco e calços do motor',
          'Medir e corrigir o alinhamento com instrumento (por exemplo, relógio comparador), dentro da tolerância do fabricante do acoplamento',
          'Trocar o elemento elástico, reapertar os pés e medir de novo',
          'Recolocar a proteção, liberar e registrar as medições finais e os calços usados'
        ],
        why: 'Pé manco vem antes do alinhamento: senão o aperto dos pés muda tudo de novo. E o registro das medições é a referência para a próxima vez.'
      },
      {
        id: 't4',
        type: 'choice',
        skillId: 'maint.routine',
        prompt: 'Qual registro evita que esse problema volte numa próxima troca de motor?',
        options: [
          { text: 'Medições finais de alinhamento, calços de cada pé e a tolerância usada, anexados ao histórico do equipamento', correct: true, feedback: 'Com isso, a próxima equipe sabe onde chegar e como chegou.' },
          { text: '"Acoplamento ok" na ordem de serviço', correct: false, feedback: 'Não diz o que foi medido nem o resultado: não ajuda a próxima intervenção.' },
          { text: 'Nenhum: alinhamento é feito uma vez só na instalação', correct: false, feedback: 'Toda troca de motor, redutor ou calço exige novo alinhamento.' }
        ],
        why: 'Registro útil tem dados verificáveis. A NR-12 também pede registro das manutenções com o que foi feito e quem fez (item 12.11.2).'
      }
    ],
    wrapUp:
      'Você ligou o desgaste do elemento elástico à causa — o desalinhamento depois da troca do motor — e planejou a correção completa: pé manco, alinhamento medido, troca do elemento e registro. Os valores de tolerância vêm sempre do fabricante do acoplamento e da máquina.',
    realWorld: [
      { text: 'Intervenção só com a máquina parada e com isolamento e bloqueio das fontes de energia.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.3' } },
      { text: 'Registro da manutenção com intervenção, data, peças trocadas, condições de segurança e responsável.', kind: 'requisito', ref: { source: 'nr12', item: '12.11.2' } },
      { text: 'Tolerâncias de alinhamento e de desalinhamento admissível vêm do fabricante do acoplamento e da máquina.', kind: 'boa-pratica' }
    ],
    next: [
      { label: 'Ver o acoplamento e os rolamentos no 3D', screen: 'lab', param: 'motor-gearbox' },
      { label: 'Ferramenta: relógio comparador', screen: 'tools', param: 'relogio-comparador' }
    ]
  }
];

export const INDUSTRY_MISSIONS_BY_ID: Record<string, IndustryMission> = Object.fromEntries(INDUSTRY_MISSIONS.map((m) => [m.id, m]));
