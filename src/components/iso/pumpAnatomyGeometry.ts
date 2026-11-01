import {
  boxCorners,
  circleRing,
  cylinder,
  fitProjection,
  insetPlan,
  iso,
  onTop,
  pathOf,
  planOutline,
  slabOf,
  topTicks,
  translateAlong,
  type Flat,
  type Plan,
  type Plane,
  type Point3,
  type Projection,
  type SolidPaths,
} from './iso-kit';

export const ANATOMY_WIDTH = 760;
export const ANATOMY_HEIGHT = 480;

const RADIANS = Math.PI / 180;

const BASE_PLAN: Plan = { x: -155, y: -82, w: 310, d: 164, r: 8 };
const BASE_H = 12;
const FOOT_H = 6;

export const PUMP_PROJECTION: Projection = fitProjection(
  [
    ...boxCorners(BASE_PLAN, -BASE_H - FOOT_H, 0),
    [-165, -90, 145],
    [175, 90, 145],
  ],
  ANATOMY_WIDTH,
  ANATOMY_HEIGHT,
  { pad: 34, azimuth: 38, elevation: 28 }
);

export const atPump = (pt: Point3): Flat => iso(pt, PUMP_PROJECTION);

function convexHull2D(points: Flat[]): Flat[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const cross = (o: Flat, a: Flat, b: Flat) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Flat[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Flat[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/**
 * Generates an Anatomy 4-tone SolidPaths for a horizontal cylinder oriented along the X axis.
 * Front cap is at x0 + length (facing +X viewer), back cap is at x0.
 */
export function cylinderAlongX(
  x0: number,
  length: number,
  cy: number,
  cz: number,
  radius: number,
  projection: Projection = PUMP_PROJECTION,
  steps = 32
): SolidPaths {
  const xFront = x0 + length;
  const frontPts: Flat[] = [];
  const backPts: Flat[] = [];
  const normals: [number, number][] = [];

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const ny = Math.cos(angle);
    const nz = Math.sin(angle);
    normals.push([ny, nz]);
    frontPts.push(iso([xFront, cy + radius * ny, cz + radius * nz], projection));
    backPts.push(iso([x0, cy + radius * ny, cz + radius * nz], projection));
  }

  const az = (projection.azimuth ?? 38) * RADIANS;
  const el = (projection.elevation ?? 28) * RADIANS;
  const vy = Math.sin(az) * Math.cos(el);
  const vz = Math.sin(el);

  const buckets: string[][] = [[], [], [], []];
  for (let i = 0; i < steps; i++) {
    const next = (i + 1) % steps;
    const [ny, nz] = normals[i]!;
    // Check if barrel strip faces camera
    if (ny * vy + nz * vz > -0.05) {
      const lightDot = (ny * -0.45 + nz * 0.85 + 1) / 2;
      const shadeIdx = Math.min(3, Math.max(0, Math.floor(lightDot * 4)));
      buckets[shadeIdx]!.push(
        pathOf([frontPts[i]!, frontPts[next]!, backPts[next]!, backPts[i]!], true)
      );
    }
  }

  const hull = convexHull2D([...frontPts, ...backPts]);
  const hullPath = pathOf(hull, true);
  const frontCapPath = pathOf(frontPts, true);

  return {
    fill: hullPath,
    outline: hullPath,
    crease: frontCapPath,
    top: frontCapPath,
    shades: buckets.map((b) => b.join('')),
    seamless: true,
  };
}

/**
 * Helper to draw a circle ring on a YZ plane at a given X coordinate.
 */
export function ringOnX(
  x: number,
  cy: number,
  cz: number,
  radius: number,
  projection: Projection = PUMP_PROJECTION,
  steps = 28
): string {
  const pts: Flat[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push(iso([x, cy + radius * Math.cos(a), cz + radius * Math.sin(a)], projection));
  }
  return pathOf(pts, true);
}

/**
 * Bolt circle dots on a YZ plane at X.
 */
export function boltCircleOnX(
  x: number,
  cy: number,
  cz: number,
  radius: number,
  count: number,
  projection: Projection = PUMP_PROJECTION,
  offsetAngle = 0
): Flat[] {
  const dots: Flat[] = [];
  for (let i = 0; i < count; i++) {
    const a = offsetAngle + (i / count) * Math.PI * 2;
    dots.push(iso([x, cy + radius * Math.cos(a), cz + radius * Math.sin(a)], projection));
  }
  return dots;
}

/**
 * Radial vane paths on a YZ plane for the impeller.
 */
function impellerVanesOnX(x: number, cy: number, cz: number, rInner: number, rOuter: number, count = 6): string {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const baseAngle = (i / count) * Math.PI * 2;
    const pts: Flat[] = [];
    for (let s = 0; s <= 8; s++) {
      const t = s / 8;
      const r = rInner + (rOuter - rInner) * t;
      const spiral = baseAngle + t * 0.55;
      pts.push(atPump([x, cy + r * Math.cos(spiral), cz + r * Math.sin(spiral)]));
    }
    paths.push(pathOf(pts, false));
  }
  return paths.join('');
}

// ============================================================================
// 1. BASE BENCH & METROLOGY STAND (STATIC REFERENCE STRUCTURE — 25+ PARTS)
// ============================================================================
const FEET_COORDS: Plane[] = [
  [BASE_PLAN.x + 22, BASE_PLAN.y + 20],
  [BASE_PLAN.x + BASE_PLAN.w - 22, BASE_PLAN.y + 20],
  [BASE_PLAN.x + 22, BASE_PLAN.y + BASE_PLAN.d - 20],
  [BASE_PLAN.x + BASE_PLAN.w - 22, BASE_PLAN.y + BASE_PLAN.d - 20],
];

const CORNER_SCREWS: Plane[] = [
  [BASE_PLAN.x + 10, BASE_PLAN.y + 10],
  [BASE_PLAN.x + BASE_PLAN.w - 10, BASE_PLAN.y + 10],
  [BASE_PLAN.x + 10, BASE_PLAN.y + BASE_PLAN.d - 10],
  [BASE_PLAN.x + BASE_PLAN.w - 10, BASE_PLAN.y + BASE_PLAN.d - 10],
];

const NAMEPLATE_PLAN: Plan = { x: -138, y: 44, w: 74, d: 24, r: 2 };
const DRAIN_TRAY_PLAN: Plan = { x: -45, y: -56, w: 185, d: 112, r: 5 };
const RULER_TICKS = topTicks(-120, 120, 5, 5, BASE_PLAN.y + BASE_PLAN.d - 8, 0, [-3.5, -6.5], PUMP_PROJECTION, 'x');

// Center height of the horizontal pump shaft
export const SHAFT_Z = 56;
export const SHAFT_Y = 0;

export const BENCH_STATIC_ART = {
  halo: slabOf(BASE_PLAN, -BASE_H - FOOT_H, BASE_H, PUMP_PROJECTION).fill,
  feet: FEET_COORDS.map(([fx, fy]) => [
    cylinder(fx, fy, 9, -BASE_H - FOOT_H, 2.2, PUMP_PROJECTION, 24),
    cylinder(fx, fy, 6.5, -BASE_H - FOOT_H + 2.2, FOOT_H - 2.2, PUMP_PROJECTION, 24),
  ]),
  slab: slabOf(BASE_PLAN, -BASE_H, BASE_H, PUMP_PROJECTION, 8, 1.5),
  perimeterGroove: planOutline(insetPlan(BASE_PLAN, 5), 0, PUMP_PROJECTION),
  drainRim: planOutline(DRAIN_TRAY_PLAN, 0, PUMP_PROJECTION),
  drainInner: planOutline(insetPlan(DRAIN_TRAY_PLAN, 3), 0, PUMP_PROJECTION),
  cornerScrews: CORNER_SCREWS.map(([sx, sy]) => atPump([sx, sy, 0])),
  cornerScrewRings: CORNER_SCREWS.map(([sx, sy]) =>
    onTop(circleRing(sx, sy, 2.6, 16), 0, PUMP_PROJECTION, true)
  ).join(''),
  nameplate: slabOf(NAMEPLATE_PLAN, 0, 1.2, PUMP_PROJECTION, 4),
  nameplateBorder: planOutline(insetPlan(NAMEPLATE_PLAN, 2), 1.2, PUMP_PROJECTION),
  nameplateRules: [0, 1, 2]
    .map((row) =>
      onTop(
        [
          [NAMEPLATE_PLAN.x + 8, NAMEPLATE_PLAN.y + 6 + row * 5.5],
          [NAMEPLATE_PLAN.x + (row === 2 ? 46 : 62), NAMEPLATE_PLAN.y + 6 + row * 5.5],
        ],
        1.2,
        PUMP_PROJECTION
      )
    )
    .join(''),
  nameplateRivets: [
    atPump([NAMEPLATE_PLAN.x + 4, NAMEPLATE_PLAN.y + NAMEPLATE_PLAN.d / 2, 1.2]),
    atPump([NAMEPLATE_PLAN.x + NAMEPLATE_PLAN.w - 4, NAMEPLATE_PLAN.y + NAMEPLATE_PLAN.d / 2, 1.2]),
  ],
  rulerMinor: RULER_TICKS.minor,
  rulerMajor: RULER_TICKS.major,
  rulerBaseline: onTop([[-120, BASE_PLAN.y + BASE_PLAN.d - 8], [120, BASE_PLAN.y + BASE_PLAN.d - 8]], 0, PUMP_PROJECTION),
  // Alignment laser / dial stand at back-left to inspect shaft runout
  gaugeStandBase: slabOf({ x: -135, y: -62, w: 26, d: 22, r: 2 }, 0, 8, PUMP_PROJECTION, 4, 0.6),
  gaugeColumn: cylinder(-122, -51, 2.4, 8, 56, PUMP_PROJECTION, 16),
  gaugeBezel: cylinderAlongX(-125, 5, -26, SHAFT_Z + 12, 11, PUMP_PROJECTION, 24),
  gaugeFace: ringOnX(-120, -26, SHAFT_Z + 12, 8.5),
  gaugeArm: pathOf([atPump([-122, -51, 54]), atPump([-122, -26, SHAFT_Z + 12])]),
  gaugeCenterDot: [atPump([-120, -26, SHAFT_Z + 12])],
};

// ============================================================================
// 2. CENTRIFUGAL PUMP ISO 2858 — 7 CANONICAL SELECTABLE & MOVABLE ASSEMBLIES
// ============================================================================
// Each assembly uses the EXACT ID from mechanicalMachines.ts so 2D & 3D share 100% of state!

export interface AnatomyPartVector {
  id: string;
  labelPt: string;
  shortRolePt: string;
  /** 3D displacement in Anatomy world units when fully exploded (extractT = 1) */
  explodeVector: Point3;
}

export const PUMP_ANATOMY_VECTORS: Record<string, AnatomyPartVector> = {
  'pump-bearing-bracket': {
    id: 'pump-bearing-bracket',
    labelPt: 'Cavalete de Mancal (Suporte Back-Pull-Out)',
    shortRolePt: 'Sustenta os rolamentos em banho de óleo e mantém o eixo perfeitamente alinhado.',
    explodeVector: [-24, 0, -10],
  },
  'pump-bearings': {
    id: 'pump-bearings',
    labelPt: 'Par de Rolamentos Rígidos de Esferas (6308)',
    shortRolePt: 'Apoiam o eixo rotativo eliminando o atrito radial e axial dentro do cavalete.',
    explodeVector: [-44, 0, 34],
  },
  'pump-shaft': {
    id: 'pump-shaft',
    labelPt: 'Eixo Escalonado de Transmissão com Chaveta',
    shortRolePt: 'Transmite a rotação e o torque do motor elétrico até o rotor através da chaveta.',
    explodeVector: [-68, 0, 0],
  },
  'pump-mechanical-seal': {
    id: 'pump-mechanical-seal',
    labelPt: 'Tampa de Pressão & Selo Mecânico (EN 12756)',
    shortRolePt: 'Impede que o líquido pressurizado da bomba vaze pelo vão onde o eixo atravessa a carcaça.',
    explodeVector: [-8, 0, 34],
  },
  'pump-impeller': {
    id: 'pump-impeller',
    labelPt: 'Rotor Centrífugo Fechado (Impelidor Radial)',
    shortRolePt: 'Gira em alta rotação para succionar o líquido pelo centro e lançá-lo sob pressão.',
    explodeVector: [30, 0, 0],
  },
  'pump-volute-casing': {
    id: 'pump-volute-casing',
    labelPt: 'Carcaça Espiral em Voluta (Corpo da Bomba)',
    shortRolePt: 'Coleta o fluido acelerado pelo rotor e converte velocidade em pressão no recalque.',
    explodeVector: [72, 0, 0],
  },
  'pump-fasteners': {
    id: 'pump-fasteners',
    labelPt: 'Prisioneiros Perimetrais & Porca de Fixação do Rotor',
    shortRolePt: 'Travam o rotor na ponta do eixo e comprimem a voluta contra a tampa de pressão.',
    explodeVector: [108, 0, 0],
  },
};

export const PUMP_PARTS_ART = {
  // 1. pump-bearing-bracket (Pedestal + barrel + cooling fins + oil sight glass)
  bearingBracket: {
    pedestalFoot: slabOf({ x: -82, y: -28, w: 58, d: 56, r: 3 }, 0, 6, PUMP_PROJECTION, 4, 0.8),
    pedestalColumn: slabOf({ x: -72, y: -16, w: 38, d: 32, r: 2 }, 6, SHAFT_Z - 24, PUMP_PROJECTION, 4, 0.6),
    barrel: cylinderAlongX(-86, 62, SHAFT_Y, SHAFT_Z, 22, PUMP_PROJECTION, 28),
    rearCover: cylinderAlongX(-90, 4, SHAFT_Y, SHAFT_Z, 23, PUMP_PROJECTION, 24),
    adapterFlange: cylinderAlongX(-24, 5, SHAFT_Y, SHAFT_Z, 30, PUMP_PROJECTION, 28),
    coolingFins: [-70, -58, -46, -34]
      .map((x) => ringOnX(x, SHAFT_Y, SHAFT_Z, 22.8))
      .join(''),
    sightGlassRing: onTop(circleRing(-54, 22, 4.5, 16), SHAFT_Z - 4, PUMP_PROJECTION, true),
    footBolts: [
      atPump([-74, -20, 6]),
      atPump([-32, -20, 6]),
      atPump([-74, 20, 6]),
      atPump([-32, 20, 6]),
    ],
    flangeBolts: boltCircleOnX(-19, SHAFT_Y, SHAFT_Z, 26, 8),
  },

  // 2. pump-bearings (2x 6308 deep-groove ball bearings with inner/outer rings + ball cage dots)
  bearings: {
    rearOuterRing: cylinderAlongX(-80, 9, SHAFT_Y, SHAFT_Z, 17.5, PUMP_PROJECTION, 24),
    rearInnerRing: ringOnX(-71, SHAFT_Y, SHAFT_Z, 11.2),
    rearBalls: boltCircleOnX(-71, SHAFT_Y, SHAFT_Z, 14.4, 8),
    frontOuterRing: cylinderAlongX(-36, 9, SHAFT_Y, SHAFT_Z, 17.5, PUMP_PROJECTION, 24),
    frontInnerRing: ringOnX(-27, SHAFT_Y, SHAFT_Z, 11.2),
    frontBalls: boltCircleOnX(-27, SHAFT_Y, SHAFT_Z, 14.4, 8),
  },

  // 3. pump-shaft (Stepped shaft + coupling end + keyway + front thread)
  driveShaft: {
    couplingEnd: cylinderAlongX(-116, 26, SHAFT_Y, SHAFT_Z, 7.5, PUMP_PROJECTION, 20),
    mainJournal: cylinderAlongX(-90, 88, SHAFT_Y, SHAFT_Z, 9.5, PUMP_PROJECTION, 24),
    impellerSeat: cylinderAlongX(-2, 26, SHAFT_Y, SHAFT_Z, 7.2, PUMP_PROJECTION, 20),
    keywayBlock: slabOf({ x: -112, y: -2.2, w: 20, d: 4.4, r: 0.5 }, SHAFT_Z + 7, 2.5, PUMP_PROJECTION, 3),
    shoulderRings: [
      ringOnX(-90, SHAFT_Y, SHAFT_Z, 9.5),
      ringOnX(-2, SHAFT_Y, SHAFT_Z, 9.5),
      ringOnX(24, SHAFT_Y, SHAFT_Z, 7.2),
    ].join(''),
  },

  // 4. pump-mechanical-seal (Stationary SiC seat + rotary carbon ring + preload coil lines)
  mechanicalSeal: {
    stationarySeat: cylinderAlongX(-17, 6, SHAFT_Y, SHAFT_Z, 16.5, PUMP_PROJECTION, 24),
    rotaryUnit: cylinderAlongX(-11, 9, SHAFT_Y, SHAFT_Z, 14.5, PUMP_PROJECTION, 24),
    elastomerBellows: cylinderAlongX(-2, 5, SHAFT_Y, SHAFT_Z, 12.5, PUMP_PROJECTION, 20),
    springRings: [-10, -7, -4]
      .map((x) => ringOnX(x, SHAFT_Y, SHAFT_Z, 14.8))
      .join(''),
    sealFaceLine: ringOnX(-11, SHAFT_Y, SHAFT_Z, 16.5),
  },

  // 5. pump-impeller (Closed radial impeller shroud + hub + curved vane lines + eye ring)
  impeller: {
    backShroud: cylinderAlongX(5, 4, SHAFT_Y, SHAFT_Z, 29, PUMP_PROJECTION, 32),
    vaneChannel: cylinderAlongX(9, 7, SHAFT_Y, SHAFT_Z, 27, PUMP_PROJECTION, 32),
    frontShroud: cylinderAlongX(16, 3.5, SHAFT_Y, SHAFT_Z, 28.5, PUMP_PROJECTION, 32),
    suctionEye: cylinderAlongX(19.5, 4, SHAFT_Y, SHAFT_Z, 14.5, PUMP_PROJECTION, 24),
    vanesDetail: impellerVanesOnX(19.6, SHAFT_Y, SHAFT_Z, 14.5, 27.5, 6),
    eyeRing: ringOnX(23.5, SHAFT_Y, SHAFT_Z, 14.5),
    balanceHoles: boltCircleOnX(19.6, SHAFT_Y, SHAFT_Z, 19, 6, PUMP_PROJECTION, 0.3),
  },

  // 6. pump-volute-casing (Spiral volute scroll + vertical DN50 discharge nozzle + horizontal DN65 suction nozzle + foot)
  casingVolute: {
    casingFoot: slabOf({ x: 18, y: -32, w: 34, d: 64, r: 3 }, 0, SHAFT_Z - 34, PUMP_PROJECTION, 4, 0.8),
    rearFlange: cylinderAlongX(12, 6, SHAFT_Y, SHAFT_Z, 38, PUMP_PROJECTION, 32),
    voluteScroll: cylinderAlongX(18, 26, SHAFT_Y, SHAFT_Z, 35, PUMP_PROJECTION, 32),
    suctionTaper: cylinderAlongX(44, 18, SHAFT_Y, SHAFT_Z, 21, PUMP_PROJECTION, 28),
    suctionFlange: cylinderAlongX(62, 6, SHAFT_Y, SHAFT_Z, 29, PUMP_PROJECTION, 28),
    suctionBore: ringOnX(68, SHAFT_Y, SHAFT_Z, 15.5),
    suctionBolts: boltCircleOnX(68, SHAFT_Y, SHAFT_Z, 24, 8),
    dischargePipe: cylinder(29, -12, 13.5, SHAFT_Z + 28, 30, PUMP_PROJECTION, 24),
    dischargeFlange: cylinder(29, -12, 22, SHAFT_Z + 58, 5.5, PUMP_PROJECTION, 28, 0.6),
    dischargeBore: onTop(circleRing(29, -12, 11, 20), SHAFT_Z + 63.5, PUMP_PROJECTION, true),
    dischargeBolts: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i / 8) * Math.PI * 2;
      return atPump([29 + 17 * Math.cos(a), -12 + 17 * Math.sin(a), SHAFT_Z + 63.5]);
    }),
    voluteRibs: [24, 34, 42]
      .map((x) => ringOnX(x, SHAFT_Y, SHAFT_Z, 35.2))
      .join(''),
  },

  // 7. pump-fasteners (4x M12 Hex Perimeter Fasteners + Hydrodynamic Impeller Nut)
  fasteners: {
    impellerWasher: cylinderAlongX(24, 2, SHAFT_Y, SHAFT_Z, 11, PUMP_PROJECTION, 20),
    impellerHexBody: cylinderAlongX(26, 7, SHAFT_Y, SHAFT_Z, 8.8, PUMP_PROJECTION, 6),
    impellerAcornCap: cylinderAlongX(33, 3.5, SHAFT_Y, SHAFT_Z, 6.2, PUMP_PROJECTION, 16),
    impellerCrownRing: ringOnX(33, SHAFT_Y, SHAFT_Z, 8.2),
    bolts: [
      [0, 32, SHAFT_Z + 22],
      [0, -32, SHAFT_Z + 22],
      [0, 32, SHAFT_Z - 22],
      [0, -32, SHAFT_Z - 22],
    ].map(([, by, bz]) => ({
      shank: cylinderAlongX(44, 14, by, bz, 2.8, PUMP_PROJECTION, 12),
      washer: cylinderAlongX(58, 1.8, by, bz, 6.2, PUMP_PROJECTION, 16),
      hexHead: cylinderAlongX(59.8, 5.2, by, bz, 5.0, PUMP_PROJECTION, 6),
      centerDot: atPump([65, by, bz]),
    })),
  },

  // Alignment guide dashed lines along shaft axis and bolt axes
  axisCenterline: pathOf([atPump([-128, SHAFT_Y, SHAFT_Z]), atPump([162, SHAFT_Y, SHAFT_Z])]),
  sealVerticalGuide: pathOf([atPump([-10, SHAFT_Y, SHAFT_Z]), atPump([-10, SHAFT_Y, SHAFT_Z + 55])]),
};

