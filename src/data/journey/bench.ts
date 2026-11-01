import type { BenchDecision } from './meta';

/**
 * Bancada de inspeção (OS-04) e consequências no teste de partida (OS-05).
 *
 * As condições, medidas e efeitos são FICTÍCIOS e didáticos: mostram o raciocínio, não limites reais. O critério
 * de aceitação de cada peça vem do fabricante e do procedimento da empresa. Os aspectos dos defeitos seguem descrições
 * correntes de análise de falhas: cavitação no lado de baixa pressão, perto da entrada da pá; faces do selo com trincas
 * por calor quando faltou líquido; lascamento de pista por fadiga em rolamento.
 * A tolerância do eixo (Ø 25 h6, de 24,987 a 25,000 mm) é a da ISO 286 para essa medida, usada como exercício.
 */

export type BenchPartId = 'rotor' | 'selo' | 'rolamento' | 'eixo' | 'junta';

export const BENCH_ART_STATES = {
  rotor: ['ok', 'cavitacao', 'erosao'],
  selo: ['ok', 'termico', 'riscado'],
  rolamento: ['ok', 'lascamento', 'corrosao'],
  eixo: ['ok', 'desgaste'],
  junta: ['usada']
} as const;

export type BenchArtState = (typeof BENCH_ART_STATES)[BenchPartId][number];

export interface Finding {
  id: string;
  label: string;
  /** Por que esta leitura está errada: aparece quando o aluno a escolhe. */
  why: string;
}

/** Efeito no teste de partida quando a peça volta para a bomba nesse estado (unidades de índice, sem medida real). */
export interface StartupEffect {
  leak?: number;
  vibration?: number;
  temperature?: number;
  flow?: number;
  /** O que o aluno vê e por quê: frase do relatório. */
  note: string;
}

export interface BenchCondition {
  state: BenchArtState;
  /** Achado correto. */
  findingId: string;
  /** O que há para notar, para quem não enxerga a imagem e para o relatório. */
  describe: string;
  /** Zona da imagem onde está a evidência (fração da largura/altura, para a lupa). */
  evidenceAt?: [number, number];
  /** Como a decisão é avaliada depois da partida. */
  decisions: Record<BenchDecision, { grade: 'certo' | 'aceitavel' | 'excesso' | 'perigoso'; why: string; effect?: StartupEffect; cost: number }>;
  /** Leitura do micrômetro (só no eixo). */
  measure?: { mm: number };
}

export interface BenchPart {
  id: BenchPartId;
  name: string;
  /** O que olhar: orientação curta, sem dar a resposta. */
  look: string;
  findings: Finding[];
}

const F_ROTOR: Finding[] = [
  { id: 'sem-dano', label: 'Sem dano aparente', why: 'Olhe de perto a entrada das pás e o lado de trás delas: a lupa ajuda.' },
  { id: 'cavitacao', label: 'Cavitação: furinhos na entrada da pá', why: 'Cavitação deixa aspecto de esponja no lado de baixa pressão, perto da entrada da pá.' },
  { id: 'erosao', label: 'Erosão: pontas das pás gastas', why: 'Erosão por sólidos gasta as bordas de saída, deixando-as finas e arredondadas.' }
];
const F_SELO: Finding[] = [
  { id: 'sem-dano', label: 'Faces lisas, sem marcas', why: 'Passe a lupa pela face inteira, não só pela borda.' },
  { id: 'termico', label: 'Trincas radiais: calor por falta de líquido', why: 'Trincas finas saindo do centro, com cor de queimado, vêm de calor: faltou filme de líquido.' },
  { id: 'riscado', label: 'Riscos circulares: partículas no líquido', why: 'Riscos que acompanham o giro vêm de partículas presas entre as faces.' }
];
const F_ROLAMENTO: Finding[] = [
  { id: 'sem-dano', label: 'Pistas lisas, gira sem aspereza', why: 'Olhe a pista inteira: um dano pequeno já muda a decisão.' },
  { id: 'lascamento', label: 'Lascamento na pista: fadiga', why: 'Lascamento é uma cratera na pista, com material arrancado: a superfície cansou.' },
  { id: 'corrosao', label: 'Manchas de ferrugem: umidade', why: 'Manchas marrons mostram que entrou umidade no mancal.' }
];
const F_EIXO: Finding[] = [
  { id: 'dentro', label: 'Dentro da tolerância', why: 'Leia a medida no micrômetro e compare com 24,987 a 25,000 mm.' },
  { id: 'fora', label: 'Fora da tolerância', why: 'Leia a medida no micrômetro e compare com 24,987 a 25,000 mm.' }
];
const F_JUNTA: Finding[] = [
  { id: 'esmagada', label: 'Marcada pelo aperto: já foi usada', why: 'Mesmo inteira, a junta ficou com a marca da face.' },
  { id: 'nova', label: 'Como nova: pode voltar', why: 'A junta foi comprimida no aperto e perdeu a capacidade de vedar.' }
];

