// Identificador e etapas do torno, sem os dados do modelo: usados no resumo de progresso sem carregar latheData.
export const LATHE_ID = 'conventional-lathe';

/** Etapas da atividade do torno (diferentes da missão de desmontagem da bomba). */
export const LATHE_STAGES = [
  { id: 'conhecer', label: 'Conhecer o torno', short: 'Conhecer' },
  { id: 'identificar', label: 'Identificar as partes', short: 'Identificar' },
  { id: 'seguranca', label: 'Inspeção de segurança', short: 'Segurança' },
  { id: 'sequencia', label: 'Sequência de uma operação', short: 'Sequência' },
  { id: 'verificar', label: 'Verificar o aprendizado', short: 'Verificar' }
] as const;
export type LatheStageId = (typeof LATHE_STAGES)[number]['id'];
