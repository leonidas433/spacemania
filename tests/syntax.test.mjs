// Comprobación estática del archivo único. Es la prueba más barata y la más
// valiosa: una llave suelta deja el juego entero inservible.
import fs from 'node:fs';
import { GAME_FILE, ROOT } from './lib/harness.mjs';
import { resolve } from 'node:path';

export const name = 'syntax';

export default async function run(r) {
  const html = fs.readFileSync(GAME_FILE, 'utf8');

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  r.t('el archivo contiene un bloque de script', scripts.length >= 1);

  let ok = true, err = '';
  for (const src of scripts) {
    try { new Function(src); } catch (e) { ok = false; err = e.message; }
  }
  r.t('el JavaScript parsea sin errores', ok);
  if (!ok) r.note(err);

  for (const tag of ['html', 'head', 'body']) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    r.t(`la etiqueta ${tag} abre y cierra una vez`, open === 1 && close === 1);
  }

  r.t('declara el idioma para lectores de pantalla', /<html[^>]+lang=/.test(html));
  r.t('declara la codificación', /<meta[^>]+charset=/i.test(html));
  r.t('declara el viewport para móvil', /<meta[^>]+name=["']viewport["']/i.test(html));

  // Invariantes de arquitectura que el proyecto declara en CLAUDE.md
  r.t('no usa WebGL: el render sigue siendo Canvas 2D',
    !/webgl|gl_Position|createShader|drawArraysInstanced/i.test(html));
  r.t('no carga dependencias externas',
    // canonical/og son metadatos, no recursos cargados: solo cuentan script[src] y <link> externos que no sean canonical
    !/<script[^>]+src=|<link(?![^>]*rel=["']canonical)[^>]+href=["']https?:/i.test(html));
  r.t('no reconstruye los arrays calientes por frame',
    !/(bullets|particles|trails)\s*=\s*(bullets|particles|trails)\.filter/.test(html));
  // Invariantes de v4: el director no puede introducir temporización por fotograma
  // ni azar sin semilla, porque rompería el Daily y los tests deterministas.
  const director = (html.match(/function (planWaveEvent|pickEvent|eventWeight|updateDirector|armEvent)[\s\S]*?\n}/g) || []).join('\n');
  r.t('el director existe y no usa azar sin semilla',
    director.length > 0 && !/Math\.random/.test(director));
  r.t('el director no temporiza por fotograma',
    director.length > 0 && !/frame\s*%/.test(director));

  const size = fs.statSync(GAME_FILE).size;
  r.t('el archivo no supera 400 KB', size < 400 * 1024);
  r.note(`${(size / 1024).toFixed(0)} KB · ${html.split('\n').length} líneas`);

  for (const f of ['LICENSE', 'README.md', 'counter.php']) {
    r.t(`existe ${f}`, fs.existsSync(resolve(ROOT, f)));
  }
}
