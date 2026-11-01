/**
 * Máquina interativa — conjunto motobomba (modelo didático em SVG, sem ligação com equipamento real, CLP ou sensores).
 * Fichas dos componentes e falhas SIMULADAS. Sem valores de catálogo: ajustes, torques, folgas e quantidades vêm do
 * fabricante e do procedimento da empresa. Testes: tests/e2e/machine.spec.ts.
 */

export type ComponentState = 'normal' | 'alerta' | 'falha';

export interface KnowledgeCheck {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface MachineComponent {
  id: string;
  name: string;
  function: string;
  principle: string;
  failureModes: string[];
  symptoms: string[];
  inspection: string[];
  preventive: string[];
  safety: string[];
  check: KnowledgeCheck;
}

export interface SimulatedFault {
  id: string;
  label: string;
  description: string;
  states: Record<string, Exclude<ComponentState, 'normal'>>;
  symptoms: string[];
  /** Como investigar, sem dar a resposta pronta. */
  investigate: string;
  link?: { label: string; screen: 'diagnosis' | 'industry' | 'practice'; param?: string };
}

const LOTO = 'Inspeção interna e qualquer ajuste só com o conjunto parado, bloqueado e etiquetado, conforme o procedimento.';

export const COMPONENTS: MachineComponent[] = [
  {
    id: 'motor',
    name: 'Motor elétrico',
    function: 'Transformar energia elétrica em giro no eixo para acionar a bomba.',
    principle: 'O campo magnético girante do estator arrasta o rotor; a rotação depende do número de polos e da frequência da rede.',
    failureModes: ['Rolamentos desgastados', 'Aquecimento por sobrecarga ou ventilação obstruída', 'Problema no enrolamento (assunto da equipe elétrica)'],
    symptoms: ['Vibração', 'Ruído metálico ou zumbido diferente', 'Carcaça mais quente que o normal'],
    inspection: ['Vibração e temperatura nos mancais, de fora da proteção', 'Ventoinha e aletas limpas', 'Fixação dos pés na base'],
    preventive: ['Limpeza das aletas e da tampa da ventoinha', 'Relubrificação dos rolamentos conforme o plano (quando houver graxeira)', 'Registro das medições de vibração e temperatura'],
    safety: ['Partes elétricas só com profissional autorizado (NR-10)', LOTO],
    check: {
      prompt: 'Quem mede a corrente elétrica do motor numa ocorrência?',
      options: ['Um profissional autorizado da equipe elétrica', 'Qualquer pessoa da manutenção mecânica', 'O operador, abrindo a caixa de ligação'],
      correct: 0,
      explanation: 'Medições elétricas envolvem risco de choque e arco elétrico: são feitas por quem é autorizado (NR-10).'
    }
  },
  {
    id: 'base',
    name: 'Base e fixação',
    function: 'Manter motor e bomba presos e alinhados entre si.',
    principle: 'Os pés apoiam por igual numa base plana; os parafusos garantem que nada se mova com a vibração e com o torque.',
    failureModes: ['Parafuso frouxo', 'Pé manco (um pé não apoia por igual)', 'Calços amassados ou sujeira sob o pé'],
    symptoms: ['Vibração maior na direção horizontal', 'Vibração que aparece depois de uma montagem', 'Desalinhamento que volta'],
    inspection: ['Aperto dos parafusos com torquímetro, conforme o procedimento', 'Verificação de pé manco com relógio comparador', 'Estado dos calços'],
    preventive: ['Conferir pé manco sempre que motor ou bomba forem reinstalados', 'Registrar calços e torques usados'],
    safety: [LOTO],
    check: {
      prompt: 'O que é “pé manco”?',
      options: ['Um pé da máquina que não apoia por igual na base', 'Um parafuso de rosca esquerda', 'Uma base pintada com tinta errada'],
      correct: 0,
      explanation: 'Com um pé sem apoio, apertar o parafuso deforma a carcaça e causa vibração e desalinhamento.'
    }
  },
  {
    id: 'acoplamento',
    name: 'Acoplamento elástico',
    function: 'Transmitir o giro do motor para a bomba, absorvendo pequenos desalinhamentos e choques.',
    principle: 'Dois cubos, um em cada eixo, ligados por um elemento elástico que flexiona um pouco.',
    failureModes: ['Elemento elástico gasto ou trincado', 'Desalinhamento entre os eixos', 'Cubo solto no eixo'],
    symptoms: ['Pó de borracha embaixo do acoplamento', 'Batida rítmica que acompanha a rotação', 'Vibração axial ou em duas vezes a rotação'],
    inspection: ['Estado do elemento elástico', 'Alinhamento com relógio comparador ou alinhador a laser', 'Proteção fixada no lugar'],
    preventive: ['Conferir o alinhamento após qualquer troca de motor ou bomba', 'Trocar o elemento elástico no prazo do plano'],
    safety: ['A proteção do acoplamento só sai com o conjunto parado e bloqueado (NR-12)', LOTO],
    check: {
      prompt: 'O acoplamento elástico dispensa o alinhamento dos eixos?',
      options: ['Não: ele tolera pouco desalinhamento, e o excesso gasta o elemento e os rolamentos', 'Sim, a borracha compensa qualquer erro', 'Só em motores pequenos'],
      correct: 0,
      explanation: 'O elemento absorve pequenos erros. Desalinhamento grande gera vibração e desgaste.'
    }
  },
  {
    id: 'eixo',
    name: 'Eixo',
    function: 'Levar o giro do acoplamento até o rotor da bomba, apoiado nos rolamentos.',
    principle: 'Barra de aço usinada que gira apoiada nos mancais; chavetas prendem cubos e rotor.',
    failureModes: ['Empenamento', 'Desgaste nos assentos dos rolamentos', 'Trinca por fadiga'],
    symptoms: ['Vibração em uma vez a rotação', 'Batimento medido com relógio comparador', 'Rolamento girando solto no eixo'],
    inspection: ['Batimento com relógio comparador (equipamento parado)', 'Assentos dos rolamentos na desmontagem'],
    preventive: ['Montagem correta de rolamentos e acoplamento, sem pancadas no eixo'],
    safety: ['Eixo e acoplamento girando prendem roupa e luva: nunca toque com o conjunto ligado'],
    check: {
      prompt: 'Com que instrumento se mede o batimento do eixo?',
      options: ['Relógio comparador', 'Trena', 'Alicate amperímetro'],
      correct: 0,
      explanation: 'O relógio comparador mostra a variação ao girar o eixo devagar, com o conjunto bloqueado.'
    }
  },
  {
    id: 'mancal',
    name: 'Mancal e rolamentos da bomba',
    function: 'Apoiar o eixo da bomba e suportar as cargas, permitindo o giro com pouco atrito.',
    principle: 'Rolamentos de esferas ou rolos dentro de uma caixa lubrificada (graxa ou óleo).',
    failureModes: ['Falta ou excesso de lubrificante', 'Contaminação por água ou sujeira', 'Fadiga das pistas'],
    symptoms: ['Temperatura acima da ronda anterior', 'Ruído metálico ou chiado', 'Vibração crescente'],
    inspection: ['Temperatura com termômetro sem contato', 'Ruído com estetoscópio mecânico', 'Vedações e nível de óleo'],
    preventive: ['Lubrificante e quantidade do plano (do fabricante)', 'Registro de temperatura e vibração nas rondas'],
    safety: ['Medir temperatura sem contato: a superfície pode queimar', LOTO],
    check: {
      prompt: 'Logo depois de uma relubrificação, o mancal esquentou muito. Qual hipótese deve ser investigada?',
      options: ['Excesso de graxa', 'Falta de graxa', 'Rotação baixa demais'],
      correct: 0,
      explanation: 'Graxa demais é agitada pelo rolamento e gera calor. A quantidade certa vem do plano de lubrificação.'
    }
  },
  {
    id: 'selo',
    name: 'Selo mecânico',
    function: 'Vedar a passagem do eixo para fora da carcaça, sem deixar o líquido vazar.',
    principle: 'Duas faces planas e polidas — uma gira com o eixo, outra fica parada — encostadas por mola; um filme fino de líquido lubrifica as faces.',
    failureModes: ['Desgaste das faces', 'Funcionar a seco', 'Vibração excessiva que abre as faces'],
    symptoms: ['Gotejamento no eixo que aumenta com o tempo', 'Faces aquecidas', 'Vazamento depois de cavitação ou vibração'],
    inspection: ['Vazamento visível na saída do eixo, de fora da proteção', 'Registro de partidas a seco'],
    preventive: ['Nunca partir a bomba vazia', 'Corrigir vibração e cavitação, que encurtam a vida do selo'],
    safety: ['Fluido quente ou químico pode respingar: EPI conforme o produto', LOTO],
    check: {
      prompt: 'O que acontece se a bomba funcionar a seco?',
      options: ['As faces do selo aquecem e podem trincar', 'Nada, o selo é feito para isso', 'A bomba fica mais eficiente'],
      correct: 0,
      explanation: 'Sem o filme de líquido as faces do selo esfregam a seco, aquecem e se danificam em pouco tempo.'
    }
  },
  {
    id: 'carcaca',
    name: 'Carcaça e rotor',
    function: 'O rotor gira e dá energia ao líquido; a carcaça (voluta) conduz o líquido até a descarga.',
    principle: 'A força centrífuga empurra o líquido para fora do rotor; a voluta transforma velocidade em pressão.',
    failureModes: ['Desgaste do rotor', 'Erosão por cavitação', 'Obstrução do rotor por corpo estranho'],
    symptoms: ['Queda de vazão e de pressão', 'Ruído de cascalho (cavitação)', 'Vibração'],
    inspection: ['Pressões de sucção e descarga comparadas ao registro', 'Ruído de fora da proteção'],
    preventive: ['Manter a sucção desobstruída e a bomba trabalhando na faixa prevista'],
    safety: ['Abrir a carcaça só com a bomba isolada, aliviada e drenada', LOTO],
    check: {
      prompt: 'Ruído “de cascalho” e vácuo alto na sucção indicam principalmente:',
      options: ['Cavitação por restrição na sucção', 'Selo mecânico gasto', 'Excesso de óleo no mancal'],
      correct: 0,
      explanation: 'Pressão muito baixa na entrada forma bolhas que implodem no rotor: ruído, queda de vazão e erosão.'
    }
  },
  {
    id: 'filtro',
    name: 'Filtro da sucção',
    function: 'Reter sólidos antes que cheguem à bomba.',
    principle: 'Um cesto de tela dentro de um corpo com tampa; o líquido atravessa a tela e a sujeira fica retida.',
    failureModes: ['Cesto entupido', 'Tela rasgada', 'Tampa vazando ar'],
    symptoms: ['Vácuo alto na sucção', 'Queda de vazão', 'Cavitação'],
    inspection: ['Diferença de pressão antes e depois do filtro', 'Data da última limpeza no plano'],
    preventive: ['Limpeza na frequência do plano e após obras na linha'],
    safety: ['Abrir só com a bomba parada, bloqueada, válvulas fechadas, trecho aliviado e drenado'],
    check: {
      prompt: 'Como confirmar, sem abrir, que o filtro está restringindo a sucção?',
      options: ['Comparando a pressão antes e depois do filtro', 'Batendo no filtro com martelo', 'Olhando a cor da tinta do filtro'],
      correct: 0,
      explanation: 'Uma diferença de pressão grande entre a entrada e a saída do filtro mostra que a perda está nele.'
    }
  },
  {
    id: 'valvula-succao',
    name: 'Válvula de sucção',
    function: 'Isolar a bomba do lado da sucção para manutenção.',
    principle: 'Válvula de bloqueio: trabalha totalmente aberta em operação e totalmente fechada no isolamento.',
    failureModes: ['Deixada parcialmente fechada', 'Vedação interna passando'],
    symptoms: ['Vácuo alto na sucção e cavitação (se estrangulada)'],
    inspection: ['Posição conferida com a etiqueta de posição'],
    preventive: ['Não usar a válvula de sucção para regular vazão'],
    safety: ['Faz parte do isolamento: fechada e bloqueada antes de abrir a bomba ou o filtro'],
    check: {
      prompt: 'Pode-se regular a vazão fechando parcialmente a válvula de sucção?',
      options: ['Não: estrangular a sucção provoca cavitação', 'Sim, é o jeito certo', 'Só à noite'],
      correct: 0,
      explanation: 'A sucção precisa estar livre. Se for preciso regular, o procedimento indica como (em geral na descarga).'
    }
  },
  {
    id: 'valvula-descarga',
    name: 'Válvula de descarga',
    function: 'Isolar a bomba do lado da descarga e, conforme o procedimento, ajustar o ponto de operação.',
    principle: 'Válvula na tubulação de saída, depois da bomba.',
    failureModes: ['Fechada com a bomba ligada', 'Vedação passando'],
    symptoms: ['Pressão de descarga alta e vazão quase nula (se fechada)', 'Aquecimento da bomba'],
    inspection: ['Posição da válvula e pressão de descarga'],
    preventive: ['Seguir o procedimento de partida e parada da bomba'],
    safety: ['Bomba centrífuga não deve funcionar com a descarga fechada: aquece o líquido e danifica selo e rolamentos'],
    check: {
      prompt: 'O que acontece com uma bomba centrífuga funcionando com a descarga totalmente fechada?',
      options: ['O líquido aquece dentro da carcaça e pode danificar selo e rolamentos', 'Ela para sozinha', 'A vazão aumenta'],
      correct: 0,
      explanation: 'A energia do motor vira calor no líquido parado dentro da bomba.'
    }
  },
  {
    id: 'manometros',
    name: 'Manômetros',
    function: 'Mostrar a pressão na sucção (vacuômetro ou manovacuômetro) e na descarga.',
    principle: 'Um elemento elástico (tubo de Bourdon) se deforma com a pressão e move o ponteiro.',
    failureModes: ['Ponteiro travado', 'Tomada de pressão entupida', 'Instrumento sem calibração'],
    symptoms: ['Leitura que não muda com a operação', 'Diferença grande em relação a outro instrumento'],
    inspection: ['Comparar com o registro normal do equipamento', 'Validade da calibração'],
    preventive: ['Registrar as pressões na ronda para ter referência'],
    safety: ['Trocar manômetro só com a tomada isolada e aliviada'],
    check: {
      prompt: 'Para que serve registrar as pressões “normais” da bomba?',
      options: ['Para ter referência e perceber quando algo muda', 'Para preencher papel', 'Para calibrar o motor'],
      correct: 0,
      explanation: 'Sem o valor de referência do próprio equipamento, uma leitura isolada diz pouco.'
    }
  }
];

export const COMPONENTS_BY_ID: Record<string, MachineComponent> = Object.fromEntries(COMPONENTS.map((c) => [c.id, c]));

export const FAULTS: SimulatedFault[] = [
  {
    id: 'normal',
    label: 'Condição normal',
    description: 'Conjunto operando como no registro de comissionamento.',
    states: {},
    symptoms: [],
    investigate: 'Explore os componentes: clique em cada um para ver função, falhas típicas e inspeções.'
  },
  {
    id: 'pe-manco',
    label: 'Fixação do motor',
    description: 'Falha simulada: um pé do motor não apoia por igual e o parafuso afrouxou.',
    states: { base: 'falha', motor: 'alerta' },
    symptoms: ['Vibração alta no motor, maior na horizontal', 'Bomba quase sem alteração', 'Começou depois de uma reinstalação'],
    investigate: 'Compare a vibração do motor com a da bomba e confira o que foi feito na última montagem.',
    link: { label: 'Investigar o caso “Motor com vibração anormal”', screen: 'diagnosis', param: 'motor-vibracao' }
  },
  {
    id: 'filtro-obstruido',
    label: 'Sucção restrita',
    description: 'Falha simulada: o cesto do filtro da sucção está entupido.',
    states: { filtro: 'falha', carcaca: 'alerta', manometros: 'alerta' },
    symptoms: ['Vácuo alto na sucção', 'Pressão de descarga e vazão baixas', 'Ruído de cascalho (cavitação)'],
    investigate: 'Siga o caminho do líquido desde o tanque e compare as pressões antes e depois de cada componente.',
    link: { label: 'Investigar o caso “Bomba centrífuga com vazão reduzida”', screen: 'diagnosis', param: 'bomba-vazao-baixa' }
  },
  {
    id: 'excesso-graxa',
    label: 'Mancal aquecendo',
    description: 'Falha simulada: o mancal da bomba recebeu graxa além da quantidade do plano.',
    states: { mancal: 'falha' },
    symptoms: ['Temperatura do mancal bem acima da ronda anterior', 'Graxa nova saindo pela vedação', 'Sem ruído metálico'],
    investigate: 'Compare os mancais entre si e veja o que foi feito no último serviço de lubrificação. O caso da Oficina usa um exaustor, mas o raciocínio é o mesmo.',
    link: { label: 'Investigar o caso “Mancal com temperatura alta”', screen: 'diagnosis', param: 'mancal-quente' }
  },
  {
    id: 'desalinhamento',
    label: 'Eixos desalinhados',
    description: 'Falha simulada: motor e bomba ficaram desalinhados depois de uma troca.',
    states: { acoplamento: 'falha', mancal: 'alerta', motor: 'alerta' },
    symptoms: ['Pó de borracha embaixo do acoplamento', 'Batida rítmica', 'Mancais do lado do acoplamento mais quentes'],
    investigate: 'Inspecione o elemento elástico com o conjunto bloqueado e confira o registro de alinhamento.',
    link: { label: 'Missão: acoplamento desalinhado', screen: 'industry', param: 'missao-acoplamento-desalinhado' }
  },
  {
    id: 'selo-vazando',
    label: 'Vazamento no eixo',
    description: 'Falha simulada: as faces do selo mecânico se desgastaram depois de partidas a seco.',
    states: { selo: 'falha' },
    symptoms: ['Gotejamento na saída do eixo que aumenta com o tempo', 'Junta da carcaça seca'],
    investigate: 'Localize exatamente onde vaza e consulte o histórico de partidas da bomba.',
    link: { label: 'Questões de bombas', screen: 'practice', param: 'bombas' }
  }
];

export const FAULTS_BY_ID: Record<string, SimulatedFault> = Object.fromEntries(FAULTS.map((f) => [f.id, f]));

export const stateOf = (fault: SimulatedFault, componentId: string): ComponentState => fault.states[componentId] ?? 'normal';

/** Componentes cuja pergunta de verificação já foi acertada. */
export const correctChecks = (checks: Record<string, { correct: boolean }>) => COMPONENTS.filter((c) => checks[c.id]?.correct).length;
