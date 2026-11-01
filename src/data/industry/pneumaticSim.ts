/**
 * Simulação didática da bancada pneumática: válvula de bloqueio com escape → filtro → regulador com manômetro →
 * válvula direcional 5/2 (botão e retorno por mola) → duas válvulas reguladoras de fluxo unidirecionais (controle na
 * saída do ar) → cilindro de dupla ação.
 *
 * É um modelo QUALITATIVO: pressões em "bar simulados", áreas e velocidades escolhidas para o ensino. Ele reproduz
 * relações reais — o lado da haste tem área menor; a reguladora na saída do ar controla a velocidade do movimento;
 * fechar a alimentação com escape despressuriza o circuito, mais devagar quando a saída está estrangulada —
 * mas não calcula força, vazão ou tempo de uma bancada real.
 *
 * Numeração das vias da válvula (ISO 5599-3): 1 alimentação, 2 e 4 utilização, 3 e 5 escape.
 * Em repouso: 1→2 (lado da haste, cilindro recuado) e 4→5. Acionada (14): 1→4 (lado traseiro, avanço) e 2→3.
 */

export interface PneuState {
  supplyOpen: boolean;
  /** Ajuste do regulador (bar simulados). */
  reg: number;
  /** Botão da válvula 5/2 acionado. */
  pushed: boolean;
  /** Abertura da reguladora de fluxo da linha 4 (lado traseiro), 0,1–1. */
  thr4: number;
  /** Abertura da reguladora de fluxo da linha 2 (lado da haste), 0,1–1. */
  thr2: number;
  /** Posição do pistão: 0 = recuado, 1 = avançado. */
  pos: number;
  /** Pressão na linha depois do regulador. */
  pLine: number;
  /** Pressão na câmara traseira (via 4). */
  p4: number;
  /** Pressão na câmara do lado da haste (via 2). */
  p2: number;
}

export const PNEU_SIM = {
  maxReg: 8,
  /** Faixa de trabalho indicada na etiqueta da bancada simulada. */
  workRange: [4, 6] as [number, number],
  areaCap: 1,
  areaRod: 0.7,
  friction: 0.4,
  fillRate: 6,
  exhaustRate: 3,
  lineRate: 8,
  speed: 0.7,
  /** Abaixo disso o manômetro é lido como zero. */
  zero: 0.05
};

export const PNEU_INITIAL: PneuState = { supplyOpen: false, reg: 0, pushed: false, thr4: 1, thr2: 1, pos: 0, pLine: 0, p4: 0, p2: 0 };

const approach = (p: number, target: number, rate: number, dt: number) => p + (target - p) * Math.min(1, rate * dt);

/** Câmara ligada à linha de alimentação: enche livre (retenção abre); esvazia de volta pela reguladora. */
function fromLine(p: number, line: number, thr: number, dt: number) {
  return line > p ? approach(p, line, PNEU_SIM.fillRate, dt) : approach(p, line, PNEU_SIM.exhaustRate * thr, dt);
}

/** Câmara ligada ao escape: esvazia pela reguladora (controle na saída). */
function toExhaust(p: number, thr: number, dt: number) {
  return approach(p, 0, PNEU_SIM.exhaustRate * thr, dt);
}

export function stepPneu(s: PneuState, dt: number): PneuState {
  const pLine = approach(s.pLine, s.supplyOpen ? s.reg : 0, PNEU_SIM.lineRate, dt);
  const p4 = s.pushed ? fromLine(s.p4, pLine, s.thr4, dt) : toExhaust(s.p4, s.thr4, dt);
  const p2 = s.pushed ? toExhaust(s.p2, s.thr2, dt) : fromLine(s.p2, pLine, s.thr2, dt);
  const force = p4 * PNEU_SIM.areaCap - p2 * PNEU_SIM.areaRod;
  let v = 0;
  if (force > PNEU_SIM.friction) v = PNEU_SIM.speed * s.thr2 * Math.min(1, force - PNEU_SIM.friction);
  else if (force < -PNEU_SIM.friction) v = -PNEU_SIM.speed * s.thr4 * Math.min(1, -force - PNEU_SIM.friction);
  const pos = Math.max(0, Math.min(1, s.pos + v * dt));
  return { ...s, pLine, p4, p2, pos };
}

/** O circuito está sem pressão em nenhum ponto (pode soltar conexões). */
export function isDepressurized(s: PneuState) {
  return !s.supplyOpen && Math.max(s.pLine, s.p4, s.p2) < PNEU_SIM.zero;
}
