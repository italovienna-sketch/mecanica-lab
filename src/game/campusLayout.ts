import type { AvatarCustomization, GameScreen } from '../types/game';
import { SPAWN } from './spawn';

/**
 * Planta do campus 2D (Oficina 2D). Só dados e funções puras: a cena Phaser desenha a partir daqui,
 * o minimapa em React também, e os testes conferem colisões e portas sem abrir o navegador.
 *
 * Coordenadas em pixels do mundo, origem no canto superior esquerdo.
 * Salas de cima (y 40–440) e de baixo (y 560–1060) se abrem para o corredor central (y 440–560).
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Side = 'top' | 'bottom' | 'left' | 'right';

export interface Door {
  side: Side;
  /** Início da abertura ao longo da parede (x para top/bottom, y para left/right), em coordenadas do mundo. */
  from: number;
  to: number;
}

/** Itens de EPI que uma sala pode exigir na simulação. */
export type PpeItem = 'oculos' | 'calcado' | 'sem_adornos';

export interface Room {
  id: string;
  /** Código curto, como numa planta (aparece no carimbo da sala). */
  code: string;
  name: string;
  /** Para que serve a sala (aparece no minimapa e no aviso ao entrar). */
  purpose: string;
  rect: Rect;
  doors: Door[];
  floor: 'concrete' | 'lab' | 'wood' | 'tile';
  /**
   * EPIs exigidos para entrar nesta atividade da simulação. É uma regra didática configurável,
   * não uma análise de riscos real.
   */
  ppe?: PpeItem[];
}

export type PropKind = 'bench' | 'machine' | 'lathe' | 'table' | 'shelf' | 'desk' | 'locker' | 'board' | 'plant' | 'sofa' | 'cabinet';

export interface Prop {
  kind: PropKind;
  rect: Rect;
  /** Props decorativos sem colisão (ex.: tapete, faixa no piso) não entram aqui; todo prop é sólido. */
  label?: string;
}

export interface CampusStation {
  id: string;
  roomId: string;
  name: string;
  /** Complemento do convite: "Pressione E para …". */
  action: string;
  targetRoute: GameScreen;
  paramId?: string;
  /** Ponto onde o personagem fica para usar a estação (na frente do móvel). */
  x: number;
  y: number;
}

export const WORLD = { width: 1600, height: 1100 } as const;
export const WALL = 12;
/** Corpo de colisão do personagem (quadrado centrado nos pés). */
export const PLAYER_BODY = 26;
/** Distância máxima (px) até o ponto da estação para mostrar o convite de interação. */
export const INTERACT_RADIUS = 64;

const CORRIDOR: Rect = { x: 40, y: 440, w: 1520, h: 120 };

export const ROOMS: Room[] = [
  {
    id: 'oficina',
    code: 'S1',
    name: 'Oficina mecânica',
    purpose: 'Bancadas do laboratório 3D (bomba, redutor e torno) e a mesa de montagem de rolamentos.',
    rect: { x: 40, y: 40, w: 720, h: 400 },
    doors: [{ side: 'bottom', from: 360, to: 440 }],
    floor: 'concrete',
    ppe: ['oculos', 'calcado', 'sem_adornos']
  },
  {
    id: 'metrologia',
    code: 'S2',
    name: 'Laboratório de metrologia',
    purpose: 'Leitura de paquímetro e micrômetro.',
    rect: { x: 760, y: 40, w: 380, h: 400 },
    doors: [{ side: 'bottom', from: 790, to: 870 }],
    floor: 'lab'
  },
  {
    id: 'desenho',
    code: 'S3',
    name: 'Sala de desenho técnico',
    purpose: 'Pranchas dos equipamentos e a trilha de desenho técnico.',
    rect: { x: 1140, y: 40, w: 420, h: 400 },
    doors: [{ side: 'bottom', from: 1180, to: 1260 }],
    floor: 'wood'
  },
  {
    id: 'desafios',
    code: 'S4',
    name: 'Desafios de segurança',
    purpose: 'Inspeção da oficina, EPI para a tarefa e diagnóstico de falhas.',
    rect: { x: 40, y: 560, w: 480, h: 500 },
    doors: [{ side: 'top', from: 80, to: 160 }],
    floor: 'tile'
  },
  {
    id: 'convivencia',
    code: 'S5',
    name: 'Área de convivência',
    purpose: 'Vestiário do personagem e mural de conquistas.',
    rect: { x: 520, y: 560, w: 540, h: 500 },
    doors: [{ side: 'top', from: 560, to: 800 }],
    floor: 'tile'
  },
  {
    id: 'biblioteca',
    code: 'S6',
    name: 'Biblioteca',
    purpose: 'Trilhas de estudo, aulas rápidas e questões.',
    rect: { x: 1060, y: 560, w: 500, h: 500 },
    doors: [{ side: 'top', from: 1100, to: 1180 }],
    floor: 'wood'
  }
];

