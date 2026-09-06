# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

SpaceMania is a single-file HTML5 canvas arcade shooter. All code — CSS, HTML, and JavaScript — lives in `index.html` (≈2030 lines). There is no build system, no package manager, and no external dependencies. The game uses the Web Audio API for all sound.

**Current version:** 3.2.0. Plans in `spacemania-plan/`: balance pass in `08-PLAYTEST-BALANCE-2026-09-06.md`, audit response in `09-PLAN-AUDITORIA-v3.2.md` (both fully implemented). Licensed MIT.

## Running locally

Open `index.html` directly in a browser or serve it with any HTTP server:

```powershell
# Python (any directory)
python -m http.server 8080

# Node (npx)
npx serve .
```

No compilation step. Edits to `index.html` are visible on browser refresh.

## Deploy

Production URL: **https://webdoctor.es/spacemania/** (deployed 2026-09-06). The file is served as a plain static asset from the Plesk vhost of webdoctor.es, no nginx directive needed (Plesk already sends `Cache-Control: no-cache` for HTML):

```
scp index.html claudedev@82.223.151.120:/home/claudedev/spacemania-index.html
ssh claudedev@82.223.151.120 'sudo cp /home/claudedev/spacemania-index.html /var/www/vhosts/webdoctor.es/httpdocs/spacemania/index.html && sudo chown claudedev:claudedev /var/www/vhosts/webdoctor.es/httpdocs/spacemania/index.html && rm /home/claudedev/spacemania-index.html'
```

Never scp directly into httpdocs (fails on existing files). Verify with `curl -s https://webdoctor.es/spacemania/ | grep "Versión:"`.

**Visit counter:** `counter.php` (same directory, PHP 8.3 of the vhost) increments `/var/www/vhosts/webdoctor.es/spacemania-data/visits.json` (outside httpdocs, owner `webdoctor.es_7w8mt7nd43i:psaserv`, `flock`). Counts one visit per session (`sm_v` cookie, 30 min) and only same-origin `fetch` requests (`Sec-Fetch-Site: same-origin`). No IPs, no logs. The client (`loadVisits()`/`showVisits()` in the `CONTADOR DE VISITAS` section) renders the "SEÑALES INTERCEPTADAS" odometer under the footer; it stays hidden on `file://` or when the endpoint fails, and skips the spin animation under `reducedMotion`. Deploy `counter.php` with the same scp + sudo cp flow.

## Architecture

### Single-file structure

The JavaScript is organized into clearly delimited sections marked with `// ── SECTION ─────────` comments. Main sections in order:

| Section | Purpose |
|---|---|
| `CURVA DE DIFICULTAD` | `enemyBulletSpeed()` / `enemyShootTimer()` — pure functions, frame-based |
| `AUDIO ENGINE` | `AudioContext` (`AC`), `playTone()`, `playNoise()`, `SFX` object, `startMusic()`/`stopMusic()` |
| `CONFIGURACIÓN` | `DIFF` object — multipliers per difficulty (easy/normal/hard) |
| `OLEADAS` | `WAVES[]` (12 wave definitions, `special` flag for waves 9-12) + `BOSS_PHASES[]` (5 boss phases) + `THREAT_LORE` |
| `LOGROS` | `ACHIEVEMENTS[]` — checked via `check()` closures against global state |
| `POWER-UPS` | `POWERUP_TYPES[]` (5 types, `MAX_ACTIVE_POWERUPS=2`) — duration in frames |
| `SINERGIAS` | `SYNERGIES{}` keyed by sorted ids (`'double+guided'`); flags read by `fireBullet()`, bullet update and `checkCollisions()` |
| `META-PROGRESIÓN: HANGAR` | `UPGRADES[]`, `upgradeCost()`, `upgLvl()` |
| `MODIFICADORES DE RUN` / `DAILY CHALLENGE` | `MODIFIERS[]`, `DAILY_CHALLENGES[]`, `getDailySeed()`, `mulberry32()` |
| `ESTADO GLOBAL` / `ESTADO v3.0` | All mutable game state as top-level `let` variables; `lsNum/lsObj/lsArr/lsSet` helpers; `calcRunFragments()` |
| `SPAWN` | `spawnWave()`, `spawnBoss()`, `spawnTutorialWave()`, shield/powerup timers |
| `DIBUJO DE FORMAS` | `drawShape()` — switch on shape name, draws enemy sprites in canvas 2D |
| `TRAIL / PLAYER / BULLETS / PARTICLES` | Per-entity update+draw functions |
| `MOVIMIENTO ENEMIGOS` | `movePattern()` — switch on `e.pattern` string |
| `HIT / COMBO / POWER-UPS` | `playerHit()`, `registerKill()`, `activatePowerup()`, `removePowerup()`, `checkAndApplySynergy()` |
| `ASCENSIÓN` | `addAscension()`, `startAscension()`, `endAscension()`, `updateAscension()` (aura kills via `e.auraDmg`), `startOverclock()` |
| `NEAR-MISS` / `PUNTUACIÓN Y KILLS` | `checkNearMiss()`, `addScore()` (applies modifier + daily rules), `killEnemy()` (single kill path: points, juice, clone/push specials, gallery, mini-frags) |
| `COLISIONES` | `checkCollisions()` — AABB for enemies (uses `e.size`), Euclidean for boss; `b.pierce` + `b.hitList` for piercing |
| `HUDs` | DOM updaters: `updateHealthHUD()` (uses `maxShipHp`), `updateShieldHUD()`, `updateLivesHUD()`, `updateAscensionHUD()`, `updateFragHUD()` |
| `OVERLAY` | `showGameOver()`, `showHangar()`, `showGallery()`, `showDaily()`, `showMenu()` — rewrite `#overlay` innerHTML directly |
| `START / GAME LOOP` | `startGame()` resets all state; `loop()` is the `requestAnimationFrame` tick |
| `CONTROLES` | `keydown`/`keyup`, `mousemove`, `touchmove`, `touchstart`, `readGamepad()` |