export const BENCH_PARTS: BenchPart[] = [
  { id: 'rotor', name: 'Rotor', look: 'Examine a entrada das pás e as bordas de saída.', findings: F_ROTOR },
  { id: 'selo', name: 'Selo mecânico (face)', look: 'Examine a face de vedação com a lupa.', findings: F_SELO },
  { id: 'rolamento', name: 'Rolamento (lado do acoplamento)', look: 'Examine a pista do anel e gire devagar.', findings: F_ROLAMENTO },
  { id: 'eixo', name: 'Eixo (assento do rolamento)', look: 'Leia o micrômetro e compare com o desenho: Ø 25 h6 (24,987 a 25,000 mm).', findings: F_EIXO },
  { id: 'junta', name: 'Junta da carcaça', look: 'Veja a marca deixada pela face da carcaça.', findings: F_JUNTA }
];

const keep = (note: string) => ({ grade: 'certo' as const, why: note, cost: 0 });
const wasted = (why: string, cost: number) => ({ grade: 'excesso' as const, why, cost });
const fix = (why: string, cost: number) => ({ grade: 'certo' as const, why, cost });

const OK_ROTOR: BenchCondition = {
  state: 'ok',
  findingId: 'sem-dano',
  describe: 'Pás íntegras, bordas de entrada e de saída sem desgaste.',
  decisions: {
    reaproveitar: keep('O rotor está bom: voltar para a bomba é a decisão certa.'),
    recondicionar: wasted('Não há o que recondicionar. O serviço só atrasa a volta da bomba.', 2),
    trocar: wasted('Um rotor bom foi trocado. A bomba funciona, mas a parada custou mais do que precisava.', 4)
  }
};
const CAV_ROTOR: BenchCondition = {
  state: 'cavitacao',
  findingId: 'cavitacao',
  describe: 'Furinhos concentrados perto da entrada das pás, com aspecto de esponja.',
  evidenceAt: [0.57, 0.42],
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'O rotor com pás comidas voltou para a bomba: perde desempenho, desbalanceia e o dano continua.',
      cost: 0,
      effect: { vibration: 2.2, flow: -14, note: 'Rotor com cavitação reaproveitado: vibração acima do esperado e vazão abaixo do esperado.' }
    },
    recondicionar: { grade: 'aceitavel', why: 'Recuperar pode valer se o fabricante e o procedimento permitirem e se o rotor for balanceado depois.', cost: 3, effect: { vibration: 0.5, note: 'Rotor recuperado: desempenho aceitável, vibração um pouco acima da referência.' } },
    trocar: fix('Rotor novo resolve a peça. Falta investigar a sucção: a cavitação foi causada por ela, não pelo rotor.', 4)
  }
};
const ERO_ROTOR: BenchCondition = {
  state: 'erosao',
  findingId: 'erosao',
  describe: 'Bordas de saída das pás finas e arredondadas.',
  evidenceAt: [0.72, 0.28],
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'Com as pontas gastas, o rotor não entrega a pressão esperada.',
      cost: 0,
      effect: { flow: -18, vibration: 0.8, note: 'Rotor gasto reaproveitado: vazão bem abaixo do esperado.' }
    },
    recondicionar: { grade: 'aceitavel', why: 'Só se o fabricante previr e se o rotor for balanceado depois.', cost: 3, effect: { flow: -5, note: 'Rotor recuperado: vazão um pouco abaixo da referência.' } },
    trocar: fix('Rotor novo recupera o desempenho. Vale avisar a operação sobre os sólidos no líquido.', 4)
  }
};

