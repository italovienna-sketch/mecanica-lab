import * as THREE from 'three';
import { createPumpMaterials, PumpMaterials } from './pumpModel';
import { box, cylX, cylY, extrudeX, hexBoltY, latheX, mesh, ringX } from './geomKit';

/**
 * Conjunto de eixo com dois mancais de pedestal bipartidos (modelo educacional, CC0, feito no projeto).
 * Lado da polia (−X): rolamento rígido de esferas = rolamento FIXO (segura o eixo nos dois sentidos axiais).
 * Lado do acoplamento (+X): rolamento de rolos cilíndricos tipo NU = rolamento LIVRE (deixa o eixo dilatar).
 * Proporções didáticas: não reproduz um fabricante nem um tamanho comercial; não há cotas de fabricação.
 *
 * Coordenadas: eixo do conjunto ao longo de X, Y para cima, linha de centro em y = 0.
 * Cada peça é um THREE.Group com `name` igual ao ID da peça. Peças que giram em operação têm a origem
 * do grupo sobre a linha de centro, para girar em torno do próprio eixo.
 */

/** Medidas do modelo: ficam em módulo sem three.js porque o desenho 2D também usa. */
export { BA } from '../../../data/industry/bearingAssemblySpec';
import { BA } from '../../../data/industry/bearingAssemblySpec';

/** Peças que giram junto com o eixo quando o conjunto está em operação. */
export const BA_ROTATING = ['ba-shaft', 'ba-pulley', 'ba-coupling', 'ba-keys', 'ba-snap-rings'];

