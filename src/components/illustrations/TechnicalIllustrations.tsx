import React from 'react';
import { IllustrationId } from '../../data/practiceBank';
import { PumpIsoFigure } from './PumpIsoFigure';

/**
 * Ilustrações técnicas didáticas em SVG.
 * São desenhos esquemáticos (não são desenhos de fabricação): as escalas do paquímetro
 * e do micrômetro são calculadas a partir do valor da leitura para que o desenho seja coerente.
 */

const INK = '#1d1e1b';
const MUTED = '#6e706a';
const ACCENT = '#e8590c';
const PAPER = '#f4f3ef';

const Frame: React.FC<{ viewBox: string; label: string; children: React.ReactNode }> = ({ viewBox, label, children }) => (
  <svg viewBox={viewBox} role="img" aria-label={label} className="h-auto w-full" style={{ background: PAPER }}>
    {children}
  </svg>
);

/** Paquímetro com resolução 0,05 mm (nônio de 20 divisões em 39 mm). Leitura padrão: 23,35 mm. */
export const CaliperReading: React.FC<{ reading?: number; label: string }> = ({ reading = 23.35, label }) => {
  // A janela acompanha a leitura para o nônio (39 mm) caber inteiro: 23,35 → 15…66 mm.
  const start = Math.floor(reading) - 8;
  const end = start + 51;
  const s = 10; // px por mm
  const x = (mm: number) => 20 + (mm - start) * s;
  const vernierStep = 1.95;
  const coincident = Math.round(((reading % 1) + 1e-9) / 0.05);
  const mainTicks = [];
  for (let mm = start; mm <= end; mm++) {
    const h = mm % 10 === 0 ? 26 : mm % 5 === 0 ? 19 : 13;
    const hit = Math.abs(mm - (reading + coincident * vernierStep)) < 0.01;
    mainTicks.push(
      <line key={mm} x1={x(mm)} x2={x(mm)} y1={70} y2={70 - h} stroke={hit ? ACCENT : INK} strokeWidth={hit ? 2.2 : 1.1} />
    );
    if (mm % 10 === 0) {
      mainTicks.push(
        <text key={`t${mm}`} x={x(mm)} y={36} textAnchor="middle" fontSize="12" fill={INK} fontFamily="Inter, sans-serif">
          {mm / 10}
        </text>
      );
    }
  }
  const vernier = [];
  for (let i = 0; i <= 20; i++) {
    const pos = reading + i * vernierStep;
    const hit = i === coincident;
    vernier.push(
      <line
        key={i}
        x1={x(pos)}
        x2={x(pos)}
        y1={72}
        y2={72 + (i % 2 === 0 ? 20 : 13)}
        stroke={hit ? ACCENT : INK}
        strokeWidth={hit ? 2.2 : 1.1}
      />
    );
    if (i % 2 === 0) {
      vernier.push(
        <text key={`v${i}`} x={x(pos)} y={106} textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="Inter, sans-serif">
          {i / 2}
        </text>
      );
    }
  }
  return (
    <Frame viewBox="0 0 560 150" label={label}>
      <rect x="10" y="40" width="540" height="31" fill="#e6e4dc" />
      <rect x={x(reading) - 8} y="71" width={vernierStep * 20 * s + 16} height="42" fill="#d9d6cc" rx="2" />
      {mainTicks}
      {vernier}
      <text x="14" y="18" fontSize="11" fill={MUTED} fontFamily="Inter, sans-serif">
        Escala fixa (cm) — cada traço = 1 mm
      </text>
      <text x="14" y="136" fontSize="11" fill={MUTED} fontFamily="Inter, sans-serif">
        Nônio — cada traço = 0,05 mm · o traço em laranja coincide com a escala fixa
      </text>
    </Frame>
  );
};

