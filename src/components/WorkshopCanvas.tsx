import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ChevronUp, Map as MapIcon, RefreshCw, ShieldCheck } from 'lucide-react';
import { CampusScene } from '../game/CampusScene';
import {
  CORRIDOR_AREA,
  CampusStation,
  PPE_LABEL,
  PPE_REASON,
  PpeItem,
  ROOMS,
  ROOMS_BY_ID,
  Room,
  SPAWN,
  STATIONS,
  WORLD,
  isWalkable,
  missingPpe,
  ppeFix,
  roomEntrance
} from '../game/campusLayout';
import { useGameState } from '../context/GameStateContext';
import { PlayerPosition } from '../types/game';
import { Dialog } from './ui';

/**
 * Oficina 2D: campus da escola em planta baixa. Cada sala leva a uma parte do Mecânica Lab.
 * O motor (Phaser) desenha e move o personagem; esta tela cuida do que é interface: sala atual,
 * convite de interação, minimapa, controles de toque e o aviso de EPI na porta da oficina.
 */

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const WorkshopCanvas: React.FC = () => {
  const { playerPosition, updatePlayerPosition, navigateTo, playerProfile, updateCustomization, reducedMotion, setLastActivity } = useGameState();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CampusScene | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mountKey, setMountKey] = useState(0);
  const [station, setStation] = useState<CampusStation | null>(null);
  const [area, setArea] = useState<{ id: string; name: string } | null>(null);
  const [pos, setPos] = useState<PlayerPosition>(playerPosition);
  const [gateRoom, setGateRoom] = useState<Room | null>(null);
  const [mapOpen, setMapOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768);

  const custom = playerProfile.customization;
  const openRooms = useMemo(() => ROOMS.filter((r) => r.ppe && missingPpe(custom, r.ppe).length === 0).map((r) => r.id), [custom]);
  const motionOff = reducedMotion || prefersReducedMotion();

  // Valores que a cena lê só ao nascer (mudanças depois vão por métodos da cena, sem recriar o jogo).
  const bootRef = useRef({ playerPosition, custom, openRooms, motionOff });
  bootRef.current = { playerPosition, custom, openRooms, motionOff };

  const leave = useCallback(
    (s: CampusStation) => {
      const p = sceneRef.current?.getPosition();
      if (p) updatePlayerPosition(p);
      navigateTo(s.targetRoute, s.paramId);
    },
    [navigateTo, updatePlayerPosition]
  );
  const leaveRef = useRef(leave);
  leaveRef.current = leave;

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;
    let game: Phaser.Game | null = null;
    let cancelled = false;
    setReady(false);
    setError(null);

    const boot = () => {
      if (cancelled) return;
      const { playerPosition: start0, custom: c, openRooms: open, motionOff: noMotion } = bootRef.current;
      // Posição guardada de outra versão do mapa pode cair dentro de uma parede: volta para a entrada.
      const start = isWalkable(start0.x, start0.y) ? start0 : { ...SPAWN, direction: 'down' as const };
      try {
        const scene = new CampusScene(
          {
            onStationChange: setStation,
            onInteract: (s) => leaveRef.current(s),
            onAreaChange: setArea,
            onGateBlocked: setGateRoom,
            onMove: setPos
          },
          { start, customization: c, reducedMotion: noMotion, openRooms: open }
        );
        sceneRef.current = scene;
        game = new Phaser.Game({
          // Canvas 2D: não disputa contexto WebGL com o laboratório 3D.
          type: Phaser.CANVAS,
          parent,
          backgroundColor: '#0f100e',
          physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
          scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth || 800, height: parent.clientHeight || 600 },
          scene: [scene],
          render: { antialias: true, pixelArt: false },
          banner: false,
          // Sem suavização do passo de tempo: a velocidade de caminhada não cai quando a taxa de quadros cai.
          fps: { smoothStep: false },
          callbacks: { postBoot: () => !cancelled && setReady(true) }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao iniciar o mapa 2D.');
      }
    };

    // Os rótulos do mapa usam a IBM Plex; espera a fonte para não desenhar com a fonte reserva.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      Promise.race([fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(boot);
    } else boot();

    return () => {
      cancelled = true;
      const p = sceneRef.current?.getPosition();
      if (p) updatePlayerPosition(p);
      sceneRef.current = null;
      game?.destroy(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountKey]);

  // Visual e portas acompanham o Perfil sem reiniciar o mapa.
  useEffect(() => {
    if (!ready) return;
    sceneRef.current?.updateAvatar(custom);
    for (const r of ROOMS.filter((room) => room.ppe)) sceneRef.current?.setRoomOpen(r.id, openRooms.includes(r.id));
  }, [ready, custom, openRooms]);

  useEffect(() => {
    setLastActivity('workshop', 'Oficina 2D');
  }, [setLastActivity]);

  const currentRoom = area ? ROOMS_BY_ID[area.id] : undefined;
  const missing = gateRoom ? missingPpe(custom, gateRoom.ppe) : [];

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950 text-ink-200">
      <h1 className="sr-only">Oficina 2D — campus da escola</h1>
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="application"
        aria-roledescription="mapa"
        aria-label="Mapa do campus. Use as setas ou W, A, S, D para andar e E ou Enter para usar a estação marcada."
        tabIndex={0}
        data-testid="campus-canvas"
        data-x={pos.x}
        data-y={pos.y}
        data-area={area?.id ?? ''}
      />

      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-400" role="status">
          Montando o mapa do campus…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="card max-w-sm p-5 text-center" role="alert">
            <p className="font-semibold text-ink-100">Não foi possível abrir o mapa</p>
            <p className="mt-1 text-sm text-ink-400">{error}</p>
            <button className="btn-primary mt-4" onClick={() => setMountKey((k) => k + 1)}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Tentar de novo
            </button>
          </div>
        </div>
      )}

      {/* Onde estou */}
      {ready && (
        <div className="pointer-events-none absolute left-3 top-3 max-w-[min(22rem,calc(100%-8.5rem))]" aria-live="polite">
          <div className="card pointer-events-auto flex items-stretch overflow-hidden bg-ink-900/95 text-sm">
            <span className="flex w-11 shrink-0 items-center justify-center border-r border-ink-700 font-mono text-base font-semibold text-accent-text">
              {currentRoom?.code ?? '—'}
            </span>
            <span className="min-w-0 px-3 py-2">
              <span className="block truncate font-semibold text-ink-100">{area?.name ?? 'Campus'}</span>
              <span className="hidden text-xs text-ink-400 sm:block">
                {currentRoom?.purpose ?? (area?.id === CORRIDOR_AREA.id ? 'Liga todas as salas. Siga as faixas amarelas.' : '')}
              </span>
            </span>
          </div>
        </div>
      )}

      {ready && <Minimap pos={pos} open={mapOpen} onToggle={() => setMapOpen((o) => !o)} openRooms={openRooms} onGo={(id) => sceneRef.current?.teleport(roomEntrance(id).x, roomEntrance(id).y)} />}

      {/* Convite de interação */}
      {ready && station && (
        <div className="absolute inset-x-3 bottom-[124px] flex justify-center lg:bottom-6">
          <div className="card flex w-full max-w-md items-center gap-3 bg-ink-900/95 py-2.5 pl-4 pr-2.5" data-testid="campus-prompt">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ink-100">{station.name}</span>
              <span className="block text-xs text-ink-400">
                <span className="hidden lg:inline">
                  Pressione <kbd className="rounded border border-ink-600 px-1 font-mono text-ink-200">E</kbd> ou toque em Abrir para{' '}
                </span>
                <span className="lg:hidden">Toque em Abrir para </span>
                {station.action}
              </span>
            </span>
            <button className="btn-primary shrink-0" onClick={() => leave(station)}>
              Abrir
            </button>
          </div>
        </div>
      )}

      {ready && <TouchPad onDir={(d) => sceneRef.current?.setVirtualDirection(d)} />}

      {ready && (
        <p className="absolute bottom-3 right-3 hidden rounded-md bg-ink-900/90 px-3 py-1.5 text-xs text-ink-400 lg:block">
          <kbd className="font-mono text-ink-200">Setas</kbd> ou <kbd className="font-mono text-ink-200">WASD</kbd> andar ·{' '}
          <kbd className="font-mono text-ink-200">E</kbd> usar
        </p>
      )}

      <Dialog
        open={Boolean(gateRoom)}
        title={gateRoom ? `${gateRoom.name}: entrada com EPI` : ''}
        onClose={() => setGateRoom(null)}
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setGateRoom(null);
                navigateTo('character');
              }}
            >
              Ir ao vestiário
            </button>
            <button
              data-autofocus
              className="btn-primary"
              onClick={() => {
                updateCustomization(ppeFix(missing));
                setGateRoom(null);
              }}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden /> Vestir o que falta
            </button>
          </>
        }
      >
        <p>Para as atividades desta sala, a simulação pede:</p>
        <ul className="mt-3 space-y-2">
          {(gateRoom?.ppe ?? []).map((item: PpeItem) => {
            const ok = !missing.includes(item);
            return (
              <li key={item} className="flex gap-2">
                <span className={`mt-0.5 shrink-0 text-xs font-semibold ${ok ? 'text-emerald-400' : 'text-amber-300'}`}>{ok ? 'OK' : 'FALTA'}</span>
                <span>
                  <span className="font-medium text-ink-100">{PPE_LABEL[item]}</span>
                  <span className="block text-xs text-ink-400">{PPE_REASON[item]}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-ink-500">
          Regra didática desta simulação. Na empresa, os EPIs de cada tarefa vêm da análise de riscos do local, não de uma lista fixa.
        </p>
      </Dialog>
    </div>
  );
};

/* ───────────── Minimapa ───────────── */

const Minimap: React.FC<{
  pos: PlayerPosition;
  open: boolean;
  onToggle: () => void;
  openRooms: string[];
  onGo: (roomId: string) => void;
}> = ({ pos, open, onToggle, openRooms, onGo }) => {
  const scale = 0.14;
  const w = WORLD.width * scale;
  const h = WORLD.height * scale;
  return (
    <div className={`absolute right-3 top-3 ${open ? 'w-[min(240px,calc(100vw-1.5rem))]' : 'w-28'}`}>
      <div className="card overflow-hidden bg-ink-900/95">
        <button className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-ink-100" onClick={onToggle} aria-expanded={open}>
          <span className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-accent" aria-hidden /> Mapa
          </span>
          {open ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
        </button>
        {open && (
          <div className="border-t border-ink-800 p-2">
            <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" aria-hidden>
              <rect width={w} height={h} fill="#0f100e" />
              {ROOMS.map((r) => (
                <g key={r.id}>
                  <rect x={r.rect.x * scale} y={r.rect.y * scale} width={r.rect.w * scale} height={r.rect.h * scale} fill="#22241f" stroke="#858780" strokeWidth={0.8} />
                  <text x={(r.rect.x + r.rect.w / 2) * scale} y={(r.rect.y + r.rect.h / 2) * scale + 3} textAnchor="middle" fontSize={9} fill="#c6c4ba" fontFamily="IBM Plex Mono, monospace">
                    {r.code}
                  </text>
                </g>
              ))}
              {STATIONS.map((s) => (
                <rect key={s.id} x={s.x * scale - 1.5} y={s.y * scale - 1.5} width={3} height={3} fill="#e8590c" opacity={0.8} />
              ))}
              <circle cx={pos.x * scale} cy={pos.y * scale} r={4} fill="#f1f0eb" stroke="#0f100e" strokeWidth={1.5} />
            </svg>
            <p className="mb-1 mt-2 px-1 text-xs text-ink-400">Ir para a porta de:</p>
            <ul className="grid grid-cols-2 gap-1">
              {ROOMS.map((r) => (
                <li key={r.id}>
                  <button
                    className="w-full rounded-md px-2 py-1.5 text-left text-xs text-ink-300 hover:bg-ink-800 hover:text-ink-100"
                    onClick={() => onGo(r.id)}
                    title={r.purpose}
                  >
                    <span className="font-mono text-accent-text">{r.code}</span> {r.name}
                    {r.ppe && !openRooms.includes(r.id) && <span className="sr-only"> (exige EPI)</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────────── Controles de toque ───────────── */

const TouchPad: React.FC<{ onDir: (d: { x: number; y: number } | null) => void }> = ({ onDir }) => {
  const hold = (x: number, y: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      onDir({ x, y });
    },
    onPointerUp: () => onDir(null),
    onPointerCancel: () => onDir(null),
    onLostPointerCapture: () => onDir(null),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault()
  });
  const btn = 'flex h-12 w-12 touch-none select-none items-center justify-center rounded-lg border border-ink-700 bg-ink-900/90 text-ink-200 active:bg-ink-700';
  return (
    <div
      className="absolute bottom-3 left-3 grid grid-cols-3 gap-1 lg:hidden"
      role="group"
      aria-label="Andar (manter pressionado)"
      data-testid="campus-touchpad"
    >
      <span />
      <button className={btn} aria-label="Andar para cima" {...hold(0, -1)}>
        <ArrowUp className="h-5 w-5" aria-hidden />
      </button>
      <span />
      <button className={btn} aria-label="Andar para a esquerda" {...hold(-1, 0)}>
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </button>
      <button className={btn} aria-label="Andar para baixo" {...hold(0, 1)}>
        <ArrowDown className="h-5 w-5" aria-hidden />
      </button>
      <button className={btn} aria-label="Andar para a direita" {...hold(1, 0)}>
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
};
