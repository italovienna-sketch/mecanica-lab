import * as THREE from 'three';
import { createPumpMaterials, PumpMaterials } from './pumpModel';
import { box, cylX, cylY, cylZ, mesh } from './geomKit';

/**
 * Transportador de correia plana com acionamento por motorredutor (modelo educacional, CC0, feito no projeto).
 * Não reproduz um fabricante, uma norma de projeto nem uma instalação real: proporções didáticas, sem cotas.
 *
 * Coordenadas: correia ao longo de X (o material anda para +X, rumo à polia de acionamento, que fica em
 * x = +4); eixos das polias e dos rolos ao longo de Z; Y para cima. O acionamento fica do lado +Z.
 * Peças que giram em operação (polias e acoplamento) têm a origem do grupo sobre o próprio eixo.
 */

export const CV = {
  floorY: -1.5,
  headX: 4,
  tailX: -4,
  beltIn: 0.47,
  beltOut: 0.51,
  beltHalfW: 0.7,
  drumHalf: 0.8,
  railZ: 0.95,
  bearingZ: 1.15,
  carryX: [-3, -2, -1, 0, 2, 3],
  inspectX: 1,
  returnX: [-2.5, 0, 2.5],
  rollerR: 0.12
} as const;

export function buildBeltConveyor(quality: 'high' | 'low'): {
  root: THREE.Group;
  parts: Map<string, THREE.Group>;
  materials: PumpMaterials;
  environment: THREE.Group;
  animate: (dt: number) => void;
} {
  const S = quality === 'high' ? 40 : 20;
  const M = createPumpMaterials();
  const ds = { side: THREE.DoubleSide };
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3f5f7f, metalness: 0.35, roughness: 0.55, ...ds });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x1f2124, metalness: 0, roughness: 0.9, ...ds });
  const guardMat = new THREE.MeshStandardMaterial({ color: 0xf2c200, metalness: 0.2, roughness: 0.55, ...ds });
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x2f6d4f, metalness: 0.35, roughness: 0.5, ...ds });
  const gearboxMat = new THREE.MeshStandardMaterial({ color: 0x5a6470, metalness: 0.45, roughness: 0.5, ...ds });
  const lagging = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0, roughness: 0.95, ...ds });
  const elastomer = new THREE.MeshStandardMaterial({ color: 0xd9a21b, metalness: 0, roughness: 0.7, ...ds });
  const cargoMat = new THREE.MeshStandardMaterial({ color: 0xb9895a, metalness: 0, roughness: 0.85, ...ds });

  const root = new THREE.Group();
  root.name = 'belt-conveyor-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string, origin?: [number, number, number]) => {
    const g = new THREE.Group();
    g.name = id;
    if (origin) g.position.set(...origin);
    parts.set(id, g);
    root.add(g);
    return g;
  };
  const { floorY, headX, tailX, railZ, bearingZ, rollerR } = CV;

  /* ───────────── ESTRUTURA (longarinas, pernas, suportes dos rolos e base do acionamento) ───────────── */
  const frame = part('cv-frame');
  [-1, 1].forEach((k) => {
    // Longarina em perfil "U": alma + abas
    frame.add(mesh(box(0, 0.2, k * railZ, 4.3, 0.15, 0.02), frameMat));
    frame.add(mesh(box(0, 0.34, k * (railZ - 0.06), 4.3, 0.015, 0.06), frameMat));
    frame.add(mesh(box(0, 0.06, k * (railZ - 0.06), 4.3, 0.015, 0.06), frameMat));
    [-3.5, 0, 3.5].forEach((x) => frame.add(mesh(box(x, (floorY + 0.05) / 2, k * railZ, 0.07, (0.05 - floorY) / 2, 0.07), frameMat)));
    // Suportes dos mancais nas pontas (chapa vertical + mesa)
    [headX, tailX].forEach((x) => {
      frame.add(mesh(box(x, -0.18, k * (railZ + 0.02), 0.42, 0.23, 0.02), frameMat));
      frame.add(mesh(box(x, -0.36, k * (bearingZ + 0.05), 0.42, 0.04, 0.22), frameMat));
    });
    // Suportes (cavaletes) dos rolos de carga e de retorno
    [...CV.carryX, CV.inspectX].forEach((x) => frame.add(mesh(box(x, 0.36, k * 0.88, 0.05, 0.06, 0.012), frameMat)));
    CV.returnX.forEach((x) => frame.add(mesh(box(x, -0.3, k * 0.9, 0.04, 0.36, 0.012), frameMat)));
  });
  [-3.5, 0, 3.5].forEach((x) => frame.add(mesh(box(x, -1.0, 0, 0.04, 0.04, railZ), frameMat)));
  // Base do acionamento (pedestal do redutor)
  frame.add(mesh(box(headX, (floorY - 0.72) / 2, 2.2, 0.6, (-0.72 - floorY) / 2, 0.4), frameMat));

  /* ───────────── CORREIA (laço fechado em volta das duas polias) ───────────── */
  const belt = part('cv-belt');
  {
    const R = CV.beltOut;
    const r = CV.beltIn;
    const s = new THREE.Shape();
    s.moveTo(tailX, -R);
    s.lineTo(headX, -R);
    s.absarc(headX, 0, R, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(tailX, R);
    s.absarc(tailX, 0, R, Math.PI / 2, (Math.PI * 3) / 2, false);
    const h = new THREE.Path();
    h.moveTo(tailX, -r);
    h.absarc(tailX, 0, r, (Math.PI * 3) / 2, Math.PI / 2, true);
    h.lineTo(headX, r);
    h.absarc(headX, 0, r, Math.PI / 2, -Math.PI / 2, true);
    h.lineTo(tailX, -r);
    s.holes.push(h);
    const g = new THREE.ExtrudeGeometry(s, { depth: CV.beltHalfW * 2, curveSegments: S, bevelEnabled: false });
    g.translate(0, 0, -CV.beltHalfW);
    belt.add(mesh(g, beltMat));
  }

  /* ───────────── POLIAS (tambores) ───────────── */
  const drum = (id: string, x: number, lagged: boolean) => {
    const g = part(id, [x, 0, 0]);
    const rDrum = lagged ? CV.beltIn - 0.04 : CV.beltIn;
    g.add(mesh(cylZ(rDrum, -CV.drumHalf, CV.drumHalf, S), M.steel));
    if (lagged) g.add(mesh(cylZ(CV.beltIn, -CV.drumHalf + 0.05, CV.drumHalf - 0.05, S), lagging));
    g.add(mesh(cylZ(0.08, -bearingZ - 0.2, lagged ? 1.62 : bearingZ + 0.2, 16), M.chrome));
    // Discos laterais com raios escuros: deixam ver o tambor girando
    [-1, 1].forEach((k) => {
      g.add(mesh(cylZ(0.18, k * CV.drumHalf, k * (CV.drumHalf + 0.03), 20), M.steel));
      for (let i = 0; i < 3; i++) {
        const bar = box(0, rDrum * 0.62, k * (CV.drumHalf + 0.002), 0.035, rDrum * 0.3, 0.004);
        bar.rotateZ((i / 3) * Math.PI * 2);
        g.add(mesh(bar, M.hole, false));
      }
    });
    return g;
  };
  const head = drum('cv-head-pulley', headX, true);
  const tail = drum('cv-tail-pulley', tailX, false);

  /* ───────────── ROLOS DE CARGA E DE RETORNO ───────────── */
  const roller = (g: THREE.Group, x: number, y: number) => {
    g.add(mesh(cylZ(rollerR, -0.74, 0.74, S, x, y), M.zinc));
    g.add(mesh(cylZ(0.025, -0.9, 0.9, 10, x, y), M.steel));
  };
  const carry = part('cv-carry-idlers');
  CV.carryX.forEach((x) => roller(carry, x, CV.beltIn - rollerR));
  const inspect = part('cv-roller-inspect');
  roller(inspect, CV.inspectX, CV.beltIn - rollerR);
  const ret = part('cv-return-idlers');
  CV.returnX.forEach((x) => roller(ret, x, -CV.beltOut - rollerR));

  /* ───────────── MANCAIS DAS POLIAS (4 mancais de pedestal) ───────────── */
  const bearings = part('cv-bearings');
  [headX, tailX].forEach((x) =>
    [-1, 1].forEach((k) => {
      bearings.add(mesh(cylZ(0.2, k * bearingZ - 0.1, k * bearingZ + 0.1, S, x, 0), M.paint));
      bearings.add(mesh(box(x, -0.2, k * bearingZ, 0.12, 0.13, 0.1), M.paint));
      bearings.add(mesh(box(x, -0.3, k * bearingZ, 0.36, 0.03, 0.1), M.paint));
      [-0.26, 0.26].forEach((dx) => bearings.add(mesh(cylY(0.035, -0.27, -0.22, 6, x + dx, k * bearingZ), M.zinc)));
    })
  );

  /* ───────────── TENSOR DE PARAFUSO (no lado da polia de retorno) ───────────── */
  const takeUp = part('cv-take-up');
  [-1, 1].forEach((k) => {
    takeUp.add(mesh(cylX(0.035, tailX - 0.85, tailX - 0.2, 12, -0.08, k * bearingZ), M.zinc));
    takeUp.add(mesh(box(tailX - 0.88, -0.2, k * bearingZ, 0.03, 0.18, 0.14), frameMat));
    [tailX - 0.95, tailX - 0.8].forEach((x) => takeUp.add(mesh(cylX(0.065, x - 0.03, x + 0.03, 6, -0.08, k * bearingZ), M.zinc)));
  });

  /* ───────────── ACOPLAMENTO ELÁSTICO (eixo da polia ↔ eixo de saída do redutor) ───────────── */
  const coupling = part('cv-coupling', [headX, 0, 0]);
  coupling.add(mesh(cylZ(0.2, 1.5, 1.66, S), M.steel));
  coupling.add(mesh(cylZ(0.2, 1.72, 1.88, S), M.steel));
  for (let i = 0; i < 6; i++) {
    const jaw = box(0, 0.13, 1.69, 0.06, 0.06, 0.04);
    jaw.rotateZ((i / 6) * Math.PI * 2);
    coupling.add(mesh(jaw, i % 2 ? elastomer : M.steel));
  }

  /* ───────────── REDUTOR (eixos paralelos, saída coaxial com a polia) ───────────── */
  const gearbox = part('cv-gearbox');
  gearbox.add(mesh(box(headX, -0.12, 2.22, 0.4, 0.48, 0.32), gearboxMat));
  gearbox.add(mesh(box(headX, -0.66, 2.22, 0.55, 0.06, 0.36), gearboxMat));
  gearbox.add(mesh(cylZ(0.08, 1.86, 1.92, 16, headX, 0), M.chrome));
  gearbox.add(mesh(cylZ(0.17, 1.88, 1.92, S, headX, 0), gearboxMat));
  // Bujões de óleo (enchimento em cima, dreno embaixo) e respiro
  gearbox.add(mesh(cylY(0.05, 0.36, 0.42, 6, headX - 0.2, 2.22), M.zinc));
  gearbox.add(mesh(cylZ(0.05, 1.86, 1.9, 6, headX + 0.25, -0.5), M.zinc));
  [-0.45, 0.45].forEach((dx) => [1.92, 2.52].forEach((z) => gearbox.add(mesh(cylY(0.04, -0.6, -0.55, 6, headX + dx, z), M.zinc))));

  /* ───────────── MOTOR ELÉTRICO (flangeado no redutor) ───────────── */
  const motor = part('cv-motor');
  motor.add(mesh(cylZ(0.42, 2.54, 2.62, S, headX, 0), motorMat));
  motor.add(mesh(cylZ(0.34, 2.62, 3.5, S, headX, 0), motorMat));
  for (let i = 0; i < 14; i++) {
    const fin = box(0, 0.36, 3.06, 0.012, 0.04, 0.42);
    fin.rotateZ((i / 14) * Math.PI * 2);
    fin.translate(headX, 0, 0);
    motor.add(mesh(fin, motorMat));
  }
  motor.add(mesh(cylZ(0.32, 3.5, 3.8, S, headX, 0), M.zinc));
  motor.add(mesh(box(headX, 0.46, 2.9, 0.15, 0.08, 0.16), motorMat));

  /* ───────────── PROTEÇÕES FIXAS (polias e acoplamento) ───────────── */
  const guards = part('cv-guards');
  [headX - 0.35, tailX + 0.35].forEach((x) =>
    [-1, 1].forEach((k) => guards.add(mesh(box(x, 0.05, k * (railZ + 0.06), 0.85, 0.62, 0.012), guardMat)))
  );
  {
    // Meia-casca por cima do acoplamento (aberta embaixo)
    const shell = new THREE.CylinderGeometry(0.34, 0.34, 0.5, S, 1, true, Math.PI / 2, Math.PI);
    shell.rotateX(Math.PI / 2);
    shell.translate(headX, 0, 1.69);
    guards.add(mesh(shell, guardMat));
  }

  /* ───────────── AMBIENTE: volumes de carga e marcas na correia (não são peças) ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';
  const cargo: THREE.Mesh[] = [];
  [-2.6, 0.2, 2.9].forEach((x, i) => {
    const c = mesh(new THREE.BoxGeometry(0.55, 0.32 + (i % 2) * 0.08, 0.55), cargoMat);
    c.position.set(x, CV.beltOut + (0.32 + (i % 2) * 0.08) / 2, (i - 1) * 0.12);
    environment.add(c);
    cargo.push(c);
  });
  const marks: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const m = mesh(new THREE.BoxGeometry(0.05, 0.004, CV.beltHalfW * 1.9), M.zinc, false);
    m.position.set(tailX + i, CV.beltOut + 0.002, 0);
    environment.add(m);
    marks.push(m);
  }

  const pulleyR = CV.beltIn;
  const BELT_SPEED = 0.9; // unidades de cena por segundo (didático, não representa a velocidade real)
  const span = headX - tailX;
  const wrap = (x: number, margin: number) => (x > headX - margin ? x - (span - 2 * margin) : x);
  const animate = (dt: number) => {
    const dx = BELT_SPEED * dt;
    // Tambores giram no sentido em que a correia de cima anda para +X: ω = v / r.
    head.rotation.z -= dx / pulleyR;
    tail.rotation.z -= dx / pulleyR;
    coupling.rotation.z -= dx / pulleyR;
    marks.forEach((m) => (m.position.x = wrap(m.position.x + dx, 0)));
    cargo.forEach((c) => (c.position.x = wrap(c.position.x + dx, 0.6)));
  };

  return { root, parts, materials: M, environment, animate };
}
