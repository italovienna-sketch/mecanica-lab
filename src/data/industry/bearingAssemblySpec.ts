/**
 * Medidas do conjunto eixo + mancais, sem three.js: o desenho 2D da seção Indústria importa daqui
 * para não carregar o motor 3D junto com a página.
 */

/** Medidas do modelo (unidades de cena), também usadas pelo desenho 2D do conjunto. */
export const BA = {
  floorY: -1.45,
  shaft: {
    x0: -3.2,
    x1: 3.2,
    rEnd: 0.26,
    rSeat: 0.3,
    rMid: 0.36,
    endStep: 2.25,
    shoulder: 1.42
  },
  fixedX: -1.6,
  freeX: 1.6,
  bearing: { rIn: 0.3, rOut: 0.62, wBall: 0.36, wRoller: 0.4 },
  housing: { halfW: 0.5, bodyHalf: 0.85, lugHalf: 1.45, footHalf: 1.75, footY: -1.25, capTop: 0.98, boltS: 1.15 },
  pulley: { x0: -3.12, x1: -2.42, r: 1.1 },
  coupling: { x0: 2.42, x1: 3.2, r: 0.62 },
  sealX: 2.07,
  snapX: 1.84
} as const;
