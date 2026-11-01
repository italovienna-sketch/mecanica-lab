import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { ProgressBar } from '../ui';
import { CheckCircle2, Lightbulb, RotateCcw, ArrowRight } from 'lucide-react';

/**
 * Treino de leitura do paquímetro (resolução 0,05 mm, nônio de 20 divisões em 19 mm).
 * No desafio a leitura fica escondida até o aluno responder; a dica destaca o traço coincidente.
 * No modo "Explorar" o aluno move o cursor e vê a leitura sendo montada.
 */

interface CaliperChallenge {
  id: string;
  partName: string;
  context: string;
  targetMm: number;
  options: number[];
}

// Peças de exemplo com medidas didáticas (não são cotas de um equipamento específico).
export const CALIPER_CHALLENGES: CaliperChallenge[] = [
  { id: 'caliper-chaveta', partName: 'Largura de uma chaveta paralela', context: 'Ponta do eixo, lado do acoplamento', targetMm: 8.0, options: [7.5, 8.0, 8.5, 10.0] },
  { id: 'caliper-selo', partName: 'Espessura do anel fixo do selo mecânico', context: 'Selo mecânico da bomba', targetMm: 14.35, options: [14.0, 14.35, 14.7, 15.35] },
  {
    id: 'caliper-parafuso-m12',
    partName: 'Distância entre faces da cabeça de um parafuso M12 (DIN 933)',
    context: 'Fixação da tampa da bomba',
    targetMm: 19.0,
    options: [17.0, 19.0, 19.5, 21.0]
  },
  { id: 'caliper-colo-eixo', partName: 'Diâmetro externo de uma bucha espaçadora', context: 'Conjunto do eixo', targetMm: 28.45, options: [28.05, 28.45, 28.9, 29.45] }
];

const fmt = (mm: number) => `${mm.toFixed(2).replace('.', ',')} mm`;

const INK = '#1d1e1b';
const PAPER = '#f4f3ef';
const SLIDE = '#e2e0d8';
const ACCENT = '#e8590c';

function decompose(mm: number) {
  const whole = Math.floor(mm + 1e-6);
  const tick = Math.round((mm - whole) / 0.05); // 0..19
  return { whole, tick, fraction: tick * 0.05 };
}

