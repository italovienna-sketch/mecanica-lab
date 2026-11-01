/**
 * Níveis e identificadores do Mestre da Metrologia. Módulo pequeno de propósito: o resumo de progresso e as trilhas
 * (que ficam no pacote principal) importam daqui sem carregar o gerador de leituras.
 */

export type Instrument = 'paquimetro' | 'micrometro' | 'relogio';

export interface LevelDef {
  id: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  instruments: Instrument[];
  answerMode: 'choice' | 'typed';
  /** Pontos por leitura certa sem dica (com dica vale a metade). */
  points: number;
}

export const QUESTIONS_PER_ROUND = 6;
/** Acertos necessários para concluir o nível. */
export const PASS_MIN = 5;

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: 'Paquímetro: décimos',
    description: 'O traço coincidente do nônio é sempre um dos numerados (0,1 mm; 0,2 mm…).',
    instruments: ['paquimetro'],
    answerMode: 'choice',
    points: 10
  },
  {
    id: 2,
    title: 'Paquímetro: 0,05 mm',
    description: 'Qualquer traço do nônio, inclusive os que ficam entre os números.',
    instruments: ['paquimetro'],
    answerMode: 'choice',
    points: 15
  },
  {
    id: 3,
    title: 'Micrômetro: 0,01 mm',
    description: 'Bainha, traço de meio milímetro e tambor.',
    instruments: ['micrometro'],
    answerMode: 'choice',
    points: 20
  },
  {
    id: 4,
    title: 'Bancada mista',
    description: 'Paquímetro e micrômetro sorteados. Você digita a leitura, sem alternativas.',
    instruments: ['paquimetro', 'micrometro'],
    answerMode: 'typed',
    points: 30
  },
  {
    id: 5,
    title: 'Relógio comparador: batimento',
    description: 'Dois ponteiros marcam o menor e o maior valor numa volta da peça. O batimento é a diferença entre eles.',
    instruments: ['relogio'],
    answerMode: 'choice',
    points: 25
  }
];


export const METROLOGY_GAME_ID = 'mestre-metrologia';
export const levelRoundId = (id: LevelDef['id']) => `nivel-${id}`;
