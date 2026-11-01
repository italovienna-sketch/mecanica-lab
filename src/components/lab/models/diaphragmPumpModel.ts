import * as THREE from 'three';
import { createPumpMaterials, PumpMaterials } from './pumpModel';
import { box, cylX, cylY, cylZ, latheX, mesh } from './geomKit';

/**
 * Bomba de duplo diafragma acionada a ar comprimido (modelo educacional, CC0, feito no projeto).
 * Não reproduz um fabricante nem um modelo comercial: proporções didáticas, sem cotas.
 *
 * Coordenadas: eixo dos diafragmas ao longo de X (diafragma esquerdo em x < 0, direito em x > 0); Y para cima.
 * O líquido entra pelo coletor de baixo e sai pelo de cima; os bocais ficam na frente (+Z).
 * Cada câmara tem duas válvulas de retenção de esfera: a de baixo (sucção) e a de cima (descarga).
 * Cada peça é um THREE.Group com `name` igual ao ID da peça em diaphragmPumpMachine.ts.
 */

export const DP = {
  floorY: -1.75,
  rimX: 0.6,
  valveX: 0.85,
  manifoldY: 1.5,
  seatTop: 0.99,
  seatBottom: -1.04,
  ballR: 0.12
} as const;

/** Sólido de revolução em torno do eixo Y a partir de um perfil [raio, y] (fecha o perfil sozinho). */
function latheY(profile: [number, number][], segments: number, x = 0, z = 0): THREE.BufferGeometry {
  const closed = [...profile, profile[0]];
  const g = new THREE.LatheGeometry(
    closed.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)),
    segments
  );
  g.translate(x, 0, z);
  return g;
}

