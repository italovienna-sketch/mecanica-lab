import { test, expect } from '@playwright/test';
import { collectErrors, readProfile, withProfile } from './helpers';
import {
  BEARING_ROUNDS,
  MAX_MISTAKES,
  POINTS_PER_STEP,
  SCENARIOS,
  SCENARIOS_BY_ID,
  Scenario,
  cardsFor,
  checkPick,
  replay,
  scoreSequence
} from '../../src/data/bearingSequence/bearingSequence';
import { activityProgress, LEARNING_PATHS_BY_ID } from '../../src/data/learningPaths';
import type { PlayerProfile } from '../../src/types/game';

/** Uma ordem válida dos passos (ordenação topológica pelos pré-requisitos). */
function validOrder(s: Scenario): string[] {
  const done: string[] = [];
  while (done.length < s.steps.length) {
    const next = s.steps.find((st) => !done.includes(st.id) && st.after.every((a) => done.includes(a)));
    if (!next) throw new Error(`ciclo em ${s.id}`);
    done.push(next.id);
  }
  return done;
}

/* ───────────── Lógica (sem navegador) ───────────── */

test.describe('Montagem de rolamentos: lógica', () => {
  test('procedimentos bem formados: ids únicos, pré-requisitos existentes e sem ciclo', () => {
    expect(SCENARIOS.map((s) => s.id)).toEqual(BEARING_ROUNDS.map((r) => r.id));
    for (const s of SCENARIOS) {
      const ids = [...s.steps, ...s.wrong].map((x) => x.id);
      expect(new Set(ids).size, s.id).toBe(ids.length);
      const texts = [...s.steps, ...s.wrong].map((x) => x.text);
      expect(new Set(texts).size, s.id).toBe(texts.length);
      for (const st of s.steps) for (const a of st.after) expect(s.steps.some((x) => x.id === a), `${s.id}/${st.id} → ${a}`).toBe(true);
      expect(validOrder(s)).toHaveLength(s.steps.length);
      expect(s.wrong.length).toBeGreaterThanOrEqual(3);
      // Valores de catálogo não aparecem: nada de °C, N·m, gramas ou mm nos textos.
      for (const t of [...s.steps, ...s.wrong].flatMap((x) => [x.text, x.why])) expect(t).not.toMatch(/°C|N·m|Nm\b|\d+\s?g\b|\d+\s?mm/);
    }
  });

  test('a troca no mancal começa pelo bloqueio e termina liberando a máquina', () => {
    const s = SCENARIOS_BY_ID['troca-no-mancal'];
    const firsts = s.steps.filter((st) => st.after.length === 0).map((st) => st.id);
    expect(firsts).toEqual(['bloquear']);
    const order = validOrder(s);
    expect(order[order.length - 1]).toBe('liberar');
    // Todos os passos dependem, direta ou indiretamente, do bloqueio.
    const needs = (id: string): string[] => s.steps.find((x) => x.id === id)!.after.flatMap((a) => [a, ...needs(a)]);
    for (const st of s.steps.filter((x) => x.id !== 'bloquear')) expect(needs(st.id), st.id).toContain('bloquear');
  });

  test('checkPick: certo, cedo demais e ação errada', () => {
    const s = SCENARIOS_BY_ID['montagem-a-frio'];
    expect(checkPick(s, [], 'conferir').kind).toBe('ok');
    expect(checkPick(s, [], 'limpar-eixo').kind).toBe('ok'); // independentes entre si
    const early = checkPick(s, ['conferir'], 'bucha');
    expect(early.kind).toBe('early');
    if (early.kind === 'early') expect(early.missing.map((m) => m.id)).toEqual(['medir-assento', 'desembalar']);
    const wrong = checkPick(s, [], 'bater-externo');
    expect(wrong.kind).toBe('wrong');
    if (wrong.kind === 'wrong') expect(wrong.action.why).toContain('esferas');
    expect(() => checkPick(s, [], 'nao-existe')).toThrow();
  });

  test('pontuação: erro não tira pontos ganhos; o passo logo depois de um erro não pontua; conclui com até 2 erros', () => {
    const s = SCENARIOS_BY_ID['montagem-a-frio'];
    const order = validOrder(s);
    const max = s.steps.length * POINTS_PER_STEP;
    expect(scoreSequence(s, order)).toEqual({ mistakes: 0, score: max, maxScore: max, passed: true });

    const withErrors = [order[0], 'lavar-novo', order[1], ...order.slice(2)];
    expect(scoreSequence(s, withErrors)).toMatchObject({ mistakes: 1, score: max - POINTS_PER_STEP, passed: true });

    const tooMany = ['bater-externo', 'lavar-novo', 'ar-comprimido', ...order];
    expect(scoreSequence(s, tooMany)).toMatchObject({ mistakes: 3, passed: false });
    expect(MAX_MISTAKES).toBe(2);
    // Incompleto nunca conclui.
    expect(scoreSequence(s, order.slice(0, -1)).passed).toBe(false);
    // replay devolve os passos aceitos na ordem e ignora o que entrou fora de hora.
    expect(replay(s, ['bucha', ...order]).done).toEqual(order);
  });

  test('cartões: mesma semente, mesma ordem; todos os passos e ações erradas aparecem', () => {
    for (const s of SCENARIOS) {
      expect(cardsFor(s, 7)).toEqual(cardsFor(s, 7));
      expect(cardsFor(s, 7).map((c) => c.id).sort()).toEqual([...s.steps, ...s.wrong].map((x) => x.id).sort());
    }
    expect(cardsFor(SCENARIOS[2], 7)).not.toEqual(cardsFor(SCENARIOS[2], 8));
  });
});

