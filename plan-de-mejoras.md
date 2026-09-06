# SpaceMania — Plan de Mejoras
**Basado en:** Auditoría GameDev v2.1.0 · 2026-05-31  
**Versión objetivo:** 3.0.0  
**Criterio de priorización:** P0 blocker → P1 high → P2 medium → P3 low  

---

## Metodología de ejecución

Cada mejora incluye:
- **Qué** cambia exactamente
- **Dónde** en el código (función / línea de referencia)
- **Cómo** implementarlo (pseudocódigo o código listo)
- **Test** de validación

Las mejoras se agrupan en 4 sprints. Cada sprint es aplicable en una sola sesión con Claude Code.

---

## SPRINT 1 — Blockers críticos
**Objetivo:** juego desplegable sin vergüenza  
**Hallazgos resueltos:** F01, F02, F03, F04, F08, F09, F10

---

### [F01] Explicar la barra de energía · P0

**Qué:** Añadir tooltip en el primer segundo de juego que explique la barra.  
**Dónde:** `startGame()` + nuevo div `#energy-tooltip`  
**Cómo:**
```js
// Mostrar tooltip durante los primeros 4 segundos de la primera partida
function showEnergyTip(){
  const tip = document.getElementById('energy-tooltip');
  tip.style.opacity = '1';
  setTimeout(()=> tip.style.opacity = '0', 4000);
}
// HTML a añadir sobre #energy-bar:
// <div id="energy-tooltip">⚡ ENERGÍA — se agota sola · destruye enemigos para recargar</div>
```
**Estilo:** texto pequeño centrado, fondo semitransparente, fade out.  
**Test:** Iniciar partida nueva → tooltip visible → desaparece a los 4s.

---

### [F02] Controles táctiles con feedback visual · P0

**Qué:** Añadir joystick virtual izquierdo + botón disparo derecho en mobile.  
**Dónde:** Nuevo overlay `#touch-controls` visible solo en `(hover: none)`.  
**Cómo:**
```css
@media (hover: none) {
  #touch-controls { display: flex; }
}
#touch-controls { 
  position: absolute; bottom: 20px; width: 100%;
  display: none; justify-content: space-between; pointer-events: none;
}
#btn-left, #btn-right { width: 60px; height: 60px; /* flechas */ pointer-events: all; }
#btn-fire { width: 70px; height: 70px; /* círculo FIRE */ pointer-events: all; }
```
**Eventos:** `touchstart`/`touchend` en cada botón setean `keys['ArrowLeft']` etc.  
**Test:** En Chrome DevTools mobile → botones visibles → movimiento y disparo funcionales.

---

### [F03] Modo daltónico · P0

**Qué:** Toggle en menú que reemplaza rojo/verde por azul/amarillo.  
**Dónde:** Variable global `colorblindMode` + función `getColor(role)`.  
**Cómo:**
```js
const COLORS = {
  normal:    { danger:'#f44', safe:'#4f4', bullet:'#f64', shield:'#4af', player:'#4af' },
  colorblind:{ danger:'#f90', safe:'#4af', bullet:'#ff0', shield:'#fff', player:'#4ff' },
};
function gc(role){ return COLORS[colorblindMode ? 'colorblind' : 'normal'][role]; }
// Reemplazar todos los colores hardcodeados por gc('danger') etc.
// Botón en menú: [MODO DALTÓNICO: OFF/ON]
```
**Test:** Activar modo → balas pasan a amarillo → pips de energía pasan a azul/naranja.

---

### [F04] Soporte Gamepad · P0

**Qué:** Leer Web Gamepad API cada frame para mover y disparar.  
**Dónde:** Inicio del game loop `loop()`, antes del movimiento de jugador.  
**Cómo:**
```js
function readGamepad(){
  const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
  if(!gp) return;
  // Stick izquierdo o D-pad
  const axisX = gp.axes[0];
  if(axisX < -0.3 || gp.buttons[14]?.pressed) keys['ArrowLeft'] = true;
  else delete keys['ArrowLeft'];
  if(axisX >  0.3 || gp.buttons[15]?.pressed) keys['ArrowRight'] = true;
  else delete keys['ArrowRight'];
  // Botón A (índice 0) = disparar
  if(gp.buttons[0]?.pressed && !lastGamepadFire && !bullet){
    fireBullet(); lastGamepadFire = true;
  }
  if(!gp.buttons[0]?.pressed) lastGamepadFire = false;
}
// Llamar readGamepad() al inicio de cada frame en loop()
```
**Test:** Conectar gamepad → stick mueve nave → botón A dispara.

