# Seguridad de GemQuest

## Alcance

Este documento describe las medidas aplicadas al MVP y los riesgos que todavía deben considerarse antes de utilizarlo en un entorno con información sensible.

## Reporte de vulnerabilidades

Una vulnerabilidad no debe publicarse inicialmente como un issue. Debe comunicarse de forma privada a los responsables del repositorio mediante GitHub Security Advisories, incluyendo:

- Descripción y componente afectado.
- Pasos de reproducción.
- Impacto estimado.
- Propuesta de corrección, si existe.

## Gestión de secretos

- `.env` está excluido mediante `.gitignore`.
- `.env.example` contiene únicamente nombres y valores ficticios.
- Las variables reales se configuran en Render y en el entorno local.
- `SUPABASE_PUBLISHABLE_KEY` y `CLERK_PUBLISHABLE_KEY` son llaves públicas limitadas; no sustituyen una llave secreta.
- No se deben usar `service_role`, contraseñas de Postgres ni tokens privados en el navegador.
- La aplicación consume Supabase a través de `/api/leaderboard`, evitando publicar su configuración desde un archivo estático.

Si una llave secreta se expone, debe revocarse y reemplazarse. Eliminarla de un commit posterior no la retira del historial.

## Controles implementados

- HTTPS administrado por Render en el entorno desplegado.
- Row Level Security habilitado para la tabla de ranking.
- Escritura encapsulada en una función SQL con validaciones de nivel, longitud y valores numéricos.
- Cuerpo HTTP limitado a 64 KiB.
- Normalización de nombres, fechas, puntajes, estrellas y movimientos.
- Respuestas de configuración y API con `Cache-Control: no-store`.
- Supabase no permite escritura directa sobre la tabla para roles públicos.
- GitHub Actions y SonarCloud revisan build, pruebas, cobertura y calidad.
- Docker ejecuta el proceso con un usuario sin privilegios.
- El override `jayson -> uuid` reemplaza una versión transitiva vulnerable conservando la API `v4()` utilizada por la dependencia.

## Riesgos residuales

El ranking del MVP acepta la identidad enviada por el cliente. Antes de manejar premios reales o información sensible se debe:

- Verificar el token de Clerk en el servidor.
- Asociar `player_id` con la identidad verificada.
- Incorporar limitación de solicitudes.
- Registrar intentos anómalos.
- Restringir CORS si la API se separa del mismo origen.

## Dependencias

Las dependencias deben instalarse desde `package-lock.json` mediante `npm ci`. Antes de una entrega se recomienda ejecutar:

```bash
npm audit
npm run build
npm run test:coverage
```

Las actualizaciones de dependencias deben revisarse y probarse antes de integrarse en `master`.
