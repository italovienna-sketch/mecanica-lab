import { test, expect, Page } from '@playwright/test';
import { collectErrors, expectNoHorizontalScroll, readProfile, withProfile } from './helpers';
import { ASSESSMENT_CASES, AssessmentAnswers, DISASSEMBLY_PARTS, DISASSEMBLY_RULES, assessmentCaseFor, scoreAssessment } from '../../src/data/journey/assessment';
import { BENCH_PARTS, BENCH_VARIANTS, RELEASE_SEQUENCE, RETURN_SEQUENCE, startupOutcome } from '../../src/data/journey/bench';
import { EMPTY_JOURNEY } from '../../src/data/journey/meta';
import { MISSIONS, MISSIONS_BY_ID, missionStatus, recommend } from '../../src/data/journey/missions';
import { nextCardState } from '../../src/data/journey/state';
import { decodeCourseConfig, encodeCourseConfig, normalizeCourseConfig } from '../../src/data/journey/courseConfig';
import { PART_REGIONS, FLOW_ORDER } from '../../src/data/journey/pumpSection';
import { REVIEW_CARDS } from '../../src/data/journey/review';
import { SHAPES, VIEW_LABEL, ViewId, gridKey, sectionOptions, viewGrid, viewOptions } from '../../src/data/drawing/voxel';
import { SECTION_QUESTIONS, TOLERANCE_CHECKS, VIEW_QUESTIONS } from '../../src/data/drawing/benches';
import { LIBRARY_ENTRIES } from '../../src/data/library';
import { classReport } from '../../src/data/journey/classReport';
import { CENTRIFUGAL_PUMP_MACHINE } from '../../src/data/mechanicalMachines';
import { PUMP_LAB } from '../../src/data/centrifugalPumpLab';
import type { PlayerProfile } from '../../src/types/game';

const base = (over: Partial<PlayerProfile> = {}) =>
  ({ labMissionStages: {}, microLessons: {}, journey: EMPTY_JOURNEY, practiceSessions: [], completedMissions: [], ...over }) as unknown as PlayerProfile;

/** Perfil que já tem as missões até `upTo` (exclusive) concluídas. */
const journeyUpTo = (upTo: number) => {
  const missions: Record<string, { steps: string[]; completedAt?: number }> = {};
  const lab = new Set<string>();
  const micro: Record<string, { completedAt: number }> = {};
  MISSIONS.slice(0, upTo).forEach((m) => {
    missions[m.id] = { steps: m.steps.filter((s) => !s.optional).map((s) => s.id), completedAt: 1 };
    m.steps.forEach((s) => {
      if (s.labStage) lab.add(s.labStage);
      if (s.microId) micro[s.microId] = { completedAt: 1 };
    });
  });
  return { journey: { ...EMPTY_JOURNEY, missions }, labMissionStages: { 'centrifugal-pump': [...lab] }, microLessons: micro, completedMissions: MISSIONS.slice(0, upTo).map((m) => m.id) };
};

const perfect = (i: number): AssessmentAnswers => {
  const c = ASSESSMENT_CASES[i];
  const inRange = c.measure.reading >= c.measure.min && c.measure.reading <= c.measure.max;
  const bench: AssessmentAnswers['bench'] = {};
  c.benchParts.forEach(({ part, condition }) => {
    const decision = (['reaproveitar', 'recondicionar', 'trocar'] as const).find((d) => condition.decisions[d].grade === 'certo')!;
    bench[part] = { finding: condition.findingId, decision };
  });
  return {
    releaseOrder: [],
    releaseErrors: 0,
    symptoms: c.symptoms.filter((s) => s.relevant).map((s) => s.id),
    tests: c.tests.filter((t) => t.value === 'chave').map((t) => t.id),
    discarded: c.hypotheses.filter((h) => h.discard).map((h) => h.id),
    cause: c.causeId,
    action: c.actions.find((a) => a.grade === 2)!.id,
    disassembly: DISASSEMBLY_PARTS,
    bench,
    drawingPick: c.drawingPrompt.part,
    measureOk: inRange
  };
};

