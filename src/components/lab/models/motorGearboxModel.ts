import * as THREE from 'three';
import { createPumpMaterials, PumpMaterials } from './pumpModel';
import { box, cylX, cylY, cylZ, extrudeX, latheX, mesh, ringX, spurGearShape } from './geomKit';
import { MG_MODULE, MG_RATIO, MG_TEETH } from '../../../data/industry/motorGearboxSpec';

/**
 * Acionamento com motor elétrico de indução, acoplamento elástico e redutor de um estágio
 * (engrenagens cilíndricas de dentes retos, eixos paralelos). Modelo educacional, CC0, feito no projeto:
 * não reproduz fabricante, norma de projeto nem uma máquina real. Proporções didáticas, sem cotas.
 *
 * Coordenadas: eixos ao longo de X (motor em −X, redutor em +X), Y para cima.
 * O eixo do motor e o eixo de entrada do redutor ficam em y = 0, z = 0; o eixo de saída fica em y = MG.center.
 * Todos os eixos estão no plano z = 0, então a vista em corte (esconde z > 0) mostra o interior em seção.
 * A relação de transmissão vem do número de dentes do próprio modelo (MG.pinionTeeth e MG.gearTeeth).
 */

export const MG = {
  floorY: -0.95,
  module: MG_MODULE,
  pinionTeeth: MG_TEETH.pinion,
  gearTeeth: MG_TEETH.gear,
  /** Distância entre centros = m·(z1 + z2)/2 */
  center: (MG_MODULE * (MG_TEETH.pinion + MG_TEETH.gear)) / 2,
  gearFace: [0.25, 0.55] as [number, number],
  housingX: [-0.1, 0.8] as [number, number],
  coverX: [0.8, 0.92] as [number, number],
  housingY: [-0.75, 2.5] as [number, number],
  housingZ: 1.15,
  motorX: [-3.6, -1.75] as [number, number]
};


