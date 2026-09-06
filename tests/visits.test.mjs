// Contador de visitas: sirve el juego por HTTP con un counter.php simulado.
import http from 'node:http';
import fs from 'node:fs';
import { launch, gamePage, GAME_FILE } from './lib/harness.mjs';

export const name = 'visits';

export default async function run(r) {
  const html = fs.readFileSync(GAME_FILE);
  let mode = 'ok', hits = 0;
  const srv = http.createServer((req, res) => {
    if (req.url.startsWith('/counter.php')) {
      hits++;
      if (mode === 'fail') { res.writeHead(503); return res.end('{"error":"storage"}'); }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ total: 1234567 }));
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  await new Promise(res => srv.listen(0, res));
  const url = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await launch();

  let p = await gamePage(browser, {}, { url });
  await p.waitForTimeout(1600);
  const shown = await p.evaluate(() => ({
    on: document.getElementById('visits').classList.contains('on'),
    txt: [...document.querySelectorAll('#visits-odo span')].map(s => s.textContent).join(''),
    spinning: document.querySelectorAll('#visits-odo span.spin').length,
  }));
  r.t('muestra los 7 dígitos de la cifra real', shown.on && shown.txt === '1234567');
  r.t('la animación del odómetro termina', shown.spinning === 0);
  r.t('pide la cifra una sola vez por carga', hits === 1);
  const errsA = p.errors;
  await p.ctx.close();

  mode = 'fail';
  p = await gamePage(browser, {}, { url });
  await p.waitForTimeout(400);
  r.t('se oculta si el servidor falla',
    await p.evaluate(() => !document.getElementById('visits').classList.contains('on')));
  const errsB = p.errors;
  await p.ctx.close();

  mode = 'ok';
  p = await gamePage(browser, { reducedmotion: '1' }, { url });
  await p.waitForTimeout(300);
  r.t('con movimiento reducido muestra la cifra sin girar',
    await p.evaluate(() => [...document.querySelectorAll('#visits-odo span')].map(s => s.textContent).join('') === '1234567'
      && !document.querySelector('#visits-odo span.spin')));
  const errsC = p.errors;
  await p.ctx.close();

  // Sin servidor (file://) el panel no debe aparecer
  p = await gamePage(browser);
  await p.waitForTimeout(300);
  r.t('en local sin servidor el panel no aparece',
    await p.evaluate(() => !document.getElementById('visits').classList.contains('on')));

  const errs = [...errsA, ...errsB, ...errsC, ...p.errors];
  r.t('sin errores de JavaScript', errs.length === 0);
  if (errs.length) r.note(errs.slice(0, 3).join(' | '));
  await browser.close();
  srv.close();
}
