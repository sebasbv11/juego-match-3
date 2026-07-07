# GemQuest MVP

GemQuest es un juego web tipo Match-3 construido como MVP para el Grupo B. El alcance toma como base los Entregables 1 y 2: tablero valido, intercambio de gemas adyacentes, deteccion de combinaciones, gravedad, recarga, puntuacion, movimientos limitados, tres niveles, progreso local y pantallas de resultado.

## Funcionalidades del MVP

- HU-01 a HU-06: tablero jugable, combinaciones, eliminacion, gravedad y nuevas fichas.
- HU-07 a HU-09: puntuacion, movimientos limitados y objetivos por nivel.
- HU-10 a HU-14: inicio, seleccion de nivel, victoria, derrota y persistencia de progreso.
- HU-15: mejor puntuacion por nivel guardada en `localStorage`.
- HU-16/HU-17: retroalimentacion visual y sonido basico generado en el navegador.

## Niveles

| Nivel | Objetivo | Movimientos | Dificultad |
| --- | --- | --- | --- |
| 1 | Lograr 700 puntos | 22 | Base |
| 2 | Eliminar 18 gemas Zafiro | 24 | Media |
| 3 | Romper 8 obstaculos | 28 | Alta |

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
`-- .github/workflows/ci.yml
```

## DevOps

El repositorio incluye un pipeline de GitHub Actions que ejecuta `npm run build` y `npm test` en cada push o pull request.

## Persistencia

El progreso se guarda en `localStorage` bajo la clave `gemquest-progress-v1`. Se almacena el ultimo nivel desbloqueado, los records por nivel y la preferencia de sonido.
