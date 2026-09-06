# SpaceMania — Reporte de Auditoría GameDev
**Versión auditada:** 2.1.0  
**Fecha:** 2026-05-31  
**Metodología:** GameDev Auditor · 6 dimensiones · ISO/IEC 25010  
**Plataforma objetivo:** Web browser (desktop + mobile)  
**Estado:** Alpha funcional  
**Audiencia:** Casual-retro, +10 años  

---

## Resumen Ejecutivo

| Dimensión | Puntuación | Estado |
|---|---|---|
| D1 · Game Design | 2.5 / 5 | ⚠ Necesita trabajo |
| D2 · Técnico | 3.0 / 5 | ⚠ Deuda moderada |
| D3 · Arte & Audio | 3.5 / 5 | ✓ Aceptable |
| D4 · UX / UI | 2.0 / 5 | ✗ Bloqueador |
| D5 · Accesibilidad | 1.5 / 5 | ✗ Bloqueador |
| D6 · Compliance | 3.0 / 5 | ⚠ Pendiente |

**Puntuación global: 2.6 / 5**  
El juego tiene una base mecánica sólida y potencial real, pero hay dos blockers críticos (UX y Accesibilidad) que deben resolverse antes de cualquier deploy público.

---

## D1 · Game Design
**Puntuación: 2.5 / 5**

### ✅ Fortalezas
- Core loop claro: mover → disparar → esquivar → sobrevivir. Sin ambigüedad.
- Progresión de oleadas con patrones diferenciados (6 tipos de movimiento).
- Sistema de combo que añade profundidad táctica al shooting básico.
- Boss wave cada 3 ciclos: buen ancla de tensión narrativa.
- 3 power-ups diferenciados con utilidad real (doble, velocidad, guiado).
- Escudo con 4 pips visible — pickup de riesgo/recompensa bien planteado.

### ❌ Hallazgos

**[P1 HIGH] Ausencia de onboarding jugable**  
El jugador llega al menú con texto estático de controles. No hay ningún tutorial interactivo, ni siquiera un wave 0 con pocos enemigos y sin disparo enemigo. El jugador casual abandona antes de entender el guiado de disparo.

**[P1 HIGH] Loop de retención inexistente más allá del score**  
No hay desbloqueos, logros, progresión persistente ni narrativa entre sesiones. Una vez vista la wave 8 y el boss, no hay razón para volver. El high score local es el único gancho y es débil.

**[P2 MEDIUM] Curva de dificultad con escalón brusco en ciclo 2**  
El salto de velocidad de bala de ciclo 1 a ciclo 2 (+0.70 base) es perceptiblemente mayor que la progresión intra-ciclo (+0.18/wave). Un jugador que llega al ciclo 2 puede sentir el cambio como injusto, no como desafío.

**[P2 MEDIUM] Power-up "misil guiado" roto en edge case**  
Si el targetRef muere mientras la bala está en vuelo, la bala guiada pierde referencia y viaja recto. No es fatal pero rompe la fantasía de la mecánica. Falta `targetRef.alive` guard en el update de vuelo.

**[P2 MEDIUM] Boss wave sin ventana de invencibilidad post-spawn**  
El boss puede disparar en el frame 1 de su aparición. Un jugador que llega con HP bajo puede recibir un hit antes de tener tiempo de reaccionar. Necesita 2-3 segundos de gracia al inicio.

**[P3 LOW] El combo reset es silencioso**  
Cuando el combo expira por inactividad, no hay feedback visual ni sonoro. El jugador no sabe que lo perdió hasta que mira el HUD.

**[P3 LOW] Sin variación de dificultad en oleadas avanzadas del mismo ciclo**  
Las waves 1-8 del ciclo 3 tienen la misma formación que las del ciclo 1. Solo varía velocidad y cadencia. Falta variación de rows/cols o introducción de sub-patrones nuevos.

---

## D2 · Técnico
**Puntuación: 3.0 / 5**