export const ROOMS_BY_ID: Record<string, Room> = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

export const CORRIDOR_AREA = { id: 'corredor', name: 'Corredor central', rect: CORRIDOR };

export const PROPS: Prop[] = [
  // S1 · Oficina: três bancadas do laboratório 3D encostadas na parede do fundo, a bancada de ferramentas e a mesa de rolamentos
  { kind: 'machine', rect: { x: 90, y: 64, w: 140, h: 70 }, label: 'Bomba centrífuga' },
  { kind: 'machine', rect: { x: 290, y: 64, w: 140, h: 70 }, label: 'Redutor' },
  { kind: 'lathe', rect: { x: 490, y: 64, w: 200, h: 64 }, label: 'Torno' },
  { kind: 'bench', rect: { x: 680, y: 210, w: 56, h: 150 }, label: 'Ferramentas' },
  { kind: 'cabinet', rect: { x: 64, y: 300, w: 48, h: 110 } },
  { kind: 'table', rect: { x: 190, y: 250, w: 120, h: 60 }, label: 'Rolamentos' },
  // S2 · Metrologia: mesa central de medição (desempeno) e duas bancadas laterais
  { kind: 'table', rect: { x: 880, y: 150, w: 140, h: 80 }, label: 'Desempeno' },
  { kind: 'bench', rect: { x: 784, y: 190, w: 48, h: 150 }, label: 'Paquímetro' },
  { kind: 'bench', rect: { x: 1068, y: 190, w: 48, h: 150 }, label: 'Micrômetro' },
  { kind: 'cabinet', rect: { x: 1060, y: 64, w: 56, h: 60 } },
  { kind: 'cabinet', rect: { x: 1000, y: 380, w: 116, h: 40 } },
  // S3 · Desenho técnico: pranchetas e mapoteca
  { kind: 'desk', rect: { x: 1190, y: 120, w: 110, h: 64 }, label: 'Prancheta' },
  { kind: 'desk', rect: { x: 1400, y: 120, w: 110, h: 64 }, label: 'Prancheta' },
  { kind: 'cabinet', rect: { x: 1164, y: 300, w: 120, h: 50 }, label: 'Mapoteca' },
  { kind: 'board', rect: { x: 1440, y: 52, w: 100, h: 16 } },
  // S4 · Desafios: três mesas de estudo de caso e o quadro
  { kind: 'board', rect: { x: 120, y: 1032, w: 320, h: 16 } },
  { kind: 'table', rect: { x: 80, y: 700, w: 120, h: 70 }, label: 'Inspeção' },
  { kind: 'table', rect: { x: 340, y: 700, w: 120, h: 70 }, label: 'EPI' },
  { kind: 'table', rect: { x: 210, y: 880, w: 120, h: 70 }, label: 'Diagnóstico' },
  // S5 · Convivência: armários (vestiário), mural, sofás e plantas
  { kind: 'locker', rect: { x: 544, y: 640, w: 40, h: 180 }, label: 'Vestiário' },
  { kind: 'board', rect: { x: 720, y: 1032, w: 220, h: 16 }, label: 'Mural' },
  { kind: 'sofa', rect: { x: 760, y: 780, w: 140, h: 44 } },
  { kind: 'table', rect: { x: 790, y: 840, w: 80, h: 50 } },
  { kind: 'plant', rect: { x: 1010, y: 1000, w: 36, h: 36 } },
  { kind: 'plant', rect: { x: 1010, y: 600, w: 36, h: 36 } },
  // S6 · Biblioteca: estantes e mesas de estudo
  { kind: 'shelf', rect: { x: 1090, y: 1000, w: 200, h: 40 } },
  { kind: 'shelf', rect: { x: 1330, y: 1000, w: 200, h: 40 } },
  { kind: 'shelf', rect: { x: 1500, y: 640, w: 40, h: 260 } },
  { kind: 'table', rect: { x: 1120, y: 700, w: 130, h: 70 }, label: 'Estudo' },
  { kind: 'table', rect: { x: 1300, y: 760, w: 130, h: 70 }, label: 'Questões' }
];

