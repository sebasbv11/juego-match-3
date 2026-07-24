# ADR-004: CI con GitHub Actions y CD en Render usando Docker

- Estado: Aceptada
- Fecha: 2026-07-14

## Contexto

La entrega requiere build y pruebas automatizadas, un entorno accesible y una forma reproducible de ejecutar la aplicación.

## Decisión

- Ejecutar integración continua en GitHub Actions con Node.js 24.
- Instalar dependencias mediante `npm ci`.
- Validar build y pruebas con cobertura mínima de 60 %.
- Empaquetar la aplicación con Docker.
- Conectar Render con la rama `master`.
- Usar el servicio público de Render como entorno académico de staging y demostración.

## Consecuencias

- Cada pull request recibe verificación automática.
- Cada integración en `master` inicia un despliegue.
- La imagen local y la desplegada comparten el mismo Dockerfile.
- El plan gratuito de Render puede suspender el servicio por inactividad y aumentar el tiempo de la primera respuesta.
- El rollback se realiza desde el historial de Render o mediante `git revert`.
