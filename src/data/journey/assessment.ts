import type { BenchDecision, CriterionId } from './meta';
import { CRITERIA } from './meta';
import type { BenchCondition, BenchPartId, SequenceItem } from './bench';
import { BENCH_PARTS, RELEASE_SEQUENCE, BENCH_VARIANTS } from './bench';
import type { PumpPartId } from './pumpSection';

/**
 * Avaliação prática (OS-06): um caso novo, sem dica e sem retorno durante a prova. O resultado vem no fim, por critério,
 * com o raciocínio de cada decisão. Equipamentos e leituras são FICTÍCIOS; a tentativa seguinte traz outro caso.
 *
 * O diagnóstico por vibração nunca é tratado como certeza: os sinais apontam causas prováveis e a confirmação vem da
 * inspeção. O mesmo sinal pode ter mais de uma origem (ex.: 1× de rotação aparece em desbalanceamento e em desalinhamento).
 */

export interface AssessmentTest {
  id: string;
  label: string;
  safety: 'seguro' | 'bloqueio' | 'inseguro';
  /** Quanto o teste ajuda neste caso. */
  value: 'chave' | 'util' | 'neutro';
  result: string;
}

export interface Hypothesis {
  id: string;
  label: string;
  /** Pode ser descartada pelas evidências do caso (a causa provável não é). */
  discard: boolean;
  why: string;
}

export interface NextAction {
  id: string;
  label: string;
  /** 2 = melhor resposta, 1 = razoável, com ressalva; 0 = não resolve; -1 = insegura. */
  grade: 2 | 1 | 0 | -1;
  why: string;
}

export interface AssessmentCase {
  id: number;
  tag: string;
  chamado: string;
  symptoms: { id: string; label: string; relevant: boolean; why: string }[];
  tests: AssessmentTest[];
  /** Quantos testes o aluno pode pedir: é uma parada real, não dá para fazer tudo. */
  testBudget: number;
  hypotheses: Hypothesis[];
  causeId: string;
  actions: NextAction[];
  benchParts: { part: BenchPartId; condition: BenchCondition }[];
  /** Pergunta de desenho: o que precisa ser apontado no corte da bomba. */
  drawingPrompt: { prompt: string; part: PumpPartId; why: string };
  measure: { label: string; nominal: string; min: number; max: number; reading: number; why: string };
}

const V0 = BENCH_VARIANTS[0].parts;
const V1 = BENCH_VARIANTS[1].parts;
const V2 = BENCH_VARIANTS[2].parts;

const UNSAFE_TEST = (label: string, why: string): AssessmentTest => ({ id: 'mao-girando', label, safety: 'inseguro', value: 'neutro', result: why });