### State model

All game state is **mutable global variables** — there are no classes or modules. Key variables:

- `state` — `'menu'` | `'playing'` | `'gameover'`
- `enemies[]`, `bullets[]`, `particles[]`, `trails[]`, `powerups[]`, `miniFrags[]`, `bossMinions[]` — cleared on each wave
- `boss` — single object or `null`; `isBossWave` flag; `bossMinions[]` for the Quantum Algorithm split
- `activePowerups` — plain object keyed by powerup ID; timer IDs stored as `activePowerups[id+'_timer']`; `activePowerupIds()` filters the suffixed keys
- `activeSynergy` — key of `SYNERGIES` or `null`; recomputed by `checkAndApplySynergy()` on every activate/remove
- `runModifier`, `dailyMode`/`dailyChallenge` — per-run rules read by `addScore()`, `enemySpeedBonus()`, `resetPowerupTimer()`, energy drain
- Bullets: `newBullet()` factory; fields `pierce`, `hitList`, `guided`, `targetRef`, `fan`, `bounces`, `focused`
- Enemies: `makeEnemy()` factory; fields `size`, `special` (`clone`/`spam`/`push`/`grow`), `age`, `cloned`, `auraDmg`

### LocalStorage

All persistence uses the prefix `LS_PREFIX = 'retro-game-mania.spacemania.'`. Keys in use:

- `scores` — JSON array of top-20 `{n, s, d}` objects (name, score, ISO date); legacy numeric arrays are normalized on load by `normScores()` with name `---`. `SCORES_MAX=20`, `NAME_MAX=7`. Name entry flow: `endGame()` saves immediately with the last name used (`playername`) and sets `pendingScore={score,rank}`; `showGameOver()` renders `#name-input`; `commitPendingScore()` only renames that entry, called by `confirmName()` (Enter/GUARDAR) and by `leaveGameOver()` from any overlay/`startGame()`. `clearFragAnim()` stays side-effect free. The global keydown/keyup handlers ignore events whose target is an INPUT
- `achievements` — JSON array of unlocked IDs
- `colorblind`, `reducedmotion`, `keyfire`, `firstgame`, `mercy` (v3.2 forgiving hitbox)
- v3.0: `fragments` (number), `upgrades` (object id→level), `stats` (lifetime counters), `threats` (array of shapes seen), `ascension_seen`, `challenge`, `daily_done` (seed of the day), `daily_scores` (`{seed, arr}`)
- v3.2: `prestige` (number) — Fleet Ascension count. Multiplies fragments by `1+0.25*prestige` in both `calcRunFragments()` and `fragMultiplier()`. `doPrestige()` requires `hangarMaxed()` and a prior `armPrestige()`; it wipes `upgrades` and `fragments`.

