import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { ProgressBar } from '../ui';
import { CheckCircle2, Lightbulb, RotateCcw, ArrowRight } from 'lucide-react';

/**
 * Treino de leitura do micrômetro externo de 0–25 mm (fuso de passo 0,5 mm, tambor com 50 divisões → 0,01 mm).
 * Leitura = milímetros da escala de cima da bainha + 0,50 mm se o traço de meio milímetro (escala de baixo)
 * já apareceu + divisão do tambor alinhada com a linha de referência × 0,01 mm.
 */

interface MicrometerChallenge {
  id: string;
  partName: string;
  context: string;
  targetMm: number;
  options: number[];
}

// Peças de exemplo com medidas didáticas (não são cotas de um equipamento específico).
export const MICROMETER_CHALLENGES: MicrometerChallenge[] = [
  { id: 'micro-pino', partName: 'Diâmetro de um pino-guia', context: 'Tampa do redutor', targetMm: 7.38, options: [7.38, 7.88, 7.83, 8.38] },
  { id: 'micro-calco', partName: 'Espessura de um calço de ajuste', context: 'Alinhamento do motor', targetMm: 2.65, options: [2.15, 2.65, 2.56, 3.15] },
  { id: 'micro-bucha', partName: 'Diâmetro externo de uma bucha', context: 'Mancal de deslizamento', targetMm: 12.47, options: [11.97, 12.47, 12.97, 12.74] },
  { id: 'micro-colo', partName: 'Diâmetro do colo do eixo, onde assenta o rolamento', context: 'Eixo da bomba', targetMm: 19.98, options: [19.48, 19.98, 20.48, 19.89] }
];

export const micrometerTask = (id: string) => `task-micrometer-${id}`;

const fmt = (mm: number) => `${mm.toFixed(2).replace('.', ',')} mm`;
const INK = '#1d1e1b';
const PAPER = '#f4f3ef';
const ACCENT = '#e8590c';
const PX = 26; // pixels por milímetro na bainha
const ZERO_X = 70;
const REF_Y = 112;

function decompose(mm: number) {
  const hundredths = Math.round(mm * 100);
  const whole = Math.floor(hundredths / 100);
  const half = hundredths % 100 >= 50;
  const thimble = hundredths % 50;
  return { whole, half, thimble };
}

export const MicrometerScales: React.FC<{ mm: number; highlight: boolean }> = ({ mm, highlight }) => {
  const { whole, half, thimble } = decompose(mm);
  const edgeX = ZERO_X + mm * PX;
  return (
    <svg viewBox="0 0 820 230" role="img" aria-label="Escalas do micrômetro: bainha com a linha de referência e tambor graduado" className="h-auto w-full min-w-[620px]" style={{ background: PAPER }}>
      {/* Bainha (escala fixa) */}
      <rect x="30" y="80" width="770" height="64" fill="#fff" stroke={INK} strokeWidth="1.5" rx="3" />
      <line x1="30" y1={REF_Y} x2="800" y2={REF_Y} stroke={INK} strokeWidth="1.4" />
      <text x="40" y="212" fill="#6e706a" fontSize="11" fontFamily="Inter, sans-serif">
        Bainha: mm em cima, meio mm embaixo
      </text>
      {Array.from({ length: 26 }).map((_, n) => {
        const x = ZERO_X + n * PX;
        const isWhole = highlight && n === whole;
        return (
          <g key={`mm-${n}`}>
            <line x1={x} y1={REF_Y} x2={x} y2={REF_Y - (n % 5 === 0 ? 22 : 14)} stroke={isWhole ? ACCENT : INK} strokeWidth={isWhole ? 2.6 : 1.2} />
            {n % 5 === 0 && (
              <text x={x} y={REF_Y - 26} textAnchor="middle" fill={INK} fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">
                {n}
              </text>
            )}
          </g>
        );
      })}
      {Array.from({ length: 25 }).map((_, n) => {
        const x = ZERO_X + (n + 0.5) * PX;
        const isHalf = highlight && half && n === whole;
        return <line key={`h-${n}`} x1={x} y1={REF_Y} x2={x} y2={REF_Y + 13} stroke={isHalf ? ACCENT : INK} strokeWidth={isHalf ? 2.6 : 1.2} />;
      })}

      {/* Tambor: cobre a bainha a partir da aresta chanfrada */}
      <polygon points={`${edgeX},62 ${edgeX + 34},44 820,44 820,186 ${edgeX + 34},186 ${edgeX},162`} fill="#dcdad2" stroke={INK} strokeWidth="1.5" />
      <rect x={edgeX + 34} y="44" width={Math.max(0, 786 - edgeX)} height="142" fill="url(#knurl)" opacity="0.18" />
      <defs>
        <pattern id="knurl" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0" stroke={INK} strokeWidth="0.8" />
        </pattern>
      </defs>
      {Array.from({ length: 11 }).map((_, i) => {
        const k = i - 5;
        const v = (((thimble + k) % 50) + 50) % 50;
        const y = REF_Y - k * 9.5;
        const major = v % 5 === 0;
        const hit = highlight && k === 0;
        return (
          <g key={`t-${k}`}>
            <line x1={edgeX} y1={y} x2={edgeX + (major ? 22 : 14)} y2={y} stroke={hit ? ACCENT : INK} strokeWidth={hit ? 2.6 : 1.1} />
            {major && (
              <text x={edgeX + 26} y={y + 4} fill={hit ? ACCENT : INK} fontSize="11" fontWeight={hit ? 700 : 500} fontFamily="Inter, sans-serif">
                {v}
              </text>
            )}
          </g>
        );
      })}
      {highlight && !(thimble % 5 === 0) && (
        <text x={edgeX + 26} y={REF_Y + 4} fill={ACCENT} fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
          {thimble}
        </text>
      )}
      <text x={Math.min(Math.max(edgeX + 60, 300), 600)} y="212" fill="#6e706a" fontSize="11" fontFamily="Inter, sans-serif">
        Tambor: 50 divisões; cada uma = 0,01 mm
      </text>
    </svg>
  );
};