export const ASSESSMENT_CASES: AssessmentCase[] = [
  {
    id: 0,
    tag: 'P-204',
    chamado: 'OS 2204: bomba de torre de resfriamento com vibração alta desde a troca do motor, na semana passada. Vazão e pressão normais. A operação pede para manter ligada até o fim do turno.',
    symptoms: [
      { id: 'desde-troca', label: 'A vibração começou logo depois da troca do motor', relevant: true, why: 'Algo mudou no acoplamento: é a pista mais forte.' },
      { id: 'vazao-normal', label: 'Vazão e pressão seguem normais', relevant: true, why: 'Afasta o problema hidráulico como causa principal.' },
      { id: 'pintura', label: 'A pintura da base está desbotada', relevant: false, why: 'Aparência da base não explica vibração.' },
      { id: 'turno', label: 'A operação quer manter a bomba até o fim do turno', relevant: false, why: 'É uma pressão de produção, não um sinal técnico.' }
    ],
    testBudget: 3,
    tests: [
      { id: 'vibra-pontos', label: 'Medir a vibração nos mancais, nas direções radial e axial, de fora da proteção', safety: 'seguro', value: 'chave', result: 'Vibração alta perto do acoplamento, com componente axial forte nos dois mancais vizinhos.' },
      { id: 'alinhamento', label: 'Com a bomba bloqueada, conferir o alinhamento do acoplamento', safety: 'bloqueio', value: 'chave', result: 'Desalinhamento bem acima do registrado na última montagem.' },
      { id: 'base', label: 'Com a bomba bloqueada, verificar os parafusos da base do motor', safety: 'bloqueio', value: 'util', result: 'Parafusos apertados. Um calço foi retirado na troca do motor e não voltou.' },
      { id: 'filtro', label: 'Consultar a pressão de sucção no instrumento do painel', safety: 'seguro', value: 'neutro', result: 'Sucção estável, igual à das rondas anteriores.' },
      { id: 'historico', label: 'Ler o histórico de manutenção da bomba', safety: 'seguro', value: 'util', result: 'Motor trocado há 8 dias. Não há registro de alinhamento depois da troca.' },
      UNSAFE_TEST('Tirar a proteção do acoplamento com a bomba ligada para olhar melhor', 'A proteção só sai com o conjunto bloqueado. Mão perto do que gira: esse teste não é feito.')
    ],
    hypotheses: [
      { id: 'desalinhamento', label: 'Desalinhamento do acoplamento', discard: false, why: 'É a causa provável: começou com a troca do motor, há componente axial e o alinhamento confirmou.' },
      { id: 'cavitacao', label: 'Cavitação', discard: true, why: 'Sucção estável e vazão normal, sem ruído de pedrinhas.' },
      { id: 'rotor', label: 'Rotor gasto', discard: true, why: 'Vazão e pressão normais não combinam com rotor gasto.' },
      { id: 'desbalanceamento', label: 'Desbalanceamento do rotor', discard: true, why: 'Nada mudou no rotor, e a vibração surgiu com a troca do motor.' }
    ],
    causeId: 'desalinhamento',
    actions: [
      { id: 'alinhar', label: 'Parar em comum acordo, bloquear, recolocar o calço, realinhar e medir de novo antes de liberar', grade: 2, why: 'Corrige a causa e confirma com medição.' },
      { id: 'planejar', label: 'Programar o realinhamento na próxima parada e acompanhar a vibração até lá', grade: 1, why: 'Pode ser aceito se a medição ficar em nível de alerta e o responsável decidir, mas desgasta acoplamento e rolamentos.' },
      { id: 'rolamento', label: 'Trocar os rolamentos da bomba', grade: 0, why: 'Trataria o sintoma: com o desalinhamento mantido, os novos sofreriam o mesmo.' },
      { id: 'ligada', label: 'Soltar um pouco os parafusos da base com a bomba ligada para aliviar', grade: -1, why: 'Mexer na base com a máquina girando é inseguro e piora a vibração.' }
    ],
    benchParts: [
      { part: 'rolamento', condition: V0.rolamento },
      { part: 'junta', condition: V0.junta }
    ],
    drawingPrompt: { prompt: 'No corte, aponte a peça que precisa ser conferida quando se realinha o conjunto com o motor.', part: 'pump-coupling-hub', why: 'O alinhamento é feito entre os cubos do acoplamento da bomba e do motor.' },
    measure: { label: 'Assento do rolamento no eixo', nominal: 'Ø 25 h6 (24,987 a 25,000 mm)', min: 24.987, max: 25, reading: 24.99, why: 'A leitura de 24,99 mm fica dentro da faixa do desenho: o eixo pode voltar.' }
  },
  {
    id: 1,
    tag: 'P-310',
    chamado: 'OS 3107: bomba de água de processo vibrando e com ruído de “pedrinhas”, pior quando a vazão sobe. O filtro da sucção não é limpo há meses. A pressão de recalque oscila.',
    symptoms: [
      { id: 'pedrinhas', label: 'Ruído de pedrinhas, pior com vazão alta', relevant: true, why: 'É o ruído típico de bolhas implodindo no rotor.' },
      { id: 'filtro-sujo', label: 'Filtro de sucção sem limpeza há meses', relevant: true, why: 'Filtro sujo aumenta a perda de carga e baixa a pressão na entrada do rotor.' },
      { id: 'oscila', label: 'Pressão de recalque oscilando', relevant: true, why: 'Combina com escoamento instável por falta de sucção.' },
      { id: 'etiqueta', label: 'A etiqueta de patrimônio está descolando', relevant: false, why: 'Sem relação com o funcionamento.' }
    ],
    testBudget: 3,
    tests: [
      { id: 'succao', label: 'Ler a pressão de sucção no instrumento e comparar com a ronda anterior', safety: 'seguro', value: 'chave', result: 'Pressão de sucção bem abaixo das rondas anteriores.' },
      { id: 'filtro', label: 'Com a linha isolada e bloqueada, abrir o filtro da sucção', safety: 'bloqueio', value: 'chave', result: 'Filtro quase todo entupido.' },
      { id: 'vibra', label: 'Medir a vibração nos mancais de fora da proteção', safety: 'seguro', value: 'util', result: 'Vibração irregular, sem um pico único bem definido.' },
      { id: 'alinhamento', label: 'Com a bomba bloqueada, conferir o alinhamento', safety: 'bloqueio', value: 'neutro', result: 'Dentro do registrado na última montagem.' },
      { id: 'oleo', label: 'Verificar o nível de óleo no visor do cavalete', safety: 'seguro', value: 'neutro', result: 'Nível correto, óleo limpo.' },
      UNSAFE_TEST('Abrir o bujão de dreno com a bomba ligada para ver se sai ar', 'Abrir um ponto pressurizado com a bomba em operação arrisca jato de líquido. Esse teste não é feito.')
    ],
    hypotheses: [
      { id: 'cavitacao', label: 'Cavitação por sucção restringida', discard: false, why: 'É a causa provável: ruído, pressão de sucção baixa e filtro entupido.' },
      { id: 'desalinhamento', label: 'Desalinhamento', discard: true, why: 'O alinhamento está dentro do registrado.' },
      { id: 'mancal', label: 'Falta de lubrificação no mancal', discard: true, why: 'Nível correto e óleo limpo.' },
      { id: 'motor', label: 'Problema elétrico no motor', discard: true, why: 'O ruído muda com a vazão, o que aponta para o lado hidráulico.' }
    ],
    causeId: 'cavitacao',
    actions: [
      { id: 'filtro', label: 'Parar, bloquear, limpar o filtro, conferir o rotor na próxima abertura e criar rotina de limpeza', grade: 2, why: 'Remove a causa, avalia o dano e evita que volte.' },
      { id: 'estrangular', label: 'Reduzir a vazão na válvula de recalque para aliviar, até a parada, com aval da operação', grade: 1, why: 'Reduz o sintoma por um tempo, mas não corrige a causa. Só como medida provisória.' },
      { id: 'rotor', label: 'Trocar o rotor e devolver a bomba', grade: 0, why: 'O rotor novo sofreria o mesmo: a causa continuaria na sucção.' },
      { id: 'sucao', label: 'Fechar parcialmente a válvula de sucção para “segurar” a bomba', grade: -1, why: 'Restringir a sucção piora a cavitação: é o oposto do que o caso pede.' }
    ],
    benchParts: [
      { part: 'rotor', condition: V0.rotor },
      { part: 'selo', condition: V0.selo }
    ],
    drawingPrompt: { prompt: 'No corte, aponte a peça em que aparece o dano por cavitação.', part: 'pump-impeller', why: 'A cavitação marca o rotor, na entrada das pás, onde a pressão é mais baixa.' },
    measure: { label: 'Assento do rolamento no eixo', nominal: 'Ø 25 h6 (24,987 a 25,000 mm)', min: 24.987, max: 25, reading: 24.96, why: 'A leitura de 24,96 mm está abaixo de 24,987 mm: o eixo não pode voltar como está.' }
  },
  {
    id: 2,
    tag: 'P-118',
    chamado: 'OS 1183: bomba voltou da oficina com rotor recuperado e passou a vibrar. A vibração é constante e acompanha a rotação. Alinhamento feito e registrado na montagem. Vazão normal.',
    symptoms: [
      { id: 'pos-reparo', label: 'A vibração começou depois da recuperação do rotor', relevant: true, why: 'A peça que mudou é o rotor.' },
      { id: 'acompanha', label: 'A vibração é constante e acompanha a rotação', relevant: true, why: 'Uma força que gira junto com o eixo é típica de massa fora do centro.' },
      { id: 'alinhado', label: 'Alinhamento registrado na montagem', relevant: true, why: 'Reduz a chance de desalinhamento, embora não elimine: vale confirmar.' },
      { id: 'cor', label: 'A bomba foi repintada de outra cor', relevant: false, why: 'A cor da tinta não muda a vibração.' }
    ],
    testBudget: 3,
    tests: [
      { id: 'vibra', label: 'Medir a vibração nos mancais de fora da proteção', safety: 'seguro', value: 'chave', result: 'Vibração radial forte na frequência de rotação do eixo.' },
      { id: 'registro', label: 'Ler o registro da oficina sobre o rotor', safety: 'seguro', value: 'chave', result: 'As pás foram recuperadas. Não há registro de balanceamento depois do serviço.' },
      { id: 'alinhamento', label: 'Com a bomba bloqueada, reconferir o alinhamento', safety: 'bloqueio', value: 'util', result: 'Dentro do registrado.' },
      { id: 'succao', label: 'Ler a pressão de sucção no instrumento', safety: 'seguro', value: 'neutro', result: 'Normal.' },
      { id: 'oleo', label: 'Verificar o nível do óleo no visor', safety: 'seguro', value: 'neutro', result: 'Nível correto.' },
      UNSAFE_TEST('Encostar a mão no eixo girando para sentir a vibração', 'Contato com eixo girando pode puxar a mão. Esse teste não é feito.')
    ],
    hypotheses: [
      { id: 'desbalanceamento', label: 'Desbalanceamento do rotor recuperado', discard: false, why: 'É a causa provável: começou com o reparo, vibra na rotação e não houve balanceamento.' },
      { id: 'desalinhamento', label: 'Desalinhamento', discard: true, why: 'O alinhamento foi reconferido.' },
      { id: 'cavitacao', label: 'Cavitação', discard: true, why: 'Sucção normal e vazão normal.' },
      { id: 'folga', label: 'Falta de óleo no mancal', discard: true, why: 'Nível correto.' }
    ],
    causeId: 'desbalanceamento',
    actions: [
      { id: 'balancear', label: 'Parar, bloquear, retirar o rotor, balancear e medir a vibração de novo antes de liberar', grade: 2, why: 'Corrige a causa e confirma com medição.' },
      { id: 'registrar', label: 'Acompanhar por rondas e programar o balanceamento na próxima parada', grade: 1, why: 'Pode ser aceito se o nível ficar em alerta e o responsável decidir, mas castiga rolamentos e selo.' },
      { id: 'selo', label: 'Trocar o selo mecânico', grade: 0, why: 'O selo não causa vibração na rotação: seria uma peça trocada à toa.' },
      { id: 'ligada', label: 'Acrescentar um peso no cubo do acoplamento com a bomba em operação', grade: -1, why: 'Intervenção em peça girando é inaceitável, e o balanceamento não se faz assim.' }
    ],
    benchParts: [
      { part: 'rotor', condition: V2.rotor },
      { part: 'rolamento', condition: V1.rolamento }
    ],
    drawingPrompt: { prompt: 'No corte, aponte a peça que precisa ser balanceada.', part: 'pump-impeller', why: 'O rotor foi recuperado: material acrescentado ou retirado muda a distribuição de massa.' },
    measure: { label: 'Assento do rolamento no eixo', nominal: 'Ø 25 h6 (24,987 a 25,000 mm)', min: 24.987, max: 25, reading: 25, why: 'A leitura de 25,00 mm está no limite superior da faixa: ainda dentro.' }
  }
];