---

### [F08] Límite de partículas · P1

**Qué:** Cap de 300 partículas máximo. Si se supera, eliminar las más antiguas.  
**Dónde:** `spawnParticles()`  
**Cómo:**
```js
function spawnParticles(x, y, color, n){
  const MAX = 300;
  for(let i=0; i<(n||10); i++){
    if(particles.length >= MAX) particles.shift(); // eliminar más antigua
    const a=Math.random()*Math.PI*2, sp=Math.random()*3+1;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:40,color});
  }
}
```
**Test:** Boss death (50 partículas) en ciclo 5 con muchos enemigos → sin lag.

---

### [F09] shadowBlur en batch · P1

**Qué:** Aplicar shadowBlur una sola vez para todas las balas enemigas del mismo tipo.  
**Dónde:** Render de `e.ebullets` en el game loop.  
**Cómo:**
```js
// ANTES (por cada bala):
e.ebullets.forEach(b=>{ cx.shadowBlur=4; cx.shadowColor='#f64'; cx.fillRect(...); });

// DESPUÉS (batch):
cx.save();
cx.shadowBlur = 4; cx.shadowColor = '#f64'; cx.fillStyle = '#f64';
e.ebullets.forEach(b=>{ b.x+=b.vx; b.y+=b.vy; cx.fillRect(b.x-2,b.y-6,4,12); });
cx.restore();
// Un solo shadowBlur por tipo de enemigo, no por bala
```
**Test:** Wave 8 ciclo 3 con 15 balas en pantalla → FPS estables en mobile.

---

### [F10] Cachear bestScore · P1

**Qué:** Leer localStorage una vez al inicio, actualizar variable local en memoria.  
**Dónde:** Variable `cachedBest` + `initBest()` + `checkCollisions()`  
**Cómo:**
```js
let cachedBest = 0;
function initBest(){
  cachedBest = bestScore();
  document.getElementById('sc-best').textContent = String(cachedBest).padStart(6,'0');
}
// En checkCollisions, reemplazar:
//   document.getElementById('sc-best').textContent=String(Math.max(score,bestScore()))...
// Por:
if(score > cachedBest){
  cachedBest = score;
  document.getElementById('sc-best').textContent = String(cachedBest).padStart(6,'0');
}
```
**Test:** Kill rápido de 20 enemigos → sin microfreezes en DevTools Performance.

---

## SPRINT 2 — UX y Game Feel
**Objetivo:** experiencia pulida y legible  
**Hallazgos resueltos:** F05, F07, F11, F12, F13, F19, F22, F23, F26, F31, F36

---

### [F05] Tutorial wave 0 · P1

**Qué:** Primera partida inicia con una wave especial: 3 enemigos lentos, sin disparo, texto de guía.  
**Dónde:** `spawnWave()` — detectar `waveIdx === 0 && firstGame === true`  
**Cómo:**
```js
let firstGame = true; // se setea false al completar wave 0

function spawnTutorialWave(){
  // 3 smartphones en fila, shootTimer = 99999 (nunca disparan)
  // Overlay: "MUEVE con ← → · DISPARA con ESPACIO · Guía el misil con ← →"
  // Al eliminar los 3: firstGame=false, continuar con wave 1 normal
}
```
**Test:** Primera partida → tutorial activo → segunda partida → tutorial omitido.

---

### [F07] Ventana de gracia en boss spawn · P1

**Qué:** Los primeros 2 segundos tras spawnar el boss, sus `shootTimer` no decrementan.  
**Dónde:** `updateBoss()`  
**Cómo:**
```js
// Añadir al objeto boss: graceTimer: 120  (2 segundos a 60fps)
function updateBoss(){
  if(boss.graceTimer > 0){ boss.graceTimer--; /* mover pero no disparar */ return; }
  // ... resto del update normal
}
```
**Test:** Llegar al boss con HP 1 → 2 segundos sin balas → tiempo de reacción justo.

---

### [F11] HUD footer responsive · P1

**Qué:** En pantallas <500px, HUD footer colapsa en 2 líneas.  
**Dónde:** CSS del `#footer` y `#hud-left`  
**Cómo:**
```css
@media (max-width: 500px) {
  #footer { flex-direction: column; gap: 4px; padding: 5px 10px; }
  #hud-left { flex-wrap: wrap; gap: 5px; }
  #wave-name { font-size: 9px; }
  #sep { display: none; }
}
```
**Test:** DevTools 375px → todos los elementos visibles sin solapamiento.

