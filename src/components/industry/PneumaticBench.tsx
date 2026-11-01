import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, RotateCcw, Wind, XCircle } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { MISSION_GAME_PREFIX } from '../../data/industry/industryMissions';
import { PNEU_INITIAL, PNEU_SIM, PneuState, isDepressurized, stepPneu } from '../../data/industry/pneumaticSim';
import { ClaimBadge, NotQualificationNote } from '../safety/SourceBits';

/**
 * Bancada pneumática simulada (seção Indústria na prática).
 * Circuito com símbolos no estilo da ISO 1219-1 e uma simulação qualitativa (ver pneumaticSim.ts).
 * Quatro tarefas: ligar e regular, fazer o ciclo, controlar a velocidade do avanço e despressurizar antes de soltar uma conexão.
 */

export const PNEUMATIC_BENCH_ID = 'bancada-pneumatica';
const GAME_ID = MISSION_GAME_PREFIX + PNEUMATIC_BENCH_ID;

const INK = '#e5e7eb';
const THIN = '#9ca3af';
const AIR = '#60a5fa';
const DEAD = '#4b5563';
const PAPER = '#0f1216';

type TaskId = 'ligar' | 'ciclo' | 'velocidade' | 'bloqueio';

const TASKS: { id: TaskId; skillId: string; title: string; how: string }[] = [
  {
    id: 'ligar',
    skillId: 'pneumatics.basics',
    title: 'Ligar o ar e regular a pressão de trabalho',
    how: `Abra a válvula de bloqueio e ajuste o regulador dentro da faixa da etiqueta da bancada: ${PNEU_SIM.workRange[0]} a ${PNEU_SIM.workRange[1]} bar (valores da simulação).`
  },
  {
    id: 'ciclo',
    skillId: 'pneumatics.basics',
    title: 'Fazer o cilindro avançar e recuar',
    how: 'Segure o botão da válvula 5/2 até o cilindro avançar todo; solte e deixe a mola fazer a válvula voltar e o cilindro recuar.'
  },
  {
    id: 'velocidade',
    skillId: 'pneumatics.basics',
    title: 'Deixar o AVANÇO mais lento sem mudar o recuo',
    how: 'Use uma das reguladoras de fluxo e faça um ciclo completo. Pense: no avanço, por qual linha o ar SAI do cilindro?'
  },
  {
    id: 'bloqueio',
    skillId: 'safety.energy',
    title: 'Soltar a mangueira do cilindro com segurança',
    how: 'Antes de soltar qualquer conexão, o circuito precisa estar sem energia. Use os manômetros para confirmar.'
  }
];

export const PNEUMATIC_TASK_COUNT = TASKS.length;

interface Feedback {
  tone: 'success' | 'error' | 'info';
  text: string;
}

const fmt = (v: number) => (v < PNEU_SIM.zero ? '0,0' : v.toFixed(1).replace('.', ','));

/* ───────────────────────── Símbolos ───────────────────────── */

const Gauge: React.FC<{ x: number; y: number; value: number; label: string }> = ({ x, y, value, label }) => (
  <g>
    <circle cx={x} cy={y} r={13} fill="#11161c" stroke={INK} strokeWidth={1.4} />
    <line x1={x - 8} y1={y + 8} x2={x + 8} y2={y - 8} stroke={INK} strokeWidth={1.2} />
    <path d={`M ${x + 8} ${y - 8} l -5 1 l 4 4 z`} fill={INK} />
    <text x={x + 18} y={y - 2} fontSize={10.5} fill={value > PNEU_SIM.zero ? AIR : THIN} fontWeight={700}>
      {fmt(value)} bar
    </text>
    <text x={x + 18} y={y + 11} fontSize={9.5} fill={THIN}>
      {label}
    </text>
  </g>
);

