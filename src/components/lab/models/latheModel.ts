import * as THREE from 'three';

/**
 * Modelo 3D procedural de um torno mecânico convencional (paralelo) de oficina-escola.
 * Modelo educacional simplificado, feito no projeto (CC0). Não representa um fabricante ou modelo comercial:
 * as proporções seguem a disposição clássica do torno paralelo (cabeçote fixo à esquerda, barramento,
 * carro principal com avental, carro transversal, carro superior, porta-ferramenta e cabeçote móvel à direita).
 *
 * Sistema de coordenadas: eixo-árvore ao longo de X (+X = lado do cabeçote móvel), Y para cima,
 * +Z = frente da máquina (lado do operador). 1 unidade ≈ 100 mm. O centro do eixo-árvore está em y = 0
 * (≈ 175 mm acima das guias); o piso fica em y = LATHE_FLOOR_Y.
 *
 * Cada peça é um THREE.Group com `name` igual ao ID canônico em mechanicalMachines.ts.
 */

export const LATHE_FLOOR_Y = -5.25;

const WAY_TOP = -1.72;
const BED_TOP = -1.85;
const BED_BOTTOM = -2.6;

function createLatheMaterials() {
  const m = {
    paint: new THREE.MeshStandardMaterial({ color: 0x5b7366, metalness: 0.2, roughness: 0.55 }),
    paintDark: new THREE.MeshStandardMaterial({ color: 0x3d4c44, metalness: 0.2, roughness: 0.6 }),
    ground: new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 1, roughness: 0.22 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 1, roughness: 0.3 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xe2e5e9, metalness: 1, roughness: 0.14 }),
    darkSteel: new THREE.MeshStandardMaterial({ color: 0x4a4e53, metalness: 0.9, roughness: 0.4 }),
    rawBar: new THREE.MeshStandardMaterial({ color: 0x8d8f91, metalness: 0.85, roughness: 0.55 }),
    bakelite: new THREE.MeshStandardMaterial({ color: 0x18191b, metalness: 0.1, roughness: 0.35 }),
    safetyYellow: new THREE.MeshStandardMaterial({ color: 0xe0a91c, metalness: 0.15, roughness: 0.5 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc8241c, metalness: 0.1, roughness: 0.35 }),
    green: new THREE.MeshStandardMaterial({ color: 0x2f9e44, metalness: 0.1, roughness: 0.4 }),
    plate: new THREE.MeshStandardMaterial({ color: 0xe9e6dc, metalness: 0.3, roughness: 0.4 }),
    carbide: new THREE.MeshStandardMaterial({ color: 0xb08a2e, metalness: 0.7, roughness: 0.35 }),
    hole: new THREE.MeshStandardMaterial({ color: 0x0c0d0e, metalness: 0, roughness: 1 })
  };
  Object.values(m).forEach((mat) => (mat.side = THREE.DoubleSide));
  return m;
}
type LatheMaterials = ReturnType<typeof createLatheMaterials>;

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true): THREE.Mesh {
  const o = new THREE.Mesh(geo, mat);
  o.castShadow = cast;
  o.receiveShadow = true;
  return o;
}

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, mat: THREE.Material, cast = true) {
  const o = mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat, cast);
  o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return o;
}

/** Cilindro ao longo de X entre x0 e x1, centrado em (y, z). */
function cylX(r: number, x0: number, x1: number, segments: number, y = 0, z = 0, rEnd = r) {
  const g = new THREE.CylinderGeometry(rEnd, r, Math.abs(x1 - x0), segments);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, y, z);
  return g;
}

/** Cilindro ao longo de Z entre z0 e z1, centrado em (x, y). */
function cylZ(r: number, z0: number, z1: number, segments: number, x = 0, y = 0) {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(z1 - z0), segments);
  g.rotateX(Math.PI / 2);
  g.translate(x, y, (z0 + z1) / 2);
  return g;
}

/** Cilindro vertical entre y0 e y1, centrado em (x, z). */
function cylY(r: number, y0: number, y1: number, segments: number, x = 0, z = 0) {
  const g = new THREE.CylinderGeometry(r, r, Math.abs(y1 - y0), segments);
  g.translate(x, (y0 + y1) / 2, z);
  return g;
}

