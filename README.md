# GemQuest

GemQuest es un juego web tipo Match-3 en evolución hacia una versión de producción para el Grupo B. El producto incluye tablero válido, intercambio de gemas adyacentes, detección de combinaciones, gravedad, recarga, puntuación, movimientos limitados, niveles, autenticación con Clerk, progreso por usuario, assets visuales personalizados y pantallas de resultado.

## Experiencia visual

- Las gemas se renderizan con assets PNG transparentes para mantener un estilo uniforme en el tablero.
- Al arrastrar una gema, la ficha seleccionada aumenta ligeramente de escala, sigue el movimiento del jugador y empuja visualmente a la gema vecina.
- Los movimientos inválidos tienen retroceso visual; las combinaciones válidas usan explosión, desaparición y caída con rebote suave.
- El mapa de niveles usa una composición vertical 9:16 con camino pirata, nodos interactivos, cofre central, nubes animadas y decoración tropical.
- El cofre del mapa permanece cerrado y bloqueado mientras falte completar algún nivel. Al completar los 3 niveles, se abre con estrellas animadas y muestra una recompensa de monedas, gemas y estrellas.
- Al completar un nivel aparece una interfaz modal de victoria sobre el tablero, con fondo atenuado, animación de entrada y confetti.
- Al perder, se mantiene una tarjeta de resultado integrada en el panel lateral para permitir reintentar rápidamente.
- La ventana de ranking diario permite consultar el Top 10 por nivel y se reinicia cada día filtrando las puntuaciones por fecha.

## Niveles

| Nivel | Objetivo | Movimientos | Dificultad |
| --- | --- | --- | --- |
| 1 | Lograr 780 puntos | 18 | Base |
| 2 | Eliminar 20 gemas Zafiro | 20 | Media |
| 3 | Romper 8 obstáculos | 24 | Alta |

## Requisitos

Antes de instalar el proyecto se necesita:

- Git.
- Node.js 24 o superior.
- npm, incluido con Node.js.
- Una aplicación de Clerk para la autenticación.
- Un proyecto de Supabase para habilitar el ranking diario.

Docker es opcional y solo se requiere para ejecutar la versión contenedorizada.

## Instalación

1. Clonar el repositorio y entrar en la carpeta del proyecto:

```bash
git clone https://github.com/sebasbv11/juego-match-3.git
cd juego-match-3
```

2. Instalar las dependencias:

```bash
npm ci --ignore-scripts
```

3. Crear el archivo local de variables de entorno a partir del ejemplo:

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

4. Completar `.env` con las llaves públicas de Clerk y Supabase. No se deben agregar llaves secretas ni subir este archivo al repositorio.

## Ejecución

Iniciar el servidor local:

```bash
npm start
```

Abrir `http://127.0.0.1:4173` en el navegador. Si el puerto `4173` está ocupado, el servidor selecciona el siguiente puerto disponible y muestra la dirección correcta en la terminal.

La versión desplegada está disponible en:

```text
https://gamequest-yust.onrender.com
```

## Uso

1. Registrarse o iniciar sesión mediante Clerk.
2. Presionar **Jugar** o entrar en **Niveles** desde la pantalla de inicio.
3. Seleccionar uno de los niveles desbloqueados.
4. Intercambiar dos gemas adyacentes mediante clic o arrastre para formar combinaciones de tres o más fichas iguales.
5. Cumplir el objetivo antes de agotar los movimientos. Cada intercambio consume un movimiento, aunque no produzca una combinación.
6. Consultar la puntuación, los movimientos restantes y el avance del objetivo durante la partida.
7. Al ganar, avanzar al siguiente nivel o volver al mapa. Al perder, usar la opción de reintento.
8. Abrir **Top** para consultar el ranking diario de los diez mejores puntajes de cada nivel.

El progreso, los niveles desbloqueados, los récords y la preferencia de sonido se conservan por cuenta en el navegador. El ranking requiere que Supabase esté configurado y disponible.

## Autenticación con Clerk

Clerk es obligatorio para ejecutar GemQuest como producto final. Sin `CLERK_PUBLISHABLE_KEY`, la app muestra una pantalla de configuración y no permite jugar.