---

### [F12] Game Over con estadísticas · P1

**Qué:** Mostrar wave máxima, ciclo máximo, enemigos destruidos, tiempo de partida.  
**Dónde:** Variables globales `totalKills`, `maxWave`, `maxCycle`, `sessionStart` + `showOverlay()`  
**Cómo:**
```js
// En startGame(): sessionStart = Date.now(); totalKills = 0; maxWave = 0; maxCycle = 0;
// En registerKill(): totalKills++;
// En nextWave(): maxWave = Math.max(maxWave, waveIdx%8+1); maxCycle = Math.max(maxCycle, cycle);
// En showOverlay(): añadir fila con estas stats sobre la tabla de scores
```
**Test:** Game Over → mostrar "Wave máx: 6 · Ciclo: 2 · Kills: 47 · Tiempo: 4:23".

---

### [F13] Timer visual de combo · P1

**Qué:** Barra horizontal decreciente bajo el texto de combo.  
**Dónde:** `updateComboHUD()` + render en canvas o CSS animation  
**Cómo:**
```js
// Opción CSS: div #combo-bar con width animada
// comboTimer va de 180 a 0 → width de 100% a 0% en 3 segundos
// Actualizar en cada frame: document.getElementById('combo-bar').style.width = (comboTimer/180*100)+'%'
```
**Test:** Hacer combo x2 → barra visible decreciendo → reset visual al expirar.

---

### [F19] Guard en misil guiado · P2

**Qué:** Si el target muere, buscar el siguiente más cercano en lugar de volar recto.  
**Dónde:** Game loop, sección "Balas jugador"  
**Cómo:**
```js
bullets.forEach(b=>{
  if(b.guided){
    // Si el target está muerto, reasignar
    if(b.targetRef && !b.targetRef.alive) b.targetRef = findNearestEnemy();
    if(b.targetRef){ /* ajuste de trayectoria normal */ }
  }
});
```
**Test:** Disparar guiado → matar target en vuelo → misil redirige al siguiente enemigo.

---

### [F22] Fix splice en forEach de powerups · P2

**Qué:** Reemplazar splice-en-forEach por filter post-iteración.  
**Dónde:** `checkCollisions()`, sección pickup powerup  
**Cómo:**
```js
// ANTES:
powerups.forEach((pu,i)=>{
  if(colision){ activatePowerup(pu.type); powerups.splice(i,1); }
});
// DESPUÉS:
const collected = [];
powerups.forEach(pu=>{
  if(colision){ activatePowerup(pu.type); collected.push(pu); }
});
powerups = powerups.filter(pu => !collected.includes(pu));
```
**Test:** Dos powerups en pantalla simultáneos → recoger ambos → sin crash ni skip.

---

### [F23] Hitbox boss circular · P2

**Qué:** Usar distancia euclidiana con radio reducido (0.65×size) para el boss.  
**Dónde:** `checkCollisions()`, bloque "vs boss"  
**Cómo:**
```js
// ANTES: Math.abs(b.x-boss.x)<boss.size && Math.abs(b.y-boss.y)<boss.size
// DESPUÉS:
const hitRadius = boss.size * 0.65;
const dx = b.x - boss.x, dy = b.y - boss.y;
if(dx*dx + dy*dy < hitRadius*hitRadius){ /* hit */ }
```
**Test:** Disparar al borde visual del boss → no registra hit · disparar al centro → hit.

---

### [F26] Duración visible de power-ups · P2

**Qué:** Barra de tiempo decreciente dentro de cada badge de power-up.  
**Dónde:** `activatePowerup()` + `updatePowerupHUD()`  
**Cómo:**
```js
// Guardar timestamp de activación: activePowerups[id+'_start'] = Date.now()
// En render (cada 100ms): calcular % restante y actualizar width de barra interna al badge
// CSS: .pu-badge::after { content:''; display:block; height:2px; background:currentColor; }
```
**Test:** Activar speed → badge muestra barra que decrece → desaparece al expirar.

---

### [F31] SFX de reset de combo · P3

**Qué:** Sonido suave cuando el combo expira.  
**Dónde:** `updateComboHUD()` cuando `comboTimer === 0`  
**Cómo:**
```js
// En el bloque if(comboTimer===0):
if(combo >= 3) playTone(220, 'sine', 0.1, 0.06); // tono bajo, sutil
combo=0; comboMult=1; updateComboHUD();
```
**Test:** Dejar expirar combo → sonido suave → texto desaparece.

