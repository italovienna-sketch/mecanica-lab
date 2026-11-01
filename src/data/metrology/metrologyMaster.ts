/**
 * Mestre da Metrologia — lógica pura (sem React), testada em tests/e2e/metrology.spec.ts.
 *
 * Instrumentos (os mesmos dos treinos em Ferramentas):
 *  • Paquímetro universal com nônio de 20 divisões em 19 mm → resolução 0,05 mm.
 *    Leitura = milímetros inteiros da régua antes do zero do nônio + (traço coincidente do nônio × 0,05 mm).
 *  • Micrômetro externo 0–25 mm, fuso de passo 0,5 mm, tambor de 50 divisões → resolução 0,01 mm.
 *    Leitura = mm da escala de cima + 0,50 mm se o traço de meio milímetro apareceu + divisão do tambor × 0,01 mm.
 *  • Relógio comparador de mostrador balanceado (0–50–0), 0,01 mm por divisão, 100 divisões por volta (1 mm).
 *    Zerado na peça; numa volta completa o ponteiro vai do menor ao maior valor. Batimento = maior − menor.
 *
 * Todos os valores são inteiros em centésimos de milímetro (1234 = 12,34 mm), para não haver erro de arredondamento.
 * As alternativas erradas vêm de erros reais de leitura, cada uma com a explicação do engano.
 */

import { Instrument, LEVELS, LevelDef, PASS_MIN, QUESTIONS_PER_ROUND } from './levels';

export * from './levels';

export type MistakeId =
  | 'nonio_como_decimo' // contou cada traço do nônio como 0,1 mm
  | 'traco_vizinho' // escolheu o traço do nônio ao lado do coincidente
  | 'mm_seguinte' // usou o traço da régua depois do zero do nônio
  | 'esqueceu_meio' // não somou o 0,50 mm visível
  | 'somou_meio' // somou 0,50 mm sem o traço ter aparecido
  | 'tambor_vizinho' // divisão do tambor ao lado da alinhada
  | 'tambor_como_decimo' // contou cada divisão do tambor como 0,1 mm
  | 'mm_anterior' // perdeu um milímetro na escala de cima da bainha
  | 'sinal_ignorado' // somou ou subtraiu os valores sem considerar o lado do zero
  | 'so_maior' // tomou o maior desvio a partir do zero como batimento
  | 'metade' // dividiu o batimento por dois (isso é a excentricidade)
  | 'divisao_vizinha' // um ponteiro lido uma divisão ao lado
  | 'divisao_como_decimo'; // contou cada divisão do relógio como 0,1 mm

