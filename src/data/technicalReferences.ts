/**
 * Referências técnicas gerais citadas nas fichas de peças do Laboratório 3D.
 *
 * São obras e normas reais usadas como base para os textos (resumos, não citações literais).
 * Nenhum valor numérico de torque, folga ou temperatura vem delas: esses valores são do
 * manual do fabricante de cada equipamento, que é sempre a fonte que vale na oficina.
 */

export interface TechnicalReference {
  label: string;
  /** O que a referência sustenta no texto da ficha. */
  detail?: string;
}

export const TECH_REFERENCES: Record<string, TechnicalReference> = {
  manual: {
    label: 'Manual de instalação, operação e manutenção do fabricante da bomba',
    detail: 'Fonte obrigatória para torques, folgas, sentido da rosca, tipo de junta e sequência real de cada modelo.'
  },
  iso2858: {
    label: 'ISO 2858 — bombas centrífugas de sucção axial (PN 16): designação, ponto nominal e dimensões',
    detail: 'Família dimensional usada como inspiração para as proporções do modelo (65-50-160).'
  },
  en12756: {
    label: 'EN 12756 — selos mecânicos: dimensões principais, designação e códigos de material',
    detail: 'Base do tipo de selo representado (faces planas, mola, sede estacionária).'
  },
  iso15: {
    label: 'ISO 15 — rolamentos radiais: dimensões gerais',
    detail: 'Rolamento 6308: furo 40 mm, diâmetro externo 90 mm, largura 23 mm (medidas usadas no modelo).'
  },
  skf: {
    label: 'SKF — Bearing Maintenance Handbook (manual de manutenção de rolamentos)',
    detail: 'Montagem e desmontagem pelo anel com interferência, aquecimento indutivo, lubrificação em banho de óleo.'
  },
  macintyre: {
    label: 'Macintyre, A. J. — Bombas e Instalações de Bombeamento (LTC)',
    detail: 'Funcionamento da bomba centrífuga, voluta, cavitação e NPSH.'
  },
  mattosFalco: {
    label: 'Mattos, E. E.; Falco, R. — Bombas Industriais (Interciência)',
    detail: 'Componentes, vedações, mancais e manutenção de bombas centrífugas.'
  }
};
