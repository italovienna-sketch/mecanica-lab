import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MachinePicker } from './MachinePicker';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Focus,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  ScanEye,
  Scissors,
  ListChecks,
  Tag,
  Wrench,
  ShieldAlert,
  Undo2,
  Box,
  SquareDashed,
  ListRestart,
  Presentation,
  MapPin
} from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { MACHINES_CATALOG, MachineData, MechanicalPart3D } from '../../data/mechanicalMachines';
import { LAB_CONFIGS, MISSION_STAGES, MachineLabConfig, MissionStage, PART_SAFETY, StepQuiz } from '../../data/labMission';
import { PRACTICE_QUESTIONS_BY_ID } from '../../data/practiceBank';
import { ThreeSceneEngine, CameraView } from './ThreeSceneEngine';
import { PumpIsoFigure } from '../illustrations/PumpIsoFigure';
import { QuestionRunner, AnswerResult } from '../practice/QuestionRunner';
import { LoadingState } from '../ui';
import { LATHE_ID, LATHE_MACHINE, LATHE_PART_SAFETY, LATHE_PART_SHORT_NAMES } from '../../data/latheData';
import { LatheLab } from './LatheLab';
import { BEARING_ASSEMBLY_SHORT_NAMES } from '../../data/industry/bearingAssemblyMachine';
import { BELT_CONVEYOR_SHORT_NAMES } from '../../data/industry/beltConveyorMachine';
import { DIAPHRAGM_PUMP_SHORT_NAMES } from '../../data/industry/diaphragmPumpMachine';
import { MOTOR_GEARBOX_SHORT_NAMES } from '../../data/industry/motorGearboxMachine';
import { TECH_REFERENCES } from '../../data/technicalReferences';
import { PreWorkChecklist, RenderedFilm, ReturnToService, StepQuizBox } from './ProcedureExtras';
import { PresentationMode, isPresentationHash } from './PresentationMode';
import { clearMissionLink, getMissionLink } from '../journey/missionLink';

const AnatomyMechanicalExplorer = lazy(() =>
  import('../iso/AnatomyMechanicalExplorer').then((m) => ({ default: m.AnatomyMechanicalExplorer }))
);

/** Nomes curtos e sem siglas para rótulos e listas. */
export const PART_SHORT_NAMES: Record<string, string> = {
  'pump-volute-casing': 'Voluta (carcaça)',
  'pump-impeller': 'Rotor',
  'pump-mechanical-seal': 'Tampa e selo mecânico',
  'pump-shaft': 'Eixo',
  'pump-bearings': 'Rolamentos',
  'pump-bearing-bracket': 'Cavalete de mancal',
  'pump-fasteners': 'Parafusos da carcaça',
  'pump-casing-gasket': 'Junta da carcaça',
  'pump-impeller-nut': 'Porca do rotor',
  'pump-coupling-hub': 'Cubo do acoplamento',
  'part-housing-top': 'Tampa superior',
  'part-bolts-perimeter': 'Parafusos da tampa',
  'part-input-pinion-shaft': 'Eixo-pinhão (entrada)',
  'part-output-gear': 'Coroa e eixo de saída',
  'part-taper-bearings': 'Rolamentos cônicos',
  'part-radial-seals': 'Retentores',
  'part-housing-bottom': 'Carcaça inferior',
  'gp-body': 'Corpo',
  'gp-front-flange': 'Flange dianteiro',
  'gp-key': 'Chaveta',
  'gp-bolts': 'Parafusos passantes',
  'gp-rear-cover': 'Tampa traseira',
  'gp-bearing-rear': 'Mancal traseiro',
  'gp-driven-gear': 'Engrenagem movida',
  'gp-drive-gear': 'Engrenagem motora',
  'gp-bearing-front': 'Mancal dianteiro',
  'gp-shaft-seal': 'Retentor do eixo',
  ...LATHE_PART_SHORT_NAMES,
  ...BEARING_ASSEMBLY_SHORT_NAMES,
  ...BELT_CONVEYOR_SHORT_NAMES,
  ...DIAPHRAGM_PUMP_SHORT_NAMES,
  ...MOTOR_GEARBOX_SHORT_NAMES
};

/** Seletor de equipamento do laboratório (bomba, redutor, torno): nome como título + menu "Trocar equipamento". */
export const MachineSwitcher: React.FC<{ current: string; onSwitch: (id: string) => void }> = (props) => <MachinePicker {...props} />;

const shortName = (p: MechanicalPart3D) => PART_SHORT_NAMES[p.id] || p.name.split('(')[0].trim();

type Mode = 'mission' | 'free';
/** Animação em andamento na missão: avançar ou desfazer uma etapa de desmontagem/montagem. */
type Pending = 'dis' | 'dis-undo' | 're' | 're-undo';

/** Nomes das categorias de peças (filtros do modo livre). */
const CATEGORY_LABEL: Record<MechanicalPart3D['category'], string> = {
  structural: 'Estrutura',
  transmission: 'Transmissão',
  bearing: 'Rolamentos',
  sealing: 'Vedação',
  fastener: 'Fixação'
};
type View = '3d' | '2d';
export type Feedback = { tone: 'success' | 'error' | 'hint'; text: string } | null;

export const MechanicalLab3D: React.FC = () => {
  const { activeParam, navigateTo } = useGameState();
  const onSwitchMachine = (id: string) => navigateTo('lab', id, { replace: true });
  if (activeParam === LATHE_ID) return <LatheLab key={LATHE_ID} machine={LATHE_MACHINE} onSwitchMachine={onSwitchMachine} />;
  const machineId = activeParam && MACHINES_CATALOG[activeParam] && LAB_CONFIGS[activeParam] ? activeParam : 'centrifugal-pump';
  // Remonta a tela ao trocar de máquina: estado e cena 3D começam limpos.
  return <LabView key={machineId} machine={MACHINES_CATALOG[machineId]} config={LAB_CONFIGS[machineId]} onSwitchMachine={onSwitchMachine} />;
};