test.describe('lógica da jornada', () => {
  test('as peças usadas nas atividades existem no modelo 3D', () => {
    const ids = new Set(CENTRIFUGAL_PUMP_MACHINE.parts.map((p) => p.id));
    PART_REGIONS.forEach((r) => expect(ids, r.id).toContain(r.id));
    DISASSEMBLY_PARTS.forEach((id) => expect(ids, id).toContain(id));
    expect(FLOW_ORDER).toHaveLength(5);
  });

  test('a ordem válida do laboratório respeita as regras da prova', () => {
    const order = PUMP_LAB.disassembly.map((s) => s.partId);
    DISASSEMBLY_RULES.forEach((r) => expect(order.indexOf(r.before), `${r.before} antes de ${r.after}`).toBeLessThan(order.indexOf(r.after)));
    DISASSEMBLY_RULES.forEach((r) => expect(DISASSEMBLY_PARTS.indexOf(r.before)).toBeLessThan(DISASSEMBLY_PARTS.indexOf(r.after)));
  });

  test('prova: respostas ideais passam com 100 e a nota é determinística', () => {
    ASSESSMENT_CASES.forEach((_, i) => {
      const r = scoreAssessment(ASSESSMENT_CASES[i], perfect(i), 70);
      expect(r.critical).toBe(false);
      expect(r.passed, `caso ${i}: ${JSON.stringify(r.criteria)}`).toBe(true);
      Object.values(r.criteria).forEach((v) => expect(v).toBe(100));
      expect(scoreAssessment(ASSESSMENT_CASES[i], perfect(i), 70)).toEqual(r);
    });
  });

  test('prova: decisão insegura reprova mesmo com o resto perfeito', () => {
    const c = ASSESSMENT_CASES[0];
    const unsafeTest = { ...perfect(0), tests: [...perfect(0).tests, 'mao-girando'] };
    const a = scoreAssessment(c, unsafeTest, 70);
    expect(a.critical).toBe(true);
    expect(a.passed).toBe(false);
    expect(a.criteria.seguranca).toBe(0);
    const unsafeAction = { ...perfect(0), action: c.actions.find((x) => x.grade === -1)!.id };
    expect(scoreAssessment(c, unsafeAction, 70).passed).toBe(false);
  });

  test('prova: há mais de uma ação aceitável, com nota menor, e cada caso cabe no orçamento de testes', () => {
    ASSESSMENT_CASES.forEach((c, i) => {
      expect(c.actions.filter((a) => a.grade === 2)).toHaveLength(1);
      expect(c.actions.filter((a) => a.grade === 1).length).toBeGreaterThan(0);
      expect(c.hypotheses.find((h) => h.id === c.causeId)?.discard).toBe(false);
      expect(c.tests.filter((t) => t.value === 'chave').length).toBeLessThanOrEqual(c.testBudget);
      const ok = scoreAssessment(c, { ...perfect(i), action: c.actions.find((a) => a.grade === 1)!.id }, 70);
      expect(ok.criteria.diagnostico).toBeLessThan(100);
      expect(ok.criteria.diagnostico).toBeGreaterThanOrEqual(70);
    });
  });

  test('prova: outra tentativa traz outro caso', () => {
    expect(new Set([0, 1, 2].map((n) => assessmentCaseFor(n).id)).size).toBe(3);
    expect(assessmentCaseFor(3).id).toBe(assessmentCaseFor(0).id);
  });

  test('bancada: decisão perigosa aparece na partida e a decisão certa passa em todos os lotes', () => {
    BENCH_VARIANTS.forEach((v) => {
      const best = Object.fromEntries(BENCH_PARTS.map((p) => [p.id, (['reaproveitar', 'recondicionar', 'trocar'] as const).find((d) => v.parts[p.id].decisions[d].grade === 'certo')!]));
      expect(startupOutcome(v, best).healthy, `lote ${v.id}`).toBe(true);
      const bad = Object.fromEntries(BENCH_PARTS.map((p) => [p.id, (['reaproveitar', 'recondicionar', 'trocar'] as const).find((d) => v.parts[p.id].decisions[d].grade === 'perigoso') ?? best[p.id]]));
      expect(startupOutcome(v, bad).healthy, `lote ${v.id}`).toBe(false);
    });
  });

  test('revisão espaçada: acerto afasta, erro traz de volta para amanhã', () => {
    const now = 1_000_000_000_000;
    const day = 86_400_000;
    let c = nextCardState(undefined, true, now);
    expect(c.box).toBe(1);
    c = nextCardState(c, true, now);
    expect(c.dueAt).toBe(now + 7 * day);
    const lapse = nextCardState(c, false, now);
    expect(lapse.box).toBe(0);
    expect(lapse.dueAt).toBe(now + day);
    expect(lapse.lapses).toBe(1);
  });

  test('progressão: etapa só conta com evidência; quem pula não avança', () => {
    const empty = base();
    expect(missionStatus(MISSIONS[0], empty)).toBe('disponivel');
    expect(missionStatus(MISSIONS[2], empty)).toBe('bloqueada');
    // Etapa de vídeo opcional não libera nada.
    const onlyVideo = base({ journey: { ...EMPTY_JOURNEY, missions: { 'os-01': { steps: ['video-funcionamento'] } } } });
    expect(missionStatus(MISSIONS[0], onlyVideo)).toBe('disponivel');
    // Missão oculta pelo instrutor não trava a seguinte.
    const allFirst = base(journeyUpTo(1) as unknown as Partial<PlayerProfile>);
    expect(missionStatus(MISSIONS[2], allFirst, { hiddenMissions: ['os-02'] })).toBe('disponivel');
  });

  test('recomendação: segurança, depois revisão, depois a missão; sempre com o motivo', () => {
    const p = base();
    const safety = recommend(p, { dueCards: 9, openMistakes: 0, nextSafetyMicro: { id: 'a', title: 'A', done: 0, total: 10 } });
    expect(safety.id).toBe('seguranca');
    expect(recommend(p, { dueCards: 3, openMistakes: 0 }).id).toBe('revisao');
    const next = recommend(p, { dueCards: 2, openMistakes: 0 });
    expect(next.id).toBe('missao');
    expect(next.param).toBe('os-01');
    expect(next.why.length).toBeGreaterThan(10);
    const failed = base({ journey: { ...EMPTY_JOURNEY, assessmentRuns: [{ at: 1, variant: 0, criteria: { seguranca: 0, diagnostico: 0, procedimento: 0, inspecao: 0 }, passed: false, critical: true }] } });
    expect(recommend(failed, { dueCards: 1, openMistakes: 0 }).id).toBe('reforco');
  });

  test('cartões: cada alternativa errada tem explicação', () => {
    REVIEW_CARDS.forEach((c) => {
      expect(c.explanation.length, c.id).toBeGreaterThan(10);
      if (c.options) expect(c.traps?.length ?? 0, c.id).toBe(c.options.length - 1);
      else expect(c.spot, c.id).toBeTruthy();
    });
  });

  test('link de turma: ida e volta preserva; conteúdo adulterado é saneado', () => {
    const cfg = normalizeCourseConfig({ hiddenMissions: ['os-02', 'hack'], passScore: 999, note: 'Olá, turma ção', customCards: [{ prompt: 'P?', options: ['a', 'b'] }, { prompt: '', options: [] }] });
    expect(cfg.hiddenMissions).toEqual(['os-02']);
    expect(cfg.passScore).toBe(90);
    expect(cfg.customCards).toHaveLength(1);
    expect(decodeCourseConfig(encodeCourseConfig(cfg))).toEqual(cfg);
    expect(decodeCourseConfig('@@nao-e-base64')).toBeNull();
  });

  test('desenho: vistas e seções têm alternativas diferentes entre si e uma só certa', () => {
    VIEW_QUESTIONS.forEach((q) => {
      const s = SHAPES.find((x) => x.id === q.shape)!;
      const o = viewOptions(s, q.view);
      expect(o.length, `${q.shape}/${q.view}`).toBeGreaterThanOrEqual(3);
      expect(new Set(o.map((x) => gridKey(x.grid))).size).toBe(o.length);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
    });
    SECTION_QUESTIONS.forEach((q) => {
      const s = SHAPES.find((x) => x.id === q.shape)!;
      const o = sectionOptions(s, q.plane);
      expect(o.length, `${q.shape}/${q.plane}`).toBeGreaterThanOrEqual(3);
      expect(new Set(o.map((x) => gridKey(x.grid))).size).toBe(o.length);
    });
  });

  test('desenho: as vistas saem na orientação da folha', () => {
    const s = SHAPES.find((x) => x.id === 'degrau')!;
    const rows = (v: ViewId) => viewGrid(s, v).map((r) => r.map((c) => (c === null ? '.' : '#')).join(''));
    expect(rows('frontal')).toEqual(['#...', '##..', '####']);
    // Lateral esquerda: a peça é alta do lado esquerdo, então a vista é cheia.
    expect(rows('lateral')).toEqual(['###', '###', '###']);
    expect(rows('superior')).toEqual(['####', '####', '####']);
    expect(VIEW_LABEL.superior).toBe('Vista superior');
  });

  test('tolerâncias: limites do exercício batem com h6 e H7 de 25 mm', () => {
    const h6 = TOLERANCE_CHECKS.filter((c) => c.callout === 'Ø 25 h6');
    h6.forEach((c) => expect([c.min, c.max]).toEqual([24.987, 25]));
    const h7 = TOLERANCE_CHECKS.filter((c) => c.callout === 'Ø 25 H7');
    h7.forEach((c) => expect([c.min, c.max]).toEqual([25, 25.021]));
  });

  test('biblioteca: nenhuma ficha vazia, e toda ficha leva a uma atividade', () => {
    expect(LIBRARY_ENTRIES.length).toBeGreaterThanOrEqual(5);
    LIBRARY_ENTRIES.forEach((e) => {
      expect(e.parts.length, e.id).toBeGreaterThan(0);
      expect(e.summary.length, e.id).toBeGreaterThan(10);
      expect(e.actions.length, e.id).toBeGreaterThan(0);
    });
  });

  test('relatório da turma agrega erros e competências sem misturar alunos', () => {
    const a = base({ ...(journeyUpTo(2) as unknown as Partial<PlayerProfile>), name: 'Ana', masteredTools: [], completedTasks: [], gameResults: {}, skillStats: {} });
    const b = base({
      name: 'Bia',
      masteredTools: [],
      completedTasks: [],
      gameResults: {},
      skillStats: {},
      journey: {
        ...EMPTY_JOURNEY,
        mistakes: [{ id: 'mx-1', at: 1, area: 'x', skill: 'seguranca', text: 'Pulou o bloqueio', why: 'Porque sim', count: 2 }]
      }
    });
    const r = classReport([{ file: 'a.json', profile: a }, { file: 'b.json', profile: b }], 70);
    expect(r.rows.map((x) => x.name)).toEqual(['Ana', 'Bia']);
    expect(r.rows[0].missions.filter((m) => m.complete)).toHaveLength(2);
    expect(r.mistakes[0]).toMatchObject({ text: 'Pulou o bloqueio', students: 1 });
  });
});