/** Micrômetro de 0,01 mm: bainha (mm e meio mm) + tambor de 50 divisões. Leitura padrão: 12,68 mm. */
export const MicrometerReading: React.FC<{ reading?: number; label: string }> = ({ reading = 12.68, label }) => {
  const s = 21;
  const x = (mm: number) => 24 + mm * s;
  const refY = 70;
  const edge = x(reading);
  const thimbleValue = Math.round(((reading * 100) % 50) * 1) % 50; // 18 para 12,68
  const ticks = [];
  for (let mm = 0; mm <= Math.floor(reading); mm++) {
    ticks.push(<line key={mm} x1={x(mm)} x2={x(mm)} y1={refY} y2={refY - 14} stroke={INK} strokeWidth="1.2" />);
    if (mm % 5 === 0) {
      ticks.push(
        <text key={`n${mm}`} x={x(mm)} y={refY - 20} textAnchor="middle" fontSize="11" fill={INK} fontFamily="Inter, sans-serif">
          {mm}
        </text>
      );
    }
  }
  for (let half = 0.5; half < reading; half += 1) {
    const hit = half === Math.floor(reading) + 0.5;
    ticks.push(
      <line key={`h${half}`} x1={x(half)} x2={x(half)} y1={refY} y2={refY + 10} stroke={hit ? ACCENT : INK} strokeWidth={hit ? 2 : 1.1} />
    );
  }
  const thimbleTicks = [];
  for (let d = -6; d <= 6; d++) {
    const v = (thimbleValue + d + 50) % 50;
    const y = refY - d * 9;
    const major = v % 5 === 0;
    thimbleTicks.push(
      <line
        key={d}
        x1={edge}
        x2={edge + (major ? 22 : 13)}
        y1={y}
        y2={y}
        stroke={d === 0 ? ACCENT : INK}
        strokeWidth={d === 0 ? 2.2 : 1.1}
      />
    );
    if (major || d === 0) {
      thimbleTicks.push(
        <text
          key={`tv${d}`}
          x={edge + 28}
          y={y + 4}
          fontSize="11"
          fill={d === 0 ? ACCENT : INK}
          fontWeight={d === 0 ? 700 : 400}
          fontFamily="Inter, sans-serif"
        >
          {v}
        </text>
      );
    }
  }
  return (
    <Frame viewBox="0 0 470 150" label={label}>
      <rect x="10" y={refY - 34} width={edge - 10} height="68" fill="#e6e4dc" />
      <line x1="10" x2={edge} y1={refY} y2={refY} stroke={INK} strokeWidth="1.2" />
      {ticks}
      <rect x={edge} y={refY - 62} width="70" height="124" fill="#d9d6cc" rx="3" />
      {thimbleTicks}
      <text x="14" y="138" fontSize="11" fill={MUTED} fontFamily="Inter, sans-serif">
        Bainha: mm em cima, meio mm embaixo · Tambor: cada divisão = 0,01 mm
      </text>
    </Frame>
  );
};

/** Flange de 8 parafusos com sequência de aperto em estrela. */
export const FlangePattern: React.FC<{ label: string }> = ({ label }) => {
  const order = [1, 5, 3, 7, 2, 6, 4, 8];
  const cx = 150;
  const cy = 110;
  return (
    <Frame viewBox="0 0 300 220" label={label}>
      <circle cx={cx} cy={cy} r="92" fill="#e6e4dc" stroke={INK} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="42" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      {order.map((n, i) => {
        const a = (-90 + i * 45) * (Math.PI / 180);
        const bx = cx + Math.cos(a) * 68;
        const by = cy + Math.sin(a) * 68;
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r="13" fill={n <= 2 ? ACCENT : '#ffffff'} stroke={INK} strokeWidth="1.3" />
            <text
              x={bx}
              y={by + 4.5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill={n <= 2 ? '#ffffff' : INK}
              fontFamily="Inter, sans-serif"
            >
              {n}
            </text>
          </g>
        );
      })}
      <path
        d={`M ${cx} ${cy - 68} L ${cx} ${cy + 68}`}
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        markerEnd="url(#arrow)"
      />
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ACCENT} />
        </marker>
      </defs>
    </Frame>
  );
};

/** Chave combinada: boca aberta x anel estriado. */
export const CombinationWrench: React.FC<{ label: string }> = ({ label }) => (
  <Frame viewBox="0 0 520 150" label={label}>
    <rect x="110" y="64" width="300" height="22" rx="8" fill="#c9c6bc" stroke={INK} strokeWidth="1.3" />
    {/* Boca aberta (15°) */}
    <g transform="translate(70 75) rotate(-15)">
      <path d="M -50 -34 L 10 -34 Q 40 -34 40 0 Q 40 34 10 34 L -50 34 L -50 18 L 0 18 L 0 -18 L -50 -18 Z" fill="#c9c6bc" stroke={INK} strokeWidth="1.3" />
    </g>
    {/* Anel estriado */}
    <circle cx="450" cy="75" r="44" fill="#c9c6bc" stroke={INK} strokeWidth="1.3" />
    <polygon
      points={Array.from({ length: 24 })
        .map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const r = i % 2 === 0 ? 24 : 20;
          return `${450 + Math.cos(a) * r},${75 + Math.sin(a) * r}`;
        })
        .join(' ')}
      fill={PAPER}
      stroke={INK}
      strokeWidth="1.2"
    />
    <text x="40" y="140" fontSize="13" fill={INK} fontFamily="Inter, sans-serif">
      Boca aberta: toca 2 faces
    </text>
    <text x="360" y="140" fontSize="13" fill={ACCENT} fontWeight="600" fontFamily="Inter, sans-serif">
      Anel estriado: abraça os cantos
    </text>
  </Frame>
);

