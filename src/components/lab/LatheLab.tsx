import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Lightbulb, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { MachineData } from '../../data/mechanicalMachines';
import { PRACTICE_QUESTIONS_BY_ID } from '../../data/practiceBank';
import { LATHE_HAZARDS, LATHE_LAB, LATHE_OK_NOTES, LATHE_SEQUENCE, LATHE_STAGES, LatheStageId } from '../../data/latheData';
import { ThreeSceneEngine } from './ThreeSceneEngine';
import { QuestionRunner, AnswerResult } from '../practice/QuestionRunner';
import { OrderTaskView } from '../practice/OrderTaskView';
import { LoadingState } from '../ui';
import {
  Feedback,
  FeedbackBox,
  FreeModePanel,
  MachineSwitcher,
  NextButton,
  PART_SHORT_NAMES,
  PartInfo,
  PartListDisclosure,
  StageBox,
  ViewportToolbar
} from './MechanicalLab3D';

type Mode = 'mission' | 'free';
const KEY_ID = 'lathe-chuck-key';
const GUARD_ID = 'lathe-chuck-guard';
const config = LATHE_LAB;

const shortName = (id: string) => PART_SHORT_NAMES[id] || id;

/**
 * Laboratório do torno mecânico: conhecer, identificar, inspeção de segurança, sequência de operação e verificação.
 * O 3D é uma demonstração visual — a máquina não gira e não há simulação de corte.
 */
