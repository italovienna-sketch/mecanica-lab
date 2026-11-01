import React, { useId } from 'react';
import { FLOW_LINE, FLOW_REGIONS, PART_REGIONS, PumpFlowId, PumpPartId, PumpSpot, SectionRegion } from '../../data/journey/pumpSection';

/**
 * Corte da bomba em SVG. Leve o bastante para qualquer computador e sem depender de WebGL.
 * Toda região clicável também é um botão de teclado; `pickable` define o que está valendo na atividade.
 */

interface Props {
  title: string;
  /** Quais regiões respondem ao clique: peças, caminho do líquido ou nada. */
  mode?: 'parts' | 'flow' | 'none';
  onPick?: (id: PumpSpot) => void;
  /** Regiões já marcadas como certas. */
  done?: PumpSpot[];
  /** Região em destaque (selecionada). */
  active?: PumpSpot | null;
  /** Região marcada como erro no último clique. */
  wrong?: PumpSpot | null;
  /** Mostra o caminho do líquido animado. */
  showFlow?: boolean;
  /** Balões numerados, como numa lista de peças. */
  balloons?: boolean;
  className?: string;
}

export const PumpSection: React.FC<Props> = ({ title, mode = 'none', onPick, done = [], active = null, wrong = null, showFlow = false, balloons = false, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const hatch = `hatch-${uid}`;
  const hatch2 = `hatch2-${uid}`;

  const fillFor = (id: PumpSpot, base: string) => {
    if (id === wrong) return '#e11d4873';
    if (id === active) return '#ea580c8c';
    if (done.includes(id)) return '#10b98166';
    return base;
  };

  const hit = <T extends PumpSpot>(r: SectionRegion<T>) => (
    <path
      key={r.id}
      d={r.d}
      fill={id2fill(r.id)}
      fillRule="evenodd"
      stroke="none"
      role="button"
      tabIndex={0}
      aria-label={r.label}
      aria-pressed={r.id === active || done.includes(r.id)}
      data-spot={r.id}
      className="cursor-pointer outline-none transition-[fill] hover:fill-accent/25 focus-visible:fill-accent/35"
      onClick={() => onPick?.(r.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick?.(r.id);
        }
      }}
    />
  );
  const id2fill = (id: PumpSpot) => fillFor(id, 'transparent');

  return (
    <svg viewBox="0 0 760 340" role="group" aria-label={title} className={`h-auto w-full ${className}`} style={{ background: 'rgb(var(--paper))' }}>
      <defs>
        <pattern id={hatch} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#55574f" strokeWidth="1" />
        </pattern>
        <pattern id={hatch2} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#55574f" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Líquido dentro da bomba */}
      {FLOW_REGIONS.map((r: SectionRegion<PumpFlowId>) => (
        <path key={r.id} d={r.d} fill="#bcd9ec" fillRule="evenodd" opacity={0.75} />
      ))}

      {/* Peças em corte: hachura convencional; peças vizinhas com hachura invertida */}
      {PART_REGIONS.map((r: SectionRegion<PumpPartId>, i) =>
        r.id === 'pump-shaft' || r.id === 'pump-impeller-nut' ? (
          <path key={r.id} d={r.d} fill="#e8e6df" stroke="#23241f" strokeWidth={1.4} />
        ) : (
          <g key={r.id}>
            <path d={r.d} fill="#f4f3ef" fillRule="evenodd" />
            <path d={r.d} fill={`url(#${i % 2 ? hatch2 : hatch})`} fillRule="evenodd" stroke="#23241f" strokeWidth={1.4} />
          </g>
        )
      )}

      {/* Esferas dos rolamentos */}
      {[140, 356].flatMap((x) =>
        [141, 199].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={8} fill="#f4f3ef" stroke="#23241f" strokeWidth={1.2} />)
      )}

      {/* Linha de centro */}
      <line x1="8" y1="170" x2="752" y2="170" stroke="#8a2d0a" strokeWidth={0.9} strokeDasharray="22 5 4 5" />

      {showFlow && (
        <path d={FLOW_LINE} fill="none" stroke="#0369a1" strokeWidth={3} strokeLinecap="round" strokeDasharray="10 12" className="animate-flow-dash" data-testid="flow-line" />
      )}

      {balloons &&
        PART_REGIONS.map((r) => {
          const b = r.balloon;
          if (!b) return null;
          return (
            <g key={r.id} pointerEvents="none">
              <line x1={b.at[0]} y1={b.at[1]} x2={b.to[0]} y2={b.to[1]} stroke="#23241f" strokeWidth={0.8} />
              <circle cx={b.at[0]} cy={b.at[1]} r={2} fill="#23241f" />
              <circle cx={b.to[0]} cy={b.to[1]} r={11} fill="#f4f3ef" stroke="#23241f" strokeWidth={1.2} />
              <text x={b.to[0]} y={b.to[1] + 4} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="IBM Plex Mono, monospace" fill="#23241f">
                {r.n}
              </text>
            </g>
          );
        })}

      {mode === 'parts' && PART_REGIONS.map(hit)}
      {mode === 'flow' && FLOW_REGIONS.map(hit)}
    </svg>
  );
};
