import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PROFILE_KEY, collectErrors, readProfile, withProfile } from './helpers';
import { DIAGNOSIS_CASES } from '../../src/data/diagnosis/cases';
import { idealAttempt } from '../../src/data/diagnosis/scoring';
import { COMPONENTS } from '../../src/data/machine/motorPump';

const run = (caseId: string, extra: Record<string, unknown> = {}) => ({
  caseId,
  at: Date.UTC(2026, 9, 20, 12),
  score: 90,
  passed: true,
  causeCorrect: true,
  actionKind: 'correta',
  unsafeChoices: 0,
  hintsUsed: 0,
  testsUsed: 4,
  ...extra
});

const competency = (page: Page, title: string) => page.locator('section[aria-labelledby="pg-comp"] > ul > li').filter({ hasText: title });

test('competências: níveis seguem as regras (não iniciada, praticada, em desenvolvimento, demonstrada)', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page, {
    diagnosisRuns: [
      run('motor-vibracao'),
      run('bomba-vazao-baixa', { unsafeChoices: 1 }),
      run('mancal-quente'),
      // Tentativa reprovada não apaga a aprovação anterior.
      run('motor-vibracao', { passed: false, score: 30, causeCorrect: false, actionKind: 'incorreta' })
    ],
    componentChecks: { motor: { correct: false, at: 1 } }
  });
  await page.goto('/#/progresso');
  await expect(page.getByRole('heading', { level: 1, name: 'Passaporte de competências' })).toBeVisible();
  await expect(page.getByText(/não é nota oficial nem certificação/)).toBeVisible();

  await expect(competency(page, 'Diagnóstico de falhas baseado em evidências')).toContainText('Demonstrada nos exercícios');
  // Um dos casos teve escolha insegura: segurança ainda não demonstrada.
  await expect(competency(page, 'Decisões seguras na manutenção')).toContainText('Em desenvolvimento');
  await expect(competency(page, 'Decisões seguras na manutenção')).toContainText('2/3');
  // Só respondeu errado: praticada, sem avanço.
  await expect(competency(page, 'Identificação de componentes')).toContainText('Praticada');
  await expect(competency(page, 'Desmontagem guiada de bombas')).toContainText('Não iniciada');

  const diag = page.locator('section[aria-labelledby="pg-diag"]');
  await expect(diag.getByRole('row', { name: /Motor com vibração anormal/ })).toContainText('90');
  await expect(diag).toContainText('3 de 4 tentativa(s) sem nenhuma escolha insegura');
  await expect(page.locator('section[aria-labelledby="pp-prox"]')).toContainText('Decisões seguras na manutenção');
  expect(errors).toEqual([]);
});

test('competência de componentes fica demonstrada com 9 perguntas certas', async ({ page }) => {
  const checks = Object.fromEntries(COMPONENTS.slice(0, 9).map((c) => [c.id, { correct: true, at: 1 }]));
  await withProfile(page, { componentChecks: checks });
  await page.goto('/#/progresso');
  await expect(competency(page, 'Identificação de componentes')).toContainText('Demonstrada nos exercícios');
});

test('dados salvos corrompidos ou com tipos errados não derrubam o app', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page, {
    diagnosisRuns: 'lixo',
    componentChecks: [1, 2, 3],
    gameResults: { 'oficina-diagnostico': { rounds: 'x' } },
    skillStats: null,
    totalXp: 'muito'
  });
  await page.goto('/#/progresso');
  await expect(page.getByRole('heading', { level: 1, name: 'Passaporte de competências' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="pg-diag"]')).toContainText('Nenhum caso tentado ainda.');

  // JSON quebrado no armazenamento: o app abre (volta ao começo) em vez de travar.
  await page.evaluate((key) => localStorage.setItem(key, '{"name": "Aluno", quebrado'), PROFILE_KEY);
  await page.reload();
  await expect(page.locator('main, [role="main"]').first()).toBeVisible();
  await expect(page.getByRole('heading').first()).toBeVisible();
  expect(errors.filter((e) => e.startsWith('pageerror'))).toEqual([]);
});

