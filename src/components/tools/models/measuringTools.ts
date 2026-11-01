import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Modelos 3D procedurais (feitos no projeto, CC0) do paquímetro universal e do micrômetro externo.
 * 1 unidade = 10 mm. Peças são grupos com `userData.partId` igual ao ID em mechanicalToolsData.ts.
 * Cada peça tem materiais próprios, porque o destaque de seleção altera o material.
 * Proporções aproximadas de instrumentos comuns; não representam um fabricante.
 */

const steel = () => new THREE.MeshStandardMaterial({ color: 0xd3d7dc, metalness: 1, roughness: 0.28 });
const satin = () => new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 1, roughness: 0.42 });
const engraving = () => new THREE.MeshStandardMaterial({ color: 0x1b1c1e, metalness: 0.3, roughness: 0.6 });
const carbide = () => new THREE.MeshStandardMaterial({ color: 0x7d8186, metalness: 0.8, roughness: 0.35 });
const insulator = () => new THREE.MeshStandardMaterial({ color: 0x2f4a6b, metalness: 0.1, roughness: 0.55 });

function part(id: string, root: THREE.Group) {
  const g = new THREE.Group();
  g.name = id;
  g.userData.partId = id;
  root.add(g);
  return g;
}

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}

/** Contorno no plano XY extrudado entre z0 e z1, com chanfro leve nas arestas. */
function plate(points: [number, number][], z0: number, z1: number, bevel = 0.02) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const depth = z1 - z0 - bevel * 2;
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 16 });
  g.translate(0, 0, z0 + bevel);
  return g;
}

function cylX(r: number, x0: number, x1: number, seg = 40, rEnd = r) {
  const g = new THREE.CylinderGeometry(rEnd, r, x1 - x0, seg);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => new THREE.Mesh(geo, mat);

/** Paquímetro universal 0–150 mm, aberto em 24,0 mm. Escala principal e nônio gravados na face frontal (+Z). */
export function buildCaliper(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'paquimetro';
  const G = 2.4; // abertura (24 mm)
  const T = 0.32; // espessura da régua
  const BEAM_X1 = 22;

  // Régua (escala principal) — não é uma peça selecionável do catálogo
  const beam = new THREE.Group();
  beam.add(mesh(box(-1.8, BEAM_X1, 0, 1.6, 0, T), satin()));
  const ticks: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 150; i++) {
    const h = i % 10 === 0 ? 0.38 : i % 5 === 0 ? 0.28 : 0.18;
    ticks.push(box(i * 0.1 - 0.011, i * 0.1 + 0.011, 0.62, 0.62 + h, T, T + 0.004));
  }
  // Escala em polegadas na borda superior (só traços, para a régua parecer completa)
  for (let i = 0; i <= 92; i++) {
    const h = i % 16 === 0 ? 0.3 : i % 8 === 0 ? 0.22 : i % 4 === 0 ? 0.16 : 0.1;
    const x = i * (2.54 / 16);
    ticks.push(box(x - 0.005, x + 0.005, 1.55 - h, 1.55, T, T + 0.004));
  }
  beam.add(mesh(mergeGeometries(ticks), engraving()));
  root.add(beam);

  // Bicos de medição externa (fixo na régua, móvel no cursor)
  const outer = part('bicos-externos', root);
  const outerMat = steel();
  outer.add(mesh(plate([[-1.8, 0.02], [0, 0.02], [0, -3.9], [-0.3, -4.15], [-1.1, -1.3], [-1.8, -0.7]], 0, T), outerMat));
  outer.add(mesh(plate([[G, 0.02], [G + 1.8, 0.02], [G + 1.8, -0.7], [G + 1.1, -1.3], [G + 0.3, -4.15], [G, -3.9]], -0.02, T + 0.02), outerMat));

  // Orelhas de medição interna
  const inner = part('orelhas-internas', root);
  const innerMat = steel();
  inner.add(mesh(plate([[-1.0, 1.58], [0, 1.58], [0, 2.85], [-0.12, 3.1], [-0.4, 2.8]], 0, T), innerMat));
  inner.add(mesh(plate([[G, 1.58], [G + 1.0, 1.58], [G + 0.4, 2.8], [G + 0.12, 3.1], [G, 2.85]], -0.02, T + 0.02), innerMat));

  // Cursor com nônio, trava e apoio para o polegar
  const slider = part('nonio-vernier', root);
  const sMat = steel();
  const SX1 = G + 6.2;
  slider.add(mesh(box(G, SX1, -0.3, 1.9, -0.12, -0.02), sMat)); // costas
  slider.add(mesh(plate([[G, -0.3], [SX1, -0.3], [SX1, 0.42], [G + 0.1, 0.62], [G, 0.62]], T + 0.01, T + 0.17, 0.015), sMat)); // placa do nônio
  slider.add(mesh(box(G, SX1, 1.62, 1.9, -0.12, T + 0.14), sMat)); // ponte superior
  slider.add(mesh(box(G, SX1, -0.3, 0.0, -0.12, T + 0.14), sMat)); // ponte inferior
  const vTicks: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 20; i++) {
    const x = G + i * 0.095;
    vTicks.push(box(x - 0.011, x + 0.011, 0.62 - (i % 2 === 0 ? 0.26 : 0.17), 0.62, T + 0.18, T + 0.184));
  }
  slider.add(mesh(mergeGeometries(vTicks), engraving()));
  const screw = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.35, 24), sMat);
  screw.position.set(G + 3.6, 2.07, T / 2);
  slider.add(screw);
  const knurl = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 24), sMat);
  knurl.position.set(G + 3.6, 2.28, T / 2);
  slider.add(knurl);
  for (let i = 0; i < 5; i++) slider.add(mesh(box(SX1 - 1.2 + i * 0.22, SX1 - 1.12 + i * 0.22, -0.55, -0.3, -0.1, T + 0.12), sMat)); // apoio do polegar

  // Haste de profundidade: sai pela ponta da régua o mesmo tanto que os bicos abrem
  const depth = part('haste-profundidade', root);
  depth.add(mesh(box(BEAM_X1, BEAM_X1 + G, 0.68, 0.86, 0.08, 0.22), steel()));

  return root;
}

