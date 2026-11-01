import { test, expect } from '@playwright/test';
import { collectErrors, litRatio, withProfile } from './helpers';

// Estrutura do aplicativo: barra lateral, menu em gaveta, tema e atalho de teclado.

test('barra lateral recolhe, mantém os ícones com nome e lembra a escolha', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/cursos');
  const nav = page.getByRole('navigation', { name: 'Navegação principal', exact: true });
  await expect(nav.getByRole('link', { name: 'Trilhas' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Recolher menu lateral' }).click();
  // Recolhida, cada ícone continua com nome acessível e funcionando
  await nav.getByRole('link', { name: 'Desafios' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Aplique o que aprendeu' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Expandir menu lateral' })).toBeVisible();
  await page.getByRole('button', { name: 'Expandir menu lateral' }).click();
  await expect(page.getByRole('button', { name: 'Recolher menu lateral' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('tablet: menu em gaveta abre, prende o foco, fecha com Esc e devolve o foco', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await withProfile(page);
  await page.goto('/#/');
  const open = page.getByRole('button', { name: 'Abrir menu' });
  await open.click();
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(drawer).toBeVisible();
  // Tab percorre só a gaveta
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    expect(await drawer.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(open).toBeFocused();
  // Navegar pela gaveta fecha a gaveta
  await open.click();
  await drawer.getByRole('link', { name: 'Desafios' }).click();
  await expect(drawer).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe('#/desafios');
});

test('tema: escolha em Perfil → Aparência vale para o app e é lembrada; lab continua escuro', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/perfil');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  const theme = page.getByRole('radiogroup', { name: 'Tema' });
  await theme.getByRole('radio', { name: 'Escuro' }).click();
  await expect(theme.getByRole('radio', { name: 'Escuro' })).toHaveAttribute('aria-checked', 'true');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radiogroup', { name: 'Tema' }).getByRole('radio', { name: 'Claro' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.goto('/#/lab/centrifugal-pump');
  await expect(page.getByRole('main')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('"Pular para o conteúdo" leva o foco ao conteúdo sem mudar de página', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/cursos');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#conteudo')).toBeFocused();
  expect(new URL(page.url()).hash).toBe('#/cursos');
});

test('regressão (tela preta): criar perfil → Perfil → Oficina 2D, voltar, avançar e recarregar', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByLabel('Como você quer ser chamado(a)?').fill('Rafa Teste');
  await page.getByRole('button', { name: 'Começar a aprender' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Rafa!' })).toBeVisible();

  await page.getByRole('link', { name: /Rafa Teste.*Perfil e configurações/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil e configurações' })).toBeVisible();
  await page.getByRole('button', { name: 'Visitar a Oficina 2D com meu personagem' }).click();
  expect(new URL(page.url()).hash).toBe('#/oficina');

  const canvasLit = async () => {
    await page.locator('#conteudo canvas').first().waitFor({ timeout: 120_000 });
    await page.waitForTimeout(3000);
    expect(await litRatio(page, '#conteudo canvas')).toBeGreaterThan(0.05);
  };
  await canvasLit();

  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil e configurações' })).toBeVisible();
  await page.goForward();
  await canvasLit();
  await page.reload();
  await canvasLit();
  expect(errors.filter((e) => !/multiplayer|Failed to load resource/i.test(e))).toEqual([]);
});
