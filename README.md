# SpaceMania 🚀

**retro-game-mania · 2026 Edition · v3.1.0**

Un shooter arcade de ciencia ficción inspirado en los clásicos de los 80.  
Combate oleadas de objetos del mundo digital moderno en una pesadilla espacial.

---

## 🎮 Controles

| Control | Acción |
|---|---|
| `←` `→` o ratón | Mover la nave |
| `Espacio` o clic | Disparar |
| `←` `→` durante disparo | Guiar el misil en vuelo |
| `ESC` | Pausa / Continuar |
| Táctil | Deslizar mover, tocar disparar |

---

## 🛸 Mecánicas v2.0

### Nave — daño progresivo
- Aguanta **3 impactos** antes de explotar
- HP 3 → nave azul, intacta
- HP 2 → nave naranja, grieta visible
- HP 1 → nave roja, parpadeo con glow, dos grietas
- HP 0 → explosión animada con anillos y fragmentos → pierde una vida

### Escudo 🛡
- Cae en dos situaciones:
  - **Milestones de puntuación:** 2k / 6k / 12k / 20k / 35k / 55k pts
  - **Timer random:** cada 15-30 seg si no hay escudo activo
- Absorbe **4 impactos** · HUD muestra pips: azul → naranja → rojo → destruido

### Power-ups ⚡
Caen de forma aleatoria durante el juego (máx. 2 activos; al coger un tercero se sustituye el más antiguo):

| Power-up | Efecto | Duración |
|---|---|---|
| `x2` Doble disparo | Dispara 2 balas simultáneas | ~10 seg |
| `>>` Velocidad | Nave un 90% más rápida | ~8 seg |
| `⟳` Misil guiado | Bala sigue al enemigo más cercano | ~7 seg |
| `⇈` Perforante | Las balas atraviesan 1 enemigo extra | ~9 seg |
| `⁂` Ráfaga | Abanico automático de 3 balas cada 1.5 s | ~8 seg |

### Sinergias 🔗 (v3.0)
Dos power-ups activos a la vez crean una sinergia con efecto propio, anuncio y aura:

| Combinación | Sinergia | Efecto |
|---|---|---|
| x2 + Guiado | Barrage Guiado | Dos misiles, dos objetivos. Con uno solo: +25% daño |
| Velocidad + x2 | Ráfaga de Asalto | Balas extra automáticas al moverte rápido |
| Velocidad + Guiado | Cazador de Élite | Misil más ágil que explota al impactar |
| x2 + Perforante | Lluvia Perforante | Las dos balas perforan 2 enemigos |
| Guiado + Perforante | Lancero Digital | El misil perfora y vuelve a buscar objetivo |
| Velocidad + Ráfaga | Tormenta Móvil | El abanico dispara el doble de rápido en movimiento |
| Ráfaga + x2 | Muro de Fuego | Abanico de 5 balas |
| Ráfaga + Guiado | Enjambre | Las balas del abanico persiguen |
| Ráfaga + Perforante | Metralla | El abanico perfora |
| Perforante + Velocidad | Aguja | Balas más rápidas y +1 perforación |

**Overclock Total:** Ascensión activa + sinergia = 5 s de disparo triple guiado que rebota en los bordes.

### Ascensión ✦ (v3.0)
La barra morada bajo la energía se llena con kills, combos y esquivas. Al llenarse: **10 s de Modo Ascensión** con disparo automático, aura que destruye enemigos cercanos y drenaje de energía a la mitad. Cada ciclo cuesta más llenarla.

### Near-miss 💨 (v3.0)
Una bala enemiga que pasa rozando la nave sin tocarla da +5-15 puntos, un flash y carga la Ascensión.

### Data Fragments ◈ y Hangar (v3.0)
Al terminar cada partida ganas **Data Fragments** (mínimo 15) según score, waves, ciclos, kills, bosses y combo máximo. También caen mini-fragments al matar. Se gastan en el **Hangar** en mejoras permanentes:

| Mejora | Coste base | Efecto | Máx |
|---|---|---|---|
| Casco Reforzado | 80 | +1 HP máximo de nave | 2 |
| Reactor Eficiente | 60 | Energía se drena 12% más lento | 3 |
| Colector de Datos | 50 | Los drops caen más cerca de ti | 2 |
| Estabilizador de Combo | 70 | El combo dura +0.6 s | 3 |
| Escudo de Emergencia | 120 | Empiezas con 1 pip de escudo | 1 |
| Analizador | 90 | +15% fragments | 2 |
| Vida de Reserva | 200 | +1 vida al empezar | 1 |

### Modificadores de run ⚠ (v3.0)
25% de las partidas (100% con **Modo Desafío**) llevan un modificador con compensación en puntos: Gravity Flux, Overclocked Enemies, Sparse Drops, Glass Cannon o Data Rain.

### Daily Challenge 📅 (v3.0)
Cada día un desafío fijo generado por fecha (solo guiado, enemigos +40%, una vida, combo o nada, wave especial). Llegar al ciclo 2 da +100 fragments una vez al día. Top 5 local del día.

### Galería de Amenazas 📚 (v3.0)
Cada tipo de enemigo derrotado se cataloga con sprite y lore. Completarla da +5% fragments permanente.

