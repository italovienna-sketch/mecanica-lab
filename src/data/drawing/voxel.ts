/**
 * Peças de cubinhos para o treino de vistas. Tudo sai do mesmo modelo (isométrica, vistas, seções e alternativas erradas),
 * então desenho e resposta nunca discordam. São sólidos didáticos, não peças reais.
 *
 * Eixos: x da esquerda para a direita, y da frente para trás, z de baixo para cima.
 * `layers[z][y][x]`: a primeira camada é a de baixo; a primeira linha de cada camada é a da frente.
 */
export interface VoxelShape {
  id: string;
  name: string;
  layers: string[][];
}

export type ViewId = 'frontal' | 'superior' | 'lateral';
export type Grid = (number | null)[][];

export const VIEW_LABEL: Record<ViewId, string> = { frontal: 'Vista frontal', superior: 'Vista superior', lateral: 'Vista lateral esquerda' };

export const SHAPES: VoxelShape[] = [
  {
    id: 'degrau',
    name: 'Bloco em degraus',
    layers: [
      ['####', '####', '####'],
      ['##..', '##..', '##..'],
      ['#...', '#...', '#...']
    ]
  },
  {
    id: 'canal',
    name: 'Bloco com canal',
    layers: [
      ['####', '####', '####'],
      ['#..#', '#..#', '####'],
      ['....', '....', '####']
    ]
  },
  {
    id: 'canto',
    name: 'Calço de canto',
    layers: [
      ['###.', '####', '####'],
      ['....', '#...', '###.'],
      ['....', '....', '#...']
    ]
  },
  {
    id: 'mancal',
    name: 'Suporte com rebaixo',
    layers: [
      ['####', '####', '####'],
      ['.##.', '.##.', '####'],
      ['.#..', '.#..', '.#..']
    ]
  },
  {
    id: 'garfo',
    name: 'Garfo',
    layers: [
      ['#..#', '#..#', '####', '####'],
      ['#..#', '#..#', '####', '....']
    ]
  }
];

export const SHAPES_BY_ID = Object.fromEntries(SHAPES.map((s) => [s.id, s]));

export const dims = (s: VoxelShape) => ({ w: s.layers[0][0].length, d: s.layers[0].length, h: s.layers.length });

export const filled = (s: VoxelShape, x: number, y: number, z: number) => s.layers[z]?.[y]?.[x] === '#';

/** Gira a peça em torno do eixo vertical (de cima, sentido horário), para olhar por outro lado. */
export function rotateShape(s: VoxelShape, turns: number): VoxelShape {
  let layers = s.layers;
  for (let t = 0; t < ((turns % 4) + 4) % 4; t++) {
    layers = layers.map((rows) => {
      const d = rows.length;
      const w = rows[0].length;
      return Array.from({ length: w }, (_, ny) => Array.from({ length: d }, (_, nx) => rows[nx][w - 1 - ny]).join(''));
    });
  }
  return { ...s, layers };
}

/**
 * Vista ortográfica. Cada célula guarda a profundidade do que se vê (null = vazio): é ela que separa uma aresta visível
 * de uma superfície contínua. A orientação é a da folha: na superior a frente da peça fica embaixo; na lateral esquerda
 * a frente da peça fica à direita.
 */
export function viewGrid(s: VoxelShape, view: ViewId): Grid {
  const { w, d, h } = dims(s);
  if (view === 'frontal') {
    return Array.from({ length: h }, (_, r) =>
      Array.from({ length: w }, (_, x) => {
        const z = h - 1 - r;
        for (let y = 0; y < d; y++) if (filled(s, x, y, z)) return y;
        return null;
      })
    );
  }
  if (view === 'superior') {
    return Array.from({ length: d }, (_, r) =>
      Array.from({ length: w }, (_, x) => {
        const y = d - 1 - r;
        for (let z = h - 1; z >= 0; z--) if (filled(s, x, y, z)) return h - 1 - z;
        return null;
      })
    );
  }
  return Array.from({ length: h }, (_, r) =>
    Array.from({ length: d }, (_, c) => {
      const z = h - 1 - r;
      const y = d - 1 - c;
      for (let x = 0; x < w; x++) if (filled(s, x, y, z)) return x;
      return null;
    })
  );
}

/** Seção no plano y = `plane`, vista de frente: só o que o plano corta. */
export function sectionGrid(s: VoxelShape, plane: number): Grid {
  const { w, h } = dims(s);
  return Array.from({ length: h }, (_, r) => Array.from({ length: w }, (_, x) => (filled(s, x, plane, h - 1 - r) ? 0 : null)));
}

export const flipH = (g: Grid): Grid => g.map((r) => [...r].reverse());
export const flipV = (g: Grid): Grid => [...g].reverse();

export const gridKey = (g: Grid) => g.map((r) => r.map((c) => (c === null ? '.' : c)).join('')).join('/');

/** Só o contorno preenchido: duas vistas com a mesma silhueta e arestas internas diferentes continuam distintas em gridKey. */
export const silhouetteKey = (g: Grid) => g.map((r) => r.map((c) => (c === null ? '.' : '#')).join('')).join('/');