/** Micrômetro externo 0–25 mm, aberto em 7,38 mm. Fuso ao longo de X; batente em x = 0. */
export function buildMicrometer(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'micrometro';
  const G = 0.738;
  const R = 0.32; // raio do fuso e do batente (Ø ≈ 6,4 mm)

  // Arco com isolante térmico
  const frame = part('arco-termico', root);
  // Arco pintado (acabamento martelado cinza, comum nesses instrumentos)
  const fMat = new THREE.MeshStandardMaterial({ color: 0x5b6670, metalness: 0.35, roughness: 0.55 });
  frame.add(
    mesh(
      plate(
        [
          [-1.0, 0.5],
          [-0.4, 0.5],
          [-0.4, -1.9],
          [0.3, -2.5],
          [2.0, -2.5],
          [2.6, -1.9],
          [2.6, 0.5],
          [3.7, 0.5],
          [3.7, -0.6],
          [3.4, -2.4],
          [2.4, -3.3],
          [0.0, -3.3],
          [-1.0, -2.4]
        ],
        -0.28,
        0.28,
        0.04
      ),
      fMat
    )
  );
  const padShape: [number, number][] = [
    [-0.85, -1.2],
    [-0.55, -1.2],
    [-0.55, -1.95],
    [0.2, -2.7],
    [2.1, -2.7],
    [2.95, -1.95],
    [2.95, -1.2],
    [3.4, -1.2],
    [3.2, -2.3],
    [2.35, -3.12],
    [0.05, -3.12],
    [-0.85, -2.35]
  ];
  const insMat = insulator();
  frame.add(mesh(plate(padShape, 0.28, 0.34, 0.02), insMat));
  frame.add(mesh(plate(padShape, -0.34, -0.28, 0.02), insMat));
  // Trava do fuso
  const lock = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 20), fMat);
  lock.position.set(3.15, 0.65, 0);
  frame.add(lock);
  const lockLever = mesh(box(3.05, 3.25, 0.78, 0.9, -0.35, 0.35), fMat);
  frame.add(lockLever);

  // Batente fixo e fuso móvel, com faces de metal duro
  const spindle = part('fuso-bigorna', root);
  const spMat = steel();
  const faceMat = carbide();
  spindle.add(mesh(cylX(R, -0.4, -0.04), spMat));
  spindle.add(mesh(cylX(R, -0.04, 0), faceMat));
  spindle.add(mesh(cylX(R, G, G + 0.04), faceMat));
  spindle.add(mesh(cylX(R, G + 0.04, 2.6), spMat));

  // Bainha (escala fixa) e tambor graduado
  const scale = part('tambor-bainha', root);
  const sleeveMat = satin();
  const SLEEVE_X0 = 3.7;
  const EDGE = 5.25 + G; // aresta do tambor: avança com a abertura
  const ZERO = EDGE - G * 1; // zero da bainha (1 unidade = 10 mm; 1 mm = 0,1)
  scale.add(mesh(cylX(0.36, SLEEVE_X0, EDGE + 0.4), sleeveMat));
  const sTicks: THREE.BufferGeometry[] = [box(SLEEVE_X0 + 0.1, EDGE, -0.006, 0.006, 0.352, 0.364)]; // linha de referência
  for (let i = 0; i <= 25; i++) {
    const x = ZERO + i * 0.1;
    if (x > EDGE) break;
    sTicks.push(box(x - 0.006, x + 0.006, 0, i % 5 === 0 ? 0.13 : 0.085, 0.345, 0.362));
    const xh = x + 0.05;
    if (xh < EDGE) sTicks.push(box(xh - 0.006, xh + 0.006, -0.085, 0, 0.345, 0.362));
  }
  scale.add(mesh(mergeGeometries(sTicks), engraving()));
  const thimbleMat = satin();
  scale.add(mesh(cylX(0.4, EDGE, EDGE + 0.22, 56, 0.5), thimbleMat)); // chanfro graduado
  scale.add(mesh(cylX(0.5, EDGE + 0.22, EDGE + 2.0, 56), thimbleMat));
  // Graduações do tambor (50) sobre o chanfro; a 38ª fica alinhada com a linha de referência
  const tTicks: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 50; k++) {
    const tick = box(EDGE + 0.02, EDGE + (k % 5 === 0 ? 0.2 : 0.13), -0.006, 0.006, 0, 0.012);
    const a = ((k - 38) / 50) * Math.PI * 2;
    tick.translate(0, 0, 0.44);
    tick.rotateX(-a);
    tTicks.push(tick);
  }
  scale.add(mesh(mergeGeometries(tTicks), engraving()));
  // Recartilhado do tambor (anéis)
  for (let i = 0; i < 9; i++) scale.add(mesh(cylX(0.515, EDGE + 1.0 + i * 0.1, EDGE + 1.05 + i * 0.1, 56), thimbleMat));

  // Catraca
  const ratchet = part('catraca', root);
  const rMat = satin();
  ratchet.add(mesh(cylX(0.3, EDGE + 2.0, EDGE + 2.15, 40), rMat));
  ratchet.add(mesh(cylX(0.34, EDGE + 2.15, EDGE + 2.85, 40), rMat));
  for (let i = 0; i < 6; i++) ratchet.add(mesh(cylX(0.35, EDGE + 2.25 + i * 0.1, EDGE + 2.29 + i * 0.1, 40), rMat));
  ratchet.add(mesh(cylX(0.34, EDGE + 2.85, EDGE + 2.95, 40, 0.24), rMat));

  return root;
}

export const PROCEDURAL_TOOL_MODELS: Record<string, () => THREE.Group> = {
  paquimetro: buildCaliper,
  micrometro: buildMicrometer
};