test('trilha “Rolamentos e transmissão” conta os procedimentos concluídos', () => {
  const path = LEARNING_PATHS_BY_ID['rolamentos-transmissao'];
  const act = path.activities.find((a) => a.kind === 'game')!;
  const profile = {
    gameResults: { 'montagem-rolamento': { lastPlayedAt: 1, rounds: { 'montagem-a-frio': { solved: true, firstTry: true, attempts: 1 } } } }
  } as unknown as PlayerProfile;
  expect(activityProgress(act, profile, new Set())).toEqual({ done: 1, total: 3 });
});

/* ───────────── No navegador ───────────── */

test('Montagem de rolamentos: erro explicado, passo fora de hora, sequência completa e recorde salvo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/desafios');
  await page.getByRole('button', { name: /Montagem de rolamentos/ }).click();
  await expect(page).toHaveURL(/#\/desafios\/montagem-rolamento/);
  await expect(page.getByRole('heading', { level: 1, name: 'Montagem de rolamentos' })).toBeVisible();
  await page.getByRole('listitem').filter({ hasText: 'Montagem a frio com bucha' }).getByRole('button', { name: 'Começar' }).click();

  const s = SCENARIOS_BY_ID['montagem-a-frio'];
  const text = (id: string) => [...s.steps, ...s.wrong].find((x) => x.id === id)!.text;
  const choices = page.getByRole('group', { name: 'Escolha a próxima ação' });
  const feedback = page.getByRole('region', { name: 'Resultado da escolha' });
  await expect(choices.getByRole('button')).toHaveCount(s.steps.length + s.wrong.length);

  // Ação errada: explicada e descartada.
  await choices.getByRole('button', { name: text('bater-externo') }).click();
  await expect(feedback).toBeFocused();
  await expect(feedback).toContainText('Não faça isso');
  await expect(choices.getByRole('button', { name: new RegExp(text('bater-externo')) })).toBeDisabled();

  // Passo certo, mas cedo demais: diz o que falta.
  await choices.getByRole('button', { name: text('anel-elastico') }).click();
  await expect(feedback).toContainText('Ainda não');

  for (const id of validOrder(s)) {
    await choices.getByRole('button', { name: text(id), exact: true }).click();
    await expect(feedback).toContainText('Certo');
  }
  await expect(page.getByRole('heading', { name: 'Sua sequência' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Procedimento concluído' })).toBeVisible();
  await expect(page.getByText(/2 erros · \d+ de 70 pontos/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que não fazer' })).toBeVisible();

  const profile = await readProfile(page);
  const rec = profile.gameResults['montagem-rolamento'].rounds['montagem-a-frio'];
  expect(rec).toMatchObject({ solved: true, attempts: 1 });
  expect(profile.skillStats['bearings.mounting'].total).toBe(s.steps.length + 2);

  await page.getByRole('button', { name: 'Escolher procedimento' }).click();
  await expect(page.getByText(`seu recorde: ${rec.bestScore} de 70 pontos`)).toBeVisible();
  expect(errors).toEqual([]);
});