---

### [F36] Celebración de nuevo récord · P3

**Qué:** Al superar el best score durante la partida, flash dorado + SFX fanfarria.  
**Dónde:** Bloque de actualización de `cachedBest` en `checkCollisions()`  
**Cómo:**
```js
if(score > cachedBest){
  cachedBest = score;
  // Flash dorado en HUD sc-best
  document.getElementById('sc-best').style.color = '#ff0';
  setTimeout(()=> document.getElementById('sc-best').style.color = '#4af', 600);
  // SFX fanfarria: [880,1108,1318,1760].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.08,0.2),i*80))
}
```
**Test:** Superar best → HUD parpadea dorado + fanfarria.

---

## SPRINT 3 — Arte, Audio y Retención
**Objetivo:** juego con alma y razones para volver  
**Hallazgos resueltos:** F06, F18, F24, F25, F33, F34, F35

---

### [F06] Sistema de logros básico · P1

**Qué:** 8 logros desbloqueables guardados en localStorage. Notificación en pantalla al conseguirlos.  
**Logros propuestos:**
```
🏆 PRIMER KILL      — Destruye tu primer enemigo
🔥 COMBO MAESTRO    — Alcanza x5 combo
🛡 BUNKER           — Aguanta toda una wave con escudo intacto
💀 BOSS SLAYER      — Derrota tu primer boss
🌀 SUPERVIVIENTE    — Completa el ciclo 2
⚡ SPEED DEMON      — Destruye 10 enemigos con power-up speed activo
🎯 FRANCOTIRADOR    — Completa una wave sin fallar un disparo
♾ VETERANO         — Alcanza ciclo 5
```
**Dónde:** Nuevo módulo `achievements.js` inline, persistencia en `localStorage['sm_achievements']`.  
**Test:** Conseguir "Primer Kill" → notificación aparece 2s → persiste entre sesiones.

---

### [F18] Suavizar escalón ciclo 1→2 · P2

**Qué:** Reducir el salto `perCycle` de 0.70 a 0.50 en `enemyBulletSpeed` y aumentar `perWave` de 0.18 a 0.22 para que la progresión intra-ciclo compense más.  
**Dónde:** `enemyBulletSpeed()` y `enemyShootTimer()`  
**Cómo:**
```js
// enemyBulletSpeed:
const perWave  = 0.22;  // era 0.18
const perCycle = 0.50;  // era 0.70

// enemyShootTimer:
const perWave  = 14;    // era 10
const perCycle = 18;    // era 22
```
**Test:** Jugar hasta ciclo 2 wave 1 → dificultad percibida como continuación, no salto.

---

### [F24] Balas enemigas diferenciadas visualmente · P2

**Qué:** Cada tipo de enemigo dispara balas con color y forma distinta.  
**Dónde:** `WAVES[]` añadir propiedad `bulletColor` + render de `e.ebullets`  
**Colores propuestos:**
```js
{ name:"SMARTPHONES",   bulletColor:'#4af', bulletShape:'rect' },
{ name:"AURICULARES",   bulletColor:'#fa4', bulletShape:'oval' },
{ name:"EMOJIS",        bulletColor:'#f4f', bulletShape:'star' },
{ name:"CRIPTOMONEDAS", bulletColor:'#4f8', bulletShape:'diamond' },
{ name:"INFLUENCERS",   bulletColor:'#f84', bulletShape:'rect' },
{ name:"DRONES",        bulletColor:'#8af', bulletShape:'oval' },
{ name:"NFTs",          bulletColor:'#f4a', bulletShape:'rect' },
{ name:"ALGORITMOS",    bulletColor:'#aff', bulletShape:'star' },
```
**Test:** Wave emojis → balas rosas/magenta → visualmente distintas del fondo y del escudo.

---

### [F25] Telegraph de ataque del boss · P2

**Qué:** 30 frames antes de disparar, el boss muestra un "cargando" visual (brillo en el cuerpo).  
**Dónde:** `updateBoss()` + `drawBoss()`  
**Cómo:**
```js
// En updateBoss: si boss.shootTimer <= 30, boss.telegraphing = true; else false
// En drawBoss: si boss.telegraphing, añadir cx.shadowBlur=20; cx.shadowColor=boss.color
// antes de dibujar el cuerpo — el boss "brilla" antes de disparar
```
**Test:** Boss a punto de disparar → brillo visible 0.5s → balas salen.

---

### [F33] Variación musical por ciclo · P3

