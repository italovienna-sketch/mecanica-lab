import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { withProfile } from './helpers';

/**
 * Varredura automática de acessibilidade (axe-core, regras WCAG 2.1 A e AA).
 * Pega o que dá para pegar automaticamente (contraste, nomes acessíveis, estrutura); não substitui teste com leitor de tela.
 */
const ROUTES = [
  '#/',
  '#/missoes',
  '#/missoes/os-01',
  '#/desenho',
  '#/biblioteca',
  '#/biblioteca/centrifugal-pump',
  '#/cursos',
  '#/aulas-rapidas',
  '#/aulas-rapidas/red-rotacao-torque',
  '#/aula/lesson-centrifugal-pump',
  '#/praticar',
  '#/desafios',
  '#/desafios/mestre-metrologia',
  '#/desafios/montagem-rolamento',
  '#/ferramentas',
  '#/progresso',
  '#/diagnostico',
  '#/diagnostico/motor-vibracao',
  '#/maquina',
  '#/maquina/filtro-obstruido',
  '#/perfil',
  '#/industria',
  '#/industria/equipamentos',
  '#/industria/missoes',
  '#/industria/desenhos',
  '#/industria/equipamento-gearbox-reducer',
  '#/industria/missao-acoplamento-desalinhado',
  '#/industria/bancada-pneumatica',
  '#/lab/motor-gearbox',
  '#/oficina'
];

// Tema claro é o padrão; o escuro (Perfil → Aparência) é verificado nas telas de conteúdo. Laboratório e Oficina já são sempre escuros.
const THEMES = ['claro', 'escuro'] as const;

for (const theme of THEMES)
for (const route of ROUTES.filter((r) => theme === 'claro' || !(r.startsWith('#/lab') || r === '#/oficina'))) {
  test(`acessibilidade (axe, WCAG 2.1 AA, tema ${theme}): ${route}`, async ({ page }) => {
    await withProfile(page);
    if (theme === 'escuro') await page.addInitScript(() => localStorage.setItem('mecanica_lab_settings_v1', JSON.stringify({ theme: 'dark' })));
    await page.goto('/' + route);
    await page.locator('main h1, main [role="tablist"], canvas').first().waitFor();
    // A Oficina monta a interface por cima do mapa depois de carregar o motor 2D.
    if (route === '#/oficina') await expect(page.getByText('Montando o mapa do campus…')).toHaveCount(0, { timeout: 60_000 });
    if (theme === 'escuro') await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const found = res.violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    expect(found).toEqual([]);
  });
}
