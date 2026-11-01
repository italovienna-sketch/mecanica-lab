import React from 'react';
import { BA } from '../../data/industry/bearingAssemblySpec';
import { MG_MODULE, MG_RATIO_TEXT, MG_TEETH } from '../../data/industry/motorGearboxSpec';

/**
 * Desenhos da seção Indústria na prática.
 *
 * Dois tipos, sempre identificados no carimbo/legenda:
 * - "Desenho de conjunto — ilustração educativa": gerado a partir das MESMAS medidas do modelo 3D
 *   (constantes BA), com linhas e hachuras convencionais, balões e lista de peças, SEM cotas;
 * - "Esquema": diagrama simplificado para explicar um conceito (fluxo do giro, sucção da bomba…).
 * Nenhum dos dois é desenho de fabricação.
 */

const INK = '#e5e7eb';
const THIN = '#9ca3af';
const PAPER = '#0f1216';

/** Escala: 1 unidade do modelo = 62 px; origem no centro do eixo. */
const K = 62;
const OX = 330;
const OY = 168;
const px = (x: number) => OX + x * K;
const py = (y: number) => OY - y * K;

/** Retângulo entre dois pontos do modelo. */
const R: React.FC<{ x0: number; x1: number; y0: number; y1: number; fill?: string; stroke?: string; sw?: number; dash?: string }> = ({
  x0,
  x1,
  y0,
  y1,
  fill = 'none',
  stroke = INK,
  sw = 1.6,
  dash
}) => (
  <rect
    x={Math.min(px(x0), px(x1))}
    y={Math.min(py(y0), py(y1))}
    width={Math.abs(px(x1) - px(x0))}
    height={Math.abs(py(y1) - py(y0))}
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeDasharray={dash}
  />
);

const Balloon: React.FC<{ n: number; x: number; y: number; tx: number; ty: number }> = ({ n, x, y, tx, ty }) => (
  <g>
    <line x1={px(x)} y1={py(y)} x2={tx} y2={ty} stroke={THIN} strokeWidth={0.8} />
    <circle cx={px(x)} cy={py(y)} r={2.2} fill={THIN} />
    <circle cx={tx} cy={ty} r={11} fill={PAPER} stroke={INK} strokeWidth={1.2} />
    <text x={tx} y={ty + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK}>
      {n}
    </text>
  </g>
);

export const BEARING_DRAWING_PARTS: { n: number; name: string; qty: string; note: string }[] = [
  { n: 1, name: 'Chapa de assentamento', qty: '1', note: 'Fixa na estrutura' },
  { n: 2, name: 'Caixa de mancal bipartida (base + tampa)', qty: '2', note: 'Tampa e base formam par' },
  { n: 3, name: 'Eixo escalonado', qty: '1', note: 'Eixo não se hachura em corte longitudinal' },
  { n: 4, name: 'Rolamento rígido de esferas — FIXO', qty: '1', note: 'Lado da polia' },
  { n: 5, name: 'Rolamento de rolos cilíndricos tipo NU — LIVRE', qty: '1', note: 'Lado do acoplamento' },
  { n: 6, name: 'Anel elástico para eixo', qty: '2', note: 'Trava axial dos anéis internos' },
  { n: 7, name: 'Polia em V (2 canais)', qty: '1', note: 'Presa com chaveta' },
  { n: 8, name: 'Meia-luva de acoplamento elástico', qty: '1', note: 'Presa com chaveta' },
  { n: 9, name: 'Vedação de lábio', qty: '2', note: 'Lado de fora das caixas' },
  { n: 10, name: 'Chaveta paralela', qty: '2', note: 'Não se hachura em corte' }
];

/**
 * Desenho de conjunto do eixo com mancais: vista de frente em meio-corte (metade de cima cortada no plano
 * do eixo, metade de baixo em vista externa). Medidas tiradas das constantes do modelo 3D.
 */