const ReadingBreakdown: React.FC<{ mm: number }> = ({ mm }) => {
  const { whole, half, thimble } = decompose(mm);
  const t = (thimble / 100).toFixed(2).replace('.', ',');
  return (
    <ol className="space-y-1 text-sm text-ink-200">
      <li>
        1. Na escala de cima da bainha, o último traço visível é <strong>{whole} mm</strong>.
      </li>
      <li>
        2. Na escala de baixo, {half ? 'já aparece o traço de meio milímetro depois dele:' : 'ainda não aparece o traço de meio milímetro depois dele:'}{' '}
        <strong>+ {half ? '0,50' : '0,00'} mm</strong>.
      </li>
      <li>
        3. No tambor, a divisão alinhada com a linha de referência é a <strong>{thimble}</strong>: {thimble} × 0,01 = <strong>{t} mm</strong>.
      </li>
      <li>
        4. Leitura: {whole} + {half ? '0,50' : '0,00'} + {t} = <strong className="text-ink-100">{fmt(mm)}</strong>
      </li>
    </ol>
  );
};

export const MicrometerTrainer: React.FC = () => {
  const { playerProfile, completeTask } = useGameState();
  const [mode, setMode] = useState<'desafio' | 'explorar'>('desafio');
  const [idx, setIdx] = useState(() => {
    const firstOpen = MICROMETER_CHALLENGES.findIndex((c) => !playerProfile.completedTasks.includes(micrometerTask(c.id)));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [freeMm, setFreeMm] = useState(6.27);

  const solved = MICROMETER_CHALLENGES.filter((c) => playerProfile.completedTasks.includes(micrometerTask(c.id))).length;
  const challenge = MICROMETER_CHALLENGES[idx];
  const answered = picked !== null;
  const correct = picked === challenge.targetMm;

  const choose = (opt: number) => {
    setPicked(opt);
    if (opt === challenge.targetMm) completeTask(micrometerTask(challenge.id), `Leitura do micrômetro: ${challenge.partName}`, 30);
  };
  const goTo = (i: number) => {
    setIdx(i);
    setPicked(null);
    setShowHint(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Modo do treino" className="inline-flex rounded-lg border border-ink-800 bg-ink-900 p-1">
          {(['desafio', 'explorar'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === m ? 'bg-ink-800 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}
            >
              {m === 'desafio' ? 'Desafio de leitura' : 'Explorar livremente'}
            </button>
          ))}
        </div>
        <div className="w-48">
          <p className="mb-1 text-xs text-ink-400">
            {solved} de {MICROMETER_CHALLENGES.length} leituras certas
          </p>
          <ProgressBar value={solved} max={MICROMETER_CHALLENGES.length} label="Leituras certas no micrômetro" />
        </div>
      </div>

      {mode === 'desafio' ? (
        <section className="card space-y-4 p-5" aria-labelledby="micro-title">
          <div>
            <p className="eyebrow">
              Peça {idx + 1} de {MICROMETER_CHALLENGES.length} · {challenge.context}
            </p>
            <h2 id="micro-title" className="mt-1 text-lg font-semibold text-ink-100">
              {challenge.partName}
            </h2>
            <p className="mt-1 text-sm text-ink-300">
              O micrômetro (0–25 mm) já está fechado na peça com a catraca. Leia a bainha e o tambor e escolha a medida.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-ink-800">
            <MicrometerScales mm={challenge.targetMm} highlight={showHint || answered} />
          </div>

          {!answered && !showHint && (
            <button onClick={() => setShowHint(true)} className="btn-ghost -ml-2">
              <Lightbulb className="h-4 w-4" aria-hidden /> Mostrar dica
            </button>
          )}
          {showHint && !answered && (
            <p className="text-sm text-ink-300">
              Dica: em laranja estão o último milímetro visível, o traço de meio milímetro (se já apareceu) e a divisão do tambor alinhada com a linha de referência.
            </p>
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-200">Qual é a leitura?</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {challenge.options.map((opt) => {
                const isPicked = picked === opt;
                const style = !answered
                  ? 'border-ink-700 bg-ink-950 text-ink-100 hover:border-ink-500'
                  : opt === challenge.targetMm && correct
                  ? 'border-emerald-600 bg-emerald-950/50 text-emerald-100'
                  : isPicked
                  ? 'border-amber-600 bg-amber-950/40 text-amber-100'
                  : 'border-ink-800 bg-ink-950 text-ink-400';
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={answered}
                    aria-pressed={isPicked}
                    className={`rounded-lg border px-3 py-3 font-mono text-sm font-semibold disabled:cursor-default ${style}`}
                  >
                    {fmt(opt)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {answered && (
            <div role="status" className={`space-y-3 rounded-lg border p-4 ${correct ? 'border-emerald-800/60 bg-emerald-950/30' : 'border-amber-800/60 bg-amber-950/20'}`}>
              <p className="flex items-center gap-2 font-semibold text-ink-100">
                {correct && <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden />}
                {correct ? 'Leitura certa!' : 'Ainda não.'}
              </p>
              {correct ? (
                <ReadingBreakdown mm={challenge.targetMm} />
              ) : (
                <p className="text-sm text-ink-300">
                  O erro mais comum é esquecer o meio milímetro da escala de baixo. Os traços que importam estão em laranja agora: tente de novo.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {!correct && (
                  <button
                    onClick={() => {
                      setPicked(null);
                      setShowHint(true);
                    }}
                    className="btn-primary"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden /> Tentar novamente
                  </button>
                )}
                {correct && idx + 1 < MICROMETER_CHALLENGES.length && (
                  <button onClick={() => goTo(idx + 1)} className="btn-primary">
                    Próxima peça <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
                {correct && idx + 1 === MICROMETER_CHALLENGES.length && (
                  <button onClick={() => setMode('explorar')} className="btn-primary">
                    Explorar livremente
                  </button>
                )}
              </div>
            </div>
          )}

          <nav aria-label="Escolher peça" className="flex flex-wrap gap-2 border-t border-ink-800 pt-4">
            {MICROMETER_CHALLENGES.map((c, i) => {
              const done = playerProfile.completedTasks.includes(micrometerTask(c.id));
              return (
                <button
                  key={c.id}
                  onClick={() => goTo(i)}
                  aria-current={i === idx ? 'step' : undefined}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${i === idx ? 'border-accent text-ink-100' : 'border-ink-700 text-ink-400 hover:text-ink-100'}`}
                >
                  {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-label="feita" />}
                  Peça {i + 1}
                </button>
              );
            })}
          </nav>
        </section>
      ) : (
        <section className="card space-y-4 p-5" aria-labelledby="micro-free-title">
          <div>
            <h2 id="micro-free-title" className="text-lg font-semibold text-ink-100">
              Gire o tambor e veja a leitura
            </h2>
            <p className="mt-1 text-sm text-ink-300">
              Cada volta completa do tambor avança 0,50 mm. Arraste o controle (ou use as setas do teclado) e observe quando aparece o traço de meio milímetro.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-ink-800">
            <MicrometerScales mm={freeMm} highlight />
          </div>
          <label className="block">
            <span className="sr-only">Abertura do micrômetro em milímetros</span>
            <input
              type="range"
              min={0}
              max={25}
              step={0.01}
              value={freeMm}
              onChange={(e) => setFreeMm(Math.round(parseFloat(e.target.value) * 100) / 100)}
              aria-valuetext={fmt(freeMm)}
              className="w-full accent-[#e8590c]"
            />
          </label>
          <div className="rounded-lg border border-ink-800 bg-ink-950 p-4">
            <ReadingBreakdown mm={freeMm} />
          </div>
        </section>
      )}
    </div>
  );
};
