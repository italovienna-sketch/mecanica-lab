import React, { Suspense, lazy, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useGameState } from '../context/GameStateContext';
import { PRACTICE_TOPICS } from '../data/practiceBank';
import { MICRO_LESSONS_BY_ID, SAFETY_MICRO_IDS } from '../data/microLessons';
import { MISSIONS, currentMission, missionProgress, missionStatus, recommend } from '../data/journey/missions';
import { dueCards } from '../data/journey/review';
import { Page, ProgressBar } from './ui';

// Competências e desafios usam dados maiores: carregam depois da ação principal.
const StatusPanels = lazy(() => import('./dashboard/DashboardPanels').then((m) => ({ default: m.StatusPanels })));
const ExploreAreas = lazy(() => import('./dashboard/DashboardPanels').then((m) => ({ default: m.ExploreAreas })));

export const LandingScreen: React.FC = () => {
  const { navigateTo, playerProfile, courseConfig } = useGameState();
  const now = useMemo(() => Date.now(), []);
  const due = dueCards(playerProfile, now, courseConfig.customCards, courseConfig.disabledCards).length;

  const safetyDone = SAFETY_MICRO_IDS.filter((id) => playerProfile.microLessons?.[id]?.completedAt).length;
  const nextSafetyId = SAFETY_MICRO_IDS.find((id) => !playerProfile.microLessons?.[id]?.completedAt);
  const weakTopic = PRACTICE_TOPICS.find((t) => {
    const sessions = playerProfile.practiceSessions.filter((s) => s.topicId === t.id);
    const last = sessions[sessions.length - 1];
    return last && last.correct / last.total < 0.6;
  });

  const rec = recommend(
    playerProfile,
    {
      dueCards: due,
      openMistakes: playerProfile.journey.mistakes.filter((m) => !m.resolvedAt).length,
      nextSafetyMicro: nextSafetyId ? { id: nextSafetyId, title: MICRO_LESSONS_BY_ID[nextSafetyId].title, done: safetyDone, total: SAFETY_MICRO_IDS.length } : undefined,
      weakTopic: weakTopic ? { id: weakTopic.id, title: weakTopic.title } : undefined
    },
    courseConfig
  );

  const mission = currentMission(playerProfile, courseConfig);
  const prog = mission ? missionProgress(mission, playerProfile) : null;
  const finished = MISSIONS.filter((m) => missionStatus(m, playerProfile, courseConfig) === 'concluida').length;
  const firstName = (playerProfile.name || 'Aprendiz').split(' ')[0];

  return (
    <Page>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-100 sm:text-[1.75rem]">Olá, {firstName}!</h1>
        <p className="mt-1 text-sm text-ink-400">
          Nível {playerProfile.level} · {playerProfile.xp} XP
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          {/* O que fazer agora: uma regra fixa escolhe, e o motivo fica à vista */}
          <section aria-labelledby="agora" className="card overflow-hidden">
            <div className="p-5 sm:p-6">
              <p className="text-sm text-ink-400">{rec.eyebrow}</p>
              <h2 id="agora" className="mt-1.5 text-xl font-semibold leading-snug text-ink-100 sm:text-2xl">
                {rec.title}
              </h2>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-300">
                <span className="font-medium text-ink-200">Por que agora: </span>
                {rec.why}
              </p>
              <button onClick={() => navigateTo(rec.screen, rec.param)} className="btn-primary btn-lg mt-5 w-full sm:w-auto">
                {rec.cta} <ArrowRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </section>

          {/* O que está aprendendo */}
          <section aria-labelledby="aprendendo" className="card p-5 sm:p-6">
            <p className="eyebrow">Jornada da bomba P-101 · fictícia, da planta-escola</p>
            {mission && prog ? (
              <>
                <h2 id="aprendendo" className="mt-1 text-lg font-semibold leading-snug text-ink-100">
                  Você está aprendendo: {mission.title}
                </h2>
                <p className="mt-1 text-base leading-relaxed text-ink-300">{mission.objective}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <ProgressBar value={prog.done} max={prog.total} label={`Etapas da ${mission.code}`} tone="success" />
                  </div>
                  <span className="shrink-0 font-mono text-xs text-ink-300">
                    {mission.code} · {prog.done}/{prog.total}
                  </span>
                </div>
              </>
            ) : (
              <h2 id="aprendendo" className="mt-1 text-lg font-semibold text-ink-100">
                Você concluiu as seis ordens de serviço
              </h2>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-ink-400">
                {finished} de {MISSIONS.length} missões concluídas
              </span>
              <button className="link" onClick={() => navigateTo('missions')}>
                Ver o mapa das missões <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </section>
        </div>

        <Suspense fallback={<div className="card h-[17.5rem] p-5" aria-hidden><div className="skeleton h-5 w-32" /></div>}>
          <StatusPanels />
        </Suspense>
      </div>

      <Suspense fallback={<div className="mt-8 h-[7.5rem]" aria-hidden />}>
        <ExploreAreas />
      </Suspense>
    </Page>
  );
};