export const MISTAKE_TEXT: Record<MistakeId, { title: string; fix: string }> = {
  nonio_como_decimo: {
    title: 'Cada traço do nônio foi contado como 0,1 mm',
    fix: 'Neste paquímetro o nônio tem 20 divisões: cada traço vale 0,05 mm. Os números impressos (1, 2, 3…) marcam décimos, a cada dois traços.'
  },
  traco_vizinho: {
    title: 'Traço do nônio vizinho ao coincidente',
    fix: 'Só um traço do nônio forma uma linha reta com um traço da régua. Compare também os vizinhos: os dois lados ficam levemente desalinhados, em sentidos opostos.'
  },
  mm_seguinte: {
    title: 'Milímetro da régua depois do zero do nônio',
    fix: 'Os milímetros inteiros são o último traço da régua que fica antes (à esquerda) do zero do nônio, mesmo que outro traço esteja bem perto.'
  },
  esqueceu_meio: {
    title: 'Faltou somar o meio milímetro',
    fix: 'Na escala de baixo da bainha, depois do último milímetro, o traço de meio milímetro já apareceu: some 0,50 mm antes de ler o tambor.'
  },
  somou_meio: {
    title: 'Somou meio milímetro que ainda não apareceu',
    fix: 'Só some 0,50 mm quando o traço de baixo, depois do último milímetro, estiver visível fora do tambor.'
  },
  tambor_vizinho: {
    title: 'Divisão do tambor ao lado da alinhada',
    fix: 'Leia a divisão do tambor que está exatamente sobre a linha de referência horizontal da bainha.'
  },
  tambor_como_decimo: {
    title: 'Cada divisão do tambor foi contada como 0,1 mm',
    fix: 'Uma volta do tambor avança 0,5 mm e ele tem 50 divisões: cada divisão vale 0,01 mm.'
  },
  mm_anterior: {
    title: 'Faltou um milímetro na bainha',
    fix: 'Conte os milímetros da escala de cima até o último traço visível antes da borda do tambor.'
  },
  sinal_ignorado: {
    title: 'O lado do zero (sinal) foi ignorado',
    fix: 'Valores do lado + e do lado − do zero têm sinais opostos. O batimento é a distância entre os dois ponteiros: maior − menor. De −0,02 a +0,03 são 0,05 mm.'
  },
  so_maior: {
    title: 'Só o maior desvio a partir do zero foi considerado',
    fix: 'O zero é só o ponto de partida. Batimento é a variação total do ponteiro durante a volta, do menor ao maior valor.'
  },
  metade: {
    title: 'O batimento foi dividido por dois',
    fix: 'Maior − menor já é o batimento (variação total indicada). A metade disso é a excentricidade do eixo, outra grandeza.'
  },
  divisao_vizinha: {
    title: 'Um ponteiro lido uma divisão ao lado',
    fix: 'Leia o traço exatamente sob a ponta de cada ponteiro, contando as divisões a partir do número mais próximo.'
  },
  divisao_como_decimo: {
    title: 'Cada divisão do relógio foi contada como 0,1 mm',
    fix: 'Uma volta do ponteiro vale 1 mm e o mostrador tem 100 divisões: cada divisão vale 0,01 mm.'
  }
};

export interface Reading {
  instrument: Instrument;
  /** Valor em centésimos de mm (no relógio, o batimento: maior − menor). */
  value: number;
  /** Só no relógio: posições extremas do ponteiro, em centésimos com sinal (− à esquerda do zero). */
  dial?: { min: number; max: number };
}

export interface Option {
  value: number;
  /** null = alternativa correta. */
  mistake: MistakeId | null;
}

export interface Question {
  id: string;
  reading: Reading;
  /** Peça de contexto (medidas didáticas, não cotas de um equipamento real). */
  part: string;
  /** Alternativas embaralhadas (vazio quando a resposta é digitada). */
  options: Option[];
  answerMode: 'choice' | 'typed';
}

export const LEVELS_BY_ID: Record<number, LevelDef> = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

/* ───────────── Números ───────────── */

/** 1234 → "12,34 mm" */
export const fmtMm = (hundredths: number) => `${(hundredths / 100).toFixed(2).replace('.', ',')} mm`;

/** Aceita "12,35", "12.35", "12,35 mm", " 12,3 " (até duas casas). Devolve centésimos ou null se não for válido. */
export function parseMm(input: string): number | null {
  const clean = input.trim().toLowerCase().replace(/\s*mm$/, '').replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(parseFloat(clean) * 100);
}

/** Gerador pseudoaleatório com semente (mulberry32): mesma semente, mesmas perguntas. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

/* ───────────── Decomposição das leituras ───────────── */

export function caliperParts(value: number) {
  const whole = Math.floor(value / 100);
  const tick = (value % 100) / 5; // 0..19
  return { whole, tick };
}

export function micrometerParts(value: number) {
  const whole = Math.floor(value / 100);
  const rest = value % 100;
  const half = rest >= 50;
  const drum = rest % 50; // 0..49
  return { whole, half, drum };
}

