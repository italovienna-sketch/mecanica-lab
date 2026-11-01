import { test, expect } from '@playwright/test';
import { collectErrors, expectNoHorizontalScroll, waitFor3D, withProfile } from './helpers';

// Rodado no projeto "mobile" (Pixel 7) e também no desktop.
test('páginas principais cabem na tela, sem rolagem horizontal', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  for (const hash of ['#/', '#/cursos', '#/praticar', '#/praticar/medicao', '#/aula/lesson-centrifugal-pump', '#/ferramentas/paquimetro', '#/progresso', '#/perfil', '#/industria', '#/industria/equipamentos', '#/industria/missoes', '#/industria/desenhos', '#/industria/missao-ler-desenho', '#/industria/equipamento-bearing-assembly', '#/industria/missao-ronda-vibracao', '#/industria/bancada-pneumatica']) {
    await page.goto('/' + hash);
    await expect(page.locator('h1').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
  expect(errors).toEqual([]);
});

test('navegação compacta no celular e questão utilizável', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'somente no celular');
  await withProfile(page);
  await page.goto('/');
  const bottom = page.getByRole('navigation', { name: 'Atalhos (celular)' });
  await expect(bottom).toBeVisible();
  await bottom.getByRole('button', { name: 'Menu' }).click();
  const menu = page.getByRole('dialog', { name: 'Menu' });
  await menu.getByRole('link', { name: 'Ferramentas' }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ferramentas e instrumentos' })).toBeVisible();

  await bottom.getByRole('link', { name: 'Questões' }).click();
  await page.getByRole('button', { name: /Instrumentos de medição/ }).click();
  await page.getByRole('button', { name: /Começar · 5 questões/ }).click();
  await expect(page.getByText('Questão 1 de 5')).toBeVisible();
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeInViewport({ ratio: 0.5 }).catch(async () => {
    await page.getByRole('button', { name: 'Continuar' }).scrollIntoViewIfNeeded();
  });
  await expectNoHorizontalScroll(page);

  await bottom.getByRole('button', { name: 'Menu' }).click();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await bottom.getByRole('link', { name: 'Lab 3D' }).click();
  await waitFor3D(page);
  await expect(page.getByRole('heading', { name: 'Conhecer o equipamento' })).toBeVisible();
});
