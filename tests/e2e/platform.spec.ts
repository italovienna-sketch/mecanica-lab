import { test, expect, Locator } from '@playwright/test';
import { collectErrors, expectNoHorizontalScroll, readProfile, waitFor3D, withProfile } from './helpers';
import { MICRO_LESSONS_BY_ID, SAFETY_MICRO_IDS } from '../../src/data/microLessons';
import { GAMES_BY_ID, ChoiceRound } from '../../src/data/games';
import { SELECTION_SCENARIOS } from '../../src/data/fasteners';
import { PUMP_CATALOG } from '../../src/data/pumpCatalog';

async function openPartList(aside: Locator) {
  const toggle = aside.getByRole('button', { name: /Não consegue clicar no 3D|Lista de peças/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

test('início recomenda a segurança primeiro', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/');
  await expect(page.getByText('Primeiro passo recomendado')).toBeVisible();
  await page.getByRole('button', { name: 'Começar pela segurança' }).click();
  await expect(page).toHaveURL(new RegExp(`#/aulas-rapidas/${SAFETY_MICRO_IDS[0]}$`));
  expect(errors).toEqual([]);
});

test('aula rápida: sem reprodução automática, erro sem punição e conclusão salva', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const id = SAFETY_MICRO_IDS[0];
  const lesson = MICRO_LESSONS_BY_ID[id];
  await page.goto(`/#/aulas-rapidas/${id}`);
  await expect(page.getByRole('heading', { name: lesson.title, level: 1 })).toBeVisible();

  // Nada começa sozinho: o tempo fica parado em 0:00 até o aluno tocar em "Assistir"
  const time = page.getByTestId('micro-time');
  await expect(time).toContainText('0:00');
  await page.waitForTimeout(1200);
  await expect(time).toContainText('0:00');
  await expect(page.getByTestId('micro-caption')).toContainText('Toque em Assistir para começar.');
  await expect(page.locator('video[autoplay], audio')).toHaveCount(0);

  // Transcrição disponível sem precisar assistir
  await page.getByRole('button', { name: 'Transcrição' }).click();
  const transcript = page.getByRole('list', { name: 'Transcrição da demonstração' });
  if (lesson.media.kind === 'animation') await expect(transcript).toContainText(lesson.media.scenes[0].caption);

  await page.getByRole('button', { name: 'Responder a pergunta rápida' }).click();
  const q = lesson.question;
  const wrong = q.options.find((_, i) => i !== q.correctIndex)!;
  await page.getByRole('radio', { name: new RegExp(wrong.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await expect(page.getByText('Ainda não. Veja por quê:')).toBeVisible();
  let profile = await readProfile(page);
  expect(profile.microLessons?.[id]?.completedAt).toBeUndefined();

  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  await page.getByRole('radio', { name: new RegExp(q.options[q.correctIndex].slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await expect(page.getByText('Correto!')).toBeVisible();
  profile = await readProfile(page);
  expect(typeof profile.microLessons[id].completedAt).toBe('number');

  // Fontes oficiais com data de verificação e aviso de que não é capacitação
  await expect(page.getByText(/Fontes oficiais \(verificadas em/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('desafio de escolha: dica, erro com explicação e rodada resolvida', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const game = GAMES_BY_ID['ferramenta-certa'];
  const round = game.rounds[0] as ChoiceRound;
  await page.goto(`/#/desafios/${game.id}`);
  await expect(page.getByText(round.prompt)).toBeVisible();
  // Sem cronômetro
  await expect(page.getByText(/cronômetro|tempo restante|segundos restantes/i)).toHaveCount(0);

  await page.getByRole('button', { name: 'Ver uma dica' }).click();
  const wrong = round.options.find((o) => o.verdict === 'wrong')!;
  await page.getByRole('button', { name: wrong.text, exact: true }).click();
  await expect(page.getByText(wrong.feedback)).toBeVisible();
  const best = round.options.find((o) => o.verdict === 'best')!;
  await page.getByRole('button', { name: best.text, exact: true }).click();
  await expect(page.getByRole('button', { name: /Próxima rodada/ })).toBeVisible();

  const profile = await readProfile(page);
  expect(profile.gameResults[game.id].rounds[round.id].solved).toBe(true);
  expect(errors).toEqual([]);
});

test('fixadores: seleção com dados incompletos termina dizendo o que falta', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const sc = SELECTION_SCENARIOS.find((s) => !s.complete)!;
  await page.goto('/#/ferramentas/fixadores');
  await page.getByRole('button', { name: 'Escolher passo a passo' }).click();
  await page.getByRole('button', { name: new RegExp(sc.title) }).click();
  for (let i = 0; i < sc.steps.length; i++) {
    const step = sc.steps[i];
    await expect(page.getByRole('heading', { name: step.title, level: 2 })).toBeVisible();
    const wrong = step.options.find((o) => o.verdict === 'wrong');
    if (wrong) {
      await page.getByRole('button', { name: wrong.text }).click();
      await expect(page.getByText('Releia os dados e tente outra opção.')).toBeVisible();
    }
    const ok = step.options.find((o) => o.verdict !== 'wrong')!;
    await page.getByRole('button', { name: ok.text }).click();
    await page.getByRole('button', { name: i < sc.steps.length - 1 ? 'Próxima etapa' : 'Ver resultado' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Seleção incompleta — e isso é o resultado certo' })).toBeVisible();
  // Nenhum valor de torque inventado na tela
  await expect(page.getByText(/\d+\s?N·?m/)).toHaveCount(0);
  const profile = await readProfile(page);
  expect(profile.completedTasks).toContain(`task-fastener-${sc.id}`);
  expect(errors).toEqual([]);
});

test('trilha de bombas: catálogo sem itens vazios', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/cursos/bombas');
  await expect(page.getByRole('heading', { name: 'Catálogo de bombas' })).toBeVisible();
  for (const p of PUMP_CATALOG) {
    const card = page.getByTestId(`pump-${p.id}`);
    await expect(card.getByRole('heading', { name: p.name })).toBeVisible();
    await expect(card).toContainText(p.principle);
    await expect(card).toContainText(p.labId ? 'Laboratório 3D' : 'Só explicação (sem 3D)');
  }
  await expectNoHorizontalScroll(page);
  expect(errors).toEqual([]);
});

test('bomba de engrenagens: desmontagem "tentar sozinho" com escolha de ferramenta e revisão', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page, { labMissionStages: { 'gear-pump': ['conhecer', 'explorar', 'identificar'] } });
  await page.goto('/#/lab/gear-pump');
  await waitFor3D(page);
  const aside = page.getByRole('complementary', { name: 'Painel do laboratório' });
  await expect(aside.getByRole('heading', { name: 'Desmontar em sequência' })).toBeVisible();
  // Sem ilustração 2D para este equipamento; vista em corte disponível
  await expect(page.getByRole('tab', { name: 'Ilustração 2D' })).toHaveCount(0);
  await page.getByRole('button', { name: /Vista em corte/ }).click();
  await expect(page.getByRole('button', { name: /Vista em corte/ })).toHaveAttribute('aria-pressed', 'true');

  await aside.getByRole('radio', { name: 'Tentar sozinho' }).click();
  await openPartList(aside);
  await aside.getByRole('button', { name: 'Tampa traseira', exact: true }).click();
  await expect(aside.getByText(/outra peça está bloqueando o caminho/)).toBeVisible();
  await aside.getByRole('button', { name: 'Chaveta', exact: true }).click();
  await aside.getByRole('button', { name: 'Torquímetro' }).click();
  await expect(aside.getByText(/Não é a melhor escolha/)).toBeVisible();
  await aside.getByRole('button', { name: 'Alicate universal ou punção de latão' }).click();
  await expect(aside.getByText('1/8 etapas')).toBeVisible({ timeout: 90_000 });
  await expect(aside.getByText(/Observe na peça retirada \(Chaveta\)/)).toBeVisible();

  // O restante no modo passo a passo
  await aside.getByRole('radio', { name: 'Passo a passo' }).click();
  for (let i = 1; i < 8; i++) {
    await aside.getByRole('button', { name: 'Executar esta etapa' }).click();
    await expect(aside.getByText(`${i + 1}/8 etapas`)).toBeVisible({ timeout: 90_000 });
  }
  await expect(aside.getByText('Desmontagem concluída', { exact: true })).toBeVisible();
  await aside.getByText('Revisar procedimento (8 etapas)').click();
  await expect(aside.getByText('Ferramenta:').first()).toBeVisible();

  const profile = await readProfile(page);
  expect(profile.labMissionStages['gear-pump']).toContain('desmontar');
  expect(errors).toEqual([]);
});
