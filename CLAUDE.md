# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SpaceMania is a single-file HTML5 canvas arcade shooter. All code — CSS, HTML, and JavaScript — lives in `index.html` (≈2030 lines). There is no build system, no package manager, and no external dependencies. The game uses the Web Audio API for all sound.

**Current version:** 3.0.0 (plan in `spacemania-plan/`, fully implemented)

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

The file is served as a static asset from the VPS via nginx:

```nginx
location /spacemania {
    alias /var/www/retro-game-mania/spacemania;
    index index.html;
    add_header Cache-Control "no-cache";
}
```

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

- `scores` — JSON array of top-10 numbers
- `achievements` — JSON array of unlocked IDs
- `colorblind`, `reducedmotion`, `keyfire`, `firstgame`
- v3.0: `fragments` (number), `upgrades` (object id→level), `stats` (lifetime counters), `threats` (array of shapes seen), `ascension_seen`, `challenge`, `daily_done` (seed of the day), `daily_scores` (`{seed, arr}`)

`cachedBest` holds the best score in memory; only update it and localStorage when `score > cachedBest`.

### Canvas rendering order (each frame)

Background fill → stars (back layer → front layer) → player movement + burst/assault timers → `updateAscension()` → player bullets update (guided turn, bounce) → enemy movement + enemy bullets → boss + minions → drops (shield, powerups, mini-frags, data bits) → trails → particles → floating texts → player (aura) → player bullets draw → collision detection → energy drain

`cx.save()` / `cx.restore()` wraps any draw function that changes shadow, alpha, or transform.

## Improvement plan status

`plan-de-mejoras.md` (v2.x, 38 findings) and `spacemania-plan/` (v3.0, 7 docs) are both **fully implemented** as of v3.0.0. The only remaining item is non-code:

- **F30** — Official IARC/PEGI certification: the footer has a "PEGI 3" placeholder badge but the game hasn't been registered at globalratings.com (~10 min, free). Required before public European deploy.

`reporte-auditoria.md` has the full audit with severity ratings for all findings.

## Key constraints

- **Do not split into multiple files.** The single-file design is intentional — the game deploys as one asset with no server-side routing.
- **No framework, no bundler.** Keep it vanilla JS + Canvas 2D + Web Audio API.
- **60fps is the performance target.** Avoid `shadowBlur` inside tight loops (batch it), avoid `localStorage` reads per frame, cap particles at 300.
- When adding new wave or boss data, follow the existing object shape in `WAVES[]` / `BOSS_PHASES[]` — the spawn functions read properties by name. Waves per cycle = `WAVE_COUNT` (12); never hardcode `% 8`.
- Floating feedback text uses `addFloat(x, y, text, color)` — prefer this over new DOM elements for in-game events.
- All enemy kills must go through `killEnemy(e, {cause})` and all scoring through `addScore(base, withCombo)` so modifiers, daily rules, gallery and mini-frags stay consistent.
- New synergies: add an entry to `SYNERGIES` with the sorted key and read `activeSynergy` where the behaviour lives. Do not store per-synergy state elsewhere.
- Screen flash and confetti respect `reducedMotion`; keep it that way.