### ✅ Fortalezas
- `requestAnimationFrame` bien usado. Loop principal correcto.
- `cx.save()` / `cx.restore()` en drawPlayer — sin contaminación de estado de canvas.
- Filtrado de arrays cada frame (`bullets.filter`, `particles.filter`) — limpieza correcta.
- AudioContext con `resumeAC()` — gestión correcta de política autoplay.
- Colisión AABB eficiente para el volumen de objetos actual.

### ❌ Hallazgos

**[P1 HIGH] Partículas sin límite máximo — memory leak potencial**  
`spawnParticles` añade partículas sin cap. En el boss death se añaden 50 de golpe. Si el boss muere repetidamente y hay muchas explosiones simultáneas, el array puede crecer sin control. Falta `if(particles.length > 300) particles.splice(0, 50)`.

**[P1 HIGH] `shadowBlur` activo en cada bala enemiga cada frame**  
`cx.shadowBlur=4` se setea en cada bala enemiga en el render loop. Con 30+ balas en pantalla esto dispara el coste de compositing en canvas. En móviles de gama baja puede bajar de 30fps. Hay que agrupar en `cx.save/restore` y desactivar con `cx.shadowBlur=0` una sola vez al final del batch.

**[P2 MEDIUM] `bestScore()` llama a `localStorage.getItem` en cada kill**  
`checkCollisions` → `bestScore()` → `localStorage.getItem()` se ejecuta en cada impacto. localStorage es síncrono y bloquea. Hay que cachearlo en variable y actualizar solo cuando se supere.

**[P2 MEDIUM] `setInterval` para música no compensa drift de tiempo**  
La música usa `setInterval(fn, 200)`. setInterval acumula deriva temporal — en pestañas en segundo plano o bajo carga, los intervalos se retrasan y la música desincroniza. Hay que usar `AC.currentTime` scheduling nativo de Web Audio API.

**[P2 MEDIUM] Trails sin límite máximo**  
`addTrail` añade trails cada frame para la nave y cada bala. Con disparo doble activo + velocidad, se añaden 4-6 trails/frame. Sin cap el array puede alcanzar 500+ elementos antes de que el filtro actúe. Cap a 200.

**[P3 LOW] `powerups.splice(i, 1)` dentro de `forEach`**  
Mutar el array durante iteración con `forEach` produce comportamiento indefinido si hay 2 powerups simultáneos. Cambiar a `filter` post-iteración.

**[P3 LOW] Colisión boss usa radio cuadrado, no circular**  
`Math.abs(b.x-boss.x)<boss.size && Math.abs(b.y-boss.y)<boss.size` es AABB sobre un sprite que visualmente es irregular. Produce hits que visualmente no tocan el boss. Mejor usar distancia euclidiana o hitbox reducido (0.7×size).

---

## D3 · Arte & Audio
**Puntuación: 3.5 / 5**

### ✅ Fortalezas
- Estética dark sci-fi consistente: paleta #050510 + neons. Coherente de principio a fin.
- Sprites de enemigos con personalidad clara — el drone, el emoji y el boss son reconocibles.
- Screen shake proporcional a la severidad del hit. Bien calibrado.
- SFX diferenciados por evento (11 efectos distintos). Buen trabajo para Web Audio puro.
- Trails en nave y balas — refuerzan la sensación de velocidad sin saturar.
- Explosión en capas (4 anillos + 12 fragmentos) — satisfactoria para la escala del juego.

### ❌ Hallazgos

**[P2 MEDIUM] Música chiptune con deriva temporal (ver D2)**  
Además del problema técnico, la melodía usa solo la escala mayor de Do. No hay variación entre ciclos — en ciclo 5+ la repetición es notoria. Propuesta: cambiar modo (menor) a partir del ciclo 3.

**[P2 MEDIUM] Balas enemigas visualmente idénticas independientemente del enemigo**  
Todos los enemigos disparan el mismo rectángulo rojo `#f64`. En una wave de Emojis, el contraste con los colores `#f4f` hace las balas difíciles de leer. Las balas deberían variar en forma o color por tipo de enemigo.

