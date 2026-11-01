import React from 'react';
import '../iso/iso.css';
import { IsoFigure, Line, Solid, Dots } from '../iso/react/draw';
import {
  ANATOMY_HEIGHT,
  ANATOMY_WIDTH,
  BENCH_STATIC_ART,
  PUMP_PARTS_ART,
  PUMP_ANATOMY_VECTORS,
  SHAFT_Y,
  SHAFT_Z,
  atPump,
  getPartTransform
} from '../iso/pumpAnatomyGeometry';

/**
 * Prancha isométrica leve (SVG, kit da skill Anatomy) da bomba centrífuga.
 * Usa os mesmos IDs de peça do laboratório 3D, então selecionar aqui ou lá aponta para o mesmo componente.
 */

/** Ponto de ancoragem (coordenadas do desenho) e número de cada peça na legenda. */
export const PUMP_CALLOUTS: { partId: string; n: number; short: string; anchor: [number, number, number] }[] = [
  { partId: 'pump-volute-casing', n: 1, short: 'Voluta (carcaça)', anchor: [34, SHAFT_Y, SHAFT_Z + 36] },
  { partId: 'pump-impeller', n: 2, short: 'Rotor', anchor: [12, SHAFT_Y, SHAFT_Z + 30] },
  { partId: 'pump-mechanical-seal', n: 3, short: 'Selo mecânico', anchor: [-12, SHAFT_Y, SHAFT_Z + 18] },
  { partId: 'pump-shaft', n: 4, short: 'Eixo', anchor: [-108, SHAFT_Y, SHAFT_Z + 10] },
  { partId: 'pump-bearings', n: 5, short: 'Rolamentos', anchor: [-36, SHAFT_Y, SHAFT_Z + 19] },
  { partId: 'pump-bearing-bracket', n: 6, short: 'Cavalete de mancal', anchor: [-62, SHAFT_Y, SHAFT_Z + 24] },
  { partId: 'pump-fasteners', n: 7, short: 'Fixadores e porca do rotor', anchor: [32, SHAFT_Y, SHAFT_Z + 10] }
];

interface PumpIsoFigureProps {
  label: string;
  /** 0 = montada, 1 = totalmente explodida */
  exploded?: number;
  highlightPartId?: string | null;
  /** Peças retiradas da cena (ex.: sequência de desmontagem). */
  hiddenPartIds?: string[];
  showLabels?: boolean;
  /** Legenda em 2 colunas sempre (para painéis estreitos, como a lateral do laboratório). */
  compactLegend?: boolean;
  onPartClick?: (partId: string) => void;
  onPartHover?: (partId: string | null) => void;
  className?: string;
}

