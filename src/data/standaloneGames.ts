import { BEARING_GAME_ID, BEARING_ROUNDS } from './bearingSequence/rounds';
import { LEVELS, METROLOGY_GAME_ID, levelRoundId } from './metrology/levels';
import { DRAWING_GAME_ID, DRAWING_ROUNDS } from './journey/meta';

/**
 * Desafios com tela e lógica próprias (fora de `games.ts`). Cada nível ou procedimento concluído conta como uma rodada
 * em “Meu progresso”, nas trilhas e nas competências.
 */
export const STANDALONE_GAMES = [
  { id: METROLOGY_GAME_ID, title: 'Mestre da Metrologia', unit: 'níveis', roundIds: LEVELS.map((l) => levelRoundId(l.id)) },
  { id: BEARING_GAME_ID, title: 'Montagem de rolamentos', unit: 'rodadas', roundIds: BEARING_ROUNDS.map((r) => r.id as string) },
  { id: DRAWING_GAME_ID, title: 'Oficina de Desenho', unit: 'bancadas', roundIds: [...DRAWING_ROUNDS] as string[] }
];

export const STANDALONE_ROUND_IDS: Record<string, string[]> = Object.fromEntries(STANDALONE_GAMES.map((g) => [g.id, g.roundIds]));