`cachedBest` holds the best score in memory; only update it and localStorage when `score > cachedBest`.

### Canvas rendering order (each frame)

Background fill → stars (back layer → front layer) → player movement + burst/assault timers → `updateAscension()` → player bullets update (guided turn, bounce) → enemy movement + enemy bullets → boss + minions → drops (shield, powerups, mini-frags, data bits) → trails → particles → floating texts → player (aura) → player bullets draw → collision detection → energy drain

`cx.save()` / `cx.restore()` wraps any draw function that changes shadow, alpha, or transform.

## Improvement plan status

`plan-de-mejoras.md` (v2.x, 38 findings) and `spacemania-plan/` (v3.0, 7 docs) are both **fully implemented** as of v3.0.0. The only remaining item is non-code:

- **F30** — Age rating: the footer shows a self-declared "APTO PARA TODAS LAS EDADES" badge (never use the PEGI logo without a licence). An official IARC rating is only obtainable through a participating storefront (Microsoft Store as PWA, Google Play as TWA); the IARC questionnaire is not available directly to developers. See the IARC options in `spacemania-plan/08-PLAYTEST-BALANCE-2026-09-06.md` history / session notes.

`reporte-auditoria.md` and `plan-de-mejoras.md` are **historical**: they describe v2.1 and are kept for traceability only. The current state of the project is `README.md` plus this file; the current plans live in `spacemania-plan/`.

## Tests

`npm test` runs `tests/run.mjs`: six suites, 85 checks, about twelve seconds, non-zero exit on failure. GitHub Actions runs them on every push (`.github/workflows/ci.yml`). Add a check to the matching suite whenever you change behaviour; `tests/README.md` documents each one. `tests/tools/` holds the balance bot and the refresh-rate probe, which are manual because they take minutes.

The `syntax` suite guards three architecture invariants and will fail loudly if they are broken: the renderer stays Canvas 2D with no WebGL, there are no external dependencies, and the hot arrays are never rebuilt per frame.

## Key constraints

- **Do not split into multiple files.** The single-file design is intentional — the game deploys as one asset with no server-side routing.
- **No framework, no bundler.** Keep it vanilla JS + Canvas 2D + Web Audio API.
- **60fps is the performance target.** `LOW_FX` (see the `CALIDAD ADAPTATIVA` section) is the quality switch: true on coarse pointers, narrow screens, reduced motion, or after two seconds under 45fps. Gate every `shadowBlur` in a per-frame path behind `!LOW_FX`, and read `maxParticles()` / `maxTrails()` instead of hardcoding caps.
- **No per-frame array rebuilds.** Bullets, particles and trails compact in place and return objects to `bulletPool` / `particlePool` / `trailPool`. Use `newBullet()` + `releaseBullet()` / `clearBullets()`, `pushParticle()` / `spawnParticles()` / `clearParticles()`. Never assign `bullets=[]` or `particles=[]` directly.
- **Canvas transform is owned by `applyCanvasScale()`.** It sets `C.width`/`C.height` to the device pixel ratio (1 under `LOW_FX`, capped at 2) and installs the base transform. Nothing else may call `setTransform` on the main context.
- When adding new wave or boss data, follow the existing object shape in `WAVES[]` / `BOSS_PHASES[]` — the spawn functions read properties by name. Waves per cycle = `WAVE_COUNT` (12); never hardcode `% 8`.
- Floating feedback text uses `addFloat(x, y, text, color)` — prefer this over new DOM elements for in-game events.
- All enemy kills must go through `killEnemy(e, {cause})` and all scoring through `addScore(base, withCombo)` so modifiers, daily rules, gallery and mini-frags stay consistent.
- New synergies: add an entry to `SYNERGIES` with the sorted key and read `activeSynergy` where the behaviour lives. Do not store per-synergy state elsewhere.
- Screen flash and confetti respect `reducedMotion`; keep it that way.
- Any event whose only feedback is audio must also call `announce(text)`, which writes to the `#sr-live` status region (throttled to one message per 700ms, duplicates dropped within 2.5s).
- The player hitbox is `mercyHitbox ? 7x6 : 10x8`. Enemy bullet silhouettes come from `EBULLET_SHAPE[waveShape]` and are drawn by `drawEBullet()`; shape, not just colour, must distinguish a wave's projectile.
