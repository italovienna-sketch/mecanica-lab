import { test, expect, Page } from '@playwright/test';
import { collectErrors, readProfile, withProfile } from './helpers';
import { PRACTICE_QUESTIONS } from '../../src/data/practiceBank';
import { getLessonCheckQuestions } from '../../src/data/lessonStructure';

const ALL_QUESTIONS = [...PRACTICE_QUESTIONS, ...getLessonCheckQuestions('lesson-beginner-tools-fasteners')];

/** Responde a questão visível: certo (true) ou errado (false). Retorna se acertou de fato. */
async function answer(page: Page, wantCorrect: boolean): Promise<boolean> {
  const heading = (await page.locator('h2[tabindex="-1"]').first().innerText()).trim();
  const q = ALL_QUESTIONS.find((x) => x.prompt === heading);
  expect(q, `questão encontrada no banco: ${heading}`).toBeTruthy();
  const correctText = q!.options[q!.correctIndex];
  const radios = page.getByRole('radio');
  const n = await radios.count();
  for (let i = 0; i < n; i++) {
    const text = (await radios.nth(i).innerText()).replace(/^[A-E]\s*/, '').trim();
    if ((text === correctText) === wantCorrect) {
      await radios.nth(i).click();
      break;
    }
  }
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  const ok = await page.getByText('Correto!', { exact: true }).isVisible();
  if (!ok) await expect(page.getByText('Quase. Vamos entender juntos.')).toBeVisible();
  await expect(page.getByText('Resposta certa:').first()).toBeVisible({ visible: !ok });
  return ok;
}

test('sessão de 5 questões: feedback, resultado exato e progresso salvo após recarregar', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/praticar');
  await expect(page.getByText('Passo 1 de 2 · Tema')).toBeVisible();
  await page.getByRole('button', { name: /Rolamentos/ }).click();
  await expect(page.getByRole('heading', { name: 'Rolamentos' })).toBeVisible();
  await page.getByRole('button', { name: /Começar · 5 questões/ }).click();

  const plan = [true, false, true, true, false];
  let correct = 0;
  const seen: string[] = [];
  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`Questão ${i + 1} de 5`)).toBeVisible();
    seen.push((await page.locator('h2[tabindex="-1"]').first().innerText()).trim());
    if (await answer(page, plan[i])) correct++;
    await page.getByRole('button', { name: i === 4 ? 'Ver resultado' : 'Continuar' }).click();
  }
  expect(correct).toBe(3);
  expect(new Set(seen).size).toBe(5);
  await expect(page.getByLabel('3 acertos em 5 questões')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Para revisar' })).toBeVisible();

  const profile = await readProfile(page);
  expect(profile.practiceSessions).toHaveLength(1);
  expect(profile.practiceSessions[0]).toMatchObject({ topicId: 'rolamentos', correct: 3, total: 5 });
  expect(profile.practiceSessions[0].wrongQuestionIds).toHaveLength(2);

  // "Praticar mais 5" traz questões diferentes da sessão anterior
  await page.getByRole('button', { name: 'Praticar mais 5' }).click();
  await expect(page.getByText('Questão 1 de 5')).toBeVisible();
  const next = (await page.locator('h2[tabindex="-1"]').first().innerText()).trim();
  expect(seen).not.toContain(next);

  // Recarregar mantém o histórico
  await page.reload();
  await page.goto('/#/progresso');
  await expect(page.getByRole('heading', { name: 'Últimas sessões de prática' })).toBeVisible();
  await expect(page.getByText('Rolamentos').first()).toBeVisible();
  await expect(page.getByText('3/5').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('teclado: 1–4 escolhe e Enter confirma', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/praticar/seguranca');
  await page.getByRole('button', { name: /Começar · 5 questões/ }).click();
  await expect(page.getByText('Questão 1 de 5')).toBeVisible();
  await page.keyboard.press('2');
  await expect(page.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true');
  await page.locator('body').press('Enter');
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
});

test('aula: verificação reprovada não conclui; aprovada conclui e persiste', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/aula/lesson-beginner-tools-fasteners');
  await expect(page.getByText('Situação de trabalho')).toBeVisible();
  await page.getByRole('button', { name: 'Começar a aula' }).click();

  // B. Entender: três conceitos, um por vez
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Próximo conceito', exact: true }).click();
  await page.getByRole('button', { name: 'Ver na prática', exact: true }).click();
  // C. Ver na prática
  await expect(page.getByText('Etapa 1 de 3')).toBeVisible();
  await page.getByRole('main').getByRole('button', { name: 'Praticar', exact: true }).click();

  // D. Praticar: primeiro uma ordem errada, depois a certa
  const steps = [
    'Avisar a equipe e desligar a máquina',
    'Bloquear a fonte de energia com cadeado e etiqueta',
    'Testar se a máquina realmente não liga',
    'Vestir os EPIs e começar a soltar os parafusos'
  ];
  const available = page.getByLabel('Etapas disponíveis');
  for (const s of [steps[1], steps[0], steps[2], steps[3]]) await available.getByRole('button', { name: s }).click();
  await page.getByRole('button', { name: 'Conferir sequência' }).click();
  await expect(page.getByText('Quase! A etapa 1 não está no lugar certo.')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar de novo' }).click();
  for (const s of steps) await available.getByRole('button', { name: s }).click();
  await page.getByRole('button', { name: 'Conferir sequência' }).click();
  await expect(page.getByText('Sequência correta!')).toBeVisible();
  await page.getByRole('button', { name: 'Verificar o que aprendi' }).click();

  // E. Verificar — errando tudo
  await page.getByRole('button', { name: 'Começar verificação' }).click();
  const total = getLessonCheckQuestions('lesson-beginner-tools-fasteners').length;
  for (let i = 0; i < total; i++) {
    await answer(page, false);
    await page.getByRole('button', { name: i === total - 1 ? 'Ver resultado' : 'Continuar' }).click();
  }
  await expect(page.getByText('Ainda não foi desta vez — e está tudo bem.')).toBeVisible();
  let profile = await readProfile(page);
  expect(profile.lessonProgress['lesson-beginner-tools-fasteners'].completed).toBe(false);

  // Refazer acertando tudo
  await page.getByRole('button', { name: 'Refazer verificação' }).click();
  for (let i = 0; i < total; i++) {
    await answer(page, true);
    await page.getByRole('button', { name: i === total - 1 ? 'Ver resultado' : 'Continuar' }).click();
  }
  await expect(page.getByText('Aula concluída!')).toBeVisible();
  await expect(page.getByText(`${total} de ${total}`).first()).toBeVisible();
  profile = await readProfile(page);
  expect(profile.lessonProgress['lesson-beginner-tools-fasteners']).toMatchObject({ completed: true, bestScore: total, attempts: 2 });

  await page.reload();
  await page.goto('/#/cursos/ferramentas-fixacao');
  await expect(page.getByText('1 de 7 requisitos concluídos')).toBeVisible();
  await expect(page.getByRole('button', { name: /Revisar/ }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