const LabView: React.FC<{ machine: MachineData; config: MachineLabConfig; onSwitchMachine: (id: string) => void }> = ({
  machine,
  config,
  onSwitchMachine
}) => {
  const {
    graphicsQuality,
    reducedMotion,
    playerProfile,
    navigateTo,
    inspectItem,
    recordLabStage,
    markDisassemblyComplete,
    markReassemblyComplete,
    setLastActivity,
    setGraphicsQuality
  } = useGameState();

  const doneStages = playerProfile.labMissionStages[machine.id] || [];
  const [mode, setMode] = useState<Mode>('mission');
  const [view, setView] = useState<View>('3d');
  const [missionLink, setLink] = useState(() => (machine.id === 'centrifugal-pump' ? getMissionLink() : null));
  const [stageIdx, setStageIdx] = useState(() => {
    const linked = missionLink ? MISSION_STAGES.findIndex((s) => s.id === missionLink.labStage) : -1;
    if (linked !== -1) return linked;
    const i = MISSION_STAGES.findIndex((s) => !doneStages.includes(s.id));
    return i === -1 ? 0 : i;
  });
  const stage: MissionStage = MISSION_STAGES[stageIdx];

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

  // Missão
  const [explored, setExplored] = useState<string[]>([]);
  const [identifyIdx, setIdentifyIdx] = useState(0);
  const [disStep, setDisStep] = useState(0);
  const [reStep, setReStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showHint, setShowHint] = useState(false);
  const [checkPhase, setCheckPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [checkScore, setCheckScore] = useState<{ score: number; total: number } | null>(null);
  /** "Tentar sozinho": sem destaque da peça; depois da peça certa, o aluno escolhe a ferramenta. */
  const [solo, setSolo] = useState(false);
  const [soloAsk, setSoloAsk] = useState(false);
  const [cutaway, setCutaway] = useState(false);
  /** Simulação "em operação" (só nos modelos com animação de giro). */
  const [running, setRunning] = useState(false);
  const [ortho, setOrtho] = useState(false);
  /** Liberação para manutenção confirmada (só nos equipamentos com checklist). */
  const [released, setReleased] = useState(false);
  /** Etapa cuja pergunta de verificação ainda não foi respondida (libera a próxima). */
  const [pendingQuiz, setPendingQuiz] = useState<number | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const [presenting, setPresenting] = useState(() => isPresentationHash(machine.id));
  // A ilustração 2D existe só para equipamentos com etapas 2D cadastradas.
  const has2D = machine.disassemblySteps.length > 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeSceneEngine | null>(null);
  const partById = useMemo(() => Object.fromEntries(machine.parts.map((p) => [p.id, p])), [machine]);
  const steps = config.disassembly;
  const N = steps.length;
  const needsRelease = !!config.preWorkChecklist?.length && !released;

  useEffect(() => {
    setLastActivity('lab', `Laboratório 3D: ${machine.name}`, machine.id);
  }, [machine.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeStage = useCallback(
    (id: MissionStage['id']) => {
      recordLabStage(machine.id, id);
    },
    [machine.id, recordLabStage]
  );

  /* ─────────── Clique em peça (vindo do 3D ou da lista) ─────────── */
  const handlePartRef = useRef<(id: string) => void>(() => undefined);
  handlePartRef.current = (id: string) => {
    if (animating) return;
    const part = partById[id];
    if (!part) return;

    if (mode === 'free') {
      setSelectedId(id);
      inspectItem(id);
      return;
    }

    switch (stage.id) {
      case 'conhecer':
      case 'explorar': {
        setSelectedId(id);
        inspectItem(id);
        if (stage.id === 'explorar' && !explored.includes(id)) {
          const next = [...explored, id];
          setExplored(next);
          if (next.length >= 3) {
            completeStage('explorar');
            setFeedback({ tone: 'success', text: 'Muito bem! Você inspecionou 3 peças. Pode continuar explorando ou seguir para a próxima etapa.' });
          }
        }
        break;
      }
      case 'identificar': {
        const target = config.identify[identifyIdx];
        if (!target) return;
        if (id === target.partId) {
          setSelectedId(id);
          inspectItem(id);
          setFeedback({ tone: 'success', text: `Isso! Esta é a peça: ${shortName(part)}.` });
          setShowHint(false);
          if (identifyIdx + 1 >= config.identify.length) {
            completeStage('identificar');
          }
          setIdentifyIdx((i) => i + 1);
        } else {
          setFeedback({ tone: 'error', text: `Essa é a peça “${shortName(part)}”. Tente de novo — use a dica se precisar.` });
        }
        break;
      }
      case 'desmontar': {
        if (needsRelease) {
          setFeedback({ tone: 'error', text: 'Primeiro libere a bomba: confirme os itens de bloqueio e isolamento no painel.' });
          return;
        }
        if (pendingQuiz !== null) {
          setFeedback({ tone: 'hint', text: 'Responda a pergunta da etapa no painel para seguir.' });
          return;
        }
        if (disStep >= N || soloAsk) return;
        const expected = steps[disStep];
        if (id === expected.partId) {
          if (solo && expected.toolDistractors?.length) {
            setSelectedId(id);
            setSoloAsk(true);
            setShowHint(false);
            setFeedback({ tone: 'hint', text: `Peça certa: ${shortName(part)}. Agora escolha a ferramenta.` });
          } else runDisassembly();
        } else
          setFeedback({
            tone: 'error',
            text: solo
              ? `Ainda não dá para retirar “${shortName(part)}”: outra peça está bloqueando o caminho. Pense no que está mais por fora — ou peça uma dica.`
              : `Ainda não dá para retirar “${shortName(part)}”: outra peça está bloqueando o caminho. Próxima etapa: ${expected.title.toLowerCase()}.`
          });
        break;
      }
      case 'montar': {
        if (pendingQuiz !== null) {
          setFeedback({ tone: 'hint', text: 'Responda a pergunta da etapa no painel para seguir.' });
          return;
        }
        if (reStep >= N) return;
        const expected = steps[N - 1 - reStep];
        if (id === expected.partId) runReassembly();
        else
          setFeedback({
            tone: 'error',
            text: `Instalar “${shortName(part)}” agora não dá: ela depende de outra peça já estar no lugar. Pense no que fica mais por dentro.`
          });
        break;
      }
      default:
        setSelectedId(id);
    }
  };

  const runDisassembly = () => {
    const step = steps[disStep];
    if (!step || animating || needsRelease || pendingQuiz !== null) return;
    pendingRef.current = 'dis';
    setAnimating(true);
    setSoloAsk(false);
    setShowHint(false);
    setSelectedId(step.partId);
    setFeedback({ tone: 'success', text: `Correto: ${step.title.toLowerCase()}.` });
    engineRef.current?.animateStep(disStep, 1);
    if (!engineRef.current) onAnimationDone();
  };

  const chooseTool = (ok: boolean, why: string) => {
    if (ok) {
      runDisassembly();
      setFeedback({ tone: 'success', text: `Ferramenta certa. ${why}` });
    } else setFeedback({ tone: 'error', text: `Não é a melhor escolha: ${why} Tente outra.` });
  };

  const runReassembly = () => {
    const k = N - 1 - reStep;
    const step = steps[k];
    if (!step || animating || pendingQuiz !== null) return;
    pendingRef.current = 're';
    setAnimating(true);
    setSelectedId(step.partId);
    setShowHint(false);
    setFeedback({ tone: 'success', text: `Correto! Peça instalada: ${shortName(partById[step.partId])}.` });
    engineRef.current?.animateStep(k, -1);
    if (!engineRef.current) onAnimationDone();
  };

  /** Volta uma etapa: a peça faz o caminho de volta (na montagem, sai de novo). */
  const undoStep = () => {
    if (animating) return;
    if (stage.id === 'desmontar' && disStep > 0) {
      pendingRef.current = 'dis-undo';
      setAnimating(true);
      setPendingQuiz(null);
      setSoloAsk(false);
      setSelectedId(steps[disStep - 1].partId);
      setFeedback({ tone: 'hint', text: `Etapa desfeita: ${shortName(partById[steps[disStep - 1].partId])} voltou para o lugar.` });
      engineRef.current?.animateStep(disStep - 1, -1);
    } else if (stage.id === 'montar' && reStep > 0) {
      const k = N - reStep;
      pendingRef.current = 're-undo';
      setAnimating(true);
      setPendingQuiz(null);
      setSelectedId(steps[k].partId);
      setFeedback({ tone: 'hint', text: `Etapa desfeita: ${shortName(partById[steps[k].partId])} saiu de novo.` });
      engineRef.current?.animateStep(k, 1);
    } else return;
    if (!engineRef.current) onAnimationDone();
  };

  const finishDisassembly = () => {
    completeStage('desmontar');
    markDisassemblyComplete(machine.id);
    setFeedback({ tone: 'success', text: 'Desmontagem concluída na ordem correta! Agora monte o equipamento de novo.' });
  };
  const finishReassembly = () => {
    completeStage('montar');
    markReassemblyComplete(machine.id);
    setFeedback({
      tone: 'success',
      text: config.returnToService?.length
        ? 'Equipamento montado! Antes de ligar, siga a lista de devolução para a operação.'
        : 'Equipamento montado! No trabalho real, o aperto final dos parafusos é feito com torquímetro, em cruz.'
    });
  };

  /** Pergunta da etapa respondida certo: libera a próxima (ou conclui). */
  const passQuiz = () => {
    setPendingQuiz(null);
    setFeedback(null);
    if (stage.id === 'desmontar' && disStep >= N) finishDisassembly();
    if (stage.id === 'montar' && reStep >= N) finishReassembly();
  };

  const onAnimationDoneRef = useRef<() => void>(() => undefined);
  const onAnimationDone = () => onAnimationDoneRef.current();
  onAnimationDoneRef.current = () => {
    if (!animating) return;
    const kind = pendingRef.current;
    pendingRef.current = null;
    setAnimating(false);
    if (kind === 'dis') {
      const done = steps[disStep];
      const next = disStep + 1;
      setDisStep(next);
      if (done?.quiz) setPendingQuiz(disStep);
      else if (next >= N) finishDisassembly();
    } else if (kind === 'dis-undo') {
      setDisStep((d) => Math.max(0, d - 1));
    } else if (kind === 're') {
      const k = N - 1 - reStep;
      const next = reStep + 1;
      setReStep(next);
      if (steps[k]?.assembly?.quiz) setPendingQuiz(k);
      else if (next >= N) finishReassembly();
    } else if (kind === 're-undo') {
      setReStep((r) => Math.max(0, r - 1));
    }
  };

  /* ─────────── Ciclo de vida do motor 3D ─────────── */
  useEffect(() => {
    if (view !== '3d' || !containerRef.current) return;
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
        onAnimationDone: () => onAnimationDoneRef.current(),
        onWebGLError: (msg) => setWebglError(msg),
        onSlowDevice: () => setSlowDevice(true)
      }
    });
    engineRef.current = engine;
    // Acesso para testes automatizados no modo de desenvolvimento (não vai para o build de produção).
    if (import.meta.env.DEV) (window as unknown as { __mlEngine?: ThreeSceneEngine }).__mlEngine = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [view, graphicsQuality, reducedMotion, engineKey, machine, config]);

  /* ─────────── Sincroniza o estado da missão com a cena ─────────── */
  useEffect(() => {
    const e = engineRef.current;
    if (!e || loadState !== 'loaded' || presenting) return;
    if (mode === 'free') {
      e.setExplode(explode / 100);
      e.setXray(xray);
      e.setLabelsVisible(labels);
      e.setIsolated(isolated);
      e.setHidden(hiddenIds);
      e.setTarget(null);
      e.jumpToPose(0);
      return;
    }
    e.setIsolated(null);
    e.setHidden([]);
    e.setExplode(0);
    const target = config.identify[identifyIdx];
    switch (stage.id) {
      case 'conhecer':
        // Vista geral explodida: todas as peças aparecem separadas e nomeadas.
        e.jumpToPose(0);
        e.setExplode(0.7);
        e.setXray(false);
        e.setLabelsVisible(true);
        e.setTarget(null);
        break;
      case 'explorar':
        e.jumpToPose(0);
        e.setXray(xray);
        e.setLabelsVisible(labels);
        e.setTarget(null);
        break;
      case 'identificar':
        e.jumpToPose(0);
        e.setXray(Boolean(target?.needsXray) || xray);
        e.setLabelsVisible(false);
        e.setTarget(showHint && target ? target.partId : null);
        break;
      case 'desmontar':
        if (!animating) e.jumpToPose(disStep);
        e.setXray(false);
        e.setLabelsVisible(false);
        e.setTarget(disStep < N && (!solo || showHint) ? steps[disStep].partId : null);
        break;
      case 'montar':
        if (!animating) e.jumpToPose(N - reStep);
        e.setXray(false);
        e.setLabelsVisible(false);
        e.setTarget(showHint && reStep < N ? steps[N - 1 - reStep].partId : null);
        break;
      case 'verificar':
        e.jumpToPose(0);
        e.setExplode(0.7);
        e.setXray(false);
        e.setLabelsVisible(true);
        e.setTarget(null);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadState, mode, stage.id, identifyIdx, disStep, reStep, showHint, xray, labels, explode, isolated, hiddenIds, solo, presenting]);

  useEffect(() => {
    if (!presenting) engineRef.current?.select(selectedId);
  }, [selectedId, loadState, presenting]);

  useEffect(() => {
    if (loadState === 'loaded' && !presenting) engineRef.current?.setCutaway(cutaway);
  }, [cutaway, loadState, presenting]);

  useEffect(() => {
    if (loadState === 'loaded') engineRef.current?.setProjection(ortho);
  }, [ortho, loadState]);

  // Só gira com o conjunto montado: nas etapas de conhecer/explorar ou no modo livre sem vista explodida.
  const canOperate = !!config.operating && (mode === 'free' ? explode === 0 : stage.id === 'conhecer' || stage.id === 'explorar');
  const operating = running && canOperate;
  useEffect(() => {
    if (loadState === 'loaded' && !presenting) engineRef.current?.setRunning(operating);
  }, [operating, loadState, presenting]);

  const presentButtonRef = useRef<HTMLElement | null>(null);
  const closePresentation = useCallback(() => {
    setPresenting(false);
    if (isPresentationHash(machine.id)) window.history.replaceState(null, '', `#/lab/${machine.id}`);
    engineRef.current?.resetCamera();
    // Devolve o foco para quem abriu a apresentação.
    window.setTimeout(() => presentButtonRef.current?.focus(), 0);
  }, [machine.id]);

  // Ao mudar de etapa, limpa o retorno e reinicia o progresso da etapa
  const goToStage = (i: number) => {
    setStageIdx(i);
    setFeedback(null);
    setShowHint(false);
    setSelectedId(null);
    setAnimating(false);
    setSoloAsk(false);
    setPendingQuiz(null);
    pendingRef.current = null;
    const id = MISSION_STAGES[i].id;
    if (id === 'identificar') setIdentifyIdx(0);
    if (id === 'desmontar') setDisStep(0);
    if (id === 'montar') setReStep(0);
    if (id === 'verificar') setCheckPhase('intro');
  };

  const checkQuestions = useMemo(
    () => config.checkQuestionIds.map((id) => PRACTICE_QUESTIONS_BY_ID[id]).filter(Boolean),
    [config.checkQuestionIds]
  );

  const finishCheck = (answers: AnswerResult[]) => {
    const score = answers.filter((a) => a.correct).length;
    setCheckScore({ score, total: answers.length });
    setCheckPhase('done');
    if (score / answers.length >= 0.6) completeStage('verificar');
  };

  const selectedPart = selectedId ? partById[selectedId] : null;
  const hoveredPart = hoveredId ? partById[hoveredId] : null;
  const missionDone = MISSION_STAGES.every((s) => (playerProfile.labMissionStages[machine.id] || []).includes(s.id));

  /* ─────────── Render ─────────── */
  return (
    <div className="flex h-full flex-col">
      {missionLink && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-ink-800 bg-ink-900 px-3 py-1.5 text-sm text-ink-200 sm:px-4">
          <span>
            Etapa da {missionLink.code}
            {doneStages.includes(missionLink.labStage) ? ': concluída. Sua evidência foi registrada.' : ''}
          </span>
          <button
            className="link"
            onClick={() => {
              const id = missionLink.missionId;
              clearMissionLink();
              setLink(null);
              navigateTo('missions', id);
            }}
          >
            Voltar à {missionLink.code}
          </button>
        </div>
      )}
      {mode === 'free' && (
        <p className="shrink-0 border-b border-ink-800 bg-ink-900 px-3 py-1 text-xs text-ink-300 sm:px-4">Exploração livre: nada aqui conta como avaliação.</p>
      )}
      {/* Barra superior compacta */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-800 bg-ink-950 px-3 py-2 sm:px-4">
        <MachineSwitcher current={machine.id} onSwitch={onSwitchMachine} />
        <div role="tablist" aria-label="Modo" className="segmented">
          {(
            [
              ['mission', 'Missão guiada', 'Missão'],
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
                setPendingQuiz(null);
                pendingRef.current = null;
              }}
              
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {has2D && (
          <div role="tablist" aria-label="Visualização" className="segmented">
            {(
              [
                ['3d', '3D', '3D'],
                ['2d', 'Ilustração 2D', '2D']
              ] as [View, string, string][]
            ).map(([v, label, short]) => (
              <button
                key={v}
                role="tab"
                aria-label={label}
                aria-selected={view === v}
                onClick={() => setView(v)}
                
              >
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          )}
          <div className="relative">
            <button
              onClick={() => setShowAccuracy((v) => !v)}
              aria-expanded={showAccuracy}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-950/30 px-2.5 text-xs font-medium text-amber-200 hover:bg-amber-950/50"
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">{config.accuracy.label}</span>
              <span className="sm:hidden">Simplificado</span>
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
      </div>

      {view === '2d' && has2D ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingState label="Carregando ilustração…" />}>
            <AnatomyMechanicalExplorer
              machine={machine}
              selectedPart={selectedPart || machine.parts[0]}
              onSelectPart={(p) => p && setSelectedId(p.id)}
              currentStepIdx={disStep}
              onStepChange={setDisStep}
              onSwitchTo3D={() => setView('3d')}
            />
          </Suspense>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Viewport 3D */}
          <div
            className={
              presenting
                ? 'fixed inset-0 z-[100] overflow-hidden bg-[#1a1b19]'
                : 'relative h-[46vh] shrink-0 overflow-hidden bg-[#1a1b19] lg:h-auto lg:min-w-0 lg:flex-1'
            }
          >
            <div ref={containerRef} className="absolute inset-0" />
            <div ref={labelLayerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              {machine.parts.map((p) => (
                <span
                  key={p.id}
                  data-part-label={p.id}
                  className="absolute left-0 top-0 whitespace-nowrap rounded-md border border-ink-600 bg-ink-950/90 px-2 py-1 text-xs font-medium text-ink-100 opacity-0 shadow transition-opacity data-[state=selected]:border-accent data-[state=target]:border-amber-400"
                >
                  {shortName(p)}
                </span>
              ))}
            </div>

            {presenting && (
              <PresentationMode machine={machine} config={config} engine={engineRef.current} ready={loadState === 'loaded'} onClose={closePresentation} />
            )}
            {slowDevice && graphicsQuality === 'high' && !presenting && (
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
            {hoveredPart && !presenting && (
              <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-ink-700 bg-ink-950/90 px-3 py-1.5 text-sm text-ink-100">
                {shortName(hoveredPart)}
              </div>
            )}

            {loadState === 'loading' && !webglError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1a1b19]">
                <LoadingState label="Montando o modelo 3D…" />
              </div>
            )}
            {(loadState === 'error' || webglError) && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1a1b19]/95 p-6">
                <div role="alert" className="card max-w-sm p-5">
                  <p className="flex items-center gap-2 font-semibold text-amber-200">
                    <AlertTriangle className="h-5 w-5" aria-hidden /> O 3D não carregou
                  </p>
                  <p className="mt-2 text-sm text-ink-300">{webglError || loadMessage}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!webglError && (
                      <button className="btn-primary" onClick={() => setEngineKey((k) => Math.abs(k) + 1)}>
                        <RefreshCw className="h-4 w-4" aria-hidden /> Tentar de novo
                      </button>
                    )}
                    {has2D && (
                      <button className="btn-secondary" onClick={() => setView('2d')}>
                        Usar ilustração 2D
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Controles de câmera e visualização */}
            {!presenting && (
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
              cutaway={config.cutawayParts?.length ? cutaway : null}
              onCutaway={() => setCutaway((v) => !v)}
              running={canOperate ? operating : null}
              runLabel={config.operating?.label}
              onRun={() => setRunning((v) => !v)}
              ortho={ortho}
              onOrtho={() => setOrtho((v) => !v)}
              onPresent={() => {
                presentButtonRef.current = document.activeElement as HTMLElement | null;
                setRunning(false);
                setPresenting(true);
              }}
            />
            )}
            {operating && config.operating && !presenting && (
              <div className="pointer-events-none absolute inset-x-2 bottom-[4.5rem] z-10 mx-auto max-w-xl rounded-lg border border-ink-700 bg-ink-950/90 px-3 py-2 text-xs leading-snug text-ink-200 sm:text-sm" role="status" data-testid="lab-operating-note">
                <strong className="text-accent-text">Em operação (simulação). </strong>
                {config.operating.observe}
              </div>
            )}
          </div>

          {/* Painel lateral */}
          <aside className="min-h-0 flex-1 overflow-y-auto border-t border-ink-800 bg-ink-900 lg:w-[400px] lg:flex-none lg:border-l lg:border-t-0" aria-label="Painel do laboratório">
            <div className="p-4 sm:p-5">
              {mode === 'mission' ? (
                <>
                  <MissionStepper machineId={machine.id} current={stageIdx} onSelect={goToStage} />
                  <div className="mt-4">
                    {stage.id === 'conhecer' && (
                      <StageIntro machine={machine} config={config} onNext={() => {
                        completeStage('conhecer');
                        goToStage(1);
                      }} />
                    )}
                    {stage.id === 'explorar' && (
                      <StageBox
                        title="Explore o equipamento em 3D"
                        text="Arraste para girar, use a roda do mouse (ou dois dedos) para aproximar e clique nas peças para ver o que cada uma faz."
                      >
                        <p className="mt-3 text-sm text-ink-300">
                          Tarefa: inspecione <strong className="text-ink-100">3 peças diferentes</strong> ({Math.min(3, explored.length)}/3).
                        </p>
                        <p className="mt-1 text-sm text-ink-400">Dica: ligue o raio-X (ícone de olho) para ver as peças internas.</p>
                        <NextButton disabled={explored.length < 3} onClick={() => goToStage(2)} label="Identificar as peças" />
                      </StageBox>
                    )}
                    {stage.id === 'identificar' && (
                      <StageBox title="Identifique as peças" text="Encontre cada peça no modelo e clique nela.">
                        {identifyIdx < config.identify.length ? (
                          <>
                            <p className="mt-3 text-sm text-ink-400">
                              Peça {identifyIdx + 1} de {config.identify.length}
                            </p>
                            <p className="mt-1 text-base font-semibold text-ink-100">{config.identify[identifyIdx].prompt}</p>
                            <button onClick={() => setShowHint(true)} className="btn-ghost mt-2 px-0" disabled={showHint}>
                              <Lightbulb className="h-4 w-4" aria-hidden /> {showHint ? config.identify[identifyIdx].hint : 'Ver dica'}
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="mt-3 text-base font-semibold text-emerald-300">Você identificou todas as peças!</p>
                            <NextButton onClick={() => goToStage(3)} label="Desmontar em sequência" />
                          </>
                        )}
                      </StageBox>
                    )}
                    {stage.id === 'desmontar' && needsRelease && config.preWorkChecklist && (
                      <PreWorkChecklist
                        items={config.preWorkChecklist}
                        onRelease={() => {
                          setReleased(true);
                          setFeedback({ tone: 'success', text: 'Bomba liberada: bloqueada, isolada, drenada e fria. Agora sim, a primeira etapa.' });
                        }}
                      />
                    )}
                    {stage.id === 'desmontar' && !needsRelease && (
                      <ProcedurePanel
                        mode="desmontar"
                        stepNumber={disStep}
                        total={N}
                        step={disStep < N ? steps[disStep] : null}
                        guided={!solo || showHint}
                        onHint={() => setShowHint(true)}
                        solo={solo}
                        onToggleSolo={(v) => {
                          setSolo(v);
                          setSoloAsk(false);
                          setShowHint(false);
                          setFeedback(null);
                        }}
                        soloAsk={soloAsk}
                        onChooseTool={chooseTool}
                        lastStep={disStep > 0 ? steps[disStep - 1] : null}
                        allSteps={steps}
                        animating={animating}
                        onExecute={runDisassembly}
                        onRestart={() => {
                          setDisStep(0);
                          setSoloAsk(false);
                          setPendingQuiz(null);
                          setFeedback(null);
                        }}
                        onUndo={undoStep}
                        quiz={pendingQuiz !== null ? steps[pendingQuiz]?.quiz ?? null : null}
                        quizSeed={machine.id.length * 101 + (pendingQuiz ?? 0) * 37}
                        onQuizPass={passQuiz}
                        onNext={() => goToStage(4)}
                        partName={(id) => shortName(partById[id])}
                      />
                    )}
                    {stage.id === 'montar' && (
                      <ProcedurePanel
                        mode="montar"
                        stepNumber={reStep}
                        total={N}
                        step={reStep < N ? steps[N - 1 - reStep] : null}
                        guided={showHint}
                        onHint={() => setShowHint(true)}
                        animating={animating}
                        onExecute={runReassembly}
                        onRestart={() => {
                          setReStep(0);
                          setPendingQuiz(null);
                          setFeedback(null);
                        }}
                        onUndo={undoStep}
                        lastStep={reStep > 0 ? steps[N - reStep] : null}
                        quiz={pendingQuiz !== null ? steps[pendingQuiz]?.assembly?.quiz ?? null : null}
                        quizSeed={machine.id.length * 131 + (pendingQuiz ?? 0) * 41}
                        onQuizPass={passQuiz}
                        returnToService={config.returnToService}
                        onNext={() => goToStage(5)}
                        allSteps={steps}
                        partName={(id) => shortName(partById[id])}
                      />
                    )}
                    {stage.id === 'verificar' && (
                      <div>
                        {checkPhase === 'intro' && (
                          <StageBox title="Verifique o aprendizado" text={`${checkQuestions.length} questões rápidas sobre o equipamento e as ferramentas usadas.`}>
                            <button className="btn-primary mt-4 w-full" onClick={() => setCheckPhase('running')}>
                              Começar
                            </button>
                          </StageBox>
                        )}
                        {checkPhase === 'running' && (
                          <QuestionRunner
                            questions={checkQuestions}
                            contextLabel="Verificação da missão"
                            seed={machine.id.length * 1000 + 7}
                            onFinish={finishCheck}
                            onExit={() => setCheckPhase('intro')}
                          />
                        )}
                        {checkPhase === 'done' && checkScore && (
                          <StageBox
                            title={checkScore.score / checkScore.total >= 0.6 ? 'Missão concluída!' : 'Quase lá!'}
                            text={`Você acertou ${checkScore.score} de ${checkScore.total}.`}
                          >
                            {missionDone && (
                              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" aria-hidden /> Todas as etapas desta missão foram concluídas.
                              </p>
                            )}
                            <div className="mt-4 flex flex-col gap-2">
                              <button className="btn-primary" onClick={() => navigateTo('quiz', config.lessonId)}>
                                <BookOpen className="h-4 w-4" aria-hidden /> Ir para a aula relacionada
                              </button>
                              <button className="btn-secondary" onClick={() => setCheckPhase('running')}>
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
                  parts={machine.parts}
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
                  onToggleGroup={(ids, hide) =>
                    setHiddenIds((cur) => (hide ? Array.from(new Set([...cur, ...ids])) : cur.filter((x) => !ids.includes(x))))
                  }
                  onReset={() => {
                    setHiddenIds([]);
                    setIsolated(null);
                    setExplode(0);
                    setXray(false);
                    setLabels(false);
                    setCutaway(false);
                    setRunning(false);
                    setOrtho(false);
                    setSelectedId(null);
                    engineRef.current?.resetCamera();
                  }}
                />
              )}

              {/* Lista acessível de peças (alternativa ao clique no 3D) */}
              {mode === 'mission' && ['conhecer', 'explorar', 'identificar', 'desmontar', 'montar'].includes(stage.id) && (
                <PartListDisclosure
                  parts={machine.parts}
                  label={stage.id === 'identificar' || stage.id === 'desmontar' || stage.id === 'montar' ? 'Não consegue clicar no 3D? Escolha pela lista' : 'Lista de peças'}
                  defaultOpen={stage.id === 'conhecer' || stage.id === 'explorar'}
                  selectedId={selectedId}
                  onSelect={(id) => handlePartRef.current(id)}
                />
              )}

              {selectedPart && (stage.id !== 'verificar' || mode === 'free') && (
                <PartInfo
                  part={selectedPart}
                  lessonId={config.lessonId}
                  onFocus={() => engineRef.current?.focusPart(selectedPart.id)}
                  onShow2D={has2D ? () => setView('2d') : undefined}
                />
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── Subcomponentes ─────────────────────────── */

const MissionStepper: React.FC<{ machineId: string; current: number; onSelect: (i: number) => void }> = ({ machineId, current, onSelect }) => {
  const { playerProfile } = useGameState();
  const done = playerProfile.labMissionStages[machineId] || [];
  return (
    <nav aria-label="Etapas da missão">
      <p className="text-sm text-ink-400">
        Missão · etapa {current + 1} de {MISSION_STAGES.length}
      </p>
      <h2 className="text-lg font-semibold text-ink-100">{MISSION_STAGES[current].label}</h2>
      <ol className="mt-3 grid grid-cols-6 gap-1">
        {MISSION_STAGES.map((s, i) => {
          const isDone = done.includes(s.id);
          const active = i === current;
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                title={s.label}
                className={`flex w-full flex-col items-center gap-1 rounded-md py-1.5 text-[11px] ${
                  active ? 'bg-accent-soft text-ink-100' : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200'
                }`}
              >
                <span
                  className={`h-1.5 w-full rounded-full ${active ? 'bg-accent' : isDone ? 'bg-emerald-500' : 'bg-ink-700'}`}
                  aria-hidden
                />
                <span className="hidden sm:block">{s.short}</span>
                <span className="sr-only">{isDone ? '(concluída)' : ''}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export const StageBox: React.FC<{ title: string; text: string; children?: React.ReactNode }> = ({ title, text, children }) => (
  <div className="rounded-xl border border-ink-800 bg-ink-850 p-4">
    <h3 className="text-base font-semibold text-ink-100">{title}</h3>
    <p className="mt-1 text-sm leading-relaxed text-ink-300">{text}</p>
    {children}
  </div>
);

export const NextButton: React.FC<{ onClick: () => void; label: string; disabled?: boolean }> = ({ onClick, label, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="btn-primary mt-4 w-full">
    {label} <ArrowRight className="h-4 w-4" aria-hidden />
  </button>
);

export const FeedbackBox: React.FC<{ feedback: NonNullable<Feedback> }> = ({ feedback }) => (
  <div
    role="status"
    className={`mt-3 rounded-xl border p-3.5 text-sm leading-relaxed ${
      feedback.tone === 'success'
        ? 'border-emerald-700/60 bg-emerald-950/30 text-emerald-100'
        : feedback.tone === 'error'
        ? 'border-amber-700/50 bg-amber-950/20 text-amber-100'
        : 'border-ink-700 bg-ink-850 text-ink-200'
    }`}
  >
    {feedback.text}
  </div>
);

const StageIntro: React.FC<{ machine: MachineData; config: MachineLabConfig; onNext: () => void }> = ({ machine, config, onNext }) => (
  <div>
    <div className="rounded-xl border border-ink-800 bg-ink-850 p-4">
      <h3 className="text-base font-semibold text-ink-100">Para que serve</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-300">{config.purpose}</p>
      <p className="mt-2 text-sm text-ink-400">
        <span className="font-medium text-ink-300">Onde se usa: </span>
        {config.whereUsed}
      </p>
    </div>
    {machine.id === 'centrifugal-pump' && (
      <figure className="mt-3 overflow-hidden rounded-xl border border-ink-800 bg-paper">
        <PumpIsoFigure label="Vista geral da bomba com as peças numeradas" exploded={0.5} showLabels compactLegend />
        <figcaption className="sr-only">Ilustração 2D com as sete peças principais numeradas.</figcaption>
      </figure>
    )}
    <RenderedFilm machineId={machine.id} />
    <div className="mt-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-200">
        <ShieldAlert className="h-4 w-4" aria-hidden /> Antes de qualquer manutenção
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-amber-100/90">
        {(config.preWorkSafety ?? ['Desligar, bloquear com cadeado e etiqueta e testar a partida (LOTO).']).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
    <NextButton onClick={onNext} label="Explorar em 3D" />
  </div>
);

type Step = MachineLabConfig['disassembly'][number];

/** Lista de revisão: ordem, ferramenta, cuidado e ponto de inspeção de cada etapa. */
const ProcedureReview: React.FC<{ steps: Step[]; partName: (id: string) => string; reverse?: boolean }> = ({ steps, partName, reverse }) => (
  <details className="mt-3 rounded-lg border border-ink-700 bg-ink-900">
    <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-100">
      <ListChecks className="h-4 w-4 text-accent" aria-hidden /> Revisar procedimento ({steps.length} etapas)
    </summary>
    <ol className="space-y-3 border-t border-ink-800 px-3 py-3 text-sm">
      {(reverse ? [...steps].reverse() : steps).map((st, i) => {
        const a = reverse ? st.assembly : undefined;
        return (
          <li key={st.partId}>
            <p className="font-medium text-ink-100">
              {i + 1}. {a ? a.title : reverse ? `Instalar: ${partName(st.partId)}` : st.title}
            </p>
            <p className="mt-0.5 text-ink-300">
              <span className="text-ink-400">Ferramenta: </span>
              {a ? a.tool : st.tool}
            </p>
            {(a ? a.safety : st.safety) && <p className="mt-0.5 text-amber-100/90">Cuidado: {a ? a.safety : st.safety}</p>}
            {!reverse && st.observe && <p className="mt-0.5 text-ink-300">Observar: {st.observe}</p>}
            {a && <p className="mt-0.5 text-ink-300">Conferir: {a.check}</p>}
          </li>
        );
      })}
    </ol>
  </details>
);

const ProcedurePanel: React.FC<{
  mode: 'desmontar' | 'montar';
  stepNumber: number;
  total: number;
  step: Step | null;
  guided: boolean;
  onHint?: () => void;
  /** Modo "Tentar sozinho" (só na desmontagem). */
  solo?: boolean;
  onToggleSolo?: (v: boolean) => void;
  soloAsk?: boolean;
  onChooseTool?: (ok: boolean, why: string) => void;
  /** Última etapa concluída (desmontagem: o que observar; montagem: o que conferir). */
  lastStep?: Step | null;
  allSteps: Step[];
  animating: boolean;
  onExecute: () => void;
  onRestart: () => void;
  /** Volta uma etapa (a peça refaz o caminho). */
  onUndo?: () => void;
  /** Pergunta pendente da etapa que acabou de ser feita: bloqueia a próxima até a resposta certa. */
  quiz?: StepQuiz | null;
  quizSeed?: number;
  onQuizPass?: () => void;
  /** Lista de devolução para a operação, mostrada ao fim da montagem. */
  returnToService?: MachineLabConfig['returnToService'];
  onNext: () => void;
  partName: (id: string) => string;
}> = ({
  mode,
  stepNumber,
  total,
  step,
  guided,
  onHint,
  solo,
  onToggleSolo,
  soloAsk,
  onChooseTool,
  lastStep,
  allSteps,
  animating,
  onExecute,
  onRestart,
  onUndo,
  quiz,
  quizSeed = 1,
  onQuizPass,
  returnToService,
  onNext,
  partName
}) => {
  const done = stepNumber >= total;
  const isMount = mode === 'montar';
  // Textos da montagem, quando existem; senão, os da desmontagem.
  const a = isMount ? step?.assembly : undefined;
  const tool = a ? a.tool : step?.tool;
  const toolWhy = a ? a.toolWhy : step?.toolWhy;
  const safety = a ? a.safety : step?.safety;
  // Opções de ferramenta em ordem fixa por etapa (sem sorteio a cada renderização).
  const toolOptions = useMemo(() => {
    if (!step) return [];
    const opts = [{ tool: step.tool, why: step.toolWhy, ok: true }, ...(step.toolDistractors || []).map((d) => ({ ...d, ok: false }))];
    const k = stepNumber % opts.length;
    return [...opts.slice(k), ...opts.slice(0, k)];
  }, [step, stepNumber]);
  const lastNote = !animating && lastStep ? (isMount ? lastStep.assembly?.check : lastStep.observe) : undefined;
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-850 p-4" data-testid={`procedure-${mode}`}>
      {!isMount && onToggleSolo && (
        <div role="radiogroup" aria-label="Como fazer a desmontagem" className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-ink-700 p-0.5 text-sm">
          {(
            [
              [false, 'Passo a passo'],
              [true, 'Tentar sozinho']
            ] as [boolean, string][]
          ).map(([v, label]) => (
            <button
              key={label}
              role="radio"
              aria-checked={Boolean(solo) === v}
              disabled={animating}
              onClick={() => onToggleSolo(v)}
              className={`rounded-md px-2 py-1.5 font-medium ${Boolean(solo) === v ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-sm text-ink-400">
        <span>{isMount ? 'Montagem' : 'Desmontagem'}</span>
        <span>
          {Math.min(stepNumber, total)}/{total} etapas
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700"
        role="progressbar"
        aria-label={isMount ? 'Progresso da montagem' : 'Progresso da desmontagem'}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(stepNumber, total)}
      >
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${(Math.min(stepNumber, total) / total) * 100}%` }} />
      </div>

      {!isMount && lastStep?.result && !animating && (
        <p className="mt-3 flex gap-2 text-sm text-emerald-100/90">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
          <span>
            <span className="font-semibold">Resultado esperado: </span>
            {lastStep.result}
          </span>
        </p>
      )}
      {lastNote && lastStep && (
        <p className="mt-3 rounded-lg border border-sky-800/50 bg-sky-950/20 p-3 text-sm text-sky-100">
          <span className="font-semibold">
            {isMount ? `Confira depois de instalar (${partName(lastStep.partId)}): ` : `Observe na peça retirada (${partName(lastStep.partId)}): `}
          </span>
          {lastNote}
        </p>
      )}

      {quiz && onQuizPass ? (
        <StepQuizBox quiz={quiz} seed={quizSeed} onPass={onQuizPass} continueLabel={done ? 'Concluir' : 'Próxima etapa'} />
      ) : !done && step ? (
        <>
          {isMount ? (
            <>
              <h3 className="mt-3 text-base font-semibold text-ink-100">
                {guided && a ? `${stepNumber + 1}. ${a.title}` : 'Qual peça deve ser instalada agora?'}
              </h3>
              {guided && a ? (
                <p className="mt-1 text-sm leading-relaxed text-ink-300">{a.instruction}</p>
              ) : (
                <p className="mt-1 text-sm text-ink-300">
                  Comece pelas peças de dentro. Clique na peça certa no modelo (as peças retiradas estão no piso, à frente do conjunto).
                </p>
              )}
              {guided ? (
                <p className="mt-2 text-sm text-amber-200">Peça: “{partName(step.partId)}”, destacada em amarelo.</p>
              ) : (
                <button onClick={onHint} className="btn-ghost mt-1 px-0">
                  <HelpCircle className="h-4 w-4" aria-hidden /> Preciso de uma dica
                </button>
              )}
            </>
          ) : solo && !guided ? (
            <>
              <h3 className="mt-3 text-base font-semibold text-ink-100">Etapa {stepNumber + 1}: qual peça sai agora?</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-300">
                Sem destaque desta vez. Clique no modelo (ou escolha na lista) a peça que pode ser retirada agora. Depois, escolha a ferramenta.
              </p>
              {!soloAsk && (
                <button onClick={onHint} className="btn-ghost mt-1 px-0">
                  <HelpCircle className="h-4 w-4" aria-hidden /> Preciso de uma dica
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="mt-3 text-base font-semibold text-ink-100">
                {stepNumber + 1}. {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-300">{step.instruction}</p>
              {!soloAsk && <p className="mt-2 text-sm text-ink-400">Clique na peça destacada em amarelo no modelo{solo ? '.' : ', ou use o botão.'}</p>}
            </>
          )}

          {!isMount && solo && soloAsk ? (
            <fieldset className="mt-3 rounded-lg border border-ink-700 bg-ink-900 p-3">
              <legend className="px-1 text-sm font-semibold text-ink-100">Qual ferramenta (ou método) você usaria?</legend>
              <div className="mt-1 flex flex-col gap-2">
                {toolOptions.map((o) => (
                  <button key={o.tool} className="btn-secondary justify-start text-left" disabled={animating} onClick={() => onChooseTool?.(o.ok, o.why)}>
                    <Wrench className="h-4 w-4 shrink-0 text-accent" aria-hidden /> {o.tool}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            (!solo || isMount) && (
              <>
                <div className="mt-3 rounded-lg border border-ink-700 bg-ink-900 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-100">
                    <Wrench className="h-4 w-4 text-accent" aria-hidden /> {isMount && !guided ? 'Ferramenta: aparece depois da escolha' : tool}
                  </p>
                  {(!isMount || guided) && <p className="mt-1 text-sm text-ink-300">{toolWhy}</p>}
                </div>
                {safety && (!isMount || guided) && (
                  <p className="mt-2 flex gap-2 text-sm text-amber-100/90">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden /> {safety}
                  </p>
                )}
                {(!isMount || guided) && !solo && (
                  <button onClick={onExecute} disabled={animating} className="btn-secondary mt-3 w-full">
                    {animating ? 'Movendo peça…' : isMount ? 'Instalar esta peça' : 'Executar esta etapa'}
                  </button>
                )}
              </>
            )
          )}
        </>
      ) : (
        <>
          <p className="mt-3 flex items-center gap-2 text-base font-semibold text-emerald-300">
            <CheckCircle2 className="h-5 w-5" aria-hidden /> {isMount ? 'Montagem concluída' : 'Desmontagem concluída'}
          </p>
          {isMount &&
            (returnToService?.length ? (
              <ReturnToService items={returnToService} />
            ) : (
              <p className="mt-1 text-sm text-ink-300">
                No trabalho real, antes de ligar: aperto final com torquímetro no valor do manual, giro à mão para sentir travamentos, proteções recolocadas e liberação do bloqueio pelo responsável.
              </p>
            ))}
          <ProcedureReview steps={allSteps} partName={partName} reverse={isMount} />
          <NextButton onClick={onNext} label={isMount ? 'Verificar o aprendizado' : 'Montar de novo'} />
        </>
      )}
      {stepNumber > 0 && !animating && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {onUndo && (
            <button onClick={onUndo} className="btn-ghost w-full" data-testid="procedure-undo">
              <Undo2 className="h-4 w-4" aria-hidden /> Voltar uma etapa
            </button>
          )}
          <button onClick={onRestart} className={`btn-ghost w-full ${onUndo ? '' : 'col-span-2'}`}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Recomeçar
          </button>
        </div>
      )}
    </div>
  );
};

export const PartListDisclosure: React.FC<{
  parts: MechanicalPart3D[];
  label: string;
  defaultOpen: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ parts, label, defaultOpen, selectedId, onSelect }) => {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  return (
    <div className="mt-4">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-ink-100">
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {parts.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p.id)}
                aria-pressed={selectedId === p.id}
                className={`rounded-lg border px-2.5 py-1.5 text-sm ${
                  selectedId === p.id ? 'border-accent bg-accent-soft text-ink-100' : 'border-ink-700 text-ink-300 hover:border-ink-500'
                }`}
              >
                {shortName(p)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const FreeModePanel: React.FC<{
  parts: MechanicalPart3D[];
  selectedId: string | null;
  isolated: string | null;
  hiddenIds: string[];
  onSelect: (id: string) => void;
  onIsolate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onShowAll: () => void;
  /** Mostra/oculta todas as peças de uma categoria. Sem ele, os filtros não aparecem. */
  onToggleGroup?: (ids: string[], hide: boolean) => void;
  /** Volta tudo ao estado inicial (montado, sem filtros, câmera padrão). */
  onReset?: () => void;
}> = ({ parts, selectedId, isolated, hiddenIds, onSelect, onIsolate, onToggleHidden, onShowAll, onToggleGroup, onReset }) => {
  const groups = (Object.keys(CATEGORY_LABEL) as MechanicalPart3D['category'][])
    .map((c) => ({ c, ids: parts.filter((p) => p.category === c).map((p) => p.id) }))
    .filter((g) => g.ids.length > 0);
  return (
  <div>
    <h2 className="text-lg font-semibold text-ink-100">Exploração livre</h2>
    <p className="mt-1 text-sm text-ink-300">Gire, aproxime, afaste as peças com o controle “Vista explodida” e clique para ver detalhes.</p>
    {onToggleGroup && groups.length > 1 && (
      <div className="mt-3" role="group" aria-label="Mostrar ou ocultar grupos de peças">
        <p className="text-xs font-medium text-ink-400">Grupos (clique para ocultar ou mostrar)</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {groups.map(({ c, ids }) => {
            const visible = ids.some((id) => !hiddenIds.includes(id));
            return (
              <button
                key={c}
                onClick={() => onToggleGroup(ids, visible)}
                aria-pressed={visible}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  visible ? 'border-ink-600 bg-ink-800 text-ink-100' : 'border-ink-800 text-ink-500 line-through'
                }`}
              >
                {CATEGORY_LABEL[c]} ({ids.length})
              </button>
            );
          })}
        </div>
      </div>
    )}
    <ul className="mt-4 divide-y divide-ink-800 rounded-xl border border-ink-800">
      {parts.map((p) => {
        const hidden = hiddenIds.includes(p.id);
        return (
          <li key={p.id} className={`flex items-center gap-2 px-3 py-2 ${selectedId === p.id ? 'bg-ink-850' : ''}`}>
            <button onClick={() => onSelect(p.id)} className={`flex-1 text-left text-sm ${hidden ? 'text-ink-500 line-through' : 'text-ink-200'}`} aria-pressed={selectedId === p.id}>
              {shortName(p)}
            </button>
            <button
              onClick={() => onIsolate(p.id)}
              aria-pressed={isolated === p.id}
              title="Mostrar só esta peça"
              aria-label={`Mostrar só: ${shortName(p)}`}
              className={`rounded-md p-1.5 ${isolated === p.id ? 'bg-accent-soft text-accent-text' : 'text-ink-400 hover:bg-ink-800'}`}
            >
              <Focus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleHidden(p.id)}
              aria-pressed={hidden}
              title={hidden ? 'Mostrar peça' : 'Ocultar peça'}
              aria-label={`${hidden ? 'Mostrar' : 'Ocultar'}: ${shortName(p)}`}
              className="rounded-md p-1.5 text-ink-400 hover:bg-ink-800"
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </li>
        );
      })}
    </ul>
    <div className="mt-2 flex flex-wrap gap-2">
      {(hiddenIds.length > 0 || isolated) && (
        <button onClick={onShowAll} className="btn-ghost">
          Mostrar todas as peças
        </button>
      )}
      {onReset && (
        <button onClick={onReset} className="btn-ghost" data-testid="free-reset">
          <ListRestart className="h-4 w-4" aria-hidden /> Restaurar montagem
        </button>
      )}
    </div>
  </div>
  );
};

export const PartInfo: React.FC<{ part: MechanicalPart3D; lessonId: string; onFocus: () => void; onShow2D?: () => void }> = ({ part, lessonId, onFocus, onShow2D }) => {
  const { navigateTo } = useGameState();
  const [details, setDetails] = useState(false);
  useEffect(() => setDetails(false), [part.id]);
  return (
    <section aria-labelledby="part-info-title" className="mt-4 rounded-xl border border-ink-700 bg-ink-850 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="eyebrow">Peça selecionada</p>
          <h3 id="part-info-title" className="text-base font-semibold text-ink-100">
            {PART_SHORT_NAMES[part.id] || part.name}
          </h3>
        </div>
        <button onClick={onFocus} className="btn-ghost px-2 py-1.5 text-xs" title="Centralizar na peça">
          <ScanEye className="h-4 w-4" aria-hidden /> Centralizar
        </button>
      </div>
      <dl className="mt-3 space-y-2.5 text-sm leading-relaxed">
        <div>
          <dt className="font-semibold text-ink-200">Função</dt>
          <dd className="text-ink-300">{part.simpleDefinition}</dd>
        </div>
        {part.location && (
          <div>
            <dt className="flex items-center gap-1.5 font-semibold text-ink-200">
              <MapPin className="h-4 w-4" aria-hidden /> Onde fica
            </dt>
            <dd className="text-ink-300">{part.location}</dd>
          </div>
        )}
        <div>
          <dt className="font-semibold text-ink-200">Como se relaciona com as outras peças</dt>
          <dd className="text-ink-300">{part.relationshipWithOthers}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink-200">Falhas típicas</dt>
          <dd className="text-ink-300">{part.typicalFailureModes}</dd>
        </div>
        {(PART_SAFETY[part.id] || LATHE_PART_SAFETY[part.id]) && (
          <div>
            <dt className="flex items-center gap-1.5 font-semibold text-amber-200">
              <ShieldAlert className="h-4 w-4" aria-hidden /> Segurança
            </dt>
            <dd className="text-ink-300">{PART_SAFETY[part.id] || LATHE_PART_SAFETY[part.id]}</dd>
          </div>
        )}
        <div>
          <dt className="flex items-center gap-1.5 font-semibold text-ink-200">
            <Wrench className="h-4 w-4" aria-hidden /> Ferramenta usada
          </dt>
          <dd className="text-ink-300">{part.meshData.requiredTool}</dd>
        </div>
        {part.inspection?.length ? (
          <div>
            <dt className="font-semibold text-ink-200">O que inspecionar</dt>
            <dd>
              <ul className="list-disc space-y-0.5 pl-5 text-ink-300">
                {part.inspection.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {part.maintenance?.length ? (
          <div>
            <dt className="font-semibold text-ink-200">Manutenção</dt>
            <dd>
              <ul className="list-disc space-y-0.5 pl-5 text-ink-300">
                {part.maintenance.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
      <button onClick={() => setDetails((v) => !v)} aria-expanded={details} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-ink-100">
        Detalhes técnicos
        <ChevronDown className={`h-4 w-4 transition-transform ${details ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {details && (
        <dl className="mt-2 space-y-1.5 text-sm">
          <div>
            <dt className="inline font-medium text-ink-300">Nome técnico: </dt>
            <dd className="inline text-ink-400">{part.technicalName}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-ink-300">Material típico: </dt>
            <dd className="inline text-ink-400">{part.material}</dd>
          </div>
          {part.tolerance !== '—' && (
            <div>
              <dt className="inline font-medium text-ink-300">Referência de ajuste/tolerância: </dt>
              <dd className="inline text-ink-400">{part.tolerance}</dd>
            </div>
          )}
          <p className="text-xs text-ink-500">Valores ilustrativos de referência. Sempre siga o manual do fabricante do equipamento real.</p>
          {part.references?.length ? (
            <div className="border-t border-ink-800 pt-2">
              <dt className="font-medium text-ink-300">Referências do texto</dt>
              <dd>
                <ul className="mt-1 space-y-1 text-xs text-ink-400">
                  {part.references
                    .map((r) => TECH_REFERENCES[r])
                    .filter(Boolean)
                    .map((r) => (
                      <li key={r.label}>
                        <span className="text-ink-300">{r.label}</span>
                        {r.detail && <span> — {r.detail}</span>}
                      </li>
                    ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
      )}
      {onShow2D && (
        <button onClick={onShow2D} className="btn-ghost mt-2 px-0">
          <Layers className="h-4 w-4" aria-hidden /> Ver na ilustração 2D
        </button>
      )}
      {lessonId && (
        <button onClick={() => navigateTo('quiz', lessonId)} className="btn-ghost mt-2 px-0">
          <BookOpen className="h-4 w-4" aria-hidden /> Estudar na aula relacionada
        </button>
      )}
    </section>
  );
};

export const ViewportToolbar: React.FC<{
  disabled: boolean;
  xray: boolean;
  labels: boolean;
  onXray: () => void;
  onLabels: () => void;
  onView: (v: CameraView) => void;
  onZoom: (f: number) => void;
  onRotate: (a: number) => void;
  onFocus: () => void;
  focusLabel: string;
  explode: number | null;
  onExplode: (v: number) => void;
  /** null/undefined: equipamento sem vista em corte. */
  cutaway?: boolean | null;
  onCutaway?: () => void;
  /** null/undefined: equipamento sem simulação de operação (ou indisponível nesta etapa). */
  running?: boolean | null;
  runLabel?: string;
  onRun?: () => void;
  /** Projeção ortográfica ("vista técnica"). null/undefined: sem o botão. */
  ortho?: boolean | null;
  onOrtho?: () => void;
  onPresent?: () => void;
}> = ({ disabled, xray, labels, onXray, onLabels, onView, onZoom, onRotate, onFocus, focusLabel, explode, onExplode, cutaway, onCutaway, running, runLabel, onRun, ortho, onOrtho, onPresent }) => {
  const btn = 'flex h-9 w-8 items-center justify-center rounded-lg text-ink-200 hover:bg-ink-700 disabled:opacity-40 sm:w-9';
  return (
    // Uma linha só: se não couber (celular estreito), rola na horizontal em vez de quebrar e cobrir o modelo.
    <div className="absolute inset-x-2 bottom-2 z-10 overflow-x-auto">
    <div className="mx-auto flex w-max items-center gap-1.5">
      <div className="flex items-center gap-0.5 rounded-xl border border-ink-700 bg-ink-950/90 p-1 shadow-lg">
        <button className={btn} onClick={() => onRotate(-Math.PI / 8)} disabled={disabled} aria-label="Girar para a esquerda" title="Girar para a esquerda">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button className={btn} onClick={() => onRotate(Math.PI / 8)} disabled={disabled} aria-label="Girar para a direita" title="Girar para a direita">
          <RotateCw className="h-4 w-4" />
        </button>
        <button className={btn} onClick={() => onZoom(0.8)} disabled={disabled} aria-label="Aproximar" title="Aproximar">
          <Plus className="h-4 w-4" />
        </button>
        <button className={btn} onClick={() => onZoom(1.25)} disabled={disabled} aria-label="Afastar" title="Afastar">
          <Minus className="h-4 w-4" />
        </button>
        <button className={btn} onClick={onFocus} disabled={disabled} aria-label={focusLabel} title={focusLabel}>
          <Focus className="h-4 w-4" />
        </button>
        <select
          aria-label="Vista da câmera"
          disabled={disabled}
          onChange={(e) => {
            onView(e.target.value as CameraView);
            e.target.value = '';
          }}
          defaultValue=""
          className="h-9 rounded-lg bg-transparent px-1.5 text-sm text-ink-200 hover:bg-ink-700"
        >
          <option value="" disabled>
            Vista
          </option>
          <option value="iso">Isométrica</option>
          <option value="front">Frente</option>
          <option value="side">Lateral</option>
          <option value="top">Topo</option>
        </select>
        {ortho !== null && ortho !== undefined && (
          <button
            className={`${btn} ${ortho ? 'bg-accent-soft text-accent-text' : ''}`}
            onClick={onOrtho}
            disabled={disabled}
            aria-pressed={ortho}
            aria-label="Vista técnica (sem perspectiva)"
            title={ortho ? 'Vista técnica (ortográfica): ligada' : 'Vista técnica (ortográfica)'}
          >
            {ortho ? <SquareDashed className="h-4 w-4" /> : <Box className="h-4 w-4" />}
          </button>
        )}
      </div>
      <div className="flex items-center gap-0.5 rounded-xl border border-ink-700 bg-ink-950/90 p-1 shadow-lg">
        <button
          className={`${btn} ${xray ? 'bg-accent-soft text-accent-text' : ''}`}
          onClick={onXray}
          disabled={disabled}
          aria-pressed={xray}
          aria-label="Raio-X: ver peças internas"
          title="Raio-X: ver peças internas"
        >
          <Eye className="h-4 w-4" />
        </button>
        {running !== null && running !== undefined && (
          <button
            className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink-200 hover:bg-ink-700 disabled:opacity-40 ${running ? 'bg-accent-soft text-accent-text' : ''}`}
            onClick={onRun}
            disabled={disabled}
            aria-pressed={running}
            data-testid="lab-run"
          >
            {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            {running ? 'Parar' : runLabel || 'Ver em operação'}
          </button>
        )}
        {cutaway !== null && cutaway !== undefined && (
          <button
            className={`${btn} ${cutaway ? 'bg-accent-soft text-accent-text' : ''}`}
            onClick={onCutaway}
            disabled={disabled}
            aria-pressed={cutaway}
            aria-label="Vista em corte: esconder a metade da frente da carcaça"
            title="Vista em corte"
          >
            <Scissors className="h-4 w-4" />
          </button>
        )}
        <button
          className={`${btn} ${labels ? 'bg-accent-soft text-accent-text' : ''}`}
          onClick={onLabels}
          disabled={disabled}
          aria-pressed={labels}
          aria-label="Mostrar nomes das peças"
          title="Mostrar nomes das peças"
        >
          <Tag className="h-4 w-4" />
        </button>
        {onPresent && (
          <button className={btn} onClick={onPresent} disabled={disabled} aria-label="Modo apresentação" title="Modo apresentação (tela cheia, para aula ou vídeo)">
            <Presentation className="h-4 w-4" />
          </button>
        )}
        {explode !== null && (
          <label className="flex items-center gap-2 px-2 text-sm text-ink-300">
            <Layers className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Vista explodida</span>
            <input
              type="range"
              min={0}
              max={100}
              value={explode}
              disabled={disabled}
              onChange={(e) => onExplode(Number(e.target.value))}
              className="w-24 accent-[#e8590c] sm:w-32"
              aria-label="Vista explodida"
            />
          </label>
        )}
      </div>
    </div>
    </div>
  );
};
