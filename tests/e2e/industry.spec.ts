import { test, expect, Page } from '@playwright/test';
import { collectErrors, expectNoHorizontalScroll, litRatio, readProfile, waitFor3D, withProfile } from './helpers';

test('indústria: planta, áreas e ficha de equipamento', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria');
  await expect(page.getByRole('heading', { name: 'Indústria na prática', level: 1 })).toBeVisible();
  await expect(page.getByText(/fictícia/).first()).toBeVisible();

  // Mapa: clicar e teclado
  await page.getByTestId('plant-area-bombeamento').click();
  const panel = page.getByTestId('plant-area-panel');
  await expect(panel.getByRole('heading', { name: 'Estação de bombeamento' })).toBeVisible();
  await page.getByTestId('plant-area-oficina').focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByText('Torno mecânico', { exact: true })).toBeVisible();

  // Ficha
  await page.getByTestId('plant-area-transporte').click();
  await panel.getByRole('button', { name: 'Ver ficha' }).first().click();
  await expect(page.getByTestId('equipment-detail-belt-conveyor')).toBeVisible();
  await expect(page.getByTestId('drawing-conveyor-drive')).toBeVisible();
  await expectNoHorizontalScroll(page);
  expect(errors).toEqual([]);
});

test('indústria: catálogo com busca e selos de disponibilidade', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/equipamentos');
  await page.getByTestId('equipment-search').fill('rolamento');
  await expect(page.getByTestId('equipment-card-bearing-assembly')).toBeVisible();
  await expect(page.getByTestId('equipment-card-belt-conveyor')).toHaveCount(0);
  await page.getByTestId('equipment-search').fill('diafragma');
  const card = page.getByTestId('equipment-card-diaphragm-pump');
  await expect(card).toContainText('3D interativo');
  await page.getByTestId('equipment-search').fill('pneum');
  await expect(page.getByTestId('equipment-card-pneumatic-station')).toContainText('Simulador interativo');
  await page.getByTestId('equipment-search').fill('xyzxyz');
  await expect(page.getByText('Nada encontrado')).toBeVisible();
  expect(errors).toEqual([]);
});

async function answer(page: Page, taskId: string, picks: string[]) {
  const task = page.getByTestId(`mission-task-${taskId}`);
  for (const p of picks) await task.getByText(p, { exact: false }).click();
  await task.getByRole('button', { name: 'Conferir', exact: true }).click();
}

test('indústria: missão da correia — erro com explicação, conclusão e registro', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/missao-correia-desalinhada');
  await expect(page.getByTestId('figure-belt-drift')).toBeVisible();

  const tasks = page.locator('[data-testid^="mission-task-"]');
  const id = async (i: number) => ((await tasks.nth(i).getAttribute('data-testid')) || '').replace('mission-task-', '');

  // Errar primeiro: retorno explicativo
  await answer(page, await id(0), ['Pode, se for rápido e com luva']);
  await expect(page.getByTestId('mission-feedback')).toContainText('Luva não protege');
  await answer(page, await id(0), ['Não: nada se ajusta com a correia em movimento']);

  await answer(page, await id(1), ['Material grudado no rolo de retorno', 'Tensor ajustado de forma desigual']);

  // Ordenar: move cada item para a posição correta com os botões
  const orderTask = tasks.nth(2);
  const correct = [
    'Parar, bloquear as energias e testar a partida',
    'Limpar o rolo de retorno e a região da cauda',
    'Conferir o esquadro da polia de retorno e igualar o ajuste do tensor nos dois lados',
    'Recolocar as proteções, liberar e observar a correia de fora das proteções'
  ];
  for (let target = 0; target < correct.length; target++) {
    for (;;) {
      const items = await orderTask.locator('ol > li > span.flex-1').allTextContents();
      const at = items.indexOf(correct[target]);
      if (at === target) break;
      await orderTask.getByRole('button', { name: `Subir: ${correct[target]}` }).click();
    }
  }
  await orderTask.getByRole('button', { name: 'Conferir', exact: true }).click();

  await answer(page, await id(3), ['Dispositivos que interrompam o funcionamento']);
  await expect(page.getByTestId('mission-complete')).toBeVisible();
  await expect(page.getByTestId('mission-complete')).toContainText('12.8.8');

  const profile = await readProfile(page);
  const rounds = profile.gameResults['industria-missao-correia-desalinhada'].rounds;
  expect(Object.values(rounds).every((r: any) => r.solved)).toBe(true);
  expect(errors).toEqual([]);
});