export const STATIONS: CampusStation[] = [
  // S1 · Oficina
  { id: 'st-bomba', roomId: 'oficina', name: 'Bomba centrífuga (3D)', action: 'explorar e desmontar a bomba', targetRoute: 'lab', paramId: 'centrifugal-pump', x: 160, y: 168 },
  { id: 'st-redutor', roomId: 'oficina', name: 'Redutor de engrenagens (3D)', action: 'explorar e desmontar o redutor', targetRoute: 'lab', paramId: 'gearbox-reducer', x: 360, y: 168 },
  { id: 'st-torno', roomId: 'oficina', name: 'Torno mecânico (3D)', action: 'conhecer o torno e a segurança na usinagem', targetRoute: 'lab', paramId: 'conventional-lathe', x: 590, y: 162 },
  { id: 'st-rolamentos', roomId: 'oficina', name: 'Montagem de rolamentos', action: 'montar a sequência de troca de rolamento', targetRoute: 'games', paramId: 'montagem-rolamento', x: 250, y: 345 },
  { id: 'st-ferramentas', roomId: 'oficina', name: 'Bancada de ferramentas', action: 'ver chaves, torquímetro e extratores', targetRoute: 'tools', paramId: 'chave-combinada', x: 640, y: 285 },
  // S2 · Metrologia
  { id: 'st-mestre-metrologia', roomId: 'metrologia', name: 'Mestre da Metrologia', action: 'começar o desafio de leituras', targetRoute: 'games', paramId: 'mestre-metrologia', x: 950, y: 270 },
  { id: 'st-paquimetro', roomId: 'metrologia', name: 'Treino de paquímetro', action: 'treinar a leitura do paquímetro', targetRoute: 'tools', paramId: 'treino-paquimetro', x: 862, y: 300 },
  { id: 'st-micrometro', roomId: 'metrologia', name: 'Treino de micrômetro', action: 'treinar a leitura do micrômetro', targetRoute: 'tools', paramId: 'treino-micrometro', x: 1038, y: 300 },
  // S3 · Desenho técnico
  { id: 'st-pranchas', roomId: 'desenho', name: 'Pranchas dos equipamentos', action: 'ver os desenhos da planta-escola', targetRoute: 'industry', paramId: 'desenhos', x: 1245, y: 218 },
  { id: 'st-trilha-desenho', roomId: 'desenho', name: 'Trilha de desenho técnico', action: 'abrir a trilha de desenho técnico', targetRoute: 'courses', paramId: 'desenho-tecnico', x: 1455, y: 218 },
  // S4 · Desafios
  { id: 'st-inspecao', roomId: 'desafios', name: 'Inspeção de segurança', action: 'encontrar os riscos da oficina', targetRoute: 'games', paramId: 'inspecao-oficina', x: 140, y: 806 },
  { id: 'st-epi', roomId: 'desafios', name: 'EPI certo para a tarefa', action: 'escolher os EPIs de cada tarefa', targetRoute: 'games', paramId: 'epi-tarefa', x: 400, y: 806 },
  { id: 'st-diagnostico', roomId: 'desafios', name: 'Diagnóstico de falhas', action: 'investigar sintomas de falha', targetRoute: 'games', paramId: 'diagnostico', x: 270, y: 986 },
  // S5 · Convivência
  { id: 'st-vestiario', roomId: 'convivencia', name: 'Vestiário', action: 'trocar roupa, cabelo e EPIs do personagem', targetRoute: 'character', x: 620, y: 730 },
  { id: 'st-mural', roomId: 'convivencia', name: 'Mural de conquistas', action: 'ver seu progresso', targetRoute: 'progress', x: 830, y: 990 },
  // S6 · Biblioteca
  { id: 'st-trilhas', roomId: 'biblioteca', name: 'Trilhas de estudo', action: 'escolher uma trilha', targetRoute: 'courses', x: 1185, y: 806 },
  { id: 'st-aulas', roomId: 'biblioteca', name: 'Aulas rápidas', action: 'ver uma aula curta', targetRoute: 'micro', x: 1390, y: 956 },
  { id: 'st-questoes', roomId: 'biblioteca', name: 'Mesa de questões', action: 'praticar com questões', targetRoute: 'practice', x: 1365, y: 866 },
  // Corredor
  { id: 'st-planta', roomId: 'corredor', name: 'Visita à planta-escola', action: 'conhecer a planta industrial fictícia', targetRoute: 'industry', paramId: 'planta', x: 90, y: 500 },
  { id: 'st-coordenacao', roomId: 'corredor', name: 'Coordenação', action: 'abrir a área do instrutor', targetRoute: 'teacher', x: 1510, y: 500 }
];