export const assessmentCaseFor = (attempts: number) => ASSESSMENT_CASES[attempts % ASSESSMENT_CASES.length];

/** Sequência da liberação na prova: a mesma lógica de pré-requisitos, sem retorno na hora. */
export const ASSESSMENT_RELEASE: SequenceItem[] = RELEASE_SEQUENCE;

export interface AssessmentAnswers {
  releaseOrder: string[];
  /** Passos feitos antes do pré-requisito (ver DependencySequence, modo silencioso). */
  releaseErrors: number;
  symptoms: string[];
  tests: string[];
  discarded: string[];
  cause: string;
  action: string;
  disassembly: string[];
  bench: Record<string, { finding: string; decision: BenchDecision }>;
  drawingPick: string;
  measureOk: boolean | null;
}

export interface AssessmentLine {
  criterion: CriterionId;
  ok: boolean;
  text: string;
}

export interface AssessmentResult {
  criteria: Record<CriterionId, number>;
  critical: boolean;
  passed: boolean;
  lines: AssessmentLine[];
}

const pct = (got: number, total: number) => (total > 0 ? Math.round((Math.max(0, got) / total) * 100) : 0);

/** Pares (a, b): a precisa vir antes de b. Pode haver outras peças no meio. */
export const DISASSEMBLY_RULES: { before: string; after: string; why: string }[] = [
  { before: 'pump-fasteners', after: 'pump-bearing-bracket', why: 'A unidade só sai depois de soltar os parafusos da carcaça.' },
  { before: 'pump-bearing-bracket', after: 'pump-impeller-nut', why: 'A porca do rotor só fica acessível com a unidade fora da carcaça.' },
  { before: 'pump-impeller-nut', after: 'pump-impeller', why: 'A porca prende o rotor: ela sai primeiro.' },
  { before: 'pump-impeller', after: 'pump-mechanical-seal', why: 'O rotor sai antes do selo: ele fica na frente da tampa.' },
  { before: 'pump-mechanical-seal', after: 'pump-shaft', why: 'O eixo só sai depois de tirar o selo.' },
  { before: 'pump-coupling-hub', after: 'pump-shaft', why: 'O cubo do acoplamento sai antes do eixo.' },
  { before: 'pump-shaft', after: 'pump-bearings', why: 'Os rolamentos são sacados do eixo depois que ele sai do cavalete.' }
];

