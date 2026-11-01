import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, ChevronsLeft, ChevronsRight, Lock, Menu, X, Zap } from 'lucide-react';
import { buildHash, useGameState } from '../../context/GameStateContext';
import { CharacterAvatarSvg } from '../CharacterAvatarSvg';
import { GameScreen } from '../../types/game';
import { ALL_NAV_ITEMS, MOBILE_TAB_SCREENS, NAV_GROUPS, NavItem, currentSectionLabel, isNavActive } from './navConfig';

const COLLAPSE_KEY = 'mecanica_lab_sidebar_collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Abre um destino da navegação. O laboratório volta ao último equipamento usado. */
function useGo() {
  const { navigateTo, playerProfile } = useGameState();
  return (screen: GameScreen) => navigateTo(screen, screen === 'lab' ? playerProfile.lastMachineId : undefined);
}

/** Link de navegação: é um <a> de verdade (abre em nova aba com o botão do meio), mas navega pela aplicação. */
const NavLink: React.FC<{
  item: NavItem;
  current: GameScreen;
  collapsed?: boolean;
  onNavigate?: () => void;
}> = ({ item, current, collapsed, onNavigate }) => {
  const go = useGo();
  const { playerProfile } = useGameState();
  const active = isNavActive(item, current);
  const Icon = item.icon;
  return (
    <a
      href={buildHash(item.screen, item.screen === 'lab' ? playerProfile.lastMachineId : undefined)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();
        go(item.screen);
      }}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={`nav-item ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon className="nav-item-icon" aria-hidden />
      <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
    </a>
  );
};

const NavGroups: React.FC<{ current: GameScreen; collapsed?: boolean; onNavigate?: () => void }> = ({ current, collapsed, onNavigate }) => (
  <div className="flex flex-col gap-4">
    {NAV_GROUPS.map((group) => (
      <div key={group.id} role="group" aria-label={group.label}>
        {group.label &&
          (collapsed ? (
            <div className="mx-3 mb-2 border-t border-ink-800" aria-hidden />
          ) : (
            <p className="mb-1 px-3 text-xs font-medium text-ink-500" aria-hidden>
              {group.label}
            </p>
          ))}
        <ul className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <li key={item.screen}>
              <NavLink item={item} current={current} collapsed={collapsed} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

/** Cartão do perfil no rodapé da navegação: leva a Perfil e configurações. */
const ProfileLink: React.FC<{ collapsed?: boolean; onNavigate?: () => void }> = ({ collapsed, onNavigate }) => {
  const { playerProfile, currentScreen, navigateTo } = useGameState();
  const active = currentScreen === 'character';
  return (
    <a
      href={buildHash('character')}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();
        navigateTo('character');
      }}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? 'Perfil e configurações' : undefined}
      className={`flex items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-ink-800 aria-[current=page]:bg-ink-800 ${collapsed ? 'justify-center' : ''}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-800" aria-hidden>
        <CharacterAvatarSvg customization={playerProfile.customization} mode="portrait" size={32} />
      </span>
      <span className={collapsed ? 'sr-only' : 'min-w-0'}>
        <span className="block truncate text-sm font-semibold leading-tight text-ink-100">{playerProfile.name || 'Aprendiz'}</span>
        <span className="block text-xs leading-tight text-ink-400">
          Nível {playerProfile.level} · {playerProfile.xp} XP
        </span>
        <span className="sr-only">. Perfil e configurações</span>
      </span>
    </a>
  );
};

