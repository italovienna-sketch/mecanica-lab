import * as THREE from 'three';
import { createPumpMaterials, PumpMaterials } from './pumpModel';

/**
 * Modelo 3D procedural de uma bomba de engrenagens externas (dentes retos), do tipo usado em
 * hidráulica e transferência de óleo. Modelo educacional simplificado (CC0, feito no projeto):
 * não reproduz um fabricante ou modelo comercial, e o perfil dos dentes é aproximado (não é um
 * perfil evolvente exato).
 *
 * Sistema de coordenadas: eixos das engrenagens ao longo de X (−X = lado do acionamento, onde fica
 * o flange de montagem; +X = tampa traseira). Y para cima. 1 unidade ≈ 20 mm.
 * Engrenagem motora em y = +0,55 e engrenagem movida em y = −0,55. Entrada e saída nas laterais (±Z),
 * na altura do engrenamento.
 *
 * Cada peça é um THREE.Group com `name` igual ao ID da peça em mechanicalMachines.ts.
 */

const CENTER = 0.55; // metade da distância entre centros
const TEETH = 12;
const PITCH_R = CENTER; // engrenagens iguais: raio primitivo = metade da distância entre centros
const MODULE = (2 * PITCH_R) / TEETH;
const TIP_R = PITCH_R + MODULE;
const ROOT_R = PITCH_R - 1.25 * MODULE;
const BORE_R = TIP_R + 0.02; // câmara das engrenagens no corpo
const SHAFT_R = 0.2;
const FACE = 0.4; // meia largura da engrenagem
const BODY_X: [number, number] = [-0.75, 0.75];
const BODY_H = 1.45; // meia altura do corpo
const BODY_W = 0.9; // meia largura do corpo (Z)
export const GEAR_PUMP_FLOOR_Y = -1.75;

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

/** Cilindro (ou prisma) ao longo de X entre x0 e x1, centrado em (y, z). */
function cylX(r: number, x0: number, x1: number, segments: number, y = 0, z = 0): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), segments);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, y, z);
  return g;
}

/** Anel ao longo de X. */
function ringX(rIn: number, rOut: number, x0: number, x1: number, segments: number, y = 0, z = 0): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return extrudeX(shape, x0, x1, segments, y, z);
}

/**
 * Extruda um perfil desenhado no plano (s, y) ao longo de X. O eixo `s` do desenho vira −Z na cena,
 * então perfis simétricos em s não mudam.
 */
function extrudeX(shape: THREE.Shape, x0: number, x1: number, curveSegments: number, y = 0, z = 0, bevel = 0): THREE.BufferGeometry {
  const depth = x1 - x0 - bevel * 2;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1
  });
  g.rotateY(Math.PI / 2); // z do extrude → x da cena
  g.translate(x0 + bevel, y, z);
  return g;
}