/** Sólido de revolução em torno de X a partir de um perfil [raio, x] (fechado automaticamente). */
function latheX(profile: [number, number][], segments: number) {
  const pts = [...profile];
  if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) pts.push(pts[0]);
  const g = new THREE.LatheGeometry(
    pts.map(([r, x]) => new THREE.Vector2(Math.max(0.0001, r), x)),
    segments
  );
  g.rotateZ(-Math.PI / 2);
  return g;
}

/** Prisma ao longo de X: seção transversal dada por pontos (z, y), extrudada de x0 a x1. */
function prismX(section: [number, number][], x0: number, x1: number) {
  const shape = new THREE.Shape(section.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false });
  g.rotateY(-Math.PI / 2);
  g.translate(x1, 0, 0);
  return g;
}

/** Seção retangular (z, y) com os dois cantos superiores arredondados. */
function roundedTopSection(z0: number, z1: number, y0: number, y1: number, r: number, steps = 6): [number, number][] {
  const pts: [number, number][] = [
    [z0, y0],
    [z1, y0]
  ];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push([z1 - r + Math.cos(a) * r, y1 - r + Math.sin(a) * r]);
  }
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (i / steps) * (Math.PI / 2);
    pts.push([z0 + r + Math.cos(a) * r, y1 - r + Math.sin(a) * r]);
  }
  return pts;
}

/** Volante com aro, raios, cubo, anel graduado e manípulo. Eixo do volante ao longo de Z (frente). */
function handwheelZ(M: LatheMaterials, R: number, S: number, withDial = true): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(new THREE.TorusGeometry(R, R * 0.09, 10, S), M.chrome));
  g.add(mesh(cylZ(R * 0.22, -0.02, 0.08, 20), M.chrome));
  for (let i = 0; i < 3; i++) {
    const spoke = mesh(new THREE.BoxGeometry(R, R * 0.09, R * 0.06), M.chrome);
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    spoke.position.set(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, 0);
    spoke.rotation.z = a;
    g.add(spoke);
  }
  // Manípulo giratório
  const handleX = Math.cos(-Math.PI / 6) * R;
  const handleY = Math.sin(-Math.PI / 6) * R;
  g.add(mesh(cylZ(R * 0.06, 0, R * 0.55, 10, handleX, handleY), M.chrome));
  g.add(mesh(cylZ(R * 0.11, R * 0.2, R * 0.65, 14, handleX, handleY), M.bakelite));
  if (withDial) {
    // Anel graduado (colar micrométrico) atrás do volante
    g.add(mesh(cylZ(R * 0.42, -0.14, -0.03, 32), M.steel));
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const tick = mesh(new THREE.BoxGeometry(0.006, i % 5 === 0 ? 0.05 : 0.03, 0.004), M.bakelite, false);
      tick.position.set(Math.cos(a) * R * 0.42, Math.sin(a) * R * 0.42, -0.085);
      tick.rotation.z = a - Math.PI / 2;
      tick.position.z = -0.03;
      g.add(tick);
    }
  }
  return g;
}

/** Alavanca: haste inclinada com esfera de baquelite na ponta, presa numa base. */
function lever(M: LatheMaterials, length: number, tiltDeg: number, knobR = 0.06): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(cylZ(0.05, 0, 0.06, 14), M.chrome));
  const arm = new THREE.Group();
  arm.add(mesh(cylY(0.018, 0, length, 8), M.chrome));
  const knob = mesh(new THREE.SphereGeometry(knobR, 16, 12), M.bakelite);
  knob.position.y = length;
  arm.add(knob);
  arm.position.z = 0.06;
  arm.rotation.z = THREE.MathUtils.degToRad(tiltDeg);
  arm.rotation.x = 0.35;
  g.add(arm);
  return g;
}

