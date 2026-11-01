/**
 * Identificadores do desafio “Montagem de rolamentos”. Módulo pequeno de propósito: o resumo de progresso e as
 * trilhas (pacote principal) importam daqui sem carregar os textos dos procedimentos.
 */

export const BEARING_GAME_ID = 'montagem-rolamento';

/** Rodadas na ordem em que aparecem (do procedimento mais simples ao mais completo). */
export const BEARING_ROUNDS = [
  { id: 'montagem-a-frio', title: 'Montagem a frio com bucha' },
  { id: 'montagem-a-quente', title: 'Montagem a quente com aquecedor indutivo' },
  { id: 'troca-no-mancal', title: 'Troca do rolamento num mancal bipartido' }
] as const;

export type BearingRoundId = (typeof BEARING_ROUNDS)[number]['id'];

/** Ações fora de ordem ou erradas toleradas para concluir a rodada. */
export const MAX_MISTAKES = 2;
