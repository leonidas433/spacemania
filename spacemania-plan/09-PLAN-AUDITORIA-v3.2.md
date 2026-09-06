# 09 — Plan de acción sobre la auditoría del 6 de septiembre de 2026 (v3.2.0)

## Verificación previa de la auditoría

Tres hallazgos de la auditoría parten de una premisa falsa. Verificado el 6 de septiembre de 2026 contra `origin/main` y contra producción:

| Hallazgo de la auditoría | Realidad verificada |
|---|---|
| **[P1]** "El repositorio de GitHub no está sincronizado con la versión live" | **Falso.** `main` local, `origin/main` y producción tienen el mismo `index.html`, checksum `7bbade60`. Seis commits del 6 de septiembre ya publicados. |
| "README + index.html en main siguen en ~v2.1" | **Falso.** El README declara v3.1.0 y describe los 12 enemigos, Hangar, sinergias, Ascensión, Daily y Galería. Solo quedaba un encabezado obsoleto, "Mecánicas v2.0". |
| "Badge PEGI 3 placeholder" | **Ya resuelto** horas antes de la auditoría. El pie muestra una autodeclaración de edad; el logo PEGI se retiró por ser marca registrada. |
| "Single-file (~2030 líneas)" | 2464 líneas. |

Los demás hallazgos son correctos y se aceptan.

## Alcance excluido y por qué

La auditoría deriva en una cadena de propuestas de renderizado: sistema de partículas en WebGL, quads instanciados, atlas de texturas procedural, interpolación de fotogramas, ruido Perlin y Worley, texturas 3D, y simulación física en el vertex shader.

Queda fuera de este plan, por tres razones:

1. **Contradice una restricción explícita del proyecto.** `CLAUDE.md` fija "vanilla JS + Canvas 2D + Web Audio API" como invariante de diseño, no como una limitación temporal.
2. **No hay dato que lo justifique.** El harness de playtest mide 58 a 60 fotogramas por segundo sostenidos en quince partidas completas. No existe una medición que sitúe el cuello de botella en el dibujado de partículas.
3. **El riesgo es desproporcionado.** Sustituir la capa de render de un juego en producción, con su propio contexto gráfico, su ruta de respaldo y su sincronización con el temblor de pantalla, para resolver un problema no medido, es la definición de optimización prematura.

Lo que sí se toma de esa sección es el diagnóstico vanilla: sombras difuminadas en el bucle caliente, reconstrucción de arrays cada fotograma, y ausencia de calidad adaptativa. Eso se resuelve dentro de Canvas 2D.

Si en algún momento un móvil real mide por debajo de 45 fotogramas con el modo de ahorro ya activo, se reabre la discusión con ese dato en la mano.

## Fases

### Fase 1 — Compliance

- **LICENSE ausente.** Se añade licencia MIT a nombre del autor. Es el único hallazgo de nivel P1 real de la auditoría.
- README: corregir el encabezado "Mecánicas v2.0".

### Fase 2 — Rendimiento en móvil, dentro de Canvas 2D

- **Modo de ahorro.** Bandera `LOW_FX`, activa en punteros gruesos, en pantallas estrechas o con movimiento reducido. Degradación automática si la tasa media baja de 45 durante dos segundos, con aviso al jugador y sin volver atrás en la misma partida.
- **Sombras difuminadas.** Se retiran del bucle caliente en modo de ahorro y se agrupan por color en el resto. El dibujado de balas pasa de una conmutación de sombra por bala a una por color distinto.
- **Sin reconstrucción de arrays.** Partículas, estelas y balas se compactan en el sitio en lugar de crear un array nuevo cada fotograma.
- **Reserva de objetos.** Balas y partículas se reutilizan desde una reserva. Elimina la presión sobre el recolector de basura en combate intenso.
- **Topes por calidad.** Partículas y estelas tienen tope propio en modo de ahorro.
- **Nitidez en escritorio.** El lienzo se dibuja a la densidad real del dispositivo, con tope de dos, y contexto opaco. En modo de ahorro se mantiene la densidad actual para no penalizar el rendimiento.

### Fase 3 — Accesibilidad

- **Eventos sonoros anunciados.** Región de estado para lector de pantalla que anuncia escudo destruido, Ascensión, combos altos, aparición y caída del jefe, y sinergias. Con limitación de frecuencia para no saturar.
- **Hitbox indulgente.** Opción en CONTROLES que reduce el área de impacto del jugador. Pensada para precisión reducida.
- **Contraste.** Las pistas secundarias suben de contraste hasta cumplir el mínimo de texto pequeño.

### Fase 4 — Arte y feedback

- **Balas enemigas distinguibles.** Cada familia de oleada dibuja su proyectil con una forma propia, no solo con un color propio. Sirve además al modo daltónico.

### Fase 5 — Retención a largo plazo

- **Prestigio.** Al completar el Hangar se desbloquea el Ascenso de Flota: reinicia las mejoras a cambio de un multiplicador permanente de fragmentos y una insignia visible. Da recorrido al jugador que ya lo tiene todo.

## Fuera de alcance en esta iteración

- Reescritura del renderizado en WebGL, en cualquiera de sus variantes.
- División del archivo único. La auditoría lo señala como riesgo futuro, no como problema actual, y el archivo único es una restricción de diseño deliberada.
- Rating IARC oficial. No es alcanzable para una web propia; requiere una tienda participante. Documentado en el historial de la sesión.
- Reconstrucción de superposiciones con innerHTML. Funciona y el coste de cambiarlo hoy no se justifica.

## Verificación

Cada fase se comprueba con el harness de Playwright ya existente. Criterios:

- Las tres suites actuales siguen en verde: tabla de puntuaciones, contador de visitas y tutorial.
- Suite nueva para modo de ahorro, hitbox indulgente, anuncios accesibles y prestigio.
- Comparación de fotogramas por segundo antes y después con el bot en dos escenarios.
- Sin errores de JavaScript en consola en ninguna pantalla.
