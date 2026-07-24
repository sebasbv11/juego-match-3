# ADR-003: Ranking diario en Supabase mediante API Node.js

- Estado: Aceptada
- Fecha: 2026-07-12

## Contexto

GemQuest necesita un Top 10 por nivel que empiece vacío cada día, conserve históricos y evite exponer configuración innecesaria de Supabase en archivos estáticos.

## Decisión

Guardar los resultados en Postgres administrado por Supabase:

- La tabla usa `score_date`, `level_id` y `player_id`.
- El día se calcula con la zona `America/Guayaquil`.
- Una función SQL conserva el mejor resultado diario del jugador.
- Row Level Security permite lectura pública controlada.
- El navegador consume `/api/leaderboard`.
- El servidor Node.js valida datos y llama a la API REST/RPC de Supabase.

El reinicio diario se implementa mediante filtrado por fecha, sin borrar el histórico.

## Consecuencias

- El ranking es compartido entre dispositivos.
- No se necesita una tarea destructiva diaria.
- La configuración de Supabase permanece en el servidor.
- El MVP todavía debe verificar el token de Clerk en el servidor antes de utilizar el ranking para premios o información sensible.
