import React, { useId, useMemo, useRef, useState } from 'react';
import type { BenchArtState, BenchPartId } from '../../data/journey/bench';

/**
 * Peças na bancada, desenhadas em SVG. Cada defeito fica onde ele aparece na prática: a cavitação na entrada da pá,
 * a trinca de calor saindo do centro da face do selo. A lupa mostra o mesmo desenho ampliado; com o teclado, as setas movem
 * a lupa. O texto de `describe` no painel dá a mesma informação para quem não enxerga a imagem.
 */

const W = 480;
const H = 300;

/** Pontos pseudoaleatórios estáveis (o mesmo defeito sempre no mesmo lugar). */
function scatter(n: number, seed: number): [number, number][] {
  let s = seed;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s % 1000) / 1000;
  };
  return Array.from({ length: n }, () => [next(), next()]);
}

const Rotor: React.FC<{ state: string; id: string }> = ({ state, id }) => {
  const cx = 240;
  const cy = 150;
  const R = 128;
  const eye = 40;
  const vanes = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);
  const tip = state === 'erosao' ? 0.84 : 1;
  const pits = useMemo(() => scatter(70, 4021), []);
  return (
    <g>
      <circle cx={cx} cy={cy} r={R + 8} fill={`url(#metal-${id})`} stroke="#3b3d37" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={R} fill="#8d8f88" />
      {vanes.map((a) => {
        const x0 = cx + Math.cos(a) * (eye + 4);
        const y0 = cy + Math.sin(a) * (eye + 4);
        const x1 = cx + Math.cos(a + 1.05) * R * tip;
        const y1 = cy + Math.sin(a + 1.05) * R * tip;
        const mx = cx + Math.cos(a + 0.28) * R * 0.66;
        const my = cy + Math.sin(a + 0.28) * R * 0.66;
        return (
          <g key={a}>
            <path d={`M${x0} ${y0}Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="#c9cbc3" strokeWidth={state === 'erosao' ? 9 : 13} strokeLinecap={state === 'erosao' ? 'round' : 'butt'} />
            <path d={`M${x0} ${y0}Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="#6d6f68" strokeWidth={1} transform="translate(4 3)" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={eye} fill="#4b4d46" stroke="#2c2d29" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={15} fill="#b4b6ae" stroke="#2c2d29" />
      {state === 'cavitacao' &&
        vanes.map((a, vi) => (
          <g key={a} data-defect="cavitacao">
            {pits.slice(vi * 11, vi * 11 + 18).map(([u, v], i) => {
              const t = 0.08 + u * 0.3;
              const r = eye + 8 + t * (R - eye);
              const ang = a + t * 0.9 + (v - 0.5) * 0.13 + 0.08;
              return <circle key={i} cx={cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r} r={0.9 + v * 1.9} fill="#2b2a26" opacity={0.85} />;
            })}
          </g>
        ))}
    </g>
  );
};

const SealFace: React.FC<{ state: string; id: string }> = ({ state, id }) => {
  const cx = 240;
  const cy = 150;
  const cracks = useMemo(() => scatter(16, 907), []);
  return (
    <g>
      <circle cx={cx} cy={cy} r={124} fill={`url(#metal-${id})`} stroke="#3b3d37" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={106} fill={state === 'termico' ? '#a58b73' : '#d8dad2'} />
      {state !== 'termico' && <path d="M160 90A100 100 0 0 1 290 70" fill="none" stroke="#fff" strokeWidth={10} opacity={0.5} strokeLinecap="round" />}
      {state === 'termico' && (
        <>
          <circle cx={cx} cy={cy} r={104} fill="none" stroke="#5e3f23" strokeWidth={9} opacity={0.5} />
          {cracks.map(([u, v], i) => {
            const a = (i / cracks.length) * Math.PI * 2 + u * 0.2;
            const r0 = 64 + v * 10;
            const r1 = 98 + u * 8;
            const midA = a + (u - 0.5) * 0.07;
            return (
              <path
                key={i}
                data-defect="termico"
                d={`M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(midA) * (r0 + r1) * 0.5} ${cy + Math.sin(midA) * (r0 + r1) * 0.5}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}`}
                stroke="#231507"
                strokeWidth={1}
                fill="none"
              />
            );
          })}
        </>
      )}
      {state === 'riscado' &&
        [68, 72, 77, 84, 88, 95].map((r, i) => (
          <circle key={r} data-defect="riscado" cx={cx} cy={cy} r={r} fill="none" stroke="#55574f" strokeWidth={i % 2 ? 0.7 : 1.3} strokeDasharray={i % 2 ? '60 40' : '120 30'} opacity={0.85} />
        ))}
      <circle cx={cx} cy={cy} r={58} fill="#4b4d46" stroke="#2c2d29" strokeWidth={1.5} />
    </g>
  );
};

const Bearing: React.FC<{ state: string; id: string }> = ({ state, id }) => {
  const cx = 240;
  const cy = 150;
  const rust = useMemo(() => scatter(46, 3331), []);
  const balls = Array.from({ length: 9 }, (_, i) => (i * Math.PI * 2) / 9);
  return (
    <g>
      <circle cx={cx} cy={cy} r={130} fill={`url(#metal-${id})`} stroke="#3b3d37" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={106} fill="#74766f" />
      <circle cx={cx} cy={cy} r={100} fill="#cfd1c9" />
      {state === 'corrosao' &&
        rust.map(([u, v], i) => {
          const a = 1.5 + u * 1.5;
          const r = 76 + v * 22;
          return <ellipse key={i} data-defect="corrosao" cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} rx={2 + u * 7} ry={1.5 + v * 5} fill="#7c3f12" opacity={0.65} />;
        })}
      {state === 'lascamento' && (
        <path
          data-defect="lascamento"
          d="M312 192l11 -8l13 4l9 13l-6 13l-14 3l-12 -7z"
          fill="#3f4039"
          stroke="#1f201c"
          strokeWidth={1.2}
        />
      )}
      {balls.map((a) => (
        <circle key={a} cx={cx + Math.cos(a + 0.2) * 76} cy={cy + Math.sin(a + 0.2) * 76} r={21} fill={`url(#ball-${id})`} stroke="#3b3d37" />
      ))}
      <circle cx={cx} cy={cy} r={54} fill="#cfd1c9" stroke="#55574f" />
      <circle cx={cx} cy={cy} r={36} fill="#2c2d29" />
    </g>
  );
};

const Shaft: React.FC<{ state: string; id: string }> = ({ id }) => (
  <g>
    <rect x="30" y="118" width="130" height="64" fill={`url(#steel-${id})`} stroke="#3b3d37" />
    <rect x="160" y="108" width="150" height="84" fill={`url(#steel-${id})`} stroke="#3b3d37" />
    <rect x="310" y="124" width="140" height="52" fill={`url(#steel-${id})`} stroke="#3b3d37" />
    <rect x="52" y="145" width="60" height="10" rx="5" fill="#55574f" />
    <line x1="20" y1="150" x2="460" y2="150" stroke="#8a2d0a" strokeDasharray="18 4 3 4" strokeWidth={0.8} />
    <path d="M235 108V70M235 192V230" stroke="#23241f" strokeWidth={0.9} />
    <text x="240" y="66" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize={15} fontWeight={600} fill="#23241f">
      Ø 25 h6
    </text>
    <text x="240" y="250" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontSize={12} fill="#55574f">
      assento do rolamento
    </text>
  </g>
);

const Gasket: React.FC<{ id: string }> = ({ id }) => {
  const cx = 240;
  const cy = 150;
  return (
    <g>
      <circle cx={cx} cy={cy} r={126} fill="#9a8f7a" stroke="#4d4538" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={116} fill="none" stroke="#6b6152" strokeWidth={7} opacity={0.75} data-defect="marca" />
      <circle cx={cx} cy={cy} r={97} fill={`url(#paper-${id})`} stroke="#4d4538" strokeWidth={1.5} />
      {Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4).map((a) => (
        <circle key={a} cx={cx + Math.cos(a) * 112} cy={cy + Math.sin(a) * 112} r={6} fill="#f4f3ef" stroke="#4d4538" />
      ))}
    </g>
  );
};

const Art: React.FC<{ part: BenchPartId; state: BenchArtState; id: string }> = ({ part, state, id }) => {
  switch (part) {
    case 'rotor':
      return <Rotor state={state} id={id} />;
    case 'selo':
      return <SealFace state={state} id={id} />;
    case 'rolamento':
      return <Bearing state={state} id={id} />;
    case 'eixo':
      return <Shaft state={state} id={id} />;
    case 'junta':
      return <Gasket id={id} />;
  }
};

/** Peça com lupa. Mouse ou dedo movem a lente; setas do teclado também. */
export const BenchArt: React.FC<{ part: BenchPartId; state: BenchArtState; label: string; lens?: boolean; onExplore?: () => void }> = ({ part, state, label, lens = true, onExplore }) => {
  const uid = useId().replace(/:/g, '');
  const [pos, setPos] = useState<[number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ZOOM = 2.6;
  const R = 72;

  const fromEvent = (e: React.PointerEvent) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    setPos([((e.clientX - box.left) / box.width) * W, ((e.clientY - box.top) / box.height) * H]);
    onExplore?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 20;
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (!d[e.key]) return;
    e.preventDefault();
    const [x, y] = pos ?? [W / 2, H / 2];
    setPos([Math.max(0, Math.min(W, x + d[e.key][0])), Math.max(0, Math.min(H, y + d[e.key][1]))]);
    onExplore?.();
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${label}${lens ? '. Use as setas do teclado para mover a lupa.' : ''}`}
      tabIndex={lens ? 0 : undefined}
      onKeyDown={lens ? onKey : undefined}
      onPointerMove={lens ? fromEvent : undefined}
      onPointerDown={lens ? fromEvent : undefined}
      onPointerLeave={lens ? () => setPos(null) : undefined}
      className={`h-auto w-full rounded-lg ${lens ? 'cursor-zoom-in touch-none' : ''}`}
      style={{ background: 'rgb(var(--paper))' }}
      data-part={part}
      data-state={state}
    >
      <defs>
        <radialGradient id={`metal-${uid}`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#d7d9d1" />
          <stop offset="1" stopColor="#74766f" />
        </radialGradient>
        <radialGradient id={`ball-${uid}`} cx="36%" cy="32%" r="70%">
          <stop offset="0" stopColor="#f4f5f0" />
          <stop offset="1" stopColor="#6d6f68" />
        </radialGradient>
        <linearGradient id={`steel-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e9088" />
          <stop offset="0.4" stopColor="#e3e5dd" />
          <stop offset="1" stopColor="#6d6f68" />
        </linearGradient>
        <radialGradient id={`paper-${uid}`}>
          <stop offset="0.7" stopColor="#f4f3ef" />
          <stop offset="1" stopColor="#e8e6df" />
        </radialGradient>
        <clipPath id={`lens-${uid}`}>
          <circle cx={pos?.[0] ?? 0} cy={pos?.[1] ?? 0} r={R} />
        </clipPath>
      </defs>
      <Art part={part} state={state} id={uid} />
      {pos && (
        <g pointerEvents="none">
          <circle cx={pos[0]} cy={pos[1]} r={R} fill="#f4f3ef" />
          <g clipPath={`url(#lens-${uid})`}>
            <g transform={`translate(${pos[0]} ${pos[1]}) scale(${ZOOM}) translate(${-pos[0]} ${-pos[1]})`}>
              <Art part={part} state={state} id={uid} />
            </g>
          </g>
          <circle cx={pos[0]} cy={pos[1]} r={R} fill="none" stroke="#23241f" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
};
