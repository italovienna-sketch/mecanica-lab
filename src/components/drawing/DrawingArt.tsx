import React, { useId, useMemo } from 'react';
import { Grid, VoxelShape, dims, isoFaces, isoPoint } from '../../data/drawing/voxel';

// Desenho técnico fica sempre em preto sobre papel (`bg-paper`): é a exceção de cor do sistema visual.
const INK = '#1a1d21';
const THIN = '#3f454d';

export const ViewSvg: React.FC<{ grid: Grid; label: string; hatch?: boolean; cell?: number }> = ({ grid, label, hatch = false, cell = 24 }) => {
  const uid = useId().replace(/:/g, '');
  const rows = grid.length;
  const cols = grid[0].length;
  const pad = 6;
  const at = (r: number, c: number) => grid[r]?.[c] ?? null;
  const contour: string[] = [];
  const inner: string[] = [];
  const edge = (a: number | null, b: number | null, x1: number, y1: number, x2: number, y2: number) => {
    const seg = `M${x1 * cell} ${y1 * cell}L${x2 * cell} ${y2 * cell}`;
    if ((a === null) !== (b === null)) contour.push(seg);
    else if (a !== null && b !== null && a !== b) inner.push(seg);
  };
  for (let r = 0; r <= rows; r++) for (let c = 0; c < cols; c++) edge(at(r - 1, c), at(r, c), c, r, c + 1, r);
  for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) edge(at(r, c - 1), at(r, c), c, r, c, r + 1);

  return (
    <svg viewBox={`${-pad} ${-pad} ${cols * cell + pad * 2} ${rows * cell + pad * 2}`} role="img" aria-label={label} className="mx-auto block max-h-40 w-full max-w-[12rem]">
      {hatch && (
        <>
          <defs>
            <pattern id={`h-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={THIN} strokeWidth="1" />
            </pattern>
          </defs>
          {grid.map((row, r) => row.map((c, i) => (c === null ? null : <rect key={`${r}-${i}`} x={i * cell} y={r * cell} width={cell} height={cell} fill={`url(#h-${uid})`} />)))}
        </>
      )}
      <path d={inner.join('')} stroke={THIN} strokeWidth="1.25" fill="none" strokeLinecap="round" />
      <path d={contour.join('')} stroke={INK} strokeWidth="2.25" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const FACE_FILL = { top: '#e7e4dc', front: '#c9c5ba', left: '#a9a59a' };

/** Isométrica da peça. `frontAt` marca qual lado é a frente depois de girar. `plane` mostra o plano de corte A-A. */
export const IsoSvg: React.FC<{ shape: VoxelShape; label: string; turns?: number; plane?: number; className?: string }> = ({ shape, label, turns = 0, plane, className = '' }) => {
  const { faces, box } = useMemo(() => isoFaces(shape), [shape]);
  const { w, d, h } = dims(shape);
  // Depois de girar, a frente original fica em outro lado; o marcador F acompanha.
  const t = ((turns % 4) + 4) % 4;
  const front: [number, number, number] = [
    [w / 2, -0.9, 0],
    [-0.9, d / 2, 0],
    [w / 2, d + 0.9, 0],
    [w + 0.9, d / 2, 0]
  ][t] as [number, number, number];
  const [fx, fy] = isoPoint(...front);
  const pad = 26;
  const planePts = plane === undefined ? null : ([[-0.5, plane + 0.5, 0], [w + 0.5, plane + 0.5, 0], [w + 0.5, plane + 0.5, h + 0.4], [-0.5, plane + 0.5, h + 0.4]] as [number, number, number][]).map((p) => isoPoint(...p));
  return (
    <svg viewBox={`${box.x - pad} ${box.y - pad} ${box.w + pad * 2} ${box.h + pad * 2}`} role="img" aria-label={label} className={`mx-auto block max-h-56 w-full ${className}`}>
      {faces.map((f) => (
        <path key={f.key} d={f.d} fill={FACE_FILL[f.face]} stroke={INK} strokeWidth="0.9" strokeLinejoin="round" />
      ))}
      {planePts && (
        <>
          <path d={`M${planePts.map((p) => p.join(' ')).join('L')}Z`} fill="#ea580c33" stroke="#c2410c" strokeWidth="1.5" strokeDasharray="8 3 2 3" />
          <text x={planePts[1][0] + 4} y={planePts[1][1]} fontSize="13" fontWeight="700" fill="#c2410c" fontFamily="IBM Plex Mono, monospace">A-A</text>
        </>
      )}
      <circle cx={fx} cy={fy} r="10" fill="#fff" stroke={INK} strokeWidth="1.25" />
      <text x={fx} y={fy + 4.5} fontSize="13" fontWeight="700" textAnchor="middle" fill={INK} fontFamily="IBM Plex Mono, monospace">F</text>
    </svg>
  );
};