export function buildMotorGearbox(quality: 'high' | 'low'): {
  root: THREE.Group;
  parts: Map<string, THREE.Group>;
  materials: PumpMaterials;
  environment: THREE.Group;
  animate: (dt: number) => void;
} {
  const S = quality === 'high' ? 40 : 20;
  const M = createPumpMaterials();
  const ds = { side: THREE.DoubleSide };
  const motorMat = new THREE.MeshStandardMaterial({ color: 0x2f6d4f, metalness: 0.35, roughness: 0.5, ...ds });
  const statorMat = new THREE.MeshStandardMaterial({ color: 0x6b6f75, metalness: 0.7, roughness: 0.45, ...ds });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.8, roughness: 0.35, ...ds });
  const gearboxMat = new THREE.MeshStandardMaterial({ color: 0x5a6470, metalness: 0.45, roughness: 0.5, ...ds });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x3f5f7f, metalness: 0.35, roughness: 0.55, ...ds });
  const guardMat = new THREE.MeshStandardMaterial({ color: 0xf2c200, metalness: 0.2, roughness: 0.55, ...ds });
  const elastomer = new THREE.MeshStandardMaterial({ color: 0xd9a21b, metalness: 0, roughness: 0.7, ...ds });

  const root = new THREE.Group();
  root.name = 'motor-gearbox-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string, origin?: [number, number, number]) => {
    const g = new THREE.Group();
    g.name = id;
    if (origin) g.position.set(...origin);
    parts.set(id, g);
    root.add(g);
    return g;
  };
  const C = MG.center;
  const [hx0, hx1] = MG.housingX;
  const [hy0, hy1] = MG.housingY;
  const HZ = MG.housingZ;
  const hyc = (hy0 + hy1) / 2;
  const hyh = (hy1 - hy0) / 2;
  const [mx0, mx1] = MG.motorX;

  /* ───────────── BASE COMUM (fica fixa) ───────────── */
  const base = part('mg-base');
  base.add(mesh(box(-1.5, -0.875, 0, 2.8, 0.075, 0.85), baseMat));
  [-4.1, -1.2, 1.1].forEach((x) => [-0.7, 0.7].forEach((z) => base.add(mesh(cylY(0.06, -0.8, -0.77, 6, x, z), M.zinc))));

  /* ───────────── MOTOR: CARCAÇA COM ESTATOR, PÉS E CAIXA DE LIGAÇÃO ───────────── */
  const frame = part('mg-motor-frame');
  frame.add(mesh(ringX(0.6, 0.64, mx0, mx1, S), motorMat));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    if (Math.abs(Math.sin(a) + 1) < 0.2) continue; // sem aletas embaixo, onde ficam os pés
    const fin = box((mx0 + mx1) / 2, 0.68, 0, (mx1 - mx0) / 2 - 0.05, 0.05, 0.012);
    fin.rotateX(a);
    frame.add(mesh(fin, motorMat));
  }
  // Estator: pacote de chapas (anel) e cabeças de bobina em cobre nas pontas
  frame.add(mesh(ringX(0.43, 0.6, mx0 + 0.3, mx1 - 0.3, S), statorMat));
  frame.add(mesh(ringX(0.44, 0.56, mx0 + 0.12, mx0 + 0.3, S), copperMat));
  frame.add(mesh(ringX(0.44, 0.56, mx1 - 0.3, mx1 - 0.12, S), copperMat));
  // Pés e caixa de ligação
  [mx0 + 0.3, mx1 - 0.3].forEach((x) => {
    frame.add(mesh(box(x, -0.66, 0, 0.16, 0.14, 0.5), motorMat));
    [-0.38, 0.38].forEach((z) => frame.add(mesh(cylY(0.05, -0.52, -0.48, 6, x, z), M.zinc)));
  });
  frame.add(mesh(box((mx0 + mx1) / 2, 0.76, 0, 0.26, 0.12, 0.22), motorMat));
  frame.add(mesh(cylZ(0.06, 0.22, 0.3, 12, (mx0 + mx1) / 2 + 0.1, 0.74), M.carbon));

  /* ───────────── TAMPAS DO MOTOR (dianteira = lado do acionamento; traseira = lado do ventilador) ───────────── */
  const endShield = (id: string, x0: number, x1: number, inward: 1 | -1) => {
    const g = part(id);
    g.add(mesh(latheX([[0.24, x0], [0.64, x0], [0.64, x1], [0.24, x1]], S), motorMat));
    // Cubo do alojamento do rolamento
    const [b0, b1] = inward > 0 ? [x1, x1 + 0.12] : [x0 - 0.12, x0];
    g.add(mesh(ringX(0.13, 0.26, b0, b1, S), motorMat));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      g.add(mesh(cylX(0.04, x0 - 0.02, x1 + 0.02, 6, Math.cos(a) * 0.56, Math.sin(a) * 0.56), M.zinc));
    }
    return g;
  };
  endShield('mg-endshield-de', mx1, mx1 + 0.15, -1);
  endShield('mg-endshield-nde', mx0 - 0.15, mx0, 1);

  /* ───────────── ROTOR COM EIXO ───────────── */
  const rotor = part('mg-rotor');
  rotor.add(mesh(cylX(0.11, mx0 - 0.52, -1.2, 20), M.chrome));
  rotor.add(mesh(cylX(0.41, mx0 + 0.3, mx1 - 0.3, S), statorMat));
  // Anéis de curto-circuito (rotor de gaiola) e barras aparentes
  [mx0 + 0.25, mx1 - 0.35].forEach((x) => rotor.add(mesh(ringX(0.2, 0.4, x, x + 0.1, S), M.bronze)));
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    rotor.add(mesh(cylX(0.022, mx0 + 0.3, mx1 - 0.3, 6, Math.cos(a) * 0.37, Math.sin(a) * 0.37), M.bronze));
  }
  // Chaveta na ponta do eixo (lado do acoplamento)
  rotor.add(mesh(box(-1.33, 0.115, 0, 0.12, 0.025, 0.03), M.steel));

  /* ───────────── ROLAMENTOS DO MOTOR (dianteiro e traseiro) ───────────── */
  const bearingAt = (g: THREE.Group, x: number, rIn: number, y = 0) => {
    g.add(mesh(ringX(rIn, rIn + 0.035, x - 0.05, x + 0.05, S, y), M.steel));
    g.add(mesh(ringX(rIn + 0.08, rIn + 0.115, x - 0.05, x + 0.05, S, y), M.steel));
    g.add(mesh(ringX(rIn + 0.034, rIn + 0.081, x - 0.035, x + 0.035, S, y), M.carbon));
  };
  const motorBearings = part('mg-motor-bearings');
  bearingAt(motorBearings, mx1 + 0.06, 0.11);
  bearingAt(motorBearings, mx0 - 0.06, 0.11);

  /* ───────────── VENTILADOR E TAMPA DEFLETORA ───────────── */
  const fan = part('mg-fan');
  fan.add(mesh(ringX(0.11, 0.18, mx0 - 0.5, mx0 - 0.36, 16), M.carbon));
  for (let i = 0; i < 8; i++) {
    const blade = box(mx0 - 0.43, 0.36, 0, 0.06, 0.18, 0.012);
    blade.rotateX((i / 8) * Math.PI * 2);
    fan.add(mesh(blade, M.carbon));
  }
  const fanCover = part('mg-fan-cover');
  fanCover.add(mesh(latheX([[0.64, mx0 - 0.17], [0.66, mx0 - 0.17], [0.66, mx0 - 0.62], [0.2, mx0 - 0.66], [0.19, mx0 - 0.64], [0.64, mx0 - 0.6]], S), motorMat));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    fanCover.add(mesh(cylX(0.035, mx0 - 0.665, mx0 - 0.655, 8, Math.cos(a) * 0.42, Math.sin(a) * 0.42), M.hole, false));
  }

  /* ───────────── ACOPLAMENTO ELÁSTICO (motor ↔ entrada do redutor) ───────────── */
  // Cubo do lado do motor (fica no eixo do motor) e cubo do lado do redutor com o elemento elástico
  const motorHub = part('mg-coupling-hub-motor');
  motorHub.add(mesh(cylX(0.24, -1.42, -1.2, S), M.steel));
  const coupling = part('mg-coupling');
  coupling.add(mesh(cylX(0.24, -1.12, -0.9, S), M.steel));
  for (let i = 0; i < 6; i++) {
    const jaw = box(-1.16, 0.15, 0, 0.04, 0.07, 0.06);
    jaw.rotateX((i / 6) * Math.PI * 2);
    (i % 2 ? coupling : motorHub).add(mesh(jaw, i % 2 ? elastomer : M.steel));
  }

  /* ───────────── PROTEÇÃO DO ACOPLAMENTO ───────────── */
  const guard = part('mg-coupling-guard');
  {
    const shell = new THREE.CylinderGeometry(0.42, 0.42, 1.36, S, 1, true, 0, Math.PI);
    shell.rotateZ(-Math.PI / 2);
    shell.rotateX(Math.PI); // meia-casca por cima (aberta embaixo, fechada pelas chapas laterais)
    shell.translate(-0.88, 0, 0);
    guard.add(mesh(shell, guardMat));
    [-0.42, 0.42].forEach((z) => guard.add(mesh(box(-0.88, -0.42, z, 0.68, 0.38, 0.012), guardMat)));
  }

  /* ───────────── CARCAÇA DO REDUTOR (fica fixa; aberta do lado +X, onde entra a tampa lateral) ───────────── */
  const housing = part('mg-gb-housing');
  housing.add(mesh(box((hx0 + 0.0) / 2, hyc, 0, 0.05, hyh, HZ), gearboxMat));
  housing.add(mesh(box((hx0 + hx1) / 2, hy1 - 0.05, 0, (hx1 - hx0) / 2, 0.05, HZ), gearboxMat));
  housing.add(mesh(box((hx0 + hx1) / 2, hy0 + 0.05, 0, (hx1 - hx0) / 2, 0.05, HZ), gearboxMat));
  [-1, 1].forEach((k) => housing.add(mesh(box((hx0 + hx1) / 2, hyc, k * (HZ - 0.05), (hx1 - hx0) / 2, hyh, 0.05), gearboxMat)));
  // Pés, cubo do eixo de entrada (com retentor) e reforços
  housing.add(mesh(box((hx0 + hx1) / 2, -0.775, 0, 0.62, 0.025, 1.0), gearboxMat));
  housing.add(mesh(ringX(0.12, 0.3, -0.32, hx0, S), gearboxMat));
  housing.add(mesh(ringX(0.11, 0.19, -0.3, -0.2, S), M.rubber));
  [-0.5, 0.5].forEach((z) => housing.add(mesh(box(-0.17, 0.95, z, 0.07, 0.9, 0.025), gearboxMat)));
  // Alojamentos dos rolamentos na parede de trás
  housing.add(mesh(ringX(0.225, 0.33, 0.0, 0.16, S, 0), gearboxMat));
  housing.add(mesh(ringX(0.255, 0.36, 0.0, 0.16, S, C), gearboxMat));
  // Tampa de inspeção e respiro em cima; bujão de dreno embaixo; visor de nível na lateral de trás
  housing.add(mesh(box(0.35, hy1 + 0.02, 0, 0.3, 0.02, 0.45), gearboxMat));
  housing.add(mesh(cylY(0.05, hy1 + 0.04, hy1 + 0.16, 6, 0.55, 0.25), M.zinc));
  housing.add(mesh(cylX(0.05, hx1, hx1 + 0.06, 6, hy0 + 0.15, -0.6), M.zinc));
  housing.add(mesh(cylZ(0.09, -HZ - 0.03, -HZ, S, 0.35, 0.55), M.glass));

  /* ───────────── TAMPA LATERAL (com mancais dos eixos e cubo do eixo de saída) ───────────── */
  const sideCover = part('mg-gb-side-cover');
  sideCover.add(mesh(box((MG.coverX[0] + MG.coverX[1]) / 2, hyc, 0, (MG.coverX[1] - MG.coverX[0]) / 2, hyh, HZ), gearboxMat));
  sideCover.add(mesh(ringX(0.22, 0.32, MG.coverX[1], 1.12, S, C), gearboxMat));
  // Alojamentos dos rolamentos do lado da tampa
  sideCover.add(mesh(ringX(0.225, 0.33, 0.66, MG.coverX[0], S, 0), gearboxMat));
  sideCover.add(mesh(ringX(0.255, 0.36, 0.66, MG.coverX[0], S, C), gearboxMat));
  sideCover.add(mesh(cylX(0.24, MG.coverX[1], 1.0, S, 0), gearboxMat));
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const y = hy0 + 0.15 + t * (hy1 - hy0 - 0.3);
    [-1, 1].forEach((k) => sideCover.add(mesh(cylX(0.05, MG.coverX[1], MG.coverX[1] + 0.05, 6, y, k * (HZ - 0.1)), M.zinc)));
  }

  /* ───────────── RETENTOR DO EIXO DE SAÍDA (na tampa lateral) ───────────── */
  const sealOut = part('mg-gb-seal-out');
  sealOut.add(mesh(ringX(0.14, 0.22, 1.02, 1.11, S, C), M.rubber));
  sealOut.add(mesh(ringX(0.2, 0.24, 1.025, 1.105, S, C), M.steel));

  /* ───────────── EIXO DE ENTRADA COM PINHÃO ───────────── */
  const [f0, f1] = MG.gearFace;
  const pinionPitch = (Math.PI * 2) / MG.pinionTeeth;
  const samples = quality === 'high' ? 12 : 6;
  const input = part('mg-gb-input-shaft');
  input.add(mesh(cylX(0.11, -1.12, 0.86, 20), M.chrome));
  // Dente do pinhão apontando para a coroa (+Y); vão da coroa apontando para o pinhão (−Y)
  input.add(mesh(extrudeX(spurGearShape(MG.pinionTeeth, MG.module, Math.PI / 2 - pinionPitch / 2, samples), f0, f1, 1, 0.01), M.steel));
  input.add(mesh(box(-1.01, 0.115, 0, 0.1, 0.025, 0.03), M.steel));

  /* ───────────── EIXO DE SAÍDA COM COROA (origem do grupo sobre o próprio eixo) ───────────── */
  const output = part('mg-gb-output-shaft', [0, C, 0]);
  output.add(mesh(cylX(0.14, 0.0, 1.75, 24), M.chrome));
  output.add(mesh(extrudeX(spurGearShape(MG.gearTeeth, MG.module, -Math.PI / 2, samples, 0.14), f0, f1, 1, 0.01), M.steel));
  // Cubo da coroa e chaveta na ponta de saída
  output.add(mesh(ringX(0.14, 0.26, f0 - 0.08, f0, S), M.steel));
  output.add(mesh(box(1.55, 0.145, 0, 0.14, 0.025, 0.035), M.steel));

  /* ───────────── ROLAMENTOS DO REDUTOR ───────────── */
  const bearingsIn = part('mg-gb-bearings-in');
  bearingAt(bearingsIn, 0.1, 0.11);
  bearingAt(bearingsIn, 0.73, 0.11);
  const bearingsOut = part('mg-gb-bearings-out');
  bearingAt(bearingsOut, 0.1, 0.14, C);
  bearingAt(bearingsOut, 0.73, 0.14, C);

  /* ───────────── AMBIENTE ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';

  /* ───────────── OPERAÇÃO ─────────────
   * Rotor, ventilador, acoplamento e pinhão giram juntos; a coroa gira no sentido contrário,
   * MG_RATIO vezes mais devagar (relação tirada do número de dentes do modelo). Velocidade didática. */
  const OMEGA_IN = Math.PI * 2 * 0.45;
  const spinning = [rotor, fan, motorHub, coupling, input];
  const animate = (dt: number) => {
    const da = OMEGA_IN * dt;
    spinning.forEach((g) => (g.rotation.x = (g.rotation.x + da) % (Math.PI * 2)));
    output.rotation.x -= da / MG_RATIO;
  };

  return { root, parts, materials: M, environment, animate };
}