/** Retângulo de cantos arredondados centrado na origem (plano s, y). */
function roundedRect(halfW: number, halfH: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-halfW + r, -halfH);
  s.lineTo(halfW - r, -halfH);
  s.absarc(halfW - r, -halfH + r, r, -Math.PI / 2, 0, false);
  s.lineTo(halfW, halfH - r);
  s.absarc(halfW - r, halfH - r, r, 0, Math.PI / 2, false);
  s.lineTo(-halfW + r, halfH);
  s.absarc(-halfW + r, halfH - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-halfW, -halfH + r);
  s.absarc(-halfW + r, -halfH + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Contorno em "8": união de dois círculos de raio r com centros em y = ±CENTER. */
function figureEight(r: number, path: THREE.Path | THREE.Shape) {
  const a = Math.asin(Math.min(1, CENTER / r)); // ângulo do ponto de encontro dos círculos (y = 0)
  // Círculo de cima, passando por cima (de −(90°−a)… até 180°+(90°−a))
  path.absarc(0, CENTER, r, -(Math.PI / 2 - a), Math.PI + (Math.PI / 2 - a), false);
  // Círculo de baixo, passando por baixo
  path.absarc(0, -CENTER, r, Math.PI / 2 + (Math.PI / 2 - a), Math.PI * 2 + (Math.PI / 2 - a), false);
  return path;
}

/** Perfil aproximado de engrenagem de dentes retos (plano s, y), centrado na origem. */
function gearShape(phase: number, samplesPerTooth: number): THREE.Shape {
  const pts: THREE.Vector2[] = [];
  const total = TEETH * samplesPerTooth;
  for (let i = 0; i < total; i++) {
    const theta = (i / total) * Math.PI * 2;
    // f: posição dentro do passo do dente (0..1). Centro do dente em f = 0,5.
    let f = ((theta - phase) / ((Math.PI * 2) / TEETH)) % 1;
    if (f < 0) f += 1;
    let r: number;
    if (f < 0.18 || f > 0.82) r = ROOT_R;
    else if (f < 0.36) r = ROOT_R + (TIP_R - ROOT_R) * Math.sin(((f - 0.18) / 0.18) * (Math.PI / 2));
    else if (f <= 0.64) r = TIP_R;
    else r = ROOT_R + (TIP_R - ROOT_R) * Math.sin(((0.82 - f) / 0.18) * (Math.PI / 2));
    pts.push(new THREE.Vector2(Math.cos(theta) * r, Math.sin(theta) * r));
  }
  return new THREE.Shape(pts);
}

function hexBoltX(mat: THREE.Material, headX: number, x1: number, y: number, z: number): THREE.Mesh[] {
  const head = mesh(cylX(0.14, headX, headX + 0.12, 6, y, z), mat);
  const washer = mesh(cylX(0.16, headX - 0.02, headX, 18, y, z), mat);
  const shank = mesh(cylX(0.075, x1, headX - 0.02, 12, y, z), mat);
  return [head, washer, shank];
}

export function buildGearPump(quality: 'high' | 'low'): { root: THREE.Group; parts: Map<string, THREE.Group>; materials: PumpMaterials; environment: THREE.Group } {
  const S = quality === 'high' ? 40 : 20;
  const M = createPumpMaterials();
  const alu = new THREE.MeshStandardMaterial({ color: 0x9aa3ab, metalness: 0.75, roughness: 0.42, side: THREE.DoubleSide });
  const root = new THREE.Group();
  root.name = 'gear-pump-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string) => {
    const g = new THREE.Group();
    g.name = id;
    parts.set(id, g);
    root.add(g);
    return g;
  };

  /* ───────────── CORPO (câmara em "8" onde giram as engrenagens) ───────────── */
  const body = part('gp-body');
  const bodyShape = roundedRect(BODY_W, BODY_H, 0.18);
  bodyShape.holes.push(figureEight(BORE_R, new THREE.Path()));
  body.add(mesh(extrudeX(bodyShape, BODY_X[0], BODY_X[1], S), alu));
  // Bocais de entrada (maior) e saída (menor), na altura do engrenamento
  const ports: [number, number][] = [
    [1, 0.34], // +Z: entrada
    [-1, 0.26] // −Z: saída
  ];
  ports.forEach(([side, r]) => {
    const boss = new THREE.CylinderGeometry(r + 0.12, r + 0.12, 0.14, S);
    boss.rotateX(Math.PI / 2);
    boss.translate(0, 0, side * (BODY_W + 0.07));
    body.add(mesh(boss, alu));
    const hole = new THREE.CylinderGeometry(r, r, 0.02, S);
    hole.rotateX(Math.PI / 2);
    hole.translate(0, 0, side * (BODY_W + 0.145));
    body.add(mesh(hole, M.hole, false));
    // Furos roscados de fixação do flange da tubulação
    [-1, 1].forEach((k) => {
      const t = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10);
      t.rotateX(Math.PI / 2);
      t.translate(0, k * (r + 0.32), side * (BODY_W + 0.005));
      body.add(mesh(t, M.hole, false));
    });
  });

  /* ───────────── FLANGE DIANTEIRO (montagem no motor ou no suporte) ───────────── */
  const flange = part('gp-front-flange');
  const flangeShape = roundedRect(1.6, BODY_H, 0.35);
  // Furo do eixo motor (o selo fica alojado aqui dentro)
  const shaftHole = new THREE.Path();
  shaftHole.absarc(0, CENTER, SHAFT_R + 0.02, 0, Math.PI * 2, true);
  flangeShape.holes.push(shaftHole);
  // Furos de fixação nas "orelhas"
  [-1.3, 1.3].forEach((s) => {
    const h = new THREE.Path();
    h.absarc(s, 0, 0.12, 0, Math.PI * 2, true);
    flangeShape.holes.push(h);
  });
  flange.add(mesh(extrudeX(flangeShape, -1.05, BODY_X[0], S), alu));
  // Guia de centragem (piloto) em volta do eixo
  flange.add(mesh(ringX(SHAFT_R + 0.02, 0.6, -1.2, -1.05, S, CENTER), alu));

  /* ───────────── TAMPA TRASEIRA ───────────── */
  const cover = part('gp-rear-cover');
  cover.add(mesh(extrudeX(roundedRect(BODY_W, BODY_H, 0.18), BODY_X[1], 1.0, S, 0, 0, 0.02), alu));

  /* ───────────── PARAFUSOS PASSANTES (4) ───────────── */
  const bolts = part('gp-bolts');
  const BOLT_POS: [number, number][] = [
    [1.18, 0.62],
    [1.18, -0.62],
    [-1.18, 0.62],
    [-1.18, -0.62]
  ];
  BOLT_POS.forEach(([y, z]) => bolts.add(...hexBoltX(M.zinc, 1.02, -0.95, y, z)));

  /* ───────────── MANCAIS (blocos em "8" com buchas) ───────────── */
  const bearingBlock = (id: string, x0: number, x1: number) => {
    const g = part(id);
    const shape = figureEight(BORE_R - 0.005, new THREE.Shape()) as THREE.Shape;
    [CENTER, -CENTER].forEach((y) => {
      const h = new THREE.Path();
      h.absarc(0, y, SHAFT_R + 0.005, 0, Math.PI * 2, true);
      shape.holes.push(h);
    });
    g.add(mesh(extrudeX(shape, x0, x1, S), M.bronze));
    // Buchas (faixa mais escura dentro dos furos)
    [CENTER, -CENTER].forEach((y) => g.add(mesh(ringX(SHAFT_R + 0.005, SHAFT_R + 0.04, x0 - 0.002, x1 + 0.002, S, y), M.carbon)));
    return g;
  };
  bearingBlock('gp-bearing-front', -0.72, -FACE - 0.01);
  bearingBlock('gp-bearing-rear', FACE + 0.01, 0.72);

  /* ───────────── ENGRENAGENS ───────────── */
  const pitch = (Math.PI * 2) / TEETH;
  const samples = quality === 'high' ? 16 : 8;
  // Motora: dente centrado apontando para baixo (−90°). Movida: vão apontando para cima, deslocada meio passo.
  const drivePhase = -Math.PI / 2 - pitch * 0.5;
  const drivenPhase = Math.PI / 2;

  const drive = part('gp-drive-gear');
  drive.add(mesh(extrudeX(gearShape(drivePhase, samples), -FACE, FACE, 1, CENTER, 0, 0.01), M.steel));
  drive.add(mesh(cylX(SHAFT_R, -1.65, 0.72, S, CENTER), M.chrome));
  // Rasgo de chaveta (faixa escura na ponta do eixo)
  const keyway = new THREE.BoxGeometry(0.4, 0.02, 0.1);
  keyway.translate(-1.4, CENTER + SHAFT_R - 0.005, 0);
  drive.add(mesh(keyway, M.hole, false));

  const driven = part('gp-driven-gear');
  driven.add(mesh(extrudeX(gearShape(drivenPhase, samples), -FACE, FACE, 1, -CENTER, 0, 0.01), M.steel));
  driven.add(mesh(cylX(SHAFT_R, -0.72, 0.72, S, -CENTER), M.chrome));

  /* ───────────── CHAVETA ───────────── */
  const key = part('gp-key');
  const keyGeo = new THREE.BoxGeometry(0.36, 0.1, 0.1);
  keyGeo.translate(-1.4, CENTER + SHAFT_R + 0.03, 0);
  key.add(mesh(keyGeo, M.steel));

  /* ───────────── RETENTOR DO EIXO (dentro do flange dianteiro) ───────────── */
  const seal = part('gp-shaft-seal');
  seal.add(mesh(ringX(SHAFT_R, SHAFT_R + 0.13, -1.0, -0.88, S, CENTER), M.rubber));
  seal.add(mesh(ringX(SHAFT_R + 0.1, SHAFT_R + 0.15, -0.995, -0.885, S, CENTER), M.steel));

  /* ───────────── AMBIENTE (apoios de bancada; não são peças da bomba) ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';
  const supportMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.6, roughness: 0.5 });
  [-0.45, 0.45].forEach((x) => {
    const h = -BODY_H - GEAR_PUMP_FLOOR_Y;
    const b = mesh(new THREE.BoxGeometry(0.28, h, 1.4), supportMat);
    b.position.set(x, GEAR_PUMP_FLOOR_Y + h / 2, 0);
    environment.add(b);
  });

  return { root, parts, materials: M, environment };
}
