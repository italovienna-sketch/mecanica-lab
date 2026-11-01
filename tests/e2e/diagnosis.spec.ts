import { test, expect, Page } from '@playwright/test';
import { collectErrors, readProfile, withProfile } from './helpers';
import { DIAGNOSIS_CASES, DIAGNOSIS_CASES_BY_ID, DiagnosisCase } from '../../src/data/diagnosis/cases';
import { DIAGNOSIS_CASE_IDS, DIAGNOSIS_CASES_META } from '../../src/data/diagnosis/meta';
import { Attempt, HINT_COST, MAX_HINTS, WEIGHTS, idealAttempt, performedTests, runTest, scoreCase } from '../../src/data/diagnosis/scoring';
import { rng } from '../../src/data/metrology/metrologyMaster';

/* ───────────── Dados e pontuação (sem navegador) ───────────── */

test.describe('Oficina de Diagnóstico: dados e pontuação', () => {
  test('cada caso é coerente: causa certa, ação correta, escolhas inseguras, dicas e referências existentes', () => {
    expect(DIAGNOSIS_CASES.map((c) => c.id)).toEqual(DIAGNOSIS_CASE_IDS);
    expect(DIAGNOSIS_CASES.map((c) => c.title)).toEqual(DIAGNOSIS_CASES_META.map((c) => c.title));
    for (const c of DIAGNOSIS_CASES) {
      const causeIds = c.causes.map((x) => x.id);
      expect(causeIds, c.id).toContain(c.correctCause);
      expect(new Set(c.tests.map((t) => t.id)).size, c.id).toBe(c.tests.length);
      expect(c.actions.filter((a) => a.kind === 'correta'), c.id).toHaveLength(1);
      expect(c.actions.some((a) => a.kind === 'insegura'), c.id).toBe(true);
      expect(c.tests.some((t) => t.safety === 'inseguro'), c.id).toBe(true);
      expect(c.hints).toHaveLength(3);
      for (const t of c.tests) for (const id of [...(t.supports ?? []), ...(t.rulesOut ?? [])]) expect(causeIds, `${c.id}/${t.id} → ${id}`).toContain(id);
      // Testes-chave apontam para a causa certa; testes inseguros não são evidência de nada.
      for (const t of c.tests.filter((x) => x.relevance === 'chave')) expect(t.supports, `${c.id}/${t.id}`).toContain(c.correctCause);
      for (const t of c.tests.filter((x) => x.safety === 'inseguro')) expect(t.supports ?? [], `${c.id}/${t.id}`).toEqual([]);
      // Nenhum teste descarta a causa certa.
      for (const t of c.tests) expect(t.rulesOut ?? [], `${c.id}/${t.id}`).not.toContain(c.correctCause);
    }
  });

  test('o caminho ideal vale 100 e conclui o caso', () => {
    for (const c of DIAGNOSIS_CASES) {
      const r = scoreCase(c, idealAttempt(c));
      expect(r.total, c.id).toBe(100);
      expect(r.passed, c.id).toBe(true);
      expect(r.unsafeChoices).toBe(0);
    }
  });

  test('cada teste devolve sempre o mesmo resultado do seu caso', () => {
    const motor = DIAGNOSIS_CASES_BY_ID['motor-vibracao'];
    expect(runTest(motor, 'base').test.readings?.[0].value).toBe('0,18 mm');
    expect(runTest(motor, 'vibracao').test.readings?.[0].value).toBe('7,6 mm/s');
    const bomba = DIAGNOSIS_CASES_BY_ID['bomba-vazao-baixa'];
    expect(runTest(bomba, 'diferencial').test.readings?.map((r) => r.value)).toEqual(['−0,08 bar', '−0,43 bar']);
    expect(runTest(bomba, 'abrir-filtro-ligado').performed).toBe(false);
    expect(() => runTest(bomba, 'nao-existe')).toThrow();
  });

  test('pontuação determinística e sempre dentro dos limites (milhares de tentativas sorteadas)', () => {
    const problems: string[] = [];
    for (const c of DIAGNOSIS_CASES) {
      const r = rng(7);
      const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
      for (let i = 0; i < 2000; i++) {
        const tests = c.tests.filter(() => r() < 0.5).map((t) => t.id);
        const a: Attempt = {
          tests,
          causeId: r() < 0.1 ? null : pick(c.causes).id,
          evidence: c.tests.filter(() => r() < 0.4).map((t) => t.id),
          actionId: r() < 0.1 ? null : pick(c.actions).id,
          hintsUsed: Math.floor(r() * 6)
        };
        const s = scoreCase(c, a);
        const again = scoreCase(c, a);
        if (JSON.stringify(s) !== JSON.stringify(again)) problems.push(`${c.id}#${i}: não determinístico`);
        if (s.total < 0 || s.total > 100) problems.push(`${c.id}#${i}: total ${s.total}`);
        for (const l of s.lines) if (l.key !== 'hints' && (l.points < 0 || l.points > l.max)) problems.push(`${c.id}#${i}: ${l.key}=${l.points}`);
        if (s.passed && (!s.causeCorrect || s.actionKind === 'insegura' || s.total < 60)) problems.push(`${c.id}#${i}: aprovado sem critério`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });

  test('escolhas inseguras, causa errada, desmontagem sem indício e dicas têm o efeito descrito', () => {
    const c: DiagnosisCase = DIAGNOSIS_CASES_BY_ID['motor-vibracao'];
    const ideal = idealAttempt(c);

    const unsafeTest = scoreCase(c, { ...ideal, tests: [...ideal.tests, 'mao-eixo'] });
    expect(unsafeTest.unsafeTests).toEqual(['mao-eixo']);
    expect(unsafeTest.lines.find((l) => l.key === 'safety')!.points).toBe(WEIGHTS.safety - 5);
    expect(performedTests(c, [...ideal.tests, 'mao-eixo'])).not.toContain('mao-eixo');

    const unsafeAction = scoreCase(c, { ...ideal, actionId: 'apertar-ligado' });
    expect(unsafeAction.lines.find((l) => l.key === 'safety')!.points).toBe(0);
    expect(unsafeAction.passed).toBe(false);
    expect(unsafeAction.unsafeChoices).toBe(1);

    const wrong = scoreCase(c, { ...ideal, causeId: 'rolamento-motor' });
    expect(wrong.passed).toBe(false);
    expect(wrong.lines.find((l) => l.key === 'diagnosis')!.points).toBe(0);
    expect(scoreCase(c, { ...ideal, causeId: 'desalinhamento' }).lines.find((l) => l.key === 'diagnosis')!.points).toBe(10);

    const intrusive = scoreCase(c, { ...ideal, tests: [...ideal.tests, 'abrir-bomba'] });
    expect(intrusive.intrusive).toEqual(['abrir-bomba']);
    expect(intrusive.total).toBe(100 - 2);

    expect(scoreCase(c, { ...ideal, hintsUsed: 2 }).total).toBe(100 - 2 * HINT_COST);
    expect(scoreCase(c, { ...ideal, hintsUsed: 9 }).total).toBe(100 - MAX_HINTS * HINT_COST);

    // Evidência de teste não realizado não conta; evidência sem relação tira 4 pontos.
    expect(scoreCase(c, { ...ideal, evidence: [...ideal.evidence, 'alinhamento'] }).lines.find((l) => l.key === 'reasoning')!.points).toBe(WEIGHTS.reasoning);
    const weak = scoreCase(c, { ...ideal, tests: [...ideal.tests, 'temperatura'], evidence: [...ideal.evidence, 'temperatura'] });
    expect(weak.weakEvidence).toEqual(['temperatura']);
    expect(weak.lines.find((l) => l.key === 'reasoning')!.points).toBe(WEIGHTS.reasoning - 4);

    // Ação parcial ainda conclui; desnecessária não.
    expect(scoreCase(c, { ...ideal, actionId: 'reapertar' }).passed).toBe(true);
    expect(scoreCase(c, { ...ideal, actionId: 'trocar-rolamentos' }).passed).toBe(false);
  });
});

/* ───────────── No navegador ───────────── */

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function doTest(page: Page, c: DiagnosisCase, id: string) {
  await page.getByRole('button', { name: c.tests.find((t) => t.id === id)!.label, exact: true }).click();
}

test('Oficina de Diagnóstico: caso completo com escolha insegura, dica, relatório, Passaporte e reinício', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Navegação principal', exact: true }).getByRole('link', { name: 'Oficina de Diagnóstico' }).click();
  await expect(page).toHaveURL(/#\/diagnostico$/);
  await page.getByRole('button', { name: 'Começar pelo exemplo guiado' }).click();
  await expect(page).toHaveURL(/#\/diagnostico\/motor-vibracao/);

  const c = DIAGNOSIS_CASES_BY_ID['motor-vibracao'];
  await expect(page.getByRole('heading', { level: 1, name: c.title })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('Orientação');
  await expect(page.getByText(c.workOrder.number + ' · Oficina de Diagnóstico')).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar investigação' }).click();

  // Ainda sem teste, não dá para seguir.
  await expect(page.getByRole('button', { name: 'Indicar a causa provável' })).toBeDisabled();

  // Teste inseguro: não é realizado e explica por quê.
  await doTest(page, c, 'mao-eixo');
  await expect(page.getByText('Escolha insegura — teste não realizado.')).toBeVisible();

  for (const id of ['observar', 'vibracao', 'historico', 'base']) await doTest(page, c, id);
  await expect(page.getByRole('cell', { name: '7,6 mm/s' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0,18 mm' })).toBeVisible();

  await page.getByRole('button', { name: /Pedir dica 1 de 3/ }).click();
  await expect(page.getByText(c.hints[0])).toBeVisible();

  await page.getByRole('button', { name: 'Indicar a causa provável' }).click();
  await page.getByRole('radio', { name: c.causes.find((x) => x.id === c.correctCause)!.label }).check();
  for (const id of ['observar', 'vibracao', 'historico', 'base']) {
    await page.getByRole('checkbox', { name: new RegExp('^' + esc(c.tests.find((t) => t.id === id)!.label)) }).check();
  }
  await page.getByRole('button', { name: 'Escolher a ação' }).click();
  await page.getByRole('radio', { name: c.actions.find((a) => a.kind === 'correta')!.label }).check();
  await page.getByRole('button', { name: 'Concluir e ver o relatório' }).click();

  // 100 − 5 (teste inseguro) − 2 (uma dica) = 93
  await expect(page.getByRole('heading', { name: 'Caso concluído' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="h-desfecho"]')).toContainText('93 de 100 pontos');
  await expect(page.getByText(/^Desfecho simulado:/)).toBeVisible();
  await expect(page.locator('section[aria-labelledby="h-seg"]')).toContainText(c.tests.find((t) => t.id === 'mao-eixo')!.label);

  const profile = await readProfile(page);
  expect(profile.diagnosisRuns).toHaveLength(1);
  expect(profile.diagnosisRuns[0]).toMatchObject({ caseId: 'motor-vibracao', score: 93, passed: true, unsafeChoices: 1, hintsUsed: 1 });
  expect(profile.gameResults['oficina-diagnostico'].rounds['motor-vibracao']).toMatchObject({ solved: true, bestScore: 93 });

  // Reiniciar limpa tudo e volta à ordem de serviço.
  await page.getByRole('button', { name: 'Refazer o caso' }).click();
  await expect(page.getByRole('button', { name: 'Iniciar investigação' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar investigação' }).click();
  await expect(page.getByText('Nenhum teste feito ainda.')).toBeVisible();

  // O resultado continua salvo depois de recarregar e aparece no Passaporte.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Iniciar investigação' })).toBeVisible();
  await page.goto('/#/progresso');
  const diag = page.locator('section[aria-labelledby="pg-diag"]');
  await expect(diag).toContainText('Motor com vibração anormal');
  await expect(diag).toContainText('0 de 1 tentativa(s) sem nenhuma escolha insegura');
  expect(errors).toEqual([]);
});

test('Oficina de Diagnóstico: causa errada e ação insegura não concluem e explicam o motivo', async ({ page }) => {
  await withProfile(page);
  const c = DIAGNOSIS_CASES_BY_ID['bomba-vazao-baixa'];
  await page.goto('/#/diagnostico/bomba-vazao-baixa');
  await page.getByRole('button', { name: 'Iniciar investigação' }).click();
  await doTest(page, c, 'man-descarga');
  await page.getByRole('button', { name: 'Indicar a causa provável' }).click();
  await page.getByRole('radio', { name: 'Rotor gasto' }).check();
  await page.getByRole('button', { name: 'Escolher a ação' }).click();
  await page.getByRole('radio', { name: c.actions.find((a) => a.kind === 'insegura')!.label }).check();
  await page.getByRole('button', { name: 'Concluir e ver o relatório' }).click();

  await expect(page.getByRole('heading', { name: 'Caso ainda não concluído' })).toBeVisible();
  await expect(page.getByText(/a causa provável pelos dados é: Filtro da sucção obstruído/)).toBeVisible();
  await expect(page.locator('section[aria-labelledby="h-seg"]')).toContainText(c.actions.find((a) => a.kind === 'insegura')!.feedback);
  await expect(page.getByText('Testes-chave que ficaram de fora')).toBeVisible();
  const profile = await readProfile(page);
  expect(profile.diagnosisRuns[0]).toMatchObject({ passed: false, causeCorrect: false, actionKind: 'insegura' });
});

test('Desafios e Início levam à Oficina de Diagnóstico com a contagem de casos', async ({ page }) => {
  await withProfile(page, { gameResults: { 'oficina-diagnostico': { rounds: { 'motor-vibracao': { solved: true, firstTry: true, attempts: 1, bestScore: 90 } }, lastPlayedAt: 1 } } });
  await page.goto('/#/desafios');
  const card = page.getByRole('button', { name: /^Oficina de Diagnóstico/ });
  await expect(card).toContainText('1 de 3 casos concluídos');
  await card.click();
  await expect(page).toHaveURL(/#\/diagnostico$/);
  await page.goto('/#/');
  await page.locator('section[aria-labelledby="explorar"]').getByRole('button', { name: /Máquina interativa/ }).click();
  await expect(page).toHaveURL(/#\/maquina$/);
});