const OK_SELO: BenchCondition = {
  state: 'ok',
  findingId: 'sem-dano',
  describe: 'Faces lisas e espelhadas, sem trincas nem riscos.',
  decisions: {
    reaproveitar: { grade: 'aceitavel', why: 'As faces estão boas, mas muitas empresas trocam o selo sempre que ele é aberto. Siga o procedimento.', cost: 0 },
    recondicionar: wasted('Faces boas não precisam de lapidação.', 2),
    trocar: fix('Selo novo é a conduta comum depois de abrir: as faces perderam o assentamento.', 2)
  }
};
const HOT_SELO: BenchCondition = {
  state: 'termico',
  findingId: 'termico',
  describe: 'Trincas finas saindo do centro da face, com cor de queimado.',
  evidenceAt: [0.62, 0.35],
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'Face trincada não veda: o selo vai vazar logo na partida.',
      cost: 0,
      effect: { leak: 3, temperature: 6, note: 'Selo trincado reaproveitado: vazamento contínuo pela tampa logo na partida.' }
    },
    recondicionar: {
      grade: 'perigoso',
      why: 'Trinca por calor não se resolve com lapidação: ela pode ser mais funda que a superfície.',
      cost: 2,
      effect: { leak: 2, note: 'Selo trincado lapidado: o vazamento voltou em pouco tempo.' }
    },
    trocar: fix('Selo novo. Falta descobrir por que ele funcionou a seco: conferir a escorva e o nível do tanque.', 2)
  }
};
const SCORED_SELO: BenchCondition = {
  state: 'riscado',
  findingId: 'riscado',
  describe: 'Riscos circulares acompanhando o giro da face.',
  evidenceAt: [0.42, 0.55],
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'Os riscos abrem caminho para o líquido entre as faces.',
      cost: 0,
      effect: { leak: 2, note: 'Selo riscado reaproveitado: vazamento pela tampa desde a partida.' }
    },
    recondicionar: { grade: 'aceitavel', why: 'Lapidar pode funcionar em selos reparáveis, quando o fabricante prevê.', cost: 2, effect: { leak: 0.5, note: 'Selo lapidado: gotejamento leve no início, dentro do que dá para acompanhar.' } },
    trocar: fix('Selo novo. Vale conferir de onde vêm as partículas.', 2)
  }
};

const OK_ROL: BenchCondition = {
  state: 'ok',
  findingId: 'sem-dano',
  describe: 'Pistas lisas e brilhantes, giro suave.',
  decisions: {
    reaproveitar: { grade: 'aceitavel', why: 'Está bom. Mas retirar o rolamento com extrator pode danificá-lo, e muitos procedimentos pedem troca.', cost: 0 },
    recondicionar: wasted('Rolamento não se recondiciona na bancada.', 2),
    trocar: fix('Troca preventiva comum depois de sacar o rolamento: é uma peça barata perto de uma nova parada.', 1)
  }
};
const SPALL_ROL: BenchCondition = {
  state: 'lascamento',
  findingId: 'lascamento',
  describe: 'Cratera na pista, com material arrancado.',
  evidenceAt: [0.68, 0.6],
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'O lascamento cresce com o giro: a vibração sobe e o rolamento pode travar.',
      cost: 0,
      effect: { vibration: 3, temperature: 14, note: 'Rolamento lascado reaproveitado: vibração e temperatura do mancal subindo sem estabilizar.' }
    },
    recondicionar: {
      grade: 'perigoso',
      why: 'Não existe recuperação de pista na oficina de manutenção.',
      cost: 2,
      effect: { vibration: 3, temperature: 14, note: 'Rolamento lascado continuou no mancal: vibração e temperatura subindo.' }
    },
    trocar: fix('Rolamento novo, montado pelo anel com aperto.', 1)
  }
};
const RUST_ROL: BenchCondition = {
  state: 'corrosao',
  findingId: 'corrosao',
  describe: 'Manchas marrons na pista: entrou umidade.',
  evidenceAt: [0.34, 0.62],
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'Ferrugem na pista vira ponto de início de lascamento.',
      cost: 0,
      effect: { vibration: 1.6, temperature: 9, note: 'Rolamento corroído reaproveitado: ruído, vibração e temperatura acima do esperado.' }
    },
    recondicionar: { grade: 'perigoso', why: 'Lixar a pista destrói a geometria do rolamento.', cost: 1, effect: { vibration: 2, temperature: 9, note: 'Rolamento lixado: a pista perdeu a forma e a vibração subiu.' } },
    trocar: fix('Rolamento novo. Falta achar por onde a umidade entrou.', 1)
  }
};