/** Reguladora de fluxo unidirecional (estrangulamento ajustável em paralelo com retenção), vertical. */
const OneWayFlowControl: React.FC<{ x: number; y: number; open: number; color: string; label: string }> = ({ x, y, open, color, label }) => (
  <g>
    <rect x={x - 26} y={y - 22} width={52} height={44} fill="#11161c" stroke={INK} strokeWidth={1.2} strokeDasharray="4 3" />
    {/* ramo do estrangulamento */}
    <line x1={x - 10} y1={y - 22} x2={x - 10} y2={y + 22} stroke={color} strokeWidth={2} />
    <path d={`M ${x - 16} ${y - 7} Q ${x - 10} ${y} ${x - 16} ${y + 7} M ${x - 4} ${y - 7} Q ${x - 10} ${y} ${x - 4} ${y + 7}`} fill="none" stroke={INK} strokeWidth={1.3} />
    <line x1={x - 20} y1={y + 10} x2={x} y2={y - 10} stroke={INK} strokeWidth={1.1} />
    <path d={`M ${x} ${y - 10} l -5 1 l 4 4 z`} fill={INK} />
    {/* ramo da retenção (deixa o ar ENTRAR no cilindro livre) */}
    <line x1={x + 12} y1={y - 22} x2={x + 12} y2={y + 22} stroke={color} strokeWidth={2} />
    <path d={`M ${x + 6} ${y - 4} L ${x + 12} ${y + 5} L ${x + 18} ${y - 4}`} fill="none" stroke={INK} strokeWidth={1.3} />
    <circle cx={x + 12} cy={y - 3} r={3.5} fill="#11161c" stroke={INK} strokeWidth={1.2} />
    <text x={x} y={y + 36} textAnchor="middle" fontSize={9.5} fill={THIN}>
      {label} · {Math.round(open * 100)}%
    </text>
  </g>
);

const Exhaust: React.FC<{ x: number; y: number }> = ({ x, y }) => <path d={`M ${x - 6} ${y} L ${x + 6} ${y} L ${x} ${y + 9} Z`} fill="none" stroke={INK} strokeWidth={1.2} />;

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string }> = ({ x1, y1, x2, y2, color }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 6;
  return (
    <g stroke={color} fill={color}>
      <line x1={x1} y1={y1} x2={x2 - Math.cos(a) * h} y2={y2 - Math.sin(a) * h} strokeWidth={1.6} />
      <path
        d={`M ${x2} ${y2} L ${x2 - Math.cos(a) * h - Math.sin(a) * 3.5} ${y2 - Math.sin(a) * h + Math.cos(a) * 3.5} L ${x2 - Math.cos(a) * h + Math.sin(a) * 3.5} ${y2 - Math.sin(a) * h - Math.cos(a) * 3.5} Z`}
        stroke="none"
      />
    </g>
  );
};

const Blocked: React.FC<{ x: number; y: number; up?: boolean }> = ({ x, y, up }) => (
  <g stroke={INK} strokeWidth={1.4}>
    <line x1={x} y1={y} x2={x} y2={up ? y - 9 : y + 9} />
    <line x1={x - 5} y1={up ? y - 9 : y + 9} x2={x + 5} y2={up ? y - 9 : y + 9} />
  </g>
);

