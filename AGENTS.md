# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

SpaceMania is a single-file HTML5 canvas arcade shooter. All code — CSS, HTML, and JavaScript — lives in `index.html` (≈1363 lines). There is no build system, no package manager, and no external dependencies. The game uses the Web Audio API for all sound.

**Current version:** 2.1.0  
**Target version:** 3.0.0 (see `plan-de-mejoras.md`)

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
| `OLEADAS` | `WAVES[]` (8 wave definitions) + `BOSS_PHASES[]` (3 boss phases) |
| `LOGROS` | `ACHIEVEMENTS[]` — checked via `check()` closures against global state |
| `POWER-UPS` | `POWERUP_TYPES[]` — duration in frames |
| `ESTADO GLOBAL` | All mutable game state as top-level `let` variables |
| `SPAWN` | `spawnWave()`, `spawnBoss()`, `spawnTutorialWave()`, shield/powerup timers |
| `DIBUJO DE FORMAS` | `drawShape()` — switch on shape name, draws enemy sprites in canvas 2D |
| `TRAIL / PLAYER / BULLETS / PARTICLES` | Per-entity update+draw functions |
| `MOVIMIENTO ENEMIGOS` | `movePattern()` — switch on `e.pattern` string |
| `HIT / COMBO / POWER-UPS` | `playerHit()`, `registerKill()`, `activatePowerup()` |
| `COLISIONES` | `checkCollisions()` — AABB for enemies, Euclidean for boss |
| `HUDs` | DOM updaters: `updateHealthHUD()`, `updateShieldHUD()`, `updateLivesHUD()`, etc. |
| `OVERLAY` | `showOverlay()`, `showMenu()` — rewrite `#overlay` innerHTML directly |
| `START / GAME LOOP` | `startGame()` resets all state; `loop()` is the `requestAnimationFrame` tick |
| `CONTROLES` | `keydown`/`keyup`, `mousemove`, `touchmove`, `touchstart`, `readGamepad()` |

### State model

All game state is **mutable global variables** — there are no classes or modules. Key variables:

- `state` — `'menu'` | `'playing'` | `'gameover'`
- `enemies[]`, `bullets[]`, `particles[]`, `trails[]`, `powerups[]` — cleared on each wave
- `boss` — single object or `null`; `isBossWave` flag
- `activePowerups` — plain object keyed by powerup ID; timer IDs stored as `activePowerups[id+'_timer']`

### LocalStorage

All persistence uses the prefix `LS_PREFIX = 'retro-game-mania.spacemania.'`. Keys in use:

- `scores` — JSON array of top-10 numbers
- `achievements` — JSON array of unlocked IDs
- `colorblind`, `reducedmotion`, `keyfire`, `firstgame`

`cachedBest` holds the best score in memory; only update it and localStorage when `score > cachedBest`.

### Canvas rendering order (each frame)

Background fill → stars (back layer → front layer) → enemy movement + enemy bullets → boss → drops (shield, powerups) → trails → particles → floating texts → player → player bullets → collision detection → energy drain

`cx.save()` / `cx.restore()` wraps any draw function that changes shadow, alpha, or transform.

## Improvement plan status

`plan-de-mejoras.md` contains a fully specified improvement plan (38 findings across 4 sprints). As of v2.1.0, **all code items are implemented**. The only remaining item is non-code:

- **F30** — Official IARC/PEGI certification: the footer has a "PEGI 3" placeholder badge but the game hasn't been registered at globalratings.com (~10 min, free). Required before public European deploy.

`reporte-auditoria.md` has the full audit with severity ratings for all findings.

## Key constraints

- **Do not split into multiple files.** The single-file design is intentional — the game deploys as one asset with no server-side routing.
- **No framework, no bundler.** Keep it vanilla JS + Canvas 2D + Web Audio API.
- **60fps is the performance target.** Avoid `shadowBlur` inside tight loops (batch it), avoid `localStorage` reads per frame, cap particles at 300.
- When adding new wave or boss data, follow the existing object shape in `WAVES[]` / `BOSS_PHASES[]` — the spawn functions read properties by name.
- Floating feedback text uses `addFloat(x, y, text, color)` — prefer this over new DOM elements for in-game events.