const signed = (div: number) => `${div > 0 ? '+' : div < 0 ? '−' : ''}${(Math.abs(div) / 100).toFixed(2).replace('.', ',')}`;

/**
 * Relógio comparador (mostrador balanceado 0–50–0, 0,01 mm por divisão) com os extremos de leitura durante uma volta
 * do eixo. `min`/`max` em divisões com sinal; `showValues` = escrever os valores na legenda (falso quando é a pergunta).
 */
export const DialRunout: React.FC<{ label: string; min?: number; max?: number; showValues?: boolean }> = ({ label, min = -2, max = 3, showValues = true }) => {
  const cx = 130;
  const cy = 110;
  const toAngle = (div: number) => (-90 + div * 3.6) * (Math.PI / 180);
  const ticks = Array.from({ length: 100 }).map((_, i) => {
    const a = toAngle(i);
    const r1 = i % 10 === 0 ? 70 : i % 5 === 0 ? 76 : 80;
    return (
      <line
        key={i}
        x1={cx + Math.cos(a) * r1}
        y1={cy + Math.sin(a) * r1}
        x2={cx + Math.cos(a) * 86}
        y2={cy + Math.sin(a) * 86}
        stroke={INK}
        strokeWidth={i % 10 === 0 ? 1.6 : 0.8}
      />
    );
  });
  const numbers = Array.from({ length: 10 }).map((_, k) => {
    const a = toAngle(k * 10);
    return (
      <text key={k} x={cx + Math.cos(a) * 58} y={cy + Math.sin(a) * 58 + 4} textAnchor="middle" fontSize="11" fill={INK} fontFamily="Inter, sans-serif">
        {k <= 5 ? k * 10 : 100 - k * 10}
      </text>
    );
  });
  const sign = (div: number, text: string) => {
    const a = toAngle(div);
    return (
      <text x={cx + Math.cos(a) * 58} y={cy + Math.sin(a) * 58 + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill={MUTED} fontFamily="Inter, sans-serif">
        {text}
      </text>
    );
  };
  const needle = (div: number, color: string) => {
    const a = toAngle(div);
    return <line x1={cx} y1={cy} x2={cx + Math.cos(a) * 66} y2={cy + Math.sin(a) * 66} stroke={color} strokeWidth="2.4" strokeLinecap="round" />;
  };
  return (
    <Frame viewBox="0 0 360 220" label={label}>
      <circle cx={cx} cy={cy} r="96" fill="#e6e4dc" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="88" fill="#ffffff" stroke={INK} strokeWidth="1" />
      {ticks}
      {numbers}
      {sign(5, '+')}
      {sign(-5, '−')}
      {needle(min, '#2f7fc1')}
      {needle(max, ACCENT)}
      <circle cx={cx} cy={cy} r="6" fill={INK} />
      <text x={cx} y={cy + 40} textAnchor="middle" fontSize="11" fill={MUTED} fontFamily="Inter, sans-serif">
        0,01 mm / divisão
      </text>
      <g fontFamily="Inter, sans-serif" fontSize="13">
        <rect x="245" y="70" width="12" height="12" fill="#2f7fc1" />
        <text x="263" y="80" fill={INK}>
          menor{showValues ? `: ${signed(min)}` : ' valor'}
        </text>
        <rect x="245" y="100" width="12" height="12" fill={ACCENT} />
        <text x="263" y="110" fill={INK}>
          maior{showValues ? `: ${signed(max)}` : ' valor'}
        </text>
      </g>
    </Frame>
  );
};

export const TechnicalIllustration: React.FC<{ id: IllustrationId; alt: string }> = ({ id, alt }) => {
  switch (id) {
    case 'caliper-reading':
      return <CaliperReading label={alt} />;
    case 'micrometer-reading':
      return <MicrometerReading label={alt} />;
    case 'flange-pattern':
      return <FlangePattern label={alt} />;
    case 'combination-wrench':
      return <CombinationWrench label={alt} />;
    case 'dial-runout':
      return <DialRunout label={alt} />;
    case 'pump-section':
      return <PumpIsoFigure label={alt} exploded={0.45} showLabels />;
    default:
      return null;
  }
};