### Boss Wave 👾
- Aparece **cada 2 ciclos** al inicio del ciclo (v3.1; antes cada 3)
- 5 fases progresivas: Mega Smartphone → Crypto Titan → AI Overlord → Shadowban Phantom (se desvanece y teleporta) → Quantum Algorithm (se divide al 50%)
- Telegraph: los ojos se iluminan 0.6 s antes de disparar, con aviso sonoro · 2 s de gracia al aparecer
- HP propio con barra visual · dispara en abanico
- Patrones de movimiento únicos por fase
- Recompensa masiva de puntos

### Combo Multiplier 🔥
- Destruir enemigos seguidos aumenta el combo
- Cada 3 kills seguidos: +1x al multiplicador (x2, x3, x4...)
- Timer de 3 segundos sin golpear resetea el combo
- Los puntos se multiplican en tiempo real

### Barra de energía
- Se agota durante cada oleada (más rápido en Difícil)
- Destruir enemigos la recupera +5%
- A 0 → pierde HP de nave

---

## 🎵 Audio (Web Audio API)
- Música chiptune generativa en bucle
- SFX: disparo, explosión, impacto escudo, recogida power-up, boss, combo, game over
- Se pausa con ESC
- Compatible con todos los navegadores modernos

---

## 🏆 Dificultades

| | Fácil | Normal | Difícil |
|---|---|---|---|
| Velocidad enemigos | 65% | 100% | 140% |
| Cadencia de disparo enemigo | Lenta | Normal | Rápida |
| Drenaje energía | 60% | 100% | 160% |
| Aumento por ciclo | +0.2 | +0.4 | +0.7 |

---

## 🏅 High Scores
- Top 20 guardado en `localStorage` del navegador, con nombre de jugador
- Al entrar en la tabla, la pantalla de Game Over pide el nombre estilo arcade: 7 caracteres, A-Z y 0-9. Enter guarda; salir sin confirmar guarda con el último nombre usado o `---`
- El top 5 del Daily Challenge sigue siendo solo numérico (sin nombre)
- Persistente entre sesiones
- Visible en el menú principal y pantalla de game over

---

## 👾 Los 12 Enemigos

| Wave | Enemigo | Patrón |
|---|---|---|
| 1 | Smartphones | Horizontal |
| 2 | Auriculares | Diagonal |
| 3 | Emojis | Zigzag |
| 4 | Criptomonedas | Swarm |
| 5 | Influencers | Diagonal |
| 6 | Drones | Swooping |
| 7 | NFTs | Zigzag |
| 8 | Algoritmos | Chaos |
| 9 | Deepfakes | Mirror · se duplican al morir |
| 10 | Spam Bots | Swarm · disparan balas dobles |
| 11 | Viral Memes | Zigzag · al morir te empujan |
| 12 | Singularity | Chaos · crecen si no los matas |

---

## 📁 Estructura del proyecto

```
retro-game-mania/
└── spacemania/
    ├── index.html        ← juego completo (standalone, sin dependencias)
    ├── counter.php       ← contador de visitas (SEÑALES INTERCEPTADAS), mismo origen
    ├── README.md         ← este archivo
    └── spacemania-plan/  ← plan de diseño de la v3.0
```

---

## 🚀 Deploy en VPS

URL de producción: **https://webdoctor.es/spacemania/**

Archivo estático dentro del vhost Plesk de webdoctor.es (`/var/www/vhosts/webdoctor.es/httpdocs/spacemania/index.html`). Sin nginx propio. Deploy: `scp` a `/home/claudedev/` y `sudo cp` al destino (nunca scp directo a httpdocs).

**Contador de visitas:** `counter.php` (PHP 8.3 del vhost) guarda el total en `/var/www/vhosts/webdoctor.es/spacemania-data/visits.json`, fuera de httpdocs, propietario `webdoctor.es_7w8mt7nd43i:psaserv`. Cuenta una visita por sesión (cookie `sm_v` de 30 min) y solo peticiones same-origin del propio juego. No guarda IPs ni datos personales. En `file://` o si el endpoint falla, el panel no se muestra.

---

## 📋 Roadmap

- [x] Sonido — Web Audio API
- [x] Boss wave cada 2 ciclos
- [x] Power-ups (doble, velocidad, guiado)
- [x] High scores localStorage (top 20 con nombre)
- [x] Screen shake + trails
- [x] Pausa con ESC
- [x] Dificultad seleccionable
- [x] Combo multiplier
- [ ] Leaderboard global (backend)
- [x] Retos diarios
- [ ] Modo 2 jugadores
- [x] Animaciones de boss death más elaboradas
- [x] Sistema de niveles / progresión persistente (Data Fragments + Hangar)

---

## Versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0.0 | 2026-05-30 | Versión inicial — nave, escudo, 8 oleadas |
| 2.0.0 | 2026-05-31 | Audio, Boss, Power-ups, HiScores, FX, Pausa, Dificultad, Combo |
| 2.1.0 | 2026-05-31 | Curva de dificultad progresiva por wave y ciclo |
| 3.0.0 | 2026-09-06 | Data Fragments + Hangar, sinergias, Ascensión, near-miss, waves 9-12, 2 bosses nuevos, modificadores, Daily, Galería, juice |
| 3.1.0 | 2026-09-06 | Balance tras playtest (economía de fragments, cadencia, Ascensión, drops, boss cada 2 ciclos) + top 20 con nombre de jugador |

---

## ⚖️ Legal

SpaceMania es un juego original.  
Inspirado en la mecánica clásica de shooters arcade de los años 80.  
Ningún asset, nombre ni código extraído de títulos con copyright.

---

*retro-game-mania project · 2026*
