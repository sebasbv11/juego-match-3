# Operación DevOps de GemQuest

## Objetivo

Esta guía describe el flujo de integración, despliegue, monitoreo, backup, rollback y respuesta a incidentes del MVP.

## Entornos

| Entorno | Finalidad | Ejecución |
| --- | --- | --- |
| Local | Desarrollo y pruebas manuales | `npm start` |
| CI | Build, pruebas y cobertura | GitHub Actions |
| Staging/demo | Validación pública del entregable | Render |

El servicio de Render funciona como staging académico y demostración pública. El proyecto no mantiene un entorno productivo separado.

## Flujo CI/CD

1. El desarrollador crea una rama desde `master`.
2. GitHub Actions ejecuta `npm ci --ignore-scripts`, `npm run build` y `npm run test:coverage`.
3. El pull request se integra cuando las verificaciones son aprobadas.
4. Render detecta el nuevo commit de `master`.
5. Render construye la imagen usando `Dockerfile`.
6. El servicio inicia con `node scripts/server.mjs` y el puerto asignado por `PORT`.
7. El equipo verifica inicio, autenticación, niveles y ranking.

## Monitoreo

Render proporciona:

- Estado del despliegue.
- Logs de build.
- Logs de la aplicación.
- Consumo de CPU y memoria.
- Historial de despliegues.

Comprobaciones mínimas después de desplegar:

1. La URL responde mediante HTTPS.
2. La pantalla de autenticación carga.
3. Se puede iniciar una partida.
4. El ranking devuelve datos o un estado controlado.
5. Los logs no muestran excepciones repetidas.

Los logs de la aplicación no deben contener variables de entorno, tokens ni cuerpos con datos de usuario.

## Backup

### Código y configuración

- GitHub conserva el historial del código y permite recuperar cualquier commit.
- `package-lock.json` fija las dependencias.
- El esquema reproducible de Supabase está en `supabase/gemquest_daily_leaderboard.sql`.
- Las variables reales se conservan en Render y no en Git.

### Base de datos

El responsable de Supabase debe exportar `gemquest_daily_scores` antes de modificar el esquema y, como mínimo, una vez por semana durante el periodo de evaluación.

El respaldo puede realizarse desde Table Editor como CSV o con las herramientas de respaldo disponibles en el plan de Supabase. Debe almacenarse fuera del repositorio público.

Objetivos operativos del MVP:

- RPO: 24 horas.
- RTO: 30 minutos.

El progreso personal guardado en `localStorage` no tiene respaldo central. Esta limitación es aceptada para el MVP y debe comunicarse al jugador.

## Rollback

### Aplicación

1. Abrir el servicio GemQuest en Render.
2. Entrar al historial de eventos o despliegues.
3. Seleccionar el último despliegue estable.
4. Ejecutar la opción de rollback o volver a desplegar ese commit.
5. Verificar la URL, autenticación, una partida y el ranking.

También se puede crear un `git revert` del commit defectuoso y subirlo a `master`, conservando la trazabilidad.

### Base de datos

1. Detener temporalmente cambios en el ranking.
2. Restaurar el CSV o backup validado.
3. Volver a ejecutar el esquema SQL si faltan tabla, índice, políticas o función.
4. Consultar el Top 10 de cada nivel.
5. Reanudar el servicio.

Una migración destructiva debe incluir previamente su sentencia de reversión y un respaldo.

## Respuesta a incidentes

1. Registrar fecha, síntoma, versión y entorno.
2. Revisar GitHub Actions, eventos de Render y logs.
3. Determinar si el fallo pertenece a aplicación, autenticación o base de datos.
4. Aplicar rollback si impide jugar o compromete datos.
5. Corregir en una rama, ejecutar las pruebas y abrir un pull request.
6. Documentar causa, solución y acción preventiva.

## Seguridad del despliegue

- Render termina TLS y publica la aplicación mediante HTTPS.
- Las variables se configuran en el panel de Render.
- Docker ejecuta Node.js como usuario `node`.
- `.env` y documentación interna no se copian a la imagen.
- La llave administrativa de Supabase no se utiliza.
- SonarCloud complementa la revisión de calidad y vulnerabilidades.
