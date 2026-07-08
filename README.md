# GemQuest MVP

GemQuest es un juego web tipo Match-3 construido como MVP para el Grupo B. El alcance toma como base los Entregables 1 y 2: tablero valido, intercambio de gemas adyacentes, deteccion de combinaciones, gravedad, recarga, puntuacion, movimientos limitados, tres niveles, progreso local, assets visuales personalizados y pantallas de resultado.

## Funcionalidades del MVP

- HU-01 a HU-06: tablero jugable, combinaciones, eliminacion, gravedad y nuevas fichas.
- HU-07 a HU-09: puntuacion, movimientos limitados y objetivos por nivel.
- HU-10 a HU-14: inicio, seleccion de nivel, victoria, derrota y persistencia de progreso.
- HU-15: mejor puntuacion por nivel guardada en `localStorage`.
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
npm start
```

Abrir `http://127.0.0.1:4173`.

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

El progreso se guarda en `localStorage` bajo la clave `gemquest-progress-v1`. Se almacena el ultimo nivel desbloqueado, los records por nivel y la preferencia de sonido.
