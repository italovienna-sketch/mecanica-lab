import type { GameScreen } from '../types/game';
import { MACHINES_CATALOG } from './mechanicalMachines';
import { LAB_MACHINE_LABELS } from './labMission';

/**
 * Biblioteca de equipamentos. Só entra o que o app já tem: cada ficha é montada a partir do catálogo do laboratório, com
 * ações que levam a uma atividade. Sem PDF para baixar e sem categoria vazia.
 */

export interface LibraryAction {
  label: string;
  screen: GameScreen;
  param?: string;
  primary?: boolean;
}

export interface LibraryEntry {
  id: string;
  name: string;
  category: string;
  summary: string;
  parts: { name: string; fn: string }[];
  safety: string[];
  actions: LibraryAction[];
  /** Modelo didático: o que foi simplificado. */
  note: string;
}

/** Ligações que só existem para alguns equipamentos. Nada de atalho para tela que não trata do item. */
const EXTRA_ACTIONS: Record<string, LibraryAction[]> = {
  'centrifugal-pump': [
    { label: 'Fazer as missões da P-101', screen: 'missions', primary: true },
    { label: 'Conferir o desenho de conjunto', screen: 'drawing' },
    { label: 'Praticar questões', screen: 'practice', param: 'bombas' }
  ],
  'gear-pump': [{ label: 'Praticar questões', screen: 'practice', param: 'bombas' }],
  'diaphragm-pump': [{ label: 'Praticar questões', screen: 'practice', param: 'bombas' }],
  'bearing-assembly': [
    { label: 'Desafio: montagem de rolamentos', screen: 'games', param: 'montagem-rolamento' },
    { label: 'Praticar questões', screen: 'practice', param: 'rolamentos' }
  ],
  'conventional-lathe': [{ label: 'Praticar questões', screen: 'practice', param: 'torno' }]
};

/** O catálogo do laboratório tem três nomes para bombas: aqui cada família aparece uma vez só. */
const LIBRARY_GROUP: Record<string, string> = {
  'centrifugal-pump': 'Bombas',
  'gear-pump': 'Bombas',
  'diaphragm-pump': 'Bombas',
  'gearbox-reducer': 'Transmissão',
  'motor-gearbox': 'Transmissão',
  'bearing-assembly': 'Transmissão',
  'belt-conveyor': 'Movimentação',
  'conventional-lathe': 'Usinagem'
};

export const LIBRARY_ENTRIES: LibraryEntry[] = Object.keys(LAB_MACHINE_LABELS)
  .filter((id) => MACHINES_CATALOG[id])
  .map((id) => {
    const m = MACHINES_CATALOG[id];
    return {
      id,
      name: LAB_MACHINE_LABELS[id],
      category: LIBRARY_GROUP[id] ?? m.category,
      summary: m.overviewDescription,
      parts: m.parts.map((p) => ({ name: p.name, fn: p.mainFunction })),
      safety: m.safetyRules,
      actions: [...(EXTRA_ACTIONS[id] ?? []), { label: 'Abrir no Laboratório 3D', screen: 'lab' as GameScreen, param: id, primary: !EXTRA_ACTIONS[id]?.some((a) => a.primary) }],
      note: 'Modelo didático simplificado: não representa um fabricante nem substitui o manual do equipamento.'
    };
  });

export const LIBRARY_CATEGORIES = [...new Set(LIBRARY_ENTRIES.map((e) => e.category))];
