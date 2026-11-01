import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { OrderTask } from '../../data/lessonStructure';

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Garante que a lista embaralhada nunca já venha na ordem correta.
  if (a.every((v, k) => v === arr[k]) && a.length > 1) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

/** Atividade de ordenar etapas: o aluno toca nas etapas na ordem e confere. */
export const OrderTaskView: React.FC<{ task: OrderTask; onSolved?: () => void }> = ({ task, onSolved }) => {
  const shuffled = useMemo(() => shuffle(task.steps, task.steps.join('').length * 7 + 3), [task]);
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle');
  const firstWrong = picked.findIndex((p, k) => p !== task.steps[k]);

  const check = () => {
    if (picked.length !== task.steps.length) return;
    const ok = picked.every((p, k) => p === task.steps[k]);
    setStatus(ok ? 'right' : 'wrong');
    if (ok) onSolved?.();
  };
  const reset = () => {
    setPicked([]);
    setStatus('idle');
  };

  return (
    <div className="card p-5 sm:p-6">
      <p className="eyebrow mb-1">Situação</p>
      <p className="text-base text-ink-200">{task.situation}</p>
      <h3 className="mt-3 text-lg font-semibold text-ink-100">{task.prompt}</h3>
      <p className="mt-1 text-sm text-ink-400">Toque nas etapas na ordem em que você faria.</p>

      <ol className="mt-4 space-y-2" aria-label="Sua sequência">
        {task.steps.map((_, k) => {
          const value = picked[k];
          const wrongHere = status === 'wrong' && k === firstWrong;
          return (
            <li
              key={k}
              className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-3.5 py-2.5 text-base ${
                value
                  ? wrongHere
                    ? 'border-rose-500 bg-rose-950/30 text-ink-100'
                    : status === 'right'
                    ? 'border-emerald-600 bg-emerald-950/30 text-ink-100'
                    : 'border-ink-600 bg-ink-850 text-ink-100'
                  : 'border-dashed border-ink-700 text-ink-500'
              }`}
            >
              <span className="font-mono text-sm text-ink-400">{k + 1}.</span>
              {value || 'Etapa ainda não escolhida'}
            </li>
          );
        })}
      </ol>

      {status === 'idle' && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Etapas disponíveis">
          {shuffled
            .filter((s) => !picked.includes(s))
            .map((s) => (
              <button key={s} onClick={() => setPicked([...picked, s])} className="btn-secondary text-left">
                {s}
              </button>
            ))}
        </div>
      )}

      {status === 'right' && (
        <div role="status" className="mt-4 rounded-xl border border-emerald-700/60 bg-emerald-950/30 p-4">
          <p className="font-semibold text-emerald-300">Sequência correta!</p>
          <p className="mt-1 text-sm text-ink-200">{task.explanation}</p>
        </div>
      )}
      {status === 'wrong' && (
        <div role="status" className="mt-4 rounded-xl border border-amber-700/50 bg-amber-950/20 p-4">
          <p className="font-semibold text-amber-200">Quase! A etapa {firstWrong + 1} não está no lugar certo.</p>
          <p className="mt-1 text-sm text-ink-300">Pense: o que precisa acontecer antes para essa etapa ser possível e segura?</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {status === 'idle' && (
          <button onClick={check} disabled={picked.length !== task.steps.length} className="btn-primary">
            Conferir sequência
          </button>
        )}
        {(picked.length > 0 || status !== 'idle') && status !== 'right' && (
          <button onClick={reset} className="btn-ghost">
            <RotateCcw className="h-4 w-4" aria-hidden /> {status === 'wrong' ? 'Tentar de novo' : 'Recomeçar'}
          </button>
        )}
      </div>
    </div>
  );
};

