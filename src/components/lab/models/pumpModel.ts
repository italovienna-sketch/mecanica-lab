import * as THREE from 'three';

/**
 * Modelo 3D procedural de uma bomba centrífuga horizontal de sucção axial, construção back-pull-out.
 * Modelo educacional simplificado (CC0, feito no projeto). Proporções inspiradas na família ISO 2858
 * 65-50-160; não reproduz um produto comercial específico.
 *
 * Sistema de coordenadas: eixo da bomba ao longo de X (+X = lado da sucção, −X = lado do acionamento),
 * Y para cima. 1 unidade ≈ 100 mm. O centro do eixo está em y = 0; a base fica em y = −1.8.
 *
 * Cada peça é um THREE.Group com `name` igual ao ID canônico da peça em mechanicalMachines.ts.
 */

export interface PumpMaterials {
  paint: THREE.MeshStandardMaterial;
  paintDark: THREE.MeshStandardMaterial;
  bronze: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  zinc: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  carbon: THREE.MeshStandardMaterial;
  ceramic: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  hole: THREE.MeshStandardMaterial;
  gasket: THREE.MeshStandardMaterial;
  coupling: THREE.MeshStandardMaterial;
}

export function createPumpMaterials(): PumpMaterials {
  const mats: PumpMaterials = {
    paint: new THREE.MeshStandardMaterial({ color: 0x35587a, metalness: 0.25, roughness: 0.55 }),
    paintDark: new THREE.MeshStandardMaterial({ color: 0x2b4763, metalness: 0.25, roughness: 0.6 }),
    bronze: new THREE.MeshStandardMaterial({ color: 0xb4823f, metalness: 0.85, roughness: 0.35 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 1, roughness: 0.28 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe2e6, metalness: 1, roughness: 0.16 }),
    zinc: new THREE.MeshStandardMaterial({ color: 0xa7abb1, metalness: 0.9, roughness: 0.38 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1c1d1f, metalness: 0, roughness: 0.85 }),
    carbon: new THREE.MeshStandardMaterial({ color: 0x2a2b2e, metalness: 0.2, roughness: 0.35 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xe9e6dc, metalness: 0, roughness: 0.25 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9bc7e0, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.55 }),
    hole: new THREE.MeshStandardMaterial({ color: 0x0c0d0e, metalness: 0, roughness: 1 }),
    // Papelão hidráulico (fibra comprimida) costuma ser verde-oliva ou cinza; cor só para distinguir a peça.
    gasket: new THREE.MeshStandardMaterial({ color: 0x7a8450, metalness: 0, roughness: 0.9 }),
    coupling: new THREE.MeshStandardMaterial({ color: 0x55595f, metalness: 0.75, roughness: 0.42 })
  };
  // Faces dos dois lados: peças abertas (lanterna, carcaça oca) continuam visíveis por dentro.
  Object.values(mats).forEach((m) => (m.side = THREE.DoubleSide));
  return mats;
}

const BASE_Y = -1.8;

/** Sólido de revolução em torno do eixo X a partir de um perfil [raio, x]. */
function latheX(profile: [number, number][], segments: number, phiStart = 0, phiLength = Math.PI * 2): THREE.BufferGeometry {
  const closed = [...profile];
  const [r0, x0] = profile[0];
  const [rn, xn] = profile[profile.length - 1];
  if (r0 !== rn || x0 !== xn) closed.push(profile[0]); // fecha o perfil para não deixar faces abertas
  const pts = closed.map(([r, x]) => new THREE.Vector2(Math.max(0.0001, r), x));
  const g = new THREE.LatheGeometry(pts, segments, phiStart, phiLength);
  g.rotateZ(-Math.PI / 2); // eixo Y do torno → eixo X da cena
  return g;
}