export function buildConventionalLathe(quality: 'high' | 'low'): {
  root: THREE.Group;
  parts: Map<string, THREE.Group>;
  environment: THREE.Group;
} {
  const S = quality === 'high' ? 48 : 24;
  const M = createLatheMaterials();
  const root = new THREE.Group();
  root.name = 'conventional-lathe-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string) => {
    const g = new THREE.Group();
    g.name = id;
    parts.set(id, g);
    root.add(g);
    return g;
  };

  /* ───────────── BARRAMENTO (com guias prismáticas e cremalheira) ───────────── */
  const bed = part('lathe-bed');
  const BX0 = -6.1;
  const BX1 = 5.6;
  // Duas paredes longitudinais com chanfro, ligadas por nervuras transversais
  bed.add(mesh(prismX([[0.55, BED_BOTTOM], [1.0, BED_BOTTOM], [1.0, BED_TOP - 0.05], [0.95, BED_TOP], [0.55, BED_TOP]], BX0, BX1), M.paint));
  bed.add(mesh(prismX([[-1.0, BED_BOTTOM], [-0.55, BED_BOTTOM], [-0.55, BED_TOP], [-0.95, BED_TOP], [-1.0, BED_TOP - 0.05]], BX0, BX1), M.paint));
  for (let x = BX0 + 0.5; x < BX1; x += 1.15) bed.add(box(x - 0.08, x + 0.08, BED_BOTTOM + 0.1, BED_TOP - 0.1, -0.56, 0.56, M.paintDark));
  // Guias retificadas: prisma em V externo + guia plana, na frente e atrás
  const vWay = (zc: number) => prismX([[zc - 0.11, BED_TOP], [zc + 0.11, BED_TOP], [zc, WAY_TOP]], BX0 + 2.35, BX1);
  bed.add(mesh(vWay(0.83), M.ground));
  bed.add(mesh(vWay(-0.66), M.ground));
  bed.add(box(BX0 + 2.35, BX1, BED_TOP, WAY_TOP - 0.03, 0.56, 0.7, M.ground));
  bed.add(box(BX0 + 2.35, BX1, BED_TOP, WAY_TOP - 0.03, -0.98, -0.82, M.ground));
  // Cremalheira sob a guia dianteira (o volante do avental engrena nela)
  bed.add(box(BX0 + 2.4, BX1 - 0.3, -2.06, -1.92, 1.0, 1.05, M.darkSteel));
  const teeth = quality === 'high' ? 110 : 0;
  for (let i = 0; i < teeth; i++) {
    const x = BX0 + 2.45 + i * ((BX1 - BX0 - 2.8) / teeth);
    bed.add(box(x, x + 0.03, -2.06, -1.92, 1.05, 1.08, M.darkSteel, false));
  }

  /* ───────────── CABEÇOTE FIXO (caixa de engrenagens do eixo-árvore) ───────────── */
  const head = part('lathe-headstock');
  const HX0 = -6.1;
  const HX1 = -3.75;
  head.add(mesh(prismX(roundedTopSection(-1.0, 1.05, BED_TOP, 1.0, 0.28), HX0, HX1), M.paint));
  head.add(box(HX0 - 0.01, HX1 + 0.01, 0.45, 0.47, -1.01, 1.06, M.paintDark, false)); // junta da tampa
  // Proteção das polias/correia na ponta esquerda
  head.add(mesh(prismX(roundedTopSection(-0.85, 0.85, -1.6, 0.85, 0.35), HX0 - 0.4, HX0), M.paintDark));
  // Nariz do eixo-árvore saindo do cabeçote
  head.add(mesh(cylX(0.62, HX1, HX1 + 0.08, S), M.paintDark));
  head.add(mesh(cylX(0.48, HX1 + 0.08, HX1 + 0.18, S), M.steel));
  // Tabela de rotações e alavancas de seleção de velocidade
  head.add(box(-5.25, -4.25, 0.62, 0.9, 1.05, 1.062, M.plate, false));
  for (let i = 0; i < 6; i++) head.add(box(-5.18 + i * 0.16, -5.07 + i * 0.16, 0.66, 0.86, 1.062, 1.066, M.paintDark, false));
  [
    [-5.2, 0.05, -25],
    [-4.55, 0.05, 20],
    [-4.0, -0.55, -10]
  ].forEach(([x, y, tilt]) => {
    const l = lever(M, 0.42, tilt);
    l.position.set(x, y, 1.05);
    head.add(l);
  });
  // Botões de partida (verde) e parada (preto) — a emergência é uma peça separada
  head.add(mesh(cylZ(0.07, 1.05, 1.11, 20, -5.75, -0.35), M.green));
  head.add(mesh(cylZ(0.07, 1.05, 1.11, 20, -5.75, -0.6), M.bakelite));
  head.add(box(-5.9, -5.6, -0.8, -0.15, 1.05, 1.055, M.paintDark, false));
  // Visor de óleo
  head.add(mesh(cylZ(0.08, 1.05, 1.09, 20, -3.98, -1.3), M.chrome));
  head.add(mesh(cylZ(0.055, 1.05, 1.1, 20, -3.98, -1.3), M.carbide));

  /* ───────────── BOTÃO DE EMERGÊNCIA ───────────── */
  const estop = part('lathe-emergency-stop');
  estop.add(box(-5.95, -5.55, 0.25, 0.65, 1.05, 1.1, M.safetyYellow));
  estop.add(mesh(cylZ(0.08, 1.1, 1.18, 24, -5.75, 0.45), M.bakelite));
  estop.add(mesh(cylZ(0.14, 1.18, 1.24, 32, -5.75, 0.45), M.red));
  const dome = mesh(new THREE.SphereGeometry(0.14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.red);
  dome.rotation.x = Math.PI / 2;
  dome.scale.set(1, 0.45, 1);
  dome.position.set(-5.75, 0.45, 1.24);
  estop.add(dome);

  /* ───────────── CAIXA DE AVANÇOS E ROSCAS (tipo Norton) ───────────── */
  const gearbox = part('lathe-feed-gearbox');
  gearbox.add(mesh(prismX(roundedTopSection(1.0, 1.42, -2.72, -1.9, 0.08), -5.95, -4.0), M.paint));
  gearbox.add(box(-5.7, -4.3, -2.25, -2.0, 1.42, 1.43, M.plate, false));
  [-5.45, -4.95, -4.45].forEach((x, i) => {
    const l = lever(M, 0.26, i === 1 ? 15 : -15, 0.05);
    l.position.set(x, -2.5, 1.42);
    gearbox.add(l);
  });

  /* ───────────── FUSO E VARA (avanço longitudinal e abertura de roscas) ───────────── */
  const screws = part('lathe-leadscrew');
  const LX0 = -4.0;
  const LX1 = 5.35;
  // Fuso com rosca trapezoidal representada por uma hélice
  screws.add(mesh(cylX(0.075, LX0, LX1, 16, -2.25, 1.25), M.steel));
  if (quality === 'high') {
    // Hélice paramétrica (mais barata que interpolar centenas de pontos com CatmullRom).
    const turns = Math.round((LX1 - LX0) / 0.06);
    class Helix extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super();
      }
      getPoint(u: number, target = new THREE.Vector3()) {
        const a = u * turns * Math.PI * 2;
        return target.set(LX0 + u * (LX1 - LX0), -2.25 + Math.sin(a) * 0.08, 1.25 + Math.cos(a) * 0.08);
      }
    }
    screws.add(mesh(new THREE.TubeGeometry(new Helix(), turns * 8, 0.012, 4, false), M.steel, false));
  } else {
    for (let x = LX0 + 0.1; x < LX1; x += 0.12) screws.add(mesh(cylX(0.088, x, x + 0.03, 12, -2.25, 1.25), M.steel, false));
  }
  // Vara (eixo ranhurado para avanços automáticos) e barra de comando da partida
  screws.add(mesh(cylX(0.055, LX0, LX1, 12, -2.5, 1.25), M.chrome));
  screws.add(box(LX0, LX1, -2.505, -2.495, 1.3, 1.31, M.darkSteel, false)); // rasgo da vara
  screws.add(mesh(cylX(0.04, LX0, LX1, 10, -2.68, 1.2), M.chrome));
  screws.add(box(LX1, LX1 + 0.25, -2.75, -2.05, 1.0, 1.42, M.paint)); // mancal da ponta

  /* ───────────── PLACA UNIVERSAL DE 3 CASTANHAS ───────────── */
  const CX = HX1 + 0.18; // face traseira da placa
  const CF = CX + 0.45; // face dianteira da placa
  const chuck = part('lathe-chuck');
  chuck.add(mesh(cylX(0.78, CX, CX + 0.12, S), M.darkSteel)); // flange de fixação
  chuck.add(
    mesh(
      latheX(
        [
          [0.3, CX + 0.12],
          [0.92, CX + 0.12],
          [0.95, CX + 0.15],
          [0.95, CF - 0.03],
          [0.92, CF],
          [0.3, CF]
        ],
        S
      ),
      M.darkSteel
    )
  );
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    // Ranhuras das castanhas na face
    const slot = new THREE.Group();
    slot.add(box(CF - 0.005, CF + 0.002, 0.3, 0.92, -0.12, 0.12, M.hole, false));
    slot.rotation.x = a;
    chuck.add(slot);
    // Encaixes da chave da placa na periferia (entre as castanhas)
    const socket = new THREE.Group();
    socket.add(box(CX + 0.26, CX + 0.36, 0.9, 0.955, -0.05, 0.05, M.hole, false));
    socket.rotation.x = a + Math.PI / 3;
    chuck.add(socket);
  }

  /* ───────────── CHAVE DA PLACA (só aparece na atividade de segurança: esquecida na placa) ───────────── */
  const key = part('lathe-chuck-key');
  const keyLocal = new THREE.Group();
  keyLocal.add(box(CX + 0.27, CX + 0.35, 0.84, 1.5, -0.04, 0.04, M.darkSteel)); // haste quadrada
  keyLocal.add(mesh(cylX(0.045, CX + 0.31 - 0.32, CX + 0.31 + 0.32, 14, 1.52, 0), M.darkSteel)); // cabo em T
  [-0.3, 0.3].forEach((dx) => keyLocal.add(mesh(cylX(0.06, CX + 0.31 + dx - 0.08, CX + 0.31 + dx + 0.08, 14, 1.52, 0), M.red)));
  keyLocal.rotation.x = Math.PI / 3;
  key.add(keyLocal);

  /* ───────────── CASTANHAS (escalonadas, fechadas sobre a peça) ───────────── */
  const jaws = part('lathe-jaws');
  const BAR_R = 0.25;
  for (let i = 0; i < 3; i++) {
    const jaw = new THREE.Group();
    jaw.add(box(CF, CF + 0.32, BAR_R, BAR_R + 0.2, -0.1, 0.1, M.steel));
    jaw.add(box(CF, CF + 0.22, BAR_R + 0.2, BAR_R + 0.4, -0.1, 0.1, M.steel));
    jaw.add(box(CF, CF + 0.12, BAR_R + 0.4, 0.88, -0.1, 0.1, M.steel));
    for (let k = 0; k < 3; k++) jaw.add(box(CF + 0.05 + k * 0.08, CF + 0.08 + k * 0.08, BAR_R - 0.004, BAR_R + 0.01, -0.1, 0.1, M.darkSteel, false));
    jaw.rotation.x = (i * Math.PI * 2) / 3;
    jaws.add(jaw);
  }

  /* ───────────── PEÇA (barra redonda presa na placa e apoiada na contraponta) ───────────── */
  const work = part('lathe-workpiece');
  const SHOULDER = 0.62;
  const WEND = 2.05;
  work.add(mesh(latheX([[0, CX + 0.15], [BAR_R, CX + 0.15], [BAR_R, SHOULDER], [0, SHOULDER]], S), M.rawBar));
  work.add(
    mesh(
      latheX(
        [
          [0, SHOULDER],
          [BAR_R, SHOULDER],
          [0.21, SHOULDER + 0.04],
          [0.21, WEND - 0.03],
          [0.19, WEND],
          [0.05, WEND],
          [0.0, WEND - 0.05]
        ],
        S
      ),
      M.chrome
    )
  );

  /* ───────────── CARRO PRINCIPAL (sela + avental) ───────────── */
  const TX = SHOULDER; // posição da ponta da ferramenta ao longo do barramento
  const carriage = part('lathe-carriage');
  carriage.add(box(TX - 0.72, TX + 0.72, WAY_TOP, -1.38, -1.15, 1.15, M.paint));
  carriage.add(box(TX - 1.0, TX + 1.0, WAY_TOP, -1.55, 0.55, 1.15, M.paint)); // asas sobre as guias
  carriage.add(box(TX - 1.0, TX + 1.0, WAY_TOP, -1.55, -1.15, -0.55, M.paint));
  // Avental (frente do carro) com volante longitudinal e alavancas
  carriage.add(mesh(prismX(roundedTopSection(1.15, 1.42, -2.78, -1.6, 0.06), TX - 0.85, TX + 0.85), M.paint));
  const apronWheel = handwheelZ(M, 0.32, S);
  apronWheel.position.set(TX - 0.4, -2.18, 1.56);
  carriage.add(apronWheel);
  carriage.add(mesh(cylZ(0.05, 1.42, 1.56, 12, TX - 0.4, -2.18), M.chrome));
  const halfNut = lever(M, 0.3, -35, 0.055);
  halfNut.position.set(TX + 0.5, -2.45, 1.42);
  const feedLever = lever(M, 0.3, 30, 0.055);
  feedLever.position.set(TX + 0.5, -1.95, 1.42);
  carriage.add(halfNut, feedLever);
  carriage.add(box(TX - 0.15, TX + 0.25, -1.82, -1.68, 1.42, 1.43, M.plate, false));

  /* ───────────── CARRO TRANSVERSAL ───────────── */
  const cross = part('lathe-cross-slide');
  cross.add(mesh(prismX([[-0.9, -1.38], [1.0, -1.38], [0.95, -1.02], [-0.85, -1.02]], TX - 0.45, TX + 0.45), M.paint));
  cross.add(box(TX - 0.46, TX + 0.46, -1.38, -1.35, -0.9, 1.0, M.ground, false)); // régua de ajuste (cunha)
  cross.add(mesh(cylZ(0.04, 1.0, 1.3, 12, TX, -1.2), M.chrome));
  const crossWheel = handwheelZ(M, 0.26, S);
  crossWheel.position.set(TX, -1.2, 1.36);
  cross.add(crossWheel);

  /* ───────────── CARRO SUPERIOR (espera) ───────────── */
  const compound = part('lathe-compound-rest');
  compound.add(mesh(cylY(0.42, -1.02, -0.9, S, TX, 0.55), M.paintDark)); // base giratória graduada
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * 0.25 + (i / 12) * Math.PI * 0.5;
    compound.add(box(-0.004, 0.004, -0.96, -0.92, 0.0, 0.03, M.plate, false).translateX(TX + Math.cos(a) * 0.42).translateZ(0.55 + Math.sin(a) * 0.42));
  }
  compound.add(mesh(prismX([[0.1, -0.9], [1.15, -0.9], [1.1, -0.62], [0.15, -0.62]], TX - 0.3, TX + 0.3), M.paint));
  compound.add(mesh(cylZ(0.03, 1.15, 1.3, 10, TX, -0.76), M.chrome));
  const compWheel = handwheelZ(M, 0.17, S, false);
  compWheel.position.set(TX, -0.76, 1.34);
  compound.add(compWheel);

  /* ───────────── PORTA-FERRAMENTA (castelo quádruplo) ───────────── */
  const post = part('lathe-tool-post');
  const PZ0 = 0.5;
  const PZ1 = 1.05;
  post.add(box(TX - 0.25, TX + 0.25, -0.62, -0.15, PZ0, PZ1, M.darkSteel));
  post.add(box(TX - 0.25, TX + 0.25, -0.15, -0.14, PZ0 + 0.06, PZ1, M.hole, false)); // rasgo da ferramenta
  post.add(box(TX - 0.25, TX + 0.25, 0.0, 0.1, PZ0, PZ1, M.darkSteel)); // tampa de aperto
  [PZ0 + 0.17, PZ1 - 0.17].forEach((z) => {
    post.add(mesh(cylY(0.05, 0.1, 0.16, 6, TX, z), M.steel)); // parafusos de fixação da ferramenta
  });
  post.add(mesh(cylY(0.06, 0.1, 0.32, 16, TX, (PZ0 + PZ1) / 2), M.chrome)); // manípulo de aperto
  post.add(mesh(cylX(0.022, TX - 0.05, TX + 0.4, 10, 0.3, (PZ0 + PZ1) / 2), M.chrome));
  const postKnob = mesh(new THREE.SphereGeometry(0.055, 16, 12), M.bakelite);
  postKnob.position.set(TX + 0.42, 0.3, (PZ0 + PZ1) / 2);
  post.add(postKnob);

  /* ───────────── FERRAMENTA DE CORTE (bits com pastilha) ───────────── */
  const tool = part('lathe-cutting-tool');
  // Haste quadrada presa no castelo, com a aresta de corte na altura do centro (y = 0)
  tool.add(box(TX - 0.06, TX + 0.07, -0.14, -0.0, 0.3, PZ1 + 0.12, M.steel));
  tool.add(
    mesh(
      prismX(
        [
          [0.215, -0.0],
          [0.3, -0.0],
          [0.3, -0.12],
          [0.235, -0.1]
        ],
        TX - 0.06,
        TX + 0.07
      ),
      M.carbide
    )
  );

  /* ───────────── PROTEÇÃO DA PLACA (com dobradiça na traseira) ───────────── */
  const guard = part('lathe-chuck-guard');
  const shell = new THREE.CylinderGeometry(1.18, 1.18, 0.95, S, 1, true, Math.PI, Math.PI);
  shell.rotateZ(-Math.PI / 2);
  shell.translate(CX + 0.32, 0, 0);
  guard.add(mesh(shell, M.safetyYellow));
  const edge = new THREE.TorusGeometry(1.18, 0.025, 6, S, Math.PI);
  edge.rotateY(Math.PI / 2);
  [CX - 0.155, CX + 0.795].forEach((x) => {
    const e = mesh(edge.clone(), M.safetyYellow);
    e.position.x = x;
    guard.add(e);
  });
  guard.add(mesh(cylX(0.04, CX - 0.15, CX + 0.8, 12, 0, -1.2), M.chrome)); // dobradiça

  /* ───────────── CABEÇOTE MÓVEL (contraponta) ───────────── */
  const tail = part('lathe-tailstock');
  const TS0 = 2.7;
  const TS1 = 4.15;
  tail.add(box(TS0 - 0.1, TS1, WAY_TOP, -1.45, -0.95, 0.95, M.paint)); // base sobre as guias
  const tailSection: [number, number][] = [
    [-0.55, -1.45],
    [0.55, -1.45],
    [0.5, -0.15]
  ];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI;
    tailSection.push([Math.cos(a) * 0.5, Math.sin(a) * 0.5]);
  }
  tailSection.push([-0.5, -0.15]);
  tail.add(mesh(prismX(tailSection, TS0, TS1), M.paint));
  // Mangote (pínula) e ponta rotativa encostada no furo de centro da peça
  tail.add(mesh(cylX(0.2, TS0 - 0.4, TS0, S), M.chrome));
  tail.add(
    mesh(
      latheX(
        [
          [0.0, WEND - 0.06],
          [0.11, WEND + 0.12],
          [0.11, WEND + 0.16],
          [0.19, WEND + 0.18],
          [0.19, TS0 - 0.38],
          [0.0, TS0 - 0.38]
        ],
        S
      ),
      M.steel
    )
  );
  tail.add(mesh(cylX(0.08, TS1, TS1 + 0.25, 16), M.chrome));
  const tailWheel = handwheelZ(M, 0.33, S);
  tailWheel.rotation.y = Math.PI / 2;
  tailWheel.position.set(TS1 + 0.32, 0, 0);
  tail.add(tailWheel);
  // Trava do mangote (em cima) e alavanca de fixação no barramento (embaixo)
  const quillLock = lever(M, 0.25, 0, 0.05);
  quillLock.rotation.x = -Math.PI / 2;
  quillLock.position.set(TS0 + 0.25, 0.5, 0);
  const bedClamp = lever(M, 0.3, -60, 0.055);
  bedClamp.position.set(TS1 - 0.3, -1.6, 0.95);
  tail.add(quillLock, bedClamp);

  /* ───────────── AMBIENTE (pedestais e bandeja de cavacos; não são peças de estudo) ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';
  const cabinet = new THREE.MeshStandardMaterial({ color: 0x46564d, metalness: 0.2, roughness: 0.6 });
  const trayMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.6, roughness: 0.45 });
  [
    [-6.2, -3.9],
    [3.5, 5.7]
  ].forEach(([x0, x1]) => {
    environment.add(box(x0, x1, LATHE_FLOOR_Y, -2.95, -0.85, 0.85, cabinet));
    environment.add(box(x0 + 0.15, x1 - 0.15, LATHE_FLOOR_Y + 0.6, -3.25, 0.85, 0.87, trayMat, false)); // porta
  });
  environment.add(box(-6.3, 5.8, -2.95, -2.82, -1.25, 1.7, trayMat));
  environment.add(box(-6.3, 5.8, -2.82, -2.62, 1.62, 1.7, trayMat)); // borda da bandeja
  environment.add(box(-6.3, 5.8, -2.82, -2.62, -1.25, -1.17, trayMat));
  // Calços de nivelamento
  [-6.0, -4.1, 3.7, 5.5].forEach((x) => environment.add(mesh(cylY(0.12, LATHE_FLOOR_Y, LATHE_FLOOR_Y + 0.08, 16, x, 0), trayMat)));

  return { root, parts, environment };
}