/** Faixas que as ilustrações mostram (régua do paquímetro até 55 mm; micrômetro 0–25 mm; relógio: batimento dentro de uma volta). */
export const RANGE: Record<Instrument, { min: number; max: number }> = {
  paquimetro: { min: 100, max: 3595 },
  micrometro: { min: 0, max: 2499 },
  relogio: { min: 1, max: 99 }
};

/** −2 → "−0,02"; 3 → "+0,03"; 0 → "0,00" (centésimos com sinal, como se lê no mostrador). */
export const fmtSigned = (hundredths: number) =>
  `${hundredths > 0 ? '+' : hundredths < 0 ? '−' : ''}${(Math.abs(hundredths) / 100).toFixed(2).replace('.', ',')}`;

const inRange = (instrument: Instrument, v: number) => v >= RANGE[instrument].min && v <= RANGE[instrument].max;

/** Leituras erradas típicas para uma leitura correta, cada uma com o engano que a produz. */
export function mistakesFor(reading: Reading): { value: number; mistake: MistakeId }[] {
  const { instrument, value } = reading;
  const out: { value: number; mistake: MistakeId }[] = [];
  if (instrument === 'relogio') {
    const { min, max } = reading.dial!;
    // Sinal ignorado: com ponteiros em lados opostos, subtrai os módulos; do mesmo lado, soma.
    out.push({ value: min < 0 && max > 0 ? Math.abs(max + min) : Math.abs(max) + Math.abs(min), mistake: 'sinal_ignorado' });
    out.push({ value: Math.max(Math.abs(min), Math.abs(max)), mistake: 'so_maior' });
    if (value % 2 === 0) out.push({ value: value / 2, mistake: 'metade' });
    out.push({ value: value + 1, mistake: 'divisao_vizinha' });
    out.push({ value: value - 1, mistake: 'divisao_vizinha' });
    if (value < 10) out.push({ value: value * 10, mistake: 'divisao_como_decimo' });
  } else if (instrument === 'paquimetro') {
    const { whole, tick } = caliperParts(value);
    if (tick > 0) out.push({ value: whole * 100 + tick * 10, mistake: 'nonio_como_decimo' });
    // Vizinhos do traço coincidente; com o zero coincidindo, o vizinho de baixo é o traço 19 do milímetro anterior.
    out.push({ value: value + 5, mistake: 'traco_vizinho' });
    out.push({ value: value - 5, mistake: 'traco_vizinho' });
    out.push({ value: value + 100, mistake: 'mm_seguinte' });
  } else {
    const { whole, half, drum } = micrometerParts(value);
    out.push(half ? { value: value - 50, mistake: 'esqueceu_meio' } : { value: value + 50, mistake: 'somou_meio' });
    out.push({ value: value + 1, mistake: 'tambor_vizinho' });
    out.push({ value: value - 1, mistake: 'tambor_vizinho' });
    if (drum > 0 && drum < 10) out.push({ value: whole * 100 + (half ? 50 : 0) + drum * 10, mistake: 'tambor_como_decimo' });
    out.push({ value: value - 100, mistake: 'mm_anterior' });
  }
  // Sem repetições, dentro da faixa do instrumento e diferentes da resposta certa.
  const seen = new Set<number>([value]);
  return out.filter((o) => {
    if (seen.has(o.value) || !inRange(instrument, o.value)) return false;
    seen.add(o.value);
    return true;
  });
}

/** Qual engano explica uma resposta digitada errada (ou null se não for um erro conhecido). */
export function diagnose(reading: Reading, answer: number): MistakeId | null {
  return mistakesFor(reading).find((m) => m.value === answer)?.mistake ?? null;
}

