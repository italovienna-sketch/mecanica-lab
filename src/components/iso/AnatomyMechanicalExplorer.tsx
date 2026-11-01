import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './iso.css';
import { Dots, IsoFigure, Line, Plate, Solid } from './react/draw';
import { asksForStillness, follow, useLoop, useReadout } from './react/live';
import {
  ANATOMY_HEIGHT,
  ANATOMY_WIDTH,
  BENCH_STATIC_ART,
  GEARBOX_ANATOMY_VECTORS,
  GEARBOX_PARTS_ART,
  PUMP_ANATOMY_VECTORS,
  PUMP_PARTS_ART,
  getPartTransform,
} from './pumpAnatomyGeometry';
import {
  GuidedStep,
  MachineData,
  MechanicalPart3D,
} from '../../data/mechanicalMachines';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Box,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';

export type AnatomyMode = 'guided_demo' | 'reassembly_exercise' | 'free_explore';

interface AnatomyMechanicalExplorerProps {
  machine: MachineData;
  selectedPart: MechanicalPart3D | null;
  onSelectPart: (part: MechanicalPart3D | null) => void;
  currentStepIdx: number;
  onStepChange: (stepIdx: number) => void;
  onSwitchTo3D: () => void;
  onCompleteExercise?: (mode: 'disassembly' | 'reassembly') => void;
}

const BEGINNER_PROMPTS: Record<number, { prompt: string; encouragement: string }> = {
  0: {
    prompt: '1. Observe o conjunto montado. Vamos iniciar pelos elementos de fixação externos.',
    encouragement: 'Sempre alivie e remova os parafusos de fechamento em padrão cruzado antes de forçar qualquer tampa.',
  },
  1: {
    prompt: '2. Veja como este componente se acopla ao conjunto. Prossiga na ordem técnica.',
    encouragement: 'Com o travamento liberado, o componente sai axialmente sem danificar faces usinadas.',
  },
  2: {
    prompt: '3. Observe a vedação de precisão no eixo. Preserve as superfícies lapidadas.',
    encouragement: 'Muito bem! Vedações mecânicas e retentores exigem extração alinhada e sem contato com sujeira.',
  },
  3: {
    prompt: '4. Veja como o eixo transmite a força do motor. Extraia o conjunto com apoio seguro.',
    encouragement: 'O uso de prensa e berço em V evita empenamento nos colos retificados do eixo.',
  },
  4: {
    prompt: '5. Inspecione os rolamentos e o suporte estrutural. Etapa final do conjunto!',
    encouragement: 'Excelente! Veja por que essa ordem importa: cada peça libera o acesso seguro à seguinte.',
  },
};

