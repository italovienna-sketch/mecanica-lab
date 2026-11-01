import React from 'react';
import { PLANT_AREAS, PlantArea } from '../../data/industry/industryCatalog';

/**
 * Mapa da planta-escola (fictícia), visto de cima. Leve de propósito: um SVG, sem 3D.
 * Cada área é um botão acessível; a lista abaixo do mapa (na página) é a alternativa em texto.
 */

const AREA_COLOR: Record<string, string> = {
  bombeamento: '#38bdf8',
  hidraulica: '#a78bfa',
  transporte: '#f59e0b',
  acionamentos: '#34d399',
  oficina: '#f472b6',
  monitoramento: '#94a3b8'
};

const Glyph: React.FC<{ area: PlantArea }> = ({ area }) => {
  const { x, y, w, h } = area.box;
  const cx = x + w / 2;
  const cy = y + h / 2 + 14;
  const stroke = '#cbd5e1';
  switch (area.id) {
    case 'bombeamento':
      return (
        <g stroke={stroke} strokeWidth={2} fill="none">
          <rect x={cx - 100} y={cy - 30} width={56} height={62} rx={4} />
          <line x1={cx - 44} y1={cy + 18} x2={cx + 4} y2={cy + 18} />
          <circle cx={cx + 24} cy={cy + 18} r={20} />
          <line x1={cx + 24} y1={cy - 2} x2={cx + 24} y2={cy - 40} />
          <line x1={cx + 24} y1={cy - 40} x2={cx + 100} y2={cy - 40} />
        </g>
      );
    case 'hidraulica':
      return (
        <g stroke={stroke} strokeWidth={2} fill="none">
          <rect x={cx - 96} y={cy - 6} width={110} height={56} rx={4} />
          <circle cx={cx - 40} cy={cy - 22} r={14} />
          <circle cx={cx - 14} cy={cy - 22} r={14} />
          <rect x={cx + 40} y={cy - 40} width={56} height={22} rx={3} />
          <line x1={cx + 14} y1={cy + 10} x2={cx + 68} y2={cy - 18} />
        </g>
      );
    case 'transporte':
      return (
        <g stroke={stroke} strokeWidth={2} fill="none">
          <rect x={cx - 170} y={cy - 12} width={340} height={24} rx={12} />
          {[-120, -40, 40, 120].map((d) => (
            <rect key={d} x={cx + d - 12} y={cy - 36} width={24} height={20} rx={2} />
          ))}
          <path d={`M ${cx + 120} ${cy + 34} L ${cx + 160} ${cy + 34}`} />
          <path d={`M ${cx + 152} ${cy + 28} L ${cx + 162} ${cy + 34} L ${cx + 152} ${cy + 40}`} />
        </g>
      );
    case 'acionamentos':
      return (
        <g stroke={stroke} strokeWidth={2} fill="none">
          <rect x={cx - 150} y={cy - 26} width={80} height={52} rx={6} />
          <rect x={cx - 52} y={cy - 32} width={70} height={64} rx={4} />
          <line x1={cx + 18} y1={cy} x2={cx + 58} y2={cy} />
          <circle cx={cx + 66} cy={cy} r={8} />
          <line x1={cx + 74} y1={cy} x2={cx + 150} y2={cy} />
          <rect x={cx + 92} y={cy - 18} width={16} height={36} />
          <rect x={cx + 124} y={cy - 18} width={16} height={36} />
        </g>
      );
    case 'oficina':
      return (
        <g stroke={stroke} strokeWidth={2} fill="none">
          <rect x={cx - 70} y={cy - 4} width={140} height={14} />
          <line x1={cx - 60} y1={cy + 10} x2={cx - 60} y2={cy + 60} />
          <line x1={cx + 60} y1={cy + 10} x2={cx + 60} y2={cy + 60} />
          <rect x={cx - 50} y={cy - 70} width={100} height={36} rx={4} />
          <circle cx={cx - 28} cy={cy - 52} r={10} />
        </g>
      );
    default:
      return (
        <g stroke={stroke} strokeWidth={2} fill="none">
          <polyline points={`${cx - 70},${cy + 20} ${cx - 40},${cy} ${cx - 10},${cy + 10} ${cx + 20},${cy - 20} ${cx + 60},${cy - 30}`} />
          <line x1={cx - 76} y1={cy + 36} x2={cx + 76} y2={cy + 36} />
        </g>
      );
  }
};

export const PlantMap: React.FC<{
  selected: string | null;
  onSelect: (id: string) => void;
  counts: Record<string, number>;
}> = ({ selected, onSelect, counts }) => (
  <svg viewBox="0 0 960 540" className="h-auto w-full rounded-xl border border-ink-700 bg-[#0d1117]" role="group" aria-label="Mapa da planta-escola fictícia">
    {/* Piso com malha de pilares */}
    <defs>
      <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1b222c" strokeWidth={1} />
      </pattern>
    </defs>
    <rect width="960" height="540" fill="url(#floor-grid)" />
    {/* Ligações entre áreas: água para o processo, giro para a linha, medições */}
    <g stroke="#475569" strokeWidth={2} fill="none" strokeDasharray="6 6">
      <path d="M 294 120 L 314 120" />
      <path d="M 514 264 L 514 244" />
      <path d="M 734 430 L 714 430" />
      <path d="M 835 344 L 835 324" />
    </g>
    {PLANT_AREAS.map((a) => {
      const active = selected === a.id;
      const color = AREA_COLOR[a.id];
      return (
        <React.Fragment key={a.id}>
          <g
            role="button"
            tabIndex={0}
            aria-pressed={active}
            aria-label={`${a.name}: ${counts[a.id] || 0} equipamento(s). Área ${a.code} da planta.`}
            onClick={() => onSelect(a.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(a.id);
              }
            }}
            className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-white"
            data-testid={`plant-area-${a.id}`}
          >
            <rect
              x={a.box.x}
              y={a.box.y}
              width={a.box.w}
              height={a.box.h}
              rx={10}
              fill={active ? `${color}22` : '#111821'}
              stroke={active ? color : '#334155'}
              strokeWidth={active ? 3 : 1.5}
            />
            <text x={a.box.x + 50} y={a.box.y + 31} fontSize={a.box.w < 250 ? 13 : 16} fontWeight={700} fill="#e5e7eb">
              {a.name}
            </text>
            <Glyph area={a} />
          </g>
          {/* Selo com a letra da área: fora do botão (o nome acessível já diz "Área X"), sem capturar cliques. */}
          <g aria-hidden pointerEvents="none">
            <rect x={a.box.x + 12} y={a.box.y + 12} width={28} height={28} rx={6} fill={color} />
            <text x={a.box.x + 26} y={a.box.y + 31} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0b0d10">
              {a.code}
            </text>
          </g>
        </React.Fragment>
      );
    })}
  </svg>
);
