/**
 * Oficina de Diagnóstico — dados dos casos (sem React). Equipamentos, ordens de serviço e medições são FICTÍCIOS,
 * com valores simulados e coerentes entre si; nenhum valor é limite de norma ou de fabricante. As referências
 * (“registro de comissionamento”, “ronda anterior”) servem só para comparar com o próprio equipamento.
 * Lógica de pontuação: scoring.ts. Testes: tests/e2e/diagnosis.spec.ts.
 */

import type { DiagnosisCaseId } from './meta';

export type TestCategory = 'observacao' | 'medicao' | 'inspecao' | 'registro';

export const CATEGORY_LABEL: Record<TestCategory, string> = {
  observacao: 'Observação em operação',
  medicao: 'Medição',
  inspecao: 'Inspeção com o equipamento parado',
  registro: 'Registros e histórico'
};

/**
 * seguro: pode ser feito como descrito (de fora das proteções, sem contato com partes móveis);
 * bloqueio: só com o equipamento parado e bloqueado (o texto do teste já diz isso);
 * qualificado: feito por profissional autorizado (ex.: medição elétrica, NR-10) — o aluno pede e recebe o resultado;
 * inseguro: não é realizado; mostra o motivo e conta como escolha insegura.
 */
export type TestSafety = 'seguro' | 'bloqueio' | 'qualificado' | 'inseguro';

/** chave: evidência que aponta para a causa; util: ajuda a descartar outras causas; neutro: pouco informa; intrusivo: desmonta sem motivo. */
export type TestRelevance = 'chave' | 'util' | 'neutro' | 'intrusivo';

export interface Reading {
  label: string;
  value: string;
  /** Valor de comparação do próprio equipamento (ex.: ronda anterior). */
  reference?: string;
}

export interface DiagTest {
  id: string;
  label: string;
  category: TestCategory;
  safety: TestSafety;
  relevance: TestRelevance;
  /** Resultado mostrado depois do teste (para inseguro: o motivo de não fazer). */
  result: string;
  readings?: Reading[];
  /** Causas que este resultado reforça / enfraquece. */
  supports?: string[];
  rulesOut?: string[];
}

export interface Cause {
  id: string;
  label: string;
  /** Explicação mostrada no relatório (por que é ou não a causa provável). */
  explanation: string;
  /** Causa relacionada à certa, mas incompleta (vale parte dos pontos). */
  partial?: boolean;
}

export type ActionKind = 'correta' | 'parcial' | 'desnecessaria' | 'incorreta' | 'insegura';

export interface Action {
  id: string;
  label: string;
  kind: ActionKind;
  feedback: string;
}

export interface ActivityDesign {
  objective: string;
  priorKnowledge: string;
  studentAction: string;
  feedback: string;
  successCriteria: string;
  misconception: string;
  safety: string;
  competencies: string[];
}

export interface DiagnosisCase {
  id: DiagnosisCaseId;
  title: string;
  level: 'Iniciante' | 'Intermediário';
  equipment: string;
  /** Ordem de serviço como chega à manutenção. */
  workOrder: { number: string; area: string; requester: string; text: string };
  context: string[];
  initialEvidence: string[];
  tests: DiagTest[];
  causes: Cause[];
  correctCause: string;
  actions: Action[];
  /** O que a inspeção encontraria ao executar a ação certa (desfecho SIMULADO). */
  confirmation: string;
  /** Dicas em três níveis: da mais geral à mais direta, sem dizer a causa. */
  hints: [string, string, string];
  safetyNotes: string[];
  reviewTopics: { label: string; screen: 'micro' | 'practice' | 'lab' | 'industry' | 'machine'; param?: string }[];
  design: ActivityDesign;
}

const LOTO = 'Intervenção real só com o equipamento parado, bloqueado e etiquetado (LOTO), seguindo o procedimento da empresa, a documentação do equipamento e a orientação do instrutor.';

