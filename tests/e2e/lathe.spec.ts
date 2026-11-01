import { test, expect, Page, Locator } from '@playwright/test';
import { collectErrors, litRatio, readProfile, withProfile } from './helpers';
import { LATHE_LAB, LATHE_PART_SHORT_NAMES, LATHE_SEQUENCE } from '../../src/data/latheData';
import { PRACTICE_QUESTIONS_BY_ID } from '../../src/data/practiceBank';

async function waitForLathe(page: Page) {
  await page.locator('canvas').first().waitFor({ timeout: 120_000 });
  await expect(page.getByText('Montando o torno em 3D…')).toHaveCount(0, { timeout: 120_000 });
}

async function openList(aside: Locator, name: RegExp) {
  const toggle = aside.getByRole('button', { name });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

test('torno: renderiza o 3D, avisa que é demonstração e o clique no canvas seleciona uma parte', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/conventional-lathe');
  await expect(page.getByRole('heading', { level: 1, name: 'Torno mecânico' })).toBeVisible();
  await waitForLathe(page);
  await page.waitForTimeout(1500);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);
  await expect(page.getByRole('button', { name: /Demonstração visual/ })).toBeVisible();

  const aside = page.getByRole('complementary', { name: 'Painel do torno' });
  const canvas = page.locator('canvas').first();
  const box = (await canvas.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.55);
  await expect(aside.getByText('Peça selecionada')).toBeVisible();
  await expect(aside.getByText('Função', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('torno: identificar, inspeção de segurança, sequência e verificação — progresso salvo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/conventional-lathe');
  await waitForLathe(page);
  const aside = page.getByRole('complementary', { name: 'Painel do torno' });

  // 1. Conhecer
  await aside.getByRole('button', { name: 'Identificar as partes' }).click();

  // 2. Identificar — um erro mostra retorno, depois todos os acertos
  await openList(aside, /Prefere escolher pela lista/);
  await aside.getByRole('button', { name: 'Barramento', exact: true }).click();
  await expect(aside.getByRole('status')).toContainText('Tente de novo');
  for (const t of LATHE_LAB.identify) {
    await aside.getByRole('button', { name: LATHE_PART_SHORT_NAMES[t.partId], exact: true }).click();
    await expect(aside.getByRole('status')).toContainText('Isso!');
  }
  await expect(aside.getByText('Você identificou todas as partes!')).toBeVisible();
  await aside.getByRole('button', { name: 'Fazer a inspeção de segurança' }).click();

  // 3. Segurança — parte em ordem não conta; as três condições inseguras sim
  await openList(aside, /Prefere inspecionar pela lista/);
  await expect(aside.getByRole('button', { name: 'Proteção da placa', exact: true })).toHaveCount(0);
  await aside.getByRole('button', { name: 'Botão de emergência', exact: true }).click();
  await expect(aside.getByRole('status').last()).toContainText('Em ordem');
  await expect(aside.getByText('Encontradas:')).toContainText('0 de 3');
  await aside.getByRole('button', { name: 'Chave da placa', exact: true }).click();
  await expect(aside.getByRole('status').last()).toContainText('Chave esquecida na placa');
  await aside.getByRole('button', { name: 'Placa', exact: true }).click();
  await aside.getByRole('button', { name: 'Carro transversal', exact: true }).click();
  await expect(aside.getByText('Encontradas:')).toContainText('3 de 3');
  await page.waitForTimeout(3000); // animação do carro voltando
  await aside.getByRole('button', { name: 'Ordenar a operação' }).click();

  // 4. Sequência
  const available = page.getByLabel('Etapas disponíveis');
  for (const s of LATHE_SEQUENCE.steps) await available.getByRole('button', { name: s }).click();
  await page.getByRole('button', { name: 'Conferir sequência' }).click();
  await expect(page.getByText('Sequência correta!')).toBeVisible();
  await aside.getByRole('button', { name: 'Verificar o aprendizado' }).click();

  // 5. Verificar — acertando tudo
  await aside.getByRole('button', { name: 'Começar' }).click();
  const total = LATHE_LAB.checkQuestionIds.length;
  for (let i = 0; i < total; i++) {
    const heading = (await page.locator('h2[tabindex="-1"]').first().innerText()).trim();
    const q = LATHE_LAB.checkQuestionIds.map((id) => PRACTICE_QUESTIONS_BY_ID[id]).find((x) => x.prompt === heading)!;
    expect(q, heading).toBeTruthy();
    const radios = page.getByRole('radio');
    const n = await radios.count();
    for (let k = 0; k < n; k++) {
      const text = (await radios.nth(k).innerText()).replace(/^[A-E]\s*/, '').trim();
      if (text === q.options[q.correctIndex]) {
        await radios.nth(k).click();
        break;
      }
    }
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();
    await expect(page.getByText('Correto!', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: i === total - 1 ? 'Ver resultado' : 'Continuar' }).click();
  }
  await expect(aside.getByText('Atividades concluídas!')).toBeVisible();
  await expect(aside.getByText('Todas as etapas do torno foram concluídas.')).toBeVisible();

  const profile = await readProfile(page);
  expect([...profile.labMissionStages['conventional-lathe']].sort()).toEqual(['conhecer', 'identificar', 'seguranca', 'sequencia', 'verificar']);
  expect(errors).toEqual([]);
});

test('praticar: tema "Torno mecânico" existe e abre uma sessão', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/praticar/torno');
  await expect(page.getByRole('heading', { name: 'Torno mecânico' })).toBeVisible();
});