const OK_EIXO: BenchCondition = {
  state: 'ok',
  findingId: 'dentro',
  describe: 'O micrômetro lê 24,99 mm: dentro da faixa.',
  measure: { mm: 24.99 },
  decisions: {
    reaproveitar: keep('A medida está dentro da faixa: o eixo volta.'),
    recondicionar: wasted('Nada a recuperar: a medida está dentro da faixa.', 3),
    trocar: wasted('Eixo bom trocado: custo e prazo sem necessidade.', 5)
  }
};
const WORN_EIXO: BenchCondition = {
  state: 'desgaste',
  findingId: 'fora',
  describe: 'O micrômetro lê 24,96 mm: abaixo do limite de 24,987 mm.',
  measure: { mm: 24.96 },
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'Com assento abaixo da medida, o anel interno perde o aperto e gira no eixo.',
      cost: 0,
      effect: { vibration: 2.4, temperature: 10, note: 'Eixo fora da medida reaproveitado: anel girando no assento, vibração e temperatura subindo.' }
    },
    recondicionar: { grade: 'aceitavel', why: 'Recuperar o assento é possível quando há procedimento e retífica depois da solda ou da metalização.', cost: 3 },
    trocar: fix('Eixo novo garante o assento. Custa mais que recuperar, mas evita risco.', 5)
  }
};

const JUNTA: BenchCondition = {
  state: 'usada',
  findingId: 'esmagada',
  describe: 'A junta tem a marca da face da carcaça: já foi comprimida.',
  decisions: {
    reaproveitar: {
      grade: 'perigoso',
      why: 'Junta usada já foi esmagada e não veda de novo.',
      cost: 0,
      effect: { leak: 1.5, note: 'Junta usada reaproveitada: gotejamento na união da carcaça.' }
    },
    recondicionar: { grade: 'perigoso', why: 'Não existe recondicionar junta.', cost: 0, effect: { leak: 1.5, note: 'Junta usada voltou para a bomba: gotejamento na união da carcaça.' } },
    trocar: fix('Junta nova: sempre.', 1)
  }
};

export interface BenchVariant {
  id: number;
  /** O chamado que acompanha as peças. */
  report: string;
  parts: Record<BenchPartId, BenchCondition>;
}

/**
 * Lotes de peças: cada tentativa recebe o próximo. Assim, repetir exige olhar de novo em vez de decorar.
 * O relato da operação combina com as peças, como numa oficina de verdade.
 */
export const BENCH_VARIANTS: BenchVariant[] = [
  {
    id: 0,
    report: 'Operação relata: ruído de “pedrinhas” quando a vazão é alta e gotejamento na tampa. O filtro da sucção estava sujo.',
    parts: { rotor: CAV_ROTOR, selo: SCORED_SELO, rolamento: OK_ROL, eixo: OK_EIXO, junta: JUNTA }
  },
  {
    id: 1,
    report: 'Operação relata: ruído agudo no mancal, que foi piorando em algumas semanas, e temperatura alta na caixa do rolamento.',
    parts: { rotor: OK_ROTOR, selo: OK_SELO, rolamento: SPALL_ROL, eixo: WORN_EIXO, junta: JUNTA }
  },
  {
    id: 2,
    report: 'Operação relata: a bomba perdeu escorva duas vezes no mês, o selo passou a vazar e entrou água no mancal na última lavagem da área.',
    parts: { rotor: ERO_ROTOR, selo: HOT_SELO, rolamento: RUST_ROL, eixo: OK_EIXO, junta: JUNTA }
  }
];

