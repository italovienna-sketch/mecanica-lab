import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Captions, ChevronLeft, ChevronRight, FileText, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import type { MicroMedia } from '../../data/microLessons';
import { MissingScene, SCENES } from './MicroScenes';

const fmt = (s: number) => {
  const v = Math.max(0, Math.round(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
};

interface MicroPlayerProps {
  media: MicroMedia;
  title: string;
  reducedMotion: boolean;
  /** Chamado quando a demonstração chega ao fim (ou o aluno pula para a pergunta). */
  onEnded: () => void;
}

/**
 * Player das aulas rápidas.
 * - Demonstração animada (SVG): sem som, não começa sozinha, legenda sincronizada e transcrição.
 * - Vídeo próprio/licenciado: elemento <video> nativo com faixa de legendas WebVTT.
 */
export const MicroPlayer: React.FC<MicroPlayerProps> = (props) =>
  props.media.kind === 'video' ? <VideoPlayer {...props} media={props.media} /> : <AnimationPlayer {...props} media={props.media} />;

const AnimationPlayer: React.FC<MicroPlayerProps & { media: Extract<MicroMedia, { kind: 'animation' }> }> = ({ media, title, reducedMotion, onEnded }) => {
  const scenes = media.scenes;
  const starts = useMemo(() => {
    let acc = 0;
    return scenes.map((s) => {
      const st = acc;
      acc += s.seconds;
      return st;
    });
  }, [scenes]);
  const total = scenes.reduce((a, s) => a + s.seconds, 0);

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [transcript, setTranscript] = useState(false);
  const endedRef = useRef(false);
  const lastRef = useRef<number | null>(null);

  // Laço de animação só enquanto está tocando.
  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      const last = lastRef.current ?? now;
      lastRef.current = now;
      setElapsed((e) => Math.min(total, e + (now - last) / 1000));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  useEffect(() => {
    if (elapsed >= total && playing) {
      setPlaying(false);
      if (!endedRef.current) {
        endedRef.current = true;
        onEnded();
      }
    }
  }, [elapsed, total, playing, onEnded]);

  let idx = starts.findIndex((st, i) => elapsed >= st && elapsed < st + scenes[i].seconds);
  if (idx === -1) idx = scenes.length - 1;
  const scene = scenes[idx];
  const localT = Math.min(1, Math.max(0, (elapsed - starts[idx]) / scene.seconds));
  // Movimento reduzido: cada cena aparece já no estado final, sem animação.
  const t = reducedMotion ? 1 : localT;
  const SceneComp = SCENES[scene.visual] || MissingScene;
  const atEnd = elapsed >= total - 0.01;

  const play = useCallback(() => {
    if (elapsed >= total - 0.01) setElapsed(0);
    setStarted(true);
    setPlaying(true);
  }, [elapsed, total]);

  const goScene = (i: number) => {
    const j = Math.max(0, Math.min(scenes.length - 1, i));
    setElapsed(starts[j] + 0.001);
    setStarted(true);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      if (playing) setPlaying(false);
      else play();
    } else if (e.key === 'ArrowRight') goScene(idx + 1);
    else if (e.key === 'ArrowLeft') goScene(idx - 1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950" onKeyDown={onKey}>
      <div className="relative" data-testid="micro-stage">
        <div aria-hidden={!started}>
          <SceneComp t={started ? t : 0.0001} param={scene.param} />
        </div>
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-950/55 p-4 text-center">
            <button onClick={play} className="btn-primary px-6 py-3 text-base" aria-label={`Assistir demonstração: ${title}`}>
              <Play className="h-5 w-5" aria-hidden /> Assistir ({fmt(total)})
            </button>
            <p className="max-w-sm text-xs text-ink-200">Demonstração animada desenhada para esta aula · sem som · legendas ativadas</p>
          </div>
        )}
        {atEnd && started && !playing && (
          <div className="absolute right-2 top-2 rounded-md bg-ink-950/85 px-2 py-1 text-xs font-medium text-ink-100">Fim da demonstração</div>
        )}
      </div>

      {/* Legenda abaixo da cena, para não cobrir o desenho. */}
      {captions && (
        <p className="min-h-[3.5rem] border-t border-ink-800 bg-black px-3 py-2 text-center text-sm leading-snug text-white sm:text-base" data-testid="micro-caption">
          {started ? scene.caption : 'Toque em Assistir para começar.'}
        </p>
      )}

      {/* Leitores de tela recebem a legenda atual. */}
      <p className="sr-only" aria-live="polite">
        {started ? `Cena ${idx + 1} de ${scenes.length}: ${scene.caption}` : ''}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-800 px-2 py-2 sm:px-3">
        {playing ? (
          <button className="btn-ghost px-2.5" onClick={() => setPlaying(false)} aria-label="Pausar">
            <Pause className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <button className="btn-ghost px-2.5" onClick={play} aria-label={atEnd && started ? 'Assistir de novo' : 'Reproduzir'}>
            {atEnd && started ? <RotateCcw className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
          </button>
        )}
        <button className="btn-ghost px-2" onClick={() => goScene(idx - 1)} disabled={idx === 0} aria-label="Cena anterior">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button className="btn-ghost px-2" onClick={() => goScene(idx + 1)} disabled={idx === scenes.length - 1} aria-label="Próxima cena">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
        <label className="flex min-w-[140px] flex-1 items-center gap-2">
          <span className="sr-only">Posição na demonstração</span>
          <input
            type="range"
            min={0}
            max={total}
            step={0.1}
            value={elapsed}
            onChange={(e) => {
              setElapsed(Number(e.target.value));
              setStarted(true);
            }}
            className="h-1.5 w-full cursor-pointer accent-[#e8590c]"
            aria-valuetext={`${fmt(elapsed)} de ${fmt(total)}`}
          />
        </label>
        <span className="w-[84px] shrink-0 text-right font-mono text-xs text-ink-300" data-testid="micro-time">
          {fmt(elapsed)} / {fmt(total)}
        </span>
        <button className={`btn-ghost px-2 ${captions ? 'text-accent-text' : ''}`} onClick={() => setCaptions((v) => !v)} aria-pressed={captions} aria-label="Legendas">
          <Captions className="h-5 w-5" aria-hidden />
        </button>
        <button className={`btn-ghost px-2 ${transcript ? 'text-accent-text' : ''}`} onClick={() => setTranscript((v) => !v)} aria-pressed={transcript} aria-label="Transcrição">
          <FileText className="h-5 w-5" aria-hidden />
        </button>
        {!atEnd && (
          <button
            className="btn-ghost px-2 text-xs"
            onClick={() => {
              setPlaying(false);
              if (!endedRef.current) {
                endedRef.current = true;
                onEnded();
              }
            }}
          >
            <SkipForward className="h-4 w-4" aria-hidden /> Ir para a pergunta
          </button>
        )}
      </div>

      {transcript && (
        <ol className="space-y-1.5 border-t border-ink-800 bg-ink-900 px-4 py-3 text-sm text-ink-300" aria-label="Transcrição da demonstração">
          {scenes.map((s, i) => (
            <li key={i}>
              <button className={`text-left hover:text-ink-100 ${i === idx && started ? 'font-semibold text-ink-100' : ''}`} onClick={() => goScene(i)}>
                <span className="mr-2 font-mono text-xs text-ink-500">{fmt(starts[i])}</span>
                {s.caption}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const VideoPlayer: React.FC<MicroPlayerProps & { media: Extract<MicroMedia, { kind: 'video' }> }> = ({ media, title, onEnded }) => {
  const [error, setError] = useState(false);
  const [transcript, setTranscript] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
      {error ? (
        <div role="alert" className="flex aspect-video items-center justify-center p-6 text-center text-sm text-ink-300">
          Não foi possível carregar o vídeo. Use a transcrição abaixo e tente de novo mais tarde.
        </div>
      ) : (
        <video
          className="aspect-video w-full bg-black"
          controls
          preload="metadata"
          playsInline
          poster={media.poster}
          onEnded={onEnded}
          onError={() => setError(true)}
          aria-label={title}
        >
          <source src={media.src} onError={() => setError(true)} />
          <track kind="captions" src={media.captionsSrc} srcLang="pt-BR" label="Português" default />
        </video>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-ink-800 px-3 py-2 text-xs text-ink-400">
        <span>{media.credit}</span>
        <button className={`btn-ghost px-2 ${transcript ? 'text-accent-text' : ''}`} onClick={() => setTranscript((v) => !v)} aria-pressed={transcript}>
          <FileText className="h-4 w-4" aria-hidden /> Transcrição
        </button>
      </div>
      {transcript && (
        <div className="space-y-1.5 border-t border-ink-800 bg-ink-900 px-4 py-3 text-sm text-ink-300">
          {media.transcript.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};