export { SPAWN } from './spawn';

/* ───────────────────────── Geometria ───────────────────────── */

/**
 * Paredes sólidas de uma sala: os quatro lados menos as aberturas das portas.
 * Lados encostados no corredor ou em outra sala geram parede duplicada; não faz mal para colisão.
 */
export function roomWalls(room: Room): Rect[] {
  const { x, y, w, h } = room.rect;
  const walls: Rect[] = [];
  const horizontal = (side: 'top' | 'bottom', wy: number) => {
    const gaps = room.doors.filter((d) => d.side === side).sort((a, b) => a.from - b.from);
    let start = x;
    for (const g of gaps) {
      if (g.from > start) walls.push({ x: start, y: wy, w: g.from - start, h: WALL });
      start = g.to;
    }
    if (x + w > start) walls.push({ x: start, y: wy, w: x + w - start, h: WALL });
  };
  const vertical = (side: 'left' | 'right', wx: number) => {
    const gaps = room.doors.filter((d) => d.side === side).sort((a, b) => a.from - b.from);
    let start = y;
    for (const g of gaps) {
      if (g.from > start) walls.push({ x: wx, y: start, w: WALL, h: g.from - start });
      start = g.to;
    }
    if (y + h > start) walls.push({ x: wx, y: start, w: WALL, h: y + h - start });
  };
  horizontal('top', y - WALL / 2);
  horizontal('bottom', y + h - WALL / 2);
  vertical('left', x - WALL / 2);
  vertical('right', x + w - WALL / 2);
  return walls;
}

/** Paredes externas do corredor nas pontas (as laterais de cima/baixo já são as paredes das salas). */
const CORRIDOR_END_WALLS: Rect[] = [
  { x: CORRIDOR.x - WALL / 2, y: CORRIDOR.y, w: WALL, h: CORRIDOR.h },
  { x: CORRIDOR.x + CORRIDOR.w - WALL / 2, y: CORRIDOR.y, w: WALL, h: CORRIDOR.h }
];

export const SOLID_WALLS: Rect[] = [...ROOMS.flatMap(roomWalls), ...CORRIDOR_END_WALLS];

/** Faixa que fecha a porta de uma sala com exigência de EPI enquanto o personagem não estiver equipado. */
export function doorGate(room: Room): Rect | null {
  const d = room.doors[0];
  if (!d) return null;
  if (d.side === 'bottom') return { x: d.from, y: room.rect.y + room.rect.h - WALL / 2, w: d.to - d.from, h: WALL };
  if (d.side === 'top') return { x: d.from, y: room.rect.y - WALL / 2, w: d.to - d.from, h: WALL };
  if (d.side === 'left') return { x: room.rect.x - WALL / 2, y: d.from, w: WALL, h: d.to - d.from };
  return { x: room.rect.x + room.rect.w - WALL / 2, y: d.from, w: WALL, h: d.to - d.from };
}

export const intersects = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export const playerRect = (x: number, y: number): Rect => ({
  x: x - PLAYER_BODY / 2,
  y: y - PLAYER_BODY / 2,
  w: PLAYER_BODY,
  h: PLAYER_BODY
});