/** Passo a passo da leitura correta, em texto. */
export function explain(reading: Reading): string[] {
  if (reading.instrument === 'relogio') {
    const { min, max } = reading.dial!;
    const side = (v: number) => (v === 0 ? 'no zero' : `${Math.abs(v)} divisões ${v > 0 ? 'à direita (+)' : 'à esquerda (−)'} do zero`);
    return [
      `Ponteiro azul (menor valor na volta): ${side(min)} → ${fmtSigned(min)} mm.`,
      `Ponteiro laranja (maior valor na volta): ${side(max)} → ${fmtSigned(max)} mm.`,
      `Batimento = maior − menor = ${fmtSigned(max)} − (${fmtSigned(min)}) = ${fmtMm(reading.value)}.`
    ];
  }
  if (reading.instrument === 'paquimetro') {
    const { whole, tick } = caliperParts(reading.value);
    const frac = tick * 5;
    return [
      `Régua fixa: o último traço antes do zero do nônio é o de ${whole} mm.`,
      tick === 0
        ? 'Nônio: o próprio zero coincide com um traço da régua → 0,00 mm.'
        : `Nônio: o traço ${tick} coincide com um traço da régua → ${tick} × 0,05 = ${fmtMm(frac)}.`,
      `Leitura: ${whole} + ${(frac / 100).toFixed(2).replace('.', ',')} = ${fmtMm(reading.value)}.`
    ];
  }
  const { whole, half, drum } = micrometerParts(reading.value);
  return [
    `Bainha, escala de cima: o último milímetro visível é o ${whole}.`,
    half ? 'Escala de baixo: o traço de meio milímetro já apareceu → + 0,50 mm.' : 'Escala de baixo: o traço de meio milímetro ainda não apareceu → + 0,00 mm.',
    `Tambor: a divisão ${drum} está na linha de referência → ${drum} × 0,01 = ${fmtMm(drum)}.`,
    `Leitura: ${whole} + ${half ? '0,50' : '0,00'} + ${(drum / 100).toFixed(2).replace('.', ',')} = ${fmtMm(reading.value)}.`
  ];
}

/* ───────────── Geração das rodadas ───────────── */

const PARTS: Record<Instrument, string[]> = {
  paquimetro: [
    'Largura de uma chaveta',
    'Diâmetro de um pino',
    'Espessura de uma arruela',
    'Comprimento de uma bucha',
    'Diâmetro de um eixo de bancada',
    'Largura de uma barra chata',
    'Altura de um calço',
    'Diâmetro de uma polia pequena'
  ],
  micrometro: [
    'Diâmetro de um pino-guia',
    'Espessura de um calço de ajuste',
    'Diâmetro de uma bucha',
    'Diâmetro de uma broca',
    'Espessura de uma lâmina',
    'Diâmetro de um eixo retificado',
    'Espessura de uma chapa',
    'Diâmetro de uma esfera de rolamento'
  ],
  relogio: [
    'Batimento radial de um eixo entre pontas',
    'Batimento radial de uma polia montada',
    'Batimento axial da face de um flange',
    'Batimento radial de um rolo de transportador',
    'Batimento radial do cubo de um acoplamento',
    'Batimento axial da face de uma engrenagem'
  ]
};

function readingFor(level: LevelDef, instrument: Instrument, r: () => number): Reading {
  if (instrument === 'relogio') {
    // Ponteiros dentro de meia volta para cada lado (mostrador 0–50–0), separados por pelo menos 2 divisões e fora do
    // zero (com um ponteiro no zero, “ignorar o sinal” e “só o maior” dariam a própria resposta certa).
    for (;;) {
      const min = int(r, -30, 10);
      const max = min + int(r, 2, Math.min(40, 45 - min));
      if (min !== 0 && max !== 0) return { instrument, value: max - min, dial: { min, max } };
    }
  }
  if (instrument === 'paquimetro') {
    // A partir de 2 mm, para sempre haver três leituras erradas plausíveis dentro da escala.
    const whole = int(r, 2, 34);
    // Nível 1: só traços pares (décimos). Demais: qualquer traço, com metade das vezes um ímpar (o caso que pega).
    const tick = level.id === 1 ? 2 * int(r, 0, 9) : r() < 0.5 ? 2 * int(r, 0, 9) + 1 : int(r, 0, 19);
    return { instrument, value: whole * 100 + tick * 5 };
  }
  const whole = int(r, 1, 24);
  const half = r() < 0.5;
  const drum = int(r, 0, 49);
  return { instrument, value: whole * 100 + (half ? 50 : 0) + drum };
}