test('indústria: missão de ronda de vibração — tendência x medição isolada', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/missao-ronda-vibracao');
  await expect(page.getByTestId('figure-vibration-trend')).toBeVisible();
  const tasks = page.locator('[data-testid^="mission-task-"]');
  const id = async (i: number) => ((await tasks.nth(i).getAttribute('data-testid')) || '').replace('mission-task-', '');
  await answer(page, await id(0), ['Redutor, entrada: teve o maior valor']);
  await expect(page.getByTestId('mission-feedback')).toContainText('valor isolado');
  await answer(page, await id(0), ['Redutor, saída: sobe semana após semana']);
  await answer(page, await id(1), ['Tratar como medição não comparável']);
  await answer(page, await id(2), ['Medir sempre no mesmo ponto', 'Medir com a máquina na mesma condição', 'Usar o mesmo instrumento', 'Registrar data']);
  await answer(page, await id(3), ['Aumentar a frequência das medições']);
  await expect(page.getByTestId('mission-complete')).toBeVisible();
  const profile = await readProfile(page);
  const rounds = profile.gameResults['industria-missao-ronda-vibracao'].rounds;
  expect(Object.values(rounds).every((r: any) => r.solved)).toBe(true);
  expect(errors).toEqual([]);
});

test('indústria: desenho técnico e aula narrada (sem autoplay, com legendas)', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/desenhos');
  await expect(page.getByTestId('drawing-bearing-assembly')).toContainText('NÃO USAR PARA FABRICAÇÃO');
  // Esquemas gerados do modelo: a relação mostrada vem das constantes do redutor 3D
  await expect(page.getByTestId('drawing-motor-gearbox')).toContainText('43 ÷ 14 ≈ 3,07');
  await expect(page.getByTestId('drawing-diaphragm-flow')).toContainText('Curso 2');
  await page.getByRole('button', { name: 'Assistir: rolamento fixo e rolamento livre' }).click();
  const video = page.locator('video');
  await expect(video).toBeVisible();
  await expect(video.locator('track[kind="captions"]')).toHaveAttribute('src', '/media/aulas/rolamento-fixo-livre.vtt');
  await expect(video).not.toHaveAttribute('autoplay', /.*/);
  const media = await page.evaluate(async () => {
    const v = document.querySelector('video')!;
    if (v.readyState < 1) await new Promise((r) => v.addEventListener('loadedmetadata', r, { once: true }));
    return { paused: v.paused, duration: v.duration };
  });
  expect(media.paused).toBe(true);
  expect(media.duration).toBeGreaterThan(30);
  expect(media.duration).toBeLessThan(120);
  // Narração regravada com voz de licença verificada (Kokoro-82M, Apache-2.0)
  await expect(page.getByText(/Kokoro-82M/).first()).toBeVisible();
  const vtt = await page.request.get('/media/aulas/rolamento-fixo-livre.vtt');
  expect((await vtt.text()).startsWith('WEBVTT')).toBe(true);
  expect(errors).toEqual([]);
});