export const BearingAssemblyDrawing: React.FC<{ showList?: boolean; highlight?: number | null }> = ({ showList = true, highlight = null }) => {
  const { shaft, bearing, housing: H, pulley, coupling } = BA;
  const cxs = [BA.fixedX, BA.freeX];
  const hl = (n: number) => (highlight === n ? '#f97316' : undefined);

  // Contorno do eixo (perfil de cima; a metade de baixo é o espelho)
  const prof: [number, number][] = [
    [shaft.x0, shaft.rEnd],
    [-shaft.endStep, shaft.rEnd],
    [-shaft.endStep, shaft.rSeat],
    [-shaft.shoulder, shaft.rSeat],
    [-shaft.shoulder, shaft.rMid],
    [shaft.shoulder, shaft.rMid],
    [shaft.shoulder, shaft.rSeat],
    [shaft.endStep, shaft.rSeat],
    [shaft.endStep, shaft.rEnd],
    [shaft.x1, shaft.rEnd]
  ];
  const shaftPath =
    'M ' +
    prof.map(([x, r]) => `${px(x)} ${py(r)}`).join(' L ') +
    ' L ' +
    [...prof].reverse().map(([x, r]) => `${px(x)} ${py(-r)}`).join(' L ') +
    ' Z';

  return (
    <figure className="overflow-hidden rounded-xl border border-ink-700 bg-[#0f1216]" data-testid="drawing-bearing-assembly">
      <svg viewBox="0 0 660 400" className="h-auto w-full" role="img" aria-labelledby="ba-dwg-title ba-dwg-desc">
        <title id="ba-dwg-title">Desenho de conjunto do eixo com mancais, em meio-corte</title>
        <desc id="ba-dwg-desc">
          Vista de frente. Metade de cima em corte: caixas de mancal, rolamentos, vedações, polia e acoplamento hachurados; eixo e chavetas sem
          hachura. Balões de 1 a 10 indicam as peças da lista. Ilustração educativa sem cotas.
        </desc>
        <defs>
          <pattern id="hatchA" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke={THIN} strokeWidth="0.9" />
          </pattern>
          <pattern id="hatchB" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={THIN} strokeWidth="0.9" />
          </pattern>
          <pattern id="hatchC" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke={THIN} strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="660" height="400" fill={PAPER} />

        {/* 1 — chapa de assentamento (vista) */}
        <R x0={-2.75} x1={2.75} y0={BA.floorY} y1={H.footY} stroke={hl(1)} />

        {/* 3 — eixo (não se hachura). Desenhado antes: na metade de baixo (vista) ele fica escondido dentro das caixas e cubos. */}
        <path d={shaftPath} fill={PAPER} stroke={hl(3) || INK} strokeWidth={1.8} />

        {/* 2 — caixas: metade de baixo em vista, metade de cima em corte */}
        {cxs.map((cx) => (
          <g key={cx}>
            <R x0={cx - H.halfW} x1={cx + H.halfW} y0={H.footY} y1={0} fill={PAPER} stroke={hl(2)} />
            {/* paredes da tampa cortadas (acima e abaixo do furo, só na metade de cima) */}
            <R x0={cx - H.halfW} x1={cx + H.halfW} y0={bearing.rOut} y1={H.capTop} fill="url(#hatchA)" stroke={hl(2)} />
          </g>
        ))}
        {/* Linha de junção tampa/base */}
        {cxs.map((cx) => (
          <line key={`j${cx}`} x1={px(cx - H.halfW)} y1={py(0)} x2={px(cx + H.halfW)} y2={py(0)} stroke={INK} strokeWidth={1.6} />
        ))}

        {/* 7 — polia: corte em cima, vista embaixo */}
        <path
          d={`M ${px(pulley.x0)} ${py(shaft.rEnd)} L ${px(pulley.x0)} ${py(pulley.r)} L ${px(pulley.x0 + 0.04)} ${py(pulley.r)} L ${px(pulley.x0 + 0.14)} ${py(0.88)} L ${px(pulley.x0 + 0.22)} ${py(0.88)} L ${px(pulley.x0 + 0.32)} ${py(pulley.r)} L ${px(pulley.x0 + 0.38)} ${py(pulley.r)} L ${px(pulley.x0 + 0.48)} ${py(0.88)} L ${px(pulley.x0 + 0.56)} ${py(0.88)} L ${px(pulley.x0 + 0.66)} ${py(pulley.r)} L ${px(pulley.x1)} ${py(pulley.r)} L ${px(pulley.x1)} ${py(shaft.rEnd)} Z`}
          fill="url(#hatchC)"
          stroke={hl(7) || INK}
          strokeWidth={1.6}
        />
        <R x0={pulley.x0} x1={pulley.x1} y0={-pulley.r} y1={-shaft.rEnd} fill={PAPER} stroke={hl(7)} />
        {[0.14, 0.22, 0.48, 0.56].map((d) => (
          <line key={d} x1={px(pulley.x0 + d)} y1={py(-shaft.rEnd)} x2={px(pulley.x0 + d)} y2={py(-pulley.r)} stroke={THIN} strokeWidth={0.8} />
        ))}

        {/* 8 — acoplamento: cubo em corte em cima, vista embaixo */}
        <R x0={coupling.x0} x1={coupling.x0 + 0.5} y0={shaft.rEnd} y1={coupling.r} fill="url(#hatchB)" stroke={hl(8)} />
        <R x0={coupling.x0 + 0.5} x1={coupling.x1} y0={0.27} y1={0.61} stroke={hl(8)} />
        <R x0={coupling.x0} x1={coupling.x0 + 0.5} y0={-coupling.r} y1={-shaft.rEnd} fill={PAPER} stroke={hl(8)} />
        <R x0={coupling.x0 + 0.5} x1={coupling.x1} y0={-0.61} y1={-0.27} stroke={hl(8)} />


        {/* 10 — chavetas (não se hachuram) */}
        <R x0={-3.07} x1={-2.47} y0={shaft.rEnd - 0.06} y1={shaft.rEnd + 0.08} fill={PAPER} stroke={hl(10)} />
        <R x0={2.51} x1={3.11} y0={shaft.rEnd - 0.06} y1={shaft.rEnd + 0.08} fill={PAPER} stroke={hl(10)} />

        {/* 4 — rolamento de esferas em corte (anéis hachurados, esfera inteira) */}
        <g>
          <R x0={BA.fixedX - 0.18} x1={BA.fixedX + 0.18} y0={0.52} y1={bearing.rOut} fill="url(#hatchB)" stroke={hl(4)} />
          <R x0={BA.fixedX - 0.18} x1={BA.fixedX + 0.18} y0={bearing.rIn} y1={0.4} fill="url(#hatchA)" stroke={hl(4)} />
          <circle cx={px(BA.fixedX)} cy={py(0.46)} r={0.068 * K} fill={PAPER} stroke={hl(4) || INK} strokeWidth={1.4} />
        </g>
        {/* 5 — rolamento de rolos NU em corte: rebordos só no anel externo */}
        <g>
          <path
            d={`M ${px(BA.freeX + 0.02 - 0.2)} ${py(bearing.rOut)} L ${px(BA.freeX + 0.22)} ${py(bearing.rOut)} L ${px(BA.freeX + 0.22)} ${py(0.48)} L ${px(BA.freeX + 0.17)} ${py(0.48)} L ${px(BA.freeX + 0.17)} ${py(0.52)} L ${px(BA.freeX - 0.13)} ${py(0.52)} L ${px(BA.freeX - 0.13)} ${py(0.48)} L ${px(BA.freeX - 0.18)} ${py(0.48)} Z`}
            fill="url(#hatchB)"
            stroke={hl(5) || INK}
            strokeWidth={1.4}
          />
          <R x0={BA.freeX + 0.02 - 0.2} x1={BA.freeX + 0.22} y0={bearing.rIn} y1={0.42} fill="url(#hatchA)" stroke={hl(5)} />
          <R x0={BA.freeX + 0.02 - 0.13} x1={BA.freeX + 0.02 + 0.13} y0={0.42} y1={0.51} fill={PAPER} stroke={hl(5)} sw={1.3} />
        </g>

        {/* 6 — anéis elásticos e 9 — vedações (seções finas: preenchidas) */}
        {[-BA.snapX, BA.snapX + 0.02].map((x) => (
          <R key={`s${x}`} x0={x - 0.022} x1={x + 0.022} y0={shaft.rSeat - 0.02} y1={shaft.rSeat + 0.07} fill={hl(6) || INK} stroke={hl(6)} sw={0.6} />
        ))}
        {[-BA.sealX, BA.sealX].map((x) => (
          <R key={`v${x}`} x0={x - 0.05} x1={x + 0.05} y0={shaft.rSeat} y1={0.56} fill={hl(9) || '#6b7280'} stroke={hl(9)} sw={0.8} />
        ))}

        {/* Linha de centro (traço-ponto) */}
        <line x1={px(-3.45)} y1={py(0)} x2={px(3.45)} y2={py(0)} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="14 3 2 3" />
        {cxs.map((cx) => (
          <line key={`c${cx}`} x1={px(cx)} y1={py(1.2)} x2={px(cx)} y2={py(-1.6)} stroke="#f59e0b" strokeWidth={0.6} strokeDasharray="10 3 2 3" />
        ))}

        {/* Balões */}
        <Balloon n={1} x={0.5} y={-1.35} tx={px(0.9)} ty={py(-1.95)} />
        <Balloon n={2} x={BA.freeX + 0.35} y={-0.6} tx={px(2.5)} ty={py(-1.95)} />
        <Balloon n={3} x={0.4} y={0.2} tx={px(0.4)} ty={py(1.6)} />
        <Balloon n={4} x={BA.fixedX} y={0.46} tx={px(-1.2)} ty={py(2.05)} />
        <Balloon n={5} x={BA.freeX} y={0.47} tx={px(1.25)} ty={py(2.05)} />
        <Balloon n={6} x={-BA.snapX} y={0.36} tx={px(-1.95)} ty={py(2.05)} />
        <Balloon n={7} x={pulley.x0 + 0.5} y={0.95} tx={px(-3.0)} ty={py(2.05)} />
        <Balloon n={8} x={coupling.x0 + 0.2} y={0.5} tx={px(3.0)} ty={py(2.05)} />
        <Balloon n={9} x={BA.sealX} y={0.45} tx={px(2.15)} ty={py(2.05)} />
        <Balloon n={10} x={-2.7} y={shaft.rEnd + 0.04} tx={px(-3.6)} ty={py(1.2)} />

        {/* Carimbo */}
        <g fontSize={10} fill={THIN}>
          <rect x={10} y={338} width={640} height={52} fill="none" stroke={THIN} strokeWidth={0.8} />
          <line x1={430} y1={338} x2={430} y2={390} stroke={THIN} strokeWidth={0.8} />
          <text x={18} y={354} fill={INK} fontWeight={700} fontSize={11}>
            DESENHO DE CONJUNTO — EIXO COM MANCAIS (MEIO-CORTE)
          </text>
          <text x={18} y={369}>Ilustração educativa gerada do modelo 3D · sem cotas nem tolerâncias</text>
          <text x={18} y={383} fill="#fbbf24" fontWeight={700}>
            NÃO USAR PARA FABRICAÇÃO
          </text>
          <text x={438} y={354}>Mecânica Lab · CC0</text>
          <text x={438} y={369}>Escala: ilustrativa (sem escala)</text>
          <text x={438} y={383}>Vista de frente · 1º diedro</text>
        </g>
      </svg>
      {showList && (
        <figcaption className="border-t border-ink-800 p-3">
          <table className="w-full text-left text-xs text-ink-300 sm:text-sm">
            <caption className="sr-only">Lista de peças do desenho de conjunto</caption>
            <thead className="text-ink-400">
              <tr>
                <th className="w-10 py-1 font-semibold">Item</th>
                <th className="py-1 font-semibold">Peça</th>
                <th className="w-10 py-1 font-semibold">Qtd.</th>
                <th className="hidden py-1 font-semibold sm:table-cell">Observação</th>
              </tr>
            </thead>
            <tbody>
              {BEARING_DRAWING_PARTS.map((p) => (
                <tr key={p.n} className={`border-t border-ink-800 ${highlight === p.n ? 'text-accent-text' : ''}`}>
                  <td className="py-1 font-mono">{p.n}</td>
                  <td className="py-1">{p.name}</td>
                  <td className="py-1">{p.qty}</td>
                  <td className="hidden py-1 text-ink-400 sm:table-cell">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-400">
            Convenções usadas: linha grossa = aresta visível; traço-ponto = linha de centro; hachura = material cortado (direções diferentes para peças
            vizinhas); eixo e chavetas não se hachuram em corte longitudinal; peças finas cortadas (vedações, anéis) aparecem preenchidas.
          </p>
        </figcaption>
      )}
    </figure>
  );
};

/** Esquema do acionamento do transportador: caminho do giro e o que muda em cada etapa. */
export const ConveyorDriveSchematic: React.FC = () => {
  const box = (x: number, label: string, sub: string, color: string) => (
    <g>
      <rect x={x} y={70} width={112} height={64} rx={8} fill="#11161c" stroke={color} strokeWidth={1.6} />
      <text x={x + 56} y={98} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>
        {label}
      </text>
      <text x={x + 56} y={116} textAnchor="middle" fontSize={10.5} fill={THIN}>
        {sub}
      </text>
    </g>
  );
  const arrow = (x: number) => (
    <g>
      <line x1={x} y1={102} x2={x + 22} y2={102} stroke={INK} strokeWidth={1.6} />
      <path d={`M ${x + 22} 97 L ${x + 30} 102 L ${x + 22} 107 Z`} fill={INK} />
    </g>
  );
  return (
    <figure className="overflow-hidden rounded-xl border border-ink-700 bg-[#0f1216]" data-testid="drawing-conveyor-drive">
      <svg viewBox="0 0 660 250" className="h-auto w-full" role="img" aria-labelledby="cv-sch-title cv-sch-desc">
        <title id="cv-sch-title">Esquema do acionamento do transportador de correia</title>
        <desc id="cv-sch-desc">
          Motor, redutor, acoplamento, polia de acionamento e correia em sequência. O motor gira rápido com pouco torque; o redutor entrega rotação
          menor com mais torque; a polia arrasta a correia pelo atrito.
        </desc>
        <rect width="660" height="250" fill={PAPER} />
        {box(14, 'Motor', 'energia elétrica → giro', '#2f6d4f')}
        {arrow(128)}
        {box(160, 'Redutor', '↓ rotação · ↑ torque', '#5a6470')}
        {arrow(274)}
        {box(306, 'Acoplamento', 'liga os dois eixos', '#d9a21b')}
        {arrow(420)}
        {box(452, 'Polia', 'arrasta a correia', '#9aa3ab')}
        <line x1={566} y1={102} x2={600} y2={102} stroke={INK} strokeWidth={1.6} />
        <text x={606} y={98} fontSize={12} fill={INK} fontWeight={700}>
          Correia
        </text>
        <text x={606} y={114} fontSize={10} fill={THIN}>
          pelo atrito
        </text>
        {/* faixa de rotação/torque */}
        <g fontSize={11} fill={THIN}>
          <text x={70} y={162} textAnchor="middle">
            rotação alta
          </text>
          <text x={70} y={176} textAnchor="middle">
            torque baixo
          </text>
          <text x={508} y={162} textAnchor="middle">
            rotação baixa
          </text>
          <text x={508} y={176} textAnchor="middle">
            torque alto
          </text>
          <line x1={128} y1={168} x2={448} y2={168} stroke={THIN} strokeWidth={0.8} strokeDasharray="4 4" />
        </g>
        <g fontSize={10} fill={THIN}>
          <rect x={10} y={200} width={640} height={40} fill="none" stroke={THIN} strokeWidth={0.8} />
          <text x={18} y={216} fill={INK} fontWeight={700} fontSize={11}>
            ESQUEMA — CAMINHO DO GIRO NO TRANSPORTADOR
          </text>
          <text x={18} y={231}>Ilustração educativa: sem relação de redução, potência ou velocidade (dependem do projeto).</text>
        </g>
      </svg>
    </figure>
  );
};

/** Tendência simulada de temperatura dos 4 mancais do transportador (comparação, não limite). */
export const BearingTempTrend: React.FC = () => {
  // Valores SIMULADOS, em graus acima da temperatura ambiente: servem só para mostrar a tendência.
  const weeks = [1, 2, 3, 4, 5, 6];
  const others = [
    { name: 'Cauda, lado A', v: [9, 10, 9, 10, 9, 10] },
    { name: 'Cauda, lado B', v: [8, 9, 9, 8, 9, 9] },
    { name: 'Cabeça, lado livre', v: [11, 11, 12, 11, 12, 11] }
  ];
  const suspect = { name: 'Cabeça, lado do acoplamento', v: [11, 12, 15, 18, 22, 27] };
  const W = 560;
  const Hh = 220;
  const L = 52;
  const T = 16;
  const pw = W - L - 150;
  const ph = Hh - T - 40;
  const x = (w: number) => L + ((w - 1) / 5) * pw;
  const y = (v: number) => T + ph - (v / 30) * ph;
  const path = (v: number[]) => v.map((d, i) => `${i ? 'L' : 'M'} ${x(weeks[i])} ${y(d)}`).join(' ');
  return (
    <figure className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-2" data-testid="figure-temp-trend">
      <svg viewBox={`0 0 ${W} ${Hh}`} className="h-auto w-full" role="img" aria-labelledby="tt-title tt-desc">
        <title id="tt-title">Tendência de temperatura dos mancais (valores simulados)</title>
        <desc id="tt-desc">
          Em seis semanas, três mancais ficam estáveis e o mancal da cabeça, lado do acoplamento, sobe semana após semana. Os valores são simulados,
          em graus acima do ambiente, e não representam limites reais.
        </desc>
        {[0, 10, 20, 30].map((t) => (
          <g key={t}>
            <line x1={L} x2={L + pw} y1={y(t)} y2={y(t)} stroke="#2a2f36" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#9ca3af">
              {t}
            </text>
          </g>
        ))}
        {weeks.map((w) => (
          <text key={w} x={x(w)} y={T + ph + 18} textAnchor="middle" fontSize={11} fill="#9ca3af">
            S{w}
          </text>
        ))}
        <text x={L} y={Hh - 4} fontSize={10.5} fill="#9ca3af">
          Semana da ronda · eixo vertical: °C acima do ambiente (simulado)
        </text>
        {others.map((o) => (
          <path key={o.name} d={path(o.v)} fill="none" stroke="#6b7280" strokeWidth={2} strokeLinejoin="round" />
        ))}
        <path d={path(suspect.v)} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" />
        {[...others, suspect].map((s) =>
          s.v.map((d, i) => (
            <circle key={`${s.name}${i}`} cx={x(weeks[i])} cy={y(d)} r={s === suspect ? 4.5 : 3.5} fill={s === suspect ? '#f97316' : '#6b7280'} stroke="#0b0d10" strokeWidth={2}>
              <title>{`${s.name} · semana ${weeks[i]}: ${d} °C acima do ambiente (simulado)`}</title>
            </circle>
          ))
        )}
        <text x={L + pw + 10} y={y(27) + 4} fontSize={11.5} fill="#e5e7eb" fontWeight={700}>
          Cabeça, lado do
        </text>
        <text x={L + pw + 10} y={y(27) + 18} fontSize={11.5} fill="#e5e7eb" fontWeight={700}>
          acoplamento
        </text>
        <text x={L + pw + 10} y={y(10) + 4} fontSize={11} fill="#9ca3af">
          Outros 3 mancais
        </text>
      </svg>
      <details className="px-2 pb-1 text-xs text-ink-300">
        <summary className="cursor-pointer text-ink-400">Ver os valores em tabela</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-ink-400">
              <th className="py-0.5 font-semibold">Mancal</th>
              {weeks.map((w) => (
                <th key={w} className="py-0.5 font-semibold">
                  S{w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[suspect, ...others].map((s) => (
              <tr key={s.name} className="border-t border-ink-800">
                <td className="py-0.5">{s.name}</td>
                {s.v.map((d, i) => (
                  <td key={i} className="py-0.5 font-mono">
                    {d}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};

/** Tendência de vibração no acionamento do transportador (valores simulados, sem unidade nem limites reais). */
export const VibrationTrend: React.FC = () => {
  // Índice SIMULADO (sem unidade): serve só para comparar tendência entre pontos medidos do mesmo jeito.
  const weeks = [1, 2, 3, 4, 5, 6];
  const stable = [
    { name: 'Motor, lado do redutor', v: [2.0, 2.1, 2.0, 2.1, 2.0, 2.1] },
    { name: 'Motor, lado do ventilador', v: [1.8, 1.9, 1.8, 1.8, 1.9, 1.8] }
  ];
  const spike = { name: 'Redutor, entrada', v: [2.2, 2.3, 4.6, 2.3, 2.2, 2.3] };
  const rising = { name: 'Redutor, saída', v: [2.0, 2.2, 2.5, 2.9, 3.4, 4.0] };
  const W = 560;
  const Hh = 230;
  const L = 44;
  const T = 16;
  const pw = W - L - 150;
  const ph = Hh - T - 42;
  const x = (w: number) => L + ((w - 1) / 5) * pw;
  const y = (v: number) => T + ph - (v / 5) * ph;
  const path = (v: number[]) => v.map((d, i) => `${i ? 'L' : 'M'} ${x(weeks[i])} ${y(d)}`).join(' ');
  const series = [
    ...stable.map((s) => ({ ...s, color: '#6b7280', width: 2, r: 3.5 })),
    { ...spike, color: '#60a5fa', width: 2, r: 3.5 },
    { ...rising, color: '#f97316', width: 2.5, r: 4.5 }
  ];
  return (
    <figure className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950 p-2" data-testid="figure-vibration-trend">
      <svg viewBox={`0 0 ${W} ${Hh}`} className="h-auto w-full" role="img" aria-labelledby="vt-title vt-desc">
        <title id="vt-title">Tendência de vibração no acionamento (valores simulados)</title>
        <desc id="vt-desc">
          Em seis semanas, os dois pontos do motor ficam estáveis. A entrada do redutor tem um único valor alto na semana 3 e depois volta ao normal.
          A saída do redutor sobe semana após semana. Índice simulado, sem unidade e sem limites reais.
        </desc>
        {[0, 1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line x1={L} x2={L + pw} y1={y(t)} y2={y(t)} stroke="#2a2f36" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#9ca3af">
              {t}
            </text>
          </g>
        ))}
        {weeks.map((w) => (
          <text key={w} x={x(w)} y={T + ph + 18} textAnchor="middle" fontSize={11} fill="#9ca3af">
            S{w}
          </text>
        ))}
        <text x={L} y={Hh - 4} fontSize={10.5} fill="#9ca3af">
          Semana da ronda · eixo vertical: índice de vibração (simulado, sem unidade)
        </text>
        {series.map((s) => (
          <path key={s.name} d={path(s.v)} fill="none" stroke={s.color} strokeWidth={s.width} strokeLinejoin="round" />
        ))}
        {series.map((s) =>
          s.v.map((d, i) => (
            <circle key={`${s.name}${i}`} cx={x(weeks[i])} cy={y(d)} r={s.r} fill={s.color} stroke="#0b0d10" strokeWidth={2}>
              <title>{`${s.name} · semana ${weeks[i]}: ${d.toFixed(1)} (simulado)`}</title>
            </circle>
          ))
        )}
        <text x={x(3) + 10} y={y(4.6) + 4} fontSize={11} fill="#93c5fd" fontWeight={700}>
          Redutor, entrada (S3)
        </text>
        <text x={L + pw + 10} y={y(4.0) + 4} fontSize={11.5} fill="#e5e7eb" fontWeight={700}>
          Redutor, saída
        </text>
        <text x={L + pw + 10} y={y(2.2) + 4} fontSize={11} fill="#9ca3af">
          Motor (2 pontos) e
        </text>
        <text x={L + pw + 10} y={y(2.2) + 18} fontSize={11} fill="#9ca3af">
          redutor, entrada
        </text>
      </svg>
      <details className="px-2 pb-1 text-xs text-ink-300">
        <summary className="cursor-pointer text-ink-400">Ver os valores em tabela</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-ink-400">
              <th className="py-0.5 font-semibold">Ponto</th>
              {weeks.map((w) => (
                <th key={w} className="py-0.5 font-semibold">
                  S{w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[rising, spike, ...stable].map((s) => (
              <tr key={s.name} className="border-t border-ink-800">
                <td className="py-0.5">{s.name}</td>
                {s.v.map((d, i) => (
                  <td key={i} className="py-0.5 font-mono">
                    {d.toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
};

/** Vista de cima (esquema) de uma correia desalinhada na cauda. */
export const BeltDriftFigure: React.FC = () => (
  <figure className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950" data-testid="figure-belt-drift">
    <svg viewBox="0 0 560 200" className="h-auto w-full" role="img" aria-labelledby="bd-title">
      <title id="bd-title">
        Vista de cima: a correia está centrada perto da polia de acionamento e se desloca para um lado perto da polia de retorno, raspando na
        estrutura; o rolo de retorno da cauda tem material grudado em uma ponta.
      </title>
      <rect x={30} y={40} width={500} height={10} fill="#3f5f7f" />
      <rect x={30} y={150} width={500} height={10} fill="#3f5f7f" />
      <path d="M 70 72 L 500 62 L 500 138 L 70 128 Z" fill="none" />
      <path d="M 500 62 L 120 54 L 70 52 L 70 120 L 120 122 L 500 138 Z" fill="#2b2d31" stroke="#9ca3af" strokeWidth={1} />
      <rect x={496} y={56} width={18} height={88} fill="#c8ccd2" />
      <rect x={52} y={46} width={18} height={108} fill="#c8ccd2" />
      <text x={505} y={176} textAnchor="middle" fontSize={11} fill="#9ca3af">
        Polia de acionamento
      </text>
      <text x={62} y={176} textAnchor="middle" fontSize={11} fill="#9ca3af">
        Polia de retorno
      </text>
      <g stroke="#f97316" strokeWidth={2}>
        <line x1={80} y1={50} x2={88} y2={42} />
        <line x1={96} y1={50} x2={104} y2={42} />
        <line x1={112} y1={51} x2={120} y2={43} />
      </g>
      <text x={130} y={34} fontSize={11.5} fill="#f97316" fontWeight={700}>
        borda raspando e desfiando
      </text>
      <circle cx={100} cy={136} r={9} fill="#b9895a" />
      <text x={116} y={140} fontSize={11} fill="#e5e7eb">
        material grudado no rolo de retorno (embaixo)
      </text>
      <path d="M 300 92 L 230 82" stroke="#e5e7eb" strokeWidth={1.4} markerEnd="url(#bd-arrow)" />
      <defs>
        <marker id="bd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#e5e7eb" />
        </marker>
      </defs>
      <text x={310} y={96} fontSize={11} fill="#e5e7eb">
        a correia "anda" para este lado
      </text>
    </svg>
  </figure>
);

/** Esquema da linha de sucção restringida (filtro sujo, válvula estrangulada). */
export const PumpSuctionFigure: React.FC = () => (
  <figure className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950" data-testid="figure-pump-suction">
    <svg viewBox="0 0 560 190" className="h-auto w-full" role="img" aria-labelledby="ps-title">
      <title id="ps-title">
        Esquema: reservatório, filtro de sucção sujo, válvula de sucção parcialmente fechada, bomba centrífuga e válvula de descarga. As restrições
        estão na sucção.
      </title>
      <rect x={18} y={60} width={80} height={100} rx={4} fill="none" stroke="#9ca3af" strokeWidth={1.5} />
      <rect x={20} y={95} width={76} height={63} fill="#1e3a5f" />
      <text x={58} y={178} textAnchor="middle" fontSize={11} fill="#9ca3af">
        Reservatório
      </text>
      <line x1={98} y1={130} x2={340} y2={130} stroke="#9ca3af" strokeWidth={6} />
      <rect x={140} y={114} width={40} height={32} fill="#5b4a2f" stroke="#f97316" strokeWidth={2} />
      <text x={160} y={102} textAnchor="middle" fontSize={11} fill="#f97316" fontWeight={700}>
        filtro sujo
      </text>
      <path d="M 230 116 L 260 144 L 260 116 L 230 144 Z" fill="#11161c" stroke="#f97316" strokeWidth={2} />
      <line x1={245} y1={130} x2={245} y2={104} stroke="#f97316" strokeWidth={2} />
      <text x={245} y={96} textAnchor="middle" fontSize={11} fill="#f97316" fontWeight={700}>
        válvula de sucção meio fechada
      </text>
      <circle cx={370} cy={130} r={30} fill="#35587a" stroke="#9ca3af" strokeWidth={1.5} />
      <text x={370} y={178} textAnchor="middle" fontSize={11} fill="#9ca3af">
        Bomba
      </text>
      <line x1={370} y1={100} x2={370} y2={50} stroke="#9ca3af" strokeWidth={6} />
      <line x1={370} y1={50} x2={540} y2={50} stroke="#9ca3af" strokeWidth={6} />
      <path d="M 450 36 L 480 64 L 480 36 L 450 64 Z" fill="#11161c" stroke="#9ca3af" strokeWidth={1.5} />
      <text x={465} y={84} textAnchor="middle" fontSize={11} fill="#9ca3af">
        válvula de descarga
      </text>
      <text x={18} y={24} fontSize={11.5} fill="#e5e7eb" fontWeight={700}>
        ESQUEMA (sem escala) — linha de sucção restringida
      </text>
    </svg>
  </figure>
);

/**
 * Esquema do acionamento motor + acoplamento + redutor de um estágio, em vista lateral simplificada.
 * Gerado das constantes do modelo 3D (número de dentes e módulo): diâmetros primitivos e distância entre centros
 * na escala do modelo. Sem cotas: a relação é a do modelo educacional, não de um produto.
 */
export const MotorGearboxSchematic: React.FC = () => {
  const S2 = 80;
  const yIn = 205;
  const r1 = ((MG_MODULE * MG_TEETH.pinion) / 2) * S2;
  const r2 = ((MG_MODULE * MG_TEETH.gear) / 2) * S2;
  const yOut = yIn - (r1 + r2);
  const gx0 = 336;
  const gx1 = 362;
  const BLUE = '#60a5fa';
  /** Seta curva em volta de um eixo horizontal: `down` = a parte da frente desce. */
  const spin = (x: number, y: number, down: boolean) => (
    <g stroke={BLUE} fill="none" strokeWidth={1.6}>
      <ellipse cx={x} cy={y} rx={7} ry={17} strokeDasharray="3 3" stroke={THIN} strokeWidth={0.8} />
      <path d={`M ${x + 2} ${y - 17} A 7 17 0 0 1 ${x + 2} ${y + 17}`} />
      <path
        d={down ? `M ${x - 3} ${y + 11} L ${x + 2} ${y + 18} L ${x + 7} ${y + 11}` : `M ${x - 3} ${y - 11} L ${x + 2} ${y - 18} L ${x + 7} ${y - 11}`}
        fill={BLUE}
        stroke="none"
      />
    </g>
  );
  return (
    <figure className="overflow-hidden rounded-xl border border-ink-700 bg-[#0f1216]" data-testid="drawing-motor-gearbox">
      <svg viewBox="0 0 660 330" className="h-auto w-full" role="img" aria-labelledby="mg-sch-title mg-sch-desc">
        <title id="mg-sch-title">Esquema do acionamento: motor, acoplamento e redutor de um estágio</title>
        <desc id="mg-sch-desc">
          {`Vista lateral simplificada. O eixo do motor passa pelo acoplamento até o eixo de entrada do redutor, onde está o pinhão de ${MG_TEETH.pinion} dentes. O pinhão engrena na coroa de ${MG_TEETH.gear} dentes, no eixo de saída, mais acima. Relação ${MG_TEETH.gear} ÷ ${MG_TEETH.pinion} ≈ ${MG_RATIO_TEXT}: a saída gira mais devagar e no sentido contrário.`}
        </desc>
        <rect width="660" height="330" fill={PAPER} />
        {/* Motor */}
        <rect x={20} y={yIn - 40} width={128} height={80} rx={6} fill="#11161c" stroke="#2f6d4f" strokeWidth={1.6} />
        <text x={84} y={yIn - 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>
          Motor
        </text>
        <text x={84} y={yIn + 13} textAnchor="middle" fontSize={10} fill={THIN}>
          rotação n₁
        </text>
        {/* Linhas de centro dos eixos */}
        <line x1={14} x2={560} y1={yIn} y2={yIn} stroke={THIN} strokeWidth={0.7} strokeDasharray="14 3 2 3" />
        <line x1={300} x2={640} y1={yOut} y2={yOut} stroke={THIN} strokeWidth={0.7} strokeDasharray="14 3 2 3" />
        {/* Eixos */}
        <line x1={148} x2={205} y1={yIn} y2={yIn} stroke={INK} strokeWidth={3} />
        <line x1={221} x2={382} y1={yIn} y2={yIn} stroke={INK} strokeWidth={3} />
        <line x1={318} x2={600} y1={yOut} y2={yOut} stroke={INK} strokeWidth={3.5} />
        {/* Acoplamento */}
        <rect x={196} y={yIn - 16} width={10} height={32} fill="#11161c" stroke="#d9a21b" strokeWidth={1.6} />
        <rect x={208} y={yIn - 16} width={10} height={32} fill="#11161c" stroke="#d9a21b" strokeWidth={1.6} />
        <text x={207} y={yIn + 32} textAnchor="middle" fontSize={10} fill={THIN}>
          acoplamento
        </text>
        {/* Carcaça do redutor (contorno tracejado: o interior aparece) */}
        <rect x={308} y={yOut - r2 - 14} width={84} height={yIn - yOut + r2 + r1 + 28} rx={4} fill="none" stroke="#5a6470" strokeWidth={1.4} strokeDasharray="6 4" />
        <text x={350} y={yIn + r1 + 28} textAnchor="middle" fontSize={10} fill={THIN}>
          redutor
        </text>
        {/* Pinhão e coroa (diâmetros primitivos em escala do modelo) */}
        <rect x={gx0} y={yIn - r1} width={gx1 - gx0} height={r1 * 2} fill="#1b2128" stroke={INK} strokeWidth={1.6} />
        <rect x={gx0} y={yOut - r2} width={gx1 - gx0} height={r2 * 2} fill="#1b2128" stroke={INK} strokeWidth={1.6} />
        <text x={300} y={yIn + 30} textAnchor="end" fontSize={11} fill={INK} fontWeight={700}>
          pinhão
        </text>
        <text x={300} y={yIn + 43} textAnchor="end" fontSize={10} fill={THIN}>
          {`z₁ = ${MG_TEETH.pinion}`}
        </text>
        <text x={398} y={yOut - 40} fontSize={11} fill={INK} fontWeight={700}>
          coroa
        </text>
        <text x={398} y={yOut - 26} fontSize={10} fill={THIN}>
          {`z₂ = ${MG_TEETH.gear}`}
        </text>
        {/* Sentidos de giro */}
        {spin(262, yIn, true)}
        <text x={262} y={yIn - 24} textAnchor="middle" fontSize={11} fill={BLUE} fontWeight={700}>
          n₁
        </text>
        {spin(470, yOut, false)}
        <text x={470} y={yOut - 24} textAnchor="middle" fontSize={11} fill={BLUE} fontWeight={700}>
          n₂
        </text>
        <text x={604} y={yOut + 4} fontSize={11} fill={INK}>
          máquina
        </text>
        {/* Quadro de relações */}
        <g fontSize={11} fill={INK}>
          <rect x={418} y={160} width={232} height={92} fill="#11161c" stroke={THIN} strokeWidth={0.8} />
          <text x={428} y={180} fontWeight={700}>
            {`i = z₂ ÷ z₁ = ${MG_TEETH.gear} ÷ ${MG_TEETH.pinion} ≈ ${MG_RATIO_TEXT}`}
          </text>
          <text x={428} y={199}>n₂ = n₁ ÷ i, no sentido contrário</text>
          <text x={428} y={218}>torque na saída ≈ torque na entrada × i,</text>
          <text x={428} y={235} fill={THIN}>
            menos as perdas
          </text>
        </g>
        <g fontSize={10} fill={THIN}>
          <rect x={10} y={276} width={640} height={44} fill="none" stroke={THIN} strokeWidth={0.8} />
          <text x={18} y={293} fill={INK} fontWeight={700} fontSize={11}>
            ESQUEMA — MOTOR, ACOPLAMENTO E REDUTOR DE UM ESTÁGIO (VISTA LATERAL SIMPLIFICADA)
          </text>
          <text x={18} y={309}>
            Gerado do modelo 3D: diâmetros primitivos e distância entre centros em escala. Sem cotas; relação do modelo, não de um produto.
          </text>
        </g>
      </svg>
    </figure>
  );
};

const DP_BLUE = '#60a5fa';
const DP_AIR = '#f59e0b';

/** Seta de fluxo para cima, de y0 até y1 (y1 < y0). */
const FlowUp: React.FC<{ x: number; y0: number; y1: number }> = ({ x, y0, y1 }) => (
  <g stroke={DP_BLUE} strokeWidth={2} fill={DP_BLUE}>
    <line x1={x} x2={x} y1={y0} y2={y1 + 7} />
    <path d={`M ${x - 5} ${y1 + 8} L ${x} ${y1} L ${x + 5} ${y1 + 8} Z`} stroke="none" />
  </g>
);

/** Válvula de esfera: sede em `y`; aberta = esfera levantada e vazada. */
const BallValve: React.FC<{ x: number; y: number; open: boolean }> = ({ x, y, open }) => (
  <g>
    <line x1={x - 13} x2={x - 6} y1={y} y2={y} stroke={INK} strokeWidth={2} />
    <line x1={x + 6} x2={x + 13} y1={y} y2={y} stroke={INK} strokeWidth={2} />
    <circle cx={x} cy={open ? y - 15 : y - 5} r={6} fill={open ? '#11161c' : '#ece8dd'} stroke="#ece8dd" strokeWidth={1.4} />
  </g>
);

/** Um curso da bomba de diafragma. dir = 1: eixo indo para a direita (direita em descarga, esquerda em sucção). */
const DiaphragmStroke: React.FC<{ ox: number; dir: 1 | -1 }> = ({ ox, dir }) => {
  const rimL = ox + 120;
  const rimR = ox + 200;
  const rightOut = dir === 1;
  const cL = rightOut ? rimL + 14 : rimL - 36;
  const cR = rightOut ? rimR + 36 : rimR - 14;
  const midL = (rimL + cL) / 2;
  const midR = (rimR + cR) / 2;
  const vxL = ox + 78;
  const vxR = ox + 242;
  const leftSuction = dir === 1;
  return (
    <g>
      <text x={ox + 160} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK}>
        {dir === 1 ? 'Curso 1: eixo vai para a direita' : 'Curso 2: eixo vai para a esquerda'}
      </text>
      {/* Coletores de saída (em cima) e de entrada (embaixo) */}
      <line x1={vxL} x2={vxR} y1={44} y2={44} stroke={INK} strokeWidth={2} />
      <line x1={vxL} x2={vxR} y1={258} y2={258} stroke={INK} strokeWidth={2} />
      <FlowUp x={ox + 160} y0={44} y1={28} />
      <FlowUp x={ox + 160} y0={286} y1={260} />
      <text x={ox + 168} y={34} fontSize={9.5} fill={THIN}>
        saída
      </text>
      <text x={ox + 168} y={282} fontSize={9.5} fill={THIN}>
        entrada
      </text>
      {[vxL, vxR].map((x) => (
        <g key={x} stroke={INK} strokeWidth={1.4}>
          <line x1={x} x2={x} y1={44} y2={92} />
          <line x1={x} x2={x} y1={208} y2={258} />
        </g>
      ))}
      {/* Câmaras de líquido */}
      <path d={`M ${rimL} 86 C ${ox + 40} 86, ${ox + 40} 214, ${rimL} 214`} fill="#0d1a26" stroke={INK} strokeWidth={1.6} />
      <path d={`M ${rimR} 86 C ${ox + 280} 86, ${ox + 280} 214, ${rimR} 214`} fill="#0d1a26" stroke={INK} strokeWidth={1.6} />
      {/* Corpo central (lado do ar) */}
      <rect x={rimL} y={86} width={rimR - rimL} height={128} fill="#16202b" stroke="#35587a" strokeWidth={1.6} />
      <text x={ox + 160} y={204} textAnchor="middle" fontSize={9.5} fill={THIN}>
        corpo central
      </text>
      {/* Ar empurrando o diafragma do lado em descarga */}
      <text x={rightOut ? rimR - 22 : rimL + 22} y={124} textAnchor="middle" fontSize={10} fontWeight={700} fill={DP_AIR}>
        AR
      </text>
      <path
        d={
          rightOut
            ? `M ${rimR - 30} 132 L ${rimR - 8} 132 M ${rimR - 13} 127 L ${rimR - 8} 132 L ${rimR - 13} 137`
            : `M ${rimL + 30} 132 L ${rimL + 8} 132 M ${rimL + 13} 127 L ${rimL + 8} 132 L ${rimL + 13} 137`
        }
        stroke={DP_AIR}
        strokeWidth={1.8}
        fill="none"
      />
      {/* Diafragmas e eixo */}
      <path d={`M ${rimL} 90 Q ${cL} 150, ${rimL} 210`} fill="none" stroke="#9ca3af" strokeWidth={3} />
      <path d={`M ${rimR} 90 Q ${cR} 150, ${rimR} 210`} fill="none" stroke="#9ca3af" strokeWidth={3} />
      <line x1={midL} x2={midR} y1={150} y2={150} stroke={INK} strokeWidth={3} />
      <path
        d={dir === 1 ? `M ${ox + 168} 145 L ${ox + 176} 150 L ${ox + 168} 155` : `M ${ox + 152} 145 L ${ox + 144} 150 L ${ox + 152} 155`}
        stroke={INK}
        strokeWidth={2}
        fill="none"
      />
      {/* Válvulas: em cima (descarga) e embaixo (sucção) */}
      <BallValve x={vxL} y={72} open={!leftSuction} />
      <BallValve x={vxL} y={240} open={leftSuction} />
      <BallValve x={vxR} y={72} open={leftSuction} />
      <BallValve x={vxR} y={240} open={!leftSuction} />
      {/* Fluxo ativo */}
      {leftSuction ? <FlowUp x={vxL - 22} y0={250} y1={200} /> : <FlowUp x={vxL - 22} y0={100} y1={52} />}
      {leftSuction ? <FlowUp x={vxR + 22} y0={100} y1={52} /> : <FlowUp x={vxR + 22} y0={250} y1={200} />}
      <text x={ox + 160} y={306} textAnchor="middle" fontSize={10.5} fill={THIN}>
        {dir === 1 ? 'Esquerda aspira · direita empurra' : 'Esquerda empurra · direita aspira'}
      </text>
    </g>
  );
};

/** Esquema de fluxo da bomba de duplo diafragma nos dois cursos (ilustração educativa, fora de escala). */
export const DiaphragmFlowSchematic: React.FC = () => (
  <figure className="overflow-hidden rounded-xl border border-ink-700 bg-[#0f1216]" data-testid="drawing-diaphragm-flow">
    <svg viewBox="0 0 660 370" className="h-auto w-full" role="img" aria-labelledby="dp-sch-title dp-sch-desc">
      <title id="dp-sch-title">Esquema de fluxo da bomba de duplo diafragma</title>
      <desc id="dp-sch-desc">
        Dois cursos lado a lado. No curso 1 o eixo vai para a direita: o ar empurra o diafragma direito, a câmara direita manda o líquido para cima pela
        válvula de descarga aberta, enquanto a câmara esquerda aspira pela válvula de sucção de baixo. No curso 2 acontece o contrário. O líquido sempre
        entra por baixo e sai por cima.
      </desc>
      <rect width="660" height="370" fill={PAPER} />
      <DiaphragmStroke ox={10} dir={1} />
      <line x1={330} x2={330} y1={10} y2={312} stroke="#2a2f36" strokeWidth={1} />
      <DiaphragmStroke ox={330} dir={-1} />
      <g fontSize={10} fill={THIN}>
        <rect x={10} y={318} width={640} height={44} fill="none" stroke={THIN} strokeWidth={0.8} />
        <text x={18} y={335} fill={INK} fontWeight={700} fontSize={11}>
          ESQUEMA — FLUXO NA BOMBA DE DUPLO DIAFRAGMA
        </text>
        <text x={18} y={351}>
          Ilustração educativa: esfera branca = válvula fechada na sede; esfera vazada e levantada = válvula aberta. Fora de escala.
        </text>
      </g>
    </svg>
  </figure>
);
