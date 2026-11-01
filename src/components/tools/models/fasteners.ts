import * as THREE from 'three';

/**
 * Modelos 3D procedurais dos elementos de fixação (feitos no projeto).
 * 1 unidade = 10 mm, todos em tamanho M10 com proporções representativas das normas citadas
 * na biblioteca — servem para reconhecer formas, não como desenho de fabricação.
 * O eixo do parafuso é X. Cada peça é um grupo com `userData.partId` (IDs em src/data/fasteners.ts).
 */

const zinc = () => new THREE.MeshStandardMaterial({ color: 0xc9cdd2, metalness: 1, roughness: 0.34 });
const blackOxide = () => new THREE.MeshStandardMaterial({ color: 0x3a3c40, metalness: 0.85, roughness: 0.42 });
const nylon = () => new THREE.MeshStandardMaterial({ color: 0xf1efe6, metalness: 0, roughness: 0.6 });
const springSteel = () => new THREE.MeshStandardMaterial({ color: 0x4a4d52, metalness: 0.9, roughness: 0.38 });

const D = 1; // M10
const P = 0.15; // passo 1,5 mm

function part(id: string, root: THREE.Group) {
  const g = new THREE.Group();
  g.name = id;
  g.userData.partId = id;
  root.add(g);
  return g;
}

const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => new THREE.Mesh(geo, mat);

function cylX(r: number, x0: number, x1: number, seg = 40) {
  const g = new THREE.CylinderGeometry(r, r, x1 - x0, seg);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

/** Prisma sextavado ao longo de X (s = distância entre faces). */
function hexX(s: number, x0: number, x1: number) {
  const r = s / 2 / Math.cos(Math.PI / 6);
  const g = new THREE.CylinderGeometry(r, r, x1 - x0, 6);
  g.rotateY(Math.PI / 6);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

/** Rosca: núcleo + filete helicoidal (tubo ao longo de uma hélice). */
function threadX(x0: number, x1: number, mat: THREE.Material, d = D, pitch = P) {
  const group = new THREE.Group();
  group.add(mesh(cylX(d / 2 - 0.55 * pitch, x0, x1, 32), mat));
  const helixR = d / 2 - 0.3 * pitch;
  const turns = (x1 - x0) / pitch;
  const n = Math.max(16, Math.round(turns * 16));
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(x0 + t * (x1 - x0), Math.cos(a) * helixR, Math.sin(a) * helixR));
  }
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.3 * pitch, 5, false);
  group.add(mesh(tube, mat));
  return group;
}

/** Rebaixo sextavado interno visto como um prisma escuro na face da cabeça. */
function socketX(s: number, xFace: number, depth: number, dir: 1 | -1 = -1) {
  const g = hexX(s, Math.min(xFace, xFace + dir * depth), Math.max(xFace, xFace + dir * depth));
  return mesh(g, new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.4, roughness: 0.8 }));
}

function hexBolt(root: THREE.Group) {
  // ISO 4014 M10 × 40 (rosca parcial): cabeça s = 16, k ≈ 6,4; rosca b = 26
  const head = part('cabeca', root);
  head.add(mesh(hexX(1.6, -0.64, 0), zinc()));
  const shank = part('haste', root);
  shank.add(mesh(cylX(D / 2, 0, 1.4), zinc()));
  const thread = part('rosca', root);
  thread.add(threadX(1.4, 4.0, zinc()));
}

function socketHead(root: THREE.Group) {
  // ISO 4762 M10 × 30: cabeça Ø16 × 10, sextavado interno 8
  const head = part('cabeca', root);
  head.add(mesh(cylX(0.8, -1.0, 0), blackOxide()));
  const sock = part('encaixe', root);
  sock.add(socketX(0.8, -1.0, 0.5, 1));
  const thread = part('rosca', root);
  thread.add(mesh(cylX(D / 2, 0, 0.6), blackOxide()));
  thread.add(threadX(0.6, 3.0, blackOxide()));
}

function countersunk(root: THREE.Group) {
  // ISO 10642 M10 × 30: cabeça cônica 90°, Ø20; o comprimento inclui a cabeça
  const head = part('cabeca', root);
  const cone = new THREE.CylinderGeometry(1.0, 0.5, 0.5, 48);
  cone.rotateZ(Math.PI / 2);
  cone.translate(0.25, 0, 0);
  head.add(mesh(cone, blackOxide()));
  head.add(socketX(0.6, 0, 0.4, 1));
  const thread = part('rosca', root);
  thread.add(threadX(0.5, 3.0, blackOxide()));
}

function setScrew(root: THREE.Group) {
  // ISO 4026 M10 × 12, ponta plana
  const enc = part('encaixe', root);
  enc.add(socketX(0.5, 0, 0.4, 1));
  enc.add(threadX(0, 0.9, blackOxide()));
  const tip = part('ponta', root);
  tip.add(threadX(0.9, 1.1, blackOxide()));
  const cham = new THREE.CylinderGeometry(0.38, D / 2 - 0.08, 0.1, 32);
  cham.rotateZ(-Math.PI / 2);
  cham.translate(1.15, 0, 0);
  tip.add(mesh(cham, blackOxide()));
}

function stud(root: THREE.Group) {
  const a = part('rosca-corpo', root);
  a.add(threadX(0, 1.5, zinc()));
  const mid = part('haste', root);
  mid.add(mesh(cylX(D / 2 - 0.06, 1.5, 2.6), zinc()));
  const b = part('rosca-porca', root);
  b.add(threadX(2.6, 5.0, zinc()));
}

