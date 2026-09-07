# SpaceMania v4 — Estado de implementación

Fecha: 7 de septiembre de 2026. Versión entregada: 4.0.0.

Este documento contrasta lo implementado con el checklist de aceptación de
`04-V4-TESTS-AND-ACCEPTANCE.md`. La referencia de comportamiento es el código,
no los documentos de diseño.

## Checklist de aceptación

| Criterio | Estado | Dónde |
|---|---|---|
| Director aislado de la lógica de movimiento | Cumplido | El director no mueve entidades. Arma eventos que usan `makeEnemy`, `movePattern`, `killEnemy`, `addScore` y las colisiones existentes |
| Eventos seleccionados por pesos y contexto | Cumplido | `eventWeight()` y `pickEvent()` |
| Anti-repetición | Cumplido | `lastEventId`, `recentEvents` y cooldown por evento. Un evento abortado también cuenta |
| Pity | Cumplido | `pityCounter`, garantía tras 4 oleadas en calma |
| Telegraph estándar | Cumplido | `startEventTelegraph()` y `drawEventTelegraph()` |
| 3 eventos funcionales mínimos | Superado | 10 eventos en catálogo |
| Relief/Climax pacing | Cumplido | `WAVE_ROLES` y `ROLE_KINDS` filtran por papel de oleada |
| 2 rutas funcionales | Cumplido | `ROUTES`: Alpha y Eclipse |
| 3 secretos funcionales | Cumplido | Señal Solitaria, Fragmento Espectral y Transmisión Desconocida |
| Boss anticipation | Cumplido | `primeBossAnticipation()` con aviso a dos y a una oleada, más silencio previo |
| Daily determinista | Cumplido | El director se siembra con la semilla del día |
| Reduced motion compatible | Cumplido | Sin temblor ni pulsos; las señales siguen siendo legibles |
| Colorblind compatible | Cumplido | Ninguna señal depende solo del color: anillos, siluetas, formas y marcas |
| Anuncios para lector de pantalla | Cumplido | `announce()` en cada evento relevante, con el throttle existente |
| Sin regresión de power-ups, sinergias, Ascensión ni bosses | Cumplido | 172 comprobaciones en verde |
| Sin fuga de entidades ni de estado | Cumplido | `cleanupEventEntities()` y test de huérfanos |
| Sin dependencia externa, sin WebGL, sin arrays por frame | Cumplido | La suite `syntax` lo vigila y falla si se rompe |
| Tests actuales y nuevos pasan | Cumplido | 172 comprobaciones, 66 de ellas del director |

## Objetivos cuantitativos

Medidos con `tests/tools/v4-probe.mjs`, cuatro partidas del bot de seis minutos.

| Objetivo del plan | Medido |
|---|---|
| Ningún evento domina más del 35% | Entre el 11% y el 40% según partida; el caso alto es una partida corta con pocas muestras |
| La secuencia no coincide entre partidas | Cuatro partidas, cuatro secuencias distintas |
| 100% de los eventos peligrosos con telegraph | Cumplido y verificado por test sobre todo el catálogo |
| Cero repeticiones consecutivas | Cero en las cuatro partidas |
| Cero entidades huérfanas | Cero |
| Relief tras alta intensidad | La amenaza pierde peso con intensidad alta y los papeles `relief` solo admiten bonus y secretos |

## Catálogo entregado

| Evento | Clase | Qué cambia mecánicamente |
|---|---|---|
| Mensajero de datos | bonus | Objetivo blindado y veloz. Al caer: puntos, mini-fragmentos y power-up garantizado |
| Blancos de precisión | bonus | Tres objetivos de alto valor. Bonus si caen los tres |
| Lluvia de datos | bonus | Fragmentos por toda la pantalla; obliga a decidir riesgo |
| Parásito de señal | amenaza | Acelera la cadencia de toda la oleada mientras vive |
| Cazador | amenaza | Marca el suelo y dispara a la marca, no al jugador |
| Señal falsa | sorpresa | Cápsula falsa que se revela a media pantalla; recogerla cuesta energía |
| Eco fantasma | sorpresa | Trío que se desvanece y reaparece donde marca su silueta |
| Duplicado | sorpresa | Copias temporales, frágiles y mudas, de la propia oleada |
| Señal solitaria | secreto | Punto tenue sin anuncio. Verlo y dispararlo da recompensa alta |
| Fragmento espectral | secreto | Solo aparece tras combo alto o racha de esquivas |

## Rutas

- **Alpha**: la partida conocida.
- **Eclipse**: multiplica la puntuación por 1,3, acelera la oleada un 12% y sube
  la frecuencia de eventos. Se abre por tres transmisiones desconocidas, por
  combo 18 o por una racha de doce esquivas. Umbrales deliberadamente altos:
  si saliera en toda partida dejaría de ser un descubrimiento.

## Objetivos ocultos

Cuatro, sin explicación en pantalla: oleada impecable, sin un rasguño, baile de
balas y silencio táctico. Al cumplirse dan puntos y quedan en el registro.

## Fuera de alcance en esta entrega

- Más de dos rutas. El plan pide profundidad antes que cantidad.
- Variantes de formación por oleada (`applyWaveVariant`). El papel de oleada ya
  aporta variación de ritmo; las variantes de formación son el siguiente paso.
- Persistencia del historial de eventos entre partidas. Solo se persisten los
  descubrimientos, con el prefijo de localStorage existente.

## Riesgo conocido

Con un jugador muy rápido, una oleada dura unos nueve segundos y los eventos
más largos pueden abortarse al cambiar de oleada. El aborto es limpio y cuenta
para la anti-repetición, pero conviene revisar duraciones si el playtest humano
detecta eventos que se cortan a menudo.
