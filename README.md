# GemQuest

GemQuest es un juego web tipo Match-3 en evolucion hacia una version de produccion para el Grupo B. El producto incluye tablero valido, intercambio de gemas adyacentes, deteccion de combinaciones, gravedad, recarga, puntuacion, movimientos limitados, niveles, autenticacion con Clerk, progreso por usuario, assets visuales personalizados y pantallas de resultado.

## Funcionalidades principales

- HU-01 a HU-06: tablero jugable, combinaciones, eliminacion, gravedad y nuevas fichas.
- HU-07 a HU-09: puntuacion, movimientos limitados y objetivos por nivel.
- HU-10 a HU-14: inicio, seleccion de nivel, victoria, derrota y persistencia de progreso por cuenta.
- HU-15: mejor puntuacion por nivel guardada por usuario autenticado.
- HU-16/HU-17: fichas con siluetas distintas, animacion al eliminar combinaciones y sonido basico generado en el navegador.
- Interaccion por clic o arrastre: el jugador puede seleccionar gemas con clic o arrastrar una gema hacia una celda adyacente.
- Set visual personalizado de gemas en `assets/gems/`, con imagenes PNG uniformes para los seis tipos de ficha.
- Overlay de victoria animado al completar un nivel, con resumen de puntuacion, record, botones de avance y efecto de confetti.
- Regla actual: cada intercambio adyacente consume 1 movimiento, aunque no forme combinacion.

## Experiencia visual

- Las gemas se renderizan con assets PNG transparentes para mantener un estilo uniforme en el tablero.
- Al arrastrar una gema, la ficha seleccionada aumenta ligeramente de escala y la celda objetivo se resalta.
- Al completar un nivel aparece una interfaz modal de victoria sobre el tablero, con fondo atenuado, animacion de entrada y confetti.
- Al perder, se mantiene una tarjeta de resultado integrada en el panel lateral para permitir reintentar rapidamente.

## Niveles

| Nivel | Objetivo | Movimientos | Dificultad |
| --- | --- | --- | --- |
| 1 | Lograr 780 puntos | 18 | Base |
| 2 | Eliminar 20 gemas Zafiro | 20 | Media |
| 3 | Romper 8 obstaculos | 24 | Alta |

## Ejecucion local

```bash
npm install
npm start
```

Abrir `http://127.0.0.1:4173`.

## Autenticacion con Clerk

Clerk es obligatorio para ejecutar GemQuest como producto final. Sin `CLERK_PUBLISHABLE_KEY`, la app muestra una pantalla de configuracion y no permite jugar.

1. Crea una aplicacion en `https://dashboard.clerk.com`.
2. Copia la publishable key del proyecto.
3. Configura los dominios permitidos y URLs de redireccion en Clerk para tu entorno local y produccion.
4. Crea `.env` a partir de `.env.example`:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
HOST=0.0.0.0
PORT=4173
```

El servidor solo expone esta llave publica al navegador desde `/clerk-config.json`; no uses `CLERK_SECRET_KEY` en codigo cliente. Cada cuenta guarda su progreso en una clave propia de `localStorage` basada en el ID de usuario de Clerk.

## Pruebas

```bash
npm test
```

## Validacion de build

```bash
npm run build
```

## Estructura

```text
.
|-- index.html
|-- assets/
|   `-- gems/
|       |-- amber.png
|       |-- black.png
|       |-- blue.png
|       |-- green.png
|       |-- red.png
|       `-- violet.png
|-- src/
|   |-- app.js
|   |-- gameLogic.js
|   `-- styles.css
|-- tests/
|   `-- gameLogic.test.js
|-- scripts/
|   |-- server.mjs
|   `-- validate-static.mjs
|-- docs/
|   `-- modelado.md
|-- Planificacion_Gestion_Agil_GemQuest.md
`-- .github/workflows/ci.yml
```

## DevOps

El repositorio incluye un pipeline de GitHub Actions que ejecuta `npm run build` y `npm test` en cada push o pull request.

## Persistencia

El progreso se guarda en `localStorage` bajo la clave `gemquest-progress-v1:<clerk-user-id>`. Se almacena el ultimo nivel desbloqueado, los records por nivel y la preferencia de sonido para cada cuenta.

## Bitacora de cambios

| Fecha | Responsable | Cambios realizados |
| --- | --- | --- |
| 2026-07-09 | Sebastian | Se agrego una pantalla de derrota dedicada con estilo triste, resumen de puntaje/progreso, botones de reintento y mapa, y el sprite `assets/pirata_sprite.png` como personaje derrotado. |
| 2026-07-09 | Sebastian | Se reemplazo el pirata dibujado con CSS por el sprite `assets/pirata.png` en la pantalla de victoria, manteniendo la animacion de entrada del personaje. |
| 2026-07-08 | Sebastian | Se mejoro la guia rapida con contraste correcto para la paleta navy/dorado, pasos numerados y tarjetas de gemas legibles con nombre y puntos. |
| 2026-07-08 | Sebastian | Se agregaron transiciones mas naturales al completar un nivel: el tablero celebra y se atenua, el fondo de victoria entra con blur, la tarjeta aparece con rebote suave y los elementos de recompensa entran de forma escalonada. Tambien se adapto la paleta general del juego a tonos navy/dorado para integrarse con la pantalla de victoria. |
| 2026-07-08 | Sebastian | Se rediseno la pantalla de victoria con estilo de recompensa: pirata anfitrion, estrella central animada, monedas ganadas, puntaje obtenido, barra de progreso del episodio y botones para siguiente nivel, repetir o volver al mapa. |
| 2026-07-08 | Sebastian | Se completo la HU-12 con una pantalla de victoria dedicada: objetivo cumplido, estrellas destacadas, puntuacion, movimientos restantes, record anterior, aviso de nuevo record y acciones para avanzar o volver a niveles. |
| 2026-07-08 | Sebastian | Se reorganizo la pantalla de juego separando visualmente el tablero del panel de objetivo/progreso. Se agregaron valores de puntaje por tipo de gema y se mejoro la guia de ayuda con la tabla de gemas y puntos. Se actualizaron textos visibles para tratar GemQuest como producto en mejora hacia produccion y no como MVP. |
| 2026-07-08 | Sebastian | Se agrego un boton fijo de ayuda con icono de interrogacion para consultar como jugar, como generar combos, como sumar mas puntos y como funcionan las gemas dentro del sistema actual. |
| 2026-07-08 | Sebastian | Se completo el flujo visual de victoria con overlay animado, tarjeta de resultado y confetti. Se corrigio el estado de arrastre para mantener el intercambio por drag sin clic duplicado despues del movimiento. |
| 2026-07-08 | Sebastian | Se agregaron assets personalizados y uniformes para las gemas en `assets/gems/`. Se mejoro la interaccion del tablero con arrastre de gemas, resaltado de celda destino y efectos visuales durante el movimiento. Se incorporo una pantalla modal de victoria con animacion de entrada, fondo atenuado, resumen de puntuacion, record y confetti. Se actualizo la documentacion del proyecto y se agrego el archivo `Planificacion_Gestion_Agil_GemQuest.md`. |
