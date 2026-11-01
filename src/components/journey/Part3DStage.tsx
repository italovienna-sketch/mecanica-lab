import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, ScanEye } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { MACHINES_CATALOG } from '../../data/mechanicalMachines';
import { LAB_CONFIGS } from '../../data/labMission';
import { PUMP_MACHINE_ID } from '../../data/journey/missions';
import { PART_REGIONS, PumpPartId, spotLabel } from '../../data/journey/pumpSection';
import { ThreeSceneEngine } from '../lab/ThreeSceneEngine';
import { LoadingState } from '../ui';
import { FeedbackBox } from './activityKit';
import { PumpSection } from './PumpSection';
import type { Vec3 } from '../../data/labMission';
import type { StepProps } from './activities';

/** Um conjunto com um problema plantado. `hidden`: a peça não está lá. `nudge`: a peça está fora do lugar. */
interface FaultScene {
  id: string;
  prompt: string;
  answer: PumpPartId;
  hidden?: string[];
  nudge?: Record<string, Vec3>;
  why: string;
  cutaway?: boolean;
}

const FAULT_SCENES: FaultScene[] = [
  {
    id: 'porca',
    prompt: 'Conferência 1 de 3. Esta bomba foi montada por outra pessoa, em corte. Falta uma peça. Qual?',
    answer: 'pump-impeller-nut',
    hidden: ['pump-impeller-nut'],
    why: 'Sem a porca, nada segura o rotor na ponta do eixo: ele escapa na partida.',
    cutaway: true
  },
  {
    id: 'cubo',
    prompt: 'Conferência 2 de 3. Uma peça está fora do lugar, afastada de onde deveria encostar. Qual?',
    answer: 'pump-coupling-hub',
    nudge: { 'pump-coupling-hub': [-0.55, 0, 0] },
    why: 'O cubo precisa estar assentado no eixo, na posição do manual. Solto, o acoplamento desalinha e pode escapar.'
  },
  {
    id: 'junta',
    prompt: 'Conferência 3 de 3. Antes de fechar, a peça de vedação entre carcaça e tampa foi esquecida. Qual é ela?',
    answer: 'pump-casing-gasket',
    hidden: ['pump-casing-gasket'],
    nudge: { 'pump-volute-casing': [0.5, 0, 0] },
    why: 'Sem a junta, a união entre carcaça e tampa vaza assim que a bomba recebe pressão.'
  }
];

const SEAL_SCENE: FaultScene = {
  id: 'selo',
  prompt: 'Clique no selo mecânico (ele fica na tampa). Use o corte para enxergar por dentro.',
  answer: 'pump-mechanical-seal',
  why: 'O selo fica na tampa, onde o eixo que gira atravessa a parte parada: é o único ponto em que o líquido poderia sair junto com o eixo.',
  cutaway: true
};

/**
 * Atividade espacial no modelo 3D (mesmo motor do laboratório). Sem WebGL, cai para o corte em SVG: a atividade continua
 * possível. A lista de peças ao lado dá o mesmo resultado que clicar na peça, para quem usa teclado.
 */
const Scene3D: React.FC<{ scene: FaultScene; onAnswer: (part: string) => void; resolved: boolean }> = ({ scene, onAnswer, resolved }) => {
  const { graphicsQuality, reducedMotion } = useGameState();
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeSceneEngine | null>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [fallback, setFallback] = useState(false);
  const answerRef = useRef(onAnswer);
  answerRef.current = onAnswer;
  const machine = MACHINES_CATALOG[PUMP_MACHINE_ID];
  const config = LAB_CONFIGS[PUMP_MACHINE_ID];

  useEffect(() => {
    if (!hostRef.current || fallback) return;
    setState('loading');
    const engine = new ThreeSceneEngine({
      container: hostRef.current,
      machine,
      config,
      quality: graphicsQuality,
      reducedMotion,
      callbacks: {
        onSelect: (id) => id && answerRef.current(id),
        onLoadState: (s) => setState(s),
        onWebGLError: () => setFallback(true)
      }
    });
    engineRef.current = engine;
    if (import.meta.env.DEV) (window as unknown as { __mlEngine?: ThreeSceneEngine }).__mlEngine = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // O motor é criado uma vez; a cena muda pelos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback, graphicsQuality, reducedMotion]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e || state !== 'loaded') return;
    e.jumpToPose(0);
    e.setHidden(scene.hidden ?? []);
    e.setNudges(scene.nudge ?? {});
    e.setCutaway(Boolean(scene.cutaway));
    e.setLabelsVisible(false);
    e.select(resolved ? scene.answer : null);
  }, [scene, state, resolved]);

  if (fallback) {
    return (
      <div>
        <p className="notice mb-2">Este computador não abriu o modelo 3D. A atividade segue no corte da bomba.</p>
        <PumpSection title="Corte da bomba: aponte a peça" mode={resolved ? 'none' : 'parts'} active={resolved ? scene.answer : null} onPick={(id) => onAnswer(id)} />
      </div>
    );
  }

  return (
    <div ref={hostRef} data-testid="part3d-stage" className="relative h-[320px] w-full overflow-hidden rounded-lg bg-[#14161a] sm:h-[420px]">
      {state === 'loading' && (
        <div className="absolute inset-0 z-10">
          <LoadingState label="Montando o modelo 3D…" />
        </div>
      )}
      {state === 'error' && <p className="absolute inset-x-3 top-3 z-10 rounded bg-rose-950/90 p-2 text-sm text-rose-200">Não foi possível carregar o modelo. Use a lista de peças ao lado.</p>}
    </div>
  );
};

