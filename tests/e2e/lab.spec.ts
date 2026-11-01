import { test, expect } from '@playwright/test';
import { Locator } from '@playwright/test';
import { collectErrors, imageDiff, litRatio, readProfile, waitFor3D, withProfile } from './helpers';

/** Responde a pergunta da etapa, se houver: tenta as alternativas até a certa e segue. */
async function answerStepQuiz(aside: Locator) {
  const quiz = aside.getByTestId('step-quiz');
  if (!(await quiz.isVisible())) return false;
  const go = quiz.getByRole('button', { name: /Próxima etapa|Concluir/ });
  const options = quiz.locator('button');
  const n = await options.count();
  for (let k = 0; k < n && !(await go.isVisible()); k++) {
    const opt = options.nth(k);
    if (await opt.isEnabled()) await opt.click();
  }
  await go.click();
  return true;
}

/** Abre a lista acessível de peças, se ainda estiver fechada. */
async function openPartList(aside: Locator) {
  const toggle = aside.getByRole('button', { name: /Não consegue clicar no 3D|Lista de peças/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

test('laboratório 3D: renderiza, responde à câmera e seleciona peças', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/centrifugal-pump');
  await waitFor3D(page);
  await page.waitForTimeout(1500);

  // Não é tela preta
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  // Arrastar gira a câmera
  const canvas = page.locator('canvas').first();
  const box = (await canvas.boundingBox())!;
  const before = await canvas.screenshot();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.45, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(2500);
  const afterDrag = await canvas.screenshot();
  expect(await imageDiff(page, before, afterDrag)).toBeGreaterThan(0.01);

  // Botões de zoom também mudam a imagem
  await page.getByRole('button', { name: 'Aproximar' }).click();
  await page.waitForTimeout(2000);
  expect(await imageDiff(page, afterDrag, await canvas.screenshot())).toBeGreaterThan(0.005);

  // Clique direto em uma peça no canvas abre o painel de informações
  const aside = page.getByRole('complementary', { name: 'Painel do laboratório' });
  await aside.getByRole('button', { name: 'Explorar em 3D' }).click();
  await page.getByRole('button', { name: 'Centralizar modelo' }).click();
  await page.waitForTimeout(1500);
  const b2 = (await canvas.boundingBox())!;
  await page.mouse.click(b2.x + b2.width * 0.55, b2.y + b2.height * 0.55);
  await expect(aside.getByText('Peça selecionada')).toBeVisible();
  await expect(aside.getByText('Função', { exact: true })).toBeVisible();
  await expect(aside.getByText('Segurança', { exact: true })).toBeVisible();

  // Raio-X e rótulos são alternáveis
  await page.getByRole('button', { name: 'Raio-X: ver peças internas' }).click();
  await expect(page.getByRole('button', { name: 'Raio-X: ver peças internas' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Mostrar nomes das peças' }).click();
  await expect(page.getByRole('button', { name: 'Mostrar nomes das peças' })).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('missão da bomba: identificar, desmontar e montar na ordem correta', async ({ page }) => {
  // 9 etapas de ida e 9 de volta, cada uma animada: mais lento que os outros testes no renderizador por software.
  test.setTimeout(720_000);
  const errors = collectErrors(page);
  await withProfile(page, { labMissionStages: { 'centrifugal-pump': ['conhecer', 'explorar'] } });
  await page.goto('/#/lab/centrifugal-pump');
  await waitFor3D(page);
  const aside = page.getByRole('complementary', { name: 'Painel do laboratório' });
  await expect(aside.getByRole('heading', { name: 'Identificar as peças' })).toBeVisible();

  await openPartList(aside);
  await aside.getByRole('button', { name: 'Eixo', exact: true }).click();
  await expect(aside.getByText(/Tente de novo/)).toBeVisible();
  for (const name of ['Rotor', 'Voluta (carcaça)', 'Tampa e selo mecânico', 'Rolamentos']) {
    await aside.getByRole('button', { name, exact: true }).click();
  }
  await expect(aside.getByText('Você identificou todas as peças!')).toBeVisible();
  await aside.getByRole('button', { name: 'Desmontar em sequência' }).click();

  // Antes da primeira etapa: liberação (bloqueio, isolamento, dreno). Sem ela, nenhuma peça sai.
  const checklist = aside.getByTestId('prework-checklist');
  await expect(checklist).toBeVisible();
  await openPartList(aside);
  await aside.getByRole('button', { name: 'Parafusos da carcaça', exact: true }).click();
  await expect(aside.getByText(/Primeiro libere a bomba/)).toBeVisible();
  const release = checklist.getByRole('button', { name: /Confirme todos os itens/ });
  await expect(release).toBeDisabled();
  await expect(checklist.getByText('Requisito de NR').first()).toBeVisible();
  await expect(checklist.getByRole('link', { name: /NR-12, item 12\.11\.3/ }).first()).toBeVisible();
  const boxes = checklist.getByRole('checkbox');
  for (let k = 0; k < (await boxes.count()); k++) await boxes.nth(k).check();
  await checklist.getByRole('button', { name: /começar a desmontagem/ }).click();

  // Ordem errada é recusada com explicação
  await openPartList(aside);
  await aside.getByRole('button', { name: 'Eixo', exact: true }).click();
  await expect(aside.getByText(/outra peça está bloqueando o caminho/)).toBeVisible();

  let quizzes = 0;
  for (let i = 0; i < 9; i++) {
    await aside.getByRole('button', { name: 'Executar esta etapa' }).click();
    await expect(aside.getByText(`${i + 1}/9 etapas`)).toBeVisible({ timeout: 90_000 });
    if (i === 1) {
      // Voltar uma etapa: a unidade volta para a carcaça e a etapa pode ser refeita.
      await answerStepQuiz(aside);
      await aside.getByTestId('procedure-undo').click();
      await expect(aside.getByText('1/9 etapas')).toBeVisible({ timeout: 90_000 });
      await expect(aside.getByRole('heading', { name: /2\. Puxar a unidade rotativa/ })).toBeVisible();
      await aside.getByRole('button', { name: 'Executar esta etapa' }).click();
      await expect(aside.getByText('2/9 etapas')).toBeVisible({ timeout: 90_000 });
    }
    // Pergunta pendente bloqueia a próxima etapa até a resposta certa.
    if (await aside.getByTestId('step-quiz').isVisible()) {
      await expect(aside.getByRole('button', { name: 'Executar esta etapa' })).toHaveCount(0);
      if (await answerStepQuiz(aside)) quizzes++;
    }
  }
  expect(quizzes).toBeGreaterThanOrEqual(6);
  await expect(aside.getByText('Desmontagem concluída', { exact: true })).toBeVisible();
  await aside.getByRole('button', { name: 'Montar de novo' }).click();

  await openPartList(aside);
  await aside.getByRole('button', { name: 'Parafusos da carcaça', exact: true }).click();
  await expect(aside.getByText(/depende de outra peça já estar no lugar/)).toBeVisible();
  for (let i = 0; i < 9; i++) {
    await aside.getByRole('button', { name: 'Preciso de uma dica' }).click();
    if (i === 0) {
      // Montagem tem texto próprio: o rolamento entra aquecido, não com o extrator da desmontagem.
      await expect(aside.getByRole('heading', { name: /Montar os rolamentos no eixo/ })).toBeVisible();
      await expect(aside.getByText('Aquecedor indutivo de rolamentos')).toBeVisible();
    }
    await aside.getByRole('button', { name: 'Instalar esta peça' }).click();
    await expect(aside.getByText(`${i + 1}/9 etapas`)).toBeVisible({ timeout: 90_000 });
    await answerStepQuiz(aside);
  }
  await expect(aside.getByText('Montagem concluída', { exact: true })).toBeVisible();
  await expect(aside.getByTestId('return-to-service')).toBeVisible();

  const profile = await readProfile(page);
  expect(profile.labMissionStages['centrifugal-pump']).toEqual(
    expect.arrayContaining(['conhecer', 'explorar', 'identificar', 'desmontar', 'montar'])
  );
  expect(profile.pumpDisassemblyCompleted).toBe(true);
  expect(profile.pumpReassemblyCompleted).toBe(true);
  // A desmontagem da bomba não marca o redutor como concluído
  expect(profile.disassemblyCompleted).toBe(false);

  // Recarregar retoma na etapa seguinte não concluída
  await page.reload();
  await waitFor3D(page);
  await expect(page.getByRole('heading', { name: 'Verificar o aprendizado' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('falha ao baixar o modelo 3D mostra erro claro e alternativa 2D', async ({ page }) => {
  await withProfile(page);
  await page.route('**/*.glb', (route) => route.abort());
  await page.goto('/#/lab/gearbox-reducer');
  await expect(page.getByText('O 3D não carregou')).toBeVisible({ timeout: 120_000 });
  await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
  await page.getByRole('button', { name: 'Usar ilustração 2D' }).click();
  await expect(page.getByRole('tab', { name: 'Ilustração 2D' })).toHaveAttribute('aria-selected', 'true');
});

test('redutor de engrenagens carrega o modelo .glb', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/gearbox-reducer');
  await waitFor3D(page);
  await page.waitForTimeout(1500);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);
  await expect(page.getByRole('heading', { level: 1, name: 'Redutor de engrenagens' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('menu "Trocar equipamento" abre com teclado, fecha com Esc e troca a máquina', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/centrifugal-pump');
  await expect(page.getByRole('heading', { level: 1, name: 'Bomba centrífuga' })).toBeVisible();
  const trigger = page.getByRole('button', { name: 'Trocar equipamento' });
  await trigger.click();
  const menu = page.getByRole('menu', { name: 'Equipamentos do laboratório' });
  await expect(menu.getByRole('menuitemradio', { name: 'Bomba centrífuga' })).toHaveAttribute('aria-checked', 'true');
  await expect(menu.getByRole('menuitemradio', { name: 'Bomba centrífuga' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole('menuitemradio', { name: 'Torno mecânico' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Torno mecânico' })).toBeVisible();
  expect(new URL(page.url()).hash).toBe('#/lab/conventional-lathe');
  expect(errors).toEqual([]);
});

test('modo apresentação: tela cheia, tomadas com teclado, legendas e saída com Esc', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/centrifugal-pump');
  await waitFor3D(page);
  const canvas = page.locator('canvas').first();
  const present = page.getByRole('button', { name: 'Modo apresentação' });
  await present.click();
  const pres = page.getByTestId('presentation');
  await expect(pres).toBeVisible();
  // O viewport ocupa a janela inteira e os painéis somem.
  const vp = page.viewportSize()!;
  const cb = (await canvas.boundingBox())!;
  expect(cb.width).toBeGreaterThan(vp.width * 0.95);
  expect(cb.height).toBeGreaterThan(vp.height * 0.95);
  await expect(page.getByRole('button', { name: 'Aproximar' })).toHaveCount(0);
  await expect(pres.getByText('Modelo educacional simplificado', { exact: true })).toBeVisible();

  const counter = page.getByTestId('presentation-counter');
  const caption = page.getByTestId('presentation-caption');
  await expect(counter).toHaveText('1/15');
  const first = await caption.textContent();
  await page.waitForTimeout(800);
  const shot1 = await canvas.screenshot();
  await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText('2/15');
  expect(await caption.textContent()).not.toBe(first);
  await page.waitForTimeout(2500);
  expect(await imageDiff(page, shot1, await canvas.screenshot())).toBeGreaterThan(0.01);

  // Tomada com etapa da desmontagem: a peça se move durante a tomada. Olha o estado do motor, não o relógio: com WebGL por
  // software, só a captura do canvas já leva segundos, e a animação pode acabar antes da primeira foto.
  for (let k = 0; k < 3; k++) await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText('5/15');
  await page.waitForFunction(() => window.__presentation?.animating() === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => window.__presentation?.animating() === false, null, { timeout: 30_000 });

  await page.keyboard.press('c');
  await expect(caption).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(pres).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Aproximar' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('modo gravação: sem controles, começa sozinho e publica a linha do tempo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/centrifugal-pump/apresentacao/gravacao');
  await waitFor3D(page);
  await page.waitForFunction(() => window.__presentation?.ready === true, null, { timeout: 60_000 });
  const info = await page.evaluate(() => ({ total: window.__presentation!.total, n: window.__presentation!.timeline.length }));
  expect(info.n).toBe(15);
  expect(info.total).toBeGreaterThan(60);
  await expect(page.getByTestId('presentation-play')).toBeHidden();
  await expect(page.getByTestId('presentation-caption')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('vista técnica (ortográfica) e restaurar montagem no modo livre', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/centrifugal-pump');
  await waitFor3D(page);
  await page.waitForTimeout(1000);
  const canvas = page.locator('canvas').first();
  const before = await canvas.screenshot();
  const ortho = page.getByRole('button', { name: 'Vista técnica (sem perspectiva)' });
  await ortho.click();
  await expect(ortho).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(800);
  expect(await imageDiff(page, before, await canvas.screenshot())).toBeGreaterThan(0.005);
  // Zoom continua funcionando na ortográfica.
  const o1 = await canvas.screenshot();
  await page.getByRole('button', { name: 'Aproximar' }).click();
  await page.waitForTimeout(800);
  expect(await imageDiff(page, o1, await canvas.screenshot())).toBeGreaterThan(0.005);

  await page.getByRole('tab', { name: 'Exploração livre' }).click();
  const aside = page.getByRole('complementary', { name: 'Painel do laboratório' });
  const group = aside.getByRole('button', { name: /^Fixação/ });
  await group.click();
  await expect(group).toHaveAttribute('aria-pressed', 'false');
  await expect(aside.getByRole('button', { name: 'Mostrar: Parafusos da carcaça' })).toBeVisible();
  await aside.getByTestId('free-reset').click();
  await expect(group).toHaveAttribute('aria-pressed', 'true');
  await expect(ortho).toHaveAttribute('aria-pressed', 'false');

  // Ficha da peça: onde fica, inspeção, manutenção e referências.
  await aside.getByRole('button', { name: 'Rotor', exact: true }).click();
  await expect(aside.getByText('Onde fica', { exact: true })).toBeVisible();
  await expect(aside.getByText('O que inspecionar', { exact: true })).toBeVisible();
  await expect(aside.getByText('Manutenção', { exact: true })).toBeVisible();
  await aside.getByRole('button', { name: 'Detalhes técnicos' }).click();
  await expect(aside.getByText('Referências do texto')).toBeVisible();
  expect(errors).toEqual([]);
});

test('bomba: usa o .glb do pipeline Blender e cai no modelo procedural se o download falhar', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/pumps/centrifugal-pump-v2.glb'));
  await page.goto('/#/lab/centrifugal-pump');
  expect((await glb).status()).toBe(200);
  await waitFor3D(page);
  await page.waitForTimeout(1500);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);
  // Peças do .glb continuam selecionáveis pela lista (mesmos IDs do modelo procedural)
  await page.getByRole('tab', { name: 'Exploração livre' }).click();
  const aside = page.getByRole('complementary', { name: 'Painel do laboratório' });
  await aside.getByRole('button', { name: 'Rotor', exact: true }).click();
  await expect(aside.getByText('Onde fica', { exact: true })).toBeVisible();
  // Agora o modelo em operação existe para a bomba
  await expect(page.getByRole('button', { name: /Ver girando/ })).toBeVisible();
  expect(errors).toEqual([]);

  // Sem o .glb: o laboratório não mostra erro, só usa o modelo gerado no navegador
  const page2 = await page.context().newPage();
  const errors2 = collectErrors(page2);
  await page2.route('**/centrifugal-pump-v2.glb', (r) => r.fulfill({ status: 404, body: '' }));
  await page2.goto('/#/lab/centrifugal-pump');
  await waitFor3D(page2);
  await page2.waitForTimeout(1500);
  expect(await litRatio(page2, 'canvas')).toBeGreaterThan(0.05);
  await expect(page2.getByText(/Não foi possível baixar o modelo 3D/)).toHaveCount(0);
  expect(errors2.filter((e) => !/centrifugal-pump-v2\.glb|404/.test(e))).toEqual([]);
  await page2.close();
});

test('bomba: filme renderizado aparece na etapa "Conhecer" e some sem o manifesto', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/lab/centrifugal-pump');
  const film = page.getByTestId('rendered-film');
  await expect(film).toBeVisible();
  await expect(film.locator('summary')).toContainText('Filme da desmontagem');
  // Não baixa o vídeo antes do play
  const video = film.locator('video');
  await expect(video).toHaveAttribute('preload', 'none');
  await film.locator('summary').click();
  await expect(film.getByRole('link', { name: 'Giro 360°' })).toBeVisible();
  const src = await film.locator('source').getAttribute('src');
  expect((await page.request.head(src!)).status()).toBe(200);
  const vtt = await page.request.get((await film.locator('track').getAttribute('src'))!);
  expect(await vtt.text()).toMatch(/^WEBVTT/);
  expect(errors).toEqual([]);

  // Sem filme.json (projeto sem os vídeos): o painel não aparece e nada quebra
  const page2 = await page.context().newPage();
  const errors2 = collectErrors(page2);
  await page2.route('**/filme.json', (r) => r.fulfill({ status: 404, body: '' }));
  await page2.goto('/#/lab/centrifugal-pump');
  await expect(page2.getByRole('button', { name: 'Explorar em 3D' })).toBeVisible();
  await expect(page2.getByTestId('rendered-film')).toHaveCount(0);
  expect(errors2.filter((e) => !/filme\.json|404/.test(e))).toEqual([]);
  await page2.close();
});
