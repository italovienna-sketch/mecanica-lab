import { test, expect } from '@playwright/test';
import { collectErrors, expectNoHorizontalScroll, readProfile, withProfile } from './helpers';
import { COMPONENTS, COMPONENTS_BY_ID, FAULTS, stateOf } from '../../src/data/machine/motorPump';
import { DIAGNOSIS_CASE_IDS } from '../../src/data/diagnosis/meta';

test('dados da máquina: toda falha aponta para componentes existentes e cada componente tem ficha completa', () => {
  for (const c of COMPONENTS) {
    for (const k of ['failureModes', 'symptoms', 'inspection', 'preventive', 'safety'] as const) expect(c[k].length, `${c.id}.${k}`).toBeGreaterThan(0);
    expect(c.check.options[c.check.correct], c.id).toBeTruthy();
  }
  expect(FAULTS[0].id).toBe('normal');
  for (const f of FAULTS) {
    for (const id of Object.keys(f.states)) expect(COMPONENTS_BY_ID[id], `${f.id} → ${id}`).toBeTruthy();
    if (f.id !== 'normal') expect(Object.values(f.states), f.id).toContain('falha');
    if (f.link?.screen === 'diagnosis') expect(DIAGNOSIS_CASE_IDS).toContain(f.link.param);
  }
  expect(COMPONENTS.every((c) => stateOf(FAULTS[0], c.id) === 'normal')).toBe(true);
});

test('Máquina interativa: áreas clicáveis, teclado, falhas simuladas, pergunta de verificação e link para o caso', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Navegação principal', exact: true }).getByRole('link', { name: 'Máquina interativa' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Máquina interativa' })).toBeVisible();
  await expect(page.getByText(/sem ligação com equipamento real/)).toBeVisible();

  // Todos os componentes têm área no desenho, nomeada para leitor de tela.
  for (const c of COMPONENTS) await expect(page.locator(`[data-component="${c.id}"]`)).toHaveAttribute('aria-label', `${c.name}: normal`);

  // Clique no desenho abre a ficha.
  await page.locator('[data-component="acoplamento"]').click();
  await expect(page.getByRole('heading', { level: 2, name: COMPONENTS_BY_ID['acoplamento'].name, exact: true })).toBeVisible();

  // Teclado: Tab até a área e Enter.
  await page.locator('[data-component="motor"]').focus();
  await page.keyboard.press('Enter');
  const motor = COMPONENTS_BY_ID['motor'];
  await expect(page.getByRole('heading', { level: 2, name: motor.name, exact: true })).toBeFocused();

  // Pergunta de verificação: resposta certa fica registrada no perfil.
  await page.getByRole('radio', { name: motor.check.options[motor.check.correct] }).check();
  await page.getByRole('button', { name: 'Responder' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Certo.' })).toBeVisible();
  expect((await readProfile(page)).componentChecks.motor.correct).toBe(true);

  // Falha simulada: estados mudam no desenho, endereço guarda a falha e a ficha abre no componente afetado.
  const fault = FAULTS.find((f) => f.id === 'filtro-obstruido')!;
  await page.getByRole('button', { name: fault.label, exact: true }).click();
  await expect(page).toHaveURL(/#\/maquina\/filtro-obstruido$/);
  await expect(page.getByRole('button', { name: fault.label, exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const [id, st] of Object.entries(fault.states)) await expect(page.locator(`[data-component="${id}"]`)).toHaveAttribute('data-state', st);
  await expect(page.getByRole('heading', { level: 2, name: COMPONENTS_BY_ID['filtro'].name, exact: true })).toBeVisible();
  for (const s of fault.symptoms) await expect(page.getByText(s, { exact: true }).first()).toBeVisible();

  // Volta ao normal.
  await page.getByRole('button', { name: 'Condição normal' }).click();
  await expect(page.locator('[data-component="filtro"]')).toHaveAttribute('data-state', 'normal');

  // Link direto e ligação com a Oficina de Diagnóstico.
  await page.goto('/#/maquina/pe-manco');
  await expect(page.locator('[data-component="base"]')).toHaveAttribute('data-state', 'falha');
  await page.getByRole('button', { name: /Investigar o caso “Motor com vibração anormal”/ }).click();
  await expect(page).toHaveURL(/#\/diagnostico\/motor-vibracao/);
  // Primeira visita à Oficina: no servidor de desenvolvimento a página ainda é compilada.
  await expect(page.getByRole('heading', { level: 1, name: 'Motor com vibração anormal' })).toBeVisible({ timeout: 30_000 });
  expect(errors).toEqual([]);
});

test('Máquina interativa no celular: sem rolagem horizontal da página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await withProfile(page);
  await page.goto('/#/maquina/excesso-graxa');
  await expect(page.locator('[data-component="mancal"]')).toHaveAttribute('data-state', 'falha');
  await expectNoHorizontalScroll(page);
  // A lista de componentes é a alternativa ao desenho em telas pequenas.
  await page.locator('section[aria-labelledby="h-comp"]').getByRole('button', { name: /^Selo mecânico/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: COMPONENTS_BY_ID['selo'].name, exact: true })).toBeVisible();
});
