import type { ViewId } from './voxel';

/**
 * Conteúdo das bancadas da Oficina de Desenho.
 * Referências: ABNT NBR 10067 (representação em desenho técnico, 1º diedro) e ISO 286 (limites de 25 h6 e 25 H7). As peças
 * e leituras são do exercício. Confira sempre o desenho e a tabela vigentes do seu trabalho.
 */

export const VIEW_QUESTIONS: { shape: string; view: ViewId }[] = [
  { shape: 'degrau', view: 'frontal' },
  { shape: 'canal', view: 'superior' },
  { shape: 'canto', view: 'lateral' },
  { shape: 'mancal', view: 'frontal' },
  { shape: 'garfo', view: 'superior' }
];

export const SECTION_QUESTIONS: { shape: string; plane: number }[] = [
  { shape: 'canal', plane: 0 },
  { shape: 'canto', plane: 1 },
  { shape: 'garfo', plane: 0 },
  { shape: 'mancal', plane: 2 }
];

/** Posições da folha em torno da vista frontal. */
export type SheetSlot = 'acima' | 'esquerda' | 'centro' | 'direita' | 'abaixo';
export const SHEET_ANSWER: Record<ViewId, SheetSlot> = { frontal: 'centro', superior: 'abaixo', lateral: 'direita' };
export const SHEET_WHY: Record<ViewId, string> = {
  frontal: 'A vista frontal é a principal: ela fica no centro e as outras se organizam em torno dela.',
  superior: 'No 1º diedro, adotado no Brasil, a vista de cima vai para baixo da frontal. A peça fica entre você e o plano de projeção.',
  lateral: 'No 1º diedro, a vista da esquerda vai para a direita da frontal. Em desenhos americanos, no 3º diedro, é o contrário: confira o símbolo na legenda.'
};

export interface ToleranceCheck {
  id: string;
  feature: string;
  callout: string;
  min: number;
  max: number;
  reading: number;
  why: string;
}

export const TOLERANCE_CHECKS: ToleranceCheck[] = [
  { id: 'eixo-ok', feature: 'Assento do rolamento no eixo', callout: 'Ø 25 h6', min: 24.987, max: 25, reading: 24.995, why: 'h6 em 25 mm vai de 24,987 a 25,000 mm. 24,995 está dentro.' },
  { id: 'eixo-baixo', feature: 'Assento do rolamento no eixo', callout: 'Ø 25 h6', min: 24.987, max: 25, reading: 24.98, why: '24,980 está abaixo do limite de 24,987 mm: 7 µm a menos já reprova.' },
  { id: 'furo-ok', feature: 'Alojamento da bucha', callout: 'Ø 25 H7', min: 25, max: 25.021, reading: 25.012, why: 'H7 em 25 mm vai de 25,000 a 25,021 mm. 25,012 está dentro.' },
  { id: 'furo-baixo', feature: 'Alojamento da bucha', callout: 'Ø 25 H7', min: 25, max: 25.021, reading: 24.998, why: 'No furo H, o limite inferior é o próprio nominal: 24,998 está abaixo de 25,000.' },
  { id: 'simetrica', feature: 'Largura do flange (desenho do exercício)', callout: '40 ± 0,1', min: 39.9, max: 40.1, reading: 40.15, why: '± 0,1 permite de 39,9 a 40,1 mm. 40,15 passou do limite superior.' },
  { id: 'simetrica-ok', feature: 'Largura do flange (desenho do exercício)', callout: '40 ± 0,1', min: 39.9, max: 40.1, reading: 39.95, why: '39,95 está entre 39,9 e 40,1.' }
];

/** Par da folga, calculado com os mesmos limites: mínimo 0 e máximo 0,034 mm. */
export const FIT_QUESTION = {
  prompt: 'Eixo Ø 25 h6 em furo Ø 25 H7. Qual é a folga máxima possível?',
  options: [
    { text: '0,034 mm', correct: true },
    { text: '0,021 mm', correct: false, why: 'Isso é só a largura da tolerância do furo. A maior folga é furo no máximo com eixo no mínimo.' },
    { text: '0,013 mm', correct: false, why: 'Isso é só a largura da tolerância do eixo.' },
    { text: 'Não há folga: o ajuste é com interferência', correct: false, why: 'H7/h6 tem folga mínima zero, sem interferência: furo mínimo e eixo máximo são os dois 25,000 mm.' }
  ],
  why: 'Folga máxima = furo máximo − eixo mínimo = 25,021 − 24,987 = 0,034 mm.'
};

export const SYMBOLS: { id: string; symbol: string; meaning: string; why: string }[] = [
  { id: 'diametro', symbol: 'Ø 25', meaning: 'Diâmetro de 25 mm', why: 'O símbolo Ø indica uma medida de diâmetro, mesmo quando a vista não mostra o círculo.' },
  { id: 'raio', symbol: 'R 5', meaning: 'Raio de 5 mm', why: 'R indica raio de arredondamento.' },
  { id: 'rosca', symbol: 'M12', meaning: 'Rosca métrica de 12 mm', why: 'M é rosca métrica; 12 é o diâmetro nominal.' },
  { id: 'rugosidade', symbol: 'Ra 1,6', meaning: 'Rugosidade média de 1,6 µm', why: 'Ra é o acabamento da superfície, não uma medida da peça.' },
  { id: 'perpendicular', symbol: '⊥', meaning: 'Perpendicularidade', why: 'Tolerância geométrica: quanto a superfície pode fugir do esquadro em relação à referência.' },
  { id: 'paralelo', symbol: '∥', meaning: 'Paralelismo', why: 'Tolerância geométrica: a superfície precisa acompanhar a referência.' },
  { id: 'concentrico', symbol: '◎', meaning: 'Concentricidade', why: 'Tolerância geométrica: os centros precisam coincidir, o que importa em peças que giram.' }
];

export const DRAWING_REFERENCES = [
  'ABNT NBR 10067: princípios gerais de representação em desenho técnico (1º diedro).',
  'ISO 286: sistema de limites e ajustes (limites de 25 h6 e 25 H7).',
  'ISO 1101: tolerâncias geométricas (símbolos).'
];
