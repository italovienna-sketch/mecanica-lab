/**
 * Corte longitudinal simplificado da bomba (viewBox 760 × 340, eixo em y = 170), desenhado à mão no projeto. É um desenho
 * educativo, sem escala de fabricação. As peças usam os mesmos ids do Laboratório 3D, então um clique aqui e um clique
 * no modelo falam da mesma peça.
 */

export type PumpPartId =
  | 'pump-volute-casing'
  | 'pump-impeller'
  | 'pump-impeller-nut'
  | 'pump-mechanical-seal'
  | 'pump-shaft'
  | 'pump-bearings'
  | 'pump-bearing-bracket'
  | 'pump-coupling-hub'
  | 'pump-casing-gasket'
  | 'pump-fasteners';

export type PumpFlowId = 'suction' | 'eye' | 'vanes' | 'volute' | 'discharge';
export type PumpSpot = PumpPartId | PumpFlowId;

export interface SectionRegion<T extends string> {
  id: T;
  label: string;
  /** Para que serve: aparece ao explorar o desenho. */
  note: string;
  d: string;
  /** Número do balão na lista de peças. */
  n?: number;
  /** Onde fica o balão (ponta da linha de chamada no desenho). */
  balloon?: { at: [number, number]; to: [number, number] };
}

const rect = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
const both = (x0: number, y0: number, x1: number, y1: number) => rect(x0, y0, x1, y1) + rect(x0, 340 - y1, x1, 340 - y0);
const poly = (pts: [number, number][]) => `M${pts.map((p) => p.join(' ')).join('L')}Z`;
const mirror = (pts: [number, number][]) => pts.map(([x, y]) => [x, 340 - y] as [number, number]);
const polyBoth = (pts: [number, number][]) => poly(pts) + poly(mirror(pts));

const CASING_OUTER =
  'M418 60L464 60L464 22L452 22L452 8L568 8L568 22L556 22L556 98L610 116L704 116L704 100L722 100L722 240L704 240L704 224L610 224L570 250Q575 312 510 312Q448 312 440 280L418 280Z';
const CASING_CAVITY =
  'M418 84L430 84L430 72L476 72L476 8L544 8L544 108L596 128L722 128L722 212L596 212L552 232Q556 298 508 298Q452 298 446 268L430 268L430 256L418 256Z';