// ============================================================================
// 3. HELICAL GEARBOX REDUCER — 7 CANONICAL SELECTABLE & MOVABLE ASSEMBLIES
// ============================================================================
export const GEARBOX_ANATOMY_VECTORS: Record<string, AnatomyPartVector> = {
  'part-housing-bottom': {
    id: 'part-housing-bottom',
    labelPt: 'Base da Carcaça Inferior (Cárter de Óleo)',
    shortRolePt: 'Sustenta os assentos dos rolamentos e armazena o óleo lubrificante ISO VG 220.',
    explodeVector: [0, 0, -14],
  },
  'part-radial-seals': {
    id: 'part-radial-seals',
    labelPt: 'Retentores Radiais de Lábio Duplo (NBR)',
    shortRolePt: 'Vedam as pontas dos eixos contra vazamento de óleo e entrada de poeira.',
    explodeVector: [68, -28, 0],
  },
  'part-taper-bearings': {
    id: 'part-taper-bearings',
    labelPt: 'Rolamentos de Rolos Cônicos (Série 30200)',
    shortRolePt: 'Suportam simultaneamente as cargas radiais e o empuxo axial das engrenagens helicoidais.',
    explodeVector: [-68, 0, 12],
  },
  'part-output-gear': {
    id: 'part-output-gear',
    labelPt: 'Conjunto Coroa Helicoidal e Eixo de Saída (Z2 = 82)',
    shortRolePt: 'Recebe a força do pinhão, reduz a rotação cerca de 4,8 vezes e multiplica o torque na mesma proporção, descontadas as perdas.',
    explodeVector: [0, 26, 28],
  },
  'part-input-pinion-shaft': {
    id: 'part-input-pinion-shaft',
    labelPt: 'Eixo-Pinhão Helicoidal de Entrada (Z1 = 17)',
    shortRolePt: 'Recebe a alta rotação do motor elétrico (1750 RPM) e engrena suavemente na coroa.',
    explodeVector: [0, -24, 48],
  },
  'part-housing-top': {
    id: 'part-housing-top',
    labelPt: 'Tampa Superior de Inspeção da Carcaça',
    shortRolePt: 'Fecha hermeticamente o redutor e aloja o respiro de alívio de pressão.',
    explodeVector: [0, 0, 82],
  },
  'part-bolts-perimeter': {
    id: 'part-bolts-perimeter',
    labelPt: 'Parafusos de Fechamento do Flange (8x M12 Classe 10.9)',
    shortRolePt: 'Garantem a rigidez estrutural entre as duas metades da carcaça bipartida.',
    explodeVector: [0, 0, 112],
  },
};

