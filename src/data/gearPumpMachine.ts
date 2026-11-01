import type { MachineData, MechanicalPart3D } from './mechanicalMachines';

/**
 * Bomba de engrenagens externas (modelo educacional do laboratório 3D).
 * Valores numéricos de folga, aperto, pressão e vazão NÃO são informados: dependem do fabricante.
 * `meshData` só é usado pela vista 2D/GLB; este modelo é procedural (ver models/gearPumpModel.ts).
 */

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

const MANUAL = 'Conforme o manual do fabricante (não informado neste modelo educacional)';

export const GEAR_PUMP_MACHINE: MachineData = {
  id: 'gear-pump',
  name: 'Bomba de engrenagens externas (modelo educacional)',
  subtitle: 'Deslocamento positivo, duas engrenagens de dentes retos, mancais em bloco com buchas',
  category: 'Bombas & Hidráulica',
  difficulty: 'Iniciante',
  specs: [
    { label: 'Tipo', value: 'Bomba de deslocamento positivo, engrenagens externas' },
    { label: 'Engrenagens', value: 'Duas iguais, dentes retos (12 dentes no modelo)' },
    { label: 'Mancais', value: 'Blocos de bronze em "8" com buchas (um de cada lado)' },
    { label: 'Vedação do eixo', value: 'Retentor de lábio no flange dianteiro' },
    { label: 'Pressão, vazão, folgas e apertos', value: 'Conforme o fabricante (não informados no modelo)' }
  ],
  overviewDescription:
    'Duas engrenagens iguais giram engrenadas dentro de um corpo com câmara em forma de "8". Na entrada, os dentes se separam e abrem espaço; o líquido enche os vãos e é levado pela parte de fora, junto à parede do corpo, até a saída. No meio, os dentes engrenados não deixam o líquido voltar. Por isso cada volta desloca um volume quase fixo, e a bomba precisa de válvula de alívio no circuito.',
  safetyRules: [
    'Bloqueio (LOTO): desligar, bloquear com cadeado e etiqueta e testar a partida do motor antes de mexer na bomba.',
    'Pressão residual: aliviar a pressão do circuito (incluindo acumuladores, se houver) antes de soltar mangueiras ou conexões.',
    'Óleo quente: esperar esfriar; recolher o óleo e descartar conforme as regras da empresa.',
    'Nunca fechar totalmente a saída de uma bomba de deslocamento positivo sem válvula de alívio no circuito.'
  ],
  parts: [
    {
      id: 'gp-body',
      name: 'Corpo da bomba',
      technicalName: 'Corpo com câmara em "8", bocais laterais de entrada e saída',
      tag: 'CORPO',
      category: 'structural',
      material: 'Alumínio ou ferro fundido, conforme o fabricante',
      tolerance: 'Folga entre as pontas dos dentes e a câmara: ' + MANUAL,
      simpleDefinition: 'É a peça do meio, com a câmara onde as duas engrenagens giram bem justas.',
      mainFunction: 'Guiar o líquido levado nos vãos dos dentes da entrada até a saída, com a menor folga possível para não deixar voltar.',
      location: 'Entre o flange dianteiro e a tampa traseira. Os bocais ficam nas laterais, na altura do engrenamento.',
      relationshipWithOthers: 'Aloja as engrenagens e os dois mancais em bloco; é fechado pelo flange e pela tampa com os parafusos passantes.',
      typicalFailureModes: 'Riscos na câmara do lado da entrada (contaminação no óleo), desgaste que aumenta a folga e reduz a vazão.',
      practicalExample: 'Uma unidade hidráulica com óleo contaminado mostra a câmara riscada e a bomba "fraca" (vazão baixa).',
      quickCheckQuestion: {
        question: 'Riscos fortes na câmara do corpo costumam indicar o quê?',
        options: ['Partículas no óleo (contaminação)', 'Excesso de pintura', 'Motor girando devagar'],
        correctIndex: 0,
        explanation: 'Partículas duras passam entre os dentes e a parede e riscam a câmara. Filtragem e limpeza do óleo previnem esse desgaste.'
      },
      meshData: mesh(0, 'Fica fixo')
    },
    {
      id: 'gp-front-flange',
      name: 'Flange dianteiro',
      technicalName: 'Flange de montagem com guia de centragem e alojamento do retentor',
      tag: 'FLANGE',
      category: 'structural',
      material: 'Alumínio ou ferro fundido, conforme o fabricante',
      tolerance: 'Guia de centragem usinada: ' + MANUAL,
      simpleDefinition: 'É a "frente" da bomba: a parte que se prende ao motor ou ao suporte.',
      mainFunction: 'Fixar e centralizar a bomba em relação ao motor e alojar o retentor que veda o eixo.',
      location: 'No lado do acionamento, por onde sai o eixo motor.',
      relationshipWithOthers: 'O eixo motor atravessa o flange; o retentor fica alojado nele; os parafusos passantes apertam o conjunto.',
      typicalFailureModes: 'Guia de centragem amassada (desalinhamento), alojamento do retentor riscado (vazamento externo).',
      practicalExample: 'Uma bomba montada com a guia batida fica desalinhada e gasta o acoplamento e as buchas.',
      quickCheckQuestion: {
        question: 'Para que serve a guia de centragem do flange?',
        options: ['Alinhar o eixo da bomba com o eixo do motor', 'Aumentar a vazão', 'Servir de alça para carregar'],
        correctIndex: 0,
        explanation: 'A guia encaixa no suporte do motor e mantém os dois eixos alinhados.'
      },
      meshData: mesh(0, 'Fica fixo')
    },
    {
      id: 'gp-key',
      name: 'Chaveta',
      technicalName: 'Chaveta paralela do eixo motor',
      tag: 'CHAVETA',
      category: 'fastener',
      material: 'Aço',
      tolerance: 'Dimensões conforme o eixo e o acoplamento (norma de chavetas indicada pelo fabricante)',
      simpleDefinition: 'É a pecinha retangular que encaixa no rasgo do eixo e faz o acoplamento girar junto.',
      mainFunction: 'Transmitir o giro do acoplamento para o eixo motor sem escorregar.',
      location: 'No rasgo da ponta do eixo motor, fora da bomba.',
      relationshipWithOthers: 'Liga o eixo motor ao cubo do acoplamento.',
      typicalFailureModes: 'Amassamento ou cisalhamento por sobrecarga ou folga; rasgo alargado.',
      practicalExample: 'Acoplamento que "patina" no eixo depois de uma partida com a bomba travada.',
      quickCheckQuestion: {
        question: 'O que a chaveta faz?',
        options: ['Faz o acoplamento e o eixo girarem juntos', 'Veda o óleo', 'Segura a tampa traseira'],
        correctIndex: 0,
        explanation: 'Ela trava o giro entre eixo e acoplamento.'
      },
      meshData: mesh(1, 'Alicate universal ou punção de latão', '#d1d5db')
    },
    {
      id: 'gp-bolts',
      name: 'Parafusos passantes',
      technicalName: 'Parafusos que atravessam tampa e corpo até o flange (4 no modelo)',
      tag: 'PARAF',
      category: 'fastener',
      material: 'Aço, classe de resistência conforme o fabricante',
      tolerance: 'Aperto em sequência cruzada, com torquímetro: ' + MANUAL,
      simpleDefinition: 'São os parafusos compridos que seguram a tampa, o corpo e o flange juntos.',
      mainFunction: 'Manter o conjunto fechado e as faces encostadas, sem vazamento.',
      location: 'Nos quatro cantos, entrando pela tampa traseira.',
      relationshipWithOthers: 'Atravessam a tampa e o corpo e rosqueiam no flange dianteiro.',
      typicalFailureModes: 'Aperto desigual (vazamento ou travamento), rosca danificada.',
      practicalExample: 'Bomba que fica "dura" de girar depois de montada pode ter aperto desigual na tampa.',
      quickCheckQuestion: {
        question: 'Como se faz o aperto final dos parafusos passantes?',
        options: ['Em sequência cruzada, em etapas, com torquímetro no valor do manual', 'Um de cada vez, já no aperto final', 'Com o máximo de força possível'],
        correctIndex: 0,
        explanation: 'O aperto cruzado em etapas assenta a tampa por igual.'
      },
      meshData: mesh(2, 'Chave combinada ou soquete', '#a7abb1')
    },
    {
      id: 'gp-rear-cover',
      name: 'Tampa traseira',
      technicalName: 'Tampa traseira usinada',
      tag: 'TAMPA',
      category: 'structural',
      material: 'Alumínio ou ferro fundido, conforme o fabricante',
      tolerance: 'Planicidade da face: ' + MANUAL,
      simpleDefinition: 'É a peça que fecha a bomba por trás.',
      mainFunction: 'Fechar a câmara e apoiar o mancal traseiro.',
      location: 'Na traseira da bomba.',
      relationshipWithOthers: 'Encosta no corpo e no mancal traseiro; presa pelos parafusos passantes.',
      typicalFailureModes: 'Face interna riscada pelas engrenagens ou pelo mancal; trinca por pancada.',
      practicalExample: 'Riscos circulares na tampa mostram que algo estava raspando lá dentro.',
      quickCheckQuestion: {
        question: 'Qual ferramenta ajuda a soltar a tampa sem marcar as faces?',
        options: ['Martelo de face macia', 'Chave de fenda como alavanca', 'Martelo de aço'],
        correctIndex: 0,
        explanation: 'A face macia solta a tampa sem amassar nem riscar a superfície de vedação.'
      },
      meshData: mesh(3, 'Martelo de face macia')
    },
    {
      id: 'gp-bearing-rear',
      name: 'Mancal traseiro',
      technicalName: 'Bloco de mancal em "8" com buchas',
      tag: 'MANCAL-T',
      category: 'bearing',
      material: 'Bronze (no modelo); outros materiais conforme o fabricante',
      tolerance: 'Folga das buchas e posição de montagem: ' + MANUAL,
      simpleDefinition: 'É o bloco de bronze que apoia as pontas traseiras dos dois eixos.',
      mainFunction: 'Apoiar os eixos das engrenagens e vedar as faces laterais dos dentes.',
      location: 'Entre as engrenagens e a tampa traseira.',
      relationshipWithOthers: 'Os colos dos eixos giram dentro das buchas; uma face encosta nas engrenagens.',
      typicalFailureModes: 'Buchas ovalizadas, face riscada; montado invertido pode bloquear canais internos.',
      practicalExample: 'Bomba barulhenta e com vazão baixa depois de montada com o mancal girado.',
      quickCheckQuestion: {
        question: 'Por que marcar a posição do mancal antes de retirar?',
        options: ['Para montar de volta na mesma posição e não bloquear canais internos', 'Para saber a cor', 'Não é necessário'],
        correctIndex: 0,
        explanation: 'Muitos mancais têm lado e posição certos; a marca evita montar invertido.'
      },
      meshData: mesh(4, 'Mãos limpas e caneta marcadora', '#b4823f')
    },
    {
      id: 'gp-driven-gear',
      name: 'Engrenagem movida',
      technicalName: 'Engrenagem de dentes retos com eixo curto',
      tag: 'ENG-MOV',
      category: 'transmission',
      material: 'Aço tratado, conforme o fabricante',
      tolerance: 'Largura e folgas: ' + MANUAL,
      simpleDefinition: 'É a engrenagem de baixo. Ela não recebe força do motor: gira porque está engrenada na motora.',
      mainFunction: 'Formar, com a motora, os vãos que levam o líquido e a vedação no engrenamento.',
      location: 'Dentro do corpo, na parte de baixo.',
      relationshipWithOthers: 'Engrenada na motora; os colos do eixo giram nas buchas dos dois mancais.',
      typicalFailureModes: 'Desgaste nas pontas e nas faces dos dentes, colos riscados.',
      practicalExample: 'Pontas dos dentes gastas aumentam o vazamento interno: a bomba aquece o óleo e perde vazão.',
      quickCheckQuestion: {
        question: 'Por que a engrenagem movida gira?',
        options: ['Porque está engrenada na engrenagem motora', 'Porque tem um motor próprio', 'Por causa da pressão do óleo apenas'],
        correctIndex: 0,
        explanation: 'Só a motora recebe o giro do motor; a movida é arrastada pelo engrenamento.'
      },
      meshData: mesh(5, 'Mãos limpas', '#c8ccd2')
    },
    {
      id: 'gp-drive-gear',
      name: 'Engrenagem motora (com eixo)',
      technicalName: 'Engrenagem de dentes retos com eixo motor e rasgo de chaveta',
      tag: 'ENG-MOT',
      category: 'transmission',
      material: 'Aço tratado, conforme o fabricante',
      tolerance: 'Largura e folgas: ' + MANUAL,
      simpleDefinition: 'É a engrenagem de cima, com o eixo comprido que recebe o giro do motor.',
      mainFunction: 'Receber o giro do motor e arrastar a engrenagem movida.',
      location: 'Dentro do corpo, na parte de cima; o eixo sai pelo flange dianteiro.',
      relationshipWithOthers: 'Liga-se ao acoplamento pela chaveta; passa pelo mancal dianteiro e pelo retentor.',
      typicalFailureModes: 'Sulco na região do retentor, rasgo de chaveta alargado, dentes gastos.',
      practicalExample: 'Vazamento pelo eixo que volta logo depois da troca do retentor: o eixo tem sulco na pista do lábio.',
      quickCheckQuestion: {
        question: 'O que verificar no eixo motor antes de montar um retentor novo?',
        options: ['Se há sulco ou risco na região onde o lábio trabalha', 'A cor do eixo', 'Nada, o retentor novo resolve tudo'],
        correctIndex: 0,
        explanation: 'Um sulco no eixo faz o retentor novo vazar.'
      },
      meshData: mesh(6, 'Mãos limpas', '#c8ccd2')
    },
    {
      id: 'gp-bearing-front',
      name: 'Mancal dianteiro',
      technicalName: 'Bloco de mancal em "8" com buchas',
      tag: 'MANCAL-D',
      category: 'bearing',
      material: 'Bronze (no modelo); outros materiais conforme o fabricante',
      tolerance: 'Folga das buchas e posição de montagem: ' + MANUAL,
      simpleDefinition: 'É o bloco de bronze que apoia as pontas dianteiras dos dois eixos.',
      mainFunction: 'Apoiar os eixos e vedar as faces laterais dos dentes do lado do flange.',
      location: 'Entre o flange dianteiro e as engrenagens.',
      relationshipWithOthers: 'O eixo motor passa por ele até o retentor e o acoplamento.',
      typicalFailureModes: 'Buchas gastas, face riscada; montagem invertida.',
      practicalExample: 'Comparar o desgaste dos dois mancais ajuda a achar a causa da falha.',
      quickCheckQuestion: {
        question: 'Como o mancal dianteiro sai do corpo?',
        options: ['Deslizando pela traseira, depois que as engrenagens saem', 'Com marreta pela frente', 'Ele não sai'],
        correctIndex: 0,
        explanation: 'Com as engrenagens fora, o bloco desliza pela câmara.'
      },
      meshData: mesh(7, 'Mãos limpas e caneta marcadora', '#b4823f')
    },
    {
      id: 'gp-shaft-seal',
      name: 'Retentor do eixo',
      technicalName: 'Retentor de lábio com mola',
      tag: 'RETENTOR',
      category: 'sealing',
      material: 'Elastômero com armação metálica (material conforme o óleo e a temperatura)',
      tolerance: 'Medidas e material: ' + MANUAL,
      simpleDefinition: 'É o anel de borracha que impede o óleo de vazar por onde o eixo sai da bomba.',
      mainFunction: 'Vedar o eixo motor girando, com o lábio encostado nele.',
      location: 'No alojamento do flange dianteiro, em volta do eixo motor.',
      relationshipWithOthers: 'O lábio trabalha sobre o eixo motor; a parte externa fica presa no flange.',
      typicalFailureModes: 'Lábio endurecido ou rachado, mola solta, montagem torta, eixo com sulco.',
      practicalExample: 'Gotejamento de óleo pelo eixo da bomba na unidade hidráulica.',
      quickCheckQuestion: {
        question: 'Um retentor retirado pode ser reaproveitado?',
        options: ['Não: troca-se por um novo', 'Sim, sempre', 'Só se lavar com solvente'],
        correctIndex: 0,
        explanation: 'A retirada deforma o retentor. Monte um novo, com o lábio lubrificado e ferramenta de encaixe.'
      },
      meshData: mesh(8, 'Saca-retentor', '#1c1d1f')
    }
  ],
  disassemblySteps: []
};