export function buildDiaphragmPump(quality: 'high' | 'low'): {
  root: THREE.Group;
  parts: Map<string, THREE.Group>;
  materials: PumpMaterials;
  environment: THREE.Group;
  animate: (dt: number) => void;
} {
  const S = quality === 'high' ? 40 : 20;
  const M = createPumpMaterials();
  const ds = { side: THREE.DoubleSide };
  const alu = new THREE.MeshStandardMaterial({ color: 0x9aa3ab, metalness: 0.75, roughness: 0.42, ...ds });
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xece8dd, metalness: 0, roughness: 0.3, ...ds });
  const diaphragmMat = new THREE.MeshStandardMaterial({ color: 0x2e3238, metalness: 0, roughness: 0.8, ...ds });

  const root = new THREE.Group();
  root.name = 'diaphragm-pump-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string) => {
    const g = new THREE.Group();
    g.name = id;
    parts.set(id, g);
    root.add(g);
    return g;
  };
  const { rimX, valveX, manifoldY, ballR } = DP;
  const SIDES = [-1, 1] as const;

  /* ───────────── CORPO CENTRAL (bloco de ar com as duas câmaras de ar) ───────────── */
  const center = part('dp-center-body');
  center.add(mesh(cylX(0.42, -0.32, 0.32, S), M.paint));
  SIDES.forEach((k) => {
    // Câmara de ar em forma de prato, aberta para o lado do diafragma
    const bowl: [number, number][] = [
      [0.42, 0.3],
      [0.95, 0.5],
      [0.95, rimX],
      [0.88, rimX],
      [0.88, 0.53],
      [0.42, 0.37]
    ];
    center.add(mesh(latheX(bowl.map(([r, x]) => [r, k * x] as [number, number]), S), M.paint));
  });

  /* ───────────── VÁLVULA DE AR E SILENCIADOR ───────────── */
  const airValve = part('dp-air-valve');
  airValve.add(mesh(box(0, 0.55, 0, 0.3, 0.14, 0.28), M.paintDark));
  airValve.add(mesh(box(0, 0.71, 0, 0.26, 0.02, 0.24), M.paintDark));
  [-0.2, 0.2].forEach((x) => [-0.18, 0.18].forEach((z) => airValve.add(mesh(cylY(0.03, 0.73, 0.77, 6, x, z), M.zinc))));
  // Entrada de ar (engate na frente) e silenciador do escape (atrás)
  airValve.add(mesh(cylZ(0.07, 0.28, 0.48, 6, 0, 0.55), M.bronze));
  airValve.add(mesh(cylZ(0.05, 0.48, 0.58, 16, 0, 0.55), M.bronze));
  airValve.add(mesh(cylZ(0.06, -0.28, -0.38, 6, 0, 0.55), M.zinc));
  airValve.add(mesh(cylZ(0.11, -0.38, -0.78, S, 0, 0.55), M.carbon));

  /* ───────────── CÂMARAS DE LÍQUIDO (tampas externas, com parafusos e bocais) ───────────── */
  const cover = (id: string, k: -1 | 1) => {
    const g = part(id);
    const shell: [number, number][] = [
      [0.95, rimX + 0.005],
      [0.95, 0.7],
      [0.75, 1.0],
      [0.0, 1.16],
      [0.0, 1.1],
      [0.7, 0.95],
      [0.88, 0.68],
      [0.88, rimX + 0.005]
    ];
    g.add(mesh(latheX(shell.map(([r, x]) => [r, k * x] as [number, number]), S), alu));
    // Bocais de cima e de baixo até as válvulas de retenção, com flange
    g.add(mesh(cylY(0.17, 0.7, 0.98, S, k * valveX), alu));
    g.add(mesh(cylY(0.26, 0.94, 0.98, S, k * valveX), alu));
    g.add(mesh(cylY(0.17, -0.98, -0.7, S, k * valveX), alu));
    g.add(mesh(cylY(0.26, -0.98, -0.94, S, k * valveX), alu));
    // Parafusos que prendem a tampa no corpo central (prendendo a borda do diafragma)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const y = Math.cos(a) * 0.9;
      const z = Math.sin(a) * 0.9;
      const [x0, x1] = k > 0 ? [0.55, 0.74] : [-0.74, -0.55];
      g.add(mesh(cylX(0.04, x0, x1, 8, y, z), M.zinc));
      const hx = k * 0.76;
      g.add(mesh(cylX(0.075, hx - 0.03, hx + 0.03, 6, y, z), M.zinc));
    }
    return g;
  };
  cover('dp-cover-left', -1);
  cover('dp-cover-right', 1);

  /* ───────────── DIAFRAGMAS (membrana + placas interna e externa) ───────────── */
  const diaphragm = (id: string, k: -1 | 1) => {
    const g = part(id);
    // Membrana com uma ondulação perto da borda (deixa o centro ir e voltar)
    const profile: [number, number][] = [
      [0.2, rimX - 0.015],
      [0.62, rimX - 0.015],
      [0.74, rimX + 0.03],
      [0.86, rimX - 0.015],
      [0.92, rimX - 0.015],
      [0.92, rimX + 0.015],
      [0.86, rimX + 0.015],
      [0.74, rimX + 0.06],
      [0.62, rimX + 0.015],
      [0.2, rimX + 0.015]
    ];
    g.add(mesh(latheX(profile.map(([r, x]) => [r, k * x] as [number, number]), S), diaphragmMat));
    const span = (a: number, b: number): [number, number] => (k > 0 ? [a, b] : [-b, -a]);
    g.add(mesh(cylX(0.36, ...span(rimX + 0.015, rimX + 0.06), S), M.steel));
    g.add(mesh(cylX(0.32, ...span(rimX - 0.06, rimX - 0.015), S), M.steel));
    g.add(mesh(cylX(0.1, ...span(rimX + 0.06, rimX + 0.12), 6), M.zinc));
    return g;
  };
  const diaLeft = diaphragm('dp-diaphragm-left', -1);
  const diaRight = diaphragm('dp-diaphragm-right', 1);

  /* ───────────── EIXO (liga os dois diafragmas através do corpo central) ───────────── */
  const shaft = part('dp-shaft');
  shaft.add(mesh(cylX(0.07, -(rimX + 0.1), rimX + 0.1, 16), M.chrome));

  /* ───────────── SEDES E ESFERAS DAS VÁLVULAS DE RETENÇÃO ───────────── */
  const seatRing = (g: THREE.Group, x: number, y0: number) =>
    g.add(
      mesh(
        latheY(
          [
            [0.09, y0],
            [0.2, y0],
            [0.2, y0 + 0.06],
            [0.11, y0 + 0.06]
          ],
          S,
          x
        ),
        M.steel
      )
    );
  const seatsOut = part('dp-seats-out');
  const seatsIn = part('dp-seats-in');
  SIDES.forEach((k) => {
    seatRing(seatsOut, k * valveX, DP.seatTop);
    seatRing(seatsIn, k * valveX, DP.seatBottom);
  });
  const ball = (id: string, x: number, seatY: number) => {
    const g = part(id);
    const geo = new THREE.SphereGeometry(ballR, S, Math.round(S / 2));
    geo.translate(x, seatY + 0.06 + ballR * 0.75, 0);
    g.add(mesh(geo, ballMat));
    return g;
  };
  const ballOutL = ball('dp-ball-out-left', -valveX, DP.seatTop);
  const ballOutR = ball('dp-ball-out-right', valveX, DP.seatTop);
  const ballInL = ball('dp-ball-in-left', -valveX, DP.seatBottom);
  const ballInR = ball('dp-ball-in-right', valveX, DP.seatBottom);

  /* ───────────── COLETORES (manifolds) DE SAÍDA (em cima) E DE ENTRADA (embaixo, com os pés) ───────────── */
  const manifold = (id: string, side: 1 | -1, portR: number) => {
    const g = part(id);
    const y = side * manifoldY;
    g.add(mesh(cylX(0.2, -(valveX + 0.2), valveX + 0.2, S, y), alu));
    SIDES.forEach((k) => {
      g.add(mesh(cylX(0.22, k > 0 ? valveX + 0.18 : -(valveX + 0.24), k > 0 ? valveX + 0.24 : -(valveX + 0.18), S, y), alu));
      // Alojamento da válvula de retenção, com flange que encosta na câmara
      const [a, b] = side > 0 ? [0.98, y] : [y, -0.98];
      g.add(mesh(cylY(0.24, a, b, S, k * valveX), alu));
      const [fa, fb] = side > 0 ? [0.98, 1.04] : [-1.04, -0.98];
      g.add(mesh(cylY(0.26, fa, fb, S, k * valveX), alu));
      [-1, 1].forEach((kz) => g.add(mesh(cylY(0.03, side > 0 ? 1.04 : -1.08, side > 0 ? 1.08 : -1.04, 6, k * valveX, kz * 0.22), M.zinc)));
    });
    // Bocal central com flange para a tubulação
    g.add(mesh(cylZ(portR, 0, 0.5, S, 0, y), alu));
    g.add(mesh(cylZ(portR + 0.1, 0.44, 0.52, S, 0, y), alu));
    g.add(mesh(cylZ(portR - 0.04, 0.52, 0.525, S, 0, y), M.hole, false));
    if (side < 0) {
      // Pés de apoio da bomba
      SIDES.forEach((k) => g.add(mesh(box(k * valveX, DP.floorY + 0.08, 0, 0.18, 0.08, 0.32), alu)));
      SIDES.forEach((k) => g.add(mesh(box(k * valveX, -1.6, 0, 0.06, 0.08, 0.1), alu)));
    }
    return g;
  };
  manifold('dp-manifold-out', 1, 0.17);
  manifold('dp-manifold-in', -1, 0.2);

  /* ───────────── AMBIENTE (base de apoio; não é peça da bomba) ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';
  const padMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.3, roughness: 0.7 });
  const pad = mesh(new THREE.BoxGeometry(2.6, 0.04, 1.1), padMat);
  pad.position.set(0, DP.floorY + 0.02, 0);
  environment.add(pad);

  /* ───────────── OPERAÇÃO ─────────────
   * O ar empurra um diafragma para fora (descarga daquele lado) enquanto o eixo puxa o outro para dentro (sucção).
   * Lado em descarga: esfera de cima levanta, a de baixo fica na sede. Lado em sucção: o contrário.
   * As peças se movem como blocos inteiros; na bomba real a borda do diafragma fica presa e só o centro se desloca.
   * Frequência e curso didáticos: não representam a bomba real. */
  const STROKE = 0.07;
  const LIFT = 0.07;
  const OMEGA = Math.PI * 2 * 0.6;
  let phase = 0;
  const animate = (dt: number) => {
    phase = (phase + OMEGA * dt) % (Math.PI * 2);
    const d = STROKE * Math.sin(phase);
    const v = Math.cos(phase); // > 0: conjunto indo para +X (direito em descarga, esquerdo em sucção)
    shaft.position.x = d;
    diaLeft.position.x = d;
    diaRight.position.x = d;
    ballOutR.position.y = LIFT * Math.max(0, v);
    ballInR.position.y = LIFT * Math.max(0, -v);
    ballOutL.position.y = LIFT * Math.max(0, -v);
    ballInL.position.y = LIFT * Math.max(0, v);
  };

  return { root, parts, materials: M, environment, animate };
}