export const benchVariantFor = (attempts: number) => BENCH_VARIANTS[attempts % BENCH_VARIANTS.length];

export interface StartupOutcome {
  leak: number;
  vibration: number;
  temperature: number;
  flow: number;
  healthy: boolean;
  notes: string[];
  /** Parada e peças além do necessário, em unidades relativas (não é preço real). */
  cost: number;
  wasted: string[];
}

/** Referências de partida (índices simulados): é o que o painel mostra como “esperado”. */
export const STARTUP_BASE = { leak: 0, vibration: 2, temperature: 52, flow: 100 };
export const STARTUP_LIMITS = { leak: 0.6, vibration: 3, temperature: 60, flow: 92 };

/** Junta o efeito de cada peça. Função pura: as mesmas decisões dão sempre o mesmo resultado. */
export function startupOutcome(variant: BenchVariant, decisions: Record<string, BenchDecision>): StartupOutcome {
  const o: StartupOutcome = { ...STARTUP_BASE, healthy: true, notes: [], cost: 0, wasted: [] };
  (Object.keys(variant.parts) as BenchPartId[]).forEach((id) => {
    const choice = decisions[id] ?? 'reaproveitar';
    const d = variant.parts[id].decisions[choice];
    o.cost += d.cost;
    if (d.grade === 'excesso') o.wasted.push(d.why);
    const e = d.effect;
    if (!e) return;
    o.leak += e.leak ?? 0;
    o.vibration += e.vibration ?? 0;
    o.temperature += e.temperature ?? 0;
    o.flow += e.flow ?? 0;
    o.notes.push(e.note);
  });
  o.healthy = o.leak <= STARTUP_LIMITS.leak && o.vibration <= STARTUP_LIMITS.vibration && o.temperature <= STARTUP_LIMITS.temperature && o.flow >= STARTUP_LIMITS.flow;
  return o;
}

/** Curva de um indicador ao longo do teste: parte da condição de repouso e se aproxima do valor final. */
export function trend(final: number, start: number, n = 24): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return start + (final - start) * (1 - Math.exp(-3.2 * t));
  });
}

/** Devolução para operação: cada passo diz do que depende. Há mais de uma ordem certa; a lógica é a de pré-requisitos. */
export interface SequenceItem {
  id: string;
  label: string;
  after: string[];
  /** Por que não dá para fazer antes do que falta. */
  tooEarly: string;
}

export const RETURN_SEQUENCE: SequenceItem[] = [
  { id: 'girar', label: 'Girar o eixo à mão: deve girar livre, sem raspar', after: [], tooEarly: '' },
  {
    id: 'sentido',
    label: 'Conferir o sentido de giro do motor, antes de montar o espaçador, com liberação controlada pelo responsável',
    after: ['girar'],
    tooEarly: 'Antes de energizar qualquer coisa, confirme à mão que nada está preso.'
  },
  {
    id: 'alinhar',
    label: 'Montar o espaçador, alinhar o acoplamento e recolocar a proteção',
    after: ['sentido'],
    tooEarly: 'Se o sentido de giro estiver errado, a bomba gira ao contrário: confira isso com o acoplamento ainda desmontado.'
  },
  { id: 'oleo', label: 'Completar o óleo do cavalete até o meio do visor', after: ['girar'], tooEarly: 'Primeiro confirme que o eixo gira livre.' },
  {
    id: 'escorvar',
    label: 'Abrir a sucção, encher a bomba e tirar o ar (escorva)',
    after: ['alinhar'],
    tooEarly: 'A carcaça só recebe líquido depois que o conjunto está fechado e alinhado.'
  },
  {
    id: 'registrar',
    label: 'Registrar a manutenção: o que foi feito, peças trocadas e responsável',
    after: ['alinhar', 'oleo', 'escorvar'],
    tooEarly: 'O registro descreve o serviço terminado: ainda há passos em aberto.'
  },
  {
    id: 'bloqueio',
    label: 'Responsável retira o bloqueio, com todos fora da área',
    after: ['registrar'],
    tooEarly: 'O bloqueio é o último a sair: tudo precisa estar pronto e registrado antes.'
  }
];

