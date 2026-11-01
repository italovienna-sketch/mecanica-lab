import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { LAB_CONFIGS, LAB_MACHINE_LABELS } from '../../data/labMission';
import { LATHE_ID } from '../../data/latheData';

/** Equipamentos do laboratório agrupados pelo tipo de sistema. Equipamento novo sem grupo cai em "Outros". */
const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Bombas', ids: ['centrifugal-pump', 'gear-pump', 'diaphragm-pump'] },
  { label: 'Transmissão e movimentação', ids: ['gearbox-reducer', 'motor-gearbox', 'bearing-assembly', 'belt-conveyor'] },
  { label: 'Usinagem', ids: [LATHE_ID] }
];

function machineGroups() {
  const all = [...Object.keys(LAB_CONFIGS), LATHE_ID];
  const grouped = GROUPS.map((g) => ({ ...g, ids: g.ids.filter((id) => all.includes(id)) })).filter((g) => g.ids.length);
  const rest = all.filter((id) => !GROUPS.some((g) => g.ids.includes(id)));
  return rest.length ? [...grouped, { label: 'Outros', ids: rest }] : grouped;
}

/**
 * Cabeçalho do laboratório: nome do equipamento (h1) + botão "Trocar equipamento".
 * Substitui a faixa de abas: ocupa uma linha só e não corta nomes em telas estreitas.
 */
export const MachinePicker: React.FC<{ current: string; onSwitch: (id: string) => void }> = ({ current, onSwitch }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const groups = machineGroups();

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        items[next]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex min-w-0 items-center gap-3">
      <div className="min-w-0">
        <p className="eyebrow hidden leading-none lg:block">Laboratório 3D</p>
        <h1 className="truncate lg:mt-1 text-base font-semibold leading-tight text-ink-100 sm:text-lg">{LAB_MACHINE_LABELS[current] || current}</h1>
      </div>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label="Trocar equipamento"
        className="btn-secondary btn-sm shrink-0"
      >
        <span className="sm:hidden">Trocar</span>
        <span className="hidden sm:inline">Trocar equipamento</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div
          id={listId}
          role="menu"
          aria-label="Equipamentos do laboratório"
          className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-card border border-ink-700 bg-ink-900 py-1.5 shadow-pop"
        >
          {groups.map((g) => (
            <div key={g.label} role="group" aria-label={g.label} className="py-1">
              <p className="px-3 pb-1 pt-1.5 text-xs font-medium text-ink-500" aria-hidden>
                {g.label}
              </p>
              {g.ids.map((id) => {
                const active = id === current;
                return (
                  <button
                    key={id}
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setOpen(false);
                      buttonRef.current?.focus();
                      if (!active) onSwitch(id);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-ink-800 focus-visible:bg-ink-800 ${
                      active ? 'font-semibold text-ink-100' : 'text-ink-300'
                    }`}
                  >
                    {LAB_MACHINE_LABELS[id] || id}
                    {active && <Check className="h-4 w-4 text-accent" aria-hidden />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