export const DIAGNOSIS_CASES: DiagnosisCase[] = [
  /* ───────────── Caso 1 ───────────── */
  {
    id: 'motor-vibracao',
    title: 'Motor com vibração anormal',
    level: 'Iniciante',
    equipment: 'Conjunto motobomba MB-204 (planta-escola fictícia): motor elétrico de 7,5 kW, acoplamento elástico e bomba centrífuga',
    workOrder: {
      number: 'OS 2026-0412',
      area: 'Utilidades — água de resfriamento',
      requester: 'Operador do turno B',
      text: '“O motor da MB-204 está vibrando mais que o normal desde que voltou da oficina de rebobinamento. Dá para sentir pelo piso.”'
    },
    context: [
      'O motor foi retirado há 10 dias para rebobinamento e reinstalado na semana passada.',
      'A bomba continua entregando a vazão de sempre.',
      'O conjunto pode ser parado no fim do turno, com aviso à operação.'
    ],
    initialEvidence: [
      'Vibração perceptível no piso, mais forte perto do motor.',
      'Começou depois da reinstalação do motor.',
      'Sem alarme de temperatura no painel.'
    ],
    tests: [
      {
        id: 'observar',
        label: 'Observar e ouvir o conjunto em operação, de fora da proteção do acoplamento',
        category: 'observacao',
        safety: 'seguro',
        relevance: 'util',
        result: 'Vibração visível no pé traseiro do motor (lado da ventoinha). Ruído constante, sem estalos nem chiado metálico.',
        supports: ['pe-manco'],
        rulesOut: ['rolamento-motor']
      },
      {
        id: 'vibracao',
        label: 'Medir a vibração nos mancais do motor e da bomba com coletor portátil (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'chave',
        result: 'A vibração subiu muito no motor e pouco na bomba. No motor, a direção horizontal é bem maior que a vertical.',
        readings: [
          { label: 'Motor, lado da ventoinha, horizontal', value: '7,6 mm/s', reference: 'comissionamento: 1,9 mm/s' },
          { label: 'Motor, lado do acoplamento, horizontal', value: '6,8 mm/s', reference: 'comissionamento: 1,7 mm/s' },
          { label: 'Motor, vertical', value: '2,4 mm/s', reference: 'comissionamento: 1,5 mm/s' },
          { label: 'Bomba, lado do acoplamento, horizontal', value: '2,2 mm/s', reference: 'comissionamento: 1,8 mm/s' }
        ],
        supports: ['pe-manco'],
        rulesOut: ['desbalanceamento-bomba']
      },
      {
        id: 'historico',
        label: 'Consultar o registro da reinstalação do motor',
        category: 'registro',
        safety: 'seguro',
        relevance: 'chave',
        result: 'O alinhamento foi feito e registrado com relógio comparador. Não há registro de verificação de pé manco nem de aperto da base com torquímetro.',
        supports: ['pe-manco'],
        rulesOut: ['desalinhamento']
      },
      {
        id: 'base',
        label: 'Com o conjunto parado e bloqueado: verificar o aperto da base e o pé manco (relógio comparador no pé)',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'chave',
        result: 'Um parafuso do pé traseiro estava frouxo. Ao soltar cada pé com o relógio comparador apoiado, o pé traseiro levanta bem mais que os outros: há pé manco.',
        readings: [{ label: 'Levantamento do pé traseiro ao soltar', value: '0,18 mm', reference: 'outros pés: 0,02 mm' }],
        supports: ['pe-manco']
      },
      {
        id: 'alinhamento',
        label: 'Com o conjunto parado e bloqueado: conferir o alinhamento do acoplamento com relógio comparador',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'util',
        result: 'O desalinhamento está dentro do limite da ficha de alinhamento da área e igual ao registrado na reinstalação.',
        rulesOut: ['desalinhamento']
      },
      {
        id: 'elemento',
        label: 'Com o conjunto parado e bloqueado: inspecionar o elemento elástico do acoplamento',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'util',
        result: 'Elemento elástico íntegro, sem trincas e sem pó de borracha embaixo do acoplamento.',
        rulesOut: ['acoplamento-gasto', 'desalinhamento']
      },
      {
        id: 'temperatura',
        label: 'Medir a temperatura dos mancais com termômetro sem contato (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'util',
        result: 'Temperaturas iguais às da ronda anterior.',
        readings: [
          { label: 'Mancal do motor, lado do acoplamento', value: '52 °C', reference: 'ronda anterior: 51 °C' },
          { label: 'Mancal do motor, lado da ventoinha', value: '48 °C', reference: 'ronda anterior: 48 °C' }
        ],
        rulesOut: ['rolamento-motor']
      },
      {
        id: 'corrente',
        label: 'Pedir ao eletricista autorizado a medição da corrente nas três fases',
        category: 'medicao',
        safety: 'qualificado',
        relevance: 'neutro',
        result: 'Medição feita pela equipe elétrica (NR-10): correntes equilibradas e dentro do valor da placa. Não aponta problema elétrico.',
        rulesOut: ['eletrico']
      },
      {
        id: 'mao-eixo',
        label: 'Encostar a mão no acoplamento girando para sentir de onde vem a vibração',
        category: 'observacao',
        safety: 'inseguro',
        relevance: 'neutro',
        result: 'Não faça. Acoplamento e eixo girando agarram luva, roupa e mão em fração de segundo. A vibração se mede com instrumento, nos mancais, de fora da proteção.'
      },
      {
        id: 'tirar-protecao',
        label: 'Retirar a proteção do acoplamento com o motor ligado para olhar melhor',
        category: 'observacao',
        safety: 'inseguro',
        relevance: 'neutro',
        result: 'Não faça. A proteção existe para impedir o contato com partes girando (NR-12). Ela só sai com o conjunto parado e bloqueado.'
      },
      {
        id: 'abrir-bomba',
        label: 'Desmontar a bomba para inspecionar o rotor',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'intrusivo',
        result: 'Rotor em bom estado. Foram horas de trabalho e uma junta nova, e nada nos dados apontava para a bomba: a vibração da bomba quase não mudou.',
        rulesOut: ['desbalanceamento-bomba']
      }
    ],
    causes: [
      {
        id: 'pe-manco',
        label: 'Fixação do motor na base: parafuso frouxo e pé manco',
        explanation: 'Vibração alta só no motor, maior na horizontal, começando logo após a reinstalação, com um pé que levanta ao ser solto: tudo aponta para a fixação.'
      },
      {
        id: 'desalinhamento',
        label: 'Desalinhamento do acoplamento',
        explanation: 'É a suspeita clássica depois de uma troca de motor, mas o alinhamento foi medido, registrado e conferido de novo.',
        partial: true
      },
      { id: 'rolamento-motor', label: 'Rolamento do motor danificado', explanation: 'Rolamento danificado costuma trazer ruído metálico e aquecimento; as temperaturas estão iguais às da ronda anterior.' },
      { id: 'desbalanceamento-bomba', label: 'Desbalanceamento do rotor da bomba', explanation: 'A vibração da bomba quase não mudou; o problema está no motor.' },
      { id: 'acoplamento-gasto', label: 'Elemento elástico do acoplamento gasto', explanation: 'O elemento está íntegro e não há pó de borracha.' },
      { id: 'eletrico', label: 'Defeito elétrico no motor rebobinado', explanation: 'As correntes estão equilibradas; a medição elétrica não aponta problema.' }
    ],
    correctCause: 'pe-manco',
    actions: [
      {
        id: 'corrigir-base',
        label: 'Com o conjunto bloqueado: corrigir o pé manco com calços, apertar a base na sequência e no torque do procedimento, conferir o alinhamento e medir a vibração depois da partida',
        kind: 'correta',
        feedback: 'Corrige a causa e confirma o resultado com medição. O alinhamento é conferido de novo porque mexer nos calços pode alterá-lo.'
      },
      {
        id: 'reapertar',
        label: 'Reapertar o parafuso frouxo e medir a vibração de novo',
        kind: 'parcial',
        feedback: 'Melhora, mas o pé manco continua: apertar um pé torto deforma a carcaça do motor e a vibração tende a voltar.'
      },
      {
        id: 'trocar-rolamentos',
        label: 'Trocar os rolamentos do motor',
        kind: 'desnecessaria',
        feedback: 'Nada indica rolamento danificado (temperatura normal, sem ruído metálico). Gasta peças e tempo sem resolver.'
      },
      {
        id: 'trocar-acoplamento',
        label: 'Trocar o acoplamento completo',
        kind: 'desnecessaria',
        feedback: 'O acoplamento está íntegro e alinhado. A troca não atinge a causa.'
      },
      {
        id: 'apertar-ligado',
        label: 'Reapertar a base com o motor funcionando, para ver a vibração cair na hora',
        kind: 'insegura',
        feedback: 'Trabalhar junto a eixo e acoplamento girando expõe a mão e a ferramenta a partes móveis. Aperto da base só com o conjunto parado e bloqueado.'
      }
    ],
    confirmation:
      'Desfecho simulado: com os calços corretos e a base apertada, a vibração horizontal do motor voltou para perto do valor de comissionamento.',
    hints: [
      'Compare as medições com o próprio equipamento: onde a vibração mudou mais, no motor ou na bomba?',
      'O que foi mexido recentemente? Veja o que o registro da reinstalação diz — e o que ele não diz.',
      'Vibração alta só num lado e maior na horizontal costuma ter a ver com a forma como a máquina está presa. Que verificação mostra isso com o conjunto parado?'
    ],
    safetyNotes: [
      LOTO,
      'Vibração se mede com instrumento, nos pontos de medição dos mancais, de fora das proteções.',
      'Medições elétricas são feitas por profissional autorizado (NR-10).'
    ],
    reviewTopics: [
      { label: 'Máquina interativa: motor, base e acoplamento', screen: 'machine', param: 'pe-manco' },
      { label: 'Missão: acoplamento desalinhado', screen: 'industry', param: 'missao-acoplamento-desalinhado' },
      { label: 'Questões de bombas e acoplamentos', screen: 'practice', param: 'bombas' }
    ],
    design: {
      objective: 'Investigar uma vibração anormal e chegar à causa provável usando medições comparadas e registros, antes de desmontar qualquer coisa.',
      priorKnowledge: 'Partes de um conjunto motobomba; o que é um acoplamento; noção de vibração medida em mm/s.',
      studentAction: 'Escolher testes, ler os resultados, indicar a causa provável com as evidências que a sustentam e escolher a ação.',
      feedback: 'Cada teste mostra o resultado; o relatório explica cada causa descartada e cada ação.',
      successCriteria: `Causa provável certa, ação correta ou parcial, nenhuma ação insegura e nota mínima de 60.`,
      misconception: '“Trocaram o motor e vibrou: é desalinhamento.” A suspeita é boa, mas precisa ser conferida — aqui o alinhamento estava bom.',
      safety: 'Nada de mão em partes girando nem proteção removida com o motor ligado; inspeções internas só com bloqueio.',
      competencies: ['Interpretação de sintomas', 'Diagnóstico de falhas', 'Tomada de decisão baseada em evidências', 'Segurança na manutenção']
    }
  },

  /* ───────────── Caso 2 ───────────── */
  {
    id: 'bomba-vazao-baixa',
    title: 'Bomba centrífuga com vazão reduzida',
    level: 'Intermediário',
    equipment: 'Bomba centrífuga BC-117 (planta-escola fictícia), água industrial, com filtro tipo cesto na sucção',
    workOrder: {
      number: 'OS 2026-0438',
      area: 'Utilidades — água industrial',
      requester: 'Supervisor de produção',
      text: '“A BC-117 não está dando conta: o tanque de distribuição demora muito mais para encher. Às vezes faz um barulho como se tivesse pedra dentro.”'
    },
    context: [
      'Há três semanas houve uma obra na tubulação que alimenta o tanque de sucção.',
      'O plano de manutenção pede limpeza mensal do filtro da sucção.',
      'Há uma bomba reserva que pode assumir enquanto a BC-117 estiver parada.'
    ],
    initialEvidence: [
      'Tempo para encher o tanque de distribuição: bem maior que o habitual.',
      'Ruído intermitente “de cascalho”.',
      'Nenhum vazamento visível em volta da bomba.'
    ],
    tests: [
      {
        id: 'man-succao',
        label: 'Ler o manômetro (vacuômetro) da sucção (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'chave',
        result: 'A pressão na sucção está muito mais baixa (mais vácuo) que no registro normal.',
        readings: [{ label: 'Pressão na sucção', value: '−0,45 bar', reference: 'registro normal: −0,10 bar' }],
        supports: ['filtro-obstruido', 'valvula-succao']
      },
      {
        id: 'man-descarga',
        label: 'Ler o manômetro da descarga (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'util',
        result: 'A pressão de descarga caiu: a bomba está entregando menos.',
        readings: [{ label: 'Pressão na descarga', value: '2,1 bar', reference: 'registro normal: 3,2 bar' }],
        rulesOut: ['valvula-descarga']
      },
      {
        id: 'diferencial',
        label: 'Ler os manômetros antes e depois do filtro da sucção (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'chave',
        result: 'Quase toda a perda de pressão da sucção acontece dentro do filtro.',
        readings: [
          { label: 'Antes do filtro', value: '−0,08 bar' },
          { label: 'Depois do filtro', value: '−0,43 bar', reference: 'diferença normal no filtro limpo: cerca de 0,02 bar' }
        ],
        supports: ['filtro-obstruido'],
        rulesOut: ['valvula-succao', 'nivel-baixo']
      },
      {
        id: 'valvulas',
        label: 'Conferir a posição das válvulas de sucção e de descarga',
        category: 'observacao',
        safety: 'seguro',
        relevance: 'util',
        result: 'As duas estão totalmente abertas, conforme a etiqueta de posição.',
        rulesOut: ['valvula-succao', 'valvula-descarga']
      },
      {
        id: 'nivel',
        label: 'Verificar o nível do tanque de sucção',
        category: 'observacao',
        safety: 'seguro',
        relevance: 'util',
        result: 'Nível normal, bem acima da entrada da tubulação de sucção.',
        rulesOut: ['nivel-baixo']
      },
      {
        id: 'ar',
        label: 'Procurar entrada de ar na sucção (visor, juntas e flanges)',
        category: 'observacao',
        safety: 'seguro',
        relevance: 'util',
        result: 'Visor sem bolhas; juntas e flanges da sucção secos e sem sinais de aspiração de ar.',
        rulesOut: ['entrada-ar']
      },
      {
        id: 'historico',
        label: 'Consultar o histórico de manutenção do filtro',
        category: 'registro',
        safety: 'seguro',
        relevance: 'chave',
        result: 'A última limpeza do filtro foi há quatro meses — o plano pede limpeza mensal. A obra na linha de alimentação foi depois disso.',
        supports: ['filtro-obstruido']
      },
      {
        id: 'corrente',
        label: 'Pedir ao eletricista autorizado a medição da corrente do motor',
        category: 'medicao',
        safety: 'qualificado',
        relevance: 'neutro',
        result: 'Medição feita pela equipe elétrica (NR-10): corrente abaixo do habitual — coerente com a bomba bombeando menos. Não indica a causa.'
      },
      {
        id: 'abrir-filtro-ligado',
        label: 'Abrir a tampa do filtro com a bomba funcionando para ver se está sujo',
        category: 'inspecao',
        safety: 'inseguro',
        relevance: 'neutro',
        result: 'Não faça. A linha está cheia e em funcionamento: abrir o filtro solta água, pode sugar ar para a bomba e expõe a pessoa ao fluido. Filtro se abre com a bomba parada, bloqueada, isolada pelas válvulas e com o trecho drenado.'
      },
      {
        id: 'fechar-descarga',
        label: 'Fechar totalmente a válvula de descarga com a bomba ligada para “testar a pressão máxima”',
        category: 'medicao',
        safety: 'inseguro',
        relevance: 'neutro',
        result: 'Não faça. Bomba centrífuga funcionando com a descarga fechada aquece o líquido dentro da carcaça e pode danificar selo e rolamentos. Testes desse tipo só com procedimento e autorização.'
      },
      {
        id: 'abrir-bomba',
        label: 'Desmontar a bomba para inspecionar o rotor',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'intrusivo',
        result: 'Rotor sem desgaste importante. Desmontar antes de olhar os instrumentos custou tempo e parada sem necessidade.',
        rulesOut: ['rotor-gasto']
      }
    ],
    causes: [
      {
        id: 'filtro-obstruido',
        label: 'Filtro da sucção obstruído',
        explanation: 'Sucção com muito vácuo, perda concentrada dentro do filtro, limpeza atrasada e sujeira trazida pela obra: o filtro restringe a entrada e leva à cavitação (ruído de cascalho).'
      },
      { id: 'valvula-succao', label: 'Válvula de sucção parcialmente fechada', explanation: 'Daria o mesmo vácuo na sucção, mas a válvula está totalmente aberta e a perda está no filtro.', partial: true },
      { id: 'valvula-descarga', label: 'Válvula de descarga estrangulada', explanation: 'A válvula está aberta e a pressão de descarga caiu (com a descarga estrangulada ela subiria).' },
      { id: 'entrada-ar', label: 'Entrada de ar na sucção', explanation: 'Não há bolhas no visor nem sinais nas juntas.' },
      { id: 'nivel-baixo', label: 'Nível baixo no tanque de sucção', explanation: 'O nível está normal e a perda acontece no filtro, não antes dele.' },
      { id: 'rotor-gasto', label: 'Rotor gasto', explanation: 'Rotor gasto reduz a vazão aos poucos, mas não explica o vácuo alto na sucção.' }
    ],
    correctCause: 'filtro-obstruido',
    actions: [
      {
        id: 'limpar-filtro',
        label: 'Passar para a bomba reserva; parar, bloquear e isolar a BC-117 (válvulas fechadas, trecho aliviado e drenado); limpar o cesto; recolocar, partir e conferir os manômetros',
        kind: 'correta',
        feedback: 'Remove a restrição com segurança e confirma pelos manômetros. Vale registrar o atraso e cobrar a limpeza mensal do plano.'
      },
      {
        id: 'so-plano',
        label: 'Só ajustar o plano para limpar o filtro com mais frequência',
        kind: 'parcial',
        feedback: 'Evita que volte a acontecer, mas a bomba continua cavitando hoje. Primeiro corrige, depois ajusta o plano.'
      },
      {
        id: 'trocar-rotor',
        label: 'Trocar o rotor da bomba',
        kind: 'desnecessaria',
        feedback: 'Os dados apontam para a sucção, não para o rotor.'
      },
      {
        id: 'estrangular-descarga',
        label: 'Fechar parcialmente a descarga para “segurar” a cavitação e deixar como está',
        kind: 'incorreta',
        feedback: 'Pode reduzir o ruído, mas diminui ainda mais a vazão e esconde a causa. O filtro continua entupindo.'
      },
      {
        id: 'cesto-pressurizado',
        label: 'Tirar o cesto com a linha pressurizada, fechando só a válvula de sucção',
        kind: 'insegura',
        feedback: 'Com uma válvula só e sem aliviar e drenar o trecho, o fluido sai com pressão ao abrir a tampa. Isolamento completo, alívio e dreno antes de abrir.'
      }
    ],
    confirmation: 'Desfecho simulado: o cesto estava tomado por areia e restos da obra. Depois da limpeza, sucção e descarga voltaram ao registro normal e o ruído sumiu.',
    hints: [
      'A bomba tem dois manômetros. Qual deles mostra a maior diferença em relação ao normal?',
      'Se a sucção está com muito vácuo, algo está restringindo a entrada. Onde pode estar a restrição entre o tanque e a bomba?',
      'Compare as pressões antes e depois de cada componente da sucção. E veja quando cada um recebeu manutenção.'
    ],
    safetyNotes: [
      LOTO,
      'Isolar uma linha com fluido é mais que desligar o motor: fechar as válvulas, aliviar a pressão e drenar o trecho antes de abrir.',
      'Bomba centrífuga não deve funcionar com a descarga fechada.'
    ],
    reviewTopics: [
      { label: 'Máquina interativa: filtro, válvulas e manômetros', screen: 'machine', param: 'filtro-obstruido' },
      { label: 'Laboratório 3D: bomba centrífuga', screen: 'lab', param: 'centrifugal-pump' },
      { label: 'Questões de bombas', screen: 'practice', param: 'bombas' }
    ],
    design: {
      objective: 'Localizar uma restrição na sucção comparando pressões ao longo da linha e usando o histórico de manutenção.',
      priorKnowledge: 'Funcionamento da bomba centrífuga; sucção e descarga; noção de cavitação.',
      studentAction: 'Escolher medições e verificações, indicar a causa com as evidências e escolher a ação de correção.',
      feedback: 'Cada leitura vem com a referência do próprio equipamento; o relatório explica as causas descartadas.',
      successCriteria: 'Causa provável certa, ação correta ou parcial, nenhuma ação insegura e nota mínima de 60.',
      misconception: '“Vazão baixa é rotor gasto ou bomba fraca.” Muitas vezes o problema está no caminho do fluido, antes da bomba.',
      safety: 'Nada de abrir filtro ou flange com a linha pressurizada; descarga fechada com bomba ligada danifica a bomba.',
      competencies: ['Interpretação de sintomas', 'Diagnóstico de falhas', 'Manutenção preventiva', 'Tomada de decisão baseada em evidências']
    }
  },

  /* ───────────── Caso 3 ───────────── */
  {
    id: 'mancal-quente',
    title: 'Mancal com temperatura alta',
    level: 'Intermediário',
    equipment: 'Exaustor EX-305 (planta-escola fictícia): ventilador acionado por correias, eixo em dois mancais de rolamento com graxeira',
    workOrder: {
      number: 'OS 2026-0451',
      area: 'Pintura — exaustão',
      requester: 'Técnico da ronda preditiva',
      text: '“Mancal do lado da polia do EX-305 bem mais quente que na ronda passada. Foi relubrificado ontem.”'
    },
    context: [
      'Ontem foi feita a relubrificação programada dos dois mancais.',
      'O exaustor pode parar por algumas horas no intervalo da produção.',
      'O plano de lubrificação informa o tipo de graxa e a quantidade por mancal, conforme o fabricante.'
    ],
    initialEvidence: [
      'Mancal do lado da polia quente ao termômetro na ronda.',
      'O outro mancal está com a temperatura de sempre.',
      'O exaustor funciona e a exaustão está normal.'
    ],
    tests: [
      {
        id: 'temperatura',
        label: 'Medir a temperatura dos dois mancais com termômetro sem contato (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'chave',
        result: 'Só o mancal do lado da polia subiu.',
        readings: [
          { label: 'Mancal lado da polia', value: '81 °C', reference: 'ronda anterior: 47 °C' },
          { label: 'Mancal lado do rotor', value: '46 °C', reference: 'ronda anterior: 45 °C' }
        ],
        supports: ['excesso-graxa', 'correia-tensa', 'rolamento-danificado']
      },
      {
        id: 'ouvir',
        label: 'Ouvir o mancal com estetoscópio mecânico, de fora da proteção da correia',
        category: 'observacao',
        safety: 'seguro',
        relevance: 'util',
        result: 'Som uniforme, sem batidas, estalos ou chiado metálico.',
        rulesOut: ['rolamento-danificado']
      },
      {
        id: 'vibracao',
        label: 'Medir a vibração nos dois mancais (valores simulados)',
        category: 'medicao',
        safety: 'seguro',
        relevance: 'util',
        result: 'Vibração igual à da última medição nos dois mancais.',
        readings: [{ label: 'Mancal lado da polia', value: '2,0 mm/s', reference: 'última medição: 2,1 mm/s' }],
        rulesOut: ['rolamento-danificado', 'desalinhamento-polias']
      },
      {
        id: 'vedacao',
        label: 'Inspecionar a vedação do mancal quente, por fora',
        category: 'observacao',
        safety: 'seguro',
        relevance: 'chave',
        result: 'Graxa nova, limpa, saindo pela vedação em volta do eixo.',
        supports: ['excesso-graxa'],
        rulesOut: ['falta-graxa']
      },
      {
        id: 'registro',
        label: 'Consultar a ordem de serviço da relubrificação de ontem',
        category: 'registro',
        safety: 'seguro',
        relevance: 'chave',
        result: 'Graxa do tipo correto. Anotação do executante: “completei até a graxa sair pela vedação”. O plano indica uma quantidade bem menor por mancal.',
        supports: ['excesso-graxa'],
        rulesOut: ['graxa-errada']
      },
      {
        id: 'correia',
        label: 'Com o exaustor parado e bloqueado: conferir a tensão e o alinhamento das correias',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'util',
        result: 'Tensão e alinhamento conforme o procedimento; não foram mexidos ontem.',
        rulesOut: ['correia-tensa', 'desalinhamento-polias']
      },
      {
        id: 'mao-mancal',
        label: 'Pôr a mão no mancal com o exaustor funcionando para sentir se está quente',
        category: 'observacao',
        safety: 'inseguro',
        relevance: 'neutro',
        result: 'Não faça. O mancal fica junto da polia e das correias em movimento, e a superfície pode queimar. Temperatura se mede com termômetro sem contato.'
      },
      {
        id: 'tampa-girando',
        label: 'Abrir a tampa do mancal com o eixo girando para tirar a graxa',
        category: 'inspecao',
        safety: 'inseguro',
        relevance: 'neutro',
        result: 'Não faça. Mexer no mancal com o eixo girando expõe as mãos a partes móveis. Só com a máquina parada e bloqueada.'
      },
      {
        id: 'desmontar-mancal',
        label: 'Desmontar o mancal e trocar o rolamento “por garantia”',
        category: 'inspecao',
        safety: 'bloqueio',
        relevance: 'intrusivo',
        result: 'O rolamento estava bom e cheio de graxa. A troca não era necessária: ruído e vibração já mostravam que o rolamento não estava danificado.',
        rulesOut: ['rolamento-danificado']
      }
    ],
    causes: [
      {
        id: 'excesso-graxa',
        label: 'Excesso de graxa no mancal',
        explanation: 'Aquecimento logo depois da relubrificação, só no mancal que recebeu graxa demais, com graxa nova saindo pela vedação e sem ruído ou vibração: o excesso é agitado pelo rolamento e gera calor.'
      },
      { id: 'falta-graxa', label: 'Falta de lubrificação', explanation: 'O mancal acabou de ser relubrificado e há graxa nova saindo pela vedação.' },
      { id: 'graxa-errada', label: 'Graxa incompatível com a especificada', explanation: 'O registro confirma o tipo correto de graxa.' },
      { id: 'rolamento-danificado', label: 'Rolamento danificado', explanation: 'Som uniforme e vibração igual à anterior não combinam com rolamento danificado.' },
      { id: 'correia-tensa', label: 'Correias tensionadas demais', explanation: 'Também aqueceria o mancal do lado da polia, mas a tensão está conforme e não foi mexida.', partial: true },
      { id: 'desalinhamento-polias', label: 'Desalinhamento das polias', explanation: 'Alinhamento conforme e vibração sem alteração.' }
    ],
    correctCause: 'excesso-graxa',
    actions: [
      {
        id: 'retirar-excesso',
        label: 'No intervalo da produção, com o exaustor parado e bloqueado: retirar o excesso de graxa conforme o manual do mancal; partir, acompanhar a temperatura e orientar sobre a quantidade do plano',
        kind: 'correta',
        feedback: 'Atua na causa com segurança e acompanha o resultado. O registro e a orientação evitam que se repita.'
      },
      {
        id: 'acompanhar',
        label: 'Não adicionar mais graxa e acompanhar a temperatura nas próximas rondas',
        kind: 'parcial',
        feedback: 'Às vezes o excesso sai sozinho e a temperatura baixa, mas o mancal segue quente sem garantia. Se não normalizar, é preciso parar e retirar o excesso.'
      },
      {
        id: 'mais-graxa',
        label: 'Aplicar mais graxa para “resfriar” o mancal',
        kind: 'incorreta',
        feedback: 'É o contrário: mais graxa aumenta o calor. O problema é justamente excesso.'
      },
      {
        id: 'trocar-rolamento',
        label: 'Trocar o rolamento',
        kind: 'desnecessaria',
        feedback: 'Ruído e vibração mostram que o rolamento está bom. Trocar não corrige a quantidade de graxa.'
      },
      {
        id: 'limpar-girando',
        label: 'Abrir a tampa e tirar a graxa com o exaustor funcionando, para não parar a pintura',
        kind: 'insegura',
        feedback: 'Mãos e ferramenta junto de eixo, polia e correias em movimento. Parar e bloquear é obrigatório.'
      }
    ],
    confirmation: 'Desfecho simulado: retirado o excesso, a temperatura do mancal voltou para perto da ronda anterior em algumas horas de funcionamento.',
    hints: [
      'O que mudou entre a ronda passada e hoje? Comece pelos registros.',
      'Só um dos dois mancais aqueceu. Compare o que aconteceu com cada um — e veja o que está saindo pela vedação.',
      'Lubrificante também pode ser problema quando a quantidade foge do plano, para mais ou para menos.'
    ],
    safetyNotes: [
      LOTO,
      'Temperatura se mede com termômetro sem contato; superfícies de mancal podem queimar.',
      'Mancal de transmissão por correias fica junto de partes em movimento: nada de mão perto delas com a máquina ligada.'
    ],
    reviewTopics: [
      { label: 'Máquina interativa: mancal e rolamentos', screen: 'machine', param: 'excesso-graxa' },
      { label: 'Missão: ruído no mancal da polia', screen: 'industry', param: 'missao-mancal-ruidoso' },
      { label: 'Questões de rolamentos', screen: 'practice', param: 'rolamentos' }
    ],
    design: {
      objective: 'Relacionar um aquecimento a uma intervenção recente e reconhecer que “mais lubrificante” também é falha.',
      priorKnowledge: 'Função do rolamento e da graxa; leitura de temperatura com termômetro sem contato.',
      studentAction: 'Comparar os dois mancais, ler os registros, indicar a causa com evidências e escolher a ação.',
      feedback: 'Os resultados mostram o que mudou entre as rondas; o relatório explica cada hipótese descartada.',
      successCriteria: 'Causa provável certa, ação correta ou parcial, nenhuma ação insegura e nota mínima de 60.',
      misconception: '“Graxa nunca é demais.” Excesso de graxa aquece o rolamento tanto quanto a falta dela o desgasta.',
      safety: 'Mancal quente e correias em movimento: medir sem contato e intervir só com bloqueio.',
      competencies: ['Interpretação de sintomas', 'Manutenção preventiva', 'Raciocínio técnico', 'Segurança na manutenção']
    }
  }
];

export const DIAGNOSIS_CASES_BY_ID: Record<string, DiagnosisCase> = Object.fromEntries(DIAGNOSIS_CASES.map((c) => [c.id, c]));
