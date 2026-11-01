import { test, expect } from '@playwright/test';
import { readProfile, withProfile } from './helpers';
import {
  LEVELS,
  PASS_MIN,
  QUESTIONS_PER_ROUND,
  RANGE,
  caliperParts,
  diagnose,
  explain,
  generateRound,
  micrometerParts,
  mistakesFor,
  parseMm,
  scoreRound
} from '../../src/data/metrology/metrologyMaster';
import { COMPETENCIES, competencyProgress } from '../../src/data/competencies';
import type { PlayerProfile } from '../../src/types/game';

/* ───────────── Lógica (sem navegador) ───────────── */

test.describe('Mestre da Metrologia: lógica', () => {
  test('a mesma semente gera a mesma rodada; sementes diferentes, rodadas diferentes', () => {
    expect(generateRound(2, 42)).toEqual(generateRound(2, 42));
    expect(generateRound(2, 42)).not.toEqual(generateRound(2, 43));
  });

  test('rodadas válidas em centenas de sementes: faixa, alternativas e níveis', () => {
    // Milhares de verificações: junta as falhas numa lista e confere uma vez (expect por item levava ~10 min).
    const problems: string[] = [];
    const check = (ok: boolean, what: string) => {
      if (!ok && problems.length < 20) problems.push(what);
    };
    for (const level of LEVELS) {
      for (let seed = 1; seed <= 300; seed++) {
        const qs = generateRound(level.id, seed);
        const at = `nível ${level.id}, semente ${seed}`;
        check(qs.length === QUESTIONS_PER_ROUND, `${at}: ${qs.length} perguntas`);
        check(new Set(qs.map((q) => `${q.reading.instrument}${q.reading.value}`)).size === QUESTIONS_PER_ROUND, `${at}: leitura repetida`);
        for (const q of qs) {
          const { instrument, value } = q.reading;
          const id = `${at}, ${q.id} (${instrument} ${value})`;
          check(level.instruments.includes(instrument), `${id}: instrumento fora do nível`);
          check(value >= RANGE[instrument].min && value <= RANGE[instrument].max, `${id}: fora da faixa`);
          if (instrument === 'paquimetro') check(value % 5 === 0, `${id}: fora da resolução 0,05 mm`);
          if (level.id === 1) check(caliperParts(value).tick % 2 === 0, `${id}: nível 1 só com décimos`);
          if (instrument === 'relogio') {
            // Ponteiros fora do zero, dentro de meia volta, e o batimento é a distância entre eles.
            const { min, max } = q.reading.dial!;
            check(min !== 0 && max !== 0, `${id}: ponteiro no zero`);
            check(Math.abs(min) <= 50 && Math.abs(max) <= 50, `${id}: ponteiro além de meia volta`);
            check(max - min === value, `${id}: batimento ≠ maior − menor`);
          }
          if (level.answerMode === 'typed') {
            check(q.options.length === 0, `${id}: digitada com alternativas`);
            continue;
          }
          // 4 alternativas distintas, uma só correta, e cada errada reproduz o engano que diz representar.
          check(q.options.length === 4, `${id}: ${q.options.length} alternativas`);
          check(new Set(q.options.map((o) => o.value)).size === q.options.length, `${id}: alternativas repetidas`);
          check(q.options.filter((o) => o.value === value).length === 1, `${id}: não há exatamente uma correta`);
          for (const o of q.options.filter((op) => op.value !== value)) {
            check(o.mistake !== null && diagnose(q.reading, o.value) !== null, `${id}: alternativa ${o.value} sem engano`);
          }
        }
        if (level.id === 4) check(new Set(qs.map((q) => q.reading.instrument)).size === 2, `${at}: nível misto com um instrumento só`);
      }
    }
    expect(problems).toEqual([]);
  });

  test('o traço do nônio que coincide na geometria é o que a explicação usa', () => {
    // Nônio de 20 divisões em 19 mm: o traço i fica em leitura + i × 0,95 mm. Coincide quando cai num milímetro inteiro.
    for (let v = 100; v <= 3595; v += 5) {
      const hits = Array.from({ length: 20 }, (_, i) => i).filter((i) => (v + 95 * i) % 100 === 0);
      expect(hits).toEqual([caliperParts(v).tick]);
    }
  });

  test('erros típicos e explicações em casos conferidos à mão', () => {
    const cal = { instrument: 'paquimetro' as const, value: 2335 }; // 23,35 mm, traço 7
    expect(mistakesFor(cal)).toEqual([
      { value: 2370, mistake: 'nonio_como_decimo' },
      { value: 2340, mistake: 'traco_vizinho' },
      { value: 2330, mistake: 'traco_vizinho' },
      { value: 2435, mistake: 'mm_seguinte' }
    ]);
    expect(explain(cal)).toEqual([
      'Régua fixa: o último traço antes do zero do nônio é o de 23 mm.',
      'Nônio: o traço 7 coincide com um traço da régua → 7 × 0,05 = 0,35 mm.',
      'Leitura: 23 + 0,35 = 23,35 mm.'
    ]);

    const mic = { instrument: 'micrometro' as const, value: 1268 }; // 12 + 0,50 + 0,18
    expect(micrometerParts(1268)).toEqual({ whole: 12, half: true, drum: 18 });
    expect(diagnose(mic, 1218)).toBe('esqueceu_meio');
    expect(diagnose(mic, 1269)).toBe('tambor_vizinho');
    expect(diagnose(mic, 1168)).toBe('mm_anterior');
    expect(diagnose(mic, 1300)).toBeNull();
    expect(explain(mic)[3]).toBe('Leitura: 12 + 0,50 + 0,18 = 12,68 mm.');

    expect(diagnose({ instrument: 'micrometro', value: 738 }, 788)).toBe('somou_meio');
    expect(diagnose({ instrument: 'micrometro', value: 507 }, 570)).toBe('tambor_como_decimo');
    // Relógio: de −0,02 a +0,03 (o caso clássico do batimento).
    const dial = { instrument: 'relogio' as const, value: 5, dial: { min: -2, max: 3 } };
    expect(mistakesFor(dial)).toEqual([
      { value: 1, mistake: 'sinal_ignorado' },
      { value: 3, mistake: 'so_maior' },
      { value: 6, mistake: 'divisao_vizinha' },
      { value: 4, mistake: 'divisao_vizinha' },
      { value: 50, mistake: 'divisao_como_decimo' }
    ]);
    expect(explain(dial)).toEqual([
      'Ponteiro azul (menor valor na volta): 2 divisões à esquerda (−) do zero → −0,02 mm.',
      'Ponteiro laranja (maior valor na volta): 3 divisões à direita (+) do zero → +0,03 mm.',
      'Batimento = maior − menor = +0,03 − (−0,02) = 0,05 mm.'
    ]);
    // Os dois ponteiros do mesmo lado: ignorar o sinal vira soma; batimento par admite o engano da metade.
    expect(diagnose({ instrument: 'relogio', value: 12, dial: { min: 4, max: 16 } }, 20)).toBe('sinal_ignorado');
    expect(diagnose({ instrument: 'relogio', value: 12, dial: { min: 4, max: 16 } }, 6)).toBe('metade');

    // Na borda da faixa não se inventa leitura impossível (micrômetro 0–25 mm).
    expect(mistakesFor({ instrument: 'micrometro', value: 5 }).every((m) => m.value >= 0)).toBe(true);
  });

  test('entrada digitada', () => {
    expect(parseMm('12,35')).toBe(1235);
    expect(parseMm(' 12.35 mm')).toBe(1235);
    expect(parseMm('12,3')).toBe(1230);
    expect(parseMm('7')).toBe(700);
    expect(parseMm('12,355')).toBeNull();
    expect(parseMm('doze')).toBeNull();
    expect(parseMm('')).toBeNull();
  });

  test('pontuação determinística: dica vale metade, erro não tira pontos, conclui com 5 de 6', () => {
    const a = (correct: boolean, hintUsed = false) => ({ questionId: 'q', instrument: 'paquimetro' as const, correct, hintUsed, mistake: correct ? null : ('traco_vizinho' as const) });
    const r = scoreRound(2, [a(true), a(true, true), a(false), a(true), a(true), a(true)]);
    expect(r).toMatchObject({ correct: 5, total: 6, score: 15 * 4 + 7.5, maxScore: 90, passed: true });
    expect(r.mistakes).toEqual([{ id: 'traco_vizinho', count: 1 }]);
    expect(scoreRound(2, [a(true), a(true), a(false), a(false), a(true), a(true)]).passed).toBe(false);
    expect(PASS_MIN).toBe(5);
    // Rodada incompleta nunca conclui o nível.
    expect(scoreRound(1, [a(true), a(true), a(true), a(true), a(true)]).passed).toBe(false);
  });
});

