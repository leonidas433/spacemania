# SpaceMania 🚀

**retro-game-mania · 2026 Edition · v2.0.0**

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
Caen de forma aleatoria durante el juego (máx. 2 activos simultáneos):

| Power-up | Efecto | Duración |
|---|---|---|
| `x2` Doble disparo | Dispara 2 balas simultáneas | ~10 seg |
| `>>` Velocidad | Nave un 90% más rápida | ~8 seg |
| `⟳` Misil guiado | Bala sigue al enemigo más cercano | ~7 seg |

### Boss Wave 👾
- Aparece **cada 3 ciclos** al inicio del ciclo
- 3 fases progresivas: Mega Smartphone → Crypto Titan → AI Overlord
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
- Top 10 guardado en `localStorage` del navegador
- Persistente entre sesiones
- Visible en el menú principal y pantalla de game over

---

## 👾 Los 8 Enemigos

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

---

## 📁 Estructura del proyecto

```
retro-game-mania/
└── spacemania/
    ├── index.html    ← juego completo (standalone, sin dependencias)
    └── README.md     ← este archivo
```

---

## 🚀 Deploy en VPS

```nginx
location /spacemania {
    alias /var/www/retro-game-mania/spacemania;
    index index.html;
    add_header Cache-Control "no-cache";
}
```

---

## 📋 Roadmap

- [x] Sonido — Web Audio API
- [x] Boss wave cada 3 ciclos
- [x] Power-ups (doble, velocidad, guiado)
- [x] High scores localStorage
- [x] Screen shake + trails
- [x] Pausa con ESC
- [x] Dificultad seleccionable
- [x] Combo multiplier
- [ ] Leaderboard global (backend)
- [ ] Retos diarios
- [ ] Modo 2 jugadores
- [ ] Animaciones de boss death más elaboradas
- [ ] Sistema de niveles / progresión persistente

---

## Versiones

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0.0 | 2026-05-30 | Versión inicial — nave, escudo, 8 oleadas |
| 2.0.0 | 2026-05-31 | Audio, Boss, Power-ups, HiScores, FX, Pausa, Dificultad, Combo |

---

## ⚖️ Legal

SpaceMania es un juego original.  
Inspirado en la mecánica clásica de shooters arcade de los años 80.  
Ningún asset, nombre ni código extraído de títulos con copyright.

---

*retro-game-mania project · 2026*