/** Circuito completo. Coordenadas fixas no viewBox 640 × 430. */
const Circuit: React.FC<{ s: PneuState }> = ({ s }) => {
  const c = (p: number) => (p > PNEU_SIM.zero ? AIR : DEAD);
  const w = (p: number) => (p > PNEU_SIM.zero ? 2.6 : 1.6);
  // Cilindro
  const CX0 = 120;
  const CX1 = 380;
  const pistonX = CX0 + 12 + s.pos * 220;
  // Válvula 5/2: quadrado da direita = repouso (mola); o corpo desliza 70 px quando acionada.
  const VX = 265;
  const VY = 240;
  const SQ = 70;
  const shift = s.pushed ? SQ : 0;
  const port4 = VX + SQ + 20;
  const port2 = VX + SQ + 50;
  const port5 = VX + SQ + 15;
  const port1 = VX + SQ + 35;
  const port3 = VX + SQ + 55;
  const fc4x = 140;
  const fc2x = 360;
  const lineY = 380;
  return (
    <svg viewBox="0 0 640 430" className="h-auto w-full" role="img" aria-labelledby="pn-title pn-desc" data-testid="pneumatic-circuit">
      <title id="pn-title">Circuito pneumático da bancada</title>
      <desc id="pn-desc">
        {`Alimentação, válvula de bloqueio com escape, filtro, regulador com manômetro, válvula direcional 5/2 com botão e mola, duas reguladoras de fluxo unidirecionais e um cilindro de dupla ação. Estado atual: alimentação ${s.supplyOpen ? 'aberta' : 'fechada'}, linha a ${fmt(s.pLine)} bar, válvula ${s.pushed ? 'acionada' : 'em repouso'}, cilindro ${s.pos > 0.98 ? 'avançado' : s.pos < 0.02 ? 'recuado' : 'em movimento'}.`}
      </desc>
      <rect width="640" height="430" fill={PAPER} />

      {/* ───── Cilindro de dupla ação ───── */}
      <rect x={CX0} y={40} width={CX1 - CX0} height={56} fill="#11161c" stroke={INK} strokeWidth={1.6} />
      <rect x={CX0} y={40} width={pistonX - CX0} height={56} fill={s.p4 > PNEU_SIM.zero ? 'rgba(96,165,250,0.18)' : 'none'} />
      <rect x={pistonX + 8} y={40} width={CX1 - pistonX - 8} height={56} fill={s.p2 > PNEU_SIM.zero ? 'rgba(96,165,250,0.18)' : 'none'} />
      <rect x={pistonX} y={42} width={8} height={52} fill={INK} />
      <rect x={pistonX + 8} y={63} width={250} height={10} fill={INK} />
      <rect x={pistonX + 258} y={56} width={10} height={24} fill="#f2c200" />
      <text x={CX0} y={30} fontSize={11} fill={INK} fontWeight={700}>
        Cilindro de dupla ação
      </text>
      <text x={CX0 + 150} y={30} fontSize={10} fill={THIN}>
        {s.pos > 0.98 ? 'avançado' : s.pos < 0.02 ? 'recuado' : 'em movimento'}
      </text>

      {/* ───── Linhas do cilindro às reguladoras e à válvula ───── */}
      <line x1={fc4x} y1={96} x2={fc4x} y2={128} stroke={c(s.p4)} strokeWidth={w(s.p4)} />
      <line x1={fc2x} y1={96} x2={fc2x} y2={128} stroke={c(s.p2)} strokeWidth={w(s.p2)} />
      <OneWayFlowControl x={fc4x} y={150} open={s.thr4} color={c(s.p4)} label="reguladora linha 4" />
      <OneWayFlowControl x={fc2x} y={150} open={s.thr2} color={c(s.p2)} label="reguladora linha 2" />
      <Gauge x={fc4x - 70} y={110} value={s.p4} label="lado traseiro" />
      <Gauge x={fc2x + 40} y={110} value={s.p2} label="lado da haste" />
      <path d={`M ${fc4x} 172 L ${fc4x} 205 L ${port4} 205 L ${port4} ${VY}`} fill="none" stroke={c(s.p4)} strokeWidth={w(s.p4)} />
      <path d={`M ${fc2x} 172 L ${fc2x} 215 L ${port2} 215 L ${port2} ${VY}`} fill="none" stroke={c(s.p2)} strokeWidth={w(s.p2)} />
      <text x={port4 - 4} y={VY - 6} textAnchor="end" fontSize={10} fill={THIN}>
        4
      </text>
      <text x={port2 + 4} y={VY - 6} fontSize={10} fill={THIN}>
        2
      </text>

      {/* ───── Válvula direcional 5/2 (desliza quando acionada) ───── */}
      <g transform={`translate(${shift} 0)`} data-testid="valve-52">
        {/* posição acionada (esquerda): 1→4, 2→3, 5 bloqueada */}
        <rect x={VX} y={VY} width={SQ} height={50} fill="#11161c" stroke={INK} strokeWidth={1.6} />
        <Arrow x1={VX + 35} y1={VY + 50} x2={VX + 20} y2={VY} color={s.pushed ? c(s.pLine) : INK} />
        <Arrow x1={VX + 50} y1={VY} x2={VX + 55} y2={VY + 50} color={INK} />
        <Blocked x={VX + 15} y={VY + 50} up />
        {/* posição de repouso (direita): 1→2, 4→5, 3 bloqueada */}
        <rect x={VX + SQ} y={VY} width={SQ} height={50} fill="#11161c" stroke={INK} strokeWidth={1.6} />
        <Arrow x1={VX + SQ + 35} y1={VY + 50} x2={VX + SQ + 50} y2={VY} color={!s.pushed ? c(s.pLine) : INK} />
        <Arrow x1={VX + SQ + 20} y1={VY} x2={VX + SQ + 15} y2={VY + 50} color={INK} />
        <Blocked x={VX + SQ + 55} y={VY + 50} up />
        {/* botão (acionamento 14) e mola (retorno) */}
        <rect x={VX - 16} y={VY + 15} width={16} height={20} fill="#11161c" stroke={INK} strokeWidth={1.4} />
        <path d={`M ${VX - 16} ${VY + 13} q -6 12 0 24`} fill="none" stroke={INK} strokeWidth={1.4} />
        <path d={`M ${VX + 2 * SQ} ${VY + 25} l 5 -8 l 5 16 l 5 -16 l 5 16 l 5 -8`} fill="none" stroke={INK} strokeWidth={1.3} />
      </g>
      <text x={port1 + 12} y={VY + 90} fontSize={10} fill={THIN}>
        válvula 5/2 · botão e retorno por mola
      </text>

      {/* ───── Escapes e alimentação da válvula ───── */}
      <line x1={port5} y1={VY + 50} x2={port5} y2={VY + 58} stroke={INK} strokeWidth={1.4} />
      <Exhaust x={port5} y={VY + 58} />
      <line x1={port3} y1={VY + 50} x2={port3} y2={VY + 58} stroke={INK} strokeWidth={1.4} />
      <Exhaust x={port3} y={VY + 58} />
      <text x={port5 - 8} y={VY + 66} textAnchor="end" fontSize={9.5} fill={THIN}>
        5
      </text>
      <text x={port3 + 8} y={VY + 66} fontSize={9.5} fill={THIN}>
        3
      </text>
      <path d={`M ${port1} ${VY + 50} L ${port1} ${lineY} L 300 ${lineY}`} fill="none" stroke={c(s.pLine)} strokeWidth={w(s.pLine)} />
      <text x={port1 + 4} y={VY + 64} fontSize={9.5} fill={THIN}>
        1
      </text>

      {/* ───── Unidade de conservação: regulador com manômetro e filtro ───── */}
      <rect x={250} y={lineY - 18} width={36} height={36} fill="#11161c" stroke={INK} strokeWidth={1.4} />
      <Arrow x1={256} y1={lineY + 10} x2={280} y2={lineY - 10} color={INK} />
      <path d={`M 268 ${lineY + 18} l -6 5 l 12 5 l -12 5 l 6 5`} fill="none" stroke={INK} strokeWidth={1.2} />
      <Gauge x={268} y={lineY - 42} value={s.pLine} label="regulador" />
      <line x1={268} y1={lineY - 29} x2={268} y2={lineY - 18} stroke={INK} strokeWidth={1.2} />
      <line x1={226} y1={lineY} x2={250} y2={lineY} stroke={c(s.pLine)} strokeWidth={w(s.pLine)} />
      <path d={`M 200 ${lineY} l 13 -14 l 13 14 l -13 14 z`} fill="#11161c" stroke={INK} strokeWidth={1.4} />
      <line x1={213} y1={lineY - 14} x2={213} y2={lineY + 14} stroke={INK} strokeWidth={1} strokeDasharray="3 2" />
      <text x={213} y={lineY + 30} textAnchor="middle" fontSize={9.5} fill={THIN}>
        filtro
      </text>
      <line x1={160} y1={lineY} x2={200} y2={lineY} stroke={s.supplyOpen ? AIR : DEAD} strokeWidth={s.supplyOpen ? 2.6 : 1.6} />

      {/* ───── Válvula de bloqueio 3/2 com escape (alavanca com cadeado) ───── */}
      <g>
        <rect x={100} y={lineY - 20} width={30} height={40} fill="#11161c" stroke={INK} strokeWidth={1.4} />
        <rect x={130} y={lineY - 20} width={30} height={40} fill="#11161c" stroke={INK} strokeWidth={1.4} />
        {s.supplyOpen ? (
          <Arrow x1={130} y1={lineY} x2={160} y2={lineY} color={AIR} />
        ) : (
          <>
            <Arrow x1={160} y1={lineY - 6} x2={146} y2={lineY + 20} color={INK} />
            <Blocked x={130} y={lineY} />
          </>
        )}
        <Exhaust x={146} y={lineY + 26} />
        <line x1={100} y1={lineY - 30} x2={100} y2={lineY - 20} stroke={INK} strokeWidth={1.4} />
        <line x1={92} y1={lineY - 30} x2={108} y2={lineY - 30} stroke={INK} strokeWidth={1.4} />
        <text x={112} y={lineY - 27} fontSize={9.5} fill={THIN}>
          bloqueio com escape
        </text>
      </g>
      <line x1={46} y1={lineY} x2={100} y2={lineY} stroke={AIR} strokeWidth={2.6} />
      {/* Fonte de ar comprimido */}
      <circle cx={34} cy={lineY} r={12} fill="#11161c" stroke={INK} strokeWidth={1.4} />
      <path d={`M 30 ${lineY - 6} L 40 ${lineY} L 30 ${lineY + 6} Z`} fill="none" stroke={INK} strokeWidth={1.3} />
      <text x={34} y={lineY + 28} textAnchor="middle" fontSize={9.5} fill={THIN}>
        rede de ar
      </text>
      <text x={634} y={424} textAnchor="end" fontSize={9} fill={THIN}>
        Símbolos no estilo da ISO 1219-1 · vias pela ISO 5599-3 · simulação qualitativa
      </text>
    </svg>
  );
};