test('exportar, importar (com validação) e apagar o progresso', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await withProfile(page, { diagnosisRuns: [run('motor-vibracao')] });
  await page.goto('/#/progresso');
  const data = page.locator('section[aria-labelledby="pg-dados"]');

  // Exportar
  const [download] = await Promise.all([page.waitForEvent('download'), data.getByRole('button', { name: 'Exportar progresso (JSON)' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^mecanica-lab-progresso-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath('export.json');
  await download.saveAs(file);
  const exported = JSON.parse(readFileSync(file, 'utf8'));
  expect(exported).toMatchObject({ format: 'mecanica-lab-progresso', version: 1 });
  expect(exported.profile.name).toBe('Aluno Teste');
  expect(exported.profile.diagnosisRuns).toHaveLength(1);

  const input = page.getByTestId('import-file');
  const upload = (name: string, text: string) => input.setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(text) });

  // Arquivos inválidos: erro explicado, nada muda e não pede confirmação.
  await upload('quebrado.json', '{ isso não é json');
  await expect(data.getByRole('alert')).toContainText('não é um JSON válido');
  await upload('outro.json', JSON.stringify({ format: 'outra-coisa', version: 1, profile: {} }));
  await expect(data.getByRole('alert')).toContainText('não foi exportado pelo Mecânica Lab');
  await upload('futuro.json', JSON.stringify({ ...exported, version: 99 }));
  await expect(data.getByRole('alert')).toContainText('versão mais nova');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await readProfile(page)).diagnosisRuns).toHaveLength(1);

  // Arquivo válido (com 3 casos): pede confirmação; cancelar não muda nada.
  const other = { ...exported, profile: { ...exported.profile, diagnosisRuns: DIAGNOSIS_CASES.map((c) => run(c.id)) } };
  await upload('valido.json', JSON.stringify(other));
  await expect(page.getByRole('dialog', { name: 'Substituir o progresso?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  expect((await readProfile(page)).diagnosisRuns).toHaveLength(1);
  await upload('valido.json', JSON.stringify(other));
  await page.getByRole('button', { name: 'Substituir' }).click();
  await expect(competency(page, 'Decisões seguras na manutenção')).toContainText('Demonstrada nos exercícios');

  // Persistência depois de recarregar.
  await page.reload();
  await expect(competency(page, 'Decisões seguras na manutenção')).toContainText('Demonstrada nos exercícios');
  expect((await readProfile(page)).diagnosisRuns).toHaveLength(3);

  // Apagar
  await data.getByRole('button', { name: 'Apagar progresso' }).click();
  await page.getByRole('dialog', { name: 'Apagar o progresso?' }).getByRole('button', { name: 'Apagar' }).click();
  await expect(page.locator('section[aria-labelledby="pg-diag"]')).toContainText('Nenhum caso tentado ainda.');
  const after = await readProfile(page);
  expect(after.diagnosisRuns).toEqual([]);
  expect(after.name).toBe('Aluno Teste');
  expect(errors).toEqual([]);
});

test('os 3 casos da Oficina podem ser concluídos pela tela e somam as competências', async ({ page }) => {
  await withProfile(page);
  for (const c of DIAGNOSIS_CASES) {
    const a = idealAttempt(c);
    await page.goto(`/#/diagnostico/${c.id}`);
    await page.getByRole('button', { name: 'Iniciar investigação' }).click();
    for (const id of a.tests) await page.getByRole('button', { name: c.tests.find((t) => t.id === id)!.label, exact: true }).click();
    await page.getByRole('button', { name: 'Indicar a causa provável' }).click();
    await page.getByRole('radio', { name: c.causes.find((x) => x.id === a.causeId)!.label }).check();
    for (const id of a.evidence) {
      const label = c.tests.find((t) => t.id === id)!.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await page.getByRole('checkbox', { name: new RegExp('^' + label) }).check();
    }
    await page.getByRole('button', { name: 'Escolher a ação' }).click();
    await page.getByRole('radio', { name: c.actions.find((x) => x.id === a.actionId)!.label }).check();
    await page.getByRole('button', { name: 'Concluir e ver o relatório' }).click();
    await expect(page.getByRole('heading', { name: 'Caso concluído' }), c.id).toBeVisible();
    await expect(page.locator('section[aria-labelledby="h-desfecho"]')).toContainText('100 de 100 pontos');
  }
  await page.goto('/#/progresso');
  await expect(competency(page, 'Diagnóstico de falhas baseado em evidências')).toContainText('Demonstrada nos exercícios');
  await expect(competency(page, 'Decisões seguras na manutenção')).toContainText('Demonstrada nos exercícios');
});
