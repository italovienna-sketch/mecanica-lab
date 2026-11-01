/**
 * Constantes do modelo motor + redutor, sem dependência de three.js (usadas pelos dados, pelo modelo 3D e pelo esquema).
 * A relação de transmissão é a do próprio modelo educacional: número de dentes da coroa ÷ número de dentes do pinhão.
 */
export const MG_TEETH = { pinion: 14, gear: 43 } as const;
/** Módulo das engrenagens do modelo, em unidades de cena (não é um módulo normalizado). */
export const MG_MODULE = 0.045;
export const MG_RATIO = MG_TEETH.gear / MG_TEETH.pinion;
/** Relação com duas casas, no formato brasileiro (ex.: "3,07"). */
export const MG_RATIO_TEXT = MG_RATIO.toFixed(2).replace('.', ',');
