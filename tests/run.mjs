// Ejecuta todas las suites y devuelve código distinto de cero si alguna falla.
//   node tests/run.mjs            todas
//   node tests/run.mjs scores     solo las que coincidan con el filtro
import { reporter } from './lib/harness.mjs';

const SUITES = ['syntax', 'scores', 'visits', 'tutorial', 'quality', 'rendering'];
const filter = process.argv.slice(2);
const chosen = filter.length ? SUITES.filter(s => filter.some(f => s.includes(f))) : SUITES;

if (!chosen.length) {
  console.error(`Ninguna suite coincide con: ${filter.join(', ')}\nDisponibles: ${SUITES.join(', ')}`);
  process.exit(2);
}

let pass = 0, fail = 0;
const t0 = Date.now();

for (const suite of chosen) {
  const mod = await import(`./${suite}.test.mjs`);
  const r = reporter(suite);
  try {
    await mod.default(r);
  } catch (e) {
    r.t(`la suite terminó con excepción: ${e.message}`, false);
  }
  pass += r.pass; fail += r.fail;
}

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n${pass} correctas, ${fail} fallidas, ${secs} s`);
process.exit(fail ? 1 : 0);
