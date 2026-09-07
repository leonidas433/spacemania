// Sonda de playtest v4: el bot juega y se registra qué eventos ocurren.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const GAME_URL = pathToFileURL(new URL('../../index.html', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')).href;
const src = fs.readFileSync(new URL('./playtest.mjs', import.meta.url), 'utf8');
const i = src.indexOf('const BOT = `') + 13, j = src.indexOf('`;', i);
const BOT = src.slice(i, j).replace('${JSON.stringify(P)}', JSON.stringify({ look: 75, hit: 20, every: 1, freeze: 0 }));
const MIN = parseFloat(process.argv[2] || '4');
const RUNS = parseInt(process.argv[3] || '2', 10);

const b = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
const all = [];
await Promise.all(Array.from({ length: RUNS }, async (_, n) => {
  const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(() => { localStorage.setItem('retro-game-mania.spacemania.firstgame', '0'); localStorage.removeItem('retro-game-mania.spacemania.discoveries'); });
  await p.goto(GAME_URL);
  await p.waitForFunction(() => typeof startGame === 'function');
  await p.evaluate(BOT);
  await p.evaluate(() => {
    window.__ev = [];
    const _b = beginEventAction;
    beginEventAction = function (a) { window.__ev.push({ id: a.def.id, w: waveIdx, c: cycle }); return _b(a); };
    selectDiff('normal'); startGame(false);
  });
  const t0 = Date.now();
  while (Date.now() - t0 < MIN * 60000) {
    await p.waitForTimeout(3000);
    if (await p.evaluate(() => state) === 'gameover') break;
  }
  const m = await p.evaluate(() => ({
    ev: window.__ev, wave: waveIdx, cycle: maxCycleReached, kills: totalKills,
    stats: eventDirector ? eventDirector.stats : null,
    route: eventDirector ? eventDirector.route : null,
    flags: eventDirector ? eventDirector.routeFlags : null,
    score, maxCombo: maxComboRun, near: nearMisses,
    metrics: v4Metrics, disc: [...discoveries], st: state,
    orphans: enemies.filter(e => e.ephemeral).length,
  }));
  m.errs = errs; m.run = n;
  all.push(m);
  await ctx.close();
}));
for (const m of all.sort((a, b) => a.run - b.run)) {
  const ids = m.ev.map(e => e.id);
  const counts = {};
  ids.forEach(x => counts[x] = (counts[x] || 0) + 1);
  console.log(`run${m.run}: waves=${m.wave} ciclo=${m.cycle} kills=${m.kills} eventos=${ids.length} ${JSON.stringify(counts)}`);
  console.log(`        secuencia: ${ids.join(' → ') || '(ninguno)'}`);
  console.log(`        stats=${JSON.stringify(m.stats)} huérfanos=${m.orphans} errores=${m.errs.length}`);
  console.log(`        ruta=${m.route} transmisiones=${(m.flags && m.flags.transmissions) || 0} combo máx=${m.maxCombo} esquivas=${m.near} score=${m.score}`);
  const secrets = m.disc.filter(d => ['sol_signal', 'ghost_fragment', 'unknown_transmission', 'route_eclipse'].includes(d));
  const objs = m.disc.filter(d => d.startsWith('obj_'));
  console.log(`        registro: eventos=${m.disc.filter(d => !d.startsWith('obj_') && !secrets.includes(d)).join(',') || '-'}`);
  console.log(`                  secretos=${secrets.join(',') || '-'} · objetivos ocultos=${objs.join(',') || '-'}`);
  if (m.errs.length) console.log('        ', m.errs.slice(0, 3));
  // Anti-repetición: nunca el mismo id dos veces seguidas
  let rep = 0;
  for (let k = 1; k < ids.length; k++) if (ids[k] === ids[k - 1]) rep++;
  console.log(`        repeticiones consecutivas: ${rep} (debe ser 0)`);
}
await b.close();
