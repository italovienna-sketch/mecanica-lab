import React from 'react';
import { Check, Lock } from 'lucide-react';
import { MISSIONS, Mission, MissionStatus, missionProgress, missionStatus } from '../../data/journey/missions';
import type { PlayerProfile } from '../../types/game';
import type { MissionGateConfig } from '../../data/journey/missions';

const STATUS_TEXT: Record<MissionStatus, string> = {
  concluida: 'Concluída',
  'em-andamento': 'Em andamento',
  disponivel: 'Disponível',
  bloqueada: 'Bloqueada',
  oculta: 'Fora do ar'
};

const STATUS_RING: Record<MissionStatus, string> = {
  concluida: 'border-emerald-500 bg-emerald-950/50 text-emerald-200',
  'em-andamento': 'border-accent bg-accent-soft text-accent-text',
  disponivel: 'border-accent bg-ink-900 text-ink-100',
  bloqueada: 'border-ink-700 bg-ink-900 text-ink-500',
  oculta: 'border-ink-800 bg-ink-900 text-ink-600'
};

/**
 * O mapa da jornada desenhado como um fluxograma de processo: cada OS é um instrumento na linha, e a tubulação enche
 * conforme as missões são concluídas. Em telas estreitas a linha fica vertical.
 */
export const ProcessLine: React.FC<{ profile: PlayerProfile; config: MissionGateConfig; onOpen: (m: Mission) => void }> = ({ profile, config, onOpen }) => {
  const visible = MISSIONS.filter((m) => missionStatus(m, profile, config) !== 'oculta');
  return (
    <ol aria-label="Ordens de serviço da bomba P-101" className="relative">
      {visible.map((m, i) => {
        const status = missionStatus(m, profile, config);
        const prog = missionProgress(m, profile);
        const locked = status === 'bloqueada';
        const nextFilled = status === 'concluida';
        const isLast = i === visible.length - 1;
        return (
          <li key={m.id} className="relative flex gap-3 pb-3 last:pb-0 sm:gap-4">
            {!isLast && (
              <span aria-hidden className={`absolute left-[1.6875rem] top-14 bottom-0 w-1 -translate-x-1/2 sm:left-[1.9375rem] ${nextFilled ? 'bg-emerald-500' : 'bg-ink-800'}`} />
            )}
            <span
              aria-hidden
              className={`relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 font-mono text-[0.625rem] font-semibold leading-tight sm:h-16 sm:w-16 sm:text-[0.6875rem] ${STATUS_RING[status]}`}
            >
              <span className="border-b border-current px-1 pb-px">OS</span>
              <span className="pt-px">{m.code.slice(3)}</span>
            </span>
            <button
              onClick={() => onOpen(m)}
              disabled={locked}
              data-mission={m.id}
              data-status={status}
              className={`min-w-0 flex-1 rounded-lg border p-3 text-left transition-colors sm:p-4 ${
                locked ? 'cursor-not-allowed border-ink-800 bg-ink-900' : 'border-ink-700 bg-ink-850 hover:border-accent'
              }`}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className={`font-semibold ${locked ? 'text-ink-400' : 'text-ink-100'}`}>{m.title}</span>
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  {status === 'concluida' && <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />}
                  {locked && <Lock className="h-3.5 w-3.5" aria-hidden />}
                  {STATUS_TEXT[status]}
                  {status !== 'concluida' && !locked && ` · ${prog.done} de ${prog.total}`}
                </span>
              </span>
              <span className={`mt-0.5 block text-sm leading-snug ${locked ? 'text-ink-500' : 'text-ink-300'}`}>{m.objective}</span>
              <span className="mt-1 block text-xs text-ink-400">{m.level}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