const InstructorLink: React.FC<{ collapsed?: boolean; onNavigate?: () => void }> = ({ collapsed, onNavigate }) => {
  const { navigateTo, currentScreen } = useGameState();
  return (
    <a
      href={buildHash('teacher')}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();
        navigateTo('teacher');
      }}
      aria-current={currentScreen === 'teacher' ? 'page' : undefined}
      title={collapsed ? 'Área do instrutor' : undefined}
      className={`nav-item text-xs ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className={collapsed ? 'sr-only' : ''}>Área do instrutor</span>
    </a>
  );
};

const Brand: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { navigateTo } = useGameState();
  return (
    <a
      href="#/"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigateTo('landing');
      }}
      className="flex items-center gap-2.5 rounded-md"
    >
      <span className="brand-mark" aria-hidden>
        ML
      </span>
      <span className={compact ? 'sr-only' : 'font-semibold tracking-tight text-ink-100'}>Mecânica Lab</span>
      <span className="sr-only">, ir para o início</span>
    </a>
  );
};

/* ───────────── Barra lateral (computador, ≥ 1024 px) ───────────── */

export const Sidebar: React.FC = () => {
  const { currentScreen } = useGameState();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {
        // preferência só desta sessão
      }
      return !c;
    });
  };

  return (
    <aside
      data-theme="dark"
      className={`hidden shrink-0 flex-col border-r border-ink-800 bg-ink-950 lg:flex ${collapsed ? 'w-16' : 'w-60'}`}
    >
      <div className={`flex h-14 shrink-0 items-center border-b border-ink-800 ${collapsed ? 'justify-center' : 'justify-between pl-4 pr-2'}`}>
        <Brand compact={collapsed} />
        {!collapsed && (
          <button onClick={toggle} className="btn-icon" aria-label="Recolher menu lateral" title="Recolher menu">
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      <nav aria-label="Navegação principal" className={`min-h-0 flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        <NavGroups current={currentScreen} collapsed={collapsed} />
      </nav>
      <div className={`flex shrink-0 flex-col gap-1 border-t border-ink-800 py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
        <ProfileLink collapsed={collapsed} />
        <InstructorLink collapsed={collapsed} />
        {collapsed && (
          <button onClick={toggle} className="btn-icon mx-auto mt-1" aria-label="Expandir menu lateral" title="Expandir menu">
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </aside>
  );
};

/* ───────────── Gaveta (tablet e celular) ───────────── */

const NavDrawer: React.FC<{ open: boolean; onClose: () => void; returnFocusRef: React.RefObject<HTMLButtonElement> }> = ({
  open,
  onClose,
  returnFocusRef
}) => {
  const { currentScreen } = useGameState();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const returnTo = returnFocusRef.current;
    panel?.querySelector<HTMLElement>('[aria-current="page"], a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      // Mantém o foco dentro da gaveta enquanto ela está aberta.
      if (e.key === 'Tab' && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      returnTo?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-theme="dark"
        className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-ink-800 bg-ink-950 pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-800 pl-4 pr-2">
          <span className="font-semibold text-ink-100">Menu</span>
          <button onClick={onClose} className="btn-icon" aria-label="Fechar menu">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <nav aria-label="Navegação principal" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <NavGroups current={currentScreen} onNavigate={onClose} />
        </nav>
        <div className="flex shrink-0 flex-col gap-1 border-t border-ink-800 px-3 py-3">
          <ProfileLink onNavigate={onClose} />
          <InstructorLink onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
};

/* ───────────── Barra superior + barra inferior (< 1024 px) ───────────── */

export const CompactNav: React.FC = () => {
  const { currentScreen, playerProfile, navigateTo } = useGameState();
  const [open, setOpen] = useState(false);
  const topMenuRef = useRef<HTMLButtonElement>(null);
  const bottomMenuRef = useRef<HTMLButtonElement>(null);
  const [opener, setOpener] = useState<'top' | 'bottom'>('top');
  const go = useGo();
  const section = currentSectionLabel(currentScreen);

  useEffect(() => setOpen(false), [currentScreen]);

  const tabs = MOBILE_TAB_SCREENS.map((s) => ALL_NAV_ITEMS.find((i) => i.screen === s)!);
  const inMenu = !tabs.some((t) => isNavActive(t, currentScreen));

  return (
    <>
      <header data-theme="dark" className="flex h-14 shrink-0 items-center gap-2 border-b border-ink-800 bg-ink-950 px-2 sm:px-3 lg:hidden">
        <button
          ref={topMenuRef}
          onClick={() => {
            setOpener('top');
            setOpen(true);
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="btn-icon hidden md:inline-flex"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <Brand compact />
        {section && <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-100">{section}</span>}
        {!section && <span className="flex-1" />}
        <button
          onClick={() => navigateTo('character')}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-ink-800 bg-ink-900"
          aria-label={`Perfil de ${playerProfile.name || 'Aprendiz'}: nível ${playerProfile.level}, ${playerProfile.xp} XP`}
        >
          <CharacterAvatarSvg customization={playerProfile.customization} mode="portrait" size={32} />
        </button>
      </header>

      <nav
        aria-label="Atalhos (celular)"
        data-theme="dark"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item, currentScreen);
            return (
              <li key={item.screen}>
                <a
                  href={buildHash(item.screen, item.screen === 'lab' ? playerProfile.lastMachineId : undefined)}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.screen);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className="tab-item"
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.shortLabel || item.label}
                </a>
              </li>
            );
          })}
          <li>
            <button
              ref={bottomMenuRef}
              onClick={() => {
                setOpener('bottom');
                setOpen(true);
              }}
              aria-expanded={open}
              aria-haspopup="dialog"
              data-active={inMenu || undefined}
              className="tab-item w-full"
            >
              <Menu className="h-5 w-5" aria-hidden />
              Menu
            </button>
          </li>
        </ul>
      </nav>

      <NavDrawer open={open} onClose={() => setOpen(false)} returnFocusRef={opener === 'top' ? topMenuRef : bottomMenuRef} />
    </>
  );
};

/* ───────────── Notificações ───────────── */

export const Toasts: React.FC = () => {
  const { notifications, dismissNotification } = useGameState();
  return (
    // Região ao vivo sem role="status": não concorre com os status das próprias telas (ex.: retorno das questões).
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-3 top-16 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 lg:top-4"
    >
      {notifications.map((notif) => (
        <div key={notif.id} className="toast pointer-events-auto">
          <span className="mt-0.5" aria-hidden>
            {notif.type === 'xp' ? (
              <Zap className="h-4 w-4 text-accent" />
            ) : notif.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Bell className="h-4 w-4 text-ink-400" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink-100">{notif.title}</span>
            <span className="block text-sm text-ink-300">{notif.message}</span>
          </span>
          <button onClick={() => dismissNotification(notif.id)} className="btn-icon -mr-1 -mt-1 h-7 w-7" aria-label="Fechar aviso">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
};

export const SkipLink: React.FC = () => (
  <a
    href="#conteudo"
    onClick={(e) => {
      // Com rotas em hash, "#conteudo" trocaria de página: só move o foco.
      e.preventDefault();
      document.getElementById('conteudo')?.focus();
    }}
    className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-accent-strong focus:px-3 focus:py-2 focus:text-white"
  >
    Pular para o conteúdo
  </a>
);
