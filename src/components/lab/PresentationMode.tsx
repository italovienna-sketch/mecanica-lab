import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Captions, ChevronLeft, ChevronRight, Info, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { MachineData } from '../../data/mechanicalMachines';
import { MachineLabConfig, Vec3 } from '../../data/labMission';
import { CameraView, ThreeSceneEngine } from './ThreeSceneEngine';
import pumpScript from '../../data/presentation/centrifugal-pump.json';

/**
 * Modo apresentação do Laboratório 3D: tela cheia, sem painéis, com tomadas de câmera prontas,
 * legendas e narração opcional. Serve para aula projetada e para gravar vídeo.
 *
 * - `#/lab/<máquina>/apresentacao` abre direto neste modo.
 * - `#/lab/<máquina>/apresentacao/gravacao` é o modo de gravação: sem controles nem cursor, começa sozinho,
 *   não toca áudio e publica a linha do tempo em `window.__presentation` para o script de captura.
 */

export interface PresentationShot {
  id: string;
  title: string;
  caption: string;
  camera?: { dir?: CameraView | Vec3; parts?: string[]; fill?: number };
  /** Pose da desmontagem mostrada (0 = montada). Ignorada quando há `step`. */
  pose?: number;
  /** Etapa de desmontagem animada nesta tomada (parte da pose `step` e termina em `step + 1`). */
  step?: number;
  explode?: number;
  labels?: boolean;
  xray?: boolean;
  cutaway?: boolean;
  running?: boolean;
  highlight?: string;
  /** Duração mínima em segundos (a narração, quando existe e é mais longa, estende a tomada). */
  duration: number;
}

export interface PresentationScript {
  machineId: string;
  title: string;
  notice: string;
  shots: PresentationShot[];
}

/** Narração gerada por `scripts/media/narrate-presentation.py` (opcional). */
interface NarrationManifest {
  voice?: string;
  shots: Record<string, { file: string; seconds: number }>;
}

export interface TimelineEntry {
  id: string;
  title: string;
  caption: string;
  start: number;
  seconds: number;
  audio?: string;
}

declare global {
  interface Window {
    __presentation?: { ready: boolean; index: number; done: boolean; total: number; timeline: TimelineEntry[]; animating: () => boolean };
  }
}

const SCRIPTS: Record<string, PresentationScript> = {
  'centrifugal-pump': pumpScript as PresentationScript
};

const DEFAULT_NOTICE = 'Modelo educacional simplificado. No trabalho real valem o manual do fabricante e o procedimento da empresa.';

/** Roteiro automático para equipamentos sem roteiro próprio: visão geral, vista explodida e cada etapa. */
export function buildAutoScript(machine: MachineData, config: MachineLabConfig): PresentationScript {
  const N = config.disassembly.length;
  return {
    machineId: machine.id,
    title: machine.name,
    notice: DEFAULT_NOTICE,
    shots: [
      { id: 'visao-geral', title: machine.name, caption: config.purpose, camera: { dir: 'iso' }, pose: 0, duration: 8 },
      {
        id: 'pecas',
        title: 'As peças',
        caption: 'Vista explodida: as peças principais, afastadas e com nome.',
        camera: { dir: 'iso', fill: 1.15 },
        pose: 0,
        explode: 0.8,
        labels: true,
        duration: 8
      },
      ...config.disassembly.map<PresentationShot>((st, i) => ({
        id: `etapa-${i + 1}`,
        title: `${i + 1}. ${st.title}`,
        caption: `${st.title}. Ferramenta: ${st.tool}.`,
        camera: { dir: 'iso', parts: Object.keys(st.moves), fill: 1.4 },
        step: i,
        highlight: st.partId,
        duration: 7
      })),
      { id: 'fim', title: 'Desmontado', caption: DEFAULT_NOTICE, camera: { dir: 'iso' }, pose: N, duration: 6 }
    ]
  };
}

export const isPresentationHash = (machineId: string) => window.location.hash.startsWith(`#/lab/${machineId}/apresentacao`);
const isRecordingHash = (machineId: string) => window.location.hash.startsWith(`#/lab/${machineId}/apresentacao/gravacao`);

const mediaBase = (machineId: string) => `${import.meta.env.BASE_URL}media/apresentacao/${machineId}/`;

