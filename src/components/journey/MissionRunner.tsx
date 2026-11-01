import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Circle, Play } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { Mission, MissionStep, PUMP_MACHINE_ID, missionProgress, stepDone } from '../../data/journey/missions';
import { LevelBadge, LoadingState } from '../ui';
import { FeedbackBox } from './activityKit';
import { FlowStep, MatchStep, ReleaseStep, SpotStep, ToolsStep, WarmupStep } from './activities';
import { BenchStep } from './BenchStep';
import { StartupStep } from './StartupStep';
import { AssessmentStep } from './AssessmentStep';
import { setMissionLink } from './missionLink';

// O motor 3D só desce quando a etapa precisa dele.
const FaultCheckStep = lazy(() => import('./Part3DStage').then((m) => ({ default: m.FaultCheckStep })));
const PickSealStep = lazy(() => import('./Part3DStage').then((m) => ({ default: m.PickSealStep })));

const FILM = '/media/apresentacao/centrifugal-pump/bomba_centrifuga_desmontagem_limpo';

/** Trecho curto do filme: nunca é fim de linha, sempre prepara a atividade seguinte. */
const VideoStep: React.FC<{ step: MissionStep; onDone: () => void }> = ({ step, onDone }) => {
  const clip = step.clip!;
  const ref = useRef<HTMLVideoElement>(null);
  const stopAtEnd = () => {
    const v = ref.current;
    if (v && v.currentTime >= clip.end) v.pause();
  };
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink-100">{clip.prompt}</p>
      <video
        ref={ref}
        controls
        preload="none"
        poster="/media/apresentacao/centrifugal-pump/poster_corte.jpg"
        onTimeUpdate={stopAtEnd}
        className="aspect-video w-full rounded-lg bg-black"
        aria-label={step.title}
      >
        <source src={`${FILM}.mp4#t=${clip.start},${clip.end}`} type="video/mp4" />
        <track kind="captions" src={`${FILM}.vtt`} srcLang="pt-BR" label="Português" default />
      </video>
      <p className="text-xs text-ink-400">Filme gerado do modelo 3D simplificado do Mecânica Lab, com legendas. Etapa opcional.</p>
      <button className="btn-primary" onClick={onDone}>
        Ir para a atividade <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

/** Etapa feita em outra tela (laboratório, aula rápida): o resultado volta pela evidência registrada lá. */
const LinkedStep: React.FC<{ mission: Mission; step: MissionStep; onDone: () => void }> = ({ mission, step, onDone }) => {
  const { navigateTo, playerProfile } = useGameState();
  const done = stepDone(step, mission.id, playerProfile);
  const go = () => {
    if (step.kind === 'lab') {
      setMissionLink({ missionId: mission.id, code: mission.code, labStage: step.labStage! });
      navigateTo('lab', PUMP_MACHINE_ID);
    } else navigateTo('micro', step.microId);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-300">{step.demonstrates}</p>
      {done ? (
        <>
          <FeedbackBox tone="success" title="Evidência registrada.">
            <p>{step.kind === 'lab' ? 'Esta etapa foi concluída no Laboratório 3D.' : 'Você respondeu a aula rápida.'}</p>
          </FeedbackBox>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={onDone}>
              Continuar <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button className="btn-ghost" onClick={go}>
              Refazer
            </button>
          </div>
        </>
      ) : (
        <button className="btn-primary" onClick={go} data-testid="open-linked">
          <Play className="h-4 w-4" aria-hidden />
          {step.kind === 'lab' ? 'Abrir no Laboratório 3D' : 'Abrir a aula rápida'}
        </button>
      )}
    </div>
  );
};

/** Carimbo de encerramento: resumo do que foi demonstrado, não um prêmio. */
const MissionSummary: React.FC<{ mission: Mission; next: () => void }> = ({ mission, next }) => {
  const { reducedMotion } = useGameState();
  return (
    <section aria-labelledby="os-encerrada" className="relative overflow-hidden rounded-lg border border-ink-700 bg-ink-850 p-4 sm:p-5">
      <span aria-hidden className={`absolute right-3 top-3 rotate-[-6deg] rounded border-2 border-emerald-500 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-emerald-400 ${reducedMotion ? '' : 'os-stamp'}`}>
        ENCERRADA
      </span>
      <h2 id="os-encerrada" className="section-title pr-24">
        {mission.code} encerrada
      </h2>
      <p className="mt-1 text-sm text-ink-300">O que você demonstrou nesta ordem de serviço:</p>
      <ul className="mt-2 space-y-1.5">
        {mission.demonstrated.map((d) => (
          <li key={d} className="flex gap-2 text-sm text-ink-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden /> {d}
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-4" onClick={next}>
        Voltar ao mapa <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
};

/** Folha da ordem de serviço: à esquerda as etapas, à direita a etapa aberta. */
export const MissionRunner: React.FC<{ mission: Mission }> = ({ mission }) => {
  const { playerProfile, navigateTo, recordMissionStep, finishJourneyMission } = useGameState();
  const prog = missionProgress(mission, playerProfile);
  const [openId, setOpenId] = useState(() => {
    const first = mission.steps.findIndex((s) => !s.optional && !stepDone(s, mission.id, playerProfile));
    if (first === -1) return mission.steps[mission.steps.length - 1].id;
    // Um vídeo opcional logo antes da etapa pendente abre primeiro, só enquanto ela não foi feita.
    const prev = mission.steps[first - 1];
    return prev?.kind === 'video' ? prev.id : mission.steps[first].id;
  });
  const [skipped, setSkipped] = useState<string[]>([]);
  const step = mission.steps.find((s) => s.id === openId) ?? mission.steps[0];
  const finished = Boolean(playerProfile.journey.missions[mission.id]?.completedAt);

  // Etapas de laboratório e aula são concluídas em outra tela. Ao voltar, a missão pode ter fechado.
  // A ref garante um aviso só: o efeito pode rodar de novo antes de completedMissions atualizar.
  const closedRef = useRef(false);
  useEffect(() => {
    if (!prog.complete || closedRef.current || playerProfile.completedMissions.includes(mission.id)) return;
    closedRef.current = true;
    finishJourneyMission(mission.id, `${mission.code}: ${mission.title}`, mission.xp);
  }, [prog.complete]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => {
    const i = mission.steps.indexOf(step);
    const next = mission.steps.slice(i + 1).find((s) => !skipped.includes(s.id));
    if (next) setOpenId(next.id);
  };

  const pass = () => {
    recordMissionStep(mission.id, step.id);
    advance();
  };

  const body = () => {
    const props = { mission, onPass: pass };
    switch (step.kind) {
      case 'video':
        return <VideoStep key={step.id} step={step} onDone={() => { setSkipped((l) => [...l, step.id]); advance(); }} />;
      case 'lab':
      case 'micro':
        return <LinkedStep mission={mission} step={step} onDone={advance} />;
      case 'warmup':
        return <WarmupStep key={step.id} {...props} />;
      case 'flow':
        return <FlowStep {...props} />;
      case 'spot':
        return <SpotStep {...props} />;
      case 'match':
        return <MatchStep {...props} />;
      case 'release':
        return <ReleaseStep {...props} />;
      case 'tools':
        return <ToolsStep {...props} />;
      case 'bench':
        return <BenchStep {...props} />;
      case 'startup':
        return <StartupStep {...props} />;
      case 'assessment':
        return <AssessmentStep {...props} />;
      case 'pick3d':
        return <PickSealStep {...props} />;
      case 'fault3d':
        return <FaultCheckStep {...props} />;
    }
  };

  return (
    <div>
      <button className="link mb-3" onClick={() => navigateTo('missions')}>
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Mapa das missões
      </button>

      {/* Carimbo da ordem de serviço */}
      <header className="mb-4 grid gap-px overflow-hidden rounded-lg border border-ink-700 bg-ink-700 sm:grid-cols-[auto_1fr]">
        <div className="bg-ink-850 px-4 py-3">
          <p className="eyebrow">Ordem de serviço</p>
          <p className="font-mono text-xl font-semibold text-ink-100">{mission.code}</p>
        </div>
        <div className="bg-ink-850 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink-100">{mission.title}</h1>
            <LevelBadge level={mission.level} />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-300">{mission.situation}</p>
        </div>
        <p className="bg-ink-850 px-4 py-2 text-sm text-ink-300 sm:col-span-2">
          <span className="font-semibold text-ink-200">Objetivo: </span>
          {mission.objective}
        </p>
      </header>

      {finished && prog.complete && openId === mission.steps[mission.steps.length - 1].id && <div className="mb-4"><MissionSummary mission={mission} next={() => navigateTo('missions')} /></div>}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <nav aria-label={`Etapas da ${mission.code}`} className="min-w-0">
          <ol className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {mission.steps.map((s, i) => {
              const done = stepDone(s, mission.id, playerProfile);
              const current = s.id === step.id;
              return (
                <li key={s.id} className="shrink-0 lg:shrink">
                  <button
                    onClick={() => setOpenId(s.id)}
                    aria-current={current ? 'step' : undefined}
                    data-step={s.id}
                    data-done={done}
                    className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      current ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-800 text-ink-300 hover:border-ink-600'
                    }`}
                  >
                    {done ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-label="Concluída" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden />}
                    <span className="whitespace-nowrap lg:whitespace-normal">
                      <span className="font-mono text-xs text-ink-400">{i + 1}. </span>
                      {s.title}
                      {s.optional && <span className="ml-1 text-xs text-ink-400">(opcional)</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 hidden text-xs text-ink-400 lg:block">
            {prog.done} de {prog.total} etapas demonstradas.
          </p>
        </nav>
        <section aria-labelledby="etapa-titulo" className="card min-w-0 p-4 sm:p-5">
          <h2 id="etapa-titulo" className="section-title">{step.title}</h2>
          <p className="mb-3 text-sm text-ink-400">Para concluir: {step.demonstrates}</p>
          <Suspense fallback={<LoadingState label="Carregando a atividade…" />}>{body()}</Suspense>
        </section>
      </div>
    </div>
  );
};