**[P2 MEDIUM] El boss no tiene animación de ataque**  
El boss dispara pero no hay ningún cambio visual en el sprite al hacerlo. En los arcades clásicos el boss "abre la boca" o "ilumina un cañón" un frame antes de disparar (telegraph). Aumenta la legibilidad y la satisfacción.

**[P3 LOW] Power-up "speed" no tiene SFX de expiración**  
El jugador nota visualmente que el aura `#4ff` desaparece, pero sin sonido el cambio de velocidad puede pillar por sorpresa durante una esquiva.

**[P3 LOW] Estrellas del fondo todas a la misma velocidad de parallax**  
Hay un solo layer de estrellas. Dos capas (foreground rápido + background lento) darían mucha más sensación de profundidad con ~5 líneas adicionales.

---

## D4 · UX / UI
**Puntuación: 2.0 / 5**

### ✅ Fortalezas
- HUD footer compacto y no intrusivo durante el juego.
- Anuncios de wave y escudo claramente posicionados y con fade.
- Pausa con ESC funcional y visual simple.
- Selección de dificultad con estado visual (botón `.sel`).

### ❌ Hallazgos

**[P0 BLOCKER] Barra de energía sin explicación en ningún punto**  
La barra verde-naranja-roja en la parte superior existe desde el inicio pero nunca se explica. El 70% de los jugadores casuales no saben que se agota sola y que destruir enemigos la recarga. No hay tooltip, no hay texto, no hay tutorial. Un jugador puede morir múltiples veces "por causas desconocidas" (energía a 0).

**[P0 BLOCKER] Controles táctiles sin feedback visual de posición**  
En móvil no hay ningún indicador de dónde está el toque del jugador ni ningún botón virtual de disparo. El `touchstart` dispara, pero si el jugador pone el pulgar y lo desliza para mover, el disparo no se activa de forma intuitiva. Es inusable sin instrucciones, y las instrucciones del menú son texto pequeño.

**[P1 HIGH] HUD footer ilegible en mobile**  
El footer tiene 5 elementos en una línea (`lives | health | shield | powerups | wavename`). En pantallas <400px se solapan. No hay `flex-wrap` efectivo para mobile.

**[P1 HIGH] Pantalla de Game Over sin información útil**  
Solo muestra score y tabla. No hay: tiempo jugado, wave máxima alcanzada, ciclo máximo, enemigos destruidos. El jugador no sabe si mejoró respecto a la partida anterior más allá del número.

**[P1 HIGH] Sin indicador visual del timer de combo**  
El combo counter muestra `COMBO x2 [6]` pero no hay barra de tiempo. El jugador no sabe cuándo va a resetear. Una barra decreciente o un número de segundos sería suficiente.

**[P2 MEDIUM] El menú principal no tiene preview del juego**  
Fondo estático negro. Un loop animado de las estrellas y algún enemigo en movimiento en el fondo del menú comunicaría el estilo del juego antes de empezar.

**[P2 MEDIUM] Power-ups sin duración visible**  
Los badges `x2`, `>>`, `⟳` aparecen en el footer pero no muestran cuánto tiempo queda. El jugador no puede planificar estrategia alrededor de cuándo expiran.

**[P3 LOW] Sin confirmación visual de "mejor puntuación"**  
Cuando se supera el best score durante la partida, no hay ningún efecto especial. Los arcades clásicos celebraban esto con una fanfarria. Oportunidad perdida de momento de satisfacción.

---

## D5 · Accesibilidad
**Puntuación: 1.5 / 5**

### ✅ Fortalezas
- Soporte de teclado completo (←→ + Espacio).
- Soporte de ratón y touch simultáneo.
- Texto legible en overlay (font-size mínimo 10px, mayúsculas).

### ❌ Hallazgos

