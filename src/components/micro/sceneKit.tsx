import React from 'react';

/**
 * Peças de desenho compartilhadas pelas cenas animadas (aulas rápidas e desafios).
 * Estilo: desenho técnico plano sobre "papel", mesma paleta do restante do Mecânica Lab.
 */

export const C = {
  paper: '#f4f3ef',
  paper2: '#e9e7df',
  ink: '#1d1e1b',
  muted: '#6e706a',
  line: '#b9b6ab',
  accent: '#e8590c',
  steel: '#a9afb6',
  steelDark: '#6b7178',
  steelLight: '#d5d9dd',
  machine: '#35587a',
  machineDark: '#26415b',
  machineLight: '#4f7699',
  yellow: '#eab308',
  red: '#d6332f',
  green: '#2f9e44',
  blue: '#2f7fc1',
  water: '#5aa9e6',
  oil: '#8a6d1d',
  skin: '#e0ac69',
  cloth: '#3b4a5c'
};

export const FONT = 'Inter, system-ui, sans-serif';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
/** 0→1 entre `start` e `start + dur` (frações do tempo da cena). */
export const appear = (t: number, start: number, dur = 0.12) => ease((t - start) / dur);

export const SceneFrame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <svg viewBox="0 0 640 360" role="img" aria-label={label} className="block h-auto w-full" style={{ background: C.paper }}>
    <defs>
      <pattern id="mk-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e0d8" strokeWidth="1" />
      </pattern>
      <marker id="mk-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={C.ink} />
      </marker>
      <marker id="mk-arrow-accent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={C.accent} />
      </marker>
      <marker id="mk-arrow-water" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={C.blue} />
      </marker>
    </defs>
    <rect width="640" height="360" fill="url(#mk-grid)" />
    {children}
  </svg>
);

export const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  weight?: number;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}> = ({ x, y, children, size = 13, weight = 600, fill = C.ink, anchor = 'start', opacity = 1 }) => (
  <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} fontFamily={FONT} opacity={opacity}>
    {children}
  </text>
);

