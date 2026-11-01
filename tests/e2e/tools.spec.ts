import { test, expect } from '@playwright/test';
import { withProfile, collectErrors, readProfile, litRatio } from './helpers';
import { MECHANICAL_TOOLS_CATALOG, TOOL_SELECTION_SCENARIOS } from '../../src/data/mechanicalToolsData';

test('biblioteca: a aba Desenho mostra o esquema; verificação marca como estudada e persiste', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  // todas as ferramentas do catálogo têm modelo 3D; o esquema 2D continua na aba "Desenho"
  const id = 'relogio-comparador';
  await page.goto(`/#/ferramentas/${id}`);
  const tool = MECHANICAL_TOOLS_CATALOG.find((t) => t.id === id)!;

  await expect(page.getByRole('heading', { name: tool.name })).toBeVisible();
  await page.getByRole('tab', { name: 'Desenho' }).click();
  await expect(page.getByRole('img', { name: /Desenho esquemático/ })).toBeVisible();

  const wrong = tool.knowledgeQuestion.options.find((o) => !o.isCorrect)!;
  const right = tool.knowledgeQuestion.options.find((o) => o.isCorrect)!;
  await page.getByRole('button', { name: wrong.text }).click();
  await expect(page.getByRole('status')).toContainText('Ainda não');
  await page.getByRole('button', { name: right.text }).click();
  await expect(page.getByText('Estudada', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText('Estudada', { exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Biblioteca/ })).toContainText(`1/${MECHANICAL_TOOLS_CATALOG.length}`);
  expect((await readProfile(page)).masteredTools).toContain(id);
  expect(errors).toEqual([]);
});