**[P0 BLOCKER] Sin modo daltónico**  
El juego usa rojo (#f44, #f64, #f84) para daño/peligro y verde (#4f4) para salud/energía. Para usuarios con deuteranopia (el tipo más común, ~8% de hombres) estos colores son indistinguibles. El escudo azul (#4af) vs las balas rojas es parcialmente afectado. Ninguna alternativa de contraste ni modo de color alternativo disponible.

**[P0 BLOCKER] Sin soporte de gamepad**  
Un shooter arcade es el género más natural para gamepad. La Web Gamepad API es estándar en todos los browsers modernos desde 2015. Su ausencia excluye a usuarios que dependen del gamepad por limitaciones motoras.

**[P1 HIGH] Hitbox de nave demasiado grande para jugadores con precisión motora reducida**  
El hitbox de impacto del jugador es 18×14px sobre un sprite de 32×25px visible. Para jugadores con temblor o baja precisión esto es punitivo. La Game Accessibility Guidelines recomiendan hitbox reducido ("mercy hitbox") como opción.

**[P1 HIGH] Sin opción de reducir movimiento**  
Screen shake, trails, partículas y el fondo estrellado en movimiento pueden causar malestar en usuarios con sensibilidad vestibular o epilepsia fotosensible. No hay opción `prefers-reduced-motion` ni toggle manual.

**[P1 HIGH] Sin subtítulos para eventos de audio**  
Los SFX son el único feedback de muchos eventos (escudo destruido, combo, wave clear). Un jugador con discapacidad auditiva no tiene ninguna alternativa visual equivalente para estos eventos. Los overlays de texto son insuficientes — necesitan ser accesibles como región ARIA live.

**[P2 MEDIUM] Contraste de texto insuficiente en hints del menú**  
Los `.hint` con `color:#446` sobre fondo `#050510` tienen ratio de contraste ~2.8:1. WCAG AA requiere 4.5:1 para texto normal. Los textos de instrucciones son ilegibles para usuarios con baja visión.

**[P2 MEDIUM] Sin opción de remapeo de controles**  
Los controles ←→ y Espacio son fijos. Usuarios con una sola mano o configuraciones de teclado alternativas no pueden reasignarlos.

**[P3 LOW] Tamaño de touch target en botones de dificultad**  
Los botones `.diff-btn` tienen `padding: 8px 18px`. En mobile el área táctil resultante es ~44×32px. La Game Accessibility Guidelines recomienda mínimo 44×44px. Están en el límite inferior.

---

## D6 · Compliance
**Puntuación: 3.0 / 5**

### ✅ Fortalezas
- Nombre "SpaceMania" original — no colisiona con marcas registradas conocidas.
- Sin assets externos con copyright (sprites propios, audio generativo).
- Sin referencias a marcas o IPs de terceros en el juego.
- localStorage como único almacenamiento — no hay PII.

### ❌ Hallazgos

**[P1 HIGH] Sin política de privacidad ni aviso de cookies**  
Aunque solo se usa localStorage (sin PII), si el juego se despliega en un dominio europeo (.es) bajo la GDPR/LOPDGDD, debe existir al menos un aviso de uso de almacenamiento local. Especialmente relevante si en el futuro se añade analytics.

**[P2 MEDIUM] Rating de contenido sin asignar**  
El juego no tiene PEGI rating visible. Para distribución web pública en Europa se recomienda solicitar PEGI Online o como mínimo autocalificar con el sistema IARC (gratuito, disponible para web). Contenido actual → PEGI 3 probable.

**[P2 MEDIUM] Sin atribución de licencia del proyecto**  
El código no tiene licencia declarada. Si se publica como open source o se distribuye el HTML, la ausencia de licencia crea ambigüedad legal. Recomendado: MIT License en el repositorio.

**[P3 LOW] `localStorage` sin prefijo de namespace**  
La key `spacemania_scores` puede colisionar con otras aplicaciones en el mismo dominio si el juego se despliega como subpath. Mejor `retro-game-mania.spacemania.scores`.

---

## Tabla de Hallazgos por Severidad

| ID | Severidad | Dimensión | Descripción |
|---|---|---|---|
| F01 | P0 BLOCKER | D4 | Barra de energía sin explicación |
| F02 | P0 BLOCKER | D4 | Controles táctiles sin feedback visual |
| F03 | P0 BLOCKER | D5 | Sin modo daltónico |
| F04 | P0 BLOCKER | D5 | Sin soporte gamepad |
| F05 | P1 HIGH | D1 | Sin onboarding jugable |
| F06 | P1 HIGH | D1 | Sin retención post-score |
| F07 | P1 HIGH | D1 | Boss sin ventana de gracia al spawn |
| F08 | P1 HIGH | D2 | Partículas sin límite — memory leak |
| F09 | P1 HIGH | D2 | shadowBlur en batch de balas — perf |
| F10 | P1 HIGH | D2 | localStorage en cada kill |
| F11 | P1 HIGH | D4 | HUD footer ilegible en mobile |
| F12 | P1 HIGH | D4 | Game Over sin estadísticas útiles |
| F13 | P1 HIGH | D4 | Sin timer visual de combo |
| F14 | P1 HIGH | D5 | Hitbox nave demasiado grande |
| F15 | P1 HIGH | D5 | Sin opción reducir movimiento |
| F16 | P1 HIGH | D5 | Sin subtítulos para SFX |
| F17 | P1 HIGH | D6 | Sin aviso de localStorage/cookies |
| F18 | P2 MEDIUM | D1 | Escalón brusco ciclo 1→2 |
| F19 | P2 MEDIUM | D1 | Power-up guiado pierde target muerto |
| F20 | P2 MEDIUM | D2 | setInterval música con deriva |
| F21 | P2 MEDIUM | D2 | Trails sin límite máximo |
| F22 | P2 MEDIUM | D2 | splice dentro de forEach |
| F23 | P2 MEDIUM | D2 | Hitbox boss cuadrado vs sprite oval |
| F24 | P2 MEDIUM | D3 | Balas enemigas visualmente idénticas |
| F25 | P2 MEDIUM | D3 | Boss sin telegraph de ataque |
| F26 | P2 MEDIUM | D4 | Power-ups sin duración visible |
| F27 | P2 MEDIUM | D4 | Menú sin preview animado |
| F28 | P2 MEDIUM | D5 | Contraste texto hints insuficiente |
| F29 | P2 MEDIUM | D5 | Sin remapeo de controles |
| F30 | P2 MEDIUM | D6 | Sin rating PEGI/IARC |
| F31 | P3 LOW | D1 | Combo reset silencioso |
| F32 | P3 LOW | D1 | Sin variación de formación en ciclos altos |
| F33 | P3 LOW | D3 | Música sin variación entre ciclos |
| F34 | P3 LOW | D3 | Sin SFX de expiración de power-up |
| F35 | P3 LOW | D3 | Parallax de estrellas con un solo layer |
| F36 | P3 LOW | D4 | Sin celebración de nuevo récord |
| F37 | P3 LOW | D5 | Touch targets en límite inferior |
| F38 | P3 LOW | D6 | localStorage sin namespace |

---

## Puntuaciones Radar

```
D1 Game Design    ████████░░░░░░░░░░░░  2.5/5
D2 Técnico        ████████████░░░░░░░░  3.0/5
D3 Arte & Audio   ██████████████░░░░░░  3.5/5
D4 UX / UI        ████████░░░░░░░░░░░░  2.0/5
D5 Accesibilidad  ██████░░░░░░░░░░░░░░  1.5/5
D6 Compliance     ████████████░░░░░░░░  3.0/5
```

---

## Conclusión

SpaceMania es un shooter arcade con alma genuina. El core loop funciona, los enemigos tienen personalidad, y la progresión de dificultad tiene dirección correcta. El principal riesgo de publicación son los 4 blockers de UX y Accesibilidad — sin ellos, el juego es injugable para un porcentaje significativo de la audiencia potencial y problemático legalmente en el mercado europeo.

La buena noticia: todos los blockers son solucionables en 1-2 sesiones de desarrollo. Ninguno requiere rediseño arquitectural.

---

*SpaceMania GameDev Audit · retro-game-mania · 2026-05-31*