export const RELEASE_SEQUENCE: SequenceItem[] = [
  { id: 'autorizacao', label: 'Combinar a parada com a operação e ter autorização para o serviço', after: [], tooEarly: '' },
  {
    id: 'bloqueio',
    label: 'Desligar o motor e bloquear com cadeado e etiqueta',
    after: ['autorizacao'],
    tooEarly: 'Antes de desligar, a operação precisa saber: a bomba alimenta o processo.'
  },
  {
    id: 'teste',
    label: 'Tentar dar partida no comando local: o motor não pode girar',
    after: ['bloqueio'],
    tooEarly: 'Testar a partida antes de bloquear pode ligar a bomba. O teste só vale depois do cadeado.'
  },
  {
    id: 'valvulas',
    label: 'Fechar e bloquear as válvulas de sucção e de recalque',
    after: ['teste'],
    tooEarly: 'Primeiro confirme que a bomba não liga: com ela girando e as válvulas fechadas, o líquido aquece.'
  },
  {
    id: 'dreno',
    label: 'Aliviar a pressão e drenar a carcaça pelo bujão',
    after: ['valvulas'],
    tooEarly: 'Sem fechar as válvulas, a tubulação continua alimentando a bomba enquanto você drena.'
  },
  { id: 'esfriar', label: 'Esperar esfriar e conferir a temperatura', after: ['dreno'], tooEarly: 'Líquido preso continua quente: drene antes de conferir.' },
  {
    id: 'protecao',
    label: 'Retirar a proteção do acoplamento e o espaçador',
    after: ['bloqueio'],
    tooEarly: 'A proteção só sai com o conjunto bloqueado: é ela que separa a mão do que gira.'
  }
];

/** Tarefas da OS-03: a ferramenta certa e o que a errada faz com a peça. Vêm do mesmo raciocínio do Lab 3D. */
export const TOOL_TASKS: { id: string; task: string; tool: string; why: string; wrong: Record<string, string> }[] = [
  {
    id: 'parafusos',
    task: 'Soltar os parafusos da carcaça',
    tool: 'Chave combinada',
    why: 'O anel estriado abraça a cabeça inteira do parafuso.',
    wrong: { 'Chave inglesa': 'A boca ajustável tem folga e arredonda a cabeça.', 'Alicate universal': 'Alicate escorrega e estraga a cabeça do parafuso.' }
  },
  {
    id: 'junta',
    task: 'Limpar a face da junta',
    tool: 'Espátula de latão',
    why: 'Mais macia que o ferro fundido: não risca a face de vedação.',
    wrong: { 'Talhadeira de aço': 'Risca a face e a junta nova vaza.', 'Lixa grossa': 'Tira material da face.' }
  },
  {
    id: 'rolamento',
    task: 'Sacar o rolamento do eixo',
    tool: 'Extrator de rolamentos',
    why: 'Puxa pelo anel que tem aperto, sem pancada.',
    wrong: { 'Martelo de aço': 'A pancada marca as pistas e pode lascar o anel.', 'Talhadeira de aço': 'Risca o eixo e o encosto.' }
  },
  {
    id: 'cubo',
    task: 'Retirar o cubo do acoplamento',
    tool: 'Saca-polias',
    why: 'A força fica centrada no eixo, sem bater no cubo.',
    wrong: { 'Martelo de aço': 'A pancada empena o eixo e danifica o rolamento.', 'Alicate universal': 'Não tem força nem apoio para sacar um cubo.' }
  },
  {
    id: 'aperto',
    task: 'Dar o aperto final na carcaça',
    tool: 'Torquímetro',
    why: 'Garante a força de aperto do manual.',
    wrong: { 'Chave combinada': 'Aperto “no braço” fica desigual: serve para encostar, não para o aperto final.', 'Chave inglesa': 'Além de sem controle de força, tem folga.' }
  }
];

export const TOOL_CHOICES = ['Chave combinada', 'Espátula de latão', 'Extrator de rolamentos', 'Saca-polias', 'Torquímetro', 'Chave inglesa', 'Alicate universal', 'Talhadeira de aço', 'Lixa grossa', 'Martelo de aço'];
