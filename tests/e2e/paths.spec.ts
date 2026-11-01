import { test, expect } from '@playwright/test';
import { collectErrors, withProfile } from './helpers';
import { LEARNING_PATHS } from '../../src/data/learningPaths';

test('trilhas: 13 trilhas, sugestão de início e detalhe com status honesto', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/cursos');
  await expect(page.getByRole('heading', { name: 'Manutenção mecânica industrial' })).toBeVisible();
  const cards = page.locator('ol > li > button.card');
  await expect(cards).toHaveCount(13);
  await expect(page.getByText('Sugestão para começar')).toBeVisible();
  await expect(page.getByText(`${LEARNING_PATHS.filter((p) => p.status === 'em-preparacao').length} ainda em preparação`)).toBeVisible();

  // Trilha sem conteúdo não finge ter atividades
  await page.getByRole('button', { name: /Hidráulicos e pneumáticos|hidráulicos e pneumáticos/ }).click();
  await expect(page).toHaveURL(/#\/cursos\/hidraulica-pneumatica$/);
  await expect(page.getByText('Em preparação', { exact: true })).toBeVisible();
  await expect(page.getByText('Ainda não há atividades nesta trilha.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Atividades práticas' })).toHaveCount(0);

  // Trilha do torno leva ao laboratório
  await page.goto('/#/cursos/usinagem-torno');
  await page.getByRole('button', { name: /Começar/ }).first().click();
  await expect(page).toHaveURL(/#\/lab\/conventional-lathe$/);

  // Voltar retorna ao detalhe da trilha
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Usinagem convencional e fundamentos do torno' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('ferramentas: endereço direto abre o treino do paquímetro', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/ferramentas/treino-paquimetro');
  await expect(page.getByRole('tab', { name: /Ler o paquímetro/ })).toHaveAttribute('aria-selected', 'true');
});