export const DISASSEMBLY_PARTS = ['pump-fasteners', 'pump-bearing-bracket', 'pump-impeller-nut', 'pump-impeller', 'pump-mechanical-seal', 'pump-coupling-hub', 'pump-shaft', 'pump-bearings'];

/** Correção da avaliação. Função pura: as mesmas respostas dão sempre a mesma nota. */
export function scoreAssessment(c: AssessmentCase, a: AssessmentAnswers, passScore: number): AssessmentResult {
  const lines: AssessmentLine[] = [];
  const add = (criterion: CriterionId, ok: boolean, text: string) => lines.push({ criterion, ok, text });

  // Segurança: testes e ação inseguros são erro crítico; a ordem da liberação vale o resto.
  const unsafeTests = c.tests.filter((t) => t.safety === 'inseguro' && a.tests.includes(t.id));
  const action = c.actions.find((x) => x.id === a.action);
  const unsafeAction = action?.grade === -1;
  const critical = unsafeTests.length > 0 || unsafeAction;
  const safety = critical ? 0 : pct(RELEASE_SEQUENCE.length - a.releaseErrors, RELEASE_SEQUENCE.length);
  unsafeTests.forEach((t) => add('seguranca', false, `Teste inseguro: “${t.label}”. ${t.result}`));
  if (unsafeAction && action) add('seguranca', false, `Ação insegura: “${action.label}”. ${action.why}`);
  add(
    'seguranca',
    a.releaseErrors === 0,
    a.releaseErrors === 0 ? 'Liberação em uma ordem válida: cada passo veio depois do que ele depende.' : `Liberação com ${a.releaseErrors} passo(s) fora de ordem. A lógica: autorizar, bloquear, testar, isolar, drenar e esfriar.`
  );

  // Diagnóstico: sintomas, testes, eliminação, causa e ação. Causa certa com ação fraca não leva a nota cheia.
  let diag = 0;
  const diagTotal = 100;
  const relevant = c.symptoms.filter((s) => s.relevant).map((s) => s.id);
  const hits = a.symptoms.filter((s) => relevant.includes(s)).length;
  const falseHits = a.symptoms.filter((s) => !relevant.includes(s)).length;
  diag += Math.round((Math.max(0, hits - falseHits) / relevant.length) * 15);
  add('diagnostico', falseHits === 0 && hits === relevant.length, `Sintomas relevantes: ${c.symptoms.filter((s) => s.relevant).map((s) => s.why).join(' ')}`);

  const keyTests = c.tests.filter((t) => t.value === 'chave');
  const keyDone = keyTests.filter((t) => a.tests.includes(t.id)).length;
  diag += Math.round((keyDone / keyTests.length) * 20);
  add('diagnostico', keyDone === keyTests.length, `Testes decisivos: ${keyTests.map((t) => `${t.label} (${t.result})`).join(' · ')}`);

  const canDiscard = c.hypotheses.filter((h) => h.discard);
  const rightDiscards = canDiscard.filter((h) => a.discarded.includes(h.id)).length;
  const wrongDiscard = a.discarded.includes(c.causeId);
  diag += wrongDiscard ? 0 : Math.round((rightDiscards / canDiscard.length) * 15);
  add('diagnostico', rightDiscards === canDiscard.length && !wrongDiscard, `Hipóteses: ${c.hypotheses.map((h) => `${h.label}: ${h.why}`).join(' ')}`);

  const cause = c.hypotheses.find((h) => h.id === a.cause);
  const causeOk = a.cause === c.causeId;
  if (causeOk) diag += 25;
  add('diagnostico', causeOk, causeOk ? `Causa provável correta. ${cause?.why}` : `A causa provável era “${c.hypotheses.find((h) => h.id === c.causeId)?.label}”. ${c.hypotheses.find((h) => h.id === c.causeId)?.why}`);

  diag += action ? (action.grade === 2 ? 25 : action.grade === 1 ? 14 : 0) : 0;
  const best = c.actions.find((x) => x.grade === 2);
  if (action && action.grade >= 1) add('diagnostico', action.grade === 2, `${action.grade === 2 ? 'Melhor ação' : 'Ação aceitável com ressalva'}: ${action.why}`);
  else if (action && action.grade === 0) add('diagnostico', false, `“${action.label}” não resolve. ${action.why} A melhor ação seria: ${best?.label}.`);

  // Procedimento: ordem de desmontagem. Vale pela lógica de dependências, não por uma sequência decorada.
  const pos = (id: string) => a.disassembly.indexOf(id);
  const broken = DISASSEMBLY_RULES.filter((r) => pos(r.before) > pos(r.after));
  const proc = pct(DISASSEMBLY_RULES.length - broken.length, DISASSEMBLY_RULES.length);
  if (broken.length) broken.forEach((r) => add('procedimento', false, r.why));
  else add('procedimento', true, 'Ordem de desmontagem coerente: de fora para dentro.');

  // Inspeção e medição: achado + decisão por peça, medida contra a tolerância e leitura do desenho.
  let insp = 0;
  const each = 70 / (c.benchParts.length * 2);
  c.benchParts.forEach(({ part, condition }) => {
    const ans = a.bench[part];
    const name = BENCH_PARTS.find((b) => b.id === part)?.name ?? part;
    const finding = ans?.finding === condition.findingId;
    const grade = ans ? condition.decisions[ans.decision].grade : null;
    const decision = grade === 'certo' || grade === 'aceitavel';
    if (finding) insp += each;
    if (decision) insp += each;
    add('inspecao', finding, `${name}: ${condition.describe}`);
    add('inspecao', decision, `${name}, decisão: ${ans ? condition.decisions[ans.decision].why : 'sem decisão registrada.'}`);
  });
  const inRange = c.measure.reading >= c.measure.min && c.measure.reading <= c.measure.max;
  const measureOk = a.measureOk === inRange;
  if (measureOk) insp += 15;
  add('inspecao', measureOk, c.measure.why);
  const drawingOk = a.drawingPick === c.drawingPrompt.part;
  if (drawingOk) insp += 15;
  add('inspecao', drawingOk, c.drawingPrompt.why);

  const criteria: Record<CriterionId, number> = {
    seguranca: safety,
    diagnostico: Math.round((diag / diagTotal) * 100),
    procedimento: proc,
    inspecao: Math.round(insp)
  };
  // Segurança não entra na média: precisa estar completa. Os outros critérios precisam do mínimo cada um.
  const passed = safety === 100 && CRITERIA.filter((k) => k !== 'seguranca').every((k) => criteria[k] >= passScore);
  return { criteria, critical, passed, lines };
}