function shuffle<T>(items: T[], r: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Uma alternativa por tipo de engano (as mais instrutivas primeiro); completa com vizinhas se faltar. */
function buildOptions(reading: Reading, r: () => number): Option[] {
  const pool = mistakesFor(reading);
  const chosen: Option[] = [];
  const usedKinds = new Set<MistakeId>();
  for (const m of shuffle(pool, r)) {
    if (chosen.length === 3) break;
    if (usedKinds.has(m.mistake)) continue;
    usedKinds.add(m.mistake);
    chosen.push(m);
  }
  for (const m of pool) {
    if (chosen.length === 3) break;
    if (!chosen.some((c) => c.value === m.value)) chosen.push(m);
  }
  return shuffle([{ value: reading.value, mistake: null }, ...chosen], r);
}

/** Gera as perguntas de um nível. Mesma semente → mesmas perguntas (para testes e para repetir uma rodada). */
export function generateRound(levelId: LevelDef['id'], seed: number): Question[] {
  const level = LEVELS_BY_ID[levelId];
  const r = rng(seed);
  const questions: Question[] = [];
  const used = new Set<string>();
  while (questions.length < QUESTIONS_PER_ROUND) {
    // No nível misto, alterna os instrumentos para garantir os dois na rodada.
    const instrument = level.instruments.length === 1 ? level.instruments[0] : level.instruments[questions.length % 2];
    const reading = readingFor(level, instrument, r);
    const key = `${instrument}:${reading.value}`;
    if (used.has(key)) continue;
    used.add(key);
    const parts = PARTS[instrument];
    questions.push({
      id: `n${levelId}-${questions.length + 1}`,
      reading,
      part: parts[int(r, 0, parts.length - 1)],
      options: level.answerMode === 'choice' ? buildOptions(reading, r) : [],
      answerMode: level.answerMode
    });
  }
  return questions;
}

/* ───────────── Pontuação ───────────── */

export interface AnswerRecord {
  questionId: string;
  instrument: Instrument;
  correct: boolean;
  hintUsed: boolean;
  mistake: MistakeId | null;
}

export interface RoundResult {
  correct: number;
  total: number;
  score: number;
  maxScore: number;
  passed: boolean;
  /** Enganos que se repetiram, do mais frequente para o menos. */
  mistakes: { id: MistakeId; count: number }[];
}

/** Pontuação determinística: só leituras certas pontuam; com dica valem a metade. Sem tempo. */
export function scoreRound(levelId: LevelDef['id'], answers: AnswerRecord[]): RoundResult {
  const level = LEVELS_BY_ID[levelId];
  const correct = answers.filter((a) => a.correct).length;
  const score = answers.reduce((s, a) => s + (a.correct ? (a.hintUsed ? level.points / 2 : level.points) : 0), 0);
  const counts = new Map<MistakeId, number>();
  for (const a of answers) if (!a.correct && a.mistake) counts.set(a.mistake, (counts.get(a.mistake) ?? 0) + 1);
  return {
    correct,
    total: answers.length,
    score,
    maxScore: level.points * QUESTIONS_PER_ROUND,
    passed: answers.length === QUESTIONS_PER_ROUND && correct >= PASS_MIN,
    mistakes: [...counts.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count)
  };
}

/** Habilidades do perfil (Meu progresso) que cada instrumento alimenta. */
export const SKILL_BY_INSTRUMENT: Record<Instrument, string> = {
  paquimetro: 'measure.caliper',
  micrometro: 'measure.micrometer',
  relogio: 'measure.dial'
};