**Qué:** A partir del ciclo 3, la música cambia a escala menor (modo más tenso).  
**Dónde:** `startMusic()` + `MUSIC_NOTES`  
**Cómo:**
```js
const MUSIC_MAJOR = [130,146,164,174,195,220,246,261,293,329,349,392];
const MUSIC_MINOR = [130,146,155,174,195,207,246,261,293,311,349,392];
const MUSIC_BOSS  = [110,123,138,146,165,185,207,220,246,277,311,330];

function currentScale(){
  if(isBossWave) return MUSIC_BOSS;
  if(cycle >= 3) return MUSIC_MINOR;
  return MUSIC_MAJOR;
}
// En setInterval: usar currentScale() en lugar de MUSIC_NOTES fijo
```
**Test:** Llegar a ciclo 3 → tono de música cambia perceptiblemente.

---

### [F34] SFX de expiración de power-up · P3

**Qué:** Sonido de "bajada" al expirar cada power-up.  
**Dónde:** `activatePowerup()`, en el setTimeout de expiración  
**Cómo:**
```js
activePowerups[type.id+'_timer'] = setTimeout(()=>{
  playTone(400, 'sine', 0.15, 0.08); // tono descendente
  setTimeout(()=> playTone(300,'sine',0.1,0.06), 100);
  delete activePowerups[type.id];
  updatePowerupHUD();
}, type.duration * 16.67);
```
**Test:** Activar power-up → esperar → sonido de bajada al expirar.

---

### [F35] Parallax de dos capas · P3

**Qué:** Añadir segunda capa de estrellas más grandes y lentas (sensación de profundidad).  
**Dónde:** Inicialización de `stars` + render loop  
**Cómo:**
```js
const starsNear = []; // 20 estrellas, size 1.5-2.5, speed 0.6-1.0
const starsFar  = []; // 50 estrellas, size 0.3-0.8, speed 0.1-0.3
// Render: primero starsFar (fondo), luego starsNear (delante)
```
**Test:** Fondo visible → dos capas de velocidad distintas → sensación de profundidad.

---

## SPRINT 4 — Accesibilidad y Compliance
**Objetivo:** listo para deploy público europeo  
**Hallazgos resueltos:** F14, F15, F16, F17, F28, F29, F30, F37, F38

---

### [F14] Mercy hitbox · P1

**Qué:** Reducir el hitbox de colisión del jugador de 18×14 a 10×8 (mercy hitbox clásico de arcade).  
**Dónde:** `checkCollisions()`, bloque balas enemigas vs jugador  
**Cómo:**
```js
// ANTES: Math.abs(b.x-player.x)<18 && Math.abs(b.y-player.y)<14
// DESPUÉS:
if(Math.abs(b.x-player.x)<10 && Math.abs(b.y-player.y)<8){ b.x=-999; playerHit(); }
```
**Test:** Bala pasa visualmente rozando la nave → no registra hit.

---

### [F15] Opción reducir movimiento · P1

**Qué:** Toggle "REDUCIR MOVIMIENTO" en menú. Desactiva screen shake, trails y parallax.  
**Dónde:** Variable global `reducedMotion` + guards en `applyShake()`, `addTrail()`, render estrellas  
**Cómo:**
```js
let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyShake(){
  if(reducedMotion) return; // skip
  // ... código actual
}
function addTrail(x,y,color,size){
  if(reducedMotion) return; // skip
  // ... código actual
}
```
**Test:** Activar toggle → explosión sin shake → nave sin trail → estrellas estáticas.

---

### [F16] Indicadores visuales para SFX · P1

**Qué:** Iconos de texto que aparecen brevemente en pantalla para eventos de audio importantes.  
**Eventos a indicar:** ESCUDO HIT, ESCUDO DESTRUIDO, WAVE CLEAR, COMBO, BOSS HIT  
**Dónde:** Nuevo sistema de floating text en canvas  
**Cómo:**
```js
const floatingTexts = [];
function addFloat(x, y, text, color){
  floatingTexts.push({x, y, text, color, life:60, vy:-0.8});
}
// En render: floatingTexts.forEach(ft=>{ ft.y+=ft.vy; ft.life--; cx.fillText(ft.text,...) })
// Llamar addFloat() junto a cada SFX importante
```
**Test:** Activar sin audio → floating texts visibles para todos los eventos.

---

### [F17] Aviso de localStorage · P1

