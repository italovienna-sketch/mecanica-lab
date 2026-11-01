import type { MechanicalToolProfile } from './mechanicalToolsData';

/**
 * Ferramentas acrescentadas à biblioteca na versão 3.0.
 * Coordenadas `svgX/svgY` dos pontos de interesse seguem o desenho em ToolIllustration2D (viewBox 500 × 220).
 * Sem valores de torque ou resistência: esses números vêm sempre do manual ou do projeto.
 */
export const EXTRA_TOOLS: MechanicalToolProfile[] = [
  {
    id: 'chave-estrela',
    name: 'Chave Estrela (17 × 19 mm)',
    subtitle: 'Dois anéis estriados fechados, de medidas diferentes, com corpo rebaixado',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Aperta e solta porcas e parafusos sextavados abraçando a cabeça por completo. Como o anel é fechado, a chave escorrega menos que a boca aberta quando é preciso fazer força.',
    commonApplications: [
      'Destravar parafusos firmes de tampas, mancais e flanges.',
      'Trabalhar em parafusos rebaixados, graças ao corpo com cotovelo que afasta a mão da peça.',
      'Apertar porcas em locais onde a chave pode ser colocada por cima do parafuso.'
    ],
    selectionCriteria:
      'A medida gravada em cada anel deve ser igual à distância entre faces do sextavado. Confira a norma da cabeça: um M12 pode ter 18 mm (ISO 4017) ou 19 mm (DIN 933). Se só houver acesso lateral, a estrela não entra — use a boca aberta ou um soquete.',
    typicalMistakes: [
      'Usar o anel de medida próxima (ex.: 19 num sextavado de 18): sobra folga e os cantos arredondam.',
      'Empurrar a chave em vez de puxar, arriscando bater a mão se ela escapar.',
      'Emendar um cano no cabo para ganhar alavanca.'
    ],
    safetyNotes: 'Encaixe o anel até o fundo da cabeça antes de fazer força e puxe a chave em sua direção, com o corpo equilibrado.',
    comparison: {
      comparedWith: 'Chave Estrela vs. Chave Combinada',
      differenceExplanation:
        'A combinada tem um anel e uma boca da mesma medida; a estrela tem dois anéis de medidas diferentes. Para destravar aperto firme, as duas funcionam pelo lado do anel.'
    },
    parts: [
      { id: 'anel-17', name: 'Anel estriado de 17 mm', description: 'Doze pontos internos: encaixa no sextavado em mais posições, útil quando há pouco espaço para girar.', svgX: 82, svgY: 110 },
      { id: 'cotovelo', name: 'Corpo com cotovelo', description: 'O desnível afasta os dedos da superfície da peça.', svgX: 250, svgY: 96 },
      { id: 'anel-19', name: 'Anel estriado de 19 mm', description: 'A outra medida. A gravação no corpo indica qual é qual.', svgX: 418, svgY: 110 }
    ],
    knowledgeQuestion: {
      question: 'O parafuso tem cabeça de 18 mm e você só tem uma chave estrela 17 × 19. O que fazer?',
      options: [
        { text: 'Buscar uma chave de 18 mm (estrela, combinada ou soquete).', isCorrect: true, feedback: 'Isso: a medida exata evita arredondar o sextavado.' },
        { text: 'Usar o lado de 19 mm com cuidado.', isCorrect: false, feedback: 'A folga de 1 mm basta para a chave escorregar e arredondar os cantos.' },
        { text: 'Forçar o lado de 17 mm com um martelo.', isCorrect: false, feedback: 'Danifica a ferramenta e o parafuso, e pode lançar lascas.' }
      ]
    }
  },
  {
    id: 'chave-fenda-phillips',
    name: 'Chaves de Fenda e Phillips',
    subtitle: 'Pontas para parafusos de fenda reta (simples) e de fenda cruzada (Phillips)',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose:
      'Aperta e solta parafusos de fenda reta ou cruzada, em geral com pouco esforço: tampas de painéis, proteções leves, conectores e fixações pequenas.',
    commonApplications: [
      'Remover tampas de inspeção presas com parafusos de cabeça com fenda.',
      'Soltar abraçadeiras de mangueira com parafuso sem-fim.',
      'Fixar placas de identificação e suportes leves.'
    ],
    selectionCriteria:
      'Na fenda reta, a ponta deve preencher a largura e a espessura da fenda. Na cruzada, escolha o tamanho da ponta (PH1, PH2, PH3) que encaixa sem folga. Phillips (PH) e Pozidriv (PZ) parecem iguais, mas não são intercambiáveis.',
    typicalMistakes: [
      'Usar ponta menor que a fenda: escorrega e "come" a cabeça do parafuso.',
      'Usar a chave como alavanca ou talhadeira, entortando a ponta.',
      'Segurar a peça na palma da mão enquanto aperta: se a ponta escapar, fura a mão.'
    ],
    safetyNotes:
      'Apoie a peça na bancada ou no torno de bancada, nunca na mão. Serviço em partes energizadas é só para profissional autorizado; ferramentas isoladas para eletricidade têm marcação própria (ex.: 1000 V, IEC 60900).',
    comparison: {
      comparedWith: 'Fenda reta vs. Phillips',
      differenceExplanation:
        'A cruz da Phillips centraliza a ponta, mas tende a "saltar" (cam-out) quando o esforço é grande. Para aperto firme em máquinas, parafusos de sextavado interno ou externo são mais comuns.'
    },
    parts: [
      { id: 'ponta', name: 'Ponta', description: 'Precisa encaixar sem folga na fenda: é ela que transmite o esforço.', svgX: 96, svgY: 110 },
      { id: 'haste', name: 'Haste', description: 'Aço temperado. Não é alavanca: entorta ou quebra.', svgX: 220, svgY: 110 },
      { id: 'cabo', name: 'Cabo', description: 'Formato que dá firmeza à mão. Cabo trincado ou solto: troque a ferramenta.', svgX: 390, svgY: 110 }
    ],
    knowledgeQuestion: {
      question: 'A ponta da chave de fenda está escorregando da cabeça do parafuso. Qual é a causa mais provável?',
      options: [
        { text: 'Ponta de tamanho ou tipo errado para a fenda.', isCorrect: true, feedback: 'Isso: troque pela ponta que preenche a fenda (ou o tipo certo de cruz).' },
        { text: 'Falta de força: é só empurrar mais.', isCorrect: false, feedback: 'Com a ponta errada, mais força só piora o desgaste da cabeça.' },
        { text: 'Precisa bater no cabo com o martelo.', isCorrect: false, feedback: 'Chave de fenda comum não é feita para receber pancadas.' }
      ]
    }
  },
  {
    id: 'alicate-universal',
    name: 'Alicate Universal',
    subtitle: 'Segurar, dobrar e cortar arames finos — não é chave',
    category: 'manuais',
    categoryLabel: 'Ferramentas Manuais',
    purpose: 'Segura e dobra peças pequenas e corta arames de pequeno diâmetro. Não serve para girar porcas e parafusos.',
    commonApplications: [
      'Dobrar e cortar arame de frenagem (travamento) de parafusos.',
      'Segurar uma peça pequena enquanto outra ferramenta trabalha.',
      'Retirar contrapinos depois de endireitar as pernas.'
    ],
    selectionCriteria:
      'Escolha o tamanho que cabe no espaço disponível. Para cortar, respeite o tipo e a espessura de arame indicados pelo fabricante. Para girar fixadores, use chave.',
    typicalMistakes: [
      'Usar o alicate para soltar porcas: os dentes arredondam o sextavado.',
      'Martelar com o alicate.',
      'Cortar arame duro demais e lascar o fio de corte.'
    ],
    safetyNotes: 'Ao cortar arame, segure a ponta solta e use óculos: o pedaço cortado pode voar.',
    comparison: {
      comparedWith: 'Alicate universal vs. chave fixa',
      differenceExplanation: 'O alicate prende por atrito nos dentes e marca a peça; a chave encaixa nas faces e transmite o esforço sem danificar.'
    },
    parts: [
      { id: 'mordentes', name: 'Mordentes serrilhados', description: 'Seguram peças pequenas. Os dentes marcam superfícies acabadas.', svgX: 96, svgY: 110 },
      { id: 'corte', name: 'Corte lateral', description: 'Para arames finos, dentro do limite do fabricante.', svgX: 160, svgY: 110 },
      { id: 'articulacao', name: 'Articulação (rebite)', description: 'Eixo em que as duas metades giram. Limpa e com uma gota de óleo, abre e fecha sem folga; com folga, o corte deixa de fechar no arame.', svgX: 210, svgY: 110 },
      { id: 'cabos', name: 'Cabos', description: 'Revestimento é para conforto; não é isolamento elétrico, salvo quando o alicate é certificado para isso.', svgX: 360, svgY: 110 }
    ],
    knowledgeQuestion: {
      question: 'Uma porca M8 está solta e você não achou a chave. Pode usar o alicate universal?',
      options: [
        { text: 'Não: busque a chave da medida certa. O alicate arredonda o sextavado.', isCorrect: true, feedback: 'Isso: porca arredondada vira um problema bem maior.' },
        { text: 'Sim, se apertar bem os cabos.', isCorrect: false, feedback: 'Quanto mais força, mais os dentes marcam e arredondam a porca.' },
        { text: 'Sim, se usar dois alicates.', isCorrect: false, feedback: 'Continua sem encaixe nas faces.' }
      ]
    }
  },
  {
    id: 'alicate-aneis',
    name: 'Alicate para Anéis Elásticos',
    subtitle: 'Versões para anéis de eixo (externos) e de furo (internos)',
    category: 'manutencao',
    categoryLabel: 'Manutenção Mecânica',
    purpose:
      'Monta e retira anéis elásticos (anéis de retenção) encaixando as pontas nos furos do anel. O modelo para anéis externos abre ao apertar o cabo; o para internos fecha.',
    commonApplications: [
      'Retirar o anel que segura um rolamento ou uma polia no eixo.',
      'Retirar o anel que segura um rolamento dentro de uma caixa (furo).',
      'Montar o anel novo no canal sem deformá-lo.'
    ],
    selectionCriteria:
      'Primeiro identifique o anel: de eixo (externo) ou de furo (interno). Depois escolha a ponta (reta ou a 90°) e o tamanho do alicate compatível com a faixa de diâmetro do anel.',
    typicalMistakes: [
      'Usar chave de fenda para alavancar o anel.',
      'Abrir o anel além do necessário: ele deforma e não deve ser reutilizado.',
      'Usar o alicate de interno num anel externo (ou o contrário).'
    ],
    safetyNotes: 'Use óculos: o anel pode escapar das pontas com força. Mantenha o rosto fora da direção do anel.',
    comparison: {
      comparedWith: 'Externo vs. interno',
      differenceExplanation: 'Anel de eixo precisa ser aberto para passar pelo eixo; anel de furo precisa ser fechado para passar pelo furo. Por isso os alicates trabalham ao contrário um do outro.'
    },
    parts: [
      { id: 'pontas', name: 'Pontas', description: 'Entram nos furos do anel. Pontas gastas ou tortas deixam o anel escapar.', svgX: 92, svgY: 110 },
      { id: 'articulacao', name: 'Articulação e mola', description: 'Define se o alicate abre ou fecha ao apertar o cabo.', svgX: 210, svgY: 110 },
      { id: 'cabos', name: 'Cabos', description: 'Alguns modelos têm batente para limitar a abertura.', svgX: 370, svgY: 110 }
    ],
    knowledgeQuestion: {
      question: 'O anel está no canal de um eixo, segurando uma polia. Qual alicate usar?',
      options: [
        { text: 'Alicate para anéis externos (abre ao apertar).', isCorrect: true, feedback: 'Isso: o anel de eixo precisa abrir para sair.' },
        { text: 'Alicate para anéis internos (fecha ao apertar).', isCorrect: false, feedback: 'Esse é para anéis de furo.' },
        { text: 'Alicate universal.', isCorrect: false, feedback: 'Não segura o anel pelos furos e o deforma.' }
      ]
    }
  },
  {
    id: 'extrator-rolamentos',
    name: 'Extrator de Rolamentos com Placa Separadora',
    subtitle: 'Puxa o rolamento pelo anel interno, sem forçar as esferas',
    category: 'manutencao',
    categoryLabel: 'Manutenção Mecânica',
    purpose:
      'A placa separadora (bipartida) entra atrás do anel interno do rolamento; a ponte com tirantes e o fuso central puxam a placa, e o rolamento sai alinhado com o eixo.',
    commonApplications: [
      'Retirar rolamentos montados com interferência no eixo.',
      'Retirar engrenagens e buchas encostadas num ressalto, onde as garras não alcançam.',
      'Desmontagem quando o rolamento será analisado ou reaproveitado.'
    ],
    selectionCriteria:
      'Escolha a placa pela faixa de diâmetro do eixo e verifique se ela entra atrás do anel interno. A capacidade do extrator deve ser compatível com o esforço; se não sair, pare e reveja o método (aquecimento, extrator hidráulico) conforme o procedimento.',
    typicalMistakes: [
      'Puxar pelo anel externo quando o rolamento será reaproveitado.',
      'Deixar o fuso fora de centro, puxando torto e marcando o eixo.',
      'Aumentar a alavanca do fuso com tubos.'
    ],
    safetyNotes: 'A peça pode soltar de repente: mantenha a mão fora da linha de saída, use óculos e, se possível, cubra o conjunto com uma manta de proteção.',
    comparison: {
      comparedWith: 'Extrator com placa vs. saca-polias de garras',
      differenceExplanation:
        'As garras do saca-polias puxam pela borda da peça; num rolamento, isso costuma ser o anel externo, e o esforço passa pelas esferas. A placa separadora apoia direto no anel interno.'
    },
    parts: [
      { id: 'fuso', name: 'Fuso central', description: 'Apoia no centro do eixo e, ao girar, puxa a ponte.', svgX: 250, svgY: 50 },
      { id: 'ponte', name: 'Ponte e tirantes', description: 'Ligam o fuso à placa separadora.', svgX: 160, svgY: 92 },
      { id: 'placa', name: 'Placa separadora bipartida', description: 'Fechada atrás do anel interno: é por ela que o rolamento é puxado.', svgX: 250, svgY: 158 }
    ],
    knowledgeQuestion: {
      question: 'Por que a placa separadora é preferível às garras para retirar um rolamento que será reaproveitado?',
      options: [
        { text: 'Porque puxa pelo anel interno, sem passar esforço pelas esferas.', isCorrect: true, feedback: 'Isso: as pistas não ficam marcadas.' },
        { text: 'Porque é mais rápida.', isCorrect: false, feedback: 'Nem sempre. A vantagem está no ponto de apoio.' },
        { text: 'Porque dispensa o uso de óculos.', isCorrect: false, feedback: 'A peça pode soltar de repente com qualquer extrator: use óculos.' }
      ]
    }
  },
  {
    id: 'martelo-face-macia',
    name: 'Martelo de Face Macia',
    subtitle: 'Faces de nylon, poliuretano ou borracha para deslocar peças sem marcar',
    category: 'manutencao',
    categoryLabel: 'Manutenção Mecânica',
    purpose:
      'Desloca e assenta peças com ajuste leve (tampas, chavetas, cubos) sem marcar a superfície e sem lançar lascas. Modelos sem rebote têm enchimento interno que reduz o retorno do golpe.',
    commonApplications: [
      'Assentar uma tampa no encaixe depois de colocar os parafusos.',
      'Ajustar a posição de um cubo com folga ou ajuste leve.',
      'Soltar uma tampa colada pela junta, com golpes leves na lateral.'
    ],
    selectionCriteria:
      'Escolha a dureza da face conforme a peça (mais macia para peças delicadas). Para ajustes com interferência, o método costuma ser prensa ou aquecimento, conforme o procedimento — não golpes mais fortes.',
    typicalMistakes: [
      'Bater em talhadeira ou ponteiro com martelo de face macia (o certo é o martelo de aço adequado).',
      'Usar com a face rachada ou solta.',
      'Golpear o anel externo de um rolamento.'
    ],
    safetyNotes: 'Confira se a cabeça está firme no cabo e se as faces estão inteiras. Use óculos e mantenha a outra mão fora da linha do golpe.',
    comparison: {
      comparedWith: 'Face macia vs. martelo de aço',
      differenceExplanation: 'O de aço concentra o impacto e marca a peça; o de face macia distribui o golpe e preserva a superfície.'
    },
    parts: [
      { id: 'face-1', name: 'Face macia', description: 'Substituível em muitos modelos. Face gasta ou rachada: troque.', svgX: 105, svgY: 42 },
      { id: 'cabeca', name: 'Corpo da cabeça', description: 'Pode ter enchimento interno que reduz o rebote.', svgX: 105, svgY: 110 },
      { id: 'cabo', name: 'Cabo', description: 'Deve estar firme na cabeça e sem trincas.', svgX: 330, svgY: 110 }
    ],
    knowledgeQuestion: {
      question: 'Você precisa assentar uma tampa usinada no encaixe sem marcar a superfície. Qual martelo usar?',
      options: [
        { text: 'Martelo de face macia, com golpes leves e alternados.', isCorrect: true, feedback: 'Isso: desloca sem marcar.' },
        { text: 'Martelo de aço direto na tampa.', isCorrect: false, feedback: 'Marca a superfície e pode lascar a peça.' },
        { text: 'Qualquer ferramenta pesada, como uma chave.', isCorrect: false, feedback: 'Chave não é martelo: pode quebrar e ferir.' }
      ]
    }
  }
];
