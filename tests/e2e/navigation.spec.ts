import { test, expect } from '@playwright/test';
import { collectErrors, litRatio, readProfile, withProfile } from './helpers';

test('primeiro acesso: onboarding cria o perfil e leva ao início', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Aprenda manutenção mecânica fazendo.' })).toBeVisible();
  await page.getByRole('button', { name: 'Começar a aprender' }).click();
  await expect(page.getByText('Digite como você quer ser chamado(a).')).toBeVisible();
  await page.getByLabel('Como você quer ser chamado(a)?').fill('Joana Lima');
  await page.getByRole('button', { name: 'Tom de pele #9c6137' }).click();
  await page.getByRole('button', { name: 'Começar a aprender' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Joana!' })).toBeVisible();
  const profile = await readProfile(page);
  expect(profile.name).toBe('Joana Lima');
  expect(profile.onboardingCompleted).toBe(true);
  expect(profile.customization.skinTone).toBe('#9c6137');
  expect(errors).toEqual([]);
});

test('cada item da navegação abre a página certa e voltar/avançar funcionam', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navegação principal', exact: true });
  const destinations: [string, string | RegExp, string][] = [
    ['Trilhas', 'Manutenção mecânica industrial', '#/cursos'],
    ['Questões', 'Praticar', '#/praticar'],
    ['Ferramentas', 'Ferramentas e instrumentos', '#/ferramentas'],
    ['Oficina de Diagnóstico', 'Oficina de Diagnóstico', '#/diagnostico'],
    ['Máquina interativa', 'Máquina interativa', '#/maquina'],
    ['Passaporte', 'Passaporte de competências', '#/progresso'],
    ['Início', /Olá, Aluno!/, '#/']
  ];
  for (const [label, heading, hash] of destinations) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    expect(new URL(page.url()).hash).toBe(hash);
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
  }
  // Laboratório 3D (verificado só o título da missão; o 3D tem teste próprio).
  await nav.getByRole('link', { name: 'Laboratório 3D' }).click();
  await expect(page.getByRole('heading', { name: 'Conhecer o equipamento' })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('heading', { name: /Olá, Aluno!/ })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Passaporte de competências' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: /Olá, Aluno!/ })).toBeVisible();

  // Perfil fica no rodapé da barra lateral (cartão com nome e nível)
  await page.getByRole('link', { name: /Aluno Teste.*Perfil e configurações/ }).click();
  await expect(page.getByRole('heading', { name: 'Perfil e configurações' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Configurações', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('endereço inválido mostra página de "não encontrada" e links antigos continuam funcionando', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/nao-existe/abc');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar ao início' }).click();
  await expect(page.getByRole('heading', { name: /Olá, Aluno!/ })).toBeVisible();

  // Endereços da versão anterior (em inglês) ainda abrem as páginas
  await page.goto('/#/quiz/lesson-centrifugal-pump');
  await expect(page.getByRole('heading', { level: 1, name: 'Como funciona uma bomba centrífuga' })).toBeVisible();
  await page.goto('/#/progress');
  await expect(page.getByRole('heading', { name: 'Passaporte de competências' })).toBeVisible();
  await page.goto('/#/aula/aula-que-nao-existe');
  await expect(page.getByRole('heading', { name: 'Aula não encontrada' })).toBeVisible();
});

test('a Oficina 2D carrega sem tela preta', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/oficina');
  await page.locator('canvas').first().waitFor({ timeout: 120_000 });
  await page.waitForTimeout(3000);
  // Uma tela preta teria quase nenhum pixel aceso.
  const lit = await litRatio(page, 'canvas');
  expect(lit).toBeGreaterThan(0.05);
  expect(errors.filter((e) => !/multiplayer|Failed to load resource/i.test(e))).toEqual([]);
});

// O <main id="conteudo"> é quem rola (a janela não): a tela nova não pode herdar a rolagem da anterior.
const mainScroll = (page: import('@playwright/test').Page) => page.locator('#conteudo').evaluate((el) => el.scrollTop);
const scrollMainToEnd = (page: import('@playwright/test').Page) =>
  page.locator('#conteudo').evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    return el.scrollTop;
  });

test('trocar de tela abre a nova no topo, mesmo vindo de uma página rolada', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/perfil');
  await expect(page.getByRole('heading', { name: 'Perfil e configurações' })).toBeVisible();
  expect(await scrollMainToEnd(page)).toBeGreaterThan(300);
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Trilhas' }).click();
  await expect(page).toHaveURL(/#\/cursos/);
  expect(await mainScroll(page)).toBe(0);
});

test('celular: a Oficina aberta depois de rolar o Perfil não fica deslocada (sem tela preta)', async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await withProfile(page);
  await page.goto('/#/perfil');
  await expect(page.getByRole('heading', { name: 'Perfil e configurações' })).toBeVisible();
  expect(await scrollMainToEnd(page)).toBeGreaterThan(300);
  await page.evaluate(() => {
    window.location.hash = '#/oficina';
  });
  const canvas = page.locator('#conteudo canvas').first();
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  expect(await mainScroll(page)).toBe(0);
  const box = (await canvas.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeLessThan(844 / 2);
  expect(errors).toEqual([]);
});