/** Etiqueta com fundo, usada para nomear peças nas cenas. */
export const Tag: React.FC<{ x: number; y: number; text: string; tone?: 'ink' | 'accent' | 'ok' | 'bad'; opacity?: number; anchor?: 'start' | 'middle' }> = ({
  x,
  y,
  text,
  tone = 'ink',
  opacity = 1,
  anchor = 'start'
}) => {
  const w = text.length * 6.6 + 16;
  const bg = tone === 'accent' ? C.accent : tone === 'ok' ? C.green : tone === 'bad' ? C.red : C.ink;
  // Mantém a etiqueta dentro do quadro (640 de largura).
  const x0 = Math.max(6, Math.min(634 - w, anchor === 'middle' ? x - w / 2 : x));
  return (
    <g opacity={opacity}>
      <rect x={x0} y={y - 15} width={w} height={21} rx={5} fill={bg} />
      <text x={x0 + w / 2} y={y} fontSize={11.5} fontWeight={600} fill="#fff" textAnchor="middle" fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
};

/** Contorno de engrenagem (dentes trapezoidais). */
export function gearPath(cx: number, cy: number, rOuter: number, rRoot: number, teeth: number, angleDeg = 0): string {
  const pts: string[] = [];
  const a0 = (angleDeg * Math.PI) / 180;
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = a0 + i * step;
    const seq: [number, number][] = [
      [rRoot, a - step * 0.5],
      [rRoot, a - step * 0.28],
      [rOuter, a - step * 0.15],
      [rOuter, a + step * 0.15],
      [rRoot, a + step * 0.28]
    ];
    seq.forEach(([r, ang]) => pts.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`));
  }
  return `M ${pts.join(' L ')} Z`;
}

export const Gear: React.FC<{ cx: number; cy: number; r: number; teeth: number; angle: number; fill?: string; hub?: boolean }> = ({
  cx,
  cy,
  r,
  teeth,
  angle,
  fill = C.steel,
  hub = true
}) => (
  <g>
    <path d={gearPath(cx, cy, r, r * 0.82, teeth, angle)} fill={fill} stroke={C.ink} strokeWidth={1.5} strokeLinejoin="round" />
    {hub && <circle cx={cx} cy={cy} r={r * 0.28} fill={C.steelDark} stroke={C.ink} strokeWidth={1.2} />}
  </g>
);

/** Sinal de perigo (triângulo amarelo). */
export const HazardSign: React.FC<{ x: number; y: number; size?: number; symbol?: string; opacity?: number }> = ({
  x,
  y,
  size = 30,
  symbol = '!',
  opacity = 1
}) => (
  <g opacity={opacity} transform={`translate(${x} ${y})`}>
    <path d={`M 0 ${-size * 0.58} L ${size * 0.55} ${size * 0.4} L ${-size * 0.55} ${size * 0.4} Z`} fill={C.yellow} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
    <text y={size * 0.28} fontSize={size * 0.55} fontWeight={800} textAnchor="middle" fill={C.ink} fontFamily={FONT}>
      {symbol}
    </text>
  </g>
);

export const CheckMark: React.FC<{ x: number; y: number; ok?: boolean; opacity?: number; size?: number }> = ({ x, y, ok = true, opacity = 1, size = 22 }) => (
  <g opacity={opacity} transform={`translate(${x} ${y})`}>
    <circle r={size / 2} fill={ok ? C.green : C.red} />
    {ok ? (
      <path d={`M ${-size * 0.24} 0 L ${-size * 0.06} ${size * 0.18} L ${size * 0.26} ${-size * 0.18}`} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d={`M ${-size * 0.2} ${-size * 0.2} L ${size * 0.2} ${size * 0.2} M ${size * 0.2} ${-size * 0.2} L ${-size * 0.2} ${size * 0.2}`} stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
    )}
  </g>
);

/** Boneco simples (vista frontal), com EPIs opcionais. Origem nos pés. */
export const Person: React.FC<{
  x: number;
  y: number;
  scale?: number;
  glasses?: boolean;
  earmuffs?: boolean;
  helmet?: boolean;
  gloves?: boolean;
  boots?: boolean;
  longHair?: 'loose' | 'tied';
  bracelet?: boolean;
  shirt?: string;
  armUp?: boolean;
}> = ({ x, y, scale = 1, glasses, earmuffs, helmet, gloves, boots, longHair, bracelet, shirt = C.cloth, armUp }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* pernas */}
    <rect x={-17} y={-70} width={14} height={62} rx={4} fill="#2c3440" />
    <rect x={3} y={-70} width={14} height={62} rx={4} fill="#2c3440" />
    <rect x={-20} y={-10} width={19} height={10} rx={3} fill={boots ? '#222' : '#555'} stroke={boots ? C.yellow : 'none'} strokeWidth={boots ? 1.5 : 0} />
    <rect x={1} y={-10} width={19} height={10} rx={3} fill={boots ? '#222' : '#555'} stroke={boots ? C.yellow : 'none'} strokeWidth={boots ? 1.5 : 0} />
    {/* tronco */}
    <rect x={-24} y={-138} width={48} height={72} rx={10} fill={shirt} />
    {/* braços */}
    <rect x={-36} y={-134} width={13} height={58} rx={6} fill={shirt} />
    {armUp ? (
      <rect x={23} y={-180} width={13} height={56} rx={6} fill={shirt} transform="rotate(-10 29 -128)" />
    ) : (
      <rect x={23} y={-134} width={13} height={58} rx={6} fill={shirt} />
    )}
    <circle cx={-29.5} cy={-74} r={7.5} fill={gloves ? '#c9a227' : C.skin} />
    {armUp ? <circle cx={36} cy={-184} r={7.5} fill={gloves ? '#c9a227' : C.skin} /> : <circle cx={29.5} cy={-74} r={7.5} fill={gloves ? '#c9a227' : C.skin} />}
    {bracelet && <rect x={-37} y={-86} width={15} height={4} rx={2} fill={C.yellow} stroke={C.ink} strokeWidth={0.8} />}
    {/* cabeça */}
    {longHair === 'loose' && <path d="M -20 -168 Q -26 -130 -16 -112 L 16 -112 Q 26 -130 20 -168 Z" fill="#3e2723" />}
    <circle cx={0} cy={-160} r={19} fill={C.skin} />
    {longHair === 'tied' && <circle cx={0} cy={-182} r={8} fill="#3e2723" />}
    {longHair && <path d="M -19 -164 Q 0 -186 19 -164 Q 12 -176 0 -177 Q -12 -176 -19 -164 Z" fill="#3e2723" />}
    {helmet && <path d="M -22 -164 Q -22 -190 0 -190 Q 22 -190 22 -164 Z" fill={C.yellow} stroke={C.ink} strokeWidth={1.2} />}
    {glasses && <rect x={-15} y={-166} width={30} height={9} rx={3} fill="#9fd3f5" stroke={C.ink} strokeWidth={1.2} opacity={0.95} />}
    {earmuffs && (
      <>
        <rect x={-24} y={-168} width={7} height={16} rx={3} fill={C.red} />
        <rect x={17} y={-168} width={7} height={16} rx={3} fill={C.red} />
      </>
    )}
  </g>
);

/** Botão de emergência (cogumelo vermelho sobre base amarela). `pressed` 0..1. */
export const EStop: React.FC<{ x: number; y: number; pressed?: number; scale?: number }> = ({ x, y, pressed = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-34} y={-34} width={68} height={68} rx={8} fill={C.yellow} stroke={C.ink} strokeWidth={2} />
    <circle r={22} fill="#7a1513" />
    <circle r={20} cy={-3 + pressed * 3} fill={C.red} stroke={C.ink} strokeWidth={1.5} />
    <ellipse cx={-6} cy={-10 + pressed * 3} rx={8} ry={4} fill="#fff" opacity={0.35} />
  </g>
);

/** Cadeado de bloqueio. */
export const Padlock: React.FC<{ x: number; y: number; color?: string; scale?: number; open?: boolean }> = ({ x, y, color = C.red, scale = 1, open = false }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d={open ? 'M -8 -6 L -8 -20 Q -8 -30 2 -30 Q 12 -30 12 -22' : 'M -8 -6 L -8 -18 Q -8 -28 0 -28 Q 8 -28 8 -18 L 8 -6'} fill="none" stroke={C.steelDark} strokeWidth={4} />
    <rect x={-13} y={-8} width={26} height={22} rx={4} fill={color} stroke={C.ink} strokeWidth={1.5} />
    <circle cx={0} cy={2} r={3} fill={C.ink} />
  </g>
);

/** Seta grossa de fluxo/força. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; opacity?: number; dashed?: boolean }> = ({
  x1,
  y1,
  x2,
  y2,
  color = C.ink,
  width = 3,
  opacity = 1,
  dashed
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color}
    strokeWidth={width}
    opacity={opacity}
    strokeDasharray={dashed ? '6 5' : undefined}
    markerEnd={color === C.accent ? 'url(#mk-arrow-accent)' : color === C.blue ? 'url(#mk-arrow-water)' : 'url(#mk-arrow)'}
  />
);

/** Sextavado visto de frente (abertura = distância entre faces). */
export function hexPoints(cx: number, cy: number, acrossFlats: number, rotDeg = 0): string {
  const r = acrossFlats / 2 / Math.cos(Math.PI / 6);
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((rotDeg + 30 + i * 60) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}