test('competência “Leitura com resolução fina” conta os níveis concluídos', () => {
  const comp = COMPETENCIES.find((c) => c.id === 'metrologia-resolucao-fina')!;
  const profileWith = (levels: number[]) =>
    ({
      gameResults: {
        'mestre-metrologia': {
          lastPlayedAt: 1,
          rounds: Object.fromEntries(levels.map((l) => [`nivel-${l}`, { solved: true, firstTry: false, attempts: 1 }]))
        }
      },
      practiceSessions: [],
      microLessons: {},
      completedTasks: [],
      masteredTools: [],
      labMissionStages: {},
      lessonProgress: {}
    }) as unknown as PlayerProfile;
  expect(competencyProgress(comp, profileWith([1, 2, 3])).items[0]).toMatchObject({ done: 3, total: 5 });
  expect(competencyProgress(comp, profileWith([1, 2, 3, 4])).completed).toBe(false);
  expect(competencyProgress(comp, profileWith([1, 2, 3, 4, 5])).completed).toBe(true);
});

/* ───────────── No navegador ───────────── */

test('Mestre da Metrologia: rodada completa, erro explicado, recorde salvo', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/desafios');
  await page.getByRole('button', { name: /Mestre da Metrologia/ }).click();
  await expect(page).toHaveURL(/#\/desafios\/mestre-metrologia/);
  await expect(page.getByRole('heading', { level: 1, name: 'Mestre da Metrologia' })).toBeVisible();
  await page.getByRole('listitem').filter({ hasText: 'Paquímetro: décimos' }).getByRole('button', { name: 'Começar' }).click();

  // As medidas são sorteadas: o teste marca sempre a 1ª alternativa e confere que o retorno é coerente com ela.
  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    const options = page.getByRole('group', { name: 'Escolha a leitura' }).getByRole('button');
    await expect(options).toHaveCount(4);
    if (i === 1) {
      await page.getByRole('button', { name: /Mostrar dica/ }).click();
      await expect(page.getByRole('button', { name: /Dica ativa/ })).toBeDisabled();
    }
    const chosen = (await options.nth(0).textContent())!.trim();
    await options.nth(0).click();
    const feedback = page.getByRole('region', { name: 'Resultado da leitura' });
    await expect(feedback).toBeFocused();
    await expect(feedback).toContainText('Régua fixa');
    const correct = (await feedback.locator('li').last().textContent())!.match(/= ([\d,]+ mm)\.$/)![1];
    if (chosen.startsWith(correct)) {
      await expect(feedback).toContainText(`Certo: ${correct}`);
    } else {
      await expect(feedback).toContainText(`a leitura é ${correct}`);
      await expect(feedback).toContainText('Engano provável');
    }
    await page.getByRole('button', { name: /Próxima leitura|Ver resultado/ }).click();
  }
  await expect(page.getByRole('heading', { level: 1, name: /Nível concluído|Quase lá|Continue praticando/ })).toBeVisible();
  await expect(page.getByText(/de 6 leituras certas/)).toBeVisible();

  const profile = await readProfile(page);
  const rec = profile.gameResults['mestre-metrologia'].rounds['nivel-1'];
  expect(rec.attempts).toBe(1);
  expect(typeof rec.bestScore).toBe('number');

  await page.getByRole('button', { name: 'Escolher nível' }).click();
  await expect(page.getByText(`Seu recorde: ${rec.bestScore} de 60 pontos`)).toBeVisible();
});

