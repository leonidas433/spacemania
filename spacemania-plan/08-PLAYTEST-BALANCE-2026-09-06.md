# 08 — Playtest automatizado de balance (2026-09-06)

Contraste de las reglas de oro del doc 07 contra runs reales de la v3.0.0.

## Método

- Bot heurístico inyectado en `index.html` sin modificar el juego (Playwright, Chromium headless, tiempo real a 58-59 fps).
- Dos perfiles: **novato** (mira 0,5 s adelante, decide cada 6 frames, se congela un 6% del tiempo) y **pro** (mira 1,25 s adelante, decide cada frame).
- Tres escenarios, 5 runs cada uno, tope 10 minutos por run:
  - A: novato · Normal · sin upgrades
  - B: pro · Difícil · Hangar completo
  - C: pro · Normal · sin upgrades
- Limitación: el bot esquiva balas verticales casi sin fallo y no se despista. Un humano muere por atención, no por reflejos. Los datos de dificultad son una cota inferior de lo fácil que es el juego, no una medida de la experiencia humana.

## Resultados

| Escenario | Ciclo medio | Llega a ciclo 2 | Muertes | Frags/run | Ascensiones/run | Sinergias/run | Power-ups/run |
|---|---|---|---|---|---|---|---|
| A novato/Normal/sin | 4,8 | 5/5 | todas en ciclo 4-5 | 2072 | 12,0 | 6,6 | 40,6 |
| B pro/Difícil/todo | 4,8 | 5/5 | c3w11 una, resto ciclo 4-5 | 2600 | 11,8 | 5,8 | 42,4 |
| C pro/Normal/sin | 5,2 | 5/5 | c2w10 una, c3w3 una, resto ciclo 4-6 | 2334 | 12,6 | 4,4 | 41,6 |

Tres de cada cinco runs agotaron los 10 minutos sin morir del todo.

## Contraste con las reglas del doc 07

1. **"Un jugador nuevo sin upgrades debe llegar al ciclo 2 en Normal."** Se cumple con margen. Incluso el bot novato llega al ciclo 4. Los ciclos 1 a 3 no producen casi ninguna muerte: la presión real empieza en el ciclo 4 (bala 4,8 px/frame, cadencia mínima 45 frames).

2. **"Con todos los upgrades no debe sentirse invencible en Difícil."** Se cumple. El escenario B muere en el ciclo 4-5 igual que Normal sin upgrades. Difícil con Hangar completo equivale a Normal sin nada: los upgrades compensan casi exactamente el salto de dificultad.

3. **"El coste de los upgrades debe valer el esfuerzo, no un grind eterno."** Roto en la dirección contraria. El Hangar completo cuesta 1455 fragments y una run de 10 minutos da 2000-2600. Un jugador medio que muera en el ciclo 3 saca unos 800: compra todo en dos o tres partidas y la meta-progresión se agota. La fuente dominante es Score/100, que aporta 800-1500 por run; el resto de fuentes suman 400-500.

4. **"Ascensión debe ser un momento, no un estado permanente."** En el límite. Doce Ascensiones por run de 9 minutos son 120 s en modo Ascensión, un 21% del tiempo. La escalada del umbral (+15 por Ascensión) frena pero no lo suficiente.

5. **Sinergias.** Aparecen 4-7 por run con 40 power-ups recogidos, un 12% de conversión. ENJAMBRE (burst+guided) no salió en 15 runs: es la pareja de los dos power-ups más cortos (400 y 480 frames) y el intervalo entre drops es de 400-1000 frames, así que casi nunca se solapan. La detección es correcta, es estadística.

6. **Bosses.** Un boss por run. Aparece en el ciclo 3 y el siguiente en el 6, unos 7 minutos de juego entre ambos. Ninguna muerte contra el boss salvo una en C. El Quantum Algorithm y el Shadowban Phantom casi no se ven en una partida normal.

7. **Rendimiento.** 58-59 fps sostenidos en headless con 5 pestañas en paralelo. Sin regresiones.

## Palancas propuestas (pendientes de decisión)

| Problema | Palanca | Efecto esperado |
|---|---|---|
| Hangar se completa en 2-3 runs | Score/100 → Score/300 y Ciclos 40 → 25 | Run de ciclo 3 pasa de ~800 a ~400 frags; Hangar completo en 5-7 runs |
| Ciclos 1-3 sin presión | Subir `perWave` de 0,22 a 0,26 o bajar `base` del timer 160 → 140 | Adelanta la tensión un ciclo sin tocar el tope |
| Ascensión 21% del tiempo | Umbral base 100 → 130 o escalada +15 → +25 | Baja a 8-9 por run, ~15% del tiempo |
| Sinergias escasas y ENJAMBRE inexistente | Drop 400-1000 → 350-750 frames, o +90 frames a guided y burst | Conversión del 12% al 20-25% |
| Boss cada 3 ciclos | Boss cada 2 ciclos | 2 bosses en una run de 10 min |

Antes de tocar números conviene validar la palanca 1 con una partida humana: el bot no mide frustración ni atención.

## Re-test tras aplicar las palancas (v3.1.0, misma sesión)

Se aplicaron las cinco palancas: Score/300 y Ciclos 25, cadencia base 140, umbral de Ascensión 130, drops 350-750 frames, boss cada 2 ciclos. Mismos escenarios A y C, 5 runs cada uno.

| Métrica | A antes | A después | C antes | C después |
|---|---|---|---|---|
| Frags/run | 2072 | 1009 | 2334 | 1347 |
| Sinergias/run | 6,6 | 13,6 | 4,4 | 12,6 |
| Ascensiones/run | 12,0 | 9,4 | 12,6 | 12,6 |
| Bosses/run | 1,0 | 1,4 | 1,0 | 2,0 |
| Ciclo medio | 4,8 | 4,4 | 5,2 | 5,6 |
| Muertes contra boss | 0 | 0 | 1 | 5 de 8 |

Lectura:

- **Economía:** los fragments por run bajan a la mitad. Una run humana media que muera en el ciclo 3 pasa de unos 800 a unos 550 fragments, así que el Hangar completo (1455) cuesta unas 3 partidas en vez de 2. Sigue siendo rápido. Si se quiere estirar más, la siguiente palanca es Kills 0,5 → 0,3 (aporta 300 por run al bot).
- **Sinergias:** conversión del 12% al 25%. ENJAMBRE apareció 5 veces en 5 runs. Las diez sinergias salen ahora en una sesión normal.
- **Ascensión:** el umbral 130 apenas cambia la frecuencia con el bot pro. Cada kill da 4 a 10 puntos de barra, así que 30 puntos más son 3 o 4 kills. Para bajar de verdad la frecuencia habría que tocar la ganancia por kill, no el umbral.
- **Bosses:** dos por run en vez de uno y, por primera vez, el boss mata al bot. Los bosses nuevos ya se ven en una partida normal.
- **Cadencia:** con base 140 el suelo de 45 frames se alcanza en la wave 8 del ciclo 1 (antes en el ciclo 2). A partir del ciclo 3 casi todas las waves están en el suelo, así que la curva es plana en el medio juego. Si se quiere que la progresión siga notándose, subir el suelo o bajar `perWave`.

## Reproducir

Harness en scratchpad de la sesión (`playtest.mjs`, `agg.mjs`). Requiere `playwright@1.63.0` y el Chromium 1208 ya presente en `ms-playwright`.

```
node playtest.mjs <novato|pro> <easy|normal|hard> <none|all> <runs> <minutos> <salida.json>
node agg.mjs salida.json
```