1. Crea una aplicación en `https://dashboard.clerk.com`.
2. Copia la publishable key del proyecto.
3. Configura los dominios permitidos y URLs de redirección en Clerk para tu entorno local y producción.
4. Crea `.env` a partir de `.env.example`:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
HOST=0.0.0.0
PORT=4173
```

## Ranking diario con Supabase

GemQuest usa Supabase para guardar el ranking diario por nivel. La app envía el puntaje cuando el jugador gana un nivel y consulta el Top 10 del día desde la ventana **Ranking**.

1. Crea un proyecto en Supabase.
2. Abre el SQL Editor y ejecuta `supabase/gemquest_daily_leaderboard.sql`.
3. Copia `SUPABASE_URL` y la llave pública/anon del proyecto en `.env`.
4. Reinicia `npm start`.

El reinicio diario se modela con la columna `score_date`: la interfaz solo consulta las filas del día actual en América/Guayaquil, por lo que cada día inicia con ranking vacío sin necesitar borrar histórico.

## Pruebas

Ejecutar todas las pruebas automatizadas:

```bash
npm test
```

Este comando usa el runner nativo de Node.js (`node --test`) y valida la lógica del tablero, puntuación, progreso, ranking diario, renderizado de vistas y estados principales.

Ejecutar las pruebas con reporte de cobertura y un umbral mínimo de 60 % en líneas:

```bash
npm run test:coverage
```

## Validación de build

Validar que los archivos estáticos, módulos y assets principales existan:

```bash
npm run build
```

## CI/CD

El proyecto cuenta con un pipeline de integración continua en GitHub Actions.

Archivo del pipeline:

```text
.github/workflows/ci.yml
```

El pipeline se ejecuta automáticamente en cada `push` o `pull_request` y realiza:

```text
Checkout del código
Setup Node.js 24
npm ci --ignore-scripts
npm run build
npm run test:coverage
```

La parte de despliegue continuo se realiza con Render conectado al repositorio de GitHub. Cuando se integra un commit en `master`, Render construye la imagen Docker y publica la nueva versión. Para este proyecto académico, el servicio público de Render funciona como entorno de staging y demostración.

URL de producción:

```text
https://gamequest-yust.onrender.com
```

## Calidad y seguridad

El pipeline aplica un umbral mínimo de 60 % de cobertura de líneas y ejecuta `npm audit` para detener vulnerabilidades de severidad alta o crítica. El análisis estático complementario se consulta en:

```text
https://sonarcloud.io/summary/new_code?id=sebasbv11_juego-match-3&branch=master
```

Las prácticas de gestión de secretos, HTTPS, RLS y riesgos residuales están documentadas en [`SECURITY.md`](SECURITY.md).

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

El repositorio incluye GitHub Actions para CI, Render para CD y Docker para ejecutar la aplicación en un entorno reproducible.

También incluye `.dockerignore` para excluir del contexto Docker archivos que no son necesarios en la imagen, como documentación, pruebas, configuración local, variables de entorno y assets fuente no usados por la app final.

### Ejecución con Docker

```bash
docker build -t gemquest .
docker run --rm -p 4173:4173 --env-file .env gemquest
```

Abrir `http://127.0.0.1:4173`.

### Estrategia de ramas

El equipo aplica GitHub Flow:

1. Crear una rama corta desde `master`, por ejemplo `feature/ranking-diario`.
2. Implementar y verificar los cambios localmente.
3. Subir la rama y abrir un pull request.
4. Esperar que GitHub Actions apruebe build, pruebas y cobertura.
5. Integrar en `master`; Render inicia el despliegue automático.

Las reglas completas se encuentran en [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Operación y recuperación

La guía de monitoreo, backup, rollback e incidentes se encuentra en [`docs/operacion-devops.md`](docs/operacion-devops.md).

## Documentación técnica

- API del ranking: [`docs/api/openapi.yaml`](docs/api/openapi.yaml).
- Guía de contribución: [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Política y prácticas de seguridad: [`SECURITY.md`](SECURITY.md).
- Decisiones arquitectónicas: [`docs/adr/README.md`](docs/adr/README.md).
- Documento vivo de modelado: [`docs/modelado.md`](docs/modelado.md).

## Persistencia

El progreso se guarda en `localStorage` bajo la clave `gemquest-progress-v1:<clerk-user-id>`. Se almacena el último nivel desbloqueado, los récords por nivel y la preferencia de sonido para cada cuenta.

El ranking diario se guarda en Supabase dentro de `gemquest_daily_scores`, separado por `score_date`, `level_id` y `player_id`.
