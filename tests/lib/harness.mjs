// Utilidades compartidas por las suites. Sin rutas absolutas: el mismo código
// corre en Windows con el Chromium local y en CI con el que instala Playwright.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, '../..');
export const GAME_FILE = resolve(ROOT, 'index.html');
export const GAME_URL = pathToFileURL(GAME_FILE).href;
export const LS = 'retro-game-mania.spacemania.';

/** Chromium headless. CHROMIUM_PATH permite reutilizar un binario ya descargado. */
export function launch(opts = {}) {
  return chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    ...opts,
  });
}

/** Contador de resultados de una suite. */
export function reporter(suite) {
  const r = { suite, pass: 0, fail: 0, errors: [] };
  r.t = (name, ok) => {
    ok ? r.pass++ : r.fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${suite} · ${name}`);
  };
  r.note = (msg) => console.log(`      ${msg}`);
  return r;
}

/**
 * Abre el juego con localStorage preconfigurado y recoge los errores de JS.
 * `init` es un mapa clave→valor que se escribe bajo el prefijo del juego.
 */
export async function gamePage(browser, init = {}, ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 800 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(({ LS, init }) => {
    localStorage.setItem(LS + 'firstgame', '0');
    for (const k in init) localStorage.setItem(LS + k, init[k]);
  }, { LS, init });
  await page.goto(ctxOpts.url || GAME_URL);
  await page.waitForFunction(() => typeof startGame === 'function');
  page.errors = errors;
  page.ctx = ctx;
  return page;
}