for (const machine of ['bearing-assembly', 'belt-conveyor', 'diaphragm-pump', 'motor-gearbox']) {
  test(`lab 3D: ${machine} renderiza e anima`, async ({ page }) => {
    const errors = collectErrors(page);
    await withProfile(page, { labMissionStages: { [machine]: ['conhecer'] } });
    await page.goto(`/#/lab/${machine}`);
    await waitFor3D(page);
    expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);
    const run = page.getByTestId('lab-run');
    await run.click();
    await expect(page.getByTestId('lab-operating-note')).toBeVisible();
    await expect(run).toHaveAttribute('aria-pressed', 'true');
    await run.click();
    await expect(page.getByTestId('lab-operating-note')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('indústria: missão do acoplamento desalinhado e esquema na ficha do redutor', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/equipamento-gearbox-reducer');
  await expect(page.getByTestId('drawing-motor-gearbox')).toBeVisible();
  await page.goto('/#/industria/missao-acoplamento-desalinhado');
  const tasks = page.locator('[data-testid^="mission-task-"]');
  const id = async (i: number) => ((await tasks.nth(i).getAttribute('data-testid')) || '').replace('mission-task-', '');
  // Marcar uma evidência que não aponta para desalinhamento: retorno explica
  await answer(page, await id(0), ['A máquina acionada trabalha normalmente']);
  await expect(page.getByTestId('mission-feedback')).toBeVisible();
  await tasks.nth(0).getByRole('checkbox', { name: 'A máquina acionada trabalha normalmente' }).uncheck();
  for (const opt of [/^Elemento elástico novo deformado/, /^Montagem "no olho"/, /^Problema começou logo depois/, /^Mancal dianteiro do motor/]) {
    await tasks.nth(0).getByRole('checkbox', { name: opt }).check();
  }
  await tasks.nth(0).getByRole('button', { name: 'Conferir', exact: true }).click();
  await answer(page, await id(1), ['Trocar o elemento E corrigir o alinhamento']);
  const orderTask = tasks.nth(2);
  const target = [
    'Parar, bloquear as energias e testar a partida',
    'Retirar a proteção do acoplamento',
    'Verificar e corrigir pé manco e calços do motor',
    'Medir e corrigir o alinhamento com instrumento (por exemplo, relógio comparador), dentro da tolerância do fabricante do acoplamento',
    'Trocar o elemento elástico, reapertar os pés e medir de novo',
    'Recolocar a proteção, liberar e registrar as medições finais e os calços usados'
  ];
  for (let t = 0; t < target.length; t++) {
    for (;;) {
      const now = await orderTask.locator('ol > li > span.flex-1').allTextContents();
      if (now.indexOf(target[t]) === t) break;
      await orderTask.getByRole('button', { name: `Subir: ${target[t]}` }).click();
    }
  }
  await orderTask.getByRole('button', { name: 'Conferir', exact: true }).click();
  await answer(page, await id(3), ['Medições finais de alinhamento']);
  await expect(page.getByTestId('mission-complete')).toBeVisible();
  const profile = await readProfile(page);
  expect(Object.values(profile.gameResults['industria-missao-acoplamento-desalinhado'].rounds).every((r: any) => r.solved)).toBe(true);
  expect(errors).toEqual([]);
});

test('indústria: bancada pneumática — pressão, ciclo, velocidade e despressurização', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/missoes');
  await page.getByTestId('mission-card-bancada-pneumatica').getByRole('button', { name: /Abrir a bancada/ }).click();
  await expect(page.getByTestId('pneumatic-bench')).toBeVisible();

  await page.getByTestId('pn-supply').click();
  await page.getByTestId('pn-reg').fill('5');
  await expect(page.getByTestId('pn-task-ligar')).toHaveAttribute('data-done', 'true');

  await page.getByTestId('pn-latch').click();
  await expect(page.getByTestId('pneumatic-circuit')).toContainText('avançado');
  await page.getByTestId('pn-latch').click();
  await expect(page.getByTestId('pn-task-ciclo')).toHaveAttribute('data-done', 'true');

  // Estrangular a linha errada (4) deixa o RECUO lento: o retorno explica
  await page.getByTestId('pn-thr4').fill('0.3');
  await page.getByTestId('pn-latch').click();
  await expect(page.getByTestId('pn-feedback')).toContainText('linha 4 está fechada', { timeout: 20_000 });
  await page.getByTestId('pn-latch').click();
  await expect(page.getByTestId('pneumatic-circuit')).toContainText('recuado', { timeout: 20_000 });
  await page.getByTestId('pn-thr4').fill('1');
  await page.getByTestId('pn-thr2').fill('0.3');
  await page.getByTestId('pn-latch').click();
  await expect(page.getByTestId('pn-feedback')).toContainText('Avanço mais lento', { timeout: 20_000 });
  await page.getByTestId('pn-latch').click();
  await expect(page.getByTestId('pn-task-velocidade')).toHaveAttribute('data-done', 'true', { timeout: 20_000 });

  // Soltar a mangueira: recusado com ar ligado e com ar preso; aceito com tudo em zero
  await page.getByTestId('pn-disconnect').click();
  await expect(page.getByTestId('pn-feedback')).toContainText('alimentação ainda está aberta');
  await page.getByTestId('pn-supply').click();
  await page.getByTestId('pn-disconnect').click();
  await expect(page.getByTestId('pn-feedback')).toContainText('manômetros ainda mostram');
  await expect(page.getByTestId('pneumatic-circuit')).toContainText('linha a 0,0 bar');
  await page.waitForTimeout(9_000);
  await page.getByTestId('pn-disconnect').click();
  await expect(page.getByTestId('pn-complete')).toBeVisible();

  const profile = await readProfile(page);
  const rounds = profile.gameResults['industria-bancada-pneumatica'].rounds;
  expect(Object.keys(rounds).sort()).toEqual(['bloqueio', 'ciclo', 'ligar', 'velocidade']);
  expect(Object.values(rounds).every((r: any) => r.solved)).toBe(true);
  await expectNoHorizontalScroll(page);
  expect(errors).toEqual([]);
});

test('indústria: segunda aula narrada (redutor) — legendas, sem autoplay, pergunta', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/industria/desenhos');
  await page.getByRole('button', { name: 'Assistir: redutor troca rotação por torque' }).click();
  const video = page.locator('video');
  await expect(video.locator('track[kind="captions"]')).toHaveAttribute('src', '/media/aulas/redutor-rotacao-torque.vtt');
  await expect(video).not.toHaveAttribute('autoplay', /.*/);
  const media = await page.evaluate(async () => {
    const v = document.querySelector('video')!;
    if (v.readyState < 1) await new Promise((r) => v.addEventListener('loadedmetadata', r, { once: true }));
    return { paused: v.paused, duration: v.duration };
  });
  expect(media.paused).toBe(true);
  expect(Math.abs(media.duration - 70)).toBeLessThan(2);
  const vtt = await (await page.request.get('/media/aulas/redutor-rotacao-torque.vtt')).text();
  expect(vtt.startsWith('WEBVTT')).toBe(true);
  expect(vtt).toContain('43 ÷ 14, cerca de 3,07.');
  expect(errors).toEqual([]);
});