export const PART_REGIONS: SectionRegion<PumpPartId>[] = [
  {
    id: 'pump-volute-casing',
    n: 1,
    label: 'Voluta (carcaça)',
    note: 'Envolve o rotor. O canal alarga aos poucos e transforma velocidade em pressão.',
    d: CASING_OUTER + CASING_CAVITY,
    balloon: { at: [640, 118], to: [640, 40] }
  },
  {
    id: 'pump-impeller',
    n: 2,
    label: 'Rotor',
    note: 'Gira com o eixo e joga o líquido para fora. Fica preso por chaveta e porca.',
    d: polyBoth([[480, 100], [494, 100], [536, 136], [536, 142], [526, 142], [480, 112]]) + both(452, 100, 461, 146) + both(452, 146, 512, 156),
    balloon: { at: [486, 104], to: [596, 74] }
  },
  {
    id: 'pump-impeller-nut',
    n: 3,
    label: 'Porca do rotor',
    note: 'Segura o rotor na ponta do eixo. Pode ter rosca esquerda: confira no manual.',
    d: rect(512, 158, 530, 182),
    balloon: { at: [522, 170], to: [640, 296] }
  },
  {
    id: 'pump-casing-gasket',
    n: 4,
    label: 'Junta da carcaça',
    note: 'Veda a união entre a carcaça e a tampa. Toda abertura pede junta nova.',
    d: both(414, 60, 418, 84),
    balloon: { at: [416, 62], to: [372, 40] }
  },
  {
    id: 'pump-mechanical-seal',
    n: 5,
    label: 'Tampa e selo mecânico',
    note: 'A tampa fecha a carcaça. O selo veda onde o eixo que gira atravessa a parte parada.',
    d: both(392, 60, 414, 156) + both(414, 86, 422, 156) + both(422, 146, 446, 156),
    balloon: { at: [434, 150], to: [322, 74] }
  },
  {
    id: 'pump-bearings',
    n: 6,
    label: 'Rolamentos',
    note: 'Sustentam o eixo e deixam ele girar com pouco atrito. Trabalham em banho de óleo.',
    d: both(124, 130, 156, 152) + both(340, 130, 372, 152),
    balloon: { at: [140, 138], to: [176, 74] }
  },
  {
    id: 'pump-bearing-bracket',
    n: 7,
    label: 'Cavalete de mancal',
    note: 'Aloja os rolamentos e o óleo, e apoia a bomba na base.',
    d: both(104, 112, 392, 130) + both(104, 130, 122, 152) + both(374, 130, 392, 154) + rect(150, 228, 350, 250),
    balloon: { at: [250, 114], to: [250, 74] }
  },
  {
    id: 'pump-shaft',
    n: 8,
    label: 'Eixo',
    note: 'Leva o giro do motor até o rotor. Os assentos dos rolamentos são medidos com micrômetro.',
    d: 'M20 156H120V152H372V156H512V184H372V188H120V184H20Z',
    balloon: { at: [250, 188], to: [250, 296] }
  },
  {
    id: 'pump-coupling-hub',
    n: 9,
    label: 'Cubo do acoplamento',
    note: 'Liga o eixo da bomba ao motor, pelo espaçador.',
    d: rect(28, 136, 84, 204),
    balloon: { at: [56, 204], to: [56, 296] }
  },
  {
    id: 'pump-fasteners',
    n: 10,
    label: 'Parafusos da carcaça',
    note: 'Unem a carcaça e a tampa. Soltam e apertam em cruz, em etapas.',
    d: both(384, 60, 396, 76) + both(396, 64, 436, 72),
    balloon: { at: [390, 268], to: [430, 324] }
  }
];

export const FLOW_REGIONS: SectionRegion<PumpFlowId>[] = [
  { id: 'suction', label: 'Bocal de sucção', note: 'O líquido chega pela tubulação de sucção, na direção do eixo.', d: rect(560, 130, 722, 210) },
  { id: 'eye', label: 'Olho do rotor', note: 'Entrada do rotor. É o ponto de menor pressão da bomba.', d: 'M512 146L526 142H560V198H526L512 194Z' },
  {
    id: 'vanes',
    label: 'Canais entre as pás',
    note: 'As pás giram e aceleram o líquido para fora.',
    d: polyBoth([[461, 100], [480, 100], [480, 112], [526, 142], [512, 146], [461, 146]])
  },
  {
    id: 'volute',
    label: 'Voluta',
    note: 'O canal alarga, a velocidade cai e a pressão sobe.',
    d: poly([[426, 72], [544, 72], [544, 104], [500, 96], [426, 96]]) + 'M426 244L500 244L548 232Q552 296 508 296Q452 296 446 268L426 268Z'
  },
  { id: 'discharge', label: 'Bocal de recalque', note: 'O líquido sai com pressão para a tubulação de recalque.', d: rect(476, 10, 544, 72) }
];

/** Caminho do líquido, da entrada à saída. É a ordem que a atividade “Siga o líquido” pede. */
export const FLOW_ORDER: PumpFlowId[] = ['suction', 'eye', 'vanes', 'volute', 'discharge'];

/** Linha que o líquido percorre, para a animação depois da atividade. */
export const FLOW_LINE = 'M716 170H556Q520 170 504 130L470 106Q470 86 510 84V14';

export const isFlowSpot = (s: PumpSpot): s is PumpFlowId => FLOW_REGIONS.some((r) => r.id === s);
export const spotLabel = (s: PumpSpot) => [...PART_REGIONS, ...FLOW_REGIONS].find((r) => r.id === s)?.label ?? s;
