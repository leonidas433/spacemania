# Pruebas

El juego no tiene build ni dependencias. Estas pruebas sí necesitan Node y Playwright,
y viven aparte para no contaminar el archivo único.

```bash
npm install
npx playwright install chromium
npm test                  # todas las suites
node tests/run.mjs scores # solo las que coincidan con el filtro
```

Devuelve código distinto de cero si algo falla, así que sirve tal cual en CI.
`CHROMIUM_PATH` permite apuntar a un Chromium ya descargado en lugar del de Playwright.

## Suites

| Suite | Qué cubre |
|---|---|
| `syntax` | Parseo del archivo único, etiquetas, metadatos e invariantes de arquitectura. No necesita navegador |
| `scores` | Top 20 con nombre, migración del formato antiguo, guardado al morir, casos límite de la tabla |
| `visits` | Contador de visitas contra un servidor simulado: cifra, animación, fallo del servidor, movimiento reducido |
| `tutorial` | Regresión de la primera partida: los enemigos del tutorial deben morir y dar paso a la oleada 1 |
| `quality` | Calidad adaptativa, reservas de objetos, anuncios accesibles, hitbox indulgente, formas de bala, Ascenso de Flota |
| `rendering` | Escalado del lienzo en alta densidad, Galería y modo ahorro en móvil emulado |

La suite `syntax` incluye tres invariantes que el proyecto declara en `CLAUDE.md`
y que conviene que fallen ruidosamente si alguien los rompe: el render sigue en
Canvas 2D sin WebGL, no hay dependencias externas, y los arrays calientes no se
reconstruyen cada fotograma.

## Herramientas manuales

En `tools/` hay utilidades que no forman parte de CI porque tardan minutos.

```bash
# Bot heurístico que juega partidas reales y vuelca métricas de balance
node tests/tools/playtest.mjs <novato|pro> <easy|normal|hard> <none|all> <runs> <minutos> salida.json
node tests/tools/agg.mjs salida.json

# Mide si la simulación depende de la tasa de refresco
node tests/tools/proof_dt2.mjs
```

El informe de balance que produjo `playtest.mjs` está en
`spacemania-plan/08-PLAYTEST-BALANCE-2026-09-06.md`.