const PartList: React.FC<{ onPick: (id: string) => void; disabled: boolean }> = ({ onPick, disabled }) => (
  <div>
    <p className="mb-1.5 text-sm font-medium text-ink-200">Ou escolha na lista</p>
    <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
      {PART_REGIONS.map((r) => (
        <li key={r.id}>
          <button disabled={disabled} onClick={() => onPick(r.id)} data-part-answer={r.id} className="w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-left text-sm text-ink-100 transition-colors enabled:hover:border-accent disabled:opacity-50">
            {r.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const Stage: React.FC<{ scenes: FaultScene[]; onPass: () => void; area: string }> = ({ scenes, onPass, area }) => {
  const { logMistake } = useGameState();
  const [i, setI] = useState(0);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState(0);
  const scene = scenes[i];
  const resolved = Boolean(note?.ok);

  const answer = (part: string) => {
    if (resolved) return;
    if (part === scene.answer) setNote({ ok: true, text: scene.why });
    else {
      setErrors((e) => e + 1);
      logMistake({ id: `mx-3d-${scene.id}`, area, skill: 'procedimento', text: scene.prompt, why: scene.why });
      setNote({ ok: false, text: `“${spotLabel(part as PumpPartId)}” está certo aqui. Procure de novo: gire o modelo e compare com o que deveria existir.` });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-ink-100">{scene.prompt}</p>
      <div className="grid gap-3 lg:grid-cols-[1fr_15rem]">
        <div>
          <Scene3D scene={scene} onAnswer={answer} resolved={resolved} />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
            <ScanEye className="h-3.5 w-3.5" aria-hidden /> Arraste para girar, use a roda ou dois dedos para aproximar e clique na peça.
          </p>
        </div>
        <PartList onPick={answer} disabled={resolved} />
      </div>
      {note && (
        <FeedbackBox tone={note.ok ? 'success' : 'error'}>
          <p>{note.text}</p>
        </FeedbackBox>
      )}
      {resolved &&
        (i + 1 < scenes.length ? (
          <button
            className="btn-primary"
            onClick={() => {
              setI((n) => n + 1);
              setNote(null);
            }}
          >
            Próxima conferência <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : errors <= 3 ? (
          <button className="btn-primary" onClick={onPass}>
            Continuar <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <div className="space-y-2">
            <FeedbackBox tone="hint">
              <p>{errors} tentativas erradas. Refaça olhando primeiro o conjunto inteiro, antes de clicar.</p>
            </FeedbackBox>
            <button
              className="btn-secondary"
              onClick={() => {
                setI(0);
                setErrors(0);
                setNote(null);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Refazer
            </button>
          </div>
        ))}
    </div>
  );
};

export const FaultCheckStep: React.FC<StepProps> = ({ onPass }) => {
  const scenes = useMemo(() => FAULT_SCENES, []);
  return <Stage scenes={scenes} onPass={onPass} area="Conferência de montagem" />;
};

export const PickSealStep: React.FC<StepProps> = ({ onPass }) => <Stage scenes={[SEAL_SCENE]} onPass={onPass} area="Onde está o selo?" />;