export const PresentationMode: React.FC<{
  machine: MachineData;
  config: MachineLabConfig;
  engine: ThreeSceneEngine | null;
  /** O modelo 3D terminou de carregar. */
  ready: boolean;
  onClose: () => void;
}> = ({ machine, config, engine, ready, onClose }) => {
  const script = useMemo(() => SCRIPTS[machine.id] || buildAutoScript(machine, config), [machine, config]);
  const shots = script.shots;
  const recording = useMemo(() => isRecordingHash(machine.id), [machine.id]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(recording);
  // Na gravação, legendas só com `/legendas` no fim do endereço (o .srt sai separado de qualquer forma).
  const [captions, setCaptions] = useState(() => !recording || window.location.hash.includes('/legendas'));
  const [narration, setNarration] = useState(false);
  const [manifest, setManifest] = useState<NarrationManifest | null | undefined>(undefined);
  const [hud, setHud] = useState(!recording);
  const [idle, setIdle] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstShot = useRef(true);

  // Narração é opcional: só existe depois de rodar o script de geração.
  useEffect(() => {
    let alive = true;
    fetch(`${mediaBase(machine.id)}narracao.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: NarrationManifest | null) => alive && setManifest(m && m.shots ? m : null))
      .catch(() => alive && setManifest(null));
    return () => {
      alive = false;
    };
  }, [machine.id]);

  // Com narração, a tomada dura pelo menos o áudio + uma pausa curta.
  const timeline = useMemo<TimelineEntry[]>(() => {
    let t = 0;
    return shots.map((s) => {
      const a = manifest?.shots[s.id];
      const seconds = Math.max(s.duration, a ? Math.ceil((a.seconds + 0.9) * 10) / 10 : 0);
      const e = { id: s.id, title: s.title, caption: s.caption, start: t, seconds, audio: a ? `${mediaBase(machine.id)}${a.file}` : undefined };
      t += seconds;
      return e;
    });
  }, [shots, manifest, machine.id]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  /* Aplica a tomada atual na cena. */
  useEffect(() => {
    if (!engine || !ready || manifest === undefined) return;
    const shot = shots[index];
    clearTimers();
    const move = firstShot.current ? 0 : 1400;
    firstShot.current = false;
    engine.setIsolated(null);
    engine.setHidden([]);
    engine.select(null);
    engine.setRunning(false);
    engine.jumpToPose(shot.step ?? shot.pose ?? 0);
    engine.setExplode(shot.explode ?? 0);
    engine.setXray(!!shot.xray);
    engine.setLabelsVisible(!!shot.labels);
    engine.setCutaway(!!shot.cutaway);
    engine.setTarget(shot.highlight ?? null);
    engine.frameParts(shot.camera?.parts ?? null, shot.camera?.dir ?? 'iso', {
      fill: shot.camera?.fill,
      ms: move,
      poses: shot.step !== undefined ? [shot.step, shot.step + 1] : undefined
    });
    if (shot.step !== undefined) {
      const st = shot.step;
      later(() => engine.animateStep(st, 1), move + 600);
    }
    if (shot.running) later(() => engine.setRunning(true), move);
    return clearTimers;
  }, [engine, ready, manifest, index, shots]);

  /* Avanço automático e narração. */
  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (!playing || !ready || manifest === undefined) return;
    const entry = timeline[index];
    if (narration && !recording && entry.audio) {
      const a = new Audio(entry.audio);
      audioRef.current = a;
      a.play().catch(() => setNarration(false));
    }
    const t = window.setTimeout(() => {
      if (index + 1 < shots.length) setIndex(index + 1);
      else setPlaying(false);
    }, entry.seconds * 1000);
    return () => window.clearTimeout(t);
  }, [playing, ready, manifest, index, narration, recording, timeline, shots.length]);

  useEffect(() => () => audioRef.current?.pause(), []);

  /* Estado público para o script de gravação. */
  useEffect(() => {
    const total = timeline.reduce((acc, e) => acc + e.seconds, 0);
    window.__presentation = {
      ready: ready && manifest !== undefined,
      index,
      done: index === shots.length - 1 && !playing && ready,
      total,
      timeline,
      animating: () => !!engine?.isAnimating()
    };
  }, [ready, manifest, index, playing, timeline, shots.length, engine]);
  useEffect(
    () => () => {
      delete window.__presentation;
    },
    []
  );

  const go = useCallback(
    (d: number) => {
      setIndex((i) => Math.max(0, Math.min(shots.length - 1, i + d)));
    },
    [shots.length]
  );

  /* Teclado: espaço, setas, Esc, C (legendas), N (narração), H (controles). */
  useEffect(() => {
    if (recording) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      setIdle(false);
      switch (e.key) {
        case ' ':
        case 'k':
          // Espaço sobre um botão focado aciona o botão; só tratamos quando o foco não está num botão.
          if (tag === 'BUTTON' && e.key === ' ') return;
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case 'ArrowRight':
          e.preventDefault();
          go(1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          go(-1);
          break;
        case 'Home':
          setIndex(0);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'c':
        case 'C':
          setCaptions((v) => !v);
          break;
        case 'n':
        case 'N':
          if (manifest) setNarration((v) => !v);
          break;
        case 'h':
        case 'H':
          setHud((v) => !v);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recording, go, onClose, manifest]);

  useEffect(() => {
    if (recording) return;
    const wake = () => setIdle(false);
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    return () => {
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
    };
  }, [recording]);

  // Controles somem sozinhos durante a reprodução, depois de alguns segundos sem mexer o mouse.
  useEffect(() => {
    if (!playing || idle) return;
    const t = window.setTimeout(() => setIdle(true), 2800);
    return () => window.clearTimeout(t);
  }, [playing, idle, index]);

  useEffect(() => {
    if (!recording) rootRef.current?.focus();
  }, [recording]);

  const shot = shots[index];
  const showHud = hud && !(playing && idle);
  const ctl = 'flex h-10 w-10 items-center justify-center rounded-lg text-ink-100 hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="region"
      aria-label={`Modo apresentação: ${script.title}`}
      className={`absolute inset-0 z-30 outline-none ${recording || (playing && idle) ? 'cursor-none' : ''}`}
      style={{ pointerEvents: 'none' }}
      data-testid="presentation"
    >
      {/* Aviso fixo: aparece também na gravação. */}
      <p className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-amber-700/60 bg-ink-950/80 px-2 py-1 text-xs font-medium text-amber-200 sm:left-5 sm:top-5 sm:text-sm">
        <Info className="h-3.5 w-3.5" aria-hidden /> Modelo educacional simplificado
      </p>

      {/* Título da tomada e controles (não existem no modo gravação) */}
      {!recording && (
      <div className={`transition-opacity duration-300 ${showHud ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!showHud}>
        <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-5 sm:top-5" style={{ pointerEvents: showHud ? 'auto' : 'none' }}>
          <div className="hidden rounded-lg border border-ink-700 bg-ink-950/85 px-3 py-1.5 text-right sm:block">
            <p className="text-xs text-ink-400">{script.title}</p>
            <p className="text-sm font-semibold text-ink-100">{shot.title}</p>
          </div>
          <button className={`${ctl} border border-ink-700 bg-ink-950/85`} onClick={onClose} aria-label="Sair da apresentação (Esc)" title="Sair (Esc)">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-3 flex justify-center px-3 sm:bottom-5" style={{ pointerEvents: showHud ? 'auto' : 'none' }}>
          <div className="flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-950/90 p-1 shadow-lg">
            <button className={ctl} onClick={() => go(-1)} disabled={index === 0} aria-label="Tomada anterior (seta para a esquerda)" title="Anterior (←)">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              className={ctl}
              onClick={() => {
                if (!playing && index === shots.length - 1) setIndex(0);
                setPlaying((p) => !p);
              }}
              aria-label={playing ? 'Pausar (espaço)' : 'Reproduzir (espaço)'}
              title={playing ? 'Pausar (espaço)' : 'Reproduzir (espaço)'}
              data-testid="presentation-play"
            >
              {playing ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
            </button>
            <button className={ctl} onClick={() => go(1)} disabled={index === shots.length - 1} aria-label="Próxima tomada (seta para a direita)" title="Próxima (→)">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <span className="min-w-[3.5rem] px-1 text-center text-sm tabular-nums text-ink-300" aria-live="polite" data-testid="presentation-counter">
              {index + 1}/{shots.length}
            </span>
            <button
              className={`${ctl} ${captions ? 'text-accent-text' : 'text-ink-400'}`}
              onClick={() => setCaptions((v) => !v)}
              aria-pressed={captions}
              aria-label="Legendas (C)"
              title="Legendas (C)"
            >
              <Captions className="h-5 w-5" aria-hidden />
            </button>
            {manifest && (
              <button
                className={`${ctl} ${narration ? 'text-accent-text' : 'text-ink-400'}`}
                onClick={() => setNarration((v) => !v)}
                aria-pressed={narration}
                aria-label="Narração (N)"
                title="Narração (N)"
              >
                {narration ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5" aria-hidden />}
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Legenda */}
      {captions && (
        <div className={`absolute inset-x-0 flex justify-center px-4 transition-[bottom] duration-300 ${showHud ? 'bottom-[4.75rem] sm:bottom-24' : 'bottom-6 sm:bottom-10'}`}>
          <p className="max-w-3xl rounded-lg bg-black/75 px-4 py-2 text-center text-base leading-snug text-white sm:text-xl" data-testid="presentation-caption">
            {shot.caption}
          </p>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {`${shot.title}. ${shot.caption}`}
      </p>
    </div>
  );
};
