/**
 * Fontes regulatórias oficiais usadas no conteúdo de segurança.
 *
 * Todos os itens citados nas aulas foram conferidos no texto oficial publicado no portal do
 * Ministério do Trabalho e Emprego (gov.br/trabalho-e-emprego), na data indicada em VERIFIED_ON.
 * Os textos dizem "Este texto não substitui o publicado no DOU": a referência legal é sempre o
 * Diário Oficial da União. As NRs mudam; confira a versão vigente antes de usar em sala.
 */

export const VERIFIED_ON = '17/10/2026';

export type SourceId = 'nr06' | 'nr10' | 'nr11' | 'nr12' | 'nr13' | 'nr17';

export interface RegulatorySource {
  id: SourceId;
  short: string;
  title: string;
  /** Última alteração listada no próprio texto oficial, na data da verificação. */
  lastChange: string;
  pageUrl: string;
  pdfUrl: string;
  note?: string;
}

const MTE =
  'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente';
const VIGENTES = `${MTE}/normas-regulamentadora/normas-regulamentadoras-vigentes`;

export const REG_SOURCES: Record<SourceId, RegulatorySource> = {
  nr12: {
    id: 'nr12',
    short: 'NR-12',
    title: 'Segurança no Trabalho em Máquinas e Equipamentos',
    lastChange: 'Portaria MTE nº 344, de 21/03/2024',
    pageUrl: `${VIGENTES}/norma-regulamentadora-no-12-nr-12`,
    pdfUrl: `${VIGENTES}/nr-12-atualizada-2025.pdf`
  },
  nr06: {
    id: 'nr06',
    short: 'NR-06',
    title: 'Equipamentos de Proteção Individual — EPI',
    lastChange: 'Portaria MTE nº 57, de 16/01/2025',
    pageUrl: `${VIGENTES}/norma-regulamentadora-no-6-nr-6`,
    pdfUrl: `${VIGENTES}/nr-06-atualizada-2025-ii.pdf`
  },
  nr10: {
    id: 'nr10',
    short: 'NR-10',
    title: 'Segurança em Instalações e Serviços em Eletricidade',
    lastChange: 'Texto em vigor: Portaria SEPRT nº 915, de 30/07/2019',
    pageUrl: `${VIGENTES}/norma-regulamentadora-no-10-nr-10`,
    pdfUrl: `${MTE}/arquivos/normas-regulamentadoras/nr-10-atualizada-2019-1.pdf`,
    note:
      'A Portaria MTE nº 737, de 29/05/2026, publicou um novo texto da NR-10 com vigência a partir de 01/06/2027. Até lá vale o texto de 2019; os itens citados aqui são do texto em vigor.'
  },
  nr11: {
    id: 'nr11',
    short: 'NR-11',
    title: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
    lastChange: 'Portaria MTPS nº 505, de 29/04/2016',
    pageUrl: `${VIGENTES}/norma-regulamentadora-no-11-nr-11`,
    pdfUrl: `${VIGENTES}/nr-11-atualizada-2016.pdf`
  },
  nr13: {
    id: 'nr13',
    short: 'NR-13',
    title: 'Caldeiras, Vasos de Pressão, Tubulações e Tanques Metálicos de Armazenamento',
    lastChange: 'Portaria MTP nº 4.219, de 20/12/2022',
    pageUrl: `${VIGENTES}/norma-regulamentadora-no-13-nr-13`,
    pdfUrl: `${VIGENTES}/nr-13-atualizada-2023-b.pdf`
  },
  nr17: {
    id: 'nr17',
    short: 'NR-17',
    title: 'Ergonomia',
    lastChange: 'Portaria MTP nº 4.219, de 20/12/2022',
    pageUrl: `${VIGENTES}/norma-regulamentadora-no-17-nr-17`,
    pdfUrl: `${VIGENTES}/nr-17-atualizada-2023.pdf`
  }
};

/**
 * Classificação de cada afirmação de conteúdo:
 * - requisito: está escrito na NR citada (item conferido no texto oficial);
 * - boa-pratica: prática consolidada de segurança/manutenção, mas não é texto literal de NR;
 * - simplificado: cenário didático simplificado para a plataforma (não é procedimento real).
 */
export type ClaimKind = 'requisito' | 'boa-pratica' | 'simplificado';

export const CLAIM_LABEL: Record<ClaimKind, string> = {
  requisito: 'Requisito de NR',
  'boa-pratica': 'Boa prática',
  simplificado: 'Cenário simplificado'
};

export interface RegRef {
  source: SourceId;
  item: string;
}

export const formatRef = (r: RegRef) => `${REG_SOURCES[r.source].short}, item ${r.item}`;

/** Aviso padrão: a plataforma não habilita nem autoriza ninguém a operar máquinas. */
export const NOT_A_QUALIFICATION =
  'Estas atividades ajudam a estudar. Elas não são capacitação nos termos da NR-12 (item 12.16), não habilitam nem autorizam ninguém a operar ou manter máquinas reais e não atestam conformidade de nenhuma empresa ou equipamento.';