test('Mestre da Metrologia: relógio comparador esconde os valores até a resposta', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/desafios/mestre-metrologia');
  await page.getByRole('listitem').filter({ hasText: 'Relógio comparador: batimento' }).getByRole('button', { name: 'Começar' }).click();
  const dial = page.getByRole('img', { name: /Relógio comparador/ });
  await expect(dial).toContainText('menor valor');
  await page.getByRole('group', { name: 'Escolha a leitura' }).getByRole('button').first().click();
  const feedback = page.getByRole('region', { name: 'Resultado da leitura' });
  await expect(feedback).toContainText('Batimento = maior − menor');
  await expect(dial).not.toContainText('menor valor');
  await expect(dial).toContainText(/menor: [−+]0,\d\d/);
});

test('Mestre da Metrologia: nível digitado aceita vírgula e valida entrada', async ({ page }) => {
  await withProfile(page);
  await page.goto('/#/desafios/mestre-metrologia');
  await page.getByRole('listitem').filter({ hasText: 'Bancada mista' }).getByRole('button', { name: 'Começar' }).click();
  const input = page.getByLabel('Digite a leitura em milímetros');
  await input.fill('doze');
  await page.getByRole('button', { name: 'Conferir' }).click();
  await expect(page.getByRole('alert')).toHaveText('Digite um número em milímetros, por exemplo 12,35.');
  await input.fill('0,01');
  await page.getByRole('button', { name: 'Conferir' }).click();
  await expect(page.getByRole('region', { name: 'Resultado da leitura' })).toContainText('Você marcou 0,01 mm');
});
