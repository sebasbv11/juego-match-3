# GemQuest

GemQuest es un juego web tipo Match-3 en evolucion hacia una version de produccion para el Grupo B. El producto incluye tablero valido, intercambio de gemas adyacentes, deteccion de combinaciones, gravedad, recarga, puntuacion, movimientos limitados, niveles, autenticacion con Clerk, progreso por usuario, assets visuales personalizados y pantallas de resultado.

## Funcionalidades principales

- HU-01 a HU-06: tablero jugable, combinaciones, eliminacion, gravedad y nuevas fichas.
- HU-07 a HU-09: puntuacion, movimientos limitados y objetivos por nivel.
- HU-10 a HU-14: inicio, seleccion de nivel, victoria, derrota y persistencia de progreso por cuenta.
- HU-15: mejor puntuacion por nivel guardada por usuario autenticado y ranking diario online por nivel con Supabase.
- HU-16/HU-17: fichas con siluetas distintas, animacion al eliminar combinaciones y sonido basico generado en el navegador.
- Interaccion por clic o arrastre: el jugador puede seleccionar gemas con clic o arrastrar una gema hacia una celda adyacente.
- Set visual personalizado de gemas en `assets/gems/`, con imagenes PNG uniformes para los seis tipos de ficha.
- Overlay de victoria animado al completar un nivel, con resumen de puntuacion, record, botones de avance y efecto de confetti.
- Regla actual: cada intercambio adyacente consume 1 movimiento, aunque no forme combinacion.

## Experiencia visual

- Las gemas se renderizan con assets PNG transparentes para mantener un estilo uniforme en el tablero.
- Al arrastrar una gema, la ficha seleccionada aumenta ligeramente de escala, sigue el movimiento del jugador y empuja visualmente a la gema vecina.
- Los movimientos invalidos tienen retroceso visual; las combinaciones validas usan explosion, desaparicion y caida con rebote suave.
- El mapa de niveles usa una composicion vertical 9:16 con camino pirata, nodos interactivos, cofre central, nubes animadas y decoracion tropical.
- El cofre del mapa permanece cerrado y bloqueado mientras falte completar algun nivel. Al completar los 3 niveles, se abre con estrellas animadas y muestra una recompensa de monedas, gemas y estrellas.
- Al completar un nivel aparece una interfaz modal de victoria sobre el tablero, con fondo atenuado, animacion de entrada y confetti.
- Al perder, se mantiene una tarjeta de resultado integrada en el panel lateral para permitir reintentar rapidamente.
- La ventana de ranking diario permite consultar el Top 10 por nivel y se reinicia cada dia filtrando las puntuaciones por fecha.

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
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
HOST=0.0.0.0
PORT=4173
```

El servidor solo expone esta llave publica al navegador desde `/clerk-config.json`; no uses `CLERK_SECRET_KEY` en codigo cliente. Cada cuenta guarda su progreso en una clave propia de `localStorage` basada en el ID de usuario de Clerk.

## Ranking diario con Supabase

GemQuest usa Supabase para guardar el ranking diario por nivel. La app envia el puntaje cuando el jugador gana un nivel y consulta el Top 10 del dia desde la ventana **Ranking**.

1. Crea un proyecto en Supabase.
2. Abre el SQL Editor y ejecuta `supabase/gemquest_daily_leaderboard.sql`.
3. Copia `SUPABASE_URL` y la llave publica/anon del proyecto en `.env`.
4. Reinicia `npm start`.

El reinicio diario se modela con la columna `score_date`: la interfaz solo consulta las filas del dia actual en America/Guayaquil, por lo que cada dia inicia con ranking vacio sin necesitar borrar historico.

## Pruebas

Ejecutar todas las pruebas automatizadas:

```bash
npm test
```

Este comando usa el runner nativo de Node.js (`node --test`) y valida la logica del tablero, puntuacion, progreso, ranking diario, renderizado de vistas y estados principales.

## Validacion de build

Validar que los archivos estaticos, modulos y assets principales existan:

```bash
npm run build
```

## CI/CD

El proyecto cuenta con un pipeline de integracion continua en GitHub Actions.

Archivo del pipeline:

```text
.github/workflows/ci.yml
```

El pipeline se ejecuta automaticamente en cada `push` o `pull_request` y realiza:

```text
Checkout del codigo
Setup Node.js 24
npm install
npm run build
npm test
```

La parte de despliegue continuo se realiza con Render conectado al repositorio de GitHub. Cuando se sube un commit a `master`, Render construye la imagen Docker y publica la nueva version.

URL de produccion:

```text
https://gamequest-yust.onrender.com
```

## Estructura

```text
.
|-- index.html
|-- assets/
|   |-- fence_sprite.png
|   `-- gems/
|       |-- amber.png
|       |-- black.png
|       |-- blue.png
|       |-- green.png
|       |-- red.png
|       `-- violet.png
|-- src/
|   |-- app.js
|   |-- auth.js
|   |-- gameLogic.js
|   |-- storage.js
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

El repositorio incluye GitHub Actions para CI, Render para CD y Docker para ejecutar la aplicacion en un entorno reproducible.

Tambien incluye `.dockerignore` para excluir del contexto Docker archivos que no son necesarios en la imagen, como documentacion, pruebas, configuracion local, variables de entorno y assets fuente no usados por la app final.

### Ejecucion con Docker

```bash
docker build -t gemquest .
docker run --rm -p 4173:4173 --env-file .env gemquest
```

Abrir `http://127.0.0.1:4173`.

## Persistencia

El progreso se guarda en `localStorage` bajo la clave `gemquest-progress-v1:<clerk-user-id>`. Se almacena el ultimo nivel desbloqueado, los records por nivel y la preferencia de sonido para cada cuenta.

El ranking diario se guarda en Supabase dentro de `gemquest_daily_scores`, separado por `score_date`, `level_id` y `player_id`.