/* ───────────────────────── Página ───────────────────────── */

export const PneumaticBench: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordGameRound, setLastActivity, navigateTo } = useGameState();
  const [s, setS] = useState<PneuState>(PNEU_INITIAL);
  const sRef = useRef(s);
  sRef.current = s;
  const [solved, setSolved] = useState<Record<TaskId, boolean>>({ ligar: false, ciclo: false, velocidade: false, bloqueio: false });
  const [attempts, setAttempts] = useState<Record<TaskId, number>>({ ligar: 0, ciclo: 0, velocidade: 0, bloqueio: 0 });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [times, setTimes] = useState<{ advance: number | null; retract: number | null }>({ advance: null, retract: null });
  const [latched, setLatched] = useState(false);
  const [holding, setHolding] = useState(false);
  const motion = useRef<{ dir: 0 | 1 | -1; start: number; thr4: number; thr2: number; partial: boolean }>({ dir: 0, start: 0, thr4: 1, thr2: 1, partial: false });
  const cycle = useRef({ reachedEnd: false });

  useEffect(() => {
    setLastActivity('industry', 'Bancada pneumática', PNEUMATIC_BENCH_ID);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pushed = latched || holding;
  useEffect(() => {
    setS((v) => ({ ...v, pushed }));
    // Inverter no meio do curso: o tempo medido deixa de valer e a medição recomeça.
    const p = sRef.current.pos;
    motion.current.dir = 0;
    motion.current.partial = p > 0.02 && p < 0.98;
  }, [pushed]);

  // Laço da simulação
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setS((v) => stepPneu(v, dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const current = TASKS.findIndex((t) => !solved[t.id]);
  const currentId: TaskId | null = current === -1 ? null : TASKS[current].id;

  const complete = (id: TaskId, ok: boolean, text: string) => {
    const skill = TASKS.find((t) => t.id === id)!.skillId;
    recordGameRound(GAME_ID, id, { solved: ok, firstTry: ok && attempts[id] === 0 }, [{ skillId: skill, correct: ok }]);
    setAttempts((a) => ({ ...a, [id]: a[id] + 1 }));
    if (ok) setSolved((v) => ({ ...v, [id]: true }));
    setFeedback({ tone: ok ? 'success' : 'error', text });
  };

  // Tarefa 1: alimentação aberta e pressão na faixa
  useEffect(() => {
    if (currentId !== 'ligar' || !s.supplyOpen) return;
    const [lo, hi] = PNEU_SIM.workRange;
    if (Math.abs(s.pLine - s.reg) < 0.05 && s.reg >= lo && s.reg <= hi) {
      complete('ligar', true, `Ar ligado e regulado em ${fmt(s.reg)} bar. O regulador mantém a pressão de trabalho mesmo que a rede oscile — e o manômetro mostra o valor real.`);
    }
  }, [s.supplyOpen, s.pLine, s.reg, currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detecção de início e fim de movimento (tempos e tarefas 2 e 3)
  useEffect(() => {
    const m = motion.current;
    const now = performance.now();
    if (m.dir === 0 && s.pos > 0.02 && s.pos < 0.98) {
      // começou a se mover
      m.dir = s.pushed ? 1 : -1;
      m.start = now;
      m.thr4 = s.thr4;
      m.thr2 = s.thr2;
      return;
    }
    if (m.partial && m.dir !== 0 && (s.pos >= 0.999 || s.pos <= 0.001)) {
      // curso que começou no meio: não mede tempo nem conta para as tarefas
      m.dir = 0;
      m.partial = false;
      return;
    }
    if (m.dir === 1 && s.pos >= 0.999) {
      const t = (now - m.start) / 1000;
      m.dir = 0;
      cycle.current.reachedEnd = true;
      setTimes((v) => ({ ...v, advance: t }));
      m.thr2 = Math.min(m.thr2, s.thr2);
      m.thr4 = Math.min(m.thr4, s.thr4);
      if (currentId === 'velocidade') checkSpeed(t, null, m.thr4, m.thr2);
    } else if (m.dir === -1 && s.pos <= 0.001) {
      const t = (now - m.start) / 1000;
      m.dir = 0;
      setTimes((v) => ({ ...v, retract: t }));
      if (currentId === 'ciclo' && cycle.current.reachedEnd) {
        complete('ciclo', true, 'Ciclo completo. Botão acionado: o ar vai pela via 4 e empurra o pistão; soltando, a mola volta a válvula e o ar vai pela via 2, recuando o cilindro.');
      }
      if (currentId === 'velocidade') checkSpeed(null, t, Math.min(m.thr4, s.thr4), Math.min(m.thr2, s.thr2));
    }
  }, [s.pos]); // eslint-disable-line react-hooks/exhaustive-deps

  const speedProgress = useRef<{ slowAdvance: boolean }>({ slowAdvance: false });
  function checkSpeed(advance: number | null, retract: number | null, thr4: number, thr2: number) {
    if (advance !== null) {
      if (thr2 <= 0.45 && thr4 >= 0.8) {
        speedProgress.current.slowAdvance = true;
        setFeedback({ tone: 'info', text: `Avanço mais lento (${advance.toFixed(1).replace('.', ',')} s). Agora solte o botão e confira se o recuo continua rápido.` });
      } else if (thr4 < 0.8) {
        complete(
          'velocidade',
          false,
          'A reguladora da linha 4 está fechada. Ela estrangula o ar que SAI do lado traseiro — isso acontece no RECUO, não no avanço. No avanço, o ar sai pela linha 2 (lado da haste).'
        );
      } else {
        setFeedback({ tone: 'info', text: 'O avanço ainda está rápido. Qual linha esvazia quando o cilindro avança?' });
      }
    }
    if (retract !== null && speedProgress.current.slowAdvance) {
      if (thr4 >= 0.8) {
        complete(
          'velocidade',
          true,
          'Isso: com a reguladora da linha 2 fechada, o ar sai devagar do lado da haste e o avanço fica controlado; o recuo não muda. É o controle "na saída do ar" — o ar entra livre pela retenção e sai pelo estrangulamento.'
        );
      } else {
        speedProgress.current.slowAdvance = false;
        complete('velocidade', false, 'O recuo também ficou lento porque a reguladora da linha 4 foi fechada. A tarefa pede para mudar só o avanço.');
      }
    }
  }

  const tryDisconnect = () => {
    if (currentId !== 'bloqueio') return;
    if (s.supplyOpen) {
      complete('bloqueio', false, 'A alimentação ainda está aberta: soltar a mangueira agora faz ela chicotear e o cilindro pode se mover. Primeiro feche a válvula de bloqueio com escape.');
    } else if (!isDepressurized(s)) {
      complete(
        'bloqueio',
        false,
        `Os manômetros ainda mostram ar (traseiro ${fmt(s.p4)} bar, haste ${fmt(s.p2)} bar). Com a reguladora estrangulada, o ar sai devagar. Espere todos chegarem a zero antes de soltar.`
      );
    } else {
      complete(
        'bloqueio',
        true,
        'Circuito sem pressão: alimentação fechada com escape e todos os manômetros em zero. Na vida real, a válvula de bloqueio recebe cadeado e etiqueta, e cargas que podem descer por gravidade são apoiadas antes.'
      );
    }
  };

  const reset = () => {
    setS(PNEU_INITIAL);
    setLatched(false);
    setHolding(false);
    setSolved({ ligar: false, ciclo: false, velocidade: false, bloqueio: false });
    setAttempts({ ligar: 0, ciclo: 0, velocidade: 0, bloqueio: 0 });
    setFeedback(null);
    setTimes({ advance: null, retract: null });
    motion.current = { dir: 0, start: 0, thr4: 1, thr2: 1, partial: false };
    cycle.current = { reachedEnd: false };
    speedProgress.current = { slowAdvance: false };
  };

  const allDone = current === -1;
  const holdHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setHolding(true);
    },
    onPointerUp: () => setHolding(false),
    onPointerCancel: () => setHolding(false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        setHolding(true);
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') setHolding(false);
    },
    onBlur: () => setHolding(false)
  };

  return (
    <article className="space-y-5" data-testid="pneumatic-bench">
      <button className="btn-ghost -ml-2 text-sm" onClick={onBack}>
        ← Voltar para a planta
      </button>
      <header>
        <p className="eyebrow">Bancada simulada · Hidráulica e pneumática</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">Bancada pneumática: cilindro de dupla ação</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-300">
          Monte na cabeça o caminho do ar: rede → bloqueio → filtro → regulador → válvula 5/2 → reguladoras de fluxo → cilindro. Valores em bar
          simulados; a bancada é qualitativa e não calcula força nem vazão de um equipamento real.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-x-auto rounded-xl border border-ink-700 bg-[#0f1216]" tabIndex={0} aria-label="Circuito (role para os lados em telas estreitas)">
          <div className="min-w-[560px]">
            <Circuit s={s} />
          </div>
        </div>

        <div className="space-y-3">
          <section className="rounded-xl border border-ink-700 bg-ink-900 p-4" aria-label="Controles da bancada">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-100">
              <Wind className="h-4 w-4 text-accent" aria-hidden /> Controles
            </h2>
            <button
              className={s.supplyOpen ? 'btn-secondary w-full' : 'btn-primary w-full'}
              aria-pressed={s.supplyOpen}
              data-testid="pn-supply"
              onClick={() => setS((v) => ({ ...v, supplyOpen: !v.supplyOpen }))}
            >
              {s.supplyOpen ? 'Fechar a válvula de bloqueio (com escape)' : 'Abrir a válvula de bloqueio'}
            </button>
            <label className="mt-3 block text-sm text-ink-300" htmlFor="pn-reg">
              Regulador: <strong className="text-ink-100">{fmt(s.reg)} bar</strong>
            </label>
            <input
              id="pn-reg"
              data-testid="pn-reg"
              type="range"
              min={0}
              max={PNEU_SIM.maxReg}
              step={0.5}
              value={s.reg}
              onChange={(e) => setS((v) => ({ ...v, reg: Number(e.target.value) }))}
              className="w-full accent-orange-500"
            />
            <div className="mt-3 flex gap-2">
              <button
                className={`flex-1 select-none touch-none rounded-lg border px-3 py-2 text-sm font-semibold ${pushed ? 'border-accent bg-accent/20 text-ink-100' : 'border-ink-600 text-ink-200 hover:border-ink-400'}`}
                aria-pressed={pushed}
                data-testid="pn-button"
                {...holdHandlers}
              >
                Botão da válvula 5/2 (segure)
              </button>
              <button
                className={`rounded-lg border px-2 py-2 text-xs ${latched ? 'border-accent text-ink-100' : 'border-ink-600 text-ink-400'}`}
                aria-pressed={latched}
                data-testid="pn-latch"
                onClick={() => setLatched((v) => !v)}
                title="Manter o botão acionado (para teclado e tela de toque)"
              >
                {latched ? 'Soltar' : 'Manter'}
              </button>
            </div>
            <label className="mt-3 block text-sm text-ink-300" htmlFor="pn-thr4">
              Reguladora da linha 4 (lado traseiro): {Math.round(s.thr4 * 100)}%
            </label>
            <input
              id="pn-thr4"
              data-testid="pn-thr4"
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={s.thr4}
              onChange={(e) => setS((v) => ({ ...v, thr4: Number(e.target.value) }))}
              className="w-full accent-orange-500"
            />
            <label className="mt-2 block text-sm text-ink-300" htmlFor="pn-thr2">
              Reguladora da linha 2 (lado da haste): {Math.round(s.thr2 * 100)}%
            </label>
            <input
              id="pn-thr2"
              data-testid="pn-thr2"
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={s.thr2}
              onChange={(e) => setS((v) => ({ ...v, thr2: Number(e.target.value) }))}
              className="w-full accent-orange-500"
            />
            <p className="mt-3 text-xs text-ink-400" aria-live="polite">
              Último avanço: {times.advance === null ? '—' : `${times.advance.toFixed(1).replace('.', ',')} s`} · último recuo:{' '}
              {times.retract === null ? '—' : `${times.retract.toFixed(1).replace('.', ',')} s`} (tempos da simulação)
            </p>
            <button className="btn-secondary mt-3 w-full" data-testid="pn-disconnect" onClick={tryDisconnect} disabled={currentId !== 'bloqueio'}>
              Soltar a mangueira do cilindro
            </button>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-ink-700 bg-ink-900 p-4" aria-labelledby="pn-tasks">
        <h2 id="pn-tasks" className="text-lg font-semibold text-ink-100">
          Tarefas
        </h2>
        <ol className="mt-3 space-y-2">
          {TASKS.map((t, i) => {
            const done = solved[t.id];
            const active = i === current;
            return (
              <li
                key={t.id}
                data-testid={`pn-task-${t.id}`}
                data-done={done}
                className={`flex gap-3 rounded-lg border p-3 ${active ? 'border-accent/70 bg-ink-800' : 'border-ink-700'} ${!done && !active ? 'opacity-60' : ''}`}
              >
                {done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden />}
                <div>
                  <p className="font-medium text-ink-100">
                    {i + 1}. {t.title}
                    <span className="sr-only">{done ? ' (concluída)' : active ? ' (atual)' : ' (bloqueada)'}</span>
                  </p>
                  {(active || done) && <p className="text-sm text-ink-300">{t.how}</p>}
                </div>
              </li>
            );
          })}
        </ol>
        {feedback && (
          <div
            role="status"
            data-testid="pn-feedback"
            className={`mt-3 flex gap-2 rounded-lg border p-3 text-sm ${
              feedback.tone === 'success' ? 'border-emerald-700/60 bg-emerald-950/20 text-emerald-100' : feedback.tone === 'error' ? 'border-red-700/60 bg-red-950/20 text-red-100' : 'border-sky-700/60 bg-sky-950/20 text-sky-100'
            }`}
          >
            {feedback.tone === 'error' ? <XCircle className="h-5 w-5 shrink-0" aria-hidden /> : <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />}
            <p>{feedback.text}</p>
          </div>
        )}
      </section>

      {allDone && (
        <section className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 p-5" data-testid="pn-complete">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-200">
            <CheckCircle2 className="h-5 w-5" aria-hidden /> Bancada concluída
          </h2>
          <p className="mt-1 text-ink-200">
            Você regulou a pressão, comandou o cilindro, controlou a velocidade pelo lado certo e despressurizou antes de soltar uma conexão — os
            mesmos passos de uma bancada real, que tem também cadeado e etiqueta na válvula de bloqueio.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li className="flex flex-wrap items-start gap-2">
              <ClaimBadge kind="boa-pratica" />
              <span className="flex-1">Requisitos gerais de segurança de sistemas pneumáticos: ISO 4414 (consultar o texto da norma e o manual da bancada).</span>
            </li>
            <li className="flex flex-wrap items-start gap-2">
              <ClaimBadge kind="boa-pratica" />
              <span className="flex-1">Ar comprimido é energia perigosa: isolar, despressurizar e confirmar zero antes de intervir, inclusive com cilindros que podem descer por gravidade.</span>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => navigateTo('lab', 'diaphragm-pump')}>
              Ver uma máquina pneumática em 3D <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button className="btn-ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
            </button>
          </div>
          <NotQualificationNote className="mt-4" />
        </section>
      )}
    </article>
  );
};