export const AnatomyMechanicalExplorer: React.FC<AnatomyMechanicalExplorerProps> = ({
  machine,
  selectedPart,
  onSelectPart,
  currentStepIdx,
  onStepChange,
  onSwitchTo3D,
  onCompleteExercise,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<AnatomyMode>('guided_demo');
  const [exerciseSubMode, setExerciseSubMode] = useState<'reassembly' | 'disassembly'>('reassembly');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [manualExplode, setManualExplode] = useState<number>(0);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const { anchor, say } = useReadout<HTMLDivElement>();

  const isGearbox = machine.id === 'gearbox-reducer' || machine.id === 'gearbox-helical-ind';

  const reassemblySteps: GuidedStep[] = useMemo(() => {
    return [...machine.disassemblySteps]
      .reverse()
      .map((s, idx) => {
        const partObj = machine.parts.find((p) => p.id === s.partId);
        return {
          step: idx + 1,
          partId: s.partId,
          title: `Etapa ${idx + 1}: Instalar ${partObj?.name || s.title}`,
          actionText: `Posicione e instale "${partObj?.name || s.partId}" no conjunto utilizando ${s.requiredTool}.`,
          objectiveText: s.objectiveText,
          requiredTool: s.requiredTool,
          safetyCaution: s.safetyCaution,
          validationCheck: s.validationCheck,
        };
      });
  }, [machine.disassemblySteps, machine.parts]);

  const activeSequence: GuidedStep[] =
    mode === 'reassembly_exercise' && exerciseSubMode === 'reassembly'
      ? reassemblySteps
      : machine.disassemblySteps;

  const totalSteps = activeSequence.length;
  const activeStepObj = activeSequence[Math.min(currentStepIdx, Math.max(0, totalSteps - 1))];

  // Refs to each movable SVG <g> element so useLoop updates transforms at 60fps without React re-renders
  const partGroupRefs = useRef<Record<string, SVGGElement | null>>({});
  const currentExtractRef = useRef<Record<string, number>>({});
  const targetExtractRef = useRef<Record<string, number>>({});

  // Compute target extraction (0 = assembled, 1 = extracted) for every part based on current mode & step
  useEffect(() => {
    const targets: Record<string, number> = {};
    machine.parts.forEach((p) => {
      targets[p.id] = 0;
    });

    if (mode === 'free_explore') {
      machine.parts.forEach((p) => {
        targets[p.id] = manualExplode;
      });
    } else if (mode === 'guided_demo') {
      for (let i = 0; i < currentStepIdx && i < machine.disassemblySteps.length; i++) {
        const pid = machine.disassemblySteps[i]?.partId;
        if (pid) targets[pid] = 1;
      }
      if (manualExplode > 0) {
        machine.parts.forEach((p) => {
          targets[p.id] = Math.max(targets[p.id] ?? 0, manualExplode);
        });
      }
    } else if (mode === 'reassembly_exercise') {
      if (exerciseSubMode === 'reassembly') {
        reassemblySteps.forEach((step, idx) => {
          targets[step.partId] = idx < currentStepIdx ? 0 : 1;
        });
      } else {
        machine.disassemblySteps.forEach((step, idx) => {
          targets[step.partId] = idx < currentStepIdx ? 1 : 0;
        });
      }
    }

    targetExtractRef.current = targets;
  }, [machine, mode, exerciseSubMode, currentStepIdx, manualExplode, reassemblySteps]);

  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    setAnimating(true);
  }, [machine, mode, exerciseSubMode, currentStepIdx, manualExplode]);

  useLoop((dt, calm) => {
    let anyMoving = false;
    for (const part of machine.parts) {
      const pid = part.id;
      const target = targetExtractRef.current[pid] ?? 0;
      const current = currentExtractRef.current[pid] ?? 0;
      const next = follow(current, target, dt, 0.14, calm);
      currentExtractRef.current[pid] = next;
      if (Math.abs(next - target) > 1e-3) {
        anyMoving = true;
      }
      const node = partGroupRefs.current[pid];
      if (node) {
        const transform = getPartTransform(machine.id, pid, next);
        if (transform) {
          node.setAttribute('transform', transform);
        } else {
          node.removeAttribute('transform');
        }
      }
    }
    if (!anyMoving) {
      setAnimating(false);
    }
    return anyMoving;
  }, animating);

  // Update Anatomy Plate live readout whenever selection, hover, or step changes
  useEffect(() => {
    const focusedId = hoveredPartId || selectedPart?.id || activeStepObj?.partId;
    const vectors = isGearbox ? GEARBOX_ANATOMY_VECTORS : PUMP_ANATOMY_VECTORS;
    const label = focusedId ? vectors[focusedId]?.labelPt : machine.name;
    const stepLabel =
      currentStepIdx >= totalSteps
        ? 'CONCLUÍDO (100%)'
        : `ETAPA ${currentStepIdx + 1}/${totalSteps}`;
    say(`${stepLabel} · ${label ?? ''}`);
  }, [hoveredPartId, selectedPart, activeStepObj, currentStepIdx, totalSteps, isGearbox, machine.name, say]);

  // Auto-play timer for Guided Demo
  useEffect(() => {
    if (!isPlaying || mode !== 'guided_demo') return;
    const delay = asksForStillness() ? 1800 : 2800;
    const timer = window.setTimeout(() => {
      if (currentStepIdx < totalSteps) {
        const stepNow = activeSequence[currentStepIdx];
        const partObj = machine.parts.find((p) => p.id === stepNow?.partId) || null;
        if (partObj) onSelectPart(partObj);
        onStepChange(currentStepIdx + 1);
      } else {
        setIsPlaying(false);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [isPlaying, mode, currentStepIdx, totalSteps, activeSequence, machine.parts, onSelectPart, onStepChange]);

  // Handle clicking a part in the isometric SVG or component list
  const handlePartInteract = useCallback(
    (partId: string) => {
      const partObj = machine.parts.find((p) => p.id === partId) || null;
      onSelectPart(partObj);

      if (mode === 'reassembly_exercise' && currentStepIdx < totalSteps) {
        const expectedStep = activeSequence[currentStepIdx];
        if (!expectedStep) return;

        if (partId === expectedStep.partId) {
          const nextIdx = currentStepIdx + 1;
          onStepChange(nextIdx);
          const beginnerNote =
            BEGINNER_PROMPTS[currentStepIdx]?.encouragement || expectedStep.safetyCaution || '';

          if (nextIdx >= totalSteps) {
            setFeedback({
              type: 'success',
              title:
                exerciseSubMode === 'reassembly'
                  ? 'Remontagem Concluída com Sucesso!'
                  : 'Desmontagem Técnica Concluída!',
              message: `Parabéns! Você completou todas as ${totalSteps} etapas na ordem correta. ${beginnerNote}`,
            });
            onCompleteExercise?.(exerciseSubMode);
          } else {
            setFeedback({
              type: 'success',
              title: `Muito bem! Etapa ${expectedStep.step} concluída`,
              message: `${partObj?.name} ${
                exerciseSubMode === 'reassembly' ? 'instalado(a)' : 'removido(a)'
              } com sucesso. ${beginnerNote}`,
            });
          }
        } else {
          const expectedPart = machine.parts.find((p) => p.id === expectedStep.partId);
          setFeedback({
            type: 'error',
            title: 'Atenção à Ordem Mecânica!',
            message: `Você selecionou "${partObj?.name}", mas esta peça ainda está bloqueada ou fora da sequência. Na Etapa ${expectedStep.step}, selecione primeiro: "${expectedPart?.name}" (${expectedStep.requiredTool}).`,
          });
        }
      } else if (mode === 'guided_demo') {
        const stepMatch = activeSequence.findIndex((s) => s.partId === partId);
        if (stepMatch >= 0 && partObj) {
          setFeedback({
            type: 'info',
            title: `${partObj.name}`,
            message: `${partObj.simpleDefinition} — Ferramenta recomendada: ${partObj.meshData.requiredTool}.`,
          });
        }
      }
    },
    [
      machine.parts,
      onSelectPart,
      mode,
      currentStepIdx,
      totalSteps,
      activeSequence,
      exerciseSubMode,
      onStepChange,
      onCompleteExercise,
    ]
  );

  const isPartLit = (partId: string): boolean => {
    if (hoveredPartId === partId) return true;
    if (selectedPart?.id === partId) return true;
    if (mode !== 'free_explore' && activeStepObj?.partId === partId && currentStepIdx < totalSteps) {
      return true;
    }
    return false;
  };

  const setGroupRef = (partId: string) => (el: SVGGElement | null) => {
    partGroupRefs.current[partId] = el;
  };

  const vectors = isGearbox ? GEARBOX_ANATOMY_VECTORS : PUMP_ANATOMY_VECTORS;
  const activeBeginnerPrompt =
    BEGINNER_PROMPTS[Math.min(currentStepIdx, 4)] ?? BEGINNER_PROMPTS[0]!;

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden bg-[#111210] text-[#e6e4dd]">
      {/* ÁREA 1 (ESQUERDA/CENTRO): ILUSTRAÇÃO ISOMÉTRICA INTERATIVA ANATOMY */}
      <div className="relative flex-1 flex flex-col min-h-[420px] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#262724] bg-[#141513]">
        {/* Barra Superior Editorial Enxuta */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-[#262724] bg-[#111210]">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[11px] font-mono uppercase tracking-widest bg-[#e8590c]/15 text-[#ff7a33] border border-[#e8590c]/40">
              VISTA ISOMÉTRICA ANATOMY 2.5D
            </span>
            <h2 className="text-sm font-bold tracking-tight text-[#f4f3ef]">
              {machine.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador de Tema da Prancha Técnica (Papel Claro vs Grafite Escuro) */}
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-[#2e302c] bg-[#1a1c19] text-[#d4d2c8] hover:border-[#6e706a] transition-colors cursor-pointer"
              title="Alternar tema da prancha técnica (Papel Claro / Grafite)"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{theme === 'light' ? 'Tema Grafite' : 'Tema Papel'}</span>
            </button>

            {/* Transição 1-Clique para o Laboratório 3D CAD */}
            <button
              type="button"
              onClick={onSwitchTo3D}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-semibold bg-[#e8590c] hover:bg-[#d9480f] text-white transition-colors shadow-sm cursor-pointer"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Abrir em 3D</span>
            </button>
          </div>
        </div>

        {/* Seletor de Modo Pedagógico da Vista Isométrica */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-[#181917] border-b border-[#262724]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('guided_demo');
                setIsPlaying(false);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                mode === 'guided_demo'
                  ? 'bg-[#f4f3ef] text-[#111210] font-bold'
                  : 'bg-[#111210] text-[#9e9d95] border border-[#262724] hover:text-white'
              }`}
            >
              1. Demonstração Guiada
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reassembly_exercise');
                setExerciseSubMode('reassembly');
                setIsPlaying(false);
                onStepChange(0);
                setManualExplode(0);
                setFeedback({
                  type: 'info',
                  title: 'Exercício Guiado de Remontagem',
                  message:
                    'As peças estão desmontadas. Clique na primeira peça que deve ser instalada no conjunto seguindo a ordem técnica.',
                });
              }}
              className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                mode === 'reassembly_exercise'
                  ? 'bg-[#e8590c] text-white font-bold'
                  : 'bg-[#111210] text-[#9e9d95] border border-[#262724] hover:text-white'
              }`}
            >
              2. Praticar Remontagem
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('free_explore');
                setIsPlaying(false);
                setManualExplode(0.65);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                mode === 'free_explore'
                  ? 'bg-[#f4f3ef] text-[#111210] font-bold'
                  : 'bg-[#111210] text-[#9e9d95] border border-[#262724] hover:text-white'
              }`}
            >
              3. Exploração Livre (Explodir)
            </button>
          </div>

          {/* Controle Deslizante de Vista Explodida */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#a3a29a]">
            <Layers className="w-3.5 h-3.5 text-[#e8590c]" />
            <span>Explodir:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(manualExplode * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setManualExplode(v);
                if (mode !== 'free_explore' && v > 0) {
                  setIsPlaying(false);
                }
              }}
              className="w-24 accent-[#e8590c] cursor-pointer"
              aria-label="Controle de explosão isométrica"
            />
            <span className="w-9 text-right tabular-nums text-[#f4f3ef]">
              {Math.round(manualExplode * 100)}%
            </span>
          </div>
        </div>

        {/* PRANCHA ISOMÉTRICA OFICIAL ANATOMY (<Plate> + <IsoFigure>) */}
        <div
          ref={anchor}
          className="iso flex-1 flex flex-col justify-center px-4 sm:px-8 py-2 overflow-hidden"
          data-theme={theme}
        >
          <Plate
            fig={isGearbox ? 'FIG. 02 · REDUTOR HELICOIDAL' : 'FIG. 01 · BOMBA CENTRÍFUGA'}
            title={
              mode === 'reassembly_exercise'
                ? 'EXERCÍCIO DE MONTAGEM'
                : mode === 'free_explore'
                ? 'VISTA EXPLODIDA INTERATIVA'
                : 'SEQUÊNCIA TÉCNICA DE MANUTENÇÃO'
            }
            hint="CLIQUE EM QUALQUER PEÇA PARA SELECIONAR · USE OS CONTROLES DE ETAPA"
            readout={`ETAPA ${Math.min(currentStepIdx + 1, totalSteps)}/${totalSteps} · ${machine.name}`}
            keys={[
              { mark: 'lit', label: 'Peça ativa / selecionada' },
              { mark: 'raised', label: 'Subconjunto mecânico' },
              { mark: 'dotted', label: 'Eixo de montagem / extração' },
            ]}
            caption={
              selectedPart
                ? `${selectedPart.name}: ${selectedPart.simpleDefinition}`
                : activeStepObj
                ? `${activeStepObj.title} — ${activeStepObj.actionText}`
                : machine.overviewDescription
            }
          >
            <IsoFigure
              width={ANATOMY_WIDTH}
              height={ANATOMY_HEIGHT}
              label={`Ilustração isométrica interativa: ${machine.name}`}
            >
              {/* 1. BANCADA DE TESTE E METROLOGIA (ESTRUTURA BASE FIXA) */}
              <g key="bench-static">
                <path className="iso-halo" d={BENCH_STATIC_ART.halo} />
                {BENCH_STATIC_ART.feet.map((footPair, idx) => (
                  <g key={`foot-${idx}`}>
                    <Solid paths={footPair[0]!} tone="lo" crease="faint" />
                    <Solid paths={footPair[1]!} tone="mid" crease="faint" />
                  </g>
                ))}
                <Solid paths={BENCH_STATIC_ART.slab} tone="lo" crease="faint" />
                <Line d={BENCH_STATIC_ART.perimeterGroove} tone="faint" />
                <Line d={BENCH_STATIC_ART.drainRim} tone="lo" />
                <Line d={BENCH_STATIC_ART.drainInner} tone="faint" />
                <Line d={BENCH_STATIC_ART.cornerScrewRings} tone="lo" />
                <Dots points={BENCH_STATIC_ART.cornerScrews} size={0.55} tone="mid" />

                {/* Plaqueta de Identificação Gravada  */}
                <Solid paths={BENCH_STATIC_ART.nameplate} tone="mid" crease="none" />
                <Line d={BENCH_STATIC_ART.nameplateBorder} tone="faint" />
                <Line d={BENCH_STATIC_ART.nameplateRules} tone="lo" />
                <Dots points={BENCH_STATIC_ART.nameplateRivets} size={0.45} tone="hi" />

                {/* Escala Milimétrica na Borda Frontal da Bancada */}
                <Line d={BENCH_STATIC_ART.rulerBaseline} tone="faint" />
                <Line d={BENCH_STATIC_ART.rulerMinor} tone="lo" />
                <Line d={BENCH_STATIC_ART.rulerMajor} tone="mid" />

                {/* Relógio Comparador de Alinhamento na Traseira Esquerda */}
                <Solid paths={BENCH_STATIC_ART.gaugeStandBase} tone="lo" crease="faint" />
                <Solid paths={BENCH_STATIC_ART.gaugeColumn} tone="mid" crease="none" />
                <Line d={BENCH_STATIC_ART.gaugeArm} tone="mid" />
                <Solid paths={BENCH_STATIC_ART.gaugeBezel} tone="mid" crease="faint" />
                <Line d={BENCH_STATIC_ART.gaugeFace} tone="lo" />
                <Dots points={BENCH_STATIC_ART.gaugeCenterDot} size={0.55} tone="hi" />
              </g>

              {/* LINHA DE CENTRO DE MONTAGEM ( TRACEJADA ) */}
              <Line d={PUMP_PARTS_ART.axisCenterline} tone="lo" dotted />

              {/* ============================================================ */}
              {/* RENDERIZAÇÃO DA BOMBA CENTRÍFUGA ISO 2858 (PAINTER'S ORDER) */}
              {/* ============================================================ */}
              {!isGearbox ? (
                <>
                  {/* 1. CAVALETE DE MANCAL (pump-bearing-bracket) */}
                  <g
                    key="pump-bearing-bracket"
                    ref={setGroupRef('pump-bearing-bracket')}
                    data-part="pump-bearing-bracket"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-bearing-bracket')}
                    onMouseEnter={() => setHoveredPartId('pump-bearing-bracket')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.bearingBracket.pedestalFoot}
                      tone="mid"
                      lit={isPartLit('pump-bearing-bracket')}
                    />
                    <Dots points={PUMP_PARTS_ART.bearingBracket.footBolts} size={0.5} tone="hi" />
                    <Solid
                      paths={PUMP_PARTS_ART.bearingBracket.pedestalColumn}
                      tone="mid"
                      lit={isPartLit('pump-bearing-bracket')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.bearingBracket.rearCover}
                      tone="mid"
                      lit={isPartLit('pump-bearing-bracket')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.bearingBracket.barrel}
                      tone="hi"
                      lit={isPartLit('pump-bearing-bracket')}
                    />
                    <Line d={PUMP_PARTS_ART.bearingBracket.coolingFins} tone="lo" />
                    <Line d={PUMP_PARTS_ART.bearingBracket.sightGlassRing} tone="hi" />
                    <Solid
                      paths={PUMP_PARTS_ART.bearingBracket.adapterFlange}
                      tone="hi"
                      lit={isPartLit('pump-bearing-bracket')}
                    />
                    <Dots points={PUMP_PARTS_ART.bearingBracket.flangeBolts} size={0.48} tone="mid" />
                  </g>

                  {/* 2. PAR DE ROLAMENTOS RÍGIDOS DE ESFERAS 6308 (pump-bearings) */}
                  <g
                    key="pump-bearings"
                    ref={setGroupRef('pump-bearings')}
                    data-part="pump-bearings"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-bearings')}
                    onMouseEnter={() => setHoveredPartId('pump-bearings')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.bearings.rearOuterRing}
                      tone="hi"
                      lit={isPartLit('pump-bearings')}
                    />
                    <Line d={PUMP_PARTS_ART.bearings.rearInnerRing} tone="mid" />
                    <Dots points={PUMP_PARTS_ART.bearings.rearBalls} size={0.45} tone="hi" />
                    <Solid
                      paths={PUMP_PARTS_ART.bearings.frontOuterRing}
                      tone="hi"
                      lit={isPartLit('pump-bearings')}
                    />
                    <Line d={PUMP_PARTS_ART.bearings.frontInnerRing} tone="mid" />
                    <Dots points={PUMP_PARTS_ART.bearings.frontBalls} size={0.45} tone="hi" />
                  </g>

                  {/* 3. EIXO ESCALONADO DE TRANSMISSÃO (pump-shaft) */}
                  <g
                    key="pump-shaft"
                    ref={setGroupRef('pump-shaft')}
                    data-part="pump-shaft"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-shaft')}
                    onMouseEnter={() => setHoveredPartId('pump-shaft')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.driveShaft.couplingEnd}
                      tone="hi"
                      lit={isPartLit('pump-shaft')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.driveShaft.keywayBlock}
                      tone="hi"
                      lit={isPartLit('pump-shaft')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.driveShaft.mainJournal}
                      tone="hi"
                      lit={isPartLit('pump-shaft')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.driveShaft.impellerSeat}
                      tone="hi"
                      lit={isPartLit('pump-shaft')}
                    />
                    <Line d={PUMP_PARTS_ART.driveShaft.shoulderRings} tone="mid" />
                  </g>

                  {/* 4. TAMPA DE PRESSÃO & SELO MECÂNICO EN 12756 (pump-mechanical-seal) */}
                  <g
                    key="pump-mechanical-seal"
                    ref={setGroupRef('pump-mechanical-seal')}
                    data-part="pump-mechanical-seal"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-mechanical-seal')}
                    onMouseEnter={() => setHoveredPartId('pump-mechanical-seal')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.mechanicalSeal.stationarySeat}
                      tone="mid"
                      lit={isPartLit('pump-mechanical-seal')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.mechanicalSeal.rotaryUnit}
                      tone="hi"
                      lit={isPartLit('pump-mechanical-seal')}
                    />
                    <Line d={PUMP_PARTS_ART.mechanicalSeal.springRings} tone="mid" />
                    <Line d={PUMP_PARTS_ART.mechanicalSeal.sealFaceLine} tone="hi" />
                    <Solid
                      paths={PUMP_PARTS_ART.mechanicalSeal.elastomerBellows}
                      tone="mid"
                      lit={isPartLit('pump-mechanical-seal')}
                    />
                  </g>

                  {/* 5. ROTOR CENTRÍFUGO FECHADO (pump-impeller) */}
                  <g
                    key="pump-impeller"
                    ref={setGroupRef('pump-impeller')}
                    data-part="pump-impeller"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-impeller')}
                    onMouseEnter={() => setHoveredPartId('pump-impeller')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.impeller.backShroud}
                      tone="hi"
                      lit={isPartLit('pump-impeller')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.impeller.vaneChannel}
                      tone="mid"
                      lit={isPartLit('pump-impeller')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.impeller.frontShroud}
                      tone="hi"
                      lit={isPartLit('pump-impeller')}
                    />
                    <Line d={PUMP_PARTS_ART.impeller.vanesDetail} tone="mid" />
                    <Dots points={PUMP_PARTS_ART.impeller.balanceHoles} size={0.45} tone="mid" />
                    <Solid
                      paths={PUMP_PARTS_ART.impeller.suctionEye}
                      tone="hi"
                      lit={isPartLit('pump-impeller')}
                    />
                    <Line d={PUMP_PARTS_ART.impeller.eyeRing} tone="hi" />
                  </g>

                  {/* 6. CARCAÇA ESPIRAL EM VOLUTA (pump-volute-casing) */}
                  <g
                    key="pump-volute-casing"
                    ref={setGroupRef('pump-volute-casing')}
                    data-part="pump-volute-casing"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-volute-casing')}
                    onMouseEnter={() => setHoveredPartId('pump-volute-casing')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.casingFoot}
                      tone="mid"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.rearFlange}
                      tone="hi"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.voluteScroll}
                      tone="hi"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Line d={PUMP_PARTS_ART.casingVolute.voluteRibs} tone="lo" />
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.dischargePipe}
                      tone="hi"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.dischargeFlange}
                      tone="hi"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Line d={PUMP_PARTS_ART.casingVolute.dischargeBore} tone="mid" />
                    <Dots points={PUMP_PARTS_ART.casingVolute.dischargeBolts} size={0.48} tone="mid" />
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.suctionTaper}
                      tone="hi"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.casingVolute.suctionFlange}
                      tone="hi"
                      lit={isPartLit('pump-volute-casing')}
                    />
                    <Line d={PUMP_PARTS_ART.casingVolute.suctionBore} tone="hi" />
                    <Dots points={PUMP_PARTS_ART.casingVolute.suctionBolts} size={0.48} tone="mid" />
                  </g>

                  {/* 7. PRISIONEIROS PERIMETRAIS & PORCA DO ROTOR (pump-fasteners) */}
                  <g
                    key="pump-fasteners"
                    ref={setGroupRef('pump-fasteners')}
                    data-part="pump-fasteners"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('pump-fasteners')}
                    onMouseEnter={() => setHoveredPartId('pump-fasteners')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={PUMP_PARTS_ART.fasteners.impellerWasher}
                      tone="mid"
                      lit={isPartLit('pump-fasteners')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.fasteners.impellerHexBody}
                      tone="hi"
                      lit={isPartLit('pump-fasteners')}
                    />
                    <Solid
                      paths={PUMP_PARTS_ART.fasteners.impellerAcornCap}
                      tone="hi"
                      lit={isPartLit('pump-fasteners')}
                    />
                    <Line d={PUMP_PARTS_ART.fasteners.impellerCrownRing} tone="mid" />
                    {PUMP_PARTS_ART.fasteners.bolts.map((b, idx) => (
                      <g key={`bolt-${idx}`}>
                        <Solid
                          paths={b.shank}
                          tone="mid"
                          lit={isPartLit('pump-fasteners')}
                        />
                        <Solid
                          paths={b.washer}
                          tone="mid"
                          lit={isPartLit('pump-fasteners')}
                        />
                        <Solid
                          paths={b.hexHead}
                          tone="hi"
                          lit={isPartLit('pump-fasteners')}
                        />
                        <Dots points={[b.centerDot]} size={0.42} tone="hi" />
                      </g>
                    ))}
                  </g>
                </>
              ) : (
                /* ============================================================ */
                /* RENDERIZAÇÃO DO REDUTOR HELICOIDAL INDUSTRIAL (7 CONJUNTOS)  */
                /* ============================================================ */
                <>
                  {/* 1. CARCAÇA INFERIOR (part-housing-bottom) */}
                  <g
                    key="part-housing-bottom"
                    ref={setGroupRef('part-housing-bottom')}
                    data-part="part-housing-bottom"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-housing-bottom')}
                    onMouseEnter={() => setHoveredPartId('part-housing-bottom')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingBottom.baseFlange}
                      tone="mid"
                      lit={isPartLit('part-housing-bottom')}
                    />
                    <Dots points={GEARBOX_PARTS_ART.housingBottom.anchorBolts} size={0.55} tone="hi" />
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingBottom.sumpBody}
                      tone="hi"
                      lit={isPartLit('part-housing-bottom')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingBottom.midSplitFlange}
                      tone="hi"
                      lit={isPartLit('part-housing-bottom')}
                    />
                    <Line d={GEARBOX_PARTS_ART.housingBottom.cavityOutline} tone="lo" />
                  </g>

                  {/* 2. ROLAMENTOS DE ROLOS CÔNICOS (part-taper-bearings) */}
                  <g
                    key="part-taper-bearings"
                    ref={setGroupRef('part-taper-bearings')}
                    data-part="part-taper-bearings"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-taper-bearings')}
                    onMouseEnter={() => setHoveredPartId('part-taper-bearings')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={GEARBOX_PARTS_ART.taperBearings.inputRearBearing}
                      tone="hi"
                      lit={isPartLit('part-taper-bearings')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.taperBearings.outputRearBearing}
                      tone="hi"
                      lit={isPartLit('part-taper-bearings')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.taperBearings.inputFrontBearing}
                      tone="hi"
                      lit={isPartLit('part-taper-bearings')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.taperBearings.outputFrontBearing}
                      tone="hi"
                      lit={isPartLit('part-taper-bearings')}
                    />
                    <Line d={GEARBOX_PARTS_ART.taperBearings.rollerRings} tone="mid" />
                  </g>

                  {/* 3. COROA HELICOIDAL E EIXO DE SAÍDA (part-output-gear) */}
                  <g
                    key="part-output-gear"
                    ref={setGroupRef('part-output-gear')}
                    data-part="part-output-gear"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-output-gear')}
                    onMouseEnter={() => setHoveredPartId('part-output-gear')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={GEARBOX_PARTS_ART.outputGear.shaft}
                      tone="hi"
                      lit={isPartLit('part-output-gear')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.outputGear.gearRim}
                      tone="hi"
                      lit={isPartLit('part-output-gear')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.outputGear.gearWeb}
                      tone="mid"
                      lit={isPartLit('part-output-gear')}
                    />
                    <Line d={GEARBOX_PARTS_ART.outputGear.helicalTeethLines} tone="lo" />
                    <Dots points={GEARBOX_PARTS_ART.outputGear.webHoles} size={0.5} tone="mid" />
                  </g>

                  {/* 4. EIXO-PINHÃO HELICOIDAL DE ENTRADA (part-input-pinion-shaft) */}
                  <g
                    key="part-input-pinion-shaft"
                    ref={setGroupRef('part-input-pinion-shaft')}
                    data-part="part-input-pinion-shaft"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-input-pinion-shaft')}
                    onMouseEnter={() => setHoveredPartId('part-input-pinion-shaft')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={GEARBOX_PARTS_ART.inputPinion.shaft}
                      tone="hi"
                      lit={isPartLit('part-input-pinion-shaft')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.inputPinion.pinionTeeth}
                      tone="hi"
                      lit={isPartLit('part-input-pinion-shaft')}
                    />
                    <Line d={GEARBOX_PARTS_ART.inputPinion.helicalGrooves} tone="mid" />
                  </g>

                  {/* 5. RETENTORES RADIAIS DE VEDAÇÃO (part-radial-seals) */}
                  <g
                    key="part-radial-seals"
                    ref={setGroupRef('part-radial-seals')}
                    data-part="part-radial-seals"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-radial-seals')}
                    onMouseEnter={() => setHoveredPartId('part-radial-seals')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={GEARBOX_PARTS_ART.radialSeals.inputSealOuter}
                      tone="mid"
                      lit={isPartLit('part-radial-seals')}
                    />
                    <Line d={GEARBOX_PARTS_ART.radialSeals.inputSealLip} tone="hi" />
                    <Solid
                      paths={GEARBOX_PARTS_ART.radialSeals.outputSealOuter}
                      tone="mid"
                      lit={isPartLit('part-radial-seals')}
                    />
                    <Line d={GEARBOX_PARTS_ART.radialSeals.outputSealLip} tone="hi" />
                  </g>

                  {/* 6. TAMPA SUPERIOR DE INSPEÇÃO (part-housing-top) */}
                  <g
                    key="part-housing-top"
                    ref={setGroupRef('part-housing-top')}
                    data-part="part-housing-top"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-housing-top')}
                    onMouseEnter={() => setHoveredPartId('part-housing-top')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingTop.bottomFlange}
                      tone="hi"
                      lit={isPartLit('part-housing-top')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingTop.upperBonnet}
                      tone="hi"
                      lit={isPartLit('part-housing-top')}
                    />
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingTop.inspectionPlate}
                      tone="mid"
                      lit={isPartLit('part-housing-top')}
                    />
                    <Dots points={GEARBOX_PARTS_ART.housingTop.inspectionScrews} size={0.45} tone="hi" />
                    <Solid
                      paths={GEARBOX_PARTS_ART.housingTop.breatherPlug}
                      tone="hi"
                      lit={isPartLit('part-housing-top')}
                    />
                  </g>

                  {/* 7. PARAFUSOS DO FLANGE (part-bolts-perimeter) */}
                  <g
                    key="part-bolts-perimeter"
                    ref={setGroupRef('part-bolts-perimeter')}
                    data-part="part-bolts-perimeter"
                    className="cursor-pointer"
                    onClick={() => handlePartInteract('part-bolts-perimeter')}
                    onMouseEnter={() => setHoveredPartId('part-bolts-perimeter')}
                    onMouseLeave={() => setHoveredPartId(null)}
                  >
                    {GEARBOX_PARTS_ART.boltsPerimeter.bolts.map((b, idx) => (
                      <g key={`gb-bolt-${idx}`}>
                        <Solid
                          paths={b.washer}
                          tone="mid"
                          lit={isPartLit('part-bolts-perimeter')}
                        />
                        <Solid
                          paths={b.hexHead}
                          tone="hi"
                          lit={isPartLit('part-bolts-perimeter')}
                        />
                        <Dots points={[b.topDot]} size={0.4} tone="hi" />
                      </g>
                    ))}
                  </g>
                </>
              )}
            </IsoFigure>
          </Plate>
        </div>

        {/* Barra de Etiquetas Rápidas de Componentes em Português (Acessibilidade + Teclado) */}
        <div className="px-5 py-3 bg-[#111210] border-t border-[#262724]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8b82] mb-2">
            Componentes do Conjunto (Clique para destacar ou executar a etapa):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {machine.parts.map((part) => {
              const isSelected = selectedPart?.id === part.id;
              const isTarget =
                mode !== 'free_explore' &&
                currentStepIdx < totalSteps &&
                activeStepObj?.partId === part.id;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => handlePartInteract(part.id)}
                  onMouseEnter={() => setHoveredPartId(part.id)}
                  onMouseLeave={() => setHoveredPartId(null)}
                  className={`px-2.5 py-1 text-xs font-mono transition-colors border cursor-pointer ${
                    isSelected
                      ? 'bg-[#f4f3ef] text-[#111210] border-[#f4f3ef] font-bold'
                      : isTarget && mode === 'guided_demo'
                      ? 'bg-[#e8590c]/20 text-[#ff8547] border-[#e8590c] font-semibold'
                      : 'bg-[#1a1b18] text-[#c4c3ba] border-[#2c2e29] hover:border-[#6e706a]'
                  }`}
                >
                  {part.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ÁREA 2 (DIREITA): PAINEL PEDAGÓGICO SINCRONIZADO E CONTROLES DE PASSO */}
      <div className="w-full lg:w-[410px] xl:w-[440px] flex flex-col h-full bg-[#111210] overflow-y-auto divide-y divide-[#262724]">
        {/* BLOCO A: CONTROLES DE REPRODUÇÃO E SEQUÊNCIA PASSO A PASSO */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#e8590c] font-bold">
              {mode === 'guided_demo'
                ? 'PASSO A PASSO GUIADO'
                : mode === 'reassembly_exercise'
                ? `EXERCÍCIO DE ${exerciseSubMode === 'reassembly' ? 'REMONTAGEM' : 'DESMONTAGEM'}`
                : 'INSPEÇÃO DE COMPONENTES'}
            </span>
            <span className="text-xs font-mono tabular-nums text-[#a3a29a]">
              {Math.min(currentStepIdx, totalSteps)} / {totalSteps} etapas
            </span>
          </div>

          {/* Orientação Curta para Iniciantes (Fase 6) */}
          <div className="p-3.5 bg-[#181917] border-l-2 border-[#e8590c] space-y-1">
            <div className="text-xs font-bold text-[#f4f3ef]">
              {currentStepIdx >= totalSteps
                ? 'Sequência concluída! Inspecione livremente ou pratique novamente.'
                : activeBeginnerPrompt.prompt}
            </div>
            {activeStepObj && currentStepIdx < totalSteps && (
              <p className="text-xs text-[#b5b4ab] leading-relaxed">
                {mode === 'reassembly_exercise'
                  ? `Clique na peça correta no desenho isométrico para realizar a Etapa ${activeStepObj.step}.`
                  : activeStepObj.actionText}
              </p>
            )}
          </div>

          {/* Linha do Tempo de 5 Etapas */}
          <div className="grid grid-cols-5 gap-1.5">
            {activeSequence.map((step, idx) => {
              const done = idx < currentStepIdx;
              const current = idx === currentStepIdx;
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    onStepChange(idx);
                    const partObj = machine.parts.find((p) => p.id === step.partId) || null;
                    if (partObj) onSelectPart(partObj);
                  }}
                  className={`py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                    done
                      ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300 font-bold'
                      : current
                      ? 'bg-[#e8590c] border-[#e8590c] text-white font-bold'
                      : 'bg-[#181917] border-[#262724] text-[#8c8b82] hover:text-white'
                  }`}
                >
                  {done ? `✓ ${step.step}` : `0${step.step}`}
                </button>
              );
            })}
          </div>

          {/* Botões Play / Pause / Anterior / Próxima / Reiniciar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={currentStepIdx <= 0}
              onClick={() => {
                setIsPlaying(false);
                const prev = Math.max(0, currentStepIdx - 1);
                onStepChange(prev);
                const partObj =
                  machine.parts.find((p) => p.id === activeSequence[prev]?.partId) || null;
                if (partObj) onSelectPart(partObj);
              }}
              className="px-2.5 py-2 text-xs font-mono border border-[#2c2e29] bg-[#181917] text-[#d4d2c8] hover:border-[#6e706a] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {mode === 'guided_demo' && (
              <button
                type="button"
                onClick={() => {
                  if (currentStepIdx >= totalSteps) {
                    onStepChange(0);
                    setManualExplode(0);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying((prev) => !prev);
                  }
                }}
                className={`flex-1 py-2 px-3 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#f4f3ef] text-[#111210] hover:bg-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{currentStepIdx >= totalSteps ? 'Rever Animação' : 'Reproduzir'}</span>
                  </>
                )}
              </button>
            )}

            {mode === 'reassembly_exercise' && (
              <button
                type="button"
                onClick={() => {
                  const nextSub = exerciseSubMode === 'reassembly' ? 'disassembly' : 'reassembly';
                  setExerciseSubMode(nextSub);
                  onStepChange(0);
                  setFeedback({
                    type: 'info',
                    title:
                      nextSub === 'reassembly'
                        ? 'Modo: Remontagem Guiada'
                        : 'Modo: Desmontagem Guiada',
                    message:
                      nextSub === 'reassembly'
                        ? 'Clique na primeira peça a ser instalada no conjunto.'
                        : 'Clique na primeira peça que deve ser removida do conjunto.',
                  });
                }}
                className="flex-1 py-2 px-3 text-xs font-mono border border-[#2c2e29] bg-[#181917] text-[#f4f3ef] hover:border-[#6e706a] cursor-pointer"
              >
                Alternar: {exerciseSubMode === 'reassembly' ? 'Remontar' : 'Desmontar'}
              </button>
            )}

            <button
              type="button"
              disabled={currentStepIdx >= totalSteps}
              onClick={() => {
                setIsPlaying(false);
                const stepNow = activeSequence[currentStepIdx];
                const partObj =
                  machine.parts.find((p) => p.id === stepNow?.partId) || null;
                if (partObj) onSelectPart(partObj);
                onStepChange(Math.min(totalSteps, currentStepIdx + 1));
              }}
              className="px-2.5 py-2 text-xs font-mono border border-[#2c2e29] bg-[#181917] text-[#d4d2c8] hover:border-[#6e706a] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <span>Próxima</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onStepChange(0);
                setManualExplode(0);
                setFeedback(null);
              }}
              className="p-2 text-xs font-mono border border-[#2c2e29] bg-[#181917] text-[#a3a29a] hover:text-white cursor-pointer"
              title="Reiniciar sequência"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feedback Construtivo Imediato (Fase 5 & 6) */}
          {feedback && (
            <div
              className={`p-3.5 border text-xs space-y-1 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-rose-950/40 border-rose-600/50 text-rose-200'
                  : 'bg-[#1a1b18] border-[#383a34] text-[#d4d2c8]'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : feedback.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#e8590c] shrink-0" />
                )}
                <span>{feedback.title}</span>
              </div>
              <p className="leading-relaxed opacity-90">{feedback.message}</p>
            </div>
          )}
        </div>

        {/* BLOCO B: PAPEL DO COMPONENTE SELECIONADO NO CONJUNTO */}
        <div className="p-5 space-y-4 flex-1">
          {selectedPart ? (
            <>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c8b82]">
                  PEÇA SELECIONADA ({selectedPart.tag})
                </div>
                <h3 className="text-base font-bold text-[#f4f3ef] mt-0.5">
                  {selectedPart.name}
                </h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-[#181917] border border-[#262724]">
                  <div className="text-[10px] font-mono uppercase text-[#e8590c] mb-1">
                    O que esta peça faz:
                  </div>
                  <p className="text-[#e6e4dd]">{selectedPart.simpleDefinition}</p>
                </div>

                <div className="p-3 bg-[#181917] border border-[#262724]">
                  <div className="text-[10px] font-mono uppercase text-[#a3a29a] mb-1">
                    Como se conecta ao conjunto:
                  </div>
                  <p className="text-[#c4c3ba]">
                    {vectors[selectedPart.id]?.shortRolePt || selectedPart.relationshipWithOthers}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#181917] border border-[#262724]">
                  <span className="text-[11px] font-mono text-[#8c8b82] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#e8590c]" />
                    Ferramenta correta:
                  </span>
                  <span className="text-xs font-mono font-bold text-[#f4f3ef]">
                    {selectedPart.meshData.requiredTool}
                  </span>
                </div>

                {/* Revelação Progressiva: Detalhes Técnicos Avançados Opcionais */}
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono border border-[#262724] bg-[#141513] text-[#a3a29a] hover:text-white cursor-pointer"
                >
                  <span>Detalhes Técnicos e Falhas Comuns</span>
                  {showTechnicalDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showTechnicalDetails && (
                  <div className="p-3 bg-[#141513] border border-[#262724] space-y-2 text-xs text-[#b5b4ab]">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#8c8b82] block">
                        Função técnica no projeto:
                      </span>
                      {selectedPart.mainFunction}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-amber-400 block">
                        Sintoma de desgaste ou falha:
                      </span>
                      {selectedPart.typicalFailureModes}
                    </div>
                    <div className="font-mono text-[11px] text-[#8c8b82] pt-1 border-t border-[#262724]">
                      Material: {selectedPart.material} · Tolerância: {selectedPart.tolerance}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 bg-[#181917] border border-[#262724] text-xs text-[#a3a29a] space-y-2">
              <div className="font-bold text-[#f4f3ef]">Observe a máquina isométrica</div>
              <p className="leading-relaxed">
                Clique em qualquer componente na ilustração ao lado (como a{' '}
                <strong className="text-white">Carcaça em Voluta</strong>, o{' '}
                <strong className="text-white">Rotor Centrífugo</strong> ou o{' '}
                <strong className="text-white">Eixo Escalonado</strong>) para ver sua função mecânica
                e como ele se encaixa no conjunto.
              </p>
            </div>
          )}

          {/* Nota de Transparência Pedagógica Híbrida 2D/3D (Fase 4-C) */}
          <div className="p-3.5 bg-[#161715] border border-[#262724] space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c8b82]">
              SISTEMA HÍBRIDO 2.5D ISOMÉTRICO + 3D CAD
            </div>
            <p className="text-[11px] text-[#a3a29a] leading-relaxed">
              Esta prancha isométrica leve usa o kit <strong>Anatomy (SVG)</strong> para ensinar a
              ordem de desmontagem e o papel de cada peça sem exigir placa de vídeo pesada. Para
              girar a câmera livremente em 360° e inspecionar a geometria volumétrica completa,
              alterne para o modelo 3D CAD.
            </p>
            <button
              type="button"
              onClick={onSwitchTo3D}
              className="w-full py-2 px-3 text-xs font-mono font-bold bg-[#222420] hover:bg-[#2c2f29] text-[#f4f3ef] border border-[#383a34] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-[#e8590c]" />
              <span>Explorar este Conjunto em 3D (360°)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