export interface ViewOption {
  id: string;
  grid: Grid;
  correct: boolean;
  /** Por que esta alternativa engana. */
  why: string;
}

/** Alternativas sempre visualmente diferentes. Os distratores são erros de verdade: espelhar, inverter, olhar de outro lado. */
export function viewOptions(s: VoxelShape, view: ViewId): ViewOption[] {
  const correct = viewGrid(s, view);
  const candidates: { grid: Grid; why: string }[] = [
    { grid: flipH(correct), why: 'Esta é a vista espelhada: a peça foi olhada do lado oposto.' },
    { grid: flipV(correct), why: 'Esta vista está de cabeça para baixo.' },
    { grid: viewGrid(s, view === 'frontal' ? 'lateral' : 'frontal'), why: `Esta é a ${VIEW_LABEL[view === 'frontal' ? 'lateral' : 'frontal'].toLowerCase()}, não a pedida.` },
    { grid: viewGrid(s, view === 'superior' ? 'lateral' : 'superior'), why: `Esta é a ${VIEW_LABEL[view === 'superior' ? 'lateral' : 'superior'].toLowerCase()}, não a pedida.` },
    { grid: viewGrid(rotateShape(s, 2), view), why: 'Esta vista é da peça girada de meia volta.' }
  ];
  const seen = new Set([gridKey(correct)]);
  const options: ViewOption[] = [{ id: 'certa', grid: correct, correct: true, why: '' }];
  candidates.forEach((c, i) => {
    const key = gridKey(c.grid);
    if (options.length >= 4 || seen.has(key)) return;
    seen.add(key);
    options.push({ id: `d${i}`, grid: c.grid, correct: false, why: c.why });
  });
  return options;
}

/** Alternativas de seção: outros planos da mesma peça e o espelhamento. */
export function sectionOptions(s: VoxelShape, plane: number): ViewOption[] {
  const { d } = dims(s);
  const correct = sectionGrid(s, plane);
  const seen = new Set([gridKey(correct)]);
  const options: ViewOption[] = [{ id: 'certa', grid: correct, correct: true, why: '' }];
  for (let y = 0; y < d; y++) {
    const g = sectionGrid(s, y);
    if (y !== plane && !seen.has(gridKey(g))) {
      seen.add(gridKey(g));
      options.push({ id: `p${y}`, grid: g, correct: false, why: 'Esta seção é de outro plano: o corte passa mais à frente ou mais atrás.' });
    }
  }
  // Peças simétricas têm poucos planos diferentes: estes erros completam as alternativas.
  const extras: { id: string; grid: Grid; why: string }[] = [
    { id: 'esp', grid: flipH(correct), why: 'Esta seção está espelhada.' },
    { id: 'inv', grid: flipV(correct), why: 'Esta seção está de cabeça para baixo.' },
    { id: 'front', grid: viewGrid(s, 'frontal').map((r) => r.map((c) => (c === null ? null : 0))), why: 'Este é o contorno da vista frontal, não o que o plano corta.' },
    { id: 'macico', grid: correct.map((r) => r.map(() => 0)), why: 'A peça não é maciça neste plano: há vazios que a seção precisa mostrar.' }
  ];
  extras.forEach((e) => {
    if (seen.has(gridKey(e.grid))) return;
    seen.add(gridKey(e.grid));
    options.push({ ...e, correct: false });
  });
  return options.slice(0, 4);
}

const U = 22;
const COS = Math.cos(Math.PI / 6);

export const isoPoint = (x: number, y: number, z: number, u = U): [number, number] => [(x - y) * COS * u, -(x + y) * 0.5 * u - z * u];

export interface IsoFace {
  key: string;
  d: string;
  face: 'top' | 'front' | 'left';
}

/** Faces visíveis em isométrica (observador à frente, à esquerda e acima), já na ordem de pintura. */
export function isoFaces(s: VoxelShape): { faces: IsoFace[]; box: { x: number; y: number; w: number; h: number } } {
  const { w, d, h } = dims(s);
  const faces: IsoFace[] = [];
  const pts: [number, number][] = [];
  const poly = (key: string, face: IsoFace['face'], p: [number, number, number][]) => {
    const proj = p.map(([a, b, c]) => isoPoint(a, b, c));
    pts.push(...proj);
    faces.push({ key, face, d: `M${proj.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join('L')}Z` });
  };
  const cubes: [number, number, number][] = [];
  for (let z = 0; z < h; z++) for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) if (filled(s, x, y, z)) cubes.push([x, y, z]);
  cubes.sort((a, b) => b[0] + b[1] - (a[0] + a[1]) || a[2] - b[2]);
  cubes.forEach(([x, y, z]) => {
    const k = `${x}-${y}-${z}`;
    if (!filled(s, x, y - 1, z)) poly(`f${k}`, 'front', [[x, y, z], [x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1]]);
    if (!filled(s, x - 1, y, z)) poly(`l${k}`, 'left', [[x, y, z], [x, y + 1, z], [x, y + 1, z + 1], [x, y, z + 1]]);
    if (!filled(s, x, y, z + 1)) poly(`t${k}`, 'top', [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]);
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  return { faces, box };
}