**Qué:** Banner de una línea en el menú: "Este juego guarda tu puntuación localmente en tu dispositivo."  
**Dónde:** HTML del overlay de menú  
**Cómo:**
```html
<p style="font-size:9px;color:#224;margin-top:12px;max-width:280px;text-align:center;">
  Este juego guarda puntuaciones en tu dispositivo (localStorage). Sin datos personales.
</p>
```
**Test:** Menú visible → texto de aviso en la parte inferior del overlay.

---

### [F28] Contraste de hints · P2

**Qué:** Cambiar color de `.hint` de `#446` a `#667` (ratio ~4.6:1 sobre #050510).  
**Dónde:** CSS `.hint`  
**Cómo:**
```css
.hint { color: #7788aa; font-size: 10px; margin: 2px 0; }
```
**Test:** Chrome Accessibility → contraste de .hint ≥ 4.5:1.

---

### [F29] Remapeo básico de controles · P2

**Qué:** Pantalla de ajustes donde el jugador puede cambiar la tecla de disparo (por defecto Espacio).  
**Dónde:** Nuevo overlay `#settings` + variable `keyFire`  
**Cómo:**
```js
let keyFire = ' '; // Espacio por defecto
// En keydown handler: if(e.key === keyFire) fireBullet()
// Pantalla settings: "Pulsa una tecla para asignar DISPARO" → captura e.key → guarda en keyFire + localStorage
```
**Test:** Cambiar fire a 'z' → disparar con z → space ya no dispara.

---

### [F30] Rating IARC · P2

**Qué:** Añadir badge de rating en el footer del juego.  
**Proceso:** Registrar en https://www.globalratings.com (gratuito, ~10 min).  
**Resultado esperado:** PEGI 3 / ESRB Everyone.  
**Placeholder hasta obtener rating oficial:**
```html
<footer class="credits">
  SPACEMANIA · retro-game-mania · 2026 · 
  <span style="border:1px solid #446;padding:1px 4px;font-size:8px;">PEGI 3</span>
</footer>
```

---

### [F37] Touch targets mínimo 44×44 · P3

**Qué:** Aumentar padding de botones de dificultad en mobile.  
**Dónde:** CSS `.diff-btn` con media query  
**Cómo:**
```css
@media (hover: none) {
  .diff-btn { padding: 12px 22px; min-height: 44px; min-width: 44px; }
}
```
**Test:** DevTools mobile → botones con 44px de altura mínima.

---

### [F38] Namespace localStorage · P3

**Qué:** Renombrar key de `spacemania_scores` a `retro-game-mania.spacemania.scores`.  
**Dónde:** `loadScores()`, `saveScore()`  
**Cómo:**
```js
const LS_KEY = 'retro-game-mania.spacemania.scores';
// Migración automática si existe key antigua:
function migrateScores(){
  const old = localStorage.getItem('spacemania_scores');
  if(old && !localStorage.getItem(LS_KEY)){ localStorage.setItem(LS_KEY, old); }
}
// Llamar migrateScores() en initBest()
```
**Test:** Scores existentes migran → key antigua eliminable manualmente.

---

## Resumen de Sprints

| Sprint | Hallazgos | Esfuerzo estimado | Estado objetivo |
|---|---|---|---|
| Sprint 1 — Blockers | F01, F02, F03, F04, F08, F09, F10 | 1 sesión | Desplegable |
| Sprint 2 — UX & Feel | F05, F07, F11, F12, F13, F19, F22, F23, F26, F31, F36 | 1-2 sesiones | Pulido |
| Sprint 3 — Arte & Retención | F06, F18, F24, F25, F33, F34, F35 | 1 sesión | Con alma |
| Sprint 4 — Accesibilidad | F14, F15, F16, F17, F28, F29, F30, F37, F38 | 1 sesión | Deploy público |

**Versión resultante: 3.0.0** — lista para deploy en VPS bajo subdominio público.

---

## Regla de oro antes de cada sprint

Antes de implementar cualquier mejora de este plan, validar:

- [ ] ¿La mejora mantiene 60fps en Chrome mobile (DevTools throttling 4x)?
- [ ] ¿No introduce regresión en el sistema de colisiones?
- [ ] ¿El jugador la entiende sin leer documentación?
- [ ] ¿Funciona sin audio activo (contexto de accesibilidad)?
- [ ] ¿El código nuevo tiene guard contra estados nulos (boss null, enemy dead)?

Si algún punto falla → resolver primero o posponer la feature.

---

*SpaceMania Plan de Mejoras · retro-game-mania · 2026-05-31*