/** Escalas do paquímetro (12 px por mm). O traço do nônio i fica em leitura + i × 0,95 mm. */
export const CaliperScales: React.FC<{ mm: number; highlight: boolean }> = ({ mm, highlight }) => {
  const { whole, tick } = decompose(mm);
  const zeroX = 50 + mm * 12;
  return (
    <svg viewBox="0 0 760 160" role="img" aria-label="Escalas do paquímetro: régua fixa em cima, nônio embaixo" className="h-auto w-full min-w-[600px]" style={{ background: PAPER }}>
      <rect x="20" y="20" width="720" height="60" fill="#fff" stroke={INK} strokeWidth="1.5" rx="3" />
      <text x="30" y="36" fill="#6e706a" fontSize="11" fontFamily="Inter, sans-serif">
        Régua fixa (mm)
      </text>
      {Array.from({ length: 56 }).map((_, n) => {
        const x = 50 + n * 12;
        const h = n % 10 === 0 ? 26 : n % 5 === 0 ? 18 : 11;
        const isWhole = highlight && n === whole;
        return (
          <g key={n}>
            <line x1={x} y1={80 - h} x2={x} y2={80} stroke={isWhole ? ACCENT : INK} strokeWidth={isWhole ? 2.5 : n % 10 === 0 ? 1.8 : 1.1} />
            {n % 10 === 0 && (
              <text x={x} y={50} textAnchor="middle" fill={INK} fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
                {n}
              </text>
            )}
          </g>
        );
      })}
      <rect x={zeroX - 14} y="81" width="262" height="62" fill={SLIDE} stroke={INK} strokeWidth="1.5" rx="3" />
      <text x={zeroX + 118} y="137" textAnchor="middle" fill="#6e706a" fontSize="11" fontFamily="Inter, sans-serif">
        Nônio (cada traço = 0,05 mm)
      </text>
      {Array.from({ length: 21 }).map((_, i) => {
        const x = zeroX + i * 0.95 * 12;
        const isHit = highlight && (i === tick || (tick === 0 && i === 20));
        const major = i % 2 === 0;
        return (
          <g key={i}>
            <line x1={x} y1={81} x2={x} y2={major ? 104 : 96} stroke={isHit ? ACCENT : INK} strokeWidth={isHit ? 3 : 1.2} />
            {isHit && <circle cx={x} cy={81} r="4" fill={ACCENT} />}
            {major && (
              <text x={x} y={118} textAnchor="middle" fill={isHit ? ACCENT : INK} fontSize="10" fontFamily="Inter, sans-serif">
                {i / 2}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const ReadingBreakdown: React.FC<{ mm: number }> = ({ mm }) => {
  const { whole, tick, fraction } = decompose(mm);
  return (
    <ol className="space-y-1 text-sm text-ink-200">
      <li>
        1. Antes do zero do nônio, a régua fixa marca <strong>{whole} mm</strong>.
      </li>
      <li>
        2. O traço do nônio que coincide com a régua é o <strong>{tick}º</strong>: {tick} × 0,05 = <strong>{fraction.toFixed(2).replace('.', ',')} mm</strong>.
      </li>
      <li>
        3. Leitura: {whole} + {fraction.toFixed(2).replace('.', ',')} = <strong className="text-ink-100">{fmt(mm)}</strong>
      </li>
    </ol>
  );
};

export const CaliperTrainer: React.FC = () => {
  const { playerProfile, completeTask } = useGameState();
  const [mode, setMode] = useState<'desafio' | 'explorar'>('desafio');
  const [idx, setIdx] = useState(() => {
    const firstOpen = CALIPER_CHALLENGES.findIndex((c) => !playerProfile.completedTasks.includes(`task-caliper-${c.id}`));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [freeMm, setFreeMm] = useState(12.4);

  const solved = CALIPER_CHALLENGES.filter((c) => playerProfile.completedTasks.includes(`task-caliper-${c.id}`)).length;
  const challenge = CALIPER_CHALLENGES[idx];
  const answered = picked !== null;
  const correct = picked === challenge.targetMm;

  const choose = (opt: number) => {
    setPicked(opt);
    if (opt === challenge.targetMm) completeTask(`task-caliper-${challenge.id}`, `Leitura do paquímetro: ${challenge.partName}`, 30);
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
            {solved} de {CALIPER_CHALLENGES.length} leituras certas
          </p>
          <ProgressBar value={solved} max={CALIPER_CHALLENGES.length} label="Leituras certas" />
        </div>
      </div>

      {mode === 'desafio' ? (
        <section className="card space-y-4 p-5" aria-labelledby="caliper-title">
          <div>
            <p className="eyebrow">
              Peça {idx + 1} de {CALIPER_CHALLENGES.length} · {challenge.context}
            </p>
            <h2 id="caliper-title" className="mt-1 text-lg font-semibold text-ink-100">
              {challenge.partName}
            </h2>
            <p className="mt-1 text-sm text-ink-300">O paquímetro já está fechado na peça. Leia as duas escalas e escolha a medida.</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-ink-800">
            <CaliperScales mm={challenge.targetMm} highlight={showHint || answered} />
          </div>

          {!answered && !showHint && (
            <button onClick={() => setShowHint(true)} className="btn-ghost -ml-2">
              <Lightbulb className="h-4 w-4" aria-hidden />
              Mostrar dica
            </button>
          )}
          {showHint && !answered && (
            <p className="text-sm text-ink-300">
              Dica: o traço laranja da régua fixa mostra os milímetros inteiros; o traço laranja do nônio é o que se alinha perfeitamente com a régua.
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
            <div
              role="status"
              className={`space-y-3 rounded-lg border p-4 ${correct ? 'border-emerald-800/60 bg-emerald-950/30' : 'border-amber-800/60 bg-amber-950/20'}`}
            >
              <p className="flex items-center gap-2 font-semibold text-ink-100">
                {correct ? <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden /> : null}
                {correct ? 'Leitura certa!' : 'Ainda não.'}
              </p>
              {correct ? (
                <ReadingBreakdown mm={challenge.targetMm} />
              ) : (
                <p className="text-sm text-ink-300">
                  Agora os traços que importam estão em laranja: some os milímetros da régua fixa com os centésimos do nônio e tente de novo.
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
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Tentar novamente
                  </button>
                )}
                {correct && idx + 1 < CALIPER_CHALLENGES.length && (
                  <button onClick={() => goTo(idx + 1)} className="btn-primary">
                    Próxima peça
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
                {correct && idx + 1 === CALIPER_CHALLENGES.length && (
                  <button onClick={() => setMode('explorar')} className="btn-primary">
                    Explorar livremente
                  </button>
                )}
              </div>
            </div>
          )}

          <nav aria-label="Escolher peça" className="flex flex-wrap gap-2 border-t border-ink-800 pt-4">
            {CALIPER_CHALLENGES.map((c, i) => {
              const done = playerProfile.completedTasks.includes(`task-caliper-${c.id}`);
              return (
                <button
                  key={c.id}
                  onClick={() => goTo(i)}
                  aria-current={i === idx ? 'step' : undefined}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
                    i === idx ? 'border-accent text-ink-100' : 'border-ink-700 text-ink-400 hover:text-ink-100'
                  }`}
                >
                  {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-label="feita" />}
                  Peça {i + 1}
                </button>
              );
            })}
          </nav>
        </section>
      ) : (
        <section className="card space-y-4 p-5" aria-labelledby="caliper-free-title">
          <div>
            <h2 id="caliper-free-title" className="text-lg font-semibold text-ink-100">
              Mova o cursor e veja a leitura
            </h2>
            <p className="mt-1 text-sm text-ink-300">Arraste o controle (ou use as setas do teclado) para abrir e fechar o paquímetro.</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-ink-800">
            <CaliperScales mm={freeMm} highlight />
          </div>
          <label className="block">
            <span className="sr-only">Abertura do paquímetro em milímetros</span>
            <input
              type="range"
              min={0}
              max={35}
              step={0.05}
              value={freeMm}
              onChange={(e) => setFreeMm(Math.round(parseFloat(e.target.value) * 20) / 20)}
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
