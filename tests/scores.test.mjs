// Tabla de puntuaciones: top 20 con nombre, migración del formato antiguo,
// guardado inmediato al morir y edición posterior del nombre.
import { launch, gamePage, LS } from './lib/harness.mjs';

export const name = 'scores';

export default async function run(r) {
  const browser = await launch();
  // Formato antiguo: array de números sueltos
  const p = await gamePage(browser, { scores: JSON.stringify([5000, 3000, 1000]) });

  const menu = await p.evaluate(() => ({
    rows: document.querySelectorAll('#scores-table tr').length,
    names: [...document.querySelectorAll('#scores-table td.nm')].map(x => x.textContent),
    best: cachedBest,
    top: document.querySelector('.hint[style*="ff6"]')?.textContent,
  }));
  r.t('migra el formato antiguo a 3 filas', menu.rows === 3);
  r.t('las entradas migradas se llaman ---', menu.names.every(n => n === '---'));
  r.t('el récord en memoria es 5000', menu.best === 5000);
  r.t('el menú titula TOP 20', menu.top === 'TOP 20');

  // Puntuación 4000 → puesto 2
  await p.evaluate(() => { startGame(false); score = 4000; totalKills = 12; lives = 1; endGame(); });
  const go = await p.evaluate(() => ({
    st: state,
    hasInput: !!document.getElementById('name-input'),
    label: document.querySelector('.name-entry label')?.textContent,
  }));
  await p.waitForTimeout(120);
  r.t('el Game Over pide nombre', go.st === 'gameover' && go.hasInput);
  r.t('anuncia el puesto 2', !!go.label && go.label.includes('TOP 2'));
  r.t('el campo recibe el foco', await p.evaluate(() => document.activeElement?.id === 'name-input'));

  const pre = await p.evaluate(() => JSON.parse(localStorage.getItem('retro-game-mania.spacemania.scores')));
  r.t('se guarda al morir, antes de confirmar', pre.length === 4 && pre[1].s === 4000 && pre[1].n === '---');

  await p.keyboard.type('ad');
  r.t('escribir el nombre no mueve la nave', await p.evaluate(() => !keys['a'] && !keys['d']));
  await p.evaluate(() => { document.getElementById('name-input').value = ''; });

  await p.keyboard.type('leox-433xyz');
  r.t('filtra a 7 caracteres en mayúsculas', await p.evaluate(() => document.getElementById('name-input').value) === 'LEOX433');

  await p.keyboard.press('Enter');
  const after = await p.evaluate(() => ({
    ls: JSON.parse(localStorage.getItem('retro-game-mania.spacemania.scores')),
    pend: pendingScore,
    hi: document.querySelector('#scores-table tr.hi td.nm')?.textContent,
    pname: localStorage.getItem('retro-game-mania.spacemania.playername'),
  }));
  r.t('renombra la entrada sin duplicarla', after.ls[1].n === 'LEOX433' && after.ls[1].s === 4000 && after.ls.length === 4);
  r.t('guarda la fecha en formato ISO', /^\d{4}-\d{2}-\d{2}$/.test(after.ls[1].d));
  r.t('deja de haber puntuación pendiente', after.pend === null);
  r.t('resalta tu fila', after.hi === 'LEOX433');
  r.t('recuerda el nombre para la próxima', after.pname === 'LEOX433');

  // Salir sin confirmar guarda con el nombre recordado
  await p.evaluate(() => { startGame(false); score = 200; totalKills = 12; lives = 1; endGame(); });
  r.t('prellena el último nombre usado', await p.evaluate(() => document.getElementById('name-input')?.value) === 'LEOX433');
  await p.evaluate(() => showMenu());
  const ls2 = await p.evaluate(() => JSON.parse(localStorage.getItem('retro-game-mania.spacemania.scores')));
  r.t('salir sin confirmar conserva la puntuación', ls2.length === 5 && ls2[4].s === 200 && ls2[4].n === 'LEOX433');

  // Casos límite
  await p.evaluate(() => { startGame(false); score = 0; endGame(); });
  r.t('una puntuación de cero no entra', await p.evaluate(() => !document.getElementById('name-input')));

  await p.evaluate(() => {
    localStorage.setItem('retro-game-mania.spacemania.scores',
      JSON.stringify(Array.from({ length: 20 }, (_, i) => ({ n: 'BOT' + i, s: 100000 - i * 1000, d: '' }))));
    startGame(false); score = 50; totalKills = 12; lives = 1; endGame();
  });
  r.t('con la tabla llena, una puntuación baja no entra',
    await p.evaluate(() => !document.getElementById('name-input') && document.querySelectorAll('#go-scores tr').length === 5));

  await p.evaluate(() => { startGame(false); score = 99500; totalKills = 12; lives = 1; endGame(); });
  r.t('con la tabla llena, una puntuación alta entra en el puesto 2',
    (await p.evaluate(() => document.querySelector('.name-entry label')?.textContent) || '').includes('TOP 2'));
  await p.evaluate(() => confirmName());
  const ls3 = await p.evaluate(() => JSON.parse(localStorage.getItem('retro-game-mania.spacemania.scores')));
  r.t('la tabla se recorta a 20 entradas', ls3.length === 20 && ls3[1].s === 99500 && ls3[19].s === 82000);

  // Puesto bajo: top 5 más tu fila
  await p.evaluate(() => {
    localStorage.setItem('retro-game-mania.spacemania.scores',
      JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ n: 'BOT' + i, s: 90000 - i * 1000, d: '' }))));
    startGame(false); score = 10; totalKills = 12; lives = 1; endGame(); confirmName();
  });
  r.t('en un puesto bajo muestra el top 5 y tu fila',
    await p.evaluate(() => document.querySelectorAll('#go-scores tr').length === 7
      && document.querySelector('#go-scores tr.hi td').textContent === '#13'));

  await p.evaluate(() => showMenu());
  r.t('el menú lista la tabla completa con scroll',
    await p.evaluate(() => document.querySelectorAll('.scores-scroll #scores-table tr').length === 13));

  r.t('sin errores de JavaScript', p.errors.length === 0);
  if (p.errors.length) r.note(p.errors.slice(0, 3).join(' | '));
  await browser.close();
}