export const LatheLab: React.FC<{ machine: MachineData; onSwitchMachine: (id: string) => void }> = ({ machine, onSwitchMachine }) => {
  const { graphicsQuality, reducedMotion, playerProfile, inspectItem, recordLabStage, setLastActivity, setGraphicsQuality } = useGameState();
  const doneStages = playerProfile.labMissionStages[machine.id] || [];

  const [mode, setMode] = useState<Mode>('mission');
  const [stageIdx, setStageIdx] = useState(() => {
    const i = LATHE_STAGES.findIndex((s) => !doneStages.includes(s.id));
    return i === -1 ? 0 : i;
  });
  const stage = LATHE_STAGES[stageIdx];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [engineKey, setEngineKey] = useState(0);
  const [xray, setXray] = useState(false);
  const [labels, setLabels] = useState(false);
  const [explode, setExplode] = useState(0);
  const [isolated, setIsolated] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [slowDevice, setSlowDevice] = useState(false);

  const [identifyIdx, setIdentifyIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [checkPhase, setCheckPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [checkScore, setCheckScore] = useState<{ score: number; total: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeSceneEngine | null>(null);
  const partById = useMemo(() => Object.fromEntries(machine.parts.map((p) => [p.id, p])), [machine]);
  // A chave da placa só existe na cena durante a inspeção de segurança.
  const studyParts = useMemo(() => machine.parts.filter((p) => p.id !== KEY_ID), [machine]);

  useEffect(() => {
    setLastActivity('lab', `Laboratório 3D: ${machine.name}`, machine.id);
  }, [machine.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeStage = useCallback((id: LatheStageId) => recordLabStage(machine.id, id), [machine.id, recordLabStage]);

  const goToStage = (i: number) => {
    setStageIdx(i);
    setFeedback(null);
    setShowHint(false);
    setSelectedId(null);
    setAnimating(false);
    const id = LATHE_STAGES[i].id;
    if (id === 'identificar') setIdentifyIdx(0);
    if (id === 'seguranca') setFound([]);
    if (id === 'verificar') setCheckPhase('intro');
  };

  /* ─────────── Clique em peça ─────────── */
  const handlePartRef = useRef<(id: string) => void>(() => undefined);
  handlePartRef.current = (id: string) => {
    if (animating || !partById[id]) return;
    if (mode === 'free') {
      setSelectedId(id);
      inspectItem(id);
      return;
    }
    switch (stage.id) {
      case 'identificar': {
        const target = config.identify[identifyIdx];
        if (!target) return;
        if (id === target.partId) {
          setSelectedId(id);
          inspectItem(id);
          setShowHint(false);
          setFeedback({ tone: 'success', text: `Isso! Esta é a peça: ${shortName(id)}.` });
          if (identifyIdx + 1 >= config.identify.length) completeStage('identificar');
          setIdentifyIdx((i) => i + 1);
        } else if (id === GUARD_ID && target.partId === 'lathe-chuck') {
          setFeedback({ tone: 'hint', text: 'Essa é a proteção da placa. A placa está logo embaixo dela — gire o modelo ou clique na parte de baixo.' });
        } else {
          setFeedback({ tone: 'error', text: `Essa é a peça “${shortName(id)}”. Tente de novo — use a dica se precisar.` });
        }
        break;
      }
      case 'seguranca': {
        const hazard = LATHE_HAZARDS.find((h) => h.partIds.includes(id));
        if (!hazard) {
          setSelectedId(id);
          setFeedback({ tone: 'hint', text: LATHE_OK_NOTES[id] || `Em ordem: nada de errado com “${shortName(id)}”. Continue procurando.` });
          return;
        }
        if (found.includes(hazard.id)) {
          setFeedback({ tone: 'hint', text: `Você já corrigiu: ${hazard.title.toLowerCase()}.` });
          return;
        }
        const next = [...found, hazard.id];
        setFound(next);
        setSelectedId(null);
        setFeedback({
          tone: 'success',
          text: `${hazard.title}. ${hazard.why} ${hazard.fix}${next.length >= LATHE_HAZARDS.length ? ' Inspeção concluída!' : ''}`
        });
        if (hazard.id === 'carro-na-placa') {
          setAnimating(true);
          engineRef.current?.animateStep(0, -1);
          if (!engineRef.current) setAnimating(false);
        }
        if (next.length >= LATHE_HAZARDS.length) completeStage('seguranca');
        break;
      }
      default:
        setSelectedId(id);
        inspectItem(id);
    }
  };

  /* ─────────── Motor 3D ─────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    setLoadState('loading');
    setWebglError(null);
    const engine = new ThreeSceneEngine({
      container: containerRef.current,
      labelLayer: labelLayerRef.current,
      machine,
      config,
      quality: graphicsQuality,
      reducedMotion,
      forceLoadError: engineKey < 0,
      callbacks: {
        onHover: setHoveredId,
        onSelect: (id) => handlePartRef.current(id),
        onLoadState: (s, msg) => {
          setLoadState(s);
          setLoadMessage(msg || null);
        },
        onAnimationDone: () => setAnimating(false),
        onWebGLError: (msg) => setWebglError(msg),
        onSlowDevice: () => setSlowDevice(true)
      }
    });
    engineRef.current = engine;
    if (import.meta.env.DEV) (window as unknown as { __mlEngine?: ThreeSceneEngine }).__mlEngine = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [graphicsQuality, reducedMotion, engineKey, machine]);

  /* ─────────── Estado da cena conforme a etapa ─────────── */
  useEffect(() => {
    const e = engineRef.current;
    if (!e || loadState !== 'loaded') return;
    if (mode === 'free') {
      e.jumpToPose(0);
      e.setExplode(explode / 100);
      e.setXray(xray);
      e.setLabelsVisible(labels);
      e.setIsolated(isolated);
      e.setHidden([KEY_ID, ...hiddenIds]);
      e.setTarget(null);
      return;
    }
    e.setIsolated(null);
    e.setExplode(0);
    e.setXray(stage.id === 'identificar' && xray);
    const target = config.identify[identifyIdx];
    switch (stage.id) {
      case 'conhecer':
      case 'verificar':
        e.jumpToPose(0);
        e.setHidden([KEY_ID]);
        e.setLabelsVisible(true);
        e.setTarget(null);
        break;
      case 'identificar':
        e.jumpToPose(0);
        e.setHidden([KEY_ID]);
        e.setLabelsVisible(false);
        e.setTarget(showHint && target ? target.partId : null);
        break;
      case 'seguranca': {
        // Cena “antes da inspeção”: chave na placa, proteção retirada e carro encostado perto da placa.
        if (!animating) e.jumpToPose(found.includes('carro-na-placa') ? 0 : 1);
        const hidden: string[] = [];
        if (found.includes('chave-na-placa')) hidden.push(KEY_ID);
        if (!found.includes('sem-protecao')) hidden.push(GUARD_ID);
        e.setHidden(hidden);
        e.setLabelsVisible(false);
        e.setTarget(null);
        break;
      }
      case 'sequencia':
        e.jumpToPose(0);
        e.setHidden([KEY_ID]);
        e.setLabelsVisible(false);
        e.setTarget(null);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadState, mode, stage.id, identifyIdx, showHint, found, xray, labels, explode, isolated, hiddenIds]);

  useEffect(() => {
    engineRef.current?.select(selectedId);
  }, [selectedId, loadState]);

  const checkQuestions = useMemo(() => config.checkQuestionIds.map((id) => PRACTICE_QUESTIONS_BY_ID[id]).filter(Boolean), []);
  const finishCheck = (answers: AnswerResult[]) => {
    const score = answers.filter((a) => a.correct).length;
    setCheckScore({ score, total: answers.length });
    setCheckPhase('done');
    if (score / answers.length >= 0.6) completeStage('verificar');
  };

  const selectedPart = selectedId ? partById[selectedId] : null;
  const missionDone = LATHE_STAGES.every((s) => doneStages.includes(s.id));
  const showPartInfo = selectedPart && (mode === 'free' || stage.id === 'conhecer' || stage.id === 'identificar');

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-800 bg-ink-950 px-3 py-2 sm:px-4">
        <MachineSwitcher current={machine.id} onSwitch={onSwitchMachine} />
        <div role="tablist" aria-label="Modo" className="segmented">
          {(
            [
              ['mission', 'Atividades', 'Atividades'],
              ['free', 'Exploração livre', 'Livre']
            ] as [Mode, string, string][]
          ).map(([m, label, short]) => (
            <button
              key={m}
              role="tab"
              aria-label={label}
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setFeedback(null);
                setAnimating(false);
              }}
              
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowAccuracy((v) => !v)}
            aria-expanded={showAccuracy}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-950/30 px-2.5 text-xs font-medium text-amber-200 hover:bg-amber-950/50"
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Demonstração visual · {config.accuracy.label.toLowerCase()}</span>
            <span className="sm:hidden">Demonstração</span>
          </button>
          {showAccuracy && (
            <div role="dialog" aria-label="Sobre o modelo" className="absolute right-0 top-11 z-30 w-80 max-w-[calc(100vw-1.5rem)] rounded-card border border-ink-700 bg-ink-900 p-4 text-sm text-ink-300 shadow-pop">
              <p className="font-semibold text-ink-100">{config.accuracy.label}</p>
              <p className="mt-1.5 leading-relaxed">{config.accuracy.detail}</p>
              <button className="btn-ghost mt-2 px-0" onClick={() => setShowAccuracy(false)}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative h-[46vh] shrink-0 overflow-hidden bg-[#1a1b19] lg:h-auto lg:min-w-0 lg:flex-1">
          <div ref={containerRef} className="absolute inset-0" data-testid="lathe-viewport" />
          <div ref={labelLayerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {machine.parts.map((p) => (
              <span
                key={p.id}
                data-part-label={p.id}
                className="absolute left-0 top-0 whitespace-nowrap rounded-md border border-ink-600 bg-ink-950/90 px-2 py-1 text-xs font-medium text-ink-100 opacity-0 shadow transition-opacity data-[state=selected]:border-accent data-[state=target]:border-amber-400"
              >
                {shortName(p.id)}
              </span>
            ))}
          </div>

          {slowDevice && graphicsQuality === 'high' && (
            <div role="status" className="absolute inset-x-3 top-3 z-20 mx-auto flex max-w-lg flex-wrap items-center gap-3 rounded-xl border border-ink-600 bg-ink-950/95 p-3 text-sm text-ink-200 shadow-xl">
              <span className="flex-1">O 3D está lento neste computador. O modo leve desliga sombras e reflexos para ficar mais fluido.</span>
              <button className="btn-primary px-3 py-1.5" onClick={() => setGraphicsQuality('low')}>
                Ativar modo leve
              </button>
              <button className="btn-ghost px-2 py-1.5" onClick={() => setSlowDevice(false)}>
                Agora não
              </button>
            </div>
          )}
          {hoveredId && partById[hoveredId] && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-ink-700 bg-ink-950/90 px-3 py-1.5 text-sm text-ink-100">
              {shortName(hoveredId)}
            </div>
          )}
          {mode === 'mission' && stage.id === 'seguranca' && found.length < LATHE_HAZARDS.length && (
            <div className="pointer-events-none absolute bottom-16 left-3 rounded-lg border border-amber-700/60 bg-amber-950/80 px-3 py-1.5 text-sm font-medium text-amber-100">
              Máquina desligada · inspeção antes da partida
            </div>
          )}

          {loadState === 'loading' && !webglError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1a1b19]">
              <LoadingState label="Montando o torno em 3D…" />
            </div>
          )}
          {(loadState === 'error' || webglError) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1a1b19]/95 p-6">
              <div role="alert" className="card max-w-sm p-5">
                <p className="flex items-center gap-2 font-semibold text-amber-200">
                  <AlertTriangle className="h-5 w-5" aria-hidden /> O 3D não carregou
                </p>
                <p className="mt-2 text-sm text-ink-300">{webglError || loadMessage}</p>
                <p className="mt-2 text-sm text-ink-400">As atividades de sequência e de verificação funcionam sem o 3D.</p>
                {!webglError && (
                  <button className="btn-primary mt-4" onClick={() => setEngineKey((k) => Math.abs(k) + 1)}>
                    <RefreshCw className="h-4 w-4" aria-hidden /> Tentar de novo
                  </button>
                )}
              </div>
            </div>
          )}

          <ViewportToolbar
            disabled={loadState !== 'loaded'}
            xray={xray}
            labels={labels}
            onXray={() => setXray((v) => !v)}
            onLabels={() => setLabels((v) => !v)}
            onView={(v) => engineRef.current?.setView(v)}
            onZoom={(f) => engineRef.current?.zoom(f)}
            onRotate={(a) => engineRef.current?.rotate(a)}
            onFocus={() => (selectedId ? engineRef.current?.focusPart(selectedId) : engineRef.current?.resetCamera())}
            focusLabel={selectedId ? 'Centralizar peça selecionada' : 'Centralizar modelo'}
            explode={mode === 'free' ? explode : null}
            onExplode={setExplode}
          />
        </div>

        <aside className="min-h-0 flex-1 overflow-y-auto border-t border-ink-800 bg-ink-900 lg:w-[400px] lg:flex-none lg:border-l lg:border-t-0" aria-label="Painel do torno">
          <div className="p-4 sm:p-5">
            {mode === 'mission' ? (
              <>
                <LatheStepper done={doneStages} current={stageIdx} onSelect={goToStage} />
                <div className="mt-4">
                  {stage.id === 'conhecer' && (
                    <div>
                      <StageBox title="Para que serve" text={config.purpose}>
                        <p className="mt-2 text-sm text-ink-400">
                          <span className="font-medium text-ink-300">Onde se usa: </span>
                          {config.whereUsed}
                        </p>
                      </StageBox>
                      <div className="mt-3 rounded-xl border border-ink-800 bg-ink-850 p-4 text-sm leading-relaxed text-ink-300">
                        <h3 className="text-base font-semibold text-ink-100">Como o torno corta</h3>
                        <p className="mt-1">
                          A <strong className="text-ink-100">peça gira</strong> presa na placa. A <strong className="text-ink-100">ferramenta não gira</strong>: ela é levada pelos carros —
                          o carro principal anda ao longo da peça e o carro transversal define a profundidade.
                        </p>
                        <p className="mt-2">Clique nas peças do modelo para ver o nome e a função de cada uma.</p>
                      </div>
                      <div className="mt-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                          <ShieldAlert className="h-4 w-4" aria-hidden /> Antes de chegar perto de um torno
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-sm text-amber-100/90">
                          {machine.safetyRules.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-ink-500">
                        Este laboratório é uma demonstração visual para reconhecer a máquina e entender a segurança. Ele não ensina a operar um torno real e não simula o corte.
                      </p>
                      <NextButton
                        onClick={() => {
                          completeStage('conhecer');
                          goToStage(1);
                        }}
                        label="Identificar as partes"
                      />
                    </div>
                  )}

                  {stage.id === 'identificar' && (
                    <StageBox title="Identifique as partes" text="Encontre cada parte no modelo e clique nela. Arraste para girar e use a roda do mouse para aproximar.">
                      {identifyIdx < config.identify.length ? (
                        <>
                          <p className="mt-3 text-sm text-ink-400">
                            Parte {identifyIdx + 1} de {config.identify.length}
                          </p>
                          <p className="mt-1 text-base font-semibold text-ink-100">{config.identify[identifyIdx].prompt}</p>
                          <button onClick={() => setShowHint(true)} className="btn-ghost mt-2 px-0 text-left" disabled={showHint}>
                            <Lightbulb className="h-4 w-4 shrink-0" aria-hidden /> {showHint ? config.identify[identifyIdx].hint : 'Ver dica'}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="mt-3 text-base font-semibold text-emerald-300">Você identificou todas as partes!</p>
                          <NextButton onClick={() => goToStage(2)} label="Fazer a inspeção de segurança" />
                        </>
                      )}
                    </StageBox>
                  )}

                  {stage.id === 'seguranca' && (
                    <StageBox
                      title="Inspeção antes de ligar"
                      text="O torno está desligado e alguém o deixou pronto para a partida. Encontre as condições inseguras clicando no modelo."
                    >
                      <p className="mt-3 text-sm text-ink-300" aria-live="polite">
                        Encontradas: <strong className="text-ink-100">{found.length} de {LATHE_HAZARDS.length}</strong>
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {LATHE_HAZARDS.map((h, i) => {
                          const ok = found.includes(h.id);
                          return (
                            <li key={h.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${ok ? 'border-emerald-700/60 text-emerald-200' : 'border-dashed border-ink-700 text-ink-500'}`}>
                              {ok ? <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden /> : <span className="w-4 text-center font-mono text-xs">{i + 1}</span>}
                              {ok ? h.title : 'Condição ainda não encontrada'}
                            </li>
                          );
                        })}
                      </ul>
                      {found.length < LATHE_HAZARDS.length ? (
                        <p className="mt-3 text-sm text-ink-400">
                          Dica: olhe a placa de perto (o que está preso nela? o que está faltando por cima?) e a posição do carro.
                        </p>
                      ) : (
                        <NextButton onClick={() => goToStage(3)} label="Ordenar a operação" />
                      )}
                    </StageBox>
                  )}

                  {stage.id === 'sequencia' && (
                    <div>
                      <OrderTaskView task={LATHE_SEQUENCE} onSolved={() => completeStage('sequencia')} />
                      {doneStages.includes('sequencia') && <NextButton onClick={() => goToStage(4)} label="Verificar o aprendizado" />}
                    </div>
                  )}

                  {stage.id === 'verificar' && (
                    <div>
                      {checkPhase === 'intro' && (
                        <StageBox title="Verifique o aprendizado" text={`${checkQuestions.length} questões sobre as partes do torno, segurança e conceitos básicos de usinagem.`}>
                          <button className="btn-primary mt-4 w-full" onClick={() => setCheckPhase('running')}>
                            Começar
                          </button>
                        </StageBox>
                      )}
                      {checkPhase === 'running' && (
                        <QuestionRunner questions={checkQuestions} contextLabel="Verificação do torno" seed={4217} onFinish={finishCheck} onExit={() => setCheckPhase('intro')} />
                      )}
                      {checkPhase === 'done' && checkScore && (
                        <StageBox
                          title={checkScore.score / checkScore.total >= 0.6 ? 'Atividades concluídas!' : 'Quase lá!'}
                          text={`Você acertou ${checkScore.score} de ${checkScore.total}.`}
                        >
                          {missionDone && (
                            <p className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" aria-hidden /> Todas as etapas do torno foram concluídas.
                            </p>
                          )}
                          <p className="mt-2 text-sm text-ink-400">
                            Próximo passo sugerido: pratique a leitura do paquímetro, usado para medir a peça depois do torneamento.
                          </p>
                          <div className="mt-4 flex flex-col gap-2">
                            <a className="btn-primary" href="#/ferramentas/treino-paquimetro">
                              Praticar leitura do paquímetro
                            </a>
                            <a className="btn-secondary" href="#/praticar/torno">
                              Mais questões sobre o torno
                            </a>
                            <button className="btn-ghost" onClick={() => setCheckPhase('running')}>
                              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer verificação
                            </button>
                          </div>
                        </StageBox>
                      )}
                    </div>
                  )}
                </div>
                {feedback && <FeedbackBox feedback={feedback} />}
              </>
            ) : (
              <FreeModePanel
                parts={studyParts}
                selectedId={selectedId}
                isolated={isolated}
                hiddenIds={hiddenIds}
                onSelect={(id) => handlePartRef.current(id)}
                onIsolate={(id) => setIsolated((cur) => (cur === id ? null : id))}
                onToggleHidden={(id) => setHiddenIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
                onShowAll={() => {
                  setHiddenIds([]);
                  setIsolated(null);
                }}
              />
            )}

            {mode === 'mission' && (stage.id === 'conhecer' || stage.id === 'identificar') && (
              <PartListDisclosure
                parts={studyParts}
                label={stage.id === 'identificar' ? 'Prefere escolher pela lista?' : 'Lista de partes'}
                defaultOpen={false}
                selectedId={selectedId}
                onSelect={(id) => handlePartRef.current(id)}
              />
            )}
            {mode === 'mission' && stage.id === 'seguranca' && found.length < LATHE_HAZARDS.length && (
              <PartListDisclosure
                parts={machine.parts.filter(
                  (p) => !(p.id === GUARD_ID && !found.includes('sem-protecao')) && !(p.id === KEY_ID && found.includes('chave-na-placa'))
                )}
                label="Prefere inspecionar pela lista?"
                defaultOpen={false}
                selectedId={selectedId}
                onSelect={(id) => handlePartRef.current(id)}
              />
            )}
            {showPartInfo && selectedPart && <PartInfo part={selectedPart} lessonId="" onFocus={() => engineRef.current?.focusPart(selectedPart.id)} />}
          </div>
        </aside>
      </div>
    </div>
  );
};

const LatheStepper: React.FC<{ done: string[]; current: number; onSelect: (i: number) => void }> = ({ done, current, onSelect }) => (
  <nav aria-label="Etapas do torno">
    <p className="text-sm text-ink-400">
      Torno · etapa {current + 1} de {LATHE_STAGES.length}
    </p>
    <h2 className="text-lg font-semibold text-ink-100">{LATHE_STAGES[current].label}</h2>
    <ol className="mt-3 grid grid-cols-5 gap-1">
      {LATHE_STAGES.map((s, i) => {
        const isDone = done.includes(s.id);
        const active = i === current;
        return (
          <li key={s.id}>
            <button
              onClick={() => onSelect(i)}
              aria-current={active ? 'step' : undefined}
              title={s.label}
              className={`flex w-full flex-col items-center gap-1 rounded-md py-1.5 text-[11px] ${active ? 'bg-accent-soft text-ink-100' : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200'}`}
            >
              <span className={`h-1.5 w-full rounded-full ${active ? 'bg-accent' : isDone ? 'bg-emerald-500' : 'bg-ink-700'}`} aria-hidden />
              <span className="hidden sm:block">{s.short}</span>
              <span className="sr-only">{isDone ? '(concluída)' : ''}</span>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