/** Cilindro (ou prisma) ao longo de X entre x0 e x1. */
function cylX(r: number, x0: number, x1: number, segments: number, rTop = r): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rTop, r, Math.abs(x1 - x0), segments);
  g.rotateZ(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

/** Anel (tubo de parede) ao longo de X. */
function ringX(rIn: number, rOut: number, x0: number, x1: number, segments: number, chamfer = 0.01): THREE.BufferGeometry {
  const c = Math.min(chamfer, (rOut - rIn) / 3, (x1 - x0) / 3);
  return latheX(
    [
      [rIn, x0],
      [rOut - c, x0],
      [rOut, x0 + c],
      [rOut, x1 - c],
      [rOut - c, x1],
      [rIn, x1],
      [rIn, x0]
    ],
    segments
  );
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

/** Tubo de raio variável ao longo de uma curva (usado na espiral da voluta). */
function variableTube(curve: THREE.Curve<THREE.Vector3>, radius: (t: number) => number, tubular: number, radial: number): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubular, false);
  const positions: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, p);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radius(t);
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const cx = -Math.cos(v);
      const cy = Math.sin(v);
      positions.push(p.x + r * (cx * N.x + cy * B.x), p.y + r * (cx * N.y + cy * B.y), p.z + r * (cx * N.z + cy * B.z));
    }
  }
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = (i + 1) * (radial + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  // Tampa no início (lingueta da voluta)
  const startCenter = positions.length / 3;
  curve.getPointAt(0, p);
  positions.push(p.x, p.y, p.z);
  for (let j = 0; j < radial; j++) indices.push(startCenter, j, j + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/** Furos de flange representados como discos escuros rebaixados. */
function boltHolesOnX(group: THREE.Group, mat: THREE.Material, pcd: number, count: number, x: number, holeR: number, startAngle = Math.PI / count) {
  for (let i = 0; i < count; i++) {
    const a = startAngle + (i * Math.PI * 2) / count;
    const h = mesh(cylX(holeR, x - 0.006, x + 0.006, 12), mat, false);
    h.position.set(0, Math.sin(a) * pcd, Math.cos(a) * pcd);
    group.add(h);
  }
}

/** Parafuso sextavado alinhado ao eixo X (cabeça do lado −X). */
function hexBoltX(mat: THREE.Material, headX: number, length: number, size = 0.1): THREE.Group {
  const g = new THREE.Group();
  const head = mesh(cylX(size, headX, headX + size * 0.75, 6), mat);
  head.rotation.x = Math.PI / 6;
  const washer = mesh(cylX(size * 1.15, headX + size * 0.75, headX + size * 0.9, 18), mat);
  const shank = mesh(cylX(size * 0.55, headX + size * 0.9, headX + length, 12), mat);
  g.add(head, washer, shank);
  return g;
}

export function buildCentrifugalPump(quality: 'high' | 'low'): { root: THREE.Group; parts: Map<string, THREE.Group>; materials: PumpMaterials; environment: THREE.Group } {
  const S = quality === 'high' ? 48 : 24; // segmentos de revolução
  const M = createPumpMaterials();
  const root = new THREE.Group();
  root.name = 'centrifugal-pump-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string) => {
    const g = new THREE.Group();
    g.name = id;
    parts.set(id, g);
    root.add(g);
    return g;
  };

  /* ───────────── VOLUTA (carcaça em espiral) ───────────── */
  const volute = part('pump-volute-casing');
  // Corpo oco: parede circunferencial + parede frontal (lado da sucção). A traseira é aberta e
  // fechada pela tampa de pressão — é por ela que a unidade back-pull-out sai.
  volute.add(mesh(ringX(0.97, 1.03, -0.3, 0.5, S, 0.01), M.paint));
  volute.add(mesh(latheX([[0.34, 0.5], [1.03, 0.5], [0.66, 0.63], [0.34, 0.63]], S), M.paint));
  volute.add(mesh(ringX(0.34, 0.42, 0.44, 0.5, S, 0.004), M.bronze)); // anel de desgaste
  // Flange traseiro de união com o cavalete (onde passam os parafusos)
  volute.add(mesh(ringX(1.0, 1.36, -0.42, -0.3, S, 0.02), M.paint));
  boltHolesOnX(volute, M.hole, 1.2, 8, -0.425, 0.07);
  // Espiral: raio do caminho e da seção crescem ao longo da volta
  const spiralPts: THREE.Vector3[] = [];
  const turns = 0.86;
  const phi0 = (105 * Math.PI) / 180;
  const nSp = 40;
  for (let i = 0; i <= nSp; i++) {
    const t = i / nSp;
    const phi = phi0 + t * turns * Math.PI * 2;
    const R = 1.02 + 0.2 * t;
    spiralPts.push(new THREE.Vector3(0.22, Math.sin(phi) * R, Math.cos(phi) * R));
  }
  // Curva final até o bocal de recalque vertical, centralizado sobre o eixo
  const last = spiralPts[spiralPts.length - 1];
  spiralPts.push(new THREE.Vector3(0.22, last.y + 0.32, last.z * 0.45));
  spiralPts.push(new THREE.Vector3(0.22, 1.62, 0.02));
  spiralPts.push(new THREE.Vector3(0.22, 1.85, 0));
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPts, false, 'centripetal');
  volute.add(
    mesh(
      variableTube(spiralCurve, (t) => (t < 0.82 ? 0.14 + 0.24 * (t / 0.82) : 0.38 - 0.04 * ((t - 0.82) / 0.18)), quality === 'high' ? 180 : 90, quality === 'high' ? 28 : 16),
      M.paint
    )
  );
  // Nervuras de reforço
  for (const a of [Math.PI * 0.85, Math.PI * 1.25, Math.PI * 1.65]) {
    const rib = mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), M.paint);
    rib.position.set(-0.05, Math.sin(a) * 1.18, Math.cos(a) * 1.18);
    rib.rotation.x = -a;
    volute.add(rib);
  }
  // Bocal e flange de recalque (DN 50 · flange Ø165, 4 furos)
  const disch = new THREE.Group();
  disch.add(mesh(new THREE.CylinderGeometry(0.33, 0.35, 0.3, S), M.paint));
  disch.children[0].position.y = 1.85;
  const dFlange = mesh(new THREE.CylinderGeometry(0.825, 0.825, 0.18, S), M.paint);
  dFlange.position.y = 2.07;
  disch.add(dFlange);
  const dBore = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.012, S), M.hole, false);
  dBore.position.y = 2.165;
  disch.add(dBore);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const h = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 12), M.hole, false);
    h.position.set(0.22 + Math.cos(a) * 0.625, 2.166, Math.sin(a) * 0.625);
    disch.add(h);
  }
  disch.children.slice(0, 3).forEach((c) => (c.position.x = 0.22));
  volute.add(disch);
  // Bocal de sucção axial (DN 65 · flange Ø185, 8 furos) e anel de desgaste
  volute.add(mesh(latheX([[0.33, 0.5], [0.52, 0.5], [0.44, 1.42], [0.33, 1.42]], S), M.paint));
  volute.add(mesh(ringX(0.33, 0.925, 1.42, 1.62, S, 0.02), M.paint));
  boltHolesOnX(volute, M.hole, 0.725, 8, 1.625, 0.09);
  volute.add(mesh(cylX(0.33, 1.6, 1.627, S), M.hole, false));
  // Pés de apoio da carcaça
  for (const z of [-0.6, 0.6]) {
    const leg = mesh(new THREE.BoxGeometry(0.42, 0.62, 0.22), M.paint);
    leg.position.set(0.22, -1.45, z * 0.82);
    const pad = mesh(new THREE.BoxGeometry(0.62, 0.1, 0.42), M.paint);
    pad.position.set(0.22, BASE_Y + 0.05, z * 0.95);
    volute.add(leg, pad);
  }
  // Bujões de dreno e de escorva
  const drain = mesh(cylX(0.06, 0, 0.08, 6), M.zinc);
  drain.rotation.z = Math.PI / 2;
  drain.position.set(0.22, -1.42, 0.0);
  volute.add(drain);

  /* ───────────── ROTOR (impelidor fechado, 6 pás curvadas para trás) ───────────── */
  const impeller = part('pump-impeller');
  impeller.add(mesh(ringX(0.12, 0.22, 0.0, 0.36, S, 0.015), M.bronze)); // cubo
  impeller.add(mesh(latheX([[0.2, 0.04], [0.8, 0.07], [0.8, 0.1], [0.2, 0.1]], S), M.bronze)); // disco traseiro
  impeller.add(mesh(latheX([[0.8, 0.2], [0.8, 0.23], [0.4, 0.33], [0.36, 0.44], [0.32, 0.44], [0.33, 0.31], [0.78, 0.2]], S), M.bronze)); // disco frontal com olhal
  const vaneShape = new THREE.Shape();
  const vanePts: THREE.Vector2[] = [];
  const vaneIn: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const r = 0.3 + t * 0.48;
    const a = t * 1.15; // curvatura para trás
    vanePts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    vaneIn.push(new THREE.Vector2(Math.cos(a + 0.06) * r, Math.sin(a + 0.06) * r));
  }
  vaneShape.setFromPoints([...vanePts, ...vaneIn.reverse()]);
  const vaneGeo = new THREE.ExtrudeGeometry(vaneShape, { depth: 0.11, bevelEnabled: false, curveSegments: 4 });
  vaneGeo.rotateY(Math.PI / 2); // extrusão ao longo de X
  vaneGeo.translate(0.1, 0, 0);
  for (let i = 0; i < 6; i++) {
    const v = mesh(vaneGeo, M.bronze);
    v.rotation.x = (i * Math.PI * 2) / 6;
    impeller.add(v);
  }
  // Furos de equilíbrio no disco traseiro
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    const h = mesh(cylX(0.035, 0.035, 0.045, 10), M.hole, false);
    h.position.set(0, Math.sin(a) * 0.3, Math.cos(a) * 0.3);
    impeller.add(h);
  }

  /* ───────────── JUNTA DA CARCAÇA (entre a carcaça e a tampa de pressão) ───────────── */
  // Anel plano por dentro do círculo de parafusos; espessura exagerada (2 mm) para ficar visível e clicável.
  const gasket = part('pump-casing-gasket');
  gasket.add(mesh(ringX(0.98, 1.12, -0.44, -0.42, S, 0.002), M.gasket));

  /* ───────────── TAMPA DE PRESSÃO + SELO MECÂNICO ───────────── */
  const seal = part('pump-mechanical-seal');
  seal.add(mesh(ringX(0.34, 1.36, -0.56, -0.44, S, 0.015), M.paintDark)); // tampa de pressão
  seal.add(mesh(ringX(0.33, 0.46, -1.0, -0.56, S, 0.015), M.paintDark)); // câmara do selo
  seal.add(mesh(ringX(0.17, 0.46, -1.06, -1.0, S, 0.01), M.paintDark)); // fundo da câmara (preme)
  seal.add(mesh(ringX(0.165, 0.29, -0.98, -0.92, S, 0.008), M.ceramic)); // sede estacionária
  seal.add(mesh(ringX(0.165, 0.27, -0.92, -0.86, S, 0.008), M.carbon)); // anel rotativo (face de grafite)
  // Mola helicoidal
  const helixPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const a = t * Math.PI * 2 * 5;
    helixPts.push(new THREE.Vector3(-0.85 + t * 0.27, Math.sin(a) * 0.225, Math.cos(a) * 0.225));
  }
  seal.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), quality === 'high' ? 240 : 120, 0.02, 8), M.steel));
  seal.add(mesh(ringX(0.16, 0.27, -0.58, -0.5, S, 0.008), M.steel)); // colar de arraste
  seal.add(mesh(ringX(0.16, 0.2, -0.86, -0.58, S, 0.004), M.rubber)); // fole/elastômero

  /* ───────────── EIXO ESCALONADO ───────────── */
  const shaft = part('pump-shaft');
  shaft.add(
    mesh(
      latheX(
        [
          [0.0001, -5.0],
          [0.125, -5.0],
          [0.14, -4.985],
          [0.14, -4.45],
          [0.18, -4.45],
          [0.18, -4.15],
          [0.2, -4.15],
          [0.2, -3.62],
          [0.235, -3.62],
          [0.235, -2.18],
          [0.2, -2.18],
          [0.2, -1.62],
          [0.18, -1.62],
          [0.18, -1.06],
          [0.16, -1.06],
          [0.16, -0.02],
          [0.12, -0.02],
          [0.12, 0.38],
          [0.09, 0.38],
          [0.09, 0.53],
          [0.07, 0.55],
          [0.0001, 0.55]
        ],
        S
      ),
      M.steel
    )
  );
  // Chavetas (acoplamento e rotor)
  const key1 = mesh(new THREE.BoxGeometry(0.42, 0.06, 0.08), M.zinc);
  key1.position.set(-4.74, 0.14, 0);
  const key2 = mesh(new THREE.BoxGeometry(0.34, 0.05, 0.06), M.zinc);
  key2.position.set(0.18, 0.12, 0);
  shaft.add(key1, key2);
  // Rosca da ponta (anéis finos)
  for (let i = 0; i < 6; i++) shaft.add(mesh(ringX(0.085, 0.095, 0.4 + i * 0.022, 0.41 + i * 0.022, 20, 0.002), M.steel, false));

  /* ───────────── ROLAMENTOS (par de rolamentos rígidos de esferas) ───────────── */
  const bearings = part('pump-bearings');
  const ballGeo = new THREE.SphereGeometry(0.068, quality === 'high' ? 16 : 10, quality === 'high' ? 12 : 8);
  for (const cx of [-3.89, -1.9]) {
    const w = 0.115;
    bearings.add(mesh(latheX([[0.2, cx - w], [0.265, cx - w], [0.265, cx - 0.04], [0.255, cx], [0.265, cx + 0.04], [0.265, cx + w], [0.2, cx + w]], S), M.chrome));
    bearings.add(mesh(latheX([[0.385, cx - w], [0.45, cx - w], [0.45, cx + w], [0.385, cx + w], [0.385, cx + 0.04], [0.395, cx], [0.385, cx - 0.04]], S), M.chrome));
    // Gaiola
    bearings.add(mesh(ringX(0.31, 0.34, cx - 0.03, cx + 0.03, S, 0.003), M.zinc, false));
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9;
      const b = mesh(ballGeo, M.chrome);
      b.position.set(cx, Math.sin(a) * 0.325, Math.cos(a) * 0.325);
      bearings.add(b);
    }
  }

  /* ───────────── CAVALETE DE MANCAL + LANTERNA ───────────── */
  const bracket = part('pump-bearing-bracket');
  bracket.add(
    mesh(
      latheX(
        [
          [0.45, -4.36],
          [0.6, -4.36],
          [0.64, -4.3],
          [0.64, -1.5],
          [0.6, -1.45],
          [0.45, -1.45],
          [0.45, -1.7],
          [0.5, -1.7],
          [0.5, -4.1],
          [0.45, -4.1],
          [0.45, -4.36]
        ],
        S
      ),
      M.paint
    )
  );
  // Aletas de reforço do corpo
  for (const x of [-3.5, -3.1, -2.7, -2.3]) bracket.add(mesh(ringX(0.63, 0.68, x - 0.03, x + 0.03, S, 0.01), M.paint));
  // Tampas dos mancais com vedação de labirinto
  bracket.add(mesh(ringX(0.19, 0.5, -4.46, -4.36, S, 0.015), M.paintDark));
  bracket.add(mesh(ringX(0.185, 0.24, -4.5, -4.46, S, 0.005), M.rubber));
  // Lanterna: duas meias-cascas deixam janelas laterais para acessar o selo
  const lanternProfile: [number, number][] = [
    [0.55, -1.48],
    [0.62, -1.48],
    [1.0, -0.72],
    [0.93, -0.72],
    [0.55, -1.42]
  ];
  bracket.add(mesh(latheX(lanternProfile, S, Math.PI * 0.18, Math.PI * 0.64), M.paint));
  bracket.add(mesh(latheX(lanternProfile, S, Math.PI * 1.18, Math.PI * 0.64), M.paint));
  bracket.add(mesh(ringX(0.95, 1.36, -0.72, -0.56, S, 0.02), M.paint)); // flange do adaptador
  boltHolesOnX(bracket, M.hole, 1.2, 8, -0.725, 0.07);
  // Pé do cavalete
  const foot = mesh(new THREE.BoxGeometry(0.85, 1.1, 0.3), M.paint);
  foot.position.set(-3.2, -1.15, 0);
  const footPad = mesh(new THREE.BoxGeometry(1.0, 0.1, 0.9), M.paint);
  footPad.position.set(-3.2, BASE_Y + 0.05, 0);
  bracket.add(foot, footPad);
  // Visor de nível de óleo, bujão de enchimento e respiro
  const sight = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24), M.zinc);
  sight.rotation.x = Math.PI / 2;
  sight.position.set(-2.95, -0.28, 0.64);
  const sightGlass = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.09, 24), M.glass, false);
  sightGlass.rotation.x = Math.PI / 2;
  sightGlass.position.set(-2.95, -0.28, 0.66);
  const fill = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 6), M.zinc);
  fill.position.set(-3.35, 0.69, 0);
  const breather = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 12), M.zinc);
  breather.position.set(-2.55, 0.72, 0);
  bracket.add(sight, sightGlass, fill, breather);

  /* ───────────── FIXADORES (parafusos da carcaça + porca do rotor) ───────────── */
  const fasteners = part('pump-fasteners');
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i * Math.PI * 2) / 8;
    const b = hexBoltX(M.zinc, -0.83, 0.52, 0.095);
    b.position.set(0, Math.sin(a) * 1.2, Math.cos(a) * 1.2);
    fasteners.add(b);
  }

  /* ───────────── PORCA E ARRUELA DO ROTOR (ponta da sucção do eixo) ───────────── */
  const impNut = part('pump-impeller-nut');
  impNut.add(mesh(ringX(0.09, 0.17, 0.38, 0.41, S, 0.005), M.steel)); // arruela
  const nut = mesh(cylX(0.15, 0.41, 0.52, 6), M.chrome);
  nut.rotation.x = Math.PI / 6;
  impNut.add(nut);

  /* ───────────── CUBO DO ACOPLAMENTO (lado da bomba; espaçador e lado do motor não modelados) ───────────── */
  const hub = part('pump-coupling-hub');
  hub.add(mesh(ringX(0.14, 0.32, -4.95, -4.58, S, 0.015), M.coupling)); // corpo do cubo, sobre a chaveta
  hub.add(mesh(ringX(0.14, 0.62, -5.06, -4.95, S, 0.015), M.coupling)); // flange de ligação ao espaçador
  boltHolesOnX(hub, M.hole, 0.5, 6, -5.065, 0.045, 0);

  /* ───────────── AMBIENTE (base metálica; não é peça da bomba) ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.6, roughness: 0.5 });
  const top = mesh(new THREE.BoxGeometry(7.4, 0.12, 2.3), baseMat);
  top.position.set(-1.65, BASE_Y - 0.06, 0);
  const rails = [-1.1, 1.1].map((z) => {
    const r = mesh(new THREE.BoxGeometry(7.4, 0.3, 0.14), baseMat);
    r.position.set(-1.65, BASE_Y - 0.27, z);
    return r;
  });
  environment.add(top, ...rails);
  // Calços sob os pés (prática de alinhamento)
  [0.22, -3.2].forEach((x) => {
    const shim = mesh(new THREE.BoxGeometry(0.66, 0.012, 0.95), M.zinc, false);
    shim.position.set(x, BASE_Y + 0.006, 0);
    environment.add(shim);
  });

  return { root, parts, materials: M, environment };
}