export function buildBearingAssembly(quality: 'high' | 'low'): {
  root: THREE.Group;
  parts: Map<string, THREE.Group>;
  materials: PumpMaterials;
  environment: THREE.Group;
  animate: (dt: number) => void;
} {
  const S = quality === 'high' ? 48 : 24;
  const M = createPumpMaterials();
  const castIron = new THREE.MeshStandardMaterial({ color: 0x4f6f8c, metalness: 0.3, roughness: 0.55, side: THREE.DoubleSide });
  const pulleyIron = new THREE.MeshStandardMaterial({ color: 0x5b6168, metalness: 0.45, roughness: 0.5, side: THREE.DoubleSide });
  const baseSteel = new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.55, roughness: 0.5, side: THREE.DoubleSide });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a14a, metalness: 0.85, roughness: 0.32, side: THREE.DoubleSide });
  const snapSteel = new THREE.MeshStandardMaterial({ color: 0x2d3136, metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide });
  const elastomer = new THREE.MeshStandardMaterial({ color: 0xd9a21b, metalness: 0, roughness: 0.7, side: THREE.DoubleSide });

  const root = new THREE.Group();
  root.name = 'bearing-assembly-model';
  const parts = new Map<string, THREE.Group>();
  const part = (id: string) => {
    const g = new THREE.Group();
    g.name = id;
    parts.set(id, g);
    root.add(g);
    return g;
  };
  const H = BA.housing;
  const { rEnd, rSeat, rMid, endStep, shoulder } = BA.shaft;

  /* ───────────── BASE (chapa de assentamento) ───────────── */
  const base = part('ba-base');
  base.add(mesh(box(0, (BA.floorY + H.footY) / 2, 0, 2.75, (H.footY - BA.floorY) / 2, 2.0), baseSteel));
  [BA.fixedX, BA.freeX].forEach((cx) =>
    [-1, 1].forEach((k) => {
      // Porca e arruela dos chumbadores que prendem cada pé do mancal na base
      base.add(mesh(cylY(0.16, -0.95, -0.92, 16, cx, k * 1.45), M.zinc));
      base.add(mesh(cylY(0.12, -0.92, -0.8, 6, cx, k * 1.45), M.zinc));
      base.add(mesh(cylY(0.06, -0.8, -0.72, 10, cx, k * 1.45), M.zinc));
    })
  );

  /* ───────────── BASES DAS CAIXAS DE MANCAL (metade de baixo, fixa na chapa) ───────────── */
  const housingBase = part('ba-housing-bases');
  const baseShape = () => {
    const s = new THREE.Shape();
    s.moveTo(-H.footHalf, H.footY);
    s.lineTo(H.footHalf, H.footY);
    s.lineTo(H.footHalf, -0.95);
    s.lineTo(H.bodyHalf, -0.95);
    s.lineTo(H.bodyHalf, -0.35);
    s.lineTo(H.lugHalf, -0.35);
    s.lineTo(H.lugHalf, 0);
    s.lineTo(BA.bearing.rOut, 0);
    s.absarc(0, 0, BA.bearing.rOut, 0, Math.PI, true);
    s.lineTo(-H.lugHalf, 0);
    s.lineTo(-H.lugHalf, -0.35);
    s.lineTo(-H.bodyHalf, -0.35);
    s.lineTo(-H.bodyHalf, -0.95);
    s.lineTo(-H.footHalf, -0.95);
    s.lineTo(-H.footHalf, H.footY);
    return s;
  };
  [BA.fixedX, BA.freeX].forEach((cx) => {
    const g = extrudeX(baseShape(), cx - H.halfW, cx + H.halfW, S);
    housingBase.add(mesh(g, castIron));
  });

  /* ───────────── TAMPAS DAS CAIXAS DE MANCAL (metade de cima) ───────────── */
  const caps = part('ba-housing-caps');
  const capShape = () => {
    const s = new THREE.Shape();
    const a = Math.asin(0.3 / H.capTop);
    s.moveTo(-H.lugHalf, 0);
    s.lineTo(-BA.bearing.rOut, 0);
    s.absarc(0, 0, BA.bearing.rOut, Math.PI, 0, true);
    s.lineTo(H.lugHalf, 0);
    s.lineTo(H.lugHalf, 0.3);
    s.lineTo(Math.cos(a) * H.capTop, 0.3);
    s.absarc(0, 0, H.capTop, a, Math.PI - a, false);
    s.lineTo(-H.lugHalf, 0.3);
    s.lineTo(-H.lugHalf, 0);
    return s;
  };
  [BA.fixedX, BA.freeX].forEach((cx) => {
    caps.add(mesh(extrudeX(capShape(), cx - H.halfW, cx + H.halfW, S), castIron));
    // Graxeira no topo da tampa
    caps.add(mesh(cylY(0.07, H.capTop - 0.02, H.capTop + 0.12, 12, cx, 0), M.zinc));
    caps.add(mesh(new THREE.SphereGeometry(0.06, 12, 8).translate(cx, H.capTop + 0.15, 0), M.zinc));
  });

  /* ───────────── PARAFUSOS DAS TAMPAS (2 por caixa) ───────────── */
  const capBolts = part('ba-cap-bolts');
  [BA.fixedX, BA.freeX].forEach((cx) =>
    [-1, 1].forEach((k) => hexBoltY(cx, k * H.boltS, 0.3, -0.35).forEach((geo) => capBolts.add(mesh(geo, M.zinc))))
  );

  /* ───────────── EIXO ───────────── */
  const shaft = part('ba-shaft');
  const { x0, x1 } = BA.shaft;
  shaft.add(
    mesh(
      latheX(
        [
          [0, x0],
          [rEnd - 0.02, x0],
          [rEnd, x0 + 0.02],
          [rEnd, -endStep],
          [rSeat, -endStep],
          [rSeat, -shoulder],
          [rMid, -shoulder],
          [rMid, shoulder],
          [rSeat, shoulder],
          [rSeat, endStep],
          [rEnd, endStep],
          [rEnd, x1 - 0.02],
          [rEnd - 0.02, x1],
          [0, x1]
        ],
        S
      ),
      M.chrome
    )
  );
  // Canais dos anéis elásticos (faixas escuras) e rasgos de chaveta nas pontas
  [-BA.snapX, BA.snapX + 0.02].forEach((x) => shaft.add(mesh(ringX(rSeat - 0.025, rSeat + 0.002, x - 0.03, x + 0.03, S), M.hole, false)));
  [-2.77, 2.81].forEach((x) => shaft.add(mesh(box(x, rEnd - 0.01, 0, 0.32, 0.02, 0.065), M.hole, false)));

  /* ───────────── ROLAMENTO RÍGIDO DE ESFERAS (lado fixo) ───────────── */
  const ball = part('ba-ball-bearing');
  {
    const c = BA.fixedX;
    const w = BA.bearing.wBall / 2;
    ball.add(mesh(ringX(0.52, BA.bearing.rOut, c - w, c + w, S), M.steel));
    ball.add(mesh(ringX(BA.bearing.rIn, 0.4, c - w, c + w, S), M.steel));
    const n = 9;
    const sphere = new THREE.SphereGeometry(0.068, quality === 'high' ? 16 : 10, quality === 'high' ? 12 : 8);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      ball.add(mesh(sphere.clone().translate(c, Math.cos(a) * 0.46, Math.sin(a) * 0.46), M.chrome));
    }
    sphere.dispose();
    // Gaiola (dois anéis finos de latão, um de cada lado das esferas)
    [-1, 1].forEach((k) => ball.add(mesh(ringX(0.43, 0.49, c + k * 0.075 - 0.012, c + k * 0.075 + 0.012, S), brass)));
  }

  /* ───────────── ROLAMENTO DE ROLOS CILÍNDRICOS TIPO NU (lado livre) ───────────── */
  const roller = part('ba-roller-bearing');
  {
    const c = BA.freeX + 0.02;
    const w = BA.bearing.wRoller / 2;
    roller.add(mesh(ringX(0.52, BA.bearing.rOut, c - w, c + w, S), M.steel));
    // Bordas (rebordos) só no anel externo: é isso que deixa o eixo deslizar no sentido axial
    [-1, 1].forEach((k) => roller.add(mesh(ringX(0.48, 0.52, k < 0 ? c - w : c + w - 0.05, k < 0 ? c - w + 0.05 : c + w, S), M.steel)));
    roller.add(mesh(ringX(BA.bearing.rIn, 0.42, c - w, c + w, S), M.steel));
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      roller.add(mesh(cylX(0.045, c - 0.13, c + 0.13, 12, Math.cos(a) * 0.465, Math.sin(a) * 0.465), M.chrome));
    }
  }

  /* ───────────── VEDAÇÕES (anéis de lábio no lado de fora de cada caixa) ───────────── */
  const sealAt = (id: string, x: number) => {
    const g = part(id);
    g.add(mesh(ringX(rSeat, 0.56, x - 0.05, x + 0.05, S), M.rubber));
    g.add(mesh(ringX(0.5, 0.57, x - 0.052, x + 0.052, S), M.steel));
  };
  sealAt('ba-seal-pulley-side', -BA.sealX);
  sealAt('ba-seal-coupling-side', BA.sealX);

  /* ───────────── ANÉIS ELÁSTICOS (seguram os anéis internos dos rolamentos) ───────────── */
  const snaps = part('ba-snap-rings');
  [-BA.snapX, BA.snapX + 0.02].forEach((x) => {
    snaps.add(mesh(ringX(rSeat - 0.02, rSeat + 0.07, x - 0.022, x + 0.022, S), snapSteel));
    // Orelhas com furos para o alicate de anéis
    [-1, 1].forEach((k) => snaps.add(mesh(box(x, rSeat + 0.1, k * 0.07, 0.022, 0.05, 0.045), snapSteel)));
  });

  /* ───────────── CHAVETAS (polia e acoplamento) ───────────── */
  const keys = part('ba-keys');
  [-2.77, 2.81].forEach((x) => keys.add(mesh(box(x, rEnd + 0.03, 0, 0.3, 0.05, 0.06), M.steel)));

  /* ───────────── POLIA EM V (2 canais) ───────────── */
  const pulley = part('ba-pulley');
  {
    const { x0: p0, x1: p1, r } = BA.pulley;
    pulley.add(
      mesh(
        latheX(
          [
            [rEnd, p0],
            [0.5, p0],
            [0.5, p0 + 0.12],
            [0.8, p0 + 0.12],
            [0.8, p0],
            [r - 0.02, p0],
            [r, p0 + 0.02],
            [r, p0 + 0.04],
            [0.88, p0 + 0.14],
            [0.88, p0 + 0.22],
            [r, p0 + 0.32],
            [r, p0 + 0.38],
            [0.88, p0 + 0.48],
            [0.88, p0 + 0.56],
            [r, p0 + 0.66],
            [r, p1 - 0.02],
            [r - 0.02, p1],
            [rEnd, p1]
          ],
          S
        ),
        pulleyIron
      )
    );
    // Furos de alívio na alma: deixam ver a polia girando
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      pulley.add(mesh(cylX(0.1, p0 + 0.115, p0 + 0.125, 16, Math.cos(a) * 0.65, Math.sin(a) * 0.65), M.hole, false));
    }
  }

  /* ───────────── MEIA-LUVA DO ACOPLAMENTO ELÁSTICO DE GARRAS ───────────── */
  const coupling = part('ba-coupling');
  {
    const { x0: c0, r } = BA.coupling;
    coupling.add(mesh(ringX(rEnd, r, c0, c0 + 0.5, S), M.steel));
    for (let i = 0; i < 3; i++) {
      const jaw = box(c0 + 0.64, 0.44, 0, 0.14, 0.17, 0.17);
      jaw.rotateX((i / 3) * Math.PI * 2);
      coupling.add(mesh(jaw, M.steel));
      // Estrela elástica (elemento de borracha entre as garras)
      const spider = box(c0 + 0.64, 0.44, 0, 0.13, 0.14, 0.1);
      spider.rotateX((i / 3) * Math.PI * 2 + Math.PI / 3);
      coupling.add(mesh(spider, elastomer));
    }
  }

  /* ───────────── AMBIENTE (não são peças do conjunto) ───────────── */
  const environment = new THREE.Group();
  environment.name = 'environment';

  const spin = BA_ROTATING.map((id) => parts.get(id)!).filter(Boolean);
  // Giro didático: lento o bastante para acompanhar com os olhos (não representa a rotação real).
  const animate = (dt: number) => spin.forEach((g) => (g.rotation.x -= dt * 2.4));

  return { root, parts, materials: M, environment, animate };
}