export const PumpIsoFigure: React.FC<PumpIsoFigureProps> = ({
  label,
  exploded = 0,
  highlightPartId = null,
  hiddenPartIds = [],
  showLabels = false,
  compactLegend = false,
  onPartClick,
  onPartHover,
  className = ''
}) => {
  const interactive = Boolean(onPartClick);
  const part = (id: string, children: React.ReactNode) => {
    if (hiddenPartIds.includes(id)) return null;
    const name = PUMP_ANATOMY_VECTORS[id]?.labelPt ?? id;
    return (
      <g
        key={id}
        data-part-id={id}
        transform={getPartTransform('centrifugal-pump', id, exploded)}
        onClick={interactive ? () => onPartClick?.(id) : undefined}
        onMouseEnter={onPartHover ? () => onPartHover(id) : undefined}
        onMouseLeave={onPartHover ? () => onPartHover(null) : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPartClick?.(id);
                }
              }
            : undefined
        }
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? name : undefined}
        style={interactive ? { cursor: 'pointer', outline: 'none' } : undefined}
      >
        {children}
      </g>
    );
  };
  const lit = (id: string) => highlightPartId === id;
  const A = PUMP_PARTS_ART;

  return (
    <div className={`iso ${className}`} data-theme="light">
      <IsoFigure width={ANATOMY_WIDTH} height={ANATOMY_HEIGHT} label={label}>
        <g>
          <Solid paths={BENCH_STATIC_ART.slab} tone="lo" crease="faint" />
          <Line d={BENCH_STATIC_ART.perimeterGroove} tone="faint" />
          <Line d={A.axisCenterline} tone="lo" dotted />
        </g>

        {part(
          'pump-bearing-bracket',
          <>
            <Solid paths={A.bearingBracket.pedestalFoot} tone="mid" lit={lit('pump-bearing-bracket')} />
            <Solid paths={A.bearingBracket.pedestalColumn} tone="mid" lit={lit('pump-bearing-bracket')} />
            <Solid paths={A.bearingBracket.rearCover} tone="hi" lit={lit('pump-bearing-bracket')} />
            <Solid paths={A.bearingBracket.barrel} tone="hi" lit={lit('pump-bearing-bracket')} />
            <Solid paths={A.bearingBracket.adapterFlange} tone="hi" lit={lit('pump-bearing-bracket')} />
            <Dots points={A.bearingBracket.flangeBolts} size={0.5} tone="mid" />
          </>
        )}

        {part(
          'pump-bearings',
          <>
            <Solid paths={A.bearings.rearOuterRing} tone="hi" lit={lit('pump-bearings')} />
            <Dots points={A.bearings.rearBalls} size={0.55} tone="mid" />
            <Solid paths={A.bearings.frontOuterRing} tone="hi" lit={lit('pump-bearings')} />
            <Dots points={A.bearings.frontBalls} size={0.55} tone="mid" />
          </>
        )}

        {part(
          'pump-shaft',
          <>
            <Solid paths={A.driveShaft.couplingEnd} tone="hi" lit={lit('pump-shaft')} />
            <Solid paths={A.driveShaft.mainJournal} tone="hi" lit={lit('pump-shaft')} />
            <Solid paths={A.driveShaft.impellerSeat} tone="hi" lit={lit('pump-shaft')} />
            <Solid paths={A.driveShaft.keywayBlock} tone="mid" lit={lit('pump-shaft')} />
          </>
        )}

        {part(
          'pump-mechanical-seal',
          <>
            <Solid paths={A.mechanicalSeal.stationarySeat} tone="hi" lit={lit('pump-mechanical-seal')} />
            <Solid paths={A.mechanicalSeal.rotaryUnit} tone="hi" lit={lit('pump-mechanical-seal')} />
            <Solid paths={A.mechanicalSeal.elastomerBellows} tone="mid" lit={lit('pump-mechanical-seal')} />
          </>
        )}

        {part(
          'pump-impeller',
          <>
            <Solid paths={A.impeller.backShroud} tone="hi" lit={lit('pump-impeller')} />
            <Solid paths={A.impeller.vaneChannel} tone="mid" lit={lit('pump-impeller')} />
            <Solid paths={A.impeller.frontShroud} tone="hi" lit={lit('pump-impeller')} />
            <Line d={A.impeller.vanesDetail} tone="mid" />
            <Solid paths={A.impeller.suctionEye} tone="hi" lit={lit('pump-impeller')} />
          </>
        )}

        {part(
          'pump-volute-casing',
          <>
            <Solid paths={A.casingVolute.casingFoot} tone="mid" lit={lit('pump-volute-casing')} />
            <Solid paths={A.casingVolute.rearFlange} tone="hi" lit={lit('pump-volute-casing')} />
            <Solid paths={A.casingVolute.voluteScroll} tone="hi" lit={lit('pump-volute-casing')} />
            <Solid paths={A.casingVolute.dischargePipe} tone="hi" lit={lit('pump-volute-casing')} />
            <Solid paths={A.casingVolute.dischargeFlange} tone="hi" lit={lit('pump-volute-casing')} />
            <Solid paths={A.casingVolute.suctionTaper} tone="hi" lit={lit('pump-volute-casing')} />
            <Solid paths={A.casingVolute.suctionFlange} tone="hi" lit={lit('pump-volute-casing')} />
            <Dots points={A.casingVolute.suctionBolts} size={0.5} tone="mid" />
          </>
        )}

        {part(
          'pump-fasteners',
          <>
            <Solid paths={A.fasteners.impellerWasher} tone="hi" lit={lit('pump-fasteners')} />
            <Solid paths={A.fasteners.impellerHexBody} tone="hi" lit={lit('pump-fasteners')} />
            <Solid paths={A.fasteners.impellerAcornCap} tone="hi" lit={lit('pump-fasteners')} />
          </>
        )}

        {showLabels &&
          PUMP_CALLOUTS.filter((c) => !hiddenPartIds.includes(c.partId)).map((c) => {
            const v = PUMP_ANATOMY_VECTORS[c.partId]?.explodeVector ?? [0, 0, 0];
            const [x, y] = atPump([c.anchor[0] + v[0] * exploded, c.anchor[1] + v[1] * exploded, c.anchor[2] + v[2] * exploded]);
            const active = highlightPartId === c.partId;
            return (
              <g key={c.partId} pointerEvents="none">
                <circle cx={x} cy={y} r={11} fill={active ? '#e8590c' : '#1d1e1b'} />
                <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff" fontFamily="Inter, sans-serif">
                  {c.n}
                </text>
              </g>
            );
          })}
      </IsoFigure>
      {showLabels && (
        <ol className={`grid grid-cols-2 gap-x-4 gap-y-1 px-3 pb-3 pt-1 text-[13px] text-[#33342f] ${compactLegend ? '' : 'sm:grid-cols-4'}`}>
          {PUMP_CALLOUTS.map((c) => (
            <li key={c.partId} className={highlightPartId === c.partId ? 'font-semibold text-[#c2410c]' : ''}>
              <span className="font-mono font-bold">{c.n}</span> {c.short}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
