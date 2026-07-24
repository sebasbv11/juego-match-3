# ADR-001: Arquitectura modular por capas

- Estado: Aceptada
- Fecha: 2026-07-08

## Contexto

GemQuest necesita separar reglas Match-3, estado, presentación, persistencia y servicios externos. La lógica debe poder probarse sin navegador y los cambios visuales no deben modificar las reglas del tablero.

## Decisión

Usar módulos ES con una arquitectura modular por capas y una variación de MVC orientada al frontend:

- `board.js`, `gameFunctions.js` y `gameState.js`: dominio y reglas.
- `views.js` y `styles.css`: presentación.
- `app.js`: coordinación y eventos.
- `storage.js`, `leaderboard.js`, `audio.js` y `mastery.js`: servicios.
- `gameLogic.js`: fachada estable para pruebas y consumidores.

No se utiliza Saga porque el sistema no coordina una transacción distribuida con acciones compensatorias.

## Consecuencias

- Las reglas pueden ejecutarse con Node.js.
- Las vistas pueden cambiar sin reescribir el dominio.
- Los módulos tienen responsabilidades identificables.
- `app.js` conserva coordinación imperativa y debe evitar acumular reglas de negocio.