// As regiões têm formatos vazados: o centro da caixa pode cair em outra peça. O clique vai direto na região.
const clickSpot = (page: Page, id: string) => page.locator(`[data-spot="${id}"]`).dispatchEvent('click');

test.describe('telas da jornada', () => {
  test('Início responde às cinco perguntas e aponta o motivo', async ({ page }) => {
    const errors = collectErrors(page);
    await withProfile(page, journeyUpTo(1));
    await page.goto('/#/');
    await expect(page.getByRole('heading', { name: 'Olá, Aluno!' })).toBeVisible();
    await expect(page.getByText('Por que agora:')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Você está aprendendo/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'O que você já demonstrou' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Onde está mais difícil' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'O que abre em seguida' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('OS-01: caminho do líquido com retorno explicado e etapa só depois de demonstrar', async ({ page }) => {
    const errors = collectErrors(page);
    await withProfile(page);
    await page.goto('/#/missoes');
    // Primeira tela da rodada: em máquina lenta o carregamento passa do tempo padrão de um expect.
    await expect(page.getByRole('heading', { name: 'Missões da bomba P-101' })).toBeVisible({ timeout: 90_000 });
    await expect(page.locator('[data-mission="os-03"]')).toBeDisabled();
    await page.locator('[data-mission="os-01"]').click();
    await page.locator('[data-step="caminho"]').click();
    await clickSpot(page, 'volute');
    await expect(page.getByRole('status').filter({ hasText: 'ainda não chegou' })).toBeVisible();
    let p = await readProfile(page);
    expect(p.journey.missions['os-01']?.steps ?? []).not.toContain('caminho');
    expect(p.journey.mistakes[0].why).toContain('sucção');
    for (const id of FLOW_ORDER) await clickSpot(page, id);
    await expect(page.getByTestId('flow-line')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();
    p = await readProfile(page);
    expect(p.journey.missions['os-01'].steps).toContain('caminho');
    await expect(page.getByRole('heading', { name: 'Aponte no corte' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('rota de missão bloqueada explica o que falta', async ({ page }) => {
    await withProfile(page);
    await page.goto('/#/missoes/os-04');
    await expect(page.getByText('OS-04 ainda não foi aberta')).toBeVisible();
    await expect(page.getByText(/O que falta:/)).toBeVisible();
  });

  test('OS-04 e OS-05: decisão ruim na bancada aparece na partida e pode ser corrigida', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    const v = BENCH_VARIANTS[0];
    const seed = journeyUpTo(3);
    (seed.journey.missions as Record<string, { steps: string[] }>)['os-04'] = { steps: ['aquecimento'] };
    (seed.journey.missions as Record<string, { steps: string[] }>)['os-05'] = { steps: ['aquecimento', 'erros-montagem'] };
    seed.labMissionStages['centrifugal-pump'].push('montar');
    await withProfile(page, seed);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/missoes/os-04');
    await page.locator('[data-step="bancada"]').click();
    for (const part of BENCH_PARTS) {
      const label = part.findings.find((f) => f.id === v.parts[part.id].findingId)!.label;
      await page.getByLabel(label).check();
      await page.getByRole('button', { name: 'Confirmar o achado' }).click();
      await page.locator('[data-decision="reaproveitar"]').click();
    }
    await expect(page.getByRole('heading', { name: 'Laudo de inspeção' })).toBeVisible();
    await page.getByRole('button', { name: 'Enviar para a montagem' }).click();
    const p = await readProfile(page);
    expect(p.journey.benchRuns).toHaveLength(1);

    await page.evaluate(() => (window.location.hash = '#/missoes/os-05'));
    await page.locator('[data-step="partida"]').click();
    // Fora de ordem o passo é recusado com explicação, então aqui a sequência vai na ordem das dependências.
    for (const s of RETURN_SEQUENCE) await page.locator(`[data-seq="${s.id}"]`).click();
    const outcome = startupOutcome(v, Object.fromEntries(BENCH_PARTS.map((b) => [b.id, 'reaproveitar'])));
    expect(outcome.healthy).toBe(false);
    await page.getByTestId('startup-stop').click();
    await expect(page.getByText('Boa decisão: você parou uma bomba com problema.')).toBeVisible();
    for (const part of BENCH_PARTS) {
      const d = (['reaproveitar', 'recondicionar', 'trocar'] as const).find((x) => v.parts[part.id].decisions[x].grade === 'certo')!;
      await page.locator(`[data-part-decision="${part.id}:${d}"]`).click();
    }
    await page.getByRole('button', { name: 'Rodar o teste de novo' }).click();
    await page.getByTestId('startup-release').click();
    await expect(page.getByText('Bomba liberada, com os instrumentos dentro da faixa.')).toBeVisible();
    await page.getByRole('button', { name: 'Encerrar a OS' }).click();
    expect((await readProfile(page)).journey.missions['os-05'].steps).toContain('partida');
    expect(errors).toEqual([]);
  });

  test('avaliação: sem retorno durante a prova; relatório por critério e novo caso', async ({ page }) => {
    test.setTimeout(120_000);
    await withProfile(page, journeyUpTo(5));
    await page.goto('/#/missoes/os-06');
    await page.locator('[data-step="avaliacao"]').click();
    const c = ASSESSMENT_CASES[0];
    await expect(page.getByText(c.chamado)).toBeVisible();
    for (let i = 0; i < RELEASE_SEQUENCE.length; i++) await page.locator('[data-seq]:not([disabled])').first().click();
    await page.getByLabel(c.symptoms[0].label).check();
    await page.getByRole('button', { name: 'Avançar' }).click();
    // Teste inseguro: fica registrado, sem aviso na hora.
    await page.getByLabel('Tirar a proteção do acoplamento').check();
    await expect(page.getByRole('status').filter({ hasText: 'Errado' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Avançar' }).click();
    await page.getByRole('radio', { name: 'Cavitação' }).check();
    await page.getByRole('button', { name: 'Avançar' }).click();
    await page.getByLabel(c.actions[2].label).check();
    await page.getByRole('button', { name: 'Avançar' }).click();
    await page.getByRole('button', { name: 'Avançar' }).click();
    for (const { part, condition } of c.benchParts) {
      const info = BENCH_PARTS.find((b) => b.id === part)!;
      await page.getByRole('radio', { name: info.findings.find((f) => f.id === condition.findingId)!.label }).check();
      await page.getByRole('group', { name: `Destino: ${info.name}` }).getByRole('button', { name: 'Trocar' }).click();
    }
    await page.getByRole('button', { name: 'Avançar' }).click();
    await page.getByRole('button', { name: 'Fora da tolerância' }).click();
    await clickSpot(page, 'pump-coupling-hub');
    await page.getByRole('button', { name: 'Entregar a avaliação' }).click();
    await expect(page.getByTestId('assessment-result')).toHaveAttribute('data-passed', 'false');
    await expect(page.getByText('Não aprovado: houve decisão insegura.')).toBeVisible();
    await expect(page.locator('[data-criterion="seguranca"]')).toContainText('0');
    const p = await readProfile(page);
    expect(p.journey.assessmentRuns[0].critical).toBe(true);
    await page.getByRole('button', { name: 'Novo caso' }).click();
    await expect(page.getByText(ASSESSMENT_CASES[1].chamado)).toBeVisible();
  });

  test('conferência 3D tem alternativa por lista', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);
    await withProfile(page, { ...journeyUpTo(4), labMissionStages: { 'centrifugal-pump': ['conhecer', 'explorar', 'identificar', 'desmontar', 'montar'] } });
    await page.goto('/#/missoes/os-05');
    await page.locator('[data-step="erros-montagem"]').click();
    await expect(page.getByTestId('part3d-stage').or(page.getByText('Este computador não abriu'))).toBeVisible({ timeout: 90_000 });
    await page.locator('[data-part-answer="pump-shaft"]').click();
    await expect(page.getByText('Procure de novo')).toBeVisible();
    await page.locator('[data-part-answer="pump-impeller-nut"]').click();
    await page.getByRole('button', { name: 'Próxima conferência' }).click();
    await page.locator('[data-part-answer="pump-coupling-hub"]').click();
    await page.getByRole('button', { name: 'Próxima conferência' }).click();
    await page.locator('[data-part-answer="pump-casing-gasket"]').click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    expect((await readProfile(page)).journey.missions['os-05'].steps).toContain('erros-montagem');
    expect(errors.filter((e) => !/WebGL|GPU|GL Driver/i.test(e))).toEqual([]);
  });

  test('Oficina de Desenho: vistas com erro explicado e folha no 1º diedro', async ({ page }) => {
    const errors = collectErrors(page);
    await withProfile(page);
    await page.goto('/#/desenho');
    await page.locator('[data-correct="false"]').first().click();
    await expect(page.locator('[role="status"]').first()).toBeVisible();
    for (let i = 0; i < VIEW_QUESTIONS.length; i++) {
      await page.locator('[data-correct="true"]').click();
      await page.getByRole('button', { name: i + 1 === VIEW_QUESTIONS.length ? 'Concluir a bancada' : 'Próxima peça' }).click();
    }
    await expect(page.getByText('Bancada concluída.')).toBeVisible();
    await page.locator('[data-bench="folha"]').click();
    await page.locator('[data-view="superior"]').click();
    await page.locator('[data-sheet="acima"]').click();
    await expect(page.getByRole('status').filter({ hasText: '1º diedro' })).toBeVisible();
    await page.locator('[data-sheet="abaixo"]').click();
    await page.locator('[data-view="lateral"]').click();
    await page.locator('[data-sheet="direita"]').click();
    await page.locator('[data-view="frontal"]').click();
    await page.locator('[data-sheet="centro"]').click();
    await expect(page.getByText('Folha no 1º diedro completa')).toBeVisible();
    const p = await readProfile(page);
    expect(p.gameResults['oficina-desenho'].rounds.vistas.solved).toBe(true);
    expect(p.gameResults['oficina-desenho'].rounds.folha.solved).toBe(true);
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

  test('Biblioteca: busca por peça, ficha com atividade e sem PDF', async ({ page }) => {
    const errors = collectErrors(page);
    await withProfile(page);
    await page.goto('/#/biblioteca');
    await page.getByLabel('Buscar equipamento ou peça').fill('selo');
    await expect(page.locator('[data-entry="centrifugal-pump"]')).toBeVisible();
    await page.locator('[data-entry="centrifugal-pump"]').click();
    await expect(page.getByRole('heading', { name: 'Peças' })).toBeVisible();
    await page.getByRole('button', { name: /Fazer as missões/ }).click();
    await expect(page).toHaveURL(/#\/missoes/);
    expect(errors).toEqual([]);
  });

  test('link de turma pede confirmação antes de aplicar', async ({ page }) => {
    await withProfile(page);
    const code = encodeCourseConfig(normalizeCourseConfig({ hiddenMissions: ['os-02'], passScore: 80, note: 'Recado da turma' }));
    await page.goto(`/#/turma/${code}`);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('nota mínima 80');
    await expect(page.getByText('Recado da turma')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByText('Recado da turma')).toBeVisible();
    await expect(page.locator('[data-mission="os-02"]')).toHaveCount(0);
  });

  test('missões no celular: sem rolagem lateral', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await withProfile(page, journeyUpTo(2));
    await page.goto('/#/missoes');
    await expect(page.locator('[data-mission="os-03"]')).toBeEnabled();
    await expectNoHorizontalScroll(page);
    await page.goto('/#/missoes/os-01');
    await page.locator('[data-step="caminho"]').click();
    await expectNoHorizontalScroll(page);
  });
});

test('instrutor importa arquivos da turma e rejeita arquivo estranho', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/instrutor');
  await page.getByTestId('instructor-dev-bootstrap-btn').click();
  await expect(page.getByRole('tab', { name: 'Turma real' })).toBeVisible();
  await page.getByTestId('class-files').setInputFiles([
    { name: 'ana.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'mecanica-lab-progresso', version: 1, profile: { name: 'Ana Souza', onboardingCompleted: true, ...journeyUpTo(2) } })) },
    { name: 'lixo.json', mimeType: 'application/json', buffer: Buffer.from('{"oi":1}') }
  ]);
  await expect(page.getByRole('heading', { name: 'Turma: 1 aluno' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Ana Souza' })).toBeVisible();
  await expect(page.getByText(/lixo\.json/)).toBeVisible();
  await page.getByRole('tab', { name: 'Conteúdo' }).click();
  await page.locator('[data-publish="os-03"]').uncheck();
  await expect(page.getByTestId('class-link')).toHaveValue(/#\/turma\//);
  await page.getByRole('tab', { name: 'Demonstração' }).click();
  await expect(page.getByText('Dados demonstrativos.')).toBeVisible();
});

test('MISSIONS referencia etapas únicas', () => {
  Object.values(MISSIONS_BY_ID).forEach((m) => expect(new Set(m.steps.map((s) => s.id)).size).toBe(m.steps.length));
});
