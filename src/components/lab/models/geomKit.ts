import * as THREE from 'three';

/**
 * Pequeno kit de geometria para os modelos procedurais da seção "Indústria na prática".
 * Convenção: eixos das máquinas ao longo de X, Y para cima. Os perfis 2D são desenhados no plano (s, y)
 * e extrudados ao longo de X; o eixo `s` do desenho vira −Z na cena (perfis simétricos em s não mudam).
 */

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

/** Sólido de revolução em torno do eixo X a partir de um perfil [raio, x] (fecha o perfil sozinho). */
export function latheX(profile: [number, number][], segments: number, y = 0, z = 0): THREE.BufferGeometry {
  const closed = [...profile];
  const [r0, x0] = profile[0];
  const [rn, xn] = profile[profile.length - 1];
  if (r0 !== rn || x0 !== xn) closed.push(profile[0]);
  const g = new THREE.LatheGeometry(
    closed.map(([r, x]) => new THREE.Vector2(Math.max(0.0001, r), x)),
    segments
  );
  g.rotateZ(-Math.PI / 2);
  g.translate(0, y, z);
  return g;
}

/** Cilindro (ou prisma, com poucos segmentos) ao longo de X entre x0 e x1, centrado em (y, z). */
export function cylX(r: number, x0: number, x1: number, segments: number, y = 0, z = 0): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), segments);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, y, z);
  return g;
}

/** Cilindro vertical (eixo Y) entre y0 e y1, centrado em (x, z). */
export function cylY(r: number, y0: number, y1: number, segments: number, x = 0, z = 0): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(y1 - y0), segments);
  g.translate(x, (y0 + y1) / 2, z);
  return g;
}

/** Cilindro ao longo de Z entre z0 e z1, centrado em (x, y). */
export function cylZ(r: number, z0: number, z1: number, segments: number, x = 0, y = 0): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(z1 - z0), segments);
  g.rotateX(Math.PI / 2);
  g.translate(x, y, (z0 + z1) / 2);
  return g;
}

/** Anel (tubo) ao longo de X. */
export function ringX(rIn: number, rOut: number, x0: number, x1: number, segments: number, y = 0, z = 0): THREE.BufferGeometry {
  return latheX(
    [
      [rIn, x0],
      [rOut, x0],
      [rOut, x1],
      [rIn, x1]
    ],
    segments,
    y,
    z
  );
}

/** Extruda um perfil do plano (s, y) ao longo de X, de x0 até x1. */
export function extrudeX(shape: THREE.Shape, x0: number, x1: number, curveSegments: number, bevel = 0): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: x1 - x0 - bevel * 2,
    curveSegments,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1
  });
  g.rotateY(Math.PI / 2);
  g.translate(x0 + bevel, 0, 0);
  return g;
}

/** Caixa com centro e meias-medidas. */
export function box(cx: number, cy: number, cz: number, hx: number, hy: number, hz: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2);
  g.translate(cx, cy, cz);
  return g;
}

/** Furo circular (sentido horário) para usar em `shape.holes`. */
export function circleHole(s: number, y: number, r: number): THREE.Path {
  const p = new THREE.Path();
  p.absarc(s, y, r, 0, Math.PI * 2, true);
  return p;
}

/** Parafuso sextavado vertical: cabeça no topo (headY) e corpo descendo até y1. */
export function hexBoltY(x: number, z: number, headY: number, y1: number, r = 0.08): THREE.BufferGeometry[] {
  return [cylY(r * 1.75, headY, headY + r * 1.4, 6, x, z), cylY(r * 2, headY - 0.025, headY, 16, x, z), cylY(r, y1, headY - 0.025, 10, x, z)];
}

/**
 * Perfil aproximado de engrenagem de dentes retos no plano (s, y), centrado na origem.
 * Raio primitivo = m·z/2, cabeça = +m, pé = −1,25·m. O flanco é suavizado (não é evolvente exato).
 * `phase`: ângulo do início de um passo; o centro de um dente fica em phase + passo/2 e o centro de um vão em phase.
 */
export function spurGearShape(teeth: number, module: number, phase: number, samplesPerTooth: number, boreR = 0): THREE.Shape {
  const pitchR = (module * teeth) / 2;
  const tipR = pitchR + module;
  const rootR = pitchR - 1.25 * module;
  const pitch = (Math.PI * 2) / teeth;
  const total = teeth * samplesPerTooth;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < total; i++) {
    const theta = (i / total) * Math.PI * 2;
    let f = ((theta - phase) / pitch) % 1;
    if (f < 0) f += 1;
    let r: number;
    if (f < 0.18 || f > 0.82) r = rootR;
    else if (f < 0.36) r = rootR + (tipR - rootR) * Math.sin(((f - 0.18) / 0.18) * (Math.PI / 2));
    else if (f <= 0.64) r = tipR;
    else r = rootR + (tipR - rootR) * Math.sin(((0.82 - f) / 0.18) * (Math.PI / 2));
    pts.push(new THREE.Vector2(Math.cos(theta) * r, Math.sin(theta) * r));
  }
  const shape = new THREE.Shape(pts);
  if (boreR > 0) shape.holes.push(circleHole(0, 0, boreR));
  return shape;
}