test('ferramenta com modelo 3D carrega o visualizador', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/ferramentas/chave-combinada');
  await expect(page.getByRole('tab', { name: 'Modelo 3D' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
});

test('qual ferramenta usar: erro dá dica, acerto avança e fica salvo', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/ferramentas');
  await page.getByRole('tab', { name: /Qual ferramenta usar/ }).click();
  const sc = TOOL_SELECTION_SCENARIOS[0];
  const right = MECHANICAL_TOOLS_CATALOG.find((t) => t.id === sc.correctToolId)!;
  const wrong = MECHANICAL_TOOLS_CATALOG.find((t) => t.id !== sc.correctToolId)!;
  await page.getByRole('button', { name: wrong.name, exact: true }).click();
  await expect(page.getByRole('status')).toContainText('não é a melhor');
  await page.getByRole('button', { name: right.name, exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Boa escolha');
  await expect(page.getByRole('button', { name: 'Próxima situação' })).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: /Qual ferramenta usar/ }).click();
  await expect(page.getByRole('tab', { name: /Qual ferramenta usar/ })).toContainText(`1/${TOOL_SELECTION_SCENARIOS.length}`);
});

test('paquímetro: a leitura fica escondida até responder; erro permite tentar de novo', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/ferramentas');
  await page.getByRole('tab', { name: /Ler o paquímetro/ }).click();
  await expect(page.getByRole('heading', { name: 'Largura de uma chaveta paralela' })).toBeVisible();
  await expect(page.getByText(/^3\. Leitura:/)).toHaveCount(0);

  await page.getByRole('button', { name: '8,50 mm' }).click();
  await expect(page.getByRole('status')).toContainText('Ainda não');
  await expect(page.getByText(/^3\. Leitura:/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.getByRole('button', { name: '8,00 mm' }).click();
  await expect(page.getByRole('status')).toContainText('Leitura certa');
  await expect(page.getByText(/^3\. Leitura:/)).toContainText('8,00 mm');

  await page.reload();
  await page.getByRole('tab', { name: /Ler o paquímetro/ }).click();
  await expect(page.getByRole('tab', { name: /Ler o paquímetro/ })).toContainText('1/4');
});

test('micrômetro: erro mostra dica, acerto explica a leitura e fica salvo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  await page.goto('/#/ferramentas/treino-micrometro');
  await expect(page.getByRole('tab', { name: /Ler o micrômetro/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Diâmetro de um pino-guia' })).toBeVisible();
  await page.getByRole('button', { name: '7,88 mm' }).click();
  await expect(page.getByRole('status')).toContainText('meio milímetro');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.getByRole('button', { name: '7,38 mm' }).click();
  await expect(page.getByRole('status')).toContainText('Leitura: 7 + 0,00 + 0,38 = 7,38 mm');
  await expect(page.getByRole('tab', { name: /Ler o micrômetro/ })).toContainText('1/4');
  expect((await readProfile(page)).completedTasks).toContain('task-micrometer-micro-pino');
  expect(errors).toEqual([]);
});

test('paquímetro e micrômetro têm modelo 3D gerado no projeto', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  for (const id of ['paquimetro', 'micrometro']) {
    await page.goto(`/#/ferramentas/${id}`);
    await expect(page.getByRole('tab', { name: 'Modelo 3D' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('canvas')).toHaveCount(1);
    await page.waitForTimeout(1500);
    expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);
  }
  expect(errors).toEqual([]);
});

test('chave de boca (modelo do pipeline Blender): .glb comprimido carrega e o clique no 3D seleciona a peça', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/chave-boca.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/chave-boca');
  expect((await glb).status()).toBe(200);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.08);

  const canvas = page.locator('canvas').first();
  const box = (await canvas.boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  // Começa na primeira peça; clicar na cabeça direita (19 mm) e depois no cabo troca a seleção.
  await expect(part(/Mandíbula Menor/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.56);
  await expect(part(/Mandíbula Maior/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(part(/Corpo/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('chave combinada (modelo do pipeline Blender): olhal inclinado carrega e o clique seleciona as peças', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/chave-combinada.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/chave-combinada');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.08);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.84, box.y + box.height * 0.49);
  await expect(part(/Anel Estriado/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.46);
  await expect(part(/Corpo em Aço/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('chave Allen (modelo do pipeline Blender): carrega e o clique seleciona braço longo e braço curto', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/chave-allen.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/chave-allen');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.03);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.71);
  await expect(part(/Haste Longa/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.19, box.y + box.height * 0.45);
  await expect(part(/Braço Curto/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('chave estrela (modelo do pipeline Blender): carrega em 3D e o clique seleciona anel e cotovelo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/chave-estrela.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/chave-estrela');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.885, box.y + box.height * 0.43);
  await expect(part(/Anel estriado de 19/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.545);
  await expect(part(/Corpo com cotovelo/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('chaves de fenda e Phillips (modelo do pipeline Blender): carrega e o clique seleciona haste e cabo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/chave-fenda-phillips.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/chave-fenda-phillips');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.607);
  await expect(part(/Haste/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.6);
  await expect(part(/Cabo/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('alicate universal (modelo do pipeline Blender): carrega e o clique seleciona articulação e cabos', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/alicate-universal.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/alicate-universal');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.685, box.y + box.height * 0.46);
  await expect(part(/Articulação/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.6);
  await expect(part(/Cabos/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('chave inglesa (modelo do pipeline Blender): carrega e o clique seleciona sem-fim e cabo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/chave-inglesa.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/chave-inglesa');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.775, box.y + box.height * 0.6);
  await expect(part(/Sem-Fim/i)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.47);
  await expect(part(/Cabo Forjado/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('soquete e catraca (modelo do pipeline Blender): carrega e o clique seleciona soquete e cabo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/soquete-catraca.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/soquete-catraca');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.81, box.y + box.height * 0.6);
  await expect(part(/Soquete Sextavado 19 mm \(Cromo/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.35);
  await expect(part(/Empunhadura/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('torquímetro (modelo do pipeline Blender): carrega e o clique seleciona cabeça, escala e punho', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/torquimetro.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/torquimetro');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.87, box.y + box.height * 0.48);
  await expect(part(/Cabeça Catraca/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(part(/Visor Graduado/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.48);
  await expect(part(/Punho Recartilhado/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('martelo de face macia (modelo do pipeline Blender): carrega e o clique seleciona face, cabeça e cabo', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/martelo-face-macia.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/martelo-face-macia');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.71);
  await expect(part(/Face macia/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.825, box.y + box.height * 0.5);
  await expect(part(/Corpo da cabeça/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.5);
  await expect(part(/^\d*\.?\s*Cabo$/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('alicate de anéis (modelo do pipeline Blender): carrega e o clique seleciona pontas, articulação e cabos', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/alicate-aneis.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/alicate-aneis');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.76, box.y + box.height * 0.5);
  await expect(part(/Pontas/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.47);
  await expect(part(/Articulação e mola/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.65);
  await expect(part(/^\d*\.?\s*Cabos/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('saca-polias (modelo do pipeline Blender): carrega e o clique seleciona fuso, cruzeta e garras', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const glb = page.waitForResponse((r) => r.url().endsWith('/assets/models/tools/saca-polias.glb'), { timeout: 60_000 });
  await page.goto('/#/ferramentas/saca-polias');
  expect((await glb).status()).toBe(200);
  await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
  await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
  expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);

  const box = (await page.locator('canvas').first().boundingBox())!;
  const part = (name: RegExp) => page.getByRole('button', { name });
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3);
  await expect(part(/Fuso Central/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.42, box.y + box.height * 0.45);
  await expect(part(/Cruzeta/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.415, box.y + box.height * 0.72);
  await expect(part(/Garras Forjadas/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('extrator de rolamentos e relógio comparador (pipeline Blender): carregam e o clique seleciona as peças', async ({ page }) => {
  const errors = collectErrors(page);
  await withProfile(page);
  const part = (name: RegExp) => page.getByRole('button', { name });
  const open = async (id: string) => {
    const glb = page.waitForResponse((r) => r.url().endsWith(`/assets/models/tools/${id}.glb`), { timeout: 60_000 });
    await page.goto(`/#/ferramentas/${id}`);
    expect((await glb).status()).toBe(200);
    await expect(page.getByText('Carregando modelo 3D…')).toHaveCount(0, { timeout: 60_000 });
    await expect(page.getByText('Não foi possível carregar o modelo 3D')).toHaveCount(0);
    expect(await litRatio(page, 'canvas')).toBeGreaterThan(0.05);
    return (await page.locator('canvas').first().boundingBox())!;
  };

  let box = await open('extrator-rolamentos');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(part(/Fuso central/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.42, box.y + box.height * 0.27);
  await expect(part(/Ponte e tirantes/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.78);
  await expect(part(/Placa separadora/)).toHaveAttribute('aria-pressed', 'true');

  box = await open('relogio-comparador');
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.25);
  await expect(part(/Mostrador/)).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.75);
  await expect(part(/Base Magnética com Chave/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});