function hexNut(root: THREE.Group, nyloc = false) {
  // ISO 4032 M10: s = 16, m ≈ 8,4 · ISO 7040 M10 é mais alta, com anel de náilon
  const h = nyloc ? 0.75 : 0.84;
  const body = part('corpo', root);
  const shape = new THREE.Shape();
  const r = 1.6 / 2 / Math.cos(Math.PI / 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
    if (i === 0) shape.moveTo(p.x, p.y);
    else shape.lineTo(p.x, p.y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, D / 2 - 0.55 * P, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 32 });
  geo.rotateY(Math.PI / 2);
  body.add(mesh(geo, zinc()));
  // filete interno visível pelo furo
  const inner = threadX(0.02, h - 0.02, zinc(), D - 0.12);
  if (nyloc) {
    body.add(inner);
    const ring = part('anel', root);
    ring.add(mesh(cylX(0.74, h, h + 0.25), zinc()));
    const ny = new THREE.TorusGeometry(0.42, 0.08, 12, 40);
    ny.rotateY(Math.PI / 2);
    ny.translate(h + 0.26, 0, 0);
    ring.add(mesh(ny, nylon()));
  } else {
    part('rosca', root).add(inner);
  }
}

function washer(root: THREE.Group, split = false) {
  const body = part('corpo', root);
  if (!split) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.0, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.525, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false, curveSegments: 48 });
    g.rotateY(Math.PI / 2);
    body.add(mesh(g, zinc()));
    return;
  }
  // DIN 127: anel cortado com as pontas desencontradas (representativo)
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = 0.12 + (i / 64) * (Math.PI * 2 - 0.24);
    pts.push(new THREE.Vector3((i / 64) * 0.22, Math.cos(a) * 0.72, Math.sin(a) * 0.72));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, 96, 0.13, 4, false);
  body.add(mesh(g, springSteel()));
}

function circlip(root: THREE.Group) {
  // DIN 471 para eixo de 20 mm (representativo)
  const body = part('corpo', root);
  const shape = new THREE.Shape();
  const ro = 1.35;
  const ri = 0.95;
  const gap = 0.5;
  shape.absarc(0, 0, ro, gap, Math.PI * 2 - gap, false);
  shape.absarc(0, 0, ri, Math.PI * 2 - gap, gap, true);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false, curveSegments: 48 });
  g.rotateY(Math.PI / 2);
  body.add(mesh(g, springSteel()));
  const lugs = part('furos', root);
  [gap, -gap].forEach((a) => {
    const lug = new THREE.Shape();
    lug.absarc(0, 0, 0.3, 0, Math.PI * 2, false);
    const h = new THREE.Path();
    h.absarc(0, 0, 0.12, 0, Math.PI * 2, true);
    lug.holes.push(h);
    const lg = new THREE.ExtrudeGeometry(lug, { depth: 0.12, bevelEnabled: false, curveSegments: 24 });
    lg.translate(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
    lg.rotateY(Math.PI / 2);
    lugs.add(mesh(lg, springSteel()));
  });
}

const BUILDERS: Record<string, (root: THREE.Group) => void> = {
  'parafuso-sextavado': hexBolt,
  'parafuso-allen': socketHead,
  'parafuso-escareado': countersunk,
  'parafuso-sem-cabeca': setScrew,
  prisioneiro: stud,
  'porca-sextavada': (r) => hexNut(r),
  'porca-autotravante': (r) => hexNut(r, true),
  'arruela-lisa': (r) => washer(r),
  'arruela-pressao': (r) => washer(r, true),
  'anel-elastico': circlip
};

/** Giro inicial em Y para mostrar a face que identifica a peça (encaixe, furo, anel). */
const VIEW_YAW: Record<string, number> = {
  'parafuso-sextavado': 0.3,
  'parafuso-allen': 0.6,
  'parafuso-escareado': 0.6,
  'parafuso-sem-cabeca': 0.8,
  'porca-sextavada': -1.0,
  'porca-autotravante': -1.0,
  'arruela-lisa': -1.0,
  'arruela-pressao': -1.0,
  'anel-elastico': -1.0
};

function buildOne(id: string): THREE.Group {
  const root = new THREE.Group();
  root.name = id;
  const inner = new THREE.Group();
  BUILDERS[id](inner);
  // Mantém as peças como filhos diretos de `root` (o visualizador procura userData.partId neles).
  inner.rotation.y = VIEW_YAW[id] ?? 0;
  inner.updateMatrixWorld(true);
  [...inner.children].forEach((child) => {
    child.applyMatrix4(inner.matrix);
    root.add(child);
  });
  return root;
}

/**
 * Modelos disponíveis pelo ID da biblioteca. IDs no formato `comparar:a|b` montam os dois lado a lado
 * (um único visualizador, um único contexto WebGL).
 */
export const FASTENER_IDS_WITH_3D = Object.keys(BUILDERS);

export function buildFastenerModel(id: string): THREE.Group | null {
  if (BUILDERS[id]) return buildOne(id);
  if (!id.startsWith('comparar:')) return null;
  const [a, b] = id.slice('comparar:'.length).split('|');
  if (!BUILDERS[a] || !BUILDERS[b]) return null;
  const root = new THREE.Group();
  [a, b].forEach((pid, i) => {
    const g = buildOne(pid);
    const box = new THREE.Box3().setFromObject(g);
    const c = box.getCenter(new THREE.Vector3());
    g.position.set(-c.x, (i === 0 ? 1.4 : -1.4) - c.y, -c.z);
    // Na comparação, as peças são identificadas pelo fixador inteiro.
    g.children.forEach((child) => {
      child.userData.partId = pid;
    });
    const wrap = new THREE.Group();
    wrap.userData.partId = pid;
    wrap.add(g);
    root.add(wrap);
  });
  return root;
}