/** O personagem pode ficar parado neste ponto? (dentro do mundo, fora de paredes e móveis). */
export function isWalkable(x: number, y: number, extraSolids: Rect[] = []): boolean {
  const p = playerRect(x, y);
  if (p.x < 0 || p.y < 0 || p.x + p.w > WORLD.width || p.y + p.h > WORLD.height) return false;
  const inside = [...ROOMS.map((r) => r.rect), CORRIDOR].some((r) => p.x >= r.x && p.y >= r.y && p.x + p.w <= r.x + r.w && p.y + p.h <= r.y + r.h);
  if (!inside) {
    // Atravessando uma porta o retângulo fica entre duas áreas; vale se não bater em nada sólido.
    const anyOverlap = [...ROOMS.map((r) => r.rect), CORRIDOR].some((r) => intersects(p, r));
    if (!anyOverlap) return false;
  }
  return ![...SOLID_WALLS, ...PROPS.map((pr) => pr.rect), ...extraSolids].some((s) => intersects(p, s));
}

/** Em que área está o ponto (sala ou corredor)? */
export function areaAt(x: number, y: number): { id: string; name: string } | null {
  const room = ROOMS.find((r) => x >= r.rect.x && x < r.rect.x + r.rect.w && y >= r.rect.y && y < r.rect.y + r.rect.h);
  if (room) return { id: room.id, name: room.name };
  const c = CORRIDOR;
  if (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h) return { id: CORRIDOR_AREA.id, name: CORRIDOR_AREA.name };
  return null;
}

/** Estação mais próxima dentro do raio de interação, ou null. */
export function nearestStation(x: number, y: number, stations: CampusStation[] = STATIONS): CampusStation | null {
  let best: CampusStation | null = null;
  let bestD = INTERACT_RADIUS;
  for (const s of stations) {
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

/** Ponto logo fora da porta da sala, no corredor (usado pelo atalho do minimapa). */
export function roomEntrance(roomId: string): { x: number; y: number } {
  if (roomId === CORRIDOR_AREA.id) return { x: SPAWN.x, y: CORRIDOR.y + CORRIDOR.h / 2 };
  const room = ROOMS_BY_ID[roomId];
  const d = room?.doors[0];
  if (!room || !d) return { ...SPAWN };
  const mid = (d.from + d.to) / 2;
  if (d.side === 'bottom') return { x: mid, y: room.rect.y + room.rect.h + 40 };
  if (d.side === 'top') return { x: mid, y: room.rect.y - 40 };
  if (d.side === 'left') return { x: room.rect.x - 40, y: mid };
  return { x: room.rect.x + room.rect.w + 40, y: mid };
}

/* ───────────────────────── EPI por contexto ───────────────────────── */

export const PPE_LABEL: Record<PpeItem, string> = {
  oculos: 'Óculos de segurança',
  calcado: 'Calçado de segurança (bota com biqueira)',
  sem_adornos: 'Sem colar, relógio ou outros adornos'
};

export const PPE_REASON: Record<PpeItem, string> = {
  oculos: 'Cavacos e respingos podem atingir os olhos perto das máquinas.',
  calcado: 'Peças e ferramentas podem cair nos pés.',
  sem_adornos: 'Colares, relógios e outros adornos podem enroscar em partes que giram.'
};

/** Quais itens exigidos o visual atual ainda não atende. Lista vazia = pode entrar. */
export function missingPpe(c: Pick<AvatarCustomization, 'hasSafetyGlasses' | 'shoeStyle' | 'accessoryType'>, required: PpeItem[] = []): PpeItem[] {
  return required.filter((item) => {
    if (item === 'oculos') return !c.hasSafetyGlasses;
    if (item === 'calcado') return c.shoeStyle !== 'bota_composite';
    if (item === 'sem_adornos') return c.accessoryType === 'colar_alt' || c.accessoryType === 'relogio_tecnico';
    return false;
  });
}

/** Ajustes mínimos no visual para atender aos itens que faltam (o resto do estilo continua igual). */
export function ppeFix(missing: PpeItem[]): Partial<AvatarCustomization> {
  const fix: Partial<AvatarCustomization> = {};
  if (missing.includes('oculos')) fix.hasSafetyGlasses = true;
  if (missing.includes('calcado')) fix.shoeStyle = 'bota_composite';
  if (missing.includes('sem_adornos')) fix.accessoryType = 'nenhum';
  return fix;
}
