// Regresión de la primera partida: los enemigos del tutorial deben morir
// y el tutorial debe dar paso a la oleada 1.
// Cubre el fallo de v3.0 a v3.1, en el que spawnTutorialWave() construía los
// enemigos a mano sin `size` y la colisión comparaba contra NaN.
import { launch, gamePage } from './lib/harness.mjs';

export const name = 'tutorial';

export default async function run(r) {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  // Sin marcar firstgame: queremos precisamente la primera partida
  const { GAME_URL } = await import('./lib/harness.mjs');
  await p.goto(GAME_URL);
  await p.waitForFunction(() => typeof startGame === 'function');
  await p.evaluate(() => { selectDiff('normal'); startGame(false); });

  r.t('la primera partida arranca en el tutorial',
    await p.evaluate(() => isTutorialWave && enemies.length === 3
      && enemies.every(e => e.size === 20 && e.pts === 0)));

  for (let i = 0; i < 40 && await p.evaluate(() => isTutorialWave); i++) {
    await p.evaluate(() => { const e = enemies.find(e => e.alive); if (e) player.x = e.x; });
    await p.keyboard.press(' ');
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(1200);

  const s = await p.evaluate(() => ({
    tut: isTutorialWave, kills: tutorialKills, wave: waveIdx, st: state,
    first: localStorage.getItem('retro-game-mania.spacemania.firstgame'),
  }));
  r.t('las balas destruyen los enemigos del tutorial', s.kills >= 3);
  r.t('el tutorial da paso a la oleada 1', !s.tut && s.wave === 1 && s.st === 'playing');
  r.t('deja de considerarse primera partida', s.first === '0');

  r.t('sin errores de JavaScript', errors.length === 0);
  if (errors.length) r.note(errors.slice(0, 3).join(' | '));
  await browser.close();
}
