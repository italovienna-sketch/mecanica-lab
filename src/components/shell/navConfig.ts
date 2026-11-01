import {
  BarChart3,
  BookOpen,
  Box,
  ClipboardList,
  Cog,
  Factory,
  Home,
  Library,
  LucideIcon,
  Map,
  PlayCircle,
  Puzzle,
  Ruler,
  Stethoscope,
  Target,
  Wrench
} from 'lucide-react';
import { GameScreen } from '../../types/game';

export interface NavItem {
  screen: GameScreen;
  label: string;
  /** Rótulo curto para a barra inferior do celular. */
  shortLabel?: string;
  icon: LucideIcon;
  /** Outras telas que pertencem a este destino (ex.: uma aula pertence a "Trilhas"). */
  alsoActiveOn?: GameScreen[];
}

export interface NavGroup {
  id: string;
  /** Sem título: item solto no topo (Início). */
  label?: string;
  items: NavItem[];
}

/**
 * Navegação principal agrupada por tarefa do aluno. Só entram destinos que existem.
 * As rotas continuam as mesmas (#/cursos, #/praticar...); mudaram só os rótulos.
 */
export const NAV_GROUPS: NavGroup[] = [
  { id: 'inicio', items: [{ screen: 'landing', label: 'Início', icon: Home }] },
  {
    id: 'aprender',
    label: 'Aprender',
    items: [
      { screen: 'missions', label: 'Missões', icon: ClipboardList },
      { screen: 'courses', label: 'Trilhas', icon: BookOpen, alsoActiveOn: ['quiz'] },
      { screen: 'micro', label: 'Aulas rápidas', shortLabel: 'Aulas', icon: PlayCircle }
    ]
  },
  {
    id: 'praticar',
    label: 'Praticar',
    items: [
      { screen: 'practice', label: 'Questões', icon: Target },
      { screen: 'diagnosis', label: 'Oficina de Diagnóstico', shortLabel: 'Diagnóstico', icon: Stethoscope },
      { screen: 'drawing', label: 'Oficina de Desenho', shortLabel: 'Desenho', icon: Ruler },
      { screen: 'games', label: 'Desafios', icon: Puzzle }
    ]
  },
  {
    id: 'laboratorio',
    label: 'Laboratório',
    items: [
      { screen: 'lab', label: 'Laboratório 3D', shortLabel: 'Lab 3D', icon: Box },
      { screen: 'library', label: 'Biblioteca', icon: Library },
      { screen: 'machine', label: 'Máquina interativa', shortLabel: 'Máquina', icon: Cog },
      { screen: 'tools', label: 'Ferramentas', icon: Wrench },
      { screen: 'industry', label: 'Indústria na prática', shortLabel: 'Indústria', icon: Factory },
      { screen: 'workshop', label: 'Oficina 2D', icon: Map }
    ]
  },
  {
    id: 'acompanhar',
    label: 'Acompanhar',
    items: [{ screen: 'progress', label: 'Passaporte', shortLabel: 'Passaporte', icon: BarChart3 }]
  }
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/** Atalhos fixos da barra inferior do celular (o resto fica em "Menu"). */
export const MOBILE_TAB_SCREENS: GameScreen[] = ['landing', 'missions', 'practice', 'lab'];

export function isNavActive(item: NavItem, current: GameScreen) {
  return item.screen === current || Boolean(item.alsoActiveOn?.includes(current));
}

/** Nome da seção atual (usado no título da barra do celular). */
export function currentSectionLabel(current: GameScreen): string | null {
  if (current === 'character') return 'Perfil';
  if (current === 'teacher') return 'Área do instrutor';
  return ALL_NAV_ITEMS.find((i) => isNavActive(i, current))?.label ?? null;
}