export const GEARBOX_PARTS_ART = {
  // 1. part-housing-bottom
  housingBottom: {
    baseFlange: slabOf({ x: -78, y: -54, w: 156, d: 108, r: 5 }, 0, 8, PUMP_PROJECTION, 6, 1.0),
    sumpBody: slabOf({ x: -68, y: -44, w: 136, d: 88, r: 4 }, 8, 38, PUMP_PROJECTION, 6, 0.8),
    midSplitFlange: slabOf({ x: -76, y: -50, w: 152, d: 100, r: 4 }, 42, 6, PUMP_PROJECTION, 6, 0.8),
    cavityOutline: planOutline({ x: -58, y: -36, w: 116, d: 72, r: 3 }, 48, PUMP_PROJECTION),
    anchorBolts: [
      atPump([-70, -46, 8]),
      atPump([70, -46, 8]),
      atPump([-70, 46, 8]),
      atPump([70, 46, 8]),
    ],
  },

  // 2. part-radial-seals
  radialSeals: {
    inputSealOuter: cylinderAlongX(68, 5, -20, 48, 15, PUMP_PROJECTION, 24),
    inputSealLip: ringOnX(73, -20, 48, 10.5),
    outputSealOuter: cylinderAlongX(68, 5, 18, 48, 19, PUMP_PROJECTION, 24),
    outputSealLip: ringOnX(73, 18, 48, 14),
  },

  // 3. part-taper-bearings
  taperBearings: {
    inputRearBearing: cylinderAlongX(-62, 10, -20, 48, 15.5, PUMP_PROJECTION, 24),
    inputFrontBearing: cylinderAlongX(50, 10, -20, 48, 15.5, PUMP_PROJECTION, 24),
    outputRearBearing: cylinderAlongX(-62, 12, 18, 48, 19.5, PUMP_PROJECTION, 24),
    outputFrontBearing: cylinderAlongX(50, 12, 18, 48, 19.5, PUMP_PROJECTION, 24),
    rollerRings: [
      ringOnX(-52, -20, 48, 13),
      ringOnX(60, -20, 48, 13),
      ringOnX(-50, 18, 48, 16.5),
      ringOnX(62, 18, 48, 16.5),
    ].join(''),
  },

  // 4. part-output-gear (Driven gear Z2=82 + heavy output shaft)
  outputGear: {
    shaft: cylinderAlongX(-58, 156, 18, 48, 11.5, PUMP_PROJECTION, 24),
    gearWeb: cylinderAlongX(-12, 22, 18, 48, 28, PUMP_PROJECTION, 32),
    gearRim: cylinderAlongX(-14, 26, 18, 48, 32, PUMP_PROJECTION, 36),
    helicalTeethLines: [-10, -4, 2, 8].map((x) => ringOnX(x, 18, 48, 32.2)).join(''),
    webHoles: boltCircleOnX(10, 18, 48, 20, 6),
  },

  // 5. part-input-pinion-shaft (Pinion Z1=17 + high-speed input shaft)
  inputPinion: {
    shaft: cylinderAlongX(-58, 154, -20, 48, 8.5, PUMP_PROJECTION, 24),
    pinionTeeth: cylinderAlongX(-14, 26, -20, 48, 14.5, PUMP_PROJECTION, 28),
    helicalGrooves: [-9, -3, 3, 9].map((x) => ringOnX(x, -20, 48, 14.7)).join(''),
  },

  // 6. part-housing-top (Upper inspection cover + breather plug)
  housingTop: {
    bottomFlange: slabOf({ x: -76, y: -50, w: 152, d: 100, r: 4 }, 48, 6, PUMP_PROJECTION, 6, 0.8),
    upperBonnet: slabOf({ x: -64, y: -40, w: 128, d: 80, r: 5 }, 54, 26, PUMP_PROJECTION, 6, 1.2),
    inspectionPlate: slabOf({ x: -34, y: -22, w: 68, d: 44, r: 2 }, 80, 3, PUMP_PROJECTION, 4, 0.5),
    breatherPlug: cylinder(0, 0, 5.5, 83, 8, PUMP_PROJECTION, 16, 0.6),
    inspectionScrews: [
      atPump([-28, -16, 83]),
      atPump([28, -16, 83]),
      atPump([-28, 16, 83]),
      atPump([28, 16, 83]),
    ],
  },

  // 7. part-bolts-perimeter (8x M12 flange bolts)
  boltsPerimeter: {
    bolts: [
      [-68, -44],
      [-24, -44],
      [24, -44],
      [68, -44],
      [-68, 44],
      [-24, 44],
      [24, 44],
      [68, 44],
    ].map(([bx, by]) => ({
      washer: cylinder(bx, by, 4.8, 54, 1.5, PUMP_PROJECTION, 14),
      hexHead: cylinder(bx, by, 3.8, 55.5, 4.5, PUMP_PROJECTION, 6),
      topDot: atPump([bx, by, 60]),
    })),
  },
};

export function getPartTransform(
  machineId: string,
  partId: string,
  extractAmount: number
): string {
  if (extractAmount <= 0.001) return '';
  const vectors =
    machineId === 'gearbox-reducer' || machineId === 'gearbox-helical-ind'
      ? GEARBOX_ANATOMY_VECTORS
      : PUMP_ANATOMY_VECTORS;
  const entry = vectors[partId];
  if (!entry) return '';
  const [dx, dy, dz] = entry.explodeVector;
  return translateAlong(PUMP_PROJECTION, [
    dx * extractAmount,
    dy * extractAmount,
    dz * extractAmount,
  ]);
}
